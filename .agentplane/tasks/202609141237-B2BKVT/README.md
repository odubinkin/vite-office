---
id: "202609141237-B2BKVT"
title: "Implement Writer Workstream 2 core invariants"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 11
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-09-14T12:38:50.267Z"
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
    at: "2026-09-14T12:39:04.433Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: continue direct-mode task in current checkout."
doc_version: 3
doc_updated_at: "2026-09-14T12:39:04.433Z"
doc_updated_by: "CODER"
description: "Implement Workstream 2 from docs/program/vite-office-upstream-parity-plan.md using the pinned LibreOffice baseline: registered content indices, typed model broadcasters/clients, shell-owned lifecycle, and correct svl/sfx2 undo/factory ownership."
sections:
  Summary: "Restore the bounded Writer core invariants defined by Workstream 2: registered content positions, typed model notifications, shell-owned document lifecycle, and upstream-correct undo/factory module ownership. Preserve current editing, persistence, recovery, ODT, and command behavior."
  Scope: "Implement P2.1-P2.4 against pinned LibreOffice commit 9bc445578031fecf56086729d8e4940c77e14d65. Touch the relevant sw core node/cursor/document/format/numbering code, SwDocShell/SwWrtShell/SwView subscription path, svl notify and undo boundaries, sfx2 lifecycle support, Writer snapshots/storage/filter integration, tests, runtime inventory, source provenance, parity records, source-tree checks, and directly stale documentation. Do not expand Writer features, add desktop-only mechanisms, use network access, or create an empty SfxObjectFactory without a runtime registration need. Preserve compatibility with existing persisted Writer snapshots."
  Plan: "Implement P2.1-P2.4 as one coherent Writer-core refactor: upstream-derived registered indices; typed svl/sw notification graph and one React bridge; shell-owned lifecycle with snapshot compatibility; svl-owned undo and corrected sfx2 helper ownership; synchronized tests, inventory, provenance, checks, and docs; targeted plus full verification."
  Verify Steps: "1. Run targeted Vitest coverage for registered indices and all affected Writer text/node operations, including cursor, mark, redline-like, anchor-like, affinity, split, merge, remove, and transfer cases. 2. Run targeted Vitest coverage for svl broadcasters/listeners, SwModify/client registration, typed hints, one-transaction notification behavior, command invalidation, document replacement/disposal, and the single SwView external-store bridge. 3. Run targeted Vitest coverage for SwDoc model-only ownership, SwDocShell lifecycle/save-position/recovery/close behavior, snapshot backward compatibility, ODT open/save, and the relocated svl undo manager. 4. Assert with rg that SwDoc no longer owns OfficeDocument/medium/generation fields, production SwDocShell/SwWrtShell no longer own generic listener sets, and no production import refers to sfx2/source/doc/docundomanager. 5. Run npm run verify. 6. Run ap doctor. 7. Run node .agentplane/policy/check-routing.mjs. 8. Inspect git diff --check and git status --short --untracked-files=all for intentional task-only changes."
  Verification: "Pending implementation and independent TESTER verification."
  Rollback Plan: "Revert the Workstream 2 implementation and task metadata commits together. Snapshot readers retain compatibility with the pre-Workstream-2 persisted schema, so rollback requires no IndexedDB data migration."
  Findings: "The local LibreOffice reference checkout is clean and exactly pinned to 9bc445578031fecf56086729d8e4940c77e14d65. Workstream 1 task 202609141201-7V5AK0 is closed before this task begins."
id_source: "generated"
---
## Summary

Restore the bounded Writer core invariants defined by Workstream 2: registered content positions, typed model notifications, shell-owned document lifecycle, and upstream-correct undo/factory module ownership. Preserve current editing, persistence, recovery, ODT, and command behavior.

## Scope

Implement P2.1-P2.4 against pinned LibreOffice commit 9bc445578031fecf56086729d8e4940c77e14d65. Touch the relevant sw core node/cursor/document/format/numbering code, SwDocShell/SwWrtShell/SwView subscription path, svl notify and undo boundaries, sfx2 lifecycle support, Writer snapshots/storage/filter integration, tests, runtime inventory, source provenance, parity records, source-tree checks, and directly stale documentation. Do not expand Writer features, add desktop-only mechanisms, use network access, or create an empty SfxObjectFactory without a runtime registration need. Preserve compatibility with existing persisted Writer snapshots.

## Plan

Implement P2.1-P2.4 as one coherent Writer-core refactor: upstream-derived registered indices; typed svl/sw notification graph and one React bridge; shell-owned lifecycle with snapshot compatibility; svl-owned undo and corrected sfx2 helper ownership; synchronized tests, inventory, provenance, checks, and docs; targeted plus full verification.

## Verify Steps

1. Run targeted Vitest coverage for registered indices and all affected Writer text/node operations, including cursor, mark, redline-like, anchor-like, affinity, split, merge, remove, and transfer cases. 2. Run targeted Vitest coverage for svl broadcasters/listeners, SwModify/client registration, typed hints, one-transaction notification behavior, command invalidation, document replacement/disposal, and the single SwView external-store bridge. 3. Run targeted Vitest coverage for SwDoc model-only ownership, SwDocShell lifecycle/save-position/recovery/close behavior, snapshot backward compatibility, ODT open/save, and the relocated svl undo manager. 4. Assert with rg that SwDoc no longer owns OfficeDocument/medium/generation fields, production SwDocShell/SwWrtShell no longer own generic listener sets, and no production import refers to sfx2/source/doc/docundomanager. 5. Run npm run verify. 6. Run ap doctor. 7. Run node .agentplane/policy/check-routing.mjs. 8. Inspect git diff --check and git status --short --untracked-files=all for intentional task-only changes.

## Verification

Pending implementation and independent TESTER verification.

## Rollback Plan

Revert the Workstream 2 implementation and task metadata commits together. Snapshot readers retain compatibility with the pre-Workstream-2 persisted schema, so rollback requires no IndexedDB data migration.

## Findings

The local LibreOffice reference checkout is clean and exactly pinned to 9bc445578031fecf56086729d8e4940c77e14d65. Workstream 1 task 202609141201-7V5AK0 is closed before this task begins.
