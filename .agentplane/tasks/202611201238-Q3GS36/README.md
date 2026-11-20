---
id: "202611201238-Q3GS36"
title: "Connect Calc freeze rows and sheet pane commands"
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
  - "Playwright Calc pane specs for XLSX frozen and split grids"
  - "npm run check:calc-resources"
  - "npm run test:calc -- calc-pane-commands viewdata"
  - "npm run typecheck"
plan_approval:
  state: "approved"
  updated_at: "2026-11-20T12:39:22.091Z"
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
    at: "2026-11-20T12:43:45.925Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: continue direct-mode task in current checkout."
doc_version: 3
doc_updated_at: "2026-11-20T12:43:45.925Z"
doc_updated_by: "CODER"
description: "Prioritize Freeze First Row, then connect the related cursor and column freeze and split commands to the real pane owners. Preserve source mode transitions, active pane, applicable navigation and XLSX view settings; exercise production Calc with focused tests."
sections:
  Summary: "Connect the existing Calc pane model and grid to the source View menu and toolbar, starting with Freeze First Row."
  Scope: "Calc freeze and split slot state and execution, current-sheet pane modes, origins, active pane, and the source freeze-aware start-of-sheet navigation exercised by native QA. Reuse the existing browser pane renderer and supported XLSX view settings. Preserve the browser file workflow."
  Plan: "Implement Freeze First Row first, then the companion pane commands and their source-backed focused tests."
  Verify Steps: |-
    - `npm run test:calc -- calc-pane-commands viewdata` verifies pane slot, view ownership, origin, cursor and settings behavior.
    - `npm run typecheck` checks app and tooling types.
    - `npm run check:calc-resources` preserves pinned resource placements.
    - Run the related Calc XLSX frozen-grid and split-grid Playwright specs against a fresh production build.
    - `git diff --check` checks patch whitespace.
  Verification: "Pending implementation."
  Rollback Plan: "Revert the pane command implementation and keep the previously supported XLSX pane imports and renderer."
  Findings: "Pending source comparison."
id_source: "generated"
---
## Summary

Connect the existing Calc pane model and grid to the source View menu and toolbar, starting with Freeze First Row.

## Scope

Calc freeze and split slot state and execution, current-sheet pane modes, origins, active pane, and the source freeze-aware start-of-sheet navigation exercised by native QA. Reuse the existing browser pane renderer and supported XLSX view settings. Preserve the browser file workflow.

## Plan

Implement Freeze First Row first, then the companion pane commands and their source-backed focused tests.

## Verify Steps

- `npm run test:calc -- calc-pane-commands viewdata` verifies pane slot, view ownership, origin, cursor and settings behavior.
- `npm run typecheck` checks app and tooling types.
- `npm run check:calc-resources` preserves pinned resource placements.
- Run the related Calc XLSX frozen-grid and split-grid Playwright specs against a fresh production build.
- `git diff --check` checks patch whitespace.

## Verification

Pending implementation.

## Rollback Plan

Revert the pane command implementation and keep the previously supported XLSX pane imports and renderer.

## Findings

Pending source comparison.
