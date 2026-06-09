import csv
from datetime import date
from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import pandas as pd

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

CSV_FILE = Path("data/requests.csv")
CSV_COLUMNS = ["id", "issue_type", "description", "priority", "status", "date"]


class MaintenanceRequest(BaseModel):
    issue_type: str = Field(..., min_length=1)
    description: str = Field(..., min_length=1)
    priority: str = "Medium"
    status: str = "Open"


@app.get("/")
def home():
    return {"message": "Building Maintenance API Running"}


@app.get("/requests")
def get_requests():

    if not CSV_FILE.exists():
        return []

    df = pd.read_csv(CSV_FILE)

    return df.fillna("").to_dict(orient="records")


@app.post("/requests", status_code=201)
def create_request(request: MaintenanceRequest):
    CSV_FILE.parent.mkdir(parents=True, exist_ok=True)

    if CSV_FILE.exists():
        df = pd.read_csv(CSV_FILE)
        next_id = int(df["id"].max()) + 1 if not df.empty else 1
    else:
        next_id = 1
        with CSV_FILE.open("w", newline="") as file:
            writer = csv.writer(file)
            writer.writerow(CSV_COLUMNS)

    row = {
        "id": next_id,
        "issue_type": request.issue_type.strip().capitalize(),
        "description": request.description.strip(),
        "priority": request.priority.strip().capitalize(),
        "status": request.status.strip().title(),
        "date": date.today().isoformat()
    }

    if not row["issue_type"] or not row["description"]:
        raise HTTPException(status_code=400, detail="Issue type and description are required")

    with CSV_FILE.open("a", newline="") as file:
        writer = csv.DictWriter(file, fieldnames=CSV_COLUMNS)
        writer.writerow(row)

    return row


@app.get("/analyze")
def analyze():

    if not CSV_FILE.exists():
        return {"error": "No data found"}

    df = pd.read_csv(CSV_FILE)

    issue_count = (
        df["issue_type"]
        .value_counts()
        .to_dict()
    )

    priority_count = (
        df["priority"]
        .value_counts()
        .to_dict()
    )

    return {
        "issue_count": issue_count,
        "priority_count": priority_count
    }
