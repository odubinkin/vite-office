---
id: "202610112158-8V85V8"
title: "Open native Writer text and table context menus"
status: "DOING"
priority: "high"
owner: "CODER"
revision: 11
origin:
  system: "manual"
depends_on:
  - "202610112135-Z1SPQ3"
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-11T21:59:09.623Z"
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
    body: "Start: implement original Writer context-menu event/selection and shared bindings-backed popup presentation under approved upstream goal; correction10 then full and human pause."
events:
  -
    type: "status"
    at: "2026-10-11T21:59:15.273Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implement original Writer context-menu event/selection and shared bindings-backed popup presentation under approved upstream goal; correction10 then full and human pause."
doc_version: 3
doc_updated_at: "2026-10-11T21:59:15.273Z"
doc_updated_by: "CODER"
description: "Route real mouse and keyboard popup requests through original SwEditWin selection policy and SfxDispatcher resource ownership; reuse shared bindings-backed menu rendering for generated text/table resources, preserve native selection and focus through cancellation and execution. Correction10/10, followed by the next full suites and required repairs then human pause."
sections:
  Summary: "Open generated native text/table context menus through original edit-window and active dispatcher owners; preserve selected native ranges and synchronous focus/command history."
  Scope: "Eight production modules: sw/source/core/crsr/trvltbl.ts, sw/source/uibase/docvw/edtwin.ts, sw/browser/editor/writer-selection.ts, browser-writer-edit-window.ts, WriterPlainTextEditor.tsx, sw/browser/presentation/writer-view.tsx, framework/browser/presentation/CommandMenuBar.tsx and new CommandPopupMenu.tsx. Sixteen append/new canonical runtime/provenance records, fresh core/native mounted/shared popup tests and real Chromium writer-native-context-menu.spec.ts. Task/parent evidence. Preserve all existing acceptance bytes, registered IO/recovery/defaults/statuses/classes; source-backed existing test migrations require an exact separate scope amendment. No new schema/provider/exclusions/capability changes or debug production exports."
  Plan: "Audit pinned edtwin Command ContextMenu and SelectMenuPosition, crsrsh TestCurrPam half-open ring boundaries and viscrs selected-cell containment, VCL popup placement/focus. Keep core cursor selection policy in original SwCursorShell/SwEditWin; browser geometry only maps live DOM caret hits to original SwNodes positions. A point inside original selected text/ring/cell retains selection; outside moves ordinary cursor. Keyboard preserves native selection and places at live caret geometry. Final popup resource comes only from actual frame dispatcher ExecutePopup; no browser context inference. Export/reuse existing shared bindings-backed item and floating submenu rendering, add point anchoring and a dedicated shared popup state owner with pointer/key navigation, cancellation/outside focus preservation and synchronous teardown before actual Execute. Hook original browser edit-window events and Writer frame presentation with enabled/modal admission. Fresh native/mounted/Chromium red first, then implement, append inventory and verify all eight complete modules100allfour plus fresh/related assertions with references absent. Required TS7/format/lint/docs/size/deps/build/static/tooling and nine restored-reference metadata gates. Atomic correction10/10, then separately tracked next full app/inventory/tooling/Chrome suites; fix all failures before human-requested goal pause. No source or reference mutation while a producer is live."
  Verify Steps: "1. Confirm pinned native mouse selection hit preserves marked ranges [start,end), all rings and actual selected cells; keyboard does not reposition selection. Document device-coordinate adaptation and unrepresented drawing/readonly/spell/GCAttr/full native window paths honestly. Genuine fresh red against current original owners/popup UI. 2. Fresh original native body/cell/ring/boundary cases, mounted real DOM original frame popup dispatch/bindings, shared popup keyboard/submenu/focus/viewport tests and actual Chromium right click/keyboard text/table actions plus undo/redo. Whole eight original production files100 lines/statements/functions/branches with positive counters/current hashes and original locations; no exclusions/provider changes. All preexisting acceptance bytes retained. 3. Runtime/static producers physically hide all three references, restorefinally exactly; no source/ref mutations while live. TS7, format, lint, docs, size, dependencies, fresh build/static and related tooling pass. Final metadata-only source-tree/provenance/registry/resources/invariants/parity/routing/doctor/diff audits only after runtime completion/restoration; canonical prefixes/defaults/statuses/classes and pin preserved. 4. Exact semantic SHA same-agent review (not independent), recorded failures/residual gaps, clean scoped closure. After this tenth correction run one next full suite without upstream and fix failures, then pause goal by explicit human instruction."
  Verification: "Pending source-shaped red, implementation and verification; no success claim."
  Rollback Plan: "Revert only intentional semantic commit if needed, preserving unrelated human changes and prior tasks. Runtime harness finally restores exact reference targets. No history rewriting."
  Findings: "Native edtwin6370+ uses TestCurrPam before cursor movement and retains selected text; crsrsh1294 uses marked ring Start<=hit and End>hit. TableContains checks original selected cell frames. Current portable layout has no full GetModelPositionForViewPoint/char rectangle API, so browser device geometry must map actual existing DOM points at the device ingress, with explicit limits; never add text/word inference or compatibility TextRuns path. Readonly/drawing/spell/UNO/full VCL and nested/merged/RTL/full hit affinity remain outside bounded certification. Standing human goal authorizes safe in-scope local execution and internal plan approval; no network/global/source copies."
id_source: "generated"
---
## Summary

Open generated native text/table context menus through original edit-window and active dispatcher owners; preserve selected native ranges and synchronous focus/command history.

## Scope

Eight production modules: sw/source/core/crsr/trvltbl.ts, sw/source/uibase/docvw/edtwin.ts, sw/browser/editor/writer-selection.ts, browser-writer-edit-window.ts, WriterPlainTextEditor.tsx, sw/browser/presentation/writer-view.tsx, framework/browser/presentation/CommandMenuBar.tsx and new CommandPopupMenu.tsx. Sixteen append/new canonical runtime/provenance records, fresh core/native mounted/shared popup tests and real Chromium writer-native-context-menu.spec.ts. Task/parent evidence. Preserve all existing acceptance bytes, registered IO/recovery/defaults/statuses/classes; source-backed existing test migrations require an exact separate scope amendment. No new schema/provider/exclusions/capability changes or debug production exports.

## Plan

Audit pinned edtwin Command ContextMenu and SelectMenuPosition, crsrsh TestCurrPam half-open ring boundaries and viscrs selected-cell containment, VCL popup placement/focus. Keep core cursor selection policy in original SwCursorShell/SwEditWin; browser geometry only maps live DOM caret hits to original SwNodes positions. A point inside original selected text/ring/cell retains selection; outside moves ordinary cursor. Keyboard preserves native selection and places at live caret geometry. Final popup resource comes only from actual frame dispatcher ExecutePopup; no browser context inference. Export/reuse existing shared bindings-backed item and floating submenu rendering, add point anchoring and a dedicated shared popup state owner with pointer/key navigation, cancellation/outside focus preservation and synchronous teardown before actual Execute. Hook original browser edit-window events and Writer frame presentation with enabled/modal admission. Fresh native/mounted/Chromium red first, then implement, append inventory and verify all eight complete modules100allfour plus fresh/related assertions with references absent. Required TS7/format/lint/docs/size/deps/build/static/tooling and nine restored-reference metadata gates. Atomic correction10/10, then separately tracked next full app/inventory/tooling/Chrome suites; fix all failures before human-requested goal pause. No source or reference mutation while a producer is live.

## Verify Steps

1. Confirm pinned native mouse selection hit preserves marked ranges [start,end), all rings and actual selected cells; keyboard does not reposition selection. Document device-coordinate adaptation and unrepresented drawing/readonly/spell/GCAttr/full native window paths honestly. Genuine fresh red against current original owners/popup UI. 2. Fresh original native body/cell/ring/boundary cases, mounted real DOM original frame popup dispatch/bindings, shared popup keyboard/submenu/focus/viewport tests and actual Chromium right click/keyboard text/table actions plus undo/redo. Whole eight original production files100 lines/statements/functions/branches with positive counters/current hashes and original locations; no exclusions/provider changes. All preexisting acceptance bytes retained. 3. Runtime/static producers physically hide all three references, restorefinally exactly; no source/ref mutations while live. TS7, format, lint, docs, size, dependencies, fresh build/static and related tooling pass. Final metadata-only source-tree/provenance/registry/resources/invariants/parity/routing/doctor/diff audits only after runtime completion/restoration; canonical prefixes/defaults/statuses/classes and pin preserved. 4. Exact semantic SHA same-agent review (not independent), recorded failures/residual gaps, clean scoped closure. After this tenth correction run one next full suite without upstream and fix failures, then pause goal by explicit human instruction.

## Verification

Pending source-shaped red, implementation and verification; no success claim.

## Rollback Plan

Revert only intentional semantic commit if needed, preserving unrelated human changes and prior tasks. Runtime harness finally restores exact reference targets. No history rewriting.

## Findings

Native edtwin6370+ uses TestCurrPam before cursor movement and retains selected text; crsrsh1294 uses marked ring Start<=hit and End>hit. TableContains checks original selected cell frames. Current portable layout has no full GetModelPositionForViewPoint/char rectangle API, so browser device geometry must map actual existing DOM points at the device ingress, with explicit limits; never add text/word inference or compatibility TextRuns path. Readonly/drawing/spell/UNO/full VCL and nested/merged/RTL/full hit affinity remain outside bounded certification. Standing human goal authorizes safe in-scope local execution and internal plan approval; no network/global/source copies.
