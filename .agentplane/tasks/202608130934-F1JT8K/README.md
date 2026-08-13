---
id: "202608130934-F1JT8K"
title: "Remove stale Writer foundation labels"
result_summary: "verified-202608130934-F1JT8K"
status: "DONE"
priority: "med"
owner: "CODER"
revision: 17
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-08-13T09:36:59.779Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-08-13T09:42:17.557Z"
  updated_by: "CODER"
  note: "verified-202608130934-F1JT8K"
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-08-13T09:41:49.046Z"
  updated_by: "EVALUATOR"
  note: "Implementation removes superseded Writer labels and restores exact endpoint-preserving pointer selection."
  evaluated_sha: "d2610a08391694b177f2c80cf8d36bfccb185b59"
  blueprint_digest: "543df907c358da74e4bfd1567c159eabdb4d76799184ce80c8e40e958b03e147"
  evidence_refs:
    - ".agentplane/tasks/202608130934-F1JT8K/README.md"
    - ".agentplane/tasks/202608130934-F1JT8K/quality/20260813-094149046-recovery-context/quality-report.json"
    - ".agentplane/tasks/202608130934-F1JT8K/quality/20260813-094149046-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202608130934-F1JT8K/quality/20260813-094149046-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202608130934-F1JT8K/blueprint/resolved-snapshot.json"
    - "d2610a0; npm run test:e2e -- --grep document-wide selection; npm run test:coverage"
  findings:
    - "Fast coverage, targeted Chromium pointer-selection coverage, formatting, lint, JSDoc, file-size, and whitespace checks pass."
commit:
  hash: "2f09942125323c78d59dd69faa19dec7450cdd36"
  message: "🧪 F1JT8K close: record label and selection verification"
comments:
  -
    author: "CODER"
    body: "Start: Removing superseded Writer status labels and restoring pointer selection endpoint fidelity with focused coverage."
  -
    author: "CODER"
    body: "Verified: verified-202608130934-F1JT8K. Guided shortcut recorded verification and is closing the direct task with traceable commit metadata."
events:
  -
    type: "status"
    at: "2026-08-13T09:37:05.036Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: Removing superseded Writer status labels and restoring pointer selection endpoint fidelity with focused coverage."
  -
    type: "verify"
    at: "2026-08-13T09:41:42.453Z"
    author: "CODER"
    state: "ok"
    note: "Verified: Writer labels are current, exact cross-paragraph drag endpoints pass in Chromium, and fast coverage plus local quality checks are green."
  -
    type: "verify"
    at: "2026-08-13T09:41:59.221Z"
    author: "CODER"
    state: "ok"
    note: "verified-202608130934-F1JT8K"
  -
    type: "verify"
    at: "2026-08-13T09:42:17.557Z"
    author: "CODER"
    state: "ok"
    note: "verified-202608130934-F1JT8K"
  -
    type: "status"
    at: "2026-08-13T09:42:17.749Z"
    author: "CODER"
    from: "DOING"
    to: "DONE"
    note: "Verified: verified-202608130934-F1JT8K. Guided shortcut recorded verification and is closing the direct task with traceable commit metadata."
doc_version: 3
doc_updated_at: "2026-08-13T09:42:17.750Z"
doc_updated_by: "CODER"
description: "Remove the obsolete Plain text badge from the Writer workbench and the Foundation only label from the Writer suite selector card, retaining current accessible product naming and UI coverage."
sections:
  Summary: "Remove obsolete Writer foundation-state labels now contradicted by implemented rich-text editing, and repair exact endpoint preservation for pointer selections spanning Writer paragraphs."
  Scope: "In scope: hide the Writer-only suite-card status and remove the Writer \"Plain text\" badge; retain non-Writer foundation labels. Replace whole-paragraph cross-host drag ranges with native selection endpoints derived from the actual pointer caret. Update unit and targeted Chromium coverage. Out of scope: changing Writer feature labels elsewhere, broad suite-status redesign, multi-paragraph editing commands, or selection-model redesign."
  Plan: |-
    1. Update Writer-only suite metadata and chrome so the left selector and workbench title no longer describe its implemented editor as Foundation only or Plain text.
    2. Restore pointer-selection endpoint fidelity by applying the recorded anchor/focus DOM positions instead of selecting full boundary paragraph elements.
    3. Extend focused unit/component and Chromium tests to prove the removed labels and partial forward/reverse cross-paragraph endpoints.
    4. Run the declared fast and targeted verification, record evidence, commit, and close the task.
  Verify Steps: |-
    1. cd apps/office && npm run typecheck && npm run test:coverage — expected: fast unit/component tests pass with strict coverage.
    2. npm run test:e2e -- --grep "document-wide selection" — expected: Chromium proves forward and reverse pointer drags retain partial endpoint offsets across paragraphs.
    3. npm run format:check && npm run lint && npm run check:docs && npm run check:file-size — expected: formatting, lint, JSDoc, and size gates pass.
    4. git diff --check && git status --short --untracked-files=all — expected: no whitespace errors and only intentional tracked task changes before closure.
  Verification: |-
    - Command: cd apps/office && npm run typecheck && npm run test:coverage
      Result: pass
      Evidence: 31 test files, 101 tests; statements, branches, functions, and lines all 100%.
      Scope: TypeScript document editor, suite-selector component, and all fast unit/component coverage.

    - Command: npm run test:e2e -- --grep "document-wide selection"
      Result: pass
      Evidence: production Vite build completed; 1 Chromium test passed. The test asserts forward pointer endpoints 5 to 6 and reverse endpoints 6 to 5 across separate Writer paragraphs.
      Scope: browser-native cross-paragraph pointer selection.

    - Command: npm run format:check && npm run lint && npm run check:docs && npm run check:file-size && git diff --check
      Result: pass
      Evidence: Prettier, ESLint, JSDoc validation for 156 authored source files, size gate, and whitespace validation passed.
      Scope: repository quality gates for the changed files.

    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-08-13T09:41:42.453Z — VERIFY — ok

    By: CODER

    Note: Verified: Writer labels are current, exact cross-paragraph drag endpoints pass in Chromium, and fast coverage plus local quality checks are green.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-08-13T09:41:42.008Z, excerpt_hash=sha256:a21ab622eb19b0c86655eb0d77064beeac96a7f4ac2eb457a93d11b759145e7e

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202608130934-F1JT8K/blueprint/resolved-snapshot.json
    - old_digest: 543df907c358da74e4bfd1567c159eabdb4d76799184ce80c8e40e958b03e147
    - current_digest: 543df907c358da74e4bfd1567c159eabdb4d76799184ce80c8e40e958b03e147
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202608130934-F1JT8K

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task run 202608130934-F1JT8K
    - diagnostic_command: agentplane task run status 202608130934-F1JT8K
    - source_of_truth: route=task_next_action diagnostic=runner_status remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: true
    - repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
    - runner_required: true
    - runner_failure_means: runner_infrastructure_or_task_unknown
    - risks: runner_rail_confusion

    ### 2026-08-13T09:41:59.221Z — VERIFY — ok

    By: CODER

    Note: verified-202608130934-F1JT8K
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-08-13T09:41:42.532Z, excerpt_hash=sha256:a21ab622eb19b0c86655eb0d77064beeac96a7f4ac2eb457a93d11b759145e7e

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202608130934-F1JT8K/blueprint/resolved-snapshot.json
    - old_digest: 543df907c358da74e4bfd1567c159eabdb4d76799184ce80c8e40e958b03e147
    - current_digest: 543df907c358da74e4bfd1567c159eabdb4d76799184ce80c8e40e958b03e147
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202608130934-F1JT8K

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task complete 202608130934-F1JT8K --result verified-202608130934-F1JT8K --commit d2610a08391694b177f2c80cf8d36bfccb185b59
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: true
    - repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
    - risks: none

    ### 2026-08-13T09:42:17.557Z — VERIFY — ok

    By: CODER

    Note: verified-202608130934-F1JT8K
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-08-13T09:41:59.304Z, excerpt_hash=sha256:a21ab622eb19b0c86655eb0d77064beeac96a7f4ac2eb457a93d11b759145e7e

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202608130934-F1JT8K/blueprint/resolved-snapshot.json
    - old_digest: 543df907c358da74e4bfd1567c159eabdb4d76799184ce80c8e40e958b03e147
    - current_digest: 543df907c358da74e4bfd1567c159eabdb4d76799184ce80c8e40e958b03e147
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202608130934-F1JT8K

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task complete 202608130934-F1JT8K --result verified-202608130934-F1JT8K --commit 2f09942125323c78d59dd69faa19dec7450cdd36
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: true
    - repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert the task implementation commit to restore the previous labels and pointer-selection implementation. No persisted document data, external systems, or schema are changed."
  Findings: |-
    Root cause repaired: apps/office/src/sw/source/uibase/docvw/edtwin.tsx now applies the saved text-node anchor and focus through Selection.setBaseAndExtent, retaining partial boundaries in both drag directions instead of selecting complete paragraph elements.

    Writer no longer presents the stale Plain text title badge or the Foundation only state in its suite selector. Other unavailable suite cards retain their Foundation only status.

    Verification used local commands only, per the user's explicit no-runner instruction. File-size reporting retains existing decomposition candidates: desktop.test.tsx (525), writer.test.ts (555), writer.ts (670), view.tsx (702), and scripts/libreoffice-inventory/contracts.ts (536); none reaches the mandatory 1000-line threshold.
extensions:
  implementation_commit:
    hash: "d2610a08391694b177f2c80cf8d36bfccb185b59"
    message: "🐛 F1JT8K code: remove stale labels and preserve drag endpoints"
id_source: "generated"
---
## Summary

Remove obsolete Writer foundation-state labels now contradicted by implemented rich-text editing, and repair exact endpoint preservation for pointer selections spanning Writer paragraphs.

## Scope

In scope: hide the Writer-only suite-card status and remove the Writer "Plain text" badge; retain non-Writer foundation labels. Replace whole-paragraph cross-host drag ranges with native selection endpoints derived from the actual pointer caret. Update unit and targeted Chromium coverage. Out of scope: changing Writer feature labels elsewhere, broad suite-status redesign, multi-paragraph editing commands, or selection-model redesign.

## Plan

1. Update Writer-only suite metadata and chrome so the left selector and workbench title no longer describe its implemented editor as Foundation only or Plain text.
2. Restore pointer-selection endpoint fidelity by applying the recorded anchor/focus DOM positions instead of selecting full boundary paragraph elements.
3. Extend focused unit/component and Chromium tests to prove the removed labels and partial forward/reverse cross-paragraph endpoints.
4. Run the declared fast and targeted verification, record evidence, commit, and close the task.

## Verify Steps

1. cd apps/office && npm run typecheck && npm run test:coverage — expected: fast unit/component tests pass with strict coverage.
2. npm run test:e2e -- --grep "document-wide selection" — expected: Chromium proves forward and reverse pointer drags retain partial endpoint offsets across paragraphs.
3. npm run format:check && npm run lint && npm run check:docs && npm run check:file-size — expected: formatting, lint, JSDoc, and size gates pass.
4. git diff --check && git status --short --untracked-files=all — expected: no whitespace errors and only intentional tracked task changes before closure.

## Verification

- Command: cd apps/office && npm run typecheck && npm run test:coverage
  Result: pass
  Evidence: 31 test files, 101 tests; statements, branches, functions, and lines all 100%.
  Scope: TypeScript document editor, suite-selector component, and all fast unit/component coverage.

- Command: npm run test:e2e -- --grep "document-wide selection"
  Result: pass
  Evidence: production Vite build completed; 1 Chromium test passed. The test asserts forward pointer endpoints 5 to 6 and reverse endpoints 6 to 5 across separate Writer paragraphs.
  Scope: browser-native cross-paragraph pointer selection.

- Command: npm run format:check && npm run lint && npm run check:docs && npm run check:file-size && git diff --check
  Result: pass
  Evidence: Prettier, ESLint, JSDoc validation for 156 authored source files, size gate, and whitespace validation passed.
  Scope: repository quality gates for the changed files.

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-08-13T09:41:42.453Z — VERIFY — ok

By: CODER

Note: Verified: Writer labels are current, exact cross-paragraph drag endpoints pass in Chromium, and fast coverage plus local quality checks are green.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-08-13T09:41:42.008Z, excerpt_hash=sha256:a21ab622eb19b0c86655eb0d77064beeac96a7f4ac2eb457a93d11b759145e7e

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202608130934-F1JT8K/blueprint/resolved-snapshot.json
- old_digest: 543df907c358da74e4bfd1567c159eabdb4d76799184ce80c8e40e958b03e147
- current_digest: 543df907c358da74e4bfd1567c159eabdb4d76799184ce80c8e40e958b03e147
- route_changed: no
- safe_command: agentplane blueprint snapshot 202608130934-F1JT8K

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task run 202608130934-F1JT8K
- diagnostic_command: agentplane task run status 202608130934-F1JT8K
- source_of_truth: route=task_next_action diagnostic=runner_status remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: true
- repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
- runner_required: true
- runner_failure_means: runner_infrastructure_or_task_unknown
- risks: runner_rail_confusion

### 2026-08-13T09:41:59.221Z — VERIFY — ok

By: CODER

Note: verified-202608130934-F1JT8K
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-08-13T09:41:42.532Z, excerpt_hash=sha256:a21ab622eb19b0c86655eb0d77064beeac96a7f4ac2eb457a93d11b759145e7e

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202608130934-F1JT8K/blueprint/resolved-snapshot.json
- old_digest: 543df907c358da74e4bfd1567c159eabdb4d76799184ce80c8e40e958b03e147
- current_digest: 543df907c358da74e4bfd1567c159eabdb4d76799184ce80c8e40e958b03e147
- route_changed: no
- safe_command: agentplane blueprint snapshot 202608130934-F1JT8K

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task complete 202608130934-F1JT8K --result verified-202608130934-F1JT8K --commit d2610a08391694b177f2c80cf8d36bfccb185b59
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: true
- repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
- risks: none

### 2026-08-13T09:42:17.557Z — VERIFY — ok

By: CODER

Note: verified-202608130934-F1JT8K
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-08-13T09:41:59.304Z, excerpt_hash=sha256:a21ab622eb19b0c86655eb0d77064beeac96a7f4ac2eb457a93d11b759145e7e

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202608130934-F1JT8K/blueprint/resolved-snapshot.json
- old_digest: 543df907c358da74e4bfd1567c159eabdb4d76799184ce80c8e40e958b03e147
- current_digest: 543df907c358da74e4bfd1567c159eabdb4d76799184ce80c8e40e958b03e147
- route_changed: no
- safe_command: agentplane blueprint snapshot 202608130934-F1JT8K

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task complete 202608130934-F1JT8K --result verified-202608130934-F1JT8K --commit 2f09942125323c78d59dd69faa19dec7450cdd36
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: true
- repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert the task implementation commit to restore the previous labels and pointer-selection implementation. No persisted document data, external systems, or schema are changed.

## Findings

Root cause repaired: apps/office/src/sw/source/uibase/docvw/edtwin.tsx now applies the saved text-node anchor and focus through Selection.setBaseAndExtent, retaining partial boundaries in both drag directions instead of selecting complete paragraph elements.

Writer no longer presents the stale Plain text title badge or the Foundation only state in its suite selector. Other unavailable suite cards retain their Foundation only status.

Verification used local commands only, per the user's explicit no-runner instruction. File-size reporting retains existing decomposition candidates: desktop.test.tsx (525), writer.test.ts (555), writer.ts (670), view.tsx (702), and scripts/libreoffice-inventory/contracts.ts (536); none reaches the mandatory 1000-line threshold.
