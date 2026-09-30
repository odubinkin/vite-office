---
id: "202609301603-AEE039"
title: "Match disabled pool item sentinel contracts"
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
  updated_at: "2026-09-30T16:04:14.217Z"
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
    body: "Start: replace the existing disabled Get default fallback with the pinned pool-item singleton and verify its clone/value/state contracts."
events:
  -
    type: "status"
    at: "2026-09-30T16:04:14.918Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: replace the existing disabled Get default fallback with the pinned pool-item singleton and verify its clone/value/state contracts."
doc_version: 3
doc_updated_at: "2026-09-30T16:04:14.918Z"
doc_updated_by: "CODER"
description: "One source-backed correction: existing disabled item states must expose pinned DISABLED_POOL_ITEM from Get instead of a default, with a real poolitem-owned singleton and nullable sentinel clone contract."
sections:
  Summary: |-
    Match disabled pool item sentinel contracts

    One source-backed correction: existing disabled item states must expose pinned DISABLED_POOL_ITEM from Get instead of a default, with a real poolitem-owned singleton and nullable sentinel clone contract.
  Scope: "svl/source/items/poolitem.ts, itemset.ts, itempool.ts, itemset.test.ts; sw/source/core/txtnode/txatbase.ts only for nullable Clone typing if necessary; docs/program/parity/runtime-inventory.json and docs/program/source-provenance.json; canonical task artifacts. Only existing disabled-state Get and related sentinel/clone contracts are corrected. No inventory tooling or save/open/recovery deviation changes."
  Plan: "CODER fixes one disabled-state observable item contract. In svl/source/items/poolitem.ts implement the pinned module-owned DisabledItem singleton, DISABLED_POOL_ITEM and identity helper IsDisabledItem; allow abstract Clone to return null as pinned sentinel Clone does, and expose no QueryValue payload. In itemset.ts return the singleton for direct/inherited DISABLED while retaining INVALID default fallback and GetItemIfSet state filtering; ignore singleton Put before cloning. Adjust only type assumptions for ordinary non-sentinel clone storage in itempool.ts and itemset.ts; txatbase.ts is allowed only if nullable Clone typing requires it. Add focused itemset.test.ts evidence for identity across IDs/sets/clones, direct and inherited Get flags, transitions/clear, sentinel clone/equality/value, rejected codec serialization and unchanged ordinary clones. Update runtime-inventory.json and source-provenance.json data with exact owner/symbol evidence, without promoting whole-module parity or changing validators. Full npm run verify, doctor/routing, review, clean close. No new native APIs beyond the sentinel contract or conscious product exception changes."
  Verify Steps: "1. Focused regression reproduces Get returning a pool default for DISABLED before the fix, then proves the same singleton across WhichIds, sets, same-pool state clones, and inherited/default Get flags, including a disabled ID with no pool default. 2. Verify sentinel WhichId=0, Clone=null, identity helper, pinned trivial equality, no value payload and codec rejection; GetItemIfSet remains undefined, Put sentinel is a no-op, ordinary item clones/codec and INVALID defaults remain valid. 3. npm run verify passes every required gate at 100% coverage. 4. ap doctor and node .agentplane/policy/check-routing.mjs pass; diff remains scoped and final git status is clean."
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

Match disabled pool item sentinel contracts

One source-backed correction: existing disabled item states must expose pinned DISABLED_POOL_ITEM from Get instead of a default, with a real poolitem-owned singleton and nullable sentinel clone contract.

## Scope

svl/source/items/poolitem.ts, itemset.ts, itempool.ts, itemset.test.ts; sw/source/core/txtnode/txatbase.ts only for nullable Clone typing if necessary; docs/program/parity/runtime-inventory.json and docs/program/source-provenance.json; canonical task artifacts. Only existing disabled-state Get and related sentinel/clone contracts are corrected. No inventory tooling or save/open/recovery deviation changes.

## Plan

CODER fixes one disabled-state observable item contract. In svl/source/items/poolitem.ts implement the pinned module-owned DisabledItem singleton, DISABLED_POOL_ITEM and identity helper IsDisabledItem; allow abstract Clone to return null as pinned sentinel Clone does, and expose no QueryValue payload. In itemset.ts return the singleton for direct/inherited DISABLED while retaining INVALID default fallback and GetItemIfSet state filtering; ignore singleton Put before cloning. Adjust only type assumptions for ordinary non-sentinel clone storage in itempool.ts and itemset.ts; txatbase.ts is allowed only if nullable Clone typing requires it. Add focused itemset.test.ts evidence for identity across IDs/sets/clones, direct and inherited Get flags, transitions/clear, sentinel clone/equality/value, rejected codec serialization and unchanged ordinary clones. Update runtime-inventory.json and source-provenance.json data with exact owner/symbol evidence, without promoting whole-module parity or changing validators. Full npm run verify, doctor/routing, review, clean close. No new native APIs beyond the sentinel contract or conscious product exception changes.

## Verify Steps

1. Focused regression reproduces Get returning a pool default for DISABLED before the fix, then proves the same singleton across WhichIds, sets, same-pool state clones, and inherited/default Get flags, including a disabled ID with no pool default. 2. Verify sentinel WhichId=0, Clone=null, identity helper, pinned trivial equality, no value payload and codec rejection; GetItemIfSet remains undefined, Put sentinel is a no-op, ordinary item clones/codec and INVALID defaults remain valid. 3. npm run verify passes every required gate at 100% coverage. 4. ap doctor and node .agentplane/policy/check-routing.mjs pass; diff remains scoped and final git status is clean.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert task-related commit(s).
- Re-run required checks to confirm rollback safety.

## Findings
