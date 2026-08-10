---
id: "202608101255-BDEBYE"
title: "Add Writer workbench undo and redo controls"
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
  updated_at: "2026-08-10T12:55:49.199Z"
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
    body: "Start: connect approved transaction history to the Writer workbench controls."
events:
  -
    type: "status"
    at: "2026-08-10T12:55:54.509Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: connect approved transaction history to the Writer workbench controls."
doc_version: 3
doc_updated_at: "2026-08-10T12:55:54.509Z"
doc_updated_by: "CODER"
description: "Connect the existing immutable transaction history to the one-paragraph Writer workbench with accessible Undo and Redo controls, without adding rich-text editing, keyboard shortcut handling, persistence, or broad LibreOffice parity claims."
sections:
  Summary: |-
    Add Writer workbench undo and redo controls

    Connect the existing immutable transaction history to the one-paragraph Writer workbench with accessible Undo and Redo controls, without adding rich-text editing, keyboard shortcut handling, persistence, or broad LibreOffice parity claims.
  Scope: |-
    - In scope: Connect the existing immutable transaction history to the one-paragraph Writer workbench with accessible Undo and Redo controls, without adding rich-text editing, keyboard shortcut handling, persistence, or broad LibreOffice parity claims.
    - Out of scope: unrelated refactors not required for "Add Writer workbench undo and redo controls".
  Plan: "Scope: integrate the existing immutable transaction-history module with the selected Writer workbench document. Add accessible Undo and Redo buttons whose disabled states reflect history bounds; text input creates a new history entry and undo/redo restores the selected snapshot. The selection cursor may be a deterministic text-length value because textarea cursor restoration is excluded. Upstream reference: pinned Writer source sw/qa/core/text/text.cxx is contextual evidence only; no broad upstream mapping or parity claim is made. Architecture: retain history state in App, keep WriterPlainTextEditor presentational, and use applyTransaction, undoTransaction, redoTransaction, and getCurrentTransactionState directly. Tests: unit/UI coverage for editing, undo, redo, disabled bounds, redo branch truncation after new input, and suite switching; maintain 100 percent coverage. Docs: extend transaction history and Writer workbench documentation with the integration and exclusions. Non-goals: keyboard shortcuts, native selection restoration, rich text, multi-paragraph history, persistence, collaboration, ODT formats, and LibreOffice parity completeness. Verification: full npm run verify, ap doctor, and policy routing validation."
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

Add Writer workbench undo and redo controls

Connect the existing immutable transaction history to the one-paragraph Writer workbench with accessible Undo and Redo controls, without adding rich-text editing, keyboard shortcut handling, persistence, or broad LibreOffice parity claims.

## Scope

- In scope: Connect the existing immutable transaction history to the one-paragraph Writer workbench with accessible Undo and Redo controls, without adding rich-text editing, keyboard shortcut handling, persistence, or broad LibreOffice parity claims.
- Out of scope: unrelated refactors not required for "Add Writer workbench undo and redo controls".

## Plan

Scope: integrate the existing immutable transaction-history module with the selected Writer workbench document. Add accessible Undo and Redo buttons whose disabled states reflect history bounds; text input creates a new history entry and undo/redo restores the selected snapshot. The selection cursor may be a deterministic text-length value because textarea cursor restoration is excluded. Upstream reference: pinned Writer source sw/qa/core/text/text.cxx is contextual evidence only; no broad upstream mapping or parity claim is made. Architecture: retain history state in App, keep WriterPlainTextEditor presentational, and use applyTransaction, undoTransaction, redoTransaction, and getCurrentTransactionState directly. Tests: unit/UI coverage for editing, undo, redo, disabled bounds, redo branch truncation after new input, and suite switching; maintain 100 percent coverage. Docs: extend transaction history and Writer workbench documentation with the integration and exclusions. Non-goals: keyboard shortcuts, native selection restoration, rich text, multi-paragraph history, persistence, collaboration, ODT formats, and LibreOffice parity completeness. Verification: full npm run verify, ap doctor, and policy routing validation.

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
