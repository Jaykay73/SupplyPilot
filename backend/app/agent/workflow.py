from langgraph.graph import StateGraph, START, END
from langgraph.checkpoint.memory import MemorySaver
from backend.app.agent.state import AgentState
from backend.app.agent.nodes import (
    plan_node,
    tool_execution_node,
    rag_retrieval_node,
    decision_and_guard_node,
    response_node,
)


def create_agent_graph():
    """Builds and compiles the stateful LangGraph workflow with persistent memory."""
    workflow = StateGraph(AgentState)

    # Register nodes
    workflow.add_node("plan", plan_node)
    workflow.add_node("tool_execution", tool_execution_node)
    workflow.add_node("rag_retrieval", rag_retrieval_node)
    workflow.add_node("decision_and_guard", decision_and_guard_node)
    workflow.add_node("response", response_node)

    # Establish sequence
    workflow.add_edge(START, "plan")
    workflow.add_edge("plan", "tool_execution")
    workflow.add_edge("tool_execution", "rag_retrieval")
    workflow.add_edge("rag_retrieval", "decision_and_guard")
    workflow.add_edge("decision_and_guard", "response")
    workflow.add_edge("response", END)

    # Durable checkpointer for stateful threads & interrupt/resume
    checkpointer = MemorySaver()
    app = workflow.compile(checkpointer=checkpointer)
    return app


agent_app = create_agent_graph()
