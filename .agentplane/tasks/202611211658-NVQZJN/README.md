---
id: "202611211658-NVQZJN"
title: "Align Writer ODT frame bitmap fill properties"
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
  - "Run Writer frame, page fill and Worker suites, shared XML fill tests, typecheck and static checks."
plan_approval:
  state: "approved"
  updated_at: "2026-11-21T16:58:46.146Z"
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
    at: "2026-11-21T16:59:13.313Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: continue direct-mode task in current checkout."
doc_version: 3
doc_updated_at: "2026-11-21T16:59:13.313Z"
doc_updated_by: "CODER"
description: "Connect named DrawingLayer bitmap fills and geometry to Writer graphic style import, native text frames, Worker and ODT export using common XML mapping and bitmap declarations."
sections:
  Summary: "Align named Writer bitmap fills on ODT text frames with the original graphic style map."
  Scope: "Shared bitmap property conversion, graphic style inheritance, native fly fill items, shared package bitmap declarations, Worker and ODT regressions, and source registration. Existing page and story fills use the same mapping."
  Plan: "Share the original geometry handlers and named graphic table. Import inherited bitmap names and native frame items, emit declarations and frame properties through one ODT export catalogue, and verify the represented frame fixtures."
  Verify Steps: "Run focused Writer ODT frame, page fill, Worker and round trip tests; run shared fill tests, office typecheck, scope ESLint/Prettier, dependencies, source provenance, routing, doctor and diff checks."
  Verification: "Pending."
  Rollback Plan: "Revert the implementation commit."
  Findings: "None at intake."
id_source: "generated"
---
## Summary

Align named Writer bitmap fills on ODT text frames with the original graphic style map.

## Scope

Shared bitmap property conversion, graphic style inheritance, native fly fill items, shared package bitmap declarations, Worker and ODT regressions, and source registration. Existing page and story fills use the same mapping.

## Plan

Share the original geometry handlers and named graphic table. Import inherited bitmap names and native frame items, emit declarations and frame properties through one ODT export catalogue, and verify the represented frame fixtures.

## Verify Steps

Run focused Writer ODT frame, page fill, Worker and round trip tests; run shared fill tests, office typecheck, scope ESLint/Prettier, dependencies, source provenance, routing, doctor and diff checks.

## Verification

Pending.

## Rollback Plan

Revert the implementation commit.

## Findings

None at intake.
