from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="API de Agendamento de Mergulhos")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "https://NOME-DO-FRONT.vercel.app",
    ],
    allow_credentials=False,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
)

from app.routers import agendamento

app.include_router(agendamento.router)
#@app.get("/")
#def inicio():
    #return {"mensagem": "API de agendamentos a funcionar"}
