# MATCHMIND ONE

# IMPLEMENTATION ORDER

Version 1.0

Status:
Master Development Roadmap

---

# Purpose

This document defines the exact order in which MatchMind One must be implemented.

The goal is to eliminate inconsistent AI-generated code by ensuring every feature is built on a stable foundation.

Codex must never skip phases.

Each phase depends on the successful completion of the previous one.

---

# Development Philosophy

Never build features before infrastructure.

Never build UI before APIs.

Never build AI before data.

Never build polish before functionality.

Always complete the foundation first.

---

# Overall Roadmap

Phase 1

Project Initialization

↓

Phase 2

Development Environment

↓

Phase 3

Frontend Foundation

↓

Phase 4

Backend Foundation

↓

Phase 5

Database

↓

Phase 6

AI Infrastructure

↓

Phase 7

Broadcast Experience

↓

Phase 8

Overlay Intelligence

↓

Phase 9

Personalization

↓

Phase 10

Accessibility

↓

Phase 11

Testing

↓

Phase 12

Deployment

↓

Phase 13

Demo Preparation

---

========================================================================

PHASE 1

PROJECT INITIALIZATION

========================================================================

Objective

Create a clean, production-ready repository.

Tasks

Initialize Git repository.

Create monorepo structure.

Configure workspaces.

Create documentation folders.

Configure VS Code settings.

Create .gitignore.

Create README.

Acceptance Criteria

✓ Repository builds.

✓ Folder structure complete.

✓ Documentation committed.

Do Not Proceed Until

Repository structure is finalized.

---

========================================================================

PHASE 2

DEVELOPMENT ENVIRONMENT

========================================================================

Objective

Prepare all required tools.

Tasks

Install Node.js.

Install Python.

Configure Docker.

Install PostgreSQL.

Create virtual environment.

Install frontend dependencies.

Install backend dependencies.

Configure linting.

Configure formatting.

Acceptance Criteria

✓ npm install succeeds.

✓ pip install succeeds.

✓ Docker starts successfully.

✓ Project builds without errors.

---

========================================================================

PHASE 3

FRONTEND FOUNDATION

========================================================================

Objective

Build the application shell.

Tasks

Create React project.

Configure routing.

Install Tailwind.

Create layout.

Create theme.

Create navigation.

Create reusable component library.

Pages

Landing

Broadcast

Settings

About

Acceptance Criteria

✓ Routing works.

✓ Responsive.

✓ Theme consistent.

✓ Components reusable.

---

========================================================================

PHASE 4

BACKEND FOUNDATION

========================================================================

Objective

Create API server.

Tasks

Initialize FastAPI.

Environment variables.

Logging.

Health endpoint.

Configuration.

Dependency injection.

Acceptance Criteria

GET /health

returns

200 OK

---

========================================================================

PHASE 5

DATABASE

========================================================================

Tasks

Configure PostgreSQL.

Create migrations.

Users table.

Profiles table.

Matches table.

Events table.

Insights table.

Rules table.

Acceptance Criteria

✓ All migrations execute.

✓ Relationships verified.

✓ Seed data loads.

---

========================================================================

PHASE 6

AI INFRASTRUCTURE

========================================================================

Objective

Create AI pipeline.

Tasks

Granite integration.

LangFlow.

Docling ingestion.

Context Forge.

Prompt templates.

Validation.

Acceptance Criteria

Input

↓

Granite

↓

JSON

↓

API

↓

Frontend

Must complete successfully.

---

========================================================================

PHASE 7

MATCH EXPERIENCE

========================================================================

Objective

Create broadcast simulation.

Tasks

Broadcast page.

Video placeholder.

Timeline.

Scoreboard.

Commentary panel.

Replay controls.

Acceptance Criteria

Feels like watching a match.

Not a dashboard.

---

========================================================================

PHASE 8

OVERLAY SYSTEM

========================================================================

Objective

Create the defining feature.

Tasks

Overlay layer.

Animation.

Positioning.

Auto dismissal.

Priority queue.

Timing.

Acceptance Criteria

Never blocks scoreboard.

Never blocks action.

Smooth animations.

Automatically disappears.

---

========================================================================

PHASE 9

AI INSIGHT ENGINE

========================================================================

Objective

Generate explanations.

Pipeline

Event

↓

Knowledge

↓

Granite

↓

Formatting

↓

Overlay

Features

Penalty explanations.

VAR explanations.

Offside explanations.

Momentum explanations.

Tactical explanations.

Substitution explanations.

Acceptance Criteria

Every explanation

Concise.

Explainable.

Personalized.

Grounded.

---

========================================================================

PHASE 10

PERSONALIZATION

========================================================================

Profiles

New Fan

Casual

Analyst

Child

Accessibility

Each changes

Vocabulary.

Sentence length.

Explanation depth.

Overlay behavior.

Acceptance Criteria

Same event produces different outputs.

---

========================================================================

PHASE 11

ACCESSIBILITY

========================================================================

Tasks

Large text.

High contrast.

Reduced motion.

Keyboard navigation.

Screen reader labels.

Language selection.

Acceptance Criteria

WCAG-inspired experience.

---

========================================================================

PHASE 12

TESTING

========================================================================

Unit Tests

API Tests

Frontend Tests

Integration Tests

AI Response Validation

Overlay Tests

Acceptance Criteria

Critical paths tested.

No breaking errors.

---

========================================================================

PHASE 13

DEPLOYMENT

========================================================================

Docker

Environment Variables

Production Build

Frontend Deployment

Backend Deployment

Acceptance Criteria

Runs locally with one command.

---

========================================================================

PHASE 14

DEMO PREPARATION

========================================================================

Objective

Prepare IBM demonstration.

Tasks

Sample match events.

Sample overlays.

User profile switching.

AI explanations.

Accessibility demonstration.

Acceptance Criteria

Three-minute demo tells a complete story.

---

# Codex Working Rules

For every phase:

Read the engineering documentation before coding.

Complete every task.

Run tests.

Fix errors.

Commit changes.

Only then proceed.

---

# Commit Strategy

Each phase must end with a commit.

Examples

feat(frontend): initialize React application

feat(api): create FastAPI server

feat(database): create initial schema

feat(ai): integrate Granite reasoning

feat(ui): implement overlay engine

feat(profile): adaptive explanation system

test(api): add integration tests

docs: update engineering documentation

---

# Definition of Done

A phase is complete only if:

✓ Code compiles

✓ Tests pass

✓ Documentation updated

✓ Linting passes

✓ No console errors

✓ Accessibility reviewed

✓ Feature matches specification

---

# Final Instruction to Codex

Do not skip phases.

Do not invent architecture.

Do not implement undocumented features.

Always prioritize maintainability over speed.

When uncertain, refer back to:

- 00_PROJECT_OVERVIEW.md
- 01_PRODUCT_SPECIFICATION.md
- 02_SYSTEM_ARCHITECTURE.md
- 13_CODEX_MASTER_PROMPT.md

These documents are the source of truth.

The objective is not merely to build software.

The objective is to build a professional, production-quality prototype that convincingly demonstrates how explainable AI can enhance live football broadcasting through human-centered design.