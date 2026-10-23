---
id: "202610231236-VTS2VJ"
title: "Implement native formula reference pointing and mouse selection"
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
  updated_at: "2026-10-23T12:36:38.858Z"
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
    body: "Start: implement the human-prioritized native mouse reference entry and selection block in calc before continuing76."
events:
  -
    type: "status"
    at: "2026-10-23T12:36:45.771Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implement the human-prioritized native mouse reference entry and selection block in calc before continuing76."
doc_version: 3
doc_updated_at: "2026-10-23T12:36:45.771Z"
doc_updated_by: "CODER"
description: "Block77 is the human-requested next priority ahead of pending76: implement upstream ScInputHandler reference entry and ScTabView reference mode over real draft/caret/view/mark owners,then browser mouse cells/ranges/row/column/full-sheet and modifier selection. Preserve edit origin,UTF16 replacement selection,formula equals protection,reference continuation,drag lifetime,focus,commit/cancel,visual reference and ordinary selection distinctions. Support maximum source-backed pointing and selection scenarios within the current local-reference core;do not simulate clipboard fill/move,matrix,merged or external-reference services. Up to110 source/test/registry/evidence-probe paths,only vite-office-calc branch calc. Keep Writer shared controls/styles. Require real controller/mounted/Chromium/Worker scenarios,Calc and changed shared raw100,related consumers,build and all static/source/registry checks. No full all-app replay before the established checkpoint80."
sections:
  Summary: "Make mouse reference entry usable while editing formulas and implement source-backed mouse selection for cells,ranges,rows and columns."
  Scope: "Human-prioritized block77 ahead of open76. Native input/reference/view/mark contracts plus browser pointer,capture,hit-testing,scroll/focus/caret and reference overlays using shared Writer styling. Up to110 source/test/registry/evidence-probe paths,only calc checkout/branch. Local-reference supported formula domain;unported clipboard fill/move,merged,external/3D/matrix calculation services remain explicit. No network,outside-repo access or merges."
  Plan: "Port original input reference selection/continuation and view reference anchor/end state first;bind actual controlled editor selection to those contracts. Route formula pointing before ordinary Commit. Add drag/capture/scroll and header reference/range selection,then native modifier and ordinary selection scenarios with distinct reference painting. Verify exact source vectors,actual controller/history/formula results and mounted/Chromium/DOM-free Worker interactions. Achieve unchanged raw100 for Calc and changed shared owners and run related/build/static/source/registry gates. Keep76/74 open until their own acceptance;full all-app cadence80."
  Verify Steps: "Test source-shaped SetReference/AddRefEntry and reference view lifetime with actual owners:UTF16/reversed selections,never overwrite equals,successive click replacement,drag forward/backward,single/range/full-axis references,operator/separator continuation,existing/formula-bar/inline edits,commit/cancel/error recovery. Test ordinary cell/header mouse selection,Shift range extension,Ctrl/Cmd disjoint selection and deselection,drag endpoints,capture cancellation,scroll/hidden geometry and edit-origin/focus preservation. Exercise calculation,Undo/Redo and ODS reopen after pointing-created formulas. Actual mounted React and Chromium/DOM-free Worker must verify pointer/caret/painting contracts. Run complete Calc and changed shared raw100 S/B/F/L without threshold/exclusion changes,related consumers,production build,and type/lint/format/boundaries/JSDoc/size/source/provenance/registry/resources/static/routing/doctor. No full all-app run before80."
  Verification: "Pending;read-only source discovery confirms ordinary controller Select commits the draft before pointer reference entry and native reference owners are not yet ported."
  Rollback Plan: "Revert only task77 implementation commits while preserving75,76 checkpoint and integrated user changes."
  Findings: "Human explicitly prioritizes mouse formula reference entry and maximum upstream mouse selection next. Source inputhdl SetReference inserts selected native range text and retains bSelIsRef;AddRefEntry removes that selection and conditionally adds native separator. Source tabview4 keeps reference start/end separate from the edit cursor. Current browser calls ordinary Select/Commit on pointerdown and lacks drag selection,so it cannot preserve the formula draft during pointing. Work is independent of pending76 paste ownership."
id_source: "generated"
---
## Summary

Make mouse reference entry usable while editing formulas and implement source-backed mouse selection for cells,ranges,rows and columns.

## Scope

Human-prioritized block77 ahead of open76. Native input/reference/view/mark contracts plus browser pointer,capture,hit-testing,scroll/focus/caret and reference overlays using shared Writer styling. Up to110 source/test/registry/evidence-probe paths,only calc checkout/branch. Local-reference supported formula domain;unported clipboard fill/move,merged,external/3D/matrix calculation services remain explicit. No network,outside-repo access or merges.

## Plan

Port original input reference selection/continuation and view reference anchor/end state first;bind actual controlled editor selection to those contracts. Route formula pointing before ordinary Commit. Add drag/capture/scroll and header reference/range selection,then native modifier and ordinary selection scenarios with distinct reference painting. Verify exact source vectors,actual controller/history/formula results and mounted/Chromium/DOM-free Worker interactions. Achieve unchanged raw100 for Calc and changed shared owners and run related/build/static/source/registry gates. Keep76/74 open until their own acceptance;full all-app cadence80.

## Verify Steps

Test source-shaped SetReference/AddRefEntry and reference view lifetime with actual owners:UTF16/reversed selections,never overwrite equals,successive click replacement,drag forward/backward,single/range/full-axis references,operator/separator continuation,existing/formula-bar/inline edits,commit/cancel/error recovery. Test ordinary cell/header mouse selection,Shift range extension,Ctrl/Cmd disjoint selection and deselection,drag endpoints,capture cancellation,scroll/hidden geometry and edit-origin/focus preservation. Exercise calculation,Undo/Redo and ODS reopen after pointing-created formulas. Actual mounted React and Chromium/DOM-free Worker must verify pointer/caret/painting contracts. Run complete Calc and changed shared raw100 S/B/F/L without threshold/exclusion changes,related consumers,production build,and type/lint/format/boundaries/JSDoc/size/source/provenance/registry/resources/static/routing/doctor. No full all-app run before80.

## Verification

Pending;read-only source discovery confirms ordinary controller Select commits the draft before pointer reference entry and native reference owners are not yet ported.

## Rollback Plan

Revert only task77 implementation commits while preserving75,76 checkpoint and integrated user changes.

## Findings

Human explicitly prioritizes mouse formula reference entry and maximum upstream mouse selection next. Source inputhdl SetReference inserts selected native range text and retains bSelIsRef;AddRefEntry removes that selection and conditionally adds native separator. Source tabview4 keeps reference start/end separate from the edit cursor. Current browser calls ordinary Select/Commit on pointerdown and lacks drag selection,so it cannot preserve the formula draft during pointing. Work is independent of pending76 paste ownership.
