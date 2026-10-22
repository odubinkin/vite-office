---
id: "202610222107-NCTYV6"
title: "Implement native formula copying and shared-group lifetime"
status: "DOING"
priority: "high"
owner: "CODER"
revision: 13
origin:
  system: "manual"
depends_on:
  - "202610221740-98YRBY"
tags:
  - "calc"
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-22T21:10:11.011Z"
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
    body: "Start: implement native formula copy and shared-group prerequisites while preserving the committed74 UI checkpoint and its final verification requirements."
events:
  -
    type: "status"
    at: "2026-10-22T21:10:36.982Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implement native formula copy and shared-group prerequisites while preserving the committed74 UI checkpoint and its final verification requirements."
doc_version: 3
doc_updated_at: "2026-10-22T21:39:29.595Z"
doc_updated_by: "CODER"
description: "Block75 kernel prerequisite for completing74 without flat clipboard-fill substitutes. Implement original ScFormulaCell copy/clone relocation,ScTokenArray reference adjustment,default document/clipboard/undo mode identity and shared formula group creation,splitting,ownership and listening over actual columns and native area broadcasters. Support the existing numeric/string/error/local-reference and aggregate slice;keep external/named/3D/matrix/device/OpenCL services explicit. Preserve source flags,logical sharing,member/code ownership and default behavior;JS GC replaces physical allocation only. No browser evaluator,formula-source reparse substitute,per-cell flattening of native groups or reduced-original probe facade. Up to110 source/test/registry/probe paths. Calc and changed shared raw100,independent source vectors and genuine original native observations where feasible,browser/Worker and all static/build/source gates. Full all-app checkpoint80."
sections:
  Summary: "Port native formula copy/clone and shared-group ownership/listening needed by internal clipboard fill and full range recalculation."
  Scope: "Block75 depends on73. Native ScFormulaCell copy/clone relocation,ScTokenArray reference adjustment,normal/clipboard/undo mode identity,shared formula group creation/splitting/code ownership and area listening over actual stores. Existing numeric/string/error/local-reference/aggregate slice only;external/named/3D/matrix/OpenCL/device services remain explicit. Up to110 source/test/registry/probe paths;only calc checkout/branch,no network/external writes or merges. Clipboard document pooling/paste undo belongs to dependent76;UI completion remains74."
  Plan: "Inspect complete original copy/group/mode/reference/listener paths;implement genuine token/reference copying and mode identity first,then original group ownership/column splitting and native area listening. Add independent source vectors and unchanged original native observations where feasible without facade probes. Verify real edits/deletion/undo/ODS/Worker lifetimes,Calc and changed shared raw100 and all static/build/source gates. Keep74 pending until clipboard76 and final74 acceptance are complete."
  Verify Steps: "Require independent original-source vectors for relative/absolute reference copying,bounds,mode/flag/default behavior and code/RPN identity;genuine original native observations where feasible without transformed/replacement services. Real groups must share original code,split/rejoin correctly and retain source listener/bulk/teardown behavior under edits,member removal,history and serialization. No formula-source reparsing substitute,flat per-cell group replacement or copied spreadsheet model. Full Calc and changed shared owners raw100 S/B/F/L with unchanged thresholds,related tests,actual browser/DOM-free Worker,production build and type/lint/format/boundary/JSDoc/size/source/provenance/registry/resources/static/routing/doctor gates. Full all-app checkpoint80."
  Verification: "Pending final task acceptance. Interim evidence: full Calc666 scenarios/188files pass but unchanged100 coverage gate fails at99.56S/99.20B/100F/99.65L;that diagnostic predates an internal unused-default cleanup and final tests. Current related403 scenarios/112files pass,with five changed owners raw100 and selected-document coverage below100;final focused12 scenarios also pass. Production build and current type/lint/format/JSDoc/size/boundary/source-tree/provenance/registry/routing/doctor checks pass. See evidence/progress/manifest.json for version/profile limits and raw logs. No final all-Calc raw100,group/mode/native/browser/Worker/ODS completion or quality pass is claimed. Task75 remains DOING and verification pending;full all-app checkpoint80."
  Rollback Plan: "Revert task-owned commits only,preserving the current74 UI checkpoint and integrated user changes."
  Findings: |-
    The original empty-marked AutoSum path uses EnterBlock/PasteFromClip and native CloneFormulaCell grouping. Task74 source checkpoint82a55d62c3ae remains unverified and dependent on75/76;its final acceptance is unchanged.

    Block75 progress: same-pool formula copy/Clone now relocates real deep code/RPN without source reparsing,preserves cached result/dirty state,and starts native dependencies only after document insertion. Mixed absolute/relative range endpoint ordering and sheet-boundary errors follow actual reference data. Token-array CloneValue,IsInvariant,AdjustReferenceOnCopy and local AdjustAbsoluteRefs follow original traversal. Actual token buffers and table-area fields supply consumed logical membership;there is no global reference-count/WeakRef facade. This adapter is limited to the deep-owned/discarded-shared-RPN caller profile described by source. Foreign pools,external/named/3D/matrix services remain unavailable.

    Absolute-copy adjustment requires real clipboard-range containment,so the pure original ScClipParam owner was added as a prerequisite,including default/value copies,compressed dimensions,source IDs,matrix/chart range ownership and filtered transpose. Document lazy parameters and segmented nonfiltered counts are actual owners. This does not move ResetClip,pooled-resource sharing,PasteFromClip or paste Undo out of dependent76. Selection-pattern merging is now an out-of-class definition on the same document instance to retain the1000-line boundary. CALC-254 records the conditional retained-table-area/RPN skip suspicion without asserting that the full compiler/application produces a failing user case.

    The full Calc diagnostic passed666 scenarios/188 files,but its unchanged100 threshold failed at99.56S/99.20B/100F/99.65L. That run predates removal of an internal unused default initializer and the final negative-adjacency/bounds tests. Current related-owner coverage passed403 scenarios/112files and measures token,formula-cell,clipboard-parameter,filter-data and documen7 owners at100S/B/F/L;document coverage in that selected test profile is below100 because unrelated browser presentation cases were not selected. The earlier all-Calc diagnostic covers the unchanged document owner at100. These independent profiles do not certify final all-Calc raw100. A final focused12-scenario run includes the added lower/upper sheet-boundary adoption checks. Production build,type,scoped lint,format,JSDoc,size,boundary,source-tree,provenance,registry,routing and doctor checks pass;browser/Worker/native-group acceptance has not run for75. Full all-app checkpoint remains80.

    Remaining approved75 work: actual normal/clipboard/undo mode behavior,GenHash and shared formula group code/member lifetime,column grouping/splitting/rejoining,area-group listeners and teardown,independent source/native observations where feasible,history/ODS/browser/Worker and final whole-Calc/changed-shared raw100 plus complete gates. Task75 is DOING and verification pending;74 and76 are not complete. The broad goal remains active.
id_source: "generated"
---
## Summary

Port native formula copy/clone and shared-group ownership/listening needed by internal clipboard fill and full range recalculation.

## Scope

Block75 depends on73. Native ScFormulaCell copy/clone relocation,ScTokenArray reference adjustment,normal/clipboard/undo mode identity,shared formula group creation/splitting/code ownership and area listening over actual stores. Existing numeric/string/error/local-reference/aggregate slice only;external/named/3D/matrix/OpenCL/device services remain explicit. Up to110 source/test/registry/probe paths;only calc checkout/branch,no network/external writes or merges. Clipboard document pooling/paste undo belongs to dependent76;UI completion remains74.

## Plan

Inspect complete original copy/group/mode/reference/listener paths;implement genuine token/reference copying and mode identity first,then original group ownership/column splitting and native area listening. Add independent source vectors and unchanged original native observations where feasible without facade probes. Verify real edits/deletion/undo/ODS/Worker lifetimes,Calc and changed shared raw100 and all static/build/source gates. Keep74 pending until clipboard76 and final74 acceptance are complete.

## Verify Steps

Require independent original-source vectors for relative/absolute reference copying,bounds,mode/flag/default behavior and code/RPN identity;genuine original native observations where feasible without transformed/replacement services. Real groups must share original code,split/rejoin correctly and retain source listener/bulk/teardown behavior under edits,member removal,history and serialization. No formula-source reparsing substitute,flat per-cell group replacement or copied spreadsheet model. Full Calc and changed shared owners raw100 S/B/F/L with unchanged thresholds,related tests,actual browser/DOM-free Worker,production build and type/lint/format/boundary/JSDoc/size/source/provenance/registry/resources/static/routing/doctor gates. Full all-app checkpoint80.

## Verification

Pending final task acceptance. Interim evidence: full Calc666 scenarios/188files pass but unchanged100 coverage gate fails at99.56S/99.20B/100F/99.65L;that diagnostic predates an internal unused-default cleanup and final tests. Current related403 scenarios/112files pass,with five changed owners raw100 and selected-document coverage below100;final focused12 scenarios also pass. Production build and current type/lint/format/JSDoc/size/boundary/source-tree/provenance/registry/routing/doctor checks pass. See evidence/progress/manifest.json for version/profile limits and raw logs. No final all-Calc raw100,group/mode/native/browser/Worker/ODS completion or quality pass is claimed. Task75 remains DOING and verification pending;full all-app checkpoint80.

## Rollback Plan

Revert task-owned commits only,preserving the current74 UI checkpoint and integrated user changes.

## Findings

The original empty-marked AutoSum path uses EnterBlock/PasteFromClip and native CloneFormulaCell grouping. Task74 source checkpoint82a55d62c3ae remains unverified and dependent on75/76;its final acceptance is unchanged.

Block75 progress: same-pool formula copy/Clone now relocates real deep code/RPN without source reparsing,preserves cached result/dirty state,and starts native dependencies only after document insertion. Mixed absolute/relative range endpoint ordering and sheet-boundary errors follow actual reference data. Token-array CloneValue,IsInvariant,AdjustReferenceOnCopy and local AdjustAbsoluteRefs follow original traversal. Actual token buffers and table-area fields supply consumed logical membership;there is no global reference-count/WeakRef facade. This adapter is limited to the deep-owned/discarded-shared-RPN caller profile described by source. Foreign pools,external/named/3D/matrix services remain unavailable.

Absolute-copy adjustment requires real clipboard-range containment,so the pure original ScClipParam owner was added as a prerequisite,including default/value copies,compressed dimensions,source IDs,matrix/chart range ownership and filtered transpose. Document lazy parameters and segmented nonfiltered counts are actual owners. This does not move ResetClip,pooled-resource sharing,PasteFromClip or paste Undo out of dependent76. Selection-pattern merging is now an out-of-class definition on the same document instance to retain the1000-line boundary. CALC-254 records the conditional retained-table-area/RPN skip suspicion without asserting that the full compiler/application produces a failing user case.

The full Calc diagnostic passed666 scenarios/188 files,but its unchanged100 threshold failed at99.56S/99.20B/100F/99.65L. That run predates removal of an internal unused default initializer and the final negative-adjacency/bounds tests. Current related-owner coverage passed403 scenarios/112files and measures token,formula-cell,clipboard-parameter,filter-data and documen7 owners at100S/B/F/L;document coverage in that selected test profile is below100 because unrelated browser presentation cases were not selected. The earlier all-Calc diagnostic covers the unchanged document owner at100. These independent profiles do not certify final all-Calc raw100. A final focused12-scenario run includes the added lower/upper sheet-boundary adoption checks. Production build,type,scoped lint,format,JSDoc,size,boundary,source-tree,provenance,registry,routing and doctor checks pass;browser/Worker/native-group acceptance has not run for75. Full all-app checkpoint remains80.

Remaining approved75 work: actual normal/clipboard/undo mode behavior,GenHash and shared formula group code/member lifetime,column grouping/splitting/rejoining,area-group listeners and teardown,independent source/native observations where feasible,history/ODS/browser/Worker and final whole-Calc/changed-shared raw100 plus complete gates. Task75 is DOING and verification pending;74 and76 are not complete. The broad goal remains active.
