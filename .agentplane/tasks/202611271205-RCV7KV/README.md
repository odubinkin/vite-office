---
id: "202611271205-RCV7KV"
title: "Implement native Calc ODS database sort and subtotal persistence"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 7
origin:
  system: "manual"
depends_on: []
tags:
  - "calc"
  - "ods"
task_kind: "code"
mutation_scope: "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-11-27T12:05:59.931Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-11-27T14:34:16.998Z"
  updated_by: "CODER"
  note: "Tests  51 passed (51). Pinned fixtures, typecheck, lint, formatting, dependencies, provenance and scoped inventory checks passed."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-11-27T14:34:17.614Z"
  updated_by: "EVALUATOR"
  note: "The pinned natural-sort and subtotal ODS documents retained their inherited defaults, flags and literal descriptor fields across the Worker and ODS reopen. Nested SUBTOTAL results used the native flags and exclusions."
  evaluated_sha: "8361e2887af764744ba2b7eba01778bb796b0ce7"
  blueprint_digest: "25414a1b27c93cdf427760aadde9713a5b69855c5805a45db862351d7e218450"
  evidence_refs:
    - ".agentplane/tasks/202611271205-RCV7KV/README.md"
    - ".agentplane/tasks/202611271205-RCV7KV/quality/20261127-143417614-recovery-context/quality-report.json"
    - ".agentplane/tasks/202611271205-RCV7KV/quality/20261127-143417614-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202611271205-RCV7KV/quality/20261127-143417614-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202611271205-RCV7KV/blueprint/resolved-snapshot.json"
    - "/Users/odubinkin/Projects/vite-office/output/playwright/2C7FY1/verification.md"
    - "8361e2887af764744ba2b7eba01778bb796b0ce7"
  findings:
    - "The tested SUBTOTAL selectors use the represented sum, average and product operations. Database sort execution, subtotal layout regeneration and interactive range editing remain outside the filter change."
commit: null
comments:
  -
    author: "CODER"
    body: "Start: continue the approved descriptor persistence scope under the code blueprint."
events:
  -
    type: "status"
    at: "2026-11-27T12:06:00.817Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: continue the approved descriptor persistence scope under the code blueprint."
  -
    type: "verify"
    at: "2026-11-27T14:34:16.998Z"
    author: "CODER"
    state: "ok"
    note: "Tests  51 passed (51). Pinned fixtures, typecheck, lint, formatting, dependencies, provenance and scoped inventory checks passed."
doc_version: 3
doc_updated_at: "2026-11-27T14:34:17.072Z"
doc_updated_by: "CODER"
description: "Restore the ScDBData sort and subtotal parameter owners, ODS XML import and export, and Worker transport. Verify the persistence portions of the original tdf161948_NaturalSortSaveLoad.ods and tdf162262_summarybelow.ods fixtures, including the represented SUBTOTAL operations. This code task supersedes 202611271154-2C7FY1, which was classified as analysis."
sections:
  Summary: |-
    Implement native Calc ODS database sort and subtotal persistence

    Restore the ScDBData sort and subtotal parameter owners, ODS XML import and export, and Worker transport. Verify the persistence portions of the original tdf161948_NaturalSortSaveLoad.ods and tdf162262_summarybelow.ods fixtures, including the represented SUBTOTAL operations. This code task supersedes 202611271154-2C7FY1, which was classified as analysis.
  Scope: |-
    - In scope: Restore the ScDBData sort and subtotal parameter owners, ODS XML import and export, and Worker transport. Verify the persistence portions of the original tdf161948_NaturalSortSaveLoad.ods and tdf162262_summarybelow.ods fixtures, including the represented SUBTOTAL operations. This code task supersedes 202611271154-2C7FY1, which was classified as analysis.
    - Out of scope: unrelated refactors not required for "Implement native Calc ODS database sort and subtotal persistence".
  Plan: "1. Port ScSortParam and ScSubTotalParam ownership to ScDBData, with native defaults and original field coordinates. 2. Bind original XML sort and subtotal contexts, export, and backwards-compatible Worker fields. 3. Admit the represented aggregate modes of SUBTOTAL and its native range exclusions for the ODS fixture. 4. Verify the pinned files and related tests. Interactive sorting and unrepresented aggregate selectors remain outside this filter task."
  Verify Steps: "Check both unmodified pinned ODS fixtures. Verify native range binding, sort order, copy destination, persisted natural sort mode and omitted alpha-numeric default. Verify the summary-above descriptor, Worker transport, and original nested SUBTOTAL values after reopening. Run the existing affected database, range formula and ODS Worker tests, scoped formatting and lint, Office typecheck, dependencies, provenance and Calc inventory."
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-11-27T14:34:16.998Z — VERIFY — ok

    By: CODER

    Note: Tests  51 passed (51). Pinned fixtures, typecheck, lint, formatting, dependencies, provenance and scoped inventory checks passed.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-11-27T12:06:00.817Z, excerpt_hash=sha256:305103b85f936060887daf2b17370308201cfc04f8f03fc18e266a97af5e9226

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202611271205-RCV7KV/blueprint/resolved-snapshot.json
    - old_digest: 25414a1b27c93cdf427760aadde9713a5b69855c5805a45db862351d7e218450
    - current_digest: 25414a1b27c93cdf427760aadde9713a5b69855c5805a45db862351d7e218450
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202611271205-RCV7KV

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202611271205-RCV7KV
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

Implement native Calc ODS database sort and subtotal persistence

Restore the ScDBData sort and subtotal parameter owners, ODS XML import and export, and Worker transport. Verify the persistence portions of the original tdf161948_NaturalSortSaveLoad.ods and tdf162262_summarybelow.ods fixtures, including the represented SUBTOTAL operations. This code task supersedes 202611271154-2C7FY1, which was classified as analysis.

## Scope

- In scope: Restore the ScDBData sort and subtotal parameter owners, ODS XML import and export, and Worker transport. Verify the persistence portions of the original tdf161948_NaturalSortSaveLoad.ods and tdf162262_summarybelow.ods fixtures, including the represented SUBTOTAL operations. This code task supersedes 202611271154-2C7FY1, which was classified as analysis.
- Out of scope: unrelated refactors not required for "Implement native Calc ODS database sort and subtotal persistence".

## Plan

1. Port ScSortParam and ScSubTotalParam ownership to ScDBData, with native defaults and original field coordinates. 2. Bind original XML sort and subtotal contexts, export, and backwards-compatible Worker fields. 3. Admit the represented aggregate modes of SUBTOTAL and its native range exclusions for the ODS fixture. 4. Verify the pinned files and related tests. Interactive sorting and unrepresented aggregate selectors remain outside this filter task.

## Verify Steps

Check both unmodified pinned ODS fixtures. Verify native range binding, sort order, copy destination, persisted natural sort mode and omitted alpha-numeric default. Verify the summary-above descriptor, Worker transport, and original nested SUBTOTAL values after reopening. Run the existing affected database, range formula and ODS Worker tests, scoped formatting and lint, Office typecheck, dependencies, provenance and Calc inventory.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-11-27T14:34:16.998Z — VERIFY — ok

By: CODER

Note: Tests  51 passed (51). Pinned fixtures, typecheck, lint, formatting, dependencies, provenance and scoped inventory checks passed.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-11-27T12:06:00.817Z, excerpt_hash=sha256:305103b85f936060887daf2b17370308201cfc04f8f03fc18e266a97af5e9226

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202611271205-RCV7KV/blueprint/resolved-snapshot.json
- old_digest: 25414a1b27c93cdf427760aadde9713a5b69855c5805a45db862351d7e218450
- current_digest: 25414a1b27c93cdf427760aadde9713a5b69855c5805a45db862351d7e218450
- route_changed: no
- safe_command: agentplane blueprint snapshot 202611271205-RCV7KV

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202611271205-RCV7KV
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
