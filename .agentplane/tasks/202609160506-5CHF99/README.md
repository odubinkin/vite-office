---
id: "202609160506-5CHF99"
title: "Fix Writer shell layout"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 8
origin:
  system: "manual"
depends_on: []
tags:
  - "frontend"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-09-16T05:06:52.268Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-09-16T05:12:42.640Z"
  updated_by: "CODER"
  note: "verified-202609160506-5CHF99"
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-09-16T05:12:35.565Z"
  updated_by: "EVALUATOR"
  note: "Writer shell scrolling layout verified"
  evaluated_sha: "b345425c2bc430fc5af9e1e4271eb3d85e85b16b"
  blueprint_digest: "c5dc96c634becf5d675a40f1616e10a16c7f3258e416150f37affe3672c1aa42"
  evidence_refs:
    - ".agentplane/tasks/202609160506-5CHF99/README.md"
    - ".agentplane/tasks/202609160506-5CHF99/quality/20260916-051235565-recovery-context/quality-report.json"
    - ".agentplane/tasks/202609160506-5CHF99/quality/20260916-051235565-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202609160506-5CHF99/quality/20260916-051235565-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202609160506-5CHF99/blueprint/resolved-snapshot.json"
    - "npm run build; npm run lint; npx prettier --check apps/office/src/sw/browser/presentation/WriterWorkspaceChrome.tsx; git diff --check; npx vitest run src/sw/browser/presentation/writer-view.test.tsx src/sw/browser/presentation/WriterMenuBar.test.tsx"
  findings:
    - "Viewport flex shell keeps header/footer fixed, central layout keeps sidebar fixed, and document canvas is the sole scroll container."
commit: null
comments:
  -
    author: "CODER"
    body: "Start: implement the approved Writer shell scrolling layout in the current checkout."
events:
  -
    type: "status"
    at: "2026-09-16T05:07:08.890Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implement the approved Writer shell scrolling layout in the current checkout."
  -
    type: "verify"
    at: "2026-09-16T05:12:05.909Z"
    author: "CODER"
    state: "ok"
    note: "Verified: Writer shell now uses a viewport-height flex column; header and footer are non-shrinking, the central region owns remaining height, and only the document canvas has overflow-auto. Sidebar remains fixed in the central layout with overflow hidden."
  -
    type: "verify"
    at: "2026-09-16T05:12:22.564Z"
    author: "CODER"
    state: "ok"
    note: "verified-202609160506-5CHF99"
  -
    type: "verify"
    at: "2026-09-16T05:12:42.640Z"
    author: "CODER"
    state: "ok"
    note: "verified-202609160506-5CHF99"
doc_version: 3
doc_updated_at: "2026-09-16T05:12:42.717Z"
doc_updated_by: "CODER"
description: "Make the Writer header, footer, and sidebar fixed while restricting scrolling to the Writer document canvas. Keep the change within the existing frontend layout/CSS scope and preserve current behavior outside scrolling/layout."
sections:
  Summary: |-
    Fix Writer shell layout

    Make the Writer header, footer, and sidebar fixed while restricting scrolling to the Writer document canvas. Keep the change within the existing frontend layout/CSS scope and preserve current behavior outside scrolling/layout.
  Scope: |-
    - In scope: Make the Writer header, footer, and sidebar fixed while restricting scrolling to the Writer document canvas. Keep the change within the existing frontend layout/CSS scope and preserve current behavior outside scrolling/layout.
    - Out of scope: unrelated refactors not required for "Fix Writer shell layout".
  Plan: |-
    Summary: Fix the Writer shell so header, sidebar, and footer remain fixed while only the document canvas scrolls.

    Scope: Inspect and modify the existing Writer frontend layout/styles only; no new dependencies, no backend or product behavior changes.

    Plan: 1. Inspect the Writer shell component and CSS/layout constraints. 2. Apply the smallest layout/overflow changes so the viewport shell is fixed and the document canvas owns scrolling. 3. Run the project's available build/lint/test checks and inspect the diff.

    Verify Steps: ap task verify-show 202609160506-5CHF99; npm run build; npm run lint (if available); git diff --check; git status --short --untracked-files=all.

    Verification: Pending implementation.

    Rollback Plan: Revert the task-scoped frontend layout/CSS changes.

    Findings: None yet.
  Verify Steps: |-
    PLANNER fallback scaffold for "Fix Writer shell layout". Replace with task-specific acceptance checks when PLANNER context is available.

    1. Review the requested outcome for "Fix Writer shell layout". Expected: the visible result matches ## Summary and stays inside approved scope.
    2. Run the most relevant validation step for this task. Expected: it succeeds without unexpected regressions in touched behavior.
    3. Compare the final result against ## Scope and record any residual follow-up in ## Findings. Expected: open edges are explicit rather than implicit.
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-09-16T05:12:05.909Z — VERIFY — ok

    By: CODER

    Note: Verified: Writer shell now uses a viewport-height flex column; header and footer are non-shrinking, the central region owns remaining height, and only the document canvas has overflow-auto. Sidebar remains fixed in the central layout with overflow hidden.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-16T05:07:08.890Z, excerpt_hash=sha256:97ad702a11bd2706de3f49ae7c291645d7d2826d0ca978471f2e8799f97cc847

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609160506-5CHF99/blueprint/resolved-snapshot.json
    - old_digest: c5dc96c634becf5d675a40f1616e10a16c7f3258e416150f37affe3672c1aa42
    - current_digest: c5dc96c634becf5d675a40f1616e10a16c7f3258e416150f37affe3672c1aa42
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202609160506-5CHF99

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202609160506-5CHF99
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: true
    - repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
    - risks: none

    ### 2026-09-16T05:12:22.564Z — VERIFY — ok

    By: CODER

    Note: verified-202609160506-5CHF99
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-16T05:12:05.989Z, excerpt_hash=sha256:97ad702a11bd2706de3f49ae7c291645d7d2826d0ca978471f2e8799f97cc847

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609160506-5CHF99/blueprint/resolved-snapshot.json
    - old_digest: c5dc96c634becf5d675a40f1616e10a16c7f3258e416150f37affe3672c1aa42
    - current_digest: c5dc96c634becf5d675a40f1616e10a16c7f3258e416150f37affe3672c1aa42
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202609160506-5CHF99

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task complete 202609160506-5CHF99 --result verified-202609160506-5CHF99 --commit b345425c2bc430fc5af9e1e4271eb3d85e85b16b
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: true
    - repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
    - risks: none

    ### 2026-09-16T05:12:42.640Z — VERIFY — ok

    By: CODER

    Note: verified-202609160506-5CHF99
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-16T05:12:22.646Z, excerpt_hash=sha256:97ad702a11bd2706de3f49ae7c291645d7d2826d0ca978471f2e8799f97cc847

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609160506-5CHF99/blueprint/resolved-snapshot.json
    - old_digest: c5dc96c634becf5d675a40f1616e10a16c7f3258e416150f37affe3672c1aa42
    - current_digest: c5dc96c634becf5d675a40f1616e10a16c7f3258e416150f37affe3672c1aa42
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202609160506-5CHF99

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task complete 202609160506-5CHF99 --result verified-202609160506-5CHF99 --commit b345425c2bc430fc5af9e1e4271eb3d85e85b16b
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
    - Observation: Command: npm run build; npm run lint; npx prettier --check apps/office/src/sw/browser/presentation/WriterWorkspaceChrome.tsx; git diff --check; npx vitest run src/sw/browser/presentation/writer-view.test.tsx src/sw/browser/presentation/WriterMenuBar.test.tsx. Result: pass. Evidence: production build completed, ESLint and Prettier passed, diff check clean, 2 test files and 21 tests passed. Scope: WriterWorkspaceChrome layout and relevant Writer UI behavior.
      Impact: The targeted coverage wrapper was not used as evidence because it returned non-zero after the 2 tests passed due the repository-wide 100% coverage threshold when only two files were selected.
      Resolution: Validated the same Writer tests with plain vitest without coverage; all 21 tests passed, and full build/lint/format checks passed.
id_source: "generated"
---
## Summary

Fix Writer shell layout

Make the Writer header, footer, and sidebar fixed while restricting scrolling to the Writer document canvas. Keep the change within the existing frontend layout/CSS scope and preserve current behavior outside scrolling/layout.

## Scope

- In scope: Make the Writer header, footer, and sidebar fixed while restricting scrolling to the Writer document canvas. Keep the change within the existing frontend layout/CSS scope and preserve current behavior outside scrolling/layout.
- Out of scope: unrelated refactors not required for "Fix Writer shell layout".

## Plan

Summary: Fix the Writer shell so header, sidebar, and footer remain fixed while only the document canvas scrolls.

Scope: Inspect and modify the existing Writer frontend layout/styles only; no new dependencies, no backend or product behavior changes.

Plan: 1. Inspect the Writer shell component and CSS/layout constraints. 2. Apply the smallest layout/overflow changes so the viewport shell is fixed and the document canvas owns scrolling. 3. Run the project's available build/lint/test checks and inspect the diff.

Verify Steps: ap task verify-show 202609160506-5CHF99; npm run build; npm run lint (if available); git diff --check; git status --short --untracked-files=all.

Verification: Pending implementation.

Rollback Plan: Revert the task-scoped frontend layout/CSS changes.

Findings: None yet.

## Verify Steps

PLANNER fallback scaffold for "Fix Writer shell layout". Replace with task-specific acceptance checks when PLANNER context is available.

1. Review the requested outcome for "Fix Writer shell layout". Expected: the visible result matches ## Summary and stays inside approved scope.
2. Run the most relevant validation step for this task. Expected: it succeeds without unexpected regressions in touched behavior.
3. Compare the final result against ## Scope and record any residual follow-up in ## Findings. Expected: open edges are explicit rather than implicit.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-09-16T05:12:05.909Z — VERIFY — ok

By: CODER

Note: Verified: Writer shell now uses a viewport-height flex column; header and footer are non-shrinking, the central region owns remaining height, and only the document canvas has overflow-auto. Sidebar remains fixed in the central layout with overflow hidden.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-16T05:07:08.890Z, excerpt_hash=sha256:97ad702a11bd2706de3f49ae7c291645d7d2826d0ca978471f2e8799f97cc847

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609160506-5CHF99/blueprint/resolved-snapshot.json
- old_digest: c5dc96c634becf5d675a40f1616e10a16c7f3258e416150f37affe3672c1aa42
- current_digest: c5dc96c634becf5d675a40f1616e10a16c7f3258e416150f37affe3672c1aa42
- route_changed: no
- safe_command: agentplane blueprint snapshot 202609160506-5CHF99

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202609160506-5CHF99
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: true
- repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
- risks: none

### 2026-09-16T05:12:22.564Z — VERIFY — ok

By: CODER

Note: verified-202609160506-5CHF99
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-16T05:12:05.989Z, excerpt_hash=sha256:97ad702a11bd2706de3f49ae7c291645d7d2826d0ca978471f2e8799f97cc847

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609160506-5CHF99/blueprint/resolved-snapshot.json
- old_digest: c5dc96c634becf5d675a40f1616e10a16c7f3258e416150f37affe3672c1aa42
- current_digest: c5dc96c634becf5d675a40f1616e10a16c7f3258e416150f37affe3672c1aa42
- route_changed: no
- safe_command: agentplane blueprint snapshot 202609160506-5CHF99

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task complete 202609160506-5CHF99 --result verified-202609160506-5CHF99 --commit b345425c2bc430fc5af9e1e4271eb3d85e85b16b
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: true
- repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
- risks: none

### 2026-09-16T05:12:42.640Z — VERIFY — ok

By: CODER

Note: verified-202609160506-5CHF99
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-16T05:12:22.646Z, excerpt_hash=sha256:97ad702a11bd2706de3f49ae7c291645d7d2826d0ca978471f2e8799f97cc847

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609160506-5CHF99/blueprint/resolved-snapshot.json
- old_digest: c5dc96c634becf5d675a40f1616e10a16c7f3258e416150f37affe3672c1aa42
- current_digest: c5dc96c634becf5d675a40f1616e10a16c7f3258e416150f37affe3672c1aa42
- route_changed: no
- safe_command: agentplane blueprint snapshot 202609160506-5CHF99

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task complete 202609160506-5CHF99 --result verified-202609160506-5CHF99 --commit b345425c2bc430fc5af9e1e4271eb3d85e85b16b
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

- Observation: Command: npm run build; npm run lint; npx prettier --check apps/office/src/sw/browser/presentation/WriterWorkspaceChrome.tsx; git diff --check; npx vitest run src/sw/browser/presentation/writer-view.test.tsx src/sw/browser/presentation/WriterMenuBar.test.tsx. Result: pass. Evidence: production build completed, ESLint and Prettier passed, diff check clean, 2 test files and 21 tests passed. Scope: WriterWorkspaceChrome layout and relevant Writer UI behavior.
  Impact: The targeted coverage wrapper was not used as evidence because it returned non-zero after the 2 tests passed due the repository-wide 100% coverage threshold when only two files were selected.
  Resolution: Validated the same Writer tests with plain vitest without coverage; all 21 tests passed, and full build/lint/format checks passed.
