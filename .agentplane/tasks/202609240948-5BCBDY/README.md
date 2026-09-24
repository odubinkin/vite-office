---
id: "202609240948-5BCBDY"
title: "Port upstream Continue Numbering ODT regression"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 6
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify:
  - "Run focused list, undo, and ODT fixture Vitest suites, typecheck, lint, and format checks on changed paths."
  - "Run npm run verify and agentplane doctor; record results and any residual risks."
  - "Run the pinned tdf113213_addToList.odt fixture test: initial label 1., continue numbering produces 3 with restart cleared, Undo restores 1. and original list state; Redo reapplies the join."
plan_approval:
  state: "approved"
  updated_at: "2026-09-24T09:48:53.726Z"
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
    body: "Start: implement Continue Numbering and exact undo semantics against the pinned upstream ODT fixture, then verify all declared assertions."
events:
  -
    type: "status"
    at: "2026-09-24T09:49:01.228Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implement Continue Numbering and exact undo semantics against the pinned upstream ODT fixture, then verify all declared assertions."
doc_version: 3
doc_updated_at: "2026-09-24T09:49:01.228Z"
doc_updated_by: "CODER"
description: "Implement Writer Continue Numbering with atomic undo and port every behavioral assertion of pinned LibreOffice testTdf113213_addToList using the existing vendor ODT fixture."
sections:
  Summary: |-
    Port upstream Continue Numbering ODT regression

    Implement Writer Continue Numbering with atomic undo and port every behavioral assertion of pinned LibreOffice testTdf113213_addToList using the existing vendor ODT fixture.
  Scope: "Implement .uno:ContinueNumbering in Writer list command dispatch and shell, including list identity/rule adoption, restart removal, counter refresh, and one-step Undo/Redo. Port the pinned upstream testTdf113213_addToList assertions into scripts/libreoffice-inventory/odt-upstream-fixtures.test.ts using the ignored vendor fixture. Limit implementation edits to Writer list/model/undo/command files and this fixture test; update parity evidence only if required by enforced checks."
  Plan: |-
    1. Inspect the pinned upstream test, Writer list identifiers, command registration, and list undo action.
    2. Implement Continue Numbering for the selected second list as one reversible model transition, preserving previous state and providing a visible label.
    3. Add a real-ODT regression that checks initial label, resulting label and restart state, Undo, and Redo.
    4. Run focused tests and repository verification; record exact evidence and finish the scoped task.
  Verify Steps: "1. Run the real tdf113213_addToList.odt regression: initial paragraph 6 label is 1.; Continue Numbering produces 3, clears restart, and joins the preceding list; one Undo restores the initial label, list identity, rule, and restart; Redo restores the joined state. 2. Run focused Writer list/undo and ODT fixture tests. 3. Run npm run typecheck, npm run lint, npm run format:check, npm run verify, and ap doctor; record command results. 4. Confirm task-scoped diff and final tracked state contain no unintended changes."
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

Port upstream Continue Numbering ODT regression

Implement Writer Continue Numbering with atomic undo and port every behavioral assertion of pinned LibreOffice testTdf113213_addToList using the existing vendor ODT fixture.

## Scope

Implement .uno:ContinueNumbering in Writer list command dispatch and shell, including list identity/rule adoption, restart removal, counter refresh, and one-step Undo/Redo. Port the pinned upstream testTdf113213_addToList assertions into scripts/libreoffice-inventory/odt-upstream-fixtures.test.ts using the ignored vendor fixture. Limit implementation edits to Writer list/model/undo/command files and this fixture test; update parity evidence only if required by enforced checks.

## Plan

1. Inspect the pinned upstream test, Writer list identifiers, command registration, and list undo action.
2. Implement Continue Numbering for the selected second list as one reversible model transition, preserving previous state and providing a visible label.
3. Add a real-ODT regression that checks initial label, resulting label and restart state, Undo, and Redo.
4. Run focused tests and repository verification; record exact evidence and finish the scoped task.

## Verify Steps

1. Run the real tdf113213_addToList.odt regression: initial paragraph 6 label is 1.; Continue Numbering produces 3, clears restart, and joins the preceding list; one Undo restores the initial label, list identity, rule, and restart; Redo restores the joined state. 2. Run focused Writer list/undo and ODT fixture tests. 3. Run npm run typecheck, npm run lint, npm run format:check, npm run verify, and ap doctor; record command results. 4. Confirm task-scoped diff and final tracked state contain no unintended changes.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert task-related commit(s).
- Re-run required checks to confirm rollback safety.

## Findings
