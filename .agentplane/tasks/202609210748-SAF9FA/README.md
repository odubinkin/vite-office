---
id: "202609210748-SAF9FA"
title: "Restore Writer parity verification gates"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 15
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
  - "frontend"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-09-21T07:52:09.667Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-09-21T08:25:44.369Z"
  updated_by: "CODER"
  note: "All declared verification steps passed; retained selection, persistent toolbar, and editable title behavior are covered without runtime semantic changes."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-09-21T08:26:29.458Z"
  updated_by: "EVALUATOR"
  note: "Writer parity verification gates restored without changing user-confirmed behavior."
  evaluated_sha: "4eab0108b30a8442bce66ffb224d1f52e5ba63f5"
  blueprint_digest: "9fef1ecffede5b150b821b62fb5df49d5f6fc631b9ad903652cb1350af527901"
  evidence_refs:
    - ".agentplane/tasks/202609210748-SAF9FA/README.md"
    - ".agentplane/tasks/202609210748-SAF9FA/quality/20260921-082629458-recovery-context/quality-report.json"
    - ".agentplane/tasks/202609210748-SAF9FA/quality/20260921-082629458-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202609210748-SAF9FA/quality/20260921-082629458-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202609210748-SAF9FA/blueprint/resolved-snapshot.json"
    - "npm run verify"
  findings:
    - "Runtime inventory, full coverage, E2E, documentation, and repository verification all pass."
commit: null
comments:
  -
    author: "CODER"
    body: "Start: restore Writer verification gates while preserving approved selection, toolbar, and title behavior."
events:
  -
    type: "status"
    at: "2026-09-21T07:52:21.819Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: restore Writer verification gates while preserving approved selection, toolbar, and title behavior."
  -
    type: "verify"
    at: "2026-09-21T08:25:44.369Z"
    author: "CODER"
    state: "ok"
    note: "All declared verification steps passed; retained selection, persistent toolbar, and editable title behavior are covered without runtime semantic changes."
doc_version: 3
doc_updated_at: "2026-09-21T08:25:44.439Z"
doc_updated_by: "CODER"
description: "Update Writer indent inventory and coverage plus stale E2E assertions while preserving current upstream-correct selection, persistent formatting toolbar, and editable document title behavior."
sections:
  Summary: "Restore the current Writer verification contract without changing the user-approved upstream behavior: paragraph-boundary Shift+ArrowLeft, persistent formatting controls, and editable document title."
  Scope: "In scope: runtime/provenance inventory for wrtsh-indent; missing indent branch coverage; E2E locators and assertions made consistent with the retained behavior. Out of scope: changing selection semantics, context-switching the formatting toolbar, removing title editing, broad parity architecture refactors, or changing the pinned baseline."
  Plan: "1. Register the indent module in semantic runtime inventory and source provenance. 2. Add focused tests for uncovered indent branches. 3. Update Playwright assertions and locators while preserving production behavior. 4. Run targeted and complete repository verification and record evidence."
  Verify Steps: "1. npm run inventory:parity - strict runtime inventory includes every production module. 2. npm run test:coverage - all office tests pass at 100 percent global coverage. 3. npm run test:inventory:coverage - inventory tests pass at 100 percent coverage. 4. npm run test:e2e - Writer selection, menus, persistent toolbar, clipboard, hyperlinks, and ODT flows pass in Chromium. 5. npm run verify - complete repository verification succeeds. 6. node .agentplane/policy/check-routing.mjs, ap doctor, git diff --check, and git status --short --untracked-files=all pass."
  Verification: |-
    PASS. npm run inventory:parity completed with 136 runtime modules and zero semantic violations. npm run test:coverage passed 341 tests with 100 percent statements, branches, functions, and lines. npm run test:inventory:coverage passed 91 tests with 100 percent coverage. npm run test:e2e passed 11 Chromium scenarios. npm run verify passed end to end, including formatting, lint, typecheck, module boundaries, resources, static build, docs, file size, source tree, provenance, invariants, and parity inventory. Policy routing, ap doctor, and git diff --check passed.

    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-09-21T08:25:44.369Z — VERIFY — ok

    By: CODER

    Note: All declared verification steps passed; retained selection, persistent toolbar, and editable title behavior are covered without runtime semantic changes.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-21T08:25:38.870Z, excerpt_hash=sha256:3f5b4c21531e5dd983bbe03b042fbd0d048d42d70759dfd8cbed0fb88c947e6e

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609210748-SAF9FA/blueprint/resolved-snapshot.json
    - old_digest: 9fef1ecffede5b150b821b62fb5df49d5f6fc631b9ad903652cb1350af527901
    - current_digest: 9fef1ecffede5b150b821b62fb5df49d5f6fc631b9ad903652cb1350af527901
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202609210748-SAF9FA

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202609210748-SAF9FA
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: true
    - repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert only this task inventory, tests, and task artifacts. Re-run npm run verify to confirm the previous state; no persisted document schema or production behavior changes are introduced."
  Findings: "Resolved the review findings without altering the user-confirmed upstream behavior. Registered wrtsh-indent in runtime inventory and source provenance; covered paragraph indentation, persistence, undo, recovery and error branches; made Playwright locators deterministic; aligned list assertions with the persistent formatting toolbar; retained editable title behavior; and completed missing JSDoc required by repository enforcement."
id_source: "generated"
---
## Summary

Restore the current Writer verification contract without changing the user-approved upstream behavior: paragraph-boundary Shift+ArrowLeft, persistent formatting controls, and editable document title.

## Scope

In scope: runtime/provenance inventory for wrtsh-indent; missing indent branch coverage; E2E locators and assertions made consistent with the retained behavior. Out of scope: changing selection semantics, context-switching the formatting toolbar, removing title editing, broad parity architecture refactors, or changing the pinned baseline.

## Plan

1. Register the indent module in semantic runtime inventory and source provenance. 2. Add focused tests for uncovered indent branches. 3. Update Playwright assertions and locators while preserving production behavior. 4. Run targeted and complete repository verification and record evidence.

## Verify Steps

1. npm run inventory:parity - strict runtime inventory includes every production module. 2. npm run test:coverage - all office tests pass at 100 percent global coverage. 3. npm run test:inventory:coverage - inventory tests pass at 100 percent coverage. 4. npm run test:e2e - Writer selection, menus, persistent toolbar, clipboard, hyperlinks, and ODT flows pass in Chromium. 5. npm run verify - complete repository verification succeeds. 6. node .agentplane/policy/check-routing.mjs, ap doctor, git diff --check, and git status --short --untracked-files=all pass.

## Verification

PASS. npm run inventory:parity completed with 136 runtime modules and zero semantic violations. npm run test:coverage passed 341 tests with 100 percent statements, branches, functions, and lines. npm run test:inventory:coverage passed 91 tests with 100 percent coverage. npm run test:e2e passed 11 Chromium scenarios. npm run verify passed end to end, including formatting, lint, typecheck, module boundaries, resources, static build, docs, file size, source tree, provenance, invariants, and parity inventory. Policy routing, ap doctor, and git diff --check passed.

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-09-21T08:25:44.369Z — VERIFY — ok

By: CODER

Note: All declared verification steps passed; retained selection, persistent toolbar, and editable title behavior are covered without runtime semantic changes.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-21T08:25:38.870Z, excerpt_hash=sha256:3f5b4c21531e5dd983bbe03b042fbd0d048d42d70759dfd8cbed0fb88c947e6e

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609210748-SAF9FA/blueprint/resolved-snapshot.json
- old_digest: 9fef1ecffede5b150b821b62fb5df49d5f6fc631b9ad903652cb1350af527901
- current_digest: 9fef1ecffede5b150b821b62fb5df49d5f6fc631b9ad903652cb1350af527901
- route_changed: no
- safe_command: agentplane blueprint snapshot 202609210748-SAF9FA

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202609210748-SAF9FA
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: true
- repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert only this task inventory, tests, and task artifacts. Re-run npm run verify to confirm the previous state; no persisted document schema or production behavior changes are introduced.

## Findings

Resolved the review findings without altering the user-confirmed upstream behavior. Registered wrtsh-indent in runtime inventory and source provenance; covered paragraph indentation, persistence, undo, recovery and error branches; made Playwright locators deterministic; aligned list assertions with the persistent formatting toolbar; retained editable title behavior; and completed missing JSDoc required by repository enforcement.
