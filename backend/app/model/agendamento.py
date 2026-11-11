from app.database.base import Base
from sqlalchemy import Column, Date, Integer, String, Time, UniqueConstraint


class Agendamento(Base):
    __tablename__ = "agendamentos"

    # UniqueConstraint impede que existam dois agendamentos com a mesma
    __table_args__ = (
        UniqueConstraint(
            "data",
            "hora",
            name="uq_agendamento_data_hora",
        ),
    )

    id = Column(Integer, primary_key=True, index=True)

    nome = Column(String(100), nullable=False)

    email = Column(String(150), nullable=False, index=True)

    data = Column(Date, nullable=False)

    hora = Column(Time, nullable=False)
