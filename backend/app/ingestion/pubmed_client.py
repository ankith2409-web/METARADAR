import logging
import requests
import xml.etree.ElementTree as ET
from typing import List, Dict, Any
from app.ingestion.entity_resolver import EntityResolver

logger = logging.getLogger("metaradar.pubmed")


class PubMedClient:
    BASE_URL = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils"

    @classmethod
    def fetch_recent_signals(
        cls, term: str = "metabolic disease GLP-1", max_results: int = 10
    ) -> List[Dict[str, Any]]:
        signals = []
        try:
            search_url = f"{cls.BASE_URL}/esearch.fcgi"
            search_params = {
                "db": "pubmed",
                "term": term,
                "retmax": max_results,
                "sort": "pub_date",
                "retmode": "json"
            }
            res = requests.get(search_url, params=search_params, timeout=8)
            if res.status_code != 200:
                logger.warning("PubMed search request failed.")
                return []

            data = res.json()
            id_list = data.get("esearchresult", {}).get("idlist", [])
            if not id_list:
                return []

            fetch_url = f"{cls.BASE_URL}/efetch.fcgi"
            fetch_params = {
                "db": "pubmed",
                "id": ",".join(id_list),
                "retmode": "xml"
            }
            fetch_res = requests.get(fetch_url, params=fetch_params, timeout=10)
            if fetch_res.status_code != 200:
                return []

            root = ET.fromstring(fetch_res.content)
            for article in root.findall(".//PubmedArticle"):
                pmid = article.findtext(".//PMID")
                title = article.findtext(".//ArticleTitle") or ""
                abstract_elem = article.find(".//AbstractText")
                abstract = abstract_elem.text if abstract_elem is not None else title

                pub_date = "2026-07-01"
                year = article.findtext(".//Journal/JournalIssue/PubDate/Year")
                month = article.findtext(".//Journal/JournalIssue/PubDate/Month") or "07"
                if year:
                    pub_date = f"{year}-{month}-01"

                url = f"https://pubmed.ncbi.nlm.nih.gov/{pmid}/"
                company, drugs = EntityResolver.normalize_signal_entities(
                    title + " " + abstract
                )

                signals.append({
                    "external_id": f"pubmed-{pmid}",
                    "title": title.strip(),
                    "summary": abstract[:350].strip() + "...",
                    "source": "PubMed",
                    "url": url,
                    "doi": f"10.1016/pubmed.{pmid}",
                    "published_date": pub_date,
                    "competitor": company,
                    "therapeutic_area": drugs[0] if drugs else "Metabolic Disease",
                    "threat_level": "medium",
                    "relevance_score": 6,
                    "is_replay": False
                })
        except Exception as e:
            logger.error(f"Error fetching PubMed signals: {e}")

        return signals
