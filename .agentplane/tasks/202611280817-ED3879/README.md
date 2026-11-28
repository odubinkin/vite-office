---
id: "202611280817-ED3879"
title: "Connect the native Writer Navigator Navigate By controls"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 5
origin:
  system: "manual"
depends_on: []
tags:
  - "navigator"
  - "writer"
task_kind: "code"
mutation_scope: "code"
verify:
  - "Run only affected Writer Navigator, cursor, search and command tests and scoped static checks. Run focused Chromium Navigator scenarios for physical viewport scrolling, direction and focus."
plan_approval:
  state: "approved"
  updated_at: "2026-11-28T08:17:40.488Z"
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
    at: "2026-11-28T08:17:55.423Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: continue direct-mode task in current checkout."
doc_version: 3
doc_updated_at: "2026-11-28T08:17:55.423Z"
doc_updated_by: "CODER"
description: "Expose the native Navigate By selector and previous and next controls for represented document targets. Connect the view slots, physical page viewport movement with wrapping, and model traversal for headings, tables, bookmarks, comments and repeat search."
sections:
  Summary: |-
    Connect the native Writer Navigator Navigate By controls

    Expose the native Navigate By selector and previous and next controls for represented document targets. Connect the view slots, physical page viewport movement with wrapping, and model traversal for headings, tables, bookmarks, comments and repeat search.
  Scope: |-
    - In scope: Expose the native Navigate By selector and previous and next controls for represented document targets. Connect the view slots, physical page viewport movement with wrapping, and model traversal for headings, tables, bookmarks, comments and repeat search.
    - Out of scope: unrelated refactors not required for "Connect the native Writer Navigator Navigate By controls".
  Plan: "Use both Graphify indexes and pinned workctrl, viewmdi and navigatorpanel sources to port the represented Navigate By IDs, order and relevant slots. Keep model traversal and current selection in Writer, expose viewport paging through the browser view, and reuse the existing annotation and search owners. Split the Navigator navigation toolbar from the content-tree renderer. Add focused checks for ordering, wrap, unchanged cursor during viewport scrolling, and real keyboard and pointer use. Run only affected suites and scoped static checks."
  Verify Steps: "Run affected Navigator, cursor, view-slot, repeat-search and configuration cases as applicable, the focused Chromium Navigator flows, and scoped source checks, TypeScript and Vite build. No full test run."
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

Connect the native Writer Navigator Navigate By controls

Expose the native Navigate By selector and previous and next controls for represented document targets. Connect the view slots, physical page viewport movement with wrapping, and model traversal for headings, tables, bookmarks, comments and repeat search.

## Scope

- In scope: Expose the native Navigate By selector and previous and next controls for represented document targets. Connect the view slots, physical page viewport movement with wrapping, and model traversal for headings, tables, bookmarks, comments and repeat search.
- Out of scope: unrelated refactors not required for "Connect the native Writer Navigator Navigate By controls".

## Plan

Use both Graphify indexes and pinned workctrl, viewmdi and navigatorpanel sources to port the represented Navigate By IDs, order and relevant slots. Keep model traversal and current selection in Writer, expose viewport paging through the browser view, and reuse the existing annotation and search owners. Split the Navigator navigation toolbar from the content-tree renderer. Add focused checks for ordering, wrap, unchanged cursor during viewport scrolling, and real keyboard and pointer use. Run only affected suites and scoped static checks.

## Verify Steps

Run affected Navigator, cursor, view-slot, repeat-search and configuration cases as applicable, the focused Chromium Navigator flows, and scoped source checks, TypeScript and Vite build. No full test run.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert task-related commit(s).
- Re-run required checks to confirm rollback safety.

## Findings
