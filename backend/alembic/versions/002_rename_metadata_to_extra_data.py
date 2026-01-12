"""Rename metadata to extra_data

Revision ID: 002_rename_metadata
Revises: 001_initial
Create Date: 2026-01-12

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = '002_rename_metadata'
down_revision: Union[str, None] = '001_initial'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Rename metadata to extra_data in event_items table
    op.alter_column('event_items', 'metadata', new_column_name='extra_data')
    
    # Rename metadata to extra_data in assistant_knowledge table
    op.alter_column('assistant_knowledge', 'metadata', new_column_name='extra_data')


def downgrade() -> None:
    # Rename extra_data back to metadata in event_items table
    op.alter_column('event_items', 'extra_data', new_column_name='metadata')
    
    # Rename extra_data back to metadata in assistant_knowledge table
    op.alter_column('assistant_knowledge', 'extra_data', new_column_name='metadata')
