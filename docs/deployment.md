# SupplyPilot Production Deployment & Infrastructure Guide

SupplyPilot is architected with strict cloud-native separation between the stateful LangGraph agent execution runtime, the transactional operational database, the semantic RAG policy store, and the Next.js operations console.

---

## 1. Production Architecture Overview

```mermaid
flowchart TD
    Client["Browser / Enterprise Console"] --> CDN["Cloudflare / CDN Edge"]
    CDN --> NextJS["Next.js Operations Frontend (Vercel / K8s)"]
    NextJS --> LB["Application Load Balancer"]
    
    subgraph VPC ["Private VPC (Pharmaceutical Cloud Boundary)"]
        LB --> FastAPIPool["FastAPI Agent Workers (Gunicorn / Uvicorn)"]
        FastAPIPool --> PgBouncer["PgBouncer Connection Pooler"]
        PgBouncer --> AuroraPG[("PostgreSQL 16 HA Cluster (Multi-AZ)")]
        
        FastAPIPool --> PolicyStore[("Policy RAG Knowledge Base")]
        FastAPIPool --> AI_Gateway["Vercel AI Gateway (Jev / DeepSeek)"]
    end
    
    FastAPIPool --> OTEL["OpenTelemetry Collector & Prometheus"]
```

---

## 2. Environment Configuration

Copy `.env.example` to `.env` and configure appropriate production secrets:

```bash
# Core Environment
ENVIRONMENT=production
DEBUG=false
SECRET_KEY=generate-strong-64-char-hex-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=480

# Database Topology
# Production uses managed PostgreSQL with SSL mode required
DATABASE_URL=postgresql+psycopg://supplypilot_app:db_password@aurora-primary.internal:5432/supplypilot?sslmode=require

# LLM & AI Gateway Configuration
LLM_PROVIDER=openai
OPENAI_API_BASE=https://api.deepseek.com/v1
OPENAI_API_KEY=sk-prod-your-openai-or-deepseek-key
LLM_MODEL=deepseek-chat
LLM_TEMPERATURE=0.0

# Vercel AI Gateway & Jev Decision Evaluator
VERCEL_AI_GATEWAY_URL=https://gateway.ai.cloudflare.com/v1/typesafe-ai/jev
VERCEL_AI_GATEWAY_KEY=gateway-key-here
JEV_ENABLED=true
JEV_FALLBACK_DETERMINISTIC=true

# Next.js Frontend
NEXT_PUBLIC_API_URL=https://api.supplypilot.pharma.internal/api/v1
```

---

## 3. Container Deployment (Docker Compose)

For single-host staging or sovereign on-premise deployments:

```bash
# 1. Build and boot all services
docker-compose up -d --build

# 2. Verify container health
docker-compose ps

# 3. Seed deterministic enterprise data
docker-compose exec backend python -m backend.app.seed.seeder
```

The production `docker-compose.yml` launches:
- `backend`: FastAPI with Uvicorn ASGI workers.
- `frontend`: Next.js Node.js server on port 3000.
- `db`: PostgreSQL 16 Alpine with health check probe.

---

## 4. Kubernetes Deployment Architecture

For high-availability pharmaceutical enterprise deployments:

1. **Stateful Agent Checkpoints:**
   - In production clusters, LangGraph's checkpointer is configured with `PostgresSaver` backed by Aurora PostgreSQL.
2. **Horizontal Pod Autoscaling (HPA):**
   - Agent workers autoscale based on CPU utilization ($\ge 70\%$) and active async queue depth.
3. **Graceful Shutdown & Long-Running Runs:**
   - Pod termination grace period is set to 60 seconds (`terminationGracePeriodSeconds: 60`) ensuring in-flight graph transitions complete cleanly before container SIGTERM.

---

## 5. Observability, Telemetry & Health Checks

### 5.1 Health Check Probes
- **Liveness Probe:** `GET /health` returns `{ "status": "healthy", "service": "SupplyPilot" }`.
- **Readiness Probe:** Verifies active database connection pool reachability before routing traffic.

### 5.2 Structured JSON Logging
All log lines conform to structured JSON serialization (`backend/app/core/logging.py`) with:
- Correlation `run_id` and `thread_id`
- Timestamp (ISO 8601 UTC)
- Severity level (`INFO`, `WARN`, `ERROR`)
- Logger module name

### 5.3 Prometheus Metrics
Key operational metrics exposed:
- `agent_run_duration_seconds`: Histogram of end-to-end reasoning duration.
- `tool_execution_total`: Counter of database tool calls by tool name.
- `approval_gates_total`: Counter of triggered human-in-the-loop approvals by action type.
- `jev_gateway_latency_ms`: Response time of Vercel AI Gateway evaluations.
