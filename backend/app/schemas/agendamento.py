from datetime import date, time

from pydantic import BaseModel, ConfigDict, EmailStr, Field


# Dados recebidos pelo formulário
class AgendamentoCreate(BaseModel):
    nome: str = Field(min_length=2, max_length=100)
    email: EmailStr = Field(max_length=150)
    data: date
    hora: time


# Dados devolvidos após criar o agendamento
class AgendamentoResponse(BaseModel):
    id: int
    nome: str
    email: EmailStr
    data: date
    hora: time

    model_config = ConfigDict(from_attributes=True)


# Dados públicos apresentados no calendário
class AgendamentoOcupadoResponse(BaseModel):
    data: date
    hora: time

    model_config = ConfigDict(from_attributes=True)
