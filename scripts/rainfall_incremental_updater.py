import os
import re
import csv
import time
import json
import requests
import rasterio
from pathlib import Path
from datetime import datetime, timedelta, timezone

# ============================================================
# CONFIGURATION
# ============================================================

PROJECT_FOLDER = Path(__file__).resolve().parents[1]

RAW_FOLDER = PROJECT_FOLDER / "data" / "rainfall" / "raw"
PROCESSED_FOLDER = PROJECT_FOLDER / "data" / "rainfall" / "processed"

HISTORY_CSV = PROCESSED_FOLDER / "rainfall_history.csv"
LATEST_JSON = PROCESSED_FOLDER / "rainfall_latest.json"
STATE_JSON = PROCESSED_FOLDER / "last_downloaded.json"

NASA_BASE_URL = (
    "https://jsimpsonhttps.pps.eosdis.nasa.gov/"
    "imerg/gis/early/"
)

# Check NASA once every hour
CHECK_INTERVAL_SECONDS = 60 * 60

# NASA Early Run can have several hours of delay.
# Keep a large lookback so delayed files are not missed.
LOOKBACK_HOURS = 180

MAX_RETRIES = 5

# IMERG GIS data uses 0.1 mm scaling
SCALE_TO_MM = 0.1

LOCATIONS = {
    "Rangpo": {
        "latitude": 27.177,
        "longitude": 88.533,
    },
    "Singtam": {
        "latitude": 27.234,
        "longitude": 88.501,
    },
}

FILE_PATTERN = re.compile(
    r"3B-HHR-E\.MS\.MRG\.3IMERG\."
    r"(\d{8})-S(\d{6})-E(\d{6})\."
    r"(\d{4})\.V07C\.30min\.tif"
)

# ============================================================
# FOLDERS
# ============================================================

RAW_FOLDER.mkdir(parents=True, exist_ok=True)
PROCESSED_FOLDER.mkdir(parents=True, exist_ok=True)


# ============================================================
# NASA LOGIN
# ============================================================

def get_nasa_email():
    email = os.getenv("NASA_PPS_EMAIL")

    if email:
        return email.strip()

    email = input(
        "\nEnter your NASA PPS email: "
    ).strip()

    if not email:
        raise RuntimeError("NASA PPS email is required.")

    return email


NASA_EMAIL = get_nasa_email()


# ============================================================
# STATE
# ============================================================

def load_state():
    if not STATE_JSON.exists():
        return {
            "last_observation_end_utc": None,
            "last_download_time_utc": None,
        }

    try:
        with open(STATE_JSON, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return {
            "last_observation_end_utc": None,
            "last_download_time_utc": None,
        }


def save_state(last_observation_end):
    state = {
        "last_observation_end_utc": last_observation_end.isoformat(),
        "last_download_time_utc": datetime.now(
            timezone.utc
        ).isoformat(),
    }

    with open(STATE_JSON, "w", encoding="utf-8") as f:
        json.dump(state, f, indent=2)


# ============================================================
# CSV
# ============================================================

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


def load_existing_keys():
    keys = set()

    if not HISTORY_CSV.exists():
        return keys

    try:
        with open(
            HISTORY_CSV,
            "r",
            encoding="utf-8",
            newline=""
        ) as f:

            reader = csv.DictReader(f)

            for row in reader:
                source = row.get("source_file", "")
                location = row.get("location", "")

                if source and location:
                    keys.add((source, location))

    except Exception as e:
        print(f"Warning: could not read CSV: {e}")

    return keys


def append_rows(rows):
    if not rows:
        return

    file_exists = HISTORY_CSV.exists()

    with open(
        HISTORY_CSV,
        "a",
        encoding="utf-8",
        newline=""
    ) as f:

        writer = csv.DictWriter(
            f,
            fieldnames=CSV_FIELDS
        )

        if not file_exists:
            writer.writeheader()

        writer.writerows(rows)

        f.flush()
        os.fsync(f.fileno())


# ============================================================
# NASA DIRECTORY
# ============================================================

def get_month_urls(start_date, end_date):

    months = set()

    current = start_date.replace(
        day=1,
        hour=0,
        minute=0,
        second=0,
        microsecond=0
    )

    while current <= end_date:

        months.add(
    f"{current.year:04d}/{current.month:02d}"
)

        if current.month == 12:
            current = current.replace(
                year=current.year + 1,
                month=1
            )
        else:
            current = current.replace(
                month=current.month + 1
            )

    return [
        NASA_BASE_URL + month + "/"
        for month in sorted(months)
    ]


# ============================================================
# NASA FILE LIST
# ============================================================

def get_available_files(session):

    now = datetime.now(timezone.utc)

    start_time = now - timedelta(
        hours=LOOKBACK_HOURS
    )

    available = []

    for url in get_month_urls(start_time, now):

        print(f"Checking NASA: {url}")

        try:
            response = session.get(
                url,
                timeout=60
            )

            if response.status_code != 200:
                print(
                    f"NASA returned HTTP "
                    f"{response.status_code}"
                )
                continue

            matches = re.findall(
                r'href="([^"]+\.30min\.tif)"',
                response.text
            )

            for filename in matches:

                match = FILE_PATTERN.match(filename)

                if not match:
                    continue

                date_text = match.group(1)
                start_text = match.group(2)

                observation_start = datetime.strptime(
                    date_text + start_text,
                    "%Y%m%d%H%M%S"
                ).replace(tzinfo=timezone.utc)

                observation_end = (
                    observation_start
                    + timedelta(minutes=30)
                )

                if (
                    start_time
                    <= observation_start
                    <= now
                ):
                    available.append(
                        (
                            filename,
                            observation_start,
                            observation_end,
                            url
                        )
                    )

        except Exception as e:
            print(
                f"Error checking NASA directory: {e}"
            )

    available.sort(
        key=lambda x: x[1]
    )

    return available


# ============================================================
# DOWNLOAD
# ============================================================

def download_file(
    session,
    filename,
    url
):

    destination = RAW_FOLDER / filename

    # IMPORTANT:
    # Existing files are NEVER downloaded again.
    if destination.exists():
        print(
            f"Already exists: {filename}"
        )
        return destination

    full_url = url + filename

    print(
        f"Downloading NEW file: {filename}"
    )

    temporary = destination.with_suffix(
        destination.suffix + ".part"
    )

    for attempt in range(1, MAX_RETRIES + 1):

        try:

            with session.get(
                full_url,
                stream=True,
                timeout=120
            ) as response:

                if response.status_code != 200:
                    raise RuntimeError(
                        f"HTTP {response.status_code}"
                    )

                with open(
                    temporary,
                    "wb"
                ) as f:

                    for chunk in response.iter_content(
                        chunk_size=1024 * 1024
                    ):

                        if chunk:
                            f.write(chunk)

            temporary.replace(destination)

            print(
                f"Downloaded: {filename}"
            )

            return destination

        except Exception as e:

            print(
                f"Download attempt "
                f"{attempt}/{MAX_RETRIES} failed: {e}"
            )

            if temporary.exists():
                temporary.unlink()

            time.sleep(5 * attempt)

    print(
        f"FAILED: {filename}"
    )

    return None


# ============================================================
# READ RAINFALL FROM GEOTIFF
# ============================================================

def read_rainfall_mm(
    tif_path,
    latitude,
    longitude
):

    try:

        with rasterio.open(tif_path) as src:

            values = list(
                src.sample(
                    [(longitude, latitude)]
                )
            )

            if not values:
                return None

            value = float(values[0][0])

            if value == src.nodata:
                return None

            rainfall = value * SCALE_TO_MM

            if rainfall < 0:
                rainfall = 0

            return rainfall

    except Exception as e:

        print(
            f"Raster read failed for "
            f"{tif_path.name}: {e}"
        )

        return None


# ============================================================
# PROCESS FILE
# ============================================================

def process_file(
    tif_path,
    observation_start,
    observation_end,
    existing_keys
):

    rows = []

    for location_name, location in LOCATIONS.items():

        key = (
            tif_path.name,
            location_name
        )

        # Prevent duplicate CSV records
        if key in existing_keys:
            continue

        rainfall = read_rainfall_mm(
            tif_path,
            location["latitude"],
            location["longitude"]
        )

        if rainfall is None:
            continue

        rows.append({
            "date_utc":
                observation_start.strftime(
                    "%Y-%m-%d"
                ),

            "start_time_utc":
                observation_start.isoformat(),

            "end_time_utc":
                observation_end.isoformat(),

            "observation_end_utc":
                observation_end.isoformat(),

            "location":
                location_name,

            "latitude":
                location["latitude"],

            "longitude":
                location["longitude"],

            "rainfall_mm":
                round(rainfall, 3),

            "source_file":
                tif_path.name,
        })

        existing_keys.add(key)

    return rows


# ============================================================
# SUMMARY
# ============================================================

def build_summary():

    if not HISTORY_CSV.exists():
        return

    rows = []

    with open(
        HISTORY_CSV,
        "r",
        encoding="utf-8",
        newline=""
    ) as f:

        reader = csv.DictReader(f)

        for row in reader:

            try:

                rainfall = float(
                    row["rainfall_mm"]
                )

                observation_end = datetime.fromisoformat(
                    row["observation_end_utc"]
                )

                if observation_end.tzinfo is None:
                    observation_end = observation_end.replace(
                        tzinfo=timezone.utc
                    )

                rows.append({
                    "location":
                        row["location"],

                    "rainfall":
                        rainfall,

                    "time":
                        observation_end
                })

            except Exception:
                continue

    if not rows:
        return

    now = datetime.now(timezone.utc)

    summary = {}

    for location_name in LOCATIONS:

        location_rows = [
            r for r in rows
            if r["location"] == location_name
        ]

        location_rows.sort(
            key=lambda x: x["time"]
        )

        def total(hours):

            cutoff = now - timedelta(
                hours=hours
            )

            return round(
                sum(
                    r["rainfall"]
                    for r in location_rows
                    if cutoff
                    <= r["time"]
                    <= now
                ),
                2
            )

        latest = (
            location_rows[-1]
            if location_rows
            else None
        )

        summary[location_name] = {
            "rainfall_1h_mm":
                total(1),

            "rainfall_24h_mm":
                total(24),

            "rainfall_72h_mm":
                total(72),

            "rainfall_7d_mm":
                total(168),

            "latest_rainfall_mm":
                round(
                    latest["rainfall"],
                    2
                )
                if latest
                else 0,

            "latest_observation_utc":
                latest["time"].isoformat()
                if latest
                else None,

            "records":
                len(location_rows)
        }

    output = {
        "generated_at_utc":
            now.isoformat(),

        "source":
            "NASA GPM IMERG Early Run",

        "update_mode":
            "incremental",

        "locations":
            summary
    }

    with open(
        LATEST_JSON,
        "w",
        encoding="utf-8"
    ) as f:

        json.dump(
            output,
            f,
            indent=2
        )


# ============================================================
# ONE UPDATE
# ============================================================

def update_once():

    print("\n" + "=" * 70)
    print(
        "NASA IMERG INCREMENTAL RAINFALL UPDATE"
    )
    print("=" * 70)

    existing_keys = load_existing_keys()

    print(
        f"Existing CSV records: "
        f"{len(existing_keys)}"
    )

    session = requests.Session()

    # NASA PPS authentication
    session.auth = (
        NASA_EMAIL,
        NASA_EMAIL
    )

    files = get_available_files(session)

    print(
        f"NASA files found: {len(files)}"
    )

    new_files = 0
    total_new_rows = 0
    latest_observation = None

    for (
        filename,
        observation_start,
        observation_end,
        directory_url
    ) in files:

        tif_path = download_file(
            session,
            filename,
            directory_url
        )

        if tif_path is None:
            continue

        before = len(existing_keys)

        rows = process_file(
            tif_path,
            observation_start,
            observation_end,
            existing_keys
        )

        if rows:

            append_rows(rows)

            new_files += 1
            total_new_rows += len(rows)

            print(
                f"Added {len(rows)} records "
                f"from {filename}"
            )

        if (
            latest_observation is None
            or observation_end > latest_observation
        ):
            latest_observation = observation_end

    if latest_observation:

        save_state(
            latest_observation
        )

    build_summary()

    print("\nUPDATE COMPLETE")
    print(
        f"New files processed: {new_files}"
    )
    print(
        f"New rainfall records: "
        f"{total_new_rows}"
    )

    print(
        f"CSV: {HISTORY_CSV}"
    )

    print(
        f"Latest JSON: {LATEST_JSON}"
    )

    print("=" * 70)


# ============================================================
# MAIN LOOP
# ============================================================

def main():

    print(
        "\nNASA IMERG hourly incremental updater started."
    )

    print(
        "Existing files will NOT be downloaded again."
    )

    print(
        "New 30-minute observations will be added automatically."
    )

    while True:

        try:
            update_once()

        except KeyboardInterrupt:

            print(
                "\nUpdater stopped."
            )

            break

        except Exception as e:

            print(
                f"\nUnexpected error: {e}"
            )

        print(
            "\nNext check in 60 minutes..."
        )

        try:
            time.sleep(
                CHECK_INTERVAL_SECONDS
            )

        except KeyboardInterrupt:

            print(
                "\nUpdater stopped."
            )

            break


if __name__ == "__main__":
    update_once()
    