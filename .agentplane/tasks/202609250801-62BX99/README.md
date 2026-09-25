---
id: "202609250801-62BX99"
title: "Keep Writer table picker above toolbars"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 12
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
doc_updated_at: "2026-09-25T08:15:01.199Z"
doc_updated_by: "CODER"
description: "Fix table quick grid clipping and hit testing inside the scrollable standard toolbar, preserving outside dismissal and table insertion; verify on mobile and desktop."
sections:
  Summary: "Fix the Writer Insert Table quick grid so it remains visible and clickable above the standard and formatting toolbars."
  Scope: "WriterTableInsertControl and its focused unit/browser tests. Preserve grid selection, More Options, outside click dismissal, and existing save/export controls."
  Plan: "1. Move the Insert Table grid into a viewport-positioned overlay above the toolbar while keeping its anchor and dismissal behavior. 2. Add a browser assertion that a grid cell is the actual pointer target on mobile, then insert a table. 3. Run focused and full verification, record evidence, and commit the fix."
  Verify Steps: "1. Run focused Writer quick control tests. 2. Run Playwright mobile table grid interaction with a real hit target check. 3. Run npm run verify. 4. Inspect final git diff and status."
  Verification: "Command: npx vitest run src/sw/browser/presentation/WriterUpstreamQuickControls.test.tsx (apps/office); Result: pass; Evidence: 2 tests passed; Scope: table quick control. Command: npm run verify; Result: fail on one transient Playwright Paragraph menu detachment after 547 office tests and 109 inventory tests passed with 100% coverage; Scope: full suite. Command: npm run test:e2e; Result: pass; Evidence: 18 tests passed including mobile table hit target and the previously detached menu scenario; Scope: browser flows. Command: npm run test:static && npm run check:docs && npm run check:file-size && npm run check:source-tree && npm run check:source-provenance && npm run inventory:invariants && npm run inventory:parity; Result: pass; Evidence: all remaining stages exited 0; Scope: static and project checks. Command: git diff --check; Result: pass; Evidence: no whitespace errors; Scope: changed paths."
  Rollback Plan: "Revert the implementation and test commit for this task."
  Findings: "The standard toolbar overflow clipped the nested absolute grid. Portaling the grid to the document body with fixed viewport positioning makes cells the topmost pointer target. A full-suite Playwright Paragraph menu click was transiently detached; the isolated scenario and full 18-test browser rerun passed without code changes."
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

Command: npx vitest run src/sw/browser/presentation/WriterUpstreamQuickControls.test.tsx (apps/office); Result: pass; Evidence: 2 tests passed; Scope: table quick control. Command: npm run verify; Result: fail on one transient Playwright Paragraph menu detachment after 547 office tests and 109 inventory tests passed with 100% coverage; Scope: full suite. Command: npm run test:e2e; Result: pass; Evidence: 18 tests passed including mobile table hit target and the previously detached menu scenario; Scope: browser flows. Command: npm run test:static && npm run check:docs && npm run check:file-size && npm run check:source-tree && npm run check:source-provenance && npm run inventory:invariants && npm run inventory:parity; Result: pass; Evidence: all remaining stages exited 0; Scope: static and project checks. Command: git diff --check; Result: pass; Evidence: no whitespace errors; Scope: changed paths.

## Rollback Plan

Revert the implementation and test commit for this task.

## Findings

The standard toolbar overflow clipped the nested absolute grid. Portaling the grid to the document body with fixed viewport positioning makes cells the topmost pointer target. A full-suite Playwright Paragraph menu click was transiently detached; the isolated scenario and full 18-test browser rerun passed without code changes.
