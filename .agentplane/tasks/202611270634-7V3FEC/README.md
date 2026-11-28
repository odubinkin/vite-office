---
id: "202611270634-7V3FEC"
title: "Complete Calc user-defined number format administration"
result_summary: "Connected native user-defined format catalog controls and ODS comments, with 59 focused cases passing."
status: "DONE"
priority: "med"
owner: "CODER"
revision: 9
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-11-27T06:35:07.447Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-11-27T07:06:54.895Z"
  updated_by: "CODER"
  note: "All 59 targeted tests passed across the full selection and exact rerun. Office TypeScript, changed-file lint and formatting, source-tree, dependencies, scoped provenance and routing passed. Existing integrated registry marker failures are recorded."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-11-27T07:06:59.144Z"
  updated_by: "EVALUATOR"
  note: "Native number-format catalog controls and ODS comment recovery verified"
  evaluated_sha: "f6f82c8c1a2fec4afaebc5d310d7fdfadafe6b7c"
  blueprint_digest: "c7ef374a4fca65dcadca970cb388c4e7c7a5422d44bc56de358b1a97c5169a46"
  evidence_refs:
    - ".agentplane/tasks/202611270634-7V3FEC/README.md"
    - ".agentplane/tasks/202611270634-7V3FEC/quality/20261127-070659144-recovery-context/quality-report.json"
    - ".agentplane/tasks/202611270634-7V3FEC/quality/20261127-070659144-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202611270634-7V3FEC/quality/20261127-070659144-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202611270634-7V3FEC/blueprint/resolved-snapshot.json"
    - "output/calc-next/7V3FEC-tests-exact.log"
  findings:
    - "The catalog lifecycle, typed output, rollback and comment round trip pass focused Calc and shared tests."
commit:
  hash: "f6f82c8c1a2fec4afaebc5d310d7fdfadafe6b7c"
  message: "🧩 7V3FEC code: manage user number formats and persist their ODS comments"
comments:
  -
    author: "CODER"
    body: "Start: Connect the original user-format actions and typed formatter update in Calc Format Cells."
  -
    author: "CODER"
    body: "Verified: The Calc user number-format catalog uses source add, remove and comment actions. Comment metadata round-trips through the original ODS number title."
events:
  -
    type: "status"
    at: "2026-11-27T06:35:08.181Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: Connect the original user-format actions and typed formatter update in Calc Format Cells."
  -
    type: "verify"
    at: "2026-11-27T07:06:54.895Z"
    author: "CODER"
    state: "ok"
    note: "All 59 targeted tests passed across the full selection and exact rerun. Office TypeScript, changed-file lint and formatting, source-tree, dependencies, scoped provenance and routing passed. Existing integrated registry marker failures are recorded."
  -
    type: "status"
    at: "2026-11-27T07:09:23.268Z"
    author: "CODER"
    from: "DOING"
    to: "DONE"
    note: "Verified: The Calc user number-format catalog uses source add, remove and comment actions. Comment metadata round-trips through the original ODS number title."
doc_version: 3
doc_updated_at: "2026-11-27T07:09:23.269Z"
doc_updated_by: "CODER"
description: "Connect the pinned Add, Edit Comment and Remove controls, shared number-format shell lifecycle and original Calc formatter update exchange. Preserve native cancellation, accepted actions and inherited styles."
sections:
  Summary: "Connect the complete user-format control group in Calc Format Cells to the pinned shared formatter and its typed update payload."
  Scope: "Implement the consumed SvNumberFormatter DeleteEntry, the SvxNumberFormatShell add/remove/comment lifecycle, the SvxNumberInfoItem output carrier, the browser Format Code action group, and Calc application of deleted keys before cell attributes. Keep the existing isolated unsubmitted preview, accepted picture validation and primary storage and recovery behavior. Document suspected pinned lifecycle anomalies with exact retention."
  Plan: "Port the source number-format catalog lifecycle, original three controls, typed deletion update and focused verification."
  Verify Steps: |-
    - Run targeted Calc Format Cells and Number Format tests plus the shared number-format shell and formatter suites. Cover explicit Add and Remove, built-in controls, comments, Cancel, accepted group, and invalid code.
    - Run Office typecheck, changed-source ESLint and Prettier, dependencies, source tree, provenance and registry. Preserve existing integrated gate diagnostics where they apply.
  Verification: |-
    Pending execution.

    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-11-27T07:06:54.895Z — VERIFY — ok

    By: CODER

    Note: All 59 targeted tests passed across the full selection and exact rerun. Office TypeScript, changed-file lint and formatting, source-tree, dependencies, scoped provenance and routing passed. Existing integrated registry marker failures are recorded.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-11-27T07:05:04.620Z, excerpt_hash=sha256:0b29e51c7c0ac50ce194e05d89e36c634084730a285432c2ea2197938ffcc11e

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202611270634-7V3FEC/blueprint/resolved-snapshot.json
    - old_digest: c7ef374a4fca65dcadca970cb388c4e7c7a5422d44bc56de358b1a97c5169a46
    - current_digest: c7ef374a4fca65dcadca970cb388c4e7c7a5422d44bc56de358b1a97c5169a46
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202611270634-7V3FEC

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202611270634-7V3FEC
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: false
    - repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert the scoped UI, item and formatter changes."
  Findings: |-
    The native Format Code group now uses the actual shared add, remove and selected comment paths. The original typed SvxNumberInfoItem carries the removal keys. XML number:title stores and restores the accepted comment when the assigned number style is exported and reopened. CALC-850 records the pinned two-list cancellation asymmetries and the focused shell tests retain them.

    Command: Office Vitest Calc Format Cells, Number Format and ODS suites plus the shared number-format shell, formatter-entry and picture suites. Result: 59 selected cases passed across the original run and the exact rerun. The first run found an incorrect assumption about an accepted quoted code and a cancellation assertion that ran before asynchronous cleanup. Both corrected cases passed on the exact rerun, along with the successful ODS comment reopen case.

    Commands: changed-source ESLint and Prettier, module boundaries, source tree, scoped provenance, AgentPlane routing and doctor. Result: pass. Global provenance and Calc/shared registry still stop on their already missing integrated Writer/shared ODF markers. No catalog or dialog change caused those inherited failures.
id_source: "generated"
---
## Summary

Connect the complete user-format control group in Calc Format Cells to the pinned shared formatter and its typed update payload.

## Scope

Implement the consumed SvNumberFormatter DeleteEntry, the SvxNumberFormatShell add/remove/comment lifecycle, the SvxNumberInfoItem output carrier, the browser Format Code action group, and Calc application of deleted keys before cell attributes. Keep the existing isolated unsubmitted preview, accepted picture validation and primary storage and recovery behavior. Document suspected pinned lifecycle anomalies with exact retention.

## Plan

Port the source number-format catalog lifecycle, original three controls, typed deletion update and focused verification.

## Verify Steps

- Run targeted Calc Format Cells and Number Format tests plus the shared number-format shell and formatter suites. Cover explicit Add and Remove, built-in controls, comments, Cancel, accepted group, and invalid code.
- Run Office typecheck, changed-source ESLint and Prettier, dependencies, source tree, provenance and registry. Preserve existing integrated gate diagnostics where they apply.

## Verification

Pending execution.

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-11-27T07:06:54.895Z — VERIFY — ok

By: CODER

Note: All 59 targeted tests passed across the full selection and exact rerun. Office TypeScript, changed-file lint and formatting, source-tree, dependencies, scoped provenance and routing passed. Existing integrated registry marker failures are recorded.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-11-27T07:05:04.620Z, excerpt_hash=sha256:0b29e51c7c0ac50ce194e05d89e36c634084730a285432c2ea2197938ffcc11e

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202611270634-7V3FEC/blueprint/resolved-snapshot.json
- old_digest: c7ef374a4fca65dcadca970cb388c4e7c7a5422d44bc56de358b1a97c5169a46
- current_digest: c7ef374a4fca65dcadca970cb388c4e7c7a5422d44bc56de358b1a97c5169a46
- route_changed: no
- safe_command: agentplane blueprint snapshot 202611270634-7V3FEC

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202611270634-7V3FEC
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: false
- repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert the scoped UI, item and formatter changes.

## Findings

The native Format Code group now uses the actual shared add, remove and selected comment paths. The original typed SvxNumberInfoItem carries the removal keys. XML number:title stores and restores the accepted comment when the assigned number style is exported and reopened. CALC-850 records the pinned two-list cancellation asymmetries and the focused shell tests retain them.

Command: Office Vitest Calc Format Cells, Number Format and ODS suites plus the shared number-format shell, formatter-entry and picture suites. Result: 59 selected cases passed across the original run and the exact rerun. The first run found an incorrect assumption about an accepted quoted code and a cancellation assertion that ran before asynchronous cleanup. Both corrected cases passed on the exact rerun, along with the successful ODS comment reopen case.

Commands: changed-source ESLint and Prettier, module boundaries, source tree, scoped provenance, AgentPlane routing and doctor. Result: pass. Global provenance and Calc/shared registry still stop on their already missing integrated Writer/shared ODF markers. No catalog or dialog change caused those inherited failures.
