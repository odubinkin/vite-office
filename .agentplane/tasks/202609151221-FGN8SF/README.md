---
id: "202609151221-FGN8SF"
title: "Implement Phase 2 Writer document graph parity"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 11
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-09-15T13:14:41.578Z"
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
    body: "Start: implement approved Phase 2 Writer document graph parity with upstream-derived ownership, positions, listeners, codecs, projections, tests, and parity evidence."
events:
  -
    type: "status"
    at: "2026-09-15T12:22:05.005Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implement approved Phase 2 Writer document graph parity with upstream-derived ownership, positions, listeners, codecs, projections, tests, and parity evidence."
doc_version: 3
doc_updated_at: "2026-09-15T13:14:41.124Z"
doc_updated_by: "CODER"
description: "Implement Phase 2 from docs/program/vite-office-upstream-parity-plan.md against pinned LibreOffice upstream: document managers, canonical positions and SwPaM, Writer listener semantics, persistence codecs, presentation projection, and removal of snapshot-shaped core."
sections:
  Summary: "Restore the Writer document graph for the implemented 35-capability slice, following LibreOffice 26.8.0.2 ownership, node/position, listener, and serialization boundaries."
  Scope: "Implement Phase 2 (P2.1-P2.4) from docs/program/vite-office-upstream-parity-plan.md. Touch Writer core, shell adapters, browser persistence/projection, filters, tests, and parity evidence only where required by the dependency graph. No backward compatibility for the prior persisted model."
  Plan: "1. Compare current Writer graph with the pinned upstream source units and inventory all Phase 2 leaks. 2. Split SwDoc responsibilities into bounded managers and route modification through document state/shell ownership. 3. make SwNodes/SwNodeIndex/SwPosition/SwPaM the canonical identity and range model; remove persistent paragraph IDs. 4. Implement bounded SwClient/SwModify registration, reparenting, object-death, and propagation semantics without SwDoc inheritance. 5. Move document/node/hint/style/numbering codecs to browser/filter adapters, replace WriterViewSnapshot with a primitive versioned projection, and delete writer.ts. 6. Update callers, fixtures, parity records, and verify the full supported slice."
  Verify Steps: |-
    - npm run verify
    - node .agentplane/policy/check-routing.mjs
    - ap doctor
    - git diff --check
    - git status --short --untracked-files=all
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert the implementation commit and deterministic task-close commit. The persisted schema intentionally has no old-model compatibility path; rollback restores the previous code and schema together."
  Findings: "No findings yet."
id_source: "generated"
---
## Summary

Restore the Writer document graph for the implemented 35-capability slice, following LibreOffice 26.8.0.2 ownership, node/position, listener, and serialization boundaries.

## Scope

Implement Phase 2 (P2.1-P2.4) from docs/program/vite-office-upstream-parity-plan.md. Touch Writer core, shell adapters, browser persistence/projection, filters, tests, and parity evidence only where required by the dependency graph. No backward compatibility for the prior persisted model.

## Plan

1. Compare current Writer graph with the pinned upstream source units and inventory all Phase 2 leaks. 2. Split SwDoc responsibilities into bounded managers and route modification through document state/shell ownership. 3. make SwNodes/SwNodeIndex/SwPosition/SwPaM the canonical identity and range model; remove persistent paragraph IDs. 4. Implement bounded SwClient/SwModify registration, reparenting, object-death, and propagation semantics without SwDoc inheritance. 5. Move document/node/hint/style/numbering codecs to browser/filter adapters, replace WriterViewSnapshot with a primitive versioned projection, and delete writer.ts. 6. Update callers, fixtures, parity records, and verify the full supported slice.

## Verify Steps

- npm run verify
- node .agentplane/policy/check-routing.mjs
- ap doctor
- git diff --check
- git status --short --untracked-files=all

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert the implementation commit and deterministic task-close commit. The persisted schema intentionally has no old-model compatibility path; rollback restores the previous code and schema together.

## Findings

No findings yet.
