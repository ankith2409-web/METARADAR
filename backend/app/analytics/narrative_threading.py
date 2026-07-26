import json
import logging
from typing import List, Dict
from sqlalchemy.orm import Session
from app.database import NarrativeThreadModel, SignalModel

try:
    from sentence_transformers import SentenceTransformer
    from sklearn.metrics.pairwise import cosine_similarity
    _HAS_ST = True
    _ST_MODEL = SentenceTransformer("all-MiniLM-L6-v2")
except Exception:
    _HAS_ST = False
    _ST_MODEL = None

logger = logging.getLogger("metaradar.narratives")


class NarrativeThreadingService:
    @classmethod
    def generate_threads(cls, db: Session) -> List[NarrativeThreadModel]:
        signals = db.query(SignalModel).all()
        if not signals:
            return []

        # Delete existing threads to dynamically recalculate
        db.query(NarrativeThreadModel).delete()
        db.commit()

        # Group signals by competitor
        comp_signals: Dict[str, List[SignalModel]] = {}
        for s in signals:
            comp_signals.setdefault(s.competitor, []).append(s)

        created_threads: List[NarrativeThreadModel] = []

        for competitor, c_signals in comp_signals.items():
            if not c_signals:
                continue

            texts = [f"{s.title}. {s.summary}" for s in c_signals]

            if _HAS_ST and _ST_MODEL is not None and len(texts) > 1:
                try:
                    embeddings = _ST_MODEL.encode(texts)
                    sim_matrix = cosine_similarity(embeddings)

                    visited = set()
                    clusters = []
                    threshold = 0.30

                    for i in range(len(c_signals)):
                        if i in visited:
                            continue
                        cluster = [i]
                        visited.add(i)
                        for j in range(i + 1, len(c_signals)):
                            if j not in visited and sim_matrix[i][j] >= threshold:
                                cluster.append(j)
                                visited.add(j)
                        clusters.append(cluster)
                except Exception as err:
                    logger.warning(f"SentenceTransformer clustering failed: {err}. Falling back to default grouping.")
                    clusters = [list(range(len(c_signals)))]
            else:
                clusters = [list(range(len(c_signals)))]

            for cluster_indices in clusters:
                cluster_sigs = [c_signals[i] for i in cluster_indices]
                sig_ids = [s.id for s in cluster_sigs]

                lead_sig = max(cluster_sigs, key=lambda x: x.relevance_score or 0)
                title = f"{competitor}: {lead_sig.title}"
                if len(title) > 250:
                    title = title[:247] + "..."

                summaries = [s.summary for s in cluster_sigs]
                narrative_summary = " ".join(summaries)

                thread = NarrativeThreadModel(
                    competitor=competitor,
                    title=title,
                    narrative_summary=narrative_summary,
                    signal_ids_json=json.dumps(sig_ids),
                    signal_count=len(sig_ids),
                    time_window_days=30
                )
                db.add(thread)
                db.commit()
                db.refresh(thread)
                created_threads.append(thread)

        return created_threads

