---
id: "202610090803-7PRR3B"
title: "Handle native frame attribute change invalidation"
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
  updated_at: "2026-10-09T08:04:22.461Z"
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
doc_updated_at: "2026-10-09T08:04:23.877Z"
doc_updated_by: "CODER"
description: "Iteration250 under C9TN6M: restore original SwFrame attribute delta dispatch and row size/cell vertical orientation invalidation from pinned LibreOffice, preserving silent shared claims. This required physical-frame callback replaces inherited no-op behavior before persistent page/root/UI frame integration."
sections:
  Summary: "Restore missing native physical-frame attribute notification processing before persistent UI layout integration."
  Scope: "Writer only: sw/source/core/layout/wsfrm.ts, tabfrm.ts, sw/inc/hints.ts; new native attribute-frame tests and related ownership/history tests if required; matching canonical Writer registry records; leaf evidence and append-only parent Findings. Existing recovery/open/save/settings deviations unchanged. No network, dependency setup task, source copies or scripts under AgentPlane."
  Plan: "1. CODER ports represented native SwFrame original attribute-delta dispatch, accumulated invalidation flags and next-sibling effects; row OnFrameSize priority and cell vertical-orientation handling over detached original clients. Add borrowed LegacyModifyHint only for the native row forwarding contract, not a synthetic document/UI signal. Preserve direct claims, history, registrations and existing unsupported layouts. 2. Independently test direct format changes, locked/no-op/reset/parent deltas, original hints, shared claims, row size-vs-split priority, cell orientation, sibling invalidation and actual history. Update matching canonical Writer provenance/runtime/invariant records with bounded evidence. 3. Once upstream absent run new/related Writer tests plus actual current changed-module all-four100 V8 coverage, source-bound unchanged certificate transfers only after complete hash/body/map proofs. Run scoped format/lint/type/dependency/JSDoc/size/build; restore symlink in finally; check canonical registry/source/routing/doctor. Record same-agent non-independent evaluator and commit/finish leaf only. Persistent native root/page/table hierarchy and UI callback integration stay next work; no broad parity promotion or full250."
  Verify Steps: |-
    1. Verify pinned9bc445578031fecf56086729d8e4940c77e14d65 wsfrm.cxx SwClientNotify/UpdateAttrFrame, tabfrm.cxx row OnFrameSize/SwClientNotify and cell vertical orientation; tests assert literal original client state and hint ordering without invoking upstream.
    2. Run only new+related Writer tests with actual current changed-module V8 all-four100. Preserve raw failures and partial reports; carry old coverage only with complete unchanged source or declaration/body/enclosing-branch/location proof. Do not replay unchanged passing cases or lower thresholds. Last full247; no full250.
    3. Run scoped Prettier/ESLint, typecheck, dependency/JSDoc/file-size and static build while upstream absent, restore in finally. Then canonical registry build/scoped+global gates, source-provenance/tree/routing and AP doctor pass. Exact original native pin/tree remains clean.
    4. Record bounded hashes/counts/identifiers only as task evidence; explicitly non-independent same-agent evaluator. Commit scoped implementation, close leaf with semantic implementation SHA, verify final Writer clean state. Parent/broad goal remains active.
  Verification: "Pending native implementation and measured checks."
  Rollback Plan: "Normal revert of this leaf implementation if requested; no history reset, dependency/source checkout changes, or merge."
  Findings: "Read-only audit confirms physical frames inherit a no-op for AttrSetChangeHint, unlike pinned native SwFrame. Row source prioritizes RES_FRM_SIZE over RES_ROW_SPLIT and forwards only that item through OnFrameSize; cell source requests complete paint and invalidates print area for represented orientation over empty native lowers. Persistent native page/root propagation, geometry/content/follows/RTL/collapsed-border branches and full UI integration remain unverified."
id_source: "generated"
---
## Summary

Restore missing native physical-frame attribute notification processing before persistent UI layout integration.

## Scope

Writer only: sw/source/core/layout/wsfrm.ts, tabfrm.ts, sw/inc/hints.ts; new native attribute-frame tests and related ownership/history tests if required; matching canonical Writer registry records; leaf evidence and append-only parent Findings. Existing recovery/open/save/settings deviations unchanged. No network, dependency setup task, source copies or scripts under AgentPlane.

## Plan

1. CODER ports represented native SwFrame original attribute-delta dispatch, accumulated invalidation flags and next-sibling effects; row OnFrameSize priority and cell vertical-orientation handling over detached original clients. Add borrowed LegacyModifyHint only for the native row forwarding contract, not a synthetic document/UI signal. Preserve direct claims, history, registrations and existing unsupported layouts. 2. Independently test direct format changes, locked/no-op/reset/parent deltas, original hints, shared claims, row size-vs-split priority, cell orientation, sibling invalidation and actual history. Update matching canonical Writer provenance/runtime/invariant records with bounded evidence. 3. Once upstream absent run new/related Writer tests plus actual current changed-module all-four100 V8 coverage, source-bound unchanged certificate transfers only after complete hash/body/map proofs. Run scoped format/lint/type/dependency/JSDoc/size/build; restore symlink in finally; check canonical registry/source/routing/doctor. Record same-agent non-independent evaluator and commit/finish leaf only. Persistent native root/page/table hierarchy and UI callback integration stay next work; no broad parity promotion or full250.

## Verify Steps

1. Verify pinned9bc445578031fecf56086729d8e4940c77e14d65 wsfrm.cxx SwClientNotify/UpdateAttrFrame, tabfrm.cxx row OnFrameSize/SwClientNotify and cell vertical orientation; tests assert literal original client state and hint ordering without invoking upstream.
2. Run only new+related Writer tests with actual current changed-module V8 all-four100. Preserve raw failures and partial reports; carry old coverage only with complete unchanged source or declaration/body/enclosing-branch/location proof. Do not replay unchanged passing cases or lower thresholds. Last full247; no full250.
3. Run scoped Prettier/ESLint, typecheck, dependency/JSDoc/file-size and static build while upstream absent, restore in finally. Then canonical registry build/scoped+global gates, source-provenance/tree/routing and AP doctor pass. Exact original native pin/tree remains clean.
4. Record bounded hashes/counts/identifiers only as task evidence; explicitly non-independent same-agent evaluator. Commit scoped implementation, close leaf with semantic implementation SHA, verify final Writer clean state. Parent/broad goal remains active.

## Verification

Pending native implementation and measured checks.

## Rollback Plan

Normal revert of this leaf implementation if requested; no history reset, dependency/source checkout changes, or merge.

## Findings

Read-only audit confirms physical frames inherit a no-op for AttrSetChangeHint, unlike pinned native SwFrame. Row source prioritizes RES_FRM_SIZE over RES_ROW_SPLIT and forwards only that item through OnFrameSize; cell source requests complete paint and invalidates print area for represented orientation over empty native lowers. Persistent native page/root propagation, geometry/content/follows/RTL/collapsed-border branches and full UI integration remain unverified.
