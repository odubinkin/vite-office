---
id: "202610241509-9N3MFW"
title: "Connect native Writer numbering object toolbar to active shell context"
status: "DOING"
priority: "high"
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
  updated_at: "2026-10-24T15:09:57.794Z"
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
    body: "Start: connect the existing native numbering object-bar resource to actual Writer context and bindings,verify related behavior,then close this one task and stop as requested."
events:
  -
    type: "status"
    at: "2026-10-24T15:10:02.714Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: connect the existing native numbering object-bar resource to actual Writer context and bindings,verify related behavior,then close this one task and stop as requested."
doc_version: 3
doc_updated_at: "2026-10-24T15:10:02.714Z"
doc_updated_by: "CODER"
description: "Human requests exactly one next task after6764KT,then stop again. Connect the existing generated numobjectbar resource and implemented promote/demote/continue-numbering commands to the Writer workspace. Preserve native NumberList context,table object-bar priority,source visibility/order and actual command state/focus/history. Work only in vite-office-writer on writer;no new core operations,network,other tasks or full suite. Up to16primary implementation/test paths plus paired canonical/task/generated records. Related unit/integration strict coverage,production Chromium1280/390,ODT/history and static/source gates;finish this task then pause goal."
sections:
  Summary: "Connect the existing native numbering object toolbar to the actual Writer shell context."
  Scope: "Only vite-office-writer branch writer. Up to16primary implementation/test paths plus paired canonical/task/generated records. Reuse numobjectbar.ts and actual command owners;preserve source visible flags/order and table toolbar priority in the shared object-bar slot. No fake list state,new kernel commands,network,merges,other tasks or full suite. Human authorized exactly one next task,then stop."
  Plan: "Add a browser Writer numbering object-bar presenter over the existing generated placements and frame bindings. Select it only for native NumberList context without a higher-priority table object bar;project into the existing bottom object-bar region. Preserve enabled state,document selection/focus and native history. Add integration/context/resource tests and production browser1280/390 editing/history/ODT regression. Update paired provenance,verify related coverage and source/build gates,commit,evaluate and close this one task;then pause the goal."
  Verify Steps: "Run focused Vitest for the new numbering presenter,Writer workspace/list command/context/history and resource owners. Require100%coverage for the new presenter and exercised new context branches without lowering thresholds or adding ignores. Verify real native command state at levels0/9,body versus table contexts,plain/list transitions,undo/redo and ODT round-trip. Run production build and focused Chromium1280/390 numbering toolbar scenarios with actual pointer focus/caret and no page errors. Run typecheck,scoped ESLint/Prettier,check:docs,check:dependencies,check:source-provenance,check:file-size,check:source-tree,check:writer-resources,registry build/invariants/parity,static smoke,doctor,routing and diff checks. No full run on this first task after the completed full checkpoint. Record EVALUATOR and clean task closure,then stop."
  Verification: "Pending implementation and focused verification."
  Rollback Plan: "Revert only this task commits;preserve existing user and other task work."
  Findings: "Native listsh.cxx registers Num_Toolbox at SFX_OBJECTBAR_OBJECT. Although the registration passes Invisible,CreateObjectBarUI_Impl converts it to Standard,and IsObjectBarVisible returns true. Native view.cxx pushes list below text and table shells;the table object bar wins the same position. Preserve this actual source behavior rather than inferring permanent hidden visibility from the enum name. Existing numobjectbar adapter already filters hidden bullet/number toggles;only promote,demote and continue-numbering are represented by visible supported commands."
id_source: "generated"
---
## Summary

Connect the existing native numbering object toolbar to the actual Writer shell context.

## Scope

Only vite-office-writer branch writer. Up to16primary implementation/test paths plus paired canonical/task/generated records. Reuse numobjectbar.ts and actual command owners;preserve source visible flags/order and table toolbar priority in the shared object-bar slot. No fake list state,new kernel commands,network,merges,other tasks or full suite. Human authorized exactly one next task,then stop.

## Plan

Add a browser Writer numbering object-bar presenter over the existing generated placements and frame bindings. Select it only for native NumberList context without a higher-priority table object bar;project into the existing bottom object-bar region. Preserve enabled state,document selection/focus and native history. Add integration/context/resource tests and production browser1280/390 editing/history/ODT regression. Update paired provenance,verify related coverage and source/build gates,commit,evaluate and close this one task;then pause the goal.

## Verify Steps

Run focused Vitest for the new numbering presenter,Writer workspace/list command/context/history and resource owners. Require100%coverage for the new presenter and exercised new context branches without lowering thresholds or adding ignores. Verify real native command state at levels0/9,body versus table contexts,plain/list transitions,undo/redo and ODT round-trip. Run production build and focused Chromium1280/390 numbering toolbar scenarios with actual pointer focus/caret and no page errors. Run typecheck,scoped ESLint/Prettier,check:docs,check:dependencies,check:source-provenance,check:file-size,check:source-tree,check:writer-resources,registry build/invariants/parity,static smoke,doctor,routing and diff checks. No full run on this first task after the completed full checkpoint. Record EVALUATOR and clean task closure,then stop.

## Verification

Pending implementation and focused verification.

## Rollback Plan

Revert only this task commits;preserve existing user and other task work.

## Findings

Native listsh.cxx registers Num_Toolbox at SFX_OBJECTBAR_OBJECT. Although the registration passes Invisible,CreateObjectBarUI_Impl converts it to Standard,and IsObjectBarVisible returns true. Native view.cxx pushes list below text and table shells;the table object bar wins the same position. Preserve this actual source behavior rather than inferring permanent hidden visibility from the enum name. Existing numobjectbar adapter already filters hidden bullet/number toggles;only promote,demote and continue-numbering are represented by visible supported commands.
