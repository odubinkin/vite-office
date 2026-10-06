---
id: "202610060009-RTRZCR"
title: "Align table cell pointer hits and row selector ownership with native UI"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 14
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
task_kind: "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-06T00:24:53.889Z"
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
  updated_at: "2026-10-06T00:27:27.376Z"
  updated_by: "EVALUATOR"
  note: "Bounded flat LTR table pointer and native row ownership verified on ce67593eb276b41faf574365f3f4d59e72ea15fa by same current agent; no independent review."
  evaluated_sha: "ce67593eb276b41faf574365f3f4d59e72ea15fa"
  blueprint_digest: "44ac5e62cd6b14d95d991ff877cf712b1d8f1c536512ca7e6ad09ac8c6e27073"
  evidence_refs:
    - ".agentplane/tasks/202610060009-RTRZCR/README.md"
    - ".agentplane/tasks/202610060009-RTRZCR/quality/20261006-002727376-recovery-context/quality-report.json"
    - ".agentplane/tasks/202610060009-RTRZCR/quality/20261006-002727376-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202610060009-RTRZCR/quality/20261006-002727376-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202610060009-RTRZCR/blueprint/resolved-snapshot.json"
    - ".agentplane/tasks/202610060009-RTRZCR/evidence/evaluator-proof.json"
    - ".agentplane/tasks/202610060009-RTRZCR/evidence/scope-audit.json"
    - ".agentplane/tasks/202610060009-RTRZCR/evidence/final-coverage.json"
    - ".agentplane/tasks/202610060009-RTRZCR/evidence/browser-closure-profile.json"
  findings:
    - "Exact10 semantic paths;438 prior tests437 byte-identical with one source-confirmed row fixture migration;258 semantic states/defaults/IOexceptions preserved. One full upstream-absent profile and only two original failed browser cases recovered after native-source marker oracle correction. Native label indent drag remains unverified; no workaround or full parity claim."
commit: null
comments:
  -
    author: "CODER"
    body: "Start: correct table interior pointer ownership and explicit row gutter selection through existing browser/native boundaries."
events:
  -
    type: "status"
    at: "2026-10-06T00:10:16.599Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: correct table interior pointer ownership and explicit row gutter selection through existing browser/native boundaries."
doc_version: 3
doc_updated_at: "2026-10-06T00:27:00.004Z"
doc_updated_by: "CODER"
description: "Fix ordinary cell padding clicks being interpreted as whole-row selection; use existing browser pointer geometry and native selection owners, with explicit row selection in the table gutter."
sections:
  Summary: "Align represented flat LTR table pointer geometry and row selector ownership with native UI."
  Scope: |-
    apps/office/src/sw/browser/editor/WriterEditableTable.tsx
    apps/office/src/sw/browser/editor/writer-geometry.ts
    apps/office/src/sw/browser/editor/browser-writer-edit-window.ts
    apps/office/src/sw/browser/editor/writer-selection.ts
    docs/program/source-provenance.json
    docs/program/parity/runtime-inventory.json
    apps/office/src/sw/browser/editor/native-table-selection.test.tsx
    apps/office/src/sw/browser/editor/native-table-pointer.test.tsx
    apps/office/src/sw/browser/editor/writer-table-geometry.test.ts
    apps/office/e2e/writer-native-table-pointer.spec.ts
  Plan: "Iteration170 one atomic CODER leaf under standing approved native UI/core convergence goal, direct main. Fix table pointer ownership: ordinary cell padding must place a native text caret rather than bubble to whole-row selection; list-marker hits must not trigger the removed synthetic row handler. Remove blanket tr onClick row inference; retain explicit row gesture at a left table gutter, moving existing accessible selector out of cell text flow and replacing in-cell vertical-dot content with hover/focus arrow. Existing native SwEditWin SelectTableRow/core selected boxes remain owners. Extend existing browser caret geometry for actual hit cell only: resolve actual projected paragraph with browser Range; when native range falls outside hit cell/paragraph, choose nearest actual paragraph by vertical bounds, clip native caret lookup into that paragraph, and use existing text-caret resolver for boundary/empty fallback. Export that existing helper directly for reuse, no duplicate walker/new manager/model/DTO/compat wrapper. Actual document elementFromPoint is injected beside caretRangeFromPoint in existing browser window. This is browser geometry adaptation, no claim of full VCL layout or new native core semantics. Four existing production browser files,2metadata,1 exact old synthetic-row-click test correction,3new geometry/mounted/Chromium test files10 semantic allowed paths. Preserve438 prior tests except exact source-confirmed row-hit fixture migration, all258 runtime states/defaults/classes/IO exceptions/old evidence; bounded new shared helper export recorded. Six statics then ONE full upstream-absent build/app/inventory/scripts/Chromium profile; afterward only original failed/genuinely new cases/failed gates/changed-file checks. Actual100%L/S/F/B maps/results/local initial sources only ignored appcache, never AP sources/helpers/Python/probes/rawdiagnostics. Five restored source audits, scope/sourcehash/prior-tests/metadata/AP/doctor/routing/diff evidence, same-agent EVALUATOR exact semantic SHA, canonical meaningful finish and whole parent Findings append. No network/outside/global/subagents. Conscious save/open/recovery policies unchanged. Flat LTR table pointer/caret and explicit row selector only; RTL/vertical/nested/merged/protected selection, column gestures/resizing/full layout/portion/core/UI/list/table remain unverified, goal ACTIVE. Source-confirmed verification refinement: edtwin.cxx IsNumLabel invokes edtwin3.cxx RulerMarginDrag -> StartDocDrag(Indent), not a promised text caret. The initial two browser cases incorrectly expected MKeep after marker click; retain padding/gutter/input/Undo/neighbor assertions and test marker only for absence of synthetic row inference and no content mutation. Do not add a guessed preventDefault/caret workaround. Native list-label indent dragging and cursor semantics remain explicitly unverified as the next candidate. Production sources unchanged after the initial full profile; mounted marker caret test covers only injected browser geometry, not native ruler parity."
  Verify Steps: |-
    1. Initial six statics: npm run format:check; npm run lint; npm run typecheck; npm run check:dependencies; npm run check:docs; npm run check:file-size. Recover failed gates only; later changed-file Prettier/ESLint/JSDoc/app and tools TypeScript/1000-line checks.
    2. ONE full upstream-absent profile: npm run test:static; npm run test:coverage --workspace @vite-office/office -- --coverage.reportOnFailure; npm run test:inventory:coverage -- --coverage.reportOnFailure; npm exec -- vitest run scripts/check-source-provenance.test.ts scripts/writer-ui-resource-model.test.ts; npm exec -- playwright test --config apps/office/playwright.config.ts. In-repo vendor rename with finally restoration. Tests never read/invoke/compile upstream. Persist exact failure/error/count/hash evidence before assertions. Then only original failed or genuinely new cases, skipped is skipped; no passing/full replay. Rebuild only after actual production change. Actual100%L/S/F/B via exact source/map identity or contiguous unchanged-location counters plus actual changed counters; raw maps/results/local source snapshots only ignored appcache.
    3. New injected geometry cases prove direct native range, hit-cell containment, nearest actual paragraph/clipped native hit, top/bottom/left/right and empty formatted fallback, unavailable APIs/outside cell. Mounted production owners prove cell padding uses actual native caret/type/history/neighbor preservation; injected marker geometry proves only absence of synthetic row inference, not native label caret semantics, explicit gutter selector owns actual selected boxes and does not enter text/measurement flow. Real Chromium1280/390 ordinary inserted or freshly imported multi-paragraph/list/empty cells prove padding clicks reset selected rows, focus correct cell, typing/Undo preserve neighbors and arrow gutter lies outside table content. Do not replace actual browser pointer events with direct core test injection.
    4. Preserve438 prior test files except exact old row-surface click fixture change to explicit native row selector; preserve258 runtime states/defaults/classifications/IO exceptions/evidence prefixes, add only bounded evidence/shared existing helper export. Exact10-path scope/source hashes/AP ignored-inclusive audit, no source/helper AP artifacts.
    5. After vendor restoration five source audits: npm exec -- tsx scripts/generate-writer-ui-resources.ts --check; npm run check:source-tree; npm run check:source-provenance; npm run inventory:invariants; npm run inventory:parity. Doctor/routing/diffcheck, same-current-agent EVALUATOR exact semantic SHA pass, canonical verify/meaningful finish, whole parent Findings append and clean main. Full native/core/UI/list/table stays unverified ACTIVE; conscious IO deviations unchanged.
    6. Native IsNumLabel/RulerMarginDrag source confirmation corrects the initial marker-to-text oracle: original failed two Chromium cases retain all cell/gutter/input/Undo assertions and assert marker does not synthetically select a row or mutate text; exclude the incorrect MKeep typing expectation. Record this correction and preserve exact original failures. Native label StartDocDrag(Indent), ruler binding and cursor semantics remain unverified; no production fix or browser workaround for that independent behavior in this leaf.
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert this leaf semantic commit; preserve prior verified task evidence and registered IO policies."
  Findings: |-
    Iteration170 verified bounded flat LTR table pointer/row-selector correction at base ef4f6805b717cf3883b36c84ba91b8d597079e26. Removed blanket tr click row inference: cell padding and empty cells resolve actual hit cell/nearest projected paragraph through browser Range, clipped coordinates and shared existing text-caret helper. Existing helper exported directly; no duplicate walker, new manager/model/DTO/TextRuns conversion or compatibility wrapper. Explicit row selector retained native SwEditWin/core box ownership, moved outside cell text/measurement flow to an absolute left hover/focus arrow gutter. Four existing production browser owners,2metadata,1exact old synthetic tr-click fixture migration,3new testfiles:10semanticpaths.438prior tests437byte-identical; all258runtime states/defaults/classes/IOexceptions/old evidence prefixes preserved, no blanket module promotion.8newappcases4geometry4mounted DOM and2Chromium verify hit-cell containment, clipped/nearest paragraph, unavailable APIs/boundaries/empty/formatted fallback, selected-row clearing, native caret/input/history and neighbor preservation, explicit gutter geometry/native boxes. Mounted marker caret case only covers injected browser geometry, not native label/ruler equivalence.
    Six initial statics passed after failed format gate only repaired/rerun. ONE full upstream-absent profile:build pass12605app109inventory5scripts147Chromium pass,2newChromium failures0flaky. Both failures were the initial MKeep oracle after clicking a numbered label. Source confirmation edtwin.cxx IsNumLabel -> edtwin3.cxx RulerMarginDrag -> StartDocDrag(Indent) disproves a guaranteed text-caret expectation. Plan/verification refined under standing scope authorization; retain every padding/gutter/input/Undo/neighbor assertion and marker no-synthetic-row/no-text-mutation assertions; remove only incorrect marker typing oracle. No guessed caret/preventDefault workaround or production change/rebuild. Only original2failedChromium repeated upstream-absent:2pass0failed0flaky;147passingbrowser and allpassingapp/inventory/scripts not replayed. Final distinct12605app109inventory5scripts149Chromium. Native list-label indent drag/ruler binding/cursor semantics remain identified and unverified for next leaf.
    Actual app100%12927L14175S3432F10526B;inventory100%1464L1523S384F1080B. Exact unchanged postinitial production source/map hashes, no counter transfer or app replay. Vendor restored finally before audits. Changed final browser-file Prettier/ESLint/JSDoc/TypeScript/1000-line checks passed; five restored source audits passed semanticviolations0; scope/APignored-inclusive4465files0forbidden/doctor0errors2knownwarnings/routing/diffcheck passed. Scope proof initially compared full original failed case names with filename prefixes against bare closure titles; corrected explicit observed prefix normalization, no tests replayed or production changes. Earlier bounded read-only missing-path searches returned nonzero and routes recomputed. Initial metadata assembly TypeError occurred before writes and was corrected; no raw source/diagnostics saved in AP. Raw maps/results/local initial production snapshots only ignored appcache. AP only bounded English prose/counts/hashes/outcomes, no upstream sources/helpers/Python/probes/binaries/sourceframes. No network/outside/global/subagents. Current agent EVALUATOR will verify exact semantic SHA, no independent reviewer claimed. Full label/ruler, RTL/vertical/nested/merged/protected/column/resizing/native layout/portion/core/UI/list/table remain unverified; conscious save/open/recovery deviations unchanged, parent DOING and goal ACTIVE.
id_source: "generated"
---
## Summary

Align represented flat LTR table pointer geometry and row selector ownership with native UI.

## Scope

apps/office/src/sw/browser/editor/WriterEditableTable.tsx
apps/office/src/sw/browser/editor/writer-geometry.ts
apps/office/src/sw/browser/editor/browser-writer-edit-window.ts
apps/office/src/sw/browser/editor/writer-selection.ts
docs/program/source-provenance.json
docs/program/parity/runtime-inventory.json
apps/office/src/sw/browser/editor/native-table-selection.test.tsx
apps/office/src/sw/browser/editor/native-table-pointer.test.tsx
apps/office/src/sw/browser/editor/writer-table-geometry.test.ts
apps/office/e2e/writer-native-table-pointer.spec.ts

## Plan

Iteration170 one atomic CODER leaf under standing approved native UI/core convergence goal, direct main. Fix table pointer ownership: ordinary cell padding must place a native text caret rather than bubble to whole-row selection; list-marker hits must not trigger the removed synthetic row handler. Remove blanket tr onClick row inference; retain explicit row gesture at a left table gutter, moving existing accessible selector out of cell text flow and replacing in-cell vertical-dot content with hover/focus arrow. Existing native SwEditWin SelectTableRow/core selected boxes remain owners. Extend existing browser caret geometry for actual hit cell only: resolve actual projected paragraph with browser Range; when native range falls outside hit cell/paragraph, choose nearest actual paragraph by vertical bounds, clip native caret lookup into that paragraph, and use existing text-caret resolver for boundary/empty fallback. Export that existing helper directly for reuse, no duplicate walker/new manager/model/DTO/compat wrapper. Actual document elementFromPoint is injected beside caretRangeFromPoint in existing browser window. This is browser geometry adaptation, no claim of full VCL layout or new native core semantics. Four existing production browser files,2metadata,1 exact old synthetic-row-click test correction,3new geometry/mounted/Chromium test files10 semantic allowed paths. Preserve438 prior tests except exact source-confirmed row-hit fixture migration, all258 runtime states/defaults/classes/IO exceptions/old evidence; bounded new shared helper export recorded. Six statics then ONE full upstream-absent build/app/inventory/scripts/Chromium profile; afterward only original failed/genuinely new cases/failed gates/changed-file checks. Actual100%L/S/F/B maps/results/local initial sources only ignored appcache, never AP sources/helpers/Python/probes/rawdiagnostics. Five restored source audits, scope/sourcehash/prior-tests/metadata/AP/doctor/routing/diff evidence, same-agent EVALUATOR exact semantic SHA, canonical meaningful finish and whole parent Findings append. No network/outside/global/subagents. Conscious save/open/recovery policies unchanged. Flat LTR table pointer/caret and explicit row selector only; RTL/vertical/nested/merged/protected selection, column gestures/resizing/full layout/portion/core/UI/list/table remain unverified, goal ACTIVE. Source-confirmed verification refinement: edtwin.cxx IsNumLabel invokes edtwin3.cxx RulerMarginDrag -> StartDocDrag(Indent), not a promised text caret. The initial two browser cases incorrectly expected MKeep after marker click; retain padding/gutter/input/Undo/neighbor assertions and test marker only for absence of synthetic row inference and no content mutation. Do not add a guessed preventDefault/caret workaround. Native list-label indent dragging and cursor semantics remain explicitly unverified as the next candidate. Production sources unchanged after the initial full profile; mounted marker caret test covers only injected browser geometry, not native ruler parity.

## Verify Steps

1. Initial six statics: npm run format:check; npm run lint; npm run typecheck; npm run check:dependencies; npm run check:docs; npm run check:file-size. Recover failed gates only; later changed-file Prettier/ESLint/JSDoc/app and tools TypeScript/1000-line checks.
2. ONE full upstream-absent profile: npm run test:static; npm run test:coverage --workspace @vite-office/office -- --coverage.reportOnFailure; npm run test:inventory:coverage -- --coverage.reportOnFailure; npm exec -- vitest run scripts/check-source-provenance.test.ts scripts/writer-ui-resource-model.test.ts; npm exec -- playwright test --config apps/office/playwright.config.ts. In-repo vendor rename with finally restoration. Tests never read/invoke/compile upstream. Persist exact failure/error/count/hash evidence before assertions. Then only original failed or genuinely new cases, skipped is skipped; no passing/full replay. Rebuild only after actual production change. Actual100%L/S/F/B via exact source/map identity or contiguous unchanged-location counters plus actual changed counters; raw maps/results/local source snapshots only ignored appcache.
3. New injected geometry cases prove direct native range, hit-cell containment, nearest actual paragraph/clipped native hit, top/bottom/left/right and empty formatted fallback, unavailable APIs/outside cell. Mounted production owners prove cell padding uses actual native caret/type/history/neighbor preservation; injected marker geometry proves only absence of synthetic row inference, not native label caret semantics, explicit gutter selector owns actual selected boxes and does not enter text/measurement flow. Real Chromium1280/390 ordinary inserted or freshly imported multi-paragraph/list/empty cells prove padding clicks reset selected rows, focus correct cell, typing/Undo preserve neighbors and arrow gutter lies outside table content. Do not replace actual browser pointer events with direct core test injection.
4. Preserve438 prior test files except exact old row-surface click fixture change to explicit native row selector; preserve258 runtime states/defaults/classifications/IO exceptions/evidence prefixes, add only bounded evidence/shared existing helper export. Exact10-path scope/source hashes/AP ignored-inclusive audit, no source/helper AP artifacts.
5. After vendor restoration five source audits: npm exec -- tsx scripts/generate-writer-ui-resources.ts --check; npm run check:source-tree; npm run check:source-provenance; npm run inventory:invariants; npm run inventory:parity. Doctor/routing/diffcheck, same-current-agent EVALUATOR exact semantic SHA pass, canonical verify/meaningful finish, whole parent Findings append and clean main. Full native/core/UI/list/table stays unverified ACTIVE; conscious IO deviations unchanged.
6. Native IsNumLabel/RulerMarginDrag source confirmation corrects the initial marker-to-text oracle: original failed two Chromium cases retain all cell/gutter/input/Undo assertions and assert marker does not synthetically select a row or mutate text; exclude the incorrect MKeep typing expectation. Record this correction and preserve exact original failures. Native label StartDocDrag(Indent), ruler binding and cursor semantics remain unverified; no production fix or browser workaround for that independent behavior in this leaf.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert this leaf semantic commit; preserve prior verified task evidence and registered IO policies.

## Findings

Iteration170 verified bounded flat LTR table pointer/row-selector correction at base ef4f6805b717cf3883b36c84ba91b8d597079e26. Removed blanket tr click row inference: cell padding and empty cells resolve actual hit cell/nearest projected paragraph through browser Range, clipped coordinates and shared existing text-caret helper. Existing helper exported directly; no duplicate walker, new manager/model/DTO/TextRuns conversion or compatibility wrapper. Explicit row selector retained native SwEditWin/core box ownership, moved outside cell text/measurement flow to an absolute left hover/focus arrow gutter. Four existing production browser owners,2metadata,1exact old synthetic tr-click fixture migration,3new testfiles:10semanticpaths.438prior tests437byte-identical; all258runtime states/defaults/classes/IOexceptions/old evidence prefixes preserved, no blanket module promotion.8newappcases4geometry4mounted DOM and2Chromium verify hit-cell containment, clipped/nearest paragraph, unavailable APIs/boundaries/empty/formatted fallback, selected-row clearing, native caret/input/history and neighbor preservation, explicit gutter geometry/native boxes. Mounted marker caret case only covers injected browser geometry, not native label/ruler equivalence.
Six initial statics passed after failed format gate only repaired/rerun. ONE full upstream-absent profile:build pass12605app109inventory5scripts147Chromium pass,2newChromium failures0flaky. Both failures were the initial MKeep oracle after clicking a numbered label. Source confirmation edtwin.cxx IsNumLabel -> edtwin3.cxx RulerMarginDrag -> StartDocDrag(Indent) disproves a guaranteed text-caret expectation. Plan/verification refined under standing scope authorization; retain every padding/gutter/input/Undo/neighbor assertion and marker no-synthetic-row/no-text-mutation assertions; remove only incorrect marker typing oracle. No guessed caret/preventDefault workaround or production change/rebuild. Only original2failedChromium repeated upstream-absent:2pass0failed0flaky;147passingbrowser and allpassingapp/inventory/scripts not replayed. Final distinct12605app109inventory5scripts149Chromium. Native list-label indent drag/ruler binding/cursor semantics remain identified and unverified for next leaf.
Actual app100%12927L14175S3432F10526B;inventory100%1464L1523S384F1080B. Exact unchanged postinitial production source/map hashes, no counter transfer or app replay. Vendor restored finally before audits. Changed final browser-file Prettier/ESLint/JSDoc/TypeScript/1000-line checks passed; five restored source audits passed semanticviolations0; scope/APignored-inclusive4465files0forbidden/doctor0errors2knownwarnings/routing/diffcheck passed. Scope proof initially compared full original failed case names with filename prefixes against bare closure titles; corrected explicit observed prefix normalization, no tests replayed or production changes. Earlier bounded read-only missing-path searches returned nonzero and routes recomputed. Initial metadata assembly TypeError occurred before writes and was corrected; no raw source/diagnostics saved in AP. Raw maps/results/local initial production snapshots only ignored appcache. AP only bounded English prose/counts/hashes/outcomes, no upstream sources/helpers/Python/probes/binaries/sourceframes. No network/outside/global/subagents. Current agent EVALUATOR will verify exact semantic SHA, no independent reviewer claimed. Full label/ruler, RTL/vertical/nested/merged/protected/column/resizing/native layout/portion/core/UI/list/table remain unverified; conscious save/open/recovery deviations unchanged, parent DOING and goal ACTIVE.
