---
id: "202610071025-6RKM2B"
title: "Move native row height editing to its upstream dialog"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 17
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-07T10:50:11.128Z"
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
    body: "Start: Port separate native row height dialog and source command placement under standing iterative authorization; preserve original selection and history."
events:
  -
    type: "status"
    at: "2026-10-07T10:25:49.053Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: Port separate native row height dialog and source command placement under standing iterative authorization; preserve original selection and history."
doc_version: 3
doc_updated_at: "2026-10-07T10:50:10.722Z"
doc_updated_by: "CODER"
description: "Replace misplaced Table Properties height control with source SwTableHeightDlg and SetRowHeight menu command, preserving native row ownership and history."
sections:
  Summary: "Port existing row-height editing to the pinned source dialog and generated menu command."
  Scope: |-
    apps/office/src/sw/source/ui/table/rowht.ts
    apps/office/src/sw/browser/presentation/WriterRowHeightDialog.tsx
    apps/office/src/sw/browser/presentation/WriterTableDialog.tsx
    apps/office/src/sw/browser/presentation/writer-view.tsx
    scripts/generate-writer-ui-resources.ts
    apps/office/src/sw/uiconfig/swriter/writer-ui.generated.json
    apps/office/src/sw/browser/editor/native-table-selection.test.tsx
    apps/office/src/sw/browser/editor/native-row-frame-size.test.tsx
    apps/office/src/sw/browser/presentation/native-table-properties-reset.test.tsx
    apps/office/src/sw/browser/presentation/native-table-column-page.test.tsx
    apps/office/src/sw/browser/presentation/writer-view.test.tsx
    apps/office/src/sw/browser/presentation/native-table-height-delta.test.tsx
    apps/office/src/sw/browser/presentation/WriterTableDialog.test.tsx
    apps/office/e2e/writer-native-table-properties-reset.spec.ts
    apps/office/src/sw/source/ui/table/native-row-height-dialog.test.ts
    apps/office/src/sw/browser/presentation/native-row-height-dialog.test.tsx
    apps/office/e2e/writer-native-row-height-dialog.spec.ts
    docs/program/source-provenance.json
    docs/program/parity/runtime-inventory.json
    apps/office/src/sw/browser/editor/browser-writer-edit-window.ts
    scripts/libreoffice-inventory/parity-mapping-cli.test.ts
  Plan: |-
    One CODER leaf under standing iterative user authorization: port source SwTableHeightDlg height/fit draft and Apply using original SwWrtShell GetRowHeight/SetRowHeight, MINLAY23, native Fixed/Minimum and current/selected-row scope; render separate Row Height modal with Height and Fit to size, OK/Cancel, generated .uno:SetRowHeight source slot/menu Table > Size. Remove extra minimum-height field and rowHeight ingress from Table Properties; preserve separate existing direct API compatibility pending native item-set refactor. Migrate only affected obsolete control assertions to source-shaped command, preserve all other prior acceptance bytes and assertions; add native/mounted/real Chromium1280/390 Fixed/Minimum/Variable defaults, Cancel/escape, selected/current height mode, minimum admission, grouped history/three UndoRedo/original owners/continued editing/ODT reopen. Approved semantic paths: apps/office/src/sw/source/ui/table/rowht.ts, apps/office/src/sw/browser/presentation/WriterRowHeightDialog.tsx, apps/office/src/sw/browser/presentation/WriterTableDialog.tsx, apps/office/src/sw/browser/presentation/writer-view.tsx, scripts/generate-writer-ui-resources.ts, apps/office/src/sw/uiconfig/swriter/writer-ui.generated.json, apps/office/src/sw/browser/editor/native-table-selection.test.tsx, apps/office/src/sw/browser/editor/native-row-frame-size.test.tsx, apps/office/src/sw/browser/presentation/native-table-properties-reset.test.tsx, apps/office/src/sw/browser/presentation/native-table-column-page.test.tsx, apps/office/src/sw/browser/presentation/writer-view.test.tsx, apps/office/src/sw/browser/presentation/native-table-height-delta.test.tsx, apps/office/src/sw/browser/presentation/WriterTableDialog.test.tsx, apps/office/e2e/writer-native-table-properties-reset.spec.ts, apps/office/src/sw/source/ui/table/native-row-height-dialog.test.ts, apps/office/src/sw/browser/presentation/native-row-height-dialog.test.tsx, apps/office/e2e/writer-native-row-height-dialog.spec.ts, docs/program/source-provenance.json, docs/program/parity/runtime-inventory.json. Preserve all291 prior metadata complete fields/prefixes/status/defaults/registered save/open/recovery deviations; add precisely mapped rowht module and source-backed bounded notes, no blanket promotion. Six static gates once, ONE full upstream-absent build/app/inventory/infrastructure/Chromium profile, failure-only/genuinely-new closures. Strict100 actual current app/inventory coverage from whole byte-identical source and complete maps or complete contiguous declaration/body/enclosing branch/all mapped locations; no fabricated counters/exclusions/skip promotion/passing replay. Restore vendor finally before source gates. Unchanged JSDoc and actualphysical<1000, strict scope/artifact/governance and exact same-agent EVALUATOR review (not independent), final prose before canonicalverify, finish actual implementationSHA and parent complete prefix append, finalclean. No upstream sources/scripts/Python/raw maps/results in AP; no network/global/subagents. Help content integration/other unimplemented size slots/whole parity remain unverified, not deliberate exceptions.
    Source-backed required remediation within the same row-height task: include apps/office/src/sw/browser/editor/browser-writer-edit-window.ts. Menu restores focus before command dispatch; current browser HandleFocus repositions native cursor to stale focused paragraph. Native SwEditWin::GetFocus preserves shell cursor (edtwin.cxx5732-5745). Returning from a role=menu must preserve native cursor/table selection; add one genuinely-new mounted row-height regression only, do not replay passed tests. Full terminal profile found two original migrated app failures, one inventory lexical-order failure and two new Chromium CSS-device-quantization expectation failures. Resolve metadata insertion order while preserving complete old records by identity, correct only exact newfailed CSS expectation to chromium 1/64-pixel device value, retain all original assertions. ONE failed-only/new-case closure with rebuilt changed input; no second full profile.
    Include scripts/libreoffice-inventory/parity-mapping-cli.test.ts for exact source-backed command census migration55->56 because generated SetRowHeight adds one existing height-operation command; all other report fields and assertions unchanged. New additional refocus regression remains genuinely unexecuted (initial closure mistakenly nested it under filtered-out callback); move only its added definition to top level, keep initial four passing definitions byte-identical. Initial full and closure1 terminal, vendor restored, no passing replay. Final approved semantic21paths/old migration9files/564 prior byte-identical/576 total acceptance.
  Verify Steps: |-
    1. Initial six static gates once: npm run format:check, lint, typecheck, check:dependencies, check:docs, check:file-size. Unchanged JSDoc validator and actual physical line count for changed sources.
    2. ONE full upstream-absent profile: test:static build; app coverage; inventory coverage; infrastructure source/resource/boundary tests; Chromium. Restore vendor in finally. Failed-only or genuinely-new closure, no passing replay. Preserve every assertion outside exact obsolete-control migration intervals. Verify native Fixed/Minimum/Variable input, MINLAY23, separate menu/dialog, original current/selected row owners, Cancel/Escape/Enter, Fit checkbox, clipping, three Undo/Redo, ODT roundtrip, continued edits.
    3. Strict actual100 app/inventory source-bound coverage, finite nonnegative counters, whole byte-identical source/maps or complete contiguous mapped declaration/body/branch transfer. No exclusions, counter fabrication, skips promotion.
    4. After restoration source generation --check/tree/provenance/invariants/parity gates. Exact scope, all291 old metadata fields/prefixes/registered deviations, all573 old acceptance files except approved assertion migrations; no forbidden AP content. Governance and exact implementationSHA same-agent EVALUATOR (not independent). Final Findings/Verification before canonicalverify. Close actual implementationSHA then parent complete prefix append and clean state.
  Verification: "Pending actual verification; no completion claim."
  Rollback Plan: "Revert the task implementation commit; preserve previously registered save/open/recovery exceptions and task history."
  Findings: "Pinned local rowht.cxx35-67: captures GetRowHeight, fit defaults type!=Fixed, MINLAY23, Apply Fixed or Minimum through SetRowHeight. tabsh.cxx910 opens independent dialog and Apply only RET_OK. rowheight.ui has Height/Fit to size/OK/Cancel/Help; Table Properties Text Flow has no row-height field. Source menubar TableAutoFitMenu > SetRowHeight, SDI FN_TABLE_SET_ROW_HEIGHT. Help system and other unimplemented size commands remain unverified."
id_source: "generated"
---
## Summary

Port existing row-height editing to the pinned source dialog and generated menu command.

## Scope

apps/office/src/sw/source/ui/table/rowht.ts
apps/office/src/sw/browser/presentation/WriterRowHeightDialog.tsx
apps/office/src/sw/browser/presentation/WriterTableDialog.tsx
apps/office/src/sw/browser/presentation/writer-view.tsx
scripts/generate-writer-ui-resources.ts
apps/office/src/sw/uiconfig/swriter/writer-ui.generated.json
apps/office/src/sw/browser/editor/native-table-selection.test.tsx
apps/office/src/sw/browser/editor/native-row-frame-size.test.tsx
apps/office/src/sw/browser/presentation/native-table-properties-reset.test.tsx
apps/office/src/sw/browser/presentation/native-table-column-page.test.tsx
apps/office/src/sw/browser/presentation/writer-view.test.tsx
apps/office/src/sw/browser/presentation/native-table-height-delta.test.tsx
apps/office/src/sw/browser/presentation/WriterTableDialog.test.tsx
apps/office/e2e/writer-native-table-properties-reset.spec.ts
apps/office/src/sw/source/ui/table/native-row-height-dialog.test.ts
apps/office/src/sw/browser/presentation/native-row-height-dialog.test.tsx
apps/office/e2e/writer-native-row-height-dialog.spec.ts
docs/program/source-provenance.json
docs/program/parity/runtime-inventory.json
apps/office/src/sw/browser/editor/browser-writer-edit-window.ts
scripts/libreoffice-inventory/parity-mapping-cli.test.ts

## Plan

One CODER leaf under standing iterative user authorization: port source SwTableHeightDlg height/fit draft and Apply using original SwWrtShell GetRowHeight/SetRowHeight, MINLAY23, native Fixed/Minimum and current/selected-row scope; render separate Row Height modal with Height and Fit to size, OK/Cancel, generated .uno:SetRowHeight source slot/menu Table > Size. Remove extra minimum-height field and rowHeight ingress from Table Properties; preserve separate existing direct API compatibility pending native item-set refactor. Migrate only affected obsolete control assertions to source-shaped command, preserve all other prior acceptance bytes and assertions; add native/mounted/real Chromium1280/390 Fixed/Minimum/Variable defaults, Cancel/escape, selected/current height mode, minimum admission, grouped history/three UndoRedo/original owners/continued editing/ODT reopen. Approved semantic paths: apps/office/src/sw/source/ui/table/rowht.ts, apps/office/src/sw/browser/presentation/WriterRowHeightDialog.tsx, apps/office/src/sw/browser/presentation/WriterTableDialog.tsx, apps/office/src/sw/browser/presentation/writer-view.tsx, scripts/generate-writer-ui-resources.ts, apps/office/src/sw/uiconfig/swriter/writer-ui.generated.json, apps/office/src/sw/browser/editor/native-table-selection.test.tsx, apps/office/src/sw/browser/editor/native-row-frame-size.test.tsx, apps/office/src/sw/browser/presentation/native-table-properties-reset.test.tsx, apps/office/src/sw/browser/presentation/native-table-column-page.test.tsx, apps/office/src/sw/browser/presentation/writer-view.test.tsx, apps/office/src/sw/browser/presentation/native-table-height-delta.test.tsx, apps/office/src/sw/browser/presentation/WriterTableDialog.test.tsx, apps/office/e2e/writer-native-table-properties-reset.spec.ts, apps/office/src/sw/source/ui/table/native-row-height-dialog.test.ts, apps/office/src/sw/browser/presentation/native-row-height-dialog.test.tsx, apps/office/e2e/writer-native-row-height-dialog.spec.ts, docs/program/source-provenance.json, docs/program/parity/runtime-inventory.json. Preserve all291 prior metadata complete fields/prefixes/status/defaults/registered save/open/recovery deviations; add precisely mapped rowht module and source-backed bounded notes, no blanket promotion. Six static gates once, ONE full upstream-absent build/app/inventory/infrastructure/Chromium profile, failure-only/genuinely-new closures. Strict100 actual current app/inventory coverage from whole byte-identical source and complete maps or complete contiguous declaration/body/enclosing branch/all mapped locations; no fabricated counters/exclusions/skip promotion/passing replay. Restore vendor finally before source gates. Unchanged JSDoc and actualphysical<1000, strict scope/artifact/governance and exact same-agent EVALUATOR review (not independent), final prose before canonicalverify, finish actual implementationSHA and parent complete prefix append, finalclean. No upstream sources/scripts/Python/raw maps/results in AP; no network/global/subagents. Help content integration/other unimplemented size slots/whole parity remain unverified, not deliberate exceptions.
Source-backed required remediation within the same row-height task: include apps/office/src/sw/browser/editor/browser-writer-edit-window.ts. Menu restores focus before command dispatch; current browser HandleFocus repositions native cursor to stale focused paragraph. Native SwEditWin::GetFocus preserves shell cursor (edtwin.cxx5732-5745). Returning from a role=menu must preserve native cursor/table selection; add one genuinely-new mounted row-height regression only, do not replay passed tests. Full terminal profile found two original migrated app failures, one inventory lexical-order failure and two new Chromium CSS-device-quantization expectation failures. Resolve metadata insertion order while preserving complete old records by identity, correct only exact newfailed CSS expectation to chromium 1/64-pixel device value, retain all original assertions. ONE failed-only/new-case closure with rebuilt changed input; no second full profile.
Include scripts/libreoffice-inventory/parity-mapping-cli.test.ts for exact source-backed command census migration55->56 because generated SetRowHeight adds one existing height-operation command; all other report fields and assertions unchanged. New additional refocus regression remains genuinely unexecuted (initial closure mistakenly nested it under filtered-out callback); move only its added definition to top level, keep initial four passing definitions byte-identical. Initial full and closure1 terminal, vendor restored, no passing replay. Final approved semantic21paths/old migration9files/564 prior byte-identical/576 total acceptance.

## Verify Steps

1. Initial six static gates once: npm run format:check, lint, typecheck, check:dependencies, check:docs, check:file-size. Unchanged JSDoc validator and actual physical line count for changed sources.
2. ONE full upstream-absent profile: test:static build; app coverage; inventory coverage; infrastructure source/resource/boundary tests; Chromium. Restore vendor in finally. Failed-only or genuinely-new closure, no passing replay. Preserve every assertion outside exact obsolete-control migration intervals. Verify native Fixed/Minimum/Variable input, MINLAY23, separate menu/dialog, original current/selected row owners, Cancel/Escape/Enter, Fit checkbox, clipping, three Undo/Redo, ODT roundtrip, continued edits.
3. Strict actual100 app/inventory source-bound coverage, finite nonnegative counters, whole byte-identical source/maps or complete contiguous mapped declaration/body/branch transfer. No exclusions, counter fabrication, skips promotion.
4. After restoration source generation --check/tree/provenance/invariants/parity gates. Exact scope, all291 old metadata fields/prefixes/registered deviations, all573 old acceptance files except approved assertion migrations; no forbidden AP content. Governance and exact implementationSHA same-agent EVALUATOR (not independent). Final Findings/Verification before canonicalverify. Close actual implementationSHA then parent complete prefix append and clean state.

## Verification

Pending actual verification; no completion claim.

## Rollback Plan

Revert the task implementation commit; preserve previously registered save/open/recovery exceptions and task history.

## Findings

Pinned local rowht.cxx35-67: captures GetRowHeight, fit defaults type!=Fixed, MINLAY23, Apply Fixed or Minimum through SetRowHeight. tabsh.cxx910 opens independent dialog and Apply only RET_OK. rowheight.ui has Height/Fit to size/OK/Cancel/Help; Table Properties Text Flow has no row-height field. Source menubar TableAutoFitMenu > SetRowHeight, SDI FN_TABLE_SET_ROW_HEIGHT. Help system and other unimplemented size commands remain unverified.
