---
id: "202610050013-PD1E0A"
title: "Restore owned native text insertion through typing and redo"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 8
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
task_kind: "code"
mutation_scope: "code"
verify:
  - "ap doctor"
  - "node .agentplane/policy/check-routing.mjs"
  - "npm exec -- playwright test --config apps/office/playwright.config.ts"
  - "npm exec -- tsx scripts/generate-writer-ui-resources.ts --check"
  - "npm exec -- vitest run scripts/check-source-provenance.test.ts scripts/writer-ui-resource-model.test.ts"
  - "npm run check:dependencies"
  - "npm run check:docs"
  - "npm run check:file-size"
  - "npm run check:source-provenance"
  - "npm run check:source-tree"
  - "npm run format:check"
  - "npm run inventory:invariants"
  - "npm run inventory:parity"
  - "npm run lint"
  - "npm run test:coverage --workspace @vite-office/office -- --coverage.reportOnFailure"
  - "npm run test:inventory:coverage -- --coverage.reportOnFailure"
  - "npm run test:static"
  - "npm run typecheck"
plan_approval:
  state: "approved"
  updated_at: "2026-10-05T00:18:13.136Z"
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
    body: "Start: Restore owned native collapsed typing and redo direction under standing goal authorization,retaining declared selection/flag gaps."
events:
  -
    type: "status"
    at: "2026-10-05T00:13:49.726Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: Restore owned native collapsed typing and redo direction under standing goal authorization,retaining declared selection/flag gaps."
doc_version: 3
doc_updated_at: "2026-10-05T00:18:12.681Z"
doc_updated_by: "CODER"
description: "Restore owned native ordinary text insertion through collapsed SwWrtShell input and SwUndoInsert redo. Explicit character-items-only node insertion must call existing native Update first,then replace only automatic-format portions over inserted text in the owned map,retaining actual internet attributes/items/backlinks/IDs/flags and native boundary eligibility instead of reconstructing inherited hyperlink DTOs. Explicit inserted hyperlink/fragment adapters retain their declared separate boundary. SwUndoInsert accepts a cloned optional pending character item set for native text mode;Redo validates connected node,uses InsertText and captures actual inserted fragment for bounded grouping/history payload. Keep legacy explicit-fragment construction available and prevent grouping incompatible insertion modes. Collapsed shell input supplies pending items;selection replacement retains its existing FORCE/EMPTY flag gap for a separate leaf. Add one source-independent test file:literal8flagmask/6boundary matrix through direct node and real shell,pending ownership/native IDs,actual Insert/Undo/Redo/grouping/live source item inheritance/composition/copy/Worker snapshots,zero update and mode guard. Preserve355 prior test files byte-identical unless a demonstrated native typing expectation requires an explicitly recorded correction;no weakened prior tests. Append bounded notes to four existing runtime/provenance rows only;240 prior module states/defaults/exceptions and I/O deviations retained,no new module/promotion. Six static gates then one sequential five-suite absent-reference profile,finally restore;repeat only failed gates/cases;five restored source audits afterward. Native hashes/exact scope/ignored-inclusive artifact audit,same-actor readonly exact-commit EVALUATOR,doctor/routing,recorded verification and canonical finish. Native full Insert flags,selection FORCE/EMPTY modes,empty hints,all families/BuildPortions/style clients/UNO/refcounts/full core/UI remain unverified. No network/global reads/saved helpers/native-source artifacts/native runtime invocation."
sections:
  Summary: "Restore native owned text insertion through collapsed typing and redo."
  Scope: |-
    - apps/office/src/sw/source/core/txtnode/ndtxt.ts
    - apps/office/src/sw/source/core/txtnode/ndhints.ts
    - apps/office/src/sw/source/core/undo/unins.ts
    - apps/office/src/sw/source/uibase/wrtsh/wrtsh-editing.ts
    - apps/office/src/sw/source/core/txtnode/ndhints-range.ts
    - apps/office/src/sw/source/uibase/wrtsh/native-typing-internet-ownership.test.ts
    - docs/program/source-provenance.json
    - docs/program/parity/runtime-inventory.json
  Plan: "Restore owned native ordinary text insertion through collapsed SwWrtShell input and SwUndoInsert redo. Explicit character-items-only node insertion must call existing native Update first,then replace only automatic-format portions over inserted text in the owned map,retaining actual internet attributes/items/backlinks/IDs/flags and native boundary eligibility instead of reconstructing inherited hyperlink DTOs. Explicit inserted hyperlink/fragment adapters retain their declared separate boundary. SwUndoInsert accepts a cloned optional pending character item set for native text mode;Redo validates connected node,uses InsertText and captures actual inserted fragment for bounded grouping/history payload. Keep legacy explicit-fragment construction available and prevent grouping incompatible insertion modes. Collapsed shell input supplies pending items;selection replacement retains its existing FORCE/EMPTY flag gap for a separate leaf. Add one source-independent test file:literal8flagmask/6boundary matrix through direct node and real shell,pending ownership/native IDs,actual Insert/Undo/Redo/grouping/live source item inheritance/composition/copy/Worker snapshots,zero update and mode guard. Preserve355 prior test files byte-identical unless a demonstrated native typing expectation requires an explicitly recorded correction;no weakened prior tests. Append bounded notes to four existing runtime/provenance rows only;240 prior module states/defaults/exceptions and I/O deviations retained,no new module/promotion. Six static gates then one sequential five-suite absent-reference profile,finally restore;repeat only failed gates/cases;five restored source audits afterward. Native hashes/exact scope/ignored-inclusive artifact audit,same-actor readonly exact-commit EVALUATOR,doctor/routing,recorded verification and canonical finish. Native full Insert flags,selection FORCE/EMPTY modes,empty hints,all families/BuildPortions/style clients/UNO/refcounts/full core/UI remain unverified. No network/global reads/saved helpers/native-source artifacts/native runtime invocation. Measured scope refinement:ndhints.ts would reach1010lines after the owned insertion overlay. Extract its existing generic clipHintOutsideRange unchanged into source-owned ndhints-range.ts,import it at existing callers;retain the1000-line gate. Register one responsibility-split and one whollyunverified runtime row;all240prior statuses/defaults/exceptions stay intact,current241. This necessary in-scope refactor is already authorized by the standing goal;no verification/risk/network drift."
  Verify Steps: |-
    - `npm run format:check`
    - `npm run lint`
    - `npm run typecheck`
    - `npm run check:dependencies`
    - `npm run check:docs`
    - `npm run check:file-size`
    - `npm run test:static`
    - `npm run test:coverage --workspace @vite-office/office -- --coverage.reportOnFailure`
    - `npm run test:inventory:coverage -- --coverage.reportOnFailure`
    - `npm exec -- vitest run scripts/check-source-provenance.test.ts scripts/writer-ui-resource-model.test.ts`
    - `npm exec -- playwright test --config apps/office/playwright.config.ts`
    - `npm exec -- tsx scripts/generate-writer-ui-resources.ts --check`
    - `npm run check:source-tree`
    - `npm run check:source-provenance`
    - `npm run inventory:invariants`
    - `npm run inventory:parity`
    - `ap doctor`
    - `node .agentplane/policy/check-routing.mjs`

    Static first;one sequential absent-reference profile;failed-only replays;restored source audits afterward.355 prior tests/240 runtime states preserved and exact native hashes recorded. No saved upstream sources or helpers in Agentplane.
  Verification: "Pending implementation and validation."
  Rollback Plan: "Revert semantic leaf commit without rewriting history."
  Findings: "Native wrtsh1.cxx Insert calls editsh.cxx Insert2 -> DocumentContentOperationsManager.cxx InsertString -> ndtxt.cxx InsertText/Update;native unins.cxx RedoImpl calls InsertText with retained text rather than replacement fragments. Current collapsed shell always builds a plain formatted fragment and SwUndoInsert replaces ranges,losing inherited internet values/IDs/continuous attribute identity. Node explicit character items also rebuild a hyperlink DTO through caret projection. Existing UpdateTextHints already implements bounded native AUTO/INET start/end/DontExpand eligibility and native pure erase direction. This leaf connects the actual typing direction to that owner and overlays only existing automatic items;selection force expansion and full flags remain a real follow-up. Pin26.8.0.2/9bc445578031fecf56086729d8e4940c77e14d65;standing goal authorizes local safe work."
id_source: "generated"
---
## Summary

Restore native owned text insertion through collapsed typing and redo.

## Scope

- apps/office/src/sw/source/core/txtnode/ndtxt.ts
- apps/office/src/sw/source/core/txtnode/ndhints.ts
- apps/office/src/sw/source/core/undo/unins.ts
- apps/office/src/sw/source/uibase/wrtsh/wrtsh-editing.ts
- apps/office/src/sw/source/core/txtnode/ndhints-range.ts
- apps/office/src/sw/source/uibase/wrtsh/native-typing-internet-ownership.test.ts
- docs/program/source-provenance.json
- docs/program/parity/runtime-inventory.json

## Plan

Restore owned native ordinary text insertion through collapsed SwWrtShell input and SwUndoInsert redo. Explicit character-items-only node insertion must call existing native Update first,then replace only automatic-format portions over inserted text in the owned map,retaining actual internet attributes/items/backlinks/IDs/flags and native boundary eligibility instead of reconstructing inherited hyperlink DTOs. Explicit inserted hyperlink/fragment adapters retain their declared separate boundary. SwUndoInsert accepts a cloned optional pending character item set for native text mode;Redo validates connected node,uses InsertText and captures actual inserted fragment for bounded grouping/history payload. Keep legacy explicit-fragment construction available and prevent grouping incompatible insertion modes. Collapsed shell input supplies pending items;selection replacement retains its existing FORCE/EMPTY flag gap for a separate leaf. Add one source-independent test file:literal8flagmask/6boundary matrix through direct node and real shell,pending ownership/native IDs,actual Insert/Undo/Redo/grouping/live source item inheritance/composition/copy/Worker snapshots,zero update and mode guard. Preserve355 prior test files byte-identical unless a demonstrated native typing expectation requires an explicitly recorded correction;no weakened prior tests. Append bounded notes to four existing runtime/provenance rows only;240 prior module states/defaults/exceptions and I/O deviations retained,no new module/promotion. Six static gates then one sequential five-suite absent-reference profile,finally restore;repeat only failed gates/cases;five restored source audits afterward. Native hashes/exact scope/ignored-inclusive artifact audit,same-actor readonly exact-commit EVALUATOR,doctor/routing,recorded verification and canonical finish. Native full Insert flags,selection FORCE/EMPTY modes,empty hints,all families/BuildPortions/style clients/UNO/refcounts/full core/UI remain unverified. No network/global reads/saved helpers/native-source artifacts/native runtime invocation. Measured scope refinement:ndhints.ts would reach1010lines after the owned insertion overlay. Extract its existing generic clipHintOutsideRange unchanged into source-owned ndhints-range.ts,import it at existing callers;retain the1000-line gate. Register one responsibility-split and one whollyunverified runtime row;all240prior statuses/defaults/exceptions stay intact,current241. This necessary in-scope refactor is already authorized by the standing goal;no verification/risk/network drift.

## Verify Steps

- `npm run format:check`
- `npm run lint`
- `npm run typecheck`
- `npm run check:dependencies`
- `npm run check:docs`
- `npm run check:file-size`
- `npm run test:static`
- `npm run test:coverage --workspace @vite-office/office -- --coverage.reportOnFailure`
- `npm run test:inventory:coverage -- --coverage.reportOnFailure`
- `npm exec -- vitest run scripts/check-source-provenance.test.ts scripts/writer-ui-resource-model.test.ts`
- `npm exec -- playwright test --config apps/office/playwright.config.ts`
- `npm exec -- tsx scripts/generate-writer-ui-resources.ts --check`
- `npm run check:source-tree`
- `npm run check:source-provenance`
- `npm run inventory:invariants`
- `npm run inventory:parity`
- `ap doctor`
- `node .agentplane/policy/check-routing.mjs`

Static first;one sequential absent-reference profile;failed-only replays;restored source audits afterward.355 prior tests/240 runtime states preserved and exact native hashes recorded. No saved upstream sources or helpers in Agentplane.

## Verification

Pending implementation and validation.

## Rollback Plan

Revert semantic leaf commit without rewriting history.

## Findings

Native wrtsh1.cxx Insert calls editsh.cxx Insert2 -> DocumentContentOperationsManager.cxx InsertString -> ndtxt.cxx InsertText/Update;native unins.cxx RedoImpl calls InsertText with retained text rather than replacement fragments. Current collapsed shell always builds a plain formatted fragment and SwUndoInsert replaces ranges,losing inherited internet values/IDs/continuous attribute identity. Node explicit character items also rebuild a hyperlink DTO through caret projection. Existing UpdateTextHints already implements bounded native AUTO/INET start/end/DontExpand eligibility and native pure erase direction. This leaf connects the actual typing direction to that owner and overlays only existing automatic items;selection force expansion and full flags remain a real follow-up. Pin26.8.0.2/9bc445578031fecf56086729d8e4940c77e14d65;standing goal authorizes local safe work.
