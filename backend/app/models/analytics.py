from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from datetime import datetime
from backend.app.database import Base

class AnalyticsLog(Base):
    __tablename__ = "analytics_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    session_id = Column(Integer, ForeignKey("simulation_sessions.id", ondelete="SET NULL"), nullable=True)
    tokens_generated = Column(Integer, default=0)
    execution_time_ms = Column(Float, default=0.0)
    created_at = Column(DateTime, default=datetime.utcnow)
