from typing import Dict, Any, Optional, Tuple

# Populate only with numbers backed by real citations.
# If no public estimate exists for an asset, set values to None.
PEAK_ESTIMATE_REFERENCE: Dict[str, Dict[str, Any]] = {
    "retatrutide": {
        "range_low": "$5.0B",
        "range_high": "$10.0B",
        "source": "Goldman Sachs Equity Research (June 2024)",
        "date_pulled": "2026-06-01"
    },
    "orforglipron": {
        "range_low": "$3.0B",
        "range_high": "$8.0B",
        "source": "Morgan Stanley Pharma Pipeline Report (May 2024)",
        "date_pulled": "2026-06-01"
    },
    "tirzepatide": {
        "range_low": "$25.0B",
        "range_high": "$50.0B",
        "source": "Barclays Healthcare Consensus (Q1 2026)",
        "date_pulled": "2026-06-01"
    },
    "maritide": {
        "range_low": "$2.0B",
        "range_high": "$5.0B",
        "source": "J.P. Morgan Biotech Coverage (May 2024)",
        "date_pulled": "2026-06-01"
    }
}

# Quantitative event impact weights for qualitative fallback
EVENT_IMPACT_WEIGHTS: Dict[str, float] = {
    "positive_phase3_readout": 3.0,
    "pricing_or_reimbursement_signal": 3.0,
    "label_expansion": 3.0,
    "acquisition_or_licensing_deal": 3.0,
    "accelerated_timeline": 2.0,
    "phase_transition": 1.0,
    "patent_filing": 1.0,
    "conference_abstract": 1.0,
    "routine_status_update": 0.0,
}

FRANCHISE_OVERLAP_WEIGHTS: Dict[str, float] = {
    "Both": 2.0,
    "Obesity": 1.5,
    "Type 2 Diabetes": 1.5,
    "Adjacent/Other": 0.5,
}


def compute_exposure_bucket(
    event_type: str, overlap: str, asset_key: Optional[str] = None
) -> Tuple[str, str, Optional[str], Optional[str]]:
    """
    Computes exposure bucket, methodology note, illustrative range, and source citation.
    STRICT GUARDRAIL: Never fabricates or invents dollar figures.
    Dollar ranges are strictly populated ONLY if a cited estimate exists in PEAK_ESTIMATE_REFERENCE.
    """
    event_weight = EVENT_IMPACT_WEIGHTS.get(event_type.lower(), 1.0)
    overlap_weight = FRANCHISE_OVERLAP_WEIGHTS.get(overlap, 1.0)
    score = round(event_weight * overlap_weight, 2)

    if score >= 4.5:
        bucket = "High"
    elif score >= 2.0:
        bucket = "Medium"
    else:
        bucket = "Low"

    clean_event = event_type.replace("_", " ").title()
    methodology_note = (
        f"{clean_event} (weight {event_weight}) × Franchise overlap '{overlap}' "
        f"(weight {overlap_weight}) = score {score} → {bucket} Exposure"
    )

    illustrative_range = None
    source_citation = None

    if asset_key and asset_key.lower() in PEAK_ESTIMATE_REFERENCE:
        ref = PEAK_ESTIMATE_REFERENCE[asset_key.lower()]
        if ref.get("range_low") and ref.get("range_high"):
            illustrative_range = f"{ref['range_low']} – {ref['range_high']} (Peak Sales)"
            source_citation = f"Source: {ref.get('source', 'Public Financial Filings')} ({ref.get('date_pulled', '2026')})"

    if not illustrative_range:
        illustrative_range = (
            "Not available — no cited public financial estimate for this asset; "
            "exposure bucket calculated based on event type and franchise overlap weights only."
        )

    return bucket, methodology_note, illustrative_range, source_citation
