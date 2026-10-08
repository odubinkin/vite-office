---
id: "202610080730-HA9KH9"
title: "Keep Writer dialog chrome fixed with independent content scrolling"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 16
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-08T07:31:10.582Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-10-08T07:48:36.162Z"
  updated_by: "TESTER"
  note: "Verified stationary dialog chrome, independent tab/body scroll ownership, visible scrollbar screenshots and keyboard/wheel reachability across three viewports; 43 component tests and 10 final browser scenarios pass, with all declared quality checks passing."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-10-08T07:48:55.235Z"
  updated_by: "EVALUATOR"
  note: "Stationary Writer dialog chrome and independent scroll surfaces satisfy approved scope with complete declared verification."
  evaluated_sha: "7b8890de9985d33591cd70db64cdb27ea628958f"
  blueprint_digest: "763bbae93436df68a4bd4061857ba54635f437817c7a52b34224eee4fd5c3d2a"
  evidence_refs:
    - ".agentplane/tasks/202610080730-HA9KH9/README.md"
    - ".agentplane/tasks/202610080730-HA9KH9/quality/20261008-074855235-recovery-context/quality-report.json"
    - ".agentplane/tasks/202610080730-HA9KH9/quality/20261008-074855235-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202610080730-HA9KH9/quality/20261008-074855235-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202610080730-HA9KH9/blueprint/resolved-snapshot.json"
    - "apps/office/e2e/writer-dialog-layout.spec.ts"
    - "apps/office/e2e/writer-responsive-sidebar.spec.ts"
  findings:
    - "Reviewed CSS flex/clip constraints, nested form ownership, responsive tablist isolation and native callback preservation. Browser assertions and screenshots verify independent scrolling and visible tracks; no remaining actionable findings in scoped diff."
commit: null
comments:
  -
    author: "CODER"
    body: "Start: implement approved stationary modal chrome and independent visible body and navigation scrolling."
events:
  -
    type: "status"
    at: "2026-10-08T07:31:15.587Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implement approved stationary modal chrome and independent visible body and navigation scrolling."
  -
    type: "verify"
    at: "2026-10-08T07:48:36.162Z"
    author: "TESTER"
    state: "ok"
    note: "Verified stationary dialog chrome, independent tab/body scroll ownership, visible scrollbar screenshots and keyboard/wheel reachability across three viewports; 43 component tests and 10 final browser scenarios pass, with all declared quality checks passing."
doc_version: 3
doc_updated_at: "2026-10-08T07:48:36.406Z"
doc_updated_by: "CODER"
description: "Follow-up to shared Writer modal styling: keep title/close and action bars visible, independently scroll content and tab navigation, expose visible scrollbars, and verify actual responsive geometry without changing dialog behavior."
sections:
  Summary: "Keep Writer dialog headings, close controls and action bars stationary while only the body scrolls. Keep tab navigation independent from tab-page scrolling with visible scroll affordances."
  Scope: "Shared Writer modal CSS and header; WriterFileDialog, WriterNameCollisionPanel and rename collision integration where nested forms require explicit layout; Paragraph and Table Properties navigation/page containers; existing dialog geometry tests and focused scroll regression coverage. Preserve command, validation, persistence and responsive behavior. No network, outside-repository access, dependencies or unrelated task changes."
  Plan: "1. Constrain modal to a non-scrolling flex column with fixed header/footer and visible body scrollbars. 2. Isolate tab navigation and tab pages, retaining independent responsive scrolling. 3. Adapt nested file/collision surfaces without behavior changes. 4. Add browser scroll regressions, execute declared checks, record evidence and close with intentional commits."
  Verify Steps: "Run npm run typecheck, npm run build, npm run check:docs, npm run check:dependencies, npm run check:file-size, npm run check:source-tree and npm run check:source-provenance. Run changed-file ESLint and Prettier checks, git diff --check, focused component tests and writer-dialog-layout.spec.ts plus row-height, hyperlinks and responsive-sidebar e2e regressions. Extend browser geometry coverage at 1280x800, 390x600 and 640x360 to verify unchanged header/footer/tablist bounds while content scrollTop changes; independently overflow a tablist in a controlled test fixture and verify its own scrolling; assert visible scrollbar track/thumb styling and keyboard reachability. Inspect representative tall-dialog screenshots. Run ap doctor and node .agentplane/policy/check-routing.mjs; record results and final clean git status."
  Verification: |-
    Command: npm run typecheck; npm run build
    Result: pass.
    Evidence: tools/application TypeScript passed; production bundle built successfully. Existing large-chunk warning only.
    Scope: final Writer dialog code and application build.

    Command: ../../node_modules/.bin/vitest run src/sw/browser/presentation/WriterFileDialog.test.tsx src/sw/browser/presentation/WriterHyperlinkDialog.test.tsx src/sw/browser/presentation/WriterPageStyleDialog.test.tsx src/sw/browser/presentation/WriterTableDialog.test.tsx src/sw/browser/presentation/native-insert-table-dialog.test.tsx src/sw/browser/presentation/native-row-height-dialog.test.tsx src/sw/browser/presentation/WriterAdvancedFormattingControls.test.tsx src/sw/browser/presentation/WriterUpstreamQuickControls.test.tsx src/sw/browser/presentation/writer-view-title-collision.test.tsx --maxWorkers 1
    Result: pass.
    Evidence: 9 files, 43 tests passed from apps/office working directory.
    Scope: existing dialog workflows, native callbacks and title collision actions.

    Command: ./node_modules/.bin/playwright test --config apps/office/playwright.config.ts apps/office/e2e/writer-dialog-layout.spec.ts apps/office/e2e/writer-responsive-sidebar.spec.ts apps/office/e2e/writer-native-row-height-dialog.spec.ts apps/office/e2e/writer-hyperlinks.spec.ts --workers 1
    Result: pass.
    Evidence: final ordered production-build run passed all 10 tests (1.5m). Layout suite covers 20 dialog/tab states at 1280x800, 390x600 and 640x360. Actual wheel and keyboard focus leave header/footer/navigation stationary, stress tablists scroll independently, controls remain reachable, scrollbar track/thumb contrast is checked. Visually inspected paragraph-wheel-scrolled and page-style-scrolled PNGs in test-results/e2e.
    Scope: Chromium responsive modal geometry, shared styles, scroll ownership and surrounding workflows.

    Command: npm run check:docs; npm run check:dependencies; npm run check:file-size; npm run check:source-tree; npm run check:source-provenance
    Result: pass.
    Evidence: 976 authored source documentation checks; 304 runtime sources/1429 imports/25 cross-module edges; 979 authored files; 114 required paths/33 retired roots; 305 provenance modules. Existing file-size decomposition candidates only.
    Scope: repository implementation quality gates.

    Command: changed-file ESLint --max-warnings 0 and Prettier --check; git diff --check; node scripts/check-static-build.mjs
    Result: pass.
    Evidence: all eight changed source/test files checked, formatting and whitespace clean; static build smoke passed with relative assets and no backend endpoints.
    Scope: final task diff and deployable build.

    Command: ap doctor; node .agentplane/policy/check-routing.mjs
    Result: pass.
    Evidence: doctor errors=0 with two preexisting warnings (managed shim readiness and unrelated historical DONE task hash); policy routing OK.
    Scope: workflow health and required evaluator checks.

    Final clean Git state is confirmed after closure; only intentional task-scoped code and task artifacts are committed. No required checks skipped.

    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-10-08T07:48:36.162Z — VERIFY — ok

    By: TESTER

    Note: Verified stationary dialog chrome, independent tab/body scroll ownership, visible scrollbar screenshots and keyboard/wheel reachability across three viewports; 43 component tests and 10 final browser scenarios pass, with all declared quality checks passing.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-08T07:48:34.936Z, excerpt_hash=sha256:98d2b62190d6c82a3abb0869310d4eb816df871b4cf59f90a2ef5243b405472a

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202610080730-HA9KH9/blueprint/resolved-snapshot.json
    - old_digest: 763bbae93436df68a4bd4061857ba54635f437817c7a52b34224eee4fd5c3d2a
    - current_digest: 763bbae93436df68a4bd4061857ba54635f437817c7a52b34224eee4fd5c3d2a
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202610080730-HA9KH9

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202610080730-HA9KH9
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: false
    - repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert only this task implementation commit using a separately approved rollback if necessary; leave prior dialog styling and unrelated task artifacts unchanged."
  Findings: "Eight scoped code/test files changed, with no native command/storage changes. Initial raced-build browser run and overloaded parallel async component lookup were replaced by ordered build-before-browser verification and a single-worker component suite (43 passing tests). Browser fixtures compare fixed bounds after stress-tab insertion, isolating scroll from intrinsic resizing. Keyboard focus exposed programmatic scrolling of overflow:hidden ancestors; modal chrome and non-scrolling wrappers now use overflow:clip. Responsive-sidebar regression now requires independent body scrolling rather than the obsolete panel-wide scroll contract. Four nested test callbacks received required JSDoc; final documentation and lint checks pass. Chromium omits --hide-scrollbars for screenshot evidence. Destructive replacement retains its red action styling. No external writes or outside-repository access; Safari/Firefox execution and full native parity are not claimed."
id_source: "generated"
---
## Summary

Keep Writer dialog headings, close controls and action bars stationary while only the body scrolls. Keep tab navigation independent from tab-page scrolling with visible scroll affordances.

## Scope

Shared Writer modal CSS and header; WriterFileDialog, WriterNameCollisionPanel and rename collision integration where nested forms require explicit layout; Paragraph and Table Properties navigation/page containers; existing dialog geometry tests and focused scroll regression coverage. Preserve command, validation, persistence and responsive behavior. No network, outside-repository access, dependencies or unrelated task changes.

## Plan

1. Constrain modal to a non-scrolling flex column with fixed header/footer and visible body scrollbars. 2. Isolate tab navigation and tab pages, retaining independent responsive scrolling. 3. Adapt nested file/collision surfaces without behavior changes. 4. Add browser scroll regressions, execute declared checks, record evidence and close with intentional commits.

## Verify Steps

Run npm run typecheck, npm run build, npm run check:docs, npm run check:dependencies, npm run check:file-size, npm run check:source-tree and npm run check:source-provenance. Run changed-file ESLint and Prettier checks, git diff --check, focused component tests and writer-dialog-layout.spec.ts plus row-height, hyperlinks and responsive-sidebar e2e regressions. Extend browser geometry coverage at 1280x800, 390x600 and 640x360 to verify unchanged header/footer/tablist bounds while content scrollTop changes; independently overflow a tablist in a controlled test fixture and verify its own scrolling; assert visible scrollbar track/thumb styling and keyboard reachability. Inspect representative tall-dialog screenshots. Run ap doctor and node .agentplane/policy/check-routing.mjs; record results and final clean git status.

## Verification

Command: npm run typecheck; npm run build
Result: pass.
Evidence: tools/application TypeScript passed; production bundle built successfully. Existing large-chunk warning only.
Scope: final Writer dialog code and application build.

Command: ../../node_modules/.bin/vitest run src/sw/browser/presentation/WriterFileDialog.test.tsx src/sw/browser/presentation/WriterHyperlinkDialog.test.tsx src/sw/browser/presentation/WriterPageStyleDialog.test.tsx src/sw/browser/presentation/WriterTableDialog.test.tsx src/sw/browser/presentation/native-insert-table-dialog.test.tsx src/sw/browser/presentation/native-row-height-dialog.test.tsx src/sw/browser/presentation/WriterAdvancedFormattingControls.test.tsx src/sw/browser/presentation/WriterUpstreamQuickControls.test.tsx src/sw/browser/presentation/writer-view-title-collision.test.tsx --maxWorkers 1
Result: pass.
Evidence: 9 files, 43 tests passed from apps/office working directory.
Scope: existing dialog workflows, native callbacks and title collision actions.

Command: ./node_modules/.bin/playwright test --config apps/office/playwright.config.ts apps/office/e2e/writer-dialog-layout.spec.ts apps/office/e2e/writer-responsive-sidebar.spec.ts apps/office/e2e/writer-native-row-height-dialog.spec.ts apps/office/e2e/writer-hyperlinks.spec.ts --workers 1
Result: pass.
Evidence: final ordered production-build run passed all 10 tests (1.5m). Layout suite covers 20 dialog/tab states at 1280x800, 390x600 and 640x360. Actual wheel and keyboard focus leave header/footer/navigation stationary, stress tablists scroll independently, controls remain reachable, scrollbar track/thumb contrast is checked. Visually inspected paragraph-wheel-scrolled and page-style-scrolled PNGs in test-results/e2e.
Scope: Chromium responsive modal geometry, shared styles, scroll ownership and surrounding workflows.

Command: npm run check:docs; npm run check:dependencies; npm run check:file-size; npm run check:source-tree; npm run check:source-provenance
Result: pass.
Evidence: 976 authored source documentation checks; 304 runtime sources/1429 imports/25 cross-module edges; 979 authored files; 114 required paths/33 retired roots; 305 provenance modules. Existing file-size decomposition candidates only.
Scope: repository implementation quality gates.

Command: changed-file ESLint --max-warnings 0 and Prettier --check; git diff --check; node scripts/check-static-build.mjs
Result: pass.
Evidence: all eight changed source/test files checked, formatting and whitespace clean; static build smoke passed with relative assets and no backend endpoints.
Scope: final task diff and deployable build.

Command: ap doctor; node .agentplane/policy/check-routing.mjs
Result: pass.
Evidence: doctor errors=0 with two preexisting warnings (managed shim readiness and unrelated historical DONE task hash); policy routing OK.
Scope: workflow health and required evaluator checks.

Final clean Git state is confirmed after closure; only intentional task-scoped code and task artifacts are committed. No required checks skipped.

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-10-08T07:48:36.162Z — VERIFY — ok

By: TESTER

Note: Verified stationary dialog chrome, independent tab/body scroll ownership, visible scrollbar screenshots and keyboard/wheel reachability across three viewports; 43 component tests and 10 final browser scenarios pass, with all declared quality checks passing.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-08T07:48:34.936Z, excerpt_hash=sha256:98d2b62190d6c82a3abb0869310d4eb816df871b4cf59f90a2ef5243b405472a

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202610080730-HA9KH9/blueprint/resolved-snapshot.json
- old_digest: 763bbae93436df68a4bd4061857ba54635f437817c7a52b34224eee4fd5c3d2a
- current_digest: 763bbae93436df68a4bd4061857ba54635f437817c7a52b34224eee4fd5c3d2a
- route_changed: no
- safe_command: agentplane blueprint snapshot 202610080730-HA9KH9

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202610080730-HA9KH9
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: false
- repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert only this task implementation commit using a separately approved rollback if necessary; leave prior dialog styling and unrelated task artifacts unchanged.

## Findings

Eight scoped code/test files changed, with no native command/storage changes. Initial raced-build browser run and overloaded parallel async component lookup were replaced by ordered build-before-browser verification and a single-worker component suite (43 passing tests). Browser fixtures compare fixed bounds after stress-tab insertion, isolating scroll from intrinsic resizing. Keyboard focus exposed programmatic scrolling of overflow:hidden ancestors; modal chrome and non-scrolling wrappers now use overflow:clip. Responsive-sidebar regression now requires independent body scrolling rather than the obsolete panel-wide scroll contract. Four nested test callbacks received required JSDoc; final documentation and lint checks pass. Chromium omits --hide-scrollbars for screenshot evidence. Destructive replacement retains its red action styling. No external writes or outside-repository access; Safari/Firefox execution and full native parity are not claimed.
