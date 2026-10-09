---
id: "202610090803-7PRR3B"
title: "Handle native frame attribute change invalidation"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 10
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-09T08:11:07.425Z"
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
    body: "Start: Restore approved native attribute callbacks on original detached table frames; preserve silent claims and typed history, test upstream-absent and retain explicit root/UI integration gaps."
events:
  -
    type: "status"
    at: "2026-10-09T08:04:23.877Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: Restore approved native attribute callbacks on original detached table frames; preserve silent claims and typed history, test upstream-absent and retain explicit root/UI integration gaps."
doc_version: 3
doc_updated_at: "2026-10-09T08:27:21.173Z"
doc_updated_by: "CODER"
description: "Iteration250 under C9TN6M: restore original SwFrame attribute delta dispatch and row size/cell vertical orientation invalidation from pinned LibreOffice, preserving silent shared claims. This required physical-frame callback replaces inherited no-op behavior before persistent page/root/UI frame integration."
sections:
  Summary: "Restore missing native physical-frame attribute notification processing before persistent UI layout integration."
  Scope: "Writer only: sw/source/core/layout/wsfrm.ts, tabfrm.ts, sw/inc/hints.ts, calbck.ts and swtypes.ts; new native attribute-frame tests and related ownership/history tests if required; matching canonical Writer registry records; leaf evidence and append-only parent Findings. LegacyModifyHint and PrepareHint stay in their corresponding native owners calbck.hxx and swtypes.hxx. Existing recovery/open/save/settings deviations unchanged. No network, dependency setup task, source copies or scripts under AgentPlane."
  Plan: "1. Restore represented original SwFrame attribute-delta dispatch, accumulated native flags and next-sibling effects; row OnFrameSize priority and empty-lower cell vertical-orientation invalidation. Implement borrowed LegacyModifyHint in calbck.ts with type-only hint union import, and represented PrepareHint in swtypes.ts, matching native ownership. No synthetic document/UI signal. Preserve original registrations, silent claims and history. 2. Add independent literal native state/order tests for direct, locked, no-op, reset and parent-filtered changes, borrowed hints, transactions, row size/split priority, cell orientation and sibling effects. Update matching canonical runtime/provenance records, retaining unverified wider behaviors. 3. Run only new/related tests upstream-absent with actual all-four100 coverage; retain raw failures, reuse prior coverage only with full source or declaration/body/location proofs. Run declared scoped statics/build and registry/source/routing/doctor gates, restore symlink finally, record bounded evidence and explicitly non-independent evaluator, commit and finish leaf. Full247 remains last full; no full250. Persistent root/page/UI physical integration remains next work."
  Verify Steps: |-
    1. Verify pinned9bc445578031fecf56086729d8e4940c77e14d65 wsfrm.cxx SwClientNotify/UpdateAttrFrame, tabfrm.cxx row OnFrameSize/SwClientNotify and cell vertical orientation; tests assert literal original client state and hint ordering without invoking upstream.
    2. Run only new+related Writer tests with actual current changed-module V8 all-four100. Preserve raw failures and partial reports; carry old coverage only with complete unchanged source or declaration/body/enclosing-branch/location proof. Do not replay unchanged passing cases or lower thresholds. Last full247; no full250.
    3. Run scoped Prettier/ESLint, typecheck, dependency/JSDoc/file-size and static build while upstream absent, restore in finally. Then canonical registry build/scoped+global gates, source-provenance/tree/routing and AP doctor pass. Exact original native pin/tree remains clean.
    4. Record bounded hashes/counts/identifiers only as task evidence; explicitly non-independent same-agent evaluator. Commit scoped implementation, close leaf with semantic implementation SHA, verify final Writer clean state. Parent/broad goal remains active.
  Verification: "Command: targeted upstream-absent Writer Vitest profile, exact source-bound coverage certificate, scoped format/lint/type/dependency/JSDoc/size/static build, canonical registry/source/routing/doctor gates. Result: pass. Evidence: evidence/verification.json and evidence/coverage.json.164 unique cases passed,0 failed across24 files including12 fresh; no unchanged passing replay. Changed5 modules all-four100:379lines427statements113functions224branches. Three fresh complete maps plus exact old-source reconstruction and every unchanged declaration/body/enclosing-branch/location for calbck/hints; application318 files preserves313 whole identical sources. Raw focused CLI threshold exit and scaffolding/doc/registry failures retained in ignored cache. Source/provenance/Writer/global registry gates passed. Upstream absent during tests/build, restored finally; native pin/tree clean. Scope: represented detached frame callbacks only; broader page/root/UI/content/follows/item-family parity remains unverified. Last full247; no full250."
  Rollback Plan: "Normal revert of this leaf implementation if requested; no history reset, dependency/source checkout changes, or merge."
  Findings: |-
    Read-only audit confirms physical frames inherit a no-op for AttrSetChangeHint, unlike pinned native SwFrame. Row source prioritizes RES_FRM_SIZE over RES_ROW_SPLIT and forwards only that item through OnFrameSize; cell source requests complete paint and invalidates print area for represented orientation over empty native lowers. Persistent native page/root propagation, geometry/content/follows/RTL/collapsed-border branches and full UI integration remain unverified.

    - Observation: Original frame clients now process represented native attribute hints rather than inheriting a no-op. Runtime registry requires bare declared method names; provenance requires actual source text markers.
      Impact: Correct native size/print/position/paint ordering and exact borrowed row item priority are restored, with explicit wider integration gaps.
      Resolution: Verified164 cases including12 fresh and source-bound all-four100; ten canonical records preserve prior statuses/defaults/classes/evidence. Initial registry marker and comment-only JSDoc issues repaired without weakening gates. Same-agent evaluator is non-independent; persistent page/root/UI hierarchy remains next work.
id_source: "generated"
---
## Summary

Restore missing native physical-frame attribute notification processing before persistent UI layout integration.

## Scope

Writer only: sw/source/core/layout/wsfrm.ts, tabfrm.ts, sw/inc/hints.ts, calbck.ts and swtypes.ts; new native attribute-frame tests and related ownership/history tests if required; matching canonical Writer registry records; leaf evidence and append-only parent Findings. LegacyModifyHint and PrepareHint stay in their corresponding native owners calbck.hxx and swtypes.hxx. Existing recovery/open/save/settings deviations unchanged. No network, dependency setup task, source copies or scripts under AgentPlane.

## Plan

1. Restore represented original SwFrame attribute-delta dispatch, accumulated native flags and next-sibling effects; row OnFrameSize priority and empty-lower cell vertical-orientation invalidation. Implement borrowed LegacyModifyHint in calbck.ts with type-only hint union import, and represented PrepareHint in swtypes.ts, matching native ownership. No synthetic document/UI signal. Preserve original registrations, silent claims and history. 2. Add independent literal native state/order tests for direct, locked, no-op, reset and parent-filtered changes, borrowed hints, transactions, row size/split priority, cell orientation and sibling effects. Update matching canonical runtime/provenance records, retaining unverified wider behaviors. 3. Run only new/related tests upstream-absent with actual all-four100 coverage; retain raw failures, reuse prior coverage only with full source or declaration/body/location proofs. Run declared scoped statics/build and registry/source/routing/doctor gates, restore symlink finally, record bounded evidence and explicitly non-independent evaluator, commit and finish leaf. Full247 remains last full; no full250. Persistent root/page/UI physical integration remains next work.

## Verify Steps

1. Verify pinned9bc445578031fecf56086729d8e4940c77e14d65 wsfrm.cxx SwClientNotify/UpdateAttrFrame, tabfrm.cxx row OnFrameSize/SwClientNotify and cell vertical orientation; tests assert literal original client state and hint ordering without invoking upstream.
2. Run only new+related Writer tests with actual current changed-module V8 all-four100. Preserve raw failures and partial reports; carry old coverage only with complete unchanged source or declaration/body/enclosing-branch/location proof. Do not replay unchanged passing cases or lower thresholds. Last full247; no full250.
3. Run scoped Prettier/ESLint, typecheck, dependency/JSDoc/file-size and static build while upstream absent, restore in finally. Then canonical registry build/scoped+global gates, source-provenance/tree/routing and AP doctor pass. Exact original native pin/tree remains clean.
4. Record bounded hashes/counts/identifiers only as task evidence; explicitly non-independent same-agent evaluator. Commit scoped implementation, close leaf with semantic implementation SHA, verify final Writer clean state. Parent/broad goal remains active.

## Verification

Command: targeted upstream-absent Writer Vitest profile, exact source-bound coverage certificate, scoped format/lint/type/dependency/JSDoc/size/static build, canonical registry/source/routing/doctor gates. Result: pass. Evidence: evidence/verification.json and evidence/coverage.json.164 unique cases passed,0 failed across24 files including12 fresh; no unchanged passing replay. Changed5 modules all-four100:379lines427statements113functions224branches. Three fresh complete maps plus exact old-source reconstruction and every unchanged declaration/body/enclosing-branch/location for calbck/hints; application318 files preserves313 whole identical sources. Raw focused CLI threshold exit and scaffolding/doc/registry failures retained in ignored cache. Source/provenance/Writer/global registry gates passed. Upstream absent during tests/build, restored finally; native pin/tree clean. Scope: represented detached frame callbacks only; broader page/root/UI/content/follows/item-family parity remains unverified. Last full247; no full250.

## Rollback Plan

Normal revert of this leaf implementation if requested; no history reset, dependency/source checkout changes, or merge.

## Findings

Read-only audit confirms physical frames inherit a no-op for AttrSetChangeHint, unlike pinned native SwFrame. Row source prioritizes RES_FRM_SIZE over RES_ROW_SPLIT and forwards only that item through OnFrameSize; cell source requests complete paint and invalidates print area for represented orientation over empty native lowers. Persistent native page/root propagation, geometry/content/follows/RTL/collapsed-border branches and full UI integration remain unverified.

- Observation: Original frame clients now process represented native attribute hints rather than inheriting a no-op. Runtime registry requires bare declared method names; provenance requires actual source text markers.
  Impact: Correct native size/print/position/paint ordering and exact borrowed row item priority are restored, with explicit wider integration gaps.
  Resolution: Verified164 cases including12 fresh and source-bound all-four100; ten canonical records preserve prior statuses/defaults/classes/evidence. Initial registry marker and comment-only JSDoc issues repaired without weakening gates. Same-agent evaluator is non-independent; persistent page/root/UI hierarchy remains next work.
