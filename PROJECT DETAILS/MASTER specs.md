# MATCHMIND ONE
## Master Engineering Specification

Version: 1.0
Status: Engineering Design
Project Type: AI Broadcast Intelligence Layer
Challenge: IBM SkillsBuild AI Innovation Challenge – AI Inside the Match

---

# Table of Contents

1. Executive Summary
2. Vision
3. Problem Statement
4. Why Existing Broadcasts Fall Short
5. Product Philosophy
6. Human-Centered Design Principles
7. Project Goals
8. Success Metrics
9. Target Users
10. User Personas
11. Product Positioning
12. High-Level System Overview
13. Core Features
14. AI Insight Philosophy
15. Broadcast Integration
16. Personalization
17. IBM Technology Mapping
18. Functional Requirements
19. Non-Functional Requirements
20. Engineering Principles

(Additional sections will continue in subsequent parts.)

---

# 1. Executive Summary

MatchMind One is an AI-powered Broadcast Intelligence Layer that enhances live football broadcasts with contextual, explainable, and personalized insights.

Rather than asking viewers to open another app, search online, or pause the broadcast, MatchMind One integrates directly into the viewing experience by displaying concise AI-generated explanations only when they add meaningful value.

The platform is designed around a simple philosophy:

> Football should remain the focus.
> AI should quietly improve understanding.

The system analyzes significant match events, retrieves relevant football knowledge, reasons over the available context using IBM Granite, and generates short explanations adapted to each viewer's experience level.

These explanations are displayed as lightweight broadcast overlays that disappear automatically, ensuring the viewing experience remains uninterrupted.

---

# 2. Vision

To make football understandable for everyone without changing how people watch football.

Whether someone is watching their first World Cup match or has followed football for decades, MatchMind One adapts to the individual instead of expecting the individual to adapt to the game.

---

# 3. Problem Statement

Football is the most watched sport on Earth.

Yet millions of viewers struggle to understand:

- Why goals are disallowed.
- Why referees make certain decisions.
- What tactical changes are happening.
- Why momentum suddenly shifts.
- Why substitutions matter.
- Why commentators become excited before casual fans notice anything.

Modern broadcasts provide information.

They rarely provide understanding.

Statistics answer:

"What happened?"

Viewers usually want to know:

"Why did it happen?"

This gap between information and understanding reduces trust, limits accessibility, and makes football less enjoyable for new audiences.

---

# 4. Why Existing Broadcasts Fall Short

Current broadcasts are optimized for experienced fans.

They assume viewers already understand:

- Football terminology
- Tactical systems
- FIFA Laws of the Game
- Referee signals
- VAR procedures
- Coaching decisions

Most broadcasts rely on:

- Scoreboards
- Statistics
- Possession graphs
- Heat maps
- Commentary

These are useful for knowledgeable viewers but often overwhelming or confusing for everyone else.

Current experiences rarely adapt to the viewer.

Every person receives the same information regardless of their experience or accessibility needs.

---

# 5. Product Philosophy

MatchMind One is not another football application.

It is not another statistics dashboard.

It is not another AI chatbot.

It is an Understanding Layer.

Its responsibility is to answer one question:

"Would this viewer benefit from an explanation right now?"

If the answer is no, the AI remains silent.

If the answer is yes, the AI provides a concise, trustworthy explanation and then disappears.

The match always remains the center of attention.

---

# 6. Human-Centered Design Principles

## 6.1 Football Comes First

The match is the primary experience.

AI must never obstruct gameplay, scoreboards, replays, or commentary.

---

## 6.2 Explain Only When Necessary

Routine events should never generate explanations.

Only meaningful events should trigger AI insights.

Examples include:

- VAR reviews
- Penalty decisions
- Red cards
- Tactical shifts
- Significant momentum changes
- High-impact substitutions

---

## 6.3 Adapt to the Viewer

Different viewers require different explanations.

The same event may produce multiple valid explanations depending on the selected profile.

---

## 6.4 Build Trust

Every explanation should communicate:

- Why
- Supporting evidence
- Relevant Law (if applicable)
- Confidence level

The system should never pretend certainty where uncertainty exists.

---

## 6.5 Accessibility by Design

Accessibility is considered from the first design decision.

The system supports:

- Multiple languages
- Reading-level adaptation
- Large text mode
- Simplified explanations
- Reduced visual clutter

---

# 7. Project Goals

Primary Goals

- Improve understanding of football.
- Increase trust in officiating decisions.
- Make football more accessible.
- Demonstrate explainable AI.
- Showcase meaningful IBM AI integration.

Secondary Goals

- Reduce viewer confusion.
- Improve fan engagement.
- Encourage learning.
- Demonstrate future broadcast integration.

---

# 8. Success Metrics

The prototype is successful if it demonstrates:

- Personalized explanations.
- Explainable reasoning.
- Human-centered design.
- Non-intrusive overlays.
- Clear IBM technology integration.
- Professional engineering quality.

---

# 9. Target Users

Primary

- New football fans.
- Casual viewers.
- International audiences.
- Young viewers.
- Accessibility users.

Secondary

- Broadcasters.
- Sports analysts.
- Football educators.
- Football organizations.

---

# 10. User Personas

## New Fan

Knowledge:
Minimal.

Needs:
Simple explanations.

Goal:
Understand football without feeling overwhelmed.

---

## Casual Viewer

Knowledge:
Basic.

Needs:
Clear context.

Goal:
Enjoy major tournaments.

---

## Analyst

Knowledge:
Advanced.

Needs:
Detailed tactical reasoning.

Goal:
Deep match understanding.

---

## Child

Knowledge:
Minimal.

Needs:
Friendly explanations.

Goal:
Learn while enjoying the match.

---

## Accessibility User

Needs:
Customized presentation.

Examples:

- Larger text.
- Simpler language.
- High contrast.
- Slower pacing.

---

# 11. Product Positioning

MatchMind One should never be described as:

- AI Chatbot
- Football Assistant
- Match Dashboard

Instead:

> MatchMind One is an AI Broadcast Intelligence Layer that enhances football broadcasts with personalized, explainable insights without interrupting the viewing experience.

---

# 12. High-Level System Overview

```text
Live Match Feed
        │
        ▼
 Event Detection Layer
        │
        ▼
 Context Retrieval
        │
        ├── Match Data
        ├── FIFA Laws
        ├── User Profile
        └── Historical Context
        │
        ▼
 IBM Granite Reasoning
        │
        ▼
 Explainable Response
        │
        ▼
 Broadcast Overlay
        │
        ▼
 Viewer Understanding
```

---

# 13. Core Features

### Adaptive AI Insights

Generate personalized explanations for important match events.

---

### Explainable Reasoning

Every explanation includes supporting reasoning and confidence.

---

### Broadcast Overlay System

Display lightweight, auto-dismissing insight cards that never obstruct the match.

---

### Viewer Profiles

Adapt explanations based on viewer experience and preferences.

---

### Knowledge Retrieval

Use official football documentation to support explanations.

---

# 14. AI Insight Philosophy

The AI should answer questions viewers naturally ask:

- Why was that a penalty?
- Why was the goal disallowed?
- Why did the game suddenly change?
- Why did the coach make that substitution?
- Why is one team dominating possession?

The AI should avoid unnecessary commentary.

---

# 15. Broadcast Integration

The prototype simulates how broadcasters could integrate MatchMind One.

Insights appear:

- After replays.
- During pauses.
- Following controversial decisions.
- During significant tactical moments.

Insights automatically disappear after a few seconds.

No user interaction is required.

---

# 16. Personalization

Supported profiles:

- New Fan
- Casual Viewer
- Analyst
- Child
- Accessibility

Each profile changes:

- Vocabulary
- Detail level
- Tactical depth
- Reading complexity
- Visual presentation

---

# 17. IBM Technology Mapping

IBM Granite
- Natural language reasoning.
- Personalized explanations.
- Explainable responses.

LangFlow
- Workflow orchestration.
- Prompt assembly.
- Knowledge retrieval pipeline.

Docling
- Parse FIFA Laws, technical reports, and referee documentation into searchable structured content.

Context Forge
- Persist user profile, conversation context, and personalization state.

IBM Bob
- Development-time coding assistant used during implementation.

---

# 18. Functional Requirements (Initial)

FR-001: The system shall allow a viewer profile to be selected.

FR-002: The system shall retrieve official football knowledge relevant to the current event.

FR-003: The system shall generate explanations using IBM Granite.

FR-004: The system shall display explanations in a broadcast-safe overlay.

FR-005: Overlays shall dismiss automatically.

FR-006: The same event shall produce different explanations for different viewer profiles.

FR-007: The system shall display confidence information.

FR-008: The system shall not obstruct core broadcast elements.

---

# 19. Non-Functional Requirements

- Responsive user interface.
- Scalable architecture.
- Modular services.
- Accessibility compliance.
- Secure API communication.
- Low-latency responses.
- Maintainable codebase.

---

# 20. Engineering Principles

- Modular architecture.
- Clear separation of concerns.
- Consistent naming conventions.
- Production-quality code.
- Documentation-first development.
- AI-assisted implementation guided by specifications.
- Human-centered design in every feature.

---

**End of Part 1**

# ============================================================================
# PART 2 — TECHNICAL ARCHITECTURE & IMPLEMENTATION
# ============================================================================

# 21. System Architecture

## Overview

MatchMind One follows a modern AI-first microservice-inspired architecture.

The system is composed of independent layers, each with a single responsibility.

Viewer
    │
    ▼
React Frontend
    │
    ▼
FastAPI Backend
    │
    ▼
LangFlow AI Pipeline
    │
 ┌──┴───────────────┐
 │                  │
 ▼                  ▼
Docling         Context Forge
 │                  │
 └──────┬───────────┘
        ▼
 IBM Granite
        │
        ▼
Response Builder
        │
        ▼
Frontend Overlay Engine

Every layer should remain independent.

No component should directly communicate with another unless documented.

---

# 22. Technology Stack

Frontend

React 19

TypeScript

Vite

TailwindCSS

Framer Motion

React Router

Axios

React Query

Lucide Icons

Zod

React Hook Form

Backend

Python 3.12+

FastAPI

Pydantic

Uvicorn

SQLAlchemy

Alembic

LangChain

LangFlow

IBM Granite SDK

Docling

Context Forge Client

Redis

PostgreSQL

Docker

Docker Compose

Testing

Pytest

Vitest

Playwright

ESLint

Prettier

Black

isort

---

# 23. Development Environment

Required Software

VS Code

Git

Python 3.12

Node.js LTS

pnpm

Docker Desktop

IBM Cloud Account

GitHub Account

IBM Granite API Access

---

# 24. Repository Structure

matchmind-one/

README.md

LICENSE

.gitignore

.env.example

docker-compose.yml

frontend/

backend/

docs/

assets/

scripts/

tests/

.github/

---

Frontend

frontend/

src/

api/

components/

features/

layouts/

pages/

hooks/

contexts/

types/

utils/

styles/

assets/

---

Backend

backend/

app/

api/

core/

config/

database/

models/

schemas/

services/

repositories/

langflow/

granite/

docling/

context/

middleware/

prompts/

utils/

tests/

---

Documentation

docs/

00_PROJECT_OVERVIEW.md

01_PRODUCT_SPECIFICATION.md

02_SYSTEM_ARCHITECTURE.md

03_TECH_STACK.md

04_DATABASE.md

05_API.md

06_AI_ENGINE.md

07_UI_SYSTEM.md

08_COMPONENTS.md

09_USER_FLOW.md

10_DEPLOYMENT.md

11_TESTING.md

12_DEMO.md

13_CODEX_MASTER_PROMPT.md

---

# 25. Frontend Architecture

The frontend should be developed using React with TypeScript.

Design Philosophy

Minimal

Elegant

Broadcast-inspired

Fast

Responsive

Accessibility-first

The frontend should never resemble an analytics dashboard.

It should resemble a premium streaming platform.

---

Pages

Landing Page

Profile Selection

Match Experience

Replay Viewer

Settings

Developer Mode

About

---

Component Hierarchy

App

Navigation

Match Experience

Video Container

Broadcast Overlay Layer

Timeline

Insight Card

Profile Badge

Replay Controls

Settings Modal

Footer

---

# 26. Backend Architecture

FastAPI acts as the orchestration layer.

Responsibilities

Authentication

Match retrieval

Knowledge retrieval

AI orchestration

Response formatting

API management

Logging

---

Service Layer

Match Service

User Service

Knowledge Service

Insight Service

Granite Service

Context Service

Overlay Service

---

# 27. Database

PostgreSQL

Tables

users

profiles

matches

events

insights

rules

conversation_history

settings

---

Users

id

email

username

created_at

---

Profiles

id

user_id

experience_level

language

reading_level

overlay_enabled

font_size

high_contrast

voice_enabled

---

Matches

id

competition

home_team

away_team

venue

date

status

---

Events

id

match_id

minute

type

description

team

player

---

Insights

id

event_id

granite_output

confidence

law_reference

created_at

---

# 28. API

GET

/api/matches

Returns matches.

GET

/api/matches/{id}

Returns one match.

GET

/api/events/{id}

Returns event.

POST

/api/explain

Main AI endpoint.

Request

{

"profile":"new_fan",

"event_id":45

}

Response

{

"title":"Penalty Awarded",

"explanation":"...",

"confidence":"High",

"law":"Law 12"

}

POST

/api/profile

Updates user profile.

GET

/api/settings

Returns settings.

---

# 29. IBM Granite

Purpose

Reasoning Engine

Granite receives

User profile

Match event

Relevant rule

Historical context

Prompt

Granite returns

Explanation

Evidence

Confidence

Suggested overlay

Granite never accesses the database directly.

---

Prompt Template

SYSTEM

You are MatchMind One.

You explain football.

Never invent facts.

Never guess.

Always explain reasoning.

Always adapt to the selected user profile.

Always cite the appropriate Law of the Game if applicable.

---

USER

Profile

New Fan

Question

Why wasn't that a penalty?

Match Event

...

Rule

...

Generate

Headline

Explanation

Evidence

Confidence

Applicable Law

Maximum two sentences.

---

# 30. LangFlow

LangFlow orchestrates the AI workflow.

Pipeline

Question

↓

Retrieve User Profile

↓

Retrieve Match

↓

Retrieve Event

↓

Retrieve Rule

↓

Retrieve Previous Context

↓

Build Prompt

↓

Granite

↓

Validate Output

↓

Return JSON

Every node has one responsibility.

---

# 31. Docling

Purpose

Transform football documentation into structured knowledge.

Sources

FIFA Laws

Referee Manuals

Technical Reports

Competition Regulations

Output

Markdown

JSON

Structured Sections

The processed knowledge is stored for retrieval.

Docling runs offline during data ingestion, not on every user request.

---

# 32. Context Forge

Purpose

Maintain context and personalization.

Stores

User profile

Language

Knowledge level

Previous explanations

Frequently asked topics

Current match context

The AI uses this context to avoid repeating explanations and to tailor future responses.

---

# 33. Overlay System

The overlay is the defining feature of MatchMind One.

Requirements

- Never block the score bug.
- Never cover the ball.
- Never obscure subtitles or captions.
- Fade in smoothly.
- Remain visible for 5–8 seconds.
- Fade out automatically.
- Support accessibility settings.

Default placement: lower-right corner.

Style: semi-transparent glassmorphism with rounded corners and subtle shadow.

---

# 34. Initial Package Installation

## Frontend

```bash
pnpm create vite frontend --template react-ts
cd frontend

pnpm add react-router-dom
pnpm add @tanstack/react-query
pnpm add axios
pnpm add zod
pnpm add react-hook-form
pnpm add framer-motion
pnpm add lucide-react
pnpm add tailwindcss
pnpm add clsx
pnpm add class-variance-authority
pnpm add sonner
pnpm add date-fns

pnpm add -D typescript
pnpm add -D eslint
pnpm add -D prettier
pnpm add -D vite
```

## Backend

```bash
mkdir backend
cd backend

python -m venv .venv

# Windows
.venv\Scripts\activate

# macOS/Linux
source .venv/bin/activate

pip install fastapi
pip install uvicorn
pip install sqlalchemy
pip install alembic
pip install psycopg2-binary
pip install pydantic
pip install python-dotenv
pip install langchain
pip install langflow
pip install docling
pip install redis
pip install pytest
pip install black
pip install isort
```

> **Note:** IBM Granite and Context Forge access methods may depend on the IBM environment you use (for example, watsonx.ai or local/community tooling). We'll document those integrations once you've selected your IBM runtime and obtained the required credentials.

---

**End of Part 2**