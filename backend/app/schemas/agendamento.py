from datetime import date, time
from decimal import Decimal
from typing import Literal

from pydantic import BaseModel, ConfigDict, EmailStr, Field


# Dados recebidos pelo formulário
class AgendamentoCreate(BaseModel):
    nome: str = Field(min_length=2, max_length=100)
    email: EmailStr = Field(max_length=150)
    contacto: str = Field(min_length=7, max_length=30)
    numero_pessoas: int = Field(ge=1, strict=True)
    tipo: Literal["normal", "privado"]
    data: date
    hora: time


# Dados devolvidos após criar o agendamento
class AgendamentoResponse(BaseModel):
    id: int
    nome: str
    email: EmailStr
    contacto: str
    numero_pessoas: int
    tipo: Literal["normal", "privado"]
    total: Decimal
    data: date
    hora: time

    model_config = ConfigDict(from_attributes=True)


# Dados públicos apresentados no calendário
class AgendamentoOcupadoResponse(BaseModel):
    data: date
    hora: time

    model_config = ConfigDict(from_attributes=True)
