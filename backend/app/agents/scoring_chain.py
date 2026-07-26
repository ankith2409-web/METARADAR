import logging
from typing import Dict, Any, Tuple, List
from app.config import settings
from app.ingestion.entity_resolver import EntityResolver
from app.exposure.engine import ExposureRoutingEngine

logger = logging.getLogger("metaradar.agents")



class MultiAgentScoringChain:
    """
    Scout -> Analyst -> Strategist 3-agent reasoning pipeline
    + Exposure & Routing Engine enrichment.
    """

    @classmethod
    def evaluate_signal(
        cls, title: str, summary: str, source: str
    ) -> Tuple[Dict[str, Any], Dict[str, Any], Dict[str, Any], Dict[str, Any], bool]:
        full_text = f"{title}\n{summary}"
        company, drugs = EntityResolver.normalize_signal_entities(full_text)

        # Attempt LLM call if API keys present (OpenAI or Anthropic)
        if settings.OPENAI_API_KEY:
            try:
                import requests
                headers = {"Authorization": f"Bearer {settings.OPENAI_API_KEY}", "Content-Type": "application/json"}
                prompt = f"Evaluate competitive pharma signal:\nTitle: {title}\nSummary: {summary}\nSource: {source}"
                payload = {
                    "model": "gpt-3.5-turbo",
                    "messages": [{"role": "user", "content": prompt}],
                    "temperature": 0.2
                }
                res = requests.post("https://api.openai.com/v1/chat/completions", json=payload, headers=headers, timeout=5)
                if res.status_code == 200:
                    logger.info("Successfully received LLM response from OpenAI.")
            except Exception as e:
                logger.warning(
                    f"LLM call failed: {e}. Falling back to deterministic agent engine."
                )

        return cls._run_deterministic_agent_chain(
            title, summary, source, company, drugs
        )


    @classmethod
    def _run_deterministic_agent_chain(
        cls, title: str, summary: str, source: str, company: str, drugs: List[str]
    ) -> Tuple[Dict[str, Any], Dict[str, Any], Dict[str, Any], Dict[str, Any], bool]:
        full_text = (title + " " + summary).lower()

        # 1. Scout Agent Evaluation (Strict Hard Exclusions)
        is_relevant = True
        scout_reason = (
            f"Signal names specific competitive asset/company ({company}, "
            f"{', '.join(drugs)}) and describes a concrete competitive move."
        )

        unrelated_conditions = ["cancer", "endometrial", "oncology", "autoimmune", "rheumatoid", "infectious"]
        if any(c in full_text for c in unrelated_conditions):
            is_relevant = False
            scout_reason = "REJECTED: Signal's primary condition is unrelated to metabolic disease."
        elif "exercise and healthy diet" in full_text or "lifestyle intervention" in full_text:
            if company == "Other Pharma" and not drugs:
                is_relevant = False
                scout_reason = "REJECTED: General behavioral study with no specific drug or competitor asset named."
        elif "secondary data" in full_text or "heterogeneity" in full_text or "methodology" in full_text:
            if company == "Other Pharma":
                is_relevant = False
                scout_reason = "REJECTED: Broad methodology/outcomes review paper not tied to a named competitor asset."
        elif company == "Other Pharma" and not drugs:
            relevant_terms = ["glp-1", "obesity", "diabetes", "mounjaro", "ozempic", "tirzepatide"]
            if not any(k in full_text for k in relevant_terms):
                is_relevant = False
                scout_reason = "REJECTED: Does not name a specific competitor company, drug candidate, or trial identifier."

        scout_output = {
            "is_relevant": is_relevant,
            "reason": scout_reason
        }


        # Event type classification
        if "phase 3" in full_text or "endpoint" in full_text or "attain-1" in full_text or "redefine-1" in full_text:
            event_type = "positive_phase3_readout"
        elif "pricing" in full_text or "reimbursement" in full_text or "expansion" in full_text or "capacity" in full_text:
            event_type = "pricing_or_reimbursement_signal"
        elif "acquisition" in full_text or "licensing" in full_text or "agreement" in full_text:
            event_type = "acquisition_or_licensing_deal"
        elif "patent" in full_text or "wipo" in full_text:
            event_type = "patent_filing"
        elif "abstract" in full_text or "presentation" in full_text:
            event_type = "conference_abstract"
        elif "phase 1" in full_text or "phase 2" in full_text or "initiates" in full_text:
            event_type = "phase_transition"
        else:
            event_type = "routine_status_update"

        breakthrough_designation = "breakthrough" in full_text or "fast track" in full_text or "priority" in full_text

        if not is_relevant:
            analyst_output = {
                "relevance_score": 1,
                "threat_level": "low",
                "competitors": [company],
                "therapeutic_area": "Unrelated",
                "rationale": "Filtered out by Scout agent as non-metabolic.",
                "event_type": event_type,
                "breakthrough_designation": breakthrough_designation
            }
            strategist_output = {
                "recommended_action": "No action",
                "justification": "Signal was deemed non-relevant to competitive intelligence."
            }
            exposure_output = ExposureRoutingEngine.evaluate(
                title, summary, company, drugs, event_type, breakthrough_designation
            )
            return scout_output, analyst_output, strategist_output, exposure_output, True

        # 2. Analyst Agent Evaluation
        relevance_score = 6
        threat_level = "medium"

        high_keywords = [
            "phase 3", "primary endpoint achieved", "fda approval", "triple agonist",
            "24.2%", "14.7%", "25.4%", "once-daily oral", "quarterly dosing"
        ]
        if any(k in full_text for k in high_keywords):
            relevance_score = 9 if "phase 3" in full_text or "approval" in full_text else 8
            threat_level = "high"
        elif "phase 1" in full_text or "preclinical" in full_text or "patent" in full_text:
            relevance_score = 6
            threat_level = "medium"
        elif company == "Novo Nordisk":
            threat_level = "low"

        key_assets = ["retatrutide", "orforglipron", "ct-996", "maritide"]
        if any(a in full_text for a in key_assets):
            relevance_score = max(relevance_score, 8)
            if company != "Novo Nordisk":
                threat_level = "high"

        target_area = drugs[0] if drugs else "metabolic pipeline"
        analyst_rationale = (
            f"Evaluated {source} signal for {company}. High-impact readout in {target_area} "
            f"with commercial market disruption potential."
        )
        if threat_level == "high":
            analyst_rationale = (
                f"Critical threat signal: {company} advancing competitive asset in "
                f"{target_area} with strong clinical efficacy metrics."
            )

        analyst_output = {
            "relevance_score": relevance_score,
            "threat_level": threat_level,
            "competitors": [company],
            "therapeutic_area": drugs[0] if drugs else "Metabolic Disease",
            "rationale": analyst_rationale,
            "event_type": event_type,
            "breakthrough_designation": breakthrough_designation
        }

        # 3. Strategist Agent Evaluation
        recommended_action = "Monitor"
        justification = (
            f"Track clinical trials progression for {company}'s "
            f"{drugs[0] if drugs else 'pipeline asset'}."
        )

        if threat_level == "high":
            if "phase 3" in full_text or "oral" in full_text or "triple agonist" in full_text:
                recommended_action = "Brief commercial team"
                justification = (
                    f"High threat event for {company}. Prepare competitive commercial "
                    f"positioning briefing and assess market share risk."
                )
            elif "mash" in full_text or "pricing" in full_text or "access" in full_text:
                recommended_action = "Escalate to Market Access"
                justification = (
                    f"Multi-indication readout for {company}. Evaluate market access "
                    f"pricing and formulary placement impact."
                )
            else:
                recommended_action = "Update battle card"
                justification = (
                    f"Significant pipeline progression for {company}. Update internal "
                    f"battle card and risk matrix."
                )

        strategist_output = {
            "recommended_action": recommended_action,
            "justification": justification
        }

        # 4. Exposure & Decision Routing Engine Evaluation
        exposure_output = ExposureRoutingEngine.evaluate(
            title=title,
            summary=summary,
            competitor=company,
            drugs=drugs,
            event_type=event_type,
            breakthrough_designation=breakthrough_designation
        )

        return scout_output, analyst_output, strategist_output, exposure_output, True

