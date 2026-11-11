"""criar tabela agendamentos

Revision ID: ab6d162a43a3
Revises: 
Create Date: 2026-11-10 20:42:14.687954

"""
from collections.abc import Sequence

# revision identifiers, used by Alembic.
revision: str = 'ab6d162a43a3'
down_revision: str | Sequence[str] | None = None
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    """Upgrade schema."""


def downgrade() -> None:
    """Downgrade schema."""
