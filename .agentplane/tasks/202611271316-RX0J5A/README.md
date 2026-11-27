---
id: "202611271316-RX0J5A"
title: "Preserve linked Calc sheet sources through ODS and Worker transfer"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 6
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
  state: "ok"
  updated_at: "2026-11-27T14:51:11.545Z"
  updated_by: "CODER"
  note: "Tests  16 passed (16). Pinned fixtures and focused static, dependency, provenance and registry checks passed."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-11-27T14:51:12.489Z"
  updated_by: "EVALUATOR"
  note: "The pinned tdf157897_main.ods retained the real linked sheet, its source and cached cells through the Worker and ODS reopen. Reload delay and per-URL export metadata follow the native link owner."
  evaluated_sha: "6f483c9d8d6b324b21fd927bc505073b36788a86"
  blueprint_digest: "39ac86e927bf8dae0433c747740556bda82f9a93b95a86d74fcfbb30b84fc8f4"
  evidence_refs:
    - ".agentplane/tasks/202611271316-RX0J5A/README.md"
    - ".agentplane/tasks/202611271316-RX0J5A/quality/20261127-145112489-recovery-context/quality-report.json"
    - ".agentplane/tasks/202611271316-RX0J5A/quality/20261127-145112489-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202611271316-RX0J5A/quality/20261127-145112489-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202611271316-RX0J5A/blueprint/resolved-snapshot.json"
    - "/Users/odubinkin/Projects/vite-office/output/playwright/RX0J5A/verification.md"
    - "6f483c9d8d6b324b21fd927bc505073b36788a86"
  findings:
    - "CALC-864 records native first-sheet metadata per source URL. Refreshing source media is outside the browser document model."
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
  -
    type: "verify"
    at: "2026-11-27T14:51:11.545Z"
    author: "CODER"
    state: "ok"
    note: "Tests  16 passed (16). Pinned fixtures and focused static, dependency, provenance and registry checks passed."
doc_version: 3
doc_updated_at: "2026-11-27T14:51:11.603Z"
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
    ### 2026-11-27T14:51:11.545Z — VERIFY — ok

    By: CODER

    Note: Tests  16 passed (16). Pinned fixtures and focused static, dependency, provenance and registry checks passed.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-11-27T13:16:47.801Z, excerpt_hash=sha256:f4631e85dc41cd451402c03c82962d2715cea66c7f4b8915853c40692b8c0d59

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202611271316-RX0J5A/blueprint/resolved-snapshot.json
    - old_digest: 39ac86e927bf8dae0433c747740556bda82f9a93b95a86d74fcfbb30b84fc8f4
    - current_digest: 39ac86e927bf8dae0433c747740556bda82f9a93b95a86d74fcfbb30b84fc8f4
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202611271316-RX0J5A

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202611271316-RX0J5A
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: false
    - repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
    - risks: none

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
### 2026-11-27T14:51:11.545Z — VERIFY — ok

By: CODER

Note: Tests  16 passed (16). Pinned fixtures and focused static, dependency, provenance and registry checks passed.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-11-27T13:16:47.801Z, excerpt_hash=sha256:f4631e85dc41cd451402c03c82962d2715cea66c7f4b8915853c40692b8c0d59

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202611271316-RX0J5A/blueprint/resolved-snapshot.json
- old_digest: 39ac86e927bf8dae0433c747740556bda82f9a93b95a86d74fcfbb30b84fc8f4
- current_digest: 39ac86e927bf8dae0433c747740556bda82f9a93b95a86d74fcfbb30b84fc8f4
- route_changed: no
- safe_command: agentplane blueprint snapshot 202611271316-RX0J5A

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202611271316-RX0J5A
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: false
- repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert task-related commit(s).
- Re-run required checks to confirm rollback safety.

## Findings
