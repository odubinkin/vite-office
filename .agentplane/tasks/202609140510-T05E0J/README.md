---
id: "202609140510-T05E0J"
title: "Implement Stage 3 action-based Writer undo and redo"
result_summary: "verified-202609140510-T05E0J"
status: "DONE"
priority: "high"
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
  updated_at: "2026-09-14T05:10:52.656Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-09-14T05:48:40.531Z"
  updated_by: "CODER"
  note: "verified-202609140510-T05E0J"
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-09-14T05:48:03.857Z"
  updated_by: "EVALUATOR"
  note: "Stage 3 action-based Writer undo/redo matches the pinned Sfx/SwUndo architecture within the current browser slice and passes every declared check."
  evaluated_sha: "b5724f104089b1b227f40679fdf906d23db8e16c"
  blueprint_digest: "6368a1bb162135baee462b9f9652e0c42e799ea0c99ec9e35978729a02676a47"
  evidence_refs:
    - ".agentplane/tasks/202609140510-T05E0J/README.md"
    - ".agentplane/tasks/202609140510-T05E0J/quality/20260914-054803857-recovery-context/quality-report.json"
    - ".agentplane/tasks/202609140510-T05E0J/quality/20260914-054803857-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202609140510-T05E0J/quality/20260914-054803857-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202609140510-T05E0J/blueprint/resolved-snapshot.json"
    - "apps/office/src/sw/source/core/undo/undobj.test.ts"
    - "apps/office/src/sfx2/source/doc/docundomanager.test.ts"
    - "docs/program/transaction-history.md"
  findings:
    - "Specialized minimal-payload actions replace full-document snapshot history; grouping, redo truncation, save position, cursor restoration, structural and formatting fidelity, bounded retention, and representative performance are covered."
commit:
  hash: "562cf54730a99ee6602c1b70c5715238acea8619"
  message: "🧩 T05E0J task: persist verification evidence"
comments:
  -
    author: "CODER"
    body: "Start: implement the approved Stage 3 action-based Writer undo/redo slice from pinned LibreOffice evidence, preserving current behavior and verification coverage."
  -
    author: "CODER"
    body: "Verified: verified-202609140510-T05E0J. Guided shortcut recorded verification and is closing the direct task with traceable commit metadata."
events:
  -
    type: "status"
    at: "2026-09-14T05:10:58.375Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implement the approved Stage 3 action-based Writer undo/redo slice from pinned LibreOffice evidence, preserving current behavior and verification coverage."
  -
    type: "verify"
    at: "2026-09-14T05:47:57.038Z"
    author: "CODER"
    state: "ok"
    note: "Verified Stage 3 action-based undo/redo: npm run verify passed (195 runtime and 79 inventory tests at 100% coverage, 8 Playwright E2E, production/static builds); provenance, parity inventory, routing policy, doctor, diff check, and no-full-document-snapshot search passed. Implementation commit b5724f104089."
  -
    type: "verify"
    at: "2026-09-14T05:48:17.876Z"
    author: "CODER"
    state: "ok"
    note: "verified-202609140510-T05E0J"
  -
    type: "verify"
    at: "2026-09-14T05:48:40.531Z"
    author: "CODER"
    state: "ok"
    note: "verified-202609140510-T05E0J"
  -
    type: "status"
    at: "2026-09-14T05:48:40.719Z"
    author: "CODER"
    from: "DOING"
    to: "DONE"
    note: "Verified: verified-202609140510-T05E0J. Guided shortcut recorded verification and is closing the direct task with traceable commit metadata."
doc_version: 3
doc_updated_at: "2026-09-14T05:48:40.720Z"
doc_updated_by: "CODER"
description: "Implement section 7 of docs/program/vite-office-upstream-parity-plan.md using repository-local pinned LibreOffice SfxUndoManager and Writer undo-action evidence; remove full-document snapshots from the interactive path while preserving current behavior."
sections:
  Summary: "Replace the temporary snapshot-based Writer history with LibreOffice-aligned SfxUndoAction/SfxUndoManager ownership and semantic Writer undo actions for every currently implemented edit and formatting command."
  Scope: |-
    - In scope: Sfx undo abstractions and list/compound actions; Writer insert, delete, split, join, direct-format, paragraph-format, style, numbering, list-level, and replace/paste actions; action grouping; full PaM and pending cursor-attribute restoration; redo truncation; bounded history; interactive-path performance regression coverage.
    - Upstream constraint: derive behavior and naming from the pinned repository-local LibreOffice tree, especially sfx2/source/control/undo.cxx, include/sfx2/undo.hxx, and sw/source/core/undo; preserve existing browser-visible behavior without inventing features.
    - Approved implementation areas: apps/office/src/sfx2/source/doc, apps/office/src/sw/source/core/undo, apps/office/src/sw/source/uibase, and narrowly required parity/provenance test metadata.
    - Out of scope: Stage 4 input/selection redesign, new Writer features, network access, unrelated refactors, and edits to docs/program/vite-office-upstream-parity-plan.md.
  Plan: "Implement Stage 3 as one atomic CODER-owned vertical slice: establish upstream-aligned Sfx action history, add semantic Writer undo actions for every current command, migrate the persistent shell/session off full snapshots, preserve grouping/cursor/lifecycle behavior, add performance and regression coverage, and run the full repository verification contract."
  Verify Steps: |-
    1. Run npm run format:check. Expected: formatting passes.
    2. Run npm run lint. Expected: lint passes with no warnings.
    3. Run npm run typecheck. Expected: TypeScript checks pass.
    4. Run npm run check:dependencies. Expected: module-boundary validation passes.
    5. Run npm test -- --run. Expected: all unit and inventory tests pass, including Stage 3 coverage for every current mutation type, redo truncation, grouping boundaries, split/join structure, hint/item restoration, history limit, cursor restoration, and performance scaling.
    6. Run npm run build. Expected: production build succeeds.
    7. Run node .agentplane/policy/check-routing.mjs. Expected: routing policy passes.
    8. Run ap doctor. Expected: Agentplane repository checks pass.
    9. Inspect git status --short --untracked-files=all and search the interactive history path for full-document snapshot storage or SwDoc.clone(). Expected: only intentional task files plus the pre-existing user-owned plan are present, and interactive history contains actions/minimal payloads rather than full WriterDocument snapshots.
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-09-14T05:47:57.038Z — VERIFY — ok

    By: CODER

    Note: Verified Stage 3 action-based undo/redo: npm run verify passed (195 runtime and 79 inventory tests at 100% coverage, 8 Playwright E2E, production/static builds); provenance, parity inventory, routing policy, doctor, diff check, and no-full-document-snapshot search passed. Implementation commit b5724f104089.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-14T05:47:04.081Z, excerpt_hash=sha256:0f1e6adac4709b9dfb22254050c05bdbebc6253ff68b7b0c17e495af5ee510a7

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609140510-T05E0J/blueprint/resolved-snapshot.json
    - old_digest: 6368a1bb162135baee462b9f9652e0c42e799ea0c99ec9e35978729a02676a47
    - current_digest: 6368a1bb162135baee462b9f9652e0c42e799ea0c99ec9e35978729a02676a47
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202609140510-T05E0J

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202609140510-T05E0J
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: true
    - repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
    - risks: none

    ### 2026-09-14T05:48:17.876Z — VERIFY — ok

    By: CODER

    Note: verified-202609140510-T05E0J
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-14T05:47:57.118Z, excerpt_hash=sha256:0f1e6adac4709b9dfb22254050c05bdbebc6253ff68b7b0c17e495af5ee510a7

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609140510-T05E0J/blueprint/resolved-snapshot.json
    - old_digest: 6368a1bb162135baee462b9f9652e0c42e799ea0c99ec9e35978729a02676a47
    - current_digest: 6368a1bb162135baee462b9f9652e0c42e799ea0c99ec9e35978729a02676a47
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202609140510-T05E0J

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task complete 202609140510-T05E0J --result verified-202609140510-T05E0J --commit b5724f104089b1b227f40679fdf906d23db8e16c
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: true
    - repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
    - risks: none

    ### 2026-09-14T05:48:40.531Z — VERIFY — ok

    By: CODER

    Note: verified-202609140510-T05E0J
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-14T05:48:17.950Z, excerpt_hash=sha256:0f1e6adac4709b9dfb22254050c05bdbebc6253ff68b7b0c17e495af5ee510a7

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609140510-T05E0J/blueprint/resolved-snapshot.json
    - old_digest: 6368a1bb162135baee462b9f9652e0c42e799ea0c99ec9e35978729a02676a47
    - current_digest: 6368a1bb162135baee462b9f9652e0c42e799ea0c99ec9e35978729a02676a47
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202609140510-T05E0J

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task complete 202609140510-T05E0J --result verified-202609140510-T05E0J --commit 562cf54730a99ee6602c1b70c5715238acea8619
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: true
    - repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: |-
    - Revert only implementation and task-lifecycle commits associated with 202609140510-T05E0J.
    - Restore the pre-Stage-3 snapshot adapter and shell history wiring if rollback is required.
    - Re-run the declared Verify Steps after rollback.
    - Preserve docs/program/vite-office-upstream-parity-plan.md because it predates and remains outside task-owned edits.
  Findings: |-
    - Pending implementation audit and verification.

    - Observation: The prior Writer history stored whole cloned SwDoc graphs, so simple edits retained document-sized payloads and did not model LibreOffice undo actions.
      Impact: Interactive edit, formatting, list, and structural command cost scaled with the complete document and parity evidence described snapshots rather than Sfx/Writer action semantics.
      Resolution: Replaced snapshot history with a bounded SfxUndoManager cursor plus specialized Writer actions mapped to pinned svl/source/undo/undo.cxx and sw/source/core/undo/*.cxx; added exact cursor/payload/grouping, performance, lifecycle, and full-coverage tests.
      Promotion: incident-candidate
      Fixability: repo-fixable

    - Observation: Writer undo/redo now records specialized bounded actions instead of complete SwDoc clones.
      Impact: Current insert, delete, replace/paste, split/join, direct formatting, paragraph style/alignment, numbering, and level commands preserve exact model and cursor state with bounded history.
      Resolution: Accepted after full repository verification and upstream provenance validation against pinned LibreOffice 9bc445578031fecf56086729d8e4940c77e14d65.
extensions:
  implementation_commit:
    hash: "b5724f104089b1b227f40679fdf906d23db8e16c"
    message: "🧩 T05E0J code: implement action-based Writer undo and redo"
id_source: "generated"
---
## Summary

Replace the temporary snapshot-based Writer history with LibreOffice-aligned SfxUndoAction/SfxUndoManager ownership and semantic Writer undo actions for every currently implemented edit and formatting command.

## Scope

- In scope: Sfx undo abstractions and list/compound actions; Writer insert, delete, split, join, direct-format, paragraph-format, style, numbering, list-level, and replace/paste actions; action grouping; full PaM and pending cursor-attribute restoration; redo truncation; bounded history; interactive-path performance regression coverage.
- Upstream constraint: derive behavior and naming from the pinned repository-local LibreOffice tree, especially sfx2/source/control/undo.cxx, include/sfx2/undo.hxx, and sw/source/core/undo; preserve existing browser-visible behavior without inventing features.
- Approved implementation areas: apps/office/src/sfx2/source/doc, apps/office/src/sw/source/core/undo, apps/office/src/sw/source/uibase, and narrowly required parity/provenance test metadata.
- Out of scope: Stage 4 input/selection redesign, new Writer features, network access, unrelated refactors, and edits to docs/program/vite-office-upstream-parity-plan.md.

## Plan

Implement Stage 3 as one atomic CODER-owned vertical slice: establish upstream-aligned Sfx action history, add semantic Writer undo actions for every current command, migrate the persistent shell/session off full snapshots, preserve grouping/cursor/lifecycle behavior, add performance and regression coverage, and run the full repository verification contract.

## Verify Steps

1. Run npm run format:check. Expected: formatting passes.
2. Run npm run lint. Expected: lint passes with no warnings.
3. Run npm run typecheck. Expected: TypeScript checks pass.
4. Run npm run check:dependencies. Expected: module-boundary validation passes.
5. Run npm test -- --run. Expected: all unit and inventory tests pass, including Stage 3 coverage for every current mutation type, redo truncation, grouping boundaries, split/join structure, hint/item restoration, history limit, cursor restoration, and performance scaling.
6. Run npm run build. Expected: production build succeeds.
7. Run node .agentplane/policy/check-routing.mjs. Expected: routing policy passes.
8. Run ap doctor. Expected: Agentplane repository checks pass.
9. Inspect git status --short --untracked-files=all and search the interactive history path for full-document snapshot storage or SwDoc.clone(). Expected: only intentional task files plus the pre-existing user-owned plan are present, and interactive history contains actions/minimal payloads rather than full WriterDocument snapshots.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-09-14T05:47:57.038Z — VERIFY — ok

By: CODER

Note: Verified Stage 3 action-based undo/redo: npm run verify passed (195 runtime and 79 inventory tests at 100% coverage, 8 Playwright E2E, production/static builds); provenance, parity inventory, routing policy, doctor, diff check, and no-full-document-snapshot search passed. Implementation commit b5724f104089.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-14T05:47:04.081Z, excerpt_hash=sha256:0f1e6adac4709b9dfb22254050c05bdbebc6253ff68b7b0c17e495af5ee510a7

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609140510-T05E0J/blueprint/resolved-snapshot.json
- old_digest: 6368a1bb162135baee462b9f9652e0c42e799ea0c99ec9e35978729a02676a47
- current_digest: 6368a1bb162135baee462b9f9652e0c42e799ea0c99ec9e35978729a02676a47
- route_changed: no
- safe_command: agentplane blueprint snapshot 202609140510-T05E0J

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202609140510-T05E0J
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: true
- repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
- risks: none

### 2026-09-14T05:48:17.876Z — VERIFY — ok

By: CODER

Note: verified-202609140510-T05E0J
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-14T05:47:57.118Z, excerpt_hash=sha256:0f1e6adac4709b9dfb22254050c05bdbebc6253ff68b7b0c17e495af5ee510a7

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609140510-T05E0J/blueprint/resolved-snapshot.json
- old_digest: 6368a1bb162135baee462b9f9652e0c42e799ea0c99ec9e35978729a02676a47
- current_digest: 6368a1bb162135baee462b9f9652e0c42e799ea0c99ec9e35978729a02676a47
- route_changed: no
- safe_command: agentplane blueprint snapshot 202609140510-T05E0J

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task complete 202609140510-T05E0J --result verified-202609140510-T05E0J --commit b5724f104089b1b227f40679fdf906d23db8e16c
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: true
- repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
- risks: none

### 2026-09-14T05:48:40.531Z — VERIFY — ok

By: CODER

Note: verified-202609140510-T05E0J
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-14T05:48:17.950Z, excerpt_hash=sha256:0f1e6adac4709b9dfb22254050c05bdbebc6253ff68b7b0c17e495af5ee510a7

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609140510-T05E0J/blueprint/resolved-snapshot.json
- old_digest: 6368a1bb162135baee462b9f9652e0c42e799ea0c99ec9e35978729a02676a47
- current_digest: 6368a1bb162135baee462b9f9652e0c42e799ea0c99ec9e35978729a02676a47
- route_changed: no
- safe_command: agentplane blueprint snapshot 202609140510-T05E0J

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task complete 202609140510-T05E0J --result verified-202609140510-T05E0J --commit 562cf54730a99ee6602c1b70c5715238acea8619
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: true
- repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert only implementation and task-lifecycle commits associated with 202609140510-T05E0J.
- Restore the pre-Stage-3 snapshot adapter and shell history wiring if rollback is required.
- Re-run the declared Verify Steps after rollback.
- Preserve docs/program/vite-office-upstream-parity-plan.md because it predates and remains outside task-owned edits.

## Findings

- Pending implementation audit and verification.

- Observation: The prior Writer history stored whole cloned SwDoc graphs, so simple edits retained document-sized payloads and did not model LibreOffice undo actions.
  Impact: Interactive edit, formatting, list, and structural command cost scaled with the complete document and parity evidence described snapshots rather than Sfx/Writer action semantics.
  Resolution: Replaced snapshot history with a bounded SfxUndoManager cursor plus specialized Writer actions mapped to pinned svl/source/undo/undo.cxx and sw/source/core/undo/*.cxx; added exact cursor/payload/grouping, performance, lifecycle, and full-coverage tests.
  Promotion: incident-candidate
  Fixability: repo-fixable

- Observation: Writer undo/redo now records specialized bounded actions instead of complete SwDoc clones.
  Impact: Current insert, delete, replace/paste, split/join, direct formatting, paragraph style/alignment, numbering, and level commands preserve exact model and cursor state with bounded history.
  Resolution: Accepted after full repository verification and upstream provenance validation against pinned LibreOffice 9bc445578031fecf56086729d8e4940c77e14d65.
