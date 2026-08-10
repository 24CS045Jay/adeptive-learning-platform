"""
RAG Python Microservice — ChromaDB + sentence-transformers
Handles: text chunking, embedding, vector upsert/delete, and nearest-neighbour retrieval.
Does NOT call any LLM — generation is handled by the Node backend.
"""

from __future__ import annotations

import os
import re
import logging
from contextlib import asynccontextmanager
from typing import Any

import chromadb
from chromadb.config import Settings
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from sentence_transformers import SentenceTransformer

# ─── Logging ──────────────────────────────────────────────────────────────────

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("rag_service")

# ─── Global singletons (loaded once at startup) ───────────────────────────────

_chroma_client: chromadb.PersistentClient | None = None
_embed_model: SentenceTransformer | None = None

CHROMA_PERSIST_DIR = os.getenv("CHROMA_PERSIST_DIR", "./chroma_data")
EMBED_MODEL_NAME = "all-MiniLM-L6-v2"

# Chunking constants
CHUNK_TOKENS = 250       # optimal token target per chunk for all-MiniLM-L6-v2
OVERLAP_RATIO = 0.15     # 15% overlap


# ─── Lifespan (startup / shutdown) ────────────────────────────────────────────

@asynccontextmanager
async def lifespan(app: FastAPI):
    global _chroma_client, _embed_model

    logger.info("Initialising persistent ChromaDB at: %s", CHROMA_PERSIST_DIR)
    os.makedirs(CHROMA_PERSIST_DIR, exist_ok=True)
    _chroma_client = chromadb.PersistentClient(
        path=CHROMA_PERSIST_DIR,
        settings=Settings(anonymized_telemetry=False),
    )

    logger.info("Loading sentence-transformers model: %s", EMBED_MODEL_NAME)
    _embed_model = SentenceTransformer(EMBED_MODEL_NAME)
    logger.info("RAG service ready.")

    yield  # ← app runs here

    logger.info("RAG service shutting down.")


app = FastAPI(title="Adeptive Learning RAG Service", lifespan=lifespan)


# ─── Helpers ──────────────────────────────────────────────────────────────────

def _get_client() -> chromadb.PersistentClient:
    if _chroma_client is None:
        raise RuntimeError("ChromaDB client not initialised")
    return _chroma_client


def _get_model() -> SentenceTransformer:
    if _embed_model is None:
        raise RuntimeError("Embedding model not initialised")
    return _embed_model


def _collection_name(subject_code: str) -> str:
    """Sanitise subject code to a valid ChromaDB collection name."""
    safe = re.sub(r"[^a-zA-Z0-9_-]", "_", subject_code).strip("_")
    return f"subject_{safe}"


def chunk_text(text: str, chunk_tokens: int = CHUNK_TOKENS, overlap_ratio: float = OVERLAP_RATIO) -> list[str]:
    """
    Split *text* into overlapping chunks of approximately *chunk_tokens* tokens (~250 words).

    Strategy:
      1. Split on markdown headings (#, ##, ###) or paragraph boundaries (\n\n).
      2. If a section is under *chunk_tokens*, keep it intact as a semantic unit.
      3. If a section is longer, split on sentence boundaries and accumulate up to *chunk_tokens*.
    """
    if not text or not text.strip():
        return []

    overlap_words = max(1, int(chunk_tokens * overlap_ratio))

    # Split on headings (#, ##, ###) or blank lines
    raw_sections = re.split(r"(?:\n\s*\n|\n(?=#+\s))", text)
    segments: list[str] = []
    sentence_end = re.compile(r"(?<=[.!?])\s+")

    for sec in raw_sections:
        sec = sec.strip()
        if not sec:
            continue
        words = sec.split()
        if len(words) <= chunk_tokens:
            segments.append(sec)
        else:
            # Split long section on sentences
            sentences = sentence_end.split(sec)
            buf: list[str] = []
            for sent in sentences:
                sent = sent.strip()
                if not sent:
                    continue
                if len(buf) + len(sent.split()) > chunk_tokens and buf:
                    segments.append(" ".join(buf))
                    buf = sent.split()
                else:
                    buf.extend(sent.split())
            if buf:
                segments.append(" ".join(buf))

    chunks: list[str] = []
    buffer: list[str] = []

    for seg in segments:
        seg_words = seg.split()
        if len(buffer) + len(seg_words) > chunk_tokens and buffer:
            chunks.append(" ".join(buffer))
            buffer = buffer[-overlap_words:] + seg_words
        else:
            buffer.extend(seg_words)

    if buffer:
        chunks.append(" ".join(buffer))

    return [c for c in chunks if c.strip()]


def _embed(texts: list[str]) -> list[list[float]]:
    model = _get_model()
    embeddings = model.encode(texts, convert_to_numpy=True, show_progress_bar=False)
    return embeddings.tolist()


# ─── Request / Response schemas ───────────────────────────────────────────────

class IngestRequest(BaseModel):
    documentId: str
    subjectCode: str
    text: str
    metadata: dict[str, Any] = Field(default_factory=dict)


class IngestResponse(BaseModel):
    chunkCount: int
    collection: str


class DeleteRequest(BaseModel):
    documentId: str
    subjectCode: str


class DeleteResponse(BaseModel):
    deleted: int
    collection: str


class QueryRequest(BaseModel):
    subjectCode: str
    question: str
    topK: int = 5


class ChunkResult(BaseModel):
    text: str
    metadata: dict[str, Any]
    distance: float


class QueryResponse(BaseModel):
    results: list[ChunkResult]
    collection: str


# ─── Endpoints ────────────────────────────────────────────────────────────────

@app.get("/health")
def health():
    """Startup probe used by the Node backend."""
    return {"status": "ok", "service": "adeptive-rag"}


@app.post("/ingest", response_model=IngestResponse)
def ingest(req: IngestRequest):
    """
    Chunk *text*, embed each chunk, and upsert into the subject's Chroma collection.
    Idempotent: re-ingesting the same documentId overwrites its previous vectors.
    """
    client = _get_client()
    col_name = _collection_name(req.subjectCode)

    try:
        collection = client.get_or_create_collection(
            name=col_name,
            metadata={"hnsw:space": "cosine"},
        )
    except Exception as exc:
        logger.error("Failed to get/create collection %s: %s", col_name, exc)
        raise HTTPException(status_code=500, detail=f"ChromaDB collection error: {exc}")

    chunks = chunk_text(req.text)
    if not chunks:
        logger.warning("Document %s produced 0 chunks — possibly empty text", req.documentId)
        return IngestResponse(chunkCount=0, collection=col_name)

    # Build IDs, documents, metadatas, embeddings
    ids = [f"{req.documentId}_chunk_{i}" for i in range(len(chunks))]
    metadatas = [
        {
            "documentId": req.documentId,
            "chunkIndex": i,
            **{k: str(v) for k, v in req.metadata.items()},  # Chroma requires string values
        }
        for i in range(len(chunks))
    ]

    logger.info("Embedding %d chunks for document %s …", len(chunks), req.documentId)
    embeddings = _embed(chunks)

    # Delete existing vectors for this document before upserting (ensures clean re-ingest)
    try:
        existing = collection.get(where={"documentId": req.documentId})
        if existing["ids"]:
            collection.delete(ids=existing["ids"])
            logger.info("Deleted %d stale vectors for document %s", len(existing["ids"]), req.documentId)
    except Exception as exc:
        logger.warning("Could not pre-delete stale vectors for %s: %s", req.documentId, exc)

    # Upsert in batches of 100 to stay within ChromaDB limits
    BATCH = 100
    for start in range(0, len(chunks), BATCH):
        end = start + BATCH
        collection.upsert(
            ids=ids[start:end],
            documents=chunks[start:end],
            metadatas=metadatas[start:end],
            embeddings=embeddings[start:end],
        )

    logger.info("Ingested %d chunks into %s for document %s", len(chunks), col_name, req.documentId)
    return IngestResponse(chunkCount=len(chunks), collection=col_name)


@app.post("/delete-document", response_model=DeleteResponse)
def delete_document(req: DeleteRequest):
    """
    Remove all vectors whose metadata.documentId == req.documentId from the subject collection.
    Called when a document is rejected or deleted after having been approved.
    """
    client = _get_client()
    col_name = _collection_name(req.subjectCode)

    # If the collection doesn't exist yet, nothing to delete
    try:
        collection = client.get_collection(name=col_name)
    except Exception:
        logger.info("Collection %s not found — nothing to delete for document %s", col_name, req.documentId)
        return DeleteResponse(deleted=0, collection=col_name)

    try:
        result = collection.get(where={"documentId": req.documentId})
        ids_to_delete = result["ids"]
        if ids_to_delete:
            collection.delete(ids=ids_to_delete)
            logger.info("Deleted %d vectors for document %s from %s", len(ids_to_delete), req.documentId, col_name)
        else:
            logger.info("No vectors found for document %s in %s", req.documentId, col_name)
        return DeleteResponse(deleted=len(ids_to_delete), collection=col_name)
    except Exception as exc:
        logger.error("Error deleting document %s from %s: %s", req.documentId, col_name, exc)
        raise HTTPException(status_code=500, detail=f"Delete error: {exc}")


@app.post("/query", response_model=QueryResponse)
def query(req: QueryRequest):
    """
    Embed *question*, query the subject's Chroma collection, and return top-K chunks.
    Does NOT call any LLM — raw retrieval only; the Node backend handles generation.
    """
    client = _get_client()
    col_name = _collection_name(req.subjectCode)

    try:
        collection = client.get_collection(name=col_name)
    except Exception:
        logger.info("Collection %s not found — returning empty results", col_name)
        return QueryResponse(results=[], collection=col_name)

    top_k = max(1, min(req.topK, 20))  # clamp between 1 and 20

    try:
        q_embedding = _embed([req.question])[0]
        result = collection.query(
            query_embeddings=[q_embedding],
            n_results=top_k,
            include=["documents", "metadatas", "distances"],
        )
    except Exception as exc:
        logger.error("Query error on %s: %s", col_name, exc)
        raise HTTPException(status_code=500, detail=f"Query error: {exc}")

    # ChromaDB returns lists-of-lists (one list per query); we issued 1 query
    docs = result.get("documents", [[]])[0]
    metas = result.get("metadatas", [[]])[0]
    distances = result.get("distances", [[]])[0]

    chunks = [
        ChunkResult(text=doc, metadata=meta, distance=dist)
        for doc, meta, dist in zip(docs, metas, distances)
    ]

    logger.info("Query on %s returned %d results", col_name, len(chunks))
    return QueryResponse(results=chunks, collection=col_name)
