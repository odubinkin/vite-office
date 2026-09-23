---
id: "202609231616-YXHG1W"
title: "Unify Writer UI command presentation and responsive sidebar"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 13
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-09-23T16:16:55.239Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-09-23T16:28:27.701Z"
  updated_by: "CODER"
  note: "verified-202609231616-YXHG1W"
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-09-23T16:28:40.584Z"
  updated_by: "EVALUATOR"
  note: "Section 5 implementation matches approved UI scope and declared checks pass."
  evaluated_sha: "44215ea64d3da6fe97b155ed4c7d03f51fa5477c"
  blueprint_digest: "989aaa81f8c62f93b1de2b8db4930aa5bd6013977bd518b21158bba386f8566e"
  evidence_refs:
    - ".agentplane/tasks/202609231616-YXHG1W/README.md"
    - ".agentplane/tasks/202609231616-YXHG1W/quality/20260923-162840584-recovery-context/quality-report.json"
    - ".agentplane/tasks/202609231616-YXHG1W/quality/20260923-162840584-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202609231616-YXHG1W/quality/20260923-162840584-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202609231616-YXHG1W/blueprint/resolved-snapshot.json"
    - "apps/office/src/sw/browser/presentation/writer-command-presentation.ts"
    - "apps/office/e2e/writer-responsive-sidebar.spec.ts"
    - "npx vitest run: 27 focused tests passed"
  findings:
    - "Generated Writer resources and Sfx bindings now feed shared presentation selectors; narrow sidebar follows command state and remains keyboard reachable."
commit: null
comments:
  -
    author: "CODER"
    body: "Start: Implementing approved Writer UI presentation selector and responsive sidebar, preserving generated resource and Sfx binding ownership."
events:
  -
    type: "status"
    at: "2026-09-23T16:17:00.066Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: Implementing approved Writer UI presentation selector and responsive sidebar, preserving generated resource and Sfx binding ownership."
  -
    type: "verify"
    at: "2026-09-23T16:27:36.219Z"
    author: "CODER"
    state: "ok"
    note: "Declared Writer UI checks passed: focused unit tests, TypeScript, lint, formatting, build, responsive and foundation Chromium tests, generated resources, module/source-tree checks, doctor, and routing. Optional global coverage threshold remains below 100% only in untouched modules; recorded in task Findings."
  -
    type: "verify"
    at: "2026-09-23T16:28:27.701Z"
    author: "CODER"
    state: "ok"
    note: "verified-202609231616-YXHG1W"
doc_version: 3
doc_updated_at: "2026-09-23T16:28:27.785Z"
doc_updated_by: "CODER"
description: "Implement confirmed section 5 of upstream parity plan using generated Writer resources and Sfx bindings; keep title shell-owned and sidebar reachable on narrow viewports."
sections:
  Summary: |-
    Unify Writer UI command presentation and responsive sidebar

    Implement confirmed section 5 of upstream parity plan using generated Writer resources and Sfx bindings; keep title shell-owned and sidebar reachable on narrow viewports.
  Scope: "Section 5 (U) only: Writer browser presentation selector; menu, toolbar, properties consumers; responsive sidebar; title projection; focused tests. No document model migration or inventory changes."
  Plan: "1. Keep SwDocShell as title owner and generated Writer UI resources as command metadata owner. 2. Add one Writer browser presentation selector backed by generated resources, localization, and Sfx bindings; share it across menu, standard toolbar, formatting toolbar, and properties controls. 3. Render visible sidebar on narrow viewports while preserving checked state. 4. Add focused responsive, accessibility, localization, and command parity tests; run relevant checks and record results."
  Verify Steps: "1. Run focused Writer presentation tests, including narrow viewport/sidebar, keyboard/focus, locale, and command parity. 2. Run npm run typecheck, npm run lint, and npm run format:check. 3. Run relevant integration/e2e UI checks and confirm generated resources remain unchanged. 4. Run ap doctor and node .agentplane/policy/check-routing.mjs; inspect final git status."
  Verification: |-
    Command: npx vitest run (five focused suites). Result: pass. Evidence: 27/27 tests; Writer menu, editor, resource selector, and generic controls. Scope: command parity, locale fallback, keyboard/focus.
    Command: npm run typecheck --workspace @vite-office/office && npm run lint && npm run format:check. Result: pass. Evidence: TypeScript, ESLint, and Prettier exit 0. Scope: changed implementation and tests.
    Command: npm run build --workspace @vite-office/office && npx playwright test --config apps/office/playwright.config.ts apps/office/e2e/foundation.spec.ts apps/office/e2e/writer-responsive-sidebar.spec.ts. Result: pass. Evidence: build and 2/2 Chromium tests, including a touch viewport and axe check. Scope: real browser UI, sidebar state/reachability, keyboard and accessibility.
    Command: npm run check:writer-resources && npm run check:dependencies && npm run check:source-tree && ap doctor && node .agentplane/policy/check-routing.mjs. Result: pass. Evidence: generated resources unchanged, boundaries/source tree valid, doctor OK with existing warnings, routing OK. Scope: resource ownership and repository policy.

    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-09-23T16:27:36.219Z — VERIFY — ok

    By: CODER

    Note: Declared Writer UI checks passed: focused unit tests, TypeScript, lint, formatting, build, responsive and foundation Chromium tests, generated resources, module/source-tree checks, doctor, and routing. Optional global coverage threshold remains below 100% only in untouched modules; recorded in task Findings.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-23T16:26:36.834Z, excerpt_hash=sha256:57b60e17d8a0c3bb62311d433b97c4080b011a1b9834db1b45230eec8262b223

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609231616-YXHG1W/blueprint/resolved-snapshot.json
    - old_digest: 989aaa81f8c62f93b1de2b8db4930aa5bd6013977bd518b21158bba386f8566e
    - current_digest: 989aaa81f8c62f93b1de2b8db4930aa5bd6013977bd518b21158bba386f8566e
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202609231616-YXHG1W

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202609231616-YXHG1W
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: false
    - repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
    - risks: none

    ### 2026-09-23T16:28:27.701Z — VERIFY — ok

    By: CODER

    Note: verified-202609231616-YXHG1W
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-23T16:28:09.018Z, excerpt_hash=sha256:57b60e17d8a0c3bb62311d433b97c4080b011a1b9834db1b45230eec8262b223

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609231616-YXHG1W/blueprint/resolved-snapshot.json
    - old_digest: 989aaa81f8c62f93b1de2b8db4930aa5bd6013977bd518b21158bba386f8566e
    - current_digest: 989aaa81f8c62f93b1de2b8db4930aa5bd6013977bd518b21158bba386f8566e
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202609231616-YXHG1W

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task complete 202609231616-YXHG1W --result verified-202609231616-YXHG1W --commit 44215ea64d3da6fe97b155ed4c7d03f51fa5477c
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: true
    - repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert the task implementation and tests through the traceable commit; no persisted document schema changes are planned."
  Findings: "Optional full coverage run: all 398 tests in 94 files passed, but npm run test:coverage exited 1 because the repository-wide 100% threshold is unmet (99.68% lines, 99.4% branches). The report lists uncovered lines only in untouched model/layout/XML modules. This task did not change those modules; no coverage threshold or test policy was altered. ap doctor reported an older managed hook shim and an older DONE-task commit warning; doctor still exited 0. First ap commit attempt failed subject validation before creating a commit; the staged paths were inspected and the subject was corrected to the required task format."
id_source: "generated"
---
## Summary

Unify Writer UI command presentation and responsive sidebar

Implement confirmed section 5 of upstream parity plan using generated Writer resources and Sfx bindings; keep title shell-owned and sidebar reachable on narrow viewports.

## Scope

Section 5 (U) only: Writer browser presentation selector; menu, toolbar, properties consumers; responsive sidebar; title projection; focused tests. No document model migration or inventory changes.

## Plan

1. Keep SwDocShell as title owner and generated Writer UI resources as command metadata owner. 2. Add one Writer browser presentation selector backed by generated resources, localization, and Sfx bindings; share it across menu, standard toolbar, formatting toolbar, and properties controls. 3. Render visible sidebar on narrow viewports while preserving checked state. 4. Add focused responsive, accessibility, localization, and command parity tests; run relevant checks and record results.

## Verify Steps

1. Run focused Writer presentation tests, including narrow viewport/sidebar, keyboard/focus, locale, and command parity. 2. Run npm run typecheck, npm run lint, and npm run format:check. 3. Run relevant integration/e2e UI checks and confirm generated resources remain unchanged. 4. Run ap doctor and node .agentplane/policy/check-routing.mjs; inspect final git status.

## Verification

Command: npx vitest run (five focused suites). Result: pass. Evidence: 27/27 tests; Writer menu, editor, resource selector, and generic controls. Scope: command parity, locale fallback, keyboard/focus.
Command: npm run typecheck --workspace @vite-office/office && npm run lint && npm run format:check. Result: pass. Evidence: TypeScript, ESLint, and Prettier exit 0. Scope: changed implementation and tests.
Command: npm run build --workspace @vite-office/office && npx playwright test --config apps/office/playwright.config.ts apps/office/e2e/foundation.spec.ts apps/office/e2e/writer-responsive-sidebar.spec.ts. Result: pass. Evidence: build and 2/2 Chromium tests, including a touch viewport and axe check. Scope: real browser UI, sidebar state/reachability, keyboard and accessibility.
Command: npm run check:writer-resources && npm run check:dependencies && npm run check:source-tree && ap doctor && node .agentplane/policy/check-routing.mjs. Result: pass. Evidence: generated resources unchanged, boundaries/source tree valid, doctor OK with existing warnings, routing OK. Scope: resource ownership and repository policy.

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-09-23T16:27:36.219Z — VERIFY — ok

By: CODER

Note: Declared Writer UI checks passed: focused unit tests, TypeScript, lint, formatting, build, responsive and foundation Chromium tests, generated resources, module/source-tree checks, doctor, and routing. Optional global coverage threshold remains below 100% only in untouched modules; recorded in task Findings.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-23T16:26:36.834Z, excerpt_hash=sha256:57b60e17d8a0c3bb62311d433b97c4080b011a1b9834db1b45230eec8262b223

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609231616-YXHG1W/blueprint/resolved-snapshot.json
- old_digest: 989aaa81f8c62f93b1de2b8db4930aa5bd6013977bd518b21158bba386f8566e
- current_digest: 989aaa81f8c62f93b1de2b8db4930aa5bd6013977bd518b21158bba386f8566e
- route_changed: no
- safe_command: agentplane blueprint snapshot 202609231616-YXHG1W

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202609231616-YXHG1W
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: false
- repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
- risks: none

### 2026-09-23T16:28:27.701Z — VERIFY — ok

By: CODER

Note: verified-202609231616-YXHG1W
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-23T16:28:09.018Z, excerpt_hash=sha256:57b60e17d8a0c3bb62311d433b97c4080b011a1b9834db1b45230eec8262b223

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609231616-YXHG1W/blueprint/resolved-snapshot.json
- old_digest: 989aaa81f8c62f93b1de2b8db4930aa5bd6013977bd518b21158bba386f8566e
- current_digest: 989aaa81f8c62f93b1de2b8db4930aa5bd6013977bd518b21158bba386f8566e
- route_changed: no
- safe_command: agentplane blueprint snapshot 202609231616-YXHG1W

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task complete 202609231616-YXHG1W --result verified-202609231616-YXHG1W --commit 44215ea64d3da6fe97b155ed4c7d03f51fa5477c
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: true
- repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert the task implementation and tests through the traceable commit; no persisted document schema changes are planned.

## Findings

Optional full coverage run: all 398 tests in 94 files passed, but npm run test:coverage exited 1 because the repository-wide 100% threshold is unmet (99.68% lines, 99.4% branches). The report lists uncovered lines only in untouched model/layout/XML modules. This task did not change those modules; no coverage threshold or test policy was altered. ap doctor reported an older managed hook shim and an older DONE-task commit warning; doctor still exited 0. First ap commit attempt failed subject validation before creating a commit; the staged paths were inspected and the subject was corrected to the required task format.
