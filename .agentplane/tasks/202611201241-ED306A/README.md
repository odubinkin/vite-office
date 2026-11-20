---
id: "202611201241-ED306A"
title: "Align Writer ODT table cell values and formulas"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 7
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-11-20T12:42:09.961Z"
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
    body: "Start: Route Writer ODT cell values and formulas through native table box attributes."
events:
  -
    type: "status"
    at: "2026-11-20T12:42:18.149Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: Route Writer ODT cell values and formulas through native table box attributes."
doc_version: 3
doc_updated_at: "2026-11-20T12:42:18.149Z"
doc_updated_by: "CODER"
description: "Use native Writer table box attributes for ODF numeric formats, typed values, string overrides, formula caches and protection, with ODT and Worker round-trip verification against pinned fixtures."
sections:
  Summary: |-
    Align Writer ODT table cell values and formulas

    Use native Writer table box attributes for ODF numeric formats, typed values, string overrides, formula caches and protection, with ODT and Worker round-trip verification against pinned fixtures.
  Scope: "Writer ODT table cell import and export, shared ODF table and data style contexts, native box attributes and display refresh, Writer Worker records, Writer suspected upstream issues and targeted native regression tests."
  Plan: "Read authored value attributes and styles using shared conversion contracts and apply original Writer box attributes after importing text. Preserve the native formula namespace, invalid numeric sentinel and string precedence. Export the same data and preserve native format code/language and box items across Worker records. Test the pinned fixtures and typed values with focused Writer and shared profiles."
  Verify Steps: |-
    1. Run npm run test:writer -- src/sw/source/filter/xml src/sw/browser/filter/xml --maxWorkers 2 --testTimeout 120000. Cover native box value, formula, protection, data styles, string override, numeric display and package/Worker round trips.
    2. Run shared XML table and number style tests for the changed modules.
    3. Run office typecheck, scoped lint and formatting, git diff --check, ap doctor and policy routing.
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert the Writer table value implementation and its tests and issue records."
  Findings: ""
id_source: "generated"
---
## Summary

Align Writer ODT table cell values and formulas

Use native Writer table box attributes for ODF numeric formats, typed values, string overrides, formula caches and protection, with ODT and Worker round-trip verification against pinned fixtures.

## Scope

Writer ODT table cell import and export, shared ODF table and data style contexts, native box attributes and display refresh, Writer Worker records, Writer suspected upstream issues and targeted native regression tests.

## Plan

Read authored value attributes and styles using shared conversion contracts and apply original Writer box attributes after importing text. Preserve the native formula namespace, invalid numeric sentinel and string precedence. Export the same data and preserve native format code/language and box items across Worker records. Test the pinned fixtures and typed values with focused Writer and shared profiles.

## Verify Steps

1. Run npm run test:writer -- src/sw/source/filter/xml src/sw/browser/filter/xml --maxWorkers 2 --testTimeout 120000. Cover native box value, formula, protection, data styles, string override, numeric display and package/Worker round trips.
2. Run shared XML table and number style tests for the changed modules.
3. Run office typecheck, scoped lint and formatting, git diff --check, ap doctor and policy routing.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert the Writer table value implementation and its tests and issue records.

## Findings
