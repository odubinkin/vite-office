---
id: "202609241521-Q9V21Y"
title: "Implement canonical Writer table slice"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 7
origin:
  system: "manual"
depends_on:
  - "202609241521-GAQ2CN"
tags:
  - "code"
task_kind: "code"
mutation_scope: "code"
verify:
  - "Run pinned table ODT fixtures, structural round trip, paragraph/list regression and UI table edit/reopen tests."
  - "npm run verify"
plan_approval:
  state: "approved"
  updated_at: "2026-09-24T15:23:17.580Z"
  updated_by: "ORCHESTRATOR"
  note: "User requested implementation of the seven ordered phases in docs/program/certification-odt-import-plan.md; outside-repo sample access remains pending separate authorization."
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
    at: "2026-09-24T21:06:27.585Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: continue direct-mode task in current checkout."
doc_version: 3
doc_updated_at: "2026-09-24T21:06:27.585Z"
doc_updated_by: "CODER"
description: "Phase 5: upstream-shaped SwTable rows/cells/styles, layout/editing, Worker transfer, export and table UI."
sections:
  Summary: |-
    Implement canonical Writer table slice

    Phase 5: upstream-shaped SwTable rows/cells/styles, layout/editing, Worker transfer, export and table UI.
  Scope: "Canonical SwTable rows/cells/styles in document order, import/export, Worker transfer, browser layout/editing and table UI."
  Plan: |-
    1. Model ordered table rows/cells/paragraphs using pinned Writer node ownership.
    2. Import table elements and observed width/height/padding/border/alignment properties.
    3. Render/edit/select and transfer/export from the same model.
    4. Add Insert Table, Table Properties and contextual controls, then run source-backed and UI tests.
  Verify Steps: |-
    1. `npm run verify` passes.
    2. `tdf41542_borderlessPadding.odt` and `IndexingExport_Tables.odt` tests assert cell order/styles and structural export/reimport.
    3. UI tests insert a table, edit row/column/cell properties and reopen.
    4. Private sample has exactly five rows and fifteen cells with ordered content; paragraph/list regressions pass.
    5. The three table-owned soft page breaks in the private sample retain their logical table/cell positions through import/export/reimport.
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: |-
    - Revert task-related commit(s).
    - Re-run required checks to confirm rollback safety.
  Findings: ""
id_source: "generated"
---
## Summary

Implement canonical Writer table slice

Phase 5: upstream-shaped SwTable rows/cells/styles, layout/editing, Worker transfer, export and table UI.

## Scope

Canonical SwTable rows/cells/styles in document order, import/export, Worker transfer, browser layout/editing and table UI.

## Plan

1. Model ordered table rows/cells/paragraphs using pinned Writer node ownership.
2. Import table elements and observed width/height/padding/border/alignment properties.
3. Render/edit/select and transfer/export from the same model.
4. Add Insert Table, Table Properties and contextual controls, then run source-backed and UI tests.

## Verify Steps

1. `npm run verify` passes.
2. `tdf41542_borderlessPadding.odt` and `IndexingExport_Tables.odt` tests assert cell order/styles and structural export/reimport.
3. UI tests insert a table, edit row/column/cell properties and reopen.
4. Private sample has exactly five rows and fifteen cells with ordered content; paragraph/list regressions pass.
5. The three table-owned soft page breaks in the private sample retain their logical table/cell positions through import/export/reimport.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert task-related commit(s).
- Re-run required checks to confirm rollback safety.

## Findings
