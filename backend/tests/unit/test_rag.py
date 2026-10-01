import pytest
from backend.app.services.rag_service import RAGService
from backend.app.tools.read_tools import search_company_policies_tool


def test_rag_policy_retrieval_thresholds():
    rag = RAGService.get_instance()
    results = rag.search_policies("procurement approval threshold operations manager", limit=2)
    assert len(results) > 0
    top = results[0]
    assert "Purchase Approval Policy" in top["document_title"]
    assert "25,000" in top["content"] or "5,000" in top["content"]


def test_rag_policy_retrieval_supplier_b_restriction():
    rag = RAGService.get_instance()
    results = rag.search_policies("Supplier B BioSynth API-004 restricted", limit=2)
    assert len(results) > 0
    content = " ".join([r["content"] for r in results])
    assert "Supplier B" in content or "BioSynth" in content
    assert "API-004" in content


def test_search_company_policies_tool_citations():
    results = search_company_policies_tool("customer delay notification 48 hours")
    assert len(results) > 0
    assert "citation" in results[0]
    assert "Customer Communication" in results[0]["citation"]
