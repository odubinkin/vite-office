---
id: "202609130742-SXGE2Q"
title: "Implement Stage 2 persistent Writer session and unified dispatch"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 10
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-09-13T07:43:14.422Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-09-13T08:38:43.662Z"
  updated_by: "CODER"
  note: "verified-202609130742-SXGE2Q"
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-09-13T08:38:29.547Z"
  updated_by: "EVALUATOR"
  note: "Stage 2 implementation satisfies the approved ownership, dispatch, state, remount, and DOM-free command acceptance criteria."
  evaluated_sha: "3e6450165ead6b109fa93eb36deb665a55a39601"
  blueprint_digest: "ae06b912b7d24013de4df99ace610d33e15ea6fcf6b3972b04f3ce2cb1391e69"
  evidence_refs:
    - ".agentplane/tasks/202609130742-SXGE2Q/README.md"
    - ".agentplane/tasks/202609130742-SXGE2Q/quality/20260913-083829547-recovery-context/quality-report.json"
    - ".agentplane/tasks/202609130742-SXGE2Q/quality/20260913-083829547-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202609130742-SXGE2Q/quality/20260913-083829547-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202609130742-SXGE2Q/blueprint/resolved-snapshot.json"
    - "3e6450165ead"
    - "npm run verify: pass (184 runtime tests, 79 inventory tests, 8 Playwright tests, 100% coverage)"
    - "vendor/libreoffice-reference/include/sfx2/dispatch.hxx"
    - "vendor/libreoffice-reference/sfx2/source/control/dispatch.cxx"
    - "vendor/libreoffice-reference/sw/source/uibase/wrtsh/wrtsh1.cxx"
  findings:
    - "SfxDispatcher resolves last-pushed shells first and centralizes execution, state, shortcuts, and invalidation."
    - "Writer lifecycle and editing state persist in SwDocShell, SwView, SwWrtShell, and SwPaM across React remount and New/Open/Save operations."
    - "No Stage 3 action-based undo or new product behavior was introduced; snapshot history remains explicitly temporary."
commit: null
comments:
  -
    author: "CODER"
    body: "Start: continue direct-mode task in current checkout."
events:
  -
    type: "status"
    at: "2026-09-13T07:43:29.342Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: continue direct-mode task in current checkout."
  -
    type: "verify"
    at: "2026-09-13T08:38:08.531Z"
    author: "CODER"
    state: "ok"
    note: "All declared checks passed: npm run verify; npm test -- --run; production build; routing policy; ap doctor. Runtime 184 tests and inventory 79 tests passed at 100% coverage; 8 Playwright scenarios passed."
  -
    type: "verify"
    at: "2026-09-13T08:38:43.662Z"
    author: "CODER"
    state: "ok"
    note: "verified-202609130742-SXGE2Q"
doc_version: 3
doc_updated_at: "2026-09-13T08:38:43.713Z"
doc_updated_by: "CODER"
description: "Implement section 6 of docs/program/vite-office-upstream-parity-plan.md: persistent SwDocShell/SwView/SwWrtShell ownership, React external-store subscription, descriptor-based command dispatch and migration of menu/toolbar/shortcuts, closely following local upstream LibreOffice evidence without entering Stage 3 action-based undo."
sections:
  Summary: |-
    Implement Stage 2 persistent Writer session and unified dispatch

    Implement section 6 of docs/program/vite-office-upstream-parity-plan.md: persistent SwDocShell/SwView/SwWrtShell ownership, React external-store subscription, descriptor-based command dispatch and migration of menu/toolbar/shortcuts, closely following local upstream LibreOffice evidence without entering Stage 3 action-based undo.
  Scope: |-
    - In scope: persistent Writer document/session ownership in SwDocShell, SwView and SwWrtShell; immutable React snapshots and subscription; descriptor-based command dispatch; active frame/view/shell resolution; migration of Writer menu, toolbar and keyboard shortcuts; focused tests and documentation needed for traceability.
    - Upstream constraint: follow locally available LibreOffice source mappings and preserve relevant shell/dispatch semantics; do not invent product behavior.
    - Out of scope: Stage 3 action-based undo, new Writer features, network access, unrelated refactors, and changes to the user-owned untracked parity plan.
  Plan: |-
    1. Audit current Writer lifecycle, view ownership, dispatch entry points, tests, and repository-local LibreOffice source evidence.
    2. Implement persistent SwDocShell-owned document session with SwView/SwWrtShell lifetime and immutable versioned snapshots for React.
    3. Implement typed command descriptors, shell/context lookup, state invalidation, and one execution path.
    4. Migrate menu, toolbar, shortcuts, and lifecycle UI calls to command IDs while preserving existing behavior.
    5. Add domain and React-level tests for persistence, shared handlers, state parity, remount behavior, and DOM-free command execution.
    6. Run task Verify Steps and repository policy checks; record evidence and finish through Agentplane.
  Verify Steps: |-
    1. Run npm run format:check. Expected: formatting passes.
    2. Run npm run lint. Expected: lint passes.
    3. Run npm run typecheck. Expected: TypeScript checks pass.
    4. Run npm test -- --run. Expected: unit and inventory tests pass, including focused Stage 2 tests for persistent session, dispatch convergence, command state, remount persistence, and DOM-free execution.
    5. Run npm run build. Expected: production build succeeds.
    6. Run node .agentplane/policy/check-routing.mjs. Expected: routing policy passes.
    7. Run ap doctor. Expected: Agentplane repository checks pass.
    8. Inspect git status --short --untracked-files=all. Expected: only intentional task files and the pre-existing user-owned untracked parity plan are present.
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-09-13T08:38:08.531Z — VERIFY — ok

    By: CODER

    Note: All declared checks passed: npm run verify; npm test -- --run; production build; routing policy; ap doctor. Runtime 184 tests and inventory 79 tests passed at 100% coverage; 8 Playwright scenarios passed.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-13T07:43:29.342Z, excerpt_hash=sha256:9cf67b1415b18f21020c474d2bbd7322ea9721b5d6b40520196a2fd61449234b

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609130742-SXGE2Q/blueprint/resolved-snapshot.json
    - old_digest: ae06b912b7d24013de4df99ace610d33e15ea6fcf6b3972b04f3ce2cb1391e69
    - current_digest: ae06b912b7d24013de4df99ace610d33e15ea6fcf6b3972b04f3ce2cb1391e69
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202609130742-SXGE2Q

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202609130742-SXGE2Q
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: true
    - repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
    - risks: none

    ### 2026-09-13T08:38:43.662Z — VERIFY — ok

    By: CODER

    Note: verified-202609130742-SXGE2Q
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-13T08:38:08.592Z, excerpt_hash=sha256:9cf67b1415b18f21020c474d2bbd7322ea9721b5d6b40520196a2fd61449234b

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609130742-SXGE2Q/blueprint/resolved-snapshot.json
    - old_digest: ae06b912b7d24013de4df99ace610d33e15ea6fcf6b3972b04f3ce2cb1391e69
    - current_digest: ae06b912b7d24013de4df99ace610d33e15ea6fcf6b3972b04f3ce2cb1391e69
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202609130742-SXGE2Q

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task complete 202609130742-SXGE2Q --result verified-202609130742-SXGE2Q --commit 3e6450165ead6b109fa93eb36deb665a55a39601
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: true
    - repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: |-
    - Revert only the implementation and task-lifecycle commits associated with 202609130742-SXGE2Q.
    - Restore the pre-Stage-2 React ownership and direct command callbacks if rollback is required.
    - Re-run the declared Verify Steps after rollback.
    - Preserve docs/program/vite-office-upstream-parity-plan.md because it predates and is outside task-owned edits.
  Findings: |-
    - Observation: Persistent session identity, shell-priority dispatch, shared UI command routing, command state, ODT lifecycle, and React remount behavior are covered.
      Impact: Stage 2 removes canonical Writer document and command ownership from React while preserving existing browser behavior.
      Resolution: Implemented persistent OfficeFrame/SwDocShell/SwView/SwWrtShell ownership and descriptor-based SfxDispatcher routing from pinned local LibreOffice sources.
id_source: "generated"
---
## Summary

Implement Stage 2 persistent Writer session and unified dispatch

Implement section 6 of docs/program/vite-office-upstream-parity-plan.md: persistent SwDocShell/SwView/SwWrtShell ownership, React external-store subscription, descriptor-based command dispatch and migration of menu/toolbar/shortcuts, closely following local upstream LibreOffice evidence without entering Stage 3 action-based undo.

## Scope

- In scope: persistent Writer document/session ownership in SwDocShell, SwView and SwWrtShell; immutable React snapshots and subscription; descriptor-based command dispatch; active frame/view/shell resolution; migration of Writer menu, toolbar and keyboard shortcuts; focused tests and documentation needed for traceability.
- Upstream constraint: follow locally available LibreOffice source mappings and preserve relevant shell/dispatch semantics; do not invent product behavior.
- Out of scope: Stage 3 action-based undo, new Writer features, network access, unrelated refactors, and changes to the user-owned untracked parity plan.

## Plan

1. Audit current Writer lifecycle, view ownership, dispatch entry points, tests, and repository-local LibreOffice source evidence.
2. Implement persistent SwDocShell-owned document session with SwView/SwWrtShell lifetime and immutable versioned snapshots for React.
3. Implement typed command descriptors, shell/context lookup, state invalidation, and one execution path.
4. Migrate menu, toolbar, shortcuts, and lifecycle UI calls to command IDs while preserving existing behavior.
5. Add domain and React-level tests for persistence, shared handlers, state parity, remount behavior, and DOM-free command execution.
6. Run task Verify Steps and repository policy checks; record evidence and finish through Agentplane.

## Verify Steps

1. Run npm run format:check. Expected: formatting passes.
2. Run npm run lint. Expected: lint passes.
3. Run npm run typecheck. Expected: TypeScript checks pass.
4. Run npm test -- --run. Expected: unit and inventory tests pass, including focused Stage 2 tests for persistent session, dispatch convergence, command state, remount persistence, and DOM-free execution.
5. Run npm run build. Expected: production build succeeds.
6. Run node .agentplane/policy/check-routing.mjs. Expected: routing policy passes.
7. Run ap doctor. Expected: Agentplane repository checks pass.
8. Inspect git status --short --untracked-files=all. Expected: only intentional task files and the pre-existing user-owned untracked parity plan are present.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-09-13T08:38:08.531Z — VERIFY — ok

By: CODER

Note: All declared checks passed: npm run verify; npm test -- --run; production build; routing policy; ap doctor. Runtime 184 tests and inventory 79 tests passed at 100% coverage; 8 Playwright scenarios passed.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-13T07:43:29.342Z, excerpt_hash=sha256:9cf67b1415b18f21020c474d2bbd7322ea9721b5d6b40520196a2fd61449234b

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609130742-SXGE2Q/blueprint/resolved-snapshot.json
- old_digest: ae06b912b7d24013de4df99ace610d33e15ea6fcf6b3972b04f3ce2cb1391e69
- current_digest: ae06b912b7d24013de4df99ace610d33e15ea6fcf6b3972b04f3ce2cb1391e69
- route_changed: no
- safe_command: agentplane blueprint snapshot 202609130742-SXGE2Q

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202609130742-SXGE2Q
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: true
- repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
- risks: none

### 2026-09-13T08:38:43.662Z — VERIFY — ok

By: CODER

Note: verified-202609130742-SXGE2Q
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-13T08:38:08.592Z, excerpt_hash=sha256:9cf67b1415b18f21020c474d2bbd7322ea9721b5d6b40520196a2fd61449234b

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609130742-SXGE2Q/blueprint/resolved-snapshot.json
- old_digest: ae06b912b7d24013de4df99ace610d33e15ea6fcf6b3972b04f3ce2cb1391e69
- current_digest: ae06b912b7d24013de4df99ace610d33e15ea6fcf6b3972b04f3ce2cb1391e69
- route_changed: no
- safe_command: agentplane blueprint snapshot 202609130742-SXGE2Q

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task complete 202609130742-SXGE2Q --result verified-202609130742-SXGE2Q --commit 3e6450165ead6b109fa93eb36deb665a55a39601
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: true
- repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert only the implementation and task-lifecycle commits associated with 202609130742-SXGE2Q.
- Restore the pre-Stage-2 React ownership and direct command callbacks if rollback is required.
- Re-run the declared Verify Steps after rollback.
- Preserve docs/program/vite-office-upstream-parity-plan.md because it predates and is outside task-owned edits.

## Findings

- Observation: Persistent session identity, shell-priority dispatch, shared UI command routing, command state, ODT lifecycle, and React remount behavior are covered.
  Impact: Stage 2 removes canonical Writer document and command ownership from React while preserving existing browser behavior.
  Resolution: Implemented persistent OfficeFrame/SwDocShell/SwView/SwWrtShell ownership and descriptor-based SfxDispatcher routing from pinned local LibreOffice sources.
