import pytest
import uuid
from backend.app.agent.workflow import agent_app


@pytest.mark.asyncio
async def test_langgraph_agent_medix_fulfillment():
    thread_id = str(uuid.uuid4())
    run_id = str(uuid.uuid4())
    initial_state = {
        "run_id": run_id,
        "thread_id": thread_id,
        "user_id": "procurement@demo.local",
        "user_role": "procurement_officer",
        "goal": "Can we fulfill Medix's order by October 20?",
        "messages": [],
        "plan": [],
        "current_step": 0,
        "retrieved_evidence": {},
        "policy_citations": [],
        "proposed_action": None,
        "jev_evaluation": None,
        "rule_evaluation": None,
        "approval_required": False,
        "approval_id": None,
        "approval_status": None,
        "final_response": "",
        "is_completed": False,
    }

    config = {"configurable": {"thread_id": thread_id}}
    result = await agent_app.ainvoke(initial_state, config=config)

    assert result["is_completed"] is True
    assert len(result["plan"]) > 0
    assert "retrieved_evidence" in result
    evidence = result["retrieved_evidence"]
    assert "order" in evidence
    assert evidence["order"]["order_number"] == "ORD-1847"
    assert "material_shortage" in evidence
    assert evidence["material_shortage"]["has_shortage"] is True

    # Verify RAG policy citations
    assert len(result["policy_citations"]) > 0
    citations = [c["document_title"] for c in result["policy_citations"]]
    assert any("Purchase Approval Policy" in c for c in citations)

    # Verify proposed action & approval requirement
    assert result["proposed_action"] is not None
    assert result["proposed_action"]["monetary_value"] == 8400.0
    assert result["approval_required"] is True
    assert result["approval_id"] is not None

    # Verify Jev & Rules evaluation
    assert result["jev_evaluation"] is not None
    assert result["rule_evaluation"] is not None
    assert result["rule_evaluation"]["requires_human_approval"] is True

    # Verify final response text
    assert "ORD-1847" in result["final_response"]
    assert "8,400" in result["final_response"]


@pytest.mark.asyncio
async def test_langgraph_agent_zero_hallucination_missing_order():
    thread_id = str(uuid.uuid4())
    run_id = str(uuid.uuid4())
    initial_state = {
        "run_id": run_id,
        "thread_id": thread_id,
        "user_id": "procurement@demo.local",
        "user_role": "procurement_officer",
        "goal": "Can we fulfill non-existent order ORD-99999?",
        "messages": [],
        "plan": [],
        "current_step": 0,
        "retrieved_evidence": {},
        "policy_citations": [],
        "proposed_action": None,
        "jev_evaluation": None,
        "rule_evaluation": None,
        "approval_required": False,
        "approval_id": None,
        "approval_status": None,
        "final_response": "",
        "is_completed": False,
    }

    config = {"configurable": {"thread_id": thread_id}}
    result = await agent_app.ainvoke(initial_state, config=config)

    assert result["is_completed"] is True
    assert "Information unavailable" in result["final_response"]
