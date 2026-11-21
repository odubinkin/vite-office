---
id: "202611211651-3NASPH"
title: "Align Calc ODS statistical and duplicate conditions"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 5
origin:
  system: "manual"
depends_on: []
tags:
  - "calc"
  - "code"
verify:
  - "Run scoped Calc conditional format, ODS and Worker tests plus office typecheck, lint, format, dependency and provenance checks."
plan_approval:
  state: "approved"
  updated_at: "2026-11-21T16:51:49.476Z"
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
    at: "2026-11-21T16:52:04.387Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: continue direct-mode task in current checkout."
doc_version: 3
doc_updated_at: "2026-11-21T16:52:04.387Z"
doc_updated_by: "CODER"
description: "Port original ODS condition grammar, native range statistics and duplicate predicates, and round trips through the model and Worker."
sections:
  Summary: "Align Calc ODS duplicate, rank and average conditions with LibreOffice."
  Scope: "Original Calc condition and XML owners, native sparse range evaluation, existing rendering and Worker transport where needed, tests and source registration. Include duplicate/unique, top/bottom count/percentage and four average modes."
  Plan: "Port the original XML grammar and range statistics, reproduce native comparison and count boundaries, and exercise state after editing, Worker transfer and reopening."
  Verify Steps: "Run scoped Calc condition, ODS and Worker suites, office typecheck, lint, format, dependency and provenance checks, routing and doctor. Use Graphify for direct closeout."
  Verification: "Pending."
  Rollback Plan: "Revert the implementation commit."
  Findings: "None at intake."
id_source: "generated"
---
## Summary

Align Calc ODS duplicate, rank and average conditions with LibreOffice.

## Scope

Original Calc condition and XML owners, native sparse range evaluation, existing rendering and Worker transport where needed, tests and source registration. Include duplicate/unique, top/bottom count/percentage and four average modes.

## Plan

Port the original XML grammar and range statistics, reproduce native comparison and count boundaries, and exercise state after editing, Worker transfer and reopening.

## Verify Steps

Run scoped Calc condition, ODS and Worker suites, office typecheck, lint, format, dependency and provenance checks, routing and doctor. Use Graphify for direct closeout.

## Verification

Pending.

## Rollback Plan

Revert the implementation commit.

## Findings

None at intake.
