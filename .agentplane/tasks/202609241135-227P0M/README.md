---
id: "202609241135-227P0M"
title: "F9 Target Writer layout invalidation"
status: "DOING"
priority: "high"
owner: "CODER"
revision: 6
origin:
  system: "manual"
depends_on:
  - "202609241135-FVV0N3"
tags:
  - "code"
  - "parity"
verify:
  - "npm run verify"
plan_approval:
  state: "approved"
  updated_at: "2026-09-24T13:42:50.074Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-09-24T13:57:11.602Z"
  updated_by: "CODER"
  note: "SwRootFrame invalidation uses current model/device revisions, typed geometry comparisons and targeted Writer node hints; full npm run verify and git diff --check passed (486 office tests, 98 inventory tests, 14 E2E, 100% coverage)."
  attempts: 0
commit: null
comments:
  -
    author: "CODER"
    body: "Start: replace whole-document serialization with revision and targeted frame invalidation."
events:
  -
    type: "status"
    at: "2026-09-24T13:42:50.681Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: replace whole-document serialization with revision and targeted frame invalidation."
  -
    type: "verify"
    at: "2026-09-24T13:57:11.602Z"
    author: "CODER"
    state: "ok"
    note: "SwRootFrame invalidation uses current model/device revisions, typed geometry comparisons and targeted Writer node hints; full npm run verify and git diff --check passed (486 office tests, 98 inventory tests, 14 E2E, 100% coverage)."
doc_version: 3
doc_updated_at: "2026-09-24T13:57:11.684Z"
doc_updated_by: "CODER"
description: "Implement F9: replace JSON serialization oracle with model revision and targeted dirty-frame propagation, preserving stable identity."
sections:
  Summary: |-
    F9 Target Writer layout invalidation

    Implement F9: replace JSON serialization oracle with model revision and targeted dirty-frame propagation, preserving stable identity.
  Scope: |-
    - In scope: Implement F9: replace JSON serialization oracle with model revision and targeted dirty-frame propagation, preserving stable identity.
    - Out of scope: unrelated refactors not required for "F9 Target Writer layout invalidation".
  Plan: "Replace SwRootFrame JSON.stringify invalidation and frame keys with current-document model revision, browser measurement revision and explicit value comparisons. Track the earliest model/device affected paragraph from Writer hints, reconcile page/text-frame identity by node, line range, geometry and placement, and reflow affected successors while preserving unaffected frames. Keep measurement revision in sw/browser/editor, exact page-flow behavior, line numbers and source evidence; add focused tests for unchanged inputs, content/attribute changes, changed line geometry, page descriptors and follow frames."
  Verify Steps: "1. SwRootFrame.Format has no whole-document, paragraph or frame JSON.stringify invalidation keys; model revision, browser measurement revision and typed comparisons determine work, and Writer hints identify the earliest affected node when possible. 2. Unchanged passes reuse the snapshot; changed nodes and layout geometry reflow affected successors while unchanged page/text frames retain identity whenever placement and geometry match. Tests cover model edits, attribute changes, measurement/font/width changes, page-descriptor changes, line numbers and follow frames. 3. Browser measurement revision stays under sw/browser/editor, exact provenance/inventory data reflect the algorithm, and npm run verify plus git diff --check pass."
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-09-24T13:57:11.602Z — VERIFY — ok

    By: CODER

    Note: SwRootFrame invalidation uses current model/device revisions, typed geometry comparisons and targeted Writer node hints; full npm run verify and git diff --check passed (486 office tests, 98 inventory tests, 14 E2E, 100% coverage).
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-24T13:42:50.681Z, excerpt_hash=sha256:45e10bf2a29c15c9bc07d96e907985ee482b68714f4d1a6a7ce39b73299ef588

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609241135-227P0M/blueprint/resolved-snapshot.json
    - old_digest: 756cafb50c6a178d23c2067e17d05fee85de2afb4267f68948c987d93d2c93f0
    - current_digest: 756cafb50c6a178d23c2067e17d05fee85de2afb4267f68948c987d93d2c93f0
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202609241135-227P0M

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202609241135-227P0M
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

F9 Target Writer layout invalidation

Implement F9: replace JSON serialization oracle with model revision and targeted dirty-frame propagation, preserving stable identity.

## Scope

- In scope: Implement F9: replace JSON serialization oracle with model revision and targeted dirty-frame propagation, preserving stable identity.
- Out of scope: unrelated refactors not required for "F9 Target Writer layout invalidation".

## Plan

Replace SwRootFrame JSON.stringify invalidation and frame keys with current-document model revision, browser measurement revision and explicit value comparisons. Track the earliest model/device affected paragraph from Writer hints, reconcile page/text-frame identity by node, line range, geometry and placement, and reflow affected successors while preserving unaffected frames. Keep measurement revision in sw/browser/editor, exact page-flow behavior, line numbers and source evidence; add focused tests for unchanged inputs, content/attribute changes, changed line geometry, page descriptors and follow frames.

## Verify Steps

1. SwRootFrame.Format has no whole-document, paragraph or frame JSON.stringify invalidation keys; model revision, browser measurement revision and typed comparisons determine work, and Writer hints identify the earliest affected node when possible. 2. Unchanged passes reuse the snapshot; changed nodes and layout geometry reflow affected successors while unchanged page/text frames retain identity whenever placement and geometry match. Tests cover model edits, attribute changes, measurement/font/width changes, page-descriptor changes, line numbers and follow frames. 3. Browser measurement revision stays under sw/browser/editor, exact provenance/inventory data reflect the algorithm, and npm run verify plus git diff --check pass.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-09-24T13:57:11.602Z — VERIFY — ok

By: CODER

Note: SwRootFrame invalidation uses current model/device revisions, typed geometry comparisons and targeted Writer node hints; full npm run verify and git diff --check passed (486 office tests, 98 inventory tests, 14 E2E, 100% coverage).
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-24T13:42:50.681Z, excerpt_hash=sha256:45e10bf2a29c15c9bc07d96e907985ee482b68714f4d1a6a7ce39b73299ef588

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609241135-227P0M/blueprint/resolved-snapshot.json
- old_digest: 756cafb50c6a178d23c2067e17d05fee85de2afb4267f68948c987d93d2c93f0
- current_digest: 756cafb50c6a178d23c2067e17d05fee85de2afb4267f68948c987d93d2c93f0
- route_changed: no
- safe_command: agentplane blueprint snapshot 202609241135-227P0M

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202609241135-227P0M
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
