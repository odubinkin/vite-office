---
id: "202610060236-R6NKEQ"
title: "Restore native horizontal table print geometry"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 9
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
task_kind: "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-06T02:37:21.855Z"
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
    body: "Start: implement approved native horizontal table print geometry under standing iterative user authorization."
events:
  -
    type: "status"
    at: "2026-10-06T02:37:22.238Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implement approved native horizontal table print geometry under standing iterative user authorization."
doc_version: 3
doc_updated_at: "2026-10-06T02:37:22.238Z"
doc_updated_by: "CODER"
description: "Iteration175: move represented horizontal table geometry into native SwTabFrame Format ownership; honor imported left/center/right/margins and default full-width modes, actual page print width, right margin, proportional columns, repeated fragments, live editing and history. Preserve deliberate IO exceptions and prior tests; bounded geometry only, broader table/frame parity unverified."
sections:
  Summary: "Restore existing horizontal table behavior using native layout ownership, actual page print area and canonical table formatting."
  Scope: |-
    apps/office/src/sw/source/core/table/swtable.ts
    apps/office/src/sw/source/core/layout/newfrm.ts
    apps/office/src/sw/source/core/layout/tabfrm.ts
    apps/office/src/xmloff/source/table/XMLTableImport.ts
    apps/office/src/xmloff/source/table/XMLTableExport.ts
    apps/office/src/sw/browser/editor/WriterEditableTable.tsx
    apps/office/src/sw/browser/editor/WriterPlainTextEditor.tsx
    docs/program/source-provenance.json
    docs/program/parity/runtime-inventory.json
    apps/office/src/sw/source/core/layout/native-table-print-area.test.ts
    apps/office/src/sw/source/filter/xml/odt-table-print-area.test.ts
    apps/office/src/sw/browser/editor/native-table-print-area.test.tsx
    apps/office/e2e/writer-table-print-area.spec.ts
  Plan: "Iteration175 under standing approved iterative goal. ONE atomic direct CODER leaf restores native represented horizontal table print geometry. Introduce source-shaped SwTabFrame Format calculation (twips) following native tabfrm Format and xmltbli MakeTable orientation/size admission: left plus authored margin with wished width; center/right spacing from actual upper print width; margins ignores wished size and respects LR; default FULL uses upper width; missing size resolves native FULL/NONE; negative center/right overflow, minimum23twip guard. Existing root table fragments carry computed immutable print area from each page descriptor; existing browser table consumes it and uses same native calculation for hidden measurement, proportional columns instead of absolute widths overriding table size. Detached component upper width defaults to own physical column/format extent because no page is attached. Add supported right margin import/model/export and signed LR lengths, reuse existing SAX/style/graph owners. No new DTO/filter/render/selection manager,TextRuns conversion or adapter. Thirteen semantic paths,seven production including one new native owner,two metadata,four new testfiles. Preserve453 prior testfiles and258semantic states/defaults/classes/IOexceptions/evidence prefixes. Actual native formulas,root page follow widths/identity,ODF roundtrip,signed margins,mounted consumption/proportions/shared nodes,real Chromium1280/390 editing/history/headlines. Relative width,fly/border-space/multicolumn/RTL/vertical/nested/merged/rowspan/split-row/native frame lifecycle and complete core/UI parity UNVERIFIED. Six statics then ONE full absentprofile,onlyfailed/genuinelynew closure,actual100coverage/sourceidentity,restoredsourceaudits,sameagent exactSHA evaluation,verify/finish/parentcheckpoint. No AP source/helpers/rawdiagnostics/no tests upstream/no passing replay/no network."
  Verify Steps: |-
    1. Six initial static gates: npm run format:check; npm run lint; npm run typecheck; npm run check:dependencies; npm run check:docs; npm run check:file-size. Recover only failed gates; after full profile changed-file checks only.
    2. ONE upstream-absent profile: npm run test:static; npm run test:coverage --workspace @vite-office/office -- --coverage.reportOnFailure; npm run test:inventory:coverage -- --coverage.reportOnFailure; npm exec -- vitest run scripts/check-source-provenance.test.ts scripts/writer-ui-resource-model.test.ts; npm exec -- playwright test --config apps/office/playwright.config.ts. Rename pinned vendor directory in-repo and restore finally. Tests never read/compile/invoke upstream. Persist exact failures/counts/errors/hashes before assertions. Subsequently only original failures and genuinely new cases; skipped means skipped; no passing/full replay. Rebuild only after production change. Actual100coverage proof uses exact final source/maps or whole contiguous byte-identical ranges and real counters; raw maps/results/source only ignored appcache.
    3. Assert native represented left/center/right/margins/default FULL and absent size,min23,negative overflow,right/left margins,proportional columns and per-page follow geometry using literal independent expected values; ODF signed LR preservation/export/reopen; mounted frame consumes native bounds and retains original paragraphs and selected-box ownership; actual Chromium1280/390 native Open,layout bounds,headline fragments,edit/UndoRedo. No old test/oracle changes.
    4. Preserve453prior testfiles byte-identical and258semantic states/defaults/classes/registeredIOexceptions/evidence prefixes;13approvedsemanticpaths; append evidence only,new native owner remains partial/unverified. AP ignored-inclusive no sources/helpers/Python/rawdiagnostics;doctor/routing/diff.
    5. After vendor restored, five source audits: npm exec -- tsx scripts/generate-writer-ui-resources.ts --check; npm run check:source-tree; npm run check:source-provenance; npm run inventory:invariants; npm run inventory:parity. ExactSHA sameagent EVALUATOR,no independent reviewer claim,semanticcommit,recordverify,meaningfulfinish,wholeparentcheckpoint;parentDOINGgoalACTIVE.
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert only this leaf semantic commit with a follow-up task; retain immutable verification history. Never change deliberate save/open/recovery exceptions."
  Findings: "Preflight clean main,parentDOING,previous174 verified progress. Read-only audit found imported align ignored by React,absolute column widths overriding table width,right margin rejected. Native tabfrm Format3767ff computes orientation spacing;xmltbli MakeTable2490ff admits size/orientation;xmlithlp aXMLTableAlignMap maps left/center/right/margins;MINLAY23. Guessed table-format/vitest paths and unmatched shell globs failed during discovery; corrected via rg,route recomputed,no mutation or scope expansion. Source only read in vendor;no upstream copied into AP."
id_source: "generated"
---
## Summary

Restore existing horizontal table behavior using native layout ownership, actual page print area and canonical table formatting.

## Scope

apps/office/src/sw/source/core/table/swtable.ts
apps/office/src/sw/source/core/layout/newfrm.ts
apps/office/src/sw/source/core/layout/tabfrm.ts
apps/office/src/xmloff/source/table/XMLTableImport.ts
apps/office/src/xmloff/source/table/XMLTableExport.ts
apps/office/src/sw/browser/editor/WriterEditableTable.tsx
apps/office/src/sw/browser/editor/WriterPlainTextEditor.tsx
docs/program/source-provenance.json
docs/program/parity/runtime-inventory.json
apps/office/src/sw/source/core/layout/native-table-print-area.test.ts
apps/office/src/sw/source/filter/xml/odt-table-print-area.test.ts
apps/office/src/sw/browser/editor/native-table-print-area.test.tsx
apps/office/e2e/writer-table-print-area.spec.ts

## Plan

Iteration175 under standing approved iterative goal. ONE atomic direct CODER leaf restores native represented horizontal table print geometry. Introduce source-shaped SwTabFrame Format calculation (twips) following native tabfrm Format and xmltbli MakeTable orientation/size admission: left plus authored margin with wished width; center/right spacing from actual upper print width; margins ignores wished size and respects LR; default FULL uses upper width; missing size resolves native FULL/NONE; negative center/right overflow, minimum23twip guard. Existing root table fragments carry computed immutable print area from each page descriptor; existing browser table consumes it and uses same native calculation for hidden measurement, proportional columns instead of absolute widths overriding table size. Detached component upper width defaults to own physical column/format extent because no page is attached. Add supported right margin import/model/export and signed LR lengths, reuse existing SAX/style/graph owners. No new DTO/filter/render/selection manager,TextRuns conversion or adapter. Thirteen semantic paths,seven production including one new native owner,two metadata,four new testfiles. Preserve453 prior testfiles and258semantic states/defaults/classes/IOexceptions/evidence prefixes. Actual native formulas,root page follow widths/identity,ODF roundtrip,signed margins,mounted consumption/proportions/shared nodes,real Chromium1280/390 editing/history/headlines. Relative width,fly/border-space/multicolumn/RTL/vertical/nested/merged/rowspan/split-row/native frame lifecycle and complete core/UI parity UNVERIFIED. Six statics then ONE full absentprofile,onlyfailed/genuinelynew closure,actual100coverage/sourceidentity,restoredsourceaudits,sameagent exactSHA evaluation,verify/finish/parentcheckpoint. No AP source/helpers/rawdiagnostics/no tests upstream/no passing replay/no network.

## Verify Steps

1. Six initial static gates: npm run format:check; npm run lint; npm run typecheck; npm run check:dependencies; npm run check:docs; npm run check:file-size. Recover only failed gates; after full profile changed-file checks only.
2. ONE upstream-absent profile: npm run test:static; npm run test:coverage --workspace @vite-office/office -- --coverage.reportOnFailure; npm run test:inventory:coverage -- --coverage.reportOnFailure; npm exec -- vitest run scripts/check-source-provenance.test.ts scripts/writer-ui-resource-model.test.ts; npm exec -- playwright test --config apps/office/playwright.config.ts. Rename pinned vendor directory in-repo and restore finally. Tests never read/compile/invoke upstream. Persist exact failures/counts/errors/hashes before assertions. Subsequently only original failures and genuinely new cases; skipped means skipped; no passing/full replay. Rebuild only after production change. Actual100coverage proof uses exact final source/maps or whole contiguous byte-identical ranges and real counters; raw maps/results/source only ignored appcache.
3. Assert native represented left/center/right/margins/default FULL and absent size,min23,negative overflow,right/left margins,proportional columns and per-page follow geometry using literal independent expected values; ODF signed LR preservation/export/reopen; mounted frame consumes native bounds and retains original paragraphs and selected-box ownership; actual Chromium1280/390 native Open,layout bounds,headline fragments,edit/UndoRedo. No old test/oracle changes.
4. Preserve453prior testfiles byte-identical and258semantic states/defaults/classes/registeredIOexceptions/evidence prefixes;13approvedsemanticpaths; append evidence only,new native owner remains partial/unverified. AP ignored-inclusive no sources/helpers/Python/rawdiagnostics;doctor/routing/diff.
5. After vendor restored, five source audits: npm exec -- tsx scripts/generate-writer-ui-resources.ts --check; npm run check:source-tree; npm run check:source-provenance; npm run inventory:invariants; npm run inventory:parity. ExactSHA sameagent EVALUATOR,no independent reviewer claim,semanticcommit,recordverify,meaningfulfinish,wholeparentcheckpoint;parentDOINGgoalACTIVE.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert only this leaf semantic commit with a follow-up task; retain immutable verification history. Never change deliberate save/open/recovery exceptions.

## Findings

Preflight clean main,parentDOING,previous174 verified progress. Read-only audit found imported align ignored by React,absolute column widths overriding table width,right margin rejected. Native tabfrm Format3767ff computes orientation spacing;xmltbli MakeTable2490ff admits size/orientation;xmlithlp aXMLTableAlignMap maps left/center/right/margins;MINLAY23. Guessed table-format/vitest paths and unmatched shell globs failed during discovery; corrected via rg,route recomputed,no mutation or scope expansion. Source only read in vendor;no upstream copied into AP.
