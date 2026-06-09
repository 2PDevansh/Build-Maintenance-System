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


def ensure_csv_file():
    CSV_FILE.parent.mkdir(parents=True, exist_ok=True)
    if not CSV_FILE.exists():
        with CSV_FILE.open("w", newline="") as file:
            writer = csv.writer(file)
            writer.writerow(CSV_COLUMNS)


def read_requests_df():
    ensure_csv_file()
    return pd.read_csv(CSV_FILE)


def write_requests_df(df):
    df.to_csv(CSV_FILE, index=False, columns=CSV_COLUMNS)


@app.get("/")
def home():
    return {"message": "Building Maintenance API Running"}


@app.get("/requests")
def get_requests():

    df = read_requests_df()

    return df.fillna("").to_dict(orient="records")


@app.post("/requests", status_code=201)
def create_request(request: MaintenanceRequest):
    df = read_requests_df()
    next_id = int(df["id"].max()) + 1 if not df.empty else 1

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


@app.patch("/requests/{request_id}/close")
def close_request(request_id: int):
    df = read_requests_df()

    if df.empty or request_id not in df["id"].astype(int).values:
        raise HTTPException(status_code=404, detail="Request not found")

    df.loc[df["id"].astype(int) == request_id, "status"] = "Closed"
    write_requests_df(df)

    return {"message": "Request closed", "id": request_id}


@app.delete("/requests/{request_id}")
def delete_request(request_id: int):
    df = read_requests_df()

    if df.empty or request_id not in df["id"].astype(int).values:
        raise HTTPException(status_code=404, detail="Request not found")

    df = df[df["id"].astype(int) != request_id]
    write_requests_df(df)

    return {"message": "Request deleted", "id": request_id}


@app.get("/analyze")
def analyze():

    if not CSV_FILE.exists():
        return {"error": "No data found"}

    df = read_requests_df()

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

    status_count = (
        df["status"]
        .value_counts()
        .to_dict()
    )

    return {
        "issue_count": issue_count,
        "priority_count": priority_count,
        "status_count": status_count
    }


@app.get("/hdfs/status")
def hdfs_status():
    storage_bytes = sum(file.stat().st_size for file in CSV_FILE.parent.glob("*.csv"))

    return {
        "live_nodes": 1,
        "storage_used_mb": round(storage_bytes / (1024 * 1024), 3),
        "status": "Connected"
    }
