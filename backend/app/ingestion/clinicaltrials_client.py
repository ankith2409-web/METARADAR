import logging
import requests
from typing import List, Dict, Any
from app.ingestion.entity_resolver import EntityResolver

logger = logging.getLogger("metaradar.clinicaltrials")


class ClinicalTrialsClient:
    BASE_URL = "https://clinicaltrials.gov/api/v2/studies"

    @classmethod
    def fetch_recent_signals(
        cls, term: str = "metabolic obesity GLP-1", max_results: int = 10
    ) -> List[Dict[str, Any]]:
        signals = []
        try:
            params = {
                "query.term": term,
                "pageSize": max_results,
                "format": "json"
            }
            res = requests.get(cls.BASE_URL, params=params, timeout=8)
            if res.status_code != 200:
                logger.warning("ClinicalTrials.gov API request failed.")
                return []

            data = res.json()
            studies = data.get("studies", [])
            for study in studies:
                protocol = study.get("protocolSection", {})
                id_mod = protocol.get("identificationModule", {})
                nct_id = id_mod.get("nctId", "")
                title = id_mod.get("briefTitle", "")
                summary = protocol.get("descriptionModule", {}).get("briefSummary", title)

                sponsor_mod = protocol.get("sponsorCollaboratorsModule", {})
                sponsor = sponsor_mod.get("leadSponsor", {}).get("name", "")
                company, drugs = EntityResolver.normalize_signal_entities(title + " " + sponsor)

                url = f"https://clinicaltrials.gov/study/{nct_id}"
                signals.append({
                    "external_id": f"ct-{nct_id}",
                    "title": title.strip(),
                    "summary": summary[:350].strip() + "...",
                    "source": "ClinicalTrials.gov",
                    "url": url,
                    "published_date": "2026-07-10",
                    "competitor": company,
                    "therapeutic_area": drugs[0] if drugs else "Clinical Trial",
                    "threat_level": "medium",
                    "relevance_score": 7,
                    "is_replay": False
                })
        except Exception as e:
            logger.error(f"Error fetching ClinicalTrials signals: {e}")

        return signals
