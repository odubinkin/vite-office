---
id: "202609231540-4FPJYY"
title: "Restore Writer page descriptor and settings contracts"
result_summary: "Restore Writer page descriptor collections, follow-aware page layout, relevant settings, schema v15 persistence, ODT round trips, undo, and browser projection."
status: "DONE"
priority: "med"
owner: "CODER"
revision: 15
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-09-23T15:41:18.864Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-09-23T16:05:25.821Z"
  updated_by: "CODER"
  note: "verified-202609231540-4FPJYY"
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-09-23T16:04:53.884Z"
  updated_by: "EVALUATOR"
  note: "Writer page descriptor collection, follow-aware layout, relevant settings defaults, current-schema persistence, ODT boundaries, undo and browser projection match the approved supported slice."
  evaluated_sha: "8428c637d6797cec3ab8754c431a31306b0caa9c"
  blueprint_digest: "ce35217980a64d2133d364bf028b278d876fa54ecd39ba7917a899931f76110e"
  evidence_refs:
    - ".agentplane/tasks/202609231540-4FPJYY/README.md"
    - ".agentplane/tasks/202609231540-4FPJYY/quality/20260923-160453884-recovery-context/quality-report.json"
    - ".agentplane/tasks/202609231540-4FPJYY/quality/20260923-160453884-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202609231540-4FPJYY/quality/20260923-160453884-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202609231540-4FPJYY/blueprint/resolved-snapshot.json"
  findings:
    - "No acceptance-blocking defect found; full suite, typecheck, build, formatting, doctor and routing checks pass."
commit:
  hash: "ecd0f7fad581a38f1fe24abd6b447311a0a5006a"
  message: "🧪 4FPJYY task: record verification and quality evidence"
comments:
  -
    author: "CODER"
    body: "Start: Implement the approved upstream-shaped Writer page descriptor collection and relevant document settings contracts, adapt persistence/filter/UI boundaries, and verify focused behavior."
  -
    author: "CODER"
    body: "Verified: verified-202609231540-4FPJYY. Guided shortcut recorded verification and is closing the direct task with traceable commit metadata."
  -
    author: "CODER"
    body: "Verified: full Writer suite, focused parity tests, typecheck, build, formatting, AgentPlane doctor, routing validation, and clean implementation diff all passed."
events:
  -
    type: "status"
    at: "2026-09-23T15:41:25.451Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: Implement the approved upstream-shaped Writer page descriptor collection and relevant document settings contracts, adapt persistence/filter/UI boundaries, and verify focused behavior."
  -
    type: "verify"
    at: "2026-09-23T16:04:44.889Z"
    author: "TESTER"
    state: "ok"
    note: "Verified: 93 test files and 397 tests passed; focused page descriptor/settings/codec/ODT/layout tests passed; TypeScript typecheck and Vite production build passed; Prettier, AgentPlane doctor, routing policy, and git diff checks passed. Vite emitted only the existing non-fatal chunk-size warning."
  -
    type: "verify"
    at: "2026-09-23T16:05:08.914Z"
    author: "CODER"
    state: "ok"
    note: "verified-202609231540-4FPJYY"
  -
    type: "verify"
    at: "2026-09-23T16:05:25.821Z"
    author: "CODER"
    state: "ok"
    note: "verified-202609231540-4FPJYY"
  -
    type: "status"
    at: "2026-09-23T16:05:25.957Z"
    author: "CODER"
    from: "DOING"
    to: "DONE"
    note: "Verified: verified-202609231540-4FPJYY. Guided shortcut recorded verification and is closing the direct task with traceable commit metadata."
  -
    type: "status"
    at: "2026-09-23T16:06:06.169Z"
    author: "CODER"
    from: "DONE"
    to: "DONE"
    note: "Verified: full Writer suite, focused parity tests, typecheck, build, formatting, AgentPlane doctor, routing validation, and clean implementation diff all passed."
doc_version: 3
doc_updated_at: "2026-09-23T16:06:06.171Z"
doc_updated_by: "CODER"
description: "Implement item 4 of docs/program/vite-office-upstream-parity-plan.md against pinned LibreOffice: page descriptor collection/identity/follow contracts and relevant document settings defaults, including current codec and ODT boundaries without legacy schema compatibility."
sections:
  Summary: "Restore the upstream-shaped Writer page descriptor collection and the relevant document settings contracts required by the currently implemented page, paragraph, list, import, export, cache, undo, and Page Style paths."
  Scope: "Modify the relevant implementation and focused tests under apps/office/src/sw/source/core/{layout,doc,undo}, apps/office/src/sw/source/filter/xml, apps/office/src/sw/source/uibase, and browser Page Style projections. Use the pinned vendor/libreoffice-reference source as the behavioral authority. Preserve twip units. If the canonical stored record changes, increment its schema version and reject older versions without compatibility code. Do not modify parity inventory machinery or add unrelated Writer/native features."
  Plan: "1. Trace pinned SwPageDesc/docdesc and DocumentSettingManager contracts used by the supported slice. 2. Implement descriptor collection, stable identities, follow links, upstream-derived defaults, and relevant setting identities/defaults. 3. Adapt document mutation, undo, ODT, cache codec, shell, and UI projections. 4. Add focused source-derived tests for blank and loaded documents, geometry/follow behavior, settings, style/list interaction, and round trips. 5. Run and record all verification checks."
  Verify Steps: |-
    - pnpm --filter @vite-office/office test -- --run
    - pnpm --filter @vite-office/office typecheck
    - pnpm --filter @vite-office/office build
    - ap doctor
    - node .agentplane/policy/check-routing.mjs
    - git status --short --untracked-files=all

    Acceptance: focused tests demonstrate multiple named page descriptors, identity-preserving master/follow links, applicable descriptor mutation, upstream-derived relevant DocumentSettingManager defaults, paragraph/list/style behavior, undo, current-schema cache round trip, and ODT round trip. Older stored schema versions are rejected.
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-09-23T16:04:44.889Z — VERIFY — ok

    By: TESTER

    Note: Verified: 93 test files and 397 tests passed; focused page descriptor/settings/codec/ODT/layout tests passed; TypeScript typecheck and Vite production build passed; Prettier, AgentPlane doctor, routing policy, and git diff checks passed. Vite emitted only the existing non-fatal chunk-size warning.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-23T15:41:25.451Z, excerpt_hash=sha256:6cbfbb73a9cb6d90a9cb19dab626b285f9d82dc4550e2402bd6c1d80f67b3ab3

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609231540-4FPJYY/blueprint/resolved-snapshot.json
    - old_digest: ce35217980a64d2133d364bf028b278d876fa54ecd39ba7917a899931f76110e
    - current_digest: ce35217980a64d2133d364bf028b278d876fa54ecd39ba7917a899931f76110e
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202609231540-4FPJYY

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202609231540-4FPJYY
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: false
    - repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
    - risks: none

    ### 2026-09-23T16:05:08.914Z — VERIFY — ok

    By: CODER

    Note: verified-202609231540-4FPJYY
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-23T16:04:44.970Z, excerpt_hash=sha256:6cbfbb73a9cb6d90a9cb19dab626b285f9d82dc4550e2402bd6c1d80f67b3ab3

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609231540-4FPJYY/blueprint/resolved-snapshot.json
    - old_digest: ce35217980a64d2133d364bf028b278d876fa54ecd39ba7917a899931f76110e
    - current_digest: ce35217980a64d2133d364bf028b278d876fa54ecd39ba7917a899931f76110e
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202609231540-4FPJYY

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task complete 202609231540-4FPJYY --result verified-202609231540-4FPJYY --commit 8428c637d6797cec3ab8754c431a31306b0caa9c
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: true
    - repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
    - risks: none

    ### 2026-09-23T16:05:25.821Z — VERIFY — ok

    By: CODER

    Note: verified-202609231540-4FPJYY
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-23T16:05:08.998Z, excerpt_hash=sha256:6cbfbb73a9cb6d90a9cb19dab626b285f9d82dc4550e2402bd6c1d80f67b3ab3

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609231540-4FPJYY/blueprint/resolved-snapshot.json
    - old_digest: ce35217980a64d2133d364bf028b278d876fa54ecd39ba7917a899931f76110e
    - current_digest: ce35217980a64d2133d364bf028b278d876fa54ecd39ba7917a899931f76110e
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202609231540-4FPJYY

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task complete 202609231540-4FPJYY --result verified-202609231540-4FPJYY --commit ecd0f7fad581a38f1fe24abd6b447311a0a5006a
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: true
    - repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert only the implementation commit and the task close commit for 202609231540-4FPJYY. No stored-schema downgrade or compatibility path is provided."
  Findings: "No findings yet."
extensions:
  implementation_commit:
    hash: "8428c637d6797cec3ab8754c431a31306b0caa9c"
    message: "🚧 4FPJYY task: restore page descriptors and settings"
id_source: "generated"
---
## Summary

Restore the upstream-shaped Writer page descriptor collection and the relevant document settings contracts required by the currently implemented page, paragraph, list, import, export, cache, undo, and Page Style paths.

## Scope

Modify the relevant implementation and focused tests under apps/office/src/sw/source/core/{layout,doc,undo}, apps/office/src/sw/source/filter/xml, apps/office/src/sw/source/uibase, and browser Page Style projections. Use the pinned vendor/libreoffice-reference source as the behavioral authority. Preserve twip units. If the canonical stored record changes, increment its schema version and reject older versions without compatibility code. Do not modify parity inventory machinery or add unrelated Writer/native features.

## Plan

1. Trace pinned SwPageDesc/docdesc and DocumentSettingManager contracts used by the supported slice. 2. Implement descriptor collection, stable identities, follow links, upstream-derived defaults, and relevant setting identities/defaults. 3. Adapt document mutation, undo, ODT, cache codec, shell, and UI projections. 4. Add focused source-derived tests for blank and loaded documents, geometry/follow behavior, settings, style/list interaction, and round trips. 5. Run and record all verification checks.

## Verify Steps

- pnpm --filter @vite-office/office test -- --run
- pnpm --filter @vite-office/office typecheck
- pnpm --filter @vite-office/office build
- ap doctor
- node .agentplane/policy/check-routing.mjs
- git status --short --untracked-files=all

Acceptance: focused tests demonstrate multiple named page descriptors, identity-preserving master/follow links, applicable descriptor mutation, upstream-derived relevant DocumentSettingManager defaults, paragraph/list/style behavior, undo, current-schema cache round trip, and ODT round trip. Older stored schema versions are rejected.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-09-23T16:04:44.889Z — VERIFY — ok

By: TESTER

Note: Verified: 93 test files and 397 tests passed; focused page descriptor/settings/codec/ODT/layout tests passed; TypeScript typecheck and Vite production build passed; Prettier, AgentPlane doctor, routing policy, and git diff checks passed. Vite emitted only the existing non-fatal chunk-size warning.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-23T15:41:25.451Z, excerpt_hash=sha256:6cbfbb73a9cb6d90a9cb19dab626b285f9d82dc4550e2402bd6c1d80f67b3ab3

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609231540-4FPJYY/blueprint/resolved-snapshot.json
- old_digest: ce35217980a64d2133d364bf028b278d876fa54ecd39ba7917a899931f76110e
- current_digest: ce35217980a64d2133d364bf028b278d876fa54ecd39ba7917a899931f76110e
- route_changed: no
- safe_command: agentplane blueprint snapshot 202609231540-4FPJYY

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202609231540-4FPJYY
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: false
- repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
- risks: none

### 2026-09-23T16:05:08.914Z — VERIFY — ok

By: CODER

Note: verified-202609231540-4FPJYY
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-23T16:04:44.970Z, excerpt_hash=sha256:6cbfbb73a9cb6d90a9cb19dab626b285f9d82dc4550e2402bd6c1d80f67b3ab3

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609231540-4FPJYY/blueprint/resolved-snapshot.json
- old_digest: ce35217980a64d2133d364bf028b278d876fa54ecd39ba7917a899931f76110e
- current_digest: ce35217980a64d2133d364bf028b278d876fa54ecd39ba7917a899931f76110e
- route_changed: no
- safe_command: agentplane blueprint snapshot 202609231540-4FPJYY

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task complete 202609231540-4FPJYY --result verified-202609231540-4FPJYY --commit 8428c637d6797cec3ab8754c431a31306b0caa9c
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: true
- repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
- risks: none

### 2026-09-23T16:05:25.821Z — VERIFY — ok

By: CODER

Note: verified-202609231540-4FPJYY
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-23T16:05:08.998Z, excerpt_hash=sha256:6cbfbb73a9cb6d90a9cb19dab626b285f9d82dc4550e2402bd6c1d80f67b3ab3

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609231540-4FPJYY/blueprint/resolved-snapshot.json
- old_digest: ce35217980a64d2133d364bf028b278d876fa54ecd39ba7917a899931f76110e
- current_digest: ce35217980a64d2133d364bf028b278d876fa54ecd39ba7917a899931f76110e
- route_changed: no
- safe_command: agentplane blueprint snapshot 202609231540-4FPJYY

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task complete 202609231540-4FPJYY --result verified-202609231540-4FPJYY --commit ecd0f7fad581a38f1fe24abd6b447311a0a5006a
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: true
- repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert only the implementation commit and the task close commit for 202609231540-4FPJYY. No stored-schema downgrade or compatibility path is provided.

## Findings

No findings yet.
