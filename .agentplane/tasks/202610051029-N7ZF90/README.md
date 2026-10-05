---
id: "202610051029-N7ZF90"
title: "Own table row selection and selected box painting in native cursor"
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
  updated_at: "2026-10-05T10:29:54.833Z"
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
    body: "Start: user authorized iterative UI upstream refactoring; native table selection leaf 147."
events:
  -
    type: "status"
    at: "2026-10-05T10:29:56.359Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: user authorized iterative UI upstream refactoring; native table selection leaf 147."
doc_version: 3
doc_updated_at: "2026-10-05T10:29:56.359Z"
doc_updated_by: "CODER"
description: "Iteration 147 under 202609240501-C9TN6M. Remove React selected table and row state; use native SwTableCursor selected boxes and shell row selection for the implemented flat table profile."
sections:
  Summary: "Move implemented table selection ownership from React state into native table/cursor/shell owners."
  Scope: "Iteration147: one atomic CODER leaf under 202609240501-C9TN6M, standing user approval to remove unnecessary UI layers. Implement flat unmerged equal-column native SwTable selection over actual box sections, SwTableCursor sorted selected boxes/actualization and shell SelectTableRow ownership. Project selected box start indices immutably for cell/row painting. Remove React selectedTable/selectedTableRow and editor selected-row adapter; properties follow actual cursor table and selected boxes. Preserve browser row gesture while converting native node coordinates through SwEditWin; insert dialog focuses native first cell. Keep I/O/recovery exceptions and semantic classifications/defaults/states unchanged. Scope: apps/office/src/sw/source/core/table/swtable.ts, apps/office/src/sw/source/core/crsr/swcrsr.ts, apps/office/src/sw/source/uibase/wrtsh/wrtsh1.ts, apps/office/src/sw/source/uibase/docvw/edtwin.ts, apps/office/src/sw/browser/presentation/writer-view-projection.ts, apps/office/src/sw/browser/presentation/writer-view.tsx, apps/office/src/sw/browser/editor/WriterPlainTextEditor.tsx, apps/office/src/sw/browser/editor/WriterEditableTable.tsx, apps/office/src/sw/source/uibase/wrtsh/native-table-selection.test.ts, apps/office/src/sw/browser/editor/native-table-selection.test.tsx, apps/office/e2e/writer-native-table-selection.spec.ts, docs/program/source-provenance.json, docs/program/parity/runtime-inventory.json. No network/outside access, upstream copies, AP scripts/raw diagnostics, whole-module promotion, full native cursor rings/layout/merged/protected selection claims. Plain Home/End and structural table editing remain separate."
  Plan: "Iteration147: one atomic CODER leaf under 202609240501-C9TN6M, standing user approval to remove unnecessary UI layers. Implement flat unmerged equal-column native SwTable selection over actual box sections, SwTableCursor sorted selected boxes/actualization and shell SelectTableRow ownership. Project selected box start indices immutably for cell/row painting. Remove React selectedTable/selectedTableRow and editor selected-row adapter; properties follow actual cursor table and selected boxes. Preserve browser row gesture while converting native node coordinates through SwEditWin; insert dialog focuses native first cell. Keep I/O/recovery exceptions and semantic classifications/defaults/states unchanged. Scope: apps/office/src/sw/source/core/table/swtable.ts, apps/office/src/sw/source/core/crsr/swcrsr.ts, apps/office/src/sw/source/uibase/wrtsh/wrtsh1.ts, apps/office/src/sw/source/uibase/docvw/edtwin.ts, apps/office/src/sw/browser/presentation/writer-view-projection.ts, apps/office/src/sw/browser/presentation/writer-view.tsx, apps/office/src/sw/browser/editor/WriterPlainTextEditor.tsx, apps/office/src/sw/browser/editor/WriterEditableTable.tsx, apps/office/src/sw/source/uibase/wrtsh/native-table-selection.test.ts, apps/office/src/sw/browser/editor/native-table-selection.test.tsx, apps/office/e2e/writer-native-table-selection.spec.ts, docs/program/source-provenance.json, docs/program/parity/runtime-inventory.json. No network/outside access, upstream copies, AP scripts/raw diagnostics, whole-module promotion, full native cursor rings/layout/merged/protected selection claims. Plain Home/End and structural table editing remain separate."
  Verify Steps: |-
    1. Six static gates first: npm run format:check; npm run lint; npm run typecheck; npm run check:dependencies; npm run check:docs; npm run check:file-size. Changed-file checks only after fixes.
    2. Rename pinned vendor inside repo with finally restoration; ONE sequential upstream-absent npm run test:static, app and inventory coverage with --coverage.reportOnFailure, scripts source-provenance/resource tests and full Chromium. Persist exact failed/error-causing case names before assertions. Coverage maps only ignored appcache, AP bounded English outcomes. No tests execute or read pinned upstream.
    3. Assert real native sorted identity/dedup/difference selection, rectangle versus row ownership, mark/point direction, no body selection, same/different table, existing table navigation updates, history-free row selection and selection kill. Mounted and Chromium assert row gesture actual shell owner, selected-cell painting, caret/body context changes and stale-state removal; preserve all existing test assertions. Close only failed gates/cases and genuinely new unexecuted cases. Never replay passing full/static/build/suite/test.
    4. After vendor restoration run resource generation --check, source-tree, provenance, inventory invariants and parity source audits. Retain semantic states, classifications, defaults and conscious save/open/recovery deviations. Verify no upstream sources/scripts/Python/raw frames in AP, clean scoped final status, exact-SHA evaluator audit, quality, canonical verification and finish; append bounded parent progress. Broad goal remains active.
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert the intentional semantic commit and task closure through a new authorized leaf; no history rewrite."
  Findings: "Source inspection: current React selectedTable/selectedTableRow separately own properties and painting. Pinned SwTableCursor owns sorted SwSelBoxes/ActualizeSelection/NewTableSelection; SwTable::CreateSelection owns flat selection; SwWrtShell::SelectTableRow delegates native cursor shell selection. Existing browser row affordance retained; no whole UI parity claim. Flat equal-column boxes only; full rings/layout/protection/nesting/merging remain unverified."
id_source: "generated"
---
## Summary

Move implemented table selection ownership from React state into native table/cursor/shell owners.

## Scope

Iteration147: one atomic CODER leaf under 202609240501-C9TN6M, standing user approval to remove unnecessary UI layers. Implement flat unmerged equal-column native SwTable selection over actual box sections, SwTableCursor sorted selected boxes/actualization and shell SelectTableRow ownership. Project selected box start indices immutably for cell/row painting. Remove React selectedTable/selectedTableRow and editor selected-row adapter; properties follow actual cursor table and selected boxes. Preserve browser row gesture while converting native node coordinates through SwEditWin; insert dialog focuses native first cell. Keep I/O/recovery exceptions and semantic classifications/defaults/states unchanged. Scope: apps/office/src/sw/source/core/table/swtable.ts, apps/office/src/sw/source/core/crsr/swcrsr.ts, apps/office/src/sw/source/uibase/wrtsh/wrtsh1.ts, apps/office/src/sw/source/uibase/docvw/edtwin.ts, apps/office/src/sw/browser/presentation/writer-view-projection.ts, apps/office/src/sw/browser/presentation/writer-view.tsx, apps/office/src/sw/browser/editor/WriterPlainTextEditor.tsx, apps/office/src/sw/browser/editor/WriterEditableTable.tsx, apps/office/src/sw/source/uibase/wrtsh/native-table-selection.test.ts, apps/office/src/sw/browser/editor/native-table-selection.test.tsx, apps/office/e2e/writer-native-table-selection.spec.ts, docs/program/source-provenance.json, docs/program/parity/runtime-inventory.json. No network/outside access, upstream copies, AP scripts/raw diagnostics, whole-module promotion, full native cursor rings/layout/merged/protected selection claims. Plain Home/End and structural table editing remain separate.

## Plan

Iteration147: one atomic CODER leaf under 202609240501-C9TN6M, standing user approval to remove unnecessary UI layers. Implement flat unmerged equal-column native SwTable selection over actual box sections, SwTableCursor sorted selected boxes/actualization and shell SelectTableRow ownership. Project selected box start indices immutably for cell/row painting. Remove React selectedTable/selectedTableRow and editor selected-row adapter; properties follow actual cursor table and selected boxes. Preserve browser row gesture while converting native node coordinates through SwEditWin; insert dialog focuses native first cell. Keep I/O/recovery exceptions and semantic classifications/defaults/states unchanged. Scope: apps/office/src/sw/source/core/table/swtable.ts, apps/office/src/sw/source/core/crsr/swcrsr.ts, apps/office/src/sw/source/uibase/wrtsh/wrtsh1.ts, apps/office/src/sw/source/uibase/docvw/edtwin.ts, apps/office/src/sw/browser/presentation/writer-view-projection.ts, apps/office/src/sw/browser/presentation/writer-view.tsx, apps/office/src/sw/browser/editor/WriterPlainTextEditor.tsx, apps/office/src/sw/browser/editor/WriterEditableTable.tsx, apps/office/src/sw/source/uibase/wrtsh/native-table-selection.test.ts, apps/office/src/sw/browser/editor/native-table-selection.test.tsx, apps/office/e2e/writer-native-table-selection.spec.ts, docs/program/source-provenance.json, docs/program/parity/runtime-inventory.json. No network/outside access, upstream copies, AP scripts/raw diagnostics, whole-module promotion, full native cursor rings/layout/merged/protected selection claims. Plain Home/End and structural table editing remain separate.

## Verify Steps

1. Six static gates first: npm run format:check; npm run lint; npm run typecheck; npm run check:dependencies; npm run check:docs; npm run check:file-size. Changed-file checks only after fixes.
2. Rename pinned vendor inside repo with finally restoration; ONE sequential upstream-absent npm run test:static, app and inventory coverage with --coverage.reportOnFailure, scripts source-provenance/resource tests and full Chromium. Persist exact failed/error-causing case names before assertions. Coverage maps only ignored appcache, AP bounded English outcomes. No tests execute or read pinned upstream.
3. Assert real native sorted identity/dedup/difference selection, rectangle versus row ownership, mark/point direction, no body selection, same/different table, existing table navigation updates, history-free row selection and selection kill. Mounted and Chromium assert row gesture actual shell owner, selected-cell painting, caret/body context changes and stale-state removal; preserve all existing test assertions. Close only failed gates/cases and genuinely new unexecuted cases. Never replay passing full/static/build/suite/test.
4. After vendor restoration run resource generation --check, source-tree, provenance, inventory invariants and parity source audits. Retain semantic states, classifications, defaults and conscious save/open/recovery deviations. Verify no upstream sources/scripts/Python/raw frames in AP, clean scoped final status, exact-SHA evaluator audit, quality, canonical verification and finish; append bounded parent progress. Broad goal remains active.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert the intentional semantic commit and task closure through a new authorized leaf; no history rewrite.

## Findings

Source inspection: current React selectedTable/selectedTableRow separately own properties and painting. Pinned SwTableCursor owns sorted SwSelBoxes/ActualizeSelection/NewTableSelection; SwTable::CreateSelection owns flat selection; SwWrtShell::SelectTableRow delegates native cursor shell selection. Existing browser row affordance retained; no whole UI parity claim. Flat equal-column boxes only; full rings/layout/protection/nesting/merging remain unverified.
