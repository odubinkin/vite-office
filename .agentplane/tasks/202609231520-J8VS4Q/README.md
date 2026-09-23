---
id: "202609231520-J8VS4Q"
title: "Restore Writer undo manager ownership"
status: "DOING"
priority: "high"
owner: "CODER"
revision: 9
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-09-23T15:20:54.602Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-09-23T15:34:02.186Z"
  updated_by: "CODER"
  note: "verified-202609231520-J8VS4Q"
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-09-23T15:34:17.552Z"
  updated_by: "EVALUATOR"
  note: "Writer undo ownership matches approved scope and all declared checks pass."
  evaluated_sha: "169798e4c6f3c8623e019bd9b2ad18a87da792a1"
  blueprint_digest: "057fd7264fb9736475a9a52650af48bc0d94dfedd3817b0376f2ced4795dda04"
  evidence_refs:
    - ".agentplane/tasks/202609231520-J8VS4Q/README.md"
    - ".agentplane/tasks/202609231520-J8VS4Q/quality/20260923-153417552-recovery-context/quality-report.json"
    - ".agentplane/tasks/202609231520-J8VS4Q/quality/20260923-153417552-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202609231520-J8VS4Q/quality/20260923-153417552-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202609231520-J8VS4Q/blueprint/resolved-snapshot.json"
    - "apps/office/src/sw/source/core/undo/docundo.ts"
    - "npm run test:coverage --workspace @vite-office/office"
    - "npm run typecheck"
    - "npm run lint"
  findings:
    - "SwDoc owns a Writer manager over Sfx; deleted text and joined nodes are retained and released with history actions; mixed action undo and redo return modified state to the save mark. 393 unit tests pass with 100 percent coverage, and static checks pass."
commit: null
comments:
  -
    author: "CODER"
    body: "Start: implement approved Writer undo manager ownership and verify supported operations and save boundaries."
events:
  -
    type: "status"
    at: "2026-09-23T15:21:02.858Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implement approved Writer undo manager ownership and verify supported operations and save boundaries."
  -
    type: "verify"
    at: "2026-09-23T15:33:51.909Z"
    author: "CODER"
    state: "ok"
    note: "Writer-owned manager, undo-node retention, replay, save mark, and cursor behavior verified by 393 passing office tests at 100 percent coverage; TypeScript, lint, boundaries, provenance, and policy checks passed."
  -
    type: "verify"
    at: "2026-09-23T15:34:02.186Z"
    author: "CODER"
    state: "ok"
    note: "verified-202609231520-J8VS4Q"
doc_version: 3
doc_updated_at: "2026-09-23T15:34:02.266Z"
doc_updated_by: "CODER"
description: "Implement parity plan item 3: document-owned sw::UndoManager with Writer grouping, cursor restoration, deleted-text retention, save marks, and supported command replay; preserve upstream structure and avoid legacy model compatibility."
sections:
  Summary: |-
    Restore Writer undo manager ownership

    Implement parity plan item 3: document-owned sw::UndoManager with Writer grouping, cursor restoration, deleted-text retention, save marks, and supported command replay; preserve upstream structure and avoid legacy model compatibility.
  Scope: |-
    - In scope: Implement parity plan item 3: document-owned sw::UndoManager with Writer grouping, cursor restoration, deleted-text retention, save marks, and supported command replay; preserve upstream structure and avoid legacy model compatibility.
    - Out of scope: unrelated refactors not required for "Restore Writer undo manager ownership".
  Plan: "1. Add sw/source/core/undo/docundo.ts as the SwDoc-owned Writer undo manager, retaining SfxUndoManager as the stack base. 2. Move Writer action grouping, cursor replay, deleted-content retention, and save-mark coordination into this owner; connect SwDoc and SwDocShell. 3. Add focused replay and save-boundary tests for supported text, split/join, formatting, list, page, and hyperlink actions; run repository checks and record evidence."
  Verify Steps: "1. Run npx vitest run apps/office/src/sw/source/core/undo/undobj.test.ts apps/office/src/sw/source/uibase/wrtsh/wrtsh.test.ts apps/office/src/sw/source/uibase/app/docsh.test.ts. Expected: Writer replay, grouping, cursor and save-boundary cases pass. 2. Run npm run typecheck. Expected: no TypeScript errors. 3. Run npm run lint and npm run check:dependencies. Expected: no lint or module-boundary errors. 4. Run npm run check:source-tree and npm run check:source-provenance. Expected: upstream path and source mapping valid. 5. Run npm run test:coverage --workspace @vite-office/office. Expected: full office unit suite passes. 6. Inspect git diff and git status --short --untracked-files=all. Expected: only approved files and task metadata changed."
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-09-23T15:33:51.909Z — VERIFY — ok

    By: CODER

    Note: Writer-owned manager, undo-node retention, replay, save mark, and cursor behavior verified by 393 passing office tests at 100 percent coverage; TypeScript, lint, boundaries, provenance, and policy checks passed.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-23T15:33:46.999Z, excerpt_hash=sha256:cce0f5b9d6a6b3874008aa66dd7553bb4e903ed26ec13a3644b8406718e1f78c

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609231520-J8VS4Q/blueprint/resolved-snapshot.json
    - old_digest: 057fd7264fb9736475a9a52650af48bc0d94dfedd3817b0376f2ced4795dda04
    - current_digest: 057fd7264fb9736475a9a52650af48bc0d94dfedd3817b0376f2ced4795dda04
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202609231520-J8VS4Q

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202609231520-J8VS4Q
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: false
    - repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
    - risks: none

    ### 2026-09-23T15:34:02.186Z — VERIFY — ok

    By: CODER

    Note: verified-202609231520-J8VS4Q
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-23T15:33:51.981Z, excerpt_hash=sha256:cce0f5b9d6a6b3874008aa66dd7553bb4e903ed26ec13a3644b8406718e1f78c

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609231520-J8VS4Q/blueprint/resolved-snapshot.json
    - old_digest: 057fd7264fb9736475a9a52650af48bc0d94dfedd3817b0376f2ced4795dda04
    - current_digest: 057fd7264fb9736475a9a52650af48bc0d94dfedd3817b0376f2ced4795dda04
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202609231520-J8VS4Q

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task complete 202609231520-J8VS4Q --result verified-202609231520-J8VS4Q --commit 169798e4c6f3c8623e019bd9b2ad18a87da792a1
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
    Command: npx vitest run apps/office/src/sw/source/core/undo/undobj.test.ts apps/office/src/sw/source/uibase/wrtsh/wrtsh.test.ts apps/office/src/sw/source/uibase/app/docsh.test.ts
    Result: pass
    Evidence: 3 files, 45 tests passed.
    Scope: Writer action replay, cursor restoration, undo-node retention, grouping, and save marks.

    Command: npm run test:coverage --workspace @vite-office/office
    Result: pass
    Evidence: 93 files, 393 tests passed; statements, branches, functions, and lines each 100%.
    Scope: full office unit suite.

    Command: npm run typecheck; npm run lint; npm run check:dependencies; npm run check:source-tree; npm run check:source-provenance
    Result: pass
    Evidence: TypeScript and ESLint clean; dependency, upstream tree, and provenance checks passed.
    Scope: implementation and source boundaries.

    Command: npx prettier --check <eight changed source and test files>; git diff --check; git status --short --untracked-files=all
    Result: pass
    Evidence: formatting and whitespace clean; only task-scoped changes observed before commit.
    Scope: changed files and repository state.

    Command: ap doctor; node .agentplane/policy/check-routing.mjs
    Result: pass
    Evidence: doctor OK with two pre-existing warnings about managed hook shim and old task commit; policy routing OK.
    Scope: workflow health.

    The first full coverage run failed the 100% gate because new ownership guard branches lacked tests. Added focused tests and reran successfully. No stored document model change or compatibility path was introduced.
id_source: "generated"
---
## Summary

Restore Writer undo manager ownership

Implement parity plan item 3: document-owned sw::UndoManager with Writer grouping, cursor restoration, deleted-text retention, save marks, and supported command replay; preserve upstream structure and avoid legacy model compatibility.

## Scope

- In scope: Implement parity plan item 3: document-owned sw::UndoManager with Writer grouping, cursor restoration, deleted-text retention, save marks, and supported command replay; preserve upstream structure and avoid legacy model compatibility.
- Out of scope: unrelated refactors not required for "Restore Writer undo manager ownership".

## Plan

1. Add sw/source/core/undo/docundo.ts as the SwDoc-owned Writer undo manager, retaining SfxUndoManager as the stack base. 2. Move Writer action grouping, cursor replay, deleted-content retention, and save-mark coordination into this owner; connect SwDoc and SwDocShell. 3. Add focused replay and save-boundary tests for supported text, split/join, formatting, list, page, and hyperlink actions; run repository checks and record evidence.

## Verify Steps

1. Run npx vitest run apps/office/src/sw/source/core/undo/undobj.test.ts apps/office/src/sw/source/uibase/wrtsh/wrtsh.test.ts apps/office/src/sw/source/uibase/app/docsh.test.ts. Expected: Writer replay, grouping, cursor and save-boundary cases pass. 2. Run npm run typecheck. Expected: no TypeScript errors. 3. Run npm run lint and npm run check:dependencies. Expected: no lint or module-boundary errors. 4. Run npm run check:source-tree and npm run check:source-provenance. Expected: upstream path and source mapping valid. 5. Run npm run test:coverage --workspace @vite-office/office. Expected: full office unit suite passes. 6. Inspect git diff and git status --short --untracked-files=all. Expected: only approved files and task metadata changed.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-09-23T15:33:51.909Z — VERIFY — ok

By: CODER

Note: Writer-owned manager, undo-node retention, replay, save mark, and cursor behavior verified by 393 passing office tests at 100 percent coverage; TypeScript, lint, boundaries, provenance, and policy checks passed.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-23T15:33:46.999Z, excerpt_hash=sha256:cce0f5b9d6a6b3874008aa66dd7553bb4e903ed26ec13a3644b8406718e1f78c

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609231520-J8VS4Q/blueprint/resolved-snapshot.json
- old_digest: 057fd7264fb9736475a9a52650af48bc0d94dfedd3817b0376f2ced4795dda04
- current_digest: 057fd7264fb9736475a9a52650af48bc0d94dfedd3817b0376f2ced4795dda04
- route_changed: no
- safe_command: agentplane blueprint snapshot 202609231520-J8VS4Q

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202609231520-J8VS4Q
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: false
- repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
- risks: none

### 2026-09-23T15:34:02.186Z — VERIFY — ok

By: CODER

Note: verified-202609231520-J8VS4Q
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-23T15:33:51.981Z, excerpt_hash=sha256:cce0f5b9d6a6b3874008aa66dd7553bb4e903ed26ec13a3644b8406718e1f78c

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609231520-J8VS4Q/blueprint/resolved-snapshot.json
- old_digest: 057fd7264fb9736475a9a52650af48bc0d94dfedd3817b0376f2ced4795dda04
- current_digest: 057fd7264fb9736475a9a52650af48bc0d94dfedd3817b0376f2ced4795dda04
- route_changed: no
- safe_command: agentplane blueprint snapshot 202609231520-J8VS4Q

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task complete 202609231520-J8VS4Q --result verified-202609231520-J8VS4Q --commit 169798e4c6f3c8623e019bd9b2ad18a87da792a1
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

Command: npx vitest run apps/office/src/sw/source/core/undo/undobj.test.ts apps/office/src/sw/source/uibase/wrtsh/wrtsh.test.ts apps/office/src/sw/source/uibase/app/docsh.test.ts
Result: pass
Evidence: 3 files, 45 tests passed.
Scope: Writer action replay, cursor restoration, undo-node retention, grouping, and save marks.

Command: npm run test:coverage --workspace @vite-office/office
Result: pass
Evidence: 93 files, 393 tests passed; statements, branches, functions, and lines each 100%.
Scope: full office unit suite.

Command: npm run typecheck; npm run lint; npm run check:dependencies; npm run check:source-tree; npm run check:source-provenance
Result: pass
Evidence: TypeScript and ESLint clean; dependency, upstream tree, and provenance checks passed.
Scope: implementation and source boundaries.

Command: npx prettier --check <eight changed source and test files>; git diff --check; git status --short --untracked-files=all
Result: pass
Evidence: formatting and whitespace clean; only task-scoped changes observed before commit.
Scope: changed files and repository state.

Command: ap doctor; node .agentplane/policy/check-routing.mjs
Result: pass
Evidence: doctor OK with two pre-existing warnings about managed hook shim and old task commit; policy routing OK.
Scope: workflow health.

The first full coverage run failed the 100% gate because new ownership guard branches lacked tests. Added focused tests and reran successfully. No stored document model change or compatibility path was introduced.
