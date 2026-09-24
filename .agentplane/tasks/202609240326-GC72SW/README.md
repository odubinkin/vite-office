---
id: "202609240326-GC72SW"
title: "Improve Writer ruler guides, ticks, snapping, and vertical placement"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 9
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
  - "frontend"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-09-24T03:26:15.715Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-09-24T03:35:53.992Z"
  updated_by: "CODER"
  note: "Focused Writer ruler tests pass (27 across 3 files); TypeScript, ESLint, JSDoc, file-size, diff check, and doctor pass. Verified 1 mm ticks against the vendored LibreOffice centimetre ruler unit."
  attempts: 0
commit: null
comments:
  -
    author: "CODER"
    body: "Start: implement approved Writer ruler guide, snapping, tick, and left-edge placement changes in the current checkout."
events:
  -
    type: "status"
    at: "2026-09-24T03:26:24.025Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implement approved Writer ruler guide, snapping, tick, and left-edge placement changes in the current checkout."
  -
    type: "verify"
    at: "2026-09-24T03:35:53.992Z"
    author: "CODER"
    state: "ok"
    note: "Focused Writer ruler tests pass (27 across 3 files); TypeScript, ESLint, JSDoc, file-size, diff check, and doctor pass. Verified 1 mm ticks against the vendored LibreOffice centimetre ruler unit."
doc_version: 3
doc_updated_at: "2026-09-24T03:35:54.068Z"
doc_updated_by: "CODER"
description: "Show drag guides over pages, add LibreOffice-style minor ruler ticks with snapping, and dock the vertical ruler at the left edge of the canvas."
sections:
  Summary: |-
    Improve Writer ruler guides, ticks, snapping, and vertical placement

    Show drag guides over pages, add LibreOffice-style minor ruler ticks with snapping, and dock the vertical ruler at the left edge of the canvas.
  Scope: "Writer browser ruler, editor/canvas placement, and focused UI tests only. Existing document model and file format remain unchanged."
  Plan: "1. Add fine centimetre subdivisions and use the same step for ruler drag snapping. 2. Project transient dashed guides across the document during margin and indent drags. 3. Move the vertical ruler to a fixed left canvas lane while preserving page-relative tick geometry through scrolling and pagination. 4. Run focused interaction tests, typecheck, and repository validation."
  Verify Steps: "Run focused Writer page-layout interaction tests covering drag guide visibility and cleanup, snapped margin/indent values, minor ticks, and viewport-aligned vertical ruler across pages. Run office typecheck and repository doctor. Confirm git status contains only task-scoped changes."
  Verification: |-
    Command: npx vitest run src/sw/browser/presentation/WriterPageLayout.test.tsx src/sw/browser/presentation/WriterMenuBar.test.tsx src/sw/browser/presentation/writer-view.test.tsx (from apps/office). Result: pass. Evidence: 3 files, 27 tests; guide visibility and cleanup, 1 mm snapping for margin and indent, minor ticks, left-edge vertical lane, and scrolling. Scope: Writer browser ruler interactions.
    Command: npm run typecheck --workspace @vite-office/office. Result: pass. Evidence: tsc --noEmit exited 0. Scope: office TypeScript.
    Command: npx eslint [six changed source/test files] --max-warnings 0; npm run check:docs; npm run check:file-size; git diff --check. Result: pass. Evidence: no lint, JSDoc, size, or whitespace errors. Scope: changed files and repository documentation constraints.
    Command: ap doctor. Result: pass. Evidence: doctor OK with two existing warnings about an older AgentPlane hook shim and a prior DONE task commit. Scope: repository workflow health.
    Command: git status --short --untracked-files=all. Result: pass. Evidence: only this task's six Writer implementation/test files are modified or untracked. Scope: final change isolation.

    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-09-24T03:35:53.992Z — VERIFY — ok

    By: CODER

    Note: Focused Writer ruler tests pass (27 across 3 files); TypeScript, ESLint, JSDoc, file-size, diff check, and doctor pass. Verified 1 mm ticks against the vendored LibreOffice centimetre ruler unit.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-24T03:35:43.894Z, excerpt_hash=sha256:cc764f314f348ae2e5683cfdbcaf68446935fd3d2d9659fb038876a1310a0a4a

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609240326-GC72SW/blueprint/resolved-snapshot.json
    - old_digest: 835f7fa9f95255af72bdf520ceeb126781ea8df93b8f166042af0ea8e92be1ba
    - current_digest: 835f7fa9f95255af72bdf520ceeb126781ea8df93b8f166042af0ea8e92be1ba
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202609240326-GC72SW

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202609240326-GC72SW
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: false
    - repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert this task's ruler and canvas presentation changes and its focused tests; no document migration is required."
  Findings: ""
id_source: "generated"
---
## Summary

Improve Writer ruler guides, ticks, snapping, and vertical placement

Show drag guides over pages, add LibreOffice-style minor ruler ticks with snapping, and dock the vertical ruler at the left edge of the canvas.

## Scope

Writer browser ruler, editor/canvas placement, and focused UI tests only. Existing document model and file format remain unchanged.

## Plan

1. Add fine centimetre subdivisions and use the same step for ruler drag snapping. 2. Project transient dashed guides across the document during margin and indent drags. 3. Move the vertical ruler to a fixed left canvas lane while preserving page-relative tick geometry through scrolling and pagination. 4. Run focused interaction tests, typecheck, and repository validation.

## Verify Steps

Run focused Writer page-layout interaction tests covering drag guide visibility and cleanup, snapped margin/indent values, minor ticks, and viewport-aligned vertical ruler across pages. Run office typecheck and repository doctor. Confirm git status contains only task-scoped changes.

## Verification

Command: npx vitest run src/sw/browser/presentation/WriterPageLayout.test.tsx src/sw/browser/presentation/WriterMenuBar.test.tsx src/sw/browser/presentation/writer-view.test.tsx (from apps/office). Result: pass. Evidence: 3 files, 27 tests; guide visibility and cleanup, 1 mm snapping for margin and indent, minor ticks, left-edge vertical lane, and scrolling. Scope: Writer browser ruler interactions.
Command: npm run typecheck --workspace @vite-office/office. Result: pass. Evidence: tsc --noEmit exited 0. Scope: office TypeScript.
Command: npx eslint [six changed source/test files] --max-warnings 0; npm run check:docs; npm run check:file-size; git diff --check. Result: pass. Evidence: no lint, JSDoc, size, or whitespace errors. Scope: changed files and repository documentation constraints.
Command: ap doctor. Result: pass. Evidence: doctor OK with two existing warnings about an older AgentPlane hook shim and a prior DONE task commit. Scope: repository workflow health.
Command: git status --short --untracked-files=all. Result: pass. Evidence: only this task's six Writer implementation/test files are modified or untracked. Scope: final change isolation.

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-09-24T03:35:53.992Z — VERIFY — ok

By: CODER

Note: Focused Writer ruler tests pass (27 across 3 files); TypeScript, ESLint, JSDoc, file-size, diff check, and doctor pass. Verified 1 mm ticks against the vendored LibreOffice centimetre ruler unit.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-24T03:35:43.894Z, excerpt_hash=sha256:cc764f314f348ae2e5683cfdbcaf68446935fd3d2d9659fb038876a1310a0a4a

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609240326-GC72SW/blueprint/resolved-snapshot.json
- old_digest: 835f7fa9f95255af72bdf520ceeb126781ea8df93b8f166042af0ea8e92be1ba
- current_digest: 835f7fa9f95255af72bdf520ceeb126781ea8df93b8f166042af0ea8e92be1ba
- route_changed: no
- safe_command: agentplane blueprint snapshot 202609240326-GC72SW

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202609240326-GC72SW
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: false
- repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert this task's ruler and canvas presentation changes and its focused tests; no document migration is required.

## Findings
