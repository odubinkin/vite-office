---
id: "202609301514-CTCC8R"
title: "Match SfxItemSet state setter range filtering"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 5
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify:
  - "npm run verify"
plan_approval:
  state: "approved"
  updated_at: "2026-09-30T15:15:02.673Z"
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
    body: "Start: match explicit item state setter range filtering with pinned upstream while retaining valid transitions, inheritance and idempotence."
events:
  -
    type: "status"
    at: "2026-09-30T15:15:03.145Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: match explicit item state setter range filtering with pinned upstream while retaining valid transitions, inheritance and idempotence."
doc_version: 3
doc_updated_at: "2026-09-30T15:15:03.145Z"
doc_updated_by: "CODER"
description: "One correction: explicit InvalidateItem and DisableItem must ignore WhichIds outside the item-set ranges, as pinned DisableOrInvalidateItem_ForWhichID does. Remove the local exception helper, retain supported transitions and idempotence, and add focused evidence. Scope: itemset.ts, itemset.test.ts, runtime-inventory.json and task artifacts. User-authorized iterative upstream parity goal; preserve product deviations."
sections:
  Summary: |-
    Match SfxItemSet state setter range filtering

    One correction: explicit InvalidateItem and DisableItem must ignore WhichIds outside the item-set ranges, as pinned DisableOrInvalidateItem_ForWhichID does. Remove the local exception helper, retain supported transitions and idempotence, and add focused evidence. Scope: itemset.ts, itemset.test.ts, runtime-inventory.json and task artifacts. User-authorized iterative upstream parity goal; preserve product deviations.
  Scope: |-
    - In scope: One correction: explicit InvalidateItem and DisableItem must ignore WhichIds outside the item-set ranges, as pinned DisableOrInvalidateItem_ForWhichID does. Remove the local exception helper, retain supported transitions and idempotence, and add focused evidence. Scope: itemset.ts, itemset.test.ts, runtime-inventory.json and task artifacts. User-authorized iterative upstream parity goal; preserve product deviations.
    - Out of scope: unrelated refactors not required for "Match SfxItemSet state setter range filtering".
  Plan: "1. Compare explicit state setters with pinned itemset.cxx::DisableOrInvalidateItem_ForWhichID. 2. Replace the out-of-range exception with a no-op and remove the unused assertion helper. 3. Assert both setters preserve direct/inherited values outside ranges and retain supported state transitions and idempotence; append bounded runtime inventory evidence. 4. Run focused tests, full npm run verify, doctor/routing; record and commit only itemset.ts, itemset.test.ts, runtime-inventory.json and task artifacts before closing."
  Verify Steps: "1. Focused itemset tests prove both explicit state setters ignore zero/out-of-range IDs without changing count, supported values/states, inheritance or ranges; supported transitions, repeated calls and clearing still work. 2. npm run verify passes every required gate at 100% coverage. 3. ap doctor and node .agentplane/policy/check-routing.mjs pass; final diff is limited to three declared files and task artifacts; final tracked checkout is clean."
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

Match SfxItemSet state setter range filtering

One correction: explicit InvalidateItem and DisableItem must ignore WhichIds outside the item-set ranges, as pinned DisableOrInvalidateItem_ForWhichID does. Remove the local exception helper, retain supported transitions and idempotence, and add focused evidence. Scope: itemset.ts, itemset.test.ts, runtime-inventory.json and task artifacts. User-authorized iterative upstream parity goal; preserve product deviations.

## Scope

- In scope: One correction: explicit InvalidateItem and DisableItem must ignore WhichIds outside the item-set ranges, as pinned DisableOrInvalidateItem_ForWhichID does. Remove the local exception helper, retain supported transitions and idempotence, and add focused evidence. Scope: itemset.ts, itemset.test.ts, runtime-inventory.json and task artifacts. User-authorized iterative upstream parity goal; preserve product deviations.
- Out of scope: unrelated refactors not required for "Match SfxItemSet state setter range filtering".

## Plan

1. Compare explicit state setters with pinned itemset.cxx::DisableOrInvalidateItem_ForWhichID. 2. Replace the out-of-range exception with a no-op and remove the unused assertion helper. 3. Assert both setters preserve direct/inherited values outside ranges and retain supported state transitions and idempotence; append bounded runtime inventory evidence. 4. Run focused tests, full npm run verify, doctor/routing; record and commit only itemset.ts, itemset.test.ts, runtime-inventory.json and task artifacts before closing.

## Verify Steps

1. Focused itemset tests prove both explicit state setters ignore zero/out-of-range IDs without changing count, supported values/states, inheritance or ranges; supported transitions, repeated calls and clearing still work. 2. npm run verify passes every required gate at 100% coverage. 3. ap doctor and node .agentplane/policy/check-routing.mjs pass; final diff is limited to three declared files and task artifacts; final tracked checkout is clean.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert task-related commit(s).
- Re-run required checks to confirm rollback safety.

## Findings
