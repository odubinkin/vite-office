---
id: "202611191658-DF16KS"
title: "Polish Writer and Calc browser controls and document opening"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 5
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-11-19T16:58:56.120Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-11-19T17:18:13.992Z"
  updated_by: "CODER"
  note: "Passed the production build, 155 focused unit checks, and 59 distinct browser scenarios across Writer and Calc."
  attempts: 0
commit: null
comments:
  -
    author: "CODER"
    body: "Start: Refine shared Writer and Calc browser controls and show progress while opening documents."
events:
  -
    type: "status"
    at: "2026-11-19T16:59:00.483Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: Refine shared Writer and Calc browser controls and show progress while opening documents."
  -
    type: "verify"
    at: "2026-11-19T17:18:13.992Z"
    author: "CODER"
    state: "ok"
    note: "Passed the production build, 155 focused unit checks, and 59 distinct browser scenarios across Writer and Calc."
doc_version: 3
doc_updated_at: "2026-11-19T17:18:14.043Z"
doc_updated_by: "CODER"
description: "Remove unavailable launcher controls, stabilize font lists, tighten toolbar spacing, hide unavailable commands, improve menu checkmark spacing, show immediate tooltips and indicate document-opening progress in Writer and Calc."
sections:
  Summary: "Polish the integrated browser office launcher, Writer and Calc controls, and the document-opening experience."
  Scope: "Launcher chrome, browser presentation and file-opening workflow, and relevant local regression tests. Keep generated resources and native command semantics intact."
  Plan: |-
    1. Remove placeholder launcher chrome and size the shared font popup independently of preview rows.
    2. Compact toolbars, filter disconnected commands while retaining implemented commands with context-dependent availability, space menu checkmarks, and show immediate tooltips.
    3. Present opening progress for browser-stored and imported documents through completion, errors and filename collisions.
    4. Verify and close the local task.
  Verify Steps: |-
    1. Run `npm run build` and `git diff --check`. Expected: build succeeds and no whitespace errors.
    2. Run built-app Playwright launcher, shared and Writer/Calc browser-chrome cases plus relevant file-opening cases. Expected: launcher has no search/help placeholders, font width stays stable during scrolling in both editors, compact controls and immediate tooltips are visible, unavailable items are hidden while implemented controls remain, checkmarks are spaced, and opening progress appears and clears.
    3. Run focused unit tests for changed presentation components and existing combobox behavior. Expected: no regressions within the changed scope.
  Verification: |-
    Pending implementation.

    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-11-19T17:18:13.992Z — VERIFY — ok

    By: CODER

    Note: Passed the production build, 155 focused unit checks, and 59 distinct browser scenarios across Writer and Calc.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-11-19T16:59:00.483Z, excerpt_hash=sha256:2d02ab6385c92bd9e218c46a2fec2a57e00dc48761f55bded9784b017a7ca536

    Details:

    Command: npm run build && git diff --check
    Result: pass
    Evidence: TypeScript and Vite production build completed, and git reported no whitespace errors.
    Scope: Final browser application and changed paths.

    Command: ./node_modules/.bin/playwright test --config apps/office/.playwright-DF16KS.config.ts --reporter=list 'shared/(launcher|font-name-preview|font-mru|icon-tooltips|opening-progress|menubar-pointer|menubar-overflow)\.spec\.ts' 'calc/(standard-toolbar|formatting-toolbar|sheet-context-menu|font-family|font-size|csv|document-io-responsive|xlsx-text)\.spec\.ts' 'writer-(menu-alignment|native-disabled-menubar|character-formatting|font-name-focus|odt-file|docx-links|responsive-sidebar|numbering-toolbar|ruler-tab-glyphs)\.spec\.ts'
    Command: ./node_modules/.bin/playwright test --config apps/office/.playwright-DF16KS.config.ts --project shared --reporter=list apps/office/e2e/shared/menubar-overflow.spec.ts
    Result: pass across 59 distinct final cases
    Evidence: 58 cases passed in the broad run. The extra Calc width case reached the menu actions and revealed the existing 320px canvas minimum. The final menubar file rerun passed all five cases with overflow tested at 320px. The temporary config selected installed Chrome and used 127.0.0.1:43173 because the bundled browser was absent and the default port was occupied.
    Scope: Launcher, stable font popup widths, compact controls, immediate help, command visibility, spaced menu checkmarks, successful import and reopen, name collisions, opening errors, mobile overflow and large Calc document responsiveness.

    Command: ../../node_modules/.bin/vitest run --maxWorkers 2 src/framework/browser/app/desktop.test.tsx src/vcl/browser/ComboBox.test.tsx src/framework/browser/presentation/CommandMenuBar src/framework/browser/presentation/CommandToolbar.test.tsx src/sc/browser/presentation/calc-presenters.test.tsx src/sw/browser/presentation/WriterCommandToolbar.test.tsx src/sfx2/browser/presentation/SidebarDeck
    Result: pass
    Evidence: 155 tests passed in 15 files from apps/office.
    Scope: Launcher routing, editable comboboxes, menu and toolbar presentation, Calc formula controls, Writer sidebar.

    Command: npm run check:docs && npm run check:dependencies && node scripts/check-static-build.mjs
    Result: pass
    Evidence: JSDoc, module boundaries and static bundle smoke passed. ESLint and Prettier passed for changed source and test files.
    Scope: Repository contracts and final static artifact.

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202611191658-DF16KS/blueprint/resolved-snapshot.json
    - old_digest: 223bf989e8cfce945c0e3da8bb8985c625929e1ad4da62d71e1a10dff2647a54
    - current_digest: 223bf989e8cfce945c0e3da8bb8985c625929e1ad4da62d71e1a10dff2647a54
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202611191658-DF16KS

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202611191658-DF16KS
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: false
    - repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert the implementation commit to restore the original browser presentation and opening flow."
  Findings: "None at intake."
id_source: "generated"
---
## Summary

Polish the integrated browser office launcher, Writer and Calc controls, and the document-opening experience.

## Scope

Launcher chrome, browser presentation and file-opening workflow, and relevant local regression tests. Keep generated resources and native command semantics intact.

## Plan

1. Remove placeholder launcher chrome and size the shared font popup independently of preview rows.
2. Compact toolbars, filter disconnected commands while retaining implemented commands with context-dependent availability, space menu checkmarks, and show immediate tooltips.
3. Present opening progress for browser-stored and imported documents through completion, errors and filename collisions.
4. Verify and close the local task.

## Verify Steps

1. Run `npm run build` and `git diff --check`. Expected: build succeeds and no whitespace errors.
2. Run built-app Playwright launcher, shared and Writer/Calc browser-chrome cases plus relevant file-opening cases. Expected: launcher has no search/help placeholders, font width stays stable during scrolling in both editors, compact controls and immediate tooltips are visible, unavailable items are hidden while implemented controls remain, checkmarks are spaced, and opening progress appears and clears.
3. Run focused unit tests for changed presentation components and existing combobox behavior. Expected: no regressions within the changed scope.

## Verification

Pending implementation.

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-11-19T17:18:13.992Z — VERIFY — ok

By: CODER

Note: Passed the production build, 155 focused unit checks, and 59 distinct browser scenarios across Writer and Calc.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-11-19T16:59:00.483Z, excerpt_hash=sha256:2d02ab6385c92bd9e218c46a2fec2a57e00dc48761f55bded9784b017a7ca536

Details:

Command: npm run build && git diff --check
Result: pass
Evidence: TypeScript and Vite production build completed, and git reported no whitespace errors.
Scope: Final browser application and changed paths.

Command: ./node_modules/.bin/playwright test --config apps/office/.playwright-DF16KS.config.ts --reporter=list 'shared/(launcher|font-name-preview|font-mru|icon-tooltips|opening-progress|menubar-pointer|menubar-overflow)\.spec\.ts' 'calc/(standard-toolbar|formatting-toolbar|sheet-context-menu|font-family|font-size|csv|document-io-responsive|xlsx-text)\.spec\.ts' 'writer-(menu-alignment|native-disabled-menubar|character-formatting|font-name-focus|odt-file|docx-links|responsive-sidebar|numbering-toolbar|ruler-tab-glyphs)\.spec\.ts'
Command: ./node_modules/.bin/playwright test --config apps/office/.playwright-DF16KS.config.ts --project shared --reporter=list apps/office/e2e/shared/menubar-overflow.spec.ts
Result: pass across 59 distinct final cases
Evidence: 58 cases passed in the broad run. The extra Calc width case reached the menu actions and revealed the existing 320px canvas minimum. The final menubar file rerun passed all five cases with overflow tested at 320px. The temporary config selected installed Chrome and used 127.0.0.1:43173 because the bundled browser was absent and the default port was occupied.
Scope: Launcher, stable font popup widths, compact controls, immediate help, command visibility, spaced menu checkmarks, successful import and reopen, name collisions, opening errors, mobile overflow and large Calc document responsiveness.

Command: ../../node_modules/.bin/vitest run --maxWorkers 2 src/framework/browser/app/desktop.test.tsx src/vcl/browser/ComboBox.test.tsx src/framework/browser/presentation/CommandMenuBar src/framework/browser/presentation/CommandToolbar.test.tsx src/sc/browser/presentation/calc-presenters.test.tsx src/sw/browser/presentation/WriterCommandToolbar.test.tsx src/sfx2/browser/presentation/SidebarDeck
Result: pass
Evidence: 155 tests passed in 15 files from apps/office.
Scope: Launcher routing, editable comboboxes, menu and toolbar presentation, Calc formula controls, Writer sidebar.

Command: npm run check:docs && npm run check:dependencies && node scripts/check-static-build.mjs
Result: pass
Evidence: JSDoc, module boundaries and static bundle smoke passed. ESLint and Prettier passed for changed source and test files.
Scope: Repository contracts and final static artifact.

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202611191658-DF16KS/blueprint/resolved-snapshot.json
- old_digest: 223bf989e8cfce945c0e3da8bb8985c625929e1ad4da62d71e1a10dff2647a54
- current_digest: 223bf989e8cfce945c0e3da8bb8985c625929e1ad4da62d71e1a10dff2647a54
- route_changed: no
- safe_command: agentplane blueprint snapshot 202611191658-DF16KS

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202611191658-DF16KS
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: false
- repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert the implementation commit to restore the original browser presentation and opening flow.

## Findings

None at intake.
