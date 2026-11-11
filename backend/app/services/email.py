import json
import logging
import os
from datetime import date, time
from decimal import Decimal
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

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
    """Envia a notificação de reserva pela API HTTPS do Brevo."""
    try:
        conteudo = (
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

        dados = {
            "sender": {
                "name": "Mergulhos Mundiais",
                "email": os.environ["EMAIL_REMETENTE"],
            },
            "to": [
                {"email": os.environ["RESPONSAVEL_EMAIL"]},
            ],
            "subject": "Novo agendamento da piscina",
            "textContent": conteudo,
        }

        pedido = Request(
            url="https://api.brevo.com/v3/smtp/email",
            data=json.dumps(dados).encode("utf-8"),
            headers={
                "api-key": os.environ["BREVO_API_KEY"],
                "Content-Type": "application/json",
                "Accept": "application/json",
            },
            method="POST",
        )

        with urlopen(pedido, timeout=20) as resposta:
            resultado = json.load(resposta)

        logger.info(
            "Brevo aceitou a notificação. messageId=%s",
            resultado.get("messageId"),
        )

    except HTTPError as erro:
        logger.error(
            "Brevo rejeitou o envio. HTTP=%s. Resposta=%s",
            erro.code,
            erro.read().decode("utf-8", errors="replace"),
        )
    except (URLError, OSError, KeyError, ValueError) as erro:
        logger.error(
            "Falha no envio da notificação (%s): %s",
            type(erro).__name__,
            str(erro),
        )