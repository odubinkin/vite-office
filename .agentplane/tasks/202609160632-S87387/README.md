---
id: "202609160632-S87387"
title: "Refine Writer submenu hover behavior"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 9
origin:
  system: "manual"
depends_on: []
tags:
  - "frontend"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-09-16T06:39:06.720Z"
  updated_by: "ORCHESTRATOR"
  note: "User approved expansion to update two existing click-based submenu tests."
verification:
  state: "ok"
  updated_at: "2026-09-16T06:47:23.983Z"
  updated_by: "CODER"
  note: "verified-202609160632-S87387"
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-09-16T06:47:36.368Z"
  updated_by: "EVALUATOR"
  note: "Writer menu visual and submenu interactions meet the approved acceptance criteria."
  evaluated_sha: "600a9950fe15222f754510825d8595b9a2e253eb"
  blueprint_digest: "f30abed8000d851299dd7b4811d239318b39e1dc7a57c0389d91ad7ac29853e2"
  evidence_refs:
    - ".agentplane/tasks/202609160632-S87387/README.md"
    - ".agentplane/tasks/202609160632-S87387/quality/20260916-064736368-recovery-context/quality-report.json"
    - ".agentplane/tasks/202609160632-S87387/quality/20260916-064736368-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202609160632-S87387/quality/20260916-064736368-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202609160632-S87387/blueprint/resolved-snapshot.json"
    - "npm run test:coverage --workspace @vite-office/office"
  findings:
    - "The checkmark now inherits the menu default color; nested submenus open on hover, close on leave, do not toggle on mouse click, and retain keyboard access. All affected fixtures and coverage checks pass."
commit: null
comments:
  -
    author: "CODER"
    body: "Start: Remove the blue checkmark override and change nested Writer submenus to hover-open behavior with keyboard support preserved."
events:
  -
    type: "status"
    at: "2026-09-16T06:32:52.295Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: Remove the blue checkmark override and change nested Writer submenus to hover-open behavior with keyboard support preserved."
  -
    type: "verify"
    at: "2026-09-16T06:46:57.389Z"
    author: "CODER"
    state: "ok"
    note: "Verified: checkmarks inherit the menu default color; nested submenus open and close on pointer hover, mouse click does not toggle them, keyboard Enter and ArrowRight remain supported, and all final validation gates pass."
  -
    type: "verify"
    at: "2026-09-16T06:47:23.983Z"
    author: "CODER"
    state: "ok"
    note: "verified-202609160632-S87387"
doc_version: 3
doc_updated_at: "2026-09-16T06:47:24.059Z"
doc_updated_by: "CODER"
description: "Use default checkmark color and make nested Writer menu sections open on hover rather than mouse click while preserving keyboard access."
sections:
  Summary: |-
    Refine Writer submenu hover behavior

    Use default checkmark color and make nested Writer menu sections open on hover rather than mouse click while preserving keyboard access.
  Scope: |-
    - In scope: Use default checkmark color and make nested Writer menu sections open on hover rather than mouse click while preserving keyboard access.
    - Out of scope: unrelated refactors not required for "Refine Writer submenu hover behavior".
  Plan: |-
    Summary: Refine Writer menu visual and submenu interactions.
    Scope: apps/office/src/framework/browser/presentation/CommandMenuBar.tsx, apps/office/src/framework/browser/presentation/CommandMenuBar.test.tsx, apps/office/src/sw/browser/presentation/WriterMenuBar.test.tsx, apps/office/src/framework/browser/app/desktop.test.tsx, and apps/office/src/sw/browser/presentation/writer-view.test.tsx. The last two test files were added after user-approved scope expansion to update existing click-based submenu fixtures.
    Plan: Remove the explicit blue checkmark color so the indicator inherits the menu item's default color; open nested submenus on pointer hover and close them when leaving the submenu region; keep Enter/ArrowRight keyboard opening and make mouse click non-toggling; update all affected regression tests.
    Verify Steps: Run focused CommandMenuBar, WriterMenuBar, desktop, and writer-view tests; run npm run test:coverage --workspace @vite-office/office; run npm run format:check; run npm run lint; run npm run typecheck; run ap doctor; run node .agentplane/policy/check-routing.mjs; inspect final git status and diff.
    Verification: Record exact commands and outcomes after implementation.
    Rollback Plan: Revert only this task's implementation and test changes, preserving unrelated repository history.
    Findings: Scope expanded with user approval to update two existing tests that intentionally exercise submenu opening by click.
  Verify Steps: |-
    PLANNER fallback scaffold for "Refine Writer submenu hover behavior". Replace with task-specific acceptance checks when PLANNER context is available.

    1. Review the requested outcome for "Refine Writer submenu hover behavior". Expected: the visible result matches ## Summary and stays inside approved scope.
    2. Run the most relevant validation step for this task. Expected: it succeeds without unexpected regressions in touched behavior.
    3. Compare the final result against ## Scope and record any residual follow-up in ## Findings. Expected: open edges are explicit rather than implicit.
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-09-16T06:46:57.389Z — VERIFY — ok

    By: CODER

    Note: Verified: checkmarks inherit the menu default color; nested submenus open and close on pointer hover, mouse click does not toggle them, keyboard Enter and ArrowRight remain supported, and all final validation gates pass.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-16T06:39:02.693Z, excerpt_hash=sha256:d419ca4dc58b559e773aa0f0d74fd2f2bb0b45e714f3999beb23da4c2f7f4827

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609160632-S87387/blueprint/resolved-snapshot.json
    - old_digest: f30abed8000d851299dd7b4811d239318b39e1dc7a57c0389d91ad7ac29853e2
    - current_digest: f30abed8000d851299dd7b4811d239318b39e1dc7a57c0389d91ad7ac29853e2
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202609160632-S87387

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202609160632-S87387
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: true
    - repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
    - risks: none

    ### 2026-09-16T06:47:23.983Z — VERIFY — ok

    By: CODER

    Note: verified-202609160632-S87387
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-16T06:46:57.471Z, excerpt_hash=sha256:d419ca4dc58b559e773aa0f0d74fd2f2bb0b45e714f3999beb23da4c2f7f4827

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609160632-S87387/blueprint/resolved-snapshot.json
    - old_digest: f30abed8000d851299dd7b4811d239318b39e1dc7a57c0389d91ad7ac29853e2
    - current_digest: f30abed8000d851299dd7b4811d239318b39e1dc7a57c0389d91ad7ac29853e2
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202609160632-S87387

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task complete 202609160632-S87387 --result verified-202609160632-S87387 --commit 600a9950fe15222f754510825d8595b9a2e253eb
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
    - Observation: Command: npm run test:coverage --workspace @vite-office/office; Result: pass; Evidence: 72 test files and 332 tests passed with 100% statements, branches, functions, and lines; Scope: full office unit/component suite.
      Impact: Command: focused Vitest for CommandMenuBar, WriterMenuBar, desktop, and writer-view; npm run format:check; npm run lint; npm run typecheck; ap doctor; node .agentplane/policy/check-routing.mjs; git diff --check; Result: pass; Evidence: focused 4 files/39 tests passed and every command exited 0; Scope: changed menu source, all affected tests, and repository policy gates.
      Resolution: Removed the explicit blue checkmark class, implemented pointer hover open/leave close for nested submenus, preserved keyboard submenu opening, and updated all click-based submenu fixtures plus the stale workspace class assertion.
id_source: "generated"
---
## Summary

Refine Writer submenu hover behavior

Use default checkmark color and make nested Writer menu sections open on hover rather than mouse click while preserving keyboard access.

## Scope

- In scope: Use default checkmark color and make nested Writer menu sections open on hover rather than mouse click while preserving keyboard access.
- Out of scope: unrelated refactors not required for "Refine Writer submenu hover behavior".

## Plan

Summary: Refine Writer menu visual and submenu interactions.
Scope: apps/office/src/framework/browser/presentation/CommandMenuBar.tsx, apps/office/src/framework/browser/presentation/CommandMenuBar.test.tsx, apps/office/src/sw/browser/presentation/WriterMenuBar.test.tsx, apps/office/src/framework/browser/app/desktop.test.tsx, and apps/office/src/sw/browser/presentation/writer-view.test.tsx. The last two test files were added after user-approved scope expansion to update existing click-based submenu fixtures.
Plan: Remove the explicit blue checkmark color so the indicator inherits the menu item's default color; open nested submenus on pointer hover and close them when leaving the submenu region; keep Enter/ArrowRight keyboard opening and make mouse click non-toggling; update all affected regression tests.
Verify Steps: Run focused CommandMenuBar, WriterMenuBar, desktop, and writer-view tests; run npm run test:coverage --workspace @vite-office/office; run npm run format:check; run npm run lint; run npm run typecheck; run ap doctor; run node .agentplane/policy/check-routing.mjs; inspect final git status and diff.
Verification: Record exact commands and outcomes after implementation.
Rollback Plan: Revert only this task's implementation and test changes, preserving unrelated repository history.
Findings: Scope expanded with user approval to update two existing tests that intentionally exercise submenu opening by click.

## Verify Steps

PLANNER fallback scaffold for "Refine Writer submenu hover behavior". Replace with task-specific acceptance checks when PLANNER context is available.

1. Review the requested outcome for "Refine Writer submenu hover behavior". Expected: the visible result matches ## Summary and stays inside approved scope.
2. Run the most relevant validation step for this task. Expected: it succeeds without unexpected regressions in touched behavior.
3. Compare the final result against ## Scope and record any residual follow-up in ## Findings. Expected: open edges are explicit rather than implicit.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-09-16T06:46:57.389Z — VERIFY — ok

By: CODER

Note: Verified: checkmarks inherit the menu default color; nested submenus open and close on pointer hover, mouse click does not toggle them, keyboard Enter and ArrowRight remain supported, and all final validation gates pass.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-16T06:39:02.693Z, excerpt_hash=sha256:d419ca4dc58b559e773aa0f0d74fd2f2bb0b45e714f3999beb23da4c2f7f4827

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609160632-S87387/blueprint/resolved-snapshot.json
- old_digest: f30abed8000d851299dd7b4811d239318b39e1dc7a57c0389d91ad7ac29853e2
- current_digest: f30abed8000d851299dd7b4811d239318b39e1dc7a57c0389d91ad7ac29853e2
- route_changed: no
- safe_command: agentplane blueprint snapshot 202609160632-S87387

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202609160632-S87387
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: true
- repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
- risks: none

### 2026-09-16T06:47:23.983Z — VERIFY — ok

By: CODER

Note: verified-202609160632-S87387
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-16T06:46:57.471Z, excerpt_hash=sha256:d419ca4dc58b559e773aa0f0d74fd2f2bb0b45e714f3999beb23da4c2f7f4827

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609160632-S87387/blueprint/resolved-snapshot.json
- old_digest: f30abed8000d851299dd7b4811d239318b39e1dc7a57c0389d91ad7ac29853e2
- current_digest: f30abed8000d851299dd7b4811d239318b39e1dc7a57c0389d91ad7ac29853e2
- route_changed: no
- safe_command: agentplane blueprint snapshot 202609160632-S87387

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task complete 202609160632-S87387 --result verified-202609160632-S87387 --commit 600a9950fe15222f754510825d8595b9a2e253eb
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

- Observation: Command: npm run test:coverage --workspace @vite-office/office; Result: pass; Evidence: 72 test files and 332 tests passed with 100% statements, branches, functions, and lines; Scope: full office unit/component suite.
  Impact: Command: focused Vitest for CommandMenuBar, WriterMenuBar, desktop, and writer-view; npm run format:check; npm run lint; npm run typecheck; ap doctor; node .agentplane/policy/check-routing.mjs; git diff --check; Result: pass; Evidence: focused 4 files/39 tests passed and every command exited 0; Scope: changed menu source, all affected tests, and repository policy gates.
  Resolution: Removed the explicit blue checkmark class, implemented pointer hover open/leave close for nested submenus, preserved keyboard submenu opening, and updated all click-based submenu fixtures plus the stale workspace class assertion.
