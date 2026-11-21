---
id: "202611210550-KX1ZJ1"
title: "Connect Calc header and footer content editing"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 12
origin:
  system: "manual"
depends_on: []
tags:
  - "calc"
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-11-21T05:50:59.490Z"
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
    body: "Start: Connect source header/footer dialog variants and native rich-text fields to Calc."
events:
  -
    type: "status"
    at: "2026-11-21T05:50:59.843Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: Connect source header/footer dialog variants and native rich-text fields to Calc."
doc_version: 3
doc_updated_at: "2026-11-21T06:30:28.276Z"
doc_updated_by: "CODER"
description: "Connect the native standalone and page-style header/footer editors to Calc rich text and print fields."
sections:
  Summary: "Connect Calc header and footer content editors to the current page style and EditEngine."
  Scope: "Standalone Edit Header and Footer and nested Header/Footer Edit, including original tab variants, three rich-text portions, presets, character formatting, fields and preview values. Preserve the shared style, asynchronous cancellation, ODS/XLSX content transport, and existing browser file workflows. Printer preview stays separate."
  Plan: "Implement source field and dialog owners. Wire standalone and nested browser editors and native widget interactions, and verify field preservation and both style commit paths."
  Verify Steps: |-
    - Run focused Calc header/footer, page-style, resource, and file settings tests.
    - Run tooling and office TypeScript and changed-path ESLint and Prettier.
    - Run resources, source provenance, size and dependency checks, and patch whitespace validation.
  Verification: "Pending implementation."
  Rollback Plan: "Revert the implementation commit to restore the previous page-style settings and file behavior."
  Findings: "The standalone resource matrix, file field preset state, and reset behavior on unset content follow LibreOffice and are recorded as CALC-789–791. The browser preserves native rich-text objects, uses the standard sheet and page fields for a new workbook, and resolves file names through the current medium. The browser Text Attributes dialog projects the common font, color and position controls, and profile-based presets use empty profile values."
id_source: "generated"
---
## Summary

Connect Calc header and footer content editors to the current page style and EditEngine.

## Scope

Standalone Edit Header and Footer and nested Header/Footer Edit, including original tab variants, three rich-text portions, presets, character formatting, fields and preview values. Preserve the shared style, asynchronous cancellation, ODS/XLSX content transport, and existing browser file workflows. Printer preview stays separate.

## Plan

Implement source field and dialog owners. Wire standalone and nested browser editors and native widget interactions, and verify field preservation and both style commit paths.

## Verify Steps

- Run focused Calc header/footer, page-style, resource, and file settings tests.
- Run tooling and office TypeScript and changed-path ESLint and Prettier.
- Run resources, source provenance, size and dependency checks, and patch whitespace validation.

## Verification

Pending implementation.

## Rollback Plan

Revert the implementation commit to restore the previous page-style settings and file behavior.

## Findings

The standalone resource matrix, file field preset state, and reset behavior on unset content follow LibreOffice and are recorded as CALC-789–791. The browser preserves native rich-text objects, uses the standard sheet and page fields for a new workbook, and resolves file names through the current medium. The browser Text Attributes dialog projects the common font, color and position controls, and profile-based presets use empty profile values.
