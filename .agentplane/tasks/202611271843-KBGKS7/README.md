---
id: "202611271843-KBGKS7"
title: "Port native Calc ODS database filter item values"
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
  updated_at: "2026-11-27T18:44:59.987Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-11-28T04:29:42.697Z"
  updated_by: "CODER"
  note: "All 9 focused Calc tests pass, including the two original LibreOffice filter documents. Office typecheck, ESLint, Prettier, module boundaries, source provenance and Calc parity inventory passed; zero semantic violations."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-11-28T04:29:43.984Z"
  updated_by: "EVALUATOR"
  note: "Calc derives ODS database filter values from the native typed color and RTL numeric contracts."
  evaluated_sha: "b405230303d6b18d6c4dfacbc1ab8ef6d67a526e"
  blueprint_digest: "b468733869a64ad415e5683c5ebb225cac4aeebccec1f96498b5bcbc07fcb045"
  evidence_refs:
    - ".agentplane/tasks/202611271843-KBGKS7/README.md"
    - ".agentplane/tasks/202611271843-KBGKS7/quality/20261128-042943984-recovery-context/quality-report.json"
    - ".agentplane/tasks/202611271843-KBGKS7/quality/20261128-042943984-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202611271843-KBGKS7/quality/20261128-042943984-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202611271843-KBGKS7/blueprint/resolved-snapshot.json"
    - "output/playwright/odf-next-checkpoint/ods-filter-query-verification.md"
  findings:
    - "The original RGB, automatic styling and date filters retain their XML values through the represented package and Worker paths. CALC-873 records the native non-empty overwrite."
commit: null
comments:
  -
    author: "CODER"
    body: "Start: bind ODS database filter input and output to actual native query item values."
events:
  -
    type: "status"
    at: "2026-11-27T18:45:00.587Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: bind ODS database filter input and output to actual native query item values."
  -
    type: "verify"
    at: "2026-11-28T04:29:42.697Z"
    author: "CODER"
    state: "ok"
    note: "All 9 focused Calc tests pass, including the two original LibreOffice filter documents. Office typecheck, ESLint, Prettier, module boundaries, source provenance and Calc parity inventory passed; zero semantic violations."
doc_version: 3
doc_updated_at: "2026-11-28T04:29:42.876Z"
doc_updated_by: "CODER"
description: "Use actual native Calc colors in database query items and preserve the filter operators and lexical values in ODS. Apply the original color and automatic-color conversions, dialect property admission and Worker binding with existing-record compatibility. Port native ODS autofilter color assertions and preserve and document the original non-empty filter parser behavior."
sections:
  Summary: |-
    Port native Calc ODS database filter item values

    Use actual native Calc colors in database query items and preserve the filter operators and lexical values in ODS. Apply the original color and automatic-color conversions, dialect property admission and Worker binding with existing-record compatibility. Port native ODS autofilter color assertions and preserve and document the original non-empty filter parser behavior.
  Scope: |-
    - In scope: Use actual native Calc colors in database query items and preserve the filter operators and lexical values in ODS. Apply the original color and automatic-color conversions, dialect property admission and Worker binding with existing-record compatibility. Port native ODS autofilter color assertions and preserve and document the original non-empty filter parser behavior.
    - Out of scope: unrelated refactors not required for "Port native Calc ODS database filter item values".
  Plan: "Port the original typed values within Calc database query criteria. Store native Color items, consume both supported automatic-color tokens and preserve last-attribute precedence. Use the existing native decimal conversion and output paths for numeric criteria and retain original lexical set members. Restore structured Worker records with compatibility for existing lexical colors. Preserve and document the upstream non-empty criterion overwrite and exercise original autofilter-colors.ods plus related database and Worker cases."
  Verify Steps: |-
    PLANNER fallback scaffold for "Port native Calc ODS database filter item values". Replace with task-specific acceptance checks when PLANNER context is available.

    1. Review the requested outcome for "Port native Calc ODS database filter item values". Expected: the visible result matches ## Summary and stays inside approved scope.
    2. Run the most relevant validation step for this task. Expected: it succeeds without unexpected regressions in touched behavior.
    3. Compare the final result against ## Scope and record any residual follow-up in ## Findings. Expected: open edges are explicit rather than implicit.
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-11-28T04:29:42.697Z — VERIFY — ok

    By: CODER

    Note: All 9 focused Calc tests pass, including the two original LibreOffice filter documents. Office typecheck, ESLint, Prettier, module boundaries, source provenance and Calc parity inventory passed; zero semantic violations.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-11-27T18:45:00.587Z, excerpt_hash=sha256:0f7135b4897e9c3250a30fbd8b619f755df41b5aa7052dfe3dee2553ff9dbf6b

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202611271843-KBGKS7/blueprint/resolved-snapshot.json
    - old_digest: b468733869a64ad415e5683c5ebb225cac4aeebccec1f96498b5bcbc07fcb045
    - current_digest: b468733869a64ad415e5683c5ebb225cac4aeebccec1f96498b5bcbc07fcb045
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202611271843-KBGKS7

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202611271843-KBGKS7
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

Port native Calc ODS database filter item values

Use actual native Calc colors in database query items and preserve the filter operators and lexical values in ODS. Apply the original color and automatic-color conversions, dialect property admission and Worker binding with existing-record compatibility. Port native ODS autofilter color assertions and preserve and document the original non-empty filter parser behavior.

## Scope

- In scope: Use actual native Calc colors in database query items and preserve the filter operators and lexical values in ODS. Apply the original color and automatic-color conversions, dialect property admission and Worker binding with existing-record compatibility. Port native ODS autofilter color assertions and preserve and document the original non-empty filter parser behavior.
- Out of scope: unrelated refactors not required for "Port native Calc ODS database filter item values".

## Plan

Port the original typed values within Calc database query criteria. Store native Color items, consume both supported automatic-color tokens and preserve last-attribute precedence. Use the existing native decimal conversion and output paths for numeric criteria and retain original lexical set members. Restore structured Worker records with compatibility for existing lexical colors. Preserve and document the upstream non-empty criterion overwrite and exercise original autofilter-colors.ods plus related database and Worker cases.

## Verify Steps

PLANNER fallback scaffold for "Port native Calc ODS database filter item values". Replace with task-specific acceptance checks when PLANNER context is available.

1. Review the requested outcome for "Port native Calc ODS database filter item values". Expected: the visible result matches ## Summary and stays inside approved scope.
2. Run the most relevant validation step for this task. Expected: it succeeds without unexpected regressions in touched behavior.
3. Compare the final result against ## Scope and record any residual follow-up in ## Findings. Expected: open edges are explicit rather than implicit.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-11-28T04:29:42.697Z — VERIFY — ok

By: CODER

Note: All 9 focused Calc tests pass, including the two original LibreOffice filter documents. Office typecheck, ESLint, Prettier, module boundaries, source provenance and Calc parity inventory passed; zero semantic violations.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-11-27T18:45:00.587Z, excerpt_hash=sha256:0f7135b4897e9c3250a30fbd8b619f755df41b5aa7052dfe3dee2553ff9dbf6b

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202611271843-KBGKS7/blueprint/resolved-snapshot.json
- old_digest: b468733869a64ad415e5683c5ebb225cac4aeebccec1f96498b5bcbc07fcb045
- current_digest: b468733869a64ad415e5683c5ebb225cac4aeebccec1f96498b5bcbc07fcb045
- route_changed: no
- safe_command: agentplane blueprint snapshot 202611271843-KBGKS7

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202611271843-KBGKS7
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
