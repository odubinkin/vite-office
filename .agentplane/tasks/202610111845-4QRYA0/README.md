---
id: "202610111845-4QRYA0"
title: "Resolve native line-margin frames through original content-node queries"
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
  updated_at: "2026-10-11T18:46:17.213Z"
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
    body: "Start: implement approved original native margin frame queries, explicit temporary source-freshness guard, focused new tests and canonical evidence in clean writer."
events:
  -
    type: "status"
    at: "2026-10-11T18:46:18.477Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implement approved original native margin frame queries, explicit temporary source-freshness guard, focused new tests and canonical evidence in clean writer."
doc_version: 3
doc_updated_at: "2026-10-11T18:46:18.477Z"
doc_updated_by: "CODER"
description: "Replace SwCursor margin frame selection from the UI measured-frame registry with original SwContentNode.getLayoutFrame(layout,point). Retain only an explicit temporary source-freshness admission guard while native Calc/formatter invalidation is unported; actual formatted native clients work without UI publication. Preserve native temporary PaM/model-view comparison and verify original follow/root ownership plus mounted editing/history."
sections:
  Summary: "Resolve native line margins through the original node's registered frame query with the actual native point; remove the measured registry from frame selection. Already formatted native clients work without UI publication."
  Scope: "Two production paths: apps/office/src/sw/source/core/crsr/swcrsr.ts and sw/source/core/layout/newfrm.ts. Fresh core/crsr/native-margin-frame-query.test.ts and browser/editor/native-margin-frame-query.test.tsx. Four append-only runtime/provenance records for swcrsr.ts/newfrm.ts plus current task and parent documentation. Existing browser tests cover repeated movement/body/cell/history. All old acceptance files stay byte-identical. No source-tree/schema/provider/test gate edits, no registered IO/recovery deviations."
  Plan: "Query actual native registered content frames from the original cursor point; retain only explicitly temporary device source-freshness admission while native Calc/formatter invalidation is unported. Preserve literal source mapped-position comparison, old acceptance bytes and canonical history; scoped whole-module100/actual UI/browser checks, exact same-agent review, clean writer. No full checkpoint at correction4; human pause after next full and repairs."
  Verify Steps: |-
    1. Read pinned swcrsr.cxx LeftRightMargin/IsAtLeftRightMargin, docnode getLayoutFrame and original query contracts. Native view-position Calc/bidi/save-state/selection-overlap and full nontext/merged behavior remain pending; no unsupported full-native claim.
    2. Physically hide all three LO/mdds/ICU reference links and restore in finally. Run new/related Vitest with complete two-production-module Istanbul100, fresh mounted tests and relevant Chromium native-line-margin/native-margin-admission/native-frame follow/reuse paths; all existing acceptance bytes remain identical. Run format/lint/TS7/JSDoc/file-size/dependencies/build/static and relevant tooling. Never edit source/tests/references while producer live; no full checkpoint at correction4.
    3. Validate original raw IDs/locations/nonnegative integer counters, positive complete counters and all-four100 with exact current execution hashes. Preserve canonical histories/status/default/classification/responsibility prefixes, pin/link targets, all unrelated non-AgentPlane paths and no upstream/helpers/Python/raw reports in AgentPlane.
    4. After refs restore run source-tree/provenance/registry/resource-generation-only/invariants/parity/routing/doctor/diff metadata checks. Record exact argv, scoped results and residual temporary boundary guard honestly. Same-agent non-independent evaluator must bind exact semantic SHA, finish clean writer. Goalactive correction4/10; pause after next accepted full run and required repairs.
  Verification: "Pending actual implementation and source-bound upstream-absent verification; no completion claim."
  Rollback Plan: "Revert only the scoped semantic commit and its tests/canonical notes; preserve prior history and registered deviations."
  Findings: "Previous goal turn completed A06D5E with authoritative code/inventory/tests/evidence and clean writer; this is progress. Current source shows native margins use content-node.getLayoutFrame(layout,point,view-position/Calc), while the port selects through the UI registry. Full native query geometry/Calc invalidation is not represented, so the existing stale-text admission must remain explicitly at the device boundary until its native replacement. The new guard selects no frame and admits actual native formatting without a measured publication. No detached TextRuns/model/query copies or full parity promotion."
id_source: "generated"
---
## Summary

Resolve native line margins through the original node's registered frame query with the actual native point; remove the measured registry from frame selection. Already formatted native clients work without UI publication.

## Scope

Two production paths: apps/office/src/sw/source/core/crsr/swcrsr.ts and sw/source/core/layout/newfrm.ts. Fresh core/crsr/native-margin-frame-query.test.ts and browser/editor/native-margin-frame-query.test.tsx. Four append-only runtime/provenance records for swcrsr.ts/newfrm.ts plus current task and parent documentation. Existing browser tests cover repeated movement/body/cell/history. All old acceptance files stay byte-identical. No source-tree/schema/provider/test gate edits, no registered IO/recovery deviations.

## Plan

Query actual native registered content frames from the original cursor point; retain only explicitly temporary device source-freshness admission while native Calc/formatter invalidation is unported. Preserve literal source mapped-position comparison, old acceptance bytes and canonical history; scoped whole-module100/actual UI/browser checks, exact same-agent review, clean writer. No full checkpoint at correction4; human pause after next full and repairs.

## Verify Steps

1. Read pinned swcrsr.cxx LeftRightMargin/IsAtLeftRightMargin, docnode getLayoutFrame and original query contracts. Native view-position Calc/bidi/save-state/selection-overlap and full nontext/merged behavior remain pending; no unsupported full-native claim.
2. Physically hide all three LO/mdds/ICU reference links and restore in finally. Run new/related Vitest with complete two-production-module Istanbul100, fresh mounted tests and relevant Chromium native-line-margin/native-margin-admission/native-frame follow/reuse paths; all existing acceptance bytes remain identical. Run format/lint/TS7/JSDoc/file-size/dependencies/build/static and relevant tooling. Never edit source/tests/references while producer live; no full checkpoint at correction4.
3. Validate original raw IDs/locations/nonnegative integer counters, positive complete counters and all-four100 with exact current execution hashes. Preserve canonical histories/status/default/classification/responsibility prefixes, pin/link targets, all unrelated non-AgentPlane paths and no upstream/helpers/Python/raw reports in AgentPlane.
4. After refs restore run source-tree/provenance/registry/resource-generation-only/invariants/parity/routing/doctor/diff metadata checks. Record exact argv, scoped results and residual temporary boundary guard honestly. Same-agent non-independent evaluator must bind exact semantic SHA, finish clean writer. Goalactive correction4/10; pause after next accepted full run and required repairs.

## Verification

Pending actual implementation and source-bound upstream-absent verification; no completion claim.

## Rollback Plan

Revert only the scoped semantic commit and its tests/canonical notes; preserve prior history and registered deviations.

## Findings

Previous goal turn completed A06D5E with authoritative code/inventory/tests/evidence and clean writer; this is progress. Current source shows native margins use content-node.getLayoutFrame(layout,point,view-position/Calc), while the port selects through the UI registry. Full native query geometry/Calc invalidation is not represented, so the existing stale-text admission must remain explicitly at the device boundary until its native replacement. The new guard selects no frame and admits actual native formatting without a measured publication. No detached TextRuns/model/query copies or full parity promotion.
