---
id: "202608100853-D91P3V"
title: "Inventory pinned LibreOffice core build modules into atomic records"
status: "DOING"
priority: "high"
owner: "CODER"
revision: 7
origin:
  system: "manual"
depends_on:
  - "202608100830-MT7ETT"
tags:
  - "core"
  - "inventory"
  - "libreoffice"
task_kind: "code"
mutation_scope: "code"
blueprint_request: "code.direct"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-08-10T08:53:54.837Z"
  updated_by: "USER"
  note: "Standing user authorization: future in-scope roadmap task plans are pre-approved."
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
    body: "Start: inventory every pinned core Module_*.mk declaration into deterministic unmapped records with complete provenance and coverage."
events:
  -
    type: "status"
    at: "2026-08-10T08:53:55.144Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: inventory every pinned core Module_*.mk declaration into deterministic unmapped records with complete provenance and coverage."
doc_version: 3
doc_updated_at: "2026-08-10T08:53:55.144Z"
doc_updated_by: "CODER"
description: "Extend the deterministic inventory tool with a fully documented and covered extractor for every pinned core Module_*.mk declaration, generate a canonical tracked module inventory with corpus/commit provenance, and expose unmapped module records for later source, test, and documentation mapping."
sections:
  Summary: |-
    Inventory pinned LibreOffice core build modules into atomic records

    Extend the deterministic inventory tool with a fully documented and covered extractor for every pinned core Module_*.mk declaration, generate a canonical tracked module inventory with corpus/commit provenance, and expose unmapped module records for later source, test, and documentation mapping.
  Scope: |-
    In scope:
    - Extend scripts/libreoffice-inventory with a read-only extractor for every pinned core file named Module_*.mk.
    - Generate one canonical tracked JSON record per declaration with core corpus, pinned commit, exact reference-relative path, normalized module name, and unmapped mapping status.
    - Add 100% covered tests, command wiring, schema documentation, and roadmap/matrix handoff.

    Out of scope:
    - Parsing full make syntax, copying source content, mapping a module to a user capability, or changing any parity-matrix row to mapped/implemented/verified.
    - Extracting upstream tests, help, translations, dictionaries, or application features; each has a separate bounded task.
  Plan: |-
    1. Inspect the pinned Module_*.mk declaration set and define a small canonical module-record schema.
    2. Implement read-only discovery, validation against the baseline core identity, deterministic JSON serialization, and fully covered unit tests.
    3. Generate and review the exact tracked core module inventory; document its provenance and unmapped handoff.
    4. Run focused and full quality gates, persist evidence, perform evaluator review, and close the task.
  Verify Steps: |-
    1. npm run typecheck:tools && npm run lint && npm run check:docs && npm run check:file-size — strict tooling, complete JSDoc, linting, and size policy pass.
    2. npm run test:inventory:coverage — all executable inventory code, including module discovery, has 100% statement, branch, function, and line coverage.
    3. npm run --silent inventory:modules -- --baseline docs/program/libreoffice-baseline.json --reference-root vendor/libreoffice-reference --output docs/program/inventory/core-modules.json — regenerates canonical valid JSON whose 237 records exactly match the pinned core Module_*.mk file set.
    4. Run step 3 twice and byte-compare output; validate lexicographic paths, unique IDs, core corpus/commit provenance, and mappingStatus=unmapped on every record.
    5. npm run verify — full existing project quality suite remains green.
    6. Resolve changed local Markdown links; require git diff --check and no tracked vendor/libreoffice-reference path; inspect the generated records and docs for no source/test/docs/coverage parity claim.
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert only this task’s extractor, tests, generated module inventory, command wiring, and inventory documentation. Never modify or delete the ignored LibreOffice checkout. Re-run the baseline validator and project verification after rollback."
  Findings: ""
id_source: "generated"
---
## Summary

Inventory pinned LibreOffice core build modules into atomic records

Extend the deterministic inventory tool with a fully documented and covered extractor for every pinned core Module_*.mk declaration, generate a canonical tracked module inventory with corpus/commit provenance, and expose unmapped module records for later source, test, and documentation mapping.

## Scope

In scope:
- Extend scripts/libreoffice-inventory with a read-only extractor for every pinned core file named Module_*.mk.
- Generate one canonical tracked JSON record per declaration with core corpus, pinned commit, exact reference-relative path, normalized module name, and unmapped mapping status.
- Add 100% covered tests, command wiring, schema documentation, and roadmap/matrix handoff.

Out of scope:
- Parsing full make syntax, copying source content, mapping a module to a user capability, or changing any parity-matrix row to mapped/implemented/verified.
- Extracting upstream tests, help, translations, dictionaries, or application features; each has a separate bounded task.

## Plan

1. Inspect the pinned Module_*.mk declaration set and define a small canonical module-record schema.
2. Implement read-only discovery, validation against the baseline core identity, deterministic JSON serialization, and fully covered unit tests.
3. Generate and review the exact tracked core module inventory; document its provenance and unmapped handoff.
4. Run focused and full quality gates, persist evidence, perform evaluator review, and close the task.

## Verify Steps

1. npm run typecheck:tools && npm run lint && npm run check:docs && npm run check:file-size — strict tooling, complete JSDoc, linting, and size policy pass.
2. npm run test:inventory:coverage — all executable inventory code, including module discovery, has 100% statement, branch, function, and line coverage.
3. npm run --silent inventory:modules -- --baseline docs/program/libreoffice-baseline.json --reference-root vendor/libreoffice-reference --output docs/program/inventory/core-modules.json — regenerates canonical valid JSON whose 237 records exactly match the pinned core Module_*.mk file set.
4. Run step 3 twice and byte-compare output; validate lexicographic paths, unique IDs, core corpus/commit provenance, and mappingStatus=unmapped on every record.
5. npm run verify — full existing project quality suite remains green.
6. Resolve changed local Markdown links; require git diff --check and no tracked vendor/libreoffice-reference path; inspect the generated records and docs for no source/test/docs/coverage parity claim.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert only this task’s extractor, tests, generated module inventory, command wiring, and inventory documentation. Never modify or delete the ignored LibreOffice checkout. Re-run the baseline validator and project verification after rollback.

## Findings
