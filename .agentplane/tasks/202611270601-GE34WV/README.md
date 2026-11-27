---
id: "202611270601-GE34WV"
title: "Connect Calc Asian Typography to native slots and ODS styles"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 7
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-11-27T06:01:35.802Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-11-27T06:04:47.590Z"
  updated_by: "CODER"
  note: "43 targeted tests pass with the local pinned asset path admitted. Typecheck, lint, format, dependency and source-tree checks pass. Scoped provenance passes. Existing integrated registry failures are recorded in Findings."
  attempts: 0
commit: null
comments:
  -
    author: "CODER"
    body: "Start: Implement source-backed Asian Typography controls and Calc ODF paragraph formatting."
events:
  -
    type: "status"
    at: "2026-11-27T06:01:36.470Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: Implement source-backed Asian Typography controls and Calc ODF paragraph formatting."
  -
    type: "verify"
    at: "2026-11-27T06:04:47.590Z"
    author: "CODER"
    state: "ok"
    note: "43 targeted tests pass with the local pinned asset path admitted. Typecheck, lint, format, dependency and source-tree checks pass. Scoped provenance passes. Existing integrated registry failures are recorded in Findings."
doc_version: 3
doc_updated_at: "2026-11-27T06:04:47.654Z"
doc_updated_by: "CODER"
description: "Complete the Calc Format Cells notebook using pinned CUI slot admission, grouped attribute history, and all three original ODF paragraph property mappings. Reuse shared Writer/Calc ODF tokens and document source evidence."
sections:
  Summary: "Complete Asian Typography in the Calc Format Cells notebook and preserve the pinned Asian paragraph ODF properties."
  Scope: "Expose the original three controls in Calc, resolve their availability through the Calc pool, apply changes through the existing grouped attribute command, and round-trip the three flags in ODS. Reuse the integrated XML tokens and named boolean handler, preserve Writer behavior and document the pinned EditEngine transfer in CALC239. Update the parity registry for the consumed native owners."
  Plan: "Connect the pinned CUI tab in Calc, restore native ODF paragraph flag mappings, and verify slot admission, item-set exchange, grouped history and ODS persistence."
  Verify Steps: |-
    - Run focused Calc Format Cells and ODS tests and the shared CUI paragraph and Writer ODF diagnostic tests from the Office working directory.
    - Run Office typecheck, changed-source lint and format, dependencies, source tree and provenance, Calc/shared parity registry, AgentPlane routing and doctor. Inspect both source and test evidence for native slot availability and all ODS lexical pairs.
  Verification: |-
    Pending execution.

    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-11-27T06:04:47.590Z — VERIFY — ok

    By: CODER

    Note: 43 targeted tests pass with the local pinned asset path admitted. Typecheck, lint, format, dependency and source-tree checks pass. Scoped provenance passes. Existing integrated registry failures are recorded in Findings.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-11-27T06:04:46.770Z, excerpt_hash=sha256:54a168c0c2840c2912a488eb5edaa10a0ddfc052619b0e18b29f005809eba6d5

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202611270601-GE34WV/blueprint/resolved-snapshot.json
    - old_digest: ff6b2051f66e1e82e9046c7b0f1eb888626fd1df65b4c38f40ae7c72cee2c5d5
    - current_digest: ff6b2051f66e1e82e9046c7b0f1eb888626fd1df65b4c38f40ae7c72cee2c5d5
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202611270601-GE34WV

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202611270601-GE34WV
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: false
    - repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert the scoped task changes and leave current shared Writer token registration intact."
  Findings: |-
    The integrated base supplies the shared ODF tokens and Writer admission. Calc exposes all three controls and enables only its mapped forbidden-character slot. Its ODS paragraph mapper preserves all three typed flags even when two controls are unavailable in Calc Format Cells.

    Command: Office Vitest focused Calc Format Cells, ODS, shared CUI paragraph and Writer ODF diagnostic suites.
    Result: 43 passed. ODS 26, CUI 6, Writer diagnostics 2 and Calc dialog 9. Default Vite refused the already-linked pinned conditional-format PNG outside the Calc checkout. The test-only local config allows the exact resolved reference directory; the 9 dialog cases passed with real assets and no tracked configuration edits.

    Commands: Office TypeScript, changed-source ESLint and Prettier, dependency boundaries, LibreOffice source-tree and AgentPlane routing and doctor.
    Result: pass. Doctor reports the existing managed-hook warning.

    Commands: check:source-provenance and inventory:parity:calc/shared.
    Result: fail on markers already absent at the integrated base. Global provenance refers to Writer odt-property-roundtrip.test.ts under the original combined character-effects test name. Both inventory scopes refer to removed shared xmlstyle.ts marker rawLineStart. The unchanged current base has the same source and registry entries. Exact provenance of all three changed/additional mapped owners passes the production validator with only those records selected. Global markers require an independent integration reconciliation.

    Graphify queried the project graph successfully. The pinned upstream graph exceeds the installed loader default, so the pinned CUI, Calc pool and ODF code were confirmed from the local source files.
id_source: "generated"
---
## Summary

Complete Asian Typography in the Calc Format Cells notebook and preserve the pinned Asian paragraph ODF properties.

## Scope

Expose the original three controls in Calc, resolve their availability through the Calc pool, apply changes through the existing grouped attribute command, and round-trip the three flags in ODS. Reuse the integrated XML tokens and named boolean handler, preserve Writer behavior and document the pinned EditEngine transfer in CALC239. Update the parity registry for the consumed native owners.

## Plan

Connect the pinned CUI tab in Calc, restore native ODF paragraph flag mappings, and verify slot admission, item-set exchange, grouped history and ODS persistence.

## Verify Steps

- Run focused Calc Format Cells and ODS tests and the shared CUI paragraph and Writer ODF diagnostic tests from the Office working directory.
- Run Office typecheck, changed-source lint and format, dependencies, source tree and provenance, Calc/shared parity registry, AgentPlane routing and doctor. Inspect both source and test evidence for native slot availability and all ODS lexical pairs.

## Verification

Pending execution.

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-11-27T06:04:47.590Z — VERIFY — ok

By: CODER

Note: 43 targeted tests pass with the local pinned asset path admitted. Typecheck, lint, format, dependency and source-tree checks pass. Scoped provenance passes. Existing integrated registry failures are recorded in Findings.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-11-27T06:04:46.770Z, excerpt_hash=sha256:54a168c0c2840c2912a488eb5edaa10a0ddfc052619b0e18b29f005809eba6d5

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202611270601-GE34WV/blueprint/resolved-snapshot.json
- old_digest: ff6b2051f66e1e82e9046c7b0f1eb888626fd1df65b4c38f40ae7c72cee2c5d5
- current_digest: ff6b2051f66e1e82e9046c7b0f1eb888626fd1df65b4c38f40ae7c72cee2c5d5
- route_changed: no
- safe_command: agentplane blueprint snapshot 202611270601-GE34WV

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202611270601-GE34WV
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: false
- repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert the scoped task changes and leave current shared Writer token registration intact.

## Findings

The integrated base supplies the shared ODF tokens and Writer admission. Calc exposes all three controls and enables only its mapped forbidden-character slot. Its ODS paragraph mapper preserves all three typed flags even when two controls are unavailable in Calc Format Cells.

Command: Office Vitest focused Calc Format Cells, ODS, shared CUI paragraph and Writer ODF diagnostic suites.
Result: 43 passed. ODS 26, CUI 6, Writer diagnostics 2 and Calc dialog 9. Default Vite refused the already-linked pinned conditional-format PNG outside the Calc checkout. The test-only local config allows the exact resolved reference directory; the 9 dialog cases passed with real assets and no tracked configuration edits.

Commands: Office TypeScript, changed-source ESLint and Prettier, dependency boundaries, LibreOffice source-tree and AgentPlane routing and doctor.
Result: pass. Doctor reports the existing managed-hook warning.

Commands: check:source-provenance and inventory:parity:calc/shared.
Result: fail on markers already absent at the integrated base. Global provenance refers to Writer odt-property-roundtrip.test.ts under the original combined character-effects test name. Both inventory scopes refer to removed shared xmlstyle.ts marker rawLineStart. The unchanged current base has the same source and registry entries. Exact provenance of all three changed/additional mapped owners passes the production validator with only those records selected. Global markers require an independent integration reconciliation.

Graphify queried the project graph successfully. The pinned upstream graph exceeds the installed loader default, so the pinned CUI, Calc pool and ODF code were confirmed from the local source files.
