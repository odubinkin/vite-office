---
id: "202610090615-BYAEGD"
title: "Isolate application inventory records with UUID capability identities"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 9
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-09T06:16:19.245Z"
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
    body: "Start: Implement user-approved UUID capability identities and canonical per-record application inventory, preserve legacy evidence and validate complete scoped and aggregate ownership."
events:
  -
    type: "status"
    at: "2026-10-09T06:16:26.490Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: Implement user-approved UUID capability identities and canonical per-record application inventory, preserve legacy evidence and validate complete scoped and aggregate ownership."
doc_version: 3
doc_updated_at: "2026-10-09T06:16:26.490Z"
doc_updated_by: "CODER"
description: "Implement user-approved UUID capability allocation and per-record Writer Calc shared inventory storage. Preserve existing CAP and LO identities, baseline, semantic statuses and evidence. Aggregate and validate disjoint canonical records with scoped parity commands and backward-compatible generated views."
sections:
  Summary: |-
    Isolate application inventory records with UUID capability identities

    Implement user-approved UUID capability allocation and per-record Writer Calc shared inventory storage. Preserve existing CAP and LO identities, baseline, semantic statuses and evidence. Aggregate and validate disjoint canonical records with scoped parity commands and backward-compatible generated views.
  Scope: "New registry storage, UUID identity, validation and CLI modules with tests in scripts/libreoffice-inventory; parity mapping/support/runtime validators and compatibility readers; scripts/check-source-provenance.ts; package scripts and gitignore; docs/program/registry per-record data and metadata; replace four authored aggregate JSON files with generated compatibility views; README and affected program documentation. Preserve record fields, IDs, source contracts, semantic statuses and evidence. Existing application runtime and pinned upstream inventories are outside scope."
  Plan: "Migrate authored capability, runtime, provenance and invariant entries to deterministic per-record files under docs/program/registry/{writer,calc,shared}; preserve every existing record field and identity. Add UUID v4 allocation, dual-format validation, independent ID uniqueness and operation-contract collision checks. Add registry storage/validation/CLI modules and regression tests; widen runtime ownership and scope command identities; adapt parity/provenance consumers, root scripts and generated compatibility views with gitignore and usage documentation. Verify byte-equivalent migration, simultaneous Writer/Calc/shared additions, strict duplicate/orphan/baseline/ownership rejection, inventory 100 percent coverage and applicable static/parity/source checks. No application runtime, baseline or upstream corpus changes. User approved this design in the current chat."
  Verify Steps: "Run registry regression tests for preserved legacy and UUID identities, deterministic ordering, concurrent independent additions, global duplicate IDs/aliases/paths/operation keys, shared references and scoped command URLs, baseline consistency and complete runtime/provenance coverage. Compare migrated projections with original aggregate JSON byte-for-byte. Run npm run test:inventory:coverage (100 percent all metrics), npm run test:source-provenance, npm run inventory:registry:check, scoped parity commands for writer/calc/shared and full parity, invariants and source-provenance checks. Run format:check, lint, typecheck, check:docs, check:dependencies, check:file-size, check:source-tree, check:writer-resources and test:static. Run ap doctor, policy routing, git diff --check and final clean status. No browser or application unit rerun is required because no runtime application code changes."
  Verification: "Pending implementation and validation of the approved registry migration."
  Rollback Plan: "Revert the implementation commit to restore aggregate authored manifests, numeric-only capability validation and prior commands."
  Findings: "The current runtime schema only admits Writer/shared, command validation is Writer-specific, CAP and LO ordering is coupled, and shared authored aggregate files would conflict during parallel additions. Source ownership of a few historically Writer-classified shared modules will be represented by storage location without changing their existing semantic record fields. Raw pinned upstream inventories stay shared and unchanged."
id_source: "generated"
---
## Summary

Isolate application inventory records with UUID capability identities

Implement user-approved UUID capability allocation and per-record Writer Calc shared inventory storage. Preserve existing CAP and LO identities, baseline, semantic statuses and evidence. Aggregate and validate disjoint canonical records with scoped parity commands and backward-compatible generated views.

## Scope

New registry storage, UUID identity, validation and CLI modules with tests in scripts/libreoffice-inventory; parity mapping/support/runtime validators and compatibility readers; scripts/check-source-provenance.ts; package scripts and gitignore; docs/program/registry per-record data and metadata; replace four authored aggregate JSON files with generated compatibility views; README and affected program documentation. Preserve record fields, IDs, source contracts, semantic statuses and evidence. Existing application runtime and pinned upstream inventories are outside scope.

## Plan

Migrate authored capability, runtime, provenance and invariant entries to deterministic per-record files under docs/program/registry/{writer,calc,shared}; preserve every existing record field and identity. Add UUID v4 allocation, dual-format validation, independent ID uniqueness and operation-contract collision checks. Add registry storage/validation/CLI modules and regression tests; widen runtime ownership and scope command identities; adapt parity/provenance consumers, root scripts and generated compatibility views with gitignore and usage documentation. Verify byte-equivalent migration, simultaneous Writer/Calc/shared additions, strict duplicate/orphan/baseline/ownership rejection, inventory 100 percent coverage and applicable static/parity/source checks. No application runtime, baseline or upstream corpus changes. User approved this design in the current chat.

## Verify Steps

Run registry regression tests for preserved legacy and UUID identities, deterministic ordering, concurrent independent additions, global duplicate IDs/aliases/paths/operation keys, shared references and scoped command URLs, baseline consistency and complete runtime/provenance coverage. Compare migrated projections with original aggregate JSON byte-for-byte. Run npm run test:inventory:coverage (100 percent all metrics), npm run test:source-provenance, npm run inventory:registry:check, scoped parity commands for writer/calc/shared and full parity, invariants and source-provenance checks. Run format:check, lint, typecheck, check:docs, check:dependencies, check:file-size, check:source-tree, check:writer-resources and test:static. Run ap doctor, policy routing, git diff --check and final clean status. No browser or application unit rerun is required because no runtime application code changes.

## Verification

Pending implementation and validation of the approved registry migration.

## Rollback Plan

Revert the implementation commit to restore aggregate authored manifests, numeric-only capability validation and prior commands.

## Findings

The current runtime schema only admits Writer/shared, command validation is Writer-specific, CAP and LO ordering is coupled, and shared authored aggregate files would conflict during parallel additions. Source ownership of a few historically Writer-classified shared modules will be represented by storage location without changing their existing semantic record fields. Raw pinned upstream inventories stay shared and unchanged.
