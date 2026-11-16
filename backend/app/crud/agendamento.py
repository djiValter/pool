from datetime import date
from decimal import Decimal
from fastapi import HTTPException

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
    precos = {
        "normal": Decimal("100.00"),
        "privado": Decimal("150.00"),
    }

    # Procura reservas no dia seleccionado.
    consulta = select(Agendamento).where(
        Agendamento.data == dados.data
    )

    # Uma reserva normal só entra em conflito com uma privada.
    # Uma reserva privada entra em conflito com qualquer reserva.
    if dados.tipo != "privado":
        consulta = consulta.where(
            Agendamento.tipo == "privado"
        )

    if dados.tipo == "privado" and dados.numero_pessoas < 8:
        raise HTTPException(
            status_code=422,
            detail=(
                "A reserva privada só está disponível "
                "para grupos de 8 ou mais pessoas."
            ),
        )

    conflito = db.scalar(consulta.limit(1))

    if conflito is not None:
        mensagem = (
            "Não é possível reservar em privado: "
            "já existem reservas neste dia."
            if dados.tipo == "privado"
            else "Este dia está reservado para uso privado."
        )

        raise HTTPException(
            status_code=409,
            detail=mensagem,
        )

    valores = dados.model_dump()
    valores["total"] = precos[dados.tipo] * dados.numero_pessoas

    agendamento = Agendamento(**valores)
    db.add(agendamento)

    try:
        db.commit()
    except IntegrityError as erro:
        db.rollback()

        diagnostico = getattr(erro.orig, "diag", None)
        restricao = getattr(
            diagnostico,
            "constraint_name",
            None,
        )

        if restricao == "uq_agendamento_data_hora":
            raise HorarioOcupadoError(
                "Este horário já está reservado."
            ) from erro

        raise

    db.refresh(agendamento)
    return agendamento


def listar_horarios_ocupados(
    db: Session,
    inicio: date,
    fim: date,
):
    consulta = (
        select(
            Agendamento.data,
            Agendamento.hora,
            Agendamento.tipo,
        )
        .where(
            Agendamento.data >= inicio,
            Agendamento.data <= fim,
        )
        .order_by(
            Agendamento.data,
            Agendamento.hora,
        )
    )

    return db.execute(consulta).mappings().all()

def buscar_agendamento_por_id(
    db: Session,
    agendamento_id: int,
) -> Agendamento | None:
    return db.get(Agendamento, agendamento_id)
