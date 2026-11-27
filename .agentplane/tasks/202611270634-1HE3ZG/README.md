---
id: "202611270634-1HE3ZG"
title: "Synchronize Writer Navigator with the document cursor"
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
  updated_at: "2026-11-27T06:34:17.197Z"
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
    at: "2026-11-27T06:34:50.267Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: continue direct-mode task in current checkout."
doc_version: 3
doc_updated_at: "2026-11-27T06:34:50.267Z"
doc_updated_by: "CODER"
description: "Connect default native outline, table and bookmark tracking to the modeless Navigator while retaining explicit tree selection and scope."
sections:
  Summary: |-
    Synchronize Writer Navigator with the document cursor

    Connect default native outline, table and bookmark tracking to the modeless Navigator while retaining explicit tree selection and scope.
  Scope: "Default Writer Navigator tracking for the represented outline, table and bookmark owners, current-document focus, root and outline depth filters, and corresponding native UI regression fixtures."
  Plan: "Resolve the native outline cursor query, reuse Writer table and mark identity in the original priority, and reflect cursor changes without changing an active tree selection. Port the pinned heading and bookmark tracking tests."
  Verify Steps: "Run focused Writer cursor shell, Navigator and slot tests; TypeScript and production build; Chromium Navigator flows; scoped lint, formatting, dependency, source tree and provenance checks."
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

Synchronize Writer Navigator with the document cursor

Connect default native outline, table and bookmark tracking to the modeless Navigator while retaining explicit tree selection and scope.

## Scope

Default Writer Navigator tracking for the represented outline, table and bookmark owners, current-document focus, root and outline depth filters, and corresponding native UI regression fixtures.

## Plan

Resolve the native outline cursor query, reuse Writer table and mark identity in the original priority, and reflect cursor changes without changing an active tree selection. Port the pinned heading and bookmark tracking tests.

## Verify Steps

Run focused Writer cursor shell, Navigator and slot tests; TypeScript and production build; Chromium Navigator flows; scoped lint, formatting, dependency, source tree and provenance checks.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert task-related commit(s).
- Re-run required checks to confirm rollback safety.

## Findings
