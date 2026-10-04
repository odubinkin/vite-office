---
id: "202610040731-HX17XM"
title: "Round Writer paragraph ruler anchors to native pixels"
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
  updated_at: "2026-10-04T07:33:10.272Z"
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
    body: "Start: implement approved three paragraph-anchor rounding correction understandinggoal;one absent-upstream suitepass and separate sourceaudits."
events:
  -
    type: "status"
    at: "2026-10-04T07:33:10.705Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implement approved three paragraph-anchor rounding correction understandinggoal;one absent-upstream suitepass and separate sourceaudits."
doc_version: 3
doc_updated_at: "2026-10-04T07:33:10.705Z"
doc_updated_by: "CODER"
description: "Iteration96: match complete-coordinate signed SvxRuler UpdatePara pixel rounding for three existing paragraph indent handles. Preserve logical items,history and gesture ownership;add actual Writer/DOM/Chromium evidence. Correct one obsolete rounded-start fixture delta. One absent-upstream test pass;separate static source audits."
sections:
  Summary: "Iteration96 applies inspected native signed whole-coordinate pixel conversion to the three existing paragraph ruler handles while preserving authoritative logical items."
  Scope: |-
    apps/office/src/sw/browser/presentation/WriterRulers.tsx
    apps/office/src/sw/browser/presentation/writer-view-ruler-indent-pixels.test.tsx
    apps/office/e2e/writer-ruler-indent-pixels.spec.ts
    apps/office/src/sw/browser/presentation/WriterPageLayout.test.tsx
    docs/program/source-provenance.json
    docs/program/parity/runtime-inventory.json
    Exactly6semanticpaths pluscanonical leaf/parent records andboundedevidence.294oldtestfiles:293identical,one exactrounded-start assertion107->101 inWriterPageLayout.220manifestrows eachpreserveorder/status/owner/default/exceptions with1append-onlyrow. Core/projection/snapalgorithm/page/vertical/visibility/RTL remainoutsidechange;no network/global/outside/native/APsources/helpers.
  Plan: "Under standing goal implement one paragraph anchor projection correction:reuse toRulerPixel on complete left/first-line/right logical coordinates before existing RulerHandle rendering/admission/tracking. Preserve logical items/history/gesture and snap algorithm;no page-margin/vertical/autoFirst/RTL scope. New real Writer projection/DOM tests cover positive/negative/zero/extreme signed inputs and allthree accepted/cancelled/no-motion/Undo paths. New Chromium1280/390 imported ownedfixture puts allthree roundedhandles onscreen andchecks actualhits/transactions/reprojection/screenshots. Change exactlyone obsolete WriterPageLayout expectation107->101,allother oldtest bytes intact. Append oneexisting row inboth manifests withoutpromotion. One absent-upstream suites plus separate static sourceaudits;exactsemantic same-actor EVALUATOR/cleanfinish,fullgoalactive."
  Verify Steps: "Read ap task verify-show;read-only inspect pinned SvxRuler UpdatePara/ConvertHPosPixel andVCL lcl_logicToPixel;store2sourcefilehashes/markers/conclusions only,no native execution. No baseline/focused test runs. Run format:check,lint,typecheck,check:dependencies,test:static(buildonly),check:docs,check:file-size. Renamevendor/libreoffice-reference insidevendor;run npm run test once(app/inventorycoverage),npm exec -- vitest run scripts/check-source-provenance.test.ts scripts/writer-ui-resource-model.test.ts once,and npm run test:e2e once;restorefinally. Onlyfailedcorrected gates/cases mayrerun,alwaysabsent,no passing-suite duplication. Afterrestoration runresourcegenerator--check,source-tree,provenance,invariants,parityCLI separately;require100%fourapp/inventorycoverage and0semanticviolations. Owned realmodel/projection/DOM cases verify signed complete-coordinate rounded left/firstline/right anchors,unchanged tuple/frozenDTO/history/spacing/tabs,zero/extreme/signed fields and source-domain geometry withoutcaps;actualall3gesture cases check no-motion/cancel/acceptedtwipitem changes/oneUndo/Redo. Chromium1280/390 confirmsall3integeranchors/realhits/no newtabs/cancel/acceptedmoves/Undo/reprojection/laterediting andactualscreenshots. Exactscope6paths,294priorfiles/293byte-identical/oneoldassertion107->101;220rows each1append-onlyupdate/no status/default/owner/exception promotion;2pinnedhashes unchanged. Scope/source/artifact audits onlyaftervendor restored,sequentiallyaftertests;ignored-inclusiveAgentplane source/helper/Python/native/archive/rawframes/codediff0,onlyboundedhashes/results/conclusions. Routing/doctor pass;exactSHA same-actor EVALUATOR andcleanfinish;keep parentDOING/fullgoalactive."
  Verification: "Pending one absent-upstream suitepass and separate staticaudits;no testsrun."
  Rollback Plan: "Revert isolated semanticcommit ifrequired;restore temporarilyrenamedvendor finally. No historyrewrite."
  Findings: "Previousgoalturn verifiedprogress:iteration95DONEsemanticc5f97d15,currentcleanmain740359ec. Read-only sourceinspection confirmsSvxRuler::UpdatePara convertscomplete left/firstline/right logicalcoordinates withConvertHPosPixel;currentbrowser dividesby15 andkeepsfractions. Reuseexistingsignedrounder;items remainprecise. Existingdetachedfixtureleft1254twips rounds84pixels andits7pixelgesture yields101twips vs107 fromfractional83.6start;approveoneexpectation correction now. NativeautoFirstvisibility,RTL/vertical/theme/systemDPI/hitpriority/modifiers/snapping/capture/fullframe/page/coreindentmutation/completeparent parity remainunverified. Registered save/open/recovery deviations preserved."
id_source: "generated"
---
## Summary

Iteration96 applies inspected native signed whole-coordinate pixel conversion to the three existing paragraph ruler handles while preserving authoritative logical items.

## Scope

apps/office/src/sw/browser/presentation/WriterRulers.tsx
apps/office/src/sw/browser/presentation/writer-view-ruler-indent-pixels.test.tsx
apps/office/e2e/writer-ruler-indent-pixels.spec.ts
apps/office/src/sw/browser/presentation/WriterPageLayout.test.tsx
docs/program/source-provenance.json
docs/program/parity/runtime-inventory.json
Exactly6semanticpaths pluscanonical leaf/parent records andboundedevidence.294oldtestfiles:293identical,one exactrounded-start assertion107->101 inWriterPageLayout.220manifestrows eachpreserveorder/status/owner/default/exceptions with1append-onlyrow. Core/projection/snapalgorithm/page/vertical/visibility/RTL remainoutsidechange;no network/global/outside/native/APsources/helpers.

## Plan

Under standing goal implement one paragraph anchor projection correction:reuse toRulerPixel on complete left/first-line/right logical coordinates before existing RulerHandle rendering/admission/tracking. Preserve logical items/history/gesture and snap algorithm;no page-margin/vertical/autoFirst/RTL scope. New real Writer projection/DOM tests cover positive/negative/zero/extreme signed inputs and allthree accepted/cancelled/no-motion/Undo paths. New Chromium1280/390 imported ownedfixture puts allthree roundedhandles onscreen andchecks actualhits/transactions/reprojection/screenshots. Change exactlyone obsolete WriterPageLayout expectation107->101,allother oldtest bytes intact. Append oneexisting row inboth manifests withoutpromotion. One absent-upstream suites plus separate static sourceaudits;exactsemantic same-actor EVALUATOR/cleanfinish,fullgoalactive.

## Verify Steps

Read ap task verify-show;read-only inspect pinned SvxRuler UpdatePara/ConvertHPosPixel andVCL lcl_logicToPixel;store2sourcefilehashes/markers/conclusions only,no native execution. No baseline/focused test runs. Run format:check,lint,typecheck,check:dependencies,test:static(buildonly),check:docs,check:file-size. Renamevendor/libreoffice-reference insidevendor;run npm run test once(app/inventorycoverage),npm exec -- vitest run scripts/check-source-provenance.test.ts scripts/writer-ui-resource-model.test.ts once,and npm run test:e2e once;restorefinally. Onlyfailedcorrected gates/cases mayrerun,alwaysabsent,no passing-suite duplication. Afterrestoration runresourcegenerator--check,source-tree,provenance,invariants,parityCLI separately;require100%fourapp/inventorycoverage and0semanticviolations. Owned realmodel/projection/DOM cases verify signed complete-coordinate rounded left/firstline/right anchors,unchanged tuple/frozenDTO/history/spacing/tabs,zero/extreme/signed fields and source-domain geometry withoutcaps;actualall3gesture cases check no-motion/cancel/acceptedtwipitem changes/oneUndo/Redo. Chromium1280/390 confirmsall3integeranchors/realhits/no newtabs/cancel/acceptedmoves/Undo/reprojection/laterediting andactualscreenshots. Exactscope6paths,294priorfiles/293byte-identical/oneoldassertion107->101;220rows each1append-onlyupdate/no status/default/owner/exception promotion;2pinnedhashes unchanged. Scope/source/artifact audits onlyaftervendor restored,sequentiallyaftertests;ignored-inclusiveAgentplane source/helper/Python/native/archive/rawframes/codediff0,onlyboundedhashes/results/conclusions. Routing/doctor pass;exactSHA same-actor EVALUATOR andcleanfinish;keep parentDOING/fullgoalactive.

## Verification

Pending one absent-upstream suitepass and separate staticaudits;no testsrun.

## Rollback Plan

Revert isolated semanticcommit ifrequired;restore temporarilyrenamedvendor finally. No historyrewrite.

## Findings

Previousgoalturn verifiedprogress:iteration95DONEsemanticc5f97d15,currentcleanmain740359ec. Read-only sourceinspection confirmsSvxRuler::UpdatePara convertscomplete left/firstline/right logicalcoordinates withConvertHPosPixel;currentbrowser dividesby15 andkeepsfractions. Reuseexistingsignedrounder;items remainprecise. Existingdetachedfixtureleft1254twips rounds84pixels andits7pixelgesture yields101twips vs107 fromfractional83.6start;approveoneexpectation correction now. NativeautoFirstvisibility,RTL/vertical/theme/systemDPI/hitpriority/modifiers/snapping/capture/fullframe/page/coreindentmutation/completeparent parity remainunverified. Registered save/open/recovery deviations preserved.
