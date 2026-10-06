---
id: "202610061008-88CGE1"
title: "Move native table selection ownership into cursor shell and expose upstream selection menu"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 20
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-06T10:15:25.818Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "pending"
  updated_at: null
  updated_by: null
  note: null
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-10-06T10:39:58.166Z"
  updated_by: "EVALUATOR"
  note: "Same-agent exact-SHA quality PASS at0264126bc5f57c16b0a94884a4722408af1e2d05;12841app109inventory5scripts195Chromium distinct PASS; full parity unverified."
  evaluated_sha: "0264126bc5f57c16b0a94884a4722408af1e2d05"
  blueprint_digest: "305b743dcc6fa466ac94cfe8658139ca447eeb1f14e63aaa1b4354bc46170d03"
  evidence_refs:
    - ".agentplane/tasks/202610061008-88CGE1/README.md"
    - ".agentplane/tasks/202610061008-88CGE1/quality/20261006-103958166-recovery-context/quality-report.json"
    - ".agentplane/tasks/202610061008-88CGE1/quality/20261006-103958166-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202610061008-88CGE1/quality/20261006-103958166-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202610061008-88CGE1/blueprint/resolved-snapshot.json"
    - ".agentplane/tasks/202610061008-88CGE1/evidence/exact-sha-review.json"
    - ".agentplane/tasks/202610061008-88CGE1/evidence/source-review.json"
    - ".agentplane/tasks/202610061008-88CGE1/evidence/failed-case-closure.json"
  findings:
    - "Actual ordinary/table cursor ownership moved into SwCursorShell; duplicate row selection removed; native menu selection slots use actual point/mark and box owners, standard reset and one-point insertion after selected content deletion."
    - "One full absent profile and only five original failed fixture closures; no full/passing replay/rebuild/coverage transfer. Initial actual counters100%, production hashes unchanged, partial skipped cases stay skipped."
    - "270 prior semantic records preserved;477/479 old test files identical, two related fixtures preserve assertions except command count51to55. All declared gates and scope/artifact checks pass."
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
doc_updated_at: "2026-10-06T10:40:11.035Z"
doc_updated_by: "CODER"
description: "Iteration183: refactor actual ordinary/table cursor ownership and row selection from SwWrtShell into source-owned SwCursorShell; native row/column/cell/table selection through upstream contextual slots with no React selection state, TextRuns conversion or document mutation; one absent verification profile."
sections:
  Summary: "Move ordinary/table cursor storage and native table selection into source-owned SwCursorShell, remove duplicated high-level row implementation and expose native table selection menus."
  Scope: "apps/office/src/sw/source/core/crsr/trvltbl.ts; apps/office/src/sw/source/uibase/wrtsh/wrtsh1.ts; apps/office/src/sw/source/uibase/shells/tabsh.ts; apps/office/src/sw/source/core/frmedt/fetab.ts; apps/office/src/sw/source/core/edit/ednumber.ts; scripts/generate-writer-ui-resources.ts; apps/office/src/sw/uiconfig/swriter/writer-ui.generated.json; docs/program/source-provenance.json; docs/program/parity/runtime-inventory.json; apps/office/src/sw/source/core/crsr/native-table-selection-ownership.test.ts; apps/office/src/sw/browser/editor/native-table-selection-commands.test.tsx; apps/office/e2e/writer-native-table-selection-commands.spec.ts; scripts/libreoffice-inventory/parity-mapping-cli.test.ts. Same native selection refactor requires removing redundant abstract cursor declarations from inherited SwEditShell/SwFEShell and making expanded GetTableSel use actual displayed point/mark sections. Prior270 semantic statuses/defaults/classes/evidence and registered I/O deviations preserved; bounded AP prose/counts/hashes/outcomes/exact failures only; raw maps/cases in ignored app cache; no network/subagents/outside access. Related old structural numbering fixture apps/office/src/sw/source/core/undo/native-list-rule-range.test.ts changes only its native cursor type and inherited-owner declarations, preserving every assertion."
  Plan: "Standing iterative UI/refactor authorization applies. Core SwCursorShell owns actual ordinary/table cursors, ring materialization/cleanup and SelTableRowOrCol/SelTableRow/SelTableCol/SelTable/SelTableBox native graph selections. SwWrtShell uses thin native selection entry points and standard-mode reset with final notifications; no operation adapter or projected selection. SwTableShell exposes EntireCell/EntireRow/EntireColumn/SelectTable using pinned contextual order and standard-mode behavior. Native row/column selections preserve last-content endpoint semantics; whole-cell/table selections use native first/last content and actual rings. Preserve no document mutation/history on selection, direct attributes, current table ownership, multi-paragraph cells, context/menu state and downstream formatting/paste/insertion. Six initial static gates then ONE full absent profile and only original failures/new cases/failed gates closures; once-restored source audits, scope/artifacts and exact-SHA same-agent quality. Finish one leaf, parent remains active. Protected/layout union/enhanced old-model drag/repeated headline/native selection-mode flags and whole parity remain unverified. The same ownership refactor removes redundant abstract GetCursor/HasBoxSelection declarations in ednumber/fetab and expands GetTableSel from displayed point/mark; these related source paths are explicit in Scope, no verification changes."
  Verify Steps: |-
    1. npm run format:check; npm run lint; npm run typecheck; npm run check:dependencies; npm run check:docs; npm run check:file-size; only failed gates repeated.
    2. ONE full profile while vendor renamed inside repository and restored in finally: npm run test:static; full app/inventory coverage --coverage.reportOnFailure and JSON cases; scripts acceptance; all Chromium against dist. Persist exact failures/counts/errors/hashes before assertions. No passing/full/source replay; only original failures or genuinely new cases.
    3. Actual core/mounted/browser acceptance proves core cursor owner inheritance, actual row/column/cell/table native selected boxes and endpoint offsets, multi-paragraph cells, ordinary mark clearing and existing table cursor reuse, no document/history/dirty mutation, ring disposal and body cleanup, contextual command enablement/order and standard reset, formatting/paste/insertion after selection, undo restoration.100%actual-counter app/inventory coverage; map transfer only exact unchanged maps or entire byte-identical ranges with counters.
    4. After restoration run generator --check/source-tree/provenance/invariants/parity once; preserved prior semantic/test prefix and scoped AP source/helper prohibition audit; doctor/routing/diff and same-agent exact-SHA review. Explicit scoped implementation, evidence, verification tail and clean direct close; parent/goal active full parity unverified.
  Verification: "Command: declared static/scoped checks, one full upstream-absent profile, original failed-case closures, once-restored source audits and same-agent exact-SHA review. Result: PASS at implementation0264126bc5f57c16b0a94884a4722408af1e2d05. Evidence:12841app109inventory5scripts195Chromium distinct PASS; no failures/runtime errors/flaky; partial closure3appPASS2SKIPPED, only global coverage threshold exit. Actual initial app/inventory maps100% with byte-identical final maps and unchanged production hashes. No rebuild/merge/transfer/full passing replay. Scope270semantic records preserved,477/479oldtests identical,3newfiles482total. Source/quality/AP audit PASS, doctor0errors2knownwarnings, vendor restored. Same current agent EVALUATOR role, no independent reviewer claim. Full parity UNVERIFIED; parent/whole goal ACTIVE."
  Rollback Plan: "Revert scoped implementation through a separate leaf if actual selection owners/endpoints/rings or contextual commands regress. Preserve immutable DONE evidence and conscious I/O deviations."
  Findings: |-
    Previous iteration182 DONE: implementation2c76be1460f59495b7ab618efa8babf2e7870c3d, checkpoint184aeff391048b252dc4a4734f86c479bb8018c7. Native table selection responsibilities belonged locally to SwWrtShell, while pinned trvltbl.cxx and crsrsh.hxx assign cursor storage/materialization and SelTableRowOrCol/SelTable/SelTableBox to SwCursorShell. This iteration moves those actual owners, removes duplicated high-level row selection, adds thin SwWrtShell entry points and four argument-free native table selection slots. GetTableSel expands displayed point/mark instead of projected editing-ring extremes. EntireCell skips standard reset; row/column/table commands enter standard mode as pinned tabsh.cxx does. React reads original selected boxes and cursor endpoints; no new selection adapter, UI state or TextRuns conversion.

    Native endpoint behavior is represented: row/column point is first selected box last content end and mark is last selected box content end; cell point is first content offset0 and mark last content end; whole-table point is last content end and mark first content offset0. First table cursor creation deletes ordinary mark; repeated selection retains its native owner and editing rings. Standard mode adopts displayed point and releases native table cursor/rings. Pending character items use actual point offset. Selection changes do not mutate graph, widths, history or dirty state. Actual formatting and Undo/Redo, downstream existing paste behavior, menu state/order, editing-point insertion and restored selection are covered. Complete native clipboard semantics are not promoted by testing represented existing paste behavior.

    Scope and source:14 semantic paths,270 prior/current semantic owners, all prior states/defaults/classes/evidence prefixes preserved.477/479 prior test files byte-identical; old command-count fixture51->55 and old structural numbering fixture adapted to actual SwCursor/inherited owner declarations with all assertions preserved. Three new acceptance files bring total to482. Source review hashes12 pinned source files and stores bounded responsibility prose only. Native optional numbering range contracts stay SwPaM per editsh.hxx573-574.

    Initial six static gates: format/lint/dependencies/docs/file-size PASS; type failed redundant abstract cursor declarations and narrowed SwCursor optional ranges, repaired with source-backed SwPaM annotations. Four type closure failures preserve exact diagnostics: native range annotations, new mounted invalid exact option/nullability and old structural cursor fixture contracts, remaining nullable closest owner. Final failed type gate PASS before profile. Scoped changed-file/JSDoc/physical-line/format/lint checks PASS, including final assertion corrections. Only failed gates and changed paths repeated. All TypeScript files below1000 actual physical lines.

    Command: ONE full upstream-absent profile; exact commands/failures/counts/errors/hashes in absent-profile.json. Result: build PASS;12838 app PASS/3FAIL of12841;109 inventory PASS;5 scripts PASS;193 Chromium PASS/2FAIL of195.0skips0flaky0runtimeerrors. Initial actual counters already100% app13785L15109S3616F11248B in267maps SHA264e7dd8270eb5053b3608f99e57e8a06822ceddb02a5813ee5ea0dee56b0eb3 and inventory1464L1523S384F1080B in38maps SHA8e6fae6a004c2eb8593e0015a8d25470b9708a1eb914139154c3ffc219cd0def.

    Observation: five new fixture expectations assumed input replicated X to every selected cell or inserted into the first whole-table cell. Impact: three new mounted assertions and two new browser assertions failed. Resolution: pinned Insert/DelRight/KillPams delete selected content, adopt displayed native point and insert once. Corrected only new assertions: X in current point cell, other selected cells empty and unselected content untouched. Production five-file hashes stayed identical; no rebuild. Original failed cases only closure under upstream absence:3app PASS/2SKIPPED,2Chromium PASS; app partial command exit1 solely global coverage thresholds with no failed cases/runtime errors. Skipped partial cases retained as skips; full initial passes remain authoritative. Final distinct12841app109inventory5scripts195Chromium allPASS. Vendor restored in finally after each profile. Initial actual maps copied byte-for-byte to final: no merge, transfer, fabricated counters, full/passing replay or source audit while profile live.

    Read-only discovery errors: optional nonexistent WriterEditor/WriterEditorController/sw-inc-wrtsh paths; provenance schema mistaken modules instead of entries; nonexistent fnDel search. Closure helper initially had a literal escaped newline SyntaxError before any test/profile/vendor mutation; corrected in memory, then actual closure ran once. Final coverage helper first used an absent workspace-local Istanbul module path; resolved repository node_modules module and retried only evidence derivation, no tests. Every nonzero recomputed route before mutation. No helpers written into AP.

    Restored generation/source-tree/provenance/invariants/parity gates PASS once:270modules186mapped68browser16infrastructure. Incremental current leaf AP audit includes ignored files: no forbidden source/helper/Python/probe/raw map/report artifacts; raw data only ignored app cache. Doctor0errors2known warnings: older hook readiness/fallback shim and immutable DONE202610031635-2Z3962 missing implementation hash. Routing/diff PASS. Same-agent exact-SHA evaluation remains required before close, with no independent reviewer claim.

    Residual: protection, complex frame/layout selection unions, enhanced old-model drag, vertical/RTL/fly/merged/nested/rowspan tables, full selection-mode/row-simple state, formulas/redlines/repeated headlines and full clipboard/native undo hierarchy remain UNVERIFIED. Registered I/O/recovery deviations unchanged. Parent/whole goal ACTIVE; full parity UNVERIFIED.
id_source: "generated"
---
## Summary

Move ordinary/table cursor storage and native table selection into source-owned SwCursorShell, remove duplicated high-level row implementation and expose native table selection menus.

## Scope

apps/office/src/sw/source/core/crsr/trvltbl.ts; apps/office/src/sw/source/uibase/wrtsh/wrtsh1.ts; apps/office/src/sw/source/uibase/shells/tabsh.ts; apps/office/src/sw/source/core/frmedt/fetab.ts; apps/office/src/sw/source/core/edit/ednumber.ts; scripts/generate-writer-ui-resources.ts; apps/office/src/sw/uiconfig/swriter/writer-ui.generated.json; docs/program/source-provenance.json; docs/program/parity/runtime-inventory.json; apps/office/src/sw/source/core/crsr/native-table-selection-ownership.test.ts; apps/office/src/sw/browser/editor/native-table-selection-commands.test.tsx; apps/office/e2e/writer-native-table-selection-commands.spec.ts; scripts/libreoffice-inventory/parity-mapping-cli.test.ts. Same native selection refactor requires removing redundant abstract cursor declarations from inherited SwEditShell/SwFEShell and making expanded GetTableSel use actual displayed point/mark sections. Prior270 semantic statuses/defaults/classes/evidence and registered I/O deviations preserved; bounded AP prose/counts/hashes/outcomes/exact failures only; raw maps/cases in ignored app cache; no network/subagents/outside access. Related old structural numbering fixture apps/office/src/sw/source/core/undo/native-list-rule-range.test.ts changes only its native cursor type and inherited-owner declarations, preserving every assertion.

## Plan

Standing iterative UI/refactor authorization applies. Core SwCursorShell owns actual ordinary/table cursors, ring materialization/cleanup and SelTableRowOrCol/SelTableRow/SelTableCol/SelTable/SelTableBox native graph selections. SwWrtShell uses thin native selection entry points and standard-mode reset with final notifications; no operation adapter or projected selection. SwTableShell exposes EntireCell/EntireRow/EntireColumn/SelectTable using pinned contextual order and standard-mode behavior. Native row/column selections preserve last-content endpoint semantics; whole-cell/table selections use native first/last content and actual rings. Preserve no document mutation/history on selection, direct attributes, current table ownership, multi-paragraph cells, context/menu state and downstream formatting/paste/insertion. Six initial static gates then ONE full absent profile and only original failures/new cases/failed gates closures; once-restored source audits, scope/artifacts and exact-SHA same-agent quality. Finish one leaf, parent remains active. Protected/layout union/enhanced old-model drag/repeated headline/native selection-mode flags and whole parity remain unverified. The same ownership refactor removes redundant abstract GetCursor/HasBoxSelection declarations in ednumber/fetab and expands GetTableSel from displayed point/mark; these related source paths are explicit in Scope, no verification changes.

## Verify Steps

1. npm run format:check; npm run lint; npm run typecheck; npm run check:dependencies; npm run check:docs; npm run check:file-size; only failed gates repeated.
2. ONE full profile while vendor renamed inside repository and restored in finally: npm run test:static; full app/inventory coverage --coverage.reportOnFailure and JSON cases; scripts acceptance; all Chromium against dist. Persist exact failures/counts/errors/hashes before assertions. No passing/full/source replay; only original failures or genuinely new cases.
3. Actual core/mounted/browser acceptance proves core cursor owner inheritance, actual row/column/cell/table native selected boxes and endpoint offsets, multi-paragraph cells, ordinary mark clearing and existing table cursor reuse, no document/history/dirty mutation, ring disposal and body cleanup, contextual command enablement/order and standard reset, formatting/paste/insertion after selection, undo restoration.100%actual-counter app/inventory coverage; map transfer only exact unchanged maps or entire byte-identical ranges with counters.
4. After restoration run generator --check/source-tree/provenance/invariants/parity once; preserved prior semantic/test prefix and scoped AP source/helper prohibition audit; doctor/routing/diff and same-agent exact-SHA review. Explicit scoped implementation, evidence, verification tail and clean direct close; parent/goal active full parity unverified.

## Verification

Command: declared static/scoped checks, one full upstream-absent profile, original failed-case closures, once-restored source audits and same-agent exact-SHA review. Result: PASS at implementation0264126bc5f57c16b0a94884a4722408af1e2d05. Evidence:12841app109inventory5scripts195Chromium distinct PASS; no failures/runtime errors/flaky; partial closure3appPASS2SKIPPED, only global coverage threshold exit. Actual initial app/inventory maps100% with byte-identical final maps and unchanged production hashes. No rebuild/merge/transfer/full passing replay. Scope270semantic records preserved,477/479oldtests identical,3newfiles482total. Source/quality/AP audit PASS, doctor0errors2knownwarnings, vendor restored. Same current agent EVALUATOR role, no independent reviewer claim. Full parity UNVERIFIED; parent/whole goal ACTIVE.

## Rollback Plan

Revert scoped implementation through a separate leaf if actual selection owners/endpoints/rings or contextual commands regress. Preserve immutable DONE evidence and conscious I/O deviations.

## Findings

Previous iteration182 DONE: implementation2c76be1460f59495b7ab618efa8babf2e7870c3d, checkpoint184aeff391048b252dc4a4734f86c479bb8018c7. Native table selection responsibilities belonged locally to SwWrtShell, while pinned trvltbl.cxx and crsrsh.hxx assign cursor storage/materialization and SelTableRowOrCol/SelTable/SelTableBox to SwCursorShell. This iteration moves those actual owners, removes duplicated high-level row selection, adds thin SwWrtShell entry points and four argument-free native table selection slots. GetTableSel expands displayed point/mark instead of projected editing-ring extremes. EntireCell skips standard reset; row/column/table commands enter standard mode as pinned tabsh.cxx does. React reads original selected boxes and cursor endpoints; no new selection adapter, UI state or TextRuns conversion.

Native endpoint behavior is represented: row/column point is first selected box last content end and mark is last selected box content end; cell point is first content offset0 and mark last content end; whole-table point is last content end and mark first content offset0. First table cursor creation deletes ordinary mark; repeated selection retains its native owner and editing rings. Standard mode adopts displayed point and releases native table cursor/rings. Pending character items use actual point offset. Selection changes do not mutate graph, widths, history or dirty state. Actual formatting and Undo/Redo, downstream existing paste behavior, menu state/order, editing-point insertion and restored selection are covered. Complete native clipboard semantics are not promoted by testing represented existing paste behavior.

Scope and source:14 semantic paths,270 prior/current semantic owners, all prior states/defaults/classes/evidence prefixes preserved.477/479 prior test files byte-identical; old command-count fixture51->55 and old structural numbering fixture adapted to actual SwCursor/inherited owner declarations with all assertions preserved. Three new acceptance files bring total to482. Source review hashes12 pinned source files and stores bounded responsibility prose only. Native optional numbering range contracts stay SwPaM per editsh.hxx573-574.

Initial six static gates: format/lint/dependencies/docs/file-size PASS; type failed redundant abstract cursor declarations and narrowed SwCursor optional ranges, repaired with source-backed SwPaM annotations. Four type closure failures preserve exact diagnostics: native range annotations, new mounted invalid exact option/nullability and old structural cursor fixture contracts, remaining nullable closest owner. Final failed type gate PASS before profile. Scoped changed-file/JSDoc/physical-line/format/lint checks PASS, including final assertion corrections. Only failed gates and changed paths repeated. All TypeScript files below1000 actual physical lines.

Command: ONE full upstream-absent profile; exact commands/failures/counts/errors/hashes in absent-profile.json. Result: build PASS;12838 app PASS/3FAIL of12841;109 inventory PASS;5 scripts PASS;193 Chromium PASS/2FAIL of195.0skips0flaky0runtimeerrors. Initial actual counters already100% app13785L15109S3616F11248B in267maps SHA264e7dd8270eb5053b3608f99e57e8a06822ceddb02a5813ee5ea0dee56b0eb3 and inventory1464L1523S384F1080B in38maps SHA8e6fae6a004c2eb8593e0015a8d25470b9708a1eb914139154c3ffc219cd0def.

Observation: five new fixture expectations assumed input replicated X to every selected cell or inserted into the first whole-table cell. Impact: three new mounted assertions and two new browser assertions failed. Resolution: pinned Insert/DelRight/KillPams delete selected content, adopt displayed native point and insert once. Corrected only new assertions: X in current point cell, other selected cells empty and unselected content untouched. Production five-file hashes stayed identical; no rebuild. Original failed cases only closure under upstream absence:3app PASS/2SKIPPED,2Chromium PASS; app partial command exit1 solely global coverage thresholds with no failed cases/runtime errors. Skipped partial cases retained as skips; full initial passes remain authoritative. Final distinct12841app109inventory5scripts195Chromium allPASS. Vendor restored in finally after each profile. Initial actual maps copied byte-for-byte to final: no merge, transfer, fabricated counters, full/passing replay or source audit while profile live.

Read-only discovery errors: optional nonexistent WriterEditor/WriterEditorController/sw-inc-wrtsh paths; provenance schema mistaken modules instead of entries; nonexistent fnDel search. Closure helper initially had a literal escaped newline SyntaxError before any test/profile/vendor mutation; corrected in memory, then actual closure ran once. Final coverage helper first used an absent workspace-local Istanbul module path; resolved repository node_modules module and retried only evidence derivation, no tests. Every nonzero recomputed route before mutation. No helpers written into AP.

Restored generation/source-tree/provenance/invariants/parity gates PASS once:270modules186mapped68browser16infrastructure. Incremental current leaf AP audit includes ignored files: no forbidden source/helper/Python/probe/raw map/report artifacts; raw data only ignored app cache. Doctor0errors2known warnings: older hook readiness/fallback shim and immutable DONE202610031635-2Z3962 missing implementation hash. Routing/diff PASS. Same-agent exact-SHA evaluation remains required before close, with no independent reviewer claim.

Residual: protection, complex frame/layout selection unions, enhanced old-model drag, vertical/RTL/fly/merged/nested/rowspan tables, full selection-mode/row-simple state, formulas/redlines/repeated headlines and full clipboard/native undo hierarchy remain UNVERIFIED. Registered I/O/recovery deviations unchanged. Parent/whole goal ACTIVE; full parity UNVERIFIED.
