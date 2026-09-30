---
id: "202609301502-ZN5HAJ"
title: "Match SfxItemSet invalid-as-default copying"
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
  updated_at: "2026-09-30T15:03:04.677Z"
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
    body: "Start: align ordinary SfxItemSet copying with the pinned invalid-as-default flag, disabled filtering and observable return contract."
events:
  -
    type: "status"
    at: "2026-09-30T15:03:05.152Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: align ordinary SfxItemSet copying with the pinned invalid-as-default flag, disabled filtering and observable return contract."
doc_version: 3
doc_updated_at: "2026-09-30T15:03:05.152Z"
doc_updated_by: "CODER"
description: "One existing-runtime correction: align PutSet with pinned SfxItemSet::Put defaults, disabled-source filtering and return contract. INVALID clears target entries by default; explicit false copies invalid state without setting the return flag; DISABLED source entries are ignored. Verify Writer node/style inheritance and keep clone-copy semantics intact. Scope: itemset.ts, itemset.test.ts, writer-attributes.test.ts, runtime-inventory.json and task artifacts. Authorized iterative parity goal; preserve deliberate product deviations."
sections:
  Summary: |-
    Match SfxItemSet invalid-as-default copying

    One existing-runtime correction: align PutSet with pinned SfxItemSet::Put defaults, disabled-source filtering and return contract. INVALID clears target entries by default; explicit false copies invalid state without setting the return flag; DISABLED source entries are ignored. Verify Writer node/style inheritance and keep clone-copy semantics intact. Scope: itemset.ts, itemset.test.ts, writer-attributes.test.ts, runtime-inventory.json and task artifacts. Authorized iterative parity goal; preserve deliberate product deviations.
  Scope: |-
    - In scope: One existing-runtime correction: align PutSet with pinned SfxItemSet::Put defaults, disabled-source filtering and return contract. INVALID clears target entries by default; explicit false copies invalid state without setting the return flag; DISABLED source entries are ignored. Verify Writer node/style inheritance and keep clone-copy semantics intact. Scope: itemset.ts, itemset.test.ts, writer-attributes.test.ts, runtime-inventory.json and task artifacts. Authorized iterative parity goal; preserve deliberate product deviations.
    - Out of scope: unrelated refactors not required for "Match SfxItemSet invalid-as-default copying".
  Plan: "1. Compare SfxItemSet::Put(const SfxItemSet&, bool) and PutImpl with the pinned header default. 2. Add invalidAsDefault=true to PutSet; clear direct invalid targets by default, ignore incoming disabled states, and retain the source return behavior for explicit invalid copying. Keep clone-constructor copying independent. 3. Assert all modes, wider ranges, unchanged source, Writer style/node fallback and clone state preservation in the two existing tests. Append bounded runtime evidence. 4. Run focused tests, full npm run verify, doctor/routing; commit the four declared files plus task artifacts and close. No policy, inventory mechanism, save/open/recovery changes."
  Verify Steps: "1. Focused itemset and writer-attributes tests assert default invalid clearing, ignored disabled input, explicit invalid-state copying and exact return values, supported copying from wider sources, unchanged source and preserved clone states. Writer node and format inheritance resolves after direct invalid-value clearing. 2. npm run verify passes all gates at 100% required coverage. 3. ap doctor and node .agentplane/policy/check-routing.mjs pass; only the four declared source/test/inventory files and task artifacts change; final tracked checkout is clean."
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

Match SfxItemSet invalid-as-default copying

One existing-runtime correction: align PutSet with pinned SfxItemSet::Put defaults, disabled-source filtering and return contract. INVALID clears target entries by default; explicit false copies invalid state without setting the return flag; DISABLED source entries are ignored. Verify Writer node/style inheritance and keep clone-copy semantics intact. Scope: itemset.ts, itemset.test.ts, writer-attributes.test.ts, runtime-inventory.json and task artifacts. Authorized iterative parity goal; preserve deliberate product deviations.

## Scope

- In scope: One existing-runtime correction: align PutSet with pinned SfxItemSet::Put defaults, disabled-source filtering and return contract. INVALID clears target entries by default; explicit false copies invalid state without setting the return flag; DISABLED source entries are ignored. Verify Writer node/style inheritance and keep clone-copy semantics intact. Scope: itemset.ts, itemset.test.ts, writer-attributes.test.ts, runtime-inventory.json and task artifacts. Authorized iterative parity goal; preserve deliberate product deviations.
- Out of scope: unrelated refactors not required for "Match SfxItemSet invalid-as-default copying".

## Plan

1. Compare SfxItemSet::Put(const SfxItemSet&, bool) and PutImpl with the pinned header default. 2. Add invalidAsDefault=true to PutSet; clear direct invalid targets by default, ignore incoming disabled states, and retain the source return behavior for explicit invalid copying. Keep clone-constructor copying independent. 3. Assert all modes, wider ranges, unchanged source, Writer style/node fallback and clone state preservation in the two existing tests. Append bounded runtime evidence. 4. Run focused tests, full npm run verify, doctor/routing; commit the four declared files plus task artifacts and close. No policy, inventory mechanism, save/open/recovery changes.

## Verify Steps

1. Focused itemset and writer-attributes tests assert default invalid clearing, ignored disabled input, explicit invalid-state copying and exact return values, supported copying from wider sources, unchanged source and preserved clone states. Writer node and format inheritance resolves after direct invalid-value clearing. 2. npm run verify passes all gates at 100% required coverage. 3. ap doctor and node .agentplane/policy/check-routing.mjs pass; only the four declared source/test/inventory files and task artifacts change; final tracked checkout is clean.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert task-related commit(s).
- Re-run required checks to confirm rollback safety.

## Findings
