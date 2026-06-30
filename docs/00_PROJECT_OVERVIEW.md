# MatchMind One

## Project Overview

**Version:** 1.0

**Status:** Implementation Started

**Challenge:** IBM SkillsBuild AI Innovation Challenge

## Executive Summary

MatchMind One is an AI-powered Broadcast Intelligence Layer designed to improve how viewers understand football without disrupting the live match. The platform adds concise, explainable, profile-aware insight overlays only when an explanation adds genuine value.

## Core Promise

Football remains the focus. AI should quietly improve understanding by explaining why meaningful events happened, why they matter, and what changed.

## Product Intent

- Improve understanding of officiating, tactics, and momentum
- Increase trust through explainable reasoning and confidence signals
- Adapt insight depth and language to each viewer profile
- Respect accessibility, pacing, and broadcast-safe placement

## IBM Alignment

- `watsonx.ai / Granite`: reasoning and explanation generation
- `LangFlow`: orchestration seams
- `Docling`: structured football knowledge ingestion
- `Context Forge`: personalization context seams

## Implementation Notes

- Seeded match and event data are used first for reliability and demo readiness
- IBM adapters remain real integration points but support a mock path until credentials are configured
- The event engine specification in `15_EVENT_ENGINE_SPECIFICATION.md` is the AI behavior rulebook
