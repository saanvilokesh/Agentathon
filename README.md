[README.md](https://github.com/user-attachments/files/34232181/README.md)
# Agentathon- Cognitive Fingerprint 🧠

**A local-first Chrome extension that helps LeetCode learners understand coding mistakes, compare corrections, track recurring error patterns, and visualize solutions.**

Cognitive Fingerprint connects a Chrome side panel to a local Python FastAPI service. The service uses Google's Gemini API for explanations and diagram generation and stores learning history in a local SQLite database.

> **Important:** This project is not fully offline: code and problem context sent for AI analysis are transmitted to the configured Gemini service. The database is local to the machine running the backend.

## Features

- **LeetCode sync:** Read supported problem context and editor code from LeetCode problem pages.
- **AI code analysis:** Request a diagnosis, explanation, and suggested correction from Gemini.
- **Side-by-side comparison:** Inspect original and suggested code with line-level highlighting.
- **Error history:** Review previously saved analyses.
- **Topic progress:** See attempts and AI-classified mistakes grouped by topic.
- **Solution visualizer:** Generate step-by-step diagrams for algorithms and data structures, with captions, pseudocode, and playback controls.
- **Cached visualizations:** Reuse saved diagrams from SQLite or regenerate them.
- **Offline visualization demo:** Browse included example diagrams without starting the backend or calling Gemini.

## Architecture

```text
LeetCode problem page
        |
        v
Chrome Extension (Manifest V3)
  - content.js: reads supported page/editor context
  - sidepanel.js: user interface and requests
  - solution_viz.js: SVG diagram renderer
        |
        | HTTP to localhost:8000
        v
FastAPI Backend (Python)
  - main.py: routes, database integration
  - analysis.py: Gemini-based analysis
  - visualizer.py: validates/limits diagram specs
        |                      |
        v                      v
SQLite database           Gemini API
(local history/cache)     (external AI service)
```

## Requirements

- Windows with PowerShell (instructions below; other systems may work with equivalent commands)
- Python 3.12 recommended
- Google Chrome with extension developer mode available
- Internet access for Gemini AI requests
- A valid Gemini API key from [Google AI Studio](https://aistudio.google.com/apikey)

## Project structure

```text
cognitive_upgrade/
├── README.md
├── cognitive-debugger-backend/
│   ├── main.py
│   ├── analysis.py
│   ├── visualizer.py
│   ├── requirements.txt
│   ├── .env.example
│   └── tests/
│       ├── test_analysis.py
│       ├── test_database.py
│       └── test_visualizer.py
├── Extension/
│   ├── manifest.json
│   ├── background.js
│   ├── content.js
│   ├── sidepanel.html
│   ├── sidepanel.js
│   ├── compare.js
│   ├── solution_viz.js
│   ├── solution_viz.css
│   ├── visualizer.js
│   ├── viz_demo.html
│   ├── viz_demo.js
│   └── viz_samples.js
└── Extension_backup/    # Backup; do not load this as the active extension
```

## 1. Install and run the backend (Windows)

Extract the ZIP, open the `cognitive_upgrade` folder in VS Code, and open a PowerShell terminal.

```powershell
cd cognitive-debugger-backend
py -3.12 -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
Copy-Item .env.example .env
notepad .env
```

If `py -3.12` is unavailable, use a compatible installed Python version, for example `py -m venv .venv`.

Edit `.env`:

```dotenv
GEMINI_API_KEY=PASTE_YOUR_VALID_API_KEY_HERE
GEMINI_MODEL=gemini-3.6-flash
```

The model shown is the value supplied in this project's `.env.example`. **Verify that the model identifier is available to your Gemini account.** An invalid key and an unavailable model are different errors.

Save the file, then start the server:

```powershell
.\.venv\Scripts\python.exe -m uvicorn main:app --host 127.0.0.1 --port 8000
```

Leave this terminal running while using the extension.

Visit **http://127.0.0.1:8000/health**. A working response should include `"status": "up"`, `"llm_provider": "gemini"`, and `"database": "sqlite"`.

**A healthy backend does not prove that your Gemini API key works.** That is checked when you make an AI request.

## 2. Install the Chrome extension

1. Open `chrome://extensions` in Google Chrome.
2. Enable **Developer mode**.
3. Click **Load unpacked**.
4. Select the `cognitive_upgrade/Extension` folder containing `manifest.json`.
5. Open or refresh a problem at `https://leetcode.com/problems/...`.
6. Click the **Cognitive Fingerprint** extension icon to open its side panel.

The extension is configured to talk to `http://127.0.0.1:8000`. Keep the backend running on port **8000** unless you update the extension's configuration and permissions.

## 3. Use Cognitive Fingerprint

1. Open a LeetCode problem and write or paste code in the editor.
2. Click **Sync LeetCode** in the extension side panel.
3. Click **Analyze code** to request an AI diagnosis and suggested correction.
4. Inspect the original/corrected code comparison.
5. Review saved analyses and topic progress after successful analyses.
6. Click **Explain with diagrams** to request a visual walkthrough of the solution.
7. Use previous/next/play, the step slider, or arrow keys to navigate the visualization.

Generated diagrams are saved by problem in the local database. Use **Regenerate** when you want a new explanation or to reflect updated code context.

### Offline diagram demo

Open `Extension/viz_demo.html` in Chrome. The included sample walkthroughs work without the backend or Gemini API. This is a demo of the renderer, not an offline replacement for AI analysis.

## API endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/` | Basic service endpoint |
| GET | `/health` | Backend status and configuration summary |
| POST | `/runs` | Analyze code and save the result |
| GET | `/history` | List past analyses |
| GET | `/history/{run_id}` | Retrieve a saved analysis |
| GET | `/progress` | Summarize topic-wise progress |
| POST | `/visualize` | Generate or retrieve a visualization; supports refresh |
| GET | `/visualize/{slug}` | Retrieve a saved visualization by problem slug |

For interactive API documentation while the backend runs, visit **http://127.0.0.1:8000/docs**.

## Local database

The backend automatically creates:

```text
cognitive-debugger-backend/cognitive_fingerprint.db
```

It stores successful analysis records and cached visualization data. The history and progress views use these local records. This is a **single local backend database**, not a cloud account system or multi-user database.

**Reset:** Stop the backend, back up the file if needed, delete `cognitive_fingerprint.db`, then restart. This permanently removes locally stored history and visualizations if no backup exists.

## Run tests

From `cognitive-debugger-backend`:

```powershell
.\.venv\Scripts\python.exe -m pytest -q
```

The included test files cover analysis, database, and visualization behavior. Passing tests does not guarantee that an external Gemini request will succeed with your current credentials.

## Troubleshooting

### `400 INVALID_ARGUMENT` / `API_KEY_INVALID`

Google rejected the configured API key.

1. Create or select a valid key at [Google AI Studio](https://aistudio.google.com/apikey).
2. Open `cognitive-debugger-backend/.env` and update `GEMINI_API_KEY`.
3. Make sure there are no placeholder characters, extra spaces, or accidentally copied quotes.
4. Save the file and **restart Uvicorn** so it reloads the environment.
5. Retry **Analyze code**.

Never paste the key into a public issue, screenshot, README, or GitHub commit. If a key has been exposed, revoke or rotate it.

### Model not found / model unsupported

The configured `GEMINI_MODEL` may not exist or may not be available to your API account. Choose an actual supported model identifier from Google's current Gemini API documentation or AI Studio, update `.env`, and restart the backend. Do not assume a healthy `/health` response validates the model.

### `Connection refused` / failed to fetch

Check that Uvicorn is running on `127.0.0.1:8000`, and visit `/health`. If you use a different port, the extension's localhost endpoint and manifest permissions must match.

### `No module named uvicorn` or missing dependencies

Run the installation command with the **same virtual environment Python** used to start the backend:

```powershell
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
```

### `python.exe` not recognized

Ensure you are in `cognitive-debugger-backend` and have created `.venv` there. Running the command from the parent folder will not find `\.venv\Scripts\python.exe`.

### Extension does not sync code

Confirm you loaded the active `Extension` folder, opened a supported LeetCode problem page, refreshed the tab after installing the extension, and kept the backend running. Check Chrome's extension error panel for additional diagnostics.

### Visualization looks incorrect

The diagram is an AI-generated illustration, **not a verified execution trace**. Try **Regenerate** and compare the steps against the actual algorithm. Large data structures may be represented by smaller examples for readability.

## Security and privacy

- Store the Gemini API key **only in the backend `.env` file**, not in extension JavaScript.
- Do not commit `.env`, `.venv/`, or `*.db` files to source control.
- Use a `.gitignore` similar to:

```gitignore
.env
.venv/
__pycache__/
.pytest_cache/
*.pyc
*.db
```

- The database resides on the local backend machine, but Gemini analysis requires sending relevant data to Google's service.
- The default localhost backend is intended for **local development**, not direct public exposure. Authentication, per-user isolation, rate limits, and a production deployment architecture would be required for a public service.

## Current limitations

- AI diagnoses and suggested fixes can be wrong and are **not verified against LeetCode hidden tests**.
- The side-by-side diff is textual; it does not prove which line caused a bug.
- Progress labels are estimates derived from AI-classified attempts, not scientifically validated measures of skill.
- The visualizer illustrates a small example rather than executing arbitrary code step by step.
- This version has no built-in account system or multi-user isolation.
- The backend must be running locally for analysis and new AI-generated visualizations.
- Browser support is currently centered on the configured LeetCode URL patterns.

## Technology stack

| Layer | Technology |
|---|---|
| Browser integration | Chrome Extension Manifest V3 |
| Frontend | HTML, CSS, JavaScript, SVG |
| Backend | Python, FastAPI, Uvicorn |
| AI | Google Gemini via `google-genai` |
| Persistence | SQLite |
| Tests | pytest, httpx |

---

**Cognitive Fingerprint** is a learning assistant for understanding *why* a solution fails, not merely copying corrected code.
