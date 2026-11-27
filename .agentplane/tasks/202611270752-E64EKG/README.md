---
id: "202611270752-E64EKG"
title: "Preserve Calc ODS database-range formulas and counting semantics"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 7
origin:
  system: "manual"
depends_on: []
tags:
  - "calc"
  - "code"
  - "ods"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-11-27T08:04:04.750Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-11-27T08:41:20.848Z"
  updated_by: "CODER"
  note: "48 focused cases pass, including unmodified database.ods recalculation, Worker and ODS reopen. Static checks pass. See output/playwright/E64EKG/verification.md."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-11-27T08:41:21.679Z"
  updated_by: "EVALUATOR"
  note: "Native database index binding, ODS formula spelling and worksheet database counts pass focused verification."
  evaluated_sha: "57a41891e40985c4e037bbe7d1e0a72e89851f66"
  blueprint_digest: "82906950363058ce9df4ae8ea9d99b23012530025a510c5645a5f809dbb87f0a"
  evidence_refs:
    - ".agentplane/tasks/202611270752-E64EKG/README.md"
    - ".agentplane/tasks/202611270752-E64EKG/quality/20261127-084121679-recovery-context/quality-report.json"
    - ".agentplane/tasks/202611270752-E64EKG/quality/20261127-084121679-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202611270752-E64EKG/quality/20261127-084121679-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202611270752-E64EKG/blueprint/resolved-snapshot.json"
    - "output/playwright/E64EKG/verification.md"
    - "57a41891e40985c4e037bbe7d1e0a72e89851f66"
  findings:
    - "The complete native fixture retains formula references and all four original results. Implementation: 57a41891e40985c4e037bbe7d1e0a72e89851f66."
commit: null
comments:
  -
    author: "CODER"
    body: "Start: Port worksheet database-range formula binding and counting."
events:
  -
    type: "status"
    at: "2026-11-27T08:04:05.367Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: Port worksheet database-range formula binding and counting."
  -
    type: "verify"
    at: "2026-11-27T08:41:20.848Z"
    author: "CODER"
    state: "ok"
    note: "48 focused cases pass, including unmodified database.ods recalculation, Worker and ODS reopen. Static checks pass. See output/playwright/E64EKG/verification.md."
doc_version: 3
doc_updated_at: "2026-11-27T08:41:20.922Z"
doc_updated_by: "CODER"
description: "Port native named database range token binding, worksheet data/criteria range handling, DCOUNT and DCOUNTA through Calc formula compilation and evaluation. Restore the full pinned database.ods assertions, verify Worker and ODS reopen, and then run the full ten-task checkpoint."
sections:
  Summary: |-
    Preserve Calc ODS database-range formulas and counting semantics

    Port native named database range token binding, worksheet data/criteria range handling, DCOUNT and DCOUNTA through Calc formula compilation and evaluation. Restore the full pinned database.ods assertions, verify Worker and ODS reopen, and then run the full ten-task checkpoint.
  Scope: |-
    - In scope: Port native named database range token binding, worksheet data/criteria range handling, DCOUNT and DCOUNTA through Calc formula compilation and evaluation. Restore the full pinned database.ods assertions, verify Worker and ODS reopen, and then run the full ten-task checkpoint.
    - Out of scope: unrelated refactors not required for "Preserve Calc ODS database-range formulas and counting semantics".
  Plan: "Port native database range lexical binding, index tokens and reference expansion. Port worksheet database criteria and DCOUNT/DCOUNTA stack, field and iterator semantics. Restore full pinned database.ods input and assertions, then verify ODS and Worker reload. Run the scheduled full checkpoint after the tenth closure."
  Verify Steps: "Run focused Calc database fixture and relevant compiler/reference/query/Worker tests. Check typecheck, lint, formatting, provenance, dependencies, Calc/shared invariants and routing."
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-11-27T08:41:20.848Z — VERIFY — ok

    By: CODER

    Note: 48 focused cases pass, including unmodified database.ods recalculation, Worker and ODS reopen. Static checks pass. See output/playwright/E64EKG/verification.md.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-11-27T08:04:05.367Z, excerpt_hash=sha256:945a546ffbe14713937a648bf9b5a95452775304f5e710b2cb9f8bbcedc3f4dd

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202611270752-E64EKG/blueprint/resolved-snapshot.json
    - old_digest: 82906950363058ce9df4ae8ea9d99b23012530025a510c5645a5f809dbb87f0a
    - current_digest: 82906950363058ce9df4ae8ea9d99b23012530025a510c5645a5f809dbb87f0a
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202611270752-E64EKG

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202611270752-E64EKG
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

Preserve Calc ODS database-range formulas and counting semantics

Port native named database range token binding, worksheet data/criteria range handling, DCOUNT and DCOUNTA through Calc formula compilation and evaluation. Restore the full pinned database.ods assertions, verify Worker and ODS reopen, and then run the full ten-task checkpoint.

## Scope

- In scope: Port native named database range token binding, worksheet data/criteria range handling, DCOUNT and DCOUNTA through Calc formula compilation and evaluation. Restore the full pinned database.ods assertions, verify Worker and ODS reopen, and then run the full ten-task checkpoint.
- Out of scope: unrelated refactors not required for "Preserve Calc ODS database-range formulas and counting semantics".

## Plan

Port native database range lexical binding, index tokens and reference expansion. Port worksheet database criteria and DCOUNT/DCOUNTA stack, field and iterator semantics. Restore full pinned database.ods input and assertions, then verify ODS and Worker reload. Run the scheduled full checkpoint after the tenth closure.

## Verify Steps

Run focused Calc database fixture and relevant compiler/reference/query/Worker tests. Check typecheck, lint, formatting, provenance, dependencies, Calc/shared invariants and routing.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-11-27T08:41:20.848Z — VERIFY — ok

By: CODER

Note: 48 focused cases pass, including unmodified database.ods recalculation, Worker and ODS reopen. Static checks pass. See output/playwright/E64EKG/verification.md.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-11-27T08:04:05.367Z, excerpt_hash=sha256:945a546ffbe14713937a648bf9b5a95452775304f5e710b2cb9f8bbcedc3f4dd

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202611270752-E64EKG/blueprint/resolved-snapshot.json
- old_digest: 82906950363058ce9df4ae8ea9d99b23012530025a510c5645a5f809dbb87f0a
- current_digest: 82906950363058ce9df4ae8ea9d99b23012530025a510c5645a5f809dbb87f0a
- route_changed: no
- safe_command: agentplane blueprint snapshot 202611270752-E64EKG

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202611270752-E64EKG
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
