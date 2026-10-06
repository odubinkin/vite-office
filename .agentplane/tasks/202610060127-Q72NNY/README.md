---
id: "202610060127-Q72NNY"
title: "Restore native repeated table headlines across page fragments"
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
  updated_at: "2026-10-06T01:28:21.399Z"
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
    body: "Start: Restore source-shaped repeated table headlines in existing native model,page formatter and browser owners under standing approved convergence scope; preserve old tests and IO exceptions."
events:
  -
    type: "status"
    at: "2026-10-06T01:28:24.043Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: Restore source-shaped repeated table headlines in existing native model,page formatter and browser owners under standing approved convergence scope; preserve old tests and IO exceptions."
doc_version: 3
doc_updated_at: "2026-10-06T01:28:24.043Z"
doc_updated_by: "CODER"
description: "Iteration173: source-confirmed existing repeatHeaderRows is ignored by core page flow and browser fragments. Restore native repeated headline count, follow-frame geometry, shared-node painting/editing and source-shaped no repeated row gutter; preserve all previous tests and registered IO exceptions."
sections:
  Summary: "Restore actual repeated table headlines in existing page layout and browser rendering."
  Scope: |-
    apps/office/src/sw/source/core/table/swtable.ts
    apps/office/src/sw/source/core/layout/newfrm.ts
    apps/office/src/sw/browser/editor/WriterEditableTable.tsx
    apps/office/src/sw/browser/editor/WriterEditableParagraph.tsx
    apps/office/src/sw/browser/editor/WriterPlainTextEditor.tsx
    docs/program/source-provenance.json
    docs/program/parity/runtime-inventory.json
    apps/office/src/sw/source/core/layout/native-table-headlines.test.ts
    apps/office/src/sw/browser/editor/native-table-headlines.test.tsx
    apps/office/e2e/writer-table-headlines.spec.ts
  Plan: "Iteration173 under standing approved iterative native core/UI convergence goal, one atomic CODER leaf direct main. Previous172 PROGRESS proved by semantic1874805 and DONE; parent full parity remains unverified. Restore existing imported/authored repeatHeaderRows table functionality currently ignored by page flow/UI. Source-owned SwTable GetRowsToRepeat/SetRowsToRepeat mapped to existing represented format,count capped by actual rows,native unsigned16 count and zero-default/disabled behavior. Existing newfrm row-only formatter must keep headline group plus first nonsplittable body row together when moving from occupied page, count repeated headline height on follow pages, repeat actual original row owners in bounded follow-frame values, keep first body with headers on oversized cases without loops, and native ordinary oversized-headline fallback sets repeat count0. Existing table browser renderer paints master rows and repeated original rows without model cloning/transfer/TextRuns reconstruction; omit native forbidden repeated headline row-selection gutter. Preserve distinct DOM descriptions and frame-local paragraph registration; selection restoration keeps current actual rendered occurrence rather than overwriting same native-node identity with last copy. Shared input/history updates all occurrences and retains source node/cursor; real UndoRedo and ODT production Open/browser tests. Five production owners,two metadata,two new app testfiles,one new Chromium spec,10semantic paths. Preserve446prior testfiles byte-identical and258existing states/defaults/classes/IO exceptions/evidence prefixes. Source-shaped whole-row flat horizontal pages only; nested/merged/rowspan,row splitting,table selection across repeated boxes,vertical/RTL/fly/multicolumn/protection/full native frame/core/UI parity separately unverified. Six initial statics then ONE absent full profile; failed/new-only closure afterwards. No upstream in tests, no AP sources/helpers/Python/rawdiagnostics, raw maps/results/source snapshots only ignored appcache. Same-agent exact semantic evaluator,meaningfulfinish,parent checkpoint; goalACTIVE."
  Verify Steps: |-
    1. Six initial static gates: npm run format:check; npm run lint; npm run typecheck; npm run check:dependencies; npm run check:docs; npm run check:file-size. Recover only failed gates; after initial profile only changed-file checks.
    2. ONE full upstream-absent build/app/inventory/scripts/Chromium profile using npm run test:static; npm run test:coverage --workspace @vite-office/office -- --coverage.reportOnFailure; npm run test:inventory:coverage -- --coverage.reportOnFailure; npm exec -- vitest run scripts/check-source-provenance.test.ts scripts/writer-ui-resource-model.test.ts; npm exec -- playwright test --config apps/office/playwright.config.ts. Rename vendor/.offline-Q72NNY in repo and restore in finally; no tests read/invoke/compile upstream. Persist exact failures/errors/counts/hashes before assertions; only original failures/genuinely new cases afterwards,skipped=skipped. Rebuild only actual production changes. Actual100percent L/S/F/B only exact actual source/maps identity or contiguous unchanged source-location plus real counters,raw maps/results/local source snapshots only ignored appcache.
    3. New core cases independently assert repeat count/default/disabled/unsigned/capping, actual master/follow row ranges and repeat counts, height budget and following text, group+first-body ownership, oversized no-loop/fallback, model rows/nodes unchanged and reformat count changes. New real mounted cases assert shared native header text/format/list/cursor/history owners, master and follow copies, unique aria descriptions, current occurrence restoration, repeated gutter omitted, no duplicate document nodes; cancel/nonrepeat/master controls. Real ODT Open Chromium1280/390 exercises multi-page header paint, same native node edits,all repeated updates,UndoRedo and body neighbors.
    4. Preserve446prior testfiles byte-identical and258existing semantic state/default/classification/IOexception/evidence prefixes; bounded ten semantic paths and native source hashes. AP ignored-inclusive sources/helpers/Python/probe hygiene; doctor,routing,diffcheck. Registered IO deviations unchanged; broad table/core/UI parity unverified.
    5. Vendor restored before five source audits: npm exec -- tsx scripts/generate-writer-ui-resources.ts --check; npm run check:source-tree; npm run check:source-provenance; npm run inventory:invariants; npm run inventory:parity. Same-agent EVALUATOR exact semantic SHA then recordedverification,meaningfulfinish and whole parent checkpoint; parentDOINGgoalACTIVE.
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert only this task's semantic commit; preserve prior task history,old tests and conscious IO exceptions."
  Findings: "Previous goal turn classified PROGRESS: task202610060059-RYRBYJ DONE semantic1874805e7d9d25af14487df1ee398a60af5adacf. Current cleanmain baseb206a5c685a4. Source audit:tabfrm.cxx Split builds follow headlines from original SwTableLines and marks repeated; HandleTableHeadlineChange rebuilds existing follow headlines. Split keeps first nonsplittable body row with headlines and disables repeat count when ordinary headline itself exceeds page. trvlfrm/crsrsh disallow table-mode selection in repeated headlines but ordinary content uses same native nodes. Existing local repeatHeaderRows stored by import/dialog/export is ignored by newfrm and fragment renderer. Scoped repeated-content editing supported; full cross-box table cursor behavior remains unverified. Read-only missing guessed controller/pointer/text source lookups and absent optional user-instructions search returned nonzero; routes recomputed before mutation. No network/global/outside/subagents."
id_source: "generated"
---
## Summary

Restore actual repeated table headlines in existing page layout and browser rendering.

## Scope

apps/office/src/sw/source/core/table/swtable.ts
apps/office/src/sw/source/core/layout/newfrm.ts
apps/office/src/sw/browser/editor/WriterEditableTable.tsx
apps/office/src/sw/browser/editor/WriterEditableParagraph.tsx
apps/office/src/sw/browser/editor/WriterPlainTextEditor.tsx
docs/program/source-provenance.json
docs/program/parity/runtime-inventory.json
apps/office/src/sw/source/core/layout/native-table-headlines.test.ts
apps/office/src/sw/browser/editor/native-table-headlines.test.tsx
apps/office/e2e/writer-table-headlines.spec.ts

## Plan

Iteration173 under standing approved iterative native core/UI convergence goal, one atomic CODER leaf direct main. Previous172 PROGRESS proved by semantic1874805 and DONE; parent full parity remains unverified. Restore existing imported/authored repeatHeaderRows table functionality currently ignored by page flow/UI. Source-owned SwTable GetRowsToRepeat/SetRowsToRepeat mapped to existing represented format,count capped by actual rows,native unsigned16 count and zero-default/disabled behavior. Existing newfrm row-only formatter must keep headline group plus first nonsplittable body row together when moving from occupied page, count repeated headline height on follow pages, repeat actual original row owners in bounded follow-frame values, keep first body with headers on oversized cases without loops, and native ordinary oversized-headline fallback sets repeat count0. Existing table browser renderer paints master rows and repeated original rows without model cloning/transfer/TextRuns reconstruction; omit native forbidden repeated headline row-selection gutter. Preserve distinct DOM descriptions and frame-local paragraph registration; selection restoration keeps current actual rendered occurrence rather than overwriting same native-node identity with last copy. Shared input/history updates all occurrences and retains source node/cursor; real UndoRedo and ODT production Open/browser tests. Five production owners,two metadata,two new app testfiles,one new Chromium spec,10semantic paths. Preserve446prior testfiles byte-identical and258existing states/defaults/classes/IO exceptions/evidence prefixes. Source-shaped whole-row flat horizontal pages only; nested/merged/rowspan,row splitting,table selection across repeated boxes,vertical/RTL/fly/multicolumn/protection/full native frame/core/UI parity separately unverified. Six initial statics then ONE absent full profile; failed/new-only closure afterwards. No upstream in tests, no AP sources/helpers/Python/rawdiagnostics, raw maps/results/source snapshots only ignored appcache. Same-agent exact semantic evaluator,meaningfulfinish,parent checkpoint; goalACTIVE.

## Verify Steps

1. Six initial static gates: npm run format:check; npm run lint; npm run typecheck; npm run check:dependencies; npm run check:docs; npm run check:file-size. Recover only failed gates; after initial profile only changed-file checks.
2. ONE full upstream-absent build/app/inventory/scripts/Chromium profile using npm run test:static; npm run test:coverage --workspace @vite-office/office -- --coverage.reportOnFailure; npm run test:inventory:coverage -- --coverage.reportOnFailure; npm exec -- vitest run scripts/check-source-provenance.test.ts scripts/writer-ui-resource-model.test.ts; npm exec -- playwright test --config apps/office/playwright.config.ts. Rename vendor/.offline-Q72NNY in repo and restore in finally; no tests read/invoke/compile upstream. Persist exact failures/errors/counts/hashes before assertions; only original failures/genuinely new cases afterwards,skipped=skipped. Rebuild only actual production changes. Actual100percent L/S/F/B only exact actual source/maps identity or contiguous unchanged source-location plus real counters,raw maps/results/local source snapshots only ignored appcache.
3. New core cases independently assert repeat count/default/disabled/unsigned/capping, actual master/follow row ranges and repeat counts, height budget and following text, group+first-body ownership, oversized no-loop/fallback, model rows/nodes unchanged and reformat count changes. New real mounted cases assert shared native header text/format/list/cursor/history owners, master and follow copies, unique aria descriptions, current occurrence restoration, repeated gutter omitted, no duplicate document nodes; cancel/nonrepeat/master controls. Real ODT Open Chromium1280/390 exercises multi-page header paint, same native node edits,all repeated updates,UndoRedo and body neighbors.
4. Preserve446prior testfiles byte-identical and258existing semantic state/default/classification/IOexception/evidence prefixes; bounded ten semantic paths and native source hashes. AP ignored-inclusive sources/helpers/Python/probe hygiene; doctor,routing,diffcheck. Registered IO deviations unchanged; broad table/core/UI parity unverified.
5. Vendor restored before five source audits: npm exec -- tsx scripts/generate-writer-ui-resources.ts --check; npm run check:source-tree; npm run check:source-provenance; npm run inventory:invariants; npm run inventory:parity. Same-agent EVALUATOR exact semantic SHA then recordedverification,meaningfulfinish and whole parent checkpoint; parentDOINGgoalACTIVE.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert only this task's semantic commit; preserve prior task history,old tests and conscious IO exceptions.

## Findings

Previous goal turn classified PROGRESS: task202610060059-RYRBYJ DONE semantic1874805e7d9d25af14487df1ee398a60af5adacf. Current cleanmain baseb206a5c685a4. Source audit:tabfrm.cxx Split builds follow headlines from original SwTableLines and marks repeated; HandleTableHeadlineChange rebuilds existing follow headlines. Split keeps first nonsplittable body row with headlines and disables repeat count when ordinary headline itself exceeds page. trvlfrm/crsrsh disallow table-mode selection in repeated headlines but ordinary content uses same native nodes. Existing local repeatHeaderRows stored by import/dialog/export is ignored by newfrm and fragment renderer. Scoped repeated-content editing supported; full cross-box table cursor behavior remains unverified. Read-only missing guessed controller/pointer/text source lookups and absent optional user-instructions search returned nonzero; routes recomputed before mutation. No network/global/outside/subagents.
