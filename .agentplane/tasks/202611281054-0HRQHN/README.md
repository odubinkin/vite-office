---
id: "202611281054-0HRQHN"
title: "Align Calc ODS text search and character-position functions with LibreOffice"
result_summary: "Aligned eight Calc text-position formulas, original parameter and error contracts, and shared TextSearch initialization."
status: "DONE"
priority: "med"
owner: "CODER"
revision: 7
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
  updated_at: "2026-11-28T10:54:16.711Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-11-28T11:00:42.763Z"
  updated_by: "CODER"
  note: "22 focused Calc/shared tests across six files, including pinned scalar FODS assertions and ODS Worker/reopen; TypeScript, lint, boundaries, provenance and inventory passed."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-11-28T11:00:43.218Z"
  updated_by: "EVALUATOR"
  note: "Native text search and position formulas recalculate through original opcodes and the ODS model."
  evaluated_sha: "5301227c3932655f9f860db68b4c345930e1ea57"
  blueprint_digest: "cb74e83708164e9b676a4003de70657f9cfcb095d017463dec19fc11c6dfa212"
  evidence_refs:
    - ".agentplane/tasks/202611281054-0HRQHN/README.md"
    - ".agentplane/tasks/202611281054-0HRQHN/quality/20261128-110043218-recovery-context/quality-report.json"
    - ".agentplane/tasks/202611281054-0HRQHN/quality/20261128-110043218-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202611281054-0HRQHN/quality/20261128-110043218-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202611281054-0HRQHN/blueprint/resolved-snapshot.json"
    - "output/playwright/odf-next-checkpoint/calc-text-position-verification.md"
  findings:
    - "Documented the original mixed UTF-16 and code-point positions. The browser search service continues to bind the represented regex dialect."
commit:
  hash: "5301227c3932655f9f860db68b4c345930e1ea57"
  message: "🧩 0HRQHN calc: evaluate ODS text position and search formulas"
comments:
  -
    author: "CODER"
    body: "Start: align native text search and character-position formula families."
  -
    author: "CODER"
    body: "Verified: pinned scalar FODS fixtures, SEARCH through Worker and ODS reopen, and mixed Unicode coordinates. All 22 focused tests and static checks passed."
events:
  -
    type: "status"
    at: "2026-11-28T10:54:17.128Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: align native text search and character-position formula families."
  -
    type: "verify"
    at: "2026-11-28T11:00:42.763Z"
    author: "CODER"
    state: "ok"
    note: "22 focused Calc/shared tests across six files, including pinned scalar FODS assertions and ODS Worker/reopen; TypeScript, lint, boundaries, provenance and inventory passed."
  -
    type: "status"
    at: "2026-11-28T11:02:01.326Z"
    author: "CODER"
    from: "DOING"
    to: "DONE"
    note: "Verified: pinned scalar FODS fixtures, SEARCH through Worker and ODS reopen, and mixed Unicode coordinates. All 22 focused tests and static checks passed."
doc_version: 3
doc_updated_at: "2026-11-28T11:02:01.326Z"
doc_updated_by: "CODER"
description: "Implement native FIND, SEARCH, LEN, EXACT, LEFT, RIGHT, MID and REPLACE across the formula compiler and interpreter. Use native TextSearch parameter conversion and imported document search mode. Replay the relevant pinned FODS function assertions and ODS round trips with focused checks."
sections:
  Summary: |-
    Align Calc ODS text search and character-position functions with LibreOffice

    Implement native FIND, SEARCH, LEN, EXACT, LEFT, RIGHT, MID and REPLACE across the formula compiler and interpreter. Use native TextSearch parameter conversion and imported document search mode. Replay the relevant pinned FODS function assertions and ODS round trips with focused checks.
  Scope: |-
    - In scope: Implement native FIND, SEARCH, LEN, EXACT, LEFT, RIGHT, MID and REPLACE across the formula compiler and interpreter. Use native TextSearch parameter conversion and imported document search mode. Replay the relevant pinned FODS function assertions and ODS round trips with focused checks.
    - Out of scope: unrelated refactors not required for "Align Calc ODS text search and character-position functions with LibreOffice".
  Plan: "Port the eight current scalar UTF-16/code-point text functions from the pinned interpreter with native opcodes, argument conversion, bounds, defaults, result formats and error contracts. Bind SEARCH through the native shared TextSearch locale/search parameter conversion and use the imported ODS search setting. Reuse the existing realm regex service and native OUString traversal. Replay applicable Calc function fixture assertions, including ODS Worker and reopen where relevant, and run focused checks."
  Verify Steps: |-
    PLANNER fallback scaffold for "Align Calc ODS text search and character-position functions with LibreOffice". Replace with task-specific acceptance checks when PLANNER context is available.

    1. Review the requested outcome for "Align Calc ODS text search and character-position functions with LibreOffice". Expected: the visible result matches ## Summary and stays inside approved scope.
    2. Run the most relevant validation step for this task. Expected: it succeeds without unexpected regressions in touched behavior.
    3. Compare the final result against ## Scope and record any residual follow-up in ## Findings. Expected: open edges are explicit rather than implicit.
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-11-28T11:00:42.763Z — VERIFY — ok

    By: CODER

    Note: 22 focused Calc/shared tests across six files, including pinned scalar FODS assertions and ODS Worker/reopen; TypeScript, lint, boundaries, provenance and inventory passed.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-11-28T10:54:17.128Z, excerpt_hash=sha256:03f8f7243a97ec727c12741e029b20a28ce9190812d21db02d02f5ede1d5dd38

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202611281054-0HRQHN/blueprint/resolved-snapshot.json
    - old_digest: cb74e83708164e9b676a4003de70657f9cfcb095d017463dec19fc11c6dfa212
    - current_digest: cb74e83708164e9b676a4003de70657f9cfcb095d017463dec19fc11c6dfa212
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202611281054-0HRQHN

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202611281054-0HRQHN
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

Align Calc ODS text search and character-position functions with LibreOffice

Implement native FIND, SEARCH, LEN, EXACT, LEFT, RIGHT, MID and REPLACE across the formula compiler and interpreter. Use native TextSearch parameter conversion and imported document search mode. Replay the relevant pinned FODS function assertions and ODS round trips with focused checks.

## Scope

- In scope: Implement native FIND, SEARCH, LEN, EXACT, LEFT, RIGHT, MID and REPLACE across the formula compiler and interpreter. Use native TextSearch parameter conversion and imported document search mode. Replay the relevant pinned FODS function assertions and ODS round trips with focused checks.
- Out of scope: unrelated refactors not required for "Align Calc ODS text search and character-position functions with LibreOffice".

## Plan

Port the eight current scalar UTF-16/code-point text functions from the pinned interpreter with native opcodes, argument conversion, bounds, defaults, result formats and error contracts. Bind SEARCH through the native shared TextSearch locale/search parameter conversion and use the imported ODS search setting. Reuse the existing realm regex service and native OUString traversal. Replay applicable Calc function fixture assertions, including ODS Worker and reopen where relevant, and run focused checks.

## Verify Steps

PLANNER fallback scaffold for "Align Calc ODS text search and character-position functions with LibreOffice". Replace with task-specific acceptance checks when PLANNER context is available.

1. Review the requested outcome for "Align Calc ODS text search and character-position functions with LibreOffice". Expected: the visible result matches ## Summary and stays inside approved scope.
2. Run the most relevant validation step for this task. Expected: it succeeds without unexpected regressions in touched behavior.
3. Compare the final result against ## Scope and record any residual follow-up in ## Findings. Expected: open edges are explicit rather than implicit.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-11-28T11:00:42.763Z — VERIFY — ok

By: CODER

Note: 22 focused Calc/shared tests across six files, including pinned scalar FODS assertions and ODS Worker/reopen; TypeScript, lint, boundaries, provenance and inventory passed.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-11-28T10:54:17.128Z, excerpt_hash=sha256:03f8f7243a97ec727c12741e029b20a28ce9190812d21db02d02f5ede1d5dd38

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202611281054-0HRQHN/blueprint/resolved-snapshot.json
- old_digest: cb74e83708164e9b676a4003de70657f9cfcb095d017463dec19fc11c6dfa212
- current_digest: cb74e83708164e9b676a4003de70657f9cfcb095d017463dec19fc11c6dfa212
- route_changed: no
- safe_command: agentplane blueprint snapshot 202611281054-0HRQHN

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202611281054-0HRQHN
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
