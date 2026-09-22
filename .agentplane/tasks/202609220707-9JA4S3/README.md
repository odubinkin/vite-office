---
id: "202609220707-9JA4S3"
title: "Canonicalize Writer core models and graph serialization"
status: "DOING"
priority: "high"
owner: "CODER"
revision: 5
origin:
  system: "manual"
depends_on:
  - "202609220707-76AZJP"
tags:
  - "code"
  - "parity"
  - "writer"
task_kind: "code"
mutation_scope: "code"
blueprint_request: "code.direct"
verify:
  - "npm run format:check && npm run lint && npm run typecheck && npm run check:file-size && git diff --check"
  - "npm run test:coverage"
  - "npm run test:inventory:coverage && npm run check:dependencies && npm run check:source-provenance && npm run inventory:parity"
plan_approval:
  state: "approved"
  updated_at: "2026-09-22T07:09:54.070Z"
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
    body: "Start: continue direct-mode task in current checkout."
events:
  -
    type: "status"
    at: "2026-09-22T07:47:29.282Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: continue direct-mode task in current checkout."
doc_version: 3
doc_updated_at: "2026-09-22T07:47:29.282Z"
doc_updated_by: "CODER"
description: "Implement P1.4-P1.7: make pooled items, Writer attributes, numbering/list objects and SwPaM the model mutation vocabulary; remove core compatibility DTOs and unify graph serialization without legacy-schema compatibility."
sections:
  Summary: |-
    Canonicalize Writer core models and graph serialization

    Implement P1.4-P1.7: make pooled items, Writer attributes, numbering/list objects and SwPaM the model mutation vocabulary; remove core compatibility DTOs and unify graph serialization without legacy-schema compatibility.
  Scope: |-
    - In scope: Implement P1.4-P1.7: make pooled items, Writer attributes, numbering/list objects and SwPaM the model mutation vocabulary; remove core compatibility DTOs and unify graph serialization without legacy-schema compatibility.
    - Out of scope: unrelated refactors not required for "Canonicalize Writer core models and graph serialization".
  Plan: |-
    1. Inventory core/shell consumers of WriterCharacterAttributes, WriterParagraphList, SwTextNode compatibility getters, OfficeDocument, and overlapping graph records.
    2. Convert mutation and undo contracts to SfxItemSet/pool items, SwTextAttr, SwNumRule/SwList, SwPaM, and upstream-shaped node methods.
    3. Move render/clipboard DTO projection to named browser boundaries and remove core compatibility accessors after all consumers migrate.
    4. Establish one canonical versioned graph record with thin Worker and IndexedDB envelopes; bump schema and reject every earlier stored schema without migration.
    5. Update affected inventory/provenance/docs and verify WhichIds, inheritance, list identity, cursors, undo, transfer, cache restore, and ODT paths.
  Verify Steps: |-
    1. Run focused core, undo, clipboard, storage, Worker, and ODT round-trip tests. Expected: all mutation paths use canonical Writer/Sfx objects and preserve identifiers, items, list ownership, and cursor state.
    2. Run npm run test:coverage && npm run test:inventory:coverage. Expected: suites and coverage pass.
    3. Run npm run check:dependencies && npm run check:source-provenance && npm run inventory:parity. Expected: no browser/storage DTO crosses into core mutation APIs and affected evidence is current.
    4. Run npm run format:check && npm run lint && npm run typecheck && npm run check:file-size && git diff --check. Expected: static and hygiene checks pass.
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: |-
    - Revert task-related commit(s).
    - Re-run required checks to confirm rollback safety.
  Findings: ""
id_source: "generated"
---
## Summary

Canonicalize Writer core models and graph serialization

Implement P1.4-P1.7: make pooled items, Writer attributes, numbering/list objects and SwPaM the model mutation vocabulary; remove core compatibility DTOs and unify graph serialization without legacy-schema compatibility.

## Scope

- In scope: Implement P1.4-P1.7: make pooled items, Writer attributes, numbering/list objects and SwPaM the model mutation vocabulary; remove core compatibility DTOs and unify graph serialization without legacy-schema compatibility.
- Out of scope: unrelated refactors not required for "Canonicalize Writer core models and graph serialization".

## Plan

1. Inventory core/shell consumers of WriterCharacterAttributes, WriterParagraphList, SwTextNode compatibility getters, OfficeDocument, and overlapping graph records.
2. Convert mutation and undo contracts to SfxItemSet/pool items, SwTextAttr, SwNumRule/SwList, SwPaM, and upstream-shaped node methods.
3. Move render/clipboard DTO projection to named browser boundaries and remove core compatibility accessors after all consumers migrate.
4. Establish one canonical versioned graph record with thin Worker and IndexedDB envelopes; bump schema and reject every earlier stored schema without migration.
5. Update affected inventory/provenance/docs and verify WhichIds, inheritance, list identity, cursors, undo, transfer, cache restore, and ODT paths.

## Verify Steps

1. Run focused core, undo, clipboard, storage, Worker, and ODT round-trip tests. Expected: all mutation paths use canonical Writer/Sfx objects and preserve identifiers, items, list ownership, and cursor state.
2. Run npm run test:coverage && npm run test:inventory:coverage. Expected: suites and coverage pass.
3. Run npm run check:dependencies && npm run check:source-provenance && npm run inventory:parity. Expected: no browser/storage DTO crosses into core mutation APIs and affected evidence is current.
4. Run npm run format:check && npm run lint && npm run typecheck && npm run check:file-size && git diff --check. Expected: static and hygiene checks pass.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert task-related commit(s).
- Re-run required checks to confirm rollback safety.

## Findings
