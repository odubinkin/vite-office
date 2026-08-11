---
id: "202608111325-AYRNM4"
title: "Toggle Writer properties sidebar from View"
status: "DOING"
priority: "med"
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
  updated_at: "2026-08-11T13:25:26.761Z"
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
    body: "Start: implementing the bounded Writer View Sidebar command at its pinned menu location."
events:
  -
    type: "status"
    at: "2026-08-11T13:25:31.447Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implementing the bounded Writer View Sidebar command at its pinned menu location."
doc_version: 3
doc_updated_at: "2026-08-11T13:25:31.447Z"
doc_updated_by: "CODER"
description: "Implement the pinned Writer .uno:Sidebar capability in the static browser workbench: expose View as a functional menu, toggle the existing properties sidebar without changing document data, retain accessible state and responsive canvas layout, and add focused documentation and browser evidence."
sections:
  Summary: |-
    Toggle Writer properties sidebar from View

    Implement the pinned Writer .uno:Sidebar capability in the static browser workbench: expose View as a functional menu, toggle the existing properties sidebar without changing document data, retain accessible state and responsive canvas layout, and add focused documentation and browser evidence.
  Scope: |-
    - In scope: Implement the pinned Writer .uno:Sidebar capability in the static browser workbench: expose View as a functional menu, toggle the existing properties sidebar without changing document data, retain accessible state and responsive canvas layout, and add focused documentation and browser evidence.
    - Out of scope: unrelated refactors not required for "Toggle Writer properties sidebar from View".
  Plan: "1. Add View menu state and the upstream .uno:Sidebar placement to WriterMenuBar while retaining existing File, Edit, Format, and Styles commands. 2. Thread a sidebar-visibility callback through WriterWorkbench and WriterWorkspaceChrome so hiding the sidebar expands the document canvas without mutating paragraph history or storage. 3. Add exhaustive unit/component and production Chromium accessibility coverage for visible and hidden states, update Writer UI and command-placement documentation with pinned upstream provenance, and run fast checks plus targeted E2E. Defer static smoke, inventory, and aggregate verify under the user-approved ten-task cadence."
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

Toggle Writer properties sidebar from View

Implement the pinned Writer .uno:Sidebar capability in the static browser workbench: expose View as a functional menu, toggle the existing properties sidebar without changing document data, retain accessible state and responsive canvas layout, and add focused documentation and browser evidence.

## Scope

- In scope: Implement the pinned Writer .uno:Sidebar capability in the static browser workbench: expose View as a functional menu, toggle the existing properties sidebar without changing document data, retain accessible state and responsive canvas layout, and add focused documentation and browser evidence.
- Out of scope: unrelated refactors not required for "Toggle Writer properties sidebar from View".

## Plan

1. Add View menu state and the upstream .uno:Sidebar placement to WriterMenuBar while retaining existing File, Edit, Format, and Styles commands. 2. Thread a sidebar-visibility callback through WriterWorkbench and WriterWorkspaceChrome so hiding the sidebar expands the document canvas without mutating paragraph history or storage. 3. Add exhaustive unit/component and production Chromium accessibility coverage for visible and hidden states, update Writer UI and command-placement documentation with pinned upstream provenance, and run fast checks plus targeted E2E. Defer static smoke, inventory, and aggregate verify under the user-approved ten-task cadence.

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
