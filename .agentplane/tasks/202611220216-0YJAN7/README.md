---
id: "202611220216-0YJAN7"
title: "Preserve native Writer point annotations in ODT"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 4
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
  - "odt"
  - "writer"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-11-22T02:17:29.964Z"
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
    body: "Start: connect existing native point annotation fields to shared XML metadata and document Worker transport with the represented EditEngine text values."
events:
  -
    type: "status"
    at: "2026-11-22T02:17:38.574Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: connect existing native point annotation fields to shared XML metadata and document Worker transport with the represented EditEngine text values."
doc_version: 3
doc_updated_at: "2026-11-22T02:17:38.574Z"
doc_updated_by: "CODER"
description: "Connect Writer SwPostItField point hints to ODT annotation import/export and Worker snapshots with native annotation metadata and represented EditEngine formatting."
sections:
  Summary: "Preserve the existing native Writer point annotation fields in ODT and the Writer Worker graph."
  Scope: |-
    - Import and export annotation metadata, represented text paragraphs and character formatting through the actual SwPostItField, SwFormatField, SwTextField and EditEngine object.
    - Keep native dummy-character positioning and hint ownership through the Writer body and Worker transfer. Preserve writer comment status, thread names, plain fallback, and rich editor snapshots.
    - This task covers the existing point hint model. The separately owned cross-range annotation marks, additional text field families and UI remain outside the task.
  Plan: |-
    1. Inspect the pinned annotation import/export contexts and local point attribute, edit object and Worker owners.
    2. Connect the native field lifecycle to ODT import and export and the existing Worker graph with source metadata and formatting conversions.
    3. Port applicable source fixture assertions for metadata and native formatting and verify exact point positioning, ODT save/reopen and Worker restoration.
  Verify Steps: |-
    - Run related Writer point hint, search annotation, ODT styles, Worker and native fixture tests.
    - Run relevant shared EditEngine text object and xmloff tests for represented annotation paragraph formatting and date-time behavior.
    - Run scoped ESLint and Prettier, Office typecheck, module boundaries, source provenance, Writer registry invariants, routing, AgentPlane doctor and git diff checks.
    - Record deterministic verification and refresh the graph when closing. This is the eighth task in the next ten-task regression cadence.
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert the implementation and provenance commits and rerun Writer point-hint and ODT Worker verification."
  Findings: ""
id_source: "generated"
---
## Summary

Preserve the existing native Writer point annotation fields in ODT and the Writer Worker graph.

## Scope

- Import and export annotation metadata, represented text paragraphs and character formatting through the actual SwPostItField, SwFormatField, SwTextField and EditEngine object.
- Keep native dummy-character positioning and hint ownership through the Writer body and Worker transfer. Preserve writer comment status, thread names, plain fallback, and rich editor snapshots.
- This task covers the existing point hint model. The separately owned cross-range annotation marks, additional text field families and UI remain outside the task.

## Plan

1. Inspect the pinned annotation import/export contexts and local point attribute, edit object and Worker owners.
2. Connect the native field lifecycle to ODT import and export and the existing Worker graph with source metadata and formatting conversions.
3. Port applicable source fixture assertions for metadata and native formatting and verify exact point positioning, ODT save/reopen and Worker restoration.

## Verify Steps

- Run related Writer point hint, search annotation, ODT styles, Worker and native fixture tests.
- Run relevant shared EditEngine text object and xmloff tests for represented annotation paragraph formatting and date-time behavior.
- Run scoped ESLint and Prettier, Office typecheck, module boundaries, source provenance, Writer registry invariants, routing, AgentPlane doctor and git diff checks.
- Record deterministic verification and refresh the graph when closing. This is the eighth task in the next ten-task regression cadence.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert the implementation and provenance commits and rerun Writer point-hint and ODT Worker verification.

## Findings
