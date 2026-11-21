---
id: "202611210606-N1HD11"
title: "Align Writer ODT page bitmap sizing and positioning"
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
  - "Run scoped Writer page and story ODT, UNO and Worker tests, shared fill-item tests, typecheck, lint, format, dependencies, provenance, routing and doctor."
plan_approval:
  state: "approved"
  updated_at: "2026-11-21T06:06:26.723Z"
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
    body: "Start: connect actual DrawingLayer bitmap geometry to modern and legacy Writer ODT page layouts."
events:
  -
    type: "status"
    at: "2026-11-21T06:06:27.082Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: connect actual DrawingLayer bitmap geometry to modern and legacy Writer ODT page layouts."
doc_version: 3
doc_updated_at: "2026-11-21T06:06:27.082Z"
doc_updated_by: "CODER"
description: "Port DrawingLayer bitmap geometry items and page style contracts, shared page-layout mapping, legacy placement and Worker values for page and story fills."
sections:
  Summary: "Align Writer ODT page and header/footer bitmap geometry with the pinned DrawingLayer items and page-layout handlers."
  Scope: "Native fill size, logical flag, rectangle position, offsets, page style properties, Worker snapshots, legacy image placement, source registry and ODT regression coverage."
  Plan: "Port original item values, UNO size and offset conversion, modern and legacy shared XML mapping, and Worker persistence. Verify scoped tests and source evidence."
  Verify Steps: "Run scoped Writer ODT page and story, native property and Worker suites and shared fill/bitmap parser tests. Run office typecheck, scoped ESLint and Prettier, module boundaries, provenance, routing, doctor and git diff checks."
  Verification: "Pending implementation."
  Rollback Plan: "Revert the task implementation commit."
  Findings: "None at intake."
id_source: "generated"
---
## Summary

Align Writer ODT page and header/footer bitmap geometry with the pinned DrawingLayer items and page-layout handlers.

## Scope

Native fill size, logical flag, rectangle position, offsets, page style properties, Worker snapshots, legacy image placement, source registry and ODT regression coverage.

## Plan

Port original item values, UNO size and offset conversion, modern and legacy shared XML mapping, and Worker persistence. Verify scoped tests and source evidence.

## Verify Steps

Run scoped Writer ODT page and story, native property and Worker suites and shared fill/bitmap parser tests. Run office typecheck, scoped ESLint and Prettier, module boundaries, provenance, routing, doctor and git diff checks.

## Verification

Pending implementation.

## Rollback Plan

Revert the task implementation commit.

## Findings

None at intake.
