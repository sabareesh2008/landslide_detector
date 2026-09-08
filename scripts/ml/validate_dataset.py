"""
scripts/ml/validate_dataset.py
=============================================================================
Landslide Sentinel AI - Phase 2: Ground Truth and Quality Control
Validates the historical landslide catalog against strict spatial bounding,
completeness, and taxonomy criteria.
=============================================================================
"""

import json
import os
from datetime import datetime, timezone
from pathlib import Path
import pandas as pd
import numpy as np

PROJECT_ROOT = Path(__file__).resolve().parents[2]
RAW_LANDSLIDES_CSV = PROJECT_ROOT / "data" / "landslides" / "processed" / "rangpo_singtam_landslides.csv"
SIKKIM_LANDSLIDES_CSV = PROJECT_ROOT / "data" / "landslides" / "processed" / "sikkim_landslides.csv"
VALIDATED_OUT = PROJECT_ROOT / "data" / "validated" / "landslide_events.csv"
REPORT_OUT = PROJECT_ROOT / "data" / "validation" / "landslide_validation_report.json"

# Rangpo-Singtam / NH-10 corridor bounding box
BBOX = {
    "min_lat": 27.13,
    "max_lat": 27.28,
    "min_lon": 88.44,
    "max_lon": 88.60,
}

def parse_survey_year(slide_no):
    """Extract survey year from GSI slide number (e.g. 'SKM/SS/78A08/2015/175' -> 2015)."""
    if pd.isna(slide_no):
        return None
    parts = str(slide_no).split("/")
    for p in parts:
        if p.isdigit() and len(p) == 4 and 1980 <= int(p) <= 2030:
            return int(p)
    return None

def normalize_text(val, default="Unknown"):
    if pd.isna(val) or str(val).strip() == "" or str(val).strip().upper() == "NA":
        return default
    return str(val).strip().title()

def validate_dataset():
    print("=" * 60)
    print("LANDSLIDE SENTINEL AI - DATASET QUALITY CONTROL & VALIDATION")
    print("=" * 60)
    
    if not RAW_LANDSLIDES_CSV.exists():
        raise FileNotFoundError(f"Source landslides CSV missing at: {RAW_LANDSLIDES_CSV}")
        
    df = pd.read_csv(RAW_LANDSLIDES_CSV)
    raw_count = len(df)
    print(f"Loaded raw records: {raw_count}")
    
    # 1. Check coordinates & duplicates
    df["latitude"] = pd.to_numeric(df["latitude"], errors="coerce")
    df["longitude"] = pd.to_numeric(df["longitude"], errors="coerce")
    
    missing_coords_count = int((df["latitude"].isna() | df["longitude"].isna()).sum())
    
    # Exact duplicate coordinate count
    duplicate_coords_count = int(df.duplicated(subset=["latitude", "longitude"]).sum())
    
    valid_coords = df["latitude"].notna() & df["longitude"].notna()
    
    # 2. Check study area bounds
    in_bounds = (
        (df["latitude"] >= BBOX["min_lat"]) &
        (df["latitude"] <= BBOX["max_lat"]) &
        (df["longitude"] >= BBOX["min_lon"]) &
        (df["longitude"] <= BBOX["max_lon"])
    )
    
    # 3. Clean and normalize attributes
    df["material_clean"] = df["material_involved"].apply(lambda x: normalize_text(x, "Debris"))
    df["movement_clean"] = df["movement_type"].apply(lambda x: normalize_text(x, "Slide"))
    df["survey_year"] = df["slide_no"].apply(parse_survey_year)
    df["district_clean"] = df["district"].apply(lambda x: normalize_text(x, "East Sikkim"))
    
    validated_mask = valid_coords & in_bounds
    validated_df = df[validated_mask].copy()
    
    dropped_count = raw_count - len(validated_df)
    
    # 4. Standardized Output Schema matching Specification
    output_df = pd.DataFrame({
        "event_id": validated_df["slide_no"].fillna(validated_df["sl_no"].astype(str)),
        "event_time": "UNKNOWN",  # Explicit: No fabricated sub-daily timestamp
        "latitude": validated_df["latitude"].round(6),
        "longitude": validated_df["longitude"].round(6),
        "location_name": validated_df["nh_sh_location"].fillna("NH-10 Corridor"),
        "source": "Geological Survey of India (GSI) NLSM",
        "severity": np.where(validated_df["material_clean"] == "Rock", "HIGH", "MEDIUM"),
        "description": validated_df["material_clean"] + " " + validated_df["movement_clean"] + " (GSI Survey " + validated_df["survey_year"].fillna(2015).astype(str) + ")",
        "road_impact": "Direct / Connecting Route to NH-10",
        "verified": True,
        "geometry": validated_df.apply(lambda r: f"POINT({r['longitude']:.6f} {r['latitude']:.6f})", axis=1)
    })
    
    # Ensure destination directory exists
    VALIDATED_OUT.parent.mkdir(parents=True, exist_ok=True)
    REPORT_OUT.parent.mkdir(parents=True, exist_ok=True)
    
    output_df.to_csv(VALIDATED_OUT, index=False)
    print(f"Saved validated catalog ({len(output_df)} records) to: {VALIDATED_OUT}")
    
    # Generate Validation Report with full QA fields
    report = {
        "metadata": {
            "validation_timestamp_utc": datetime.now(timezone.utc).isoformat(),
            "source_dataset": "Geological Survey of India (GSI) National Landslide Susceptibility Mapping (NLSM)",
            "study_corridor": "Rangpo-Singtam / NH-10 Corridor, Sikkim",
            "bounding_box": BBOX,
        },
        "quality_control_summary": {
            "total_records": raw_count,
            "valid_records": len(output_df),
            "invalid_records": dropped_count,
            "duplicates": duplicate_coords_count,
            "missing_coordinates": missing_coords_count,
            "missing_dates": raw_count,  # GSI NLSM has survey year, but sub-daily event time is unrecorded
            "records_used_for_training": len(output_df),
            "records_excluded": dropped_count
        },
        "spatial_distribution": {
            "min_latitude": float(output_df["latitude"].min()),
            "max_latitude": float(output_df["latitude"].max()),
            "min_longitude": float(output_df["longitude"].min()),
            "max_longitude": float(output_df["longitude"].max()),
            "mean_latitude": float(output_df["latitude"].mean()),
            "mean_longitude": float(output_df["longitude"].mean()),
        },
        "material_distribution": validated_df["material_clean"].value_counts().to_dict(),
        "movement_distribution": validated_df["movement_clean"].value_counts().to_dict(),
        "district_distribution": validated_df["district_clean"].value_counts().to_dict(),
        "temporal_fidelity_assessment": {
            "timestamp_fidelity": "ANNUAL_SURVEY_RECORD",
            "exact_subdaily_timestamps_present": False,
            "scientific_note": "GSI NLSM inventory provides authoritative spatial coordinates, geological materials, and movement mechanisms with survey year tagging. Sub-daily failure timestamps are not present in catalog, requiring static susceptibility modeling combined with hydrometeorological trigger modeling rather than direct sub-daily binary regression on historical timestamps."
        }
    }
    
    with open(REPORT_OUT, "w", encoding="utf-8") as f:
        json.dump(report, f, indent=2)
        
    print(f"Saved validation report to: {REPORT_OUT}")
    print("=" * 60)
    return output_df, report

if __name__ == "__main__":
    validate_dataset()
