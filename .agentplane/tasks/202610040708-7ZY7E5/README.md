---
id: "202610040708-7ZY7E5"
title: "Round explicit Writer ruler tab anchors to native pixels"
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
  updated_at: "2026-10-04T07:10:08.028Z"
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
    body: "Start: implement approved explicit-tab pixel projection under standing goal;preserve logical values and single absent-upstream verification."
events:
  -
    type: "status"
    at: "2026-10-04T07:10:08.457Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implement approved explicit-tab pixel projection under standing goal;preserve logical values and single absent-upstream verification."
doc_version: 3
doc_updated_at: "2026-10-04T07:10:08.457Z"
doc_updated_by: "CODER"
description: "Iteration95: use inspected SvxRuler ConvertHPosPixel/VCL signed rounding for complete explicit tab origins at CSS96dpi. Preserve raw logical item positions and typed hit ownership;add real model/DOM/Undo and Chromium rounding cases. One absent-upstream test pass;separate static source audits."
sections:
  Summary: "Iteration95 projects existing explicit Writer ruler tab anchors through the inspected SvxRuler/VCL signed pixel conversion at CSS96dpi,sharing the existing default-tab rounder."
  Scope: |-
    apps/office/src/sw/browser/presentation/WriterRulers.tsx
    apps/office/src/sw/browser/presentation/writer-view-ruler-tab-pixels.test.tsx
    apps/office/e2e/writer-ruler-tab-pixels.spec.ts
    apps/office/e2e/writer-ruler-tab-glyphs.spec.ts
    apps/office/e2e/writer-ruler-tab-identity.spec.ts
    docs/program/source-provenance.json
    docs/program/parity/runtime-inventory.json
    Exactly7semantic paths plus canonical task/parent records andbounded evidence.292prior tests:290byte-identical;2oldE2E files permit only5post-drag coordinate assertion replacements.220rows/order/status/owner/default/exception fields unchanged;append1existing row. No core/projection/snapalgorithm modifications,network/outside/global access/native execution/APsources/helpers.
  Plan: "Implement one explicit tab pixel-projection correction:use existing toRulerPixel on complete origin+logical stop before typed RulerHandle admission/render/tracking;preserve immutable raw-index/point records,model metadata/general paragraph positions and undo ownership. Add real model/DOM/Undo cases for alltypes,fractional positive/negative/zero/extreme coordinates and bothoriginsettings;new Chromium1280/390 fixture verifies actual rounded glyph/hitanchor,cancel/no-motion/move/undo/reprojection. Update exactly5 obsolete postdrag assertions across2oldE2E files to exact native integer positions;allother oldbytes/assertions retained. Append one existing WriterRulers row per220-row manifest without promotion. Run all static checks and one absent-upstream suite pass;source audits separately;exact semanticSHA same-actor evaluator andcleanfinish;parent staysDOING."
  Verify Steps: "Read ap task verify-show;read-only inspect pinned SvxRuler ConvertHPosPixel/UpdateTabs and VCL lcl_logicToPixel,record2filehashes/markers/conclusions only,no native execution. No baseline/focused tests. Run format:check,lint,typecheck,check:dependencies,test:static,check:docs,check:file-size. Rename vendor/libreoffice-reference insidevendor;run npm run test once(app/inventorycoverage),npm exec -- vitest run scripts/check-source-provenance.test.ts scripts/writer-ui-resource-model.test.ts once,and npm run test:e2e once;restorefinally. Only failed corrected gates may rerun,tests alwaysabsent,no passing-suite duplicates. Afterrestore separately run generator--check,source-tree,provenance,invariants,parityCLI;require100%4app/inventorycoverage,0semanticviolations. New realprojection/DOM cases cover Left/Right/Center/Decimal integeranchors,complete-origin rounding,positive/negative/zero/signed32endpoints,relativeflag,falseorigin,model/history/frozenDTO preservation,and accepted/cancelled/no-motion/rawindex/Undo behavior. Chromium1280/390 checks rounded anchors/typed actualhitbounds,clickownership andoneUndo/Redo plusactualscreenshots. Exactscope7paths,292prior tests/290identical/2oldE2E exact5expectation replacements,220rows each1append-onlyupdate/no promotion,2pinnedhashes unchanged. Ignored-inclusive AP source/helper/Python/native/archive/rawframes/codediff audit0;only boundedresults/hashes/conclusions. Routing/doctor pass;exact-SHA same-actor EVALUATOR andcleanfinish;fullgoalactive."
  Verification: "Pending single absent-upstream tests and separate static audits;no tests run."
  Rollback Plan: "Revert isolated semantic commit if needed;restore temporarily renamedvendor infinally. No historyrewrite."
  Findings: "Previousgoalturn is verifiedprogress:iteration94DONE semantic4602af9e,currentcleanmain dac71556. Read-only evidence confirms nativeexplicit UpdateTabs uses ConvertHPosPixel ofcomplete tab origin+offset,andLogicToPixel usesllround;local explicitmarkers retainfractional division. Correct displayed/hit/tracking anchoronly;model stayslogical. Two oldChromium fixtures explicitlyassert obsoletefractional postdragposition;replace5expectations with exactrounded218 while preserving allother assertions/bytes. Nativefull geometry/RTL/vertical/systemDPI/theme/hitpriority/snap/modifiers/capture/selector/fullnative andparent parity remainunverified. Registered save/open/recovery deviations preserved."
id_source: "generated"
---
## Summary

Iteration95 projects existing explicit Writer ruler tab anchors through the inspected SvxRuler/VCL signed pixel conversion at CSS96dpi,sharing the existing default-tab rounder.

## Scope

apps/office/src/sw/browser/presentation/WriterRulers.tsx
apps/office/src/sw/browser/presentation/writer-view-ruler-tab-pixels.test.tsx
apps/office/e2e/writer-ruler-tab-pixels.spec.ts
apps/office/e2e/writer-ruler-tab-glyphs.spec.ts
apps/office/e2e/writer-ruler-tab-identity.spec.ts
docs/program/source-provenance.json
docs/program/parity/runtime-inventory.json
Exactly7semantic paths plus canonical task/parent records andbounded evidence.292prior tests:290byte-identical;2oldE2E files permit only5post-drag coordinate assertion replacements.220rows/order/status/owner/default/exception fields unchanged;append1existing row. No core/projection/snapalgorithm modifications,network/outside/global access/native execution/APsources/helpers.

## Plan

Implement one explicit tab pixel-projection correction:use existing toRulerPixel on complete origin+logical stop before typed RulerHandle admission/render/tracking;preserve immutable raw-index/point records,model metadata/general paragraph positions and undo ownership. Add real model/DOM/Undo cases for alltypes,fractional positive/negative/zero/extreme coordinates and bothoriginsettings;new Chromium1280/390 fixture verifies actual rounded glyph/hitanchor,cancel/no-motion/move/undo/reprojection. Update exactly5 obsolete postdrag assertions across2oldE2E files to exact native integer positions;allother oldbytes/assertions retained. Append one existing WriterRulers row per220-row manifest without promotion. Run all static checks and one absent-upstream suite pass;source audits separately;exact semanticSHA same-actor evaluator andcleanfinish;parent staysDOING.

## Verify Steps

Read ap task verify-show;read-only inspect pinned SvxRuler ConvertHPosPixel/UpdateTabs and VCL lcl_logicToPixel,record2filehashes/markers/conclusions only,no native execution. No baseline/focused tests. Run format:check,lint,typecheck,check:dependencies,test:static,check:docs,check:file-size. Rename vendor/libreoffice-reference insidevendor;run npm run test once(app/inventorycoverage),npm exec -- vitest run scripts/check-source-provenance.test.ts scripts/writer-ui-resource-model.test.ts once,and npm run test:e2e once;restorefinally. Only failed corrected gates may rerun,tests alwaysabsent,no passing-suite duplicates. Afterrestore separately run generator--check,source-tree,provenance,invariants,parityCLI;require100%4app/inventorycoverage,0semanticviolations. New realprojection/DOM cases cover Left/Right/Center/Decimal integeranchors,complete-origin rounding,positive/negative/zero/signed32endpoints,relativeflag,falseorigin,model/history/frozenDTO preservation,and accepted/cancelled/no-motion/rawindex/Undo behavior. Chromium1280/390 checks rounded anchors/typed actualhitbounds,clickownership andoneUndo/Redo plusactualscreenshots. Exactscope7paths,292prior tests/290identical/2oldE2E exact5expectation replacements,220rows each1append-onlyupdate/no promotion,2pinnedhashes unchanged. Ignored-inclusive AP source/helper/Python/native/archive/rawframes/codediff audit0;only boundedresults/hashes/conclusions. Routing/doctor pass;exact-SHA same-actor EVALUATOR andcleanfinish;fullgoalactive.

## Verification

Pending single absent-upstream tests and separate static audits;no tests run.

## Rollback Plan

Revert isolated semantic commit if needed;restore temporarily renamedvendor infinally. No historyrewrite.

## Findings

Previousgoalturn is verifiedprogress:iteration94DONE semantic4602af9e,currentcleanmain dac71556. Read-only evidence confirms nativeexplicit UpdateTabs uses ConvertHPosPixel ofcomplete tab origin+offset,andLogicToPixel usesllround;local explicitmarkers retainfractional division. Correct displayed/hit/tracking anchoronly;model stayslogical. Two oldChromium fixtures explicitlyassert obsoletefractional postdragposition;replace5expectations with exactrounded218 while preserving allother assertions/bytes. Nativefull geometry/RTL/vertical/systemDPI/theme/hitpriority/snap/modifiers/capture/selector/fullnative andparent parity remainunverified. Registered save/open/recovery deviations preserved.
