import json
import os
import re
import sqlite3
from pathlib import Path
from datetime import datetime, timezone
from typing import Optional

from dotenv import load_dotenv
load_dotenv(Path(__file__).with_name(".env"), override=True)

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from analysis import analyze
import visualizer
import verifier

DB_PATH = Path(__file__).with_name("cognitive_fingerprint.db")

app = FastAPI(title="Cognitive Fingerprint API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://leetcode.com"],
    allow_origin_regex=r"chrome-extension://[a-z]{32}",
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"]
)

class RunPayload(BaseModel):
    code: str = Field(max_length=50000)
    language: str = "C++"
    verdict: str = "Unknown"
    title: str = ""
    slug: str = ""
    problem_statement: str = Field(default="", max_length=25000)

class VizPayload(BaseModel):
    title: str = Field(default="", max_length=300)
    slug: str = Field(default="", max_length=200)
    language: str = "Python3"
    problem_statement: str = Field(default="", max_length=25000)
    code: str = Field(default="", max_length=50000)
    refresh: bool = False

class VerifyPayload(BaseModel):
    code: str = Field(max_length=50000)
    language: str = "Python3"
    method: str = Field(min_length=1, max_length=100, pattern=r"^[A-Za-z_][A-Za-z0-9_]*$")
    args: list = Field(default_factory=list, max_length=20)
    expected: object = None

def connect_db():
    connection = sqlite3.connect(DB_PATH)
    connection.row_factory = sqlite3.Row
    return connection

def init_db():
    with connect_db() as db:
        db.execute("""
            CREATE TABLE IF NOT EXISTS analyses (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                created_at TEXT NOT NULL,
                title TEXT NOT NULL,
                slug TEXT NOT NULL,
                language TEXT NOT NULL,
                verdict TEXT NOT NULL,
                status TEXT NOT NULL,
                topic TEXT NOT NULL,
                error_category TEXT NOT NULL,
                error_line INTEGER NOT NULL,
                original_code TEXT NOT NULL,
                corrected_code TEXT NOT NULL,
                reason TEXT NOT NULL,
                explanation TEXT NOT NULL
            )
        """)
        db.execute("CREATE INDEX IF NOT EXISTS idx_analyses_topic ON analyses(topic)")
        db.execute("CREATE INDEX IF NOT EXISTS idx_analyses_created ON analyses(created_at)")
        db.execute("""
            CREATE TABLE IF NOT EXISTS visualizations (
                slug TEXT PRIMARY KEY,
                title TEXT NOT NULL,
                created_at TEXT NOT NULL,
                model TEXT NOT NULL,
                spec_json TEXT NOT NULL
            )
        """)

@app.on_event("startup")
def startup():
    init_db()

def store_analysis(payload, result):
    created = datetime.now(timezone.utc).isoformat()
    with connect_db() as db:
        cursor = db.execute("""
            INSERT INTO analyses
            (created_at,title,slug,language,verdict,status,topic,error_category,
             error_line,original_code,corrected_code,reason,explanation)
            VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)
        """, (
            created, payload.title or payload.slug or "Untitled",
            payload.slug, payload.language, payload.verdict,
            result.get("status", "uncertain"),
            result.get("topic") or payload.title or "Uncategorized",
            result.get("error_category", "unknown"),
            (result.get("error_location") or {}).get("line", 0),
            payload.code, result.get("mutated_snippet", ""),
            result.get("reason", ""), result.get("custom_explanation", "")
        ))
        return cursor.lastrowid, created

@app.get("/")
def health():
    return {
        "status": "up",
        "llm_provider": "gemini" if os.getenv("GEMINI_API_KEY") else "unconfigured",
        "model": os.getenv("GEMINI_MODEL", "gemini-3.8-flash"),
        "database": "sqlite",
        "database_path": str(DB_PATH)
    }

@app.get("/health")
def health_alias():
    return health()

@app.post("/runs")
def runs(payload: RunPayload):
    try:
        result = analyze(payload)
        run_id, created = store_analysis(payload, result)
        result["run_id"] = run_id
        result["created_at"] = created
        result["database_saved"] = True
        return result
    except ValueError as error:
        raise HTTPException(status_code=422, detail=str(error))
    except Exception as error:
        raise HTTPException(status_code=503, detail="Analysis unavailable: " + str(error)[:250])

@app.post("/verify")
def verify(payload: VerifyPayload):
    if payload.language not in ("Python", "Python3"):
        raise HTTPException(status_code=422, detail="Real test execution supports Python only.")
    has_expected = "expected" in payload.model_fields_set and payload.expected is not None
    try:
        return verifier.run_verification(
            payload.code, payload.method, payload.args, payload.expected, has_expected)
    except RuntimeError as error:
        raise HTTPException(status_code=503, detail=str(error))
    except Exception as error:
        raise HTTPException(status_code=500, detail="Verification failed: " + str(error)[:250])

@app.get("/history")
def history(limit: int = 50):
    limit = max(1, min(limit, 200))
    with connect_db() as db:
        rows = db.execute("""
            SELECT id,created_at,title,slug,language,verdict,status,topic,
                   error_category,error_line,reason
            FROM analyses ORDER BY id DESC LIMIT ?
        """, (limit,)).fetchall()
    return {"items": [dict(row) for row in rows]}

@app.get("/history/{run_id}")
def history_detail(run_id: int):
    with connect_db() as db:
        row = db.execute("SELECT * FROM analyses WHERE id=?", (run_id,)).fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="Analysis not found")
    return dict(row)

@app.get("/progress")
def progress():
    with connect_db() as db:
        rows = db.execute("""
            SELECT id,created_at,status,topic,error_category
            FROM analyses ORDER BY id ASC
        """).fetchall()

    grouped = {}
    for row in rows:
        topic = row["topic"] or "Uncategorized"
        grouped.setdefault(topic, []).append(dict(row))

    topics = []
    for topic, attempts in grouped.items():
        errors = [x for x in attempts if x["status"] == "bug_found"]
        midpoint = max(1, len(attempts) // 2)
        first = attempts[:midpoint]
        second = attempts[midpoint:]
        first_rate = sum(x["status"] == "bug_found" for x in first) / len(first) if first else 0
        second_rate = sum(x["status"] == "bug_found" for x in second) / len(second) if second else 0
        reduction = round((first_rate - second_rate) * 100, 1) if second else None
        topics.append({
            "topic": topic,
            "attempts": len(attempts),
            "topics_solved": sum(x["status"] == "correct" for x in attempts),
            "errors": len(errors),
            "repeat_error_categories": sorted({
                category for category in {x["error_category"] for x in errors}
                if sum(x["error_category"] == category for x in errors) > 1
            }),
            "error_rate_reduction_percent": reduction,
            "progress_tag": (
                "Improving" if reduction is not None and reduction > 0
                else "Needs practice" if len(errors) > 0
                else "On track"
            )
        })

    total = len(rows)
    error_count = sum(x["status"] == "bug_found" for x in rows)
    return {
        "total_analyses": total,
        "topics_tracked": len(topics),
        "topics_with_correct_solution": sum(x["topics_solved"] > 0 for x in topics),
        "total_bugged_attempts": error_count,
        "topics": sorted(topics, key=lambda x: (-x["attempts"], x["topic"]))
    }


# ---------------------------------------------------------------------------
# Solution visualizer: diagram scripts for any problem, cached per problem
# ---------------------------------------------------------------------------

def viz_key(payload):
    raw = payload.slug or payload.title
    return re.sub(r"[^a-z0-9]+", "-", raw.lower()).strip("-")[:120]

def load_cached_viz(key):
    with connect_db() as db:
        row = db.execute(
            "SELECT slug,title,created_at,model,spec_json FROM visualizations WHERE slug=?", (key,)
        ).fetchone()
    if not row:
        return None
    return {
        "slug": row["slug"],
        "title": row["title"],
        "created_at": row["created_at"],
        "model": row["model"],
        "spec": json.loads(row["spec_json"]),
        "cached": True,
    }

def save_viz(key, title, spec):
    created = datetime.now(timezone.utc).isoformat()
    model = os.getenv("GEMINI_MODEL", "gemini-3.8-flash")
    with connect_db() as db:
        db.execute(
            "INSERT OR REPLACE INTO visualizations (slug,title,created_at,model,spec_json) VALUES (?,?,?,?,?)",
            (key, title, created, model, json.dumps(spec)),
        )
    return created, model

@app.post("/visualize")
def visualize(payload: VizPayload):
    key = viz_key(payload)
    if not key:
        raise HTTPException(status_code=422, detail="Problem title or slug required")
    if not payload.refresh:
        cached = load_cached_viz(key)
        if cached:
            return cached
    if not (payload.problem_statement.strip() or payload.title.strip()):
        raise HTTPException(status_code=422, detail="Problem statement required")
    try:
        spec = visualizer.generate_spec(payload)
    except ValueError as error:
        raise HTTPException(status_code=422, detail=str(error))
    except Exception as error:
        raise HTTPException(status_code=503, detail="Diagram unavailable: " + str(error)[:250])
    title = payload.title or payload.slug
    created, model = save_viz(key, title, spec)
    return {"slug": key, "title": title, "created_at": created, "model": model, "spec": spec, "cached": False}

@app.get("/visualize/{slug}")
def visualize_cached(slug: str):
    cached = load_cached_viz(re.sub(r"[^a-z0-9]+", "-", slug.lower()).strip("-")[:120])
    # A miss is normal (the problem has not been visualized yet), so answer 200
    # rather than 404 to keep the extension's console free of error noise.
    return cached or {"cached": False, "spec": None}
