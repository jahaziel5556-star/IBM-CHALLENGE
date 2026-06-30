"""Initial MatchMind One schema."""

from alembic import op
import sqlalchemy as sa


revision = "20260630_0001"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "matches",
        sa.Column("id", sa.String(), nullable=False),
        sa.Column("competition", sa.String(), nullable=False),
        sa.Column("home_team", sa.String(), nullable=False),
        sa.Column("away_team", sa.String(), nullable=False),
        sa.Column("venue", sa.String(), nullable=False),
        sa.Column("date", sa.String(), nullable=False),
        sa.Column("status", sa.String(), nullable=False),
        sa.Column("score_home", sa.Integer(), nullable=False),
        sa.Column("score_away", sa.Integer(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_table(
        "profiles",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("profile", sa.String(), nullable=False),
        sa.Column("language", sa.String(), nullable=False),
        sa.Column("large_text", sa.Boolean(), nullable=False),
        sa.Column("high_contrast", sa.Boolean(), nullable=False),
        sa.Column("reduced_motion", sa.Boolean(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_table(
        "rules",
        sa.Column("event_type", sa.String(), nullable=False),
        sa.Column("prompt_template", sa.String(), nullable=False),
        sa.Column("overlay_seconds", sa.Integer(), nullable=False),
        sa.PrimaryKeyConstraint("event_type"),
    )
    op.create_table(
        "events",
        sa.Column("id", sa.String(), nullable=False),
        sa.Column("match_id", sa.String(), nullable=False),
        sa.Column("minute", sa.Integer(), nullable=False),
        sa.Column("type", sa.String(), nullable=False),
        sa.Column("title", sa.String(), nullable=False),
        sa.Column("team", sa.String(), nullable=False),
        sa.Column("opponent", sa.String(), nullable=False),
        sa.Column("summary", sa.String(), nullable=False),
        sa.Column("analysis", sa.String(), nullable=False),
        sa.Column("child_summary", sa.String(), nullable=False),
        sa.Column("confidence", sa.String(), nullable=False),
        sa.Column("law_reference", sa.String(), nullable=True),
        sa.Column("silent_recommended", sa.Boolean(), nullable=False),
        sa.ForeignKeyConstraint(["match_id"], ["matches.id"]),
        sa.ForeignKeyConstraint(["type"], ["rules.event_type"]),
        sa.PrimaryKeyConstraint("id"),
    )


def downgrade() -> None:
    op.drop_table("events")
    op.drop_table("rules")
    op.drop_table("profiles")
    op.drop_table("matches")
