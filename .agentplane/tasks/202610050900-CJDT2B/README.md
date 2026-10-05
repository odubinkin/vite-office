---
id: "202610050900-CJDT2B"
title: "Route table Tab traversal and appended row history through native cursor owners"
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
  updated_at: "2026-10-05T09:01:06.098Z"
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
    body: "Start: Implement native table Tab traversal and append history under standing goal/UI authorization;preserve registered deviations and all prior tests,run ONE absent profile with failed/new-only closure."
events:
  -
    type: "status"
    at: "2026-10-05T09:01:10.866Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: Implement native table Tab traversal and append history under standing goal/UI authorization;preserve registered deviations and all prior tests,run ONE absent profile with failed/new-only closure."
doc_version: 3
doc_updated_at: "2026-10-05T09:29:57.580Z"
doc_updated_by: "CODER"
description: "Iteration145 remove browser-default table Tab behavior;native cursor traversal,table row append and Writer history,without React table navigation decisions. Standing goal/UI mandate authorizes safe in-repo edits. Preserve registered I/O/recovery deviations."
sections:
  Summary: "Route table Tab traversal and appended row history through native cursor owners."
  Scope: |-
    - apps/office/src/sw/source/core/crsr/swcrsr.ts
    - apps/office/src/sw/source/core/undo/untbl.ts
    - apps/office/src/sw/source/core/docnode/nodes.ts
    - apps/office/src/sw/source/core/table/swtable.ts
    - apps/office/src/sw/source/uibase/wrtsh/wrtsh1.ts
    - apps/office/src/sw/source/uibase/docvw/edtwin.ts
    - apps/office/src/sw/browser/editor/browser-writer-edit-window.ts
    - apps/office/src/sw/source/uibase/wrtsh/native-table-traversal.test.ts
    - apps/office/src/sw/browser/editor/native-table-tab.test.tsx
    - apps/office/e2e/writer-native-table-tab.spec.ts
    - docs/program/source-provenance.json
    - docs/program/parity/runtime-inventory.json
  Plan: "Iteration145 native table Tab traversal/history. Replace shell persistent PaM with SwCursor subclass matching swcrsr GoPrevNextCell;actual SwNodes section traversal,counter/default1,firstparagraph offset0,mark preservation,boundaryfailure without body/table escape. Shell GoNextCell defaultappendtrue and GoPrevCell consume cursor movement,refresh active/pending/historygrouping and notifications. Last-cell unmarked forwardappend uses prepared real row sections copied from native source row/firstcell paragraph style+directitems,empty text,no text/hints clone;SwUndoTableNdsChg retains actual inserted row/sections and before/after cursor,Undo disconnects and collapses registered indices,Redo reconnects same identities. Extend actual SwNodes/tableline insertion/removal owners,not snapshotdoc/React. Flat implemented cells only;merged/nested/protected/nativeform/autocorrect/autoformat/border/formula/redline/lifetimes remainunverified. Browser only translates unmodified Tab/ShiftTab intent after DOM synchronization;SwEditWin decides liststart priority via native NumDownChangesIndent represented formats or table next/previous,no DOM sibling/bodyordinal/DTO layer. Ordinary bodyTab unchanged. Real native/mounted/Chromium tests include multipleparagraphs,rows,emptycells,selectiondirection,boundaries,append history,typing thenUndoRedo,pendingformat/modelnotifications and ignored modifiers/composition. Preserve all oldtests byteidentical. Add2unverified native ownership rows for cursor/undo with matching evidence;existing244states/classifications/defaults/exceptions unchanged;boundednotes existing5rows only. Sixstaticsfirst;ONE sequential full absent build/app/inventory/scripts/Chromium reportOnFailure,exactfailednames persistedbeforeassertions,initialmaps ignoredappcacheonly;only failed/newunexecuted closure,actual100coverage,no passing replay. finallyrestore beforefive sourceaudits,scope/nativehash audit,semantic exactSHA sameactorreadonlyquality,CODERVerification beforeverify,canonicalfinish/cleanmain,parentcheckpoint. No network/global/outside/subagents/APsources/helpers/Python/probes/binaries/rawdiagnostics."
  Verify Steps: |-
    - `npm run format:check`
    - `npm run lint`
    - `npm run typecheck`
    - `npm run check:dependencies`
    - `npm run check:docs`
    - `npm run check:file-size`
    - `npm run test:static`
    - `npm run test:coverage --workspace @vite-office/office -- --coverage.reportOnFailure`
    - `npm run test:inventory:coverage -- --coverage.reportOnFailure`
    - `npm exec -- vitest run scripts/check-source-provenance.test.ts scripts/writer-ui-resource-model.test.ts`
    - `npm exec -- playwright test --config apps/office/playwright.config.ts`
    - `npm exec -- tsx scripts/generate-writer-ui-resources.ts --check`
    - `npm run check:source-tree`
    - `npm run check:source-provenance`
    - `npm run inventory:invariants`
    - `npm run inventory:parity`
    - `ap doctor`
    - `node .agentplane/policy/check-routing.mjs`

    Actual table section traversal/firstparagraph0,selectiondirection,boundaries,append native history and DOM restoration. ONE absent fullprofile,failed/new-only closures,actual100coverage,no passing replay.
  Verification: "Pending implementation and validation."
  Rollback Plan: "Revert semantic task without rewriting history."
  Findings: "Previous144 verifiedprogress DONE;currentmain86365df3 clean,parentonlyactive,direct,userinstructionsabsent,fourmatchedpolicies. Native edtwin2146/2223 gives liststart priority then tableNextCell/PrevCell,2801 callsGoNextCell(!readonly). trvltbl39 forbidsappendwithmark/appendfalse,appendslastrow then moves;swcrsr2198 traverses actualcellsections/count and landsfirstcontent0,markretained. ndtbl1871/untbl1502 ownnative row/undo,swtable130 copies firstparagraph style/directitems,emptycontent;tblrwcl349 copiesrowgeometry. Local hasno tableTab owner,solebrowserdefaultfocus,table model AppendRow only. First guessed wrtsh-table-cursor andnativeport paths absent;bounded actualfiles resolved,read-onlyqueries,no mutation. Scope uses nativeflatcellboundary and retainedsectionhistory;full nativeSwCursorShell/DocInsertRow/merged/protected/formula/border/redline remainunverified,not goalpromotion. Standing usergoal/UI mandate authorizes thisinrepo localtask. Firstsixstatics:format firstpass;lint failed on8 non-null assertions in newmountedfixture and shell source-row lookup. Replace with typed requiredfixture reads/source rowcast;repeat only failedlint thenfirstunexecuted type/dependency/docs/size. Formatter passed globalgate willnotreplay;changedfilecheckonly. Metadata ordering corrected to preserve base order plus2newrows;no semantic/classification/state changes. applypatch duplicate-target syntax rejected beforemutation,then bounded correctedpatch;no scope change. Secondfailedlint retry found missing fixture JSDoc after insertingrequired helper;add functiondocumentation only,repeatfailedlint andfirstunexecuted remainingstatics. FirstONEfullabsent:buildpass;app12021pass/1newnegativeguardfail of12022/294files;inventory108pass/1orderingfailof109/36files;scripts5pass;Chromium109firstpass/noflakes,includingnewactualTab/append/typing/UndoRedo. Exactfailednames persistedbeforeassertions. Newrow removal guard incorrectly derivedrangefromsuppliednodes,so a self-consistent body-node payload passed;derive range fromactual line first/lastbox and requirefullspan+sequence. Addsame-length unrelatedsequence assertioninside solefailedcase;allpassingcasesunchanged. Runtimeinventory requiresbinarylexorder;insert2newmodulesbycodepointsort ratherthanlocale/baseappend. Repeatonly exact1app+1inventory cases,no Chromium/build/full/passingreplay. Initialmaps ignoredappcache only. Owninitialnodes source retained in tool memory solely for actualIstanbul LCS alignment,neverAP/artifact/helper. Finalsourcecorrectednativeguard changes only nodes.ts;browser normal traversal/rowbehavior firstChromiumpassed,malformedguardcorrection checked throughnativeexactfailedcase. Vendorfinallyrestored beforeinspection. Closure: exact failed native ownership case1pass/16skipped and inventory production mapping case1pass/2skipped;zero passing cases reexecuted. Actual initial+failed counters100 allfour:app11761lines/12877statements/3295functions/9675branches;inventory1464lines/1523statements/384functions/1080branches. nodes.ts onlypostprofile productionchange;onlysource-identical contiguous locations carried viaorderedlineLCS,edited/new/crossinglocations actualfailedcasecounters only. Sixotherproductionfiles unchanged. Corrected guard checksactualrow span/length/sequence,case keepsalloldassertions plusnew equal-length corruptionassertion. Five restoredsourceaudits firstpass/semanticViolationCount0. Scopeproof382priorapp/script testfiles byteidentical,23new app cases22firstpass/1failedclosure,one newChromium firstpass;10boundedappendicesexisting5owners/2addedunverifiedrows,existing244states/defaults/deviations unchanged;9nativehashes. Doctor0errors2previouswarnings/routing/diffpass/AP4072files0forbiddenprequality. Readonly swcrsr.hxx documents save-state destructor only popsstate;multi-count failure transient start-node point is unverified in bounded content-only cursor,not claimedparity. Native numfunc/helper ownership and table/fullselection/protection/forms/autocorrect/borders/formulas/redline/layout/fullhistory/ODTcelllistimport/HomeEnd/UI remainfollowups. RegisteredI/O/recovery choices intact;goalactive."
id_source: "generated"
---
## Summary

Route table Tab traversal and appended row history through native cursor owners.

## Scope

- apps/office/src/sw/source/core/crsr/swcrsr.ts
- apps/office/src/sw/source/core/undo/untbl.ts
- apps/office/src/sw/source/core/docnode/nodes.ts
- apps/office/src/sw/source/core/table/swtable.ts
- apps/office/src/sw/source/uibase/wrtsh/wrtsh1.ts
- apps/office/src/sw/source/uibase/docvw/edtwin.ts
- apps/office/src/sw/browser/editor/browser-writer-edit-window.ts
- apps/office/src/sw/source/uibase/wrtsh/native-table-traversal.test.ts
- apps/office/src/sw/browser/editor/native-table-tab.test.tsx
- apps/office/e2e/writer-native-table-tab.spec.ts
- docs/program/source-provenance.json
- docs/program/parity/runtime-inventory.json

## Plan

Iteration145 native table Tab traversal/history. Replace shell persistent PaM with SwCursor subclass matching swcrsr GoPrevNextCell;actual SwNodes section traversal,counter/default1,firstparagraph offset0,mark preservation,boundaryfailure without body/table escape. Shell GoNextCell defaultappendtrue and GoPrevCell consume cursor movement,refresh active/pending/historygrouping and notifications. Last-cell unmarked forwardappend uses prepared real row sections copied from native source row/firstcell paragraph style+directitems,empty text,no text/hints clone;SwUndoTableNdsChg retains actual inserted row/sections and before/after cursor,Undo disconnects and collapses registered indices,Redo reconnects same identities. Extend actual SwNodes/tableline insertion/removal owners,not snapshotdoc/React. Flat implemented cells only;merged/nested/protected/nativeform/autocorrect/autoformat/border/formula/redline/lifetimes remainunverified. Browser only translates unmodified Tab/ShiftTab intent after DOM synchronization;SwEditWin decides liststart priority via native NumDownChangesIndent represented formats or table next/previous,no DOM sibling/bodyordinal/DTO layer. Ordinary bodyTab unchanged. Real native/mounted/Chromium tests include multipleparagraphs,rows,emptycells,selectiondirection,boundaries,append history,typing thenUndoRedo,pendingformat/modelnotifications and ignored modifiers/composition. Preserve all oldtests byteidentical. Add2unverified native ownership rows for cursor/undo with matching evidence;existing244states/classifications/defaults/exceptions unchanged;boundednotes existing5rows only. Sixstaticsfirst;ONE sequential full absent build/app/inventory/scripts/Chromium reportOnFailure,exactfailednames persistedbeforeassertions,initialmaps ignoredappcacheonly;only failed/newunexecuted closure,actual100coverage,no passing replay. finallyrestore beforefive sourceaudits,scope/nativehash audit,semantic exactSHA sameactorreadonlyquality,CODERVerification beforeverify,canonicalfinish/cleanmain,parentcheckpoint. No network/global/outside/subagents/APsources/helpers/Python/probes/binaries/rawdiagnostics.

## Verify Steps

- `npm run format:check`
- `npm run lint`
- `npm run typecheck`
- `npm run check:dependencies`
- `npm run check:docs`
- `npm run check:file-size`
- `npm run test:static`
- `npm run test:coverage --workspace @vite-office/office -- --coverage.reportOnFailure`
- `npm run test:inventory:coverage -- --coverage.reportOnFailure`
- `npm exec -- vitest run scripts/check-source-provenance.test.ts scripts/writer-ui-resource-model.test.ts`
- `npm exec -- playwright test --config apps/office/playwright.config.ts`
- `npm exec -- tsx scripts/generate-writer-ui-resources.ts --check`
- `npm run check:source-tree`
- `npm run check:source-provenance`
- `npm run inventory:invariants`
- `npm run inventory:parity`
- `ap doctor`
- `node .agentplane/policy/check-routing.mjs`

Actual table section traversal/firstparagraph0,selectiondirection,boundaries,append native history and DOM restoration. ONE absent fullprofile,failed/new-only closures,actual100coverage,no passing replay.

## Verification

Pending implementation and validation.

## Rollback Plan

Revert semantic task without rewriting history.

## Findings

Previous144 verifiedprogress DONE;currentmain86365df3 clean,parentonlyactive,direct,userinstructionsabsent,fourmatchedpolicies. Native edtwin2146/2223 gives liststart priority then tableNextCell/PrevCell,2801 callsGoNextCell(!readonly). trvltbl39 forbidsappendwithmark/appendfalse,appendslastrow then moves;swcrsr2198 traverses actualcellsections/count and landsfirstcontent0,markretained. ndtbl1871/untbl1502 ownnative row/undo,swtable130 copies firstparagraph style/directitems,emptycontent;tblrwcl349 copiesrowgeometry. Local hasno tableTab owner,solebrowserdefaultfocus,table model AppendRow only. First guessed wrtsh-table-cursor andnativeport paths absent;bounded actualfiles resolved,read-onlyqueries,no mutation. Scope uses nativeflatcellboundary and retainedsectionhistory;full nativeSwCursorShell/DocInsertRow/merged/protected/formula/border/redline remainunverified,not goalpromotion. Standing usergoal/UI mandate authorizes thisinrepo localtask. Firstsixstatics:format firstpass;lint failed on8 non-null assertions in newmountedfixture and shell source-row lookup. Replace with typed requiredfixture reads/source rowcast;repeat only failedlint thenfirstunexecuted type/dependency/docs/size. Formatter passed globalgate willnotreplay;changedfilecheckonly. Metadata ordering corrected to preserve base order plus2newrows;no semantic/classification/state changes. applypatch duplicate-target syntax rejected beforemutation,then bounded correctedpatch;no scope change. Secondfailedlint retry found missing fixture JSDoc after insertingrequired helper;add functiondocumentation only,repeatfailedlint andfirstunexecuted remainingstatics. FirstONEfullabsent:buildpass;app12021pass/1newnegativeguardfail of12022/294files;inventory108pass/1orderingfailof109/36files;scripts5pass;Chromium109firstpass/noflakes,includingnewactualTab/append/typing/UndoRedo. Exactfailednames persistedbeforeassertions. Newrow removal guard incorrectly derivedrangefromsuppliednodes,so a self-consistent body-node payload passed;derive range fromactual line first/lastbox and requirefullspan+sequence. Addsame-length unrelatedsequence assertioninside solefailedcase;allpassingcasesunchanged. Runtimeinventory requiresbinarylexorder;insert2newmodulesbycodepointsort ratherthanlocale/baseappend. Repeatonly exact1app+1inventory cases,no Chromium/build/full/passingreplay. Initialmaps ignoredappcache only. Owninitialnodes source retained in tool memory solely for actualIstanbul LCS alignment,neverAP/artifact/helper. Finalsourcecorrectednativeguard changes only nodes.ts;browser normal traversal/rowbehavior firstChromiumpassed,malformedguardcorrection checked throughnativeexactfailedcase. Vendorfinallyrestored beforeinspection. Closure: exact failed native ownership case1pass/16skipped and inventory production mapping case1pass/2skipped;zero passing cases reexecuted. Actual initial+failed counters100 allfour:app11761lines/12877statements/3295functions/9675branches;inventory1464lines/1523statements/384functions/1080branches. nodes.ts onlypostprofile productionchange;onlysource-identical contiguous locations carried viaorderedlineLCS,edited/new/crossinglocations actualfailedcasecounters only. Sixotherproductionfiles unchanged. Corrected guard checksactualrow span/length/sequence,case keepsalloldassertions plusnew equal-length corruptionassertion. Five restoredsourceaudits firstpass/semanticViolationCount0. Scopeproof382priorapp/script testfiles byteidentical,23new app cases22firstpass/1failedclosure,one newChromium firstpass;10boundedappendicesexisting5owners/2addedunverifiedrows,existing244states/defaults/deviations unchanged;9nativehashes. Doctor0errors2previouswarnings/routing/diffpass/AP4072files0forbiddenprequality. Readonly swcrsr.hxx documents save-state destructor only popsstate;multi-count failure transient start-node point is unverified in bounded content-only cursor,not claimedparity. Native numfunc/helper ownership and table/fullselection/protection/forms/autocorrect/borders/formulas/redline/layout/fullhistory/ODTcelllistimport/HomeEnd/UI remainfollowups. RegisteredI/O/recovery choices intact;goalactive.
