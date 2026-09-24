---
id: "202609241135-FVV0N3"
title: "F8 Restore Writer layout measurement ownership"
status: "DOING"
priority: "high"
owner: "CODER"
revision: 6
origin:
  system: "manual"
depends_on:
  - "202609241135-GT2KTZ"
tags:
  - "code"
  - "parity"
verify:
  - "npm run verify"
plan_approval:
  state: "approved"
  updated_at: "2026-09-24T13:24:10.588Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-09-24T13:41:33.807Z"
  updated_by: "CODER"
  note: "Core layout now derives spacing, style, keep and line-number flags from current SwDoc; browser supplies only measured line geometry. Full npm run verify and git diff --check passed (485 office tests, 98 inventory tests, 14 E2E, 100% coverage)."
  attempts: 0
commit: null
comments:
  -
    author: "CODER"
    body: "Start: bind Writer layout to canonical nodes and narrow browser line measurements."
events:
  -
    type: "status"
    at: "2026-09-24T13:24:11.377Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: bind Writer layout to canonical nodes and narrow browser line measurements."
  -
    type: "verify"
    at: "2026-09-24T13:41:33.807Z"
    author: "CODER"
    state: "ok"
    note: "Core layout now derives spacing, style, keep and line-number flags from current SwDoc; browser supplies only measured line geometry. Full npm run verify and git diff --check passed (485 office tests, 98 inventory tests, 14 E2E, 100% coverage)."
doc_version: 3
doc_updated_at: "2026-09-24T13:41:33.888Z"
doc_updated_by: "CODER"
description: "Implement F8: keep browser measurement behind a device port and persistent Writer frame ownership in core layout/text."
sections:
  Summary: |-
    F8 Restore Writer layout measurement ownership

    Implement F8: keep browser measurement behind a device port and persistent Writer frame ownership in core layout/text.
  Scope: |-
    - In scope: Implement F8: keep browser measurement behind a device port and persistent Writer frame ownership in core layout/text.
    - Out of scope: unrelated refactors not required for "F8 Restore Writer layout measurement ownership".
  Plan: "Bind persistent SwRootFrame and SwTextFrame layout to canonical SwTextNode identity and pooled paragraph items. Keep DOM Range shaping and font metrics in sw/browser/editor; pass only measured line boundaries/heights plus source node identity into core. Remove style, spacing, line-number and keep-with-next values derived from Writer view DTOs at the browser boundary; core reads them from nodes. Preserve page-fragment identity, page flow and rendering contracts; add focused default/non-default tests and update exact provenance/inventory data without changing validators."
  Verify Steps: "1. sw/browser/editor owns DOM Range and font measurement; core layout receives a narrow measurement port bound to SwTextNode and reads paragraph spacing, style, keep-with-next and line-number flags from canonical pooled items rather than WriterParagraphProjection. 2. Page breaks, follow frames, contextual spacing, keep-with-next, line numbering and unchanged frame identity pass focused tests with default and non-default inputs; browser rendering maps page fragments to the same canonical nodes. 3. Source provenance and runtime inventory show exact ownership, no browser or React object enters core, npm run verify and git diff --check pass."
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-09-24T13:41:33.807Z — VERIFY — ok

    By: CODER

    Note: Core layout now derives spacing, style, keep and line-number flags from current SwDoc; browser supplies only measured line geometry. Full npm run verify and git diff --check passed (485 office tests, 98 inventory tests, 14 E2E, 100% coverage).
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-24T13:24:11.377Z, excerpt_hash=sha256:1eb336e47febc46f26c153590e7dc81844f52341cf22f5ee2745673bbd52ddfb

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609241135-FVV0N3/blueprint/resolved-snapshot.json
    - old_digest: 801f3023c6c3c22082bb6c8008ff04b3a89c2ebd49fb24d7cadb66b65e35e40f
    - current_digest: 801f3023c6c3c22082bb6c8008ff04b3a89c2ebd49fb24d7cadb66b65e35e40f
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202609241135-FVV0N3

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202609241135-FVV0N3
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

F8 Restore Writer layout measurement ownership

Implement F8: keep browser measurement behind a device port and persistent Writer frame ownership in core layout/text.

## Scope

- In scope: Implement F8: keep browser measurement behind a device port and persistent Writer frame ownership in core layout/text.
- Out of scope: unrelated refactors not required for "F8 Restore Writer layout measurement ownership".

## Plan

Bind persistent SwRootFrame and SwTextFrame layout to canonical SwTextNode identity and pooled paragraph items. Keep DOM Range shaping and font metrics in sw/browser/editor; pass only measured line boundaries/heights plus source node identity into core. Remove style, spacing, line-number and keep-with-next values derived from Writer view DTOs at the browser boundary; core reads them from nodes. Preserve page-fragment identity, page flow and rendering contracts; add focused default/non-default tests and update exact provenance/inventory data without changing validators.

## Verify Steps

1. sw/browser/editor owns DOM Range and font measurement; core layout receives a narrow measurement port bound to SwTextNode and reads paragraph spacing, style, keep-with-next and line-number flags from canonical pooled items rather than WriterParagraphProjection. 2. Page breaks, follow frames, contextual spacing, keep-with-next, line numbering and unchanged frame identity pass focused tests with default and non-default inputs; browser rendering maps page fragments to the same canonical nodes. 3. Source provenance and runtime inventory show exact ownership, no browser or React object enters core, npm run verify and git diff --check pass.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-09-24T13:41:33.807Z — VERIFY — ok

By: CODER

Note: Core layout now derives spacing, style, keep and line-number flags from current SwDoc; browser supplies only measured line geometry. Full npm run verify and git diff --check passed (485 office tests, 98 inventory tests, 14 E2E, 100% coverage).
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-24T13:24:11.377Z, excerpt_hash=sha256:1eb336e47febc46f26c153590e7dc81844f52341cf22f5ee2745673bbd52ddfb

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609241135-FVV0N3/blueprint/resolved-snapshot.json
- old_digest: 801f3023c6c3c22082bb6c8008ff04b3a89c2ebd49fb24d7cadb66b65e35e40f
- current_digest: 801f3023c6c3c22082bb6c8008ff04b3a89c2ebd49fb24d7cadb66b65e35e40f
- route_changed: no
- safe_command: agentplane blueprint snapshot 202609241135-FVV0N3

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202609241135-FVV0N3
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
