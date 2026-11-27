---
id: "202611271427-2DE39H"
title: "Preserve Calc external data area links through ODS"
result_summary: "Keep native external data area links through ODS and the Worker."
status: "DONE"
priority: "med"
owner: "CODER"
revision: 7
origin:
  system: "manual"
depends_on: []
tags:
  - "calc"
  - "links"
  - "ods"
task_kind: "code"
mutation_scope: "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-11-27T14:27:31.940Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-11-27T15:20:21.948Z"
  updated_by: "CODER"
  note: "Tests  40 passed (40). Pinned fixtures and focused static, dependency, provenance and registry checks passed."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-11-27T15:20:26.122Z"
  updated_by: "EVALUATOR"
  note: "The six worksheets and both original tdf124829 external data ranges retained their registration, dimensions, refresh delay and cached cells through the Calc Worker and ODS reopen."
  evaluated_sha: "70cafce2f8b8fa30f58fda0fca6631fa9d55b6af"
  blueprint_digest: "70b663df6b7e0dd91ac34ff4703828335fcfe3eb14ba5bb8c52b1809e591f0d5"
  evidence_refs:
    - ".agentplane/tasks/202611271427-2DE39H/README.md"
    - ".agentplane/tasks/202611271427-2DE39H/quality/20261127-152026122-recovery-context/quality-report.json"
    - ".agentplane/tasks/202611271427-2DE39H/quality/20261127-152026122-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202611271427-2DE39H/quality/20261127-152026122-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202611271427-2DE39H/blueprint/resolved-snapshot.json"
    - "/Users/odubinkin/Projects/vite-office/output/playwright/2DE39H/verification.md"
    - "70cafce2f8b8fa30f58fda0fca6631fa9d55b6af"
  findings:
    - "CALC-867 through CALC-869 record the omitted-dimension rule, first registration selection and refresh metadata on repeated cells. The test fixture uses cached cells from its original content because unrelated native formula functions lie outside the current slice."
commit:
  hash: "70cafce2f8b8fa30f58fda0fca6631fa9d55b6af"
  message: "🧩 2DE39H calc: preserve native external area ranges"
comments:
  -
    author: "CODER"
    body: "Start: Match original Calc cell-range-source parsing, area-link registration and ODF writeback."
  -
    author: "CODER"
    body: "Verified: The six worksheets and both original tdf124829 external data ranges retained their registration, dimensions, refresh delay and cached cells through the Calc Worker and ODS reopen."
events:
  -
    type: "status"
    at: "2026-11-27T14:27:32.475Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: Match original Calc cell-range-source parsing, area-link registration and ODF writeback."
  -
    type: "verify"
    at: "2026-11-27T15:20:21.948Z"
    author: "CODER"
    state: "ok"
    note: "Tests  40 passed (40). Pinned fixtures and focused static, dependency, provenance and registry checks passed."
  -
    type: "status"
    at: "2026-11-27T15:24:48.541Z"
    author: "CODER"
    from: "DOING"
    to: "DONE"
    note: "Verified: The six worksheets and both original tdf124829 external data ranges retained their registration, dimensions, refresh delay and cached cells through the Calc Worker and ODS reopen."
doc_version: 3
doc_updated_at: "2026-11-27T15:24:48.545Z"
doc_updated_by: "CODER"
description: "Import and export Calc external data range definitions using native cell-range-source contexts, ScAreaLink ownership, destination ranges and original defaults. Preserve the cached worksheet cells, independent area and sheet link identity, and browser Worker transfer. Port the relevant pinned tdf124829 ODS case and verify sibling ODS link paths."
sections:
  Summary: |-
    Preserve Calc external data area links through ODS

    Import and export Calc external data range definitions using native cell-range-source contexts, ScAreaLink ownership, destination ranges and original defaults. Preserve the cached worksheet cells, independent area and sheet link identity, and browser Worker transfer. Port the relevant pinned tdf124829 ODS case and verify sibling ODS link paths.
  Scope: |-
    - In scope: Import and export Calc external data range definitions using native cell-range-source contexts, ScAreaLink ownership, destination ranges and original defaults. Preserve the cached worksheet cells, independent area and sheet link identity, and browser Worker transfer. Port the relevant pinned tdf124829 ODS case and verify sibling ODS link paths.
    - Out of scope: unrelated refactors not required for "Preserve Calc external data area links through ODS".
  Plan: "Follow pinned ScXMLCellRangeSourceContext, ScXMLTableRowCellContext::SetCellRangeSource, ScAreaLink, the ordered LinkManager registration boundary, and ScXMLExport area-link collection and emission. Share the established ODF relative reference and time conversion. Keep area-link definitions independent of cached cells, per-sheet links and external formula caches. Restore the canonical links through the existing Calc Worker graph. The represented import/export loads cached cells and link metadata without initiating source reload. Port the ODS portion of tdf124829, including its distinct linked areas and six sheets, and run existing ODS and Worker checks. Record surprising source defaults or selection where applicable."
  Verify Steps: |-
    PLANNER fallback scaffold for "Preserve Calc external data area links through ODS". Replace with task-specific acceptance checks when PLANNER context is available.

    1. Review the requested outcome for "Preserve Calc external data area links through ODS". Expected: the visible result matches ## Summary and stays inside approved scope.
    2. Run the most relevant validation step for this task. Expected: it succeeds without unexpected regressions in touched behavior.
    3. Compare the final result against ## Scope and record any residual follow-up in ## Findings. Expected: open edges are explicit rather than implicit.
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-11-27T15:20:21.948Z — VERIFY — ok

    By: CODER

    Note: Tests  40 passed (40). Pinned fixtures and focused static, dependency, provenance and registry checks passed.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-11-27T14:27:32.475Z, excerpt_hash=sha256:d3b6cd4f1b6e3e40f51125a5697a6f4da68ca8fb9d9d70e66e7d8fc6c883d5aa

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202611271427-2DE39H/blueprint/resolved-snapshot.json
    - old_digest: 70b663df6b7e0dd91ac34ff4703828335fcfe3eb14ba5bb8c52b1809e591f0d5
    - current_digest: 70b663df6b7e0dd91ac34ff4703828335fcfe3eb14ba5bb8c52b1809e591f0d5
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202611271427-2DE39H

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202611271427-2DE39H
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

Preserve Calc external data area links through ODS

Import and export Calc external data range definitions using native cell-range-source contexts, ScAreaLink ownership, destination ranges and original defaults. Preserve the cached worksheet cells, independent area and sheet link identity, and browser Worker transfer. Port the relevant pinned tdf124829 ODS case and verify sibling ODS link paths.

## Scope

- In scope: Import and export Calc external data range definitions using native cell-range-source contexts, ScAreaLink ownership, destination ranges and original defaults. Preserve the cached worksheet cells, independent area and sheet link identity, and browser Worker transfer. Port the relevant pinned tdf124829 ODS case and verify sibling ODS link paths.
- Out of scope: unrelated refactors not required for "Preserve Calc external data area links through ODS".

## Plan

Follow pinned ScXMLCellRangeSourceContext, ScXMLTableRowCellContext::SetCellRangeSource, ScAreaLink, the ordered LinkManager registration boundary, and ScXMLExport area-link collection and emission. Share the established ODF relative reference and time conversion. Keep area-link definitions independent of cached cells, per-sheet links and external formula caches. Restore the canonical links through the existing Calc Worker graph. The represented import/export loads cached cells and link metadata without initiating source reload. Port the ODS portion of tdf124829, including its distinct linked areas and six sheets, and run existing ODS and Worker checks. Record surprising source defaults or selection where applicable.

## Verify Steps

PLANNER fallback scaffold for "Preserve Calc external data area links through ODS". Replace with task-specific acceptance checks when PLANNER context is available.

1. Review the requested outcome for "Preserve Calc external data area links through ODS". Expected: the visible result matches ## Summary and stays inside approved scope.
2. Run the most relevant validation step for this task. Expected: it succeeds without unexpected regressions in touched behavior.
3. Compare the final result against ## Scope and record any residual follow-up in ## Findings. Expected: open edges are explicit rather than implicit.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-11-27T15:20:21.948Z — VERIFY — ok

By: CODER

Note: Tests  40 passed (40). Pinned fixtures and focused static, dependency, provenance and registry checks passed.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-11-27T14:27:32.475Z, excerpt_hash=sha256:d3b6cd4f1b6e3e40f51125a5697a6f4da68ca8fb9d9d70e66e7d8fc6c883d5aa

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202611271427-2DE39H/blueprint/resolved-snapshot.json
- old_digest: 70b663df6b7e0dd91ac34ff4703828335fcfe3eb14ba5bb8c52b1809e591f0d5
- current_digest: 70b663df6b7e0dd91ac34ff4703828335fcfe3eb14ba5bb8c52b1809e591f0d5
- route_changed: no
- safe_command: agentplane blueprint snapshot 202611271427-2DE39H

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202611271427-2DE39H
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
