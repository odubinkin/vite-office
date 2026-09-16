---
id: "202609160514-JAQVE4"
title: "Fix Writer menu hover and checkmarks"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 7
origin:
  system: "manual"
depends_on: []
tags:
  - "frontend"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-09-16T05:14:41.364Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-09-16T05:25:33.446Z"
  updated_by: "CODER"
  note: "verified-202609160514-JAQVE4"
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-09-16T05:25:45.193Z"
  updated_by: "EVALUATOR"
  note: "Menu interaction and visibility indicators meet the approved acceptance criteria."
  evaluated_sha: "6814dc5fceb53ecaf2a84f542a8fc77db565ac8e"
  blueprint_digest: "56266e4a33c9f390a4a20b966c1e839781b27b19ef63b2f62c334cc9e0955c20"
  evidence_refs:
    - ".agentplane/tasks/202609160514-JAQVE4/README.md"
    - ".agentplane/tasks/202609160514-JAQVE4/quality/20260916-052545193-recovery-context/quality-report.json"
    - ".agentplane/tasks/202609160514-JAQVE4/quality/20260916-052545193-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202609160514-JAQVE4/quality/20260916-052545193-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202609160514-JAQVE4/blueprint/resolved-snapshot.json"
    - "npm run test:coverage --workspace @vite-office/office"
  findings:
    - "CommandMenuBar switches between top-level menus on hover only after one menu is open and renders a left checkmark for checked check/radio commands; tests and static gates pass."
commit: null
comments:
  -
    author: "CODER"
    body: "Start: Implement hover switching for open Writer top-level menus and visible checkmarks for checked menu commands within the approved menubar scope."
events:
  -
    type: "status"
    at: "2026-09-16T05:14:47.079Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: Implement hover switching for open Writer top-level menus and visible checkmarks for checked menu commands within the approved menubar scope."
  -
    type: "verify"
    at: "2026-09-16T05:24:41.339Z"
    author: "CODER"
    state: "ok"
    note: "Verified: top-level menus switch on hover after opening, checkable menu commands show a left checkmark only when checked, and all final validation gates pass."
  -
    type: "verify"
    at: "2026-09-16T05:25:33.446Z"
    author: "CODER"
    state: "ok"
    note: "verified-202609160514-JAQVE4"
doc_version: 3
doc_updated_at: "2026-09-16T05:25:33.520Z"
doc_updated_by: "CODER"
description: "Make Writer top-level menus switch on hover while a menu is open, and render left-side checkmarks for enabled View visibility commands."
sections:
  Summary: |-
    Fix Writer menu hover and checkmarks

    Make Writer top-level menus switch on hover while a menu is open, and render left-side checkmarks for enabled View visibility commands.
  Scope: |-
    - In scope: Make Writer top-level menus switch on hover while a menu is open, and render left-side checkmarks for enabled View visibility commands.
    - Out of scope: unrelated refactors not required for "Fix Writer menu hover and checkmarks".
  Plan: |-
    Summary: Fix Writer menu interaction and visibility indicators.
    Scope: apps/office/src/framework/browser/presentation/CommandMenuBar.tsx and CommandMenuBar.test.tsx; do not alter unrelated existing task artifacts.
    Plan: Add hover switching between top-level menus only while a menu is open; add a stable left indicator slot with a checkmark for checked check/radio commands; add regression tests for hover switching and checked/unchecked rendering.
    Verify Steps: Run the focused CommandMenuBar and WriterMenuBar tests; run npm run format:check; run npm run lint; run npm run typecheck; run agentplane doctor; run node .agentplane/policy/check-routing.mjs; inspect final git status and diff.
    Verification: Record exact commands and outcomes after implementation.
    Rollback Plan: Revert only the implementation/test changes from this task, preserving pre-existing task README changes.
    Findings: None at planning time.
  Verify Steps: |-
    PLANNER fallback scaffold for "Fix Writer menu hover and checkmarks". Replace with task-specific acceptance checks when PLANNER context is available.

    1. Review the requested outcome for "Fix Writer menu hover and checkmarks". Expected: the visible result matches ## Summary and stays inside approved scope.
    2. Run the most relevant validation step for this task. Expected: it succeeds without unexpected regressions in touched behavior.
    3. Compare the final result against ## Scope and record any residual follow-up in ## Findings. Expected: open edges are explicit rather than implicit.
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-09-16T05:24:41.339Z — VERIFY — ok

    By: CODER

    Note: Verified: top-level menus switch on hover after opening, checkable menu commands show a left checkmark only when checked, and all final validation gates pass.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-16T05:14:47.079Z, excerpt_hash=sha256:58f00a5e80e34f34c6fd8fe48662aaf3226e5125dd1f98e2c11481a43133ee6a

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609160514-JAQVE4/blueprint/resolved-snapshot.json
    - old_digest: 56266e4a33c9f390a4a20b966c1e839781b27b19ef63b2f62c334cc9e0955c20
    - current_digest: 56266e4a33c9f390a4a20b966c1e839781b27b19ef63b2f62c334cc9e0955c20
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202609160514-JAQVE4

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202609160514-JAQVE4
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: true
    - repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
    - risks: none

    ### 2026-09-16T05:25:33.446Z — VERIFY — ok

    By: CODER

    Note: verified-202609160514-JAQVE4
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-16T05:24:41.419Z, excerpt_hash=sha256:58f00a5e80e34f34c6fd8fe48662aaf3226e5125dd1f98e2c11481a43133ee6a

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609160514-JAQVE4/blueprint/resolved-snapshot.json
    - old_digest: 56266e4a33c9f390a4a20b966c1e839781b27b19ef63b2f62c334cc9e0955c20
    - current_digest: 56266e4a33c9f390a4a20b966c1e839781b27b19ef63b2f62c334cc9e0955c20
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202609160514-JAQVE4

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task complete 202609160514-JAQVE4 --result verified-202609160514-JAQVE4 --commit 6814dc5fceb53ecaf2a84f542a8fc77db565ac8e
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
    - Observation: Command: npm run test:coverage --workspace @vite-office/office; Result: pass; Evidence: 72 test files and 330 tests passed with 100% statements, branches, functions, and lines; Scope: full office unit/component suite.
      Impact: Command: focused Vitest, npm run format:check, npm run lint, npm run typecheck, ap doctor, node .agentplane/policy/check-routing.mjs, git diff --check; Result: pass; Evidence: focused 2 files/10 tests passed and all commands exited 0; Scope: changed menubar source/tests and repository policy gates.
      Resolution: Implemented hover switching and checkmark rendering in CommandMenuBar; added generic regression coverage for closed/open/same/neighbor hover states and checked/unchecked indicators.
id_source: "generated"
---
## Summary

Fix Writer menu hover and checkmarks

Make Writer top-level menus switch on hover while a menu is open, and render left-side checkmarks for enabled View visibility commands.

## Scope

- In scope: Make Writer top-level menus switch on hover while a menu is open, and render left-side checkmarks for enabled View visibility commands.
- Out of scope: unrelated refactors not required for "Fix Writer menu hover and checkmarks".

## Plan

Summary: Fix Writer menu interaction and visibility indicators.
Scope: apps/office/src/framework/browser/presentation/CommandMenuBar.tsx and CommandMenuBar.test.tsx; do not alter unrelated existing task artifacts.
Plan: Add hover switching between top-level menus only while a menu is open; add a stable left indicator slot with a checkmark for checked check/radio commands; add regression tests for hover switching and checked/unchecked rendering.
Verify Steps: Run the focused CommandMenuBar and WriterMenuBar tests; run npm run format:check; run npm run lint; run npm run typecheck; run agentplane doctor; run node .agentplane/policy/check-routing.mjs; inspect final git status and diff.
Verification: Record exact commands and outcomes after implementation.
Rollback Plan: Revert only the implementation/test changes from this task, preserving pre-existing task README changes.
Findings: None at planning time.

## Verify Steps

PLANNER fallback scaffold for "Fix Writer menu hover and checkmarks". Replace with task-specific acceptance checks when PLANNER context is available.

1. Review the requested outcome for "Fix Writer menu hover and checkmarks". Expected: the visible result matches ## Summary and stays inside approved scope.
2. Run the most relevant validation step for this task. Expected: it succeeds without unexpected regressions in touched behavior.
3. Compare the final result against ## Scope and record any residual follow-up in ## Findings. Expected: open edges are explicit rather than implicit.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-09-16T05:24:41.339Z — VERIFY — ok

By: CODER

Note: Verified: top-level menus switch on hover after opening, checkable menu commands show a left checkmark only when checked, and all final validation gates pass.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-16T05:14:47.079Z, excerpt_hash=sha256:58f00a5e80e34f34c6fd8fe48662aaf3226e5125dd1f98e2c11481a43133ee6a

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609160514-JAQVE4/blueprint/resolved-snapshot.json
- old_digest: 56266e4a33c9f390a4a20b966c1e839781b27b19ef63b2f62c334cc9e0955c20
- current_digest: 56266e4a33c9f390a4a20b966c1e839781b27b19ef63b2f62c334cc9e0955c20
- route_changed: no
- safe_command: agentplane blueprint snapshot 202609160514-JAQVE4

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202609160514-JAQVE4
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: true
- repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
- risks: none

### 2026-09-16T05:25:33.446Z — VERIFY — ok

By: CODER

Note: verified-202609160514-JAQVE4
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-16T05:24:41.419Z, excerpt_hash=sha256:58f00a5e80e34f34c6fd8fe48662aaf3226e5125dd1f98e2c11481a43133ee6a

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609160514-JAQVE4/blueprint/resolved-snapshot.json
- old_digest: 56266e4a33c9f390a4a20b966c1e839781b27b19ef63b2f62c334cc9e0955c20
- current_digest: 56266e4a33c9f390a4a20b966c1e839781b27b19ef63b2f62c334cc9e0955c20
- route_changed: no
- safe_command: agentplane blueprint snapshot 202609160514-JAQVE4

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task complete 202609160514-JAQVE4 --result verified-202609160514-JAQVE4 --commit 6814dc5fceb53ecaf2a84f542a8fc77db565ac8e
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

- Observation: Command: npm run test:coverage --workspace @vite-office/office; Result: pass; Evidence: 72 test files and 330 tests passed with 100% statements, branches, functions, and lines; Scope: full office unit/component suite.
  Impact: Command: focused Vitest, npm run format:check, npm run lint, npm run typecheck, ap doctor, node .agentplane/policy/check-routing.mjs, git diff --check; Result: pass; Evidence: focused 2 files/10 tests passed and all commands exited 0; Scope: changed menubar source/tests and repository policy gates.
  Resolution: Implemented hover switching and checkmark rendering in CommandMenuBar; added generic regression coverage for closed/open/same/neighbor hover states and checked/unchecked indicators.
