---
id: "202610051149-WY14DH"
title: "Own selected table text deletion in native edit-shell ranges"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 13
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
  - "upstream-parity"
  - "writer"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-05T11:56:18.075Z"
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
    body: "Start: implement native ring/section selected table deletion in core eddel, preserve table structure/history and existing deviations, then one upstream-absent full profile and failed/new-only closure."
events:
  -
    type: "status"
    at: "2026-10-05T11:50:26.534Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implement native ring/section selected table deletion in core eddel, preserve table structure/history and existing deviations, then one upstream-absent full profile and failed/new-only closure."
doc_version: 3
doc_updated_at: "2026-10-05T11:56:16.203Z"
doc_updated_by: "CODER"
description: "Move selection deletion from the single-cursor wrtsh editing helper into core eddel ownership; traverse native rings and partition ordinary flat-table cross-cell selections without joining boxes, preserve one history unit and native table-mode exit."
sections:
  Summary: "Own selected table text deletion in the native core edit-shell layer and remove single-cursor wrtsh selection deletion."
  Scope: |-
    apps/office/src/sw/source/core/edit/eddel.ts
    apps/office/src/sw/source/uibase/wrtsh/wrtsh-editing.ts
    apps/office/src/sw/source/uibase/wrtsh/wrtsh1.ts
    apps/office/src/sw/source/core/edit/eddel.test.ts
    apps/office/src/sw/source/uibase/wrtsh/native-table-delete.test.ts
    apps/office/src/sw/browser/editor/native-table-delete.test.tsx
    apps/office/e2e/writer-native-table-delete.spec.ts
    docs/program/source-provenance.json
    docs/program/parity/runtime-inventory.json
  Plan: "Iteration149 atomic CODER leaf under standing upstream UI/refactoring authorization. Add core/edit/eddel.ts owning selection-aware delete construction from pinned SwEditShell::Delete/DeleteSel: traverse actual SwPaM rings, use native temporary PaMs for same-flat-table cross-cell sections, never join different boxes; retain same-node and normalized ordinary cross-paragraph behavior using existing SwUndoDelete/SwHistory and Sfx list history. Remove private wrtsh DeleteCrossParagraphSelection and single-owner selection action construction; existing editing port only invokes core owner. Table-mode Delete/Backspace/selection-cut clears table selection, leaves native caret at surviving displayed cell, handles empty selected cells without content history. Complete full-cell multi-paragraph deletion, partial cross-cell ranges, rectangle holes/unselected neighbors, one Undo unit, native Undo/Redo cursor/painting/continued input and ODT serialization. No UI TextRuns edits/new display adapter. Scope: apps/office/src/sw/source/core/edit/eddel.ts, apps/office/src/sw/source/uibase/wrtsh/wrtsh-editing.ts, apps/office/src/sw/source/core/edit/eddel.test.ts, apps/office/src/sw/source/uibase/wrtsh/native-table-delete.test.ts, apps/office/src/sw/browser/editor/native-table-delete.test.tsx, apps/office/e2e/writer-native-table-delete.spec.ts, docs/program/source-provenance.json, docs/program/parity/runtime-inventory.json. Existing246semantic states/defaults/classifications and conscious I/O/recovery deviations unchanged; register one additional eddel module as unverified native mechanism with bounded evidence, not whole-module promotion. Prior tests unchanged unless a concrete failed expectation contradicts pinned source and scope/plan is explicitly revised before correction. Text insertion/replacement/paste across rings, full native history recreated boundary identity, nested/merged/protected/redline/layout/select-all structural behavior remain separate. No AP sources/helpers/Python/native probes/raw diagnostics; no network/outside/subagents. Refinement before validation: existing SwHistory entries store native numeric node indices; multi-range history must be constructed sequentially after earlier DeleteAndJoin mutations, not eagerly before them. Use the existing initial-execute-versus-redo operation pattern (edfcol) and extend the existing wrtsh editing applyAction callback to forward actual undo context; no new UI/context getter adapter. Add wrtsh1.ts to scoped paths."
  Verify Steps: |-
    1. Six statics first: npm run format:check; npm run lint; npm run typecheck; npm run check:dependencies; npm run check:docs; npm run check:file-size. Changed-file checks after fixes only.
    2. ONE sequential full upstream-absent profile: npm run test:static; npm run test:coverage --workspace @vite-office/office -- --coverage.reportOnFailure; npm run test:inventory:coverage -- --coverage.reportOnFailure; npm exec -- vitest run scripts/check-source-provenance.test.ts scripts/writer-ui-resource-model.test.ts; npm exec -- playwright test --config apps/office/playwright.config.ts. Rename vendor inside repo and restore in finally; no upstream access/execution by tests. Persist exact failed/error names before assertions. Only failed gates/cases and genuinely new unexecuted cases repeat; no passing full/static/build/suite/case replay; actual maps ignored appcache only.
    3. Native/core cases prove actual ring ownership, DeleteSel marked/nonempty ranges and table section partitions, full multi-paragraph selected boxes and partial cross-cell spans, untouched table/row/column/box identities and neighbors, empty selected cells, normalization/direction and one history unit with repeated Undo/Redo, hints/direct paragraph/list items, native caret/table-mode exit/reconstruction and continued insertion/ODT serialization. Mounted and Chromium actual Delete/Backspace routes prove DOM rendering/selection paint/history/continued input. Existing tests byte-identical unless separately source-confirmed correction approved and recorded.
    4. Restore vendor before five audits: writer resource generation --check, source-tree, source-provenance, inventory invariants and parity; repeat failed audits only. Preserve all246existing semantic states/defaults/classifications/exceptions and register new native eddel module unverified with precise local/upstream/test references. Scope/old-test/changed-file/AP artifact checks, exact-SHA same-agent EVALUATOR phase before quality report, recorded verification and canonical finish, parent progress checkpoint; clean final tracked state. Broad goal remains active.
  Verification: "Pending authorized implementation and deterministic validation."
  Rollback Plan: "Revert the task semantic commit using a new in-scope task; preserve history and registered conscious deviations."
  Findings: "Read-only preflight: clean main at 3ba3b1f0c4b174354af74199e993a70a0e0d84cd; direct workflow, previous iteration148 verified progress, parent only active. Native eddel.cxx Delete loops GetRingContainer with grouped history; DeleteSel uses temporary section ranges and DeleteAndJoin without crossing boxes. Current wrtsh helper deletes only first ring cursor. Pinned references read in place only."
id_source: "generated"
---
## Summary

Own selected table text deletion in the native core edit-shell layer and remove single-cursor wrtsh selection deletion.

## Scope

apps/office/src/sw/source/core/edit/eddel.ts
apps/office/src/sw/source/uibase/wrtsh/wrtsh-editing.ts
apps/office/src/sw/source/uibase/wrtsh/wrtsh1.ts
apps/office/src/sw/source/core/edit/eddel.test.ts
apps/office/src/sw/source/uibase/wrtsh/native-table-delete.test.ts
apps/office/src/sw/browser/editor/native-table-delete.test.tsx
apps/office/e2e/writer-native-table-delete.spec.ts
docs/program/source-provenance.json
docs/program/parity/runtime-inventory.json

## Plan

Iteration149 atomic CODER leaf under standing upstream UI/refactoring authorization. Add core/edit/eddel.ts owning selection-aware delete construction from pinned SwEditShell::Delete/DeleteSel: traverse actual SwPaM rings, use native temporary PaMs for same-flat-table cross-cell sections, never join different boxes; retain same-node and normalized ordinary cross-paragraph behavior using existing SwUndoDelete/SwHistory and Sfx list history. Remove private wrtsh DeleteCrossParagraphSelection and single-owner selection action construction; existing editing port only invokes core owner. Table-mode Delete/Backspace/selection-cut clears table selection, leaves native caret at surviving displayed cell, handles empty selected cells without content history. Complete full-cell multi-paragraph deletion, partial cross-cell ranges, rectangle holes/unselected neighbors, one Undo unit, native Undo/Redo cursor/painting/continued input and ODT serialization. No UI TextRuns edits/new display adapter. Scope: apps/office/src/sw/source/core/edit/eddel.ts, apps/office/src/sw/source/uibase/wrtsh/wrtsh-editing.ts, apps/office/src/sw/source/core/edit/eddel.test.ts, apps/office/src/sw/source/uibase/wrtsh/native-table-delete.test.ts, apps/office/src/sw/browser/editor/native-table-delete.test.tsx, apps/office/e2e/writer-native-table-delete.spec.ts, docs/program/source-provenance.json, docs/program/parity/runtime-inventory.json. Existing246semantic states/defaults/classifications and conscious I/O/recovery deviations unchanged; register one additional eddel module as unverified native mechanism with bounded evidence, not whole-module promotion. Prior tests unchanged unless a concrete failed expectation contradicts pinned source and scope/plan is explicitly revised before correction. Text insertion/replacement/paste across rings, full native history recreated boundary identity, nested/merged/protected/redline/layout/select-all structural behavior remain separate. No AP sources/helpers/Python/native probes/raw diagnostics; no network/outside/subagents. Refinement before validation: existing SwHistory entries store native numeric node indices; multi-range history must be constructed sequentially after earlier DeleteAndJoin mutations, not eagerly before them. Use the existing initial-execute-versus-redo operation pattern (edfcol) and extend the existing wrtsh editing applyAction callback to forward actual undo context; no new UI/context getter adapter. Add wrtsh1.ts to scoped paths.

## Verify Steps

1. Six statics first: npm run format:check; npm run lint; npm run typecheck; npm run check:dependencies; npm run check:docs; npm run check:file-size. Changed-file checks after fixes only.
2. ONE sequential full upstream-absent profile: npm run test:static; npm run test:coverage --workspace @vite-office/office -- --coverage.reportOnFailure; npm run test:inventory:coverage -- --coverage.reportOnFailure; npm exec -- vitest run scripts/check-source-provenance.test.ts scripts/writer-ui-resource-model.test.ts; npm exec -- playwright test --config apps/office/playwright.config.ts. Rename vendor inside repo and restore in finally; no upstream access/execution by tests. Persist exact failed/error names before assertions. Only failed gates/cases and genuinely new unexecuted cases repeat; no passing full/static/build/suite/case replay; actual maps ignored appcache only.
3. Native/core cases prove actual ring ownership, DeleteSel marked/nonempty ranges and table section partitions, full multi-paragraph selected boxes and partial cross-cell spans, untouched table/row/column/box identities and neighbors, empty selected cells, normalization/direction and one history unit with repeated Undo/Redo, hints/direct paragraph/list items, native caret/table-mode exit/reconstruction and continued insertion/ODT serialization. Mounted and Chromium actual Delete/Backspace routes prove DOM rendering/selection paint/history/continued input. Existing tests byte-identical unless separately source-confirmed correction approved and recorded.
4. Restore vendor before five audits: writer resource generation --check, source-tree, source-provenance, inventory invariants and parity; repeat failed audits only. Preserve all246existing semantic states/defaults/classifications/exceptions and register new native eddel module unverified with precise local/upstream/test references. Scope/old-test/changed-file/AP artifact checks, exact-SHA same-agent EVALUATOR phase before quality report, recorded verification and canonical finish, parent progress checkpoint; clean final tracked state. Broad goal remains active.

## Verification

Pending authorized implementation and deterministic validation.

## Rollback Plan

Revert the task semantic commit using a new in-scope task; preserve history and registered conscious deviations.

## Findings

Read-only preflight: clean main at 3ba3b1f0c4b174354af74199e993a70a0e0d84cd; direct workflow, previous iteration148 verified progress, parent only active. Native eddel.cxx Delete loops GetRingContainer with grouped history; DeleteSel uses temporary section ranges and DeleteAndJoin without crossing boxes. Current wrtsh helper deletes only first ring cursor. Pinned references read in place only.
