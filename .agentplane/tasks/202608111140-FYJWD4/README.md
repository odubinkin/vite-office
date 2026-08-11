---
id: "202608111140-FYJWD4"
title: "Add Writer plain-text paragraph removal"
status: "DOING"
priority: "high"
owner: "CODER"
revision: 4
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-08-11T11:40:23.692Z"
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
    body: "Start: adding safe Writer paragraph removal while preserving the non-empty document body invariant."
events:
  -
    type: "status"
    at: "2026-08-11T11:40:28.895Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: adding safe Writer paragraph removal while preserving the non-empty document body invariant."
doc_version: 3
doc_updated_at: "2026-08-11T11:40:28.895Z"
doc_updated_by: "CODER"
description: "Add immutable removal of non-final Writer paragraphs and accessible controls while preserving ordered text, undo/redo, browser-local storage, and plain-text export."
sections:
  Summary: |-
    Add Writer plain-text paragraph removal

    Add immutable removal of non-final Writer paragraphs and accessible controls while preserving ordered text, undo/redo, browser-local storage, and plain-text export.
  Scope: |-
    - In scope: Add immutable removal of non-final Writer paragraphs and accessible controls while preserving ordered text, undo/redo, browser-local storage, and plain-text export.
    - Out of scope: unrelated refactors not required for "Add Writer plain-text paragraph removal".
  Plan: |-
    1. Add a documented immutable Writer domain operation that removes one identified paragraph, preserves original input and sibling order, marks the document dirty, and rejects missing IDs or removal of the sole remaining paragraph.
    2. Extend the accessible ordered paragraph editor with per-paragraph Remove actions that are available only when the non-empty body invariant permits removal.
    3. Add a Writer workbench history transaction for removal; saved snapshots and plain-text download must automatically reflect the reduced ordered body.
    4. Add domain and integration tests for valid removal, invalid removal, visible controls, undo/redo restoration, storage/load, and download body output. Keep complete JSDoc and update bounded Writer documentation.
    5. Run Prettier check, lint, typecheck, JSDoc validation, and application coverage. Defer Playwright/static/full aggregation under the user-approved cadence because no build configuration changes and the changed UI has focused integration coverage. Run doctor and routing validation before close.

    Acceptance: users can remove any non-final plain-text Writer paragraph and undo/redo that operation; rich-text deletion, range selection, reordering, ODT, PDF, layout, and full Writer parity remain out of scope.
  Verify Steps: |-
    PLANNER fallback scaffold. Replace with task-specific acceptance checks when PLANNER context is available.

    1. Review the changed artifact or behavior for the `code` task. Expected: the requested outcome is visible and matches the approved scope.
    2. Run the most relevant validation step for the `code` task. Expected: it succeeds without unexpected regressions in touched scope.
    3. Compare the final result against the task summary and scope. Expected: any remaining follow-up is explicit in ## Findings.
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

Add Writer plain-text paragraph removal

Add immutable removal of non-final Writer paragraphs and accessible controls while preserving ordered text, undo/redo, browser-local storage, and plain-text export.

## Scope

- In scope: Add immutable removal of non-final Writer paragraphs and accessible controls while preserving ordered text, undo/redo, browser-local storage, and plain-text export.
- Out of scope: unrelated refactors not required for "Add Writer plain-text paragraph removal".

## Plan

1. Add a documented immutable Writer domain operation that removes one identified paragraph, preserves original input and sibling order, marks the document dirty, and rejects missing IDs or removal of the sole remaining paragraph.
2. Extend the accessible ordered paragraph editor with per-paragraph Remove actions that are available only when the non-empty body invariant permits removal.
3. Add a Writer workbench history transaction for removal; saved snapshots and plain-text download must automatically reflect the reduced ordered body.
4. Add domain and integration tests for valid removal, invalid removal, visible controls, undo/redo restoration, storage/load, and download body output. Keep complete JSDoc and update bounded Writer documentation.
5. Run Prettier check, lint, typecheck, JSDoc validation, and application coverage. Defer Playwright/static/full aggregation under the user-approved cadence because no build configuration changes and the changed UI has focused integration coverage. Run doctor and routing validation before close.

Acceptance: users can remove any non-final plain-text Writer paragraph and undo/redo that operation; rich-text deletion, range selection, reordering, ODT, PDF, layout, and full Writer parity remain out of scope.

## Verify Steps

PLANNER fallback scaffold. Replace with task-specific acceptance checks when PLANNER context is available.

1. Review the changed artifact or behavior for the `code` task. Expected: the requested outcome is visible and matches the approved scope.
2. Run the most relevant validation step for the `code` task. Expected: it succeeds without unexpected regressions in touched scope.
3. Compare the final result against the task summary and scope. Expected: any remaining follow-up is explicit in ## Findings.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert task-related commit(s).
- Re-run required checks to confirm rollback safety.

## Findings
