---
id: "202610201913-6GG949"
title: "Restore native Calc cell-pattern style association and registered-style lifecycle"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 7
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-20T19:14:31.878Z"
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
    body: "Start: restore original native pattern style inheritance and registered-style rename/delete lifecycle using genuine shared style values;no replacement Calc style or browser-only model."
events:
  -
    type: "status"
    at: "2026-10-20T19:15:05.245Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: restore original native pattern style inheritance and registered-style rename/delete lifecycle using genuine shared style values;no replacement Calc style or browser-only model."
doc_version: 3
doc_updated_at: "2026-10-20T19:15:05.245Z"
doc_updated_by: "CODER"
description: "Advance the required named-cell-style UI path with original ScPatternAttr style pointer/name inheritance,copy,clear-direct-format and symbol-font contracts plus CellAttributeHelper rename/delete/all-styles-to-names ownership. Reuse genuine shared SfxStyleSheet values through erased borrowed base operations;do not invent ScStyleSheet,ScStyleSheetPool,document style resolution or browser style state."
sections:
  Summary: |-
    Restore native Calc cell-pattern style association and registered-style lifecycle

    Advance the required named-cell-style UI path with original ScPatternAttr style pointer/name inheritance,copy,clear-direct-format and symbol-font contracts plus CellAttributeHelper rename/delete/all-styles-to-names ownership. Reuse genuine shared SfxStyleSheet values through erased borrowed base operations;do not invent ScStyleSheet,ScStyleSheetPool,document style resolution or browser style state.
  Scope: "Native ScPatternAttr style pointer/name association,copy,clear-direct-format inheritance,StyleToName and IsSymbolFont;CellAttributeHelper registered-style rename,delete and all-to-name lifecycle. Up to20 source/test files plus registry/provenance/readiness/evidence. Borrow only real shared native style operations;do not fabricate the missing Calc style/pool/document-resolution or UI command owners."
  Plan: "Add the original borrowed style pointer to ScPatternAttr and preserve it and actual itemset parent through native copying. Implement GetStyleSheet,GetStyleName,SetStyleSheet default clearDirectFormat=true,StyleToName and IsSymbolFont from pinned patattr.cxx/hxx. Preserve null-attach name retention,clearing only style SET fields including inherited SET states,and exact name/value versus parent-identity equality. Add CellAttributeHelper CellStyleDeleted,RenameCellStyle and AllStylesToNames using actual name-group registries and canonical holders,including failed-rename re-insertion and forced default-pattern existence. Declare only erased borrowed base style operations consumed at those read sites;use genuine existing SfxStyleSheet/SfxStyleSheetPool in tests,not a fake ScStyleSheet or resolver. Native ScStyleSheet/ScStyleSheetPool,UpdateStyleSheet/document style resolution,full named style UI/ODS and automatic-height remain required and explicitly unported. Verify inheritance through actual column/pattern and mounted Calc display where current native operations permit it;do not add a browser-only style model or enable unsupported StyleApply. Run Calc100,related actual style/itemset tests and fresh changed-owner100 coverage;retain unchanged shared54 evidence by verified source hashes. Run all declared static/build gates and desktop/mobile font/wrap/ODS and DOM-free Worker native lifecycle acceptance. Up to20 source/test files plus records/evidence;only calc checkout/branch,no network,merges,subagents or full-suite checkpoint before60."
  Verify Steps: "Read pinned patattr.cxx/hxx style binding,copy/equality and helper rename/delete/to-name contracts. Require stock complete Calc Istanbul100 S/B/F/L and related shared style/pool/itemset cases. Verify native borrowed style reference with genuine shared classes,canonical registry holder lifetimes,source null/failed rename/empty-group cases,inherited/default/INVALID states,symbol font and mounted Calc inheritance if reachable. Recompute complete shared100 from task54 only after verifying unchanged source hashes;fresh changed Calc owner coverage required. Run types,changed-source lint/format,dependencies,Writer/Calc resources,docs,size,tree,provenance,registry,routing,doctor,build/static-build. Run relevant Calc font/wrap/ODS desktop/mobile and native lifecycle Worker/browser cases,inspect screenshots. Archive raw reports,exact commands,source/native hashes and portable audit;obtain evaluator pass and finish clean calc. Keep heavyweight concurrency bounded to two jobs and avoid overlapping build/type work with slow native replay. No full app suite until60. Do not claim missing Calc style owners/UI/ODS or automatic-height complete."
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert only this task implementation commit,preserving prior verified formatting/context work;no branch,merge or history changes."
  Findings: ""
id_source: "generated"
---
## Summary

Restore native Calc cell-pattern style association and registered-style lifecycle

Advance the required named-cell-style UI path with original ScPatternAttr style pointer/name inheritance,copy,clear-direct-format and symbol-font contracts plus CellAttributeHelper rename/delete/all-styles-to-names ownership. Reuse genuine shared SfxStyleSheet values through erased borrowed base operations;do not invent ScStyleSheet,ScStyleSheetPool,document style resolution or browser style state.

## Scope

Native ScPatternAttr style pointer/name association,copy,clear-direct-format inheritance,StyleToName and IsSymbolFont;CellAttributeHelper registered-style rename,delete and all-to-name lifecycle. Up to20 source/test files plus registry/provenance/readiness/evidence. Borrow only real shared native style operations;do not fabricate the missing Calc style/pool/document-resolution or UI command owners.

## Plan

Add the original borrowed style pointer to ScPatternAttr and preserve it and actual itemset parent through native copying. Implement GetStyleSheet,GetStyleName,SetStyleSheet default clearDirectFormat=true,StyleToName and IsSymbolFont from pinned patattr.cxx/hxx. Preserve null-attach name retention,clearing only style SET fields including inherited SET states,and exact name/value versus parent-identity equality. Add CellAttributeHelper CellStyleDeleted,RenameCellStyle and AllStylesToNames using actual name-group registries and canonical holders,including failed-rename re-insertion and forced default-pattern existence. Declare only erased borrowed base style operations consumed at those read sites;use genuine existing SfxStyleSheet/SfxStyleSheetPool in tests,not a fake ScStyleSheet or resolver. Native ScStyleSheet/ScStyleSheetPool,UpdateStyleSheet/document style resolution,full named style UI/ODS and automatic-height remain required and explicitly unported. Verify inheritance through actual column/pattern and mounted Calc display where current native operations permit it;do not add a browser-only style model or enable unsupported StyleApply. Run Calc100,related actual style/itemset tests and fresh changed-owner100 coverage;retain unchanged shared54 evidence by verified source hashes. Run all declared static/build gates and desktop/mobile font/wrap/ODS and DOM-free Worker native lifecycle acceptance. Up to20 source/test files plus records/evidence;only calc checkout/branch,no network,merges,subagents or full-suite checkpoint before60.

## Verify Steps

Read pinned patattr.cxx/hxx style binding,copy/equality and helper rename/delete/to-name contracts. Require stock complete Calc Istanbul100 S/B/F/L and related shared style/pool/itemset cases. Verify native borrowed style reference with genuine shared classes,canonical registry holder lifetimes,source null/failed rename/empty-group cases,inherited/default/INVALID states,symbol font and mounted Calc inheritance if reachable. Recompute complete shared100 from task54 only after verifying unchanged source hashes;fresh changed Calc owner coverage required. Run types,changed-source lint/format,dependencies,Writer/Calc resources,docs,size,tree,provenance,registry,routing,doctor,build/static-build. Run relevant Calc font/wrap/ODS desktop/mobile and native lifecycle Worker/browser cases,inspect screenshots. Archive raw reports,exact commands,source/native hashes and portable audit;obtain evaluator pass and finish clean calc. Keep heavyweight concurrency bounded to two jobs and avoid overlapping build/type work with slow native replay. No full app suite until60. Do not claim missing Calc style owners/UI/ODS or automatic-height complete.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert only this task implementation commit,preserving prior verified formatting/context work;no branch,merge or history changes.

## Findings
