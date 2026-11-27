---
id: "202611270601-E652PR"
title: "Connect Writer Navigator outline multi-selection"
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
  updated_at: "2026-11-27T06:01:19.554Z"
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
    at: "2026-11-27T06:01:46.579Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: continue direct-mode task in current checkout."
doc_version: 3
doc_updated_at: "2026-11-27T06:01:46.579Z"
doc_updated_by: "CODER"
description: "Port heading-root multiple selection and grouped chapter commands, including selected ancestors and one undo, and reconcile the generated Navigator toolbar order witness."
sections:
  Summary: |-
    Connect Writer Navigator outline multi-selection

    Port heading-root multiple selection and grouped chapter commands, including selected ancestors and one undo, and reconcile the generated Navigator toolbar order witness.
  Scope: "Writer Navigator heading-root selection, grouped chapter and level actions, their browser and core fixtures, and the native toolbar resource witness."
  Plan: "Respect the pinned outline root selection mode, resolve stable heading identities in tree order, use one undo group for heading commands, and verify selection and history through the real browser."
  Verify Steps: "Run focused Navigator and toolbar resource tests, application typecheck and build, scoped lint and format, source boundaries and provenance, and Chromium Navigator tests."
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

Connect Writer Navigator outline multi-selection

Port heading-root multiple selection and grouped chapter commands, including selected ancestors and one undo, and reconcile the generated Navigator toolbar order witness.

## Scope

Writer Navigator heading-root selection, grouped chapter and level actions, their browser and core fixtures, and the native toolbar resource witness.

## Plan

Respect the pinned outline root selection mode, resolve stable heading identities in tree order, use one undo group for heading commands, and verify selection and history through the real browser.

## Verify Steps

Run focused Navigator and toolbar resource tests, application typecheck and build, scoped lint and format, source boundaries and provenance, and Chromium Navigator tests.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert task-related commit(s).
- Re-run required checks to confirm rollback safety.

## Findings
