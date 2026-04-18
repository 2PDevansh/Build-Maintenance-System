from fastapi import FastAPI
import subprocess

app = FastAPI()

@app.get("/")
def home():
    return {"message": "Building Maintenance API Running 🚀"}

@app.get("/analyze")
def analyze():
    try:
        result = subprocess.run(
            ["python", "modules/analytics.py"],
            capture_output=True,
            text=True
        )

        return {
            "status": "Analysis completed",
            "output": result.stdout
        }

    except Exception as e:
        return {"error": str(e)}