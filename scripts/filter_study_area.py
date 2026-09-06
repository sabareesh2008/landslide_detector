from pathlib import Path
import csv


PROJECT = Path(__file__).resolve().parents[1]

INPUT_FILE = (
    PROJECT
    / "data"
    / "landslides"
    / "processed"
    / "sikkim_landslides.csv"
)

OUTPUT_FILE = (
    PROJECT
    / "data"
    / "landslides"
    / "processed"
    / "rangpo_singtam_landslides.csv"
)


# Prototype bounding box around Rangpo → Singtam corridor
MIN_LAT = 27.13
MAX_LAT = 27.28

MIN_LON = 88.44
MAX_LON = 88.60


def main():

    selected_rows = []

    with open(
        INPUT_FILE,
        "r",
        encoding="utf-8-sig",
        newline=""
    ) as file:

        reader = csv.DictReader(file)

        fieldnames = reader.fieldnames

        for row in reader:

            try:
                latitude = float(row["latitude"])
                longitude = float(row["longitude"])

            except:
                continue

            if (
                MIN_LAT <= latitude <= MAX_LAT
                and
                MIN_LON <= longitude <= MAX_LON
            ):
                selected_rows.append(row)


    with open(
        OUTPUT_FILE,
        "w",
        encoding="utf-8-sig",
        newline=""
    ) as file:

        writer = csv.DictWriter(
            file,
            fieldnames=fieldnames
        )

        writer.writeheader()

        writer.writerows(selected_rows)


    print("\n" + "=" * 55)

    print("NER-SAFE STUDY AREA FILTER COMPLETE")

    print(
        f"Selected landslides: {len(selected_rows)}"
    )

    print("\nSaved at:")

    print(OUTPUT_FILE)


if __name__ == "__main__":
    main()