---
id: "202609301551-S2X2YK"
title: "Match SfxItemSet parent assignment and default lookup"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 6
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-09-30T15:51:56.327Z"
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
    body: "Start: correct the pinned parent assignment and inherited default lookup contract with explicit foreign-pool and invalid-state evidence."
events:
  -
    type: "status"
    at: "2026-09-30T15:51:56.997Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: correct the pinned parent assignment and inherited default lookup contract with explicit foreign-pool and invalid-state evidence."
doc_version: 3
doc_updated_at: "2026-09-30T15:51:56.997Z"
doc_updated_by: "CODER"
description: "One inherited-value contract correction under approved iterative parity work: remove extra SetParent restrictions and follow pinned parent Get delegation for default ownership, with focused regression and full verification."
sections:
  Summary: |-
    Match SfxItemSet parent assignment and default lookup

    One inherited-value contract correction under approved iterative parity work: remove extra SetParent restrictions and follow pinned parent Get delegation for default ownership, with focused regression and full verification.
  Scope: "Only apps/office/src/svl/source/items/itemset.ts, apps/office/src/svl/source/items/itemset.test.ts, docs/program/parity/runtime-inventory.json, and canonical task artifacts. One parent assignment/inherited default resolution contract. SwFormat ownership checks and separate disabled sentinel contract are excluded."
  Plan: "CODER fixes the existing inherited-value contract in apps/office/src/svl/source/items/itemset.ts: SetParent assigns the provided reference exactly like include/svl/itemset.hxx, without extra self/foreign-pool guards; Get returns direct values, blocks parent search for explicit states, and delegates missing values to parent.Get when enabled so defaults come from the parent chain rather than always the child pool. Add tests in itemset.test.ts for assignment/reset, constructor inheritance, foreign-pool default ownership across a chain, explicit direct override, searchInParent=false, INVALID blocking at child/parent, and no mutation to ranges/count/state; self assignment is exercised without recursive lookup. Preserve separate unverified DISABLED sentinel semantics for its own next task. Append narrow pinned evidence in runtime-inventory.json, without module-wide promotion. Run red/green focused tests, complete npm run verify, doctor/routing, quality review and deterministic clean close. No other runtime files, inventory tooling, network, or save/open/recovery exceptions."
  Verify Steps: "1. Focused itemset tests reproduce unsupported parent rejection before the change, then confirm source-style assignment/reset and constructor parenting preserve direct count/items/ranges. 2. Distinct child/parent/grandparent pools prove Get delegates defaults to the parent chain, local/direct values win, searchInParent=false stays local, and INVALID at either level uses that level own pool; GetItemIfSet remains undefined for default/state-only values. 3. npm run verify passes every required gate at 100% coverage. 4. ap doctor and node .agentplane/policy/check-routing.mjs pass; the diff stays in declared scope and final tracked/untracked status is clean."
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

Match SfxItemSet parent assignment and default lookup

One inherited-value contract correction under approved iterative parity work: remove extra SetParent restrictions and follow pinned parent Get delegation for default ownership, with focused regression and full verification.

## Scope

Only apps/office/src/svl/source/items/itemset.ts, apps/office/src/svl/source/items/itemset.test.ts, docs/program/parity/runtime-inventory.json, and canonical task artifacts. One parent assignment/inherited default resolution contract. SwFormat ownership checks and separate disabled sentinel contract are excluded.

## Plan

CODER fixes the existing inherited-value contract in apps/office/src/svl/source/items/itemset.ts: SetParent assigns the provided reference exactly like include/svl/itemset.hxx, without extra self/foreign-pool guards; Get returns direct values, blocks parent search for explicit states, and delegates missing values to parent.Get when enabled so defaults come from the parent chain rather than always the child pool. Add tests in itemset.test.ts for assignment/reset, constructor inheritance, foreign-pool default ownership across a chain, explicit direct override, searchInParent=false, INVALID blocking at child/parent, and no mutation to ranges/count/state; self assignment is exercised without recursive lookup. Preserve separate unverified DISABLED sentinel semantics for its own next task. Append narrow pinned evidence in runtime-inventory.json, without module-wide promotion. Run red/green focused tests, complete npm run verify, doctor/routing, quality review and deterministic clean close. No other runtime files, inventory tooling, network, or save/open/recovery exceptions.

## Verify Steps

1. Focused itemset tests reproduce unsupported parent rejection before the change, then confirm source-style assignment/reset and constructor parenting preserve direct count/items/ranges. 2. Distinct child/parent/grandparent pools prove Get delegates defaults to the parent chain, local/direct values win, searchInParent=false stays local, and INVALID at either level uses that level own pool; GetItemIfSet remains undefined for default/state-only values. 3. npm run verify passes every required gate at 100% coverage. 4. ap doctor and node .agentplane/policy/check-routing.mjs pass; the diff stays in declared scope and final tracked/untracked status is clean.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert task-related commit(s).
- Re-run required checks to confirm rollback safety.

## Findings
