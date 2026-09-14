---
id: "202609141111-T5GFSP"
title: "Implement Workstream 0 authoritative parity inventory"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 10
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-09-14T11:11:46.651Z"
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
    body: "Start: Implement Workstream 0 provenance, atomic inventory, documentation, and verification gates against the pinned local LibreOffice baseline."
events:
  -
    type: "status"
    at: "2026-09-14T11:11:51.280Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: Implement Workstream 0 provenance, atomic inventory, documentation, and verification gates against the pinned local LibreOffice baseline."
doc_version: 3
doc_updated_at: "2026-09-14T11:11:51.280Z"
doc_updated_by: "CODER"
description: "Implement P0.1-P0.3 from docs/program/vite-office-upstream-parity-plan.md using the pinned local LibreOffice checkout as primary evidence."
sections:
  Summary: "Make Workstream 0 authoritative by strengthening source provenance, atomizing capability inventory, repairing stale documentation, and wiring inventory checks into the default verification pipeline."
  Scope: "In scope: scripts/check-source-provenance.ts and tests; scripts/check-lo-source-tree.mjs; relevant scripts/libreoffice-inventory validators and tests; package.json verification scripts; docs/program/source-provenance.json; docs/program/parity/runtime-inventory.json; docs/program/parity/writer-command-slice.json; docs/program/writer-core-model.md; docs/program/writer-paragraph-body.md; docs/program/transaction-history.md; docs/program/writer-local-storage.md. Use vendor/libreoffice-reference at the pinned baseline as upstream evidence. No Office runtime behavior changes."
  Plan: "1. Audit runtime modules, capability records, validators, pipeline, and confirmed mapping mismatches against the pinned local LibreOffice checkout. 2. Extend provenance schema and validation with exact symbols, responsibilities, divergence, evidence markers, and runtime classification consistency. 3. Atomize parity capabilities and enforce module references or infrastructure exemptions plus assertion-level verification. 4. Reclassify dishonest mappings and update evidence. 5. Repair stale docs and source-tree/default-pipeline gates. 6. Run focused and default verification, Agentplane doctor, and routing validation; record evidence."
  Verify Steps: |-
    1. npm run test:source-provenance
    2. npm run check:source-provenance
    3. npm run check:source-tree
    4. npm run inventory:parity
    5. npm test
    6. npm run check
    7. ap doctor
    8. node .agentplane/policy/check-routing.mjs
    9. git status --short --untracked-files=all
  Verification: "Pending execution after implementation. Record exact commands, results, evidence summaries, and covered scope."
  Rollback Plan: "Revert only the implementation commit for this task. The changes are metadata, validation, tests, scripts, and documentation; no data migration or external state is involved."
  Findings: "No findings yet."
id_source: "generated"
---
## Summary

Make Workstream 0 authoritative by strengthening source provenance, atomizing capability inventory, repairing stale documentation, and wiring inventory checks into the default verification pipeline.

## Scope

In scope: scripts/check-source-provenance.ts and tests; scripts/check-lo-source-tree.mjs; relevant scripts/libreoffice-inventory validators and tests; package.json verification scripts; docs/program/source-provenance.json; docs/program/parity/runtime-inventory.json; docs/program/parity/writer-command-slice.json; docs/program/writer-core-model.md; docs/program/writer-paragraph-body.md; docs/program/transaction-history.md; docs/program/writer-local-storage.md. Use vendor/libreoffice-reference at the pinned baseline as upstream evidence. No Office runtime behavior changes.

## Plan

1. Audit runtime modules, capability records, validators, pipeline, and confirmed mapping mismatches against the pinned local LibreOffice checkout. 2. Extend provenance schema and validation with exact symbols, responsibilities, divergence, evidence markers, and runtime classification consistency. 3. Atomize parity capabilities and enforce module references or infrastructure exemptions plus assertion-level verification. 4. Reclassify dishonest mappings and update evidence. 5. Repair stale docs and source-tree/default-pipeline gates. 6. Run focused and default verification, Agentplane doctor, and routing validation; record evidence.

## Verify Steps

1. npm run test:source-provenance
2. npm run check:source-provenance
3. npm run check:source-tree
4. npm run inventory:parity
5. npm test
6. npm run check
7. ap doctor
8. node .agentplane/policy/check-routing.mjs
9. git status --short --untracked-files=all

## Verification

Pending execution after implementation. Record exact commands, results, evidence summaries, and covered scope.

## Rollback Plan

Revert only the implementation commit for this task. The changes are metadata, validation, tests, scripts, and documentation; no data migration or external state is involved.

## Findings

No findings yet.
