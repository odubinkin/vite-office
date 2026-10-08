---
id: "202610080656-XDXRZG"
title: "Unify Writer dialog styling and responsive layout"
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
  updated_at: "2026-10-08T06:57:30.922Z"
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
    body: "Start: Apply the approved Writer dialog visual contract and verify responsive geometry without changing document workflows."
events:
  -
    type: "status"
    at: "2026-10-08T06:57:36.380Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: Apply the approved Writer dialog visual contract and verify responsive geometry without changing document workflows."
doc_version: 3
doc_updated_at: "2026-10-08T06:57:36.380Z"
doc_updated_by: "CODER"
description: "Match all Writer dialogs to Open document and Export, complete Save As spacing, and eliminate overlapping controls across desktop and narrow/short viewports."
sections:
  Summary: "Unify Writer modal presentation with the existing Open document/Export design and remove responsive layout collisions."
  Scope: "Writer dialog presenters, shared browser modal styles/components, and focused dialog layout verification. Keep document commands, persistence and model behavior intact. No network or external publication."
  Plan: "Approved by user on 2026-10-08. CODER implements a shared Open-document visual contract, completes Save As spacing/actions, and updates all Writer dialogs and responsive grids. Verification covers existing dialog behavior plus rendered geometry on desktop, narrow and short viewports. Record evidence and finish the direct task with intentional changes only."
  Verify Steps: |-
    1. Run focused component tests for Writer dialog presenters, cancellation, file operations and existing modal workflows.
    2. Build the application and run focused Chromium checks: compare dialog surfaces to Open/Export, inspect every supported dialog and tab on 1280x800 and 390x600 plus short 640x360 viewports; assert no control overflow/overlap, usable scrolling, Save As padding, and reachable close/actions.
    3. Run typecheck, lint/format for changed files, module-boundary, source-provenance and documentation/file-size checks, ap doctor and routing validation.
    4. Review intentional diff and final git status; record verification through ap verify and close via the direct route.
  Verification: "Pending implementation and declared checks."
  Rollback Plan: "Revert the task implementation commit to restore the prior dialog presentation; document model and stored content are unaffected."
  Findings: "Initial inspection found an unpadded Save As form and inconsistent per-dialog layout. Global modal-panel CSS also overrides the intended Tailwind radius, border and shadow."
id_source: "generated"
---
## Summary

Unify Writer modal presentation with the existing Open document/Export design and remove responsive layout collisions.

## Scope

Writer dialog presenters, shared browser modal styles/components, and focused dialog layout verification. Keep document commands, persistence and model behavior intact. No network or external publication.

## Plan

Approved by user on 2026-10-08. CODER implements a shared Open-document visual contract, completes Save As spacing/actions, and updates all Writer dialogs and responsive grids. Verification covers existing dialog behavior plus rendered geometry on desktop, narrow and short viewports. Record evidence and finish the direct task with intentional changes only.

## Verify Steps

1. Run focused component tests for Writer dialog presenters, cancellation, file operations and existing modal workflows.
2. Build the application and run focused Chromium checks: compare dialog surfaces to Open/Export, inspect every supported dialog and tab on 1280x800 and 390x600 plus short 640x360 viewports; assert no control overflow/overlap, usable scrolling, Save As padding, and reachable close/actions.
3. Run typecheck, lint/format for changed files, module-boundary, source-provenance and documentation/file-size checks, ap doctor and routing validation.
4. Review intentional diff and final git status; record verification through ap verify and close via the direct route.

## Verification

Pending implementation and declared checks.

## Rollback Plan

Revert the task implementation commit to restore the prior dialog presentation; document model and stored content are unaffected.

## Findings

Initial inspection found an unpadded Save As form and inconsistent per-dialog layout. Global modal-panel CSS also overrides the intended Tailwind radius, border and shadow.
