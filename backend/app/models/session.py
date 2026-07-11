from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from backend.app.database import Base

class SimulationSession(Base):
    __tablename__ = "simulation_sessions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=True) # None for Guest
    prompt = Column(Text, nullable=False)
    model_name = Column(String, nullable=False)
    parameters = Column(Text, nullable=False) # JSON string of top_k, top_p, temp, etc.
    output_text = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User")
