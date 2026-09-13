---
id: "202609130742-SXGE2Q"
title: "Implement Stage 2 persistent Writer session and unified dispatch"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 7
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
  state: "pending"
  updated_at: null
  updated_by: null
  note: null
  attempts: 0
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
doc_version: 3
doc_updated_at: "2026-09-13T07:43:29.342Z"
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
    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: |-
    - Revert only the implementation and task-lifecycle commits associated with 202609130742-SXGE2Q.
    - Restore the pre-Stage-2 React ownership and direct command callbacks if rollback is required.
    - Re-run the declared Verify Steps after rollback.
    - Preserve docs/program/vite-office-upstream-parity-plan.md because it predates and is outside task-owned edits.
  Findings: ""
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
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert only the implementation and task-lifecycle commits associated with 202609130742-SXGE2Q.
- Restore the pre-Stage-2 React ownership and direct command callbacks if rollback is required.
- Re-run the declared Verify Steps after rollback.
- Preserve docs/program/vite-office-upstream-parity-plan.md because it predates and is outside task-owned edits.

## Findings
