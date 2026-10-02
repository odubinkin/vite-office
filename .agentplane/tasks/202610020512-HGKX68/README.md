---
id: "202610020512-HGKX68"
title: "Restore protected number-tree root access"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 5
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-02T05:15:24.589Z"
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
    body: "Start: Restore native protected GetRoot access, preserve list membership via public parents and adapt only test diagnostics; eleven semantic paths, no public surrogate or upstream/helper artifact sources."
events:
  -
    type: "status"
    at: "2026-10-02T05:15:25.538Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: Restore native protected GetRoot access, preserve list membership via public parents and adapt only test diagnostics; eleven semantic paths, no public surrogate or upstream/helper artifact sources."
doc_version: 3
doc_updated_at: "2026-10-02T05:15:25.538Z"
doc_updated_by: "CODER"
description: "Iteration52: restore native protected GetRoot access; adapt the existing browser SwList item lookup to public parent ownership links without an exported surrogate. Preserve all diagnostic assertion values through a test-only protected-method helper and cover owned/foreign/orphan/phantom root identity and visibility. No helper/native sources in Agentplane artifacts or upstream access in tests; full gates remain unchanged."
sections:
  Summary: "Iteration52 restores native protected GetRoot access while preserving existing list lookup and diagnostic root assertions."
  Scope: |-
    Eleven semantic paths:
    - apps/office/src/sw/source/core/SwNumberTree/SwNumberTree.ts
    - apps/office/src/sw/source/core/doc/list.ts
    - Existing tree tests: SwNumberTree.test.ts, SwNumberTree-lifecycle.test.ts, SwNumberTree-policy.test.ts, SwNumberTree-contract.test.ts, SwNumberTree-removal.test.ts, SwNumberTree-vector.test.ts
    - New apps/office/src/sw/source/core/SwNumberTree/SwNumberTree-root.test.ts
    - docs/program/source-provenance.json
    - docs/program/parity/runtime-inventory.json
    Test filenames above are relative to the SwNumberTree directory. Active leaf/parent task bookkeeping only. No public surrogate, state/ownership behavior change, registered IO/recovery deviation or gate/status promotion.
  Plan: "Restore protected root access and reconcile one existing browser list getter via public parent ownership links. Eleven semantic paths specified in Scope: two implementations, six diagnostic test adaptations, one new root test and two bounded metadata files. Preserve all assertion values/root ownership and registered deviations; no public surrogate, native/helper source artifacts or upstream test access. RED type proof, actual owner regressions, focused vendor-absent/full unchanged gates and both100% coverage; actual implementation commit, canonical verify, separate same-actor quality and leaf close, wider goal open."
  Verify Steps: |-
    1. Pin9bc445578031fecf56086729d8e4940c77e14d65 and fresh GetRoot/GetParent declarations and GetRoot body prove protected zero-argument nullable-root contract and public parent access. Native SwList source has shown root/range ownership and no GetListItem accessor; browser getter remains a bounded projection, no claimed full native range/redline/lifetime parity.
    2. Baseline public-access type assertion fails; final protected access with exact zero-argument/nullable return compiles. Existing assertion values unchanged across six diagnostic files. Real connected documents verify root identity, null for root/orphan, skipped phantom ancestors, matching list membership, missing/foreign/different-document rejection and retained record movement across lists. No runtime implementation consumer calls or casts GetRoot externally, no public surrogate added, getters leave counters/cache untouched.
    3. All focused tree/list suites pass with vendor directory unavailable and restored in finally; full unchanged npm run verify passes all gates and both100% coverages. Metadata changes remain bounded to tree/list evidence/responsibilities, no status/deviation/coverage/exclusion promotions. Exact eleven semantic paths plus active task bookkeeping; native/helper source artifacts absent. Routing and doctor show no new errors.
    4. Actual implementation SHA, canonical verification and separate same-actor quality evidence are recorded. Leaf DONE with clean checkout; broader parent/full goal and other measured existing-contract gaps remain open.
  Verification: "Pending execution."
  Rollback Plan: "Revert the implementation commit if required; retain result/hash evidence and source-artifact prohibition."
  Findings: "Current native SwNumberTree.hxx:349 declares protected GetRoot, while local method is public. SwNodeNum does not re-export it. One external implementation consumer is the existing browser SwList.GetListItem; six tree diagnostic test files also call it. Root behavior already matches and must remain unchanged. Prior iteration51 completion is concrete progress."
id_source: "generated"
---
## Summary

Iteration52 restores native protected GetRoot access while preserving existing list lookup and diagnostic root assertions.

## Scope

Eleven semantic paths:
- apps/office/src/sw/source/core/SwNumberTree/SwNumberTree.ts
- apps/office/src/sw/source/core/doc/list.ts
- Existing tree tests: SwNumberTree.test.ts, SwNumberTree-lifecycle.test.ts, SwNumberTree-policy.test.ts, SwNumberTree-contract.test.ts, SwNumberTree-removal.test.ts, SwNumberTree-vector.test.ts
- New apps/office/src/sw/source/core/SwNumberTree/SwNumberTree-root.test.ts
- docs/program/source-provenance.json
- docs/program/parity/runtime-inventory.json
Test filenames above are relative to the SwNumberTree directory. Active leaf/parent task bookkeeping only. No public surrogate, state/ownership behavior change, registered IO/recovery deviation or gate/status promotion.

## Plan

Restore protected root access and reconcile one existing browser list getter via public parent ownership links. Eleven semantic paths specified in Scope: two implementations, six diagnostic test adaptations, one new root test and two bounded metadata files. Preserve all assertion values/root ownership and registered deviations; no public surrogate, native/helper source artifacts or upstream test access. RED type proof, actual owner regressions, focused vendor-absent/full unchanged gates and both100% coverage; actual implementation commit, canonical verify, separate same-actor quality and leaf close, wider goal open.

## Verify Steps

1. Pin9bc445578031fecf56086729d8e4940c77e14d65 and fresh GetRoot/GetParent declarations and GetRoot body prove protected zero-argument nullable-root contract and public parent access. Native SwList source has shown root/range ownership and no GetListItem accessor; browser getter remains a bounded projection, no claimed full native range/redline/lifetime parity.
2. Baseline public-access type assertion fails; final protected access with exact zero-argument/nullable return compiles. Existing assertion values unchanged across six diagnostic files. Real connected documents verify root identity, null for root/orphan, skipped phantom ancestors, matching list membership, missing/foreign/different-document rejection and retained record movement across lists. No runtime implementation consumer calls or casts GetRoot externally, no public surrogate added, getters leave counters/cache untouched.
3. All focused tree/list suites pass with vendor directory unavailable and restored in finally; full unchanged npm run verify passes all gates and both100% coverages. Metadata changes remain bounded to tree/list evidence/responsibilities, no status/deviation/coverage/exclusion promotions. Exact eleven semantic paths plus active task bookkeeping; native/helper source artifacts absent. Routing and doctor show no new errors.
4. Actual implementation SHA, canonical verification and separate same-actor quality evidence are recorded. Leaf DONE with clean checkout; broader parent/full goal and other measured existing-contract gaps remain open.

## Verification

Pending execution.

## Rollback Plan

Revert the implementation commit if required; retain result/hash evidence and source-artifact prohibition.

## Findings

Current native SwNumberTree.hxx:349 declares protected GetRoot, while local method is public. SwNodeNum does not re-export it. One external implementation consumer is the existing browser SwList.GetListItem; six tree diagnostic test files also call it. Root behavior already matches and must remain unchanged. Prior iteration51 completion is concrete progress.
