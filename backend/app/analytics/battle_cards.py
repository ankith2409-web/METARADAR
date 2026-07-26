import json
import logging
from typing import List, Dict, Any
from sqlalchemy.orm import Session
from app.database import BattleCardModel, SignalModel

logger = logging.getLogger("metaradar.battlecards")


class BattleCardService:
    @classmethod
    def initialize_battle_cards(cls, db: Session) -> List[BattleCardModel]:
        # Predefined profile templates
        predefined_profiles: Dict[str, Dict[str, Any]] = {
            "Eli Lilly": {
                "canonical_name": "Eli Lilly and Company",
                "lead_asset": "Orforglipron (LY3502970) & Retatrutide (LY3437943)",
                "mechanism": "Non-peptide Oral GLP-1 & Triple GIP/GLP-1/Glucagon Agonist",
                "pipeline_stage": "Phase 3 (ATTAIN & TRIUMPH Programs)",
                "threat_assessment": "CRITICAL",
                "market_position": "Dominant market competitor aggressively expanding oral and triple agonist franchises."
            },
            "Roche": {
                "canonical_name": "F. Hoffmann-La Roche AG",
                "lead_asset": "CT-996 & CT-388",
                "mechanism": "Oral Small Molecule GLP-1 & Weekly Dual GIP/GLP-1 Agonist",
                "pipeline_stage": "Phase 1b / Phase 2a (Post-Carmot Acquisition)",
                "threat_assessment": "HIGH",
                "market_position": "Fast-moving challenger converting Carmot acquisition assets into high-threat clinical programs."
            },
            "Amgen": {
                "canonical_name": "Amgen Inc.",
                "lead_asset": "MariTide (AMG 133)",
                "mechanism": "GIPR Antibody Antagonist / GLP-1 Peptide Conjugate",
                "pipeline_stage": "Phase 3 (MARITIME Program)",
                "threat_assessment": "HIGH",
                "market_position": "Differentiated long-acting biologic challenger reshaping patient administration preferences."
            },
            "Viking Therapeutics": {
                "canonical_name": "Viking Therapeutics, Inc.",
                "lead_asset": "VK2735 (Oral & Subcutaneous)",
                "mechanism": "Dual GLP-1 / GIP Receptor Agonist",
                "pipeline_stage": "Phase 2 / Phase 3 End-of-Phase 2 Alignment",
                "threat_assessment": "HIGH",
                "market_position": "High-potency clinical biotech with potential big pharma acquisition backing."
            },
            "Pfizer": {
                "canonical_name": "Pfizer Inc.",
                "lead_asset": "Danuglipron (PF-06882961)",
                "mechanism": "Once-Daily Modified-Release Small Molecule Oral GLP-1",
                "pipeline_stage": "Phase 2b",
                "threat_assessment": "MEDIUM",
                "market_position": "Re-emerging oral contender optimizing formulation safety before Phase 3 commitment."
            },
            "Novo Nordisk": {
                "canonical_name": "Novo Nordisk A/S",
                "lead_asset": "CagriSema & Oral Amycretin",
                "mechanism": "Fixed-Dose Amylin/GLP-1 Combination & Oral Dual Amylin/GLP-1",
                "pipeline_stage": "Phase 3 (REDEFINE Program) / Phase 1b",
                "threat_assessment": "BASELINE (HOST)",
                "market_position": "Global market leader setting the standard for combination and next-gen oral incretin therapeutics."
            }
        }

        # Clear existing cards to update dynamically
        db.query(BattleCardModel).delete()
        db.commit()

        # Query all signals grouped by competitor
        competitors = [c[0] for c in db.query(SignalModel.competitor).distinct().all() if c[0]]
        if not competitors:
            competitors = list(predefined_profiles.keys())

        results = []
        for comp in competitors:
            profile = predefined_profiles.get(comp, {
                "canonical_name": f"{comp} Corp",
                "lead_asset": "Pipeline Asset",
                "mechanism": "Metabolic Receptor Agonist",
                "pipeline_stage": "Clinical Development",
                "threat_assessment": "MEDIUM",
                "market_position": f"Active competitor in metabolic pipeline space."
            })

            # Fetch signals for competitor
            comp_sigs = db.query(SignalModel).filter(SignalModel.competitor == comp).all()
            
            recent_moves = []
            key_threats = []

            for s in comp_sigs:
                recent_moves.append(s.title)
                if s.threat_level == "high" or s.relevance_score >= 8:
                    if s.rationale:
                        key_threats.append(s.rationale)

            if not recent_moves:
                recent_moves = [
                    f"Ongoing clinical trials for {profile['lead_asset']}",
                    f"Monitored development in {profile['pipeline_stage']}"
                ]
            if not key_threats:
                key_threats = [
                    f"Pipeline expansion risk with {profile['lead_asset']}",
                    f"Commercial disruption in metabolic therapeutic area"
                ]

            card = BattleCardModel(
                competitor=comp,
                canonical_name=profile["canonical_name"],
                lead_asset=profile["lead_asset"],
                mechanism=profile["mechanism"],
                pipeline_stage=profile["pipeline_stage"],
                threat_assessment=profile["threat_assessment"],
                recent_moves_json=json.dumps(recent_moves[:5]),
                key_threats_json=json.dumps(key_threats[:5]),
                market_position=profile["market_position"]
            )
            db.add(card)
            db.commit()
            db.refresh(card)
            results.append(card)

        return results

