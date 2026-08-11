---
id: "202608111319-NNS85F"
title: "Merge Writer paragraphs through Delete"
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
  updated_at: "2026-08-11T13:19:54.002Z"
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
    body: "Start: implementing bounded Writer forward Delete paragraph merge at an eligible document caret."
events:
  -
    type: "status"
    at: "2026-08-11T13:19:54.476Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implementing bounded Writer forward Delete paragraph merge at an eligible document caret."
doc_version: 3
doc_updated_at: "2026-08-11T13:19:54.476Z"
doc_updated_by: "CODER"
description: "Implement bounded native Delete behavior in the integrated Writer document canvas: at a collapsed caret at the end of a non-last plain-text paragraph, merge the following paragraph into it, retain the preceding paragraph properties, preserve immutable history and browser-local persistence, and focus the join boundary without adding a UI command."
sections:
  Summary: |-
    Merge Writer paragraphs through Delete

    Implement bounded native Delete behavior in the integrated Writer document canvas: at a collapsed caret at the end of a non-last plain-text paragraph, merge the following paragraph into it, retain the preceding paragraph properties, preserve immutable history and browser-local persistence, and focus the join boundary without adding a UI command.
  Scope: |-
    - In scope: pure merge-with-next operation, Delete at a collapsed end caret of a non-last paragraph, focus/history/persistence behavior, tests, and documentation.
    - Out of scope: Delete inside text, non-collapsed selections, last paragraph behavior, lists, tables, rich text, and menu or toolbar controls.
  Plan: |-
    1. Add a pure merge-with-next transition that keeps the leading paragraph identity and formatting.
    2. Wire eligible native Delete into immutable history and focus the join boundary.
    3. Add exhaustive unit/component/production browser evidence and document upstream provenance and limits.
  Verify Steps: |-
    1. Run format, lint, TypeScript, JSDoc, file-size, and office coverage checks. Expected: all pass at 100 percent coverage.
    2. Run production Playwright. Expected: Delete at a paragraph end removes the next paragraph boundary while Writer chrome remains accessible.
    3. Run diff, doctor, and policy routing checks. Expected: all pass.
    4. Defer static smoke, inventory, and aggregate verify to the user-approved ten-task cadence and record residual risk.
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "- Revert the implementation commit and rerun focused tests to restore the previous browser Delete behavior."
  Findings: ""
id_source: "generated"
---
## Summary

Merge Writer paragraphs through Delete

Implement bounded native Delete behavior in the integrated Writer document canvas: at a collapsed caret at the end of a non-last plain-text paragraph, merge the following paragraph into it, retain the preceding paragraph properties, preserve immutable history and browser-local persistence, and focus the join boundary without adding a UI command.

## Scope

- In scope: pure merge-with-next operation, Delete at a collapsed end caret of a non-last paragraph, focus/history/persistence behavior, tests, and documentation.
- Out of scope: Delete inside text, non-collapsed selections, last paragraph behavior, lists, tables, rich text, and menu or toolbar controls.

## Plan

1. Add a pure merge-with-next transition that keeps the leading paragraph identity and formatting.
2. Wire eligible native Delete into immutable history and focus the join boundary.
3. Add exhaustive unit/component/production browser evidence and document upstream provenance and limits.

## Verify Steps

1. Run format, lint, TypeScript, JSDoc, file-size, and office coverage checks. Expected: all pass at 100 percent coverage.
2. Run production Playwright. Expected: Delete at a paragraph end removes the next paragraph boundary while Writer chrome remains accessible.
3. Run diff, doctor, and policy routing checks. Expected: all pass.
4. Defer static smoke, inventory, and aggregate verify to the user-approved ten-task cadence and record residual risk.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert the implementation commit and rerun focused tests to restore the previous browser Delete behavior.

## Findings
