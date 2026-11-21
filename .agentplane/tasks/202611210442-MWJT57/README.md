---
id: "202611210442-MWJT57"
title: "Align Writer ODT bookmark ranges and properties"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 5
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
  updated_at: "2026-11-21T04:42:20.944Z"
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
    body: "Start: port ordinary Writer ODT bookmark ranges and attributes against the pinned source and fixtures."
events:
  -
    type: "status"
    at: "2026-11-21T04:42:33.278Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: port ordinary Writer ODT bookmark ranges and attributes against the pinned source and fixtures."
doc_version: 3
doc_updated_at: "2026-11-21T04:42:33.278Z"
doc_updated_by: "CODER"
description: "Port the pinned ordinary bookmark SAX context, pairing and same-position text-portion order, native hidden and condition properties, and transfer and history lifetime. Replay native ODF regressions."
sections:
  Summary: "Align Writer's ordinary bookmark ODT import, export, and native bookmark metadata with the pinned LibreOffice owners."
  Scope: "Shared XML bookmark parsing and range lifetime, native Writer bookmarks and UNO bookmark properties, bookmark ordering including frame boundaries, Worker transfer and bookmark history, pinned fixtures, source registry and documented source edge cases. Specialized cross-reference bookmark and reference field services, RDF metadata, unrelated ODF markers, and file workflow changes are outside the represented ordinary bookmark model."
  Plan: "Port XMLTextMarkImportContext and the real Writer bookmark properties. Preserve same-text checks, matching semantics, endpoint ordering, Worker transfer and editing history. Add pinned regressions and focused edge cases, then verify and close."
  Verify Steps: "Run the Writer ODT bookmark and frame tests, native bookmark/UNO and history tests, Worker transfer tests, and shared text SAX tests. Replay bookmark_order.fodt and both tdf101856 ODT fixtures. Check office typecheck, scoped Prettier and ESLint, dependency guard, provenance, routing, doctor and git diff."
  Verification: "Pending implementation and focused checks."
  Rollback Plan: "Revert the bookmark implementation commits. The new transfer fields are optional and require no migration."
  Findings: "Record preserved source edge cases and verified boundaries."
id_source: "generated"
---
## Summary

Align Writer's ordinary bookmark ODT import, export, and native bookmark metadata with the pinned LibreOffice owners.

## Scope

Shared XML bookmark parsing and range lifetime, native Writer bookmarks and UNO bookmark properties, bookmark ordering including frame boundaries, Worker transfer and bookmark history, pinned fixtures, source registry and documented source edge cases. Specialized cross-reference bookmark and reference field services, RDF metadata, unrelated ODF markers, and file workflow changes are outside the represented ordinary bookmark model.

## Plan

Port XMLTextMarkImportContext and the real Writer bookmark properties. Preserve same-text checks, matching semantics, endpoint ordering, Worker transfer and editing history. Add pinned regressions and focused edge cases, then verify and close.

## Verify Steps

Run the Writer ODT bookmark and frame tests, native bookmark/UNO and history tests, Worker transfer tests, and shared text SAX tests. Replay bookmark_order.fodt and both tdf101856 ODT fixtures. Check office typecheck, scoped Prettier and ESLint, dependency guard, provenance, routing, doctor and git diff.

## Verification

Pending implementation and focused checks.

## Rollback Plan

Revert the bookmark implementation commits. The new transfer fields are optional and require no migration.

## Findings

Record preserved source edge cases and verified boundaries.
