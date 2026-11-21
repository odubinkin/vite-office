---
id: "202611211827-Q9AG7E"
title: "Round-trip Calc ODS drawing grid and view options"
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
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-11-21T18:27:25.581Z"
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
    body: "Start: implement native drawing-grid ownership and ODS view settings with Worker transfer and fixture coverage."
events:
  -
    type: "status"
    at: "2026-11-21T18:27:30.577Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implement native drawing-grid ownership and ODS view settings with Worker transfer and fixture coverage."
doc_version: 3
doc_updated_at: "2026-11-21T18:27:30.577Z"
doc_updated_by: "CODER"
description: "Port the native ScViewData settings for the existing drawing-grid value type and the remaining represented display flags. Import legacy per-sheet TabColor into the native model. Preserve the settings across the Calc Worker and verify the ODF XML contract with pinned LibreOffice fixtures and focused tests."
sections:
  Summary: "Preserve the drawing grid and represented display settings on Calc ODS import and export, including the native legacy tab color input."
  Scope: "ScViewOptions ownership, ODS view settings and Calc document Worker transfer. Use pinned LibreOffice viewdata.cxx, viewopti.hxx and the existing drawing-grid type."
  Plan: |-
    - Match the native ODF names, scalar types, defaults and legacy tab-color writer asymmetry.
    - Reuse the current Calc view-options and tab color owners and transfer their state through the Worker.
    - Cover the pinned ODS settings and critical XML/transfer behavior.
  Verify Steps: |-
    - Run `npm run test:calc -- viewdata.settings.test.ts viewopti.grid.test.ts ods-worker --maxWorkers 2 --testTimeout 120000` to cover ODS, view options and Worker boundaries.
    - Run the office workspace typecheck and ESLint and Prettier on changed TypeScript.
    - Run `npm run check:dependencies`, `npm run check:source-provenance`, `node .agentplane/policy/check-routing.mjs`, `ap doctor` and `git diff --check`.
  Verification: "Pending."
  Rollback Plan: "Revert the scoped implementation commit."
  Findings: "None recorded yet."
id_source: "generated"
---
## Summary

Preserve the drawing grid and represented display settings on Calc ODS import and export, including the native legacy tab color input.

## Scope

ScViewOptions ownership, ODS view settings and Calc document Worker transfer. Use pinned LibreOffice viewdata.cxx, viewopti.hxx and the existing drawing-grid type.

## Plan

- Match the native ODF names, scalar types, defaults and legacy tab-color writer asymmetry.
- Reuse the current Calc view-options and tab color owners and transfer their state through the Worker.
- Cover the pinned ODS settings and critical XML/transfer behavior.

## Verify Steps

- Run `npm run test:calc -- viewdata.settings.test.ts viewopti.grid.test.ts ods-worker --maxWorkers 2 --testTimeout 120000` to cover ODS, view options and Worker boundaries.
- Run the office workspace typecheck and ESLint and Prettier on changed TypeScript.
- Run `npm run check:dependencies`, `npm run check:source-provenance`, `node .agentplane/policy/check-routing.mjs`, `ap doctor` and `git diff --check`.

## Verification

Pending.

## Rollback Plan

Revert the scoped implementation commit.

## Findings

None recorded yet.
