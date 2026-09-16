---
id: "202609160657-SVHC8B"
title: "Move editor menus into document title bar"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 10
origin:
  system: "manual"
depends_on: []
tags:
  - "frontend"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-09-16T06:57:14.224Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-09-16T07:04:34.242Z"
  updated_by: "CODER"
  note: "verified-202609160657-SVHC8B"
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-09-16T07:04:51.506Z"
  updated_by: "EVALUATOR"
  note: "Writer header layout matches the approved single-row placement"
  evaluated_sha: "a8570f934c74ccc0d94b0627db3c2a32fef38d76"
  blueprint_digest: "b04eb919f2e037d24da86bfa7f3d03820071176c31721cda1be9978d4864a741"
  evidence_refs:
    - ".agentplane/tasks/202609160657-SVHC8B/README.md"
    - ".agentplane/tasks/202609160657-SVHC8B/quality/20260916-070451506-recovery-context/quality-report.json"
    - ".agentplane/tasks/202609160657-SVHC8B/quality/20260916-070451506-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202609160657-SVHC8B/quality/20260916-070451506-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202609160657-SVHC8B/blueprint/resolved-snapshot.json"
    - "apps/office/src/sw/browser/presentation/WriterWorkspaceChrome.tsx; npm run build; npm run format:check; npm run lint; npm run typecheck; node .agentplane/policy/check-routing.mjs; Playwright CLI result: sameRow=true, menuStartsAfterTitle=true"
  findings:
    - "WriterWorkspaceChrome now places the existing menubar beside the document title and workbench subtitle; format/lint/typecheck/build/routing/doctor and direct Playwright geometry checks pass. Full Vitest has four unrelated async clipboard/storage/download failures, and the standard e2e runner is blocked by an occupied 4173 port."
commit: null
comments:
  -
    author: "CODER"
    body: "Start: inspect the editor header/menu layout, implement the approved single-row placement, and verify the scoped UI change."
events:
  -
    type: "status"
    at: "2026-09-16T06:57:22.732Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: inspect the editor header/menu layout, implement the approved single-row placement, and verify the scoped UI change."
  -
    type: "verify"
    at: "2026-09-16T07:04:20.848Z"
    author: "CODER"
    state: "ok"
    note: "Verified: WriterWorkspaceChrome now renders the existing Writer menubar beside the document title/workbench subtitle in the same top row; format, lint, typecheck, build, routing, doctor, and direct Playwright geometry checks pass. Full Vitest/e2e gaps are recorded as unrelated environment failures."
  -
    type: "verify"
    at: "2026-09-16T07:04:34.242Z"
    author: "CODER"
    state: "ok"
    note: "verified-202609160657-SVHC8B"
doc_version: 3
doc_updated_at: "2026-09-16T07:04:34.317Z"
doc_updated_by: "CODER"
description: "Move the File/Edit/etc. menu row into the same top row as the document name and the writer - browser workbench label, immediately to its right, to increase usable vertical space. Preserve existing menu behavior and limit changes to the UI layout/styles needed for this header."
sections:
  Summary: |-
    Move editor menus into document title bar

    Move the File/Edit/etc. menu row into the same top row as the document name and the writer - browser workbench label, immediately to its right, to increase usable vertical space. Preserve existing menu behavior and limit changes to the UI layout/styles needed for this header.
  Scope: |-
    - In scope: Move the File/Edit/etc. menu row into the same top row as the document name and the writer - browser workbench label, immediately to its right, to increase usable vertical space. Preserve existing menu behavior and limit changes to the UI layout/styles needed for this header.
    - Out of scope: unrelated refactors not required for "Move editor menus into document title bar".
  Plan: "Scope: adjust the editor header layout and its styles so the existing File/Edit/etc. menus render immediately to the right of the document-name/workbench-label area in one row. Preserve menu items and behavior; do not change unrelated editor logic. Plan: inspect relevant React/CSS files; apply the smallest layout/style change; run the declared checks and inspect the resulting UI if a local browser check is available. Verify Steps: ap task verify-show 202609160657-SVHC8B; npm test -- --run; npm run build; node .agentplane/policy/check-routing.mjs; git status --short --untracked-files=all. Rollback Plan: revert only the task-scoped source/style changes if verification fails."
  Verify Steps: |-
    1. command: npm run format:check; expected: all files pass Prettier check.
    2. command: npm run lint; expected: ESLint passes with zero warnings.
    3. command: npm run typecheck; expected: tools and office TypeScript checks pass.
    4. command: npm run build; expected: production Vite build succeeds.
    5. command: npm run test:coverage --workspace @vite-office/office -- src/sw/browser/presentation/WriterMenuBar.test.tsx src/sw/browser/presentation/writer-view.test.tsx; expected: targeted Writer tests pass.
    6. command: npm test -- --run; expected: project test suite passes.
    7. command: node .agentplane/policy/check-routing.mjs; expected: policy routing OK.
    8. command: agentplane doctor; expected: doctor OK.
    9. Browser check: Writer route shows the menu bar on the same horizontal row as the document title/workbench subtitle, with menus immediately to the right; standard toolbar starts below that row.
    10. command: git status --short --untracked-files=all; expected: only task-scoped source and task artifacts remain before closeout.
  Verification: |-
    PASS: npm run format:check — all matched files use Prettier code style.
    PASS: npm run lint — exited 0.
    PASS: npm run typecheck — tools and office TypeScript checks exited 0.
    PASS: npm run build — production Vite build succeeded.
    PASS: node .agentplane/policy/check-routing.mjs — policy routing OK.
    PASS: agentplane doctor — doctor OK; one pre-existing warning about a prior task close commit and informational fallback-hook notes.
    PASS: Playwright CLI browser check — title y=8, menubar y=9.5, menubar starts at x=244.6 after title right edge x=196.4; standard toolbar starts at y=52.
    FAIL: npm run test:coverage --workspace @vite-office/office -- src/sw/browser/presentation/WriterMenuBar.test.tsx src/sw/browser/presentation/writer-view.test.tsx — 21 passed, 2 failed in existing clipboard writeText assertions.
    FAIL: npm test -- --run — 329 passed, 4 failed; same 2 clipboard failures plus 2 existing storage/download async status assertions.
    BLOCKED: npm run test:e2e — build passed, but Playwright runner could not start because port 4173 is already occupied and config sets reuseExistingServer=false.
    Not a layout regression: the changed component is WriterWorkspaceChrome layout only; browser accessibility tree and visual coordinates confirm the requested placement.

    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-09-16T07:04:20.848Z — VERIFY — ok

    By: CODER

    Note: Verified: WriterWorkspaceChrome now renders the existing Writer menubar beside the document title/workbench subtitle in the same top row; format, lint, typecheck, build, routing, doctor, and direct Playwright geometry checks pass. Full Vitest/e2e gaps are recorded as unrelated environment failures.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-16T07:02:53.686Z, excerpt_hash=sha256:550ef25111cb3dca2fc1993bb513f34a5ea90c0a7c8a27d4b1c7227e449d3bfa

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609160657-SVHC8B/blueprint/resolved-snapshot.json
    - old_digest: b04eb919f2e037d24da86bfa7f3d03820071176c31721cda1be9978d4864a741
    - current_digest: b04eb919f2e037d24da86bfa7f3d03820071176c31721cda1be9978d4864a741
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202609160657-SVHC8B

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202609160657-SVHC8B
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: true
    - repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
    - risks: none

    ### 2026-09-16T07:04:34.242Z — VERIFY — ok

    By: CODER

    Note: verified-202609160657-SVHC8B
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-16T07:04:20.928Z, excerpt_hash=sha256:550ef25111cb3dca2fc1993bb513f34a5ea90c0a7c8a27d4b1c7227e449d3bfa

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609160657-SVHC8B/blueprint/resolved-snapshot.json
    - old_digest: b04eb919f2e037d24da86bfa7f3d03820071176c31721cda1be9978d4864a741
    - current_digest: b04eb919f2e037d24da86bfa7f3d03820071176c31721cda1be9978d4864a741
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202609160657-SVHC8B

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task complete 202609160657-SVHC8B --result verified-202609160657-SVHC8B --commit a8570f934c74ccc0d94b0627db3c2a32fef38d76
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
    - Existing test-environment failures: clipboard tests expect navigator clipboard writeText calls but receive none; desktop storage/download tests time out while waiting for async status text. These failures reproduce in isolated targeted runs and do not exercise the changed layout code path.
    - E2E runner could not start because 127.0.0.1:4173 is already occupied by an existing vite preview process while reuseExistingServer=false. Manual Playwright CLI validation against the running dev server passed.
    - Residual risk: full automated suite and standard e2e command remain non-green due environment/test issues unrelated to this one-file layout change.

    - Observation: The project Vitest run reports four existing async clipboard/storage/download assertion failures, and the standard e2e runner cannot bind because port 4173 is occupied while reuseExistingServer=false.
      Impact: The requested layout is browser-verified, but the full automated suite is not green and the standard e2e command has no fresh run.
      Resolution: Reproduced the clipboard failures in isolated targeted runs, confirmed build and direct Playwright layout geometry, and recorded the residual gaps in the task Findings.
id_source: "generated"
---
## Summary

Move editor menus into document title bar

Move the File/Edit/etc. menu row into the same top row as the document name and the writer - browser workbench label, immediately to its right, to increase usable vertical space. Preserve existing menu behavior and limit changes to the UI layout/styles needed for this header.

## Scope

- In scope: Move the File/Edit/etc. menu row into the same top row as the document name and the writer - browser workbench label, immediately to its right, to increase usable vertical space. Preserve existing menu behavior and limit changes to the UI layout/styles needed for this header.
- Out of scope: unrelated refactors not required for "Move editor menus into document title bar".

## Plan

Scope: adjust the editor header layout and its styles so the existing File/Edit/etc. menus render immediately to the right of the document-name/workbench-label area in one row. Preserve menu items and behavior; do not change unrelated editor logic. Plan: inspect relevant React/CSS files; apply the smallest layout/style change; run the declared checks and inspect the resulting UI if a local browser check is available. Verify Steps: ap task verify-show 202609160657-SVHC8B; npm test -- --run; npm run build; node .agentplane/policy/check-routing.mjs; git status --short --untracked-files=all. Rollback Plan: revert only the task-scoped source/style changes if verification fails.

## Verify Steps

1. command: npm run format:check; expected: all files pass Prettier check.
2. command: npm run lint; expected: ESLint passes with zero warnings.
3. command: npm run typecheck; expected: tools and office TypeScript checks pass.
4. command: npm run build; expected: production Vite build succeeds.
5. command: npm run test:coverage --workspace @vite-office/office -- src/sw/browser/presentation/WriterMenuBar.test.tsx src/sw/browser/presentation/writer-view.test.tsx; expected: targeted Writer tests pass.
6. command: npm test -- --run; expected: project test suite passes.
7. command: node .agentplane/policy/check-routing.mjs; expected: policy routing OK.
8. command: agentplane doctor; expected: doctor OK.
9. Browser check: Writer route shows the menu bar on the same horizontal row as the document title/workbench subtitle, with menus immediately to the right; standard toolbar starts below that row.
10. command: git status --short --untracked-files=all; expected: only task-scoped source and task artifacts remain before closeout.

## Verification

PASS: npm run format:check — all matched files use Prettier code style.
PASS: npm run lint — exited 0.
PASS: npm run typecheck — tools and office TypeScript checks exited 0.
PASS: npm run build — production Vite build succeeded.
PASS: node .agentplane/policy/check-routing.mjs — policy routing OK.
PASS: agentplane doctor — doctor OK; one pre-existing warning about a prior task close commit and informational fallback-hook notes.
PASS: Playwright CLI browser check — title y=8, menubar y=9.5, menubar starts at x=244.6 after title right edge x=196.4; standard toolbar starts at y=52.
FAIL: npm run test:coverage --workspace @vite-office/office -- src/sw/browser/presentation/WriterMenuBar.test.tsx src/sw/browser/presentation/writer-view.test.tsx — 21 passed, 2 failed in existing clipboard writeText assertions.
FAIL: npm test -- --run — 329 passed, 4 failed; same 2 clipboard failures plus 2 existing storage/download async status assertions.
BLOCKED: npm run test:e2e — build passed, but Playwright runner could not start because port 4173 is already occupied and config sets reuseExistingServer=false.
Not a layout regression: the changed component is WriterWorkspaceChrome layout only; browser accessibility tree and visual coordinates confirm the requested placement.

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-09-16T07:04:20.848Z — VERIFY — ok

By: CODER

Note: Verified: WriterWorkspaceChrome now renders the existing Writer menubar beside the document title/workbench subtitle in the same top row; format, lint, typecheck, build, routing, doctor, and direct Playwright geometry checks pass. Full Vitest/e2e gaps are recorded as unrelated environment failures.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-16T07:02:53.686Z, excerpt_hash=sha256:550ef25111cb3dca2fc1993bb513f34a5ea90c0a7c8a27d4b1c7227e449d3bfa

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609160657-SVHC8B/blueprint/resolved-snapshot.json
- old_digest: b04eb919f2e037d24da86bfa7f3d03820071176c31721cda1be9978d4864a741
- current_digest: b04eb919f2e037d24da86bfa7f3d03820071176c31721cda1be9978d4864a741
- route_changed: no
- safe_command: agentplane blueprint snapshot 202609160657-SVHC8B

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202609160657-SVHC8B
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: true
- repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
- risks: none

### 2026-09-16T07:04:34.242Z — VERIFY — ok

By: CODER

Note: verified-202609160657-SVHC8B
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-16T07:04:20.928Z, excerpt_hash=sha256:550ef25111cb3dca2fc1993bb513f34a5ea90c0a7c8a27d4b1c7227e449d3bfa

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609160657-SVHC8B/blueprint/resolved-snapshot.json
- old_digest: b04eb919f2e037d24da86bfa7f3d03820071176c31721cda1be9978d4864a741
- current_digest: b04eb919f2e037d24da86bfa7f3d03820071176c31721cda1be9978d4864a741
- route_changed: no
- safe_command: agentplane blueprint snapshot 202609160657-SVHC8B

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task complete 202609160657-SVHC8B --result verified-202609160657-SVHC8B --commit a8570f934c74ccc0d94b0627db3c2a32fef38d76
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

- Existing test-environment failures: clipboard tests expect navigator clipboard writeText calls but receive none; desktop storage/download tests time out while waiting for async status text. These failures reproduce in isolated targeted runs and do not exercise the changed layout code path.
- E2E runner could not start because 127.0.0.1:4173 is already occupied by an existing vite preview process while reuseExistingServer=false. Manual Playwright CLI validation against the running dev server passed.
- Residual risk: full automated suite and standard e2e command remain non-green due environment/test issues unrelated to this one-file layout change.

- Observation: The project Vitest run reports four existing async clipboard/storage/download assertion failures, and the standard e2e runner cannot bind because port 4173 is occupied while reuseExistingServer=false.
  Impact: The requested layout is browser-verified, but the full automated suite is not green and the standard e2e command has no fresh run.
  Resolution: Reproduced the clipboard failures in isolated targeted runs, confirmed build and direct Playwright layout geometry, and recorded the residual gaps in the task Findings.
