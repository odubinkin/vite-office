---
id: "202609301603-AEE039"
title: "Match disabled pool item sentinel contracts"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 8
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
  state: "ok"
  updated_at: "2026-09-30T16:13:13.443Z"
  updated_by: "CODER"
  note: "32 focused tests and complete repository verification passed; disabled singleton identity, null clone and non-value contracts are source-backed."
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
  -
    type: "verify"
    at: "2026-09-30T16:13:13.443Z"
    author: "CODER"
    state: "ok"
    note: "32 focused tests and complete repository verification passed; disabled singleton identity, null clone and non-value contracts are source-backed."
doc_version: 3
doc_updated_at: "2026-09-30T16:13:13.518Z"
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
    ### 2026-09-30T16:13:13.443Z — VERIFY — ok

    By: CODER

    Note: 32 focused tests and complete repository verification passed; disabled singleton identity, null clone and non-value contracts are source-backed.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-30T16:13:12.973Z, excerpt_hash=sha256:384978941b6b84b2c18b104c3f09cded601f9b626024c665b1b55c4e46a4f52d

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609301603-AEE039/blueprint/resolved-snapshot.json
    - old_digest: f1459510e3f6d7dc5fc7c46595f9318a06833a65b9f0ce1268a2b1682bf58d81
    - current_digest: f1459510e3f6d7dc5fc7c46595f9318a06833a65b9f0ce1268a2b1682bf58d81
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202609301603-AEE039

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202609301603-AEE039
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: false
    - repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: |-
    - Revert task-related commit(s).
    - Re-run required checks to confirm rollback safety.
  Findings: "Command: focused itemset regression before implementation. Result: fail, Get returned the default WhichId 1 rather than disabled sentinel WhichId 0. Command: focused itemset, Writer attribute and item codec tests after implementation. Result: pass, 32 tests. Evidence: DISABLED_POOL_ITEM is owned by poolitem.ts; WhichId=0, Clone=null and trivial equality match pinned DisabledItem. IsDisabledItem follows pointer identity, including null/undefined rejection. QueryValue exposes no payload corresponding to the failed native base query, and codec rejects serialization. Direct/inherited Get and same-pool state clones return the identical singleton across IDs, including an ID without a pool default; GetItemIfSet still excludes states, Put ignores the singleton, ordinary values/codec and INVALID masks remain covered. Abstract Clone now honestly includes null; ordinary default/item clone storage retains existing non-sentinel type assumptions. No txatbase changes were needed. Command: npm run verify. Result: pass, 572 application tests, 109 inventory tests, 19 browser scenarios, 100% required coverage and every required format/type/lint/resource/dependency/static/source/provenance/invariant/parity gate. Evidence: verify.log; semanticViolationCount 0. Command: ap doctor; node .agentplane/policy/check-routing.mjs. Result: pass with existing doctor warnings only. Residual architecture follow-up: itemset still stores values and state flags in two maps, unlike native PoolItemMap containing value/INVALID/DISABLED pointers; review and refactor separately without inventing a product exception. Conscious save/open/recovery decisions remain unchanged."
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
### 2026-09-30T16:13:13.443Z — VERIFY — ok

By: CODER

Note: 32 focused tests and complete repository verification passed; disabled singleton identity, null clone and non-value contracts are source-backed.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-30T16:13:12.973Z, excerpt_hash=sha256:384978941b6b84b2c18b104c3f09cded601f9b626024c665b1b55c4e46a4f52d

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609301603-AEE039/blueprint/resolved-snapshot.json
- old_digest: f1459510e3f6d7dc5fc7c46595f9318a06833a65b9f0ce1268a2b1682bf58d81
- current_digest: f1459510e3f6d7dc5fc7c46595f9318a06833a65b9f0ce1268a2b1682bf58d81
- route_changed: no
- safe_command: agentplane blueprint snapshot 202609301603-AEE039

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202609301603-AEE039
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: false
- repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert task-related commit(s).
- Re-run required checks to confirm rollback safety.

## Findings

Command: focused itemset regression before implementation. Result: fail, Get returned the default WhichId 1 rather than disabled sentinel WhichId 0. Command: focused itemset, Writer attribute and item codec tests after implementation. Result: pass, 32 tests. Evidence: DISABLED_POOL_ITEM is owned by poolitem.ts; WhichId=0, Clone=null and trivial equality match pinned DisabledItem. IsDisabledItem follows pointer identity, including null/undefined rejection. QueryValue exposes no payload corresponding to the failed native base query, and codec rejects serialization. Direct/inherited Get and same-pool state clones return the identical singleton across IDs, including an ID without a pool default; GetItemIfSet still excludes states, Put ignores the singleton, ordinary values/codec and INVALID masks remain covered. Abstract Clone now honestly includes null; ordinary default/item clone storage retains existing non-sentinel type assumptions. No txatbase changes were needed. Command: npm run verify. Result: pass, 572 application tests, 109 inventory tests, 19 browser scenarios, 100% required coverage and every required format/type/lint/resource/dependency/static/source/provenance/invariant/parity gate. Evidence: verify.log; semanticViolationCount 0. Command: ap doctor; node .agentplane/policy/check-routing.mjs. Result: pass with existing doctor warnings only. Residual architecture follow-up: itemset still stores values and state flags in two maps, unlike native PoolItemMap containing value/INVALID/DISABLED pointers; review and refactor separately without inventing a product exception. Conscious save/open/recovery decisions remain unchanged.
