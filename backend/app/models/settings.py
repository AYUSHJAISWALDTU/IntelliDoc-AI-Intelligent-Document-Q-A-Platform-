import uuid
import datetime
from sqlalchemy import Column, String, DateTime, Text, ForeignKey, Integer, Boolean
from sqlalchemy.orm import relationship
from app.database import Base


def generate_uuid():
    return str(uuid.uuid4())


class ApiKey(Base):
    __tablename__ = "api_keys"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    provider = Column(String(50), nullable=False)
    encrypted_key = Column(Text, nullable=False)
    key_preview = Column(String(20), nullable=True)  # e.g. "sk-...7xQ2"
    label = Column(String(100), nullable=True)
    is_valid = Column(Boolean, nullable=True)
    last_tested_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)

    user = relationship("User", back_populates="api_keys")

    def __repr__(self):
        return f"<ApiKey {self.provider} for user {self.user_id}>"


class UserSettings(Base):
    __tablename__ = "user_settings"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, unique=True)
    default_model = Column(String(50), default="gpt-4o")
    chunk_size = Column(Integer, default=1000)
    chunk_overlap = Column(Integer, default=200)
    response_style = Column(String(20), default="detailed")  # concise|detailed|exhaustive
    theme = Column(String(20), default="system")
    created_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    user = relationship("User", back_populates="settings")
