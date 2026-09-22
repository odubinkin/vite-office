---
id: "202609220557-026YHJ"
title: "Close upstream parity implementation gaps"
status: "DOING"
priority: "high"
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
  updated_at: "2026-09-22T05:58:09.582Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-09-22T06:25:20.803Z"
  updated_by: "CODER"
  note: "verified-202609220557-026YHJ"
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-09-22T06:25:10.044Z"
  updated_by: "EVALUATOR"
  note: "Approved scope is implemented and all declared verification gates pass."
  evaluated_sha: "5879593082af6b31221e8f92fabe36d034af5c20"
  blueprint_digest: "5ebadba77c73c25fb7449a9f0ddc1ccd28952ad243f1886b32fdc28e2b4bbe5a"
  evidence_refs:
    - ".agentplane/tasks/202609220557-026YHJ/README.md"
    - ".agentplane/tasks/202609220557-026YHJ/quality/20260922-062510044-recovery-context/quality-report.json"
    - ".agentplane/tasks/202609220557-026YHJ/quality/20260922-062510044-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202609220557-026YHJ/quality/20260922-062510044-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202609220557-026YHJ/blueprint/resolved-snapshot.json"
    - "npm run verify"
  findings:
    - "Concurrent Sfx requests are isolated; HTML defaults, neutral medium ownership, native paste boundary, and static enforcement are covered."
commit: null
comments:
  -
    author: "CODER"
    body: "Start: Implement the approved upstream-aligned dispatcher, style, lifecycle-boundary, static-enforcement, and regression-test changes."
events:
  -
    type: "status"
    at: "2026-09-22T05:58:19.348Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: Implement the approved upstream-aligned dispatcher, style, lifecycle-boundary, static-enforcement, and regression-test changes."
  -
    type: "verify"
    at: "2026-09-22T06:24:04.227Z"
    author: "CODER"
    state: "ok"
    note: "Focused tests passed (45 app tests plus 5 boundary tests). Full npm run verify passed: 74/362 app tests and 34/96 inventory tests at 100% coverage, 11 Playwright tests, build/static/JSDoc/source-tree/provenance/invariants/parity. ap doctor and routing validation passed; git diff --check passed."
  -
    type: "verify"
    at: "2026-09-22T06:25:20.803Z"
    author: "CODER"
    state: "ok"
    note: "verified-202609220557-026YHJ"
doc_version: 3
doc_updated_at: "2026-09-22T06:25:20.879Z"
doc_updated_by: "CODER"
description: "Fix the audited non-P0-1 gaps: concurrent Sfx async dispatch state, HTML-mode Writer style defaults, browser lifecycle ownership, and enforceable module boundaries."
sections:
  Summary: |-
    Close upstream parity implementation gaps

    Fix the audited non-P0-1 gaps: concurrent Sfx async dispatch state, HTML-mode Writer style defaults, browser lifecycle ownership, and enforceable module boundaries.
  Scope: |-
    - In scope: request-scoped concurrent async dispatch state; pinned LibreOffice HTML-mode paragraph style defaults; browser lifecycle adapter ownership; static ownership enforcement and focused regression tests.
    - Expected touched areas: sfx2 dispatch, Writer style construction, Writer/Sfx lifecycle adapters, module-boundary checker, and their tests.
    - Out of scope: P0-1 parity evidence redesign and unrelated Writer features.
  Plan: |-
    1. Derive the async completion/state model from pinned Sfx dispatcher/request ownership and add concurrent same-slot regression tests.
    2. Thread DocumentSettingManager HTML_MODE into source-derived paragraph defaults and cover the supported upstream branches.
    3. Move browser download/storage identities and callbacks behind browser-owned adapters while keeping generic Sfx medium and Writer lifecycle hooks.
    4. Extend ownership checks to reject the audited reverse dependencies and add checker tests.
    5. Run focused tests, npm run verify, Agentplane doctor, and routing validation; record evidence and finish the task.
  Verify Steps: |-
    1. Run focused Vitest suites for Sfx dispatch, style defaults, lifecycle/document I/O, and module-boundary checks. Expected: concurrent same-command completions cannot clear or overwrite newer state; HTML-mode fixtures match the pinned source; browser ports do not enter Sfx/Writer-owned APIs.
    2. Run `npm run verify`. Expected: formatting, lint, typecheck, unit/inventory coverage, Playwright, build, provenance, invariants, and parity checks pass.
    3. Run `ap doctor` and `node .agentplane/policy/check-routing.mjs`. Expected: repository/task routing is healthy.
    4. Run `git status --short --untracked-files=all` and `git diff --check`. Expected: only intentional task files/code are changed and no whitespace errors exist.
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-09-22T06:24:04.227Z — VERIFY — ok

    By: CODER

    Note: Focused tests passed (45 app tests plus 5 boundary tests). Full npm run verify passed: 74/362 app tests and 34/96 inventory tests at 100% coverage, 11 Playwright tests, build/static/JSDoc/source-tree/provenance/invariants/parity. ap doctor and routing validation passed; git diff --check passed.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-22T05:58:19.348Z, excerpt_hash=sha256:882d397316800a9639995825004c3d7c3c7ec3f0b6272fc80650373910a238bd

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609220557-026YHJ/blueprint/resolved-snapshot.json
    - old_digest: 5ebadba77c73c25fb7449a9f0ddc1ccd28952ad243f1886b32fdc28e2b4bbe5a
    - current_digest: 5ebadba77c73c25fb7449a9f0ddc1ccd28952ad243f1886b32fdc28e2b4bbe5a
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202609220557-026YHJ

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane commit 202609220557-026YHJ -m 🧩 026YHJ task: persist canonical task artifacts --allow-tasks
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: true
    - repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
    - risks: none

    ### 2026-09-22T06:25:20.803Z — VERIFY — ok

    By: CODER

    Note: verified-202609220557-026YHJ
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-22T06:24:04.307Z, excerpt_hash=sha256:882d397316800a9639995825004c3d7c3c7ec3f0b6272fc80650373910a238bd

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609220557-026YHJ/blueprint/resolved-snapshot.json
    - old_digest: 5ebadba77c73c25fb7449a9f0ddc1ccd28952ad243f1886b32fdc28e2b4bbe5a
    - current_digest: 5ebadba77c73c25fb7449a9f0ddc1ccd28952ad243f1886b32fdc28e2b4bbe5a
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202609220557-026YHJ

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task complete 202609220557-026YHJ --result verified-202609220557-026YHJ --commit 5879593082af6b31221e8f92fabe36d034af5c20
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: true
    - repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: |-
    - Revert task-related commit(s).
    - Re-run required checks to confirm rollback safety.
  Findings: |-
    - Observation: The dispatcher previously keyed async state only by command id, allowing stale completions to overwrite a newer request.
      Impact: Overlapping executions of one slot could publish incorrect pending/error state despite each SfxRequest completing independently.
      Resolution: Added request generations so every SfxRequest completes, while only the latest execution may publish aggregate command/error state; added all out-of-order fulfillment/rejection cases.
id_source: "generated"
---
## Summary

Close upstream parity implementation gaps

Fix the audited non-P0-1 gaps: concurrent Sfx async dispatch state, HTML-mode Writer style defaults, browser lifecycle ownership, and enforceable module boundaries.

## Scope

- In scope: request-scoped concurrent async dispatch state; pinned LibreOffice HTML-mode paragraph style defaults; browser lifecycle adapter ownership; static ownership enforcement and focused regression tests.
- Expected touched areas: sfx2 dispatch, Writer style construction, Writer/Sfx lifecycle adapters, module-boundary checker, and their tests.
- Out of scope: P0-1 parity evidence redesign and unrelated Writer features.

## Plan

1. Derive the async completion/state model from pinned Sfx dispatcher/request ownership and add concurrent same-slot regression tests.
2. Thread DocumentSettingManager HTML_MODE into source-derived paragraph defaults and cover the supported upstream branches.
3. Move browser download/storage identities and callbacks behind browser-owned adapters while keeping generic Sfx medium and Writer lifecycle hooks.
4. Extend ownership checks to reject the audited reverse dependencies and add checker tests.
5. Run focused tests, npm run verify, Agentplane doctor, and routing validation; record evidence and finish the task.

## Verify Steps

1. Run focused Vitest suites for Sfx dispatch, style defaults, lifecycle/document I/O, and module-boundary checks. Expected: concurrent same-command completions cannot clear or overwrite newer state; HTML-mode fixtures match the pinned source; browser ports do not enter Sfx/Writer-owned APIs.
2. Run `npm run verify`. Expected: formatting, lint, typecheck, unit/inventory coverage, Playwright, build, provenance, invariants, and parity checks pass.
3. Run `ap doctor` and `node .agentplane/policy/check-routing.mjs`. Expected: repository/task routing is healthy.
4. Run `git status --short --untracked-files=all` and `git diff --check`. Expected: only intentional task files/code are changed and no whitespace errors exist.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-09-22T06:24:04.227Z — VERIFY — ok

By: CODER

Note: Focused tests passed (45 app tests plus 5 boundary tests). Full npm run verify passed: 74/362 app tests and 34/96 inventory tests at 100% coverage, 11 Playwright tests, build/static/JSDoc/source-tree/provenance/invariants/parity. ap doctor and routing validation passed; git diff --check passed.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-22T05:58:19.348Z, excerpt_hash=sha256:882d397316800a9639995825004c3d7c3c7ec3f0b6272fc80650373910a238bd

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609220557-026YHJ/blueprint/resolved-snapshot.json
- old_digest: 5ebadba77c73c25fb7449a9f0ddc1ccd28952ad243f1886b32fdc28e2b4bbe5a
- current_digest: 5ebadba77c73c25fb7449a9f0ddc1ccd28952ad243f1886b32fdc28e2b4bbe5a
- route_changed: no
- safe_command: agentplane blueprint snapshot 202609220557-026YHJ

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane commit 202609220557-026YHJ -m 🧩 026YHJ task: persist canonical task artifacts --allow-tasks
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: true
- repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
- risks: none

### 2026-09-22T06:25:20.803Z — VERIFY — ok

By: CODER

Note: verified-202609220557-026YHJ
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-22T06:24:04.307Z, excerpt_hash=sha256:882d397316800a9639995825004c3d7c3c7ec3f0b6272fc80650373910a238bd

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609220557-026YHJ/blueprint/resolved-snapshot.json
- old_digest: 5ebadba77c73c25fb7449a9f0ddc1ccd28952ad243f1886b32fdc28e2b4bbe5a
- current_digest: 5ebadba77c73c25fb7449a9f0ddc1ccd28952ad243f1886b32fdc28e2b4bbe5a
- route_changed: no
- safe_command: agentplane blueprint snapshot 202609220557-026YHJ

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task complete 202609220557-026YHJ --result verified-202609220557-026YHJ --commit 5879593082af6b31221e8f92fabe36d034af5c20
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: true
- repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert task-related commit(s).
- Re-run required checks to confirm rollback safety.

## Findings

- Observation: The dispatcher previously keyed async state only by command id, allowing stale completions to overwrite a newer request.
  Impact: Overlapping executions of one slot could publish incorrect pending/error state despite each SfxRequest completing independently.
  Resolution: Added request generations so every SfxRequest completes, while only the latest execution may publish aggregate command/error state; added all out-of-order fulfillment/rejection cases.
