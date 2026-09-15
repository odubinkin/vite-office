---
id: "202609151029-JH7J69"
title: "Implement LibreOffice parity Phase 1"
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
  updated_at: "2026-09-15T10:29:38.222Z"
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
    body: "Start: implement approved LibreOffice parity Phase 1 contracts and resources in the current direct-mode checkout."
events:
  -
    type: "status"
    at: "2026-09-15T10:29:43.721Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implement approved LibreOffice parity Phase 1 contracts and resources in the current direct-mode checkout."
doc_version: 3
doc_updated_at: "2026-09-15T10:29:43.721Z"
doc_updated_by: "CODER"
description: "Restore item contracts, Sfx slot/dispatch/bindings pipeline, pinned .uno command identities, and generated Writer UI resources per docs/program/vite-office-upstream-parity-plan.md Phase 1."
sections:
  Summary: "Implement Phase 1 of the upstream parity plan against pinned LibreOffice 26.8.0.2: exact item contracts, bounded Sfx slot/dispatch/bindings, canonical command identities, and deterministic Writer UI resource generation."
  Scope: "In scope: apps/office/src/{svl,editeng,framework,sw} item, dispatch, shell, uiconfig, accelerator, browser presentation and persistence modules required by Phase 1; Phase 1 tests; deterministic generator inputs/outputs under scripts and apps/office; parity capability/provenance records affected by the implemented contracts. Upstream authority: vendor/libreoffice-reference at commit 9bc445578031fecf56086729d8e4940c77e14d65. Out of scope: Phase 2+ document graph, list tree, lifecycle, editor projection, and general ODF redesign."
  Plan: "Implement the approved Phase 1 as one atomic CODER-owned contract migration, using pinned upstream files as authority, preserving upstream path responsibility where browser/TypeScript constraints allow, rejecting incompatible stored models, and validating the full supported Writer slice."
  Verify Steps: |-
    1. npm run test:coverage --workspace @vite-office/office
    2. npm run test:inventory:coverage
    3. npm run typecheck
    4. npm run lint
    5. npm run check:dependencies
    6. npm run check:source-tree
    7. npm run check:source-provenance
    8. npm run inventory:invariants
    9. npm run inventory:parity
    10. npm run test:e2e
    11. npm run test:static
    12. node .agentplane/policy/check-routing.mjs
    13. ap doctor
  Verification: "Pending implementation. Record exact commands, pass/fail results, concise evidence, and covered scope before finish."
  Rollback Plan: "Revert the task implementation and deterministic close commits. No old persistence compatibility will be retained; rollback restores the pre-Phase-1 schema and command contracts as a unit."
  Findings: "No material drift identified during planning."
id_source: "generated"
---
## Summary

Implement Phase 1 of the upstream parity plan against pinned LibreOffice 26.8.0.2: exact item contracts, bounded Sfx slot/dispatch/bindings, canonical command identities, and deterministic Writer UI resource generation.

## Scope

In scope: apps/office/src/{svl,editeng,framework,sw} item, dispatch, shell, uiconfig, accelerator, browser presentation and persistence modules required by Phase 1; Phase 1 tests; deterministic generator inputs/outputs under scripts and apps/office; parity capability/provenance records affected by the implemented contracts. Upstream authority: vendor/libreoffice-reference at commit 9bc445578031fecf56086729d8e4940c77e14d65. Out of scope: Phase 2+ document graph, list tree, lifecycle, editor projection, and general ODF redesign.

## Plan

Implement the approved Phase 1 as one atomic CODER-owned contract migration, using pinned upstream files as authority, preserving upstream path responsibility where browser/TypeScript constraints allow, rejecting incompatible stored models, and validating the full supported Writer slice.

## Verify Steps

1. npm run test:coverage --workspace @vite-office/office
2. npm run test:inventory:coverage
3. npm run typecheck
4. npm run lint
5. npm run check:dependencies
6. npm run check:source-tree
7. npm run check:source-provenance
8. npm run inventory:invariants
9. npm run inventory:parity
10. npm run test:e2e
11. npm run test:static
12. node .agentplane/policy/check-routing.mjs
13. ap doctor

## Verification

Pending implementation. Record exact commands, pass/fail results, concise evidence, and covered scope before finish.

## Rollback Plan

Revert the task implementation and deterministic close commits. No old persistence compatibility will be retained; rollback restores the pre-Phase-1 schema and command contracts as a unit.

## Findings

No material drift identified during planning.
