---
id: "202610231745-0YVMQG"
title: "Route Writer ODT import through upstream text APIs"
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
  updated_at: "2026-10-23T17:46:09.531Z"
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
    body: "Start: migrate ordinary ODT content and style import to pinned common Writer APIs, preserving native table responsibilities and targeted regression coverage."
events:
  -
    type: "status"
    at: "2026-10-23T17:46:15.331Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: migrate ordinary ODT content and style import to pinned common Writer APIs, preserving native table responsibilities and targeted regression coverage."
doc_version: 3
doc_updated_at: "2026-10-23T17:46:15.331Z"
doc_updated_by: "CODER"
description: "Replace SwXMLParagraphTarget and direct ordinary ODT text/style/property mutations with pinned upstream XMLTextImportHelper and common Writer API. Preserve native specialized SwXMLTableImport/core responsibilities and all currently represented ODT features. Work only in vite-office; no DOCX or Calc implementation; targeted module tests only."
sections:
  Summary: |-
    Route Writer ODT import through upstream text APIs

    Replace SwXMLParagraphTarget and direct ordinary ODT text/style/property mutations with pinned upstream XMLTextImportHelper and common Writer API. Preserve native specialized SwXMLTableImport/core responsibilities and all currently represented ODT features. Work only in vite-office; no DOCX or Calc implementation; targeted module tests only.
  Scope: "ODT Writer text/style/list/bookmark/paragraph import, shared xmloff text contexts/helper/property application, necessary Writer API/core connections, cell cursor switching in native table import, corresponding focused tests and per-module provenance/runtime records. Preserve all current ODT model state and specialized native direct-core responsibilities. No UI, Calc, DOCX, network, unrelated tests or broad parity promotion."
  Plan: "Use pinned native XMLTextImportHelper/SwXMLImport/SwXMLTableImport as the responsibility map. Remove SwXMLParagraphTarget and its bespoke per-paragraph mutation interface. Make shared text contexts operate through XMLTextImportHelper holding live Writer API text/cursors; use native insertString/control-character/property/service/style routes for represented text, paragraphs, lists, bookmarks, soft page breaks and styles. Extend missing Writer API property/control/content contracts only as required by existing ODT slice. Retain native Writer-specific table structural operations and switch shared cursor into/out of cells. Preserve current ODT feature coverage and canonical data ownership; update exact provenance records. Verify targeted xmloff/Writer API and ODT round-trip files plus type/lint/format/dependency/source checks."
  Verify Steps: "Run ap task verify-show before checks. Run focused Vitest modules for xmloff text dispatch/paragraph/list contexts, Writer import API, ODT import/round-trip text, styles, numbering, hyperlinks/bookmarks/soft breaks, paragraphs/pages and tables touched by this migration; add integration evidence that ordinary ODT text/property calls use actual Writer APIs and no SwXMLParagraphTarget path remains. Preserve direct versus inherited attributes and table/body ordering. Run application typecheck; lint/Prettier on changed files; dependency, JSDoc, file-size, source-tree/provenance and Writer/shared registry validation. Do not run full suites. Record exact passing commands/results and residual limits; record ap verify and commit/close task."
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert only this task implementation commit and task-specific registry/documentation changes. Preserve the preceding common Writer API port and all unrelated tasks."
  Findings: ""
id_source: "generated"
---
## Summary

Route Writer ODT import through upstream text APIs

Replace SwXMLParagraphTarget and direct ordinary ODT text/style/property mutations with pinned upstream XMLTextImportHelper and common Writer API. Preserve native specialized SwXMLTableImport/core responsibilities and all currently represented ODT features. Work only in vite-office; no DOCX or Calc implementation; targeted module tests only.

## Scope

ODT Writer text/style/list/bookmark/paragraph import, shared xmloff text contexts/helper/property application, necessary Writer API/core connections, cell cursor switching in native table import, corresponding focused tests and per-module provenance/runtime records. Preserve all current ODT model state and specialized native direct-core responsibilities. No UI, Calc, DOCX, network, unrelated tests or broad parity promotion.

## Plan

Use pinned native XMLTextImportHelper/SwXMLImport/SwXMLTableImport as the responsibility map. Remove SwXMLParagraphTarget and its bespoke per-paragraph mutation interface. Make shared text contexts operate through XMLTextImportHelper holding live Writer API text/cursors; use native insertString/control-character/property/service/style routes for represented text, paragraphs, lists, bookmarks, soft page breaks and styles. Extend missing Writer API property/control/content contracts only as required by existing ODT slice. Retain native Writer-specific table structural operations and switch shared cursor into/out of cells. Preserve current ODT feature coverage and canonical data ownership; update exact provenance records. Verify targeted xmloff/Writer API and ODT round-trip files plus type/lint/format/dependency/source checks.

## Verify Steps

Run ap task verify-show before checks. Run focused Vitest modules for xmloff text dispatch/paragraph/list contexts, Writer import API, ODT import/round-trip text, styles, numbering, hyperlinks/bookmarks/soft breaks, paragraphs/pages and tables touched by this migration; add integration evidence that ordinary ODT text/property calls use actual Writer APIs and no SwXMLParagraphTarget path remains. Preserve direct versus inherited attributes and table/body ordering. Run application typecheck; lint/Prettier on changed files; dependency, JSDoc, file-size, source-tree/provenance and Writer/shared registry validation. Do not run full suites. Record exact passing commands/results and residual limits; record ap verify and commit/close task.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert only this task implementation commit and task-specific registry/documentation changes. Preserve the preceding common Writer API port and all unrelated tasks.

## Findings
