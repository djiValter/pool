import logging
import os
import smtplib
import ssl
from datetime import date, time
from decimal import Decimal

from email.message import EmailMessage

logger = logging.getLogger(__name__)


def enviar_email_agendamento(
    *,
    nome: str,
    email_visitante: str,
    contacto: str,
    data: date,
    hora: time,
    tipo: str,
    numero_pessoas: int,
    total: Decimal,
) -> None:
    """Envia ao responsável os dados de um agendamento confirmado."""
    try:
        remetente = os.environ["SMTP_USER"]

        mensagem = EmailMessage()
        mensagem["From"] = remetente
        mensagem["To"] = os.environ["RESPONSAVEL_EMAIL"]
        mensagem["Subject"] = "Novo agendamento da piscina"

        mensagem.set_content(
            "Novo agendamento confirmado\n\n"
            f"Nome: {nome}\n"
            f"E-mail do visitante: {email_visitante}\n"
            f"Contacto: {contacto}\n"
            f"Data: {data:%d/%m/%Y}\n"
            f"Hora: {hora:%H:%M}\n"
            f"Tipo de reserva: {tipo.capitalize()}\n"
            f"Número de pessoas: {numero_pessoas}\n"
            f"Preço total: {total:.2f} MT\n"
        )

        with smtplib.SMTP(
            os.environ["SMTP_HOST"],
            int(os.getenv("SMTP_PORT", "587")),
            timeout=10,
        ) as servidor:
            servidor.starttls(context=ssl.create_default_context())
            servidor.login(remetente, os.environ["SMTP_PASSWORD"])
            servidor.send_message(mensagem)

    except (KeyError, ValueError, OSError) as erro:
        logger.error(
            "Falha no envio do e-mail de agendamento (%s).",
            type(erro).__name__,
        )