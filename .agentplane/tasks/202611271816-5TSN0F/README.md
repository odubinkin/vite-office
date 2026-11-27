---
id: "202611271816-5TSN0F"
title: "Apply native Calc ODS sheet backgrounds as cell formatting"
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
  updated_at: "2026-11-27T18:17:15.834Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-11-27T18:22:14.003Z"
  updated_by: "CODER"
  note: "48 focused Calc tests passed. Sheet default, transparent override, sparse far cells, Worker and ODS reopen verified. Typecheck, lint, provenance and inventory passed."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-11-27T18:22:14.560Z"
  updated_by: "EVALUATOR"
  note: "Calc table-family background import uses native sparse cell formatting."
  evaluated_sha: "7e66bc3707adf0e38a6b73f35e799addc47d78b6"
  blueprint_digest: "2381b4a1ccaf7cb5dc3995d1801434fe89203a97c7f4b703808dcad113a94fb9"
  evidence_refs:
    - ".agentplane/tasks/202611271816-5TSN0F/README.md"
    - ".agentplane/tasks/202611271816-5TSN0F/quality/20261127-182214560-recovery-context/quality-report.json"
    - ".agentplane/tasks/202611271816-5TSN0F/quality/20261127-182214560-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202611271816-5TSN0F/quality/20261127-182214560-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202611271816-5TSN0F/blueprint/resolved-snapshot.json"
    - "output/playwright/odf-next-checkpoint/sheet-background-verification.md"
  findings:
    - "Cell override and both transport paths passed. Source behavior for the ignored table complex-color child is documented as CALC-872."
commit: null
comments:
  -
    author: "CODER"
    body: "Start: apply original table-family background properties through the native cell pattern."
events:
  -
    type: "status"
    at: "2026-11-27T18:17:16.238Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: apply original table-family background properties through the native cell pattern."
  -
    type: "verify"
    at: "2026-11-27T18:22:14.003Z"
    author: "CODER"
    state: "ok"
    note: "48 focused Calc tests passed. Sheet default, transparent override, sparse far cells, Worker and ODS reopen verified. Typecheck, lint, provenance and inventory passed."
doc_version: 3
doc_updated_at: "2026-11-27T18:22:14.078Z"
doc_updated_by: "CODER"
description: "Port the import-only table-family background color, transparency and complex-color properties. Apply them through the original sheet-wide native cell pattern before cell style ranges. Keep the sparse default-column representation and export the inherited result through regular ODS cell styles and Worker formatting. Verify overrides, sparse far cells and reopen with the related existing color and style tests."
sections:
  Summary: |-
    Apply native Calc ODS sheet backgrounds as cell formatting

    Port the import-only table-family background color, transparency and complex-color properties. Apply them through the original sheet-wide native cell pattern before cell style ranges. Keep the sparse default-column representation and export the inherited result through regular ODS cell styles and Worker formatting. Verify overrides, sparse far cells and reopen with the related existing color and style tests.
  Scope: |-
    - In scope: Port the import-only table-family background color, transparency and complex-color properties. Apply them through the original sheet-wide native cell pattern before cell style ranges. Keep the sparse default-column representation and export the inherited result through regular ODS cell styles and Worker formatting. Verify overrides, sparse far cells and reopen with the related existing color and style tests.
    - Out of scope: unrelated refactors not required for "Apply native Calc ODS sheet backgrounds as cell formatting".
  Plan: "Follow the pinned table-family background property import and apply color and transparency via native sparse full-sheet cell patterns before cell ranges. The pinned generic table property context ignores the mapped background complex-color child. Preserve and document that source behavior. Export actual cell attributes through the existing ODS automatic styles and Worker. Verify one critical background/override/reopen case and the existing Calc color and ODS style tests."
  Verify Steps: |-
    PLANNER fallback scaffold for "Apply native Calc ODS sheet backgrounds as cell formatting". Replace with task-specific acceptance checks when PLANNER context is available.

    1. Review the requested outcome for "Apply native Calc ODS sheet backgrounds as cell formatting". Expected: the visible result matches ## Summary and stays inside approved scope.
    2. Run the most relevant validation step for this task. Expected: it succeeds without unexpected regressions in touched behavior.
    3. Compare the final result against ## Scope and record any residual follow-up in ## Findings. Expected: open edges are explicit rather than implicit.
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-11-27T18:22:14.003Z — VERIFY — ok

    By: CODER

    Note: 48 focused Calc tests passed. Sheet default, transparent override, sparse far cells, Worker and ODS reopen verified. Typecheck, lint, provenance and inventory passed.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-11-27T18:17:16.238Z, excerpt_hash=sha256:4c5c039ee1f8e9320fd28010108bc6514e77bb1eb27bc3f6e4d0f8d798ba41a1

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202611271816-5TSN0F/blueprint/resolved-snapshot.json
    - old_digest: 2381b4a1ccaf7cb5dc3995d1801434fe89203a97c7f4b703808dcad113a94fb9
    - current_digest: 2381b4a1ccaf7cb5dc3995d1801434fe89203a97c7f4b703808dcad113a94fb9
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202611271816-5TSN0F

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202611271816-5TSN0F
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

Apply native Calc ODS sheet backgrounds as cell formatting

Port the import-only table-family background color, transparency and complex-color properties. Apply them through the original sheet-wide native cell pattern before cell style ranges. Keep the sparse default-column representation and export the inherited result through regular ODS cell styles and Worker formatting. Verify overrides, sparse far cells and reopen with the related existing color and style tests.

## Scope

- In scope: Port the import-only table-family background color, transparency and complex-color properties. Apply them through the original sheet-wide native cell pattern before cell style ranges. Keep the sparse default-column representation and export the inherited result through regular ODS cell styles and Worker formatting. Verify overrides, sparse far cells and reopen with the related existing color and style tests.
- Out of scope: unrelated refactors not required for "Apply native Calc ODS sheet backgrounds as cell formatting".

## Plan

Follow the pinned table-family background property import and apply color and transparency via native sparse full-sheet cell patterns before cell ranges. The pinned generic table property context ignores the mapped background complex-color child. Preserve and document that source behavior. Export actual cell attributes through the existing ODS automatic styles and Worker. Verify one critical background/override/reopen case and the existing Calc color and ODS style tests.

## Verify Steps

PLANNER fallback scaffold for "Apply native Calc ODS sheet backgrounds as cell formatting". Replace with task-specific acceptance checks when PLANNER context is available.

1. Review the requested outcome for "Apply native Calc ODS sheet backgrounds as cell formatting". Expected: the visible result matches ## Summary and stays inside approved scope.
2. Run the most relevant validation step for this task. Expected: it succeeds without unexpected regressions in touched behavior.
3. Compare the final result against ## Scope and record any residual follow-up in ## Findings. Expected: open edges are explicit rather than implicit.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-11-27T18:22:14.003Z — VERIFY — ok

By: CODER

Note: 48 focused Calc tests passed. Sheet default, transparent override, sparse far cells, Worker and ODS reopen verified. Typecheck, lint, provenance and inventory passed.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-11-27T18:17:16.238Z, excerpt_hash=sha256:4c5c039ee1f8e9320fd28010108bc6514e77bb1eb27bc3f6e4d0f8d798ba41a1

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202611271816-5TSN0F/blueprint/resolved-snapshot.json
- old_digest: 2381b4a1ccaf7cb5dc3995d1801434fe89203a97c7f4b703808dcad113a94fb9
- current_digest: 2381b4a1ccaf7cb5dc3995d1801434fe89203a97c7f4b703808dcad113a94fb9
- route_changed: no
- safe_command: agentplane blueprint snapshot 202611271816-5TSN0F

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202611271816-5TSN0F
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
