from typing import TypedDict, List, Dict, Any, Optional


class AgentState(TypedDict):
    messages: List[Dict[str, Any]]
    run_id: str
    thread_id: str
    user_id: str
    user_role: str
    goal: str
    plan: List[str]
    current_step: int
    retrieved_evidence: Dict[str, Any]
    policy_citations: List[Dict[str, Any]]
    proposed_action: Optional[Dict[str, Any]]
    jev_evaluation: Optional[Dict[str, Any]]
    rule_evaluation: Optional[Dict[str, Any]]
    approval_required: bool
    approval_id: Optional[str]
    approval_status: Optional[str]  # "PENDING" | "APPROVED" | "REJECTED" | None
    final_response: str
    is_completed: bool
