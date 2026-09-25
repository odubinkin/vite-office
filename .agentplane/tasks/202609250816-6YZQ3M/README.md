---
id: "202609250816-6YZQ3M"
title: "Align Writer menu item indentation"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 14
origin:
  system: "manual"
depends_on: []
tags:
  - "ui"
  - "writer"
task_kind: "code"
mutation_scope: "code"
verify:
  - "Browser menu alignment and interaction"
  - "Focused CommandMenuBar and WriterMenuBar tests"
  - "npm run verify"
plan_approval:
  state: "approved"
  updated_at: "2026-09-25T08:16:33.050Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-09-25T08:24:39.879Z"
  updated_by: "CODER"
  note: "All menu labels share an 18px inset in browser geometry checks; focused unit tests, 19 browser tests, 547 office tests, 109 inventory tests, and full verify passed."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-09-25T08:24:43.992Z"
  updated_by: "EVALUATOR"
  note: "Writer menu labels now share a compact left inset."
  evaluated_sha: "cd21dffe80c4e1768c94bcd67ef10d54eb168178"
  blueprint_digest: "e633936575fa00a9113135a4b4bad16c8a6b7faa831b25e93171074146afaec0"
  evidence_refs:
    - ".agentplane/tasks/202609250816-6YZQ3M/README.md"
    - ".agentplane/tasks/202609250816-6YZQ3M/quality/20260925-082443992-recovery-context/quality-report.json"
    - ".agentplane/tasks/202609250816-6YZQ3M/quality/20260925-082443992-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202609250816-6YZQ3M/quality/20260925-082443992-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202609250816-6YZQ3M/blueprint/resolved-snapshot.json"
    - "apps/office/e2e/writer-menu-alignment.spec.ts"
  findings:
    - "Browser geometry confirms aligned labels for actions, checked commands, and submenus; all interactions and full verification pass."
commit: null
comments:
  -
    author: "CODER"
    body: "Start: align menu item labels with a compact shared gutter and verify interactions."
events:
  -
    type: "status"
    at: "2026-09-25T08:16:33.776Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: align menu item labels with a compact shared gutter and verify interactions."
  -
    type: "verify"
    at: "2026-09-25T08:24:39.879Z"
    author: "CODER"
    state: "ok"
    note: "All menu labels share an 18px inset in browser geometry checks; focused unit tests, 19 browser tests, 547 office tests, 109 inventory tests, and full verify passed."
doc_version: 3
doc_updated_at: "2026-09-25T08:24:39.963Z"
doc_updated_by: "CODER"
description: "Use the same compact label inset for Writer command, checked, radio, and submenu rows in the shared menu presenter; verify menu interaction remains intact."
sections:
  Summary: "Align all Writer menu item labels to the same compact horizontal inset."
  Scope: "Shared CommandMenuBar rendering and focused tests for action, checked, radio, and submenu rows. Keep save and export behavior unchanged."
  Plan: "1. Apply a shared compact label gutter to command, checkable, radio, and submenu rows. 2. Test text alignment and existing menu interaction in unit and browser checks. 3. Run full verification, record evidence, and commit the focused change."
  Verify Steps: "1. Run focused CommandMenuBar and WriterMenuBar unit tests. 2. Verify menu label alignment and clickability in a browser. 3. Run npm run verify. 4. Inspect git diff and status."
  Verification: |-
    Command: npx vitest run src/framework/browser/presentation/CommandMenuBar.test.tsx src/sw/browser/presentation/WriterMenuBar.test.tsx (apps/office); Result: pass; Evidence: 12 tests passed; Scope: menu interactions. Command: npm run build && npx playwright test --config apps/office/playwright.config.ts apps/office/e2e/writer-menu-alignment.spec.ts; Result: pass after correcting test navigation from click to hover; Evidence: 1 browser test passed and measured equal compact label offsets; Scope: rendered Format and View menus. Command: npm run verify; Result: pass; Evidence: 547 office tests, 109 inventory tests, 19 browser tests, 100% office coverage, static checks passed; Scope: repository. Command: git diff --check; Result: pass; Evidence: no whitespace errors; Scope: changed paths.

    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-09-25T08:24:39.879Z — VERIFY — ok

    By: CODER

    Note: All menu labels share an 18px inset in browser geometry checks; focused unit tests, 19 browser tests, 547 office tests, 109 inventory tests, and full verify passed.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-25T08:24:30.057Z, excerpt_hash=sha256:00195ac5606db8eccaac24f4029d63e5030094792e54e1c98111da47a3ea6b98

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609250816-6YZQ3M/blueprint/resolved-snapshot.json
    - old_digest: e633936575fa00a9113135a4b4bad16c8a6b7faa831b25e93171074146afaec0
    - current_digest: e633936575fa00a9113135a4b4bad16c8a6b7faa831b25e93171074146afaec0
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202609250816-6YZQ3M

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202609250816-6YZQ3M
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: false
    - repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert this task's menu component and test commit."
  Findings: "Command rows used 12px horizontal padding plus a 16px checkmark slot, while submenu rows used only 12px padding. Both now use 8px padding and a 10px leading slot, aligning all labels at an 18px inset. The first browser test attempt clicked View after hover had already switched the open menu, closing it; the test now uses hover and passes."
id_source: "generated"
---
## Summary

Align all Writer menu item labels to the same compact horizontal inset.

## Scope

Shared CommandMenuBar rendering and focused tests for action, checked, radio, and submenu rows. Keep save and export behavior unchanged.

## Plan

1. Apply a shared compact label gutter to command, checkable, radio, and submenu rows. 2. Test text alignment and existing menu interaction in unit and browser checks. 3. Run full verification, record evidence, and commit the focused change.

## Verify Steps

1. Run focused CommandMenuBar and WriterMenuBar unit tests. 2. Verify menu label alignment and clickability in a browser. 3. Run npm run verify. 4. Inspect git diff and status.

## Verification

Command: npx vitest run src/framework/browser/presentation/CommandMenuBar.test.tsx src/sw/browser/presentation/WriterMenuBar.test.tsx (apps/office); Result: pass; Evidence: 12 tests passed; Scope: menu interactions. Command: npm run build && npx playwright test --config apps/office/playwright.config.ts apps/office/e2e/writer-menu-alignment.spec.ts; Result: pass after correcting test navigation from click to hover; Evidence: 1 browser test passed and measured equal compact label offsets; Scope: rendered Format and View menus. Command: npm run verify; Result: pass; Evidence: 547 office tests, 109 inventory tests, 19 browser tests, 100% office coverage, static checks passed; Scope: repository. Command: git diff --check; Result: pass; Evidence: no whitespace errors; Scope: changed paths.

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-09-25T08:24:39.879Z — VERIFY — ok

By: CODER

Note: All menu labels share an 18px inset in browser geometry checks; focused unit tests, 19 browser tests, 547 office tests, 109 inventory tests, and full verify passed.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-25T08:24:30.057Z, excerpt_hash=sha256:00195ac5606db8eccaac24f4029d63e5030094792e54e1c98111da47a3ea6b98

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609250816-6YZQ3M/blueprint/resolved-snapshot.json
- old_digest: e633936575fa00a9113135a4b4bad16c8a6b7faa831b25e93171074146afaec0
- current_digest: e633936575fa00a9113135a4b4bad16c8a6b7faa831b25e93171074146afaec0
- route_changed: no
- safe_command: agentplane blueprint snapshot 202609250816-6YZQ3M

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202609250816-6YZQ3M
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: false
- repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert this task's menu component and test commit.

## Findings

Command rows used 12px horizontal padding plus a 16px checkmark slot, while submenu rows used only 12px padding. Both now use 8px padding and a 10px leading slot, aligning all labels at an 18px inset. The first browser test attempt clicked View after hover had already switched the open menu, closing it; the test now uses hover and passes.
