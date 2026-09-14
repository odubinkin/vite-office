---
id: "202609141201-7V5AK0"
title: "Implement Writer Workstream 1 mutation and undo path"
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
  updated_at: "2026-09-14T12:01:36.073Z"
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
    at: "2026-09-14T12:01:48.265Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: continue direct-mode task in current checkout."
doc_version: 3
doc_updated_at: "2026-09-14T12:01:48.265Z"
doc_updated_by: "CODER"
description: "Retire clone-based Writer mutation facades and make SwDocShell acknowledge exact persisted generations after confirmed storage."
sections:
  Summary: "Implement Workstream 1 from docs/program/vite-office-upstream-parity-plan.md: establish one mutable Writer command path with action undo, and acknowledge primary saves on the live SwDoc only after confirmed persistence."
  Scope: "Remove exported clone-based mutation helpers and migrate their callers/tests to SwWrtShell, SwPaM, DocumentContentOperationsManager, or fixture-only utilities. Update writer-storage and SwDocShell save evidence/marks for concurrent mutations. Update directly affected runtime inventory, provenance, parity assertions, and stale prose. Preserve SwDoc.clone only for persistence, Worker transfer, and explicit test isolation. No Workstream 2 work and no storage-schema changes."
  Plan: "1. Inventory all runtime SwDoc.clone callers and map each mutation to existing Writer shell/core operations and pinned LibreOffice symbols. 2. Remove duplicate functional-clone facades; migrate runtime callers and tests to the mutable action/undo path, moving unavoidable builders under test utilities. 3. Return storage evidence from saveWriterDocument and make SwDocShell acknowledge the captured committed generation and matching undo position after success. 4. Add regressions for concurrent edit during save, independent primary/recovery generations, failed writes, identity preservation, and one-path undo. 5. Synchronize affected inventories and run targeted plus full verification."
  Verify Steps: "1. Run targeted Vitest for Writer core, shell/undo, storage, document shell, view session, and affected command tests. 2. Assert with rg that production command code no longer calls SwDoc.clone outside approved persistence/Worker boundaries. 3. Run npm run verify. 4. Run ap doctor. 5. Run node .agentplane/policy/check-routing.mjs. 6. Inspect git status --short --untracked-files=all for intentional task-only changes."
  Verification: "Pending implementation and TESTER verification."
  Rollback Plan: "Revert only the task implementation and task metadata commits. No data migration or persistent schema change is planned."
  Findings: "Initial inventory found fourteen direct exported SwDoc.clone mutation helpers plus a txtattr wrapper; production interactive editing already routes through SwWrtShell and SwUndo actions."
id_source: "generated"
---
## Summary

Implement Workstream 1 from docs/program/vite-office-upstream-parity-plan.md: establish one mutable Writer command path with action undo, and acknowledge primary saves on the live SwDoc only after confirmed persistence.

## Scope

Remove exported clone-based mutation helpers and migrate their callers/tests to SwWrtShell, SwPaM, DocumentContentOperationsManager, or fixture-only utilities. Update writer-storage and SwDocShell save evidence/marks for concurrent mutations. Update directly affected runtime inventory, provenance, parity assertions, and stale prose. Preserve SwDoc.clone only for persistence, Worker transfer, and explicit test isolation. No Workstream 2 work and no storage-schema changes.

## Plan

1. Inventory all runtime SwDoc.clone callers and map each mutation to existing Writer shell/core operations and pinned LibreOffice symbols. 2. Remove duplicate functional-clone facades; migrate runtime callers and tests to the mutable action/undo path, moving unavoidable builders under test utilities. 3. Return storage evidence from saveWriterDocument and make SwDocShell acknowledge the captured committed generation and matching undo position after success. 4. Add regressions for concurrent edit during save, independent primary/recovery generations, failed writes, identity preservation, and one-path undo. 5. Synchronize affected inventories and run targeted plus full verification.

## Verify Steps

1. Run targeted Vitest for Writer core, shell/undo, storage, document shell, view session, and affected command tests. 2. Assert with rg that production command code no longer calls SwDoc.clone outside approved persistence/Worker boundaries. 3. Run npm run verify. 4. Run ap doctor. 5. Run node .agentplane/policy/check-routing.mjs. 6. Inspect git status --short --untracked-files=all for intentional task-only changes.

## Verification

Pending implementation and TESTER verification.

## Rollback Plan

Revert only the task implementation and task metadata commits. No data migration or persistent schema change is planned.

## Findings

Initial inventory found fourteen direct exported SwDoc.clone mutation helpers plus a txtattr wrapper; production interactive editing already routes through SwWrtShell and SwUndo actions.
