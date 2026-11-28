---
id: "202611281035-E2Q2ZZ"
title: "Align Calc ODS formula search mode with native criteria evaluation"
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
  updated_at: "2026-11-28T10:35:48.551Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-11-28T10:42:45.422Z"
  updated_by: "CODER"
  note: "10 focused Calc checks including ODS recalculation after Worker and save/reopen, plus TypeScript, lint, boundaries, provenance, Calc inventory and diff checks passed."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-11-28T10:42:45.901Z"
  updated_by: "EVALUATOR"
  note: "Native search mode now reaches the existing Calc criteria paths from ODS load."
  evaluated_sha: "8301ef83ba1153ef61b2392776583d4f0da4f157"
  blueprint_digest: "38f33d4949a7a717b7b8595630b1754abcd66ef7200112880bf9782ef971149e"
  evidence_refs:
    - ".agentplane/tasks/202611281035-E2Q2ZZ/README.md"
    - ".agentplane/tasks/202611281035-E2Q2ZZ/quality/20261128-104245901-recovery-context/quality-report.json"
    - ".agentplane/tasks/202611281035-E2Q2ZZ/quality/20261128-104245901-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202611281035-E2Q2ZZ/quality/20261128-104245901-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202611281035-E2Q2ZZ/blueprint/resolved-snapshot.json"
    - "output/playwright/odf-next-checkpoint/calc-odf-regexp-verification.md"
  findings:
    - "Matrix HLOOKUP and VLOOKUP remain literal as in upstream; browser regex engine uses the existing platform binding."
commit: null
comments:
  -
    author: "CODER"
    body: "Start: apply the original ODS search-mode setting to represented formula criteria."
events:
  -
    type: "status"
    at: "2026-11-28T10:35:48.911Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: apply the original ODS search-mode setting to represented formula criteria."
  -
    type: "verify"
    at: "2026-11-28T10:42:45.422Z"
    author: "CODER"
    state: "ok"
    note: "10 focused Calc checks including ODS recalculation after Worker and save/reopen, plus TypeScript, lint, boundaries, provenance, Calc inventory and diff checks passed."
doc_version: 3
doc_updated_at: "2026-11-28T10:42:45.475Z"
doc_updated_by: "CODER"
description: "Connect ODS regular-expression, wildcard and literal calculation defaults with native query-entry text search, worksheet and matrix lookup, and represented conditional and database formulas. Use the established browser regex service at workbook and Worker boundaries, keep original ODF settings and name ownership, and verify affected cases with pinned criteria assertions and ODS reopening."
sections:
  Summary: |-
    Align Calc ODS formula search mode with native criteria evaluation

    Connect ODS regular-expression, wildcard and literal calculation defaults with native query-entry text search, worksheet and matrix lookup, and represented conditional and database formulas. Use the established browser regex service at workbook and Worker boundaries, keep original ODF settings and name ownership, and verify affected cases with pinned criteria assertions and ODS reopening.
  Scope: |-
    - In scope: Connect ODS regular-expression, wildcard and literal calculation defaults with native query-entry text search, worksheet and matrix lookup, and represented conditional and database formulas. Use the established browser regex service at workbook and Worker boundaries, keep original ODF settings and name ownership, and verify affected cases with pinned criteria assertions and ODS reopening.
    - Out of scope: unrelated refactors not required for "Align Calc ODS formula search mode with native criteria evaluation".
  Plan: "Port native ScQueryEntry search construction, exact criteria and ordered-match policies through the existing text search and query evaluator owners. Bind the platform regex factory to Calc documents on initial browser creation, ODS import and Worker restoration. Reuse original settings and preserve the distinct literal, wildcard and regexp defaults. Verify ODF package, Worker and affected lookup, conditional and database formulas against applicable pinned assertions."
  Verify Steps: |-
    PLANNER fallback scaffold for "Align Calc ODS formula search mode with native criteria evaluation". Replace with task-specific acceptance checks when PLANNER context is available.

    1. Review the requested outcome for "Align Calc ODS formula search mode with native criteria evaluation". Expected: the visible result matches ## Summary and stays inside approved scope.
    2. Run the most relevant validation step for this task. Expected: it succeeds without unexpected regressions in touched behavior.
    3. Compare the final result against ## Scope and record any residual follow-up in ## Findings. Expected: open edges are explicit rather than implicit.
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-11-28T10:42:45.422Z — VERIFY — ok

    By: CODER

    Note: 10 focused Calc checks including ODS recalculation after Worker and save/reopen, plus TypeScript, lint, boundaries, provenance, Calc inventory and diff checks passed.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-11-28T10:35:48.911Z, excerpt_hash=sha256:9abd0511baab4dfe19972762cbbef462b2f3eb099123112e4c7be8ceffd8e65f

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202611281035-E2Q2ZZ/blueprint/resolved-snapshot.json
    - old_digest: 38f33d4949a7a717b7b8595630b1754abcd66ef7200112880bf9782ef971149e
    - current_digest: 38f33d4949a7a717b7b8595630b1754abcd66ef7200112880bf9782ef971149e
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202611281035-E2Q2ZZ

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202611281035-E2Q2ZZ
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

Align Calc ODS formula search mode with native criteria evaluation

Connect ODS regular-expression, wildcard and literal calculation defaults with native query-entry text search, worksheet and matrix lookup, and represented conditional and database formulas. Use the established browser regex service at workbook and Worker boundaries, keep original ODF settings and name ownership, and verify affected cases with pinned criteria assertions and ODS reopening.

## Scope

- In scope: Connect ODS regular-expression, wildcard and literal calculation defaults with native query-entry text search, worksheet and matrix lookup, and represented conditional and database formulas. Use the established browser regex service at workbook and Worker boundaries, keep original ODF settings and name ownership, and verify affected cases with pinned criteria assertions and ODS reopening.
- Out of scope: unrelated refactors not required for "Align Calc ODS formula search mode with native criteria evaluation".

## Plan

Port native ScQueryEntry search construction, exact criteria and ordered-match policies through the existing text search and query evaluator owners. Bind the platform regex factory to Calc documents on initial browser creation, ODS import and Worker restoration. Reuse original settings and preserve the distinct literal, wildcard and regexp defaults. Verify ODF package, Worker and affected lookup, conditional and database formulas against applicable pinned assertions.

## Verify Steps

PLANNER fallback scaffold for "Align Calc ODS formula search mode with native criteria evaluation". Replace with task-specific acceptance checks when PLANNER context is available.

1. Review the requested outcome for "Align Calc ODS formula search mode with native criteria evaluation". Expected: the visible result matches ## Summary and stays inside approved scope.
2. Run the most relevant validation step for this task. Expected: it succeeds without unexpected regressions in touched behavior.
3. Compare the final result against ## Scope and record any residual follow-up in ## Findings. Expected: open edges are explicit rather than implicit.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-11-28T10:42:45.422Z — VERIFY — ok

By: CODER

Note: 10 focused Calc checks including ODS recalculation after Worker and save/reopen, plus TypeScript, lint, boundaries, provenance, Calc inventory and diff checks passed.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-11-28T10:35:48.911Z, excerpt_hash=sha256:9abd0511baab4dfe19972762cbbef462b2f3eb099123112e4c7be8ceffd8e65f

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202611281035-E2Q2ZZ/blueprint/resolved-snapshot.json
- old_digest: 38f33d4949a7a717b7b8595630b1754abcd66ef7200112880bf9782ef971149e
- current_digest: 38f33d4949a7a717b7b8595630b1754abcd66ef7200112880bf9782ef971149e
- route_changed: no
- safe_command: agentplane blueprint snapshot 202611281035-E2Q2ZZ

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202611281035-E2Q2ZZ
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
