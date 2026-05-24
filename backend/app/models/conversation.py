import uuid
import datetime
from sqlalchemy import Column, String, DateTime, Boolean, Text, ForeignKey, Index
from sqlalchemy.orm import relationship
from app.database import Base


def generate_uuid():
    return str(uuid.uuid4())


class Conversation(Base):
    __tablename__ = "conversations"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    space_id = Column(String(36), ForeignKey("spaces.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(500), nullable=True)
    is_pinned = Column(Boolean, default=False, nullable=False)
    is_deleted = Column(Boolean, default=False, nullable=False)
    deleted_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    space = relationship("Space", back_populates="conversations")
    messages = relationship("Message", back_populates="conversation", cascade="all, delete-orphan",
                            order_by="Message.created_at")

    __table_args__ = (
        Index("ix_conversations_space_deleted", "space_id", "is_deleted"),
    )

    def __repr__(self):
        return f"<Conversation {self.title or self.id}>"
