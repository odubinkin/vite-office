---
id: "202609241135-227P0M"
title: "F9 Target Writer layout invalidation"
status: "DOING"
priority: "high"
owner: "CODER"
revision: 5
origin:
  system: "manual"
depends_on:
  - "202609241135-FVV0N3"
tags:
  - "code"
  - "parity"
verify:
  - "npm run verify"
plan_approval:
  state: "approved"
  updated_at: "2026-09-24T13:42:50.074Z"
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
    body: "Start: replace whole-document serialization with revision and targeted frame invalidation."
events:
  -
    type: "status"
    at: "2026-09-24T13:42:50.681Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: replace whole-document serialization with revision and targeted frame invalidation."
doc_version: 3
doc_updated_at: "2026-09-24T13:42:50.681Z"
doc_updated_by: "CODER"
description: "Implement F9: replace JSON serialization oracle with model revision and targeted dirty-frame propagation, preserving stable identity."
sections:
  Summary: |-
    F9 Target Writer layout invalidation

    Implement F9: replace JSON serialization oracle with model revision and targeted dirty-frame propagation, preserving stable identity.
  Scope: |-
    - In scope: Implement F9: replace JSON serialization oracle with model revision and targeted dirty-frame propagation, preserving stable identity.
    - Out of scope: unrelated refactors not required for "F9 Target Writer layout invalidation".
  Plan: "Replace SwRootFrame JSON.stringify invalidation and frame keys with current-document model revision, browser measurement revision and explicit value comparisons. Track the earliest model/device affected paragraph from Writer hints, reconcile page/text-frame identity by node, line range, geometry and placement, and reflow affected successors while preserving unaffected frames. Keep measurement revision in sw/browser/editor, exact page-flow behavior, line numbers and source evidence; add focused tests for unchanged inputs, content/attribute changes, changed line geometry, page descriptors and follow frames."
  Verify Steps: "1. SwRootFrame.Format has no whole-document, paragraph or frame JSON.stringify invalidation keys; model revision, browser measurement revision and typed comparisons determine work, and Writer hints identify the earliest affected node when possible. 2. Unchanged passes reuse the snapshot; changed nodes and layout geometry reflow affected successors while unchanged page/text frames retain identity whenever placement and geometry match. Tests cover model edits, attribute changes, measurement/font/width changes, page-descriptor changes, line numbers and follow frames. 3. Browser measurement revision stays under sw/browser/editor, exact provenance/inventory data reflect the algorithm, and npm run verify plus git diff --check pass."
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

F9 Target Writer layout invalidation

Implement F9: replace JSON serialization oracle with model revision and targeted dirty-frame propagation, preserving stable identity.

## Scope

- In scope: Implement F9: replace JSON serialization oracle with model revision and targeted dirty-frame propagation, preserving stable identity.
- Out of scope: unrelated refactors not required for "F9 Target Writer layout invalidation".

## Plan

Replace SwRootFrame JSON.stringify invalidation and frame keys with current-document model revision, browser measurement revision and explicit value comparisons. Track the earliest model/device affected paragraph from Writer hints, reconcile page/text-frame identity by node, line range, geometry and placement, and reflow affected successors while preserving unaffected frames. Keep measurement revision in sw/browser/editor, exact page-flow behavior, line numbers and source evidence; add focused tests for unchanged inputs, content/attribute changes, changed line geometry, page descriptors and follow frames.

## Verify Steps

1. SwRootFrame.Format has no whole-document, paragraph or frame JSON.stringify invalidation keys; model revision, browser measurement revision and typed comparisons determine work, and Writer hints identify the earliest affected node when possible. 2. Unchanged passes reuse the snapshot; changed nodes and layout geometry reflow affected successors while unchanged page/text frames retain identity whenever placement and geometry match. Tests cover model edits, attribute changes, measurement/font/width changes, page-descriptor changes, line numbers and follow frames. 3. Browser measurement revision stays under sw/browser/editor, exact provenance/inventory data reflect the algorithm, and npm run verify plus git diff --check pass.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert task-related commit(s).
- Re-run required checks to confirm rollback safety.

## Findings
