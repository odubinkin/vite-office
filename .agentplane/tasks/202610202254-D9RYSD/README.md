---
id: "202610202254-D9RYSD"
title: "Complete native Calc document pool and header-footer ownership"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 9
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-20T22:55:41.818Z"
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
    body: "Start: complete actual Calc document pool100..188 and native nullable header/footer ownership using task57 real text objects and existing shared set/scale values;preserve explicit unported service boundaries."
events:
  -
    type: "status"
    at: "2026-10-20T22:56:52.429Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: complete actual Calc document pool100..188 and native nullable header/footer ownership using task57 real text objects and existing shared set/scale values;preserve explicit unported service boundaries."
doc_version: 3
doc_updated_at: "2026-10-20T22:56:52.429Z"
doc_updated_by: "CODER"
description: "Block58: complete original ScDocumentPool package100..188 using actual ScPageHFItem value ownership,ScGlobal EETextObjEqual and existing shared EditTextObject/SvxSetItem/ScPageScaleToItem. Preserve static versus per-pool dynamic defaults,ranges,slots,copy/base Clone and native null/text equality. No fake style pool,UNO header/footer content,renderer or lifetime service. Reuse actual shared values and document unported APIs. Work only calc checkout/branch;user performs integration."
sections:
  Summary: |-
    Complete native Calc document pool and header-footer ownership

    Block58: complete original ScDocumentPool package100..188 using actual ScPageHFItem value ownership,ScGlobal EETextObjEqual and existing shared EditTextObject/SvxSetItem/ScPageScaleToItem. Preserve static versus per-pool dynamic defaults,ranges,slots,copy/base Clone and native null/text equality. No fake style pool,UNO header/footer content,renderer or lifetime service. Reuse actual shared values and document unported APIs. Work only calc checkout/branch;user performs integration.
  Scope: "Complete original Calc ItemInfoPackage/ScDocumentPool100..188 and consumed ScPageHFItem/ScGlobal text-value equality over real shared EditTextObject,SfxItemSet and SvxSetItem. Reuse existing ScPageScaleToItem. Up to25source/test files plus registry/provenance/readiness/evidence. Preserve source null/default/clone/range/slot/metric semantics. Actual header/footer UNO content,EditEngine editing/layout,ScStyleSheet/ScStyleSheetPool/ScPoolHelper and style UI remain unported rather than faked. Only calc checkout/branch;no network,global files,branch changes or merges."
  Plan: "Block58 completes the original Calc pool as one coherent dependency for genuine styles:port ScPageHFItem default/copy/owned nullable text areas,Clone,equality and native setters/getters using actual EditTextObject;add original ScGlobal EETextObjEqual and explicit const binding. Complete missing Which declarations and all89native package entries,including dynamic header/footer SvxSetItem sets with exact original ranges;retain existing static items,flags,default metrics and base-pool Clone semantics. Reuse existing ScPageScaleToItem and fix native temporary string ownership at the pool constructor. Do not invent or stub header/footer UNO services,style pools,renderer or lifetime management;omitted APIs remain explicit. Update existing prefix-boundary tests/browser fixture and add real owner/default/copy tests. Up to25source/test files plus metadata/evidence. Validate Calc100 and affected-owner/shared tests100,all required static/build/browser/Worker gates,raw source/native proof and evaluator. Full all-app next60. Task may span turns;do not close a partial implementation."
  Verify Steps: "Compare pinned attrib.cxx/hxx,global.cxx,docpool.cxx and scitems.hxx. Verify all89entries100..188 with literal native slots/flags,87shared static defaults,two independent pool-local header/footer sets,exact Which ranges and foreign/base Clone behavior. Real rich-text null/copy/alias-setter/field/style and pool-insensitive equality tests. Run all Calc tests/coverage100,related shared value/pool/itemset tests and100coverage for every changed runtime owner;type-only shared changes must retain identical emitted runtime where applicable. Do not replay all1098application test files for ordinary shared verification;full all-app checkpoint remains60. Changed-source lint/format,types,dependencies,resources,docs,tree,size,provenance,registry,routing,doctor,production/static build. Actual Chromium/DOM-freeWorker pool/header-footer acceptance plus current Calc font/wrap/ODS and Writer regressions;inspect screenshots. Preserve raw failures/results/current source and native pins with portable audit,separate EVALUATOR pass and clean calc close. Use a descriptive actual result in canonical finish;guided generic verified-ID result is rejected by close-commit policy."
  Verification: "Pending implementation and all declared checks. No completion,parity or coverage claim yet."
  Rollback Plan: "Revert only this task's intentional implementation commits after inspecting its source/evidence paths. Preserve task57 actual shared owners and all previous Calc behavior. The user performs integration."
  Findings: "Continuing user-authorized Calc goal after verified task57. Actual shared SfxStyleSheetBasePool/SfxStyleSheetPool already exist and must be reused in the subsequent style layer. The remaining Calc package requires real nullable header/footer values and existing SvxSetItem,not an invented style or rendering provider. Native standard-style creation is a separate operation consuming the actual text-editing engine;it is not moved into pool construction. Task57 verified full495-owner shared baseline;normal block verification now scopes actual affected owners and consumers as requested by the user,without weakening100coverage of changed code."
id_source: "generated"
---
## Summary

Complete native Calc document pool and header-footer ownership

Block58: complete original ScDocumentPool package100..188 using actual ScPageHFItem value ownership,ScGlobal EETextObjEqual and existing shared EditTextObject/SvxSetItem/ScPageScaleToItem. Preserve static versus per-pool dynamic defaults,ranges,slots,copy/base Clone and native null/text equality. No fake style pool,UNO header/footer content,renderer or lifetime service. Reuse actual shared values and document unported APIs. Work only calc checkout/branch;user performs integration.

## Scope

Complete original Calc ItemInfoPackage/ScDocumentPool100..188 and consumed ScPageHFItem/ScGlobal text-value equality over real shared EditTextObject,SfxItemSet and SvxSetItem. Reuse existing ScPageScaleToItem. Up to25source/test files plus registry/provenance/readiness/evidence. Preserve source null/default/clone/range/slot/metric semantics. Actual header/footer UNO content,EditEngine editing/layout,ScStyleSheet/ScStyleSheetPool/ScPoolHelper and style UI remain unported rather than faked. Only calc checkout/branch;no network,global files,branch changes or merges.

## Plan

Block58 completes the original Calc pool as one coherent dependency for genuine styles:port ScPageHFItem default/copy/owned nullable text areas,Clone,equality and native setters/getters using actual EditTextObject;add original ScGlobal EETextObjEqual and explicit const binding. Complete missing Which declarations and all89native package entries,including dynamic header/footer SvxSetItem sets with exact original ranges;retain existing static items,flags,default metrics and base-pool Clone semantics. Reuse existing ScPageScaleToItem and fix native temporary string ownership at the pool constructor. Do not invent or stub header/footer UNO services,style pools,renderer or lifetime management;omitted APIs remain explicit. Update existing prefix-boundary tests/browser fixture and add real owner/default/copy tests. Up to25source/test files plus metadata/evidence. Validate Calc100 and affected-owner/shared tests100,all required static/build/browser/Worker gates,raw source/native proof and evaluator. Full all-app next60. Task may span turns;do not close a partial implementation.

## Verify Steps

Compare pinned attrib.cxx/hxx,global.cxx,docpool.cxx and scitems.hxx. Verify all89entries100..188 with literal native slots/flags,87shared static defaults,two independent pool-local header/footer sets,exact Which ranges and foreign/base Clone behavior. Real rich-text null/copy/alias-setter/field/style and pool-insensitive equality tests. Run all Calc tests/coverage100,related shared value/pool/itemset tests and100coverage for every changed runtime owner;type-only shared changes must retain identical emitted runtime where applicable. Do not replay all1098application test files for ordinary shared verification;full all-app checkpoint remains60. Changed-source lint/format,types,dependencies,resources,docs,tree,size,provenance,registry,routing,doctor,production/static build. Actual Chromium/DOM-freeWorker pool/header-footer acceptance plus current Calc font/wrap/ODS and Writer regressions;inspect screenshots. Preserve raw failures/results/current source and native pins with portable audit,separate EVALUATOR pass and clean calc close. Use a descriptive actual result in canonical finish;guided generic verified-ID result is rejected by close-commit policy.

## Verification

Pending implementation and all declared checks. No completion,parity or coverage claim yet.

## Rollback Plan

Revert only this task's intentional implementation commits after inspecting its source/evidence paths. Preserve task57 actual shared owners and all previous Calc behavior. The user performs integration.

## Findings

Continuing user-authorized Calc goal after verified task57. Actual shared SfxStyleSheetBasePool/SfxStyleSheetPool already exist and must be reused in the subsequent style layer. The remaining Calc package requires real nullable header/footer values and existing SvxSetItem,not an invented style or rendering provider. Native standard-style creation is a separate operation consuming the actual text-editing engine;it is not moved into pool construction. Task57 verified full495-owner shared baseline;normal block verification now scopes actual affected owners and consumers as requested by the user,without weakening100coverage of changed code.
