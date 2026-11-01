
"use strict";

const $ = id => document.getElementById(id);

const MONACO_LANG = {
  cpp: "C++",
  python: "Python3",
  java: "Java",
  javascript: "JavaScript",
  typescript: "TypeScript",
  c: "C",
  csharp: "C#",
  go: "Go",
  rust: "Rust"
};

const safe = value =>
  typeof value === "string"
    ? value
    : String(value ?? "");

const levelDescriptions = {
  beginner:
    "Beginner: simple explanations, one step at a time.",
  intermediate:
    "Intermediate: see the suggested fix and complexity.",
  advanced:
    "Advanced: see code metrics, evidence, and test details."
};

function message(text) {
  $("status").textContent = text;
}

function addText(parent, tag, value) {
  const element = document.createElement(tag);
  element.textContent = safe(value);
  parent.append(element);
  return element;
}

function learningLevel() {
  return $("learningLevel").value;
}

// -----------------------------------------
// LEARNING LEVELS
// -----------------------------------------

function updateLevel() {
  const level = learningLevel();

  $("levelHelp").textContent =
    levelDescriptions[level];

  $("metricsSection").hidden =
    level === "beginner";

  $("metricsSection").open =
    level === "advanced";

  $("testsSection").hidden =
    level === "beginner" ||
    $("testsSection").dataset.hasTests !== "yes";

  $("comparisonSection").hidden =
    level === "beginner" ||
    $("comparisonSection").dataset.hasFix !== "yes";

  $("verifySection").hidden =
    level === "beginner";

  const historySection = $("historySection");

  if (historySection) {
    historySection.hidden = level === "beginner";
  }

  chrome.storage.local.set({
    cfLearningLevel: level
  }).catch(console.error);
}

function updateVerifyLanguage() {
  const python = ["Python", "Python3"].includes(
    $("language").value
  );

  $("verifyBtn").disabled = !python;

  $("verifyLanguageHelp").textContent = python
    ? "Run one test safely in Docker. Enter a method name, inputs and expected output."
    : "Real test execution is currently available only for Python. Your code can still be reviewed by AI.";
}

// -----------------------------------------
// LEETCODE SYNCHRONIZATION
// -----------------------------------------

async function sync() {
  const [tab] = await chrome.tabs.query({
    active: true,
    currentWindow: true
  });

  if (
    !tab ||
    !/leetcode\.com\/problems\//.test(tab.url || "")
  ) {
    message("Open a LeetCode problem first.");
    return;
  }

  let problem;

  try {
    problem = await chrome.tabs.sendMessage(
      tab.id,
      { action: "getLeetCodeCode" }
    );
  } catch {
    message("Refresh LeetCode and retry.");
    return;
  }

  if (!problem || problem.error) {
    message(
      problem?.error || "Unable to read LeetCode."
    );
    return;
  }

  $("results").hidden = true;
  $("traceSection").hidden = true;

  $("title").value = problem.title || "";
  $("slug").value = problem.slug || "";
  $("statement").value = problem.statement || "";

  try {
    const response = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      world: "MAIN",
      func: () => {
        
        const models =
        window.monaco?.editor?.getModels?.() || [];

        const visibleEditors = [
        ...document.querySelectorAll(".monaco-editor")
        ].filter(element =>
        element.getClientRects().length > 0 &&
        element.getAttribute("aria-hidden") !== "true"
        );

        const model = models.find(m => {
        const uri = m.uri?.toString?.() || "";

        return (
            m.getValue().trim() &&
            (
            uri.includes("leetcode") ||
            uri.includes("inmemory")
            )
        );
        }) || (
        models.length === 1
            ? models[0]
            : null
        );

        if (!model) {
        return null;
        }


        if (!model) return null;

        return {
          code: model.getValue(),
          language: model.getLanguageId()
        };
      }
    });

    const editor = response[0]?.result;

    $("code").value =
      editor?.code || problem.domCode || "";

    const language =
      MONACO_LANG[editor?.language] ||
      problem.language ||
      "C++";

    if (
      [...$("language").options].some(
        option => option.value === language
      )
    ) {
      $("language").value = language;
    }
  } catch {
    $("code").value = problem.domCode || "";
  }

  $("source").textContent =
    "Synced current editor. Paste exact submitted code if different.";

  vizReset();
  loadSavedViz().catch(() => {});

  updateVerifyLanguage();
  message("Problem and code synced.");
}

// -----------------------------------------
// CODE METRICS
// -----------------------------------------

function metric(parent, label, value) {
  if (!Number.isFinite(value)) return;

  const element = document.createElement("div");
  element.className = "metric";

  const header = document.createElement("div");
  header.className = "metrichead";

  addText(header, "span", label);
  addText(header, "span", value + "/100");

  element.append(header);

  const bar = document.createElement("div");
  bar.className = "meter";

  const fill = document.createElement("div");

  fill.style.width =
    Math.max(0, Math.min(100, value)) + "%";

  bar.append(fill);
  element.append(bar);
  parent.append(element);
}

// -----------------------------------------
// DISPLAY AI ANALYSIS
// -----------------------------------------

function render(data) {
  $("results").hidden = false;

  const location = data.error_location || {};
  const assurance = data.assurance || {};
  const complexity = data.complexity || {};
  const metrics = data.metrics || {};

  const status =
    data.status === "analyzed"
      ? location.line
        ? "bug_found"
        : "correct"
      : data.status;

  const labels = {
    correct: "No issue detected by AI",
    bug_found: "Possible bug found",
    invalid_problem: "Problem and code do not match",
    uncertain: "More information needed"
  };

  // Diagnosis

  $("diagnosis").replaceChildren();

  const heading = addText(
    $("diagnosis"),
    "div",
    labels[status] || "Analysis result"
  );

  heading.className =
    "summary " +
    (status === "correct"
      ? "ok"
      : status === "invalid_problem"
        ? "warn"
        : "");

  if (data.reason) {
    addText(
      $("diagnosis"),
      "p",
      data.reason
    );
  }

  if (
    status === "bug_found" &&
    location.line
  ) {
    addText(
      $("diagnosis"),
      "b",
      "Check line " + location.line
    );

    if (location.snippet) {
      addText(
        $("diagnosis"),
        "pre",
        location.snippet
      );
    }

    if (location.explanation) {
      addText(
        $("diagnosis"),
        "p",
        location.explanation
      );
    }
  }

  if (data.custom_explanation) {
    addText(
      $("diagnosis"),
      "p",
      data.custom_explanation
    );
  }

  // AI assurance

  $("assurance").replaceChildren();

  addText(
    $("assurance"),
    "p",
    "AI assessment only · " +
      (assurance.verified_test_count || 0) +
      " tests executed · Correctness not verified"
  ).className = "muted small";

  // Cognitive metrics

  $("metrics").replaceChildren();

  addText(
    $("metrics"),
    "p",
    "These scores estimate code structure, not coding ability or correctness."
  ).className = "muted small";

  const groups = [
    ["Your code", metrics.user],
    ["Suggested code", metrics.correct]
  ];

  for (const [label, group] of groups) {
    if (!group) continue;

    if (
      label === "Suggested code" &&
      !data.mutated_snippet
    ) {
      continue;
    }

    addText($("metrics"), "h3", label);

    for (const [key, value] of Object.entries(group)) {
      metric(
        $("metrics"),
        key.replaceAll("_", " "),
        value
      );
    }
  }

  addText(
    $("metrics"),
    "p",
    "Estimated complexity: " +
      (complexity.user_time || "?") +
      " time, " +
      (complexity.user_space || "?") +
      " space."
  );

  if (complexity.basis) {
    addText(
      $("metrics"),
      "p",
      complexity.basis
    );
  }

  // Code comparison

  const hasFix =
    status === "bug_found" &&
    !!(data.mutated_snippet || "").trim();

  $("comparisonSection").dataset.hasFix =
    hasFix ? "yes" : "";

  $("comparisonSection").hidden = !hasFix;

  if (hasFix) {
    CFCompare.draw(
      $("origCode"),
      data.original_snippet,
      location.line,
      data.diff,
      "user"
    );

    CFCompare.draw(
      $("modCode"),
      data.mutated_snippet,
      0,
      data.diff,
      "correct"
    );
    CFCompare.explain($("diffDetails"), data.diff);
  }

  $("explanation").replaceChildren();

  // Suggested tests

  $("cases").replaceChildren();

  const cases = Array.isArray(data.test_cases)
    ? data.test_cases
    : [];

  $("testsSection").dataset.hasTests =
    cases.length ? "yes" : "";

  $("testsSection").hidden = !cases.length;

  cases.forEach(test => {
    const element = document.createElement("div");
    element.className = "case";

    addText(
      element,
      "b",
      test.name || "Test case"
    );

    addText(
      element,
      "div",
      "Input: " + safe(test.input)
    );

    addText(
      element,
      "div",
      "Expected (AI proposed): " +
        safe(test.expected)
    );

    addText(
      element,
      "span",
      "Not executed"
    ).className = "pill";

    $("cases").append(element);
  });

  // Verified execution trace

  const hasTrace =
    data.trace?.status === "verified" &&
    Array.isArray(data.trace.steps) &&
    data.trace.steps.length > 0;

  $("traceSection").hidden = !hasTrace;

  if (hasTrace) {
    CFVisualizer.load(data.trace);
  }

  // Practice recommendations

  $("practice").replaceChildren();

  const practice = Array.isArray(data.practice)
    ? data.practice
    : [];

  $("practiceSection").hidden = !practice.length;

  practice.slice(0, 3).forEach(problem => {
    const row = document.createElement("p");
    const link = document.createElement("a");

    link.textContent =
      problem.title || "Practice problem";

    if (
      problem.slug &&
      /^[a-z0-9-]+$/.test(problem.slug)
    ) {
      link.href =
        "https://leetcode.com/problems/" +
        problem.slug +
        "/";

      link.target = "_blank";
      link.rel = "noopener noreferrer";
    }

    row.append(link);

    addText(
      row,
      "span",
      " — " + safe(problem.reason)
    );

    $("practice").append(row);
  });

  updateLevel();
}

// -----------------------------------------
// ANALYZE CODE
// -----------------------------------------

async function analyze() {
  if (!$("code").value.trim()) {
    message("Paste or sync your code first.");
    return;
  }

  if (
    !$("statement").value.trim() ||
    !$("slug").value.trim()
  ) {
    message(
      "Problem details missing. Click Sync LeetCode first."
    );
    return;
  }

  const button = $("analyzeBtn");
  button.disabled = true;

  $("results").hidden = true;

  const controller = new AbortController();

  const timer = setTimeout(
    () => controller.abort(),
    80000
  );

  const started = Date.now();

  const ticker = setInterval(() => {
    message(
      "Analyzing… " +
      Math.floor((Date.now() - started) / 1000) +
      "s"
    );
  }, 1000);

  try {
    const payload = {
      code: $("code").value,
      language: $("language").value,
      verdict: $("verdict").value,
      title: $("title").value,
      slug: $("slug").value,
      problem_statement: $("statement").value
    };

    const backend =
      $("backend").value.replace(/\/$/, "");

    const response = await fetch(
      backend + "/runs",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload),
        signal: controller.signal
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        typeof data.detail === "string"
          ? data.detail
          : "HTTP " + response.status
      );
    }

    render(data);

    refreshDashboard().catch(console.error);

    message(
      "Analysis complete. AI suggestions are not execution-verified."
    );

  } catch (error) {
    message(
      error.name === "AbortError"
        ? "Request timed out. Check backend logs."
        : "Analysis failed: " + error.message
    );

  } finally {
    clearTimeout(timer);
    clearInterval(ticker);
    button.disabled = false;
  }
}

// -----------------------------------------
// LOCAL LEARNING HISTORY
// -----------------------------------------

async function showHistory() {
  const backend = $("backend").value.replace(/\/$/, "");
  const response = await fetch(backend + "/history?limit=30");
  if (!response.ok) throw new Error("Could not load database history");
  const data = await response.json();
  const entries = data.items || [];
  $("history").replaceChildren();

  if (!entries.length) {
    addText($("history"), "p", "No analyses saved yet. Analyse a solution to start your history.");
    return;
  }

  entries.forEach(entry => {
    const row = document.createElement("div");
    row.className = "topic-row";
    addText(row, "b", "#" + entry.id + " · " + entry.title);
    addText(row, "div", new Date(entry.created_at).toLocaleString() +
      " · " + entry.topic + " · " + entry.status +
      (entry.status === "bug_found" ? " · " + entry.error_category : ""));
    $("history").append(row);
  });
}

async function loadProgress() {
  const status = $("dashboardStatus");
  status.textContent = "Updating from SQLite database…";
  const backend = $("backend").value.replace(/\/$/, "");
  const response = await fetch(backend + "/progress");
  if (!response.ok) throw new Error("Could not load progress (HTTP " + response.status + ")");
  const data = await response.json();
  const topics = data.topics || [];
  const total = Number(data.total_analyses || 0);
  const solved = topics.reduce((sum, topic) => sum + Number(topic.topics_solved || 0), 0);
  const errors = Number(data.total_bugged_attempts || 0);
  const correctRate = total ? Math.round((solved / total) * 100) : 0;

  $("statAnalyses").textContent = total;
  $("statTopics").textContent = data.topics_tracked || 0;
  $("statSolved").textContent = solved;
  $("statErrors").textContent = errors;
  $("overallRate").textContent = correctRate + "%";
  $("overallFill").style.width = correctRate + "%";
  $("overallCaption").textContent = total
    ? "Based on AI classifications across " + total + " saved analyses. Not an execution-based pass rate."
    : "Run your first analysis to start tracking progress.";

  $("progressTopics").replaceChildren();
  if (!topics.length) {
    addText($("progressTopics"), "p",
      "No topics yet. Use Analyze code on a LeetCode problem and your topic cards will appear here.")
      .className = "muted small";
  } else {
    topics.forEach(topic => {
      const attempts = Number(topic.attempts || 0);
      const correct = Number(topic.topics_solved || 0);
      const errorCount = Number(topic.errors || 0);
      const rate = attempts ? Math.round(correct / attempts * 100) : 0;
      const row = document.createElement("div");
      row.className = "topic-card";

      const top = document.createElement("div");
      top.className = "topic-top";
      addText(top, "span", topic.topic).className = "topic-name";
      addText(top, "span", rate + "% AI-correct").className = "topic-rate";
      row.append(top);

      const track = document.createElement("div");
      track.className = "topic-track";
      const fill = document.createElement("div");
      fill.className = "topic-fill";
      fill.style.width = rate + "%";
      track.append(fill);
      row.append(track);

      addText(row, "div", attempts + " attempts · " + correct +
        " AI-correct · " + errorCount + " bugged").className = "topic-meta";

      const tag = document.createElement("span");
      tag.className = "topic-tag " +
        (topic.progress_tag === "Needs practice" ? "practice" :
          topic.progress_tag === "Improving" ? "improving" : "ontrack");
      tag.textContent = topic.progress_tag === "Needs practice"
        ? "↗ Practice needed"
        : topic.progress_tag === "Improving"
          ? "↑ Improving"
          : "✓ On track";
      row.append(tag);

      if (topic.error_rate_reduction_percent !== null &&
          topic.error_rate_reduction_percent !== undefined) {
        addText(row, "div",
          "Error-rate change: " +
          (topic.error_rate_reduction_percent > 0 ? "down " : "") +
          topic.error_rate_reduction_percent + "% (earlier vs later attempts)")
          .className = "topic-meta";
      }
      if (topic.repeat_error_categories?.length) {
        addText(row, "div", "Repeat these: " +
          topic.repeat_error_categories.join(", ")).className = "topic-meta";
      }
      $("progressTopics").append(row);
    });
  }
  status.textContent = "Synced just now · data read from cognitive_fingerprint.db";
}

async function refreshDashboard() {
  try {
    await Promise.all([loadProgress(), showHistory()]);
  } catch (error) {
    $("dashboardStatus").textContent =
      "Can't reach the database. Check that the backend is running at " +
      $("backend").value;
  }
}

// REAL PYTHON TEST EXECUTION
// -----------------------------------------

async function verifyCode() {
  const button = $("verifyBtn");
  button.disabled = true;

  $("verifyStatus").textContent =
    "Running isolated test…";

  $("verifyOutput").textContent = "";

  try {
    const args = JSON.parse(
      $("verifyArgs").value
    );

    const expected = JSON.parse(
      $("verifyExpected").value
    );

    if (!Array.isArray(args)) {
      throw new Error(
        "Arguments must be a JSON array."
      );
    }

    const backend =
      $("backend").value.replace(/\/$/, "");

    const response = await fetch(
      backend + "/verify",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          code: $("code").value,
          language: $("language").value,
          method: $("verifyMethod").value,
          args,
          expected
        })
      }
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        typeof result.detail === "string"
          ? result.detail
          : "Verification failed"
      );
    }

    $("verifyStatus").textContent =
      result.verified
        ? result.matches_expected
          ? "Test passed (one input only)"
          : "Test failed (output differs)"
        : "Execution failed";

    $("verifyOutput").textContent =
      JSON.stringify(result, null, 2)
        .slice(0, 18000);

    if (
      result.verified &&
      result.steps?.length
    ) {
      $("traceSection").hidden = false;

      CFVisualizer.load({
        status: "verified",
        steps: result.steps
      });
    }

  } catch (error) {
    $("verifyStatus").textContent =
      error.message;

  } finally {
    updateVerifyLanguage();
  }
}

// -----------------------------------------
// SOLUTION VISUALIZER
// -----------------------------------------

let vizRequest = 0;

function vizMessage(text) {
  $("vizStatus").textContent = text;
}

function vizReset() {
  vizRequest++;
  $("vizMount").replaceChildren();
  $("vizRegenBtn").hidden = true;
  vizMessage("");
}

function showViz(data) {
  CFSolutionViz.mount($("vizMount"), data.spec);
  $("vizRegenBtn").hidden = false;

  const when = data.created_at
    ? new Date(data.created_at).toLocaleString()
    : "";

  vizMessage(
    data.cached
      ? "Loaded the saved diagram" + (when ? " from " + when : "") + "."
      : "Diagram generated and saved."
  );
}

// Show a previously generated diagram for this problem without calling the AI.
async function loadSavedViz() {
  const slug = $("slug").value.trim();

  if (!slug) return;

  const backend = $("backend").value.replace(/\/$/, "");
  const response = await fetch(
    backend + "/visualize/" + encodeURIComponent(slug)
  );

  if (!response.ok) return;

  const data = await response.json();

  if (data.spec && $("slug").value.trim() === slug) {
    showViz(data);
  }
}

async function generateViz(refresh) {
  const slug = $("slug").value.trim();

  if (!slug && !$("title").value.trim()) {
    vizMessage("Click Sync LeetCode first.");
    return;
  }

  if (!$("statement").value.trim()) {
    vizMessage("Problem details missing. Click Sync LeetCode first.");
    return;
  }

  const request = ++vizRequest;
  const button = $("vizBtn");
  const regen = $("vizRegenBtn");

  button.disabled = true;
  regen.disabled = true;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 130000);
  const started = Date.now();

  const ticker = setInterval(() => {
    vizMessage(
      "Drawing the solution… " +
      Math.floor((Date.now() - started) / 1000) + "s"
    );
  }, 1000);

  vizMessage("Drawing the solution…");

  try {
    const backend = $("backend").value.replace(/\/$/, "");

    const response = await fetch(backend + "/visualize", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: $("title").value,
        slug,
        language: $("language").value,
        problem_statement: $("statement").value,
        code: $("code").value,
        refresh: !!refresh
      }),
      signal: controller.signal
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        typeof data.detail === "string"
          ? data.detail
          : "HTTP " + response.status
      );
    }

    // The learner may have opened another problem while this was running.
    if (request !== vizRequest || $("slug").value.trim() !== slug) return;

    showViz(data);

  } catch (error) {
    if (request !== vizRequest) return;

    vizMessage(
      error.name === "AbortError"
        ? "Timed out. Check the backend logs and try again."
        : "Could not draw the solution: " + error.message
    );

  } finally {
    clearTimeout(timer);
    clearInterval(ticker);
    button.disabled = false;
    regen.disabled = false;
  }
}

// -----------------------------------------
// EVENT LISTENERS
// -----------------------------------------

$("syncBtn").addEventListener(
  "click",
  sync
);

$("vizBtn").addEventListener(
  "click",
  () => generateViz(false)
);

$("vizRegenBtn").addEventListener(
  "click",
  () => generateViz(true)
);

$("refreshProgressBtn").addEventListener(
  "click",
  refreshDashboard
);

$("analyzeBtn").addEventListener(
  "click",
  analyze
);

$("learningLevel").addEventListener(
  "change",
  updateLevel
);

$("language").addEventListener(
  "change",
  updateVerifyLanguage
);

$("prevStep").addEventListener(
  "click",
  () => CFVisualizer.prev()
);

$("nextStep").addEventListener(
  "click",
  () => CFVisualizer.next()
);

$("verifyBtn").addEventListener(
  "click",
  verifyCode
);

$("backend").addEventListener(
  "change",
  () => {
    chrome.storage.local.set({
      backend: $("backend").value
    });
    refreshDashboard();
  }
);

// -----------------------------------------
// RESTORE SETTINGS
// -----------------------------------------

chrome.storage.local.get([
  "backend",
  "cfLearningLevel"
]).then(settings => {
  if (settings.backend) {
    $("backend").value = settings.backend;
  }

  if (
    ["beginner", "intermediate", "advanced"]
      .includes(settings.cfLearningLevel)
  ) {
    $("learningLevel").value =
      settings.cfLearningLevel;
  }

  updateLevel();
  refreshDashboard();
}).catch(console.error);

updateVerifyLanguage();
sync();
