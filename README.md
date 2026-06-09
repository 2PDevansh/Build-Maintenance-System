# 🏢 BuildPulse Analytics System (Hadoop + Spark + FastAPI + Docker)

## 🚀 Overview

A distributed Building Maintenance System that:

* Stores maintenance requests
* Uses **Hadoop HDFS** for storage
* Uses **Apache Spark** for analytics
* Provides APIs via **FastAPI**
* Runs fully containerized using **Docker**

# BuildPulse Analytics System

A building maintenance management app for tracking maintenance requests and reviewing simple request analytics.

## Features

- Add maintenance requests from the frontend or Python CLI
- View all requests from CSV storage
- Analyze issue type and priority counts
- Search and filter requests by issue and priority
- Close or delete requests from the dashboard
- View HDFS-style live node and storage status
- Recharts pie and bar charts for issue and priority analytics
- FastAPI backend with React frontend
- Docker-ready project structure

## 🧱 Tech Stack

* Python
* FastAPI
* Apache Spark (PySpark)
* Hadoop HDFS
* Docker & Docker Compose

---

## 📁 Project Structure

```
Build Maintenance System/
│
├── app.py
├── Dockerfile
├── docker-compose.yml
├── requirements.txt
│
├── api/
│   └── main.py
│
├── modules/
│   ├── __init__.py
│   ├── analytics.py
│   ├── add_request.py
│   └── view_requests.py
│
├── data/
│   └── requests.csv
```

---

## ⚙️ Setup Instructions

### 1️⃣ Clone Repository

```
git clone https://github.com/2PDevansh/Build-Maintenance-System.git
cd Build-Maintenance-System
```

---

### 2️⃣ Run with Docker

```
docker compose up --build
```

---

### 3️⃣ Verify Hadoop Cluster

Open:

```
http://localhost:9870
```

Ensure:

```
Live Nodes = 1
```

---

### 4️⃣ Upload Data to HDFS

```
docker cp data/requests.csv namenode:/tmp/requests.csv

docker exec -it namenode bash

hdfs dfs -mkdir -p /data
hdfs dfs -put /tmp/requests.csv /data/
hdfs dfs -ls /data
```

---

## 🌐 API Endpoints

### 🔹 Health Check

```
GET /
```

Response:

```
{
  "message": "Building Maintenance API Running 🚀"
}
```

---

### 🔹 Run Analytics

```
GET /analyze
```

Response:

```
{
  "status": "Analysis completed",
  "output": "Spark analysis logs..."
}
```

---

## 📊 Features

* Add maintenance requests (CLI)
* View requests (CLI)
* Store data in **HDFS**
* Perform analytics using **Spark**

  * Issue type distribution
  * Priority distribution
  * Status distribution
* Trigger analytics via API

---

## ⚠️ Important Design Note

Spark is executed as a **subprocess** instead of inside FastAPI.

Reason:

* Running PySpark inside web containers causes JVM instability
* Subprocess execution is more stable and production-aligned

---

## 🐳 Docker Services

* **namenode** → Hadoop NameNode (port 9870)
* **datanode** → Hadoop DataNode
* **maintenance_app** → FastAPI backend

---

## 🎯 Future Improvements

* Add POST API for request creation
* Build frontend dashboard (React)
* Integrate Kafka for real-time streaming
* Add authentication

## Tech Stack

| Technology | Purpose |
| --- | --- |
| Python | Backend and CLI logic |
| FastAPI | HTTP API |
| Pandas | API analytics |
| PySpark | CLI analytics |
| React + Vite | Frontend dashboard |
| Recharts | Dashboard charts |
| CSV | Lightweight storage |


## Run Backend


python -m uvicorn api.main:app --reload --host 127.0.0.1 --port 8000
```

API URL: `http://127.0.0.1:8000`

## Run Frontend

From the `frontend` folder:

```powershell
npm.cmd install
npm.cmd run dev
```

Frontend URL: `http://127.0.0.1:5173`

Use `npm.cmd` in PowerShell if `npm` is blocked by the Windows script execution policy.

## Build Frontend

```powershell
cd frontend
npm.cmd run build
npm.cmd run preview
```

Preview URL: `http://127.0.0.1:4173`

## Project Structure

```text
api/              FastAPI application
data/             CSV request data
frontend/         React/Vite frontend
modules/          CLI modules and Spark analytics
app.py            Python CLI entrypoint
requirements.txt  Python dependencies
```

## Screenshots

<img width="929" height="277" alt="image" src="https://github.com/user-attachments/assets/33937555-e3df-46b8-be63-77661466c35d" />

<img width="928" height="359" alt="image" src="https://github.com/user-attachments/assets/a77e5147-d48c-469a-8e39-0efef1598bc7" />

<img width="911" height="281" alt="image" src="https://github.com/user-attachments/assets/9c8272d9-3050-4994-bd20-f3ab7ef772ca" />


