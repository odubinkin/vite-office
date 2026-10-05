---
id: "202610051914-CV1DG4"
title: "Apply selected lists through native document rule operations"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 9
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
  - "lists"
  - "parity"
task_kind: "code"
mutation_scope: "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-05T19:14:16.536Z"
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
    body: "Start: selected native document list operations and obsolete history-layer removal under standing authorization."
events:
  -
    type: "status"
    at: "2026-10-05T19:14:17.827Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: selected native document list operations and obsolete history-layer removal under standing authorization."
doc_version: 3
doc_updated_at: "2026-10-05T19:14:17.827Z"
doc_updated_by: "CODER"
description: "Iteration161 repair selected-range list application with source-shaped bounded SwDoc.SetNumRule/SetCounted and remove redundant shell/direct-list history layers. Implement native SetNumRuleMode0/1/2/4/8 flags, document rule lookup/add/assignment, explicit continued/new list identity, actual inclusive native textnodes, collapsed existing/style rule directitem policy, DontSetIfAlreadyApplied and label-alignment-only indent reset; mark modified/modeltransaction. Nativelayout/merged/marginpropagation/documentowned undo/client/SwHistory excluded andremainunverified. Shell listtoggle applies to all selected body/cell/mixed nodes, native preceding-rule search from point withnonempty0 or existingautomaticrule factory, per-command native SfxListUndoAction records actual before/after numeric InsNum entries after initial docmutation; current original cursor retained. None uses existing native DelNumRules. Continue uses same document SetNumRule/SetCounted and numeric InsNum history instead of obsolete ContinueNumbering action/iteminterface; GetKind selectedrange consensus for toggle/checkedstate. Remove abstract SwUndoParagraphList; SwUndoInsNum own numeric target/originaldocguard and independent existing item snapshots/publicsingle-node input preserved for clipboard/Enter contracts. No new helper/sharedmodule/adapter/DTO/TextRuns/legacyoverload. Native SetNumRule history/delta/client/Repeat stillunverified; no fullmodulepromotion.10scopepaths doc/unnum/listsh,3old tests source-confirmed API/actiongroup migration only preservingsemantic assertions,newnative-rule-range test,newChromium selectedlisttoggle test,2metadata/additive3owners.414prior testfiles preserve411byte-identical and3bounded API migrations,250states/defaults/classifications/consciousIO exceptions/prior evidence preserved. Source/default/rule identity/flags/indents/currentnative range/cursor/history/replacement/neighbors/foreignguard and actualselectedbrowser body/table menu/labels/UndoRedo evidence. Sixstatics first;ONEfull upstream-absent build/app/inventory/scripts/Chromium profile, vendor repository rename try/finally restore before5sourceaudits. Exactfailures/errors persisted beforeassertions,onlyfailed/new cases/gates repeated,skipped=skipped,no passingtest/fullprofile replays;actualapp/inventory100%L/S/F/B. Maps/results onlyignoredappcache; AP boundedEnglishcounts/hashes/exactfailednames/outcomes/prose,no sources/helpers/Python/probes/binaries/rawdiffs/sourceframes/diagnostics. Sameagent explicit EVALUATOR exactsemanticSHApass, recordedverify/meaningfulfinish/parentcheckpoint cleanmain. Standingiterativeuserauthorization,no network/outside/global/subagents. ParentDOING/goalactive."
sections:
  Summary: "Iteration161 repair selected-range list application with source-shaped bounded SwDoc.SetNumRule/SetCounted and remove redundant shell/direct-list history layers. Implement native SetNumRuleMode0/1/2/4/8 flags, document rule lookup/add/assignment, explicit continued/new list identity, actual inclusive native textnodes, collapsed existing/style rule directitem policy, DontSetIfAlreadyApplied and label-alignment-only indent reset; mark modified/modeltransaction. Nativelayout/merged/marginpropagation/documentowned undo/client/SwHistory excluded andremainunverified. Shell listtoggle applies to all selected body/cell/mixed nodes, native preceding-rule search from point withnonempty0 or existingautomaticrule factory, per-command native SfxListUndoAction records actual before/after numeric InsNum entries after initial docmutation; current original cursor retained. None uses existing native DelNumRules. Continue uses same document SetNumRule/SetCounted and numeric InsNum history instead of obsolete ContinueNumbering action/iteminterface; GetKind selectedrange consensus for toggle/checkedstate. Remove abstract SwUndoParagraphList; SwUndoInsNum own numeric target/originaldocguard and independent existing item snapshots/publicsingle-node input preserved for clipboard/Enter contracts. No new helper/sharedmodule/adapter/DTO/TextRuns/legacyoverload. Native SetNumRule history/delta/client/Repeat stillunverified; no fullmodulepromotion.10scopepaths doc/unnum/listsh,3old tests source-confirmed API/actiongroup migration only preservingsemantic assertions,newnative-rule-range test,newChromium selectedlisttoggle test,2metadata/additive3owners.414prior testfiles preserve411byte-identical and3bounded API migrations,250states/defaults/classifications/consciousIO exceptions/prior evidence preserved. Source/default/rule identity/flags/indents/currentnative range/cursor/history/replacement/neighbors/foreignguard and actualselectedbrowser body/table menu/labels/UndoRedo evidence. Sixstatics first;ONEfull upstream-absent build/app/inventory/scripts/Chromium profile, vendor repository rename try/finally restore before5sourceaudits. Exactfailures/errors persisted beforeassertions,onlyfailed/new cases/gates repeated,skipped=skipped,no passingtest/fullprofile replays;actualapp/inventory100%L/S/F/B. Maps/results onlyignoredappcache; AP boundedEnglishcounts/hashes/exactfailednames/outcomes/prose,no sources/helpers/Python/probes/binaries/rawdiffs/sourceframes/diagnostics. Sameagent explicit EVALUATOR exactsemanticSHApass, recordedverify/meaningfulfinish/parentcheckpoint cleanmain. Standingiterativeuserauthorization,no network/outside/global/subagents. ParentDOING/goalactive."
  Scope: |-
    apps/office/src/sw/source/core/doc/doc.ts
    apps/office/src/sw/source/core/undo/unnum.ts
    apps/office/src/sw/source/uibase/shells/listsh.ts
    apps/office/src/sw/source/core/undo/native-list-continuation.test.ts
    apps/office/src/sw/source/uibase/shells/listsh-odt.test.ts
    apps/office/src/sw/source/core/undo/undobj.test.ts
    apps/office/src/sw/source/core/undo/native-list-rule-range.test.ts
    apps/office/e2e/writer-selected-list-toggle.spec.ts
    docs/program/source-provenance.json
    docs/program/parity/runtime-inventory.json
    Parenttrace202609240501-C9TN6M;standing explicititerativeuserauthorization,oneatomicleaf.
  Plan: "Iteration161 repair selected-range list application with source-shaped bounded SwDoc.SetNumRule/SetCounted and remove redundant shell/direct-list history layers. Implement native SetNumRuleMode0/1/2/4/8 flags, document rule lookup/add/assignment, explicit continued/new list identity, actual inclusive native textnodes, collapsed existing/style rule directitem policy, DontSetIfAlreadyApplied and label-alignment-only indent reset; mark modified/modeltransaction. Nativelayout/merged/marginpropagation/documentowned undo/client/SwHistory excluded andremainunverified. Shell listtoggle applies to all selected body/cell/mixed nodes, native preceding-rule search from point withnonempty0 or existingautomaticrule factory, per-command native SfxListUndoAction records actual before/after numeric InsNum entries after initial docmutation; current original cursor retained. None uses existing native DelNumRules. Continue uses same document SetNumRule/SetCounted and numeric InsNum history instead of obsolete ContinueNumbering action/iteminterface; GetKind selectedrange consensus for toggle/checkedstate. Remove abstract SwUndoParagraphList; SwUndoInsNum own numeric target/originaldocguard and independent existing item snapshots/publicsingle-node input preserved for clipboard/Enter contracts. No new helper/sharedmodule/adapter/DTO/TextRuns/legacyoverload. Native SetNumRule history/delta/client/Repeat stillunverified; no fullmodulepromotion.10scopepaths doc/unnum/listsh,3old tests source-confirmed API/actiongroup migration only preservingsemantic assertions,newnative-rule-range test,newChromium selectedlisttoggle test,2metadata/additive3owners.414prior testfiles preserve411byte-identical and3bounded API migrations,250states/defaults/classifications/consciousIO exceptions/prior evidence preserved. Source/default/rule identity/flags/indents/currentnative range/cursor/history/replacement/neighbors/foreignguard and actualselectedbrowser body/table menu/labels/UndoRedo evidence. Sixstatics first;ONEfull upstream-absent build/app/inventory/scripts/Chromium profile, vendor repository rename try/finally restore before5sourceaudits. Exactfailures/errors persisted beforeassertions,onlyfailed/new cases/gates repeated,skipped=skipped,no passingtest/fullprofile replays;actualapp/inventory100%L/S/F/B. Maps/results onlyignoredappcache; AP boundedEnglishcounts/hashes/exactfailednames/outcomes/prose,no sources/helpers/Python/probes/binaries/rawdiffs/sourceframes/diagnostics. Sameagent explicit EVALUATOR exactsemanticSHApass, recordedverify/meaningfulfinish/parentcheckpoint cleanmain. Standingiterativeuserauthorization,no network/outside/global/subagents. ParentDOING/goalactive."
  Verify Steps: |-
    1. Six statics first: npm run format:check; npm run lint; npm run typecheck; npm run check:dependencies; npm run check:docs; npm run check:file-size. Only failed gates/changed-file remediation repeated.
    2. ONE sequential upstream-absent profile: npm run test:static; npm run test:coverage --workspace @vite-office/office -- --coverage.reportOnFailure; npm run test:inventory:coverage -- --coverage.reportOnFailure; npm exec -- vitest run scripts/check-source-provenance.test.ts scripts/writer-ui-resource-model.test.ts; npm exec -- playwright test --config apps/office/playwright.config.ts. Vendor rename in repository try/finally restore before source audits; tests never invoke/access upstream. Persist exact failures/errors before assertions, failed/new-only repeats, skipped=skipped. Actual app/inventory L/S/F/B100%; maps only ignored appcache.
    3. Native document rule0/1/2/4/8flags, lookup/add/assignment/listID, collapsed direct/style rule policy, inclusive body/cell/mixed ranges, counted reset, indent reset only labelalignment;actualshell toggle/continue grouped currentnumeric InsNum history,cursor/native replacement/independence/foreigndoc/neighbors.414prior testfiles:411byteidentical,3bounded source-confirmed API/actiongroup corrections;250states/defaults/classifications/consciousIOexceptions/prior evidence preserved;10paths/additive3owners. ActualChromium selectedrange labels/menu/undo/redo/currentcaret. Fullnative SwHistory/documentundo/client/layout/merged/Repeat/broadUI unverified.
    4. After restoration: npm exec -- tsx scripts/generate-writer-ui-resources.ts --check; npm run check:source-tree; npm run check:source-provenance; npm run inventory:invariants; npm run inventory:parity. Scope/prior tests/defaults/APartifact audit,doctor/routing, same-agent explicit EVALUATOR exact semantic SHApass,recordedverify/meaningfulfinish/parentcheckpoint clean main.
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert only semanticcommit. Vendor restoredfinally; preserve all prior native contracts/conscious save/open/recovery deviations."
  Findings: "Read-only sourceconfirmed docnum SetNumRule/SetCounted +doc.hxx SetNumRuleMode0/1/2/4/8; wrtsh1 NumOrBulletOn/Off selection search/application and ednumber SetCurNumRule countedreset; unnum SwUndoInsNum native coordinates/rule/history. Local listtoggle onlyactiveparagraph, createWriterListItemSet body-only prior; InsNum shallow abstract retainsnode; ContinueNumbering obsolete separatetuple action. Current pinnedrequirements require documentrange mutation and actualexecutedattributehistory; full native registered history/documentundo/client remainsunverified."
id_source: "generated"
---
## Summary

Iteration161 repair selected-range list application with source-shaped bounded SwDoc.SetNumRule/SetCounted and remove redundant shell/direct-list history layers. Implement native SetNumRuleMode0/1/2/4/8 flags, document rule lookup/add/assignment, explicit continued/new list identity, actual inclusive native textnodes, collapsed existing/style rule directitem policy, DontSetIfAlreadyApplied and label-alignment-only indent reset; mark modified/modeltransaction. Nativelayout/merged/marginpropagation/documentowned undo/client/SwHistory excluded andremainunverified. Shell listtoggle applies to all selected body/cell/mixed nodes, native preceding-rule search from point withnonempty0 or existingautomaticrule factory, per-command native SfxListUndoAction records actual before/after numeric InsNum entries after initial docmutation; current original cursor retained. None uses existing native DelNumRules. Continue uses same document SetNumRule/SetCounted and numeric InsNum history instead of obsolete ContinueNumbering action/iteminterface; GetKind selectedrange consensus for toggle/checkedstate. Remove abstract SwUndoParagraphList; SwUndoInsNum own numeric target/originaldocguard and independent existing item snapshots/publicsingle-node input preserved for clipboard/Enter contracts. No new helper/sharedmodule/adapter/DTO/TextRuns/legacyoverload. Native SetNumRule history/delta/client/Repeat stillunverified; no fullmodulepromotion.10scopepaths doc/unnum/listsh,3old tests source-confirmed API/actiongroup migration only preservingsemantic assertions,newnative-rule-range test,newChromium selectedlisttoggle test,2metadata/additive3owners.414prior testfiles preserve411byte-identical and3bounded API migrations,250states/defaults/classifications/consciousIO exceptions/prior evidence preserved. Source/default/rule identity/flags/indents/currentnative range/cursor/history/replacement/neighbors/foreignguard and actualselectedbrowser body/table menu/labels/UndoRedo evidence. Sixstatics first;ONEfull upstream-absent build/app/inventory/scripts/Chromium profile, vendor repository rename try/finally restore before5sourceaudits. Exactfailures/errors persisted beforeassertions,onlyfailed/new cases/gates repeated,skipped=skipped,no passingtest/fullprofile replays;actualapp/inventory100%L/S/F/B. Maps/results onlyignoredappcache; AP boundedEnglishcounts/hashes/exactfailednames/outcomes/prose,no sources/helpers/Python/probes/binaries/rawdiffs/sourceframes/diagnostics. Sameagent explicit EVALUATOR exactsemanticSHApass, recordedverify/meaningfulfinish/parentcheckpoint cleanmain. Standingiterativeuserauthorization,no network/outside/global/subagents. ParentDOING/goalactive.

## Scope

apps/office/src/sw/source/core/doc/doc.ts
apps/office/src/sw/source/core/undo/unnum.ts
apps/office/src/sw/source/uibase/shells/listsh.ts
apps/office/src/sw/source/core/undo/native-list-continuation.test.ts
apps/office/src/sw/source/uibase/shells/listsh-odt.test.ts
apps/office/src/sw/source/core/undo/undobj.test.ts
apps/office/src/sw/source/core/undo/native-list-rule-range.test.ts
apps/office/e2e/writer-selected-list-toggle.spec.ts
docs/program/source-provenance.json
docs/program/parity/runtime-inventory.json
Parenttrace202609240501-C9TN6M;standing explicititerativeuserauthorization,oneatomicleaf.

## Plan

Iteration161 repair selected-range list application with source-shaped bounded SwDoc.SetNumRule/SetCounted and remove redundant shell/direct-list history layers. Implement native SetNumRuleMode0/1/2/4/8 flags, document rule lookup/add/assignment, explicit continued/new list identity, actual inclusive native textnodes, collapsed existing/style rule directitem policy, DontSetIfAlreadyApplied and label-alignment-only indent reset; mark modified/modeltransaction. Nativelayout/merged/marginpropagation/documentowned undo/client/SwHistory excluded andremainunverified. Shell listtoggle applies to all selected body/cell/mixed nodes, native preceding-rule search from point withnonempty0 or existingautomaticrule factory, per-command native SfxListUndoAction records actual before/after numeric InsNum entries after initial docmutation; current original cursor retained. None uses existing native DelNumRules. Continue uses same document SetNumRule/SetCounted and numeric InsNum history instead of obsolete ContinueNumbering action/iteminterface; GetKind selectedrange consensus for toggle/checkedstate. Remove abstract SwUndoParagraphList; SwUndoInsNum own numeric target/originaldocguard and independent existing item snapshots/publicsingle-node input preserved for clipboard/Enter contracts. No new helper/sharedmodule/adapter/DTO/TextRuns/legacyoverload. Native SetNumRule history/delta/client/Repeat stillunverified; no fullmodulepromotion.10scopepaths doc/unnum/listsh,3old tests source-confirmed API/actiongroup migration only preservingsemantic assertions,newnative-rule-range test,newChromium selectedlisttoggle test,2metadata/additive3owners.414prior testfiles preserve411byte-identical and3bounded API migrations,250states/defaults/classifications/consciousIO exceptions/prior evidence preserved. Source/default/rule identity/flags/indents/currentnative range/cursor/history/replacement/neighbors/foreignguard and actualselectedbrowser body/table menu/labels/UndoRedo evidence. Sixstatics first;ONEfull upstream-absent build/app/inventory/scripts/Chromium profile, vendor repository rename try/finally restore before5sourceaudits. Exactfailures/errors persisted beforeassertions,onlyfailed/new cases/gates repeated,skipped=skipped,no passingtest/fullprofile replays;actualapp/inventory100%L/S/F/B. Maps/results onlyignoredappcache; AP boundedEnglishcounts/hashes/exactfailednames/outcomes/prose,no sources/helpers/Python/probes/binaries/rawdiffs/sourceframes/diagnostics. Sameagent explicit EVALUATOR exactsemanticSHApass, recordedverify/meaningfulfinish/parentcheckpoint cleanmain. Standingiterativeuserauthorization,no network/outside/global/subagents. ParentDOING/goalactive.

## Verify Steps

1. Six statics first: npm run format:check; npm run lint; npm run typecheck; npm run check:dependencies; npm run check:docs; npm run check:file-size. Only failed gates/changed-file remediation repeated.
2. ONE sequential upstream-absent profile: npm run test:static; npm run test:coverage --workspace @vite-office/office -- --coverage.reportOnFailure; npm run test:inventory:coverage -- --coverage.reportOnFailure; npm exec -- vitest run scripts/check-source-provenance.test.ts scripts/writer-ui-resource-model.test.ts; npm exec -- playwright test --config apps/office/playwright.config.ts. Vendor rename in repository try/finally restore before source audits; tests never invoke/access upstream. Persist exact failures/errors before assertions, failed/new-only repeats, skipped=skipped. Actual app/inventory L/S/F/B100%; maps only ignored appcache.
3. Native document rule0/1/2/4/8flags, lookup/add/assignment/listID, collapsed direct/style rule policy, inclusive body/cell/mixed ranges, counted reset, indent reset only labelalignment;actualshell toggle/continue grouped currentnumeric InsNum history,cursor/native replacement/independence/foreigndoc/neighbors.414prior testfiles:411byteidentical,3bounded source-confirmed API/actiongroup corrections;250states/defaults/classifications/consciousIOexceptions/prior evidence preserved;10paths/additive3owners. ActualChromium selectedrange labels/menu/undo/redo/currentcaret. Fullnative SwHistory/documentundo/client/layout/merged/Repeat/broadUI unverified.
4. After restoration: npm exec -- tsx scripts/generate-writer-ui-resources.ts --check; npm run check:source-tree; npm run check:source-provenance; npm run inventory:invariants; npm run inventory:parity. Scope/prior tests/defaults/APartifact audit,doctor/routing, same-agent explicit EVALUATOR exact semantic SHApass,recordedverify/meaningfulfinish/parentcheckpoint clean main.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert only semanticcommit. Vendor restoredfinally; preserve all prior native contracts/conscious save/open/recovery deviations.

## Findings

Read-only sourceconfirmed docnum SetNumRule/SetCounted +doc.hxx SetNumRuleMode0/1/2/4/8; wrtsh1 NumOrBulletOn/Off selection search/application and ednumber SetCurNumRule countedreset; unnum SwUndoInsNum native coordinates/rule/history. Local listtoggle onlyactiveparagraph, createWriterListItemSet body-only prior; InsNum shallow abstract retainsnode; ContinueNumbering obsolete separatetuple action. Current pinnedrequirements require documentrange mutation and actualexecutedattributehistory; full native registered history/documentundo/client remainsunverified.
