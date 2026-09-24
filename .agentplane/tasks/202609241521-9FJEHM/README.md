---
id: "202609241521-9FJEHM"
title: "Add canonical inline bookmarks and soft page breaks"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 6
origin:
  system: "manual"
depends_on:
  - "202609241521-D5QMQG"
tags:
  - "code"
task_kind: "code"
mutation_scope: "code"
verify:
  - "Run pinned bookmark, hyperlink and soft-page-break ODT fixtures plus UI create/navigate/rename/remove and save/reopen tests."
  - "npm run verify"
plan_approval:
  state: "approved"
  updated_at: "2026-09-24T15:23:16.683Z"
  updated_by: "ORCHESTRATOR"
  note: "User requested implementation of the seven ordered phases in docs/program/certification-odt-import-plan.md; outside-repo sample access remains pending separate authorization."
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
    at: "2026-09-24T17:32:25.378Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: continue direct-mode task in current checkout."
doc_version: 3
doc_updated_at: "2026-09-24T17:32:25.378Z"
doc_updated_by: "CODER"
description: "Phase 3: Writer mark/hint state, nested links, Worker transfer, export and bookmark/break UI controls."
sections:
  Summary: |-
    Add canonical inline bookmarks and soft page breaks

    Phase 3: Writer mark/hint state, nested links, Worker transfer, export and bookmark/break UI controls.
  Scope: "Canonical bookmark positions, soft page-break hints and nested links; Worker transfer, export, rendering and bookmark/break/hyperlink UI."
  Plan: |-
    1. Match pinned Writer text-context and mark ownership behavior.
    2. Add mark/hint state and stable edit/transfer/export positions.
    3. Add bookmark insert/edit/navigation and applicable break controls.
    4. Test pinned upstream fixtures, synthetic edge cases and UI round trips.
  Verify Steps: |-
    1. `npm run verify` passes.
    2. `collapsed_bookmark.odt`, `hyperlink.odt` and `tdf94882.odt` tests assert ranges/targets/positions through reimport.
    3. UI tests create, navigate, rename and remove bookmarks and exercise break/hyperlink controls.
    4. Private sample retains eight bookmarks and nine soft breaks at logical positions; record diagnostics and deltas.
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: |-
    - Revert task-related commit(s).
    - Re-run required checks to confirm rollback safety.
  Findings: ""
id_source: "generated"
---
## Summary

Add canonical inline bookmarks and soft page breaks

Phase 3: Writer mark/hint state, nested links, Worker transfer, export and bookmark/break UI controls.

## Scope

Canonical bookmark positions, soft page-break hints and nested links; Worker transfer, export, rendering and bookmark/break/hyperlink UI.

## Plan

1. Match pinned Writer text-context and mark ownership behavior.
2. Add mark/hint state and stable edit/transfer/export positions.
3. Add bookmark insert/edit/navigation and applicable break controls.
4. Test pinned upstream fixtures, synthetic edge cases and UI round trips.

## Verify Steps

1. `npm run verify` passes.
2. `collapsed_bookmark.odt`, `hyperlink.odt` and `tdf94882.odt` tests assert ranges/targets/positions through reimport.
3. UI tests create, navigate, rename and remove bookmarks and exercise break/hyperlink controls.
4. Private sample retains eight bookmarks and nine soft breaks at logical positions; record diagnostics and deltas.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert task-related commit(s).
- Re-run required checks to confirm rollback safety.

## Findings
