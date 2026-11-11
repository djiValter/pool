from datetime import date, datetime
from typing import Annotated
from zoneinfo import ZoneInfo

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.crud import agendamento as crud
from app.database.connection import get_db
from app.schemas.agendamento import (
    AgendamentoCreate,
    AgendamentoOcupadoResponse,
    AgendamentoResponse,
)
from app.services.email import enviar_email_agendamento

router = APIRouter(
    prefix="/agendamentos",
    tags=["Agendamentos"],
)


@router.post(
    "/",
    response_model=AgendamentoResponse,
    status_code=status.HTTP_201_CREATED,
)
def criar_agendamento(
    dados: AgendamentoCreate,
    background_tasks: BackgroundTasks,
    db: Annotated[Session, Depends(get_db)],
):
    fuso = ZoneInfo("Africa/Maputo")

    if dados.hora.tzinfo is not None:
        raise HTTPException(
            status_code=422,
            detail="Envia a hora local, sem indicação de fuso horário.",
        )

    inicio = datetime.combine(dados.data, dados.hora, tzinfo=fuso)

    if inicio <= datetime.now(fuso):
        raise HTTPException(
            status_code=400,
            detail="Escolhe uma data e uma hora futuras.",
        )

    try:
        agendamento = crud.criar_agendamento(db, dados)
    except crud.HorarioOcupadoError as erro:
        raise HTTPException(
            status_code=409,
            detail=str(erro),
        ) from erro

    background_tasks.add_task(
        enviar_email_agendamento,
        nome=agendamento.nome,
        email_visitante=agendamento.email,
        data=agendamento.data,
        hora=agendamento.hora,
    )

    return agendamento


@router.get(
    "/ocupados",
    response_model=list[AgendamentoOcupadoResponse],
)
def listar_horarios_ocupados(
    inicio: date,
    fim: date,
    db: Annotated[Session, Depends(get_db)],
):
    if fim < inicio:
        raise HTTPException(
            status_code=400,
            detail="A data final deve ser igual ou posterior à inicial.",
        )

    return crud.listar_horarios_ocupados(db, inicio, fim)
