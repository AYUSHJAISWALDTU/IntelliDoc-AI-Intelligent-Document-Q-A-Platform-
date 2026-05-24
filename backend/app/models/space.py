import uuid
import datetime
from sqlalchemy import Column, String, DateTime, Text, ForeignKey, BigInteger
from sqlalchemy.orm import relationship
from app.database import Base


def generate_uuid():
    return str(uuid.uuid4())


class Space(Base):
    __tablename__ = "spaces"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    color = Column(String(20), nullable=True, default="#6366F1")
    icon = Column(String(50), nullable=True, default="📁")
    storage_used = Column(BigInteger, default=0, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    user = relationship("User", back_populates="spaces")
    documents = relationship("Document", back_populates="space", cascade="all, delete-orphan")
    conversations = relationship("Conversation", back_populates="space", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Space {self.name}>"
