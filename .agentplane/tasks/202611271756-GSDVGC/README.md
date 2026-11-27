---
id: "202611271756-GSDVGC"
title: "Reconcile Calc ODS embedded font verification with the pinned importer"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 6
origin:
  system: "manual"
depends_on: []
tags:
  - "calc"
  - "odf"
task_kind: "code"
mutation_scope: "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-11-27T17:56:32.166Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-11-27T17:58:32.383Z"
  updated_by: "CODER"
  note: "Pinned assertion reproduced. All 16 existing Calc and Writer ODF font cases pass on main along with focused lint, format and git diff checks."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-11-27T17:58:32.919Z"
  updated_by: "EVALUATOR"
  note: "The existing Calc font test follows the implemented native declaration owner."
  evaluated_sha: "6862a9d35e6b35486ab42c13b970a34f39c6ff2a"
  blueprint_digest: "0a9712536f097f84228789b304009bb3cf63e4d8695600234d219a30378765e6"
  evidence_refs:
    - ".agentplane/tasks/202611271756-GSDVGC/README.md"
    - ".agentplane/tasks/202611271756-GSDVGC/quality/20261127-175832919-recovery-context/quality-report.json"
    - ".agentplane/tasks/202611271756-GSDVGC/quality/20261127-175832919-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202611271756-GSDVGC/quality/20261127-175832919-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202611271756-GSDVGC/blueprint/resolved-snapshot.json"
    - "output/playwright/odf-full-checkpoint-20261128/font-checkpoint-verification.md"
  findings:
    - "One stale checkpoint assertion replaced with document ownership and embedding flag assertions. Production code unchanged."
commit: null
comments:
  -
    author: "CODER"
    body: "Start: reconcile the reproduced font-declaration assertion with the implemented native owner."
events:
  -
    type: "status"
    at: "2026-11-27T17:56:32.662Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: reconcile the reproduced font-declaration assertion with the implemented native owner."
  -
    type: "verify"
    at: "2026-11-27T17:58:32.383Z"
    author: "CODER"
    state: "ok"
    note: "Pinned assertion reproduced. All 16 existing Calc and Writer ODF font cases pass on main along with focused lint, format and git diff checks."
doc_version: 3
doc_updated_at: "2026-11-27T17:58:32.441Z"
doc_updated_by: "CODER"
description: "Repair the reproducible full-checkpoint assertion that Calc still rejects embedded font declarations. Verify declaration ownership before byte admission, preserve the missing-face defaults and invalid-style diagnostics, and rerun the existing Calc and shared ODF font cases."
sections:
  Summary: |-
    Reconcile Calc ODS embedded font verification with the pinned importer

    Repair the reproducible full-checkpoint assertion that Calc still rejects embedded font declarations. Verify declaration ownership before byte admission, preserve the missing-face defaults and invalid-style diagnostics, and rerun the existing Calc and shared ODF font cases.
  Scope: |-
    - In scope: Repair the reproducible full-checkpoint assertion that Calc still rejects embedded font declarations. Verify declaration ownership before byte admission, preserve the missing-face defaults and invalid-style diagnostics, and rerun the existing Calc and shared ODF font cases.
    - Out of scope: unrelated refactors not required for "Reconcile Calc ODS embedded font verification with the pinned importer".
  Plan: "Replace the stale assertion in the existing native-font importer test with the actual document-owned declaration and unopened-resource defaults. Keep its unrelated invalid-style and fallback checks. Verify the pinned failure and rerun existing native Calc font and shared Writer ODF resource cases without broadening test coverage or changing production code."
  Verify Steps: |-
    PLANNER fallback scaffold for "Reconcile Calc ODS embedded font verification with the pinned importer". Replace with task-specific acceptance checks when PLANNER context is available.

    1. Review the requested outcome for "Reconcile Calc ODS embedded font verification with the pinned importer". Expected: the visible result matches ## Summary and stays inside approved scope.
    2. Run the most relevant validation step for this task. Expected: it succeeds without unexpected regressions in touched behavior.
    3. Compare the final result against ## Scope and record any residual follow-up in ## Findings. Expected: open edges are explicit rather than implicit.
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-11-27T17:58:32.383Z — VERIFY — ok

    By: CODER

    Note: Pinned assertion reproduced. All 16 existing Calc and Writer ODF font cases pass on main along with focused lint, format and git diff checks.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-11-27T17:56:32.662Z, excerpt_hash=sha256:2de20f422f95d62fed84186f426c638bc69b6b285148c36e696661d08f3b9803

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202611271756-GSDVGC/blueprint/resolved-snapshot.json
    - old_digest: 0a9712536f097f84228789b304009bb3cf63e4d8695600234d219a30378765e6
    - current_digest: 0a9712536f097f84228789b304009bb3cf63e4d8695600234d219a30378765e6
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202611271756-GSDVGC

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202611271756-GSDVGC
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

Reconcile Calc ODS embedded font verification with the pinned importer

Repair the reproducible full-checkpoint assertion that Calc still rejects embedded font declarations. Verify declaration ownership before byte admission, preserve the missing-face defaults and invalid-style diagnostics, and rerun the existing Calc and shared ODF font cases.

## Scope

- In scope: Repair the reproducible full-checkpoint assertion that Calc still rejects embedded font declarations. Verify declaration ownership before byte admission, preserve the missing-face defaults and invalid-style diagnostics, and rerun the existing Calc and shared ODF font cases.
- Out of scope: unrelated refactors not required for "Reconcile Calc ODS embedded font verification with the pinned importer".

## Plan

Replace the stale assertion in the existing native-font importer test with the actual document-owned declaration and unopened-resource defaults. Keep its unrelated invalid-style and fallback checks. Verify the pinned failure and rerun existing native Calc font and shared Writer ODF resource cases without broadening test coverage or changing production code.

## Verify Steps

PLANNER fallback scaffold for "Reconcile Calc ODS embedded font verification with the pinned importer". Replace with task-specific acceptance checks when PLANNER context is available.

1. Review the requested outcome for "Reconcile Calc ODS embedded font verification with the pinned importer". Expected: the visible result matches ## Summary and stays inside approved scope.
2. Run the most relevant validation step for this task. Expected: it succeeds without unexpected regressions in touched behavior.
3. Compare the final result against ## Scope and record any residual follow-up in ## Findings. Expected: open edges are explicit rather than implicit.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-11-27T17:58:32.383Z — VERIFY — ok

By: CODER

Note: Pinned assertion reproduced. All 16 existing Calc and Writer ODF font cases pass on main along with focused lint, format and git diff checks.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-11-27T17:56:32.662Z, excerpt_hash=sha256:2de20f422f95d62fed84186f426c638bc69b6b285148c36e696661d08f3b9803

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202611271756-GSDVGC/blueprint/resolved-snapshot.json
- old_digest: 0a9712536f097f84228789b304009bb3cf63e4d8695600234d219a30378765e6
- current_digest: 0a9712536f097f84228789b304009bb3cf63e4d8695600234d219a30378765e6
- route_changed: no
- safe_command: agentplane blueprint snapshot 202611271756-GSDVGC

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202611271756-GSDVGC
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
