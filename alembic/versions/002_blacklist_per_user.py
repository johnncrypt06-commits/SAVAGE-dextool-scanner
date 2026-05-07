"""make token_blacklist unique per user

Revision ID: 002_blacklist_per_user
Revises: 001_initial_schema
Create Date: 2026-05-07
"""
from alembic import op
import sqlalchemy as sa

revision = '002_blacklist_per_user'
down_revision = '001_initial_schema'
branch_labels = None
depends_on = None

TABLE = 'token_blacklist'
OLD_COLUMNS = {'token_address', 'chain'}
NEW_COLUMNS = ['token_address', 'chain', 'added_by']
NEW_CONSTRAINT = 'uq_token_blacklist_token_address_chain_added_by'
RESTORED_CONSTRAINT = 'uq_token_blacklist_token_address_chain'

NAMING_CONVENTION = {"uq": "uq_%(table_name)s_%(column_0_N_name)s"}


def _inspect_unique(table, column_set):
    insp = sa.inspect(op.get_bind())
    named, has_unnamed = [], False
    for uc in insp.get_unique_constraints(table):
        if set(uc['column_names']) == column_set:
            if uc['name']:
                named.append(uc['name'])
            else:
                has_unnamed = True
    return named, has_unnamed


def upgrade() -> None:
    named, has_unnamed = _inspect_unique(TABLE, OLD_COLUMNS)

    if has_unnamed:
        with op.batch_alter_table(
            TABLE, recreate='always', naming_convention=NAMING_CONVENTION
        ) as batch_op:
            batch_op.drop_constraint(
                'uq_token_blacklist_token_address_chain', type_='unique'
            )
            batch_op.create_unique_constraint(NEW_CONSTRAINT, NEW_COLUMNS)
    else:
        with op.batch_alter_table(TABLE) as batch_op:
            for name in named:
                batch_op.drop_constraint(name, type_='unique')
            batch_op.create_unique_constraint(NEW_CONSTRAINT, NEW_COLUMNS)


def downgrade() -> None:
    named, has_unnamed = _inspect_unique(TABLE, set(NEW_COLUMNS))

    if has_unnamed:
        with op.batch_alter_table(
            TABLE, recreate='always', naming_convention=NAMING_CONVENTION
        ) as batch_op:
            batch_op.drop_constraint(
                'uq_token_blacklist_token_address_chain_added_by', type_='unique'
            )
            batch_op.create_unique_constraint(
                RESTORED_CONSTRAINT, ['token_address', 'chain']
            )
    else:
        with op.batch_alter_table(TABLE) as batch_op:
            for name in named:
                batch_op.drop_constraint(name, type_='unique')
            batch_op.create_unique_constraint(
                RESTORED_CONSTRAINT, ['token_address', 'chain']
            )
