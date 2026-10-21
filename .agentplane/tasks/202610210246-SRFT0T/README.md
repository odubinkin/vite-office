---
id: "202610210246-SRFT0T"
title: "Connect native Calc grid headers and formula view commands"
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
  updated_at: "2026-10-21T02:46:43.489Z"
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
    body: "Start: Implement approved original grid/header/formula view owners and shared menu rendering;preserve per-sheet/local/document boundaries and genuine editing state."
events:
  -
    type: "status"
    at: "2026-10-21T02:46:50.317Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: Implement approved original grid/header/formula view owners and shared menu rendering;preserve per-sheet/local/document boundaries and genuine editing state."
doc_version: 3
doc_updated_at: "2026-10-21T02:46:50.317Z"
doc_updated_by: "CODER"
description: "Block64: actual ScViewOptions boolean ownership/defaults/copy and document/view integration;source sheet-local grid flag,view header/formula toggle request contracts and states;shared View menu and real grid/formula projection. Preserve content/history/dirty/input ownership and explicitly unported native configuration/rendering/window services. Calc branch/checkout only;all Calc100 and related tests;next full checkpoint70."
sections:
  Summary: |-
    Connect native Calc grid headers and formula view commands

    Block64: actual ScViewOptions boolean ownership/defaults/copy and document/view integration;source sheet-local grid flag,view header/formula toggle request contracts and states;shared View menu and real grid/formula projection. Preserve content/history/dirty/input ownership and explicitly unported native configuration/rendering/window services. Calc branch/checkout only;all Calc100 and related tests;next full checkpoint70.
  Scope: "Three native View commands and consumed real owner chain:ScViewOptions boolean defaults/copy,ScDocument,ScViewData,ScTabViewShell,Sfx,controller,grid and same shared Writer menus. Up to22source/test files plus metadata/docs/evidence. Only calc branch/checkout. No publication/network/merge,unported window/config/color/object view services and ODS settings persistence stay explicit."
  Plan: "Implement original ScViewOptions boolean/default/copy subset,document-owned value and per-view copy;other object/color/drawing/configuration methods remain unported. Add sheet-local bShowGrid and original header/formula methods. Consume tabvwsh3/tabvwshf request/state cases in actual ScTabViewShell;native headers/formulas honor typed bool arguments,grid always inverts and ignores args as source. Expose3commands through existing Sfx and Writer View menu with correct state. Render headers without residual geometry and grid lines without hiding explicit borders;show formulas from actual formula cell without evaluating errors first. Preserve input/content/history/dirty/selected groups;new view copies document options,header changes only local and formula changes document snapshot. Up to22source/test files plus metadata/docs/evidence. Verify all Calc100,related consumers,real browser desktop/mobile and individually recorded mandatory gates. No native-service facade or persistence claim;full all-app70."
  Verify Steps: "Pin native viewopti.hxx/cxx,documen3.cxx,document constructor,viewdata.hxx/cxx,tabvwsh3/f/a,SDI/sc.hrc/resources and formula output source. Test all19boolean defaults/reset/copy,document assignment value identity,independent view copy,local header vs document formula,per-sheet grid including grouped sheets/unvisited tabs. Native typed bool args,true/false/repeat;grid ignores args and toggles only current sheet. Preserve content/formula/dirty/history/marks/cursor and editing draft. Actual shared View menu checkmarks,headers geometry/grid border preservation/formula/error display,reopening/new-view defaults. All Calc coverage100,related shared/Writer cases,production build/static,types,dependencies,JSDoc,size/tree/provenance/registry/resources,lint/format,routing/doctor,each individual exit recorded. Actual Chromium1280/390 menu/focus/grid/header/formula workflow. Immutable raw reports/source-native pins and portable audit;quality pass,clean tracked state. Full all-app checkpoint70."
  Verification: "Pending implementation and source-backed acceptance."
  Rollback Plan: "Revert only active task source commits,retain evidence and user history;no branch merge/reset."
  Findings: ""
id_source: "generated"
---
## Summary

Connect native Calc grid headers and formula view commands

Block64: actual ScViewOptions boolean ownership/defaults/copy and document/view integration;source sheet-local grid flag,view header/formula toggle request contracts and states;shared View menu and real grid/formula projection. Preserve content/history/dirty/input ownership and explicitly unported native configuration/rendering/window services. Calc branch/checkout only;all Calc100 and related tests;next full checkpoint70.

## Scope

Three native View commands and consumed real owner chain:ScViewOptions boolean defaults/copy,ScDocument,ScViewData,ScTabViewShell,Sfx,controller,grid and same shared Writer menus. Up to22source/test files plus metadata/docs/evidence. Only calc branch/checkout. No publication/network/merge,unported window/config/color/object view services and ODS settings persistence stay explicit.

## Plan

Implement original ScViewOptions boolean/default/copy subset,document-owned value and per-view copy;other object/color/drawing/configuration methods remain unported. Add sheet-local bShowGrid and original header/formula methods. Consume tabvwsh3/tabvwshf request/state cases in actual ScTabViewShell;native headers/formulas honor typed bool arguments,grid always inverts and ignores args as source. Expose3commands through existing Sfx and Writer View menu with correct state. Render headers without residual geometry and grid lines without hiding explicit borders;show formulas from actual formula cell without evaluating errors first. Preserve input/content/history/dirty/selected groups;new view copies document options,header changes only local and formula changes document snapshot. Up to22source/test files plus metadata/docs/evidence. Verify all Calc100,related consumers,real browser desktop/mobile and individually recorded mandatory gates. No native-service facade or persistence claim;full all-app70.

## Verify Steps

Pin native viewopti.hxx/cxx,documen3.cxx,document constructor,viewdata.hxx/cxx,tabvwsh3/f/a,SDI/sc.hrc/resources and formula output source. Test all19boolean defaults/reset/copy,document assignment value identity,independent view copy,local header vs document formula,per-sheet grid including grouped sheets/unvisited tabs. Native typed bool args,true/false/repeat;grid ignores args and toggles only current sheet. Preserve content/formula/dirty/history/marks/cursor and editing draft. Actual shared View menu checkmarks,headers geometry/grid border preservation/formula/error display,reopening/new-view defaults. All Calc coverage100,related shared/Writer cases,production build/static,types,dependencies,JSDoc,size/tree/provenance/registry/resources,lint/format,routing/doctor,each individual exit recorded. Actual Chromium1280/390 menu/focus/grid/header/formula workflow. Immutable raw reports/source-native pins and portable audit;quality pass,clean tracked state. Full all-app checkpoint70.

## Verification

Pending implementation and source-backed acceptance.

## Rollback Plan

Revert only active task source commits,retain evidence and user history;no branch merge/reset.

## Findings
