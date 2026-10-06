---
id: "202610061008-88CGE1"
title: "Move native table selection ownership into cursor shell and expose upstream selection menu"
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
  updated_at: "2026-10-06T10:09:20.101Z"
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
    body: "Start: iteration183 source-owned cursor selection and upstream menu parity with one absent profile; whole parity unverified."
events:
  -
    type: "status"
    at: "2026-10-06T10:09:21.048Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: iteration183 source-owned cursor selection and upstream menu parity with one absent profile; whole parity unverified."
doc_version: 3
doc_updated_at: "2026-10-06T10:09:21.048Z"
doc_updated_by: "CODER"
description: "Iteration183: refactor actual ordinary/table cursor ownership and row selection from SwWrtShell into source-owned SwCursorShell; native row/column/cell/table selection through upstream contextual slots with no React selection state, TextRuns conversion or document mutation; one absent verification profile."
sections:
  Summary: "Move ordinary/table cursor storage and native table selection into source-owned SwCursorShell, remove duplicated high-level row implementation and expose native table selection menus."
  Scope: "apps/office/src/sw/source/core/crsr/trvltbl.ts; apps/office/src/sw/source/uibase/wrtsh/wrtsh1.ts; apps/office/src/sw/source/uibase/shells/tabsh.ts; scripts/generate-writer-ui-resources.ts; apps/office/src/sw/uiconfig/swriter/writer-ui.generated.json; docs/program/source-provenance.json; docs/program/parity/runtime-inventory.json; apps/office/src/sw/source/core/crsr/native-table-selection-ownership.test.ts; apps/office/src/sw/browser/editor/native-table-selection-commands.test.tsx; apps/office/e2e/writer-native-table-selection-commands.spec.ts; scripts/libreoffice-inventory/parity-mapping-cli.test.ts. Bounded related old menu/command fixtures may change only confirmed native behavior. Preserve all prior270 semantic states/defaults/classes/evidence; no blanket promotion. Conscious save/open/recovery deviations unchanged. AP bounded English prose/counts/hashes/outcomes/exact failures only; no upstream source/helper/Python/raw dumps. Raw cases/maps/local snapshots in ignored app cache only. No network/subagent/outside access."
  Plan: "Standing iterative UI/refactor authorization applies. Core SwCursorShell owns actual ordinary/table cursors, ring materialization/cleanup and SelTableRowOrCol/SelTableRow/SelTableCol/SelTable/SelTableBox native graph selections. SwWrtShell uses thin native selection entry points and standard-mode reset with final notifications; no operation adapter or projected selection. SwTableShell exposes EntireCell/EntireRow/EntireColumn/SelectTable using pinned contextual order and standard-mode behavior. Native row/column selections preserve last-content endpoint semantics; whole-cell/table selections use native first/last content and actual rings. Preserve no document mutation/history on selection, direct attributes, current table ownership, multi-paragraph cells, context/menu state and downstream formatting/paste/insertion. Six initial static gates then ONE full absent profile and only original failures/new cases/failed gates closures; once-restored source audits, scope/artifacts and exact-SHA same-agent quality. Finish one leaf, parent remains active. Protected/layout union/enhanced old-model drag/repeated headline/native selection-mode flags and whole parity remain unverified."
  Verify Steps: |-
    1. npm run format:check; npm run lint; npm run typecheck; npm run check:dependencies; npm run check:docs; npm run check:file-size; only failed gates repeated.
    2. ONE full profile while vendor renamed inside repository and restored in finally: npm run test:static; full app/inventory coverage --coverage.reportOnFailure and JSON cases; scripts acceptance; all Chromium against dist. Persist exact failures/counts/errors/hashes before assertions. No passing/full/source replay; only original failures or genuinely new cases.
    3. Actual core/mounted/browser acceptance proves core cursor owner inheritance, actual row/column/cell/table native selected boxes and endpoint offsets, multi-paragraph cells, ordinary mark clearing and existing table cursor reuse, no document/history/dirty mutation, ring disposal and body cleanup, contextual command enablement/order and standard reset, formatting/paste/insertion after selection, undo restoration.100%actual-counter app/inventory coverage; map transfer only exact unchanged maps or entire byte-identical ranges with counters.
    4. After restoration run generator --check/source-tree/provenance/invariants/parity once; preserved prior semantic/test prefix and scoped AP source/helper prohibition audit; doctor/routing/diff and same-agent exact-SHA review. Explicit scoped implementation, evidence, verification tail and clean direct close; parent/goal active full parity unverified.
  Verification: "Pending native ownership refactor and declared acceptance."
  Rollback Plan: "Revert scoped implementation through a separate leaf if actual selection owners/endpoints/rings or contextual commands regress. Preserve immutable DONE evidence and conscious I/O deviations."
  Findings: "Previous goal turn made verified progress: iteration182 DONE implementation2c76be1460f59495b7ab618efa8babf2e7870c3d, checkpoint184aeff391048b252dc4a4734f86c479bb8018c7. Read-only discovery confirms row selection and both cursor fields currently live in SwWrtShell; core trvltbl native source owns SelTableRowOrCol, SelTable, SelTableBox and table cursor creation. Missing generated EntireCell/EntireRow/EntireColumn/SelectTable slots remove native Select submenu. Optional nonexistent WriterEditor/WriterEditorController and sw/inc/wrtsh paths produced discovery errors; route recomputed before mutation and actual paths found. Native complex frame/protection/mode state remains unverified."
id_source: "generated"
---
## Summary

Move ordinary/table cursor storage and native table selection into source-owned SwCursorShell, remove duplicated high-level row implementation and expose native table selection menus.

## Scope

apps/office/src/sw/source/core/crsr/trvltbl.ts; apps/office/src/sw/source/uibase/wrtsh/wrtsh1.ts; apps/office/src/sw/source/uibase/shells/tabsh.ts; scripts/generate-writer-ui-resources.ts; apps/office/src/sw/uiconfig/swriter/writer-ui.generated.json; docs/program/source-provenance.json; docs/program/parity/runtime-inventory.json; apps/office/src/sw/source/core/crsr/native-table-selection-ownership.test.ts; apps/office/src/sw/browser/editor/native-table-selection-commands.test.tsx; apps/office/e2e/writer-native-table-selection-commands.spec.ts; scripts/libreoffice-inventory/parity-mapping-cli.test.ts. Bounded related old menu/command fixtures may change only confirmed native behavior. Preserve all prior270 semantic states/defaults/classes/evidence; no blanket promotion. Conscious save/open/recovery deviations unchanged. AP bounded English prose/counts/hashes/outcomes/exact failures only; no upstream source/helper/Python/raw dumps. Raw cases/maps/local snapshots in ignored app cache only. No network/subagent/outside access.

## Plan

Standing iterative UI/refactor authorization applies. Core SwCursorShell owns actual ordinary/table cursors, ring materialization/cleanup and SelTableRowOrCol/SelTableRow/SelTableCol/SelTable/SelTableBox native graph selections. SwWrtShell uses thin native selection entry points and standard-mode reset with final notifications; no operation adapter or projected selection. SwTableShell exposes EntireCell/EntireRow/EntireColumn/SelectTable using pinned contextual order and standard-mode behavior. Native row/column selections preserve last-content endpoint semantics; whole-cell/table selections use native first/last content and actual rings. Preserve no document mutation/history on selection, direct attributes, current table ownership, multi-paragraph cells, context/menu state and downstream formatting/paste/insertion. Six initial static gates then ONE full absent profile and only original failures/new cases/failed gates closures; once-restored source audits, scope/artifacts and exact-SHA same-agent quality. Finish one leaf, parent remains active. Protected/layout union/enhanced old-model drag/repeated headline/native selection-mode flags and whole parity remain unverified.

## Verify Steps

1. npm run format:check; npm run lint; npm run typecheck; npm run check:dependencies; npm run check:docs; npm run check:file-size; only failed gates repeated.
2. ONE full profile while vendor renamed inside repository and restored in finally: npm run test:static; full app/inventory coverage --coverage.reportOnFailure and JSON cases; scripts acceptance; all Chromium against dist. Persist exact failures/counts/errors/hashes before assertions. No passing/full/source replay; only original failures or genuinely new cases.
3. Actual core/mounted/browser acceptance proves core cursor owner inheritance, actual row/column/cell/table native selected boxes and endpoint offsets, multi-paragraph cells, ordinary mark clearing and existing table cursor reuse, no document/history/dirty mutation, ring disposal and body cleanup, contextual command enablement/order and standard reset, formatting/paste/insertion after selection, undo restoration.100%actual-counter app/inventory coverage; map transfer only exact unchanged maps or entire byte-identical ranges with counters.
4. After restoration run generator --check/source-tree/provenance/invariants/parity once; preserved prior semantic/test prefix and scoped AP source/helper prohibition audit; doctor/routing/diff and same-agent exact-SHA review. Explicit scoped implementation, evidence, verification tail and clean direct close; parent/goal active full parity unverified.

## Verification

Pending native ownership refactor and declared acceptance.

## Rollback Plan

Revert scoped implementation through a separate leaf if actual selection owners/endpoints/rings or contextual commands regress. Preserve immutable DONE evidence and conscious I/O deviations.

## Findings

Previous goal turn made verified progress: iteration182 DONE implementation2c76be1460f59495b7ab618efa8babf2e7870c3d, checkpoint184aeff391048b252dc4a4734f86c479bb8018c7. Read-only discovery confirms row selection and both cursor fields currently live in SwWrtShell; core trvltbl native source owns SelTableRowOrCol, SelTable, SelTableBox and table cursor creation. Missing generated EntireCell/EntireRow/EntireColumn/SelectTable slots remove native Select submenu. Optional nonexistent WriterEditor/WriterEditorController and sw/inc/wrtsh paths produced discovery errors; route recomputed before mutation and actual paths found. Native complex frame/protection/mode state remains unverified.
