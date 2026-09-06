from pathlib import Path
import csv
import math

import numpy as np
import rasterio
from rasterio.warp import calculate_default_transform, reproject, Resampling
from rasterio.transform import rowcol


# =========================================================
# NER-SAFE DEM PROCESSOR
#
# Input:
#   data/dem/raw/Copernicus_DSM_10_N27_00_E088_00_DEM.tif
#
# Outputs:
#   data/dem/processed/dem_utm45n.tif
#   data/dem/processed/slope_degrees.tif
#   data/dem/processed/aspect_degrees.tif
#   data/dem/processed/terrain_points.csv
#
# IMPORTANT:
# The original Copernicus DEM is in EPSG:4326 (latitude/longitude).
# We first reproject it to UTM Zone 45N (EPSG:32645), so horizontal
# distances are in metres before calculating slope and aspect.
# =========================================================


PROJECT_FOLDER = Path(__file__).resolve().parents[1]

RAW_FOLDER = PROJECT_FOLDER / "data" / "dem" / "raw"
PROCESSED_FOLDER = PROJECT_FOLDER / "data" / "dem" / "processed"

INPUT_DEM = RAW_FOLDER / "Copernicus_DSM_10_N27_00_E088_00_DEM.tif"

PROJECTED_DEM = PROCESSED_FOLDER / "dem_utm45n.tif"
SLOPE_FILE = PROCESSED_FOLDER / "slope_degrees.tif"
ASPECT_FILE = PROCESSED_FOLDER / "aspect_degrees.tif"
POINTS_CSV = PROCESSED_FOLDER / "terrain_points.csv"

# Rangpo/Singtam are in UTM Zone 45N.
TARGET_CRS = "EPSG:32645"

# Prototype monitoring locations.
# Coordinates are longitude, latitude in WGS84.
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


def reproject_dem():
    """Reproject source DEM from EPSG:4326 to UTM 45N."""

    print("\nSTEP 1: Reprojecting DEM to UTM Zone 45N...")

    with rasterio.open(INPUT_DEM) as src:
        transform, width, height = calculate_default_transform(
            src.crs,
            TARGET_CRS,
            src.width,
            src.height,
            *src.bounds,
            resolution=30,
        )

        profile = src.profile.copy()
        profile.update(
            {
                "crs": TARGET_CRS,
                "transform": transform,
                "width": width,
                "height": height,
                "dtype": "float32",
                "nodata": -9999.0,
                "compress": "deflate",
            }
        )

        with rasterio.open(PROJECTED_DEM, "w", **profile) as dst:
            reproject(
                source=rasterio.band(src, 1),
                destination=rasterio.band(dst, 1),
                src_transform=src.transform,
                src_crs=src.crs,
                src_nodata=src.nodata,
                dst_transform=transform,
                dst_crs=TARGET_CRS,
                dst_nodata=-9999.0,
                resampling=Resampling.bilinear,
            )

    print(f"Created: {PROJECTED_DEM}")


def calculate_slope_aspect():
    """Calculate slope and aspect from the projected DEM."""

    print("\nSTEP 2: Calculating slope and aspect...")

    with rasterio.open(PROJECTED_DEM) as src:
        dem = src.read(1).astype("float64")
        profile = src.profile.copy()
        transform = src.transform
        nodata = src.nodata

        valid = np.isfinite(dem)

        if nodata is not None:
            valid &= dem != nodata

        dem_for_gradient = dem.copy()
        dem_for_gradient[~valid] = np.nan

        # Pixel sizes in metres because raster is now UTM.
        x_res = abs(transform.a)
        y_res = abs(transform.e)

        # numpy.gradient returns derivative along rows (y) and columns (x).
        dz_dy, dz_dx = np.gradient(
            dem_for_gradient,
            y_res,
            x_res,
        )

        # Slope in degrees.
        slope = np.degrees(
            np.arctan(
                np.sqrt(
                    (dz_dx ** 2) + (dz_dy ** 2)
                )
            )
        )

        # Aspect:
        # 0 = North, 90 = East, 180 = South, 270 = West.
        aspect = np.degrees(
            np.arctan2(
                dz_dx,
                -dz_dy,
            )
        )

        aspect = (aspect + 360.0) % 360.0

        # Flat pixels have no meaningful aspect.
        flat = slope < 0.001
        aspect[flat] = -1.0

        slope[~valid] = -9999.0
        aspect[~valid] = -9999.0

        output_profile = profile.copy()
        output_profile.update(
            {
                "count": 1,
                "dtype": "float32",
                "nodata": -9999.0,
                "compress": "deflate",
            }
        )

        with rasterio.open(
            SLOPE_FILE,
            "w",
            **output_profile,
        ) as dst:
            dst.write(
                slope.astype("float32"),
                1,
            )

        with rasterio.open(
            ASPECT_FILE,
            "w",
            **output_profile,
        ) as dst:
            dst.write(
                aspect.astype("float32"),
                1,
            )

    print(f"Created: {SLOPE_FILE}")
    print(f"Created: {ASPECT_FILE}")


def sample_raster(file_path, longitude, latitude):
    """
    Sample a raster using WGS84 longitude/latitude.
    rasterio.warp.transform converts point into raster CRS.
    """
    from rasterio.warp import transform as warp_transform

    with rasterio.open(file_path) as src:
        xs, ys = warp_transform(
            "EPSG:4326",
            src.crs,
            [longitude],
            [latitude],
        )

        value = next(
            src.sample(
                [(xs[0], ys[0])]
            )
        )[0]

        if src.nodata is not None and math.isclose(
            float(value),
            float(src.nodata),
            rel_tol=0.0,
            abs_tol=1e-6,
        ):
            return None

        return float(value)


def aspect_direction(aspect):
    """Convert aspect angle to an easy-to-read compass direction."""

    if aspect is None or aspect < 0:
        return "Flat/Unknown"

    directions = [
        "N",
        "NE",
        "E",
        "SE",
        "S",
        "SW",
        "W",
        "NW",
    ]

    index = int(
        ((aspect + 22.5) % 360) / 45
    )

    return directions[index]


def create_point_summary():
    """Extract elevation, slope and aspect for Rangpo/Singtam."""

    print("\nSTEP 3: Extracting terrain values at monitoring points...")

    rows = []

    for location, coords in LOCATIONS.items():
        lon = coords["longitude"]
        lat = coords["latitude"]

        elevation = sample_raster(
            PROJECTED_DEM,
            lon,
            lat,
        )

        slope = sample_raster(
            SLOPE_FILE,
            lon,
            lat,
        )

        aspect = sample_raster(
            ASPECT_FILE,
            lon,
            lat,
        )

        row = {
            "location": location,
            "latitude": lat,
            "longitude": lon,
            "elevation_m": (
                round(elevation, 2)
                if elevation is not None
                else ""
            ),
            "slope_degrees": (
                round(slope, 2)
                if slope is not None
                else ""
            ),
            "aspect_degrees": (
                round(aspect, 2)
                if aspect is not None
                else ""
            ),
            "aspect_direction": aspect_direction(aspect),
        }

        rows.append(row)

        print(f"\n{location}")
        print(f"  Elevation : {row['elevation_m']} m")
        print(f"  Slope     : {row['slope_degrees']}°")
        print(
            f"  Aspect    : {row['aspect_degrees']}° "
            f"({row['aspect_direction']})"
        )

    with open(
        POINTS_CSV,
        "w",
        newline="",
        encoding="utf-8-sig",
    ) as file:
        writer = csv.DictWriter(
            file,
            fieldnames=[
                "location",
                "latitude",
                "longitude",
                "elevation_m",
                "slope_degrees",
                "aspect_degrees",
                "aspect_direction",
            ],
        )

        writer.writeheader()
        writer.writerows(rows)

    print(f"\nCreated: {POINTS_CSV}")


def main():
    print("\n" + "=" * 65)
    print("NER-SAFE DEM PROCESSOR")
    print("=" * 65)

    PROCESSED_FOLDER.mkdir(
        parents=True,
        exist_ok=True,
    )

    if not INPUT_DEM.exists():
        print("\nERROR: DEM file not found.")
        print("Expected file:")
        print(INPUT_DEM)
        print(
            "\nCopy the Copernicus DEM .tif file into "
            "data\\dem\\raw and run again."
        )
        return

    reproject_dem()
    calculate_slope_aspect()
    create_point_summary()

    print("\n" + "=" * 65)
    print("DEM PROCESSING COMPLETE")
    print("=" * 65)

    print("\nOutputs:")
    print(PROJECTED_DEM)
    print(SLOPE_FILE)
    print(ASPECT_FILE)
    print(POINTS_CSV)


if __name__ == "__main__":
    main()
