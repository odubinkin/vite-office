---
id: "202610201055-QMVA57"
title: "Implement native Calc cell indentation and manual row layout workflows"
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
  updated_at: "2026-10-20T10:57:50.388Z"
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
    body: "Start: continue direct-mode task in current checkout."
events:
  -
    type: "status"
    at: "2026-10-20T11:00:14.104Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: continue direct-mode task in current checkout."
doc_version: 3
doc_updated_at: "2026-10-20T11:00:14.104Z"
doc_updated_by: "CODER"
description: "Task47 continues the authorized Calc UI goal in calc checkout/branch. Deliver a coherent cell-layout block: original ChangeIndent attribute/document/operation/history chain with native width limits,shared menu/toolbar controls and ODS indentation;manual row height,hide/show and actual hidden/filtered row storage,source geometry copy/history,shared metric dialog and compressed grid/scroll projection. Generalize existing column machinery using original axis contracts. Preserve native quirks and intentional browser save/open/no-recovery policies. Run only related module tests and focused browser/static checks;full all-app checkpoint40 retained,next50. No branch/worktree,merge,network,outside files or fake device/UNO/protection services."
sections:
  Summary: "Task47 delivers a coherent cell-layout editing block: indentation and manual row height/visibility with native mutation/history,shared Writer presentation and actual ODS persistence. Previous goal turn completed task46 and is progress;three unrelated active tasks remain untouched."
  Scope: "Only vite-office-calc checkout on calc. Up to150 non-task paths: actual attribute,column,table,document,ChangeIndentOperation/ScUndoIndent chains;real hidden/filtered row segments and dimension copying;generalized width/height commands,metric dialog and geometry undo;shared Writer menu/toolbar/dialog controls;real row/indent grid projections;ODS native indent/row visibility/manual geometry;related source-backed fixtures,tests,registry and docs. Preserve native defaults,casts,filtered-selection rules and suspicious source behavior. No fake font/device/UNO/protection/drawing/outline/alternate-view services or optimal-layout emulation. Existing primary/autosave/open/no-recovery policies remain. No branches,merges,network,outside files or unrelated task edits."
  Plan: "Port real row hidden/filtered geometry and dimension history;port native indentation through attribute/document/operation/undo owners;generalize existing metric and row/column command adapters;connect shared Writer controls and real grid projection;preserve ODS;verify only related modules and focused browser/static checks,then review,commit and close."
  Verify Steps: "Inspect pinned source defaults/anchors. Related tests must prove native200twip indentation,alignment coercion,actual width limits,UInt16 casts,disjoint/grouped and filtered selection,genuine attribute history and unchanged cell values;row-height typed HMM/Int32 Row requests,metric min/max/default/current restoration,cancel/close;actual hidden/filtered row spans,show-filtered behavior,geometry/flag snapshots,manual flags,history,cursor skipping and compressed pixel inversion without zero division or million-row expansion. Independent ODS and real byte reopens preserve represented indent/manual row geometry/visibility and diagnose unsupported properties. Run focused Vitest suites for touched/shared callers and focused production-browser cases at1280/390 with ODS/Worker and column-control regression. Types,authored lint/format,dependency boundaries,JSDoc,size,Calc/Writer resources,source tree/provenance,invariants/scoped parity,affected tooling,static build,routing,doctor,diff. Retain exact commands/exits,nonempty results,current source/test hashes,native audit and screenshots. Latest user instruction requires only related-module tests between full checkpoints;no complete Calc/global or blanket coverage run is required. Last full all-app checkpoint40,next50. Record verification,implementation commit,quality review and clean direct closure."
  Verification: "Pending implementation and scoped evidence;no broad native application parity claim."
  Rollback Plan: "Revert only this task implementation/registration commits through a separately scoped authorized task;never reset unrelated changes or alter the pinned upstream reference."
  Findings: "Preflight clean calc after task46. Native indentation uses actual visible column widths and200twip steps,and may force explicit Left even when numeric indentation stays unchanged. Native row controls share ScViewFunc,ScUndoWidthOrHeight and ScMetricInputDlg with columns. Real filtered-row storage is needed for native show/selection semantics;no always-false filter service will be substituted. New user instructions authorize larger coherent tasks and only related tests between full checkpoints."
id_source: "generated"
---
## Summary

Task47 delivers a coherent cell-layout editing block: indentation and manual row height/visibility with native mutation/history,shared Writer presentation and actual ODS persistence. Previous goal turn completed task46 and is progress;three unrelated active tasks remain untouched.

## Scope

Only vite-office-calc checkout on calc. Up to150 non-task paths: actual attribute,column,table,document,ChangeIndentOperation/ScUndoIndent chains;real hidden/filtered row segments and dimension copying;generalized width/height commands,metric dialog and geometry undo;shared Writer menu/toolbar/dialog controls;real row/indent grid projections;ODS native indent/row visibility/manual geometry;related source-backed fixtures,tests,registry and docs. Preserve native defaults,casts,filtered-selection rules and suspicious source behavior. No fake font/device/UNO/protection/drawing/outline/alternate-view services or optimal-layout emulation. Existing primary/autosave/open/no-recovery policies remain. No branches,merges,network,outside files or unrelated task edits.

## Plan

Port real row hidden/filtered geometry and dimension history;port native indentation through attribute/document/operation/undo owners;generalize existing metric and row/column command adapters;connect shared Writer controls and real grid projection;preserve ODS;verify only related modules and focused browser/static checks,then review,commit and close.

## Verify Steps

Inspect pinned source defaults/anchors. Related tests must prove native200twip indentation,alignment coercion,actual width limits,UInt16 casts,disjoint/grouped and filtered selection,genuine attribute history and unchanged cell values;row-height typed HMM/Int32 Row requests,metric min/max/default/current restoration,cancel/close;actual hidden/filtered row spans,show-filtered behavior,geometry/flag snapshots,manual flags,history,cursor skipping and compressed pixel inversion without zero division or million-row expansion. Independent ODS and real byte reopens preserve represented indent/manual row geometry/visibility and diagnose unsupported properties. Run focused Vitest suites for touched/shared callers and focused production-browser cases at1280/390 with ODS/Worker and column-control regression. Types,authored lint/format,dependency boundaries,JSDoc,size,Calc/Writer resources,source tree/provenance,invariants/scoped parity,affected tooling,static build,routing,doctor,diff. Retain exact commands/exits,nonempty results,current source/test hashes,native audit and screenshots. Latest user instruction requires only related-module tests between full checkpoints;no complete Calc/global or blanket coverage run is required. Last full all-app checkpoint40,next50. Record verification,implementation commit,quality review and clean direct closure.

## Verification

Pending implementation and scoped evidence;no broad native application parity claim.

## Rollback Plan

Revert only this task implementation/registration commits through a separately scoped authorized task;never reset unrelated changes or alter the pinned upstream reference.

## Findings

Preflight clean calc after task46. Native indentation uses actual visible column widths and200twip steps,and may force explicit Left even when numeric indentation stays unchanged. Native row controls share ScViewFunc,ScUndoWidthOrHeight and ScMetricInputDlg with columns. Real filtered-row storage is needed for native show/selection semantics;no always-false filter service will be substituted. New user instructions authorize larger coherent tasks and only related tests between full checkpoints.
