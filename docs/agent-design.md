# SupplyPilot — Agent Architecture & LangGraph Design

## 1. Core Paradigm: Single Stateful Operations Agent

SupplyPilot deploys **one shared Operations Agent** rather than an uncontrolled swarm of autonomous subagents. The agent operates within a stateful LangGraph workflow backed by persistent memory (`MemorySaver` / SQLite / PostgreSQL checkpointers).

---

## 2. Graph Topology & Node Responsibilities

```
    [START]
       │
       ▼
    [Plan Node] ────────────────► Formulates explicit, concise, factual steps
       │
       ▼
    [Tool Execution Node] ──────► Executes typed read tools against PostgreSQL
       │
       ▼
    [RAG Retrieval Node] ───────► Retrieves corporate policies & SOP citations
       │
       ▼
    [Decision & Guard Node] ────► Evaluates Rules Engine gates + Jev probabilistic scores
       │
       ▼
    [Response Node] ────────────► Produces evidence-grounded final output
       │
       ▼
     [END]
```

### Node Descriptions:
1. **`plan` (`plan_node`):** Evaluates the user's operational goal and structures an ordered list of factual steps. It does not output raw chain-of-thought tokens.
2. **`tool_execution` (`tool_execution_node`):** Translates the plan into controlled read operations (`get_order_tool`, `check_inventory_tool`, `calculate_material_shortage_tool`, `find_suppliers_tool`, `check_production_capacity_tool`). If records are absent, returns explicit `"Information unavailable"` to guarantee zero hallucination.
3. **`rag_retrieval` (`rag_retrieval_node`):** Embeds the query and queries the Qdrant policy store for relevant documents (`POL-PROC-001`, `POL-SUP-002`, etc.).
4. **`decision_and_guard` (`decision_and_guard_node`):**
   - Synthesizes action proposals with UUID idempotency keys.
   - Dispatches a prompt to **Jev** via Vercel AI Gateway for probabilistic risk evaluation and confidence scoring.
   - Enforces the **Deterministic Rules Engine**: evaluates spending thresholds (< €5k, €5k-€25k, > €25k) and enforces that Jev cannot downgrade an action that requires approval.
5. **`response` (`response_node`):** Assembles the final user-facing response with structured evidence cards, supplier summaries, and policy citations. Persists `AgentRun` state to the database.

---

## 3. Human-in-the-Loop Interruption & Resumption

When an action requires approval (such as an €8,400 raw material procurement request), the agent:
1. Persists the `PurchaseRequest` record in `PENDING_APPROVAL` status.
2. Spawns an `ApprovalRequest` record containing the monetary value, risk level, supporting evidence, and Jev recommendation.
3. Sets `approval_required = True` and sets the run status to `WAITING_APPROVAL`.
4. The execution state is preserved in the checkpointer.
5. Upon an authorized user calling the `/approvals/{id}/approve` endpoint, the action is marked `APPROVED`, and an audit event is registered.
