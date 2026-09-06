from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urljoin
from datetime import datetime, timedelta, timezone
import csv
import json
import os
import re
import time

import requests
import rasterio
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry


# =========================================================
# NER-SAFE ROBUST LIVE RAINFALL AUTOMATION
# NASA GPM IMERG EARLY RUN - 30 MINUTE GEOTIFF
# =========================================================

PROJECT_FOLDER = Path(__file__).resolve().parents[1]

RAW_FOLDER = PROJECT_FOLDER / "data" / "rainfall" / "raw"
PROCESSED_FOLDER = PROJECT_FOLDER / "data" / "rainfall" / "processed"

HISTORY_CSV = PROCESSED_FOLDER / "rainfall_history.csv"
LATEST_JSON = PROCESSED_FOLDER / "rainfall_latest.json"

BASE_URL = "https://jsimpsonhttps.pps.eosdis.nasa.gov/imerg/gis/early/"

# 7 days = 168 hours.
LOOKBACK_HOURS = 168

# Check again every 30 minutes.
CHECK_EVERY_MINUTES = 30

# Small pause between NASA downloads to avoid hammering the server.
DOWNLOAD_DELAY_SECONDS = 1.0

# Retry an individual file several times if the connection drops.
MAX_DOWNLOAD_RETRIES = 5

# NASA IMERG GIS values are in 0.1 mm units.
SCALE_TO_MM = 0.1

# Prototype monitoring points.
LOCATIONS = {
    "Rangpo": {
        "longitude": 88.533,
        "latitude": 27.177,
    },
    "Singtam": {
        "longitude": 88.501,
        "latitude": 27.234,
    },
}

FILE_PATTERN = re.compile(
    r"3IMERG\.(?P<date>\d{8})-S(?P<start>\d{6})-E(?P<end>\d{6})"
    r"\.\d{4}\.V\d+[A-Z]\.30min\.tif$",
    re.IGNORECASE,
)

CSV_FIELDS = [
    "date_utc",
    "start_time_utc",
    "end_time_utc",
    "observation_end_utc",
    "location",
    "latitude",
    "longitude",
    "rainfall_mm",
    "source_file",
]


class LinkParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.links = []

    def handle_starttag(self, tag, attrs):
        if tag.lower() != "a":
            return

        for name, value in attrs:
            if name.lower() == "href" and value:
                self.links.append(value)


def create_session():
    retry = Retry(
        total=5,
        connect=5,
        read=5,
        status=5,
        backoff_factor=2,
        status_forcelist=[429, 500, 502, 503, 504],
        allowed_methods=frozenset(["GET"]),
        raise_on_status=False,
    )

    adapter = HTTPAdapter(
        max_retries=retry,
        pool_connections=2,
        pool_maxsize=2,
    )

    session = requests.Session()
    session.mount("https://", adapter)

    session.headers.update({
        "User-Agent": "NER-SAFE/1.0 NASA-IMERG-rainfall-client",
        "Connection": "close",
    })

    return session


def get_nasa_email():
    email = os.getenv("NASA_PPS_EMAIL", "").strip().lower()

    if not email:
        print("\nNASA PPS login is required.")
        email = input("NASA PPS registered email: ").strip().lower()

    if "@" not in email:
        raise ValueError("Invalid email address.")

    return email


def parse_observation_time(filename):
    match = FILE_PATTERN.search(filename)

    if not match:
        return None

    date_text = match.group("date")
    start_text = match.group("start")
    end_text = match.group("end")

    start_dt = datetime.strptime(
        date_text + start_text,
        "%Y%m%d%H%M%S",
    ).replace(tzinfo=timezone.utc)

    end_dt = datetime.strptime(
        date_text + end_text,
        "%Y%m%d%H%M%S",
    ).replace(tzinfo=timezone.utc)

    if end_dt < start_dt:
        end_dt += timedelta(days=1)

    return start_dt, end_dt


def month_urls_for_lookback():
    now = datetime.now(timezone.utc)
    cutoff = now - timedelta(hours=LOOKBACK_HOURS)

    months = []

    cursor = datetime(
        cutoff.year,
        cutoff.month,
        1,
        tzinfo=timezone.utc,
    )

    end_month = datetime(
        now.year,
        now.month,
        1,
        tzinfo=timezone.utc,
    )

    while cursor <= end_month:
        months.append(
            f"{BASE_URL}{cursor.year:04d}/{cursor.month:02d}/"
        )

        if cursor.month == 12:
            cursor = datetime(
                cursor.year + 1,
                1,
                1,
                tzinfo=timezone.utc,
            )
        else:
            cursor = datetime(
                cursor.year,
                cursor.month + 1,
                1,
                tzinfo=timezone.utc,
            )

    return months


def get_recent_30min_files(session, auth):
    now = datetime.now(timezone.utc)
    cutoff = now - timedelta(hours=LOOKBACK_HOURS)

    found = {}

    for month_url in month_urls_for_lookback():
        print(f"Checking NASA directory: {month_url}")

        response = session.get(
            month_url,
            auth=auth,
            timeout=(20, 120),
        )

        if response.status_code == 401:
            raise RuntimeError(
                "NASA login failed. Check the PPS registered email."
            )

        response.raise_for_status()

        parser = LinkParser()
        parser.feed(response.text)

        for href in parser.links:
            filename = href.split("/")[-1]

            if not filename.lower().endswith(".30min.tif"):
                continue

            parsed = parse_observation_time(filename)

            if parsed is None:
                continue

            start_dt, end_dt = parsed

            if end_dt < cutoff:
                continue

            if end_dt > now + timedelta(hours=1):
                continue

            found[filename] = {
                "filename": filename,
                "url": urljoin(month_url, href),
                "start_dt": start_dt,
                "end_dt": end_dt,
            }

    return sorted(
        found.values(),
        key=lambda item: item["end_dt"],
    )


def download_file(session, auth, item):
    destination = RAW_FOLDER / item["filename"]

    # If the real .tif is already there, do not download again.
    if destination.exists() and destination.stat().st_size > 0:
        return destination, False

    temporary = destination.with_suffix(
        destination.suffix + ".part"
    )

    for attempt in range(1, MAX_DOWNLOAD_RETRIES + 1):
        try:
            print(
                f"Downloading: {item['filename']} "
                f"(attempt {attempt}/{MAX_DOWNLOAD_RETRIES})"
            )

            with session.get(
                item["url"],
                auth=auth,
                stream=True,
                timeout=(20, 180),
            ) as response:
                if response.status_code == 401:
                    raise RuntimeError(
                        "NASA login failed. Check the PPS registered email."
                    )

                response.raise_for_status()

                with open(temporary, "wb") as output:
                    for chunk in response.iter_content(
                        chunk_size=1024 * 256
                    ):
                        if chunk:
                            output.write(chunk)

            if not temporary.exists() or temporary.stat().st_size == 0:
                raise IOError("Downloaded file is empty.")

            temporary.replace(destination)

            time.sleep(DOWNLOAD_DELAY_SECONDS)

            return destination, True

        except (
            requests.RequestException,
            OSError,
        ) as error:
            print(f"Download failed: {error}")

            if temporary.exists():
                try:
                    temporary.unlink()
                except OSError:
                    pass

            if attempt < MAX_DOWNLOAD_RETRIES:
                wait_seconds = attempt * 5
                print(
                    f"Retrying this file in {wait_seconds} seconds..."
                )
                time.sleep(wait_seconds)
            else:
                print(
                    "Skipping this file for now. "
                    "It will be retried on the next cycle."
                )
                return None, False


def ensure_history_schema():
    """
    The earlier NER-SAFE reader created rainfall_history.csv with
    an older header. If that old file exists, preserve it as a backup
    and start the automation CSV with the new safe schema.
    """
    if not HISTORY_CSV.exists() or HISTORY_CSV.stat().st_size == 0:
        return

    with open(
        HISTORY_CSV,
        "r",
        encoding="utf-8",
        newline="",
    ) as file:
        reader = csv.reader(file)
        header = next(reader, [])

    if header == CSV_FIELDS:
        return

    backup = HISTORY_CSV.with_name(
        "rainfall_history_before_automation.csv"
    )

    # Do not overwrite an existing backup.
    counter = 1
    while backup.exists():
        backup = HISTORY_CSV.with_name(
            f"rainfall_history_before_automation_{counter}.csv"
        )
        counter += 1

    HISTORY_CSV.replace(backup)

    print("\nOld rainfall CSV format detected.")
    print(f"Backup created: {backup.name}")
    print(
        "A new rainfall_history.csv will be created "
        "for the automation."
    )


def load_existing_keys():
    keys = set()

    if not HISTORY_CSV.exists():
        return keys

    with open(
        HISTORY_CSV,
        "r",
        encoding="utf-8",
        newline="",
    ) as file:
        reader = csv.DictReader(file)

        for row in reader:
            keys.add(
                (
                    row.get("source_file", ""),
                    row.get("location", ""),
                )
            )

    return keys


def read_rainfall_mm(file_path, longitude, latitude):
    with rasterio.open(file_path) as src:
        raw_value = list(
            src.sample([(longitude, latitude)])
        )[0][0]

        if (
            src.nodata is not None
            and raw_value == src.nodata
        ):
            return None

        value = float(raw_value)

        if value < 0:
            return None

        return value * SCALE_TO_MM


def process_file(file_path, existing_keys):
    parsed = parse_observation_time(file_path.name)

    if parsed is None:
        print(
            f"Skipping unrecognized filename: {file_path.name}"
        )
        return []

    start_dt, end_dt = parsed
    rows = []

    for location, coordinates in LOCATIONS.items():
        key = (file_path.name, location)

        if key in existing_keys:
            continue

        rainfall_mm = read_rainfall_mm(
            file_path,
            coordinates["longitude"],
            coordinates["latitude"],
        )

        if rainfall_mm is None:
            print(f"{location}: NoData")
            continue

        rows.append({
            "date_utc": start_dt.strftime("%Y-%m-%d"),
            "start_time_utc": start_dt.strftime("%H:%M:%S"),
            "end_time_utc": end_dt.strftime("%H:%M:%S"),
            "observation_end_utc": end_dt.isoformat(),
            "location": location,
            "latitude": coordinates["latitude"],
            "longitude": coordinates["longitude"],
            "rainfall_mm": round(rainfall_mm, 2),
            "source_file": file_path.name,
        })

        existing_keys.add(key)

        print(
            f"{location}: {rainfall_mm:.2f} mm "
            f"({start_dt.strftime('%Y-%m-%d %H:%M')} - "
            f"{end_dt.strftime('%H:%M')} UTC)"
        )

    return rows


def append_rows(rows):
    if not rows:
        return

    file_exists = (
        HISTORY_CSV.exists()
        and HISTORY_CSV.stat().st_size > 0
    )

    with open(
        HISTORY_CSV,
        "a",
        encoding="utf-8",
        newline="",
    ) as file:
        writer = csv.DictWriter(
            file,
            fieldnames=CSV_FIELDS,
        )

        if not file_exists:
            writer.writeheader()

        writer.writerows(rows)

        # Save progress immediately.
        file.flush()
        os.fsync(file.fileno())


def load_history():
    records = []

    if not HISTORY_CSV.exists():
        return records

    with open(
        HISTORY_CSV,
        "r",
        encoding="utf-8",
        newline="",
    ) as file:
        reader = csv.DictReader(file)

        for row in reader:
            timestamp_text = row.get(
                "observation_end_utc",
                "",
            )

            if not timestamp_text:
                continue

            timestamp = datetime.fromisoformat(
                timestamp_text
            )

            if timestamp.tzinfo is None:
                timestamp = timestamp.replace(
                    tzinfo=timezone.utc
                )

            records.append({
                "timestamp": timestamp,
                "location": row["location"],
                "rainfall": float(
                    row["rainfall_mm"]
                ),
            })

    return records


def calculate_window(
    location_records,
    latest_time,
    hours,
):
    start_time = latest_time - timedelta(hours=hours)

    selected = [
        row
        for row in location_records
        if start_time < row["timestamp"] <= latest_time
    ]

    total = sum(
        row["rainfall"]
        for row in selected
    )

    expected_records = hours * 2
    available_records = len(selected)

    coverage = min(
        100.0,
        (
            available_records
            / expected_records
            * 100.0
        ),
    )

    return {
        "rainfall_mm": round(total, 2),
        "records_available": available_records,
        "records_expected": expected_records,
        "coverage_percent": round(coverage, 1),
        "complete": available_records >= expected_records,
    }


def build_summary():
    records = load_history()

    if not records:
        return None

    result = {
        "source": "NASA GPM IMERG Early Run",
        "generated_utc": datetime.now(
            timezone.utc
        ).isoformat(),
        "locations": {},
    }

    for location in LOCATIONS:
        location_records = [
            row
            for row in records
            if row["location"] == location
        ]

        if not location_records:
            continue

        latest_time = max(
            row["timestamp"]
            for row in location_records
        )

        now = datetime.now(timezone.utc)

        data_lag_hours = max(
            0.0,
            (
                now - latest_time
            ).total_seconds() / 3600.0,
        )

        result["locations"][location] = {
            "latest_observation_utc":
                latest_time.isoformat(),

            "data_lag_hours":
                round(data_lag_hours, 2),

            "rainfall_1h":
                calculate_window(
                    location_records,
                    latest_time,
                    1,
                ),

            "rainfall_24h":
                calculate_window(
                    location_records,
                    latest_time,
                    24,
                ),

            "rainfall_72h":
                calculate_window(
                    location_records,
                    latest_time,
                    72,
                ),

            "rainfall_7d":
                calculate_window(
                    location_records,
                    latest_time,
                    168,
                ),
        }

    with open(
        LATEST_JSON,
        "w",
        encoding="utf-8",
    ) as file:
        json.dump(
            result,
            file,
            indent=2,
        )

    return result


def print_summary(summary):
    if not summary:
        print("\nNo rainfall history available yet.")
        return

    print("\n" + "=" * 68)
    print("NER-SAFE LIVE RAINFALL SUMMARY")
    print("=" * 68)

    for location, data in summary[
        "locations"
    ].items():
        print(f"\nLocation: {location}")

        print(
            "Latest observation: "
            f"{data['latest_observation_utc']}"
        )

        print(
            "Approx. data lag: "
            f"{data['data_lag_hours']:.2f} hours"
        )

        for label, key in [
            ("1 hour", "rainfall_1h"),
            ("24 hours", "rainfall_24h"),
            ("72 hours", "rainfall_72h"),
            ("7 days", "rainfall_7d"),
        ]:
            item = data[key]

            status = (
                "COMPLETE"
                if item["complete"]
                else "INCOMPLETE"
            )

            print(
                f"{label:>8}: "
                f"{item['rainfall_mm']:.2f} mm | "
                f"coverage "
                f"{item['coverage_percent']:.1f}% | "
                f"{status}"
            )

    print(f"\nCSV : {HISTORY_CSV}")
    print(f"JSON: {LATEST_JSON}")


def run_cycle(session, auth):
    print("\n" + "=" * 68)
    print(
        "Checking NASA IMERG Early Run at "
        + datetime.now(
            timezone.utc
        ).strftime(
            "%Y-%m-%d %H:%M:%S UTC"
        )
    )
    print("=" * 68)

    recent_files = get_recent_30min_files(
        session,
        auth,
    )

    if not recent_files:
        print(
            "No recent 30-minute GeoTIFF files found."
        )
        return

    print(
        f"NASA files found in last "
        f"{LOOKBACK_HOURS} hours: "
        f"{len(recent_files)}"
    )

    existing_keys = load_existing_keys()

    downloaded_count = 0
    new_rows_count = 0
    failed_count = 0

    for index, item in enumerate(
        recent_files,
        start=1,
    ):
        print(
            f"\n[{index}/{len(recent_files)}]"
        )

        file_path, downloaded = download_file(
            session,
            auth,
            item,
        )

        if file_path is None:
            failed_count += 1
            continue

        if downloaded:
            downloaded_count += 1

        try:
            rows = process_file(
                file_path,
                existing_keys,
            )

            # CRITICAL:
            # Save each successful file immediately.
            # A later network error cannot erase this progress.
            append_rows(rows)

            new_rows_count += len(rows)

        except Exception as error:
            print(
                f"Processing error for "
                f"{file_path.name}: {error}"
            )

    summary = build_summary()
    print_summary(summary)

    print(
        "\nNew GeoTIFF files downloaded: "
        f"{downloaded_count}"
    )

    print(
        "New CSV rows added: "
        f"{new_rows_count}"
    )

    print(
        "Files that could not be downloaded "
        f"this cycle: {failed_count}"
    )

    if failed_count:
        print(
            "Those files are NOT lost. "
            "They will be retried on the next cycle."
        )


def main():
    RAW_FOLDER.mkdir(
        parents=True,
        exist_ok=True,
    )

    PROCESSED_FOLDER.mkdir(
        parents=True,
        exist_ok=True,
    )

    ensure_history_schema()

    nasa_email = get_nasa_email()

    # NASA PPS NRT authentication:
    # registered email is used in both fields.
    auth = (
        nasa_email,
        nasa_email,
    )

    session = create_session()

    print(
        "\nNER-SAFE ROBUST LIVE RAINFALL "
        "AUTOMATION STARTED"
    )

    print(
        f"Lookback: {LOOKBACK_HOURS} hours"
    )

    print(
        f"Automatic check: every "
        f"{CHECK_EVERY_MINUTES} minutes"
    )

    print(
        "Network retry protection: ON"
    )

    print(
        "Duplicate protection: ON"
    )

    print(
        "Incremental CSV saving: ON"
    )

    print("\nPress Ctrl+C to stop.")

    while True:
        try:
            run_cycle(
                session,
                auth,
            )

        except KeyboardInterrupt:
            print(
                "\nAutomation stopped by user."
            )
            break

        except Exception as error:
            print(
                f"\nCycle error: {error}"
            )

            print(
                "The program will try again "
                "on the next cycle."
            )

        print(
            f"\nWaiting "
            f"{CHECK_EVERY_MINUTES} minutes "
            f"before checking NASA again..."
        )

        try:
            time.sleep(
                CHECK_EVERY_MINUTES * 60
            )

        except KeyboardInterrupt:
            print(
                "\nAutomation stopped by user."
            )
            break


if __name__ == "__main__":
    main()
