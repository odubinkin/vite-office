---
id: "202611201222-VQCBGY"
title: "Align Calc ODS row and column default cell styles"
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
  updated_at: "2026-11-20T12:23:10.729Z"
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
    body: "Start: Port the native Calc ODS cell style range and column default selection paths."
events:
  -
    type: "status"
    at: "2026-11-20T12:23:18.961Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: Port the native Calc ODS cell style range and column default selection paths."
doc_version: 3
doc_updated_at: "2026-11-20T12:23:18.961Z"
doc_updated_by: "CODER"
description: "Port the native Calc XML default-style range import and column default export selection, preserving formatted empties, repeated ranges, typed values and native pattern ownership. Replay the original tdf126116 FODS scenario with inherited formatting."
sections:
  Summary: |-
    Align Calc ODS row and column default cell styles

    Port the native Calc XML default-style range import and column default export selection, preserving formatted empties, repeated ranges, typed values and native pattern ownership. Replay the original tdf126116 FODS scenario with inherited formatting.
  Scope: "Calc ODF range style import and export, native Calc document column attribute selection, represented typed-value interaction and Worker round trip, focused Calc tests using pinned LibreOffice data, and Calc suspected upstream issues."
  Plan: "Port the represented native style range helper and its row and column default resolution, applying styles before type-based number formats. Reuse the native cell pattern ranges to select column defaults by covered row count and first-row tie-break, then use ODF cell and column styles with the original omission rules. Verify native fixture and repeated styled ranges through ODS and Worker."
  Verify Steps: |-
    1. npm run test:calc -- src/sc/source/filter/xml src/sc/browser/filter/xml --maxWorkers 2 --testTimeout 120000. Cover original tdf126116 with column defaults, mixed explicit and inherited styles, repeats, typed values, export column defaults and Worker transfer.
    2. npm run typecheck --workspace @vite-office/office.
    3. Run scoped ESLint and Prettier, git diff --check, ap doctor, and node .agentplane/policy/check-routing.mjs.
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert the committed Calc ODF cell-style range and column default implementation with its tests and audit findings."
  Findings: ""
id_source: "generated"
---
## Summary

Align Calc ODS row and column default cell styles

Port the native Calc XML default-style range import and column default export selection, preserving formatted empties, repeated ranges, typed values and native pattern ownership. Replay the original tdf126116 FODS scenario with inherited formatting.

## Scope

Calc ODF range style import and export, native Calc document column attribute selection, represented typed-value interaction and Worker round trip, focused Calc tests using pinned LibreOffice data, and Calc suspected upstream issues.

## Plan

Port the represented native style range helper and its row and column default resolution, applying styles before type-based number formats. Reuse the native cell pattern ranges to select column defaults by covered row count and first-row tie-break, then use ODF cell and column styles with the original omission rules. Verify native fixture and repeated styled ranges through ODS and Worker.

## Verify Steps

1. npm run test:calc -- src/sc/source/filter/xml src/sc/browser/filter/xml --maxWorkers 2 --testTimeout 120000. Cover original tdf126116 with column defaults, mixed explicit and inherited styles, repeats, typed values, export column defaults and Worker transfer.
2. npm run typecheck --workspace @vite-office/office.
3. Run scoped ESLint and Prettier, git diff --check, ap doctor, and node .agentplane/policy/check-routing.mjs.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert the committed Calc ODF cell-style range and column default implementation with its tests and audit findings.

## Findings
