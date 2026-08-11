---
id: "202608111123-33MYY7"
title: "Extract Writer workbench from application shell"
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
  updated_at: "2026-08-11T11:24:05.156Z"
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
    body: "Start: extracting the current bounded Writer workbench from the application shell while preserving all visible browser behavior and coverage."
events:
  -
    type: "status"
    at: "2026-08-11T11:24:14.537Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: extracting the current bounded Writer workbench from the application shell while preserving all visible browser behavior and coverage."
doc_version: 3
doc_updated_at: "2026-08-11T11:24:14.537Z"
doc_updated_by: "CODER"
description: "Move Writer-specific document history, persistence, browser download, and shortcut orchestration out of App.tsx into a dedicated component while preserving the current static UI behavior and coverage."
sections:
  Summary: |-
    Extract Writer workbench from application shell

    Move Writer-specific document history, persistence, browser download, and shortcut orchestration out of App.tsx into a dedicated component while preserving the current static UI behavior and coverage.
  Scope: |-
    - In scope: Move Writer-specific document history, persistence, browser download, and shortcut orchestration out of App.tsx into a dedicated component while preserving the current static UI behavior and coverage.
    - Out of scope: unrelated refactors not required for "Extract Writer workbench from application shell".
  Plan: |-
    1. Create a documented `WriterWorkbench` component that owns the bounded Writer document initialization, transaction history, undo/redo shortcut effect, IndexedDB save/load status, and browser text download.
    2. Reduce `App.tsx` to application-shell and suite-selection orchestration; render the Writer workbench only for the selected Writer suite without changing accessible labels, persisted key, status text, or existing behavior.
    3. Retain and, where ownership changes require it, adjust component/integration tests so text edits, history, shortcuts, local storage, download success/failure, and Writer visibility remain covered at 100% application coverage.
    4. Update the Writer workbench documentation to name the new component boundary; add complete file/function JSDoc.
    5. Run `npm run verify`, `ap doctor`, and `node .agentplane/policy/check-routing.mjs`; record review and evaluator evidence, then close manually without using any runner.

    Acceptance: `App.tsx` is materially below the 500-line review threshold; all Writer behavior stays browser-only and observably unchanged.
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

Extract Writer workbench from application shell

Move Writer-specific document history, persistence, browser download, and shortcut orchestration out of App.tsx into a dedicated component while preserving the current static UI behavior and coverage.

## Scope

- In scope: Move Writer-specific document history, persistence, browser download, and shortcut orchestration out of App.tsx into a dedicated component while preserving the current static UI behavior and coverage.
- Out of scope: unrelated refactors not required for "Extract Writer workbench from application shell".

## Plan

1. Create a documented `WriterWorkbench` component that owns the bounded Writer document initialization, transaction history, undo/redo shortcut effect, IndexedDB save/load status, and browser text download.
2. Reduce `App.tsx` to application-shell and suite-selection orchestration; render the Writer workbench only for the selected Writer suite without changing accessible labels, persisted key, status text, or existing behavior.
3. Retain and, where ownership changes require it, adjust component/integration tests so text edits, history, shortcuts, local storage, download success/failure, and Writer visibility remain covered at 100% application coverage.
4. Update the Writer workbench documentation to name the new component boundary; add complete file/function JSDoc.
5. Run `npm run verify`, `ap doctor`, and `node .agentplane/policy/check-routing.mjs`; record review and evaluator evidence, then close manually without using any runner.

Acceptance: `App.tsx` is materially below the 500-line review threshold; all Writer behavior stays browser-only and observably unchanged.

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
