import json
from typing import List, Any, Optional, Dict
from langchain_core.language_models.chat_models import BaseChatModel
from langchain_core.messages import BaseMessage, AIMessage, HumanMessage, ToolMessage
from langchain_core.outputs import ChatResult, ChatGeneration


class MockChatModel(BaseChatModel):
    """Deterministic mock chat model for offline testing and benchmarking."""

    def _generate(
        self,
        messages: List[BaseMessage],
        stop: Optional[List[str]] = None,
        run_manager: Optional[Any] = None,
        **kwargs: Any,
    ) -> ChatResult:
        last_message = messages[-1].content if messages else ""
        if isinstance(last_message, list):
            last_message = " ".join([str(item) for item in last_message])

        # Analyze message content to generate context-aware response
        msg_lower = str(last_message).lower()

        # Flagship Medix Order
        if "medix" in msg_lower or "1847" in msg_lower or "fulfill" in msg_lower:
            text = (
                "Order #ORD-1847 for Medix Global Logistics is currently at HIGH risk.\n\n"
                "• Requested Demand: 5,000 vials of Paracetamol IV Solution 10mg/ml by October 20, 2026.\n"
                "• Finished Goods Inventory: 3,100 vials available (Shortage: 1,900 vials).\n"
                "• Raw Material Shortage: 1,500 kg of API-004 (Paracetamol Pure Grade) is required for production, "
                "but only 800 kg is available in inventory (Deficit: 700 kg).\n"
                "• Sourcing Recommendation: Apex BioChem GmbH (SUP-001) has a lead time of 5 days, contract price "
                "EUR 5.60/kg, with total procurement value of EUR 8,400.00.\n"
                "• Approval Required: Procurement Officer approval is required under corporate policy POL-PROC-001 "
                "(threshold between EUR 5,000 and EUR 25,000)."
            )
        # Flagship Supplier Selection
        elif "which supplier" in msg_lower or "supplier should we use" in msg_lower or "2,000 kg" in msg_lower:
            text = (
                "For immediate procurement of API-004, Apex BioChem GmbH (SUP-001) is the recommended supplier.\n\n"
                "• Lead Time: 5 business days.\n"
                "• Reliability Score: 96%.\n"
                "• Contract Price: EUR 5.60/kg (Composite Score: 0.945).\n"
                "• Policy Compliance: Supplier B (BioSynth Europe - SUP-002) was disqualified under POL-SUP-002 "
                "due to unapproved dissolution quality audit status for API-004."
            )
        # Flagship At-risk Orders
        elif "at risk" in msg_lower or "orders at risk" in msg_lower:
            text = (
                "Operational scan identified orders at risk for this schedule window:\n\n"
                "1. Order #ORD-1847 (Medix Global Logistics) — HIGH RISK: API-004 raw material shortage.\n"
                "2. Order #ORD-1842 (Charité University Hospital) — HIGH RISK: Component lead time and batch scheduling dependency.\n\n"
                "Immediate mitigation via alternative qualified supplier requisition is recommended."
            )
        # Missing / Non-existent order (Zero hallucination test)
        elif "9999" in msg_lower or "not-exist" in msg_lower or "non-existent" in msg_lower:
            text = "Information unavailable. The requested order record does not exist in the operational database."
        else:
            text = (
                "SupplyPilot Operations Agent analyzed the request against current inventory, "
                "supplier registries, and company policies. Operational parameters verified."
            )

        ai_msg = AIMessage(content=text)
        return ChatResult(generations=[ChatGeneration(message=ai_msg)])

    @property
    def _llm_type(self) -> str:
        return "mock_chat_model"
