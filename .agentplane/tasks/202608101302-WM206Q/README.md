---
id: "202608101302-WM206Q"
title: "Add Writer undo redo keyboard shortcuts"
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
  updated_at: "2026-08-10T13:03:07.874Z"
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
    body: "Start: implement approved Writer undo redo keyboard shortcut routing."
events:
  -
    type: "status"
    at: "2026-08-10T13:03:08.954Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implement approved Writer undo redo keyboard shortcut routing."
doc_version: 3
doc_updated_at: "2026-08-10T13:03:08.954Z"
doc_updated_by: "CODER"
description: "Route browser Ctrl or Meta Z and Ctrl or Meta Shift Z shortcuts to the existing Writer workbench undo and redo actions through the typed command registry, while preserving text-entry behavior and the static frontend boundary."
sections:
  Summary: |-
    Add Writer undo redo keyboard shortcuts

    Route browser Ctrl or Meta Z and Ctrl or Meta Shift Z shortcuts to the existing Writer workbench undo and redo actions through the typed command registry, while preserving text-entry behavior and the static frontend boundary.
  Scope: |-
    - In scope: Route browser Ctrl or Meta Z and Ctrl or Meta Shift Z shortcuts to the existing Writer workbench undo and redo actions through the typed command registry, while preserving text-entry behavior and the static frontend boundary.
    - Out of scope: unrelated refactors not required for "Add Writer undo redo keyboard shortcuts".
  Plan: "Scope: add browser keydown handling for Writer Undo and Redo via typed command definitions and dispatchCommand. Support Ctrl+Z and Meta+Z for Undo, Ctrl+Shift+Z and Meta+Shift+Z for Redo, only while Writer is selected and a matching command is enabled. Matching shortcuts prevent their browser default; unrelated keys and disabled commands do not. Architecture: place a small Writer command adapter in an authored module, retain state transitions in App, and reuse the existing command registry normalization/dispatch contract. Tests: unit-test browser-event shortcut adaptation and command availability, plus App and E2E keyboard behavior including no action at history boundaries; preserve 100 percent coverage. Docs: document shortcut behavior and exclusions. Non-goals: Ctrl+Y, customizable bindings, menus, shortcut localization, global command surfaces, rich-text selection restoration, persistence, format compatibility, or broad LibreOffice parity claims. Verification: full npm run verify, ap doctor, routing validation."
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

Add Writer undo redo keyboard shortcuts

Route browser Ctrl or Meta Z and Ctrl or Meta Shift Z shortcuts to the existing Writer workbench undo and redo actions through the typed command registry, while preserving text-entry behavior and the static frontend boundary.

## Scope

- In scope: Route browser Ctrl or Meta Z and Ctrl or Meta Shift Z shortcuts to the existing Writer workbench undo and redo actions through the typed command registry, while preserving text-entry behavior and the static frontend boundary.
- Out of scope: unrelated refactors not required for "Add Writer undo redo keyboard shortcuts".

## Plan

Scope: add browser keydown handling for Writer Undo and Redo via typed command definitions and dispatchCommand. Support Ctrl+Z and Meta+Z for Undo, Ctrl+Shift+Z and Meta+Shift+Z for Redo, only while Writer is selected and a matching command is enabled. Matching shortcuts prevent their browser default; unrelated keys and disabled commands do not. Architecture: place a small Writer command adapter in an authored module, retain state transitions in App, and reuse the existing command registry normalization/dispatch contract. Tests: unit-test browser-event shortcut adaptation and command availability, plus App and E2E keyboard behavior including no action at history boundaries; preserve 100 percent coverage. Docs: document shortcut behavior and exclusions. Non-goals: Ctrl+Y, customizable bindings, menus, shortcut localization, global command surfaces, rich-text selection restoration, persistence, format compatibility, or broad LibreOffice parity claims. Verification: full npm run verify, ap doctor, routing validation.

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
