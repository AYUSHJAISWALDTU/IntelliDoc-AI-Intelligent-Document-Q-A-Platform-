import uuid
import datetime
from sqlalchemy import Column, String, DateTime, Integer, Text, ForeignKey, JSON, BigInteger, Index
from sqlalchemy.orm import relationship
from app.database import Base


def generate_uuid():
    return str(uuid.uuid4())


class Document(Base):
    __tablename__ = "documents"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    space_id = Column(String(36), ForeignKey("spaces.id", ondelete="CASCADE"), nullable=False, index=True)
    file_name = Column(String(500), nullable=False)
    file_type = Column(String(10), nullable=False)
    file_size = Column(BigInteger, nullable=False)
    s3_key = Column(String(1000), nullable=False)
    content_hash = Column(String(64), nullable=False, index=True)
    page_count = Column(Integer, nullable=True)
    chunk_count = Column(Integer, default=0, nullable=False)
    status = Column(String(20), default="uploading", nullable=False, index=True)
    error_message = Column(Text, nullable=True)
    doc_metadata = Column(JSON, nullable=True)
    processing_started_at = Column(DateTime, nullable=True)
    processing_completed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    space = relationship("Space", back_populates="documents")
    chunks = relationship("Chunk", back_populates="document", cascade="all, delete-orphan")

    __table_args__ = (
        Index("ix_documents_space_status", "space_id", "status"),
    )

    def __repr__(self):
        return f"<Document {self.file_name} [{self.status}]>"
