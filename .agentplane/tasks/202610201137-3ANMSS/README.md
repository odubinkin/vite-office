---
id: "202610201137-3ANMSS"
title: "Implement native Calc cell border toolbar and ODS workflows"
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
  updated_at: "2026-10-20T11:38:11.138Z"
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
    body: "Start: implement approved native Calc border toolbar,selection history and ODS block in calc."
events:
  -
    type: "status"
    at: "2026-10-20T11:38:22.075Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implement approved native Calc border toolbar,selection history and ODS block in calc."
doc_version: 3
doc_updated_at: "2026-10-20T12:10:47.712Z"
doc_updated_by: "CODER"
description: "Task48 continues authorized Calc UI work only in calc checkout/branch. Deliver native cell border presets,line style/color and actual selection-frame mutation/history,using real shared box/line items,source default frame line and shared Writer browser controls. Port consumed missing border pool/cache/frame/mark owners and native ODS properties;actual grid borders and desktop/mobile/Worker acceptance. Canonicalize shared Writer helpers directly when required. Up to180 non-task paths with source-backed registries/docs/tests. Preserve native suspicious behavior and established primary/autosave/open/no-recovery policy. Only related module tests;last full all-app checkpoint40,next50. No branch,merge,network,outside files or fake native protection/device/UNO services."
sections:
  Summary: "Task48 delivers native Calc cell-border toolbar workflows over actual source attributes,selection frames,history and ODS,using the existing shared Writer visual controls. Task47 completed indentation/manual-row geometry and is verified progress on the continuing goal."
  Scope: "Only vite-office-calc on calc;up to180 non-task paths. Native cell border pool items,ScItemPoolCache and consumed frame-array/column/table/document/view/shell/history owners;actual default frame-line state and source border preset/style/color semantics;shared Writer toolbar/popup/color/presentation primitives and canonical common helpers where needed;real grid border projection;native ODF border conversion;source-backed tests,registry and documentation. Preserve native defaults,validity flags,adjacent-cell removal,grouped/disjoint marks and suspicious upstream behavior. Real existing model owners only. Unported protection,matrix/rich-edit,device/painting,outline and complete UNO/window services remain explicit;do not replace them with fake services. Preserve primary/autosave/open/no-recovery behavior. No branch/worktree,merge,network,outside files or unrelated task mutations."
  Plan: "Deliver native Calc border presets/style/color,actual selection-frame/cache/history and ODS through shared Writer controls;verify affected modules and desktop/mobile/Worker,record evidence and clean direct closure. Up to180 non-task paths;only calc,no merges/network/outside files;full all-app checkpoint50."
  Verify Steps: "Inspect pinned native pool/default/cache/frame/preset/style/color/ODS source. Related tests must prove real box/info items,validity masks,outer/inner/single-row/single-column and disjoint/grouped selection semantics,pattern coalescing,actual adjacent-cell envelope removal,real undo/redo and unchanged cell values;source default frame line,zero-width marker replacement,preset modifier and style/color ordering. Preserve native row/column geometry and source selection behavior. Independent ODF fixtures and actual ZIP package reopens verify borders and unsupported-property diagnostics. Focused browser cases exercise shared Writer controls,menus/popups,keyboard/cancel/outside handling,1280/390,actual DOM-free Worker and ODS. Run only affected Calc/shared/Writer module tests and relevant tooling;full all-app checkpoint40 remains last,next50,no blanket coverage run. Types,authored lint/format,boundaries,JSDoc,size,Calc/Writer resources,source/provenance,invariants/scoped parity,production/static build,routing,doctor,diff must pass. Retain exact commands/exits,nonempty test results,current source/test hashes,native anchors and inspected screenshots. Record implementation commit,verification,quality review and clean final tracked state."
  Verification: "Pending implementation and scoped evidence;no broad native parity claim."
  Rollback Plan: "Revert only this task through a separately scoped authorized change;do not reset unrelated work or alter pinned native references."
  Findings: |-
    Preflight clean calc with three unrelated DOING tasks left untouched. Real shared border/line items and Writer controls already exist;Calc currently lacks ATTR_BORDER/INNER pool defaults and consumed native selection-frame/cache/mutation paths. Existing actual ScMarkData envelope owners will be reused for native adjacent-cell behavior. User authorization covers canonical changes to common Writer modules. This coherent visible UI block is within the continuing approved goal;no new approval is required.

    Progress checkpoint: real frame/cache/pool/view-shell and envelope-aware native attribute history are implemented;147 related scenarios pass across11files (Calc27/shared31/Writer89). Types,changed-source lint/format,dependencies,JSDoc,size,source tree/provenance and scoped Calc registry pass. CALC227 documents source rectangular Redo dropping adjacent envelopes;the source order is retained. Core first test run exposed this original behavior;the test now independently asserts both selected and adjacent edges. Full task verification is pending toolbar/style/color/diagonal dispatch,grid projection,ODS and browser acceptance. Evidence: evidence/frame-foundation-progress.json. No full all-app test run or task-count checkpoint advancement. The three old DOING entries are historical audit/test-run/deferred-language records,not live parallel Calc work;they remain untouched.
id_source: "generated"
---
## Summary

Task48 delivers native Calc cell-border toolbar workflows over actual source attributes,selection frames,history and ODS,using the existing shared Writer visual controls. Task47 completed indentation/manual-row geometry and is verified progress on the continuing goal.

## Scope

Only vite-office-calc on calc;up to180 non-task paths. Native cell border pool items,ScItemPoolCache and consumed frame-array/column/table/document/view/shell/history owners;actual default frame-line state and source border preset/style/color semantics;shared Writer toolbar/popup/color/presentation primitives and canonical common helpers where needed;real grid border projection;native ODF border conversion;source-backed tests,registry and documentation. Preserve native defaults,validity flags,adjacent-cell removal,grouped/disjoint marks and suspicious upstream behavior. Real existing model owners only. Unported protection,matrix/rich-edit,device/painting,outline and complete UNO/window services remain explicit;do not replace them with fake services. Preserve primary/autosave/open/no-recovery behavior. No branch/worktree,merge,network,outside files or unrelated task mutations.

## Plan

Deliver native Calc border presets/style/color,actual selection-frame/cache/history and ODS through shared Writer controls;verify affected modules and desktop/mobile/Worker,record evidence and clean direct closure. Up to180 non-task paths;only calc,no merges/network/outside files;full all-app checkpoint50.

## Verify Steps

Inspect pinned native pool/default/cache/frame/preset/style/color/ODS source. Related tests must prove real box/info items,validity masks,outer/inner/single-row/single-column and disjoint/grouped selection semantics,pattern coalescing,actual adjacent-cell envelope removal,real undo/redo and unchanged cell values;source default frame line,zero-width marker replacement,preset modifier and style/color ordering. Preserve native row/column geometry and source selection behavior. Independent ODF fixtures and actual ZIP package reopens verify borders and unsupported-property diagnostics. Focused browser cases exercise shared Writer controls,menus/popups,keyboard/cancel/outside handling,1280/390,actual DOM-free Worker and ODS. Run only affected Calc/shared/Writer module tests and relevant tooling;full all-app checkpoint40 remains last,next50,no blanket coverage run. Types,authored lint/format,boundaries,JSDoc,size,Calc/Writer resources,source/provenance,invariants/scoped parity,production/static build,routing,doctor,diff must pass. Retain exact commands/exits,nonempty test results,current source/test hashes,native anchors and inspected screenshots. Record implementation commit,verification,quality review and clean final tracked state.

## Verification

Pending implementation and scoped evidence;no broad native parity claim.

## Rollback Plan

Revert only this task through a separately scoped authorized change;do not reset unrelated work or alter pinned native references.

## Findings

Preflight clean calc with three unrelated DOING tasks left untouched. Real shared border/line items and Writer controls already exist;Calc currently lacks ATTR_BORDER/INNER pool defaults and consumed native selection-frame/cache/mutation paths. Existing actual ScMarkData envelope owners will be reused for native adjacent-cell behavior. User authorization covers canonical changes to common Writer modules. This coherent visible UI block is within the continuing approved goal;no new approval is required.

Progress checkpoint: real frame/cache/pool/view-shell and envelope-aware native attribute history are implemented;147 related scenarios pass across11files (Calc27/shared31/Writer89). Types,changed-source lint/format,dependencies,JSDoc,size,source tree/provenance and scoped Calc registry pass. CALC227 documents source rectangular Redo dropping adjacent envelopes;the source order is retained. Core first test run exposed this original behavior;the test now independently asserts both selected and adjacent edges. Full task verification is pending toolbar/style/color/diagonal dispatch,grid projection,ODS and browser acceptance. Evidence: evidence/frame-foundation-progress.json. No full all-app test run or task-count checkpoint advancement. The three old DOING entries are historical audit/test-run/deferred-language records,not live parallel Calc work;they remain untouched.
