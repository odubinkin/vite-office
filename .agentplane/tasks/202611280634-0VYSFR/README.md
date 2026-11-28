---
id: "202611280634-0VYSFR"
title: "Port Calc ODS tracked formula and formatted text snapshots"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 6
origin:
  system: "manual"
depends_on: []
tags:
  - "calc"
task_kind: "code"
mutation_scope: "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-11-28T06:34:29.069Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-11-28T06:43:43.956Z"
  updated_by: "CODER"
  note: "40 closely related ODS tests passed, then all 17 tracked formula, matrix, edit and Worker tests passed after preserving the clean formula cache. Typecheck, lint, dependencies, source provenance and zero Calc parity violations. CALC-876 records the pinned first-paragraph space behavior."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-11-28T06:43:44.970Z"
  updated_by: "EVALUATOR"
  note: "Calc retains native historical formulas and formatted snapshots through ODS and Worker."
  evaluated_sha: "db73873e93616825c61d45db97551ea7c315d5bb"
  blueprint_digest: "cd6de32815c76a025c22fcc8ad376eeabfb391b01772f76c9e033d6e4cb4a2da"
  evidence_refs:
    - ".agentplane/tasks/202611280634-0VYSFR/README.md"
    - ".agentplane/tasks/202611280634-0VYSFR/quality/20261128-064344970-recovery-context/quality-report.json"
    - ".agentplane/tasks/202611280634-0VYSFR/quality/20261128-064344970-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202611280634-0VYSFR/quality/20261128-064344970-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202611280634-0VYSFR/blueprint/resolved-snapshot.json"
    - "output/playwright/odf-next-checkpoint/calc-historical-formula-verification.md"
  findings:
    - "The roundtrip preserves the original historical position, real recalculated value and clean cache, text spans and old/new action ownership."
commit: null
comments:
  -
    author: "CODER"
    body: "Start: use the original historical formula and edit-text ownership paths."
events:
  -
    type: "status"
    at: "2026-11-28T06:34:29.774Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: use the original historical formula and edit-text ownership paths."
  -
    type: "verify"
    at: "2026-11-28T06:43:43.956Z"
    author: "CODER"
    state: "ok"
    note: "40 closely related ODS tests passed, then all 17 tracked formula, matrix, edit and Worker tests passed after preserving the clean formula cache. Typecheck, lint, dependencies, source provenance and zero Calc parity violations. CALC-876 records the pinned first-paragraph space behavior."
doc_version: 3
doc_updated_at: "2026-11-28T06:43:44.073Z"
doc_updated_by: "CODER"
description: "Restore and export historical formula and EditEngine cell snapshots through native change tracking XML and the ODS Worker. Reuse existing formula grammars, address conversion, matrix ownership and text style pools. Keep scalar actions and their previously tracked behavior intact."
sections:
  Summary: |-
    Port Calc ODS tracked formula and formatted text snapshots

    Restore and export historical formula and EditEngine cell snapshots through native change tracking XML and the ODS Worker. Reuse existing formula grammars, address conversion, matrix ownership and text style pools. Keep scalar actions and their previously tracked behavior intact.
  Scope: |-
    - In scope: Restore and export historical formula and EditEngine cell snapshots through native change tracking XML and the ODS Worker. Reuse existing formula grammars, address conversion, matrix ownership and text style pools. Keep scalar actions and their previously tracked behavior intact.
    - Out of scope: unrelated refactors not required for "Port Calc ODS tracked formula and formatted text snapshots".
  Plan: "Extend the native change-track cell loader to own historical formula and EditEngine snapshots, preserving formula grammar, cell position, represented matrix flags, action links and first-paragraph behavior. Export using the original tracked-cell shape plus actual wrapped formula calculation and shared cell text style collection. Preserve previously encoded Worker records and transport actual non-scalar old and new cells. Verify existing ODS tracking, Worker, edit text and formula tests and one critical real ODS package roundtrip. Document the pinned first-paragraph text:s behavior. Leave structural actions and interactive change recording outside this increment."
  Verify Steps: |-
    PLANNER fallback scaffold for "Port Calc ODS tracked formula and formatted text snapshots". Replace with task-specific acceptance checks when PLANNER context is available.

    1. Review the requested outcome for "Port Calc ODS tracked formula and formatted text snapshots". Expected: the visible result matches ## Summary and stays inside approved scope.
    2. Run the most relevant validation step for this task. Expected: it succeeds without unexpected regressions in touched behavior.
    3. Compare the final result against ## Scope and record any residual follow-up in ## Findings. Expected: open edges are explicit rather than implicit.
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-11-28T06:43:43.956Z — VERIFY — ok

    By: CODER

    Note: 40 closely related ODS tests passed, then all 17 tracked formula, matrix, edit and Worker tests passed after preserving the clean formula cache. Typecheck, lint, dependencies, source provenance and zero Calc parity violations. CALC-876 records the pinned first-paragraph space behavior.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-11-28T06:34:29.774Z, excerpt_hash=sha256:699759231ced31c1b0915b95e28ae91d8c769d1a68aff8e255ed234b0705f1eb

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202611280634-0VYSFR/blueprint/resolved-snapshot.json
    - old_digest: cd6de32815c76a025c22fcc8ad376eeabfb391b01772f76c9e033d6e4cb4a2da
    - current_digest: cd6de32815c76a025c22fcc8ad376eeabfb391b01772f76c9e033d6e4cb4a2da
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202611280634-0VYSFR

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202611280634-0VYSFR
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

Port Calc ODS tracked formula and formatted text snapshots

Restore and export historical formula and EditEngine cell snapshots through native change tracking XML and the ODS Worker. Reuse existing formula grammars, address conversion, matrix ownership and text style pools. Keep scalar actions and their previously tracked behavior intact.

## Scope

- In scope: Restore and export historical formula and EditEngine cell snapshots through native change tracking XML and the ODS Worker. Reuse existing formula grammars, address conversion, matrix ownership and text style pools. Keep scalar actions and their previously tracked behavior intact.
- Out of scope: unrelated refactors not required for "Port Calc ODS tracked formula and formatted text snapshots".

## Plan

Extend the native change-track cell loader to own historical formula and EditEngine snapshots, preserving formula grammar, cell position, represented matrix flags, action links and first-paragraph behavior. Export using the original tracked-cell shape plus actual wrapped formula calculation and shared cell text style collection. Preserve previously encoded Worker records and transport actual non-scalar old and new cells. Verify existing ODS tracking, Worker, edit text and formula tests and one critical real ODS package roundtrip. Document the pinned first-paragraph text:s behavior. Leave structural actions and interactive change recording outside this increment.

## Verify Steps

PLANNER fallback scaffold for "Port Calc ODS tracked formula and formatted text snapshots". Replace with task-specific acceptance checks when PLANNER context is available.

1. Review the requested outcome for "Port Calc ODS tracked formula and formatted text snapshots". Expected: the visible result matches ## Summary and stays inside approved scope.
2. Run the most relevant validation step for this task. Expected: it succeeds without unexpected regressions in touched behavior.
3. Compare the final result against ## Scope and record any residual follow-up in ## Findings. Expected: open edges are explicit rather than implicit.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-11-28T06:43:43.956Z — VERIFY — ok

By: CODER

Note: 40 closely related ODS tests passed, then all 17 tracked formula, matrix, edit and Worker tests passed after preserving the clean formula cache. Typecheck, lint, dependencies, source provenance and zero Calc parity violations. CALC-876 records the pinned first-paragraph space behavior.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-11-28T06:34:29.774Z, excerpt_hash=sha256:699759231ced31c1b0915b95e28ae91d8c769d1a68aff8e255ed234b0705f1eb

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202611280634-0VYSFR/blueprint/resolved-snapshot.json
- old_digest: cd6de32815c76a025c22fcc8ad376eeabfb391b01772f76c9e033d6e4cb4a2da
- current_digest: cd6de32815c76a025c22fcc8ad376eeabfb391b01772f76c9e033d6e4cb4a2da
- route_changed: no
- safe_command: agentplane blueprint snapshot 202611280634-0VYSFR

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202611280634-0VYSFR
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
