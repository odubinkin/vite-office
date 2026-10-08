---
id: "202610080502-BKYEAC"
title: "Handle browser document name collisions and content-based autosave titles"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 10
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
  - "frontend"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-08T05:02:50.055Z"
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
    body: "Start: implement approved Writer browser import collision choices, two-word automatic titles, focused regression coverage, and intentional upstream-divergence documentation."
events:
  -
    type: "status"
    at: "2026-10-08T05:02:55.258Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implement approved Writer browser import collision choices, two-word automatic titles, focused regression coverage, and intentional upstream-divergence documentation."
doc_version: 3
doc_updated_at: "2026-10-08T05:02:55.258Z"
doc_updated_by: "CODER"
description: "Prompt on imported filename collisions, derive first-save titles from the first two words, allocate indexed names, cover behavior with tests, and document the intentional upstream divergence."
sections:
  Summary: "Implement collision-safe browser file import and two-word automatic naming for new Writer documents, with explicit product documentation of the divergence from pinned LibreOffice behavior."
  Scope: "Modify the browser Writer storage/workflow/dialog boundaries and focused tests. Imported ODT/TXT filename collisions must offer overwrite or a prefilled unique indexed name. Untitled documents become persistence-eligible only after two normalized words and receive a unique title derived from those words. Update canonical browser persistence documentation."
  Plan: "1. Add reusable title normalization and collision allocation at the browser persistence boundary. 2. Gate first autosave of untitled documents on two words and adopt the unique derived title. 3. Add an import-collision confirmation UI supporting overwrite and save-new flows for ODT and TXT. 4. Add workflow, store, and dialog tests. 5. Document the intentional upstream divergence. 6. Run targeted tests plus repository verification gates and record evidence."
  Verify Steps: "1. Run focused Vitest coverage for writer-odt-io, writer-odt-store, WriterFileDialog, and desktop integration; all pass and assert two-word thresholds, derived titles, indexed collisions, overwrite, and save-new import behavior. 2. Run the repository formatting, lint, type, dependency, JSDoc, file-size, and static-build checks exposed by package scripts for the touched application. 3. Run node .agentplane/policy/check-routing.mjs and ap doctor successfully. 4. Review git diff and git status so only task-scoped implementation, tests, documentation, and Agentplane task artifacts remain."
  Verification: "Pending implementation and checks."
  Rollback Plan: "Revert the task implementation commit and the deterministic Agentplane close commit; IndexedDB schema remains unchanged, so existing browser documents require no data migration or rollback."
  Findings: "No findings yet."
id_source: "generated"
---
## Summary

Implement collision-safe browser file import and two-word automatic naming for new Writer documents, with explicit product documentation of the divergence from pinned LibreOffice behavior.

## Scope

Modify the browser Writer storage/workflow/dialog boundaries and focused tests. Imported ODT/TXT filename collisions must offer overwrite or a prefilled unique indexed name. Untitled documents become persistence-eligible only after two normalized words and receive a unique title derived from those words. Update canonical browser persistence documentation.

## Plan

1. Add reusable title normalization and collision allocation at the browser persistence boundary. 2. Gate first autosave of untitled documents on two words and adopt the unique derived title. 3. Add an import-collision confirmation UI supporting overwrite and save-new flows for ODT and TXT. 4. Add workflow, store, and dialog tests. 5. Document the intentional upstream divergence. 6. Run targeted tests plus repository verification gates and record evidence.

## Verify Steps

1. Run focused Vitest coverage for writer-odt-io, writer-odt-store, WriterFileDialog, and desktop integration; all pass and assert two-word thresholds, derived titles, indexed collisions, overwrite, and save-new import behavior. 2. Run the repository formatting, lint, type, dependency, JSDoc, file-size, and static-build checks exposed by package scripts for the touched application. 3. Run node .agentplane/policy/check-routing.mjs and ap doctor successfully. 4. Review git diff and git status so only task-scoped implementation, tests, documentation, and Agentplane task artifacts remain.

## Verification

Pending implementation and checks.

## Rollback Plan

Revert the task implementation commit and the deterministic Agentplane close commit; IndexedDB schema remains unchanged, so existing browser documents require no data migration or rollback.

## Findings

No findings yet.
