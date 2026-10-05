---
id: "202610050217-Y5P172"
title: "Restore shell insertion modes and stored undo flags"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 7
origin:
  system: "manual"
depends_on: []
tags:
  - "parity"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-05T02:18:51.401Z"
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
    body: "Start: restore collapsed shell modes and stored undo flags under the standing parity goal."
events:
  -
    type: "status"
    at: "2026-10-05T02:18:37.730Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: restore collapsed shell modes and stored undo flags under the standing parity goal."
doc_version: 3
doc_updated_at: "2026-10-05T02:31:53.029Z"
doc_updated_by: "CODER"
description: "Continuation 133: restore collapsed SwEditShell Insert2 EMPTYEXPAND policy and required stored SwUndoInsert insertion flags, including the current FORCE grouping barrier; preserve selection adapters until native attribute history exists."
sections:
  Summary: "Restore shell insertion modes and stored undo flags."
  Scope: |-
    - apps/office/src/sw/source/core/edit/editsh.ts
    - apps/office/src/sw/source/core/undo/unins.ts
    - apps/office/src/sw/source/uibase/wrtsh/wrtsh-editing.ts
    - apps/office/src/sw/source/core/undo/undobj.test.ts
    - apps/office/src/sw/source/uibase/wrtsh/native-typing-internet-ownership.test.ts
    - apps/office/src/sw/source/core/txtnode/native-empty-hint-ownership.test.ts
    - apps/office/src/sw/source/uibase/wrtsh/native-shell-insert-modes.test.ts
    - docs/program/source-provenance.json
    - docs/program/parity/runtime-inventory.json
  Plan: "Restore source-owned SwEditShell Insert2 collapsed insertion policy: normal EMPTYEXPAND1 and forced EMPTYEXPAND|FORCEHINTEXPAND5 factory in existing editsh. Require SwUndoInsert stored native flags before optional pending items;typed redo forwards stored flags;new candidate FORCE cannot group,ordinary after forced remains eligible under existing bounded payload checks and retains original mode. Collapsed Insert,Replace and composition use factory;keep current same-node and cross-node selection adapters pending native SwHistory/SwHistorySetText rollback. Hyperlink fragment adapter and two prior constructor test files migrate with explicit DEFAULT only,unchanged expectations. New source-independent literal mode/mask/lock/oldIgnore/boundary/owned INET metadata/IDs/map/node/backlink/caret/undo/redo/pending clone/grouping tests cover actual paths. Only the prior empty-internet typing undo/redo case may change after concrete first-profile failure,from DEFAULT-shifted zero to EMPTY-expanded range;all other356of359prior tests byte-identical. Preserve242runtime rows/status/defaults/exceptions with three bounded responsibility appendices and mapped factory/symbol;no promotions/newmodule. Sixstatic gates first;one sequential absent full build/app/inventory/scripts/Chromium with finally restore and immediate exact failed full names;only failed gates/cases repeated,no passing suite/case/build replays. Restore before five source audits,scope/native hashes/AP forbidden scan/exact semantic SHA same-actor readonly EVALUATOR/doctor/routing/CODER verification/canonical finish. Bounded English prose/counts/hashes only in AP,no source/code/helper/Python/rawdiagnostics. Registered I/O deviations untouched;selection history/full native grouping/redline/multicursor/index overloads/GCAttr/COPY/BuildPortions/families/styleclients/UNO/refcounts/core/UI remain unverified."
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

    Static first;one full absent profile,exact failed names captured immediately;only failures replayed. Restore before source/scope/AP audits. Audit359prior test files,242runtime rows,native hashes and exact semantic SHA.
  Verification: "Pending implementation and validation."
  Rollback Plan: "Revert the semantic leaf commit without rewriting history."
  Findings: |-
    Preflight133:cleanmain ce6c0d1c16fefe6a071a07a370580fd2053ae9a3,direct,onlyparentactive;132 verified progress,notblocked. Pin26.8.0.2/9bc445578031fecf56086729d8e4940c77e14d65. Native editsh.cxx98 normal1/forced5;unins.cxx102 stores flags and340 reuses them;DocumentContentOperationsManager.cxx2902 currentFORCE skips grouping while ordinary may group after forced. Native insert undo erases text without restoring consumed DontExpand;first and redo ranges may differ. Selection delete+force requires missing SwHistory/SwHistorySetText rollback;retained adapters explicitly unverified. Fourmatchedpolicies loaded,user-instructions absent,standing usergoal authorizes safe local scope,no network/outside/globalaccess.

    Implementation133:collapsed shell Insert/Replace/composition now use source-owned Insert2 policy EMPTY1;forcedfactory5 is tested but selection adapters intentionally retained pending native history. Required m_nInsertFlags is stored by SwUndoInsert and forwarded on redo;current candidate FORCE grouping rejected,ordinary after forced accepted under bounded existing payload checks and grouped redo retains firstmode. Hyperlink adapter and2priorfixtures received5syntax-only DEFAULT constructor migrations.1547newcases cover real owner/mode/flags/lock/oldIgnore/empty/boundary/history/grouping/pending paths. Staticfirstformatpass/lintfailunusedtestimport;failedlint recovered,typefailnumericliteral5;native bitwise enumcombination fixed and failedtype recovered;remainingdependency/docs/size passed. Changedfixture formatting/lint passed. One full absent profile:buildpass,app9073pass/161fail of9234,100%allfourcoverage,inventory109/100%allfour,scripts5,Chromium99 firstpass. Exactly161failed full names captured in firstprofile;one old EMPTY historycase corrected from zero4..4 to active2..4 while preserving actual item,other185cases unchanged.160newempty undo matrixcases wrongly assumed ownership survives interior GC;native ndtxt.cxx2860 erasure removes zero hints strictly inside deleted range;literal masks now assert detachment and no reconstructed link on redo. Only161failedcases replayed once absent:161pass/1572skip of1733,zero passing case/suite/build replays. Productionunchanged after fullprofile. Finally restored reference before5sourceaudits,allpass0semanticviolations. Scope359prior files:356byteidentical,2ASTsyntax-only with expectations unchanged,1singleobservedhistorycase changed;242runtime rows/states/defaults/exceptions retained except3bounded appendices/onefactory mapping. Nine native hashes recorded;selectionbranch byte-identical. Initial scope-audit header path corrected to actual core/inc/rolbck.hxx without source or test changes/replays. APignored-inclusive3921files0forbidden;doctor0errors/two unchangedlegacywarnings;routingOK. Fullcore/UI/selectionhistory/managergrouping/redline/multicursor/indexoverloads/GCAttr/COPY/BuildPortions/families/styleclients/UNO/refcounts remain unverified;goal active,verifiedprogress,noexternalblocker.
id_source: "generated"
---
## Summary

Restore shell insertion modes and stored undo flags.

## Scope

- apps/office/src/sw/source/core/edit/editsh.ts
- apps/office/src/sw/source/core/undo/unins.ts
- apps/office/src/sw/source/uibase/wrtsh/wrtsh-editing.ts
- apps/office/src/sw/source/core/undo/undobj.test.ts
- apps/office/src/sw/source/uibase/wrtsh/native-typing-internet-ownership.test.ts
- apps/office/src/sw/source/core/txtnode/native-empty-hint-ownership.test.ts
- apps/office/src/sw/source/uibase/wrtsh/native-shell-insert-modes.test.ts
- docs/program/source-provenance.json
- docs/program/parity/runtime-inventory.json

## Plan

Restore source-owned SwEditShell Insert2 collapsed insertion policy: normal EMPTYEXPAND1 and forced EMPTYEXPAND|FORCEHINTEXPAND5 factory in existing editsh. Require SwUndoInsert stored native flags before optional pending items;typed redo forwards stored flags;new candidate FORCE cannot group,ordinary after forced remains eligible under existing bounded payload checks and retains original mode. Collapsed Insert,Replace and composition use factory;keep current same-node and cross-node selection adapters pending native SwHistory/SwHistorySetText rollback. Hyperlink fragment adapter and two prior constructor test files migrate with explicit DEFAULT only,unchanged expectations. New source-independent literal mode/mask/lock/oldIgnore/boundary/owned INET metadata/IDs/map/node/backlink/caret/undo/redo/pending clone/grouping tests cover actual paths. Only the prior empty-internet typing undo/redo case may change after concrete first-profile failure,from DEFAULT-shifted zero to EMPTY-expanded range;all other356of359prior tests byte-identical. Preserve242runtime rows/status/defaults/exceptions with three bounded responsibility appendices and mapped factory/symbol;no promotions/newmodule. Sixstatic gates first;one sequential absent full build/app/inventory/scripts/Chromium with finally restore and immediate exact failed full names;only failed gates/cases repeated,no passing suite/case/build replays. Restore before five source audits,scope/native hashes/AP forbidden scan/exact semantic SHA same-actor readonly EVALUATOR/doctor/routing/CODER verification/canonical finish. Bounded English prose/counts/hashes only in AP,no source/code/helper/Python/rawdiagnostics. Registered I/O deviations untouched;selection history/full native grouping/redline/multicursor/index overloads/GCAttr/COPY/BuildPortions/families/styleclients/UNO/refcounts/core/UI remain unverified.

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

Static first;one full absent profile,exact failed names captured immediately;only failures replayed. Restore before source/scope/AP audits. Audit359prior test files,242runtime rows,native hashes and exact semantic SHA.

## Verification

Pending implementation and validation.

## Rollback Plan

Revert the semantic leaf commit without rewriting history.

## Findings

Preflight133:cleanmain ce6c0d1c16fefe6a071a07a370580fd2053ae9a3,direct,onlyparentactive;132 verified progress,notblocked. Pin26.8.0.2/9bc445578031fecf56086729d8e4940c77e14d65. Native editsh.cxx98 normal1/forced5;unins.cxx102 stores flags and340 reuses them;DocumentContentOperationsManager.cxx2902 currentFORCE skips grouping while ordinary may group after forced. Native insert undo erases text without restoring consumed DontExpand;first and redo ranges may differ. Selection delete+force requires missing SwHistory/SwHistorySetText rollback;retained adapters explicitly unverified. Fourmatchedpolicies loaded,user-instructions absent,standing usergoal authorizes safe local scope,no network/outside/globalaccess.

Implementation133:collapsed shell Insert/Replace/composition now use source-owned Insert2 policy EMPTY1;forcedfactory5 is tested but selection adapters intentionally retained pending native history. Required m_nInsertFlags is stored by SwUndoInsert and forwarded on redo;current candidate FORCE grouping rejected,ordinary after forced accepted under bounded existing payload checks and grouped redo retains firstmode. Hyperlink adapter and2priorfixtures received5syntax-only DEFAULT constructor migrations.1547newcases cover real owner/mode/flags/lock/oldIgnore/empty/boundary/history/grouping/pending paths. Staticfirstformatpass/lintfailunusedtestimport;failedlint recovered,typefailnumericliteral5;native bitwise enumcombination fixed and failedtype recovered;remainingdependency/docs/size passed. Changedfixture formatting/lint passed. One full absent profile:buildpass,app9073pass/161fail of9234,100%allfourcoverage,inventory109/100%allfour,scripts5,Chromium99 firstpass. Exactly161failed full names captured in firstprofile;one old EMPTY historycase corrected from zero4..4 to active2..4 while preserving actual item,other185cases unchanged.160newempty undo matrixcases wrongly assumed ownership survives interior GC;native ndtxt.cxx2860 erasure removes zero hints strictly inside deleted range;literal masks now assert detachment and no reconstructed link on redo. Only161failedcases replayed once absent:161pass/1572skip of1733,zero passing case/suite/build replays. Productionunchanged after fullprofile. Finally restored reference before5sourceaudits,allpass0semanticviolations. Scope359prior files:356byteidentical,2ASTsyntax-only with expectations unchanged,1singleobservedhistorycase changed;242runtime rows/states/defaults/exceptions retained except3bounded appendices/onefactory mapping. Nine native hashes recorded;selectionbranch byte-identical. Initial scope-audit header path corrected to actual core/inc/rolbck.hxx without source or test changes/replays. APignored-inclusive3921files0forbidden;doctor0errors/two unchangedlegacywarnings;routingOK. Fullcore/UI/selectionhistory/managergrouping/redline/multicursor/indexoverloads/GCAttr/COPY/BuildPortions/families/styleclients/UNO/refcounts remain unverified;goal active,verifiedprogress,noexternalblocker.
