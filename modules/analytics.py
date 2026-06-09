from pyspark.sql import SparkSession
from pyspark.sql.functions import initcap

def analyze_data(use_hdfs=False):
    spark = SparkSession.builder \
        .appName("MaintenanceAnalysis") \
        .master("local[*]") \
        .getOrCreate()

    data_path = "hdfs://namenode:9000/data/requests.csv" if use_hdfs else "data/requests.csv"

    df = spark.read.csv(
        data_path,
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
