---
id: "202609301617-7M8MJP"
title: "Unify SfxItemSet value and state storage"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 13
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-09-30T16:30:20.426Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-09-30T16:35:43.326Z"
  updated_by: "CODER"
  note: "Command: npm run verify. Result: pass (exit 0). Evidence: verify.log; 574 application, 109 inventory, 19 browser tests; all required coverage 100%; all static/build/docs/source/invariant/parity gates; semanticViolationCount=0. Architecture inspection and 48 focused tests passed. Doctor and policy routing passed with pre-existing warnings only. Scope: native single-map item-set state storage, distinct invalid singleton and necessary existing test consumers; broader parity remains unverified."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-09-30T16:36:44.874Z"
  updated_by: "EVALUATOR"
  note: "Single-map architecture follows pinned PoolItemMap and sentinel ownership while preserving established contracts; necessary ODT test consumers adapted without weaker assertions."
  evaluated_sha: "1b562ee3a953c4c12f1a996a5b0acbdc5b88e473"
  blueprint_digest: "65ef22b06b037fe4799bfbcea4f42e4c7bfbcf769411d51f36718f1bfee9e7c2"
  evidence_refs:
    - ".agentplane/tasks/202609301617-7M8MJP/README.md"
    - ".agentplane/tasks/202609301617-7M8MJP/quality/20260930-163644874-recovery-context/quality-report.json"
    - ".agentplane/tasks/202609301617-7M8MJP/quality/20260930-163644874-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202609301617-7M8MJP/quality/20260930-163644874-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202609301617-7M8MJP/blueprint/resolved-snapshot.json"
    - ".agentplane/tasks/202609301617-7M8MJP/verify.log"
  findings:
    - "Reviewed source transitions, sentinel identity/trivial equality exclusion, Get/default inheritance, PutSet flags and change result, full/cross-pool state copies, Count/Clear and SET-only browser projection. No compatibility state map, validator changes, or deliberate product deviation changes. All declared verification passed; broader module parity remains unverified."
commit: null
comments:
  -
    author: "CODER"
    body: "Start: replace the temporary dual-map item state representation with the pinned single-map architecture and preserve all established contracts."
events:
  -
    type: "status"
    at: "2026-09-30T16:18:11.988Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: replace the temporary dual-map item state representation with the pinned single-map architecture and preserve all established contracts."
  -
    type: "verify"
    at: "2026-09-30T16:35:43.326Z"
    author: "CODER"
    state: "ok"
    note: "Command: npm run verify. Result: pass (exit 0). Evidence: verify.log; 574 application, 109 inventory, 19 browser tests; all required coverage 100%; all static/build/docs/source/invariant/parity gates; semanticViolationCount=0. Architecture inspection and 48 focused tests passed. Doctor and policy routing passed with pre-existing warnings only. Scope: native single-map item-set state storage, distinct invalid singleton and necessary existing test consumers; broader parity remains unverified."
doc_version: 3
doc_updated_at: "2026-09-30T16:35:43.400Z"
doc_updated_by: "CODER"
description: "One architecture refactor under approved iterative parity work: replace separate item/state maps with native-style PoolItemMap entries using distinct poolitem-owned INVALID and DISABLED sentinels, preserving observable contracts."
sections:
  Summary: |-
    Unify SfxItemSet value and state storage

    One architecture refactor under approved iterative parity work: replace separate item/state maps with native-style PoolItemMap entries using distinct poolitem-owned INVALID and DISABLED sentinels, preserving observable contracts.
  Scope: "apps/office/src/svl/source/items/itemset.ts, poolitem.ts and itemset.test.ts; docs/program/parity/runtime-inventory.json and docs/program/source-provenance.json; canonical task artifacts. Replace temporary dual-map representation with one native-style map and distinct sentinels while preserving all previously verified behavior and intentional browser persistence decisions. Necessary test consumers: apps/office/src/sw/source/filter/xml/odt-roundtrip.test.ts and odt-canonical-state.test.ts replace direct access to the removed items field with poolItemMap; rejection assertions remain unchanged."
  Plan: "CODER performs one SfxItemSet storage architecture refactor. Only itemset.ts, poolitem.ts, itemset.test.ts and provenance/runtime inventory data are changed. Replace items plus itemStates with one poolItemMap mapping WhichIds to ordinary SfxPoolItem or the unique INVALID_POOL_ITEM/DISABLED_POOL_ITEM. Add the distinct native InvalidItem singleton and IsInvalidItem in poolitem.ts. Align state transitions with DisableOrInvalidateItem_ForWhichID; read states by pointer identity, preserve DEFAULT/inherited lookup and disabled Get identity, keep SET-only sorted browser entries, and copy state entries without calling null sentinel Clone. Put must filter sentinel equality before ordinary value comparison; PutSet default/false return and disabled filtering, Count, Clear, Clone and Writer CloneAsValue stay consistent with pinned sources. Add bounded sentinel and mixed-state transition/copy regression assertions, reuse existing comprehensive contracts. Verify architecture by source/AST inspection, focused tests, full npm run verify at 100%, doctor/routing, review and clean close. No validators/schemas/generators, unsupported native APIs, network, or conscious product deviations. Full verification identified two existing ODT corruption tests accessing the former private items map. Adapt those two test consumers to poolItemMap without changing their assertions, production behavior, or verification criteria; this is necessary completion of the same storage refactor."
  Verify Steps: "1. Inspect final class fields against pinned itemset.hxx/cxx: exactly one item map stores ordinary and INVALID/DISABLED item pointers; no itemStates map or compatibility layer remains. 2. Focused itemset/Writer attribute/codec tests prove distinct invalid/disabled identity, null clone/no value behavior, ordinary values replacing each state, idempotent transitions/counts, inherited states/defaults, source-style PutSet flags and return, complete same-pool state clones, SET-only cross-pool clones, and sorted SET-only browser snapshots. 3. npm run verify passes all required gates at 100% coverage. 4. ap doctor and node .agentplane/policy/check-routing.mjs pass; diff is scoped and final git status is clean."
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-09-30T16:35:43.326Z — VERIFY — ok

    By: CODER

    Note: Command: npm run verify. Result: pass (exit 0). Evidence: verify.log; 574 application, 109 inventory, 19 browser tests; all required coverage 100%; all static/build/docs/source/invariant/parity gates; semanticViolationCount=0. Architecture inspection and 48 focused tests passed. Doctor and policy routing passed with pre-existing warnings only. Scope: native single-map item-set state storage, distinct invalid singleton and necessary existing test consumers; broader parity remains unverified.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-30T16:35:42.869Z, excerpt_hash=sha256:1489fa14f4b3f4bcef88f71237adf0ef03158dbbef4f52e8a2ee2eed4b465dee

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609301617-7M8MJP/blueprint/resolved-snapshot.json
    - old_digest: 65ef22b06b037fe4799bfbcea4f42e4c7bfbcf769411d51f36718f1bfee9e7c2
    - current_digest: 65ef22b06b037fe4799bfbcea4f42e4c7bfbcf769411d51f36718f1bfee9e7c2
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202609301617-7M8MJP

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202609301617-7M8MJP
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
  Findings: |-
    - Observation: Pinned itemset.hxx defines one PoolItemMap for ordinary and INVALID/DISABLED pointers; the local implementation used separate value and state maps. Initial full verification exposed two ODT corruption tests accessing the removed private items field; diagnostics are retained in verify-before-test-consumers.log.
      Impact: The temporary representation duplicated state transitions and obscured the upstream singleton ownership and copy contracts. Sentinel trivial equality must never suppress ordinary value replacement.
      Resolution: Replaced both maps with poolItemMap and source-style DisableOrInvalidateItem_ForWhichID. Added poolitem-owned distinct INVALID_POOL_ITEM and IsInvalidItem with zero WhichId, null Clone and no value payload. Get, state lookup, Count, Clear, PutSet and full/cross-pool clones retain their verified semantics; browser entries remain sorted SET-only. Adapted only the necessary private-map test consumers with unchanged rejection assertions. AST inspection passed; 48 focused tests and 574 app coverage tests passed at 100%. Full npm run verify completed with exit 0: 574 application tests, 109 inventory tests, 19 browser tests, all required coverage metrics 100%, all build/static/docs/source/invariant/parity gates passed; semanticViolationCount=0. Doctor and routing passed with the two pre-existing doctor warnings; no whole-module semantic promotion or product deviation changes.
id_source: "generated"
---
## Summary

Unify SfxItemSet value and state storage

One architecture refactor under approved iterative parity work: replace separate item/state maps with native-style PoolItemMap entries using distinct poolitem-owned INVALID and DISABLED sentinels, preserving observable contracts.

## Scope

apps/office/src/svl/source/items/itemset.ts, poolitem.ts and itemset.test.ts; docs/program/parity/runtime-inventory.json and docs/program/source-provenance.json; canonical task artifacts. Replace temporary dual-map representation with one native-style map and distinct sentinels while preserving all previously verified behavior and intentional browser persistence decisions. Necessary test consumers: apps/office/src/sw/source/filter/xml/odt-roundtrip.test.ts and odt-canonical-state.test.ts replace direct access to the removed items field with poolItemMap; rejection assertions remain unchanged.

## Plan

CODER performs one SfxItemSet storage architecture refactor. Only itemset.ts, poolitem.ts, itemset.test.ts and provenance/runtime inventory data are changed. Replace items plus itemStates with one poolItemMap mapping WhichIds to ordinary SfxPoolItem or the unique INVALID_POOL_ITEM/DISABLED_POOL_ITEM. Add the distinct native InvalidItem singleton and IsInvalidItem in poolitem.ts. Align state transitions with DisableOrInvalidateItem_ForWhichID; read states by pointer identity, preserve DEFAULT/inherited lookup and disabled Get identity, keep SET-only sorted browser entries, and copy state entries without calling null sentinel Clone. Put must filter sentinel equality before ordinary value comparison; PutSet default/false return and disabled filtering, Count, Clear, Clone and Writer CloneAsValue stay consistent with pinned sources. Add bounded sentinel and mixed-state transition/copy regression assertions, reuse existing comprehensive contracts. Verify architecture by source/AST inspection, focused tests, full npm run verify at 100%, doctor/routing, review and clean close. No validators/schemas/generators, unsupported native APIs, network, or conscious product deviations. Full verification identified two existing ODT corruption tests accessing the former private items map. Adapt those two test consumers to poolItemMap without changing their assertions, production behavior, or verification criteria; this is necessary completion of the same storage refactor.

## Verify Steps

1. Inspect final class fields against pinned itemset.hxx/cxx: exactly one item map stores ordinary and INVALID/DISABLED item pointers; no itemStates map or compatibility layer remains. 2. Focused itemset/Writer attribute/codec tests prove distinct invalid/disabled identity, null clone/no value behavior, ordinary values replacing each state, idempotent transitions/counts, inherited states/defaults, source-style PutSet flags and return, complete same-pool state clones, SET-only cross-pool clones, and sorted SET-only browser snapshots. 3. npm run verify passes all required gates at 100% coverage. 4. ap doctor and node .agentplane/policy/check-routing.mjs pass; diff is scoped and final git status is clean.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-09-30T16:35:43.326Z — VERIFY — ok

By: CODER

Note: Command: npm run verify. Result: pass (exit 0). Evidence: verify.log; 574 application, 109 inventory, 19 browser tests; all required coverage 100%; all static/build/docs/source/invariant/parity gates; semanticViolationCount=0. Architecture inspection and 48 focused tests passed. Doctor and policy routing passed with pre-existing warnings only. Scope: native single-map item-set state storage, distinct invalid singleton and necessary existing test consumers; broader parity remains unverified.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-30T16:35:42.869Z, excerpt_hash=sha256:1489fa14f4b3f4bcef88f71237adf0ef03158dbbef4f52e8a2ee2eed4b465dee

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609301617-7M8MJP/blueprint/resolved-snapshot.json
- old_digest: 65ef22b06b037fe4799bfbcea4f42e4c7bfbcf769411d51f36718f1bfee9e7c2
- current_digest: 65ef22b06b037fe4799bfbcea4f42e4c7bfbcf769411d51f36718f1bfee9e7c2
- route_changed: no
- safe_command: agentplane blueprint snapshot 202609301617-7M8MJP

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202609301617-7M8MJP
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

- Observation: Pinned itemset.hxx defines one PoolItemMap for ordinary and INVALID/DISABLED pointers; the local implementation used separate value and state maps. Initial full verification exposed two ODT corruption tests accessing the removed private items field; diagnostics are retained in verify-before-test-consumers.log.
  Impact: The temporary representation duplicated state transitions and obscured the upstream singleton ownership and copy contracts. Sentinel trivial equality must never suppress ordinary value replacement.
  Resolution: Replaced both maps with poolItemMap and source-style DisableOrInvalidateItem_ForWhichID. Added poolitem-owned distinct INVALID_POOL_ITEM and IsInvalidItem with zero WhichId, null Clone and no value payload. Get, state lookup, Count, Clear, PutSet and full/cross-pool clones retain their verified semantics; browser entries remain sorted SET-only. Adapted only the necessary private-map test consumers with unchanged rejection assertions. AST inspection passed; 48 focused tests and 574 app coverage tests passed at 100%. Full npm run verify completed with exit 0: 574 application tests, 109 inventory tests, 19 browser tests, all required coverage metrics 100%, all build/static/docs/source/invariant/parity gates passed; semanticViolationCount=0. Doctor and routing passed with the two pre-existing doctor warnings; no whole-module semantic promotion or product deviation changes.
