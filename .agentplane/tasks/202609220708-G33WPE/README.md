---
id: "202609220708-G33WPE"
title: "Expand Writer ODF contexts for P1"
status: "DOING"
priority: "high"
owner: "CODER"
revision: 5
origin:
  system: "manual"
depends_on:
  - "202609220708-E20A7K"
tags:
  - "code"
  - "odt"
  - "parity"
task_kind: "code"
mutation_scope: "code"
blueprint_request: "code.direct"
verify:
  - "npm run format:check && npm run lint && npm run typecheck && npm run check:file-size && git diff --check"
  - "npm run test:coverage && npm run test:e2e"
  - "npm run test:inventory:coverage && npm run check:dependencies && npm run check:source-tree && npm run check:source-provenance && npm run inventory:invariants && npm run inventory:parity"
plan_approval:
  state: "approved"
  updated_at: "2026-09-22T07:09:55.415Z"
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
    at: "2026-09-22T10:12:40.796Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: continue direct-mode task in current checkout."
doc_version: 3
doc_updated_at: "2026-09-22T10:12:40.796Z"
doc_updated_by: "CODER"
description: "Implement P1.16 in dependency order using pinned LibreOffice import/export contexts and fixtures for the implemented Writer model surface, adding upstream-shaped model owners before broadening each ODF feature family."
sections:
  Summary: |-
    Expand Writer ODF contexts for P1

    Implement P1.16 in dependency order using pinned LibreOffice import/export contexts and fixtures for the implemented Writer model surface, adding upstream-shaped model owners before broadening each ODF feature family.
  Scope: |-
    - In scope: Implement P1.16 in dependency order using pinned LibreOffice import/export contexts and fixtures for the implemented Writer model surface, adding upstream-shaped model owners before broadening each ODF feature family.
    - Out of scope: unrelated refactors not required for "Expand Writer ODF contexts for P1".
  Plan: |-
    1. Audit the implemented Writer graph against pinned xmloff/sw import-export contexts and fixtures, then define dependency-ordered bounded additions.
    2. Extend paragraph/character properties, styles/automatic styles, lists/outline, sections, tables, fields, frames/images, annotations/redlines, metadata/settings, and supported embedded objects only after their upstream-shaped model owner exists.
    3. Reuse canonical graph serialization and keep Worker/browser envelopes outside filter/model contracts.
    4. Add pinned LibreOffice fixtures and differential import-export-import assertions for each supported addition.
    5. Update affected inventory/provenance/docs and record unsupported platform or feature boundaries explicitly.
  Verify Steps: |-
    1. Run focused ODF parser/context/filter and fixture round-trip tests. Expected: every added model item preserves supported LibreOffice semantics through import-export-import.
    2. Run npm run test:coverage && npm run test:e2e && npm run test:inventory:coverage. Expected: application, browser, and inventory suites pass.
    3. Run npm run check:dependencies && npm run check:source-tree && npm run check:source-provenance && npm run inventory:invariants && npm run inventory:parity. Expected: upstream owners, invariants, and evidence resolve.
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

Expand Writer ODF contexts for P1

Implement P1.16 in dependency order using pinned LibreOffice import/export contexts and fixtures for the implemented Writer model surface, adding upstream-shaped model owners before broadening each ODF feature family.

## Scope

- In scope: Implement P1.16 in dependency order using pinned LibreOffice import/export contexts and fixtures for the implemented Writer model surface, adding upstream-shaped model owners before broadening each ODF feature family.
- Out of scope: unrelated refactors not required for "Expand Writer ODF contexts for P1".

## Plan

1. Audit the implemented Writer graph against pinned xmloff/sw import-export contexts and fixtures, then define dependency-ordered bounded additions.
2. Extend paragraph/character properties, styles/automatic styles, lists/outline, sections, tables, fields, frames/images, annotations/redlines, metadata/settings, and supported embedded objects only after their upstream-shaped model owner exists.
3. Reuse canonical graph serialization and keep Worker/browser envelopes outside filter/model contracts.
4. Add pinned LibreOffice fixtures and differential import-export-import assertions for each supported addition.
5. Update affected inventory/provenance/docs and record unsupported platform or feature boundaries explicitly.

## Verify Steps

1. Run focused ODF parser/context/filter and fixture round-trip tests. Expected: every added model item preserves supported LibreOffice semantics through import-export-import.
2. Run npm run test:coverage && npm run test:e2e && npm run test:inventory:coverage. Expected: application, browser, and inventory suites pass.
3. Run npm run check:dependencies && npm run check:source-tree && npm run check:source-provenance && npm run inventory:invariants && npm run inventory:parity. Expected: upstream owners, invariants, and evidence resolve.
4. Run npm run format:check && npm run lint && npm run typecheck && npm run check:file-size && git diff --check. Expected: static and hygiene checks pass.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert task-related commit(s).
- Re-run required checks to confirm rollback safety.

## Findings
