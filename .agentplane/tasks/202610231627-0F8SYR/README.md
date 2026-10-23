---
id: "202610231627-0F8SYR"
title: "Port Writer API attachment points consumed by DomainMapper"
status: "DOING"
priority: "high"
owner: "CODER"
revision: 7
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
  - "writer"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-23T16:27:38.359Z"
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
    body: "Start: implement user-approved pinned Writer API attachment points for DomainMapper within the existing canonical model; targeted tests only."
events:
  -
    type: "status"
    at: "2026-10-23T16:27:38.789Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implement user-approved pinned Writer API attachment points for DomainMapper within the existing canonical model; targeted tests only."
doc_version: 3
doc_updated_at: "2026-10-23T16:27:38.789Z"
doc_updated_by: "CODER"
description: "User-approved port of Writer text/document/range/cursor/property/style/numbering/table API attachment points required by upstream DomainMapper within the current canonical Writer core. Preserve pinned upstream ownership, contracts, behavior and error handling. Do not implement DOCX parsing/export or expand unsupported model features. Run only affected module tests and targeted checks."
sections:
  Summary: |-
    Port Writer API attachment points consumed by DomainMapper

    User-approved port of Writer text/document/range/cursor/property/style/numbering/table API attachment points required by upstream DomainMapper within the current canonical Writer core. Preserve pinned upstream ownership, contracts, behavior and error handling. Do not implement DOCX parsing/export or expand unsupported model features. Run only affected module tests and targeted checks.
  Scope: "Writer import-facing unocore API and required existing core connections, shared exceptions/property contracts only where required; focused tests and exact provenance/runtime registry entries. Up to 40 source/test/registry files plus task documentation. No UI, Calc, DOCX parser, OOXML package engine or export changes."
  Plan: "Implement pinned upstream Writer import attachment contracts within current core: SwXTextDocument service/style suppliers; SwXTextRange and SwXTextCursor with registered SwPaM ownership; SwXText append/insert/finish paragraph and properties; supported style/numbering/table API routes. Preserve native property types, units, exceptions, range ownership and mutation ordering, with no duplicate document state. Include source provenance/runtime records and targeted regression tests. Exclude DOCX parser/export and unimplemented core features. Verify only affected Writer/shared modules plus typecheck and targeted structural/provenance checks; no complete test suites."
  Verify Steps: "Run targeted Vitest files for new unocore API, adjacent text/range/style/table/numbering core modules touched by implementation, and affected source/provenance tooling when changed. Run application TypeScript checking, ESLint/Prettier on changed authored files, source-tree and source-provenance checks. Assert upstream-derived text append/finish selection semantics, typed property conversion and errors, style inheritance, live ranges, foreign ranges, table conversion, numbering and disposal. Do not run full suites as requested by user. Record exact commands/results. Run ap task verify-show before checks and record ap verify result."
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert only the task implementation commit and task-owned registry entries; preserve all unrelated work."
  Findings: ""
id_source: "generated"
---
## Summary

Port Writer API attachment points consumed by DomainMapper

User-approved port of Writer text/document/range/cursor/property/style/numbering/table API attachment points required by upstream DomainMapper within the current canonical Writer core. Preserve pinned upstream ownership, contracts, behavior and error handling. Do not implement DOCX parsing/export or expand unsupported model features. Run only affected module tests and targeted checks.

## Scope

Writer import-facing unocore API and required existing core connections, shared exceptions/property contracts only where required; focused tests and exact provenance/runtime registry entries. Up to 40 source/test/registry files plus task documentation. No UI, Calc, DOCX parser, OOXML package engine or export changes.

## Plan

Implement pinned upstream Writer import attachment contracts within current core: SwXTextDocument service/style suppliers; SwXTextRange and SwXTextCursor with registered SwPaM ownership; SwXText append/insert/finish paragraph and properties; supported style/numbering/table API routes. Preserve native property types, units, exceptions, range ownership and mutation ordering, with no duplicate document state. Include source provenance/runtime records and targeted regression tests. Exclude DOCX parser/export and unimplemented core features. Verify only affected Writer/shared modules plus typecheck and targeted structural/provenance checks; no complete test suites.

## Verify Steps

Run targeted Vitest files for new unocore API, adjacent text/range/style/table/numbering core modules touched by implementation, and affected source/provenance tooling when changed. Run application TypeScript checking, ESLint/Prettier on changed authored files, source-tree and source-provenance checks. Assert upstream-derived text append/finish selection semantics, typed property conversion and errors, style inheritance, live ranges, foreign ranges, table conversion, numbering and disposal. Do not run full suites as requested by user. Record exact commands/results. Run ap task verify-show before checks and record ap verify result.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert only the task implementation commit and task-owned registry entries; preserve all unrelated work.

## Findings
