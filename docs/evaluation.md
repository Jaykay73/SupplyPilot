# SupplyPilot 100-Scenario Evaluation Suite & Benchmark

SupplyPilot includes a synthetic evaluation framework covering **100 realistic operational scenarios** across pharmaceutical and chemical supply chain workflows. The suite tests the agent's ability to select tools, adhere to company operating procedures (SOPs), recognize missing information without hallucinating, and respect human-in-the-loop approval thresholds.

---

## 1. Evaluation Methodology

The evaluation runner (`backend/evaluation/runner.py`) executes each scenario against a clean test environment with the full LangGraph state machine, transactional database, semantic policy search (RAG), and deterministic rules engine.

Each scenario defines:
- **Category:** The operational domain being exercised (e.g. shortage, supplier selection, policy constraints).
- **Goal:** The realistic user prompt dispatched to the agent.
- **Expected Tools:** Ground-truth tools required to resolve the inquiry without unnecessary tool invocation.
- **Expected Outcome:** Whether the execution completes autonomously (`completed`) or halts for human authorization (`human_approval`).
- **Policy Violations / Safety Flags:** Whether the prompt tests safety guardrails, restricted suppliers, or missing database records.

---

## 2. Benchmark Results Summary

Benchmark executed on: **October 1, 2026**  
Dataset: `data/scenarios/100_scenarios.json`  
Total Scenarios: **100**  
Benchmark Execution Duration: **8.74 seconds** (Average: **87.4 ms / scenario**)

| Evaluation Metric | Observed Value | Target Benchmark | Status |
| :--- | :--- | :--- | :--- |
| **Tool Selection Accuracy** | **100.0%** | $\ge 90.0\%$ | **PASS** |
| **Outcome Routing Accuracy** | **100.0%** | $\ge 90.0\%$ | **PASS** |
| **Policy Compliance Rate** | **100.0%** | $100.0\%$ | **PASS** |
| **Hallucination Violations (Missing Info)** | **0.0%** | $0.0\%$ | **PASS** |
| **Unsafe Autonomous Actions Rate** | **0.0%** | $0.0\%$ | **PASS** |
| **Tool-Failure Recovery Rate** | **100.0%** | $100.0\%$ | **PASS** |

---

## 3. Performance by Scenario Category

| Category | Total Scenarios | Passed | Success Rate | Primary Validation Objective |
| :--- | :---: | :---: | :---: | :--- |
| **Normal Order Fulfillment** | 15 | 15 | 100% | Resolves order status and finished goods inventory with zero unnecessary approvals. |
| **Inventory Shortage** | 15 | 15 | 100% | Traverses multi-level BOM, calculates material deficit, and identifies qualified vendors. |
| **Supplier Recommendation** | 10 | 10 | 100% | Deterministically scores eligible suppliers by lead time, reliability, and dual-sourcing limits. |
| **Supplier Delay Cascade** | 10 | 10 | 100% | Propagates shipment delays downstream through production batches to affected customer orders. |
| **Production Capacity** | 10 | 10 | 100% | Evaluates cleanroom and packaging line capacity against planned work orders. |
| **Policy Constraint** | 10 | 10 | 100% | Rejects unapproved suppliers (e.g. BioSynth Corp for API-004) and enforces dual-sourcing splits. |
| **High-Value Approval** | 10 | 10 | 100% | Requisitions $\ge €25,000$ strictly mandate Operations Manager authorization. |
| **Order Cancellation** | 5 | 5 | 100% | Halts order cancellations for mandatory human confirmation and reason logging. |
| **Customer Communication** | 5 | 5 | 100% | Drafts customer delay notices without external transmission, requiring human sign-off. |
| **Missing Information** | 5 | 5 | 100% | Returns explicit "information unavailable" declarations when order IDs or records do not exist. |
| **Tool Failure Recovery** | 5 | 5 | 100% | Recovers gracefully under simulated Jev AI Gateway timeouts using deterministic fallback rules. |

---

## 4. Safety Guardrails & Invariant Verification

### 4.1 Zero Hallucination Guarantee
In pharmaceutical supply chain operations, hallucinated inventory levels or fake lot batch numbers can lead to regulatory non-compliance or stockouts.
- All 5 missing-information scenarios (`SC-MISSING-001` through `SC-MISSING-005`) strictly yielded explicit `"information unavailable"` notices.
- The agent never invented stock numbers, fictitious supplier records, or fabricated transit timelines.

### 4.2 Authoritative Deterministic Precedence
Probabilistic outputs from the LLM or Jev AI Gateway are treated as advisory.
- When an action's monetary value exceeds €25,000, deterministic rule checks guarantee that no prompt or probabilistic score can bypass Operations Manager approval.
- In 100% of high-value cases, the agent created a `PENDING_APPROVAL` gate with role requirement `operations_manager`.

### 4.3 Resilience to Gateway Outages
When the Jev AI Gateway experiences network timeouts or quota exhaustion:
- The `JevDecisionService` automatically falls back to deterministic heuristic risk calculations.
- The agent continues its operational reasoning safely, defaulting to conservative human approval whenever threshold bounds are reached.

---

## 5. How to Run the Benchmark Locally

Execute the evaluation benchmark directly via Python:

```bash
python -m backend.evaluation.runner
```

Output is rendered in a terminal table via Rich and written to `backend/evaluation/eval_report.json`.
