"""Adicionar detalhes da reserva preservando os registos antigos."""

from alembic import op
import sqlalchemy as sa


revision = "5a29641d1b8f"
down_revision = "03ee451d8d87"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # As reservas antigas não possuem estes dados.
    op.add_column(
        "agendamentos",
        sa.Column("contacto", sa.String(30), nullable=True),
    )
    op.add_column(
        "agendamentos",
        sa.Column("numero_pessoas", sa.Integer(), nullable=True),
    )
    op.add_column(
        "agendamentos",
        sa.Column("tipo", sa.String(10), nullable=True),
    )
    op.add_column(
        "agendamentos",
        sa.Column("total", sa.Numeric(12, 2), nullable=True),
    )

    op.create_check_constraint(
        "ck_agendamento_numero_pessoas",
        "agendamentos",
        "numero_pessoas >= 1",
    )
    op.create_check_constraint(
        "ck_agendamento_tipo",
        "agendamentos",
        "tipo IN ('normal', 'privado')",
    )
    op.create_check_constraint(
        "ck_agendamento_total",
        "agendamentos",
        """
        total = numero_pessoas *
        CASE WHEN tipo = 'normal' THEN 100 ELSE 150 END
        """,
    )


def downgrade() -> None:
    op.drop_constraint(
        "ck_agendamento_total", "agendamentos", type_="check"
    )
    op.drop_constraint(
        "ck_agendamento_tipo", "agendamentos", type_="check"
    )
    op.drop_constraint(
        "ck_agendamento_numero_pessoas", "agendamentos", type_="check"
    )

    op.drop_column("agendamentos", "total")
    op.drop_column("agendamentos", "tipo")
    op.drop_column("agendamentos", "numero_pessoas")
    op.drop_column("agendamentos", "contacto")