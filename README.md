# 🏢 Building Maintenance System (Hadoop + Spark + FastAPI + Docker)

## 🚀 Overview

A distributed Building Maintenance System that:

* Stores maintenance requests
* Uses **Hadoop HDFS** for storage
* Uses **Apache Spark** for analytics
* Provides APIs via **FastAPI**
* Runs fully containerized using **Docker**

---

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

---

