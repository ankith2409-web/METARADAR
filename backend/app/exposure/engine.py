from typing import Dict, Any, List, Optional
from app.exposure.franchise_map import FRANCHISE_MAP
from app.exposure.exposure_reference import compute_exposure_bucket
from app.exposure.routing_rules import determine_routing


class ExposureRoutingEngine:
    @classmethod
    def evaluate(
        cls,
        title: str,
        summary: str,
        competitor: str,
        drugs: List[str],
        event_type: str = "routine_status_update",
        breakthrough_designation: bool = False
    ) -> Dict[str, Any]:
        """
        Orchestrates franchise map lookup, exposure calculation, and team routing.
        """
        text_lower = f"{title} {summary} {' '.join(drugs)}".lower()

        # 1. Match asset in FRANCHISE_MAP
        matched_key: Optional[str] = None
        matched_info: Optional[Dict[str, Any]] = None

        for key, info in FRANCHISE_MAP.items():
            if key in text_lower or any(d.lower() in key for d in drugs):
                matched_key = key
                matched_info = info
                break

        # Extract franchise overlap and company size
        if matched_info:
            overlap = matched_info.get("overlap", "Obesity")
            company_size = matched_info.get("company_size", "large_pharma")
        else:
            # Fallback based on drug/therapeutic text keywords
            if "diabetes" in text_lower and ("obesity" in text_lower or "weight" in text_lower or "glp-1" in text_lower):
                overlap = "Both"
            elif "obesity" in text_lower or "weight" in text_lower:
                overlap = "Obesity"
            elif "diabetes" in text_lower or "t2d" in text_lower:
                overlap = "Type 2 Diabetes"
            else:
                overlap = "Adjacent/Other"
            
            company_size = "small_biotech" if ("biotech" in text_lower or "viking" in text_lower or "zealand" in text_lower) else "large_pharma"

        # 2. Compute Exposure Bucket & Methodology Note
        bucket, methodology_note, illustrative_range, source_citation = compute_exposure_bucket(
            event_type=event_type,
            overlap=overlap,
            asset_key=matched_key
        )

        # 3. Determine Routing Owner & Deadline Note
        routing_info = determine_routing(
            event_type=event_type,
            overlap=overlap,
            exposure_bucket=bucket,
            company_size=company_size,
            breakthrough_designation=breakthrough_designation
        )

        return {
            "franchise_overlap": overlap,
            "exposure_bucket": bucket,
            "exposure_range_illustrative": illustrative_range,
            "exposure_source_citation": source_citation,
            "exposure_methodology_note": methodology_note,
            "routing_owner": routing_info["owner"],
            "routing_deadline_note": routing_info["deadline_note"]
        }
