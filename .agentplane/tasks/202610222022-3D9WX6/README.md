---
id: "202610222022-3D9WX6"
title: "Connect native AutoSum and formula-bar input actions"
status: "DOING"
priority: "high"
owner: "CODER"
revision: 10
origin:
  system: "manual"
depends_on: []
tags:
  - "calc"
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-22T20:22:59.117Z"
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
    body: "Start: implement the approved native AutoSum and formula-bar input block in the current calc checkout."
events:
  -
    type: "status"
    at: "2026-10-22T20:23:13.842Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implement the approved native AutoSum and formula-bar input block in the current calc checkout."
doc_version: 3
doc_updated_at: "2026-10-22T20:23:13.842Z"
doc_updated_by: "CODER"
description: "Block74 after73: implement original ordinary AutoSum classification/search/range construction and selected-block insertion through native token/view/input owners. Enable real Sum and correct StartFormula/SetFuncString source text selection in the shared-style Calc formula bar. Preserve native detection priorities,20-cell seek bound,sum-of-sums,empty-selection behavior,history and ODS persistence. No browser evaluator or ad-hoc range inference. Existing unported filtered/subtotal/group/3D services stay explicit and do not receive fabricated state. Scope up to80 source/test/registry/probe paths in Calc and any genuinely shared consumed owners. Require complete Calc raw100 and changed shared raw100,related tests,actual UI/browser/Worker checks and static/build/source/registry gates. Full all-app checkpoint80."
sections:
  Summary: "Connect native AutoSum and formula-bar text/selection actions to the existing live Calc document and shared Writer-style controls."
  Scope: "Block74:ordinary native AutoSum token classification,20-cell directional seek,sum-of-sums,range construction,selected-block insertion,StartFormula/SetFuncString and browser focus/caret routing. Up to80 source/test/registry/probe paths;no branch/worktree changes,external writes or network. Native unported filtered/subtotal/group/3D services stay explicit;do not fabricate service state."
  Plan: "Read complete original consumed token/view/input methods;port real range inference and formula construction first,then native default block insertion/history and input selection,then expose Sum/Formula actions in existing shared-style presenters. Verify source boundary/priority vectors,actual document/history/ODS,mounted caret/focus behavior,Calc and changed shared raw100 and static/build/browser/registry gates. Full all-app checkpoint remains80."
  Verify Steps: "Native vectors must cover directional priority,20-cell seek cutoff,adjacent outer-function references,sum-of-sums,empty/text/error cells,selected single/multi blocks and sheet/coordinate boundaries. Actual UI Sum and Formula actions must preserve source draft/selection/focus,commit/cancel,live recalculation,Undo/Redo and ODS save/reopen. Run complete Calc raw100 S/B/F/L with unchanged thresholds,changed shared owner raw100 and related consumers,actual browser/Worker,production build and all type/lint/format/boundary/JSDoc/size/source/provenance/registry/resource/static/routing/doctor gates. No full all-app run before80."
  Verification: "Pending implementation and acceptance checks."
  Rollback Plan: "Revert task-owned implementation commits only,preserving integrated user changes and completed prior work."
  Findings: "Block73 provides real range compilation/area recalculation. Current Sum button is disabled and Formula action inserts a bare equals without native content-dependent text selection. Native source includes selected-block and sum-of-sums semantics which must be preserved rather than replaced with a contiguous-column heuristic."
id_source: "generated"
---
## Summary

Connect native AutoSum and formula-bar text/selection actions to the existing live Calc document and shared Writer-style controls.

## Scope

Block74:ordinary native AutoSum token classification,20-cell directional seek,sum-of-sums,range construction,selected-block insertion,StartFormula/SetFuncString and browser focus/caret routing. Up to80 source/test/registry/probe paths;no branch/worktree changes,external writes or network. Native unported filtered/subtotal/group/3D services stay explicit;do not fabricate service state.

## Plan

Read complete original consumed token/view/input methods;port real range inference and formula construction first,then native default block insertion/history and input selection,then expose Sum/Formula actions in existing shared-style presenters. Verify source boundary/priority vectors,actual document/history/ODS,mounted caret/focus behavior,Calc and changed shared raw100 and static/build/browser/registry gates. Full all-app checkpoint remains80.

## Verify Steps

Native vectors must cover directional priority,20-cell seek cutoff,adjacent outer-function references,sum-of-sums,empty/text/error cells,selected single/multi blocks and sheet/coordinate boundaries. Actual UI Sum and Formula actions must preserve source draft/selection/focus,commit/cancel,live recalculation,Undo/Redo and ODS save/reopen. Run complete Calc raw100 S/B/F/L with unchanged thresholds,changed shared owner raw100 and related consumers,actual browser/Worker,production build and all type/lint/format/boundary/JSDoc/size/source/provenance/registry/resource/static/routing/doctor gates. No full all-app run before80.

## Verification

Pending implementation and acceptance checks.

## Rollback Plan

Revert task-owned implementation commits only,preserving integrated user changes and completed prior work.

## Findings

Block73 provides real range compilation/area recalculation. Current Sum button is disabled and Formula action inserts a bare equals without native content-dependent text selection. Native source includes selected-block and sum-of-sums semantics which must be preserved rather than replaced with a contiguous-column heuristic.
