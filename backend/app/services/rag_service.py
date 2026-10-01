import os
import glob
import re
from typing import List, Dict, Any, Optional
from backend.app.core.config import settings
from backend.app.core.logging import logger


class PolicyChunk:
    def __init__(self, document_title: str, section_name: str, content: str, filepath: str, category: str):
        self.document_title = document_title
        self.section_name = section_name
        self.content = content
        self.filepath = filepath
        self.category = category
        self.citation = f"{document_title} — Section: {section_name}"

    def to_dict(self) -> Dict[str, Any]:
        return {
            "document_title": self.document_title,
            "section_name": self.section_name,
            "content": self.content,
            "citation": self.citation,
            "category": self.category,
        }


class RAGService:
    _instance: Optional["RAGService"] = None
    _chunks: List[PolicyChunk] = []
    _initialized: bool = False

    def __init__(self):
        self._chunks = []
        self._load_knowledge_base()

    @classmethod
    def get_instance(cls) -> "RAGService":
        if cls._instance is None:
            cls._instance = RAGService()
        return cls._instance

    def _load_knowledge_base(self):
        base_dir = os.path.join(os.getcwd(), "data", "knowledge_base")
        if not os.path.exists(base_dir):
            base_dir = os.path.join(os.path.dirname(__file__), "..", "..", "..", "data", "knowledge_base")

        files = glob.glob(os.path.join(base_dir, "*.md"))
        logger.info(f"RAG Service loading policy documents from {base_dir} (found {len(files)} files)")

        for filepath in files:
            try:
                with open(filepath, "r", encoding="utf-8") as f:
                    text = f.read()

                # Extract title
                title_match = re.search(r"^#\s+(.+)$", text, re.MULTILINE)
                doc_title = title_match.group(1).strip() if title_match else os.path.basename(filepath)

                # Extract category
                cat_match = re.search(r"\*\*Category:\*\*\s*(.+)$", text, re.MULTILINE)
                category = cat_match.group(1).strip() if cat_match else "Operations"

                # Split by sections (## )
                sections = re.split(r"\n##\s+", text)
                if len(sections) > 1:
                    for sec in sections[1:]:
                        lines = sec.split("\n", 1)
                        sec_name = lines[0].strip()
                        sec_content = lines[1].strip() if len(lines) > 1 else ""
                        self._chunks.append(PolicyChunk(
                            document_title=doc_title,
                            section_name=sec_name,
                            content=sec_content,
                            filepath=filepath,
                            category=category,
                        ))
                else:
                    self._chunks.append(PolicyChunk(
                        document_title=doc_title,
                        section_name="General",
                        content=text.strip(),
                        filepath=filepath,
                        category=category,
                    ))
            except Exception as e:
                logger.error(f"Error loading policy doc {filepath}: {e}")

        logger.info(f"Loaded {len(self._chunks)} indexed policy chunks.")
        self._initialized = True

    def search_policies(self, query: str, limit: int = 3) -> List[Dict[str, Any]]:
        """Searches indexed policy chunks using semantic keyword relevance."""
        if not self._chunks:
            self._load_knowledge_base()

        query_terms = [t.lower() for t in re.findall(r"\w+", query) if len(t) > 2]
        scored_chunks = []

        for chunk in self._chunks:
            haystack = f"{chunk.document_title} {chunk.section_name} {chunk.content} {chunk.category}".lower()
            score = 0
            for term in query_terms:
                if term in haystack:
                    # Give higher weight to matches in title or section
                    if term in chunk.document_title.lower() or term in chunk.section_name.lower():
                        score += 3
                    else:
                        score += 1
            if score > 0:
                scored_chunks.append((score, chunk))

        # Sort by relevance score descending
        scored_chunks.sort(key=lambda x: x[0], reverse=True)

        results = []
        for score, chunk in scored_chunks[:limit]:
            d = chunk.to_dict()
            d["relevance_score"] = score
            results.append(d)

        return results
