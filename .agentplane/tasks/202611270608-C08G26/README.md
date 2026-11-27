---
id: "202611270608-C08G26"
title: "Connect Writer Navigator bookmark actions and history"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 6
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-11-27T06:09:00.083Z"
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
    at: "2026-11-27T06:09:45.590Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: continue direct-mode task in current checkout."
doc_version: 3
doc_updated_at: "2026-11-27T06:09:45.590Z"
doc_updated_by: "CODER"
description: "Wire native bookmark edit and delete actions to Writer Navigator, reuse the bookmark dialog and native history payload, verify selection, delete all and recovery of bookmark endpoints."
sections:
  Summary: |-
    Connect Writer Navigator bookmark actions and history

    Wire native bookmark edit and delete actions to Writer Navigator, reuse the bookmark dialog and native history payload, verify selection, delete all and recovery of bookmark endpoints.
  Scope: "Writer Navigator bookmark entry Edit and Delete and Bookmark category Delete All, native bookmark dialog dispatch and ordinary bookmark insertion, rename and deletion history, resource mappings, and targeted tests."
  Plan: "Compare pinned Navigator bookmark actions, EditBookmark slot and native mark history. Reuse the existing bookmark dialog and endpoint history for single and grouped operations, and validate persisted bookmark metadata and focused Chromium behavior."
  Verify Steps: "Run focused Writer bookmark history, Navigator, dialog and command resource tests, TypeScript, Vite, Chromium bookmark flow, module/source and scoped static checks."
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

Connect Writer Navigator bookmark actions and history

Wire native bookmark edit and delete actions to Writer Navigator, reuse the bookmark dialog and native history payload, verify selection, delete all and recovery of bookmark endpoints.

## Scope

Writer Navigator bookmark entry Edit and Delete and Bookmark category Delete All, native bookmark dialog dispatch and ordinary bookmark insertion, rename and deletion history, resource mappings, and targeted tests.

## Plan

Compare pinned Navigator bookmark actions, EditBookmark slot and native mark history. Reuse the existing bookmark dialog and endpoint history for single and grouped operations, and validate persisted bookmark metadata and focused Chromium behavior.

## Verify Steps

Run focused Writer bookmark history, Navigator, dialog and command resource tests, TypeScript, Vite, Chromium bookmark flow, module/source and scoped static checks.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert task-related commit(s).
- Re-run required checks to confirm rollback safety.

## Findings
