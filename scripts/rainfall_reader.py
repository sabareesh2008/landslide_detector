from pathlib import Path
import csv
import re
import rasterio


# -----------------------------
# PROJECT FOLDERS
# -----------------------------

PROJECT_FOLDER = Path(__file__).resolve().parents[1]

RAINFALL_RAW_FOLDER = (
    PROJECT_FOLDER / "data" / "rainfall" / "raw"
)

RAINFALL_PROCESSED_FOLDER = (
    PROJECT_FOLDER / "data" / "rainfall" / "processed"
)

OUTPUT_FILE = (
    RAINFALL_PROCESSED_FOLDER / "rainfall_history.csv"
)


# -----------------------------
# LOCATIONS
# longitude, latitude
# -----------------------------

LOCATIONS = {
    "Rangpo": {
        "longitude": 88.533,
        "latitude": 27.177
    },

    "Singtam": {
        "longitude": 88.501,
        "latitude": 27.234
    }
}


# -----------------------------
# GET DATE AND TIME FROM
# NASA FILE NAME
# -----------------------------

def get_time_from_filename(filename):

    pattern = r"3IMERG\.(\d{8})-S(\d{6})-E(\d{6})"

    match = re.search(pattern, filename)

    if not match:
        return "", "", ""

    date = match.group(1)
    start_time = match.group(2)
    end_time = match.group(3)

    # Convert 20260827 → 2026-08-27
    date = (
        f"{date[0:4]}-"
        f"{date[4:6]}-"
        f"{date[6:8]}"
    )

    # Convert 010000 → 01:00:00
    start_time = (
        f"{start_time[0:2]}:"
        f"{start_time[2:4]}:"
        f"{start_time[4:6]}"
    )

    # Convert 012959 → 01:29:59
    end_time = (
        f"{end_time[0:2]}:"
        f"{end_time[2:4]}:"
        f"{end_time[4:6]}"
    )

    return date, start_time, end_time


# -----------------------------
# READ RAINFALL
# -----------------------------

def get_rainfall(file_path, longitude, latitude):

    with rasterio.open(file_path) as src:

        raw_value = list(
            src.sample(
                [(longitude, latitude)]
            )
        )[0][0]

        # Check NoData value
        if (
            src.nodata is not None
            and raw_value == src.nodata
        ):
            return None

        # NASA IMERG GIS rainfall
        # scale = 0.1 mm
        rainfall_mm = float(raw_value) / 10.0

        return rainfall_mm


# -----------------------------
# MAIN PROGRAM
# -----------------------------

def main():

    RAINFALL_PROCESSED_FOLDER.mkdir(
        parents=True,
        exist_ok=True
    )

    tif_files = sorted(
        RAINFALL_RAW_FOLDER.glob("*.tif")
    )

    if not tif_files:

        print("No NASA rainfall files found.")

        print(
            "Put .tif files inside:"
        )

        print(RAINFALL_RAW_FOLDER)

        return


    rows = []

    print("\nNER-SAFE RAINFALL PROCESSOR")
    print("=" * 55)


    for file_path in tif_files:

        date, start_time, end_time = (
            get_time_from_filename(
                file_path.name
            )
        )

        print("\nFile:")
        print(file_path.name)

        print(
            f"Period: {date} "
            f"{start_time} - {end_time} UTC"
        )


        for location, coordinates in LOCATIONS.items():

            rainfall = get_rainfall(
                file_path,
                coordinates["longitude"],
                coordinates["latitude"]
            )

            if rainfall is None:

                print(
                    f"{location}: No Data"
                )

                continue


            print(
                f"{location}: "
                f"{rainfall:.2f} mm"
            )


            rows.append({

                "date_utc": date,

                "start_time_utc": start_time,

                "end_time_utc": end_time,

                "location": location,

                "latitude":
                    coordinates["latitude"],

                "longitude":
                    coordinates["longitude"],

                "rainfall_mm":
                    round(rainfall, 2),

                "source_file":
                    file_path.name
            })


    # -----------------------------
    # SAVE CSV
    # -----------------------------

    with open(
        OUTPUT_FILE,
        "w",
        newline="",
        encoding="utf-8"
    ) as csv_file:

        fieldnames = [

            "date_utc",

            "start_time_utc",

            "end_time_utc",

            "location",

            "latitude",

            "longitude",

            "rainfall_mm",

            "source_file"
        ]


        writer = csv.DictWriter(
            csv_file,
            fieldnames=fieldnames
        )


        writer.writeheader()

        writer.writerows(rows)


    print("\n" + "=" * 55)

    print("RAIN FALL DATA SAVED SUCCESSFULLY")

    print("\nSaved at:")

    print(OUTPUT_FILE)


if __name__ == "__main__":
    main()