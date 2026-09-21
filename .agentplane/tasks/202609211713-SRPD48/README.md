---
id: "202609211713-SRPD48"
title: "Implement P2 Writer view and ownership boundaries"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 11
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
  - "frontend"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-09-21T17:14:18.306Z"
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
    body: "Start: Implement approved P2 Writer view responsibility refactor and inner-layer ownership enforcement with focused and full verification."
events:
  -
    type: "status"
    at: "2026-09-21T17:14:26.534Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: Implement approved P2 Writer view responsibility refactor and inner-layer ownership enforcement with focused and full verification."
doc_version: 3
doc_updated_at: "2026-09-21T17:14:26.534Z"
doc_updated_by: "CODER"
description: "Implement P2-1 and P2-2 from docs/program/vite-office-upstream-parity-plan.md: remove browser presentation/workflow responsibilities from SwView, move them to sw/browser adapters, enforce inner-layer ownership and browser-import prohibitions, and update provenance/inventory within the existing inventory model."
sections:
  Summary: "Implement parity-plan P2-1 and P2-2 by restoring upstream-shaped SwView ownership and enforcing responsibility boundaries between Writer core, uibase, filter, browser adapters, and Sfx."
  Scope: "Move browser workflow orchestration, clipboard/file/storage adapters, view projections, snapshots, subscriptions, and external-store concerns out of sw/source/uibase/uiview/view.ts into sw/browser/workflows and sw/browser/presentation. Keep SwView responsible for Writer shell/frame state and command coordination. Strengthen static ownership/import checks and provenance filename-divergence validation. Update existing runtime inventory records only as required by changed files; do not expand the inventory schema or supported feature model. Preserve current Writer behavior and follow pinned LibreOffice 26.8.0.2 responsibility anchors. No compatibility layer is required if stored document representation changes."
  Plan: "Implement approved P2-1/P2-2 scope: slim SwView to Writer/Sfx coordination, move browser workflows and observable presentation concerns to sw/browser, enforce inner-layer ownership and stack-necessity provenance, preserve behavior, update only existing inventory records, and verify with focused plus full repository gates."
  Verify Steps: "1. Run focused Vitest suites for SwView, writer workflows, writer presentation store, module boundaries, source tree, and source provenance. Expected: browser workflows execute through browser-owned adapters, SwView tests cover only Writer/Sfx responsibilities, and negative architecture fixtures are rejected. 2. Run npm run check:dependencies, npm run check:source-tree, npm run check:source-provenance, npm run inventory:invariants, and npm run inventory:parity. Expected: every ownership/provenance/inventory gate passes without broadening inventory semantics. 3. Run npm run verify. Expected: formatting, lint, typecheck, unit coverage, e2e, static checks, documentation, size, source ownership, provenance, and inventory checks all pass. 4. Run node .agentplane/policy/check-routing.mjs and ap doctor. Expected: repository policy and Agentplane health checks pass. 5. Inspect git diff and git status --short --untracked-files=all. Expected: only approved task files and Agentplane artifacts are changed, with no unintended files."
  Verification: "Pending implementation."
  Rollback Plan: "Revert the task commit. The refactor does not add compatibility shims or migrations; rollback restores the prior SwView/browser ownership arrangement and prior static checks."
  Findings: "No findings yet."
id_source: "generated"
---
## Summary

Implement parity-plan P2-1 and P2-2 by restoring upstream-shaped SwView ownership and enforcing responsibility boundaries between Writer core, uibase, filter, browser adapters, and Sfx.

## Scope

Move browser workflow orchestration, clipboard/file/storage adapters, view projections, snapshots, subscriptions, and external-store concerns out of sw/source/uibase/uiview/view.ts into sw/browser/workflows and sw/browser/presentation. Keep SwView responsible for Writer shell/frame state and command coordination. Strengthen static ownership/import checks and provenance filename-divergence validation. Update existing runtime inventory records only as required by changed files; do not expand the inventory schema or supported feature model. Preserve current Writer behavior and follow pinned LibreOffice 26.8.0.2 responsibility anchors. No compatibility layer is required if stored document representation changes.

## Plan

Implement approved P2-1/P2-2 scope: slim SwView to Writer/Sfx coordination, move browser workflows and observable presentation concerns to sw/browser, enforce inner-layer ownership and stack-necessity provenance, preserve behavior, update only existing inventory records, and verify with focused plus full repository gates.

## Verify Steps

1. Run focused Vitest suites for SwView, writer workflows, writer presentation store, module boundaries, source tree, and source provenance. Expected: browser workflows execute through browser-owned adapters, SwView tests cover only Writer/Sfx responsibilities, and negative architecture fixtures are rejected. 2. Run npm run check:dependencies, npm run check:source-tree, npm run check:source-provenance, npm run inventory:invariants, and npm run inventory:parity. Expected: every ownership/provenance/inventory gate passes without broadening inventory semantics. 3. Run npm run verify. Expected: formatting, lint, typecheck, unit coverage, e2e, static checks, documentation, size, source ownership, provenance, and inventory checks all pass. 4. Run node .agentplane/policy/check-routing.mjs and ap doctor. Expected: repository policy and Agentplane health checks pass. 5. Inspect git diff and git status --short --untracked-files=all. Expected: only approved task files and Agentplane artifacts are changed, with no unintended files.

## Verification

Pending implementation.

## Rollback Plan

Revert the task commit. The refactor does not add compatibility shims or migrations; rollback restores the prior SwView/browser ownership arrangement and prior static checks.

## Findings

No findings yet.
