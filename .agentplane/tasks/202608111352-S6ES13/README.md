---
id: "202608111352-S6ES13"
title: "Make Writer top-level menus open reliably"
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
  updated_at: "2026-08-11T13:53:02.670Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-08-11T13:59:56.683Z"
  updated_by: "REVIEWER"
  note: "Verified Writer menu popup behavior: production browser coverage confirms visible, unclipped File and every other top-level menu; declared fast checks passed."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-08-11T14:00:40.273Z"
  updated_by: "EVALUATOR"
  note: "Visible Writer menu labels now open semantic popups without creating unsupported commands."
  evaluated_sha: "85077ef1cb1d8494805fe10c9e27a929c34e5a07"
  blueprint_digest: "2bf7034f2d0773bb5f04b1c0f2984dcea318f08e0c536210486ce1537d1a7cbb"
  evidence_refs:
    - ".agentplane/tasks/202608111352-S6ES13/README.md"
    - ".agentplane/tasks/202608111352-S6ES13/quality/20260811-140040273-recovery-context/quality-report.json"
    - ".agentplane/tasks/202608111352-S6ES13/quality/20260811-140040273-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202608111352-S6ES13/quality/20260811-140040273-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202608111352-S6ES13/blueprint/resolved-snapshot.json"
    - "85077ef; npm run test:coverage --workspace @vite-office/office; npm run test:e2e"
  findings:
    - "The former overflow clipping root cause is covered by a production CSS regression assertion; documented file-size candidates remain a separate structural follow-up."
commit: null
comments:
  -
    author: "CODER"
    body: "Start: reproduce the Writer menu interaction and make every visible top-level menu affordance open an explicit popup without creating unimplemented commands."
events:
  -
    type: "status"
    at: "2026-08-11T13:53:08.227Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: reproduce the Writer menu interaction and make every visible top-level menu affordance open an explicit popup without creating unimplemented commands."
  -
    type: "verify"
    at: "2026-08-11T13:59:56.683Z"
    author: "REVIEWER"
    state: "ok"
    note: "Verified Writer menu popup behavior: production browser coverage confirms visible, unclipped File and every other top-level menu; declared fast checks passed."
doc_version: 3
doc_updated_at: "2026-08-11T14:00:30.523Z"
doc_updated_by: "CODER"
description: "Fix the Writer menu bar so visible top-level menu triggers respond to clicks in the production browser UI and expose an honest popup for unimplemented command groups without inventing commands."
sections:
  Summary: |-
    Make Writer top-level menus open reliably

    Fix the Writer menu bar so visible top-level menu triggers respond to clicks in the production browser UI and expose an honest popup for unimplemented command groups without inventing commands.
  Scope: |-
    - In scope: Fix the Writer menu bar so visible top-level menu triggers respond to clicks in the production browser UI and expose an honest popup for unimplemented command groups without inventing commands.
    - Out of scope: unrelated refactors not required for "Make Writer top-level menus open reliably".
  Plan: "1. Inspect and reproduce the production menu interaction. 2. Make all visible top-level Writer menu labels semantic popup triggers, preserving implemented commands and using an explicit unavailable state for command groups with no bounded implementation. 3. Add focused unit and production-browser regression coverage, run fast checks, and record the cadence-deferred aggregate checks."
  Verify Steps: "1. Run format, lint, TypeScript, JSDoc, file-size, and office coverage. Expected: all pass with 100 percent office coverage, including the menu trigger state and its unavailable-command fallback. 2. Run targeted production Playwright coverage. Expected: File, Edit, View, Format, Styles, Insert, Table, Tools, Window, and Help each reveal a visible Writer menu after a click; File exposes its implemented storage commands. 3. Run diff, doctor, and policy routing checks. Expected: all pass. 4. Defer static smoke, LibreOffice inventory, and aggregate verify under the user-approved ten-task cadence; record residual risk."
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-08-11T13:59:56.683Z — VERIFY — ok

    By: REVIEWER

    Note: Verified Writer menu popup behavior: production browser coverage confirms visible, unclipped File and every other top-level menu; declared fast checks passed.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-08-11T13:59:56.224Z, excerpt_hash=sha256:f69a0a225379162d23982262279563d9c1e0421a2e893774c0941fc0dd83d368

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202608111352-S6ES13/blueprint/resolved-snapshot.json
    - old_digest: 2bf7034f2d0773bb5f04b1c0f2984dcea318f08e0c536210486ce1537d1a7cbb
    - current_digest: 2bf7034f2d0773bb5f04b1c0f2984dcea318f08e0c536210486ce1537d1a7cbb
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202608111352-S6ES13

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task run 202608111352-S6ES13
    - diagnostic_command: agentplane task run status 202608111352-S6ES13
    - source_of_truth: route=task_next_action diagnostic=runner_status remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: true
    - repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
    - runner_required: true
    - runner_failure_means: runner_infrastructure_or_task_unknown
    - risks: runner_rail_confusion

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: |-
    - Revert task-related commit(s).
    - Re-run required checks to confirm rollback safety.
  Findings: |-
    Implementation commit 85077ef makes every visible Writer menu label a semantic popup trigger. File, Edit, View, Format, and Styles retain bounded commands; Insert, Table, Tools, Window, and Help show an explicit unavailable-command state. The menu bar now uses visible overflow so positioned popups are not clipped below the toolbar.

    Command: npm run test:coverage --workspace @vite-office/office && npm run format:check && npm run lint && npm run typecheck && npm run check:docs && npm run check:file-size && git diff --check
    Result: pass.
    Evidence: 19 test files and 55 tests passed; office statements, branches, functions, and lines are all 100 percent; JSDoc validation passed for 116 authored source files. File-size review reports existing candidates: App.test.tsx (565 lines), WriterWorkbench.tsx (522 lines), and scripts/libreoffice-inventory/contracts.ts (536 lines).
    Scope: Writer top-level menu behavior and local source quality.

    Command: npm run test:e2e
    Result: pass.
    Evidence: production Chromium test passed and asserts File opens with Save, all visible top-level menus open, and the menu bar has visible horizontal overflow so popups cannot be clipped.
    Scope: built Writer browser interaction.

    Command: ap doctor && node .agentplane/policy/check-routing.mjs
    Result: pass.
    Evidence: doctor OK with two existing informational notices; policy routing OK.
    Scope: local AgentPlane configuration and policy.

    Observation: evaluator recording initially stopped because a user-owned staged .gitignore change was outside this task.
    Impact: no implementation or verification result was lost; only evaluator artifact recording was delayed.
    Resolution: temporarily stash only .gitignore, record the evaluator result, then restore its staged state unchanged after task closure.
    Fixability: local.

    Skipped: npm run verify and npm run inventory:validate.
    Reason: the user approved a full aggregate checkpoint after every ten closed feature tasks; the prior Select All task was that checkpoint.
    Risk: static smoke and inventory validation were not rerun for this one-feature increment.
    Approval: user.
id_source: "generated"
---
## Summary

Make Writer top-level menus open reliably

Fix the Writer menu bar so visible top-level menu triggers respond to clicks in the production browser UI and expose an honest popup for unimplemented command groups without inventing commands.

## Scope

- In scope: Fix the Writer menu bar so visible top-level menu triggers respond to clicks in the production browser UI and expose an honest popup for unimplemented command groups without inventing commands.
- Out of scope: unrelated refactors not required for "Make Writer top-level menus open reliably".

## Plan

1. Inspect and reproduce the production menu interaction. 2. Make all visible top-level Writer menu labels semantic popup triggers, preserving implemented commands and using an explicit unavailable state for command groups with no bounded implementation. 3. Add focused unit and production-browser regression coverage, run fast checks, and record the cadence-deferred aggregate checks.

## Verify Steps

1. Run format, lint, TypeScript, JSDoc, file-size, and office coverage. Expected: all pass with 100 percent office coverage, including the menu trigger state and its unavailable-command fallback. 2. Run targeted production Playwright coverage. Expected: File, Edit, View, Format, Styles, Insert, Table, Tools, Window, and Help each reveal a visible Writer menu after a click; File exposes its implemented storage commands. 3. Run diff, doctor, and policy routing checks. Expected: all pass. 4. Defer static smoke, LibreOffice inventory, and aggregate verify under the user-approved ten-task cadence; record residual risk.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-08-11T13:59:56.683Z — VERIFY — ok

By: REVIEWER

Note: Verified Writer menu popup behavior: production browser coverage confirms visible, unclipped File and every other top-level menu; declared fast checks passed.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-08-11T13:59:56.224Z, excerpt_hash=sha256:f69a0a225379162d23982262279563d9c1e0421a2e893774c0941fc0dd83d368

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202608111352-S6ES13/blueprint/resolved-snapshot.json
- old_digest: 2bf7034f2d0773bb5f04b1c0f2984dcea318f08e0c536210486ce1537d1a7cbb
- current_digest: 2bf7034f2d0773bb5f04b1c0f2984dcea318f08e0c536210486ce1537d1a7cbb
- route_changed: no
- safe_command: agentplane blueprint snapshot 202608111352-S6ES13

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task run 202608111352-S6ES13
- diagnostic_command: agentplane task run status 202608111352-S6ES13
- source_of_truth: route=task_next_action diagnostic=runner_status remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: true
- repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
- runner_required: true
- runner_failure_means: runner_infrastructure_or_task_unknown
- risks: runner_rail_confusion

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert task-related commit(s).
- Re-run required checks to confirm rollback safety.

## Findings

Implementation commit 85077ef makes every visible Writer menu label a semantic popup trigger. File, Edit, View, Format, and Styles retain bounded commands; Insert, Table, Tools, Window, and Help show an explicit unavailable-command state. The menu bar now uses visible overflow so positioned popups are not clipped below the toolbar.

Command: npm run test:coverage --workspace @vite-office/office && npm run format:check && npm run lint && npm run typecheck && npm run check:docs && npm run check:file-size && git diff --check
Result: pass.
Evidence: 19 test files and 55 tests passed; office statements, branches, functions, and lines are all 100 percent; JSDoc validation passed for 116 authored source files. File-size review reports existing candidates: App.test.tsx (565 lines), WriterWorkbench.tsx (522 lines), and scripts/libreoffice-inventory/contracts.ts (536 lines).
Scope: Writer top-level menu behavior and local source quality.

Command: npm run test:e2e
Result: pass.
Evidence: production Chromium test passed and asserts File opens with Save, all visible top-level menus open, and the menu bar has visible horizontal overflow so popups cannot be clipped.
Scope: built Writer browser interaction.

Command: ap doctor && node .agentplane/policy/check-routing.mjs
Result: pass.
Evidence: doctor OK with two existing informational notices; policy routing OK.
Scope: local AgentPlane configuration and policy.

Observation: evaluator recording initially stopped because a user-owned staged .gitignore change was outside this task.
Impact: no implementation or verification result was lost; only evaluator artifact recording was delayed.
Resolution: temporarily stash only .gitignore, record the evaluator result, then restore its staged state unchanged after task closure.
Fixability: local.

Skipped: npm run verify and npm run inventory:validate.
Reason: the user approved a full aggregate checkpoint after every ten closed feature tasks; the prior Select All task was that checkpoint.
Risk: static smoke and inventory validation were not rerun for this one-feature increment.
Approval: user.
