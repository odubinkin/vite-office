---
id: "202610080525-Q0C52Z"
title: "Resolve Writer rename collisions interactively"
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
  updated_at: "2026-10-08T05:25:39.295Z"
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
    body: "Start: implement approved reusable rename-collision dialog, atomic overwrite semantics, repeated editable-name conflict resolution, tests, and documentation."
events:
  -
    type: "status"
    at: "2026-10-08T05:25:44.236Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implement approved reusable rename-collision dialog, atomic overwrite semantics, repeated editable-name conflict resolution, tests, and documentation."
doc_version: 3
doc_updated_at: "2026-10-08T05:25:44.236Z"
doc_updated_by: "CODER"
description: "Reuse the document-name collision dialog for manual renames, support overwrite or editable indexed alternatives, repeat collision resolution for user-entered occupied names, and document the behavior."
sections:
  Summary: "Extend Writer's browser-title collision flow to manual renames, including editable indexed suggestions and repeated conflict resolution."
  Scope: "Reuse the existing collision presentation for inline title edits. An occupied requested title offers overwrite or a prefilled first-free indexed title. Users may edit that field; another occupied value keeps the dialog open and refreshes the suggestion. Overwrite atomically replaces the target browser record and removes the current record without losing the live document. Update focused tests and persistence documentation."
  Plan: "1. Extract a reusable collision dialog from the import flow. 2. Add storage/workflow support for atomically replacing a conflicting record during rename. 3. Route inline title edits through collision detection and the shared dialog. 4. Re-run collision resolution when an edited alternative is occupied, updating the field to the next free suffix. 5. Add store/workflow/UI tests and update the intentional-divergence documentation. 6. Run focused tests and declared repository checks, record verification, review, and commit."
  Verify Steps: "1. Focused Vitest tests for Writer storage, ODT workflows, file-dialog collision behavior, workspace rename behavior, and desktop integration pass. They assert overwrite identity/record removal, editable proposed names, repeated collisions, and successful unique rename. 2. npm format:check, lint, typecheck, check:dependencies, check:docs, check:file-size, and test:static pass. 3. node .agentplane/policy/check-routing.mjs and ap doctor pass. 4. git diff/status contain only task-scoped source, tests, docs, and Agentplane artifacts."
  Verification: "Pending implementation and checks."
  Rollback Plan: "Revert the implementation and deterministic close commits. The IndexedDB schema is unchanged, so no data migration rollback is required."
  Findings: "No findings yet."
id_source: "generated"
---
## Summary

Extend Writer's browser-title collision flow to manual renames, including editable indexed suggestions and repeated conflict resolution.

## Scope

Reuse the existing collision presentation for inline title edits. An occupied requested title offers overwrite or a prefilled first-free indexed title. Users may edit that field; another occupied value keeps the dialog open and refreshes the suggestion. Overwrite atomically replaces the target browser record and removes the current record without losing the live document. Update focused tests and persistence documentation.

## Plan

1. Extract a reusable collision dialog from the import flow. 2. Add storage/workflow support for atomically replacing a conflicting record during rename. 3. Route inline title edits through collision detection and the shared dialog. 4. Re-run collision resolution when an edited alternative is occupied, updating the field to the next free suffix. 5. Add store/workflow/UI tests and update the intentional-divergence documentation. 6. Run focused tests and declared repository checks, record verification, review, and commit.

## Verify Steps

1. Focused Vitest tests for Writer storage, ODT workflows, file-dialog collision behavior, workspace rename behavior, and desktop integration pass. They assert overwrite identity/record removal, editable proposed names, repeated collisions, and successful unique rename. 2. npm format:check, lint, typecheck, check:dependencies, check:docs, check:file-size, and test:static pass. 3. node .agentplane/policy/check-routing.mjs and ap doctor pass. 4. git diff/status contain only task-scoped source, tests, docs, and Agentplane artifacts.

## Verification

Pending implementation and checks.

## Rollback Plan

Revert the implementation and deterministic close commits. The IndexedDB schema is unchanged, so no data migration rollback is required.

## Findings

No findings yet.
