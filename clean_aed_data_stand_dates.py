
#Loads the raw AED file
#Removes corrupted/broken entries
#Extracts only the fields we care about
#Normalises them into the new clean schema
#Saves everything to a new file



import json
from datetime import datetime



# Load raw data
with open("aedLocations.json", "r", encoding="utf-8") as f:
    raw = json.load(f)

# some data is GeoJSON FeatureCollections, others might just be a list
features = raw.get("features", raw)



#output
cleaned = []
skipped = 0



# normalisation functions
def normalize_access(access: str) -> str:
    """Turn access values into something simple: public/private/unknown."""
    if not access:
        return "unknown"
    val = access.lower()
    if val in ("yes", "public"):
        return "public"
    if val == "private":
        return "private"
    return "unknown" # anything else is treated as unknown


def normalize_date(date_str):
    """
    Try to convert a date string into '01/Jan/2025' style.
    If parsing fails, return the original string (or None if empty).
    """
    if not date_str:
        return None

    ###Clean up weird separators first
    date_str = date_str.strip()
    date_str = date_str.replace(":", "/").replace("_", "-")
    # now "24:11:2023" is "24/11/2023"
    # and "2023_12_14" is "2023-12-14"

    # Possible input formats we expect from the dataset
    formats = [
        "%Y-%m-%d",     # 2025-01-31 or 2023-12-14
        "%d/%m/%Y",     # 31/01/2025 or 24/11/2023
        "%d-%m-%Y",     # 31-01-2025
        "%d %b %Y",     # 31 Jan 2025
        "%d %B %Y",     # 31 January 2025
    ]

    #try each format until one works
    for fmt in formats:
        try:
            dt = datetime.strptime(date_str, fmt)
            # Final standard format: 01/Jan/2025
            return dt.strftime("%d/%b/%Y")
        except ValueError:
            continue

    # If no format matched, keep original value
    return date_str



# Validation to make sure that only safe aeds make the database
def is_valid_required_fields(aed: dict) -> bool:
    ###ensure AED has all required fields needed.
    #Must have location object
    location = aed.get("location")
    if not location:
        return False

    #must be GeoJSON
    if location.get("type") != "Point":
        return False

    # must have valid coordinates
    coords = location.get("coordinates")
    if not isinstance(coords, list) or len(coords) != 2:
        return False

    lon, lat = coords

    #coordinates must be numbers
    if not isinstance(lon,(int, float)) or not isinstance(lat,(int, float)):
        return False

    # coordinates must be within valid ranges
    if not (-180 <= lon <= 180 and -90 <= lat<=90):
        return False

    # #access must be known
    if aed.get("access") not in ("public", "private", "unknown"):
         return False

    #indoor must be a boolean
    if not isinstance(aed.get("indoor"), bool):
        return False


    return True




# main loop
for feature in features:
    try:
        geometry = feature.get("geometry")
        if not geometry or geometry.get("type") != "Point":
            skipped += 1
            continue

        coords = geometry.get("coordinates")
        if not isinstance(coords, list) or len(coords) != 2:
            skipped += 1
            continue

        lon, lat = coords

        # Rough Ireland bounds check. helps clean bad data
        in_ireland = (-11 <= lon <= -5) and (51 <= lat <= 56)
        if not in_ireland:
            skipped += 1
            continue

        props = feature.get("properties", {})

        # Raw last checked date from any of the known fields
        raw_last_checked = props.get("check_date") or props.get("survey:date")
        normalized_last_checked = normalize_date(raw_last_checked)

        aed_doc = {
            # Location for map (GeoJSON)
            "location": {
                "type": "Point",
                "coordinates": [lon, lat],
            },
            # Address
            "address": props.get("address"),
            # Operator / name
            "operator": props.get("operator"),
            "name": f"{props.get('operator')} AED"
            if props.get("operator")
            else "AED",
            # Indoor / outdoor
            "indoor": props.get("indoor") == "yes",
            # Access level
            "access": normalize_access(props.get("access")),
            # Description (where exactly it is)
            "description": (
                props.get("defibrillator:location")
                or props.get("defibrillator:location:en")
            ),
            # Opening hours (if present)
            "openingHours": props.get("opening_hours"),
            # Last checked date (normalised if possible)
            "lastCheckedAt": normalized_last_checked,
        }

        if not is_valid_required_fields(aed_doc):
            skipped += 1
            continue

        cleaned.append(aed_doc)



    except Exception as e:
        # skip record if something weird happens
        skipped += 1
        continue

# Save cleaned data to new file
with open("aed_clean_normalized_stand_dates_with_validation.json", "w", encoding="utf-8") as f:
    json.dump(cleaned, f, indent=2)

print("Cleaned records:", len(cleaned))
print("Skipped records:", skipped)



