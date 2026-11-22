---
id: "202611220626-CFJEET"
title: "Connect Writer Navigator heading tools"
status: "DOING"
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
  updated_at: "2026-11-22T06:26:46.047Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-11-22T06:39:43.112Z"
  updated_by: "CODER"
  note: "Verified: 85 focused cases across six Writer suites plus two production Chromium flows, exact TypeScript and Vite, native upstream chapter fixtures, source registry and static checks."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-11-22T06:39:44.694Z"
  updated_by: "EVALUATOR"
  note: "Navigator heading tools operate on the native outline index and connected whole-node ranges with undo and redo."
  evaluated_sha: "8f13b8cf0d156ef59cb3901c63e44004193ec11a"
  blueprint_digest: "9dba031dffaa141e3ae9666c2a0c2fd868e61e21189da5e6ff1db7a60df7ab29"
  evidence_refs:
    - ".agentplane/tasks/202611220626-CFJEET/README.md"
    - ".agentplane/tasks/202611220626-CFJEET/quality/20261122-063944694-recovery-context/quality-report.json"
    - ".agentplane/tasks/202611220626-CFJEET/quality/20261122-063944694-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202611220626-CFJEET/quality/20261122-063944694-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202611220626-CFJEET/blueprint/resolved-snapshot.json"
    - "output/playwright/writer-heading-vitest-final.log"
    - "output/playwright/writer-heading-chrome-complete.log"
  findings:
    - "Both pinned chapter movement sequences, cursor retention, modified clicks, whole table and bookmark identity and grouped level edits are verified."
commit: null
comments:
  -
    author: "CODER"
    body: "Start: continue direct-mode task in current checkout."
events:
  -
    type: "status"
    at: "2026-11-22T06:26:57.977Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: continue direct-mode task in current checkout."
  -
    type: "verify"
    at: "2026-11-22T06:39:43.112Z"
    author: "CODER"
    state: "ok"
    note: "Verified: 85 focused cases across six Writer suites plus two production Chromium flows, exact TypeScript and Vite, native upstream chapter fixtures, source registry and static checks."
doc_version: 3
doc_updated_at: "2026-11-22T06:39:43.264Z"
doc_updated_by: "CODER"
description: "Connect native outline level and chapter movement tools to Navigator selection, Writer outline order and undo history, with focused interaction and model verification."
sections:
  Summary: |-
    Connect Writer Navigator heading tools

    Connect native outline level and chapter movement tools to Navigator selection, Writer outline order and undo history, with focused interaction and model verification.
  Scope: "Writer Navigator heading controls, shell and document movement, undo, source registry and targeted verification. The complete test checkpoint follows this task."
  Plan: "Compare pinned Navigator heading dispatch and movement core using both graphs and source. Route heading level and chapter movement through Writer model and history. Add native Navigator heading tools and verify outline limits, child inclusion, movement and undo."
  Verify Steps: "Run focused Writer core outline, node movement, undo, Navigator interaction tests and a Chromium Navigator flow. Run TypeScript, Vite, dependency, source tree, provenance, resource, routing, size and documentation checks. Record exceptions and evaluator verdict."
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-11-22T06:39:43.112Z — VERIFY — ok

    By: CODER

    Note: Verified: 85 focused cases across six Writer suites plus two production Chromium flows, exact TypeScript and Vite, native upstream chapter fixtures, source registry and static checks.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-11-22T06:39:40.855Z, excerpt_hash=sha256:ec383492e3547cc9abec555c14ca9ea7d86b36f84c6d2fcb803f67bb00024b81

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office-writer/.agentplane/tasks/202611220626-CFJEET/blueprint/resolved-snapshot.json
    - old_digest: 9dba031dffaa141e3ae9666c2a0c2fd868e61e21189da5e6ff1db7a60df7ab29
    - current_digest: 9dba031dffaa141e3ae9666c2a0c2fd868e61e21189da5e6ff1db7a60df7ab29
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202611220626-CFJEET

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202611220626-CFJEET
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
  Findings: "TypeScript, production Vite, focused ESLint/Prettier, module boundaries, source tree and provenance, Writer resources and routing passed. The global documentation check reports 307 pre-existing Calc JSDoc diagnostics. The global size check reports the existing Calc codec and Writer layout/export/import files at the ceiling; none were edited here. AgentPlane doctor passed with the existing hook shim warning. Chromium caught a tree-row shift on heading selection; reserving space for the native contextual toolbar restored double-click. Complete suite follows the tenth task."
id_source: "generated"
---
## Summary

Connect Writer Navigator heading tools

Connect native outline level and chapter movement tools to Navigator selection, Writer outline order and undo history, with focused interaction and model verification.

## Scope

Writer Navigator heading controls, shell and document movement, undo, source registry and targeted verification. The complete test checkpoint follows this task.

## Plan

Compare pinned Navigator heading dispatch and movement core using both graphs and source. Route heading level and chapter movement through Writer model and history. Add native Navigator heading tools and verify outline limits, child inclusion, movement and undo.

## Verify Steps

Run focused Writer core outline, node movement, undo, Navigator interaction tests and a Chromium Navigator flow. Run TypeScript, Vite, dependency, source tree, provenance, resource, routing, size and documentation checks. Record exceptions and evaluator verdict.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-11-22T06:39:43.112Z — VERIFY — ok

By: CODER

Note: Verified: 85 focused cases across six Writer suites plus two production Chromium flows, exact TypeScript and Vite, native upstream chapter fixtures, source registry and static checks.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-11-22T06:39:40.855Z, excerpt_hash=sha256:ec383492e3547cc9abec555c14ca9ea7d86b36f84c6d2fcb803f67bb00024b81

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office-writer/.agentplane/tasks/202611220626-CFJEET/blueprint/resolved-snapshot.json
- old_digest: 9dba031dffaa141e3ae9666c2a0c2fd868e61e21189da5e6ff1db7a60df7ab29
- current_digest: 9dba031dffaa141e3ae9666c2a0c2fd868e61e21189da5e6ff1db7a60df7ab29
- route_changed: no
- safe_command: agentplane blueprint snapshot 202611220626-CFJEET

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202611220626-CFJEET
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

TypeScript, production Vite, focused ESLint/Prettier, module boundaries, source tree and provenance, Writer resources and routing passed. The global documentation check reports 307 pre-existing Calc JSDoc diagnostics. The global size check reports the existing Calc codec and Writer layout/export/import files at the ceiling; none were edited here. AgentPlane doctor passed with the existing hook shim warning. Chromium caught a tree-row shift on heading selection; reserving space for the native contextual toolbar restored double-click. Complete suite follows the tenth task.
