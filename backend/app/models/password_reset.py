from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Index
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database import Base


class PasswordResetToken(Base):
    __tablename__ = "password_reset_tokens"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    email = Column(String, nullable=False, index=True)  # Email manzili
    code = Column(String, nullable=False)  # 6 xonali kod
    is_used = Column(Integer, default=0)  # 0 = ishlatilmagan, 1 = ishlatilgan
    expires_at = Column(DateTime(timezone=True), nullable=False, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    used_at = Column(DateTime(timezone=True), nullable=True)

    # Relationship
    user = relationship("User", backref="password_reset_tokens")

    __table_args__ = (
        Index('idx_password_reset_user_email', 'user_id', 'email'),
        Index('idx_password_reset_code', 'code'),
    )

    def __repr__(self):
        return f"<PasswordResetToken {self.email} - {self.code}>"

