from pathlib import Path
import json
import sqlite3
from datetime import datetime, timezone

from fastapi import FastAPI
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

ROOT = Path(__file__).resolve().parent.parent
DATA_FILE = ROOT / "data" / "packages.json"
DB_FILE = ROOT / "data" / "leads.db"
FRONTEND = ROOT / "frontend"

app = FastAPI(title="AI Affiliate LeadBot", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

packages = json.loads(DATA_FILE.read_text(encoding="utf-8"))

def db():
    con = sqlite3.connect(DB_FILE)
    con.execute("""
        CREATE TABLE IF NOT EXISTS events (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            session_id TEXT,
            event TEXT NOT NULL,
            payload TEXT,
            created_at TEXT NOT NULL
        )
    """)
    con.commit()
    return con

class RecommendRequest(BaseModel):
    session_id: str
    goal: str
    skill: str
    level: str
    budget: int
    priority: str

class TrackRequest(BaseModel):
    session_id: str
    event: str
    payload: dict = {}

def recommend(goal: str, skill: str, level: str, budget: int, priority: str):
    g = (goal + " " + skill + " " + level + " " + priority).lower()

    # Budget is a constraint, not a guarantee. We choose the closest
    # package that contains relevant topics and does not exceed budget.
    scored = []
    for p in packages:
        score = 0
        for topic in p["topics"]:
            if topic in g:
                score += 3
        if p["price"] <= budget:
            score += 2
        else:
            score -= 2
        if level == "beginner" and "beginner" in p["topics"]:
            score += 2
        if level == "intermediate" and p["price"] >= 1149:
            score += 1
        scored.append((score, -p["price"], p))

    scored.sort(reverse=True, key=lambda x: (x[0], x[1]))
    best = scored[0][2]

    # If the selected package is outside budget, recommend the cheapest
    # package that still has a topic match; otherwise Starter.
    if best["price"] > budget:
        matched = [p for _, _, p in scored if any(t in g for t in p["topics"])]
        matched = sorted(matched, key=lambda p: p["price"])
        if matched:
            best = matched[0]
        else:
            best = packages[0]

    return best

@app.get("/")
def home():
    return FileResponse(FRONTEND / "index.html")

@app.get("/style.css")
def style():
    return FileResponse(FRONTEND / "style.css")

@app.get("/script.js")
def script():
    return FileResponse(FRONTEND / "script.js")

@app.get("/api/packages")
def get_packages():
    return packages

@app.post("/api/recommend")
def get_recommendation(req: RecommendRequest):
    result = recommend(
        req.goal, req.skill, req.level, req.budget, req.priority
    )
    con = db()
    con.execute(
        "INSERT INTO events(session_id,event,payload,created_at) VALUES (?,?,?,?)",
        (
            req.session_id,
            "recommendation",
            json.dumps({
                "goal": req.goal,
                "skill": req.skill,
                "level": req.level,
                "budget": req.budget,
                "priority": req.priority,
                "package": result["id"],
            }),
            datetime.now(timezone.utc).isoformat(),
        ),
    )
    con.commit()
    con.close()
    return {
        "package": result,
        "note": "This recommendation is based on the answers provided and is not a guarantee of income, employment, or results."
    }

@app.post("/api/track")
def track(req: TrackRequest):
    con = db()
    con.execute(
        "INSERT INTO events(session_id,event,payload,created_at) VALUES (?,?,?,?)",
        (
            req.session_id,
            req.event,
            json.dumps(req.payload),
            datetime.now(timezone.utc).isoformat(),
        ),
    )
    con.commit()
    con.close()
    return {"ok": True}

@app.get("/api/health")
def health():
    return {"status": "ok"}
