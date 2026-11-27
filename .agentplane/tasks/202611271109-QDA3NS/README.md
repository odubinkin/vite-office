---
id: "202611271109-QDA3NS"
title: "Preserve native Calc data validation rules in ODS"
result_summary: "Retained native Calc ODS data validation and cell-pattern ownership."
status: "DONE"
priority: "med"
owner: "CODER"
revision: 8
origin:
  system: "manual"
depends_on: []
tags:
  - "calc"
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-11-27T11:09:17.919Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-11-27T11:39:34.300Z"
  updated_by: "CODER"
  note: "Tests  42 passed (42). Native dataValidity.ods, typecheck, lint, formatting, dependencies, provenance and Calc inventory passed."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-11-27T11:39:34.798Z"
  updated_by: "EVALUATOR"
  note: "Verified pinned ODS validation declarations, native cell bindings and sparse repeated ranges after Worker transfer and reopening."
  evaluated_sha: "b0653f9908ec94117fe04f3c571c55233e1de25c"
  blueprint_digest: "2e5fcfe4995c7e9df07ef7bdfc30f0151808a63fb1261d376b68179a2eca6d56"
  evidence_refs:
    - ".agentplane/tasks/202611271109-QDA3NS/README.md"
    - ".agentplane/tasks/202611271109-QDA3NS/quality/20261127-113934798-recovery-context/quality-report.json"
    - ".agentplane/tasks/202611271109-QDA3NS/quality/20261127-113934798-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202611271109-QDA3NS/quality/20261127-113934798-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202611271109-QDA3NS/blueprint/resolved-snapshot.json"
    - "/Users/odubinkin/Projects/vite-office/output/playwright/QDA3NS/verification.md"
    - "b0653f9908ec94117fe04f3c571c55233e1de25c"
  findings:
    - "The shared formula condition, document-owned rule keys and XML contexts retain the native rule and prompt behavior in the represented filter. Interactive validation and macro events are outside this slice."
commit:
  hash: "b0653f9908ec94117fe04f3c571c55233e1de25c"
  message: "🧩 QDA3NS calc: retain native data validation rules in ODS"
comments:
  -
    author: "CODER"
    body: "Start: continue direct-mode task in current checkout."
  -
    author: "CODER"
    body: "Verified: pinned Calc data validation definitions, assigned ranges, cell values and custom formula survived Worker and ODS round trips."
events:
  -
    type: "status"
    at: "2026-11-27T11:09:18.370Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: continue direct-mode task in current checkout."
  -
    type: "verify"
    at: "2026-11-27T11:39:34.300Z"
    author: "CODER"
    state: "ok"
    note: "Tests  42 passed (42). Native dataValidity.ods, typecheck, lint, formatting, dependencies, provenance and Calc inventory passed."
  -
    type: "status"
    at: "2026-11-27T11:40:33.841Z"
    author: "CODER"
    from: "DOING"
    to: "DONE"
    note: "Verified: pinned Calc data validation definitions, assigned ranges, cell values and custom formula survived Worker and ODS round trips."
doc_version: 3
doc_updated_at: "2026-11-27T11:40:33.842Z"
doc_updated_by: "CODER"
description: "Port the original validation condition owner, document rule list and cell pattern reference, ODS validation declarations and cell bindings, and Worker transport. Verify the original dataValidity.ods fixture and required formula predicates in the represented kernel."
sections:
  Summary: |-
    Preserve native Calc data validation rules in ODS

    Port the original validation condition owner, document rule list and cell pattern reference, ODS validation declarations and cell bindings, and Worker transport. Verify the original dataValidity.ods fixture and required formula predicates in the represented kernel.
  Scope: |-
    - In scope: Port the original validation condition owner, document rule list and cell pattern reference, ODS validation declarations and cell bindings, and Worker transport. Verify the original dataValidity.ods fixture and required formula predicates in the represented kernel.
    - Out of scope: unrelated refactors not required for "Preserve native Calc data validation rules in ODS".
  Plan: "1. Port ScValidationData and the document-owned rule list, reusing the native condition entry and cell pattern attribute. 2. Port ODF validation declarations, condition/message processing, and binding to loaded and exported cell ranges, with Worker graph transport. 3. Transfer the pinned dataValidity.ods checks, including formulas in the represented model, and run relevant static and focused existing tests."
  Verify Steps: "Check the complete pinned dataValidity.ods case for rule identity, base cells, messages, expected ranges and native condition operands. Verify the same selections and original cell values after Worker transport and ODS reopen. Run existing associated condition, native calc model, and ODS tests plus typecheck, lint, dependency, provenance and Calc inventory checks."
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-11-27T11:39:34.300Z — VERIFY — ok

    By: CODER

    Note: Tests  42 passed (42). Native dataValidity.ods, typecheck, lint, formatting, dependencies, provenance and Calc inventory passed.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-11-27T11:09:18.370Z, excerpt_hash=sha256:4df1a420323e2e6fdce8919fbccae3bf5684f12294e3ae4816307ca9213471c8

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202611271109-QDA3NS/blueprint/resolved-snapshot.json
    - old_digest: 2e5fcfe4995c7e9df07ef7bdfc30f0151808a63fb1261d376b68179a2eca6d56
    - current_digest: 2e5fcfe4995c7e9df07ef7bdfc30f0151808a63fb1261d376b68179a2eca6d56
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202611271109-QDA3NS

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202611271109-QDA3NS
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

Preserve native Calc data validation rules in ODS

Port the original validation condition owner, document rule list and cell pattern reference, ODS validation declarations and cell bindings, and Worker transport. Verify the original dataValidity.ods fixture and required formula predicates in the represented kernel.

## Scope

- In scope: Port the original validation condition owner, document rule list and cell pattern reference, ODS validation declarations and cell bindings, and Worker transport. Verify the original dataValidity.ods fixture and required formula predicates in the represented kernel.
- Out of scope: unrelated refactors not required for "Preserve native Calc data validation rules in ODS".

## Plan

1. Port ScValidationData and the document-owned rule list, reusing the native condition entry and cell pattern attribute. 2. Port ODF validation declarations, condition/message processing, and binding to loaded and exported cell ranges, with Worker graph transport. 3. Transfer the pinned dataValidity.ods checks, including formulas in the represented model, and run relevant static and focused existing tests.

## Verify Steps

Check the complete pinned dataValidity.ods case for rule identity, base cells, messages, expected ranges and native condition operands. Verify the same selections and original cell values after Worker transport and ODS reopen. Run existing associated condition, native calc model, and ODS tests plus typecheck, lint, dependency, provenance and Calc inventory checks.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-11-27T11:39:34.300Z — VERIFY — ok

By: CODER

Note: Tests  42 passed (42). Native dataValidity.ods, typecheck, lint, formatting, dependencies, provenance and Calc inventory passed.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-11-27T11:09:18.370Z, excerpt_hash=sha256:4df1a420323e2e6fdce8919fbccae3bf5684f12294e3ae4816307ca9213471c8

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202611271109-QDA3NS/blueprint/resolved-snapshot.json
- old_digest: 2e5fcfe4995c7e9df07ef7bdfc30f0151808a63fb1261d376b68179a2eca6d56
- current_digest: 2e5fcfe4995c7e9df07ef7bdfc30f0151808a63fb1261d376b68179a2eca6d56
- route_changed: no
- safe_command: agentplane blueprint snapshot 202611271109-QDA3NS

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202611271109-QDA3NS
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
