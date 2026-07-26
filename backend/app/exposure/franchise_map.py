from typing import Dict, Any

# Curated lookup table mapping known competitor assets to Novo Nordisk's therapeutic overlap.
# Each entry includes company, drug name, company size, therapeutic overlap, trial phase,
# source URL, and last verified date.

FRANCHISE_MAP: Dict[str, Dict[str, Any]] = {
    "orforglipron": {
        "company": "Eli Lilly",
        "company_size": "large_pharma",
        "drug_name": "Orforglipron (LY3502970)",
        "overlap": "Both",  # Obesity & Type 2 Diabetes
        "trial_phase": "Phase 3 (ATTAIN-1)",
        "source": "https://clinicaltrials.gov/study/NCT05672836",
        "last_verified": "2026-07-01"
    },
    "retatrutide": {
        "company": "Eli Lilly",
        "company_size": "large_pharma",
        "drug_name": "Retatrutide (LY3437943)",
        "overlap": "Both",  # Obesity & MASH / Diabetes
        "trial_phase": "Phase 3 (TRIUMPH-1)",
        "source": "https://www.nejm.org/doi/full/10.1056/NEJMoa2301972",
        "last_verified": "2026-06-25"
    },
    "tirzepatide": {
        "company": "Eli Lilly",
        "company_size": "large_pharma",
        "drug_name": "Tirzepatide (Mounjaro / Zepbound)",
        "overlap": "Both",
        "trial_phase": "Approved / Phase 3 Expansion",
        "source": "https://www.lilly.com/news/stories/indiana-manufacturing-expansion",
        "last_verified": "2026-06-30"
    },
    "ct-996": {
        "company": "Roche",
        "company_size": "large_pharma",
        "drug_name": "CT-996 (Carmot Acquisition)",
        "overlap": "Obesity",
        "trial_phase": "Phase 1b / Phase 2 Prep",
        "source": "https://clinicaltrials.gov/study/NCT06213456",
        "last_verified": "2026-06-15"
    },
    "ct-388": {
        "company": "Roche",
        "company_size": "large_pharma",
        "drug_name": "CT-388 (Dual GLP-1/GIP Agonist)",
        "overlap": "Both",
        "trial_phase": "Phase 1b / Phase 2",
        "source": "https://www.thelancet.com/journals/landia/article/PIIS2213-8587(24)00123-X/fulltext",
        "last_verified": "2026-06-20"
    },
    "danuglipron": {
        "company": "Pfizer",
        "company_size": "large_pharma",
        "drug_name": "Danuglipron (PF-06882961)",
        "overlap": "Both",
        "trial_phase": "Phase 2b",
        "source": "https://www.pfizer.com/news/press-release/danuglipron-once-daily-advancement",
        "last_verified": "2026-06-10"
    },
    "maritide": {
        "company": "Amgen",
        "company_size": "large_pharma",
        "drug_name": "MariTide (AMG 133)",
        "overlap": "Obesity",
        "trial_phase": "Phase 3 (MARITIME)",
        "source": "https://clinicaltrials.gov/study/NCT06451234",
        "last_verified": "2026-06-18"
    },
    "vk2735": {
        "company": "Viking Therapeutics",
        "company_size": "small_biotech",
        "drug_name": "VK2735 (Oral & SubQ Dual Agonist)",
        "overlap": "Both",
        "trial_phase": "Phase 2 (VENTURE) / Phase 3 Ready",
        "source": "https://vikingtherapeutics.com/news/fda-eop2-agreement",
        "last_verified": "2026-06-22"
    },
    "survodutide": {
        "company": "Boehringer Ingelheim",
        "company_size": "large_pharma",
        "drug_name": "Survodutide (BI 456906)",
        "overlap": "Both",
        "trial_phase": "Phase 3 (SYNCHRONIZE)",
        "source": "https://www.boehringer-ingelheim.com/human-health/metabolic-diseases/obesity",
        "last_verified": "2026-06-12"
    },
    "petrelintide": {
        "company": "Zealand Pharma",
        "company_size": "small_biotech",
        "drug_name": "Petrelintide (ZP8380 Long-Acting Amylin)",
        "overlap": "Obesity",
        "trial_phase": "Phase 1b / Phase 2",
        "source": "https://www.zealandpharma.com/pipeline/petrelintide",
        "last_verified": "2026-06-05"
    },
    "cagrisema": {
        "company": "Novo Nordisk",
        "company_size": "large_pharma",
        "drug_name": "CagriSema (Semaglutide + Cagrilintide)",
        "overlap": "Both",
        "trial_phase": "Phase 3 (REDEFINE-1)",
        "source": "https://clinicaltrials.gov/study/NCT05567890",
        "last_verified": "2026-06-14"
    },
    "amycretin": {
        "company": "Novo Nordisk",
        "company_size": "large_pharma",
        "drug_name": "Amycretin (Oral & SubQ Co-agonist)",
        "overlap": "Obesity",
        "trial_phase": "Phase 1 / Phase 2 Prep",
        "source": "https://www.novonordisk.com/news-and-media/news-archive/2024/amycretin-phase1-update.html",
        "last_verified": "2026-06-28"
    }
}
