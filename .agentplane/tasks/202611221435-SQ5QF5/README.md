---
id: "202611221435-SQ5QF5"
title: "Keep frozen Calc cells stationary during browser scroll"
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
  - "git diff --check"
  - "npm run test:calc -- calc-pane-commands calc-outline-window viewdata"
  - "npm run test:e2e -- --project calc xlsx-frozen-grid.spec.ts xlsx-split-grid.spec.ts"
  - "npm run typecheck"
plan_approval:
  state: "approved"
  updated_at: "2026-11-22T14:35:26.938Z"
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
    at: "2026-11-22T14:35:33.614Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: continue direct-mode task in current checkout."
doc_version: 3
doc_updated_at: "2026-11-22T14:35:33.614Z"
doc_updated_by: "CODER"
description: "Anchor frozen grid content to the browser scrollport along its frozen axes, and cover the transient position before the native view updates."
sections:
  Summary: "Keep frozen Calc cells visually stationary on their frozen axes during native browser scrolling."
  Scope: "Calc grid rendering and the existing XLSX frozen-grid browser regression."
  Plan: "Anchor the frozen row and column content in the DOM scrollport, preserving native virtual grid coordinates, selection, editing and normal split behavior. Extend the existing Chromium regression to measure each frozen axis before a scroll event can update the view, then run targeted Calc tests, type checks and the related browser specs."
  Verify Steps: |-
    - `npm run test:calc -- calc-pane-commands calc-outline-window viewdata`
    - `npm run typecheck`
    - `npm run test:e2e -- --project calc xlsx-frozen-grid.spec.ts xlsx-split-grid.spec.ts`
    - `git diff --check`
  Verification: "Pending implementation."
  Rollback Plan: "Revert the Calc rendering and browser regression changes together."
  Findings: "The grid positions frozen cells using the last reported browser scroll offsets. A browser scroll can move those cells before React receives and applies the new offsets."
id_source: "generated"
---
## Summary

Keep frozen Calc cells visually stationary on their frozen axes during native browser scrolling.

## Scope

Calc grid rendering and the existing XLSX frozen-grid browser regression.

## Plan

Anchor the frozen row and column content in the DOM scrollport, preserving native virtual grid coordinates, selection, editing and normal split behavior. Extend the existing Chromium regression to measure each frozen axis before a scroll event can update the view, then run targeted Calc tests, type checks and the related browser specs.

## Verify Steps

- `npm run test:calc -- calc-pane-commands calc-outline-window viewdata`
- `npm run typecheck`
- `npm run test:e2e -- --project calc xlsx-frozen-grid.spec.ts xlsx-split-grid.spec.ts`
- `git diff --check`

## Verification

Pending implementation.

## Rollback Plan

Revert the Calc rendering and browser regression changes together.

## Findings

The grid positions frozen cells using the last reported browser scroll offsets. A browser scroll can move those cells before React receives and applies the new offsets.
