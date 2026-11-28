---
id: "202611280746-Q216GP"
title: "Port ODS numeric format placeholders and scientific text"
result_summary: "Ported ODF native width blanks, digit placeholders and scientific text against original Calc regressions."
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
  updated_at: "2026-11-28T07:46:13.456Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-11-28T07:54:17.984Z"
  updated_by: "CODER"
  note: "41 related Calc cases and 8 Writer cases passed, including six original LibreOffice ODF number-style save/reload regressions. Typecheck, lint, formatting, dependencies, provenance and zero Calc parity violations passed."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-11-28T07:54:19.148Z"
  updated_by: "EVALUATOR"
  note: "Native numeric placeholder and exponent XML round trips verified in ODS and Writer consumers."
  evaluated_sha: "ea1764883a406604c0e1fc5fbf0914da4d461ee5"
  blueprint_digest: "d3ee5bb27abdc6a332d6bf6fc5a24553b97bf7aa376a1daacca7933f30f58d6b"
  evidence_refs:
    - ".agentplane/tasks/202611280746-Q216GP/README.md"
    - ".agentplane/tasks/202611280746-Q216GP/quality/20261128-075419148-recovery-context/quality-report.json"
    - ".agentplane/tasks/202611280746-Q216GP/quality/20261128-075419148-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202611280746-Q216GP/quality/20261128-075419148-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202611280746-Q216GP/blueprint/resolved-snapshot.json"
    - "output/playwright/odf-next-checkpoint/calc-number-format-verification.md"
  findings:
    - "All original format strings and the mandatory exponent zero normalization survived ODS"
commit:
  hash: "ea1764883a406604c0e1fc5fbf0914da4d461ee5"
  message: "🧩 Q216GP calc: roundtrip ODF numeric placeholders and exponent text"
comments:
  -
    author: "CODER"
    body: "Start: align shared ODF number format XML and formatter round trips against the original Calc regressions."
  -
    author: "CODER"
    body: "Verified: 41 Calc and 8 Writer related cases, TypeScript, lint, provenance and Calc runtime parity."
events:
  -
    type: "status"
    at: "2026-11-28T07:46:14.389Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: align shared ODF number format XML and formatter round trips against the original Calc regressions."
  -
    type: "verify"
    at: "2026-11-28T07:54:17.984Z"
    author: "CODER"
    state: "ok"
    note: "41 related Calc cases and 8 Writer cases passed, including six original LibreOffice ODF number-style save/reload regressions. Typecheck, lint, formatting, dependencies, provenance and zero Calc parity violations passed."
  -
    type: "status"
    at: "2026-11-28T07:56:30.716Z"
    author: "CODER"
    from: "DOING"
    to: "DONE"
    note: "Verified: 41 Calc and 8 Writer related cases, TypeScript, lint, provenance and Calc runtime parity."
doc_version: 3
doc_updated_at: "2026-11-28T07:56:30.717Z"
doc_updated_by: "CODER"
description: "Align the shared native ODF number-style import and export with pinned LibreOffice for fixed-width blanks, integer and exponent placeholders, lowercase exponent, and positioned literal text. Replay original Calc data-style package fixtures and verify Writer consumers."
sections:
  Summary: |-
    Port ODS numeric format placeholders and scientific text

    Align the shared native ODF number-style import and export with pinned LibreOffice for fixed-width blanks, integer and exponent placeholders, lowercase exponent, and positioned literal text. Replay original Calc data-style package fixtures and verify Writer consumers.
  Scope: |-
    - In scope: Align the shared native ODF number-style import and export with pinned LibreOffice for fixed-width blanks, integer and exponent placeholders, lowercase exponent, and positioned literal text. Replay original Calc data-style package fixtures and verify Writer consumers.
    - Out of scope: unrelated refactors not required for "Port ODS numeric format placeholders and scientific text".
  Plan: "Read the pinned native XML number importer, exporter and formatter scanner. Port the fixed-width padding metadata on text and embedded text, native integer/decimal/exponent placeholder semantics, exponent case and sign, and native positioned text across mantissa and exponent. Keep existing ODF stream version and formatter ownership. Replay the relevant pinned Calc ODS save/reload fixtures and verify related Calc and Writer number-style consumers plus static and parity checks."
  Verify Steps: |-
    PLANNER fallback scaffold for "Port ODS numeric format placeholders and scientific text". Replace with task-specific acceptance checks when PLANNER context is available.

    1. Review the requested outcome for "Port ODS numeric format placeholders and scientific text". Expected: the visible result matches ## Summary and stays inside approved scope.
    2. Run the most relevant validation step for this task. Expected: it succeeds without unexpected regressions in touched behavior.
    3. Compare the final result against ## Scope and record any residual follow-up in ## Findings. Expected: open edges are explicit rather than implicit.
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-11-28T07:54:17.984Z — VERIFY — ok

    By: CODER

    Note: 41 related Calc cases and 8 Writer cases passed, including six original LibreOffice ODF number-style save/reload regressions. Typecheck, lint, formatting, dependencies, provenance and zero Calc parity violations passed.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-11-28T07:46:14.389Z, excerpt_hash=sha256:eac60cfc878683866cbbbc0609d422a7da66b63729f99f502d2c3731a8536acb

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202611280746-Q216GP/blueprint/resolved-snapshot.json
    - old_digest: d3ee5bb27abdc6a332d6bf6fc5a24553b97bf7aa376a1daacca7933f30f58d6b
    - current_digest: d3ee5bb27abdc6a332d6bf6fc5a24553b97bf7aa376a1daacca7933f30f58d6b
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202611280746-Q216GP

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202611280746-Q216GP
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

Port ODS numeric format placeholders and scientific text

Align the shared native ODF number-style import and export with pinned LibreOffice for fixed-width blanks, integer and exponent placeholders, lowercase exponent, and positioned literal text. Replay original Calc data-style package fixtures and verify Writer consumers.

## Scope

- In scope: Align the shared native ODF number-style import and export with pinned LibreOffice for fixed-width blanks, integer and exponent placeholders, lowercase exponent, and positioned literal text. Replay original Calc data-style package fixtures and verify Writer consumers.
- Out of scope: unrelated refactors not required for "Port ODS numeric format placeholders and scientific text".

## Plan

Read the pinned native XML number importer, exporter and formatter scanner. Port the fixed-width padding metadata on text and embedded text, native integer/decimal/exponent placeholder semantics, exponent case and sign, and native positioned text across mantissa and exponent. Keep existing ODF stream version and formatter ownership. Replay the relevant pinned Calc ODS save/reload fixtures and verify related Calc and Writer number-style consumers plus static and parity checks.

## Verify Steps

PLANNER fallback scaffold for "Port ODS numeric format placeholders and scientific text". Replace with task-specific acceptance checks when PLANNER context is available.

1. Review the requested outcome for "Port ODS numeric format placeholders and scientific text". Expected: the visible result matches ## Summary and stays inside approved scope.
2. Run the most relevant validation step for this task. Expected: it succeeds without unexpected regressions in touched behavior.
3. Compare the final result against ## Scope and record any residual follow-up in ## Findings. Expected: open edges are explicit rather than implicit.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-11-28T07:54:17.984Z — VERIFY — ok

By: CODER

Note: 41 related Calc cases and 8 Writer cases passed, including six original LibreOffice ODF number-style save/reload regressions. Typecheck, lint, formatting, dependencies, provenance and zero Calc parity violations passed.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-11-28T07:46:14.389Z, excerpt_hash=sha256:eac60cfc878683866cbbbc0609d422a7da66b63729f99f502d2c3731a8536acb

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202611280746-Q216GP/blueprint/resolved-snapshot.json
- old_digest: d3ee5bb27abdc6a332d6bf6fc5a24553b97bf7aa376a1daacca7933f30f58d6b
- current_digest: d3ee5bb27abdc6a332d6bf6fc5a24553b97bf7aa376a1daacca7933f30f58d6b
- route_changed: no
- safe_command: agentplane blueprint snapshot 202611280746-Q216GP

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202611280746-Q216GP
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
