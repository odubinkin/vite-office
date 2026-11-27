---
id: "202611270720-4D3JW3"
title: "Connect native Writer Navigator context actions and outline depth"
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
  - "Run focused Navigator, popup and configuration unit tests, Chromium Navigator flows, app type and production build checks, scoped lint, resources, dependency, source tree and provenance checks."
plan_approval:
  state: "approved"
  updated_at: "2026-11-27T07:20:54.837Z"
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
    at: "2026-11-27T07:21:00.294Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: continue direct-mode task in current checkout."
doc_version: 3
doc_updated_at: "2026-11-27T07:21:00.294Z"
doc_updated_by: "CODER"
description: "Expose existing Writer Navigator go-to, grouped heading moves, bookmark deletion, and tree expansion actions in native context resource order. Share the outline level between the toolbar, context submenu, and persistent Navigator configuration."
sections:
  Summary: |-
    Connect native Writer Navigator context actions and outline depth

    Expose existing Writer Navigator go-to, grouped heading moves, bookmark deletion, and tree expansion actions in native context resource order. Share the outline level between the toolbar, context submenu, and persistent Navigator configuration.
  Scope: |-
    - In scope: Expose existing Writer Navigator go-to, grouped heading moves, bookmark deletion, and tree expansion actions in native context resource order. Share the outline level between the toolbar, context submenu, and persistent Navigator configuration.
    - Out of scope: unrelated refactors not required for "Connect native Writer Navigator context actions and outline depth".
  Plan: "Confirm native popup resource order, action admission and branch operations against the pinned source. Move Navigator popup composition into its own browser owner, route menu IDs into the existing heading, cursor and bookmark mechanisms, and add native outline expansion and category collapse. Bring OutlineLevel into the source navigation configuration and use the same setter for the toolbar and contextual submenu. Add mounted and Chromium tests for keyboard and pointer, grouped edits, outline depth and settings persistence. Record validation and refresh the graph on close."
  Verify Steps: "Run targeted Navigator, popup and configuration Vitest suites and the Navigator Chromium spec. Verify native order and admission, undo, focus retention, and persisted shared outline depth. Run TypeScript, production build, scoped lint and formatting, source tree, Writer resources, dependency and scoped provenance checks."
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

Connect native Writer Navigator context actions and outline depth

Expose existing Writer Navigator go-to, grouped heading moves, bookmark deletion, and tree expansion actions in native context resource order. Share the outline level between the toolbar, context submenu, and persistent Navigator configuration.

## Scope

- In scope: Expose existing Writer Navigator go-to, grouped heading moves, bookmark deletion, and tree expansion actions in native context resource order. Share the outline level between the toolbar, context submenu, and persistent Navigator configuration.
- Out of scope: unrelated refactors not required for "Connect native Writer Navigator context actions and outline depth".

## Plan

Confirm native popup resource order, action admission and branch operations against the pinned source. Move Navigator popup composition into its own browser owner, route menu IDs into the existing heading, cursor and bookmark mechanisms, and add native outline expansion and category collapse. Bring OutlineLevel into the source navigation configuration and use the same setter for the toolbar and contextual submenu. Add mounted and Chromium tests for keyboard and pointer, grouped edits, outline depth and settings persistence. Record validation and refresh the graph on close.

## Verify Steps

Run targeted Navigator, popup and configuration Vitest suites and the Navigator Chromium spec. Verify native order and admission, undo, focus retention, and persisted shared outline depth. Run TypeScript, production build, scoped lint and formatting, source tree, Writer resources, dependency and scoped provenance checks.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert task-related commit(s).
- Re-run required checks to confirm rollback safety.

## Findings
