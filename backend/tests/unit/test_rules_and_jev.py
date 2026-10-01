import pytest
from backend.app.llm.factory import get_chat_model
from backend.app.llm.mock_model import MockChatModel
from backend.app.jev.service import JevDecisionService, JevEvaluationResult
from backend.app.rules.rules_engine import RulesEngine
from langchain_core.messages import HumanMessage


def test_mock_chat_model():
    model = get_chat_model()
    assert isinstance(model, MockChatModel)

    # Medix inquiry
    res = model.invoke([HumanMessage(content="Can we fulfill Medix's order ORD-1847 by October 20?")])
    assert "ORD-1847" in res.content
    assert "Paracetamol" in res.content

    # Missing order - zero hallucination
    res_missing = model.invoke([HumanMessage(content="What is the status of Order #ORD-99999?")])
    assert "Information unavailable" in res_missing.content


@pytest.mark.asyncio
async def test_jev_decision_fallback():
    eval_res = await JevDecisionService.evaluate_action(
        action_type="PURCHASE_REQUEST",
        monetary_value=8400.0,
        supporting_evidence={"order": "ORD-1847", "shortage": 700.0},
        proposed_action_summary="Procure 1,500 kg API-004 from Apex BioChem",
    )
    assert eval_res.human_review_required is True
    assert eval_res.confidence_score >= 0.80
    assert "human_review" in eval_res.probability_distribution
    assert eval_res.is_fallback is True


def test_rules_engine_financial_thresholds():
    # 1. Low value < 5k
    gate_low = RulesEngine.evaluate_action_gate(
        action_type="PURCHASE_REQUEST",
        monetary_value=3200.0,
        user_role="procurement_officer",
    )
    assert gate_low.requires_human_approval is False

    # 2. Mid value 5k - 25k (Medix scenario: 8,400 EUR)
    gate_mid = RulesEngine.evaluate_action_gate(
        action_type="PURCHASE_REQUEST",
        monetary_value=8400.0,
        user_role="procurement_officer",
    )
    assert gate_mid.requires_human_approval is True
    assert gate_mid.required_role == "procurement_officer"
    assert gate_mid.is_authorized is True

    # 3. High value > 25k
    gate_high = RulesEngine.evaluate_action_gate(
        action_type="PURCHASE_REQUEST",
        monetary_value=45000.0,
        user_role="procurement_officer",
    )
    assert gate_high.requires_human_approval is True
    assert gate_high.required_role == "operations_manager"
    # Procurement officer is NOT authorized to approve Tier 3!
    assert gate_high.is_authorized is False


def test_rules_engine_hard_block_supplier_b():
    # Supplier B for API-004 must be blocked by policy
    gate_block = RulesEngine.evaluate_action_gate(
        action_type="PURCHASE_REQUEST",
        monetary_value=3000.0,
        user_role="procurement_officer",
        supplier_code="SUP-002",
        material_code="API-004",
    )
    assert gate_block.hard_block is True
    assert gate_block.is_authorized is False


def test_rules_engine_jev_precedence_invariant():
    # Critical test: Jev says LOW RISK (human_review_required = False) on 35,000 EUR
    # Deterministic rule MUST override and keep approval required!
    mock_jev = JevEvaluationResult(
        human_review_required=False,  # Jev claims low risk
        evidence_sufficient=True,
        supplier_recommendation_supported=True,
        risk_level="LOW",
        continue_searching=False,
        confidence_score=0.99,
        probability_distribution={"approve_direct": 0.99, "human_review": 0.01},
        rationale="Jev considers supplier reliable",
        is_fallback=False,
        latency_ms=10,
        model_version="test",
    )

    gate = RulesEngine.evaluate_action_gate(
        action_type="PURCHASE_REQUEST",
        monetary_value=35000.0,
        user_role="operations_manager",
        jev_result=mock_jev,
    )
    # Mandated by rule: STILL REQUIRED!
    assert gate.requires_human_approval is True
    assert gate.required_role == "operations_manager"
