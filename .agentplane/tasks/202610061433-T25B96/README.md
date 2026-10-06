---
id: "202610061433-T25B96"
title: "Move table mouse pointer policy into the native edit window"
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
  updated_at: "2026-10-06T14:34:36.708Z"
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
    body: "Start: implement approved native edit-window table pointer ownership and exact platform glyph projection under standing iterative user authorization."
events:
  -
    type: "status"
    at: "2026-10-06T14:34:37.149Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implement approved native edit-window table pointer ownership and exact platform glyph projection under standing iterative user authorization."
doc_version: 3
doc_updated_at: "2026-10-06T14:34:37.149Z"
doc_updated_by: "CODER"
description: "Iteration189 under C9TN6M: remove browser-owned SwTab pointer policy, restore native IsTableMode/changeMousePointer decisions, and render native table selection cursor masks/hotspots. Resize drag itself, object hit arbitration, and vertical/RTL layout remain unverified. Standing user iterative UI/core/refactor authorization applies."
sections:
  Summary: "Iteration189: centralize Writer table hover pointer decisions in native SwEditWin and render exact native table selection glyphs instead of resize arrows. Standing iterative user authorization applies; goal remains ACTIVE."
  Scope: "Only apps/office/src/sw/source/core/crsr/trvltbl.ts, apps/office/src/sw/source/uibase/docvw/edtwin.ts, apps/office/src/sw/browser/editor/browser-writer-edit-window.ts, apps/office/src/vcl/ptrstyle.ts, apps/office/src/vcl/browser/pointer.ts, apps/office/src/vcl/browser/cursors/tblsels.svg, apps/office/src/vcl/browser/cursors/tblsele.svg, apps/office/src/vcl/browser/cursors/tblselse.svg, apps/office/src/vcl/browser/cursors/tblselw.svg, apps/office/src/vcl/browser/cursors/tblselsw.svg, apps/office/src/sw/source/uibase/docvw/native-table-pointer.test.ts, apps/office/src/vcl/browser/pointer.test.ts, apps/office/src/sw/browser/editor/native-table-mouse.test.tsx, apps/office/e2e/writer-native-table-mouse.spec.ts, docs/program/source-provenance.json, docs/program/parity/runtime-inventory.json. AP leaf evidence and parent entire-prefix checkpoint are lifecycle scope. No save/open/recovery change, network, global files, upstream source copies in AP, helper/probe scripts in AP. Resize drag, object selection, full RTL/vertical layout remain unverified."
  Plan: "1. Add exact represented PointerStyle numeric IDs, native IsTableMode and edit-window changeMousePointer/GetPointer state; preserve upstream resize-mode guard and enhanced selection mapping. 2. Replace browser SwTab pointer switch with VCL platform projection; convert five native X11 source/mask pixels and hotspots into licensed runtime SVG assets. 3. Add native decision, literal asset and mounted/Chromium hover cases; retain every substantive prior assertion. 4. One initial static gate pass, one full upstream-absent profile, original failure/new regression closures only; record exact-SHA same-agent quality, close leaf and preserve whole parent prefix."
  Verify Steps: |-
    1. Initial npm run format:check, lint, typecheck, check:dependencies, check:docs, check:file-size once; unchanged scoped JSDoc and physical lines<1000. Only failed gates/changed paths afterward.
    2. ONE full upstream-absent build/app/inventory/scripts/Chromium profile, vendor restored finally. Exact counts/errors/hashes before assertions, actual100 application and inventory coverage. No source/scope/AP audits while absent profile live. Only original failed cases or genuinely new cases afterward; no passing/full replay, no with-upstream test execution. Raw maps/cases/source diagnostics only ignored app cache; AP bounded prose/counts/hashes.
    3. Native literal13 SwTab decisions, exact PointerStyle IDs, ordinary/table-selection cursor guard, pointer preservation/reset, no selection/history side effects; exact five16x16 source/mask pixels and hotspots, browser row/column/corner glyphs versus resize borders, table-mode guard and capture preservation at1280/390. Existing2 acceptance files may update obsolete cursor expectations/add assertions;491 other existing acceptance files byte-identical;2 new test files495total.
    4. Once restored resource generation --check/source-tree/provenance/invariants/parity; prior272 semantic fields/full prefixes preserved plus2 explicitly unverified module owners. Doctor/routing/diff/source hashes/new leaf and quality artifact census0forbidden. Exact implementation SHA same-agent EVALUATOR phase, explicitly not independent review. Clean leaf close, whole parent Findings prefix preserved, goal ACTIVE/full parity UNVERIFIED.
  Verification: "Pending."
  Rollback Plan: "Revert this leaf implementation commit with a new executable task; preserve traceability and evidence. No destructive history operation."
  Findings: "Source review: edtwin.cxx changeMousePointer4101 uses HSizeBar/VSizeBar for resize, native TabSelect glyphs for enhanced selection, and IsTableMode guards only resize pointer changes. Browser currently duplicates classification and incorrectly paints enhanced selection as resize arrows. crsrsh.hxx708 checks actual table cursor presence. ptrstyle.hxx/SystemPointer.idl provide exact represented IDs; gtkdata.cxx191-192 maps resize CSS names and278-281 uses native table masks. Complete object hit arbitration, LibreOfficeKit, remaining pointer families and physical RTL/vertical layout remain unverified. Discovery corrected two guessed source paths and one guessed configuration path through actual rg inventory; no source mutation or tests preceded approval."
id_source: "generated"
---
## Summary

Iteration189: centralize Writer table hover pointer decisions in native SwEditWin and render exact native table selection glyphs instead of resize arrows. Standing iterative user authorization applies; goal remains ACTIVE.

## Scope

Only apps/office/src/sw/source/core/crsr/trvltbl.ts, apps/office/src/sw/source/uibase/docvw/edtwin.ts, apps/office/src/sw/browser/editor/browser-writer-edit-window.ts, apps/office/src/vcl/ptrstyle.ts, apps/office/src/vcl/browser/pointer.ts, apps/office/src/vcl/browser/cursors/tblsels.svg, apps/office/src/vcl/browser/cursors/tblsele.svg, apps/office/src/vcl/browser/cursors/tblselse.svg, apps/office/src/vcl/browser/cursors/tblselw.svg, apps/office/src/vcl/browser/cursors/tblselsw.svg, apps/office/src/sw/source/uibase/docvw/native-table-pointer.test.ts, apps/office/src/vcl/browser/pointer.test.ts, apps/office/src/sw/browser/editor/native-table-mouse.test.tsx, apps/office/e2e/writer-native-table-mouse.spec.ts, docs/program/source-provenance.json, docs/program/parity/runtime-inventory.json. AP leaf evidence and parent entire-prefix checkpoint are lifecycle scope. No save/open/recovery change, network, global files, upstream source copies in AP, helper/probe scripts in AP. Resize drag, object selection, full RTL/vertical layout remain unverified.

## Plan

1. Add exact represented PointerStyle numeric IDs, native IsTableMode and edit-window changeMousePointer/GetPointer state; preserve upstream resize-mode guard and enhanced selection mapping. 2. Replace browser SwTab pointer switch with VCL platform projection; convert five native X11 source/mask pixels and hotspots into licensed runtime SVG assets. 3. Add native decision, literal asset and mounted/Chromium hover cases; retain every substantive prior assertion. 4. One initial static gate pass, one full upstream-absent profile, original failure/new regression closures only; record exact-SHA same-agent quality, close leaf and preserve whole parent prefix.

## Verify Steps

1. Initial npm run format:check, lint, typecheck, check:dependencies, check:docs, check:file-size once; unchanged scoped JSDoc and physical lines<1000. Only failed gates/changed paths afterward.
2. ONE full upstream-absent build/app/inventory/scripts/Chromium profile, vendor restored finally. Exact counts/errors/hashes before assertions, actual100 application and inventory coverage. No source/scope/AP audits while absent profile live. Only original failed cases or genuinely new cases afterward; no passing/full replay, no with-upstream test execution. Raw maps/cases/source diagnostics only ignored app cache; AP bounded prose/counts/hashes.
3. Native literal13 SwTab decisions, exact PointerStyle IDs, ordinary/table-selection cursor guard, pointer preservation/reset, no selection/history side effects; exact five16x16 source/mask pixels and hotspots, browser row/column/corner glyphs versus resize borders, table-mode guard and capture preservation at1280/390. Existing2 acceptance files may update obsolete cursor expectations/add assertions;491 other existing acceptance files byte-identical;2 new test files495total.
4. Once restored resource generation --check/source-tree/provenance/invariants/parity; prior272 semantic fields/full prefixes preserved plus2 explicitly unverified module owners. Doctor/routing/diff/source hashes/new leaf and quality artifact census0forbidden. Exact implementation SHA same-agent EVALUATOR phase, explicitly not independent review. Clean leaf close, whole parent Findings prefix preserved, goal ACTIVE/full parity UNVERIFIED.

## Verification

Pending.

## Rollback Plan

Revert this leaf implementation commit with a new executable task; preserve traceability and evidence. No destructive history operation.

## Findings

Source review: edtwin.cxx changeMousePointer4101 uses HSizeBar/VSizeBar for resize, native TabSelect glyphs for enhanced selection, and IsTableMode guards only resize pointer changes. Browser currently duplicates classification and incorrectly paints enhanced selection as resize arrows. crsrsh.hxx708 checks actual table cursor presence. ptrstyle.hxx/SystemPointer.idl provide exact represented IDs; gtkdata.cxx191-192 maps resize CSS names and278-281 uses native table masks. Complete object hit arbitration, LibreOfficeKit, remaining pointer families and physical RTL/vertical layout remain unverified. Discovery corrected two guessed source paths and one guessed configuration path through actual rg inventory; no source mutation or tests preceded approval.
