---
id: "202611271734-VQYSKP"
title: "Implement native Writer ODT save visibility for tracked deletions"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 6
origin:
  system: "manual"
depends_on: []
tags:
  - "odf"
  - "writer"
task_kind: "code"
mutation_scope: "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-11-27T17:35:21.398Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-11-27T17:46:59.444Z"
  updated_by: "CODER"
  note: "84 focused Writer tests plus all 8 final redline tests passed. Original deletion section XML, interrupted save restoration, Worker and ODT reopen verified. Typecheck, lint, provenance, module boundaries and scoped inventories passed."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-11-27T17:47:01.625Z"
  updated_by: "EVALUATOR"
  note: "Writer ODT save applies the pinned two-pass redline visibility transition for represented inline deletions."
  evaluated_sha: "522fffce49a974be6c4213ddceb096a20ed6b102"
  blueprint_digest: "0495ca5c71adae5e3c397ac9b2e4eb9d7f769336d252e5b353e52dcdff93dbc8"
  evidence_refs:
    - ".agentplane/tasks/202611271734-VQYSKP/README.md"
    - ".agentplane/tasks/202611271734-VQYSKP/quality/20261127-174701625-recovery-context/quality-report.json"
    - ".agentplane/tasks/202611271734-VQYSKP/quality/20261127-174701625-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202611271734-VQYSKP/quality/20261127-174701625-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202611271734-VQYSKP/blueprint/resolved-snapshot.json"
    - "output/playwright/odf-writer-redlines/visibility-verification.md"
  findings:
    - "Original ODT redline fixtures and cancellation preserve saved representation and live model. Complex deletion transitions remain outside this slice."
commit: null
comments:
  -
    author: "CODER"
    body: "Start: attach the native SwXMLWriter redline save visibility transition."
events:
  -
    type: "status"
    at: "2026-11-27T17:35:21.863Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: attach the native SwXMLWriter redline save visibility transition."
  -
    type: "verify"
    at: "2026-11-27T17:46:59.444Z"
    author: "CODER"
    state: "ok"
    note: "84 focused Writer tests plus all 8 final redline tests passed. Original deletion section XML, interrupted save restoration, Worker and ODT reopen verified. Typecheck, lint, provenance, module boundaries and scoped inventories passed."
doc_version: 3
doc_updated_at: "2026-11-27T17:46:59.743Z"
doc_updated_by: "CODER"
description: "Port the original redline visibility transition used by SwXMLWriter. Move represented deleted text into native redline sections for package export and restore the live document state, preserving positions and formatting. Verify the original whitespace, midnight timestamp and same-position deletion cases and restoration after an interrupted export."
sections:
  Summary: |-
    Implement native Writer ODT save visibility for tracked deletions

    Port the original redline visibility transition used by SwXMLWriter. Move represented deleted text into native redline sections for package export and restore the live document state, preserving positions and formatting. Verify the original whitespace, midnight timestamp and same-position deletion cases and restoration after an interrupted export.
  Scope: |-
    - In scope: Port the original redline visibility transition used by SwXMLWriter. Move represented deleted text into native redline sections for package export and restore the live document state, preserving positions and formatting. Verify the original whitespace, midnight timestamp and same-position deletion cases and restoration after an interrupted export.
    - Out of scope: unrelated refactors not required for "Implement native Writer ODT save visibility for tracked deletions".
  Plan: "Follow the pinned SwXMLWriter redline visibility guard and SwRangeRedline move operations. Use original owned redline sections and native Writer text range operations for represented same-paragraph deletions, preserving owner positions and restoring state on normal and cancelled saves. Keep package contents and browser save policy on their existing entry points. Verify the original whitespace and same-position deletion inputs and one critical save-restoration regression."
  Verify Steps: |-
    PLANNER fallback scaffold for "Implement native Writer ODT save visibility for tracked deletions". Replace with task-specific acceptance checks when PLANNER context is available.

    1. Review the requested outcome for "Implement native Writer ODT save visibility for tracked deletions". Expected: the visible result matches ## Summary and stays inside approved scope.
    2. Run the most relevant validation step for this task. Expected: it succeeds without unexpected regressions in touched behavior.
    3. Compare the final result against ## Scope and record any residual follow-up in ## Findings. Expected: open edges are explicit rather than implicit.
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-11-27T17:46:59.444Z — VERIFY — ok

    By: CODER

    Note: 84 focused Writer tests plus all 8 final redline tests passed. Original deletion section XML, interrupted save restoration, Worker and ODT reopen verified. Typecheck, lint, provenance, module boundaries and scoped inventories passed.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-11-27T17:35:21.863Z, excerpt_hash=sha256:928b528b8145e471752f01e3a526aefe0f783a8054268f64d556070c5bbdecd6

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202611271734-VQYSKP/blueprint/resolved-snapshot.json
    - old_digest: 0495ca5c71adae5e3c397ac9b2e4eb9d7f769336d252e5b353e52dcdff93dbc8
    - current_digest: 0495ca5c71adae5e3c397ac9b2e4eb9d7f769336d252e5b353e52dcdff93dbc8
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202611271734-VQYSKP

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202611271734-VQYSKP
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

Implement native Writer ODT save visibility for tracked deletions

Port the original redline visibility transition used by SwXMLWriter. Move represented deleted text into native redline sections for package export and restore the live document state, preserving positions and formatting. Verify the original whitespace, midnight timestamp and same-position deletion cases and restoration after an interrupted export.

## Scope

- In scope: Port the original redline visibility transition used by SwXMLWriter. Move represented deleted text into native redline sections for package export and restore the live document state, preserving positions and formatting. Verify the original whitespace, midnight timestamp and same-position deletion cases and restoration after an interrupted export.
- Out of scope: unrelated refactors not required for "Implement native Writer ODT save visibility for tracked deletions".

## Plan

Follow the pinned SwXMLWriter redline visibility guard and SwRangeRedline move operations. Use original owned redline sections and native Writer text range operations for represented same-paragraph deletions, preserving owner positions and restoring state on normal and cancelled saves. Keep package contents and browser save policy on their existing entry points. Verify the original whitespace and same-position deletion inputs and one critical save-restoration regression.

## Verify Steps

PLANNER fallback scaffold for "Implement native Writer ODT save visibility for tracked deletions". Replace with task-specific acceptance checks when PLANNER context is available.

1. Review the requested outcome for "Implement native Writer ODT save visibility for tracked deletions". Expected: the visible result matches ## Summary and stays inside approved scope.
2. Run the most relevant validation step for this task. Expected: it succeeds without unexpected regressions in touched behavior.
3. Compare the final result against ## Scope and record any residual follow-up in ## Findings. Expected: open edges are explicit rather than implicit.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-11-27T17:46:59.444Z — VERIFY — ok

By: CODER

Note: 84 focused Writer tests plus all 8 final redline tests passed. Original deletion section XML, interrupted save restoration, Worker and ODT reopen verified. Typecheck, lint, provenance, module boundaries and scoped inventories passed.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-11-27T17:35:21.863Z, excerpt_hash=sha256:928b528b8145e471752f01e3a526aefe0f783a8054268f64d556070c5bbdecd6

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202611271734-VQYSKP/blueprint/resolved-snapshot.json
- old_digest: 0495ca5c71adae5e3c397ac9b2e4eb9d7f769336d252e5b353e52dcdff93dbc8
- current_digest: 0495ca5c71adae5e3c397ac9b2e4eb9d7f769336d252e5b353e52dcdff93dbc8
- route_changed: no
- safe_command: agentplane blueprint snapshot 202611271734-VQYSKP

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202611271734-VQYSKP
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
