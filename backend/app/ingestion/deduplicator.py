import difflib
from typing import List, Set

try:
    from sentence_transformers import SentenceTransformer, util
    _HAS_ST = True
    _ST_MODEL = SentenceTransformer("all-MiniLM-L6-v2")
except Exception:
    _HAS_ST = False
    _ST_MODEL = None


class Deduplicator:
    def __init__(self, similarity_threshold: float = 0.92):
        self.similarity_threshold = similarity_threshold
        self.seen_urls: Set[str] = set()
        self.seen_dois: Set[str] = set()
        self.seen_titles: List[str] = []

    def is_exact_duplicate(self, url: str = None, doi: str = None) -> bool:
        if url and url in self.seen_urls:
            return True
        if doi and doi in self.seen_dois:
            return True
        return False

    def is_near_duplicate(self, title: str) -> bool:
        if not title:
            return False

        title_clean = title.strip().lower()
        if not self.seen_titles:
            return False

        if _HAS_ST and _ST_MODEL:
            try:
                title_emb = _ST_MODEL.encode(title_clean, convert_to_tensor=True)
                seen_embs = _ST_MODEL.encode(self.seen_titles, convert_to_tensor=True)
                scores = util.cos_sim(title_emb, seen_embs)[0]
                max_score = float(scores.max().item())
                if max_score >= self.similarity_threshold:
                    return True
            except Exception:
                pass

        # Fallback to SequenceMatcher similarity
        for existing in self.seen_titles:
            ratio = difflib.SequenceMatcher(None, title_clean, existing).ratio()
            if ratio >= self.similarity_threshold:
                return True

        return False

    def register(self, title: str, url: str = None, doi: str = None):
        if url:
            self.seen_urls.add(url)
        if doi:
            self.seen_dois.add(doi)
        if title:
            self.seen_titles.append(title.strip().lower())
