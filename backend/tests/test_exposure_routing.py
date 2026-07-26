import pytest
from app.exposure.engine import ExposureRoutingEngine
from app.exposure.exposure_reference import compute_exposure_bucket, PEAK_ESTIMATE_REFERENCE
from app.exposure.routing_rules import determine_routing


def test_exposure_bucket_calculation_known_asset():
    # Asset with cited peak sales estimate (e.g. retatrutide)
    bucket, methodology, range_str, citation = compute_exposure_bucket(
        event_type="positive_phase3_readout",
        overlap="Both",
        asset_key="retatrutide"
    )
    assert bucket == "High"
    assert "Positive Phase3 Readout" in methodology
    assert range_str == "$5.0B – $10.0B (Peak Sales)"

    assert "Goldman Sachs" in citation


def test_exposure_bucket_calculation_uncited_asset():
    # Asset without cited estimate (e.g. random biotech asset)
    bucket, methodology, range_str, citation = compute_exposure_bucket(
        event_type="phase_transition",
        overlap="Obesity",
        asset_key="unknown_biotech_drug"
    )
    assert bucket in ["Low", "Medium", "High"]
    assert "Not available" in range_str
    assert citation is None
    # STRICT GUARDRAIL: No dollar figure allowed if uncited!
    assert "$" not in range_str


def test_dollar_figure_guardrail_rule():
    """
    STRICT GUARDRAIL UNIT TEST:
    Asserts that no exposure response ever contains a dollar sign ($)
    unless PEAK_ESTIMATE_REFERENCE contains a cited entry for that asset.
    """
    test_assets = ["unknown_drug_123", "random_molecule", "ct-996", "survodutide"]
    for asset in test_assets:
        if asset not in PEAK_ESTIMATE_REFERENCE:
            _, _, range_str, _ = compute_exposure_bucket("positive_phase3_readout", "Both", asset)
            assert "$" not in range_str, f"Guardrail Failure: Dollar sign found for uncited asset {asset}: {range_str}"


def test_routing_rules_execution():
    # Pricing event -> Market Access
    r1 = determine_routing("pricing_or_reimbursement_signal", "Both", "High")
    assert r1["owner"] == "Market Access"
    assert "pricing" in r1["deadline_note"].lower()

    # Multi-franchise High -> Commercial Strategy
    r2 = determine_routing("positive_phase3_readout", "Both", "High")
    assert r2["owner"] == "Commercial Strategy"
    assert "quarterly strategy" in r2["deadline_note"].lower()

    # Small Biotech -> BD&L
    r3 = determine_routing("routine_status_update", "Obesity", "Low", company_size="small_biotech")
    assert r3["owner"] == "BD&L (Business Development & Licensing)"
    assert "acquisition" in r3["deadline_note"].lower()

    # Default -> Medical Affairs
    r4 = determine_routing("routine_status_update", "Adjacent/Other", "Low", company_size="large_pharma")
    assert r4["owner"] == "Medical Affairs"
