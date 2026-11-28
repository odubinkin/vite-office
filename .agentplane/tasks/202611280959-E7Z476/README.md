---
id: "202611280959-E7Z476"
title: "Align Writer ODT named variable field families"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 4
origin:
  system: "manual"
depends_on: []
tags:
  - "writer"
task_kind: "code"
mutation_scope: "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-11-28T09:59:14.147Z"
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
    body: "Start: align named variable masters, represented field occurrences and ODT persistence."
events:
  -
    type: "status"
    at: "2026-11-28T09:59:14.504Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: align named variable masters, represented field occurrences and ODT persistence."
doc_version: 3
doc_updated_at: "2026-11-28T09:59:14.504Z"
doc_updated_by: "CODER"
description: "Restore native variable and user-field owners, ODT declarations, set/get and user field occurrences, expression updates and Worker transport for represented numeric and string values. Preserve native typed properties, defaults and collision renaming. Replay pinned LibreOffice field fixtures and run the focused Writer tests."
sections:
  Summary: |-
    Align Writer ODT named variable field families

    Restore native variable and user-field owners, ODT declarations, set/get and user field occurrences, expression updates and Worker transport for represented numeric and string values. Preserve native typed properties, defaults and collision renaming. Replay pinned LibreOffice field fixtures and run the focused Writer tests.
  Scope: |-
    - In scope: Restore native variable and user-field owners, ODT declarations, set/get and user field occurrences, expression updates and Worker transport for represented numeric and string values. Preserve native typed properties, defaults and collision renaming. Replay pinned LibreOffice field fixtures and run the focused Writer tests.
    - Out of scope: unrelated refactors not required for "Align Writer ODT named variable field families".
  Plan: "Port distinct SwUserField and SwSetExpFieldType owners plus live set/get and input behavior for the represented string and numeric types. Bind the corresponding Writer UNO field masters and xmloff variable declaration and field contexts. Export original typed value and format attributes and transfer field instances and masters through Worker. Reuse the existing sequence expression pass and the pinned Writer fixtures, and verify only affected modules."
  Verify Steps: |-
    PLANNER fallback scaffold for "Align Writer ODT named variable field families". Replace with task-specific acceptance checks when PLANNER context is available.

    1. Review the requested outcome for "Align Writer ODT named variable field families". Expected: the visible result matches ## Summary and stays inside approved scope.
    2. Run the most relevant validation step for this task. Expected: it succeeds without unexpected regressions in touched behavior.
    3. Compare the final result against ## Scope and record any residual follow-up in ## Findings. Expected: open edges are explicit rather than implicit.
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

Align Writer ODT named variable field families

Restore native variable and user-field owners, ODT declarations, set/get and user field occurrences, expression updates and Worker transport for represented numeric and string values. Preserve native typed properties, defaults and collision renaming. Replay pinned LibreOffice field fixtures and run the focused Writer tests.

## Scope

- In scope: Restore native variable and user-field owners, ODT declarations, set/get and user field occurrences, expression updates and Worker transport for represented numeric and string values. Preserve native typed properties, defaults and collision renaming. Replay pinned LibreOffice field fixtures and run the focused Writer tests.
- Out of scope: unrelated refactors not required for "Align Writer ODT named variable field families".

## Plan

Port distinct SwUserField and SwSetExpFieldType owners plus live set/get and input behavior for the represented string and numeric types. Bind the corresponding Writer UNO field masters and xmloff variable declaration and field contexts. Export original typed value and format attributes and transfer field instances and masters through Worker. Reuse the existing sequence expression pass and the pinned Writer fixtures, and verify only affected modules.

## Verify Steps

PLANNER fallback scaffold for "Align Writer ODT named variable field families". Replace with task-specific acceptance checks when PLANNER context is available.

1. Review the requested outcome for "Align Writer ODT named variable field families". Expected: the visible result matches ## Summary and stays inside approved scope.
2. Run the most relevant validation step for this task. Expected: it succeeds without unexpected regressions in touched behavior.
3. Compare the final result against ## Scope and record any residual follow-up in ## Findings. Expected: open edges are explicit rather than implicit.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert task-related commit(s).
- Re-run required checks to confirm rollback safety.

## Findings
