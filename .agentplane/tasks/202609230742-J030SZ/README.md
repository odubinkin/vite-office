---
id: "202609230742-J030SZ"
title: "Align Writer rulers and page breaks with page geometry"
result_summary: "verified-202609230742-J030SZ"
status: "DONE"
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
  updated_at: "2026-09-23T07:42:50.976Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-09-23T07:54:41.648Z"
  updated_by: "CODER"
  note: "verified-202609230742-J030SZ"
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-09-23T07:54:13.487Z"
  updated_by: "EVALUATOR"
  note: "Approved ruler and pagination scope implemented and verified."
  evaluated_sha: "78e9bd31303b8718022b2ab0856385d6b337059f"
  blueprint_digest: "9ceaf28cd7880a817823c6b0b32cf657c5489253a405e90e0f66f32910df4c6e"
  evidence_refs:
    - ".agentplane/tasks/202609230742-J030SZ/README.md"
    - ".agentplane/tasks/202609230742-J030SZ/quality/20260923-075413487-recovery-context/quality-report.json"
    - ".agentplane/tasks/202609230742-J030SZ/quality/20260923-075413487-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202609230742-J030SZ/quality/20260923-075413487-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202609230742-J030SZ/blueprint/resolved-snapshot.json"
    - "apps/office/src/sw/browser/presentation/WriterPageLayout.test.tsx"
  findings:
    - "Per-page vertical rulers, live handles, margin-origin ticks, measured browser page breaks, and passing focused/static/browser checks."
commit:
  hash: "78e9bd31303b8718022b2ab0856385d6b337059f"
  message: "🧩 J030SZ task: fix Writer ruler alignment and page pagination"
comments:
  -
    author: "CODER"
    body: "Start: Implement page-anchored rulers, live pointer feedback, text-area zero marks, and accurate browser page breaks."
  -
    author: "CODER"
    body: "Verified: verified-202609230742-J030SZ. Guided shortcut recorded verification and is closing the direct task with traceable commit metadata."
events:
  -
    type: "status"
    at: "2026-09-23T07:42:52.062Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: Implement page-anchored rulers, live pointer feedback, text-area zero marks, and accurate browser page breaks."
  -
    type: "verify"
    at: "2026-09-23T07:54:12.636Z"
    author: "CODER"
    state: "ok"
    note: "Focused ruler and pagination tests, editor tests, typecheck, lint, formatting, build, browser E2E, doctor, and routing all passed."
  -
    type: "verify"
    at: "2026-09-23T07:54:25.026Z"
    author: "CODER"
    state: "ok"
    note: "verified-202609230742-J030SZ"
  -
    type: "verify"
    at: "2026-09-23T07:54:41.648Z"
    author: "CODER"
    state: "ok"
    note: "verified-202609230742-J030SZ"
  -
    type: "status"
    at: "2026-09-23T07:54:41.846Z"
    author: "CODER"
    from: "DOING"
    to: "DONE"
    note: "Verified: verified-202609230742-J030SZ. Guided shortcut recorded verification and is closing the direct task with traceable commit metadata."
doc_version: 3
doc_updated_at: "2026-09-23T07:54:41.847Z"
doc_updated_by: "CODER"
description: "Fix page-anchored vertical ruler, live ruler drag feedback, text-area zero origins, and premature browser page breaks using vendored LibreOffice ruler/layout behavior as reference."
sections:
  Summary: |-
    Align Writer rulers and page breaks with page geometry

    Fix page-anchored vertical ruler, live ruler drag feedback, text-area zero origins, and premature browser page breaks using vendored LibreOffice ruler/layout behavior as reference.
  Scope: "Update Writer browser ruler projection, workspace/editor page composition, paragraph pagination, and focused tests. Use vendored LibreOffice SvxRuler/Svtools ruler behavior for origin and drag feedback. No unrelated document-model changes or network access."
  Plan: "Anchor vertical rulers to each page, use page text-area origins and live drag previews, and correct premature page breaks; verify focused UI behavior and static checks."
  Verify Steps: |-
    1. Run `npx vitest run apps/office/src/sw/browser/presentation/WriterPageLayout.test.tsx`. Expected: per-page vertical ruler, margin-origin ticks, live drag feedback, single final commit, and page-break regression cases pass.
    2. Run `npm run typecheck --workspace @vite-office/office` and `npm run lint`. Expected: both pass.
    3. Run `ap doctor` and `node .agentplane/policy/check-routing.mjs`. Expected: both pass.
    4. Inspect `git diff --check` and `git status --short --untracked-files=all`. Expected: no whitespace errors or unintended changes.
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-09-23T07:54:12.636Z — VERIFY — ok

    By: CODER

    Note: Focused ruler and pagination tests, editor tests, typecheck, lint, formatting, build, browser E2E, doctor, and routing all passed.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-23T07:54:04.422Z, excerpt_hash=sha256:6a01d965142102d02ab9407ae7c53c4b16969a0ee760dd82a66416bfee699372

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609230742-J030SZ/blueprint/resolved-snapshot.json
    - old_digest: 9ceaf28cd7880a817823c6b0b32cf657c5489253a405e90e0f66f32910df4c6e
    - current_digest: 9ceaf28cd7880a817823c6b0b32cf657c5489253a405e90e0f66f32910df4c6e
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202609230742-J030SZ

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202609230742-J030SZ
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: false
    - repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
    - risks: none

    ### 2026-09-23T07:54:25.026Z — VERIFY — ok

    By: CODER

    Note: verified-202609230742-J030SZ
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-23T07:54:12.732Z, excerpt_hash=sha256:6a01d965142102d02ab9407ae7c53c4b16969a0ee760dd82a66416bfee699372

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609230742-J030SZ/blueprint/resolved-snapshot.json
    - old_digest: 9ceaf28cd7880a817823c6b0b32cf657c5489253a405e90e0f66f32910df4c6e
    - current_digest: 9ceaf28cd7880a817823c6b0b32cf657c5489253a405e90e0f66f32910df4c6e
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202609230742-J030SZ

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task complete 202609230742-J030SZ --result verified-202609230742-J030SZ --commit 78e9bd31303b8718022b2ab0856385d6b337059f
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: true
    - repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
    - risks: none

    ### 2026-09-23T07:54:41.648Z — VERIFY — ok

    By: CODER

    Note: verified-202609230742-J030SZ
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-23T07:54:25.159Z, excerpt_hash=sha256:6a01d965142102d02ab9407ae7c53c4b16969a0ee760dd82a66416bfee699372

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609230742-J030SZ/blueprint/resolved-snapshot.json
    - old_digest: 9ceaf28cd7880a817823c6b0b32cf657c5489253a405e90e0f66f32910df4c6e
    - current_digest: 9ceaf28cd7880a817823c6b0b32cf657c5489253a405e90e0f66f32910df4c6e
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202609230742-J030SZ

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task complete 202609230742-J030SZ --result verified-202609230742-J030SZ --commit b70a3541629850182ba5aa34d53a993038edcb5d
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
    Command: npm exec --workspace @vite-office/office -- vitest run src/sw/browser/presentation/WriterPageLayout.test.tsx
    Result: pass
    Evidence: 5 tests passed; covers page-owned vertical rulers, margin-origin zero, live handles, and measured page breaks.
    Scope: Writer ruler and pagination UI.

    Command: npm exec --workspace @vite-office/office -- vitest run src/sw/browser/editor/WriterPlainTextEditor.test.tsx
    Result: pass
    Evidence: 13 tests passed.
    Scope: existing document editing behavior.

    Command: npm run typecheck --workspace @vite-office/office; npm run lint; npm run format:check; npm run build; npx playwright test apps/office/e2e/foundation.spec.ts --config apps/office/playwright.config.ts
    Result: pass
    Evidence: TypeScript, ESLint, Prettier, production build, and 1 browser E2E test passed.
    Scope: affected workspace and application chrome.

    Command: ap doctor; node .agentplane/policy/check-routing.mjs; git diff --check
    Result: pass
    Evidence: doctor OK with pre-existing hook/old-task warnings; routing OK; no whitespace errors.
    Scope: task workflow and diff hygiene.

    The first focused Vitest invocation ran from the repository root without the app config; the workspace-scoped command above runs the declared test in jsdom.
id_source: "generated"
---
## Summary

Align Writer rulers and page breaks with page geometry

Fix page-anchored vertical ruler, live ruler drag feedback, text-area zero origins, and premature browser page breaks using vendored LibreOffice ruler/layout behavior as reference.

## Scope

Update Writer browser ruler projection, workspace/editor page composition, paragraph pagination, and focused tests. Use vendored LibreOffice SvxRuler/Svtools ruler behavior for origin and drag feedback. No unrelated document-model changes or network access.

## Plan

Anchor vertical rulers to each page, use page text-area origins and live drag previews, and correct premature page breaks; verify focused UI behavior and static checks.

## Verify Steps

1. Run `npx vitest run apps/office/src/sw/browser/presentation/WriterPageLayout.test.tsx`. Expected: per-page vertical ruler, margin-origin ticks, live drag feedback, single final commit, and page-break regression cases pass.
2. Run `npm run typecheck --workspace @vite-office/office` and `npm run lint`. Expected: both pass.
3. Run `ap doctor` and `node .agentplane/policy/check-routing.mjs`. Expected: both pass.
4. Inspect `git diff --check` and `git status --short --untracked-files=all`. Expected: no whitespace errors or unintended changes.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-09-23T07:54:12.636Z — VERIFY — ok

By: CODER

Note: Focused ruler and pagination tests, editor tests, typecheck, lint, formatting, build, browser E2E, doctor, and routing all passed.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-23T07:54:04.422Z, excerpt_hash=sha256:6a01d965142102d02ab9407ae7c53c4b16969a0ee760dd82a66416bfee699372

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609230742-J030SZ/blueprint/resolved-snapshot.json
- old_digest: 9ceaf28cd7880a817823c6b0b32cf657c5489253a405e90e0f66f32910df4c6e
- current_digest: 9ceaf28cd7880a817823c6b0b32cf657c5489253a405e90e0f66f32910df4c6e
- route_changed: no
- safe_command: agentplane blueprint snapshot 202609230742-J030SZ

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202609230742-J030SZ
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: false
- repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
- risks: none

### 2026-09-23T07:54:25.026Z — VERIFY — ok

By: CODER

Note: verified-202609230742-J030SZ
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-23T07:54:12.732Z, excerpt_hash=sha256:6a01d965142102d02ab9407ae7c53c4b16969a0ee760dd82a66416bfee699372

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609230742-J030SZ/blueprint/resolved-snapshot.json
- old_digest: 9ceaf28cd7880a817823c6b0b32cf657c5489253a405e90e0f66f32910df4c6e
- current_digest: 9ceaf28cd7880a817823c6b0b32cf657c5489253a405e90e0f66f32910df4c6e
- route_changed: no
- safe_command: agentplane blueprint snapshot 202609230742-J030SZ

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task complete 202609230742-J030SZ --result verified-202609230742-J030SZ --commit 78e9bd31303b8718022b2ab0856385d6b337059f
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: true
- repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
- risks: none

### 2026-09-23T07:54:41.648Z — VERIFY — ok

By: CODER

Note: verified-202609230742-J030SZ
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-23T07:54:25.159Z, excerpt_hash=sha256:6a01d965142102d02ab9407ae7c53c4b16969a0ee760dd82a66416bfee699372

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609230742-J030SZ/blueprint/resolved-snapshot.json
- old_digest: 9ceaf28cd7880a817823c6b0b32cf657c5489253a405e90e0f66f32910df4c6e
- current_digest: 9ceaf28cd7880a817823c6b0b32cf657c5489253a405e90e0f66f32910df4c6e
- route_changed: no
- safe_command: agentplane blueprint snapshot 202609230742-J030SZ

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task complete 202609230742-J030SZ --result verified-202609230742-J030SZ --commit b70a3541629850182ba5aa34d53a993038edcb5d
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

Command: npm exec --workspace @vite-office/office -- vitest run src/sw/browser/presentation/WriterPageLayout.test.tsx
Result: pass
Evidence: 5 tests passed; covers page-owned vertical rulers, margin-origin zero, live handles, and measured page breaks.
Scope: Writer ruler and pagination UI.

Command: npm exec --workspace @vite-office/office -- vitest run src/sw/browser/editor/WriterPlainTextEditor.test.tsx
Result: pass
Evidence: 13 tests passed.
Scope: existing document editing behavior.

Command: npm run typecheck --workspace @vite-office/office; npm run lint; npm run format:check; npm run build; npx playwright test apps/office/e2e/foundation.spec.ts --config apps/office/playwright.config.ts
Result: pass
Evidence: TypeScript, ESLint, Prettier, production build, and 1 browser E2E test passed.
Scope: affected workspace and application chrome.

Command: ap doctor; node .agentplane/policy/check-routing.mjs; git diff --check
Result: pass
Evidence: doctor OK with pre-existing hook/old-task warnings; routing OK; no whitespace errors.
Scope: task workflow and diff hygiene.

The first focused Vitest invocation ran from the repository root without the app config; the workspace-scoped command above runs the declared test in jsdom.
