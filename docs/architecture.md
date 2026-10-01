# SupplyPilot — System Architecture & Design Document

## 1. Architectural Philosophy

SupplyPilot is an autonomous operations platform for pharmaceutical and chemical manufacturing designed around one foundational principle:

> **LLMs propose and reason; deterministic systems verify and execute.**

In mission-critical operational environments, an agent cannot be granted unrestricted SQL or direct API write access. SupplyPilot enforces a strict separation between:
1. **Uncertainty & Language Interpretation:** Managed by the LangGraph operations agent with DeepSeek / OpenAI LLMs.
2. **Transactional State of Truth:** Managed by PostgreSQL (with local SQLite compatibility for testing and development).
3. **Contextual Knowledge & Policies:** Managed by Qdrant Vector Search.
4. **Deterministic Invariants:** Hard business rules, role-based access control (RBAC), supplier qualification, and financial authorization thresholds.
5. **Probabilistic Decision Verification:** Jev (via Vercel AI Gateway) for evidence sufficiency, risk scoring, and human escalation recommendations.
6. **Execution Safety:** LangGraph durable checkpointer that interrupts before any mutation and requires authorized human approval.

---

## 2. Component Diagram

```
                        ┌─────────────────────────────────┐
                        │      NEXT.JS / REACT CLIENT     │
                        │  Dashboard • Chat • Approvals   │
                        └───────────────┬─────────────────┘
                                        │ REST / SSE
                                        ▼
                        ┌─────────────────────────────────┐
                        │         FASTAPI BACKEND         │
                        │ JWT Auth • Tracing • Audit Log  │
                        └───────────────┬─────────────────┘
                                        │
                                        ▼
                        ┌─────────────────────────────────┐
                        │     LANGGRAPH AGENT WORKFLOW    │
                        │  State • Checkpoints • Interrupt│
                        └───────┬───────────────┬─────────┘
                                │               │
                ┌───────────────┴──┐     ┌──────┴───────┐
                ▼                  ▼     ▼              ▼
         Controlled Tools    Rules Engine   Qdrant RAG     Jev Support
         (Read / Action)     (Hard Gates)  (Policy Store) (Vercel Gateway)
                │                  │
                ▼                  ▼
        PostgreSQL / SQLite  Authoritative
        (Transactional Truth) Floor Checks
```

---

## 3. Communication & Data Flow

1. **User Goal Submission:** The user posts an operational inquiry or an event is triggered (e.g., supplier delay reported).
2. **Plan Generation:** The agent formulates a step-by-step plan (e.g. check order $\to$ check inventory $\to$ explode BOM $\to$ evaluate suppliers).
3. **Tool Invocation:** The agent invokes typed tools. The tools call domain services which execute parameterized queries on PostgreSQL.
4. **RAG Augmentation:** Relevant company policies, SOPs, and supplier contracts are retrieved from Qdrant with source metadata.
5. **Action Proposal:** If operational intervention is necessary (e.g. purchase request, reschedule), an `ActionProposal` is structured.
6. **Deterministic Rule Check:** The Rules Engine checks financial thresholds and user permissions.
7. **Jev Probabilistic Check:** Jev evaluates risk level and evidence sufficiency. Jev may escalate a decision to human review, but cannot downgrade a hard approval requirement.
8. **Interruption Gate:** If human approval is required, LangGraph interrupts execution and persists the state. An `ApprovalRequest` is surfaced in the Approval Center.
9. **Approval & Resume:** An authorized user reviews the request and clicks Approve. LangGraph resumes execution from the checkpoint, mutates the state, records an immutable audit log entry, and yields the final response.

---

## 4. Security & Isolation

- **No Public Secrets:** All API keys (`DEEPSEEK_API_KEY`, `AI_GATEWAY_API_KEY`, `JWT_SECRET`) reside exclusively on the backend.
- **Authoritative Backend RBAC:** Frontend views adapt to roles, but the backend independently validates caller roles on every action.
- **Simulation Sandbox:** All side effects (email drafts, purchase orders, production shifts) are simulated in the local database.
