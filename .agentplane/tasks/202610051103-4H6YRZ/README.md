---
id: "202610051103-4H6YRZ"
title: "Materialize native per-cell cursor rings for selected table character formatting"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 9
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-05T11:04:44.264Z"
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
    body: "Start: approved iterative UI refactoring; native per-cell formatting cursor ring leaf148."
events:
  -
    type: "status"
    at: "2026-10-05T11:04:47.038Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: approved iterative UI refactoring; native per-cell formatting cursor ring leaf148."
doc_version: 3
doc_updated_at: "2026-10-05T11:04:47.038Z"
doc_updated_by: "CODER"
description: "Iteration148 under 202609240501-C9TN6M. Port native GetCursor default and separate displayed table cursor from editing cursor rings, so selected table character commands cover full cells and preserve selection through history."
sections:
  Summary: "Use native per-cell editing cursor rings for selected table character formatting."
  Scope: "Iteration148 atomic CODER leaf: implement native SwPaM circular ownership/traversal/disposal and SwCursor.Create; SwTableCursor dirty/movement state and MakeBoxSels retain/reconcile actual full-cell mark0/pointLen ranges. SwWrtShell.GetCursor(makeTableCursor=true) returns ordinary editing cursor/ring as upstream; getShellCursor returns displayed table endpoint owner. Move DOM/projection/native navigation/history capture to displayed owner; existing text format shell selected-range helper traverses actual ring. Preserve table-mode endpoints through native history state and rebuild after character-format Undo/Redo. Update four existing selection/navigation testfiles only GetCursor->getShellCursor call sites; keep every assertion/value/body equivalent under renamed owner API. Add native/mounted/Chromium multi-cell character formatting and history evidence, not display DTO editing. Scope:apps/office/src/sw/source/core/crsr/pam.ts, apps/office/src/sw/source/core/crsr/swcrsr.ts, apps/office/src/sw/source/uibase/wrtsh/wrtsh1.ts, apps/office/src/sw/source/core/undo/undobj.ts, apps/office/src/sw/source/uibase/docvw/edtwin.ts, apps/office/src/sw/browser/presentation/writer-view-projection.ts, apps/office/src/sw/browser/presentation/writer-view.tsx, apps/office/src/sw/source/uibase/wrtsh/native-section-navigation.test.ts, apps/office/src/sw/browser/editor/native-section-navigation.test.tsx, apps/office/src/sw/source/uibase/wrtsh/native-table-selection.test.ts, apps/office/src/sw/browser/editor/native-table-selection.test.tsx, apps/office/src/sw/source/uibase/wrtsh/native-table-cursor-rings.test.ts, apps/office/src/sw/browser/editor/native-table-cursor-rings.test.tsx, apps/office/e2e/writer-native-table-cursor-rings.spec.ts, docs/program/source-provenance.json, docs/program/parity/runtime-inventory.json. Preserve246semanticstatuses/defaults/classifications and registered I/O/recovery deviations. Full per-ring insertion/deletion/paste/paragraph/list operations, native shellcursor layout/protection/redlines/merged/nested cells separate follow-ups; no silent completion claim. No saved helpers/upstream/APscripts/raw diagnostics/network/outside/subagents."
  Plan: "Iteration148 atomic CODER leaf: implement native SwPaM circular ownership/traversal/disposal and SwCursor.Create; SwTableCursor dirty/movement state and MakeBoxSels retain/reconcile actual full-cell mark0/pointLen ranges. SwWrtShell.GetCursor(makeTableCursor=true) returns ordinary editing cursor/ring as upstream; getShellCursor returns displayed table endpoint owner. Move DOM/projection/native navigation/history capture to displayed owner; existing text format shell selected-range helper traverses actual ring. Preserve table-mode endpoints through native history state and rebuild after character-format Undo/Redo. Update four existing selection/navigation testfiles only GetCursor->getShellCursor call sites; keep every assertion/value/body equivalent under renamed owner API. Add native/mounted/Chromium multi-cell character formatting and history evidence, not display DTO editing. Scope:apps/office/src/sw/source/core/crsr/pam.ts, apps/office/src/sw/source/core/crsr/swcrsr.ts, apps/office/src/sw/source/uibase/wrtsh/wrtsh1.ts, apps/office/src/sw/source/core/undo/undobj.ts, apps/office/src/sw/source/uibase/docvw/edtwin.ts, apps/office/src/sw/browser/presentation/writer-view-projection.ts, apps/office/src/sw/browser/presentation/writer-view.tsx, apps/office/src/sw/source/uibase/wrtsh/native-section-navigation.test.ts, apps/office/src/sw/browser/editor/native-section-navigation.test.tsx, apps/office/src/sw/source/uibase/wrtsh/native-table-selection.test.ts, apps/office/src/sw/browser/editor/native-table-selection.test.tsx, apps/office/src/sw/source/uibase/wrtsh/native-table-cursor-rings.test.ts, apps/office/src/sw/browser/editor/native-table-cursor-rings.test.tsx, apps/office/e2e/writer-native-table-cursor-rings.spec.ts, docs/program/source-provenance.json, docs/program/parity/runtime-inventory.json. Preserve246semanticstatuses/defaults/classifications and registered I/O/recovery deviations. Full per-ring insertion/deletion/paste/paragraph/list operations, native shellcursor layout/protection/redlines/merged/nested cells separate follow-ups; no silent completion claim. No saved helpers/upstream/APscripts/raw diagnostics/network/outside/subagents."
  Verify Steps: |-
    1. Six statics first: npm run format:check; npm run lint; npm run typecheck; npm run check:dependencies; npm run check:docs; npm run check:file-size. Changed-file checks after fixes only.
    2. ONE sequential full build,app/inventorycoverage --coverage.reportOnFailure,source-provenance/resource tests and Chromium while vendor reference renamed inside repo and restored in finally. Tests never execute/read pinned upstream. Persist exact failed/error names before assertions; only failed gates/cases and genuinely new unexecuted cases may repeat. AP bounded English results/counts/hashes only; initial maps ignored appcache.
    3. Assert real rings insertion/removal/lifetime, full multi-paragraph selected cells excluding unselected rectangle holes, retain/reconcile cursor identity, default GetCursor editing-owner versus displayed getShellCursor, changed-state and history reconstruction. Test Bold/Italic/font/color selection across actual boxes, unselected neighbors, one history unit and Undo/Redo; mounted and Chromium commandstate/render/paint evidence. Four old testfiles may change only owner method calls, retaining all assertions byte-equivalent after API normalization; all other prior tests byte-identical. No passing full/static/build/suite/test replay.
    4. Restore vendor before five resource/source-tree/provenance/invariant/parity audits. Retain existingsemanticstates/defaults/classifications/exceptions; no wholemodulepromotion. Scope/old-assertion/APsourceartifact audit, exactSHA sameactorEVALUATORaudit before quality, verification and canonicalfinish, cleanfinaltrackedstate; append parent progress and leave broad goalactive.
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert intentional semantic change through a new authorized leaf; no history rewrite."
  Findings: "Current selected-box painting uses table owner, but character commands consume one linear endpoint span and can omit first-cell text. Pinned SwCursorShell::GetCursor(makeTableCursor=true) returns ordinary current cursor, materializes MakeBoxSels; getShellCursor owns display cursor. SwTableCursor::MakeBoxSels creates whole-cell mark-first0/point-lastLen ranges and retains matching cursors. SwEditShell formatting traverses GetRingContainer. Port actual native ring mechanism, preserve displayed selection and history; full per-ring structural edits remain separate."
id_source: "generated"
---
## Summary

Use native per-cell editing cursor rings for selected table character formatting.

## Scope

Iteration148 atomic CODER leaf: implement native SwPaM circular ownership/traversal/disposal and SwCursor.Create; SwTableCursor dirty/movement state and MakeBoxSels retain/reconcile actual full-cell mark0/pointLen ranges. SwWrtShell.GetCursor(makeTableCursor=true) returns ordinary editing cursor/ring as upstream; getShellCursor returns displayed table endpoint owner. Move DOM/projection/native navigation/history capture to displayed owner; existing text format shell selected-range helper traverses actual ring. Preserve table-mode endpoints through native history state and rebuild after character-format Undo/Redo. Update four existing selection/navigation testfiles only GetCursor->getShellCursor call sites; keep every assertion/value/body equivalent under renamed owner API. Add native/mounted/Chromium multi-cell character formatting and history evidence, not display DTO editing. Scope:apps/office/src/sw/source/core/crsr/pam.ts, apps/office/src/sw/source/core/crsr/swcrsr.ts, apps/office/src/sw/source/uibase/wrtsh/wrtsh1.ts, apps/office/src/sw/source/core/undo/undobj.ts, apps/office/src/sw/source/uibase/docvw/edtwin.ts, apps/office/src/sw/browser/presentation/writer-view-projection.ts, apps/office/src/sw/browser/presentation/writer-view.tsx, apps/office/src/sw/source/uibase/wrtsh/native-section-navigation.test.ts, apps/office/src/sw/browser/editor/native-section-navigation.test.tsx, apps/office/src/sw/source/uibase/wrtsh/native-table-selection.test.ts, apps/office/src/sw/browser/editor/native-table-selection.test.tsx, apps/office/src/sw/source/uibase/wrtsh/native-table-cursor-rings.test.ts, apps/office/src/sw/browser/editor/native-table-cursor-rings.test.tsx, apps/office/e2e/writer-native-table-cursor-rings.spec.ts, docs/program/source-provenance.json, docs/program/parity/runtime-inventory.json. Preserve246semanticstatuses/defaults/classifications and registered I/O/recovery deviations. Full per-ring insertion/deletion/paste/paragraph/list operations, native shellcursor layout/protection/redlines/merged/nested cells separate follow-ups; no silent completion claim. No saved helpers/upstream/APscripts/raw diagnostics/network/outside/subagents.

## Plan

Iteration148 atomic CODER leaf: implement native SwPaM circular ownership/traversal/disposal and SwCursor.Create; SwTableCursor dirty/movement state and MakeBoxSels retain/reconcile actual full-cell mark0/pointLen ranges. SwWrtShell.GetCursor(makeTableCursor=true) returns ordinary editing cursor/ring as upstream; getShellCursor returns displayed table endpoint owner. Move DOM/projection/native navigation/history capture to displayed owner; existing text format shell selected-range helper traverses actual ring. Preserve table-mode endpoints through native history state and rebuild after character-format Undo/Redo. Update four existing selection/navigation testfiles only GetCursor->getShellCursor call sites; keep every assertion/value/body equivalent under renamed owner API. Add native/mounted/Chromium multi-cell character formatting and history evidence, not display DTO editing. Scope:apps/office/src/sw/source/core/crsr/pam.ts, apps/office/src/sw/source/core/crsr/swcrsr.ts, apps/office/src/sw/source/uibase/wrtsh/wrtsh1.ts, apps/office/src/sw/source/core/undo/undobj.ts, apps/office/src/sw/source/uibase/docvw/edtwin.ts, apps/office/src/sw/browser/presentation/writer-view-projection.ts, apps/office/src/sw/browser/presentation/writer-view.tsx, apps/office/src/sw/source/uibase/wrtsh/native-section-navigation.test.ts, apps/office/src/sw/browser/editor/native-section-navigation.test.tsx, apps/office/src/sw/source/uibase/wrtsh/native-table-selection.test.ts, apps/office/src/sw/browser/editor/native-table-selection.test.tsx, apps/office/src/sw/source/uibase/wrtsh/native-table-cursor-rings.test.ts, apps/office/src/sw/browser/editor/native-table-cursor-rings.test.tsx, apps/office/e2e/writer-native-table-cursor-rings.spec.ts, docs/program/source-provenance.json, docs/program/parity/runtime-inventory.json. Preserve246semanticstatuses/defaults/classifications and registered I/O/recovery deviations. Full per-ring insertion/deletion/paste/paragraph/list operations, native shellcursor layout/protection/redlines/merged/nested cells separate follow-ups; no silent completion claim. No saved helpers/upstream/APscripts/raw diagnostics/network/outside/subagents.

## Verify Steps

1. Six statics first: npm run format:check; npm run lint; npm run typecheck; npm run check:dependencies; npm run check:docs; npm run check:file-size. Changed-file checks after fixes only.
2. ONE sequential full build,app/inventorycoverage --coverage.reportOnFailure,source-provenance/resource tests and Chromium while vendor reference renamed inside repo and restored in finally. Tests never execute/read pinned upstream. Persist exact failed/error names before assertions; only failed gates/cases and genuinely new unexecuted cases may repeat. AP bounded English results/counts/hashes only; initial maps ignored appcache.
3. Assert real rings insertion/removal/lifetime, full multi-paragraph selected cells excluding unselected rectangle holes, retain/reconcile cursor identity, default GetCursor editing-owner versus displayed getShellCursor, changed-state and history reconstruction. Test Bold/Italic/font/color selection across actual boxes, unselected neighbors, one history unit and Undo/Redo; mounted and Chromium commandstate/render/paint evidence. Four old testfiles may change only owner method calls, retaining all assertions byte-equivalent after API normalization; all other prior tests byte-identical. No passing full/static/build/suite/test replay.
4. Restore vendor before five resource/source-tree/provenance/invariant/parity audits. Retain existingsemanticstates/defaults/classifications/exceptions; no wholemodulepromotion. Scope/old-assertion/APsourceartifact audit, exactSHA sameactorEVALUATORaudit before quality, verification and canonicalfinish, cleanfinaltrackedstate; append parent progress and leave broad goalactive.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert intentional semantic change through a new authorized leaf; no history rewrite.

## Findings

Current selected-box painting uses table owner, but character commands consume one linear endpoint span and can omit first-cell text. Pinned SwCursorShell::GetCursor(makeTableCursor=true) returns ordinary current cursor, materializes MakeBoxSels; getShellCursor owns display cursor. SwTableCursor::MakeBoxSels creates whole-cell mark-first0/point-lastLen ranges and retains matching cursors. SwEditShell formatting traverses GetRingContainer. Port actual native ring mechanism, preserve displayed selection and history; full per-ring structural edits remain separate.
