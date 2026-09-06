from pathlib import Path
import csv
from datetime import datetime, timedelta


PROJECT_FOLDER = Path(__file__).resolve().parents[1]

CSV_FILE = (
    PROJECT_FOLDER
    / "data"
    / "rainfall"
    / "processed"
    / "rainfall_history.csv"
)


def load_data():

    records = []

    with open(CSV_FILE, "r", encoding="utf-8") as file:

        reader = csv.DictReader(file)

        for row in reader:

            timestamp = datetime.strptime(
                row["date_utc"] + " " + row["end_time_utc"],
                "%Y-%m-%d %H:%M:%S"
            )

            records.append({
                "timestamp": timestamp,
                "location": row["location"],
                "rainfall": float(row["rainfall_mm"])
            })

    return records


def calculate_total(records, location, hours):

    location_records = [
        row
        for row in records
        if row["location"] == location
    ]

    if not location_records:
        return 0.0

    latest_time = max(
        row["timestamp"]
        for row in location_records
    )

    start_time = latest_time - timedelta(hours=hours)

    total = sum(
        row["rainfall"]
        for row in location_records
        if row["timestamp"] > start_time
    )

    return total


def main():

    records = load_data()

    locations = sorted(
        set(
            row["location"]
            for row in records
        )
    )

    print("\nNER-SAFE RAINFALL SUMMARY")
    print("=" * 45)

    for location in locations:

        rainfall_1h = calculate_total(
            records,
            location,
            1
        )

        rainfall_24h = calculate_total(
            records,
            location,
            24
        )

        rainfall_72h = calculate_total(
            records,
            location,
            72
        )

        rainfall_7d = calculate_total(
            records,
            location,
            168
        )

        print(f"\nLocation: {location}")

        print(
            f"Last 1 hour : {rainfall_1h:.2f} mm"
        )

        print(
            f"Last 24 hours: {rainfall_24h:.2f} mm"
        )

        print(
            f"Last 72 hours: {rainfall_72h:.2f} mm"
        )

        print(
            f"Last 7 days  : {rainfall_7d:.2f} mm"
        )


if __name__ == "__main__":
    main()