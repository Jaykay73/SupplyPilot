from typing import Dict, Any, Optional, List
from pydantic import BaseModel
from backend.app.core.config import settings
from backend.app.jev.service import JevEvaluationResult


class RuleEvaluationResult(BaseModel):
    is_authorized: bool
    requires_human_approval: bool
    required_role: str
    reasons: List[str]
    hard_block: bool
    block_reason: Optional[str] = None


class RulesEngine:
    ROLE_HIERARCHY = {
        "viewer": 1,
        "production_planner": 2,
        "procurement_officer": 3,
        "operations_manager": 4,
        "admin": 5,
    }

    @classmethod
    def can_role_approve(cls, user_role: str, required_role: str) -> bool:
        user_level = cls.ROLE_HIERARCHY.get(user_role, 0)
        req_level = cls.ROLE_HIERARCHY.get(required_role, 99)
        return user_level >= req_level

    @classmethod
    def evaluate_action_gate(
        cls,
        action_type: str,
        monetary_value: float,
        user_role: str,
        supplier_code: Optional[str] = None,
        material_code: Optional[str] = None,
        jev_result: Optional[JevEvaluationResult] = None,
    ) -> RuleEvaluationResult:
        reasons: List[str] = []

        # 1. Hard Policy Invariant: Supplier B Disqualification for API-004
        if supplier_code == "SUP-002" and material_code == "API-004":
            return RuleEvaluationResult(
                is_authorized=False,
                requires_human_approval=True,
                required_role="operations_manager",
                reasons=["Supplier B (BioSynth Europe) is explicitly disqualified for API-004 under POL-SUP-002."],
                hard_block=True,
                block_reason="DISQUALIFIED_SUPPLIER_POLICY_VIOLATION",
            )

        # 2. Deterministic Financial Thresholds
        if monetary_value > settings.THRESHOLD_PROCUREMENT_MAX:
            requires_approval = True
            required_role = "operations_manager"
            reasons.append(
                f"Expenditure of EUR {monetary_value:,.2f} exceeds EUR {settings.THRESHOLD_PROCUREMENT_MAX:,.2f}; "
                f"Operations Manager approval mandated by POL-PROC-001."
            )
        elif monetary_value >= settings.THRESHOLD_AUTO_EXECUTE_MAX:
            requires_approval = True
            required_role = "procurement_officer"
            reasons.append(
                f"Expenditure of EUR {monetary_value:,.2f} is in Tier-2 (€5k - €25k); "
                f"Procurement Officer approval required by POL-PROC-001."
            )
        else:
            requires_approval = False
            required_role = "procurement_officer"
            reasons.append(
                f"Expenditure of EUR {monetary_value:,.2f} is below €5,000 threshold; "
                f"eligible for autonomous or expedited execution."
            )

        # 3. Non-Procurement Action Types
        if action_type in ["PRODUCTION_RESCHEDULE", "CUSTOMER_COMMUNICATION", "ORDER_CANCELLATION"]:
            requires_approval = True
            required_role = "operations_manager"
            reasons.append(f"{action_type} carries operational impact requiring Operations Manager oversight.")

        # 4. Critical Invariant: Jev Precedence Rule
        # Jev can escalate a low-value action to human review, but CANNOT downgrade a hard threshold.
        if jev_result:
            if jev_result.human_review_required and not requires_approval:
                requires_approval = True
                reasons.append(f"Jev probabilistic decision support recommended escalation: {jev_result.rationale}")
            elif not jev_result.human_review_required and requires_approval:
                # Deterministic rule wins! Jev cannot downgrade!
                reasons.append(
                    f"Deterministic safety override: Jev assessed low risk, but hard corporate policy threshold "
                    f"still mandates {required_role} approval."
                )

        # 5. Caller Authorization Check
        is_authorized = cls.can_role_approve(user_role, required_role)
        if not is_authorized and requires_approval:
            reasons.append(f"Caller role '{user_role}' does not possess required privilege '{required_role}'.")

        return RuleEvaluationResult(
            is_authorized=is_authorized,
            requires_human_approval=requires_approval,
            required_role=required_role,
            reasons=reasons,
            hard_block=False,
        )
