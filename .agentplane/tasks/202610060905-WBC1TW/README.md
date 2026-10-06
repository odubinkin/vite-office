---
id: "202610060905-WBC1TW"
title: "Implement native flat row insertion before and after selection across core and UI"
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
  updated_at: "2026-10-06T09:09:32.002Z"
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
    body: "Start: authorized iteration181 native counted flat rows and contextual table UI slots with one absent verification profile."
events:
  -
    type: "status"
    at: "2026-10-06T09:09:32.694Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: authorized iteration181 native counted flat rows and contextual table UI slots with one absent verification profile."
doc_version: 3
doc_updated_at: "2026-10-06T09:09:32.694Z"
doc_updated_by: "CODER"
description: "Iteration181: remove final-row/count-one restrictions in existing SwDoc.InsertRow; native SwTable selects boundary row and inserts counted flat rows before or after actual boxes, document owns one undo action. Connect upstream InsertRowsBefore/After menu slots through SwTableShell and SwFEShell, preserving actual selection and history and all registered I/O deviations."
sections:
  Summary: "Implement native flat row insertion count and before/after boundary through SwTable, SwDoc, SwFEShell and contextual SwTableShell; expose existing upstream InsertRowsBefore/After menu commands with coherent native selection and one history action."
  Scope: "apps/office/src/sw/source/core/doc/doc.ts; apps/office/src/sw/source/core/docnode/nodes.ts; apps/office/src/sw/source/core/table/swtable.ts; apps/office/src/sw/source/core/undo/untbl.ts; apps/office/src/sw/source/core/frmedt/fetab.ts; apps/office/src/sw/source/uibase/shells/tabsh.ts; apps/office/src/sw/source/uibase/uiview/view.ts; scripts/generate-writer-ui-resources.ts; apps/office/src/sw/uiconfig/swriter/writer-ui.generated.json; docs/program/source-provenance.json; docs/program/parity/runtime-inventory.json; docs/program/parity/writer-command-slice.json; apps/office/src/sw/source/core/crsr/native-table-shell-owner.test.ts; apps/office/src/sw/source/core/table/native-row-insertion.test.ts; apps/office/src/sw/browser/editor/native-table-row-commands.test.tsx; apps/office/e2e/writer-native-row-commands.spec.ts. Bounded related menu-resource fixtures may change only actual upstream composition expectations. No registered I/O deviations, upstream/source/helper artifacts, subagents, network or outside-repo actions."
  Plan: "Complete native flat row insertion count and before/after selection across core history and contextual UI slots; preserve I/O deviations; one upstream-absent profile; full parity remains unverified."
  Verify Steps: |-
    1. npm run format:check; npm run lint; npm run typecheck; npm run check:dependencies; npm run check:docs; npm run check:file-size pass, with failed gates only repeated.
    2. ONE full profile while vendor/libreoffice-reference is renamed inside repository and restored in finally: npm run test:static; full app/inventory coverage --coverage.reportOnFailure plus JSON case results; script acceptance; all Chromium against dist. Persist exit codes, exact failures, case identities/counts and hashes before assertions. Only original failures and genuinely new cases may rerun; no passing/full/source replay.
    3. New native and mounted/browser acceptance proves counts and before/after edges, original selection preservation, contextual native shell command routing, one undo action, existing Tab append and mixed/recreated-table history. App/inventory100% actual-counter coverage; only exact unchanged maps or entire byte-identical ranges may transfer counters.
    4. After upstream restoration: source-tree/provenance/invariant/parity and resource generation --check audits, prior test byte/semantic prefix scope checks, AP source/helper prohibition audit, doctor/routing and same-agent exact-SHA review. Explicit scoped implementation/evidence commits, verification then clean direct close; parent/goal active and full parity unverified.
  Verification: "Pending implementation and exact-source verification."
  Rollback Plan: "Revert the scoped implementation commit through a separate approved task if native default cell traversal/history regresses; preserve registered I/O deviations and immutable completed task evidence."
  Findings: "Iteration180 completed verified progress with implementation 642c72010a7146b4dcd01d29b778533cd84b0caf, parent checkpoint cc1dd22a8d6bcc0770f09c77e9d956c343944236. Read-only discovery confirms existing InsertRow rejects all but one final-row append, and upstream InsertRowsBefore/After menu commands are filtered by generation. Pinned native model chooses selected edge row, copies whole row count times; table shell derives selected row range count. Discovery recovered wrong composition extension, ignored-vendor rg and two auxiliary Node syntax/data-shape errors by route recomputation before mutation. No sources/helpers saved in AP."
id_source: "generated"
---
## Summary

Implement native flat row insertion count and before/after boundary through SwTable, SwDoc, SwFEShell and contextual SwTableShell; expose existing upstream InsertRowsBefore/After menu commands with coherent native selection and one history action.

## Scope

apps/office/src/sw/source/core/doc/doc.ts; apps/office/src/sw/source/core/docnode/nodes.ts; apps/office/src/sw/source/core/table/swtable.ts; apps/office/src/sw/source/core/undo/untbl.ts; apps/office/src/sw/source/core/frmedt/fetab.ts; apps/office/src/sw/source/uibase/shells/tabsh.ts; apps/office/src/sw/source/uibase/uiview/view.ts; scripts/generate-writer-ui-resources.ts; apps/office/src/sw/uiconfig/swriter/writer-ui.generated.json; docs/program/source-provenance.json; docs/program/parity/runtime-inventory.json; docs/program/parity/writer-command-slice.json; apps/office/src/sw/source/core/crsr/native-table-shell-owner.test.ts; apps/office/src/sw/source/core/table/native-row-insertion.test.ts; apps/office/src/sw/browser/editor/native-table-row-commands.test.tsx; apps/office/e2e/writer-native-row-commands.spec.ts. Bounded related menu-resource fixtures may change only actual upstream composition expectations. No registered I/O deviations, upstream/source/helper artifacts, subagents, network or outside-repo actions.

## Plan

Complete native flat row insertion count and before/after selection across core history and contextual UI slots; preserve I/O deviations; one upstream-absent profile; full parity remains unverified.

## Verify Steps

1. npm run format:check; npm run lint; npm run typecheck; npm run check:dependencies; npm run check:docs; npm run check:file-size pass, with failed gates only repeated.
2. ONE full profile while vendor/libreoffice-reference is renamed inside repository and restored in finally: npm run test:static; full app/inventory coverage --coverage.reportOnFailure plus JSON case results; script acceptance; all Chromium against dist. Persist exit codes, exact failures, case identities/counts and hashes before assertions. Only original failures and genuinely new cases may rerun; no passing/full/source replay.
3. New native and mounted/browser acceptance proves counts and before/after edges, original selection preservation, contextual native shell command routing, one undo action, existing Tab append and mixed/recreated-table history. App/inventory100% actual-counter coverage; only exact unchanged maps or entire byte-identical ranges may transfer counters.
4. After upstream restoration: source-tree/provenance/invariant/parity and resource generation --check audits, prior test byte/semantic prefix scope checks, AP source/helper prohibition audit, doctor/routing and same-agent exact-SHA review. Explicit scoped implementation/evidence commits, verification then clean direct close; parent/goal active and full parity unverified.

## Verification

Pending implementation and exact-source verification.

## Rollback Plan

Revert the scoped implementation commit through a separate approved task if native default cell traversal/history regresses; preserve registered I/O deviations and immutable completed task evidence.

## Findings

Iteration180 completed verified progress with implementation 642c72010a7146b4dcd01d29b778533cd84b0caf, parent checkpoint cc1dd22a8d6bcc0770f09c77e9d956c343944236. Read-only discovery confirms existing InsertRow rejects all but one final-row append, and upstream InsertRowsBefore/After menu commands are filtered by generation. Pinned native model chooses selected edge row, copies whole row count times; table shell derives selected row range count. Discovery recovered wrong composition extension, ignored-vendor rg and two auxiliary Node syntax/data-shape errors by route recomputation before mutation. No sources/helpers saved in AP.
