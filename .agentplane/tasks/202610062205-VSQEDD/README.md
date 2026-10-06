---
id: "202610062205-VSQEDD"
title: "Move represented row height mutation into native document ownership"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 12
origin:
  system: "manual"
depends_on: []
tags:
  - "parity"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-06T22:05:55.431Z"
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
    body: "Start: implement approved native document minimum-row-height ownership under standing iterative user authorization."
events:
  -
    type: "status"
    at: "2026-10-06T22:05:56.104Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implement approved native document minimum-row-height ownership under standing iterative user authorization."
doc_version: 3
doc_updated_at: "2026-10-06T22:21:37.363Z"
doc_updated_by: "CODER"
description: "Iteration201: remove shell row-height mutation/history adapter; source current or table-selected original row scope, document-owned history and common represented minimum-height getter. Preserve registered exceptions and all previous acceptance contracts."
sections:
  Summary: "Iteration201 moves represented minimum-row-height selection, mutation and history out of SwFEShell into SwDoc/ndtbl1. Standing iterative user authorization; prior200 verified progress and full goal remains active."
  Scope: "7approved semantic paths: apps/office/src/sw/source/core/docnode/ndtbl1.ts, apps/office/src/sw/source/core/doc/doc.ts, apps/office/src/sw/source/core/frmedt/fetab.ts, apps/office/src/sw/source/core/docnode/native-row-height-owner.test.ts, apps/office/src/sw/source/uibase/wrtsh/native-row-height-owner-history.test.ts, docs/program/source-provenance.json, docs/program/parity/runtime-inventory.json.3production,2new acceptance,2metadata;534old acceptance files byte-identical,536total.277metadata prefixes/classifications/defaults/contracts retained. Parent525703characters SHAcfab4560c2a7cac6797e5659cdc5ee8e46044763c960c874e0b0646c215da33c intact. No fixed/relative frame-size model, layout/XML/mouse geometry changes, unrelated box/border scope expansion or registered save/open/recovery deviation changes."
  Plan: |-
    1.CODER share document-owned original row-attribute admission/history transaction in ndtbl1 for split and represented minimum height. Current ordinary cursor ignores mark/ring; actual SwTableCursor boxes select original rows once. Existing flat rows only; source ancestor/nested proportional frame-size handling unverified.
    2.Add static SwDoc/GetRowHeight common represented minimum height (default0, mixed/empty undefined), instance SetRowHeight and thin bracketed shell forwarding, delete shell SetRowAttr/import. Existing numeric minimum-height UI input retained, source full SwFormatFrameSize type/fixed/relative dimensions unverified; no parity promotion. Preserve actual row format unrelated fields, same-value source history, foreign/outside/empty/disconnected refusal, original cursor graph/pending/list/grouped undo notifications.
    3.Add2independent tests for doc current/mark/ring/table-selected/common defaults/mixed/admission/same-value history and shell forwarding/selected Properties/3UndoRedo/ODT/continued input/original graph. All534old test bytes unchanged.
    4.Six static gates once, unchanged JSDoc and physical lines<1000. ONE full upstream-absent build/app/inventory/scripts/Chromium profile, vendor restored finally; source/scope/AP audits awaited before and only outside profiles. Actual100 app/inventory only genuine identical source/map counters or complete contiguous source/full fn/branch/location maps; verified old identical whole maps allowed. Only originalfailed/genuinelynew closures, no historical pass/full replay. Raw only ignored app cache, AP bounded English prose/counts/hashes.
    5.Source/scope/doctor/routing/diff/artifact census and exact implementationSHA same current-agent EVALUATOR explicitly not independent. Final prose before canonical verify; finish actualSHA, preserve entire parent prefix and clean tracked/untracked. No subagents/network/global/outside, no whole goal completion. Stop material drift.
  Verify Steps: |-
    Six initial static gates ONCE: npm run format:check, lint, typecheck, check:dependencies, check:docs, check:file-size. Unchanged JSDoc/physical-line<1000 and scoped format/lint for5code/test paths; repeat only failures or genuinely changed closures.
    ONE upstream-absent build/app/inventory/scripts/Chromium profile restored finally; no source/scope/AP audits while live. Actual100 app/inventory counter coverage with strict whole identical maps/source or complete contiguous full function/branch/location proofs; skips remain skips. No historical passing replay/full rerun, focused only originalfailed/genuinelynew cases.
    2new acceptance files: direct document setter owns undo/history and original current/table-selected row scope, mark/ring ignored, duplicates collected once, defaults/mixed/empty/foreign/outside/disconnected and same-value history; thin shell no ApplyAction; selected Properties retains row scope; model notification, original owners/list/pending/cursor and3UndoRedo/ODT/continued input.534prior acceptance byte-identical;536total.
    Five source gates generation --check/source-tree/provenance/invariants/parity after restoration.7approvedpaths,277metadata full prefixes/classifications/defaults/contracts and registered exceptions unchanged; parent525703/cfab4560c2a7cac6797e5659cdc5ee8e46044763c960c874e0b0646c215da33c intact. Pinned source and original stash retained.
    Doctor/routing/diff PASS, current AP/generated quality0forbidden. ExactSHA same-agent EVALUATOR explicitly not independent. Final prose before canonical verify; finish actualimplementationSHA and parent complete append, final clean tracked/untracked. Full SwFormatFrameSize/fixed/relative/nested proportional heights/merged/layout/row splitting/widgets/full parity unverified.
  Verification: "Pending implementation/evidence; full goal active."
  Rollback Plan: "Revert eventual implementation in a new task; retain original stashc85f4a0e453dfd06d6e199554784f2c286737472, no destructive reset or pop/drop. Restore vendor finally; raw only ignored app cache. No upstream sources/helpers/Python in AP."
  Findings: |-
    Clean main6685f051b407e5674066f5429aea6743ea3b038c, only active parent before this leaf; prior200complete. Read-only discovery pinned ndtbl1.cxx Set/GetRowHeight owns lcl_CollectLines true, SwUndoAttrTable and SetModified; fetab.cxx bracketed document forwarding. Existing shell SetRowAttr expands ordinary editing rings and owns ChangeTable/ApplyAction, actual architecture and selection divergence. Source fmtfsize.hxx/atrfrm.cxx has full SwFormatFrameSize default Variable height0 Fixed width0 and complete-item equality; source rowht dialog selects Minimum/Fixed. Existing app represents only minHeight, UI minRowHeight, min floor rendering/XML. This atomic task ports existing minimum-height ownership and shared flat-row selection; complete frame-size contracts remain unverified. One harmless wrong browser source path read failed; parent route recomputed, correct inventory path loaded before further action. No source stored in AP.
    Process recovery: implementation commit initially rejected because task parity tag requires parity/task/close/integrate scope, not code. Premature exact-SHA script then refused absent new test at prior AP-only HEAD; no quality verdict produced. Route recomputed, doctor0errors2known warnings; owner restored. Use enforced parity subject and evaluate only successful actual implementation SHA. No implementation or checks changed.
id_source: "generated"
---
## Summary

Iteration201 moves represented minimum-row-height selection, mutation and history out of SwFEShell into SwDoc/ndtbl1. Standing iterative user authorization; prior200 verified progress and full goal remains active.

## Scope

7approved semantic paths: apps/office/src/sw/source/core/docnode/ndtbl1.ts, apps/office/src/sw/source/core/doc/doc.ts, apps/office/src/sw/source/core/frmedt/fetab.ts, apps/office/src/sw/source/core/docnode/native-row-height-owner.test.ts, apps/office/src/sw/source/uibase/wrtsh/native-row-height-owner-history.test.ts, docs/program/source-provenance.json, docs/program/parity/runtime-inventory.json.3production,2new acceptance,2metadata;534old acceptance files byte-identical,536total.277metadata prefixes/classifications/defaults/contracts retained. Parent525703characters SHAcfab4560c2a7cac6797e5659cdc5ee8e46044763c960c874e0b0646c215da33c intact. No fixed/relative frame-size model, layout/XML/mouse geometry changes, unrelated box/border scope expansion or registered save/open/recovery deviation changes.

## Plan

1.CODER share document-owned original row-attribute admission/history transaction in ndtbl1 for split and represented minimum height. Current ordinary cursor ignores mark/ring; actual SwTableCursor boxes select original rows once. Existing flat rows only; source ancestor/nested proportional frame-size handling unverified.
2.Add static SwDoc/GetRowHeight common represented minimum height (default0, mixed/empty undefined), instance SetRowHeight and thin bracketed shell forwarding, delete shell SetRowAttr/import. Existing numeric minimum-height UI input retained, source full SwFormatFrameSize type/fixed/relative dimensions unverified; no parity promotion. Preserve actual row format unrelated fields, same-value source history, foreign/outside/empty/disconnected refusal, original cursor graph/pending/list/grouped undo notifications.
3.Add2independent tests for doc current/mark/ring/table-selected/common defaults/mixed/admission/same-value history and shell forwarding/selected Properties/3UndoRedo/ODT/continued input/original graph. All534old test bytes unchanged.
4.Six static gates once, unchanged JSDoc and physical lines<1000. ONE full upstream-absent build/app/inventory/scripts/Chromium profile, vendor restored finally; source/scope/AP audits awaited before and only outside profiles. Actual100 app/inventory only genuine identical source/map counters or complete contiguous source/full fn/branch/location maps; verified old identical whole maps allowed. Only originalfailed/genuinelynew closures, no historical pass/full replay. Raw only ignored app cache, AP bounded English prose/counts/hashes.
5.Source/scope/doctor/routing/diff/artifact census and exact implementationSHA same current-agent EVALUATOR explicitly not independent. Final prose before canonical verify; finish actualSHA, preserve entire parent prefix and clean tracked/untracked. No subagents/network/global/outside, no whole goal completion. Stop material drift.

## Verify Steps

Six initial static gates ONCE: npm run format:check, lint, typecheck, check:dependencies, check:docs, check:file-size. Unchanged JSDoc/physical-line<1000 and scoped format/lint for5code/test paths; repeat only failures or genuinely changed closures.
ONE upstream-absent build/app/inventory/scripts/Chromium profile restored finally; no source/scope/AP audits while live. Actual100 app/inventory counter coverage with strict whole identical maps/source or complete contiguous full function/branch/location proofs; skips remain skips. No historical passing replay/full rerun, focused only originalfailed/genuinelynew cases.
2new acceptance files: direct document setter owns undo/history and original current/table-selected row scope, mark/ring ignored, duplicates collected once, defaults/mixed/empty/foreign/outside/disconnected and same-value history; thin shell no ApplyAction; selected Properties retains row scope; model notification, original owners/list/pending/cursor and3UndoRedo/ODT/continued input.534prior acceptance byte-identical;536total.
Five source gates generation --check/source-tree/provenance/invariants/parity after restoration.7approvedpaths,277metadata full prefixes/classifications/defaults/contracts and registered exceptions unchanged; parent525703/cfab4560c2a7cac6797e5659cdc5ee8e46044763c960c874e0b0646c215da33c intact. Pinned source and original stash retained.
Doctor/routing/diff PASS, current AP/generated quality0forbidden. ExactSHA same-agent EVALUATOR explicitly not independent. Final prose before canonical verify; finish actualimplementationSHA and parent complete append, final clean tracked/untracked. Full SwFormatFrameSize/fixed/relative/nested proportional heights/merged/layout/row splitting/widgets/full parity unverified.

## Verification

Pending implementation/evidence; full goal active.

## Rollback Plan

Revert eventual implementation in a new task; retain original stashc85f4a0e453dfd06d6e199554784f2c286737472, no destructive reset or pop/drop. Restore vendor finally; raw only ignored app cache. No upstream sources/helpers/Python in AP.

## Findings

Clean main6685f051b407e5674066f5429aea6743ea3b038c, only active parent before this leaf; prior200complete. Read-only discovery pinned ndtbl1.cxx Set/GetRowHeight owns lcl_CollectLines true, SwUndoAttrTable and SetModified; fetab.cxx bracketed document forwarding. Existing shell SetRowAttr expands ordinary editing rings and owns ChangeTable/ApplyAction, actual architecture and selection divergence. Source fmtfsize.hxx/atrfrm.cxx has full SwFormatFrameSize default Variable height0 Fixed width0 and complete-item equality; source rowht dialog selects Minimum/Fixed. Existing app represents only minHeight, UI minRowHeight, min floor rendering/XML. This atomic task ports existing minimum-height ownership and shared flat-row selection; complete frame-size contracts remain unverified. One harmless wrong browser source path read failed; parent route recomputed, correct inventory path loaded before further action. No source stored in AP.
Process recovery: implementation commit initially rejected because task parity tag requires parity/task/close/integrate scope, not code. Premature exact-SHA script then refused absent new test at prior AP-only HEAD; no quality verdict produced. Route recomputed, doctor0errors2known warnings; owner restored. Use enforced parity subject and evaluate only successful actual implementation SHA. No implementation or checks changed.
