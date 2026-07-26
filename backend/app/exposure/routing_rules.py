from typing import Dict, Any, List

ROUTING_RULES: List[Dict[str, Any]] = [
    {
        "id": "pricing_rule",
        "condition_name": "Pricing & Reimbursement Event",
        "owner": "Market Access",
        "deadline_note": "Flag before the next regional pricing & reimbursement review cycle.",
    },
    {
        "id": "commercial_strategy_rule",
        "condition_name": "Multi-Franchise High Exposure Event",
        "owner": "Commercial Strategy",
        "deadline_note": "Brief commercial team before the next quarterly strategy sync.",
    },
    {
        "id": "bdl_rule",
        "condition_name": "Biotech Acquisition / Breakthrough Watch",
        "owner": "BD&L (Business Development & Licensing)",
        "deadline_note": "Flag as an active acquisition / licensing candidate for BD&L evaluation.",
    },
    {
        "id": "medical_affairs_rule",
        "condition_name": "Routine Pipeline & Medical Intelligence",
        "owner": "Medical Affairs",
        "deadline_note": "Monitor — standard medical affairs review; no immediate action required.",
    },
]


def determine_routing(
    event_type: str,
    overlap: str,
    exposure_bucket: str,
    company_size: str = "large_pharma",
    breakthrough_designation: bool = False
) -> Dict[str, str]:
    """
    Evaluates signal characteristics against ordered routing rules (first match wins).
    """
    event_lower = event_type.lower()

    # Rule 1: Pricing or reimbursement signals go to Market Access
    if "pricing" in event_lower or "reimbursement" in event_lower or "access" in event_lower:
        return {
            "owner": ROUTING_RULES[0]["owner"],
            "deadline_note": ROUTING_RULES[0]["deadline_note"]
        }

    # Rule 2: Multi-Franchise ('Both') with Medium/High exposure goes to Commercial Strategy
    if overlap == "Both" and exposure_bucket in ["Medium", "High"]:
        return {
            "owner": ROUTING_RULES[1]["owner"],
            "deadline_note": ROUTING_RULES[1]["deadline_note"]
        }

    # Rule 3: Small Biotech or Breakthrough Designation goes to BD&L
    if company_size == "small_biotech" or breakthrough_designation:
        return {
            "owner": ROUTING_RULES[2]["owner"],
            "deadline_note": ROUTING_RULES[2]["deadline_note"]
        }

    # Rule 4: Default fallback goes to Medical Affairs
    return {
        "owner": ROUTING_RULES[3]["owner"],
        "deadline_note": ROUTING_RULES[3]["deadline_note"]
    }
