---
id: "202611271316-RX0J5A"
title: "Preserve linked Calc sheet sources through ODS and Worker transfer"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 4
origin:
  system: "manual"
depends_on: []
tags:
  - "calc"
  - "links"
  - "ods"
task_kind: "code"
mutation_scope: "code"
verify:
  - "Verify an original linked-sheet ODS, native normal/value modes, URL and refresh-delay round trip, property grouping, worker transport and cached cell data using related existing regressions and scoped static checks."
plan_approval:
  state: "approved"
  updated_at: "2026-11-27T13:16:46.819Z"
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
    body: "Start: port native Calc linked sheet source persistence using the original ScTable owner and ODS table-source context."
events:
  -
    type: "status"
    at: "2026-11-27T13:16:47.801Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: port native Calc linked sheet source persistence using the original ScTable owner and ODS table-source context."
doc_version: 3
doc_updated_at: "2026-11-27T13:16:47.801Z"
doc_updated_by: "CODER"
description: "Port the native Calc table-source descriptor for actual linked sheets, independently of external formula caches. Retain the original sheet owner, native link modes, source URL and filter fields, refresh-duration parsing, same-file link property reconciliation, cached cell contents, and ODS/Worker transport. Match the existing browser document origin and shell boundaries. Verify the pinned LibreOffice table-source fixture and relevant linked/external package tests."
sections:
  Summary: |-
    Preserve linked Calc sheet sources through ODS and Worker transfer

    Port the native Calc table-source descriptor for actual linked sheets, independently of external formula caches. Retain the original sheet owner, native link modes, source URL and filter fields, refresh-duration parsing, same-file link property reconciliation, cached cell contents, and ODS/Worker transport. Match the existing browser document origin and shell boundaries. Verify the pinned LibreOffice table-source fixture and relevant linked/external package tests.
  Scope: |-
    - In scope: Port the native Calc table-source descriptor for actual linked sheets, independently of external formula caches. Retain the original sheet owner, native link modes, source URL and filter fields, refresh-duration parsing, same-file link property reconciliation, cached cell contents, and ODS/Worker transport. Match the existing browser document origin and shell boundaries. Verify the pinned LibreOffice table-source fixture and relevant linked/external package tests.
    - Out of scope: unrelated refactors not required for "Preserve linked Calc sheet sources through ODS and Worker transfer".
  Plan: "Follow the original ScTable link fields, linked spreadsheet import context and sheet-link property lookup used by ODS export. Preserve document-origin resolution, file/filter values, original normal/value and refresh-delay defaults, same-file properties and linked cached cells through Worker transport and ODS. Verify the original linked-sheet fixture and related existing external-reference tests."
  Verify Steps: |-
    PLANNER fallback scaffold for "Preserve linked Calc sheet sources through ODS and Worker transfer". Replace with task-specific acceptance checks when PLANNER context is available.

    1. Review the requested outcome for "Preserve linked Calc sheet sources through ODS and Worker transfer". Expected: the visible result matches ## Summary and stays inside approved scope.
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

Preserve linked Calc sheet sources through ODS and Worker transfer

Port the native Calc table-source descriptor for actual linked sheets, independently of external formula caches. Retain the original sheet owner, native link modes, source URL and filter fields, refresh-duration parsing, same-file link property reconciliation, cached cell contents, and ODS/Worker transport. Match the existing browser document origin and shell boundaries. Verify the pinned LibreOffice table-source fixture and relevant linked/external package tests.

## Scope

- In scope: Port the native Calc table-source descriptor for actual linked sheets, independently of external formula caches. Retain the original sheet owner, native link modes, source URL and filter fields, refresh-duration parsing, same-file link property reconciliation, cached cell contents, and ODS/Worker transport. Match the existing browser document origin and shell boundaries. Verify the pinned LibreOffice table-source fixture and relevant linked/external package tests.
- Out of scope: unrelated refactors not required for "Preserve linked Calc sheet sources through ODS and Worker transfer".

## Plan

Follow the original ScTable link fields, linked spreadsheet import context and sheet-link property lookup used by ODS export. Preserve document-origin resolution, file/filter values, original normal/value and refresh-delay defaults, same-file properties and linked cached cells through Worker transport and ODS. Verify the original linked-sheet fixture and related existing external-reference tests.

## Verify Steps

PLANNER fallback scaffold for "Preserve linked Calc sheet sources through ODS and Worker transfer". Replace with task-specific acceptance checks when PLANNER context is available.

1. Review the requested outcome for "Preserve linked Calc sheet sources through ODS and Worker transfer". Expected: the visible result matches ## Summary and stays inside approved scope.
2. Run the most relevant validation step for this task. Expected: it succeeds without unexpected regressions in touched behavior.
3. Compare the final result against ## Scope and record any residual follow-up in ## Findings. Expected: open edges are explicit rather than implicit.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert task-related commit(s).
- Re-run required checks to confirm rollback safety.

## Findings
