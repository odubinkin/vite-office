---
id: "202610192240-89YNKC"
title: "Implement native Calc grow and shrink font UI with shared script-set items"
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
doc_updated_at: "2026-10-19T22:40:31.521Z"
doc_updated_by: "CODER"
description: "Task41 of the authorized Calc UI goal after verified full checkpoint40. Port the source-shaped consumed SvxScriptSetItem contract and native ScFormatShell grow/shrink size dispatch,wire actual source slots to shared Writer menu/toolbar components and current selection/history/ODS paths;preserve native script/default/limit quirks and document suspected issues. Only vite-office-calc branch calc;targeted Calc100 and related/current-owner100 tests,no full repeat before checkpoint50."
sections:
  Summary: "Task41 implements actual Grow/Shrink Font UI commands after completed full checkpoint40. Previous goal turn made verified progress:task40 closed8fb7d8848b3d,implementationf7ecba6fabe5,1040files17215application cases raw100,inventory/tooling/browser gates pass,and clean calc tree. Overall UI goal remains active."
  Scope: "Only /Users/odubinkin/Projects/vite-office-calc branch calc. Up to60non-task paths for shared editeng script-set item and necessary existing SVL contracts,native Calc format/script/selection/undo dispatch,presentation command inventory and existing shared Writer menu/toolbar reuse,ODS/browser tests and accurate capability/runtime/provenance records. Change simplified common/Writer consumers directly if the consumed native contract requires it. Preserve current browser primary-save/open/no-recovery policy. No branch,merge,network,outside-repo access or full native service/layout emulation. No coverage weakening or broad parity promotion."
  Plan: "Audit pinned textitem.cxx/scriptsetitem.hxx and ScFormatShell grow/shrink ExecuteAttr/GetAttrState plus numeric SDI/resource identities. Port shared SvxScriptSetItem with source state/default/clone/script equality/Which mapping;extend existing shared set contracts canonically only where required. Connect native +/-40twip size operation,source19998maximum/40minimum and exact selected-script behavior to actual Calc pattern/history owners. Bind source command URLs through existing Sfx interface and shared Writer UI placements;preserve source no-op/mixed/argument behavior and document suspicious upstream logic. Test all script combinations,default/mixed/null states,limits/unsigned cases,selection/history/ODS and actual browser UI. Run Calc raw100,complete changed-owner raw100 and affected tests/types/lint/resource/source gates;retain source/command/raw/browser evidence,quality review and clean close. Next full checkpoint50."
  Verify Steps: "Read ap task verify-show and pinned source with line/hash anchors. Execute npm run test:coverage:calc with raw JSON/text and configured S/B/F/L100. Execute related shared/Writer unit cases and raw complete changed executable owners100,combining only identical source/maps if needed;no empty evidence or threshold/exclusion reductions. Verify SvxScriptSetItem all native script combinations and SET/DEFAULT/DONTCARE/UNKNOWN cases,clone/ranges/mapping;Calc +/-2pt script-specific items and proportion metadata,full/partial/grouped selections,mixed/no-op/limit/uint32 cases,pending input,real undo/redo and ODS Worker roundtrip. Run types,changed/full authored-source lint/format respecting existing ignored generated artifacts,dependencies,JSDoc,size,Calc/Writer resources,source tree/provenance,inventory invariants/parity,routing/doctor and affected tooling where changed. Fresh build and focused Calc/shared browser scenarios at1280/390 demonstrating actual source UI actions and history/reopen,no uncaught exceptions. Preserve exact command exits/counts,raw coverage/current hashes,source audit and source-shaped capability records. git diff --check,quality review and clean final calc status. Full all-app checkpoint40 just passed;next50,no full repeat in task41."
  Verification: "Pending implementation and acceptance evidence."
  Rollback Plan: "Revert only intentional task41 implementation commits if necessary;retain source/verification evidence and unrelated tasks. Do not change branches or merge,user owns integration."
  Findings: "Preflight direct mode,calc branch,clean tracked/untracked tree. Unrelated C9TN6M/X6VV8G/Z7BW2Y tasks remain untouched. Existing user authorization covers safe local UI/core/shared work and checkpoint cadence. Pinned9bc445578031fecf56086729d8e4940c77e14d65 formatsh.cxx907..938 uses actual SvxScriptSetItem,selected script flags,40twip increments and19998twip upper bound. Shared itempool already exposes original GetWhichIDFromSlotID;native script-set class is not yet ported. Do not substitute Latin-only or all-script size changes for source selection behavior."
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

Preflight direct mode,calc branch,clean tracked/untracked tree. Unrelated C9TN6M/X6VV8G/Z7BW2Y tasks remain untouched. Existing user authorization covers safe local UI/core/shared work and checkpoint cadence. Pinned9bc445578031fecf56086729d8e4940c77e14d65 formatsh.cxx907..938 uses actual SvxScriptSetItem,selected script flags,40twip increments and19998twip upper bound. Shared itempool already exposes original GetWhichIDFromSlotID;native script-set class is not yet ported. Do not substitute Latin-only or all-script size changes for source selection behavior.
