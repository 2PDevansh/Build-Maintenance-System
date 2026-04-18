from pyspark.sql import SparkSession
from pyspark.sql.functions import initcap

def analyze_data():
    spark = SparkSession.builder \
        .appName("MaintenanceAnalysis") \
        .master("local[*]") \
        .getOrCreate()

    df = spark.read.csv(
        "hdfs://namenode:9000/data/requests.csv",
        header=True,
        inferSchema=True
    )

    df = df.dropna()
    df = df.withColumn("priority", initcap(df["priority"]))
    df = df.withColumn("issue_type", initcap(df["issue_type"]))

    print("\n=== Issue Count ===")
    df.groupBy("issue_type").count().show()

    print("\n=== Priority Count ===")
    df.groupBy("priority").count().show()

    print("\n=== Status Count ===")
    df.groupBy("status").count().show()
    

    spark.stop()
if __name__ == "__main__":
    analyze_data()