import logging
from typing import List, Dict, Any
from app.ingestion.entity_resolver import EntityResolver

try:
    import feedparser
    _HAS_FEEDPARSER = True
except ImportError:
    _HAS_FEEDPARSER = False

logger = logging.getLogger("metaradar.rss")


class RSSClient:
    FEEDS = [
        "https://www.fiercepharma.com/rss/feed",
        "https://www.biospace.com/rss/news"
    ]

    @classmethod
    def fetch_recent_signals(cls, max_results: int = 5) -> List[Dict[str, Any]]:
        signals = []
        if not _HAS_FEEDPARSER:
            return signals

        for feed_url in cls.FEEDS:
            try:
                parsed = feedparser.parse(feed_url)
                for entry in parsed.entries[:max_results]:
                    title = entry.get("title", "")
                    summary = entry.get("summary", title)
                    link = entry.get("link", "")

                    company, drugs = EntityResolver.normalize_signal_entities(
                        title + " " + summary
                    )
                    is_relevant_keyword = any(
                        d in title.lower()
                        for d in ["glp-1", "obesity", "diabetes", "mounjaro", "ozempic"]
                    )
                    if company != "Other Pharma" or is_relevant_keyword:
                        signals.append({
                            "external_id": f"rss-{hash(link)}",
                            "title": title.strip(),
                            "summary": summary[:350].strip() + "...",
                            "source": "Pharma News RSS",
                            "url": link,
                            "published_date": "2026-07-15",
                            "competitor": company,
                            "therapeutic_area": drugs[0] if drugs else "Pharma News",
                            "threat_level": "medium",
                            "relevance_score": 6,
                            "is_replay": False
                        })
            except Exception as e:
                logger.error(f"Error parsing RSS feed {feed_url}: {e}")

        return signals
