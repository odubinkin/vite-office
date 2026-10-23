---
id: "202610230035-FNBXHP"
title: "Canonicalize Writer line spacing popup and native item dispatch"
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
  updated_at: "2026-10-23T00:35:40.657Z"
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
    body: "Start: implement original eight-mode line spacing popup and full native item dispatch on writer under existing user continuation approval; related tests only on task8."
events:
  -
    type: "status"
    at: "2026-10-23T00:35:41.058Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implement original eight-mode line spacing popup and full native item dispatch on writer under existing user continuation approval; related tests only on task8."
doc_version: 3
doc_updated_at: "2026-10-23T00:35:41.058Z"
doc_updated_by: "CODER"
description: "Replace the percentage-only browser popup with original ParaLineSpacingControl initialization, eight modes, metric and percent fields and predefined acceptance, carrying actual SvxLineSpacingItem state and execution through Writer history and ODT."
sections:
  Summary: "Expose original Writer line spacing popup modes and native item dispatch through actual Sfx bindings, history and ODT. Replace the percentage-only custom Apply popup with source-backed immediate acceptance and predefined-button close behavior."
  Scope: "Only /Users/odubinkin/Projects/vite-office-writer, branch writer. Up to22 implementation/resource/tooling paths and12 test paths plus paired canonical metadata/generated views. Original ParaLineSpacingControl source owner, browser popup presentation, actual numeric/metric fields with module measurement unit, native SvxLineSpacingItem request/state, Writer toolbar/sidebar callers, related history/layout/ODT. Existing represented shell/range dispatch owners only. No full font/layout/native configuration service, fake backend, locale data expansion, network, merges or intentional I/O/recovery/autosave deviation changes."
  Plan: "Port original ParaLineSpacingControl Initialize, UpdateMetricFields, SetLineSpace and execute/preset branches over actual existing metric/numeric and SvxLineSpacingItem owners; preserve eight source mode positions, constructor resource ranges/defaults, original28twip fixed minimum/283twip repair and unsigned casts. Expose complete native line spacing item state and execution through actual Writer slot/item-set path while maintaining current caller compatibility as needed without parallel formatting logic. Replace percentage-only Writer popup with source structure/four preset buttons and eight-mode Custom Value controls, correct measurement units, enabled/mixed status, focus/dismissal and close-only-preset behavior. Verify all modes, native acceptance, undo/redo and physical ODT/layout through related portable and actual desktop/mobile Chromium tests; update source records and suspected issues if needed, strict changed-responsibility coverage/local gates, commit/quality/close and continue active goal."
  Verify Steps: "Read pinned ParaLineSpacingControl.cxx/.hxx, ParaLineSpacingPopup.cxx and paralinespacingcontrol.ui, actual txtattr.cxx line-space request/state and existing SvxLineSpacingItem setters/I/O/layout. Test source eight mode order, Initialize Auto/Off/Prop115/150/200/custom/Fix/Min/Leading, unknown/disabled states, four preset closure vs mode/value immediate retained popup; original percent6..65535, metric resource bounds/units and28/283twip fixed transition behavior, uint16 casts and native default item fields. Use actual module unit and VCL conversion, no synthetic native services. All modes through native item dispatch, mixed/table/text selection, grouped history and ODT roundtrip/layout; preserve existing line-spacing and paragraph caller regressions. Chromium1280/390 actual toolbar/sidebar popup, mode/value edit, undo/redo, ODT download/reopen, no root overflow/error. Strict changed-responsibility100 coverage with exact source identities and untouched thresholds; type/scoped lint/format/build/static/docs/dependencies/resources/provenance/tree/invariants/parity/size/doctor/routing/diff and clean final status. Eighth task since fullACR55N: related tests only, next full due task10."
  Verification: "Pending implementation and current-source checks. Read-only baseline fb4429bda232 is clean; prior font-size task014VCW is DONE. This task must not reuse its tests as line-spacing proof."
  Rollback Plan: "Revert only task implementation commits, retaining prior font-size and other Writer work and traceability. No reset/merge or external mutation."
  Findings: "Read-only baseline: WriterLineSpacingControl.tsx uses four hardcoded proportional presets plus a percent-only Custom Apply input; Writer line-spacing slot currently receives percent and reports number/custom sentinel. Native SvxLineSpacingItem, dimensional dialog modes, layout and ODT already exist. Pinned original popup provides four preset buttons and eight-mode custom selector; mode/value edits dispatch immediately without closing, preset buttons close. Original metric field uses actual module unit and Writer MapTwip; native fixed transition28twip minimum/283twip repair must be preserved. Broad approved implementation/read scope persists. Goal active; prior user stop requests revoked. No new user approval required for this routine next core/UI consistency block."
id_source: "generated"
---
## Summary

Expose original Writer line spacing popup modes and native item dispatch through actual Sfx bindings, history and ODT. Replace the percentage-only custom Apply popup with source-backed immediate acceptance and predefined-button close behavior.

## Scope

Only /Users/odubinkin/Projects/vite-office-writer, branch writer. Up to22 implementation/resource/tooling paths and12 test paths plus paired canonical metadata/generated views. Original ParaLineSpacingControl source owner, browser popup presentation, actual numeric/metric fields with module measurement unit, native SvxLineSpacingItem request/state, Writer toolbar/sidebar callers, related history/layout/ODT. Existing represented shell/range dispatch owners only. No full font/layout/native configuration service, fake backend, locale data expansion, network, merges or intentional I/O/recovery/autosave deviation changes.

## Plan

Port original ParaLineSpacingControl Initialize, UpdateMetricFields, SetLineSpace and execute/preset branches over actual existing metric/numeric and SvxLineSpacingItem owners; preserve eight source mode positions, constructor resource ranges/defaults, original28twip fixed minimum/283twip repair and unsigned casts. Expose complete native line spacing item state and execution through actual Writer slot/item-set path while maintaining current caller compatibility as needed without parallel formatting logic. Replace percentage-only Writer popup with source structure/four preset buttons and eight-mode Custom Value controls, correct measurement units, enabled/mixed status, focus/dismissal and close-only-preset behavior. Verify all modes, native acceptance, undo/redo and physical ODT/layout through related portable and actual desktop/mobile Chromium tests; update source records and suspected issues if needed, strict changed-responsibility coverage/local gates, commit/quality/close and continue active goal.

## Verify Steps

Read pinned ParaLineSpacingControl.cxx/.hxx, ParaLineSpacingPopup.cxx and paralinespacingcontrol.ui, actual txtattr.cxx line-space request/state and existing SvxLineSpacingItem setters/I/O/layout. Test source eight mode order, Initialize Auto/Off/Prop115/150/200/custom/Fix/Min/Leading, unknown/disabled states, four preset closure vs mode/value immediate retained popup; original percent6..65535, metric resource bounds/units and28/283twip fixed transition behavior, uint16 casts and native default item fields. Use actual module unit and VCL conversion, no synthetic native services. All modes through native item dispatch, mixed/table/text selection, grouped history and ODT roundtrip/layout; preserve existing line-spacing and paragraph caller regressions. Chromium1280/390 actual toolbar/sidebar popup, mode/value edit, undo/redo, ODT download/reopen, no root overflow/error. Strict changed-responsibility100 coverage with exact source identities and untouched thresholds; type/scoped lint/format/build/static/docs/dependencies/resources/provenance/tree/invariants/parity/size/doctor/routing/diff and clean final status. Eighth task since fullACR55N: related tests only, next full due task10.

## Verification

Pending implementation and current-source checks. Read-only baseline fb4429bda232 is clean; prior font-size task014VCW is DONE. This task must not reuse its tests as line-spacing proof.

## Rollback Plan

Revert only task implementation commits, retaining prior font-size and other Writer work and traceability. No reset/merge or external mutation.

## Findings

Read-only baseline: WriterLineSpacingControl.tsx uses four hardcoded proportional presets plus a percent-only Custom Apply input; Writer line-spacing slot currently receives percent and reports number/custom sentinel. Native SvxLineSpacingItem, dimensional dialog modes, layout and ODT already exist. Pinned original popup provides four preset buttons and eight-mode custom selector; mode/value edits dispatch immediately without closing, preset buttons close. Original metric field uses actual module unit and Writer MapTwip; native fixed transition28twip minimum/283twip repair must be preserved. Broad approved implementation/read scope persists. Goal active; prior user stop requests revoked. No new user approval required for this routine next core/UI consistency block.
