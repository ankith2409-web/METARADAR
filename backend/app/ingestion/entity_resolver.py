import re
from typing import Dict, List, Tuple

COMPANY_ALIASES: Dict[str, List[str]] = {
    "Eli Lilly": ["eli lilly", "lilly", "lly", "lilly & co"],
    "Roche": ["roche", "carmot", "genentech", "roche holding"],
    "Pfizer": ["pfizer", "pfe"],
    "Amgen": ["amgen", "amgn"],
    "Viking Therapeutics": ["viking therapeutics", "viking", "vktx"],
    "Structure Therapeutics": ["structure therapeutics", "structure tx"],
    "Zealand Pharma": ["zealand pharma", "zealand"],
    "Boehringer Ingelheim": ["boehringer ingelheim", "boehringer"],
    "Novo Nordisk": ["novo nordisk", "novo", "nvo"]
}

DRUG_ALIASES: Dict[str, List[str]] = {
    "Orforglipron": ["orforglipron", "ly3502970", "lilly oral glp-1"],
    "Retatrutide": ["retatrutide", "ly3437943", "gip/glp-1/glucagon triple agonist"],
    "Tirzepatide": ["tirzepatide", "mounjaro", "zepbound", "ly3298176"],
    "CT-996": ["ct-996", "ct996", "roche oral glp-1"],
    "CT-388": ["ct-388", "ct388", "roche dual agonist"],
    "Danuglipron": ["danuglipron", "pf-06882961", "pfizer oral glp-1"],
    "MariTide": ["maritide", "amg 133", "amg133", "amgen bispecific"],
    "VK2735": ["vk2735", "viking dual agonist", "viking oral glp-1"],
    "Survodutide": ["survodutide", "bi 456906"],
    "Petrelintide": ["petrelintide", "zp8380"],
    "CagriSema": ["cagrisema", "cagrilintide/semaglutide"],
    "Amycretin": ["amycretin", "unimolecular dual amylin/glp-1"],
    "Semaglutide": ["semaglutide", "ozempic", "wegovy", "rybelsus", "nn9535"]
}


DRUG_TO_COMPANY: Dict[str, str] = {
    "Orforglipron": "Eli Lilly",
    "Retatrutide": "Eli Lilly",
    "Tirzepatide": "Eli Lilly",
    "CT-996": "Roche",
    "CT-388": "Roche",
    "Danuglipron": "Pfizer",
    "MariTide": "Amgen",
    "VK2735": "Viking Therapeutics",
    "Survodutide": "Boehringer Ingelheim",
    "Petrelintide": "Zealand Pharma",
    "CagriSema": "Novo Nordisk",
    "Amycretin": "Novo Nordisk",
    "Semaglutide": "Novo Nordisk"
}


class EntityResolver:
    @staticmethod
    def resolve_company(text: str) -> str:
        text_lower = text.lower()
        for canonical, aliases in COMPANY_ALIASES.items():
            for alias in aliases:
                if len(alias) <= 3:
                    if re.search(r'\b' + re.escape(alias) + r'\b', text_lower):
                        return canonical
                elif alias in text_lower:
                    return canonical
        
        # Infer company from drug asset if present
        for canonical_drug, aliases in DRUG_ALIASES.items():
            for alias in aliases:
                if alias in text_lower:
                    if canonical_drug in DRUG_TO_COMPANY:
                        return DRUG_TO_COMPANY[canonical_drug]

        return "Other Pharma"

    @staticmethod
    def resolve_drugs(text: str) -> List[str]:
        text_lower = text.lower()
        found_drugs = []
        for canonical, aliases in DRUG_ALIASES.items():
            for alias in aliases:
                if alias in text_lower:
                    found_drugs.append(canonical)
                    break
        return found_drugs if found_drugs else ["GLP-1 Class"]

    @staticmethod
    def normalize_signal_entities(text: str) -> Tuple[str, List[str]]:
        drugs = EntityResolver.resolve_drugs(text)
        company = EntityResolver.resolve_company(text)
        return company, drugs

