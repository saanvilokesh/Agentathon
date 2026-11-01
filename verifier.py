"""Sandboxed single-input test runner for Python submissions.

Host side : run_verification(...)  -> starts a child process (or a Docker container)
Child side: python verifier.py --child  (reads a JSON payload on stdin, runs the
            user's Solution.<method>(*args) under a line tracer, prints one
            result line on stdout)

Sandbox modes (env VERIFY_SANDBOX):
  auto   (default) use Docker if the `docker` CLI works, else a local subprocess
  docker require Docker (network disabled, memory/pids limited, read-only FS)
  local  isolated local Python subprocess with a timeout (and memory/CPU limits
         on Linux/macOS). NOT a security boundary: do not run code you don't trust.
"""
import json
import os
import shutil
import subprocess
import sys
import time
from pathlib import Path

MARK = "@@CF_RESULT@@"
MAX_STEPS = 300
TIMEOUT_SECONDS = float(os.getenv("VERIFY_TIMEOUT", "5"))
DOCKER_IMAGE = os.getenv("VERIFY_DOCKER_IMAGE", "python:3.12-slim")
MAX_OUTPUT_BYTES = 2_000_000


# --------------------------------------------------------------------- host
def _docker_available():
    if not shutil.which("docker"):
        return False
    try:
        return subprocess.run(["docker", "info"], capture_output=True, timeout=8).returncode == 0
    except Exception:
        return False


def _choose_mode():
    mode = os.getenv("VERIFY_SANDBOX", "auto").lower()
    if mode == "docker":
        if not _docker_available():
            raise RuntimeError("VERIFY_SANDBOX=docker but Docker is not running or not installed.")
        return "docker"
    if mode == "local":
        return "local"
    return "docker" if _docker_available() else "local"


def run_verification(code, method, args, expected=None, has_expected=False):
    payload = json.dumps({
        "code": code, "method": method, "args": args,
        "expected": expected, "has_expected": has_expected,
    })
    mode = _choose_mode()
    me = str(Path(__file__).resolve())
    if mode == "docker":
        cmd = ["docker", "run", "-i", "--rm", "--network", "none", "--memory", "256m",
               "--pids-limit", "64", "--cpus", "1", "--read-only", "--cap-drop", "ALL",
               "--security-opt", "no-new-privileges", "-v", f"{me}:/app/verifier.py:ro",
               DOCKER_IMAGE, "python", "-I", "/app/verifier.py", "--child"]
        timeout = TIMEOUT_SECONDS + 15  # container start-up / first image pull
    else:
        cmd = [sys.executable, "-I", me, "--child"]
        timeout = TIMEOUT_SECONDS + 2

    start = time.time()
    try:
        proc = subprocess.run(cmd, input=payload, capture_output=True, text=True,
                              timeout=timeout, cwd=None)
    except subprocess.TimeoutExpired:
        return {"verified": False, "sandbox": mode, "error": "Time limit exceeded (%gs)." % TIMEOUT_SECONDS,
                "steps": [], "runtime_ms": int((time.time() - start) * 1000)}
    out = proc.stdout[-MAX_OUTPUT_BYTES:]
    line = next((l for l in reversed(out.splitlines()) if l.startswith(MARK)), None)
    if line is None:
        msg = (proc.stderr or "Runner produced no result.").strip()[-800:]
        return {"verified": False, "sandbox": mode, "error": msg, "steps": [],
                "runtime_ms": int((time.time() - start) * 1000)}
    result = json.loads(line[len(MARK):])
    result["sandbox"] = mode
    result["runtime_ms"] = int((time.time() - start) * 1000)
    return result


# -------------------------------------------------------------------- child
def _limit_resources():
    try:
        import resource
        cpu = int(TIMEOUT_SECONDS) + 1
        resource.setrlimit(resource.RLIMIT_CPU, (cpu, cpu))
        mem = 512 * 1024 * 1024
        resource.setrlimit(resource.RLIMIT_AS, (mem, mem))
    except Exception:
        pass  # Windows: no `resource` module


def _norm(v):
    if isinstance(v, (list, tuple)):
        return [_norm(x) for x in v]
    if isinstance(v, dict):
        return {str(k): _norm(x) for k, x in v.items()}
    if isinstance(v, float) and v == int(v) and abs(v) < 1e15:
        return v  # keep floats; compare below with tolerance
    return v


def _equal(a, b):
    a, b = _norm(a), _norm(b)
    if isinstance(a, (int, float)) and isinstance(b, (int, float)) and not isinstance(a, bool) and not isinstance(b, bool):
        return abs(a - b) <= 1e-5 * max(1, abs(b))
    if isinstance(a, list) and isinstance(b, list):
        return len(a) == len(b) and all(_equal(x, y) for x, y in zip(a, b))
    if isinstance(a, dict) and isinstance(b, dict):
        return a.keys() == b.keys() and all(_equal(a[k], b[k]) for k in a)
    return a == b


def _short(v, n=80):
    try:
        s = repr(v)
    except Exception:
        s = "<unprintable>"
    return s if len(s) <= n else s[: n - 1] + "…"


def _child():
    import io
    import contextlib
    import traceback

    real_stdout = sys.stdout
    payload = json.loads(sys.stdin.read())
    _limit_resources()

    def emit(obj):
        real_stdout.write("\n" + MARK + json.dumps(obj, default=repr) + "\n")
        real_stdout.flush()

    ns = {"__name__": "__solution__"}
    prelude = (
        "import collections, heapq, bisect, math, itertools, functools, re, string, random\n"
        "from collections import *\nfrom heapq import *\nfrom bisect import *\n"
        "from itertools import *\nfrom functools import *\nfrom math import *\n"
        "from typing import *\n"
        "class ListNode:\n"
        "    def __init__(self, val=0, next=None):\n        self.val = val; self.next = next\n"
        "class TreeNode:\n"
        "    def __init__(self, val=0, left=None, right=None):\n"
        "        self.val = val; self.left = left; self.right = right\n"
    )
    exec(compile(prelude, "<prelude>", "exec"), ns)

    steps, state = [], {"truncated": False}
    buf = io.StringIO()

    def tracer(frame, event, arg):
        if frame.f_code.co_filename != "<solution>":
            return None

        def local(frame, event, arg):
            if event in ("line", "return", "exception"):
                if len(steps) >= MAX_STEPS:
                    state["truncated"] = True
                    return None
                vars_ = {}
                for k, v in list(frame.f_locals.items())[:20]:
                    if not k.startswith("__"):
                        vars_[k] = _short(v)
                step = {"step": len(steps) + 1, "line": frame.f_lineno,
                        "function": frame.f_code.co_name, "event": event, "locals": vars_}
                if event == "return":
                    step["returned"] = _short(arg)
                steps.append(step)
            return local
        return local(frame, event, arg)

    result = {"verified": False, "steps": [], "error": None}
    try:
        exec(compile(payload["code"], "<solution>", "exec"), ns)
        cls = ns.get("Solution")
        if cls is None:
            raise NameError("No `class Solution` found in your code.")
        method = getattr(cls(), payload["method"], None)
        if method is None:
            raise AttributeError("Solution has no method named %r." % payload["method"])
        with contextlib.redirect_stdout(buf):
            sys.settrace(tracer)
            try:
                value = method(*payload["args"])
            finally:
                sys.settrace(None)
        try:
            json.dumps(value)
            out = value
        except Exception:
            out = repr(value)
        result.update(verified=True, output=out, steps=steps, truncated=state["truncated"])
        if payload.get("has_expected"):
            result["expected"] = payload["expected"]
            result["matches_expected"] = _equal(out, payload["expected"])
        else:
            result["matches_expected"] = None
    except BaseException as e:
        sys.settrace(None)
        tb = traceback.extract_tb(e.__traceback__)
        mine = [f for f in tb if f.filename == "<solution>"]
        result["error"] = "%s: %s" % (type(e).__name__, e)
        if mine:
            result["error_line"] = mine[-1].lineno
        result["steps"] = steps
    result["stdout"] = buf.getvalue()[:4000]
    emit(result)


if __name__ == "__main__":
    if "--child" in sys.argv:
        _child()
