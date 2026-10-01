import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, JSON, Text
from sqlalchemy.orm import relationship
from backend.app.db.session import Base


class AgentRun(Base):
    __tablename__ = "agent_runs"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    thread_id = Column(String, index=True, nullable=False)
    goal = Column(Text, nullable=False)
    status = Column(String, nullable=False, default="RUNNING")  # RUNNING, WAITING_APPROVAL, COMPLETED, FAILED
    plan = Column(JSON, nullable=True)  # List of step strings
    user_id = Column(String, nullable=False)
    user_role = Column(String, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    completed_at = Column(DateTime, nullable=True)

    steps = relationship("AgentStep", back_populates="run", cascade="all, delete-orphan")
    tool_calls = relationship("AgentToolCall", back_populates="run", cascade="all, delete-orphan")


class AgentStep(Base):
    __tablename__ = "agent_steps"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    run_id = Column(String, ForeignKey("agent_runs.id", ondelete="CASCADE"), nullable=False)
    step_number = Column(Integer, nullable=False)
    description = Column(String, nullable=False)
    status = Column(String, nullable=False, default="COMPLETED")  # IN_PROGRESS, COMPLETED, FAILED
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    duration_ms = Column(Integer, nullable=False, default=0)

    run = relationship("AgentRun", back_populates="steps")


class AgentToolCall(Base):
    __tablename__ = "agent_tool_calls"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    run_id = Column(String, ForeignKey("agent_runs.id", ondelete="CASCADE"), nullable=False)
    tool_name = Column(String, nullable=False)
    input_args = Column(JSON, nullable=True)
    output_result = Column(JSON, nullable=True)
    status = Column(String, nullable=False, default="SUCCESS")  # SUCCESS, ERROR
    duration_ms = Column(Integer, nullable=False, default=0)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    run = relationship("AgentRun", back_populates="tool_calls")
