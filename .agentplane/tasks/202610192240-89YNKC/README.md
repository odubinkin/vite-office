---
id: "202610192240-89YNKC"
title: "Implement native Calc grow and shrink font UI with shared script-set items"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 11
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-19T22:40:26.493Z"
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
    body: "Start: implement native shared script-set items and Calc grow/shrink font UI under existing authorization;retain original selected-script/default/limit behavior and raw100 evidence,calc checkout only."
events:
  -
    type: "status"
    at: "2026-10-19T22:40:31.521Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implement native shared script-set items and Calc grow/shrink font UI under existing authorization;retain original selected-script/default/limit behavior and raw100 evidence,calc checkout only."
doc_version: 3
doc_updated_at: "2026-10-19T23:41:01.139Z"
doc_updated_by: "CODER"
description: "Task41 of the authorized Calc UI goal after verified full checkpoint40. Port the source-shaped consumed SvxScriptSetItem contract and native ScFormatShell grow/shrink size dispatch,wire actual source slots to shared Writer menu/toolbar components and current selection/history/ODS paths;preserve native script/default/limit quirks and document suspected issues. Only vite-office-calc branch calc;targeted Calc100 and related/current-owner100 tests,no full repeat before checkpoint50."
sections:
  Summary: "Task41 implements actual Grow/Shrink Font UI commands after completed full checkpoint40. Previous goal turn made verified progress:task40 closed8fb7d8848b3d,implementationf7ecba6fabe5,1040files17215application cases raw100,inventory/tooling/browser gates pass,and clean calc tree. Overall UI goal remains active."
  Scope: "Only /Users/odubinkin/Projects/vite-office-calc branch calc. Up to60non-task paths for shared editeng script-set item and necessary existing SVL contracts,native Calc format/script/selection/undo dispatch,presentation command inventory and existing shared Writer menu/toolbar reuse,ODS/browser tests and accurate capability/runtime/provenance records. Change simplified common/Writer consumers directly if the consumed native contract requires it. Preserve current browser primary-save/open/no-recovery policy. No branch,merge,network,outside-repo access or full native service/layout emulation. No coverage weakening or broad parity promotion."
  Plan: "Audit pinned textitem.cxx/scriptsetitem.hxx and ScFormatShell grow/shrink ExecuteAttr/GetAttrState plus numeric SDI/resource identities. Port shared SvxScriptSetItem with source state/default/clone/script equality/Which mapping;extend existing shared set contracts canonically only where required. Connect native +/-40twip size operation,source19998maximum/40minimum and exact selected-script behavior to actual Calc pattern/history owners. Bind source command URLs through existing Sfx interface and shared Writer UI placements;preserve source no-op/mixed/argument behavior and document suspicious upstream logic. Test all script combinations,default/mixed/null states,limits/unsigned cases,selection/history/ODS and actual browser UI. Run Calc raw100,complete changed-owner raw100 and affected tests/types/lint/resource/source gates;retain source/command/raw/browser evidence,quality review and clean close. Next full checkpoint50."
  Verify Steps: "Read ap task verify-show and pinned source with line/hash anchors. Execute npm run test:coverage:calc with raw JSON/text and configured S/B/F/L100. Execute related shared/Writer unit cases and raw complete changed executable owners100,combining only identical source/maps if needed;no empty evidence or threshold/exclusion reductions. Verify SvxScriptSetItem all native script combinations and SET/DEFAULT/DONTCARE/UNKNOWN cases,clone/ranges/mapping;Calc +/-2pt script-specific items and proportion metadata,full/partial/grouped selections,mixed/no-op/limit/uint32 cases,pending input,real undo/redo and ODS Worker roundtrip. Run types,changed/full authored-source lint/format respecting existing ignored generated artifacts,dependencies,JSDoc,size,Calc/Writer resources,source tree/provenance,inventory invariants/parity,routing/doctor and affected tooling where changed. Fresh build and focused Calc/shared browser scenarios at1280/390 demonstrating actual source UI actions and history/reopen,no uncaught exceptions. Preserve exact command exits/counts,raw coverage/current hashes,source audit and source-shaped capability records. git diff --check,quality review and clean final calc status. Full all-app checkpoint40 just passed;next50,no full repeat in task41."
  Verification: "Pending implementation and acceptance evidence."
  Rollback Plan: "Revert only intentional task41 implementation commits if necessary;retain source/verification evidence and unrelated tasks. Do not change branches or merge,user owns integration."
  Findings: |-
    Task41 follows the existing authorization exclusively in vite-office-calc branch calc. Native source audit is evidence/source-audit.json; standalone arithmetic witness is evidence/native-font-size-arithmetic.json. Shared SvxScriptSetItem and SfxItemSet MergeRange/MergeValues replace local script/equality shortcuts; Calc uses actual selection-pattern/default/invalid states and existing attribute/history/ODS owners. Whole-sheet queries clip only their copied marks to real typed-block content bounds, as pinned viewfunc.cxx; apply retains actual marks. Default formatobjectbar Grow/Shrink entries remain hidden and no English shortcut is invented. Actual shared Writer controls expose correct mixed/script size state and complete typed font-height requests; native dispatch slots11042/11043 are available. Suspected pinned behaviors CALC205..210 are preserved and documented.

    Command: scoped Calc coverage candidates and related shared/Writer owner coverage (exact commands and raw logs are retained in evidence). Result: earlier candidates exposed stale repeated-format Undo expectations, one duplicated local script-equality branch, then two missing native guard scenarios. Resolution: canonical shared ScriptSet reuse, source-backed Undo assertions and genuine empty-column/simple-plus-multi mark cases. No test/exclusion/threshold reduction. A final lint repair removes an overwritten initial variable assignment without changing the source loop. Fresh final Calc coverage is running against that final owner version. Shared final coverage retains all native SVL item tests plus the actual Writer format-notify consumer.

    Command: npm run build and focused Playwright Calc font-step/font-size/font-family/formatting-toolbar/alignment/colors/ods. Result: pass,14cases. Evidence: browser log and 1280/390 script-height screenshots. Page and DOM-free Worker use actual source owners,typed item metadata,Undo/Redo and native ODS; actual UI opens stored ODS,changes mixed sizes,waits for primary save,and reopens after reload. Initial two browser persistence assertions timed out at5s before the documented10s shared autosave cadence;20s polling passes with production policy unchanged. Shared menu/popup/font-value browser scenarios pass13cases across Writer/Calc and both widths. Uncaught page exceptions are asserted empty.

    Command: types,lint,JSDoc,format,resources,source/provenance,inventory,routing and doctor. Result: candidate gates identified missing test callback JSDoc,three test non-null assertions,a useless variable initializer,one native filename-split explanation and one reexport incorrectly listed as a local declaration. Resolution: meaningful comments,typed existing-table assertion,declaration without overwritten initializer,and accurate registry records; rerun required gates. Source provenance now passes925runtime owners;inventory semantic violations0. No scope/security/verification change;56non-task paths remain within approved60. Full all-app checkpoint40 remains the latest full regression;next checkpoint50.

    Residual boundaries: device metrics,rich edit,filtered and alternate sheet views,full native cache/border services and physical allocation order are unported;no broad parity flags are promoted. Existing range application uses actual native itemsets and real attributes;no alternate grid/snapshot or fake document provider. Formatting-only empty cells do not count as data. The browser table can have zero physical columns and reports the native initial empty-column bounds without allocating stores. Writer primary-save/open/no-recovery deviations remain. These limitations do not justify changing source defaults or adding unsupported textobjectbar controls.
id_source: "generated"
---
## Summary

Task41 implements actual Grow/Shrink Font UI commands after completed full checkpoint40. Previous goal turn made verified progress:task40 closed8fb7d8848b3d,implementationf7ecba6fabe5,1040files17215application cases raw100,inventory/tooling/browser gates pass,and clean calc tree. Overall UI goal remains active.

## Scope

Only /Users/odubinkin/Projects/vite-office-calc branch calc. Up to60non-task paths for shared editeng script-set item and necessary existing SVL contracts,native Calc format/script/selection/undo dispatch,presentation command inventory and existing shared Writer menu/toolbar reuse,ODS/browser tests and accurate capability/runtime/provenance records. Change simplified common/Writer consumers directly if the consumed native contract requires it. Preserve current browser primary-save/open/no-recovery policy. No branch,merge,network,outside-repo access or full native service/layout emulation. No coverage weakening or broad parity promotion.

## Plan

Audit pinned textitem.cxx/scriptsetitem.hxx and ScFormatShell grow/shrink ExecuteAttr/GetAttrState plus numeric SDI/resource identities. Port shared SvxScriptSetItem with source state/default/clone/script equality/Which mapping;extend existing shared set contracts canonically only where required. Connect native +/-40twip size operation,source19998maximum/40minimum and exact selected-script behavior to actual Calc pattern/history owners. Bind source command URLs through existing Sfx interface and shared Writer UI placements;preserve source no-op/mixed/argument behavior and document suspicious upstream logic. Test all script combinations,default/mixed/null states,limits/unsigned cases,selection/history/ODS and actual browser UI. Run Calc raw100,complete changed-owner raw100 and affected tests/types/lint/resource/source gates;retain source/command/raw/browser evidence,quality review and clean close. Next full checkpoint50.

## Verify Steps

Read ap task verify-show and pinned source with line/hash anchors. Execute npm run test:coverage:calc with raw JSON/text and configured S/B/F/L100. Execute related shared/Writer unit cases and raw complete changed executable owners100,combining only identical source/maps if needed;no empty evidence or threshold/exclusion reductions. Verify SvxScriptSetItem all native script combinations and SET/DEFAULT/DONTCARE/UNKNOWN cases,clone/ranges/mapping;Calc +/-2pt script-specific items and proportion metadata,full/partial/grouped selections,mixed/no-op/limit/uint32 cases,pending input,real undo/redo and ODS Worker roundtrip. Run types,changed/full authored-source lint/format respecting existing ignored generated artifacts,dependencies,JSDoc,size,Calc/Writer resources,source tree/provenance,inventory invariants/parity,routing/doctor and affected tooling where changed. Fresh build and focused Calc/shared browser scenarios at1280/390 demonstrating actual source UI actions and history/reopen,no uncaught exceptions. Preserve exact command exits/counts,raw coverage/current hashes,source audit and source-shaped capability records. git diff --check,quality review and clean final calc status. Full all-app checkpoint40 just passed;next50,no full repeat in task41.

## Verification

Pending implementation and acceptance evidence.

## Rollback Plan

Revert only intentional task41 implementation commits if necessary;retain source/verification evidence and unrelated tasks. Do not change branches or merge,user owns integration.

## Findings

Task41 follows the existing authorization exclusively in vite-office-calc branch calc. Native source audit is evidence/source-audit.json; standalone arithmetic witness is evidence/native-font-size-arithmetic.json. Shared SvxScriptSetItem and SfxItemSet MergeRange/MergeValues replace local script/equality shortcuts; Calc uses actual selection-pattern/default/invalid states and existing attribute/history/ODS owners. Whole-sheet queries clip only their copied marks to real typed-block content bounds, as pinned viewfunc.cxx; apply retains actual marks. Default formatobjectbar Grow/Shrink entries remain hidden and no English shortcut is invented. Actual shared Writer controls expose correct mixed/script size state and complete typed font-height requests; native dispatch slots11042/11043 are available. Suspected pinned behaviors CALC205..210 are preserved and documented.

Command: scoped Calc coverage candidates and related shared/Writer owner coverage (exact commands and raw logs are retained in evidence). Result: earlier candidates exposed stale repeated-format Undo expectations, one duplicated local script-equality branch, then two missing native guard scenarios. Resolution: canonical shared ScriptSet reuse, source-backed Undo assertions and genuine empty-column/simple-plus-multi mark cases. No test/exclusion/threshold reduction. A final lint repair removes an overwritten initial variable assignment without changing the source loop. Fresh final Calc coverage is running against that final owner version. Shared final coverage retains all native SVL item tests plus the actual Writer format-notify consumer.

Command: npm run build and focused Playwright Calc font-step/font-size/font-family/formatting-toolbar/alignment/colors/ods. Result: pass,14cases. Evidence: browser log and 1280/390 script-height screenshots. Page and DOM-free Worker use actual source owners,typed item metadata,Undo/Redo and native ODS; actual UI opens stored ODS,changes mixed sizes,waits for primary save,and reopens after reload. Initial two browser persistence assertions timed out at5s before the documented10s shared autosave cadence;20s polling passes with production policy unchanged. Shared menu/popup/font-value browser scenarios pass13cases across Writer/Calc and both widths. Uncaught page exceptions are asserted empty.

Command: types,lint,JSDoc,format,resources,source/provenance,inventory,routing and doctor. Result: candidate gates identified missing test callback JSDoc,three test non-null assertions,a useless variable initializer,one native filename-split explanation and one reexport incorrectly listed as a local declaration. Resolution: meaningful comments,typed existing-table assertion,declaration without overwritten initializer,and accurate registry records; rerun required gates. Source provenance now passes925runtime owners;inventory semantic violations0. No scope/security/verification change;56non-task paths remain within approved60. Full all-app checkpoint40 remains the latest full regression;next checkpoint50.

Residual boundaries: device metrics,rich edit,filtered and alternate sheet views,full native cache/border services and physical allocation order are unported;no broad parity flags are promoted. Existing range application uses actual native itemsets and real attributes;no alternate grid/snapshot or fake document provider. Formatting-only empty cells do not count as data. The browser table can have zero physical columns and reports the native initial empty-column bounds without allocating stores. Writer primary-save/open/no-recovery deviations remain. These limitations do not justify changing source defaults or adding unsupported textobjectbar controls.
