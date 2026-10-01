# Supplier Selection & Qualification Policy (POL-SUP-002)

**Department:** Quality Assurance & Procurement  
**Effective Date:** 2026-02-15  
**Category:** Supplier Governance  

## 1. Dual-Sourcing Mandate
To mitigate severe supply chain disruptions, all critical active pharmaceutical ingredients (APIs)—including Paracetamol Pure Grade (API-004), Amoxicillin Trihydrate (API-001), and Ciprofloxacin HCl (API-003)—must maintain at least two qualified active suppliers in our supplier registry.

## 2. Supplier Qualification Criteria
A vendor is considered eligible for purchase order issuance only if:
1. Overall reliability rating is at or above 85% (0.85).
2. The vendor holds an active Good Manufacturing Practice (GMP) audit certificate.
3. The specific material relationship is designated as `QUALIFIED` and `is_approved = True` in the master registry.

## 3. Restricted Suppliers & Material Exceptions
- **Supplier B (BioSynth Europe BV - SUP-002):**
  - **Explicit Restriction:** Due to outstanding QA dissolution audit observations, Supplier B is **strictly unapproved** for material `API-004` (Paracetamol Pure Grade). Any attempt to order API-004 from BioSynth Europe must be rejected immediately by automated systems.
  - Supplier B remains approved for Potassium Clavulanate (`API-002`).

- **Supplier A (Apex BioChem GmbH - SUP-001):**
  - Primary qualified partner for `API-004` with a standard contractual lead time of 5 business days and 96% reliability score.

- **Supplier D (MedChem Solutions SpA - SUP-004):**
  - Secondary qualified emergency backup for `API-004` with a lead time of 6 business days and 89% reliability score.
