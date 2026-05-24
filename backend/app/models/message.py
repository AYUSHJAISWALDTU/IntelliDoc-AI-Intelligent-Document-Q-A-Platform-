import uuid
import datetime
from sqlalchemy import Column, String, DateTime, Text, ForeignKey, JSON, Integer
from sqlalchemy.orm import relationship
from app.database import Base


def generate_uuid():
    return str(uuid.uuid4())


class Message(Base):
    __tablename__ = "messages"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    conversation_id = Column(String(36), ForeignKey("conversations.id", ondelete="CASCADE"),
                             nullable=False, index=True)
    role = Column(String(20), nullable=False)  # "user" | "assistant" | "system"
    content = Column(Text, nullable=False)
    sources = Column(JSON, nullable=True)  # List of source chunk metadata
    model_used = Column(String(50), nullable=True)
    token_count = Column(Integer, nullable=True)
    latency_ms = Column(Integer, nullable=True)
    feedback = Column(String(10), nullable=True)  # "thumbs_up" | "thumbs_down"
    created_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)

    conversation = relationship("Conversation", back_populates="messages")

    def __repr__(self):
        return f"<Message [{self.role}] in conv {self.conversation_id}>"
