---
id: "202611211708-9W0FQ4"
title: "Align Writer ODT legacy frame background conversion"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 5
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
  - "writer"
verify:
  - "Run focused Writer ODT frame, page background and Worker coverage, shared brush and style suites, office typecheck and static checks."
plan_approval:
  state: "approved"
  updated_at: "2026-11-21T17:08:58.203Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "pending"
  updated_at: null
  updated_by: null
  note: null
  attempts: 0
commit: null
comments:
  -
    author: "CODER"
    body: "Start: continue direct-mode task in current checkout."
events:
  -
    type: "status"
    at: "2026-11-21T17:09:04.463Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: continue direct-mode task in current checkout."
doc_version: 3
doc_updated_at: "2026-11-21T17:09:04.463Z"
doc_updated_by: "CODER"
description: "Port old graphic and color brush behavior for ODT frame styles, native fill precedence, and compatible frame background XML serialization."
sections:
  Summary: "Align the Writer ODT legacy frame background property states and bitmap compatibility export with the pinned source."
  Scope: "Frame graphic style and shared text XML context, compatible brush color and embedded raster conversion, modern fill precedence, shared legacy bitmap serialization and ODT and Worker regressions. Gradients and external graphic loading remain outside this slice."
  Plan: "Capture legacy color, opacity and image children through original property contexts, apply native brush conversion and precedence, and serialize supported compatibility child properties alongside the modern fill. Port represented assertions from the original framebackgrounds fixture."
  Verify Steps: "Run focused Writer ODT frame, page, inline graphics, Worker and RTF frame tests, shared brush and XML property suites, office typecheck, ESLint/Prettier, dependencies, source provenance, routing, doctor and diff checks."
  Verification: "Pending."
  Rollback Plan: "Revert the implementation commit."
  Findings: "None at intake."
id_source: "generated"
---
## Summary

Align the Writer ODT legacy frame background property states and bitmap compatibility export with the pinned source.

## Scope

Frame graphic style and shared text XML context, compatible brush color and embedded raster conversion, modern fill precedence, shared legacy bitmap serialization and ODT and Worker regressions. Gradients and external graphic loading remain outside this slice.

## Plan

Capture legacy color, opacity and image children through original property contexts, apply native brush conversion and precedence, and serialize supported compatibility child properties alongside the modern fill. Port represented assertions from the original framebackgrounds fixture.

## Verify Steps

Run focused Writer ODT frame, page, inline graphics, Worker and RTF frame tests, shared brush and XML property suites, office typecheck, ESLint/Prettier, dependencies, source provenance, routing, doctor and diff checks.

## Verification

Pending.

## Rollback Plan

Revert the implementation commit.

## Findings

None at intake.
