---
id: "202610191007-6DD2P4"
title: "Implement shared native popup pointer admission and submenu timers"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 6
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-19T10:08:21.310Z"
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
    body: "Start:implement shared original popup pointer movement admission and150ms submenu timer behavior without changing resource or command ownership."
events:
  -
    type: "status"
    at: "2026-10-19T10:08:26.816Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start:implement shared original popup pointer movement admission and150ms submenu timer behavior without changing resource or command ownership."
doc_version: 3
doc_updated_at: "2026-10-19T10:08:26.816Z"
doc_updated_by: "CODER"
description: "Task29 of approved Calc UI goal:replace immediate popup mouseenter/leave opening with source-shaped real mouse movement admission,first-move suppression,150ms highlight/submenu-close timers and mounted popup cleanup in the existing shared Writer/Calc CommandMenuBar. Preserve actual resource/command/focus owners and native disabled-item highlight behavior;no separate Calc menu or visual stack. Mouse enter alone must not open a submenu;keyboard/click remain immediate,hover opens without item preselection. Follow original MenuFloatingWindow ChangeHighlightItem/MouseMove/HighlightChanged/SubmenuClose ordering and preserve suspected source quirks in canonical ledger if found. Root menubar first-move/mnemonics and full platform MouseSettings are separate pending responsibilities. Verify source anchors and complete new/shared component raw100,related menu/Writer/Calc tests and wholeCalc100,browser actual movement/timing/focus,types/build/static/style/docs/provenance/inventories/doctor/routing. Only calc checkout/branch,offline,no merge;full all-app regression30."
sections:
  Summary: |-
    Implement shared native popup pointer admission and submenu timers

    Task29 of approved Calc UI goal:replace immediate popup mouseenter/leave opening with source-shaped real mouse movement admission,first-move suppression,150ms highlight/submenu-close timers and mounted popup cleanup in the existing shared Writer/Calc CommandMenuBar. Preserve actual resource/command/focus owners and native disabled-item highlight behavior;no separate Calc menu or visual stack. Mouse enter alone must not open a submenu;keyboard/click remain immediate,hover opens without item preselection. Follow original MenuFloatingWindow ChangeHighlightItem/MouseMove/HighlightChanged/SubmenuClose ordering and preserve suspected source quirks in canonical ledger if found. Root menubar first-move/mnemonics and full platform MouseSettings are separate pending responsibilities. Verify source anchors and complete new/shared component raw100,related menu/Writer/Calc tests and wholeCalc100,browser actual movement/timing/focus,types/build/static/style/docs/provenance/inventories/doctor/routing. Only calc checkout/branch,offline,no merge;full all-app regression30.
  Scope: |-
    - In scope: Task29 of approved Calc UI goal:replace immediate popup mouseenter/leave opening with source-shaped real mouse movement admission,first-move suppression,150ms highlight/submenu-close timers and mounted popup cleanup in the existing shared Writer/Calc CommandMenuBar. Preserve actual resource/command/focus owners and native disabled-item highlight behavior;no separate Calc menu or visual stack. Mouse enter alone must not open a submenu;keyboard/click remain immediate,hover opens without item preselection. Follow original MenuFloatingWindow ChangeHighlightItem/MouseMove/HighlightChanged/SubmenuClose ordering and preserve suspected source quirks in canonical ledger if found. Root menubar first-move/mnemonics and full platform MouseSettings are separate pending responsibilities. Verify source anchors and complete new/shared component raw100,related menu/Writer/Calc tests and wholeCalc100,browser actual movement/timing/focus,types/build/static/style/docs/provenance/inventories/doctor/routing. Only calc checkout/branch,offline,no merge;full all-app regression30.
    - Out of scope: unrelated refactors not required for "Implement shared native popup pointer admission and submenu timers".
  Plan: "Implement source-shaped popup pointer admission in one shared browser module and reuse it from the existing Writer/Calc CommandMenuPopup. Borrow actual mounted popup/entry DOM and original menu resources,retain original ChangeHighlightItem/HighlightChanged/SubmenuClose responsibilities,ignore enter-only events and first real move,delay hover admission and different-child closure by original150ms default,retain active child on parent leave at its original highlighted entry,cancel child-close on reentry,and dispose timers with popup lifetime. Keep keyboard and existing click paths immediate;root menubar pointer/mnemonics,full platform MouseSettings and native click-down parity remain explicitly pending. Use shared selected/highlight helpers and original command/focus dispatch owners;no Calc duplication or separate visual stack. Up to20non-task paths for shared source/helper,related tests,e2e and truthful foundation/unverified registry records,plus canonical ledger only for actual new upstream suspicions. Validate original source anchors and browser-backed state/timing traces,new/shared complete raw100,related menu/Writer/Calc tests and wholeCalc100;run targeted browser pointer/focus tests,types/build/static/style/docs/size/tree/dependencies/provenance/scopedinventories/doctor/routing. Existing user approval applies,only calc/offline/no merge,next full30."
  Verify Steps: "Check pinned original MenuFloatingWindow MouseMove,ChangeHighlightItem,HighlightChanged,SubmenuClose,destruction and MouseSettings default150 source anchors. Real shared popup tests must cover enter/first-move suppression,exact149/150ms admission,no hover preselection,keyboard/click immediacy,sibling/leaf/disabled transitions,retained active child on parent leave,delayed different-child close,reentry cancellation,empty/invalid highlighted entry,timer cleanup on close/unmount and nested ownership. Entire new module and full touched shared renderer raw100 S/B/F/L with related existing menu/Writer/Calc tests;wholeCalc100. Targeted actual-browser shared Writer/Calc pointer/focus acceptance and related existing menu browser tests. Types/build/static/style/docs/size/tree/dependencies/provenance/shared+Calc inventories/doctor/routing;no validation weakening. Record actual suspected upstream issues in canonical ledger without fixing source logic. Full all-app regression next30."
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert only active task shared pointer/renderer,tests,browser tests and provenance records;preserve prior source contracts,canonical ledger and unrelated task/user changes. No reset,merge,network or other checkout."
  Findings: ""
id_source: "generated"
---
## Summary

Implement shared native popup pointer admission and submenu timers

Task29 of approved Calc UI goal:replace immediate popup mouseenter/leave opening with source-shaped real mouse movement admission,first-move suppression,150ms highlight/submenu-close timers and mounted popup cleanup in the existing shared Writer/Calc CommandMenuBar. Preserve actual resource/command/focus owners and native disabled-item highlight behavior;no separate Calc menu or visual stack. Mouse enter alone must not open a submenu;keyboard/click remain immediate,hover opens without item preselection. Follow original MenuFloatingWindow ChangeHighlightItem/MouseMove/HighlightChanged/SubmenuClose ordering and preserve suspected source quirks in canonical ledger if found. Root menubar first-move/mnemonics and full platform MouseSettings are separate pending responsibilities. Verify source anchors and complete new/shared component raw100,related menu/Writer/Calc tests and wholeCalc100,browser actual movement/timing/focus,types/build/static/style/docs/provenance/inventories/doctor/routing. Only calc checkout/branch,offline,no merge;full all-app regression30.

## Scope

- In scope: Task29 of approved Calc UI goal:replace immediate popup mouseenter/leave opening with source-shaped real mouse movement admission,first-move suppression,150ms highlight/submenu-close timers and mounted popup cleanup in the existing shared Writer/Calc CommandMenuBar. Preserve actual resource/command/focus owners and native disabled-item highlight behavior;no separate Calc menu or visual stack. Mouse enter alone must not open a submenu;keyboard/click remain immediate,hover opens without item preselection. Follow original MenuFloatingWindow ChangeHighlightItem/MouseMove/HighlightChanged/SubmenuClose ordering and preserve suspected source quirks in canonical ledger if found. Root menubar first-move/mnemonics and full platform MouseSettings are separate pending responsibilities. Verify source anchors and complete new/shared component raw100,related menu/Writer/Calc tests and wholeCalc100,browser actual movement/timing/focus,types/build/static/style/docs/provenance/inventories/doctor/routing. Only calc checkout/branch,offline,no merge;full all-app regression30.
- Out of scope: unrelated refactors not required for "Implement shared native popup pointer admission and submenu timers".

## Plan

Implement source-shaped popup pointer admission in one shared browser module and reuse it from the existing Writer/Calc CommandMenuPopup. Borrow actual mounted popup/entry DOM and original menu resources,retain original ChangeHighlightItem/HighlightChanged/SubmenuClose responsibilities,ignore enter-only events and first real move,delay hover admission and different-child closure by original150ms default,retain active child on parent leave at its original highlighted entry,cancel child-close on reentry,and dispose timers with popup lifetime. Keep keyboard and existing click paths immediate;root menubar pointer/mnemonics,full platform MouseSettings and native click-down parity remain explicitly pending. Use shared selected/highlight helpers and original command/focus dispatch owners;no Calc duplication or separate visual stack. Up to20non-task paths for shared source/helper,related tests,e2e and truthful foundation/unverified registry records,plus canonical ledger only for actual new upstream suspicions. Validate original source anchors and browser-backed state/timing traces,new/shared complete raw100,related menu/Writer/Calc tests and wholeCalc100;run targeted browser pointer/focus tests,types/build/static/style/docs/size/tree/dependencies/provenance/scopedinventories/doctor/routing. Existing user approval applies,only calc/offline/no merge,next full30.

## Verify Steps

Check pinned original MenuFloatingWindow MouseMove,ChangeHighlightItem,HighlightChanged,SubmenuClose,destruction and MouseSettings default150 source anchors. Real shared popup tests must cover enter/first-move suppression,exact149/150ms admission,no hover preselection,keyboard/click immediacy,sibling/leaf/disabled transitions,retained active child on parent leave,delayed different-child close,reentry cancellation,empty/invalid highlighted entry,timer cleanup on close/unmount and nested ownership. Entire new module and full touched shared renderer raw100 S/B/F/L with related existing menu/Writer/Calc tests;wholeCalc100. Targeted actual-browser shared Writer/Calc pointer/focus acceptance and related existing menu browser tests. Types/build/static/style/docs/size/tree/dependencies/provenance/shared+Calc inventories/doctor/routing;no validation weakening. Record actual suspected upstream issues in canonical ledger without fixing source logic. Full all-app regression next30.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert only active task shared pointer/renderer,tests,browser tests and provenance records;preserve prior source contracts,canonical ledger and unrelated task/user changes. No reset,merge,network or other checkout.

## Findings
