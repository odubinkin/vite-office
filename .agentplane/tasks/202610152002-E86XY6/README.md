---
id: "202610152002-E86XY6"
title: "Implement shared indexed style-sheet collection for Calc pool"
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
  updated_at: "2026-10-15T20:02:38.012Z"
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
    body: "Start: implement the actual native style index dependency, all9 original QA scenarios and reindex/Clear contracts using JS object references without a fake pool or lifetime engine."
events:
  -
    type: "status"
    at: "2026-10-15T20:02:39.236Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implement the actual native style index dependency, all9 original QA scenarios and reindex/Clear contracts using JS object references without a fake pool or lifetime engine."
doc_version: 3
doc_updated_at: "2026-10-15T20:02:39.236Z"
doc_updated_by: "CODER"
description: "Task168: implement source IndexedStyleSheets complete collection/index/predicate/callback contract as the eager dependency of real SfxStyleSheetBasePool. Preserve original observable stale-family Clear behavior; use JS references and exact UTF16 keys without a lifetime engine or fake stylesheet/pool classes."
sections:
  Summary: "Task168 implements the genuine IndexedStyleSheets collection created eagerly by SfxStyleSheetBasePool_Impl, a required ScStyleSheetPool/ScPoolHelper document dependency. No stylesheet/pool/provider placeholder is constructed."
  Scope: "New svl/inc/IndexedStyleSheets.ts, svl/source/items/IndexedStyleSheets.ts, native-indexed-style-sheets.test.ts; erased borrowed name/family contract in existing svl/inc/style.ts. Associated exact shared runtime/provenance/capability records and original style-family records as needed; calc-ui-readiness.md and calc-upstream-suspected-issues.md; focused shared browser collection scenario and source-backed guard edge only if necessary. Up to18 non-task paths. No fake SfxStyleSheetBase/Pool class, UNO provider, custom refcount/memory manager, native compiler/probe or full-suite milestone claim."
  Plan: "1. Port complete original index/vector/family, query/predicate/callback, reindex/name-change and Clear contracts with JS object identity and UTF16 Map multivalues. Keep public native paths and all six family mappings; C++ references/virtual callback protocols bind to erased TS contracts. 2. Port all9 native indexed collection QA scenarios with native-style test caller witnesses, preserving unspecified unordered duplicate result ordering instead of claiming cross-stdlib selection. 3. Add meaningful reindex, unknown/negative position, nth/end/not-found, callback order/state, exact nul/surrogate/case and stale-family Clear tests. Record CALC146 suspicious family-index state without repairing it; preserve GetStyleSheetByPosition negative at() bounds failure. 4. Verify exact new shared executable owner raw100 and all33Calc raw100, related shared/Writer tests and13source gates; build and actual Chromium index acceptance. 5. Native source pins and truthful inventory, source commit and same-agent evaluator closure. Full actual stylesheet/pool/document/UI/ODS remain pending."
  Verify Steps: "Audit pinned include/svl/IndexedStyleSheets.hxx, svl/source/items/IndexedStyleSheets.cxx, include/svl/style.hxx, svl/source/items/style.cxx and svl/qa/unit/items/test_IndexedStyleSheets.cxx. Directly port all9 native fixture contracts. Test duplicate identities/names, every valid family, index snapshots/live family views, explicit reindex/name-change, predicate defaults/ReturnFirst, nth starting position/miss/negative n, exact missing-position error, native negative bounds failure, callback order and partial null slot visibility during Clear. Preserve family index omission; observe only externally held valid caller objects, not native dangling references. Tests/build/Chromium with4native reference links absent/restored, exact1shared owner raw positive S/B/F/L100 and33Calc raw100; related Writer regression. All13source gates incl inventory/provenance/routing/43boundaries. No native compilation or new ownership mechanism; record same-agent evaluator review and clean final state."
  Verification: "Pending implementation and acceptance."
  Rollback Plan: "Revert only task168 intentional source/tests/registry/docs changes via follow-up task; preserve shared string pool and unrelated task histories. No merges or history reset."
  Findings: ""
id_source: "generated"
---
## Summary

Task168 implements the genuine IndexedStyleSheets collection created eagerly by SfxStyleSheetBasePool_Impl, a required ScStyleSheetPool/ScPoolHelper document dependency. No stylesheet/pool/provider placeholder is constructed.

## Scope

New svl/inc/IndexedStyleSheets.ts, svl/source/items/IndexedStyleSheets.ts, native-indexed-style-sheets.test.ts; erased borrowed name/family contract in existing svl/inc/style.ts. Associated exact shared runtime/provenance/capability records and original style-family records as needed; calc-ui-readiness.md and calc-upstream-suspected-issues.md; focused shared browser collection scenario and source-backed guard edge only if necessary. Up to18 non-task paths. No fake SfxStyleSheetBase/Pool class, UNO provider, custom refcount/memory manager, native compiler/probe or full-suite milestone claim.

## Plan

1. Port complete original index/vector/family, query/predicate/callback, reindex/name-change and Clear contracts with JS object identity and UTF16 Map multivalues. Keep public native paths and all six family mappings; C++ references/virtual callback protocols bind to erased TS contracts. 2. Port all9 native indexed collection QA scenarios with native-style test caller witnesses, preserving unspecified unordered duplicate result ordering instead of claiming cross-stdlib selection. 3. Add meaningful reindex, unknown/negative position, nth/end/not-found, callback order/state, exact nul/surrogate/case and stale-family Clear tests. Record CALC146 suspicious family-index state without repairing it; preserve GetStyleSheetByPosition negative at() bounds failure. 4. Verify exact new shared executable owner raw100 and all33Calc raw100, related shared/Writer tests and13source gates; build and actual Chromium index acceptance. 5. Native source pins and truthful inventory, source commit and same-agent evaluator closure. Full actual stylesheet/pool/document/UI/ODS remain pending.

## Verify Steps

Audit pinned include/svl/IndexedStyleSheets.hxx, svl/source/items/IndexedStyleSheets.cxx, include/svl/style.hxx, svl/source/items/style.cxx and svl/qa/unit/items/test_IndexedStyleSheets.cxx. Directly port all9 native fixture contracts. Test duplicate identities/names, every valid family, index snapshots/live family views, explicit reindex/name-change, predicate defaults/ReturnFirst, nth starting position/miss/negative n, exact missing-position error, native negative bounds failure, callback order and partial null slot visibility during Clear. Preserve family index omission; observe only externally held valid caller objects, not native dangling references. Tests/build/Chromium with4native reference links absent/restored, exact1shared owner raw positive S/B/F/L100 and33Calc raw100; related Writer regression. All13source gates incl inventory/provenance/routing/43boundaries. No native compilation or new ownership mechanism; record same-agent evaluator review and clean final state.

## Verification

Pending implementation and acceptance.

## Rollback Plan

Revert only task168 intentional source/tests/registry/docs changes via follow-up task; preserve shared string pool and unrelated task histories. No merges or history reset.

## Findings
