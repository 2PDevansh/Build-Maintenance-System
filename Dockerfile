FROM python:3.9-bullseye

# Install Java + utilities
RUN apt-get update && apt-get install -y openjdk-11-jdk curl && apt-get clean

# Set Java properly
ENV JAVA_HOME=/usr/lib/jvm/java-11-openjdk-amd64
ENV PATH=$JAVA_HOME/bin:$PATH

# Fix Spark hostname issue inside Docker
ENV SPARK_LOCAL_IP=127.0.0.1

WORKDIR /app

COPY . .

RUN pip install --no-cache-dir -r requirements.txt

# IMPORTANT for imports
ENV PYTHONPATH=/app

CMD ["uvicorn", "api.main:app", "--host", "0.0.0.0", "--port", "8000"]