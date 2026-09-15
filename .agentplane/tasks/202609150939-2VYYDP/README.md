---
id: "202609150939-2VYYDP"
title: "Phase 0.1 exact upstream invariant manifest"
status: "DOING"
priority: "high"
owner: "CODER"
revision: 10
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
  - "parity"
task_kind: "code"
mutation_scope: "code"
verify:
  - "npm run inventory:parity"
  - "npm run test:coverage --workspace @vite-office/office"
  - "npm run test:inventory:coverage"
plan_approval:
  state: "approved"
  updated_at: "2026-09-15T09:40:34.939Z"
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
    body: "Start: implement exact upstream invariant manifest, corrected WhichIds, and incompatible persistence rejection for Phase 0.1."
events:
  -
    type: "status"
    at: "2026-09-15T09:40:53.250Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implement exact upstream invariant manifest, corrected WhichIds, and incompatible persistence rejection for Phase 0.1."
doc_version: 3
doc_updated_at: "2026-09-15T09:40:53.250Z"
doc_updated_by: "CODER"
description: "Generate and enforce pinned Writer/editeng/svl invariants, correct character WhichIds, and reject incompatible browser persistence records."
sections:
  Summary: "Implement P0.1 from docs/program/vite-office-upstream-parity-plan.md: make pinned upstream invariants machine-checkable, correct used Writer character WhichIds, and invalidate incompatible persisted snapshots."
  Scope: "In scope: invariant generation/validation tooling and fixtures; used Writer/editeng/svl constants and defaults; local mappings/tests; browser persistence schema validation and recovery diagnostics affected by corrected IDs. Out of scope: Phase 1 dispatch/item architecture and unrelated Writer behavior."
  Plan: |-
    1. Inventory every invariant currently consumed by the implemented Writer slice and resolve it against the pinned LibreOffice checkout.
    2. Add a deterministic checked-in manifest and generator/validator with focused tests.
    3. Correct RES_CHRATR_FONT and RES_CHRATR_CJK_FONT plus all affected mappings and snapshots.
    4. Bump affected persistence formats and reject incompatible records with an explicit recovery diagnostic.
    5. Run focused inventory and office tests, then record evidence.
  Verify Steps: |-
    1. Run the invariant generator/check command in check mode; expect the checked-in manifest to match the pinned LibreOffice checkout.
    2. Run focused invariant tests; expect mutation of any used value to be rejected and WhichIds 7/22 to be asserted from the manifest rather than duplicated snapshots.
    3. Run focused persistence tests; expect obsolete records to be rejected with a recovery diagnostic.
    4. Run npm run test:inventory:coverage.
    5. Run npm run test:coverage --workspace @vite-office/office.
    6. Run npm run inventory:parity.
  Verification: "Pending execution."
  Rollback Plan: "Revert the task commit, restoring the prior generated artifacts, constants, mappings, and persistence schema. No compatibility shim will be retained for incorrect IDs."
  Findings: "None yet."
id_source: "generated"
---
## Summary

Implement P0.1 from docs/program/vite-office-upstream-parity-plan.md: make pinned upstream invariants machine-checkable, correct used Writer character WhichIds, and invalidate incompatible persisted snapshots.

## Scope

In scope: invariant generation/validation tooling and fixtures; used Writer/editeng/svl constants and defaults; local mappings/tests; browser persistence schema validation and recovery diagnostics affected by corrected IDs. Out of scope: Phase 1 dispatch/item architecture and unrelated Writer behavior.

## Plan

1. Inventory every invariant currently consumed by the implemented Writer slice and resolve it against the pinned LibreOffice checkout.
2. Add a deterministic checked-in manifest and generator/validator with focused tests.
3. Correct RES_CHRATR_FONT and RES_CHRATR_CJK_FONT plus all affected mappings and snapshots.
4. Bump affected persistence formats and reject incompatible records with an explicit recovery diagnostic.
5. Run focused inventory and office tests, then record evidence.

## Verify Steps

1. Run the invariant generator/check command in check mode; expect the checked-in manifest to match the pinned LibreOffice checkout.
2. Run focused invariant tests; expect mutation of any used value to be rejected and WhichIds 7/22 to be asserted from the manifest rather than duplicated snapshots.
3. Run focused persistence tests; expect obsolete records to be rejected with a recovery diagnostic.
4. Run npm run test:inventory:coverage.
5. Run npm run test:coverage --workspace @vite-office/office.
6. Run npm run inventory:parity.

## Verification

Pending execution.

## Rollback Plan

Revert the task commit, restoring the prior generated artifacts, constants, mappings, and persistence schema. No compatibility shim will be retained for incorrect IDs.

## Findings

None yet.
