---
id: "202609090539-29Q2X6"
title: "Route office suites to dedicated pages"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 16
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
  - "frontend"
verify:
  - "npm run test:coverage --workspace @vite-office/office"
  - "npm run lint -- --quiet apps/office/src/framework/source/services/desktop.tsx apps/office/src/framework/source/services/SuiteCard.tsx apps/office/src/framework/source/services/desktop.test.tsx apps/office/src/framework/source/services/bootstrap.test.tsx apps/office/e2e/foundation.spec.ts apps/office/e2e/writer-clipboard.spec.ts apps/office/e2e/writer-character-formatting.spec.ts apps/office/e2e/writer-odt-file.spec.ts apps/office/e2e/writer-lists.spec.ts apps/office/e2e/writer-document-selection.spec.ts apps/office/e2e/writer-cut-paste.spec.ts"
  - "npm run typecheck --workspace @vite-office/office"
  - "npm run build --workspace @vite-office/office"
  - "npm run test:e2e"
plan_approval:
  state: "approved"
  updated_at: "2026-09-09T05:46:23.625Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-09-09T06:00:21.420Z"
  updated_by: "CODER"
  note: "verified-202609090539-29Q2X6"
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-09-09T06:00:03.068Z"
  updated_by: "EVALUATOR"
  note: "Dedicated suite routes satisfy the approved launcher and full-page workspace contract."
  evaluated_sha: "4aa6c2092c145f1149068acba4224f1f545fe034"
  blueprint_digest: "cada93cc42b4f7ae173fa144f87a7e9ffdafbea08f98ef520ed1f632f8347efb"
  evidence_refs:
    - ".agentplane/tasks/202609090539-29Q2X6/README.md"
    - ".agentplane/tasks/202609090539-29Q2X6/quality/20260909-060003068-recovery-context/quality-report.json"
    - ".agentplane/tasks/202609090539-29Q2X6/quality/20260909-060003068-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202609090539-29Q2X6/quality/20260909-060003068-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202609090539-29Q2X6/blueprint/resolved-snapshot.json"
  findings:
    - "Root renders only the global header and suite links; /writer renders only Writer in main#workspace; other known suite paths render their full-page foundation interfaces; unit and E2E regressions are covered."
commit: null
comments:
  -
    author: "CODER"
    body: "Start: Implement the approved pathname routing and route-focused UI tests while preserving all unrelated active Writer task changes."
events:
  -
    type: "status"
    at: "2026-09-09T05:41:29.926Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: Implement the approved pathname routing and route-focused UI tests while preserving all unrelated active Writer task changes."
  -
    type: "verify"
    at: "2026-09-09T05:59:13.858Z"
    author: "CODER"
    state: "ok"
    note: "Command: npm run test:coverage --workspace @vite-office/office. Result: pass after updating two additional Desktop-integrated Writer test setups; 42 files and 167 tests passed with 100% statements, branches, functions, and lines. Command: declared affected-file lint. Result: pass with no errors. Command: npm run typecheck --workspace @vite-office/office. Result: pass. Command: npm run build --workspace @vite-office/office. Result: pass; Vite built 1861 modules. Command: npm run test:e2e. Result: pass; 8 Chromium scenarios including root launcher, /writer, /calc, keyboard routing, and axe. Command: git diff --check and git status --short --untracked-files=all. Result: pass; no whitespace errors or unintended artifacts. Additional evidence: Prettier check, JSDoc check, file-size check, policy routing, Agentplane doctor, and visual screenshots of /, /writer, and /calc all passed."
  -
    type: "verify"
    at: "2026-09-09T06:00:21.420Z"
    author: "CODER"
    state: "ok"
    note: "verified-202609090539-29Q2X6"
doc_version: 3
doc_updated_at: "2026-09-09T06:00:21.501Z"
doc_updated_by: "CODER"
description: "Show only the application menu and disabled global header on the home page, and render each office suite on its own pathname with the selected application interface filling main#workspace."
sections:
  Summary: |-
    Route office suites to dedicated pages

    Show only the application menu and disabled global header on the home page, and render each office suite on its own pathname with the selected application interface filling main#workspace.
  Scope: |-
    - In scope: pathname-based pages for /, /writer, /calc, /impress, /draw, /base, /math, and /chart; home header and suite menu; full-page main#workspace on suite pages; unknown-path fallback; affected unit and Playwright E2E tests.
    - Out of scope: implementing new editor capabilities, adding router dependencies, modifying unrelated Writer internals, or deployment rewrite configuration.
    - Existing edits from task 202609090458-TRG4A7 remain preserved; any overlapping E2E file is staged only for the routing hunk.
  Plan: "Implement dependency-free pathname routing so the root page contains only the disabled global header and suite launcher, while each known suite path renders only its full-page main#workspace. Reuse the existing Writer workbench and foundation placeholders, update route-aware unit and E2E tests, and preserve unrelated active-task changes through hunk-scoped staging."
  Verify Steps: |-
    1. Run `npm run test:coverage --workspace @vite-office/office`. Expected: all office unit tests pass and coverage remains at configured 100% thresholds.
    2. Run `npm run lint -- --quiet apps/office/src/framework/source/services/desktop.tsx apps/office/src/framework/source/services/SuiteCard.tsx apps/office/src/framework/source/services/desktop.test.tsx apps/office/src/framework/source/services/bootstrap.test.tsx apps/office/e2e/foundation.spec.ts apps/office/e2e/writer-clipboard.spec.ts apps/office/e2e/writer-character-formatting.spec.ts apps/office/e2e/writer-odt-file.spec.ts apps/office/e2e/writer-lists.spec.ts apps/office/e2e/writer-document-selection.spec.ts apps/office/e2e/writer-cut-paste.spec.ts`. Expected: no lint errors in changed implementation and tests.
    3. Run `npm run typecheck --workspace @vite-office/office`. Expected: TypeScript reports no errors.
    4. Run `npm run build --workspace @vite-office/office`. Expected: the production bundle builds successfully.
    5. Run `npm run test:e2e`. Expected: the launcher, dedicated routes, and existing Writer browser scenarios pass.
    6. Inspect `git diff --check`, staged diff, and `git status --short --untracked-files=all`. Expected: no whitespace errors and only intended task hunks are staged; pre-existing active-task changes remain unstaged.
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-09-09T05:59:13.858Z — VERIFY — ok

    By: CODER

    Note: Command: npm run test:coverage --workspace @vite-office/office. Result: pass after updating two additional Desktop-integrated Writer test setups; 42 files and 167 tests passed with 100% statements, branches, functions, and lines. Command: declared affected-file lint. Result: pass with no errors. Command: npm run typecheck --workspace @vite-office/office. Result: pass. Command: npm run build --workspace @vite-office/office. Result: pass; Vite built 1861 modules. Command: npm run test:e2e. Result: pass; 8 Chromium scenarios including root launcher, /writer, /calc, keyboard routing, and axe. Command: git diff --check and git status --short --untracked-files=all. Result: pass; no whitespace errors or unintended artifacts. Additional evidence: Prettier check, JSDoc check, file-size check, policy routing, Agentplane doctor, and visual screenshots of /, /writer, and /calc all passed.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-09T05:46:15.968Z, excerpt_hash=sha256:0254acccff0e87d462e12305e3e285e5af85278fe7e961efd089170d23283a65

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609090539-29Q2X6/blueprint/resolved-snapshot.json
    - old_digest: cada93cc42b4f7ae173fa144f87a7e9ffdafbea08f98ef520ed1f632f8347efb
    - current_digest: cada93cc42b4f7ae173fa144f87a7e9ffdafbea08f98ef520ed1f632f8347efb
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202609090539-29Q2X6

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202609090539-29Q2X6
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: true
    - repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
    - risks: none

    ### 2026-09-09T06:00:21.420Z — VERIFY — ok

    By: CODER

    Note: verified-202609090539-29Q2X6
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-09T05:59:13.942Z, excerpt_hash=sha256:0254acccff0e87d462e12305e3e285e5af85278fe7e961efd089170d23283a65

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609090539-29Q2X6/blueprint/resolved-snapshot.json
    - old_digest: cada93cc42b4f7ae173fa144f87a7e9ffdafbea08f98ef520ed1f632f8347efb
    - current_digest: cada93cc42b4f7ae173fa144f87a7e9ffdafbea08f98ef520ed1f632f8347efb
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202609090539-29Q2X6

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task complete 202609090539-29Q2X6 --result verified-202609090539-29Q2X6 --commit 4aa6c2092c145f1149068acba4224f1f545fe034
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: true
    - repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert only the task commit that changes the desktop routing, launcher card navigation, and their tests; then rerun the declared office checks. Preserve all pre-existing Writer edits from task 202609090458-TRG4A7."
  Findings: ""
id_source: "generated"
---
## Summary

Route office suites to dedicated pages

Show only the application menu and disabled global header on the home page, and render each office suite on its own pathname with the selected application interface filling main#workspace.

## Scope

- In scope: pathname-based pages for /, /writer, /calc, /impress, /draw, /base, /math, and /chart; home header and suite menu; full-page main#workspace on suite pages; unknown-path fallback; affected unit and Playwright E2E tests.
- Out of scope: implementing new editor capabilities, adding router dependencies, modifying unrelated Writer internals, or deployment rewrite configuration.
- Existing edits from task 202609090458-TRG4A7 remain preserved; any overlapping E2E file is staged only for the routing hunk.

## Plan

Implement dependency-free pathname routing so the root page contains only the disabled global header and suite launcher, while each known suite path renders only its full-page main#workspace. Reuse the existing Writer workbench and foundation placeholders, update route-aware unit and E2E tests, and preserve unrelated active-task changes through hunk-scoped staging.

## Verify Steps

1. Run `npm run test:coverage --workspace @vite-office/office`. Expected: all office unit tests pass and coverage remains at configured 100% thresholds.
2. Run `npm run lint -- --quiet apps/office/src/framework/source/services/desktop.tsx apps/office/src/framework/source/services/SuiteCard.tsx apps/office/src/framework/source/services/desktop.test.tsx apps/office/src/framework/source/services/bootstrap.test.tsx apps/office/e2e/foundation.spec.ts apps/office/e2e/writer-clipboard.spec.ts apps/office/e2e/writer-character-formatting.spec.ts apps/office/e2e/writer-odt-file.spec.ts apps/office/e2e/writer-lists.spec.ts apps/office/e2e/writer-document-selection.spec.ts apps/office/e2e/writer-cut-paste.spec.ts`. Expected: no lint errors in changed implementation and tests.
3. Run `npm run typecheck --workspace @vite-office/office`. Expected: TypeScript reports no errors.
4. Run `npm run build --workspace @vite-office/office`. Expected: the production bundle builds successfully.
5. Run `npm run test:e2e`. Expected: the launcher, dedicated routes, and existing Writer browser scenarios pass.
6. Inspect `git diff --check`, staged diff, and `git status --short --untracked-files=all`. Expected: no whitespace errors and only intended task hunks are staged; pre-existing active-task changes remain unstaged.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-09-09T05:59:13.858Z — VERIFY — ok

By: CODER

Note: Command: npm run test:coverage --workspace @vite-office/office. Result: pass after updating two additional Desktop-integrated Writer test setups; 42 files and 167 tests passed with 100% statements, branches, functions, and lines. Command: declared affected-file lint. Result: pass with no errors. Command: npm run typecheck --workspace @vite-office/office. Result: pass. Command: npm run build --workspace @vite-office/office. Result: pass; Vite built 1861 modules. Command: npm run test:e2e. Result: pass; 8 Chromium scenarios including root launcher, /writer, /calc, keyboard routing, and axe. Command: git diff --check and git status --short --untracked-files=all. Result: pass; no whitespace errors or unintended artifacts. Additional evidence: Prettier check, JSDoc check, file-size check, policy routing, Agentplane doctor, and visual screenshots of /, /writer, and /calc all passed.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-09T05:46:15.968Z, excerpt_hash=sha256:0254acccff0e87d462e12305e3e285e5af85278fe7e961efd089170d23283a65

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609090539-29Q2X6/blueprint/resolved-snapshot.json
- old_digest: cada93cc42b4f7ae173fa144f87a7e9ffdafbea08f98ef520ed1f632f8347efb
- current_digest: cada93cc42b4f7ae173fa144f87a7e9ffdafbea08f98ef520ed1f632f8347efb
- route_changed: no
- safe_command: agentplane blueprint snapshot 202609090539-29Q2X6

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202609090539-29Q2X6
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: true
- repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
- risks: none

### 2026-09-09T06:00:21.420Z — VERIFY — ok

By: CODER

Note: verified-202609090539-29Q2X6
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-09T05:59:13.942Z, excerpt_hash=sha256:0254acccff0e87d462e12305e3e285e5af85278fe7e961efd089170d23283a65

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609090539-29Q2X6/blueprint/resolved-snapshot.json
- old_digest: cada93cc42b4f7ae173fa144f87a7e9ffdafbea08f98ef520ed1f632f8347efb
- current_digest: cada93cc42b4f7ae173fa144f87a7e9ffdafbea08f98ef520ed1f632f8347efb
- route_changed: no
- safe_command: agentplane blueprint snapshot 202609090539-29Q2X6

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task complete 202609090539-29Q2X6 --result verified-202609090539-29Q2X6 --commit 4aa6c2092c145f1149068acba4224f1f545fe034
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: true
- repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert only the task commit that changes the desktop routing, launcher card navigation, and their tests; then rerun the declared office checks. Preserve all pre-existing Writer edits from task 202609090458-TRG4A7.

## Findings
