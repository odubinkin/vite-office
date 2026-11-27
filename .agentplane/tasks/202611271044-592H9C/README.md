---
id: "202611271044-592H9C"
title: "Use native storage grammar for ODS formulas and named expressions"
result_summary: "align legacy ODS storage formula grammar."
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
  updated_at: "2026-11-27T10:44:58.875Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-11-27T11:36:57.098Z"
  updated_by: "CODER"
  note: "Tests  50 passed (50). Office typecheck, lint, formatting, dependency, provenance and registry checks passed."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-11-27T11:36:57.552Z"
  updated_by: "EVALUATOR"
  note: "Pinned tdf37341.ods formulas, the native legacy version default, explicit namespaces, matrix and named expressions, Worker persistence and modern export."
  evaluated_sha: "b1314e12486c79778d0c773b327af615fd74018f"
  blueprint_digest: "77a34d0370044e57b6630b24e7704753c86175b5b6660b1a412680cd642c07c7"
  evidence_refs:
    - ".agentplane/tasks/202611271044-592H9C/README.md"
    - ".agentplane/tasks/202611271044-592H9C/quality/20261127-113657552-recovery-context/quality-report.json"
    - ".agentplane/tasks/202611271044-592H9C/quality/20261127-113657552-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202611271044-592H9C/quality/20261127-113657552-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202611271044-592H9C/blueprint/resolved-snapshot.json"
    - "/Users/odubinkin/Projects/vite-office/output/playwright/592H9C/verification.md"
    - "b1314e12486c79778d0c773b327af615fd74018f"
  findings:
    - "The filter uses native legacy grammar selection and preserves formulas within the represented compiler. Goal Seek and external grammar providers are outside the tested slice."
commit:
  hash: "b1314e12486c79778d0c773b327af615fd74018f"
  message: "🧩 592H9C calc: align legacy ODS storage formula grammar"
comments:
  -
    author: "CODER"
    body: "Start: continue direct-mode task in current checkout."
  -
    author: "CODER"
    body: "Verified: Pinned tdf37341.ods formulas, the native legacy version default, explicit namespaces, matrix and named expressions, Worker persistence and modern export.       Tests  50 passed (50)."
events:
  -
    type: "status"
    at: "2026-11-27T10:45:06.598Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: continue direct-mode task in current checkout."
  -
    type: "verify"
    at: "2026-11-27T11:36:57.098Z"
    author: "CODER"
    state: "ok"
    note: "Tests  50 passed (50). Office typecheck, lint, formatting, dependency, provenance and registry checks passed."
  -
    type: "status"
    at: "2026-11-27T11:37:58.117Z"
    author: "CODER"
    from: "DOING"
    to: "DONE"
    note: "Verified: Pinned tdf37341.ods formulas, the native legacy version default, explicit namespaces, matrix and named expressions, Worker persistence and modern export.       Tests  50 passed (50)."
doc_version: 3
doc_updated_at: "2026-11-27T11:37:58.118Z"
doc_updated_by: "CODER"
description: "Port Calc ODF version and formula-namespace storage grammar selection for ordinary and matrix cells, named expressions and existing style formula families, preserving import and modern OpenFormula export for the represented compiler slice."
sections:
  Summary: |-
    Use native storage grammar for ODS formulas and named expressions

    Port Calc ODF version and formula-namespace storage grammar selection for ordinary and matrix cells, named expressions and existing style formula families, preserving import and modern OpenFormula export for the represented compiler slice.
  Scope: |-
    - In scope: Port Calc ODF version and formula-namespace storage grammar selection for ordinary and matrix cells, named expressions and existing style formula families, preserving import and modern OpenFormula export for the represented compiler slice.
    - Out of scope: unrelated refactors not required for "Use native storage grammar for ODS formulas and named expressions".
  Plan: "1. Port the original ScDocument ODF storage grammar and version selection. 2. Share native namespace extraction across scalar and matrix cells, names and style condition consumers; keep package export in the current ODF version. 3. Verify formula calculation and storage through the legacy package, clone boundary and reopened modern package, then record source mappings."
  Verify Steps: |-
    1. Verify the pinned legacy formula package where represented, plus modern namespace and unqualified legacy scalar, matrix and named definitions.
    2. Recalculate through model, Worker and ODS reopen. Run existing related compiler, ODS and formula graph tests without coverage thresholds.
    3. Run Office typecheck, lint, formatting, dependency and provenance checks plus Calc inventory.
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-11-27T11:36:57.098Z — VERIFY — ok

    By: CODER

    Note: Tests  50 passed (50). Office typecheck, lint, formatting, dependency, provenance and registry checks passed.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-11-27T10:45:06.598Z, excerpt_hash=sha256:bd45975837ab2f95856068982f7719c3ecd24b895a9e8e4ba038ff561c533eb8

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202611271044-592H9C/blueprint/resolved-snapshot.json
    - old_digest: 77a34d0370044e57b6630b24e7704753c86175b5b6660b1a412680cd642c07c7
    - current_digest: 77a34d0370044e57b6630b24e7704753c86175b5b6660b1a412680cd642c07c7
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202611271044-592H9C

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202611271044-592H9C
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

Use native storage grammar for ODS formulas and named expressions

Port Calc ODF version and formula-namespace storage grammar selection for ordinary and matrix cells, named expressions and existing style formula families, preserving import and modern OpenFormula export for the represented compiler slice.

## Scope

- In scope: Port Calc ODF version and formula-namespace storage grammar selection for ordinary and matrix cells, named expressions and existing style formula families, preserving import and modern OpenFormula export for the represented compiler slice.
- Out of scope: unrelated refactors not required for "Use native storage grammar for ODS formulas and named expressions".

## Plan

1. Port the original ScDocument ODF storage grammar and version selection. 2. Share native namespace extraction across scalar and matrix cells, names and style condition consumers; keep package export in the current ODF version. 3. Verify formula calculation and storage through the legacy package, clone boundary and reopened modern package, then record source mappings.

## Verify Steps

1. Verify the pinned legacy formula package where represented, plus modern namespace and unqualified legacy scalar, matrix and named definitions.
2. Recalculate through model, Worker and ODS reopen. Run existing related compiler, ODS and formula graph tests without coverage thresholds.
3. Run Office typecheck, lint, formatting, dependency and provenance checks plus Calc inventory.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-11-27T11:36:57.098Z — VERIFY — ok

By: CODER

Note: Tests  50 passed (50). Office typecheck, lint, formatting, dependency, provenance and registry checks passed.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-11-27T10:45:06.598Z, excerpt_hash=sha256:bd45975837ab2f95856068982f7719c3ecd24b895a9e8e4ba038ff561c533eb8

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202611271044-592H9C/blueprint/resolved-snapshot.json
- old_digest: 77a34d0370044e57b6630b24e7704753c86175b5b6660b1a412680cd642c07c7
- current_digest: 77a34d0370044e57b6630b24e7704753c86175b5b6660b1a412680cd642c07c7
- route_changed: no
- safe_command: agentplane blueprint snapshot 202611271044-592H9C

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202611271044-592H9C
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
