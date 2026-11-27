---
id: "202611271823-P3TJDC"
title: "Preserve native Writer bookmark and mark reference fields in ODT"
result_summary: "Writer ODT now preserves native GetReference fields and their named text anchors."
status: "DONE"
priority: "med"
owner: "CODER"
revision: 7
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
  updated_at: "2026-11-27T18:24:27.621Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-11-27T18:43:49.376Z"
  updated_by: "CODER"
  note: "135 affected Writer cases passed plus both final pinned reference cases and 3 WhichId tests. Live named text update, Worker and reopened ODT verified. All static and inventory checks passed."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-11-27T18:43:49.976Z"
  updated_by: "EVALUATOR"
  note: "Writer preserves original named GetReference fields and displayed text through ODT and Worker."
  evaluated_sha: "5760ce646992a1641f6fb89a72242ca14f61f70d"
  blueprint_digest: "01661106a077969a1807a12b0b42d2fa995a12f3a49f2ba077c805b0aa37ef53"
  evidence_refs:
    - ".agentplane/tasks/202611271823-P3TJDC/README.md"
    - ".agentplane/tasks/202611271823-P3TJDC/quality/20261127-184349976-recovery-context/quality-report.json"
    - ".agentplane/tasks/202611271823-P3TJDC/quality/20261127-184349976-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202611271823-P3TJDC/quality/20261127-184349976-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202611271823-P3TJDC/blueprint/resolved-snapshot.json"
    - "output/playwright/odf-writer-redlines/reference-fields-verification.md"
  findings:
    - "Unmodified LibreOffice reference fixtures passed their represented source, cached text and expansion checks. Page-dependent evaluation remains outside this slice."
commit:
  hash: "5760ce646992a1641f6fb89a72242ca14f61f70d"
  message: "🧩 P3TJDC writer: preserve native named reference fields in ODT"
comments:
  -
    author: "CODER"
    body: "Start: add native Writer GetReference text-field ownership and ODT paths."
  -
    author: "CODER"
    body: "Verified: original named reference fixtures, 135 related Writer cases, Native ODT and Worker round trips passed."
events:
  -
    type: "status"
    at: "2026-11-27T18:24:28.043Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: add native Writer GetReference text-field ownership and ODT paths."
  -
    type: "verify"
    at: "2026-11-27T18:43:49.376Z"
    author: "CODER"
    state: "ok"
    note: "135 affected Writer cases passed plus both final pinned reference cases and 3 WhichId tests. Live named text update, Worker and reopened ODT verified. All static and inventory checks passed."
  -
    type: "status"
    at: "2026-11-27T18:45:09.941Z"
    author: "CODER"
    from: "DOING"
    to: "DONE"
    note: "Verified: original named reference fixtures, 135 related Writer cases, Native ODT and Worker round trips passed."
doc_version: 3
doc_updated_at: "2026-11-27T18:45:09.942Z"
doc_updated_by: "CODER"
description: "Port the original Writer GetReference field owners and the ODT bookmark-ref and reference-ref contracts. Preserve the field result, source, format and language, text reference updates against current bookmark and reference mark owners, and Worker transport. Port represented assertions from the original named reference fixtures. Page-layout and additional reference sources remain scoped to their currently represented behavior."
sections:
  Summary: |-
    Preserve native Writer bookmark and mark reference fields in ODT

    Port the original Writer GetReference field owners and the ODT bookmark-ref and reference-ref contracts. Preserve the field result, source, format and language, text reference updates against current bookmark and reference mark owners, and Worker transport. Port represented assertions from the original named reference fixtures. Page-layout and additional reference sources remain scoped to their currently represented behavior.
  Scope: |-
    - In scope: Port the original Writer GetReference field owners and the ODT bookmark-ref and reference-ref contracts. Preserve the field result, source, format and language, text reference updates against current bookmark and reference mark owners, and Worker transport. Port represented assertions from the original named reference fixtures. Page-layout and additional reference sources remain scoped to their currently represented behavior.
    - Out of scope: unrelated refactors not required for "Preserve native Writer bookmark and mark reference fields in ODT".
  Plan: "Introduce native GetReference document field ownership alongside annotations. Keep the original RefFieldFormat and ReferencesSubtype values, ODF token defaults and named reference properties. Attach fields through the real Writer text model, apply native text-reference updates using registered bookmark and reference mark anchors, and preserve remembered values where the required paginated field calculation is outside this slice. Rebind the original field data through Worker transport and export named fields. Use the original tdf157287 and tdf159101 reference fixtures for their represented text and storage assertions."
  Verify Steps: |-
    PLANNER fallback scaffold for "Preserve native Writer bookmark and mark reference fields in ODT". Replace with task-specific acceptance checks when PLANNER context is available.

    1. Review the requested outcome for "Preserve native Writer bookmark and mark reference fields in ODT". Expected: the visible result matches ## Summary and stays inside approved scope.
    2. Run the most relevant validation step for this task. Expected: it succeeds without unexpected regressions in touched behavior.
    3. Compare the final result against ## Scope and record any residual follow-up in ## Findings. Expected: open edges are explicit rather than implicit.
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-11-27T18:43:49.376Z — VERIFY — ok

    By: CODER

    Note: 135 affected Writer cases passed plus both final pinned reference cases and 3 WhichId tests. Live named text update, Worker and reopened ODT verified. All static and inventory checks passed.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-11-27T18:24:28.043Z, excerpt_hash=sha256:bc41eea6da0f870fa4becb5cbd7cf971afbf0ccf9eca73d72631eb12e889d625

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202611271823-P3TJDC/blueprint/resolved-snapshot.json
    - old_digest: 01661106a077969a1807a12b0b42d2fa995a12f3a49f2ba077c805b0aa37ef53
    - current_digest: 01661106a077969a1807a12b0b42d2fa995a12f3a49f2ba077c805b0aa37ef53
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202611271823-P3TJDC

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202611271823-P3TJDC
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

Preserve native Writer bookmark and mark reference fields in ODT

Port the original Writer GetReference field owners and the ODT bookmark-ref and reference-ref contracts. Preserve the field result, source, format and language, text reference updates against current bookmark and reference mark owners, and Worker transport. Port represented assertions from the original named reference fixtures. Page-layout and additional reference sources remain scoped to their currently represented behavior.

## Scope

- In scope: Port the original Writer GetReference field owners and the ODT bookmark-ref and reference-ref contracts. Preserve the field result, source, format and language, text reference updates against current bookmark and reference mark owners, and Worker transport. Port represented assertions from the original named reference fixtures. Page-layout and additional reference sources remain scoped to their currently represented behavior.
- Out of scope: unrelated refactors not required for "Preserve native Writer bookmark and mark reference fields in ODT".

## Plan

Introduce native GetReference document field ownership alongside annotations. Keep the original RefFieldFormat and ReferencesSubtype values, ODF token defaults and named reference properties. Attach fields through the real Writer text model, apply native text-reference updates using registered bookmark and reference mark anchors, and preserve remembered values where the required paginated field calculation is outside this slice. Rebind the original field data through Worker transport and export named fields. Use the original tdf157287 and tdf159101 reference fixtures for their represented text and storage assertions.

## Verify Steps

PLANNER fallback scaffold for "Preserve native Writer bookmark and mark reference fields in ODT". Replace with task-specific acceptance checks when PLANNER context is available.

1. Review the requested outcome for "Preserve native Writer bookmark and mark reference fields in ODT". Expected: the visible result matches ## Summary and stays inside approved scope.
2. Run the most relevant validation step for this task. Expected: it succeeds without unexpected regressions in touched behavior.
3. Compare the final result against ## Scope and record any residual follow-up in ## Findings. Expected: open edges are explicit rather than implicit.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-11-27T18:43:49.376Z — VERIFY — ok

By: CODER

Note: 135 affected Writer cases passed plus both final pinned reference cases and 3 WhichId tests. Live named text update, Worker and reopened ODT verified. All static and inventory checks passed.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-11-27T18:24:28.043Z, excerpt_hash=sha256:bc41eea6da0f870fa4becb5cbd7cf971afbf0ccf9eca73d72631eb12e889d625

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202611271823-P3TJDC/blueprint/resolved-snapshot.json
- old_digest: 01661106a077969a1807a12b0b42d2fa995a12f3a49f2ba077c805b0aa37ef53
- current_digest: 01661106a077969a1807a12b0b42d2fa995a12f3a49f2ba077c805b0aa37ef53
- route_changed: no
- safe_command: agentplane blueprint snapshot 202611271823-P3TJDC

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202611271823-P3TJDC
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
