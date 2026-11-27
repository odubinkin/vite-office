---
id: "202611270711-8WD106"
title: "Expose Writer Navigator cursor tracking preferences"
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
  - "Run focused Writer Navigator model, UI and configuration tests plus Chromium context menu scenarios; run scoped lint, formatting, resource, dependency, source tree and provenance checks, TypeScript and production build."
plan_approval:
  state: "approved"
  updated_at: "2026-11-27T07:11:32.415Z"
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
    at: "2026-11-27T07:11:39.615Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: continue direct-mode task in current checkout."
doc_version: 3
doc_updated_at: "2026-11-27T07:11:39.615Z"
doc_updated_by: "CODER"
description: "Connect Navigator context-menu tracking controls for the represented outline, table and bookmark behaviors, with native defaults, focus mode, and persistent Writer Navigator configuration."
sections:
  Summary: |-
    Expose Writer Navigator cursor tracking preferences

    Connect Navigator context-menu tracking controls for the represented outline, table and bookmark behaviors, with native defaults, focus mode, and persistent Writer Navigator configuration.
  Scope: |-
    - In scope: Connect Navigator context-menu tracking controls for the represented outline, table and bookmark behaviors, with native defaults, focus mode, and persistent Writer Navigator configuration.
    - Out of scope: unrelated refactors not required for "Expose Writer Navigator cursor tracking preferences".
  Plan: "Confirm the pinned Writer Navigator schema, popup resource and tracking order using both graphs and source. Add a source-owned SwNavigationConfig with the three represented tracking properties and a browser storage boundary. Connect a row-specific popup via the shared keyboard and pointer menu, keeping native identifiers and check/radio state. Apply focused outline expansion and off/table/bookmark behavior in the current cursor tracking pipeline. Cover settings round-trip and popup interaction, run targeted verification, record evidence and refresh the graph on close."
  Verify Steps: "Run focused Writer Navigator, configuration and shared popup unit tests. Run the Navigator Chromium spec to verify menu admission, radio and checkbox changes, focus, and behavior after reload. Run TypeScript, production build, scoped lint and formatting, dependency, source tree, Writer resource and scoped provenance checks."
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

Expose Writer Navigator cursor tracking preferences

Connect Navigator context-menu tracking controls for the represented outline, table and bookmark behaviors, with native defaults, focus mode, and persistent Writer Navigator configuration.

## Scope

- In scope: Connect Navigator context-menu tracking controls for the represented outline, table and bookmark behaviors, with native defaults, focus mode, and persistent Writer Navigator configuration.
- Out of scope: unrelated refactors not required for "Expose Writer Navigator cursor tracking preferences".

## Plan

Confirm the pinned Writer Navigator schema, popup resource and tracking order using both graphs and source. Add a source-owned SwNavigationConfig with the three represented tracking properties and a browser storage boundary. Connect a row-specific popup via the shared keyboard and pointer menu, keeping native identifiers and check/radio state. Apply focused outline expansion and off/table/bookmark behavior in the current cursor tracking pipeline. Cover settings round-trip and popup interaction, run targeted verification, record evidence and refresh the graph on close.

## Verify Steps

Run focused Writer Navigator, configuration and shared popup unit tests. Run the Navigator Chromium spec to verify menu admission, radio and checkbox changes, focus, and behavior after reload. Run TypeScript, production build, scoped lint and formatting, dependency, source tree, Writer resource and scoped provenance checks.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert task-related commit(s).
- Re-run required checks to confirm rollback safety.

## Findings
