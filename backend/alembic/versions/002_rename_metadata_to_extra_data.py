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
    # Check if columns exist before renaming (safe migration)
    conn = op.get_bind()
    inspector = sa.inspect(conn)
    
    # Rename metadata to extra_data in event_items table (if metadata exists)
    if 'event_items' in inspector.get_table_names():
        columns = [col['name'] for col in inspector.get_columns('event_items')]
        if 'metadata' in columns and 'extra_data' not in columns:
            op.alter_column('event_items', 'metadata', new_column_name='extra_data')
    
    # Rename metadata to extra_data in assistant_knowledge table (if metadata exists)
    if 'assistant_knowledge' in inspector.get_table_names():
        columns = [col['name'] for col in inspector.get_columns('assistant_knowledge')]
        if 'metadata' in columns and 'extra_data' not in columns:
            op.alter_column('assistant_knowledge', 'metadata', new_column_name='extra_data')


def downgrade() -> None:
    # Check if columns exist before renaming (safe migration)
    conn = op.get_bind()
    inspector = sa.inspect(conn)
    
    # Rename extra_data back to metadata in event_items table (if extra_data exists)
    if 'event_items' in inspector.get_table_names():
        columns = [col['name'] for col in inspector.get_columns('event_items')]
        if 'extra_data' in columns and 'metadata' not in columns:
            op.alter_column('event_items', 'extra_data', new_column_name='metadata')
    
    # Rename extra_data back to metadata in assistant_knowledge table (if extra_data exists)
    if 'assistant_knowledge' in inspector.get_table_names():
        columns = [col['name'] for col in inspector.get_columns('assistant_knowledge')]
        if 'extra_data' in columns and 'metadata' not in columns:
            op.alter_column('assistant_knowledge', 'extra_data', new_column_name='metadata')
