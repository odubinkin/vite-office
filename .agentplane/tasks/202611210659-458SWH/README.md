---
id: "202611210659-458SWH"
title: "Connect Calc conditional formatting manager and rule editor"
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
  updated_at: "2026-11-21T06:59:53.717Z"
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
    body: "Start: Connect native Calc conditional formatting authoring and manager commands and verify the tenth regression checkpoint."
events:
  -
    type: "status"
    at: "2026-11-21T06:59:54.286Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: Connect native Calc conditional formatting authoring and manager commands and verify the tenth regression checkpoint."
doc_version: 3
doc_updated_at: "2026-11-21T06:59:54.286Z"
doc_updated_by: "CODER"
description: "Expose the existing Calc conditional rule families, native range assignments and transactional manager through the upstream dialog, slot, and history structure."
sections:
  Summary: "Connect existing conditional formats to the source Calc rule editor and manager, on the active sheet, with native Sfx responses and undo."
  Scope: "Connect the Format conditional-format actions and the original editor and manager. Support the conditional-format families already represented in the core, with native rule order, named styles and range assignments. Port the source document-function and undo boundaries needed for add, replace and remove. Preserve unrelated formats, sheet state and file workflows. Run the scheduled full application regression cycle after the focused feature checks."
  Plan: "Model source command selection, range and rule drafts, and manager result exchange. Port native document mutations and undo with the existing format list and attributed cells. Build browser dialogs including reference selection. Verify focused regressions and the scheduled full test cycle."
  Verify Steps: |-
    - Run focused conditional-format dialog, range, grid, history, and selected ODS/XLSX settings regressions. Include upstream UI cases for manager edit/delete, range changes, condition-type changes, dates and color scales as applicable.
    - Run changed-path lint and format, tooling and office TypeScript, Calc resources, provenance, dependency and file-size checks.
    - Run the regular full office, inventory, tooling and browser suites and the static build after the tenth task implementation. Record exit status and counts for each.
  Verification: "Pending implementation and local verification."
  Rollback Plan: "Revert the implementation commits to restore the prior condition import and paint behavior and remove the newly exposed management commands."
  Findings: "Pending source review and verification."
id_source: "generated"
---
## Summary

Connect existing conditional formats to the source Calc rule editor and manager, on the active sheet, with native Sfx responses and undo.

## Scope

Connect the Format conditional-format actions and the original editor and manager. Support the conditional-format families already represented in the core, with native rule order, named styles and range assignments. Port the source document-function and undo boundaries needed for add, replace and remove. Preserve unrelated formats, sheet state and file workflows. Run the scheduled full application regression cycle after the focused feature checks.

## Plan

Model source command selection, range and rule drafts, and manager result exchange. Port native document mutations and undo with the existing format list and attributed cells. Build browser dialogs including reference selection. Verify focused regressions and the scheduled full test cycle.

## Verify Steps

- Run focused conditional-format dialog, range, grid, history, and selected ODS/XLSX settings regressions. Include upstream UI cases for manager edit/delete, range changes, condition-type changes, dates and color scales as applicable.
- Run changed-path lint and format, tooling and office TypeScript, Calc resources, provenance, dependency and file-size checks.
- Run the regular full office, inventory, tooling and browser suites and the static build after the tenth task implementation. Record exit status and counts for each.

## Verification

Pending implementation and local verification.

## Rollback Plan

Revert the implementation commits to restore the prior condition import and paint behavior and remove the newly exposed management commands.

## Findings

Pending source review and verification.
