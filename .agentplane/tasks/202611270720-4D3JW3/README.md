---
id: "202611270720-4D3JW3"
title: "Connect native Writer Navigator context actions and outline depth"
result_summary: "Exposed native Navigator context operations and a shared persistent outline level."
status: "DONE"
priority: "med"
owner: "CODER"
revision: 9
origin:
  system: "manual"
depends_on: []
tags:
  - "navigator"
  - "writer"
task_kind: "code"
mutation_scope: "code"
verify:
  - "Run focused Navigator, popup and configuration unit tests, Chromium Navigator flows, app type and production build checks, scoped lint, resources, dependency, source tree and provenance checks."
plan_approval:
  state: "approved"
  updated_at: "2026-11-27T07:20:54.837Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-11-27T07:30:42.284Z"
  updated_by: "CODER"
  note: "Verified: 38 focused Vitest cases and 7 Chromium Navigator scenarios. TypeScript, production Vite build, scoped ESLint and Prettier, module boundaries, source tree, Writer resources, policy routing and scoped source provenance passed."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-11-27T07:30:42.944Z"
  updated_by: "EVALUATOR"
  note: "Writer Navigator context uses represented native actions, branch expansion and the shared persistent outline level."
  evaluated_sha: "4b97ce51f0029f2d5866a9f665ca74094585342c"
  blueprint_digest: "ee69a43d32eb05de59e106b6c5aa0f379dc26d0728e62eef7d88ff945e183581"
  evidence_refs:
    - ".agentplane/tasks/202611270720-4D3JW3/README.md"
    - ".agentplane/tasks/202611270720-4D3JW3/quality/20261127-073042944-recovery-context/quality-report.json"
    - ".agentplane/tasks/202611270720-4D3JW3/quality/20261127-073042944-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202611270720-4D3JW3/quality/20261127-073042944-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202611270720-4D3JW3/blueprint/resolved-snapshot.json"
    - "output/playwright/writer-navigator-context-vitest.log"
    - "output/playwright/writer-navigator-context-chromium.log"
  findings:
    - "Context authorization and order, heading descendants and undo, bookmark deletion, focus, and outline level synchronization and reload were verified."
commit:
  hash: "4b97ce51f0029f2d5866a9f665ca74094585342c"
  message: "🧩 4D3JW3 code: Connect Writer Navigator context actions and outline depth"
comments:
  -
    author: "CODER"
    body: "Start: continue direct-mode task in current checkout."
  -
    author: "CODER"
    body: "Verified: 38 focused tests, 7 Chromium scenarios, and production build."
events:
  -
    type: "status"
    at: "2026-11-27T07:21:00.294Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: continue direct-mode task in current checkout."
  -
    type: "verify"
    at: "2026-11-27T07:30:42.284Z"
    author: "CODER"
    state: "ok"
    note: "Verified: 38 focused Vitest cases and 7 Chromium Navigator scenarios. TypeScript, production Vite build, scoped ESLint and Prettier, module boundaries, source tree, Writer resources, policy routing and scoped source provenance passed."
  -
    type: "status"
    at: "2026-11-27T07:33:38.876Z"
    author: "CODER"
    from: "DOING"
    to: "DONE"
    note: "Verified: 38 focused tests, 7 Chromium scenarios, and production build."
doc_version: 3
doc_updated_at: "2026-11-27T07:33:38.878Z"
doc_updated_by: "CODER"
description: "Expose existing Writer Navigator go-to, grouped heading moves, bookmark deletion, and tree expansion actions in native context resource order. Share the outline level between the toolbar, context submenu, and persistent Navigator configuration."
sections:
  Summary: |-
    Connect native Writer Navigator context actions and outline depth

    Expose existing Writer Navigator go-to, grouped heading moves, bookmark deletion, and tree expansion actions in native context resource order. Share the outline level between the toolbar, context submenu, and persistent Navigator configuration.
  Scope: |-
    - In scope: Expose existing Writer Navigator go-to, grouped heading moves, bookmark deletion, and tree expansion actions in native context resource order. Share the outline level between the toolbar, context submenu, and persistent Navigator configuration.
    - Out of scope: unrelated refactors not required for "Connect native Writer Navigator context actions and outline depth".
  Plan: "Confirm native popup resource order, action admission and branch operations against the pinned source. Move Navigator popup composition into its own browser owner, route menu IDs into the existing heading, cursor and bookmark mechanisms, and add native outline expansion and category collapse. Bring OutlineLevel into the source navigation configuration and use the same setter for the toolbar and contextual submenu. Add mounted and Chromium tests for keyboard and pointer, grouped edits, outline depth and settings persistence. Record validation and refresh the graph on close."
  Verify Steps: "Run targeted Navigator, popup and configuration Vitest suites and the Navigator Chromium spec. Verify native order and admission, undo, focus retention, and persisted shared outline depth. Run TypeScript, production build, scoped lint and formatting, source tree, Writer resources, dependency and scoped provenance checks."
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-11-27T07:30:42.284Z — VERIFY — ok

    By: CODER

    Note: Verified: 38 focused Vitest cases and 7 Chromium Navigator scenarios. TypeScript, production Vite build, scoped ESLint and Prettier, module boundaries, source tree, Writer resources, policy routing and scoped source provenance passed.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-11-27T07:30:41.340Z, excerpt_hash=sha256:29338153ac7c3babb6aa0a588539596e6732e267708eb7854b37bf9949089057

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office-writer/.agentplane/tasks/202611270720-4D3JW3/blueprint/resolved-snapshot.json
    - old_digest: ee69a43d32eb05de59e106b6c5aa0f379dc26d0728e62eef7d88ff945e183581
    - current_digest: ee69a43d32eb05de59e106b6c5aa0f379dc26d0728e62eef7d88ff945e183581
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202611270720-4D3JW3

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202611270720-4D3JW3
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
  Findings: "Navigator context presents represented source actions in resource order. Chapter moves include descendants and use the existing undo group. Go to follows the live cursor; bookmark actions use the existing Writer mark and undo owners. OutlineLevel uses the pinned schema, including the stored zero value and the UI choices one through ten. The context submenu and toolbar update the same model. The existing upstream movement and tracking scenarios still pass alongside context-specific browser coverage. Scoped provenance validates the five changed responsibility records; the repository-wide ODT witness drift recorded by the preceding task is outside this scope."
id_source: "generated"
---
## Summary

Connect native Writer Navigator context actions and outline depth

Expose existing Writer Navigator go-to, grouped heading moves, bookmark deletion, and tree expansion actions in native context resource order. Share the outline level between the toolbar, context submenu, and persistent Navigator configuration.

## Scope

- In scope: Expose existing Writer Navigator go-to, grouped heading moves, bookmark deletion, and tree expansion actions in native context resource order. Share the outline level between the toolbar, context submenu, and persistent Navigator configuration.
- Out of scope: unrelated refactors not required for "Connect native Writer Navigator context actions and outline depth".

## Plan

Confirm native popup resource order, action admission and branch operations against the pinned source. Move Navigator popup composition into its own browser owner, route menu IDs into the existing heading, cursor and bookmark mechanisms, and add native outline expansion and category collapse. Bring OutlineLevel into the source navigation configuration and use the same setter for the toolbar and contextual submenu. Add mounted and Chromium tests for keyboard and pointer, grouped edits, outline depth and settings persistence. Record validation and refresh the graph on close.

## Verify Steps

Run targeted Navigator, popup and configuration Vitest suites and the Navigator Chromium spec. Verify native order and admission, undo, focus retention, and persisted shared outline depth. Run TypeScript, production build, scoped lint and formatting, source tree, Writer resources, dependency and scoped provenance checks.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-11-27T07:30:42.284Z — VERIFY — ok

By: CODER

Note: Verified: 38 focused Vitest cases and 7 Chromium Navigator scenarios. TypeScript, production Vite build, scoped ESLint and Prettier, module boundaries, source tree, Writer resources, policy routing and scoped source provenance passed.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-11-27T07:30:41.340Z, excerpt_hash=sha256:29338153ac7c3babb6aa0a588539596e6732e267708eb7854b37bf9949089057

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office-writer/.agentplane/tasks/202611270720-4D3JW3/blueprint/resolved-snapshot.json
- old_digest: ee69a43d32eb05de59e106b6c5aa0f379dc26d0728e62eef7d88ff945e183581
- current_digest: ee69a43d32eb05de59e106b6c5aa0f379dc26d0728e62eef7d88ff945e183581
- route_changed: no
- safe_command: agentplane blueprint snapshot 202611270720-4D3JW3

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202611270720-4D3JW3
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

Navigator context presents represented source actions in resource order. Chapter moves include descendants and use the existing undo group. Go to follows the live cursor; bookmark actions use the existing Writer mark and undo owners. OutlineLevel uses the pinned schema, including the stored zero value and the UI choices one through ten. The context submenu and toolbar update the same model. The existing upstream movement and tracking scenarios still pass alongside context-specific browser coverage. Scoped provenance validates the five changed responsibility records; the repository-wide ODT witness drift recorded by the preceding task is outside this scope.
