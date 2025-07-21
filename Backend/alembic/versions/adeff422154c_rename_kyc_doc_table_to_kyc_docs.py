"""Rename kyc_doc table to kyc_docs

Revision ID: adeff422154c
Revises: 42cd7595b4ad
Create Date: 2025-07-21 14:46:39.367031

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'adeff422154c'
down_revision = '42cd7595b4ad'
branch_labels = None
depends_on = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
