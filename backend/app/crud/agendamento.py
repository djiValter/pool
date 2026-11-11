from datetime import date

from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.model.agendamento import Agendamento
from app.schemas.agendamento import AgendamentoCreate


# pass: deixa o corpo da classe vazio; ela herda o comportamento de Exception.
class HorarioOcupadoError(Exception):
    pass


def criar_agendamento(
    db: Session,
    dados: AgendamentoCreate,
) -> Agendamento:
    agendamento = Agendamento(**dados.model_dump())

    db.add(agendamento)

    try:
        db.commit()
    except IntegrityError as erro:
        db.rollback()

        diagnostico = getattr(erro.orig, "diag", None)
        restricao = getattr(diagnostico, "constraint_name", None)

        if restricao == "uq_agendamento_data_hora":
            raise HorarioOcupadoError("Este horário já está reservado.") from erro

        raise

    db.refresh(agendamento)

    return agendamento


def listar_horarios_ocupados(
    db: Session,
    inicio: date,
    fim: date,
):
    consulta = (
        select(Agendamento.data, Agendamento.hora)
        .where(
            Agendamento.data >= inicio,
            Agendamento.data <= fim,
        )
        .order_by(Agendamento.data, Agendamento.hora)
    )

    return db.execute(consulta).all()


def buscar_agendamento_por_id(
    db: Session,
    agendamento_id: int,
) -> Agendamento | None:
    return db.get(Agendamento, agendamento_id)
