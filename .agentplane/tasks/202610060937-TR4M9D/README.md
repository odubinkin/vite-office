---
id: "202610060937-TR4M9D"
title: "Implement native counted column insertion and width redistribution through table UI"
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
  updated_at: "2026-10-06T09:38:37.681Z"
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
    body: "Start: iteration182 native column ownership, width redistribution and UI slots with one absent profile; full parity unverified."
events:
  -
    type: "status"
    at: "2026-10-06T09:38:38.655Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: iteration182 native column ownership, width redistribution and UI slots with one absent profile; full parity unverified."
doc_version: 3
doc_updated_at: "2026-10-06T09:38:38.655Z"
doc_updated_by: "CODER"
description: "Iteration182: port flat SwTable InsertCol/NewInsertCol selected column edges and proportional cumulative rounding; native column search expansion, document-owned shared SwUndoTableNdsChg history and contextual InsertColumnsBefore/After slots. Preserve original selection, table geometry and I/O deviations; one full upstream-absent profile."
sections:
  Summary: "Implement native counted flat column insertion and cumulative proportional width redistribution through the existing table shell/UI and shared document history."
  Scope: "apps/office/src/sw/source/core/table/swtable.ts; apps/office/src/sw/source/core/docnode/nodes.ts; apps/office/src/sw/source/core/doc/doc.ts; apps/office/src/sw/source/core/undo/untbl.ts; apps/office/src/sw/source/core/frmedt/fetab.ts; apps/office/src/sw/source/core/frmedt/tblsel.ts; apps/office/src/sw/source/uibase/shells/tabsh.ts; scripts/generate-writer-ui-resources.ts; apps/office/src/sw/uiconfig/swriter/writer-ui.generated.json; docs/program/source-provenance.json; docs/program/parity/runtime-inventory.json; apps/office/src/sw/source/core/table/native-column-insertion.test.ts; apps/office/src/sw/browser/editor/native-table-column-commands.test.tsx; apps/office/e2e/writer-native-column-commands.spec.ts; scripts/libreoffice-inventory/parity-mapping-cli.test.ts. Bounded related context/menu-resource fixture expectations may change only actual upstream composition. Add one source owner CheckSplitCells with unverified semantic fields; preserve all prior269 states/defaults/classes/evidence and conscious I/O/recovery deviations. Only bounded English prose/counts/hashes/outcomes/failures in AP; no source/helper/Python copies; raw results/maps/local snapshots only ignored app cache. No subagents, network or outside-repository work."
  Plan: "Standing user authorization applies. Port SwTable InsertCol/NewInsertCol and cumulative AdjustWidths rounding from selected column range; expand native column search across rows in SwFEShell and represent MINLAY layout admission via existing SwTabFrame/page geometry. Generalize the existing SwUndoTableNdsChg to native column mode with actual cell sections, widths and numeric insertion boundaries; document publishes one already-executed action. Native table shell computes menu count from actual selected column coordinates and exposes InsertColumnsBefore/After pinned slots. Preserve original selected owners, cursor/pending items, mixed row/column/text and recreated-table history; rendering and worker/ODF use actual graph and widths. Verify six initial static gates, ONE full upstream-absent profile, only original failures/new cases and failed gates repeated, restored source audits and same-agent exact-SHA quality; close one leaf and append parent checkpoint. Merged/nested/rowspan/RTL/redline/border-side/formula/protection/repeated-headline/full native undo/layout hierarchy remain unverified, no full parity promotion."
  Verify Steps: |-
    1. npm run format:check; npm run lint; npm run typecheck; npm run check:dependencies; npm run check:docs; npm run check:file-size pass, with failed gates only repeated.
    2. ONE full profile while vendor/libreoffice-reference is renamed inside repository and restored in finally: npm run test:static; full app/inventory coverage --coverage.reportOnFailure plus JSON case results; script acceptance; all Chromium against dist. Persist exit codes, exact failures, case identities/counts and hashes before assertions. Only original failures and genuinely new cases may rerun; no passing/full/source replay.
    3. New native and mounted/browser acceptance proves column count and before/after edges across all rows, upstream cumulative proportional width rounding and unchanged table print width, MINLAY refusal without mutation, original selection/pending items, native contextual menu slots, one undo action, mixed row/column/text and recreated-table history, mounted colgroup geometry and Chromium caret. App/inventory100% actual-counter coverage; only exact unchanged maps or entire byte-identical ranges may transfer counters.
    4. After upstream restoration: source-tree/provenance/invariant/parity and resource generation --check audits, prior test byte/semantic prefix scope checks, AP source/helper prohibition audit, doctor/routing and same-agent exact-SHA review. Explicit scoped implementation/evidence commits, verification then clean direct close; parent/goal active and full parity unverified.
  Verification: "Pending implementation and exact-source validation."
  Rollback Plan: "Revert the scoped implementation through a separate approved leaf if actual column graph/geometry/selection/history regresses; preserve registered I/O deviations and completed immutable evidence."
  Findings: "Previous goal turn made verified progress: iteration181 DONE implementation fc664e2c9dc868cabac07854de739e4f3d50d0cd, parent checkpoint 52e82f832bd37a819bd809eb5861635a00d50ae6. Read-only discovery confirms native InsertCol/NewInsertCol, cumulative proportional AdjustWidths, column-search expansion and CheckSplitCells MINLAY admission are missing locally; menu commands are filtered. Native source preserves total width with cumulative rounding and copies empty first-paragraph attributes per source box. Discovery resolved wrong optional layout/worker/table-editor paths and unmatched shell glob; nonzero routes recomputed before mutation. No source/helper artifacts in AP."
id_source: "generated"
---
## Summary

Implement native counted flat column insertion and cumulative proportional width redistribution through the existing table shell/UI and shared document history.

## Scope

apps/office/src/sw/source/core/table/swtable.ts; apps/office/src/sw/source/core/docnode/nodes.ts; apps/office/src/sw/source/core/doc/doc.ts; apps/office/src/sw/source/core/undo/untbl.ts; apps/office/src/sw/source/core/frmedt/fetab.ts; apps/office/src/sw/source/core/frmedt/tblsel.ts; apps/office/src/sw/source/uibase/shells/tabsh.ts; scripts/generate-writer-ui-resources.ts; apps/office/src/sw/uiconfig/swriter/writer-ui.generated.json; docs/program/source-provenance.json; docs/program/parity/runtime-inventory.json; apps/office/src/sw/source/core/table/native-column-insertion.test.ts; apps/office/src/sw/browser/editor/native-table-column-commands.test.tsx; apps/office/e2e/writer-native-column-commands.spec.ts; scripts/libreoffice-inventory/parity-mapping-cli.test.ts. Bounded related context/menu-resource fixture expectations may change only actual upstream composition. Add one source owner CheckSplitCells with unverified semantic fields; preserve all prior269 states/defaults/classes/evidence and conscious I/O/recovery deviations. Only bounded English prose/counts/hashes/outcomes/failures in AP; no source/helper/Python copies; raw results/maps/local snapshots only ignored app cache. No subagents, network or outside-repository work.

## Plan

Standing user authorization applies. Port SwTable InsertCol/NewInsertCol and cumulative AdjustWidths rounding from selected column range; expand native column search across rows in SwFEShell and represent MINLAY layout admission via existing SwTabFrame/page geometry. Generalize the existing SwUndoTableNdsChg to native column mode with actual cell sections, widths and numeric insertion boundaries; document publishes one already-executed action. Native table shell computes menu count from actual selected column coordinates and exposes InsertColumnsBefore/After pinned slots. Preserve original selected owners, cursor/pending items, mixed row/column/text and recreated-table history; rendering and worker/ODF use actual graph and widths. Verify six initial static gates, ONE full upstream-absent profile, only original failures/new cases and failed gates repeated, restored source audits and same-agent exact-SHA quality; close one leaf and append parent checkpoint. Merged/nested/rowspan/RTL/redline/border-side/formula/protection/repeated-headline/full native undo/layout hierarchy remain unverified, no full parity promotion.

## Verify Steps

1. npm run format:check; npm run lint; npm run typecheck; npm run check:dependencies; npm run check:docs; npm run check:file-size pass, with failed gates only repeated.
2. ONE full profile while vendor/libreoffice-reference is renamed inside repository and restored in finally: npm run test:static; full app/inventory coverage --coverage.reportOnFailure plus JSON case results; script acceptance; all Chromium against dist. Persist exit codes, exact failures, case identities/counts and hashes before assertions. Only original failures and genuinely new cases may rerun; no passing/full/source replay.
3. New native and mounted/browser acceptance proves column count and before/after edges across all rows, upstream cumulative proportional width rounding and unchanged table print width, MINLAY refusal without mutation, original selection/pending items, native contextual menu slots, one undo action, mixed row/column/text and recreated-table history, mounted colgroup geometry and Chromium caret. App/inventory100% actual-counter coverage; only exact unchanged maps or entire byte-identical ranges may transfer counters.
4. After upstream restoration: source-tree/provenance/invariant/parity and resource generation --check audits, prior test byte/semantic prefix scope checks, AP source/helper prohibition audit, doctor/routing and same-agent exact-SHA review. Explicit scoped implementation/evidence commits, verification then clean direct close; parent/goal active and full parity unverified.

## Verification

Pending implementation and exact-source validation.

## Rollback Plan

Revert the scoped implementation through a separate approved leaf if actual column graph/geometry/selection/history regresses; preserve registered I/O deviations and completed immutable evidence.

## Findings

Previous goal turn made verified progress: iteration181 DONE implementation fc664e2c9dc868cabac07854de739e4f3d50d0cd, parent checkpoint 52e82f832bd37a819bd809eb5861635a00d50ae6. Read-only discovery confirms native InsertCol/NewInsertCol, cumulative proportional AdjustWidths, column-search expansion and CheckSplitCells MINLAY admission are missing locally; menu commands are filtered. Native source preserves total width with cumulative rounding and copies empty first-paragraph attributes per source box. Discovery resolved wrong optional layout/worker/table-editor paths and unmatched shell glob; nonzero routes recomputed before mutation. No source/helper artifacts in AP.
