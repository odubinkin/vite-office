---
id: "202611211651-DM546D"
title: "Connect Calc named range definition and navigation"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 10
origin:
  system: "manual"
depends_on: []
tags:
  - "calc"
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-11-21T16:51:37.267Z"
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
    body: "Start: Connect native Calc range-name definition, selection and name-box navigation with source undo."
events:
  -
    type: "status"
    at: "2026-11-21T16:51:37.673Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: Connect native Calc range-name definition, selection and name-box navigation with source undo."
doc_version: 3
doc_updated_at: "2026-11-21T16:51:37.673Z"
doc_updated_by: "CODER"
description: "Expose native named range definition and name-box navigation through the existing Calc range collections and undo contracts."
sections:
  Summary: "Connect the Calc Define Name dialog and name-box range creation and navigation to native workbook and sheet name collections."
  Scope: "Use the original FID_ADD_NAME command, reference picker, name/type/scope fields, validation, insertion, source-index-aware undo, and name-box navigation. Reuse the existing workbook model and ODS and XLSX names. This is task 1 of the ten-task regression cycle."
  Plan: "Map upstream definition and navigation entry points to the existing range names, compile/validate and index-preserving undo, connect Sfx and the native reference picker, and verify scope/history/file round-trips and nearby formula/view tests."
  Verify Steps: "Run affected Calc named-range, formula, IO, and view tests including the new definition and navigation scenarios. Check changed-path format and lint, Office TypeScript, and new-source provenance and module boundaries."
  Verification: "Pending targeted implementation verification."
  Rollback Plan: "Revert the task code commits to remove command and name-box authoring without changing persisted name formats."
  Findings: "Pending pinned upstream comparison and verification."
id_source: "generated"
---
## Summary

Connect the Calc Define Name dialog and name-box range creation and navigation to native workbook and sheet name collections.

## Scope

Use the original FID_ADD_NAME command, reference picker, name/type/scope fields, validation, insertion, source-index-aware undo, and name-box navigation. Reuse the existing workbook model and ODS and XLSX names. This is task 1 of the ten-task regression cycle.

## Plan

Map upstream definition and navigation entry points to the existing range names, compile/validate and index-preserving undo, connect Sfx and the native reference picker, and verify scope/history/file round-trips and nearby formula/view tests.

## Verify Steps

Run affected Calc named-range, formula, IO, and view tests including the new definition and navigation scenarios. Check changed-path format and lint, Office TypeScript, and new-source provenance and module boundaries.

## Verification

Pending targeted implementation verification.

## Rollback Plan

Revert the task code commits to remove command and name-box authoring without changing persisted name formats.

## Findings

Pending pinned upstream comparison and verification.
