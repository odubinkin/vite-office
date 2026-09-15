---
id: "202609150036-J7X0D8"
title: "Implement LibreOffice font selection and full Writer paragraph style pool"
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
  updated_at: "2026-09-15T00:36:54.152Z"
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
    body: "Start: Implement the complete pinned Writer paragraph-style pool and device-backed browser font selection across model, commands, persistence, ODT, UI, documentation, and tests."
events:
  -
    type: "status"
    at: "2026-09-15T00:36:59.272Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: Implement the complete pinned Writer paragraph-style pool and device-backed browser font selection across model, commands, persistence, ODT, UI, documentation, and tests."
doc_version: 3
doc_updated_at: "2026-09-15T00:36:59.272Z"
doc_updated_by: "CODER"
description: "Add device-backed font selection and all 126 pinned LibreOffice built-in Writer paragraph styles, preserving pool identities, groups, parent/follow hierarchy, persistence, ODT interoperability, UI application, and verification."
sections:
  Summary: "Implement upstream-aligned Writer font selection and the complete pinned LibreOffice built-in paragraph-style pool for the browser office application."
  Scope: "Replace the two-style bounded model with all 126 built-in paragraph styles from pinned poolfmt.hxx and SwStyleNameMapper data; preserve stable identities, category ordering, parent and follow links; add font-family pooled items and a browser FontList abstraction backed by Local Font Access when available; apply font selection through shell commands with pending/range semantics and Undo/Redo; update toolbar, rendering, snapshots, clipboard, ODT import/export, tests, documentation, and provenance. No network access, font-file bundling, custom-style editor, page layout engine, or non-paragraph style families."
  Plan: "1. Port the pinned Writer paragraph-style pool metadata and hierarchy into upstream-shaped modules. 2. Generalize SwDoc/SwTextFormatColl construction, snapshots, commands, and UI from two styles to the full catalog. 3. Add SvxFontItem/SvxFontListItem-like model and browser font enumeration with permission-safe fallback. 4. Apply font family to selections and pending input with history support. 5. Extend rendering, clipboard, persistence, and ODT round-trip. 6. Add focused unit/UI/e2e coverage and update program documentation/provenance. 7. Run the full repository verification contract and record evidence."
  Verify Steps: "1. Run focused Vitest suites covering the style catalog count/order, parent/follow graph, font items/list enumeration, shell application, Undo/Redo, snapshots, ODT round-trip, and toolbar behavior. 2. Run npm run verify. 3. Run ap doctor. 4. Run node .agentplane/policy/check-routing.mjs. 5. Confirm git status --short --untracked-files=all contains only intentional task artifacts and implementation changes."
  Verification: "Pending implementation and execution of the declared Verify Steps."
  Rollback Plan: "Revert the task implementation and task close commit; the prior bounded two-style model and disabled font control remain the behavioral baseline. Persisted schema changes must be reverted together with their readers/writers to avoid mixed model shapes."
  Findings: "No findings yet. Browser font enumeration will mirror LibreOffice device enumeration through Local Font Access where supported; browsers that deny or lack the API receive a deterministic safe fallback without external font downloads."
id_source: "generated"
---
## Summary

Implement upstream-aligned Writer font selection and the complete pinned LibreOffice built-in paragraph-style pool for the browser office application.

## Scope

Replace the two-style bounded model with all 126 built-in paragraph styles from pinned poolfmt.hxx and SwStyleNameMapper data; preserve stable identities, category ordering, parent and follow links; add font-family pooled items and a browser FontList abstraction backed by Local Font Access when available; apply font selection through shell commands with pending/range semantics and Undo/Redo; update toolbar, rendering, snapshots, clipboard, ODT import/export, tests, documentation, and provenance. No network access, font-file bundling, custom-style editor, page layout engine, or non-paragraph style families.

## Plan

1. Port the pinned Writer paragraph-style pool metadata and hierarchy into upstream-shaped modules. 2. Generalize SwDoc/SwTextFormatColl construction, snapshots, commands, and UI from two styles to the full catalog. 3. Add SvxFontItem/SvxFontListItem-like model and browser font enumeration with permission-safe fallback. 4. Apply font family to selections and pending input with history support. 5. Extend rendering, clipboard, persistence, and ODT round-trip. 6. Add focused unit/UI/e2e coverage and update program documentation/provenance. 7. Run the full repository verification contract and record evidence.

## Verify Steps

1. Run focused Vitest suites covering the style catalog count/order, parent/follow graph, font items/list enumeration, shell application, Undo/Redo, snapshots, ODT round-trip, and toolbar behavior. 2. Run npm run verify. 3. Run ap doctor. 4. Run node .agentplane/policy/check-routing.mjs. 5. Confirm git status --short --untracked-files=all contains only intentional task artifacts and implementation changes.

## Verification

Pending implementation and execution of the declared Verify Steps.

## Rollback Plan

Revert the task implementation and task close commit; the prior bounded two-style model and disabled font control remain the behavioral baseline. Persisted schema changes must be reverted together with their readers/writers to avoid mixed model shapes.

## Findings

No findings yet. Browser font enumeration will mirror LibreOffice device enumeration through Local Font Access where supported; browsers that deny or lack the API receive a deterministic safe fallback without external font downloads.
