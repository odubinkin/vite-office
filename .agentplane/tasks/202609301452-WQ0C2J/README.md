---
id: "202609301452-WQ0C2J"
title: "Match item set clone inheritance and state contracts"
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
  updated_at: "2026-09-30T14:53:02.787Z"
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
    body: "Start: match SfxItemSet and SwAttrSet clone contracts with pinned copy constructors, parent ownership and cross-pool state filtering."
events:
  -
    type: "status"
    at: "2026-09-30T14:53:03.364Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: match SfxItemSet and SwAttrSet clone contracts with pinned copy constructors, parent ownership and cross-pool state filtering."
doc_version: 3
doc_updated_at: "2026-09-30T14:53:03.364Z"
doc_updated_by: "CODER"
description: "One correction to existing SfxItemSet.Clone and SwAttrSet.CloneAsValue: empty clones drop parents, complete same-pool clones preserve direct state, cross-pool clones copy only directly SET values. Compare pinned itemset.cxx and swatrset.cxx, remove redundant PutSet-plus-state copying, and add focused evidence. Scope: itemset.ts/test, swatrset.ts, writer-attributes.test.ts, runtime-inventory.json and task artifacts. Authorized iterative parity goal; preserve deliberate product deviations."
sections:
  Summary: |-
    Match item set clone inheritance and state contracts

    One correction to existing SfxItemSet.Clone and SwAttrSet.CloneAsValue: empty clones drop parents, complete same-pool clones preserve direct state, cross-pool clones copy only directly SET values. Compare pinned itemset.cxx and swatrset.cxx, remove redundant PutSet-plus-state copying, and add focused evidence. Scope: itemset.ts/test, swatrset.ts, writer-attributes.test.ts, runtime-inventory.json and task artifacts. Authorized iterative parity goal; preserve deliberate product deviations.
  Scope: |-
    - In scope: One correction to existing SfxItemSet.Clone and SwAttrSet.CloneAsValue: empty clones drop parents, complete same-pool clones preserve direct state, cross-pool clones copy only directly SET values. Compare pinned itemset.cxx and swatrset.cxx, remove redundant PutSet-plus-state copying, and add focused evidence. Scope: itemset.ts/test, swatrset.ts, writer-attributes.test.ts, runtime-inventory.json and task artifacts. Authorized iterative parity goal; preserve deliberate product deviations.
    - Out of scope: unrelated refactors not required for "Match item set clone inheritance and state contracts".
  Plan: "1. Compare pinned SfxItemSet copy constructor/Clone and SwAttrSet copy constructor/CloneAsValue. 2. Translate copy-constructor item copying into one protected helper shared by clone paths, eliminating redundant PutSet copying. Empty clones drop inheritance; full same-pool clones retain parent and direct states; cross-pool Sfx clones copy only SET items. 3. Add regression assertions for inherited/direct/invalid/disabled items and independent mutation in itemset.test.ts and writer-attributes.test.ts. Append bounded inventory evidence without broad promotion. 4. Run focused tests, npm run verify, doctor and policy routing; record evidence and close with the five scoped files and task artifacts. No save/open/recovery or inventory mechanism changes."
  Verify Steps: "1. Focused itemset and writer-attributes tests prove empty clones have no parent or items, full same-pool clones preserve parent, direct values and invalid/disabled states independently, and cross-pool clones retain only directly SET values with destination defaults. 2. npm run verify passes all required checks at 100% coverage. 3. ap doctor and node .agentplane/policy/check-routing.mjs pass; final diff is confined to the five approved files and task artifacts; tracked checkout is clean after closure."
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

Match item set clone inheritance and state contracts

One correction to existing SfxItemSet.Clone and SwAttrSet.CloneAsValue: empty clones drop parents, complete same-pool clones preserve direct state, cross-pool clones copy only directly SET values. Compare pinned itemset.cxx and swatrset.cxx, remove redundant PutSet-plus-state copying, and add focused evidence. Scope: itemset.ts/test, swatrset.ts, writer-attributes.test.ts, runtime-inventory.json and task artifacts. Authorized iterative parity goal; preserve deliberate product deviations.

## Scope

- In scope: One correction to existing SfxItemSet.Clone and SwAttrSet.CloneAsValue: empty clones drop parents, complete same-pool clones preserve direct state, cross-pool clones copy only directly SET values. Compare pinned itemset.cxx and swatrset.cxx, remove redundant PutSet-plus-state copying, and add focused evidence. Scope: itemset.ts/test, swatrset.ts, writer-attributes.test.ts, runtime-inventory.json and task artifacts. Authorized iterative parity goal; preserve deliberate product deviations.
- Out of scope: unrelated refactors not required for "Match item set clone inheritance and state contracts".

## Plan

1. Compare pinned SfxItemSet copy constructor/Clone and SwAttrSet copy constructor/CloneAsValue. 2. Translate copy-constructor item copying into one protected helper shared by clone paths, eliminating redundant PutSet copying. Empty clones drop inheritance; full same-pool clones retain parent and direct states; cross-pool Sfx clones copy only SET items. 3. Add regression assertions for inherited/direct/invalid/disabled items and independent mutation in itemset.test.ts and writer-attributes.test.ts. Append bounded inventory evidence without broad promotion. 4. Run focused tests, npm run verify, doctor and policy routing; record evidence and close with the five scoped files and task artifacts. No save/open/recovery or inventory mechanism changes.

## Verify Steps

1. Focused itemset and writer-attributes tests prove empty clones have no parent or items, full same-pool clones preserve parent, direct values and invalid/disabled states independently, and cross-pool clones retain only directly SET values with destination defaults. 2. npm run verify passes all required checks at 100% coverage. 3. ap doctor and node .agentplane/policy/check-routing.mjs pass; final diff is confined to the five approved files and task artifacts; tracked checkout is clean after closure.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert task-related commit(s).
- Re-run required checks to confirm rollback safety.

## Findings
