---
id: "202610200120-RV75WR"
title: "Implement native Calc column widths,visibility,metric dialog and ODS geometry"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 12
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-20T01:21:44.307Z"
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
    body: "Start: implement native column width/visibility storage,metric dialog,shared UI,geometry history and ODS with exact source defaults and declared scoped100 evidence."
events:
  -
    type: "status"
    at: "2026-10-20T01:21:49.126Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implement native column width/visibility storage,metric dialog,shared UI,geometry history and ODS with exact source defaults and declared scoped100 evidence."
doc_version: 3
doc_updated_at: "2026-10-20T02:22:46.763Z"
doc_updated_by: "CODER"
description: "Task46 continues the authorized Calc UI goal. Replace fixed browser96px columns with source ScCompressedArray width/visibility storage and native1280twip default. Connect ColumnWidth and related Hide/Show source commands through actual marked/grouped ranges and width/history owners,shared Writer dialog/menu components and original metric/typed-HMM boundaries. Persist real column styles/visibility in ODS and verify browser scrolling/selection/history. Only calc checkout/branch;no network,branches,integration or full all-app run before checkpoint50."
sections:
  Summary: "Task46: native Calc column width/visibility storage and browser geometry,ColumnWidth metric dialog,Hide/Show commands,genuine geometry history and ODS column styles. Continue the approved UI goal using shared Writer controls and source contracts."
  Scope: "Only /Users/odubinkin/Projects/vite-office-calc branch calc. Up to100 non-task paths: original core ScTable/ScDocument compressed column width/hidden/flags and copy paths;native direct/show/hide view/cell shell and ScUndoWidthOrHeight owners;shared consumed numeric unit/metric widget boundary only where needed;native metric dialog state plus shared browser modal controls;controller/viewport/grid/scroll projection;ODS column styles/contexts/tokens/export;source-backed fixture migrations,focused tests/e2e and exact registry/capability/source-issue docs. Preserve1280twip default,UInt16 input casts,HMM versus twip contracts and original zero/direct visibility semantics. No fake VCL/font/device/UNO/locale services,no optimal-width calculation,rich/edit,drawing,outline/protection or alternate-view emulation. No branches,merges,network,outside files or verification weakening. Indent UI is deferred to its own task after real widths are available;do not use a fake96px width to enable it."
  Plan: "1. Port source compressed column width/visibility and geometry-copy/history contracts with original defaults. 2. Replace fixed browser column geometry with projections over actual storage;wire native direct/show/hide commands and consumed metric dialog through existing shared Writer controls and typed Sfx requests. 3. Add real ODS column styles/repeats/visibility and source-derived core/browser/Worker acceptance. 4. Freeze production owners,run scoped100 and related declared checks,retain exact evidence,quality review and clean direct closure. Existing user authorization covers this safe local implementation;stop only for material scope/security/verification drift."
  Verify Steps: "Read brief/route;pin native hashes/anchors. Actual compressed width/hidden storage verifies native defaults,zero fallback,UInt16 conversion,invalid coordinates,ranges,selected/grouped/disjoint sheets/columns and geometry-only copying/history without changing cells. Verify source direct width/HMM typed requests,optional FN_PARAM_1 column selection,no-argument metric dialog,default checkbox/current-value restore,normalization/ranges/unit conversions,cancel/close/dispose and snapshot admission. Verify hide/show retains stored widths and cursor/selection behavior from source;hidden/zero-width geometry cannot divide by zero or allocate cells. Real browser viewport/header/cell offsets,horizontal scroll,selection visibility and both1280/390 shared menu/dialog/shortcut paths use actual native geometry. Independently authored ODS column widths/visibility/repeats and export/reopen preserve geometry alongside existing attrs/cells;diagnose unsupported properties without silently flattening. Scoped Calc raw S/B/F/L100,related shared/Writer tests and complete changed executable application owners100,current hashes. Fresh build/focused browser primary ODS save/reload/open,Undo/Redo and DOM-free Worker,no uncaught errors. Types,root authored lint/format,dependencies,JSDoc,size,Calc/Writer resources,source tree/provenance,invariants/scoped parity,affected tooling/static,routing/doctor/diff. Retain exact argv/exits/nonempty raw/current hashes/source/browser evidence;quality review,implementation commit and clean direct closure. Full checkpoint40 retained;next50."
  Verification: "Pending implementation and declared scoped evidence. No completion or broad native parity claim."
  Rollback Plan: "Revert only this task implementation/registration commits through a new scoped authorized task;never reset unrelated work or edit the pinned upstream reference."
  Findings: |-
    Preflight clean calc;previous task45 is verified progress. Native widths use ScCompressedArray<SCCOL,UInt16> initialized1280twips;zero setter restores standard width while source view direct size0 hides without changing the previous stored width. Existing browser fixed96px columns must be replaced by actual source geometry. Native FID_COL_WIDTH typed SfxUInt16 payload is HMM;dialog result is twips and native macro recording converts through TwipsToEvenHMM. Metric dialog default/current values are normalized in its actual selected field unit;inspect conversion/default/range quirks rather than substituting raw twips or invented metrics. Existing compressed arrays,boolean column segments,o3tl conversions and shared Writer dialog/menu infrastructure can be reused. Full device optimal widths,outline/drawing/protection/alternate views remain unported.

    - Observation: ColumnWidth native async completion requires AppendItem,IsAPI and canonical separation of SfxRequest::SetReturnValue from Done. Existing shared request and one Writer style caller conflate Done with return assignment.
      Impact: A Calc-specific completion workaround would preserve the shared simplification and violate the user explicit instruction to canonicalize common Writer modules.
      Resolution: Within the existing user authorization for direct common-module corrections and100-path scope,port consumed original call modes/append/return/completion semantics,update actual dispatcher/Writer callers and related tests,retain browser argument transport limitation explicitly,with complete changed-owner100 evidence.

    - Observation: Native numeric-field suffix parsing depends on unicode::isAlpha/isControl,including FORMAT and line/paragraph separators. The actual shared Unicode utility and ICU78.3 main-property trie were ported rather than using host Unicode properties. The local pinned ICU archive and unchanged original ICU/LibreOffice function bodies produce the same four-byte protocol for all1114112 codepoints. Original initial-NUL cache behavior is retained. No network or fabricated locale/widget/service provider was used.
    - Observation: Source XMLMeasurePropHdl uses signed32 measure defaults before the native UInt16 width argument. Independent -1cm XML now verifies the original64969twip narrowing. New source quirks are documented as CALC218..223 without changing upstream behavior.
    - Observation: Final browser regression exposed a pre-existing task45 fixture still expecting Clear disabled. It now expects only Open and native Clear enabled,retaining every other toolbar state assertion. Actual width-dialog spin accessibility reads the real normalized range/current value;the browser acceptance includes axe. Exactly100 non-task paths remain within the approved scope.
    - Observation: Native width/hide may move the actual cursor;the browser name box now refreshes from that cursor. The complete current controller and metric-dialog owners are remeasured in an all-Calc test replay;their entire maps replace earlier complete owners,without merging stale counters. All remaining Calc source hashes must match the frozen measured owners.
id_source: "generated"
---
## Summary

Task46: native Calc column width/visibility storage and browser geometry,ColumnWidth metric dialog,Hide/Show commands,genuine geometry history and ODS column styles. Continue the approved UI goal using shared Writer controls and source contracts.

## Scope

Only /Users/odubinkin/Projects/vite-office-calc branch calc. Up to100 non-task paths: original core ScTable/ScDocument compressed column width/hidden/flags and copy paths;native direct/show/hide view/cell shell and ScUndoWidthOrHeight owners;shared consumed numeric unit/metric widget boundary only where needed;native metric dialog state plus shared browser modal controls;controller/viewport/grid/scroll projection;ODS column styles/contexts/tokens/export;source-backed fixture migrations,focused tests/e2e and exact registry/capability/source-issue docs. Preserve1280twip default,UInt16 input casts,HMM versus twip contracts and original zero/direct visibility semantics. No fake VCL/font/device/UNO/locale services,no optimal-width calculation,rich/edit,drawing,outline/protection or alternate-view emulation. No branches,merges,network,outside files or verification weakening. Indent UI is deferred to its own task after real widths are available;do not use a fake96px width to enable it.

## Plan

1. Port source compressed column width/visibility and geometry-copy/history contracts with original defaults. 2. Replace fixed browser column geometry with projections over actual storage;wire native direct/show/hide commands and consumed metric dialog through existing shared Writer controls and typed Sfx requests. 3. Add real ODS column styles/repeats/visibility and source-derived core/browser/Worker acceptance. 4. Freeze production owners,run scoped100 and related declared checks,retain exact evidence,quality review and clean direct closure. Existing user authorization covers this safe local implementation;stop only for material scope/security/verification drift.

## Verify Steps

Read brief/route;pin native hashes/anchors. Actual compressed width/hidden storage verifies native defaults,zero fallback,UInt16 conversion,invalid coordinates,ranges,selected/grouped/disjoint sheets/columns and geometry-only copying/history without changing cells. Verify source direct width/HMM typed requests,optional FN_PARAM_1 column selection,no-argument metric dialog,default checkbox/current-value restore,normalization/ranges/unit conversions,cancel/close/dispose and snapshot admission. Verify hide/show retains stored widths and cursor/selection behavior from source;hidden/zero-width geometry cannot divide by zero or allocate cells. Real browser viewport/header/cell offsets,horizontal scroll,selection visibility and both1280/390 shared menu/dialog/shortcut paths use actual native geometry. Independently authored ODS column widths/visibility/repeats and export/reopen preserve geometry alongside existing attrs/cells;diagnose unsupported properties without silently flattening. Scoped Calc raw S/B/F/L100,related shared/Writer tests and complete changed executable application owners100,current hashes. Fresh build/focused browser primary ODS save/reload/open,Undo/Redo and DOM-free Worker,no uncaught errors. Types,root authored lint/format,dependencies,JSDoc,size,Calc/Writer resources,source tree/provenance,invariants/scoped parity,affected tooling/static,routing/doctor/diff. Retain exact argv/exits/nonempty raw/current hashes/source/browser evidence;quality review,implementation commit and clean direct closure. Full checkpoint40 retained;next50.

## Verification

Pending implementation and declared scoped evidence. No completion or broad native parity claim.

## Rollback Plan

Revert only this task implementation/registration commits through a new scoped authorized task;never reset unrelated work or edit the pinned upstream reference.

## Findings

Preflight clean calc;previous task45 is verified progress. Native widths use ScCompressedArray<SCCOL,UInt16> initialized1280twips;zero setter restores standard width while source view direct size0 hides without changing the previous stored width. Existing browser fixed96px columns must be replaced by actual source geometry. Native FID_COL_WIDTH typed SfxUInt16 payload is HMM;dialog result is twips and native macro recording converts through TwipsToEvenHMM. Metric dialog default/current values are normalized in its actual selected field unit;inspect conversion/default/range quirks rather than substituting raw twips or invented metrics. Existing compressed arrays,boolean column segments,o3tl conversions and shared Writer dialog/menu infrastructure can be reused. Full device optimal widths,outline/drawing/protection/alternate views remain unported.

- Observation: ColumnWidth native async completion requires AppendItem,IsAPI and canonical separation of SfxRequest::SetReturnValue from Done. Existing shared request and one Writer style caller conflate Done with return assignment.
  Impact: A Calc-specific completion workaround would preserve the shared simplification and violate the user explicit instruction to canonicalize common Writer modules.
  Resolution: Within the existing user authorization for direct common-module corrections and100-path scope,port consumed original call modes/append/return/completion semantics,update actual dispatcher/Writer callers and related tests,retain browser argument transport limitation explicitly,with complete changed-owner100 evidence.

- Observation: Native numeric-field suffix parsing depends on unicode::isAlpha/isControl,including FORMAT and line/paragraph separators. The actual shared Unicode utility and ICU78.3 main-property trie were ported rather than using host Unicode properties. The local pinned ICU archive and unchanged original ICU/LibreOffice function bodies produce the same four-byte protocol for all1114112 codepoints. Original initial-NUL cache behavior is retained. No network or fabricated locale/widget/service provider was used.
- Observation: Source XMLMeasurePropHdl uses signed32 measure defaults before the native UInt16 width argument. Independent -1cm XML now verifies the original64969twip narrowing. New source quirks are documented as CALC218..223 without changing upstream behavior.
- Observation: Final browser regression exposed a pre-existing task45 fixture still expecting Clear disabled. It now expects only Open and native Clear enabled,retaining every other toolbar state assertion. Actual width-dialog spin accessibility reads the real normalized range/current value;the browser acceptance includes axe. Exactly100 non-task paths remain within the approved scope.
- Observation: Native width/hide may move the actual cursor;the browser name box now refreshes from that cursor. The complete current controller and metric-dialog owners are remeasured in an all-Calc test replay;their entire maps replace earlier complete owners,without merging stale counters. All remaining Calc source hashes must match the frozen measured owners.
