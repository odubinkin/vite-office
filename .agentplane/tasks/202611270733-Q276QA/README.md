---
id: "202611270733-Q276QA"
title: "Preserve Calc ODS database range ownership and filter parameters"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 7
origin:
  system: "manual"
depends_on: []
tags:
  - "calc"
  - "code"
  - "ods"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-11-27T07:34:04.658Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-11-27T07:48:19.581Z"
  updated_by: "CODER"
  note: "29 focused Calc cases pass across Worker and ODS, including the supported LibreOffice database fixture assertions. Static and registry checks pass. See output/playwright/Q276QA/verification.md."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-11-27T07:48:23.101Z"
  updated_by: "EVALUATOR"
  note: "Calc persists native database range ownership, filters and sparse header flags through ODS and Worker."
  evaluated_sha: "f63e6c5f2021e1d796bde24f57ffbc9834320527"
  blueprint_digest: "229fa6d3b13268fdaeedd3dd0a94b24b4066344cd143d20c18c224213db8164a"
  evidence_refs:
    - ".agentplane/tasks/202611270733-Q276QA/README.md"
    - ".agentplane/tasks/202611270733-Q276QA/quality/20261127-074823101-recovery-context/quality-report.json"
    - ".agentplane/tasks/202611270733-Q276QA/quality/20261127-074823101-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202611270733-Q276QA/quality/20261127-074823101-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202611270733-Q276QA/blueprint/resolved-snapshot.json"
    - "output/playwright/Q276QA/verification.md"
    - "f63e6c5f2021e1d796bde24f57ffbc9834320527"
  findings:
    - "Source range defaults, query order, filtered rows and separate named/anonymous ownership were checked against the pinned LibreOffice sources. Implementation: f63e6c5f2021e1d796bde24f57ffbc9834320527."
commit: null
comments:
  -
    author: "CODER"
    body: "Start: Transfer native Calc database ranges and their represented ODS query state."
events:
  -
    type: "status"
    at: "2026-11-27T07:34:06.542Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: Transfer native Calc database ranges and their represented ODS query state."
  -
    type: "verify"
    at: "2026-11-27T07:48:19.581Z"
    author: "CODER"
    state: "ok"
    note: "29 focused Calc cases pass across Worker and ODS, including the supported LibreOffice database fixture assertions. Static and registry checks pass. See output/playwright/Q276QA/verification.md."
doc_version: 3
doc_updated_at: "2026-11-27T07:48:19.820Z"
doc_updated_by: "CODER"
description: "Port the pinned ScDBData, named/global-anonymous/sheet-anonymous ownership, database-range and query XML contexts, native flag application and compatible Worker transfer. Verify the database.ods range and filtered-row assertions within the existing Calc kernel."
sections:
  Summary: |-
    Preserve Calc ODS database range ownership and filter parameters

    Port the pinned ScDBData, named/global-anonymous/sheet-anonymous ownership, database-range and query XML contexts, native flag application and compatible Worker transfer. Verify the database.ods range and filtered-row assertions within the existing Calc kernel.
  Scope: |-
    - In scope: Port the pinned ScDBData, named/global-anonymous/sheet-anonymous ownership, database-range and query XML contexts, native flag application and compatible Worker transfer. Verify the database.ods range and filtered-row assertions within the existing Calc kernel.
    - Out of scope: unrelated refactors not required for "Preserve Calc ODS database range ownership and filter parameters".
  Plan: |-
    1. Trace the pinned database data, collection, filter contexts and exporter against the current Calc kernel.
    2. Port native data ownership and ODF admission/output, including deferred adoption after tables and the original query parameter ordering and defaults.
    3. Wire the Worker snapshot, port the pertinent native end-to-end assertions, and run current focused volume.
  Verify Steps: |-
    - Run the related Calc ODS, native sparse-flag and Worker tests plus the supported ownership and visibility assertions of testDatabaseRangesODS.
    - Run Office typecheck, targeted ESLint and format, dependencies, provenance, Calc/shared inventory, routing, AgentPlane doctor and git diff checks.
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-11-27T07:48:19.581Z — VERIFY — ok

    By: CODER

    Note: 29 focused Calc cases pass across Worker and ODS, including the supported LibreOffice database fixture assertions. Static and registry checks pass. See output/playwright/Q276QA/verification.md.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-11-27T07:34:06.542Z, excerpt_hash=sha256:73b16ab1b6755d5438f4f01682fb32ddf7f328aeb0407dc2fdfc2a638e7bd5b0

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202611270733-Q276QA/blueprint/resolved-snapshot.json
    - old_digest: 229fa6d3b13268fdaeedd3dd0a94b24b4066344cd143d20c18c224213db8164a
    - current_digest: 229fa6d3b13268fdaeedd3dd0a94b24b4066344cd143d20c18c224213db8164a
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202611270733-Q276QA

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202611270733-Q276QA
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

Preserve Calc ODS database range ownership and filter parameters

Port the pinned ScDBData, named/global-anonymous/sheet-anonymous ownership, database-range and query XML contexts, native flag application and compatible Worker transfer. Verify the database.ods range and filtered-row assertions within the existing Calc kernel.

## Scope

- In scope: Port the pinned ScDBData, named/global-anonymous/sheet-anonymous ownership, database-range and query XML contexts, native flag application and compatible Worker transfer. Verify the database.ods range and filtered-row assertions within the existing Calc kernel.
- Out of scope: unrelated refactors not required for "Preserve Calc ODS database range ownership and filter parameters".

## Plan

1. Trace the pinned database data, collection, filter contexts and exporter against the current Calc kernel.
2. Port native data ownership and ODF admission/output, including deferred adoption after tables and the original query parameter ordering and defaults.
3. Wire the Worker snapshot, port the pertinent native end-to-end assertions, and run current focused volume.

## Verify Steps

- Run the related Calc ODS, native sparse-flag and Worker tests plus the supported ownership and visibility assertions of testDatabaseRangesODS.
- Run Office typecheck, targeted ESLint and format, dependencies, provenance, Calc/shared inventory, routing, AgentPlane doctor and git diff checks.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-11-27T07:48:19.581Z — VERIFY — ok

By: CODER

Note: 29 focused Calc cases pass across Worker and ODS, including the supported LibreOffice database fixture assertions. Static and registry checks pass. See output/playwright/Q276QA/verification.md.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-11-27T07:34:06.542Z, excerpt_hash=sha256:73b16ab1b6755d5438f4f01682fb32ddf7f328aeb0407dc2fdfc2a638e7bd5b0

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202611270733-Q276QA/blueprint/resolved-snapshot.json
- old_digest: 229fa6d3b13268fdaeedd3dd0a94b24b4066344cd143d20c18c224213db8164a
- current_digest: 229fa6d3b13268fdaeedd3dd0a94b24b4066344cd143d20c18c224213db8164a
- route_changed: no
- safe_command: agentplane blueprint snapshot 202611270733-Q276QA

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202611270733-Q276QA
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
