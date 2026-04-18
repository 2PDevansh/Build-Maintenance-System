from modules.add_request import add_request
from modules.view_requests import view_requests
from modules.analytics import analyze_data

def main():
    while True:
        print("\n===== Building Maintenance System =====")
        print("1. Add Request")
        print("2. View Requests")
        print("3. Analyze Data (Spark)")
        print("4. Exit")

        choice = input("Enter choice: ")

        if choice == "1":
            add_request()
        elif choice == "2":
            view_requests()
        elif choice == "3":
            print("1. Analyze Local Data")
            print("2. Analyze HDFS Data")

            sub_choice = input("Enter choice: ")

            if sub_choice == "1":
                analyze_data(use_hdfs=False)
            elif sub_choice == "2":
                analyze_data(use_hdfs=True)
            else:
                print("Invalid choice")
        elif choice == "4":
            print("Exiting...")
            break
        else:
            print(" Invalid choice, try again.")

if __name__ == "__main__":
    main()