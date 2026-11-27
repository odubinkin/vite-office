---
id: "202611271712-T82AA2"
title: "Implement native Writer structural redline boundaries in ODT"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 6
origin:
  system: "manual"
depends_on: []
tags:
  - "odf"
  - "writer"
task_kind: "code"
mutation_scope: "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-11-27T17:12:50.080Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-11-27T17:18:46.016Z"
  updated_by: "CODER"
  note: "All 61 affected Writer tests passed. The tdf132911 table scope and sectionprot2 protection survived the ODT and Worker paths. Lint, type check, module boundaries, provenance and scoped inventories passed."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-11-27T17:18:46.557Z"
  updated_by: "EVALUATOR"
  note: "Writer ODT marks preserve the original table and section endpoint owners through the package filter and Worker."
  evaluated_sha: "32075a1022b72c2af74237fc050be3a7035edb6d"
  blueprint_digest: "19575c6156837846901b6eeb1cf5b99000480af00f8a20e44ea5967e693ea168"
  evidence_refs:
    - ".agentplane/tasks/202611271712-T82AA2/README.md"
    - ".agentplane/tasks/202611271712-T82AA2/quality/20261127-171846557-recovery-context/quality-report.json"
    - ".agentplane/tasks/202611271712-T82AA2/quality/20261127-171846557-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202611271712-T82AA2/quality/20261127-171846557-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202611271712-T82AA2/blueprint/resolved-snapshot.json"
    - "output/playwright/odf-writer-redlines/structural-verification.md"
  findings:
    - "The source table boundary and the incomplete protected-section fixture pass on original input. WRITER-771 records the original first-match export behavior."
commit: null
comments:
  -
    author: "CODER"
    body: "Start: port original table and section redline placement."
events:
  -
    type: "status"
    at: "2026-11-27T17:12:50.523Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: port original table and section redline placement."
  -
    type: "verify"
    at: "2026-11-27T17:18:46.016Z"
    author: "CODER"
    state: "ok"
    note: "All 61 affected Writer tests passed. The tdf132911 table scope and sectionprot2 protection survived the ODT and Worker paths. Lint, type check, module boundaries, provenance and scoped inventories passed."
doc_version: 3
doc_updated_at: "2026-11-27T17:18:46.075Z"
doc_updated_by: "CODER"
description: "Attach tracked-change markers around Writer tables and sections to their original registered structural nodes. Preserve position repair, structural markers and actual node relationships through ODT and the Worker. Use the original tdf132911 and section protection fixtures with related Writer regressions."
sections:
  Summary: |-
    Implement native Writer structural redline boundaries in ODT

    Attach tracked-change markers around Writer tables and sections to their original registered structural nodes. Preserve position repair, structural markers and actual node relationships through ODT and the Worker. Use the original tdf132911 and section protection fixtures with related Writer regressions.
  Scope: |-
    - In scope: Attach tracked-change markers around Writer tables and sections to their original registered structural nodes. Preserve position repair, structural markers and actual node relationships through ODT and the Worker. Use the original tdf132911 and section protection fixtures with related Writer regressions.
    - Out of scope: unrelated refactors not required for "Implement native Writer structural redline boundaries in ODT".
  Plan: "Port the native XMLRedlineImportHelper structural anchor mode and its open-ID adjustment at tables and sections. Attach outside-paragraph marks to actual registered start/end nodes, serialize node marks around corresponding XML blocks, and rebind structural graph references to actual restored node owners. Port the structural range in tdf132911 and preserve the section protection fixture when its source region is incomplete. Verify related Writer table, section and existing redline tests, leaving editor change actions and recovery outside this task."
  Verify Steps: |-
    PLANNER fallback scaffold for "Implement native Writer structural redline boundaries in ODT". Replace with task-specific acceptance checks when PLANNER context is available.

    1. Review the requested outcome for "Implement native Writer structural redline boundaries in ODT". Expected: the visible result matches ## Summary and stays inside approved scope.
    2. Run the most relevant validation step for this task. Expected: it succeeds without unexpected regressions in touched behavior.
    3. Compare the final result against ## Scope and record any residual follow-up in ## Findings. Expected: open edges are explicit rather than implicit.
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-11-27T17:18:46.016Z — VERIFY — ok

    By: CODER

    Note: All 61 affected Writer tests passed. The tdf132911 table scope and sectionprot2 protection survived the ODT and Worker paths. Lint, type check, module boundaries, provenance and scoped inventories passed.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-11-27T17:12:50.523Z, excerpt_hash=sha256:e4982c80dceb350eaec53af8202eb652efb166acf9889b42a3615a685f5269e1

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202611271712-T82AA2/blueprint/resolved-snapshot.json
    - old_digest: 19575c6156837846901b6eeb1cf5b99000480af00f8a20e44ea5967e693ea168
    - current_digest: 19575c6156837846901b6eeb1cf5b99000480af00f8a20e44ea5967e693ea168
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202611271712-T82AA2

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202611271712-T82AA2
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

Implement native Writer structural redline boundaries in ODT

Attach tracked-change markers around Writer tables and sections to their original registered structural nodes. Preserve position repair, structural markers and actual node relationships through ODT and the Worker. Use the original tdf132911 and section protection fixtures with related Writer regressions.

## Scope

- In scope: Attach tracked-change markers around Writer tables and sections to their original registered structural nodes. Preserve position repair, structural markers and actual node relationships through ODT and the Worker. Use the original tdf132911 and section protection fixtures with related Writer regressions.
- Out of scope: unrelated refactors not required for "Implement native Writer structural redline boundaries in ODT".

## Plan

Port the native XMLRedlineImportHelper structural anchor mode and its open-ID adjustment at tables and sections. Attach outside-paragraph marks to actual registered start/end nodes, serialize node marks around corresponding XML blocks, and rebind structural graph references to actual restored node owners. Port the structural range in tdf132911 and preserve the section protection fixture when its source region is incomplete. Verify related Writer table, section and existing redline tests, leaving editor change actions and recovery outside this task.

## Verify Steps

PLANNER fallback scaffold for "Implement native Writer structural redline boundaries in ODT". Replace with task-specific acceptance checks when PLANNER context is available.

1. Review the requested outcome for "Implement native Writer structural redline boundaries in ODT". Expected: the visible result matches ## Summary and stays inside approved scope.
2. Run the most relevant validation step for this task. Expected: it succeeds without unexpected regressions in touched behavior.
3. Compare the final result against ## Scope and record any residual follow-up in ## Findings. Expected: open edges are explicit rather than implicit.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-11-27T17:18:46.016Z — VERIFY — ok

By: CODER

Note: All 61 affected Writer tests passed. The tdf132911 table scope and sectionprot2 protection survived the ODT and Worker paths. Lint, type check, module boundaries, provenance and scoped inventories passed.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-11-27T17:12:50.523Z, excerpt_hash=sha256:e4982c80dceb350eaec53af8202eb652efb166acf9889b42a3615a685f5269e1

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202611271712-T82AA2/blueprint/resolved-snapshot.json
- old_digest: 19575c6156837846901b6eeb1cf5b99000480af00f8a20e44ea5967e693ea168
- current_digest: 19575c6156837846901b6eeb1cf5b99000480af00f8a20e44ea5967e693ea168
- route_changed: no
- safe_command: agentplane blueprint snapshot 202611271712-T82AA2

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202611271712-T82AA2
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
