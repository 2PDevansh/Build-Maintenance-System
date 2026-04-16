from pyspark.sql import SparkSession

def analyze_data():
    # Create Spark session
    spark = SparkSession.builder \
        .appName("MaintenanceAnalysis") \
        .getOrCreate()

    # Read CSV data
    df = spark.read.csv("data/requests.csv", header=True, inferSchema=True)

    # Clean / normalize data (important)
    df = df.dropna()  # remove empty rows

    # Standardize text (avoid low vs Low issue)
    from pyspark.sql.functions import initcap
    df = df.withColumn("priority", initcap(df["priority"]))
    df = df.withColumn("issue_type", initcap(df["issue_type"]))

    print("\n=== Issue Count ===")
    df.groupBy("issue_type").count().show()

    print("\n=== Priority Count ===")
    df.groupBy("priority").count().show()

    print("\n=== Status Count ===")
    df.groupBy("status").count().show()

    spark.stop()