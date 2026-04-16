import csv
from datetime import datetime

def add_request():
    issue_type = input("Enter issue type: ").capitalize()
    desc = input("Enter description: ")
    priority = input("Priority (Low/Medium/High): ").capitalize()

    with open("data/requests.csv", "r") as f:
        rows = list(csv.reader(f))
        new_id = len(rows)  # Simple ID generation based on row count

    with open("data/requests.csv", "a", newline="") as f:
        writer = csv.writer(f)
        writer.writerow([
            new_id,
            issue_type,
            desc,
            priority,
            "Open",
            datetime.now().date()
        ])

    print("✅ Request added successfully!")