# SupplyPilot — RAG Knowledge Base & Policy Governance

## 1. Overview & Architectural Boundaries

In SupplyPilot, RAG is strictly segregated from transactional business records:
- **Transactional State:** Inventory quantities, batch schedules, customer orders, and supplier costs belong to **PostgreSQL**.
- **Contextual Knowledge & Policies:** SOPs, financial thresholds, supplier agreements, and compliance standards belong to the **Qdrant Vector Store / Policy Knowledge Base**.

The agent is instructed never to hallucinate inventory or operational facts, and never to assert corporate policies without citing retrieved knowledge documents.

---

## 2. Document Catalog

Located in `data/knowledge_base/`:
1. `purchase_approval_policy.md` (`POL-PROC-001`): Establishes spending tiers (< €5k auto-eligible, €5k–€25k Procurement Officer, > €25k Operations Manager) and override invariants.
2. `supplier_selection_policy.md` (`POL-SUP-002`): Mandates dual-sourcing for critical APIs and explicitly documents the qualification restriction for Supplier B on `API-004`.
3. `production_scheduling_policy.md` (`POL-PROD-003`): Details the 24-hour schedule freeze window and line capacity rules.
4. `customer_communication_policy.md` (`SOP-COMM-004`): Dictates 48-hour delay notification triggers and mandatory human review before dispatch.
5. `inventory_policy.md` (`POL-INV-005`): Defines physical safety stock formulas and formal definitions of Available vs On-Hand inventory.

---

## 3. Chunking & Citation Pipeline

Documents are chunked by logical sections (`## `) to preserve procedural coherence. Each chunk retains metadata:
- `document_title`
- `section_name`
- `category`
- `citation`: Formatted as `Document Title — Section: Section Name`

When the agent presents an evidence-backed recommendation, the citation is displayed directly in the user interface evidence cards.
