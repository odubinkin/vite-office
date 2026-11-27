---
id: "202611271644-MNNN12"
title: "Implement native Calc ODS consolidation settings and sheet scenarios"
result_summary: "Implements the native Calc consolidation and sheet scenario metadata contracts through ODS and Worker transfer."
status: "DONE"
priority: "med"
owner: "CODER"
revision: 7
origin:
  system: "manual"
depends_on: []
tags:
  - "calc"
  - "odf"
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-11-27T16:45:13.864Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-11-27T16:57:44.764Z"
  updated_by: "CODER"
  note: "136 focused Calc tests passed, with all three cases passing final replay. Office typecheck, lint, module boundaries, provenance and Calc/shared inventory passed. The pinned tdf149752 consolidation and tdf136551 malformed target contracts plus real Scenario pattern flags are verified."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-11-27T16:57:45.312Z"
  updated_by: "EVALUATOR"
  note: "Native document consolidation and sheet scenario metadata now have canonical core ownership, ODS import/export, and Worker transfer."
  evaluated_sha: "25d15433a1195b64ad3f5e79f757aa34591d51c2"
  blueprint_digest: "68cb1da38d00135f6db2729f66c45bf5e39e63d55e01281a58f82f23ac639e03"
  evidence_refs:
    - ".agentplane/tasks/202611271644-MNNN12/README.md"
    - ".agentplane/tasks/202611271644-MNNN12/quality/20261127-165745312-recovery-context/quality-report.json"
    - ".agentplane/tasks/202611271644-MNNN12/quality/20261127-165745312-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202611271644-MNNN12/quality/20261127-165745312-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202611271644-MNNN12/blueprint/resolved-snapshot.json"
    - "output/playwright/odf-next-checkpoint/calc-next-verification.md"
  findings:
    - "Scenario ranges use actual cell pattern flags. Both native consolidation fixture scenarios and ODS plus Worker transfer are exercised."
commit:
  hash: "25d15433a1195b64ad3f5e79f757aa34591d51c2"
  message: "🧩 MNNN12 calc: implement native ODS consolidation and scenario settings"
comments:
  -
    author: "CODER"
    body: "Start: port native document consolidation and scenario ODF owners."
  -
    author: "CODER"
    body: "Verified: all 136 affected Calc tests, final ODS replay and required static checks."
events:
  -
    type: "status"
    at: "2026-11-27T16:45:14.865Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: port native document consolidation and scenario ODF owners."
  -
    type: "verify"
    at: "2026-11-27T16:57:44.764Z"
    author: "CODER"
    state: "ok"
    note: "136 focused Calc tests passed, with all three cases passing final replay. Office typecheck, lint, module boundaries, provenance and Calc/shared inventory passed. The pinned tdf149752 consolidation and tdf136551 malformed target contracts plus real Scenario pattern flags are verified."
  -
    type: "status"
    at: "2026-11-27T16:59:12.899Z"
    author: "CODER"
    from: "DOING"
    to: "DONE"
    note: "Verified: all 136 affected Calc tests, final ODS replay and required static checks."
doc_version: 3
doc_updated_at: "2026-11-27T16:59:12.899Z"
doc_updated_by: "CODER"
description: "Implement ScConsolidateParam, native scenario range flags, ODS importer and exporter, and Worker support in apps/office/src/sc and the shared ODF token module. Verify with LibreOffice consolidation inputs and a native scenario ODS round trip."
sections:
  Summary: |-
    Preserve native Calc consolidation settings and sheet scenarios in ODS

    Port the original ScConsolidateParam and per-sheet scenarios with their native defaults, address conversion and ScMF::Scenario cell-range marking. Connect the Calc document, ODS importer and exporter, and Worker graph. Verify the two pinned consolidation fixtures and one critical scenario transfer without adding desktop dialogs.
  Scope: |-
    - In scope: Port the original ScConsolidateParam and per-sheet scenarios with their native defaults, address conversion and ScMF::Scenario cell-range marking. Connect the Calc document, ODS importer and exporter, and Worker graph. Verify the two pinned consolidation fixtures and one critical scenario transfer without adding desktop dialogs.
    - Out of scope: unrelated refactors not required for "Preserve native Calc consolidation settings and sheet scenarios in ODS".
  Plan: "Follow ScArea, ScConsolidateParam, ScDocument and ScTable scenario ownership, XMLConsolidationContext, xmlsceni and xmlexprt in the pinned source. Reuse Calc's native range parser, subtotal function converter, sheet merge flags and mark data. Preserve source order, default and malformed-input behavior, ODS placement and Worker restoration. Port the represented assertions from tdf149752 and tdf136551 plus one critical ODS scenario round trip. Keep existing browser save and lifecycle behavior and run related Calc tests only."
  Verify Steps: |-
    PLANNER fallback scaffold for "Preserve native Calc consolidation settings and sheet scenarios in ODS". Replace with task-specific acceptance checks when PLANNER context is available.

    1. Review the requested outcome for "Preserve native Calc consolidation settings and sheet scenarios in ODS". Expected: the visible result matches ## Summary and stays inside approved scope.
    2. Run the most relevant validation step for this task. Expected: it succeeds without unexpected regressions in touched behavior.
    3. Compare the final result against ## Scope and record any residual follow-up in ## Findings. Expected: open edges are explicit rather than implicit.
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-11-27T16:57:44.764Z — VERIFY — ok

    By: CODER

    Note: 136 focused Calc tests passed, with all three cases passing final replay. Office typecheck, lint, module boundaries, provenance and Calc/shared inventory passed. The pinned tdf149752 consolidation and tdf136551 malformed target contracts plus real Scenario pattern flags are verified.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-11-27T16:45:14.865Z, excerpt_hash=sha256:005d2f3e8ed7a489597fa1aa9e317cdf704c3d55af6386397fad1613d01f2cb8

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202611271644-MNNN12/blueprint/resolved-snapshot.json
    - old_digest: 68cb1da38d00135f6db2729f66c45bf5e39e63d55e01281a58f82f23ac639e03
    - current_digest: 68cb1da38d00135f6db2729f66c45bf5e39e63d55e01281a58f82f23ac639e03
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202611271644-MNNN12

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202611271644-MNNN12
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

Preserve native Calc consolidation settings and sheet scenarios in ODS

Port the original ScConsolidateParam and per-sheet scenarios with their native defaults, address conversion and ScMF::Scenario cell-range marking. Connect the Calc document, ODS importer and exporter, and Worker graph. Verify the two pinned consolidation fixtures and one critical scenario transfer without adding desktop dialogs.

## Scope

- In scope: Port the original ScConsolidateParam and per-sheet scenarios with their native defaults, address conversion and ScMF::Scenario cell-range marking. Connect the Calc document, ODS importer and exporter, and Worker graph. Verify the two pinned consolidation fixtures and one critical scenario transfer without adding desktop dialogs.
- Out of scope: unrelated refactors not required for "Preserve native Calc consolidation settings and sheet scenarios in ODS".

## Plan

Follow ScArea, ScConsolidateParam, ScDocument and ScTable scenario ownership, XMLConsolidationContext, xmlsceni and xmlexprt in the pinned source. Reuse Calc's native range parser, subtotal function converter, sheet merge flags and mark data. Preserve source order, default and malformed-input behavior, ODS placement and Worker restoration. Port the represented assertions from tdf149752 and tdf136551 plus one critical ODS scenario round trip. Keep existing browser save and lifecycle behavior and run related Calc tests only.

## Verify Steps

PLANNER fallback scaffold for "Preserve native Calc consolidation settings and sheet scenarios in ODS". Replace with task-specific acceptance checks when PLANNER context is available.

1. Review the requested outcome for "Preserve native Calc consolidation settings and sheet scenarios in ODS". Expected: the visible result matches ## Summary and stays inside approved scope.
2. Run the most relevant validation step for this task. Expected: it succeeds without unexpected regressions in touched behavior.
3. Compare the final result against ## Scope and record any residual follow-up in ## Findings. Expected: open edges are explicit rather than implicit.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-11-27T16:57:44.764Z — VERIFY — ok

By: CODER

Note: 136 focused Calc tests passed, with all three cases passing final replay. Office typecheck, lint, module boundaries, provenance and Calc/shared inventory passed. The pinned tdf149752 consolidation and tdf136551 malformed target contracts plus real Scenario pattern flags are verified.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-11-27T16:45:14.865Z, excerpt_hash=sha256:005d2f3e8ed7a489597fa1aa9e317cdf704c3d55af6386397fad1613d01f2cb8

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202611271644-MNNN12/blueprint/resolved-snapshot.json
- old_digest: 68cb1da38d00135f6db2729f66c45bf5e39e63d55e01281a58f82f23ac639e03
- current_digest: 68cb1da38d00135f6db2729f66c45bf5e39e63d55e01281a58f82f23ac639e03
- route_changed: no
- safe_command: agentplane blueprint snapshot 202611271644-MNNN12

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202611271644-MNNN12
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
