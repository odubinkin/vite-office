---
id: "202610061930-TVEFME"
title: "Wire native current-page table properties reset"
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
  updated_at: "2026-10-06T19:30:52.399Z"
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
    body: "Start: wire source current-page Reset over native shared drafts, preserve prior acceptance/contracts and canonical graph/history, one upstream-absent profile."
events:
  -
    type: "status"
    at: "2026-10-06T19:30:59.974Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: wire source current-page Reset over native shared drafts, preserve prior acceptance/contracts and canonical graph/history, one upstream-absent profile."
doc_version: 3
doc_updated_at: "2026-10-06T19:30:59.974Z"
doc_updated_by: "CODER"
description: "Restore the upstream Reset action for existing Writer Table Properties pages using original native format/column Reset owners and page-local initial text-flow/border values. Preserve canonical document/history isolation and registered deviations."
sections:
  Summary: "Restore upstream current-page Reset in existing Writer Table Properties. Native format/column Reset handlers preserve original shared draft ownership; Text Flow and Borders restore only represented initial page controls. Document/history remains unchanged until OK."
  Scope: "Base3df48bca883f6dd575b7b3642d36d71a4f504606;exactly6 semantic paths:apps/office/src/sw/browser/presentation/WriterTableDialog.tsx, apps/office/src/sw/browser/presentation/native-table-properties-reset.test.tsx, apps/office/src/sw/source/uibase/wrtsh/native-table-properties-reset-history.test.ts, apps/office/e2e/writer-native-table-properties-reset.spec.ts, docs/program/source-provenance.json, docs/program/parity/runtime-inventory.json. All516 historical acceptance files byte-identical;3new519total.276 prior metadata contracts/full prefixes/statuses/defaults/classifications/registered filename/I/O/recovery deviations preserved. Entire parent504171chars SHA19caaf1a09d82585530dd681368bd0695f7e0358cdce2ffd914951074580bdcb preserved. No network/outside/global/subagents. No source/scripts/raw diagnostics/maps/cases in AP; raw only ignored app cache. Whole parity/unsupported percentage/name/text direction/full widget ranges/SfxItemSet remains unverified."
  Plan: "1.Compare pinned SfxTabDialogController::ResetHdl and existing Writer format/column Reset owners.2.Add current-page Reset button calling native owners or restoring initial represented Text Flow/Borders values; retain other page drafts.3.Add mounted/current shell history/ODT and Chromium1280/390 current-page/multi-page reset/cancel/OK/input cases.4.Run static once and one upstream-absent full profile; restore before source/scope/governance audits; actual100 identical-source/map coverage only and failed/new-only closures.5.Exact implementation-SHA same-agent EVALUATOR phase explicitly not independent, canonical verify/finish, parent append preserving full prefix and clean status."
  Verify Steps: |-
    1.Six initial static gates format/lint/typecheck/dependencies/docs/file-size once; unchanged scoped JSDoc, physical lines split without trimming<1000. Only original failed/genuinely changed-path checks afterward.
    2.ONE full upstream-absent build/application/inventory/scripts/Chromium profile; vendor restored finally; no runtime/tests invoke upstream. No source/scope/AP audits while absence profile live, await audits before any profile. Actual100 app/inventory coverage using whole identical source/maps or complete contiguous identical regions with full functions/branches and real counters; verified earlier entire matching source/maps allowed without replay. No passing/full replay, only original failed or genuinely new cases; focused skips retained.
    3.Reset composition matches SfxTabDialogController::ResetHdl: current page only, original input values, active tab retained. Table/Columns call existing native Reset owners; shared draft identity/flags and native cross-tab activation retained. Text Flow/Borders reset existing controls only; other-page drafts retained. Repeated Reset, Cancel, OK, original model graph/cursor/list, grouped UndoRedo/continued input and ODT; Chromium1280/390 ordinary clicks and keyboard.
    4.Restored five source gates resourcegeneration --check/source-tree/provenance/invariants/parity;6 approved paths;516old acceptance byte-identical+3new519;276full metadata prefixes/defaults/statuses/classifications/registered exceptions preserved;full parent504171chars SHA19caaf1a09d82585530dd681368bd0695f7e0358cdce2ffd914951074580bdcb retained.
    5.Doctor/routing/diff/source hashes/current leaf and generated quality census0forbidden. Exact implementation-SHA same current-agent EVALUATOR explicitly not independent. Final prose before canonical verify, finish actual implSHA; parent/goal active, whole parity unverified and clean final tracked state.
  Verification: "Pending approved implementation and exact evidence; whole parity remains unverified."
  Rollback Plan: "Revert only the active task implementation commit and task-local lifecycle records; preserve prior commits, registered deviations, original deferred stash and entire parent history."
  Findings: "Read-only source comparison: native tableproperties.ui includes Reset and SfxTabDialogController::ResetHdl resets only the current page to initial input values. Existing browser lacks this action despite native format/column Reset owners being available. Previous goal turn completed leaf195 with clean parent progress (3df48bca883f); classified progress. Standing iterative authorization covers this scope. Read-only discovery again included nonexistent tablemgr.ts (rg exit2), route recomputed; no file mutation or criteria drift. No matched MetricSpin path (rg exit1), route recomputed; existing supported reset source used."
id_source: "generated"
---
## Summary

Restore upstream current-page Reset in existing Writer Table Properties. Native format/column Reset handlers preserve original shared draft ownership; Text Flow and Borders restore only represented initial page controls. Document/history remains unchanged until OK.

## Scope

Base3df48bca883f6dd575b7b3642d36d71a4f504606;exactly6 semantic paths:apps/office/src/sw/browser/presentation/WriterTableDialog.tsx, apps/office/src/sw/browser/presentation/native-table-properties-reset.test.tsx, apps/office/src/sw/source/uibase/wrtsh/native-table-properties-reset-history.test.ts, apps/office/e2e/writer-native-table-properties-reset.spec.ts, docs/program/source-provenance.json, docs/program/parity/runtime-inventory.json. All516 historical acceptance files byte-identical;3new519total.276 prior metadata contracts/full prefixes/statuses/defaults/classifications/registered filename/I/O/recovery deviations preserved. Entire parent504171chars SHA19caaf1a09d82585530dd681368bd0695f7e0358cdce2ffd914951074580bdcb preserved. No network/outside/global/subagents. No source/scripts/raw diagnostics/maps/cases in AP; raw only ignored app cache. Whole parity/unsupported percentage/name/text direction/full widget ranges/SfxItemSet remains unverified.

## Plan

1.Compare pinned SfxTabDialogController::ResetHdl and existing Writer format/column Reset owners.2.Add current-page Reset button calling native owners or restoring initial represented Text Flow/Borders values; retain other page drafts.3.Add mounted/current shell history/ODT and Chromium1280/390 current-page/multi-page reset/cancel/OK/input cases.4.Run static once and one upstream-absent full profile; restore before source/scope/governance audits; actual100 identical-source/map coverage only and failed/new-only closures.5.Exact implementation-SHA same-agent EVALUATOR phase explicitly not independent, canonical verify/finish, parent append preserving full prefix and clean status.

## Verify Steps

1.Six initial static gates format/lint/typecheck/dependencies/docs/file-size once; unchanged scoped JSDoc, physical lines split without trimming<1000. Only original failed/genuinely changed-path checks afterward.
2.ONE full upstream-absent build/application/inventory/scripts/Chromium profile; vendor restored finally; no runtime/tests invoke upstream. No source/scope/AP audits while absence profile live, await audits before any profile. Actual100 app/inventory coverage using whole identical source/maps or complete contiguous identical regions with full functions/branches and real counters; verified earlier entire matching source/maps allowed without replay. No passing/full replay, only original failed or genuinely new cases; focused skips retained.
3.Reset composition matches SfxTabDialogController::ResetHdl: current page only, original input values, active tab retained. Table/Columns call existing native Reset owners; shared draft identity/flags and native cross-tab activation retained. Text Flow/Borders reset existing controls only; other-page drafts retained. Repeated Reset, Cancel, OK, original model graph/cursor/list, grouped UndoRedo/continued input and ODT; Chromium1280/390 ordinary clicks and keyboard.
4.Restored five source gates resourcegeneration --check/source-tree/provenance/invariants/parity;6 approved paths;516old acceptance byte-identical+3new519;276full metadata prefixes/defaults/statuses/classifications/registered exceptions preserved;full parent504171chars SHA19caaf1a09d82585530dd681368bd0695f7e0358cdce2ffd914951074580bdcb retained.
5.Doctor/routing/diff/source hashes/current leaf and generated quality census0forbidden. Exact implementation-SHA same current-agent EVALUATOR explicitly not independent. Final prose before canonical verify, finish actual implSHA; parent/goal active, whole parity unverified and clean final tracked state.

## Verification

Pending approved implementation and exact evidence; whole parity remains unverified.

## Rollback Plan

Revert only the active task implementation commit and task-local lifecycle records; preserve prior commits, registered deviations, original deferred stash and entire parent history.

## Findings

Read-only source comparison: native tableproperties.ui includes Reset and SfxTabDialogController::ResetHdl resets only the current page to initial input values. Existing browser lacks this action despite native format/column Reset owners being available. Previous goal turn completed leaf195 with clean parent progress (3df48bca883f); classified progress. Standing iterative authorization covers this scope. Read-only discovery again included nonexistent tablemgr.ts (rg exit2), route recomputed; no file mutation or criteria drift. No matched MetricSpin path (rg exit1), route recomputed; existing supported reset source used.
