---
id: "202609240326-GC72SW"
title: "Improve Writer ruler guides, ticks, snapping, and vertical placement"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 7
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
  - "frontend"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-09-24T03:26:15.715Z"
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
    body: "Start: implement approved Writer ruler guide, snapping, tick, and left-edge placement changes in the current checkout."
events:
  -
    type: "status"
    at: "2026-09-24T03:26:24.025Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implement approved Writer ruler guide, snapping, tick, and left-edge placement changes in the current checkout."
doc_version: 3
doc_updated_at: "2026-09-24T03:26:24.025Z"
doc_updated_by: "CODER"
description: "Show drag guides over pages, add LibreOffice-style minor ruler ticks with snapping, and dock the vertical ruler at the left edge of the canvas."
sections:
  Summary: |-
    Improve Writer ruler guides, ticks, snapping, and vertical placement

    Show drag guides over pages, add LibreOffice-style minor ruler ticks with snapping, and dock the vertical ruler at the left edge of the canvas.
  Scope: "Writer browser ruler, editor/canvas placement, and focused UI tests only. Existing document model and file format remain unchanged."
  Plan: "1. Add fine centimetre subdivisions and use the same step for ruler drag snapping. 2. Project transient dashed guides across the document during margin and indent drags. 3. Move the vertical ruler to a fixed left canvas lane while preserving page-relative tick geometry through scrolling and pagination. 4. Run focused interaction tests, typecheck, and repository validation."
  Verify Steps: "Run focused Writer page-layout interaction tests covering drag guide visibility and cleanup, snapped margin/indent values, minor ticks, and viewport-aligned vertical ruler across pages. Run office typecheck and repository doctor. Confirm git status contains only task-scoped changes."
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert this task's ruler and canvas presentation changes and its focused tests; no document migration is required."
  Findings: ""
id_source: "generated"
---
## Summary

Improve Writer ruler guides, ticks, snapping, and vertical placement

Show drag guides over pages, add LibreOffice-style minor ruler ticks with snapping, and dock the vertical ruler at the left edge of the canvas.

## Scope

Writer browser ruler, editor/canvas placement, and focused UI tests only. Existing document model and file format remain unchanged.

## Plan

1. Add fine centimetre subdivisions and use the same step for ruler drag snapping. 2. Project transient dashed guides across the document during margin and indent drags. 3. Move the vertical ruler to a fixed left canvas lane while preserving page-relative tick geometry through scrolling and pagination. 4. Run focused interaction tests, typecheck, and repository validation.

## Verify Steps

Run focused Writer page-layout interaction tests covering drag guide visibility and cleanup, snapped margin/indent values, minor ticks, and viewport-aligned vertical ruler across pages. Run office typecheck and repository doctor. Confirm git status contains only task-scoped changes.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert this task's ruler and canvas presentation changes and its focused tests; no document migration is required.

## Findings
