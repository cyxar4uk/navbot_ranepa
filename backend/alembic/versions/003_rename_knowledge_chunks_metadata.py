"""Rename metadata to extra_data in knowledge_chunks

Revision ID: 004_rename_knowledge_chunks_metadata
Revises: 003_knowledge_chunks
Create Date: 2026-01-13

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '004_rename_knowledge_chunks_metadata'
down_revision: Union[str, None] = '003_knowledge_chunks'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Check if column exists before renaming (in case migration 002 already created extra_data)
    conn = op.get_bind()
    inspector = sa.inspect(conn)
    columns = [col['name'] for col in inspector.get_columns('knowledge_chunks')]
    
    if 'metadata' in columns and 'extra_data' not in columns:
        # Rename metadata to extra_data in knowledge_chunks table
        op.alter_column('knowledge_chunks', 'metadata', new_column_name='extra_data')


def downgrade() -> None:
    # Rename extra_data back to metadata in knowledge_chunks table
    conn = op.get_bind()
    inspector = sa.inspect(conn)
    columns = [col['name'] for col in inspector.get_columns('knowledge_chunks')]
    
    if 'extra_data' in columns and 'metadata' not in columns:
        op.alter_column('knowledge_chunks', 'extra_data', new_column_name='metadata')
