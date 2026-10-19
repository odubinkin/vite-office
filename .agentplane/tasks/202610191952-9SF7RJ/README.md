---
id: "202610191952-9SF7RJ"
title: "Connect shared color palettes to Calc font and cell-background attributes"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 5
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-19T19:53:26.332Z"
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
    body: "Start: implement the authorized shared color palette/native Calc color and background UI slice with genuine item,history,recent-color and ODS ownership;scoped raw100 gates and fresh browser evidence,calc checkout only."
events:
  -
    type: "status"
    at: "2026-10-19T19:53:31.830Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implement the authorized shared color palette/native Calc color and background UI slice with genuine item,history,recent-color and ODS ownership;scoped raw100 gates and fresh browser evidence,calc checkout only."
doc_version: 3
doc_updated_at: "2026-10-19T19:53:31.830Z"
doc_updated_by: "CODER"
description: "Task38 of the active Calc UI goal. Reuse the actual Writer color palette in shared SVX; implement source-shaped color/background command state and application, document-owned recent-color values, native item/history ownership, cell painting and real ODS properties. Correct simplified common owners as authorized by the user. Work only in vite-office-calc on calc; no merges or network. Scoped Calc100 and related complete changed-owner100; full all-app next task40."
sections:
  Summary: "Task38 connects the actual Writer palette to Calc Font Color and Background Color using shared browser ownership and native document items. Previous goal turn made verified progress:task37 completed,commit f8583d20a4af,clean calc checkout,Calc353cases and related11822cases plus19browser cases passed."
  Scope: "Only /Users/odubinkin/Projects/vite-office-calc on calc. Up to95 non-task paths covering shared SVX color palette/component/data and Writer callers/facades/tests;existing shared command-placement/bindings rendering ports;source-shaped SfxObjectShell recent color/NamedColor and actual broadcaster ownership;Calc color/background slots,controller/format owner,grid painting,XML style contexts and shared consumed property handlers;focused/native/ODS/browser tests;affected source/runtime/capability registries,boundary rules and readiness/suspected-issue documentation. Correct simplified shared/Writer owners within the user's explicit authorization. No network,outside-repo reads,other checkouts,branches,merges,recovery or primary-save behavior changes. No unrelated constructor/service dependency programme. Full native parity stays unverified beyond consumed operations."
  Plan: "Task38: connect actual shared Writer/SVX color palettes to native Calc Font Color and Background Color,source-shaped full item/recent-color/broadcaster ownership,sparse selection/history,painting and genuine ODS properties. Correct common/Writer simplifications as explicitly authorized. Up to95non-task paths described in README Scope;no network/other checkouts/merges. Whole Calc and complete changed executable owners raw S/B/F/L100,related tests,fresh1280/390 browser/source/inventory/quality evidence and clean calc closure. Full all-app next task40. Overall UI goal remains active."
  Verify Steps: "Run npm run test:coverage:calc with nonempty raw S/B/F/L100 and complete changed executable application-owner100 without new exclusions or threshold changes. Test real shared palette and Writer reuse,native Color/ComplexColor/NamedColor copies and recent-color notification/default contracts,color/background state,mixed/default/script-independent application,actual sparse/grouped/full-axis selections,no-op/invalid requests/failed input and retained attribute undo. Test source brush metadata retention and real ODS bytes/repeated reopen plus independently authored supported color/background XML and explicit unsupported metadata diagnostics. Compare consumed source functions/defaults against pinned local upstream9bc445578031fecf56086729d8e4940c77e14d65 and retain concrete evidence. Run related shared/Writer/ODF tests with current source-matched owner hashes. Fresh build and browser1280/390 including actual UI palette selection,cell CSS,history and no exceptions. Root/app types,changed-path ESLint/Prettier,JSDoc,size/tree/provenance/dependencies,resources,affected Calc/shared/Writer inventories,static smoke,doctor,routing,diff;record raw evidence and quality review;clean calc tree. Full all-app regression next task40 under user cadence."
  Verification: "Pending implementation and required source-matched evidence. No acceptance claim yet."
  Rollback Plan: "Revert only this task's intentional implementation commit(s) on calc if needed;retain task evidence and preserve other tasks. Do not merge/reset other branches or change primary-save/recovery deviations."
  Findings: "Preflight:workflow direct;network approval required and unused;tree clean;branch calc. Unrelated active tasks C9TN6M,X6VV8G,Z7BW2Y remain untouched. Existing WriterColorControl owns local React recent colors;Calc upstream uses SfxObjectShell GetRecentColor/SetRecentColor with NamedColor and ColorsChanged broadcast. Actual SvxColorItem,SvxBrushItem,Color,ComplexColor and shared XML color handlers already exist. Calc's current toolbar exposes unavailable color placements. The native broadcaster role must be owned by the shared shell rather than a second Calc-only notifications graph;the existing browser SfxShell command protocol is not a full native shell implementation. Full theme/style/device/layout/service parity is not assumed."
id_source: "generated"
---
## Summary

Task38 connects the actual Writer palette to Calc Font Color and Background Color using shared browser ownership and native document items. Previous goal turn made verified progress:task37 completed,commit f8583d20a4af,clean calc checkout,Calc353cases and related11822cases plus19browser cases passed.

## Scope

Only /Users/odubinkin/Projects/vite-office-calc on calc. Up to95 non-task paths covering shared SVX color palette/component/data and Writer callers/facades/tests;existing shared command-placement/bindings rendering ports;source-shaped SfxObjectShell recent color/NamedColor and actual broadcaster ownership;Calc color/background slots,controller/format owner,grid painting,XML style contexts and shared consumed property handlers;focused/native/ODS/browser tests;affected source/runtime/capability registries,boundary rules and readiness/suspected-issue documentation. Correct simplified shared/Writer owners within the user's explicit authorization. No network,outside-repo reads,other checkouts,branches,merges,recovery or primary-save behavior changes. No unrelated constructor/service dependency programme. Full native parity stays unverified beyond consumed operations.

## Plan

Task38: connect actual shared Writer/SVX color palettes to native Calc Font Color and Background Color,source-shaped full item/recent-color/broadcaster ownership,sparse selection/history,painting and genuine ODS properties. Correct common/Writer simplifications as explicitly authorized. Up to95non-task paths described in README Scope;no network/other checkouts/merges. Whole Calc and complete changed executable owners raw S/B/F/L100,related tests,fresh1280/390 browser/source/inventory/quality evidence and clean calc closure. Full all-app next task40. Overall UI goal remains active.

## Verify Steps

Run npm run test:coverage:calc with nonempty raw S/B/F/L100 and complete changed executable application-owner100 without new exclusions or threshold changes. Test real shared palette and Writer reuse,native Color/ComplexColor/NamedColor copies and recent-color notification/default contracts,color/background state,mixed/default/script-independent application,actual sparse/grouped/full-axis selections,no-op/invalid requests/failed input and retained attribute undo. Test source brush metadata retention and real ODS bytes/repeated reopen plus independently authored supported color/background XML and explicit unsupported metadata diagnostics. Compare consumed source functions/defaults against pinned local upstream9bc445578031fecf56086729d8e4940c77e14d65 and retain concrete evidence. Run related shared/Writer/ODF tests with current source-matched owner hashes. Fresh build and browser1280/390 including actual UI palette selection,cell CSS,history and no exceptions. Root/app types,changed-path ESLint/Prettier,JSDoc,size/tree/provenance/dependencies,resources,affected Calc/shared/Writer inventories,static smoke,doctor,routing,diff;record raw evidence and quality review;clean calc tree. Full all-app regression next task40 under user cadence.

## Verification

Pending implementation and required source-matched evidence. No acceptance claim yet.

## Rollback Plan

Revert only this task's intentional implementation commit(s) on calc if needed;retain task evidence and preserve other tasks. Do not merge/reset other branches or change primary-save/recovery deviations.

## Findings

Preflight:workflow direct;network approval required and unused;tree clean;branch calc. Unrelated active tasks C9TN6M,X6VV8G,Z7BW2Y remain untouched. Existing WriterColorControl owns local React recent colors;Calc upstream uses SfxObjectShell GetRecentColor/SetRecentColor with NamedColor and ColorsChanged broadcast. Actual SvxColorItem,SvxBrushItem,Color,ComplexColor and shared XML color handlers already exist. Calc's current toolbar exposes unavailable color placements. The native broadcaster role must be owned by the shared shell rather than a second Calc-only notifications graph;the existing browser SfxShell command protocol is not a full native shell implementation. Full theme/style/device/layout/service parity is not assumed.
