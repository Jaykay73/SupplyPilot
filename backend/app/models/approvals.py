import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Float, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from backend.app.db.session import Base


class ApprovalRequest(Base):
    __tablename__ = "approval_requests"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    request_number = Column(String, unique=True, index=True, nullable=False)  # APP-2026-001
    action_type = Column(String, nullable=False)  # PURCHASE_REQUEST, PRODUCTION_RESCHEDULE, CUSTOMER_COMMUNICATION, ORDER_CANCELLATION
    target_id = Column(String, nullable=False)  # ID of the proposed action record
    action_summary = Column(String, nullable=False)
    monetary_value = Column(Float, nullable=False, default=0.0)
    currency = Column(String, nullable=False, default="EUR")
    required_role = Column(String, nullable=False)  # procurement_officer, operations_manager, admin
    risk_level = Column(String, nullable=False, default="MEDIUM")  # LOW, MEDIUM, HIGH
    jev_recommendation = Column(JSON, nullable=True)  # Structured Jev evaluation payload
    supporting_evidence = Column(JSON, nullable=True)  # Snapshot of inventory/shortage facts
    policy_citations = Column(JSON, nullable=True)  # Citations from RAG
    status = Column(String, nullable=False, default="PENDING")  # PENDING, APPROVED, REJECTED, AUTO_EXECUTED
    agent_run_id = Column(String, nullable=True, index=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    resolved_at = Column(DateTime, nullable=True)
    resolved_by = Column(String, nullable=True)
    resolution_notes = Column(Text, nullable=True)

    events = relationship("ApprovalEvent", back_populates="approval_request", cascade="all, delete-orphan")


class ApprovalEvent(Base):
    __tablename__ = "approval_events"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    approval_request_id = Column(String, ForeignKey("approval_requests.id", ondelete="CASCADE"), nullable=False)
    actor_id = Column(String, nullable=False)
    actor_role = Column(String, nullable=False)
    event_type = Column(String, nullable=False)  # SUBMITTED, APPROVED, REJECTED
    reason = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    approval_request = relationship("ApprovalRequest", back_populates="events")
