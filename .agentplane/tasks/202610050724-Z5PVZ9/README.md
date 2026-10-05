---
id: "202610050724-Z5PVZ9"
title: "Apply native Writer Backspace numbering and indent transitions"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 8
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-05T07:24:54.726Z"
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
    body: "Start: Apply the approved native Backspace numbering/count/indent order through shared edit-window and actual-node delta history,then verify body and cells."
events:
  -
    type: "status"
    at: "2026-10-05T07:24:55.375Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: Apply the approved native Backspace numbering/count/indent order through shared edit-window and actual-node delta history,then verify body and cells."
doc_version: 3
doc_updated_at: "2026-10-05T07:50:46.613Z"
doc_updated_by: "CODER"
description: "One Backspace key transition through shared edit-window,actual-node NumOrNoNum and delta history with native indentation ordering;body and cell evidence."
sections:
  Summary: "Apply native Writer Backspace numbering and indent transitions."
  Scope: |-
    - apps/office/src/sw/source/core/doc/doc.ts
    - apps/office/src/sw/source/core/undo/unnum.ts
    - apps/office/src/sw/source/uibase/wrtsh/wrtsh1.ts
    - apps/office/src/sw/source/uibase/docvw/edtwin.ts
    - apps/office/src/sw/browser/editor/browser-writer-edit-window.ts
    - apps/office/src/sw/source/uibase/docvw/native-list-backspace.test.ts
    - apps/office/src/sw/browser/editor/native-cell-list-backspace.test.tsx
    - apps/office/e2e/writer-cell-list-backspace.spec.ts
    - docs/program/source-provenance.json
    - docs/program/parity/runtime-inventory.json
  Plan: "Iteration142 one represented Backspace edit-window transition. Native SwEditWin DeleteLeft(shift=false) at paragraph start/no selection first TryRemoveIndent for no-rule or ordinary Backspace on uncounted list,then NumOrNoNum direction according to count/shift/empty nonoutline rule,then existing DelLeft fallback. Add actual-node Doc.NumOrNoNum count mutation/native already-uncounted deletion fallback;SwWrtShell owns native guards,one SwUndoNumOrNoNum boolean-delta history and existing SwUndoDelNum for removal. Add TryRemoveIndent positive/negative firstline and left-only branches using effective native items,preserve autofirst and existing paragraph-item history;no generic margin-step/body-DTOfallback. Browser keydown translates plain/ShiftBackspace to shared edit-window,prevents default to avoid duplicate beforeinput;IME and modifier chords retained;virtual beforeinput routes ordinaryBackspace sameowner. Literal tests body/cells,root/nested/bullet/numbered,empty count/remove sequence,Shiftrestore,nonempty uncounted merge,selected/midtext fallback,outline/NONE,foreign/plain/noops,metadata independence,auto/hanging/left indent ordering and delta UndoRedo. Mounted and real Chromium prove marker hide/restore and empty removal/history without neighbor/node changes. RecentTab NumDown counters/label-caret,fulloutline/rings/redlines/nativehistory/layout and fullparity remainunverified. Existingoldtests unchanged unless first observed obsolete platform mock/interface assertion requires narrowfixturecompatibility;any correction scope/plan refreshandreapproval beforeedits. Five existing ownership rows bounded additiveevidence/localundosymbol only;all244states/defaults/deviations unchanged. Sixstatics first;ONE sequential absent build/app/inventory/scripts/Chromium reportOnFailure and immediateexactfailure names;bothfirstcountmaps ignoredappcache only. Exactfailed/new-only closure,actual100coverage,zero passingtest/suite/buildreplay. finallyrestore beforefive sourceaudits;scope/nativehash,exactSHA sameactorreadonlyquality,doctor/routing,CODERVerification beforeverify/canonicalfinish,cleanmain,parentgoalactive. No network/outside/global/subagents/APsource/helpers/Python/probes/rawdiagnostics."
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

    Owned actual-node and mounted/Chromium Backspace contracts;one absent profile,exact failed/new-only closure,100 actual coverage,no passing replay.
  Verification: "Pending implementation and validation."
  Rollback Plan: "Revert semantic leaf without history rewriting."
  Findings: "Iteration141 verified progress DONE. Currentmain8a8017ab clean,onlyparentactive,direct,fourmatched policies,userinstructionsabsent. Native edtwin2048 Backspace/ShiftBackspace indent/count branch;delete.cxx64 TryRemoveIndent;ednumber632 shellguard;docnum2530 NumOrNoNum counts or removes already-uncounteddirectrule;unnum282 delta booleans,nativeNumberOn/Offcomment strings492. LocalDeleteLeft unconditionallyDelLeft,browserbeforeinput lacks modifier distinction. Standingusergoal/UIlist/table instructionauthorizessafelocalcorrection;preserve244states/deviations. No source/network/runtimeupstream invocation. Firstformat/lintpass;TSfailed onlynewstructuralfixture passingSwTableinstead ofSwTableNode. Correctcase toactualtable.GetTableNode(),preservebehaviorassertions;retryTSthenrunnotyetexecuteddeps/docs/size only. Noexistingtest/productionpolicy change. Firstfullabsent buildpass;app11920pass/1failof11921/290files,all4coverage100;inventory109pass100,scripts5pass,Chromium103pass/1newfail. Exactnamespersistedbeforecollectors. Nativeclassification existingSwNumFormat.IsEnumeration returns!IsItemize,includingNONE;newfixturewronglyexpectedNONEwoulddisableNumOrNoNum. CorrectliteralHasNumber/NONE/countoff/nativealreadyuncountedremoval expectations. Chromium Home driverleftDOMcaret at4 andBackspacedeletedm;replacecaretsetupwithsameexistingrealArrowLeft+actualDOMprefixpoll usedby native-tableediting case,andcellonly Range selection forfinaldelete;allactualBackspace/history assertions retained. Home/End native navigation remains unverifiedfollowup. No production edits afterfirstprofile;onlyexactfailedapp+Chromiumreplays,nextsourceauditsafterrestoration. Closure:exactfailedapp1passed/11skipped;exactfailedChromium1passed/noflake. App/inventoryfirstmaps100allfour;actualappfirst+failedcountermergealso100;zero passingtests/suites/build replay. Five restoredsourceauditspass/semanticviolations0. All375oldapp/script testfilesbyteidentical;16newappcases15firstpass+solefailureclosed. Fiveownershiprows10notes/nativeundosymbol additive;all244states/defaults/deviations unchanged;8nativehashes. No productionchangeafterfullprofile. Doctor0errors2oldwarnings,routingpass,diffcheckpass. APignoredinclusivescan0forbidden. FullnativeHome/End/tablenav,uncountedlistlayout,recentTabstate/labelcaret,zero-lengthmarkedPaMequivalence,fulloutline/redline/rings/history/layout/UI andgoalremainunverified."
id_source: "generated"
---
## Summary

Apply native Writer Backspace numbering and indent transitions.

## Scope

- apps/office/src/sw/source/core/doc/doc.ts
- apps/office/src/sw/source/core/undo/unnum.ts
- apps/office/src/sw/source/uibase/wrtsh/wrtsh1.ts
- apps/office/src/sw/source/uibase/docvw/edtwin.ts
- apps/office/src/sw/browser/editor/browser-writer-edit-window.ts
- apps/office/src/sw/source/uibase/docvw/native-list-backspace.test.ts
- apps/office/src/sw/browser/editor/native-cell-list-backspace.test.tsx
- apps/office/e2e/writer-cell-list-backspace.spec.ts
- docs/program/source-provenance.json
- docs/program/parity/runtime-inventory.json

## Plan

Iteration142 one represented Backspace edit-window transition. Native SwEditWin DeleteLeft(shift=false) at paragraph start/no selection first TryRemoveIndent for no-rule or ordinary Backspace on uncounted list,then NumOrNoNum direction according to count/shift/empty nonoutline rule,then existing DelLeft fallback. Add actual-node Doc.NumOrNoNum count mutation/native already-uncounted deletion fallback;SwWrtShell owns native guards,one SwUndoNumOrNoNum boolean-delta history and existing SwUndoDelNum for removal. Add TryRemoveIndent positive/negative firstline and left-only branches using effective native items,preserve autofirst and existing paragraph-item history;no generic margin-step/body-DTOfallback. Browser keydown translates plain/ShiftBackspace to shared edit-window,prevents default to avoid duplicate beforeinput;IME and modifier chords retained;virtual beforeinput routes ordinaryBackspace sameowner. Literal tests body/cells,root/nested/bullet/numbered,empty count/remove sequence,Shiftrestore,nonempty uncounted merge,selected/midtext fallback,outline/NONE,foreign/plain/noops,metadata independence,auto/hanging/left indent ordering and delta UndoRedo. Mounted and real Chromium prove marker hide/restore and empty removal/history without neighbor/node changes. RecentTab NumDown counters/label-caret,fulloutline/rings/redlines/nativehistory/layout and fullparity remainunverified. Existingoldtests unchanged unless first observed obsolete platform mock/interface assertion requires narrowfixturecompatibility;any correction scope/plan refreshandreapproval beforeedits. Five existing ownership rows bounded additiveevidence/localundosymbol only;all244states/defaults/deviations unchanged. Sixstatics first;ONE sequential absent build/app/inventory/scripts/Chromium reportOnFailure and immediateexactfailure names;bothfirstcountmaps ignoredappcache only. Exactfailed/new-only closure,actual100coverage,zero passingtest/suite/buildreplay. finallyrestore beforefive sourceaudits;scope/nativehash,exactSHA sameactorreadonlyquality,doctor/routing,CODERVerification beforeverify/canonicalfinish,cleanmain,parentgoalactive. No network/outside/global/subagents/APsource/helpers/Python/probes/rawdiagnostics.

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

Owned actual-node and mounted/Chromium Backspace contracts;one absent profile,exact failed/new-only closure,100 actual coverage,no passing replay.

## Verification

Pending implementation and validation.

## Rollback Plan

Revert semantic leaf without history rewriting.

## Findings

Iteration141 verified progress DONE. Currentmain8a8017ab clean,onlyparentactive,direct,fourmatched policies,userinstructionsabsent. Native edtwin2048 Backspace/ShiftBackspace indent/count branch;delete.cxx64 TryRemoveIndent;ednumber632 shellguard;docnum2530 NumOrNoNum counts or removes already-uncounteddirectrule;unnum282 delta booleans,nativeNumberOn/Offcomment strings492. LocalDeleteLeft unconditionallyDelLeft,browserbeforeinput lacks modifier distinction. Standingusergoal/UIlist/table instructionauthorizessafelocalcorrection;preserve244states/deviations. No source/network/runtimeupstream invocation. Firstformat/lintpass;TSfailed onlynewstructuralfixture passingSwTableinstead ofSwTableNode. Correctcase toactualtable.GetTableNode(),preservebehaviorassertions;retryTSthenrunnotyetexecuteddeps/docs/size only. Noexistingtest/productionpolicy change. Firstfullabsent buildpass;app11920pass/1failof11921/290files,all4coverage100;inventory109pass100,scripts5pass,Chromium103pass/1newfail. Exactnamespersistedbeforecollectors. Nativeclassification existingSwNumFormat.IsEnumeration returns!IsItemize,includingNONE;newfixturewronglyexpectedNONEwoulddisableNumOrNoNum. CorrectliteralHasNumber/NONE/countoff/nativealreadyuncountedremoval expectations. Chromium Home driverleftDOMcaret at4 andBackspacedeletedm;replacecaretsetupwithsameexistingrealArrowLeft+actualDOMprefixpoll usedby native-tableediting case,andcellonly Range selection forfinaldelete;allactualBackspace/history assertions retained. Home/End native navigation remains unverifiedfollowup. No production edits afterfirstprofile;onlyexactfailedapp+Chromiumreplays,nextsourceauditsafterrestoration. Closure:exactfailedapp1passed/11skipped;exactfailedChromium1passed/noflake. App/inventoryfirstmaps100allfour;actualappfirst+failedcountermergealso100;zero passingtests/suites/build replay. Five restoredsourceauditspass/semanticviolations0. All375oldapp/script testfilesbyteidentical;16newappcases15firstpass+solefailureclosed. Fiveownershiprows10notes/nativeundosymbol additive;all244states/defaults/deviations unchanged;8nativehashes. No productionchangeafterfullprofile. Doctor0errors2oldwarnings,routingpass,diffcheckpass. APignoredinclusivescan0forbidden. FullnativeHome/End/tablenav,uncountedlistlayout,recentTabstate/labelcaret,zero-lengthmarkedPaMequivalence,fulloutline/redline/rings/history/layout/UI andgoalremainunverified.
