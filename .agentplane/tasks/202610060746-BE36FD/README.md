---
id: "202610060746-BE36FD"
title: "Route Writer table insertion through native editing and undo ownership"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 10
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
  - "parity"
task_kind: "code"
mutation_scope: "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-06T07:46:51.805Z"
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
    body: "Start: implement approved native body table insertion and shared React command with grouped history."
events:
  -
    type: "status"
    at: "2026-10-06T07:47:00.525Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implement approved native body table insertion and shared React command with grouped history."
doc_version: 3
doc_updated_at: "2026-10-06T08:21:08.833Z"
doc_updated_by: "CODER"
description: "Iteration179: replace direct React table graph writes with represented native body insertion, cursor splitting, numeric table insertion history and shared grid/dialog execution; preserve I/O exceptions and semantic status."
sections:
  Summary: |-
    Route Writer table insertion through native editing and undo ownership

    Iteration179: replace direct React table graph writes with represented native body insertion, cursor splitting, numeric table insertion history and shared grid/dialog execution; preserve I/O exceptions and semantic status.
  Scope: "Represented direct-body collapsed-cursor insertion only: source-owned SwDoc/SwNodes construction, editing-shell split and grouped SwUndoInsTable history, common grid/dialog execution, native FULL reference geometry and unique naming. Preserve native numbering shell API, existing tests except assertion changes strictly caused by corrected behavior. Preserve all267 prior semantic records/defaults/classifications and registered I/O/recovery choices. Selection-to-table, nested tables, complete autofmt/redline/frame lifetime remain explicitly unverified."
  Plan: "Use existing standing iterative user authorization. Add source-owned table editing shell extending the actual numbering shell, without forwarding adapters. Implement numeric table insertion undo that deletes/recreates native sections. Route React size-grid and dialog to inherited command. Verify position0/middle/end, default flags/header styles, original paragraph identity, registered positions, cursor focus and repeated undo/redo, plus mounted UI and Chromium. Run six initial gates, one full upstream-absent profile, then only failed/new cases and changed-file checks; restore vendor before all source/scope audits; commit one reviewed change and checkpoint parent."
  Verify Steps: |-
    1. npm run format:check; npm run lint; npm run typecheck; npm run check:dependencies; npm run check:docs; npm run check:file-size pass (failed gates only may repeat).
    2. ONE profile with vendor/libreoffice-reference renamed inside repository and finally restored: npm run test:static; app and inventory coverage with --coverage.reportOnFailure and JSON results; script acceptance; all Chromium against existing dist. Persist failures/counts/hashes before assertions. Then rerun only original failures or genuinely new cases; no upstream-present tests and no passing-gate/full-suite replay.
    3. New native/mounted/browser acceptance proves direct-body position0/middle/end, FULL defaults, unique names, grid/dialog common command, header-independent repetition and one undo/redo with recreated table graph, stable unaffected body identities. App/inventory100% real-counter coverage; new source claims stay unverified unless complete contracts established.
    4. After vendor restoration, source-tree/provenance/inventory/invariant/parity audits, old-test byte and semantic-prefix scope checks, AP source/helper prohibition census, doctor/routing and exact-SHA same-agent quality review pass. Explicitly stage scoped code/AP evidence, implementation commit, verification and close. Clean tracked checkout; parent goal remains active.
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert scoped implementation and evidence commits; do not edit immutable DONE tasks. Preserve registered deviations."
  Findings: |-
    Iteration179 routes both existing React table entry points to inherited SwEditShell InsertTable. React no longer constructs table nodes, rows, columns or cell formats directly. SwDoc/SwNodes own first-free native naming, FULL65535 reference geometry, native Headline/SplitLayout/DefaultBorder flags and TableHeading/TableContents materialization. Insertion before the current body node uses existing native paragraph split for nonzero text offsets. One grouped Insert Table history restores original body identity/offset and Redo reconstructs actual new table/cell owners. Browser caret/focus assertions verify native DOM selection inside the editing host; requiring focus specifically on the paragraph was an invalid initial test assumption.

    A genuinely new mixed history case found SwUndoTableNdsChg targeting a detached old table after insertion Redo. Numeric m_nSttNode lookup now resolves the actual current table. Ordinary retained rows preserve established identities; when a table section is recreated, empty row sections are prepared from current last-row formats. Three repeated native and desktop/mobile Chromium table/row/text stack cycles pass. This is a bounded compatibility repair, not full native row reconstruction/SaveTable certification.

    Command: six initial format/lint/type/dependency/JSDoc/file-size gates. Result: pass after failed format/lint/JSDoc closure only. Initial lint32 non-null assertions and missing5 JSDoc callbacks were fixed. Scope: approved16semantic paths. Later checks ran only changed files and application compilation after genuinely new tests/row implementation. Initial auxiliary physical-line regex produced1for each file; corrected actual LF counts without passing-gate replay. All files remain below1000physical lines and untouched wrtsh1 remains999.

    Command: ONE full upstream-absent build/app/inventory/scripts/Chromium profile. Result: build pass;12808app pass/1fail of12809;108inventory pass/1fail of109;5scripts pass;183Chromium pass/2newfail. Exact cases, counts, map/output hashes are retained in bounded evidence. The old entry-point test now asserts disabled in-table Insert Table and moves to actual body before reopening; all existing numeric expectations retained. Inventory sort repaired. Failed/new app2pass2skipped and inventory1pass2skipped were retried once; threshold-only partial coverage exits were recorded as such. Two original failed Chromium cases required corrected DOM focus expectation, genuine ODT precondition and literal pre-command caret offset4; an assertion initially placed after only one ArrowRight was moved after allfour. Only those original failures were retried until2pass0flaky. A genuinely new mixed stack app case1fail17skipped exposed the stale row owner, then1pass17skipped after repair. Rebuild occurred only for the actual row production change; new Chromium interoperability2pass. Every profile restored vendor in finally; no runtime/test/E2E read or invoked upstream and no source/scope audit ran while upstream was absent.

    Evidence: final12811application/109inventory/5scripts/187Chromium distinct real cases; partial skipped remain skipped. Application13491L14779S3550F11005B100%;inventory1464L1523S384F1080B100%. Coverage combines complete identical maps first, then264exact owners and one untbl complete contiguous byte-range rebase with actual counters; no endpoint-only transfer or synthetic counts. Final app map282677f9b920c6dac2c2a46b22b0506fa4306e0476f6d623f29a7647a865ef01;inventory42eb9c3620b0e0eda1cfa3b7385ad5904a83cc35f90ed207e3c1c1074d11d0a5.

    Command: restored-source generation --check/source-tree/provenance/invariants/parity and core module CLI. Result: pass;268owners184mapped68browser16infra. Initial optional core-module CLI invocation omitted required arguments; exact usage failure retained and only that invocation retried with baseline/reference/output arguments, writing metadata to ignored application cache. Scope:267prior semantic states/defaults/classifications/evidence prefixes and all other inventory sections preserved;465of466prior test files byte-identical, one old UI test gains native-context preconditions, four genuine new acceptance files. Doctor0errors2known warnings and routing/diff checks pass. Ignored-inclusive AP census finds0forbidden artifacts; only pre-existing canonical validators and the historical application QA screenshot are exempt. All evidence in AP is bounded English prose/counts/hashes/outcomes; raw results/maps/snapshots remain ignored application cache.

    Residual scope: direct-body collapsed cursors only. Document-owned undo append versus current shell orchestration, native selection deletion/TextToTable,nested/merged/protected contexts, full frame/item/edge borders/font propagation, native full autoformat/name pools, complete layout split/ODT persistence, redlines,frames,Repeat and full native row/SaveTable lifetimes remain unverified. Source-unit inheritance split adds table methods to the existing numbering owner without forwarding methods. Registered save/open/recovery deviations are preserved. No independent reviewer is claimed; exact-SHA review is by this agent in EVALUATOR phase. Parent goal remains ACTIVE; full parity UNVERIFIED.
id_source: "generated"
---
## Summary

Route Writer table insertion through native editing and undo ownership

Iteration179: replace direct React table graph writes with represented native body insertion, cursor splitting, numeric table insertion history and shared grid/dialog execution; preserve I/O exceptions and semantic status.

## Scope

Represented direct-body collapsed-cursor insertion only: source-owned SwDoc/SwNodes construction, editing-shell split and grouped SwUndoInsTable history, common grid/dialog execution, native FULL reference geometry and unique naming. Preserve native numbering shell API, existing tests except assertion changes strictly caused by corrected behavior. Preserve all267 prior semantic records/defaults/classifications and registered I/O/recovery choices. Selection-to-table, nested tables, complete autofmt/redline/frame lifetime remain explicitly unverified.

## Plan

Use existing standing iterative user authorization. Add source-owned table editing shell extending the actual numbering shell, without forwarding adapters. Implement numeric table insertion undo that deletes/recreates native sections. Route React size-grid and dialog to inherited command. Verify position0/middle/end, default flags/header styles, original paragraph identity, registered positions, cursor focus and repeated undo/redo, plus mounted UI and Chromium. Run six initial gates, one full upstream-absent profile, then only failed/new cases and changed-file checks; restore vendor before all source/scope audits; commit one reviewed change and checkpoint parent.

## Verify Steps

1. npm run format:check; npm run lint; npm run typecheck; npm run check:dependencies; npm run check:docs; npm run check:file-size pass (failed gates only may repeat).
2. ONE profile with vendor/libreoffice-reference renamed inside repository and finally restored: npm run test:static; app and inventory coverage with --coverage.reportOnFailure and JSON results; script acceptance; all Chromium against existing dist. Persist failures/counts/hashes before assertions. Then rerun only original failures or genuinely new cases; no upstream-present tests and no passing-gate/full-suite replay.
3. New native/mounted/browser acceptance proves direct-body position0/middle/end, FULL defaults, unique names, grid/dialog common command, header-independent repetition and one undo/redo with recreated table graph, stable unaffected body identities. App/inventory100% real-counter coverage; new source claims stay unverified unless complete contracts established.
4. After vendor restoration, source-tree/provenance/inventory/invariant/parity audits, old-test byte and semantic-prefix scope checks, AP source/helper prohibition census, doctor/routing and exact-SHA same-agent quality review pass. Explicitly stage scoped code/AP evidence, implementation commit, verification and close. Clean tracked checkout; parent goal remains active.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert scoped implementation and evidence commits; do not edit immutable DONE tasks. Preserve registered deviations.

## Findings

Iteration179 routes both existing React table entry points to inherited SwEditShell InsertTable. React no longer constructs table nodes, rows, columns or cell formats directly. SwDoc/SwNodes own first-free native naming, FULL65535 reference geometry, native Headline/SplitLayout/DefaultBorder flags and TableHeading/TableContents materialization. Insertion before the current body node uses existing native paragraph split for nonzero text offsets. One grouped Insert Table history restores original body identity/offset and Redo reconstructs actual new table/cell owners. Browser caret/focus assertions verify native DOM selection inside the editing host; requiring focus specifically on the paragraph was an invalid initial test assumption.

A genuinely new mixed history case found SwUndoTableNdsChg targeting a detached old table after insertion Redo. Numeric m_nSttNode lookup now resolves the actual current table. Ordinary retained rows preserve established identities; when a table section is recreated, empty row sections are prepared from current last-row formats. Three repeated native and desktop/mobile Chromium table/row/text stack cycles pass. This is a bounded compatibility repair, not full native row reconstruction/SaveTable certification.

Command: six initial format/lint/type/dependency/JSDoc/file-size gates. Result: pass after failed format/lint/JSDoc closure only. Initial lint32 non-null assertions and missing5 JSDoc callbacks were fixed. Scope: approved16semantic paths. Later checks ran only changed files and application compilation after genuinely new tests/row implementation. Initial auxiliary physical-line regex produced1for each file; corrected actual LF counts without passing-gate replay. All files remain below1000physical lines and untouched wrtsh1 remains999.

Command: ONE full upstream-absent build/app/inventory/scripts/Chromium profile. Result: build pass;12808app pass/1fail of12809;108inventory pass/1fail of109;5scripts pass;183Chromium pass/2newfail. Exact cases, counts, map/output hashes are retained in bounded evidence. The old entry-point test now asserts disabled in-table Insert Table and moves to actual body before reopening; all existing numeric expectations retained. Inventory sort repaired. Failed/new app2pass2skipped and inventory1pass2skipped were retried once; threshold-only partial coverage exits were recorded as such. Two original failed Chromium cases required corrected DOM focus expectation, genuine ODT precondition and literal pre-command caret offset4; an assertion initially placed after only one ArrowRight was moved after allfour. Only those original failures were retried until2pass0flaky. A genuinely new mixed stack app case1fail17skipped exposed the stale row owner, then1pass17skipped after repair. Rebuild occurred only for the actual row production change; new Chromium interoperability2pass. Every profile restored vendor in finally; no runtime/test/E2E read or invoked upstream and no source/scope audit ran while upstream was absent.

Evidence: final12811application/109inventory/5scripts/187Chromium distinct real cases; partial skipped remain skipped. Application13491L14779S3550F11005B100%;inventory1464L1523S384F1080B100%. Coverage combines complete identical maps first, then264exact owners and one untbl complete contiguous byte-range rebase with actual counters; no endpoint-only transfer or synthetic counts. Final app map282677f9b920c6dac2c2a46b22b0506fa4306e0476f6d623f29a7647a865ef01;inventory42eb9c3620b0e0eda1cfa3b7385ad5904a83cc35f90ed207e3c1c1074d11d0a5.

Command: restored-source generation --check/source-tree/provenance/invariants/parity and core module CLI. Result: pass;268owners184mapped68browser16infra. Initial optional core-module CLI invocation omitted required arguments; exact usage failure retained and only that invocation retried with baseline/reference/output arguments, writing metadata to ignored application cache. Scope:267prior semantic states/defaults/classifications/evidence prefixes and all other inventory sections preserved;465of466prior test files byte-identical, one old UI test gains native-context preconditions, four genuine new acceptance files. Doctor0errors2known warnings and routing/diff checks pass. Ignored-inclusive AP census finds0forbidden artifacts; only pre-existing canonical validators and the historical application QA screenshot are exempt. All evidence in AP is bounded English prose/counts/hashes/outcomes; raw results/maps/snapshots remain ignored application cache.

Residual scope: direct-body collapsed cursors only. Document-owned undo append versus current shell orchestration, native selection deletion/TextToTable,nested/merged/protected contexts, full frame/item/edge borders/font propagation, native full autoformat/name pools, complete layout split/ODT persistence, redlines,frames,Repeat and full native row/SaveTable lifetimes remain unverified. Source-unit inheritance split adds table methods to the existing numbering owner without forwarding methods. Registered save/open/recovery deviations are preserved. No independent reviewer is claimed; exact-SHA review is by this agent in EVALUATOR phase. Parent goal remains ACTIVE; full parity UNVERIFIED.
