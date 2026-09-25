---
id: "202609250801-62BX99"
title: "Keep Writer table picker above toolbars"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 10
origin:
  system: "manual"
depends_on: []
tags:
  - "ui"
  - "writer"
task_kind: "code"
mutation_scope: "code"
verify:
  - "Playwright mobile table grid interaction"
  - "npm run verify"
plan_approval:
  state: "approved"
  updated_at: "2026-09-25T08:02:22.669Z"
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
    body: "Start: correct the table grid stacking and clipping, then verify mobile pointer interaction."
events:
  -
    type: "status"
    at: "2026-09-25T08:02:23.470Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: correct the table grid stacking and clipping, then verify mobile pointer interaction."
doc_version: 3
doc_updated_at: "2026-09-25T08:02:23.470Z"
doc_updated_by: "CODER"
description: "Fix table quick grid clipping and hit testing inside the scrollable standard toolbar, preserving outside dismissal and table insertion; verify on mobile and desktop."
sections:
  Summary: "Fix the Writer Insert Table quick grid so it remains visible and clickable above the standard and formatting toolbars."
  Scope: "WriterTableInsertControl and its focused unit/browser tests. Preserve grid selection, More Options, outside click dismissal, and existing save/export controls."
  Plan: "1. Move the Insert Table grid into a viewport-positioned overlay above the toolbar while keeping its anchor and dismissal behavior. 2. Add a browser assertion that a grid cell is the actual pointer target on mobile, then insert a table. 3. Run focused and full verification, record evidence, and commit the fix."
  Verify Steps: "1. Run focused Writer quick control tests. 2. Run Playwright mobile table grid interaction with a real hit target check. 3. Run npm run verify. 4. Inspect final git diff and status."
  Verification: "Pending."
  Rollback Plan: "Revert the implementation and test commit for this task."
  Findings: "The standard toolbar has overflow-x-auto; the nested absolute grid is clipped and its visible region loses pointer hits."
id_source: "generated"
---
## Summary

Fix the Writer Insert Table quick grid so it remains visible and clickable above the standard and formatting toolbars.

## Scope

WriterTableInsertControl and its focused unit/browser tests. Preserve grid selection, More Options, outside click dismissal, and existing save/export controls.

## Plan

1. Move the Insert Table grid into a viewport-positioned overlay above the toolbar while keeping its anchor and dismissal behavior. 2. Add a browser assertion that a grid cell is the actual pointer target on mobile, then insert a table. 3. Run focused and full verification, record evidence, and commit the fix.

## Verify Steps

1. Run focused Writer quick control tests. 2. Run Playwright mobile table grid interaction with a real hit target check. 3. Run npm run verify. 4. Inspect final git diff and status.

## Verification

Pending.

## Rollback Plan

Revert the implementation and test commit for this task.

## Findings

The standard toolbar has overflow-x-auto; the nested absolute grid is clipped and its visible region loses pointer hits.
