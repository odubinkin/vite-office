---
id: "202610060009-RTRZCR"
title: "Align table cell pointer hits and row selector ownership with native UI"
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
  updated_at: "2026-10-06T00:10:15.783Z"
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
doc_updated_at: "2026-10-06T00:10:16.599Z"
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
  Plan: "Iteration170 one atomic CODER leaf under standing approved native UI/core convergence goal, direct main. Fix table pointer ownership: ordinary cell padding and marker clicks must place a native text caret rather than bubble to whole-row selection. Remove blanket tr onClick row inference; retain explicit row gesture at a left table gutter, moving existing accessible selector out of cell text flow and replacing in-cell vertical-dot content with hover/focus arrow. Existing native SwEditWin SelectTableRow/core selected boxes remain owners. Extend existing browser caret geometry for actual hit cell only: resolve actual projected paragraph with browser Range; when native range falls outside hit cell/paragraph, choose nearest actual paragraph by vertical bounds, clip native caret lookup into that paragraph, and use existing text-caret resolver for boundary/empty fallback. Export that existing helper directly for reuse, no duplicate walker/new manager/model/DTO/compat wrapper. Actual document elementFromPoint is injected beside caretRangeFromPoint in existing browser window. This is browser geometry adaptation, no claim of full VCL layout or new native core semantics. Four existing production browser files,2metadata,1 exact old synthetic-row-click test correction,3new geometry/mounted/Chromium test files10 semantic allowed paths. Preserve438 prior tests except exact source-confirmed row-hit fixture migration, all258 runtime states/defaults/classes/IO exceptions/old evidence; bounded new shared helper export recorded. Six statics then ONE full upstream-absent build/app/inventory/scripts/Chromium profile; afterward only original failed/genuinely new cases/failed gates/changed-file checks. Actual100%L/S/F/B maps/results/local initial sources only ignored appcache, never AP sources/helpers/Python/probes/rawdiagnostics. Five restored source audits, scope/sourcehash/prior-tests/metadata/AP/doctor/routing/diff evidence, same-agent EVALUATOR exact semantic SHA, canonical meaningful finish and whole parent Findings append. No network/outside/global/subagents. Conscious save/open/recovery policies unchanged. Flat LTR table pointer/caret and explicit row selector only; RTL/vertical/nested/merged/protected selection, column gestures/resizing/full layout/portion/core/UI/list/table remain unverified, goal ACTIVE."
  Verify Steps: |-
    1. Initial six statics: npm run format:check; npm run lint; npm run typecheck; npm run check:dependencies; npm run check:docs; npm run check:file-size. Recover failed gates only; later changed-file Prettier/ESLint/JSDoc/app and tools TypeScript/1000-line checks.
    2. ONE full upstream-absent profile: npm run test:static; npm run test:coverage --workspace @vite-office/office -- --coverage.reportOnFailure; npm run test:inventory:coverage -- --coverage.reportOnFailure; npm exec -- vitest run scripts/check-source-provenance.test.ts scripts/writer-ui-resource-model.test.ts; npm exec -- playwright test --config apps/office/playwright.config.ts. In-repo vendor rename with finally restoration. Tests never read/invoke/compile upstream. Persist exact failure/error/count/hash evidence before assertions. Then only original failed or genuinely new cases, skipped is skipped; no passing/full replay. Rebuild only after actual production change. Actual100%L/S/F/B via exact source/map identity or contiguous unchanged-location counters plus actual changed counters; raw maps/results/local source snapshots only ignored appcache.
    3. New injected geometry cases prove direct native range, hit-cell containment, nearest actual paragraph/clipped native hit, top/bottom/left/right and empty formatted fallback, unavailable APIs/outside cell. Mounted production owners prove cell/marker clicks never select row, actual native caret/type/history/neighbor preservation, explicit gutter selector owns actual selected boxes and does not enter text/measurement flow. Real Chromium1280/390 ordinary inserted or freshly imported multi-paragraph/list/empty cells prove padding clicks reset selected rows, focus correct cell, typing/Undo preserve neighbors and arrow gutter lies outside table content. Do not replace actual browser pointer events with direct core test injection.
    4. Preserve438 prior test files except exact old row-surface click fixture change to explicit native row selector; preserve258 runtime states/defaults/classifications/IO exceptions/evidence prefixes, add only bounded evidence/shared existing helper export. Exact10-path scope/source hashes/AP ignored-inclusive audit, no source/helper AP artifacts.
    5. After vendor restoration five source audits: npm exec -- tsx scripts/generate-writer-ui-resources.ts --check; npm run check:source-tree; npm run check:source-provenance; npm run inventory:invariants; npm run inventory:parity. Doctor/routing/diffcheck, same-current-agent EVALUATOR exact semantic SHA pass, canonical verify/meaningful finish, whole parent Findings append and clean main. Full native/core/UI/list/table stays unverified ACTIVE; conscious IO deviations unchanged.
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert this leaf semantic commit; preserve prior verified task evidence and registered IO policies."
  Findings: "Preflight direct main clean at ef4f6805b717cf3883b36c84ba91b8d597079e26. Previous goal turn169 is verified progress: native NONE ODT/UNO fix DONE. New read-only audit confirms blanket tr click treats td padding and list marker clicks as full-row selection. Pinned SwEditWin enhanced table selection is gated through SwFEShell WhichMouseTabCol/GetBox edge hotspots; ordinary interior follows CallSetCursor. Current browser geometry only accepts ranges already inside a paragraph, leaving cell padding unresolved. Standing user authorization covers this bounded correction; full table/core/UI/list parity remains unverified."
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

Iteration170 one atomic CODER leaf under standing approved native UI/core convergence goal, direct main. Fix table pointer ownership: ordinary cell padding and marker clicks must place a native text caret rather than bubble to whole-row selection. Remove blanket tr onClick row inference; retain explicit row gesture at a left table gutter, moving existing accessible selector out of cell text flow and replacing in-cell vertical-dot content with hover/focus arrow. Existing native SwEditWin SelectTableRow/core selected boxes remain owners. Extend existing browser caret geometry for actual hit cell only: resolve actual projected paragraph with browser Range; when native range falls outside hit cell/paragraph, choose nearest actual paragraph by vertical bounds, clip native caret lookup into that paragraph, and use existing text-caret resolver for boundary/empty fallback. Export that existing helper directly for reuse, no duplicate walker/new manager/model/DTO/compat wrapper. Actual document elementFromPoint is injected beside caretRangeFromPoint in existing browser window. This is browser geometry adaptation, no claim of full VCL layout or new native core semantics. Four existing production browser files,2metadata,1 exact old synthetic-row-click test correction,3new geometry/mounted/Chromium test files10 semantic allowed paths. Preserve438 prior tests except exact source-confirmed row-hit fixture migration, all258 runtime states/defaults/classes/IO exceptions/old evidence; bounded new shared helper export recorded. Six statics then ONE full upstream-absent build/app/inventory/scripts/Chromium profile; afterward only original failed/genuinely new cases/failed gates/changed-file checks. Actual100%L/S/F/B maps/results/local initial sources only ignored appcache, never AP sources/helpers/Python/probes/rawdiagnostics. Five restored source audits, scope/sourcehash/prior-tests/metadata/AP/doctor/routing/diff evidence, same-agent EVALUATOR exact semantic SHA, canonical meaningful finish and whole parent Findings append. No network/outside/global/subagents. Conscious save/open/recovery policies unchanged. Flat LTR table pointer/caret and explicit row selector only; RTL/vertical/nested/merged/protected selection, column gestures/resizing/full layout/portion/core/UI/list/table remain unverified, goal ACTIVE.

## Verify Steps

1. Initial six statics: npm run format:check; npm run lint; npm run typecheck; npm run check:dependencies; npm run check:docs; npm run check:file-size. Recover failed gates only; later changed-file Prettier/ESLint/JSDoc/app and tools TypeScript/1000-line checks.
2. ONE full upstream-absent profile: npm run test:static; npm run test:coverage --workspace @vite-office/office -- --coverage.reportOnFailure; npm run test:inventory:coverage -- --coverage.reportOnFailure; npm exec -- vitest run scripts/check-source-provenance.test.ts scripts/writer-ui-resource-model.test.ts; npm exec -- playwright test --config apps/office/playwright.config.ts. In-repo vendor rename with finally restoration. Tests never read/invoke/compile upstream. Persist exact failure/error/count/hash evidence before assertions. Then only original failed or genuinely new cases, skipped is skipped; no passing/full replay. Rebuild only after actual production change. Actual100%L/S/F/B via exact source/map identity or contiguous unchanged-location counters plus actual changed counters; raw maps/results/local source snapshots only ignored appcache.
3. New injected geometry cases prove direct native range, hit-cell containment, nearest actual paragraph/clipped native hit, top/bottom/left/right and empty formatted fallback, unavailable APIs/outside cell. Mounted production owners prove cell/marker clicks never select row, actual native caret/type/history/neighbor preservation, explicit gutter selector owns actual selected boxes and does not enter text/measurement flow. Real Chromium1280/390 ordinary inserted or freshly imported multi-paragraph/list/empty cells prove padding clicks reset selected rows, focus correct cell, typing/Undo preserve neighbors and arrow gutter lies outside table content. Do not replace actual browser pointer events with direct core test injection.
4. Preserve438 prior test files except exact old row-surface click fixture change to explicit native row selector; preserve258 runtime states/defaults/classifications/IO exceptions/evidence prefixes, add only bounded evidence/shared existing helper export. Exact10-path scope/source hashes/AP ignored-inclusive audit, no source/helper AP artifacts.
5. After vendor restoration five source audits: npm exec -- tsx scripts/generate-writer-ui-resources.ts --check; npm run check:source-tree; npm run check:source-provenance; npm run inventory:invariants; npm run inventory:parity. Doctor/routing/diffcheck, same-current-agent EVALUATOR exact semantic SHA pass, canonical verify/meaningful finish, whole parent Findings append and clean main. Full native/core/UI/list/table stays unverified ACTIVE; conscious IO deviations unchanged.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert this leaf semantic commit; preserve prior verified task evidence and registered IO policies.

## Findings

Preflight direct main clean at ef4f6805b717cf3883b36c84ba91b8d597079e26. Previous goal turn169 is verified progress: native NONE ODT/UNO fix DONE. New read-only audit confirms blanket tr click treats td padding and list marker clicks as full-row selection. Pinned SwEditWin enhanced table selection is gated through SwFEShell WhichMouseTabCol/GetBox edge hotspots; ordinary interior follows CallSetCursor. Current browser geometry only accepts ranges already inside a paragraph, leaving cell padding unresolved. Standing user authorization covers this bounded correction; full table/core/UI/list parity remains unverified.
