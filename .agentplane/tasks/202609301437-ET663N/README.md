---
id: "202609301437-ET663N"
title: "Match SfxItemSet Put range filtering"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 6
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify:
  - "npm run verify"
plan_approval:
  state: "approved"
  updated_at: "2026-09-30T14:37:39.564Z"
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
    body: "Start: align bounded SfxItemSet Put range filtering with pinned upstream, validate wider-source copying and preserve explicit state contracts."
events:
  -
    type: "status"
    at: "2026-09-30T14:37:40.258Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: align bounded SfxItemSet Put range filtering with pinned upstream, validate wider-source copying and preserve explicit state contracts."
doc_version: 3
doc_updated_at: "2026-09-30T14:43:40.884Z"
doc_updated_by: "CODER"
description: "One implemented-runtime parity correction: SfxItemSet.Put must return undefined for an item outside its WhichId ranges, as pinned SfxItemSet::PutImpl returns nullptr; PutSet must retain supported items from a wider source without throwing. Scope: itemset.ts, itemset.test.ts, runtime-inventory.json and task artifacts. Approved by the user iterative parity instruction; preserve product deviations."
sections:
  Summary: |-
    Match SfxItemSet Put range filtering

    One implemented-runtime parity correction: SfxItemSet.Put must return undefined for an item outside its WhichId ranges, as pinned SfxItemSet::PutImpl returns nullptr; PutSet must retain supported items from a wider source without throwing. Scope: itemset.ts, itemset.test.ts, runtime-inventory.json and task artifacts. Approved by the user iterative parity instruction; preserve product deviations.
  Scope: |-
    - In scope: One implemented-runtime parity correction: SfxItemSet.Put must return undefined for an item outside its WhichId ranges, as pinned SfxItemSet::PutImpl returns nullptr; PutSet must retain supported items from a wider source without throwing. Scope: itemset.ts, itemset.test.ts, runtime-inventory.json and task artifacts. Approved by the user iterative parity instruction; preserve product deviations.
    - Out of scope: unrelated refactors not required for "Match SfxItemSet Put range filtering".
  Plan: "1. Compare SfxItemSet.Put and PutSet range handling with pinned svl/source/items/itemset.cxx::SfxItemSet::PutImpl and Put. 2. Replace the Put out-of-range exception with an unchanged undefined result; preserve strict explicit state validation. 3. Assert zero/out-of-range values, unchanged state, and copying a wider item set containing supported and unsupported values. Update only focused runtime inventory evidence. 4. Run focused itemset tests and full npm run verify plus doctor/routing, commit the three scoped files, record quality and close."
  Verify Steps: "1. Focused itemset tests prove Put ignores unsupported WhichIds without state changes and PutSet copies supported entries from a wider source. Existing inheritance, invalid/disabled states, cloning, equality and persistence assertions still pass. 2. npm run verify passes all required gates with 100% required coverage. 3. ap doctor and node .agentplane/policy/check-routing.mjs pass; diff contains only itemset.ts, itemset.test.ts, runtime-inventory.json and this task artifacts; tracked checkout is clean after closure."
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: |-
    - Revert task-related commit(s).
    - Re-run required checks to confirm rollback safety.
  Findings: "Pinned SfxItemSet::PutImpl ignores entries outside its ranges; the old local exception caused three focused tests to fail. Focused itemset tests now pass 9/9. First npm run verify attempt: 559/560 app tests passed; desktop.test.tsx immediately saves imported TXT but never saves an empty import failed at line 441 waiting for the browser copy named notes. This unrelated timing-sensitive file test passed in the preceding full verification. Diagnose by focused rerun, then repeat the full gate without changing save policy or verification criteria. Runtime inventory retains unverified module status."
id_source: "generated"
---
## Summary

Match SfxItemSet Put range filtering

One implemented-runtime parity correction: SfxItemSet.Put must return undefined for an item outside its WhichId ranges, as pinned SfxItemSet::PutImpl returns nullptr; PutSet must retain supported items from a wider source without throwing. Scope: itemset.ts, itemset.test.ts, runtime-inventory.json and task artifacts. Approved by the user iterative parity instruction; preserve product deviations.

## Scope

- In scope: One implemented-runtime parity correction: SfxItemSet.Put must return undefined for an item outside its WhichId ranges, as pinned SfxItemSet::PutImpl returns nullptr; PutSet must retain supported items from a wider source without throwing. Scope: itemset.ts, itemset.test.ts, runtime-inventory.json and task artifacts. Approved by the user iterative parity instruction; preserve product deviations.
- Out of scope: unrelated refactors not required for "Match SfxItemSet Put range filtering".

## Plan

1. Compare SfxItemSet.Put and PutSet range handling with pinned svl/source/items/itemset.cxx::SfxItemSet::PutImpl and Put. 2. Replace the Put out-of-range exception with an unchanged undefined result; preserve strict explicit state validation. 3. Assert zero/out-of-range values, unchanged state, and copying a wider item set containing supported and unsupported values. Update only focused runtime inventory evidence. 4. Run focused itemset tests and full npm run verify plus doctor/routing, commit the three scoped files, record quality and close.

## Verify Steps

1. Focused itemset tests prove Put ignores unsupported WhichIds without state changes and PutSet copies supported entries from a wider source. Existing inheritance, invalid/disabled states, cloning, equality and persistence assertions still pass. 2. npm run verify passes all required gates with 100% required coverage. 3. ap doctor and node .agentplane/policy/check-routing.mjs pass; diff contains only itemset.ts, itemset.test.ts, runtime-inventory.json and this task artifacts; tracked checkout is clean after closure.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert task-related commit(s).
- Re-run required checks to confirm rollback safety.

## Findings

Pinned SfxItemSet::PutImpl ignores entries outside its ranges; the old local exception caused three focused tests to fail. Focused itemset tests now pass 9/9. First npm run verify attempt: 559/560 app tests passed; desktop.test.tsx immediately saves imported TXT but never saves an empty import failed at line 441 waiting for the browser copy named notes. This unrelated timing-sensitive file test passed in the preceding full verification. Diagnose by focused rerun, then repeat the full gate without changing save policy or verification criteria. Runtime inventory retains unverified module status.
