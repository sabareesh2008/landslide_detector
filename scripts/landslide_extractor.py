from pathlib import Path
import csv
import pdfplumber


PROJECT = Path(__file__).resolve().parents[1]

PDF_FILE = (
    PROJECT
    / "data"
    / "landslides"
    / "raw"
    / "landslide_report.pdf"
)

OUTPUT_DIR = (
    PROJECT
    / "data"
    / "landslides"
    / "processed"
)

OUTPUT_CSV = OUTPUT_DIR / "sikkim_landslides.csv"


HEADERS = [
    "sl_no",
    "slide_no",
    "state",
    "district",
    "slide_name",
    "nh_sh_location",
    "latitude",
    "longitude",
    "material_involved",
    "movement_type",
    "history",
]


def clean(value):
    if value is None:
        return ""

    return " ".join(
        str(value)
        .replace("\n", " ")
        .split()
    )


def valid_coordinate(latitude, longitude):

    try:
        latitude = float(latitude)
        longitude = float(longitude)

        return (
            -90 <= latitude <= 90
            and -180 <= longitude <= 180
        )

    except ValueError:
        return False


def main():

    OUTPUT_DIR.mkdir(
        parents=True,
        exist_ok=True
    )

    if not PDF_FILE.exists():

        print("ERROR: PDF not found")
        print(PDF_FILE)

        return


    sikkim_rows = []


    with pdfplumber.open(PDF_FILE) as pdf:

        for page_number, page in enumerate(
            pdf.pages,
            start=1
        ):

            print(
                f"Reading page "
                f"{page_number}/{len(pdf.pages)}"
            )


            tables = page.extract_tables()


            for table in tables:

                if not table:
                    continue


                # Skip table header
                for row in table[1:]:

                    if not row:
                        continue


                    row = [
                        clean(value)
                        for value in row
                    ]


                    # Ensure 11 columns
                    if len(row) < 11:

                        row += [
                            ""
                        ] * (11 - len(row))


                    row = row[:11]


                    state = row[2]


                    # Keep ONLY Sikkim
                    if state.lower() != "sikkim":
                        continue


                    latitude = row[6]
                    longitude = row[7]


                    # Only keep valid coordinates
                    if not valid_coordinate(
                        latitude,
                        longitude
                    ):
                        continue


                    sikkim_rows.append(row)


    with open(
        OUTPUT_CSV,
        "w",
        newline="",
        encoding="utf-8-sig"
    ) as file:

        writer = csv.writer(file)

        writer.writerow(HEADERS)

        writer.writerows(
            sikkim_rows
        )


    print("\n" + "=" * 50)

    print(
        "SIKKIM LANDSLIDE EXTRACTION COMPLETE"
    )

    print(
        f"Records saved: "
        f"{len(sikkim_rows)}"
    )

    print(
        f"Output file:\n{OUTPUT_CSV}"
    )


if __name__ == "__main__":
    main()