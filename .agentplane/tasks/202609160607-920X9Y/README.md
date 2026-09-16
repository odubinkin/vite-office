---
id: "202609160607-920X9Y"
title: "Редактирование имени документа в хидере"
result_summary: "verified-202609160607-920X9Y"
status: "DONE"
priority: "med"
owner: "CODER"
revision: 10
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
  - "frontend"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-09-16T06:08:53.943Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-09-16T06:16:16.843Z"
  updated_by: "CODER"
  note: "verified-202609160607-920X9Y"
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-09-16T06:15:38.036Z"
  updated_by: "EVALUATOR"
  note: "Inline document title editing is implemented and verified in scope."
  evaluated_sha: "68bc8eea7f31b5fc7568964dfd63b0dea35e7c16"
  blueprint_digest: "3d65962cdf7b3552bc1bf82b4fe5076e54dbbf6386425505e38d764304720cba"
  evidence_refs:
    - ".agentplane/tasks/202609160607-920X9Y/README.md"
    - ".agentplane/tasks/202609160607-920X9Y/quality/20260916-061538036-recovery-context/quality-report.json"
    - ".agentplane/tasks/202609160607-920X9Y/quality/20260916-061538036-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202609160607-920X9Y/quality/20260916-061538036-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202609160607-920X9Y/blueprint/resolved-snapshot.json"
    - "npx vitest run src/sw/browser/presentation/writer-view.test.tsx src/sw/source/uibase/app/docsh.test.ts; npm run build; npm run lint; npm run typecheck; npm run format:check; node .agentplane/policy/check-routing.mjs; ap doctor"
  findings:
    - "Header title becomes an input on click; Enter and blur commit trimmed non-empty values through SwDocShell.RenameDocument, which updates state and marks the document dirty. Focused tests: 23 passed. Build, lint, typecheck, format check, routing check, and doctor passed."
commit:
  hash: "925d1d8a02ea1c42f696f0444c6cd0b4a8ca266f"
  message: "🧩 920X9Y task: persist quality evidence"
comments:
  -
    author: "CODER"
    body: "Start: implement approved inline document-title editing in current checkout; verify Enter and blur persistence."
  -
    author: "CODER"
    body: "Verified: verified-202609160607-920X9Y. Guided shortcut recorded verification and is closing the direct task with traceable commit metadata."
events:
  -
    type: "status"
    at: "2026-09-16T06:09:05.329Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implement approved inline document-title editing in current checkout; verify Enter and blur persistence."
  -
    type: "verify"
    at: "2026-09-16T06:15:10.221Z"
    author: "CODER"
    state: "ok"
    note: "Verified: inline document title editing commits through the Writer shell on Enter and blur; focused tests and build checks pass. Full office coverage has one unrelated existing layout assertion failure in desktop.test.tsx (#workspace expects min-h-screen but receives h-screen min-h-0...)."
  -
    type: "verify"
    at: "2026-09-16T06:15:22.707Z"
    author: "CODER"
    state: "ok"
    note: "verified-202609160607-920X9Y"
  -
    type: "verify"
    at: "2026-09-16T06:15:49.362Z"
    author: "CODER"
    state: "ok"
    note: "verified-202609160607-920X9Y"
  -
    type: "verify"
    at: "2026-09-16T06:16:16.843Z"
    author: "CODER"
    state: "ok"
    note: "verified-202609160607-920X9Y"
  -
    type: "status"
    at: "2026-09-16T06:16:17.035Z"
    author: "CODER"
    from: "DOING"
    to: "DONE"
    note: "Verified: verified-202609160607-920X9Y. Guided shortcut recorded verification and is closing the direct task with traceable commit metadata."
doc_version: 3
doc_updated_at: "2026-09-16T06:16:17.036Z"
doc_updated_by: "CODER"
description: "Добавить inline-редактирование имени документа по клику в хидере; сохранять новое имя по Enter и при потере фокуса."
sections:
  Summary: |-
    Редактирование имени документа в хидере

    Добавить inline-редактирование имени документа по клику в хидере; сохранять новое имя по Enter и при потере фокуса.
  Scope: |-
    - In scope: Добавить inline-редактирование имени документа по клику в хидере; сохранять новое имя по Enter и при потере фокуса.
    - Out of scope: unrelated refactors not required for "Редактирование имени документа в хидере".
  Plan: |-
    1. Добавить shell-метод переименования с валидацией и уведомлением external store.
    2. Заменить статичный title в хидере на click-to-edit input.
    3. Сохранять значение по Enter и blur, игнорировать пустое имя.
    4. Добавить тесты на Enter, blur и обновление shell state.
  Verify Steps: |-
    PLANNER fallback scaffold. Replace with task-specific acceptance checks when PLANNER context is available.

    1. Review the changed artifact or behavior for the `code` task. Expected: the requested outcome is visible and matches the approved scope.
    2. Run the most relevant validation step for the `code` task. Expected: it succeeds without unexpected regressions in touched scope.
    3. Compare the final result against the task summary and scope. Expected: any remaining follow-up is explicit in ## Findings.
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-09-16T06:15:10.221Z — VERIFY — ok

    By: CODER

    Note: Verified: inline document title editing commits through the Writer shell on Enter and blur; focused tests and build checks pass. Full office coverage has one unrelated existing layout assertion failure in desktop.test.tsx (#workspace expects min-h-screen but receives h-screen min-h-0...).
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-16T06:09:05.329Z, excerpt_hash=sha256:4067e6c0d2671944bbb825f93b0ba7363aab826f8b2f3d8fbcbd2a2e4f1204c6

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609160607-920X9Y/blueprint/resolved-snapshot.json
    - old_digest: 3d65962cdf7b3552bc1bf82b4fe5076e54dbbf6386425505e38d764304720cba
    - current_digest: 3d65962cdf7b3552bc1bf82b4fe5076e54dbbf6386425505e38d764304720cba
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202609160607-920X9Y

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202609160607-920X9Y
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: true
    - repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
    - risks: none

    ### 2026-09-16T06:15:22.707Z — VERIFY — ok

    By: CODER

    Note: verified-202609160607-920X9Y
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-16T06:15:10.302Z, excerpt_hash=sha256:4067e6c0d2671944bbb825f93b0ba7363aab826f8b2f3d8fbcbd2a2e4f1204c6

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609160607-920X9Y/blueprint/resolved-snapshot.json
    - old_digest: 3d65962cdf7b3552bc1bf82b4fe5076e54dbbf6386425505e38d764304720cba
    - current_digest: 3d65962cdf7b3552bc1bf82b4fe5076e54dbbf6386425505e38d764304720cba
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202609160607-920X9Y

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task complete 202609160607-920X9Y --result verified-202609160607-920X9Y --commit 68bc8eea7f31b5fc7568964dfd63b0dea35e7c16
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: true
    - repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
    - risks: none

    ### 2026-09-16T06:15:49.362Z — VERIFY — ok

    By: CODER

    Note: verified-202609160607-920X9Y
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-16T06:15:22.783Z, excerpt_hash=sha256:4067e6c0d2671944bbb825f93b0ba7363aab826f8b2f3d8fbcbd2a2e4f1204c6

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609160607-920X9Y/blueprint/resolved-snapshot.json
    - old_digest: 3d65962cdf7b3552bc1bf82b4fe5076e54dbbf6386425505e38d764304720cba
    - current_digest: 3d65962cdf7b3552bc1bf82b4fe5076e54dbbf6386425505e38d764304720cba
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202609160607-920X9Y

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task complete 202609160607-920X9Y --result verified-202609160607-920X9Y --commit 68bc8eea7f31b5fc7568964dfd63b0dea35e7c16
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: true
    - repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
    - risks: none

    ### 2026-09-16T06:16:16.843Z — VERIFY — ok

    By: CODER

    Note: verified-202609160607-920X9Y
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-16T06:15:49.440Z, excerpt_hash=sha256:4067e6c0d2671944bbb825f93b0ba7363aab826f8b2f3d8fbcbd2a2e4f1204c6

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609160607-920X9Y/blueprint/resolved-snapshot.json
    - old_digest: 3d65962cdf7b3552bc1bf82b4fe5076e54dbbf6386425505e38d764304720cba
    - current_digest: 3d65962cdf7b3552bc1bf82b4fe5076e54dbbf6386425505e38d764304720cba
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202609160607-920X9Y

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task complete 202609160607-920X9Y --result verified-202609160607-920X9Y --commit 925d1d8a02ea1c42f696f0444c6cd0b4a8ca266f
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
    - Observation: Full coverage command reports 71/72 test files and 331/332 tests passed; the sole failure is src/framework/browser/app/desktop.test.tsx:362 and is outside the approved title-editing scope.
      Impact: The requested title-editing behavior is covered by focused tests; the repository-wide coverage gate remains red because of the unrelated workspace class assertion.
      Resolution: Do not widen this task; retain as a follow-up for the existing desktop workspace layout test.
extensions:
  implementation_commit:
    hash: "68bc8eea7f31b5fc7568964dfd63b0dea35e7c16"
    message: "🚧 920X9Y task: implement inline document title editing"
id_source: "generated"
---
## Summary

Редактирование имени документа в хидере

Добавить inline-редактирование имени документа по клику в хидере; сохранять новое имя по Enter и при потере фокуса.

## Scope

- In scope: Добавить inline-редактирование имени документа по клику в хидере; сохранять новое имя по Enter и при потере фокуса.
- Out of scope: unrelated refactors not required for "Редактирование имени документа в хидере".

## Plan

1. Добавить shell-метод переименования с валидацией и уведомлением external store.
2. Заменить статичный title в хидере на click-to-edit input.
3. Сохранять значение по Enter и blur, игнорировать пустое имя.
4. Добавить тесты на Enter, blur и обновление shell state.

## Verify Steps

PLANNER fallback scaffold. Replace with task-specific acceptance checks when PLANNER context is available.

1. Review the changed artifact or behavior for the `code` task. Expected: the requested outcome is visible and matches the approved scope.
2. Run the most relevant validation step for the `code` task. Expected: it succeeds without unexpected regressions in touched scope.
3. Compare the final result against the task summary and scope. Expected: any remaining follow-up is explicit in ## Findings.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-09-16T06:15:10.221Z — VERIFY — ok

By: CODER

Note: Verified: inline document title editing commits through the Writer shell on Enter and blur; focused tests and build checks pass. Full office coverage has one unrelated existing layout assertion failure in desktop.test.tsx (#workspace expects min-h-screen but receives h-screen min-h-0...).
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-16T06:09:05.329Z, excerpt_hash=sha256:4067e6c0d2671944bbb825f93b0ba7363aab826f8b2f3d8fbcbd2a2e4f1204c6

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609160607-920X9Y/blueprint/resolved-snapshot.json
- old_digest: 3d65962cdf7b3552bc1bf82b4fe5076e54dbbf6386425505e38d764304720cba
- current_digest: 3d65962cdf7b3552bc1bf82b4fe5076e54dbbf6386425505e38d764304720cba
- route_changed: no
- safe_command: agentplane blueprint snapshot 202609160607-920X9Y

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202609160607-920X9Y
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: true
- repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
- risks: none

### 2026-09-16T06:15:22.707Z — VERIFY — ok

By: CODER

Note: verified-202609160607-920X9Y
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-16T06:15:10.302Z, excerpt_hash=sha256:4067e6c0d2671944bbb825f93b0ba7363aab826f8b2f3d8fbcbd2a2e4f1204c6

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609160607-920X9Y/blueprint/resolved-snapshot.json
- old_digest: 3d65962cdf7b3552bc1bf82b4fe5076e54dbbf6386425505e38d764304720cba
- current_digest: 3d65962cdf7b3552bc1bf82b4fe5076e54dbbf6386425505e38d764304720cba
- route_changed: no
- safe_command: agentplane blueprint snapshot 202609160607-920X9Y

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task complete 202609160607-920X9Y --result verified-202609160607-920X9Y --commit 68bc8eea7f31b5fc7568964dfd63b0dea35e7c16
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: true
- repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
- risks: none

### 2026-09-16T06:15:49.362Z — VERIFY — ok

By: CODER

Note: verified-202609160607-920X9Y
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-16T06:15:22.783Z, excerpt_hash=sha256:4067e6c0d2671944bbb825f93b0ba7363aab826f8b2f3d8fbcbd2a2e4f1204c6

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609160607-920X9Y/blueprint/resolved-snapshot.json
- old_digest: 3d65962cdf7b3552bc1bf82b4fe5076e54dbbf6386425505e38d764304720cba
- current_digest: 3d65962cdf7b3552bc1bf82b4fe5076e54dbbf6386425505e38d764304720cba
- route_changed: no
- safe_command: agentplane blueprint snapshot 202609160607-920X9Y

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task complete 202609160607-920X9Y --result verified-202609160607-920X9Y --commit 68bc8eea7f31b5fc7568964dfd63b0dea35e7c16
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: true
- repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
- risks: none

### 2026-09-16T06:16:16.843Z — VERIFY — ok

By: CODER

Note: verified-202609160607-920X9Y
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-16T06:15:49.440Z, excerpt_hash=sha256:4067e6c0d2671944bbb825f93b0ba7363aab826f8b2f3d8fbcbd2a2e4f1204c6

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609160607-920X9Y/blueprint/resolved-snapshot.json
- old_digest: 3d65962cdf7b3552bc1bf82b4fe5076e54dbbf6386425505e38d764304720cba
- current_digest: 3d65962cdf7b3552bc1bf82b4fe5076e54dbbf6386425505e38d764304720cba
- route_changed: no
- safe_command: agentplane blueprint snapshot 202609160607-920X9Y

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task complete 202609160607-920X9Y --result verified-202609160607-920X9Y --commit 925d1d8a02ea1c42f696f0444c6cd0b4a8ca266f
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

- Observation: Full coverage command reports 71/72 test files and 331/332 tests passed; the sole failure is src/framework/browser/app/desktop.test.tsx:362 and is outside the approved title-editing scope.
  Impact: The requested title-editing behavior is covered by focused tests; the repository-wide coverage gate remains red because of the unrelated workspace class assertion.
  Resolution: Do not widen this task; retain as a follow-up for the existing desktop workspace layout test.
