from sqlalchemy import (
    CheckConstraint,
    Column,
    Date,
    Integer,
    Numeric,
    String,
    Time,
    UniqueConstraint,
)

from app.database.base import Base


class Agendamento(Base):
    __tablename__ = "agendamentos"

    # UniqueConstraint impede que existam dois agendamentos com a mesma
    __table_args__ = (
        UniqueConstraint(
            "data",
            "hora",
            name="uq_agendamento_data_hora",
        ),
        CheckConstraint(
            "numero_pessoas >= 1",
            name="ck_agendamento_numero_pessoas",
        ),
        CheckConstraint(
            "tipo IN ('normal', 'privado')",
            name="ck_agendamento_tipo",
        ),
        CheckConstraint(
            """
            total = numero_pessoas *
            CASE WHEN tipo = 'normal' THEN 100 ELSE 150 END
            """,
            name="ck_agendamento_total",
        ),
    )

    id = Column(Integer, primary_key=True, index=True)

    nome = Column(String(100), nullable=False)

    email = Column(String(150), nullable=False, index=True)

    contacto = Column(String(30), nullable=False)

    numero_pessoas = Column(Integer, nullable=False)

    tipo = Column(String(10), nullable=False)

    total = Column(Numeric(12, 2), nullable=False)

    data = Column(Date, nullable=False)

    hora = Column(Time, nullable=False)


