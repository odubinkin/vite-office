---
id: "202610051307-EA01RS"
title: "Read single-paragraph clipboard fragments through native table cursor rings"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 5
origin:
  system: "manual"
depends_on: []
tags:
  - "clipboard"
  - "table"
  - "upstream"
  - "writer"
task_kind: "code"
mutation_scope: "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-05T13:07:52.332Z"
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
    body: "Start: Implement approved native single-paragraph table clipboard ring read and source-independent coverage."
events:
  -
    type: "status"
    at: "2026-10-05T13:07:54.095Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: Implement approved native single-paragraph table clipboard ring read and source-independent coverage."
doc_version: 3
doc_updated_at: "2026-10-05T13:07:54.095Z"
doc_updated_by: "CODER"
description: "Iteration150: route external single-paragraph table paste through native SwReader ring ownership, preserving existing cell content and one undo unit instead of deleting selected boxes and writing one cell. Parent 202609240501-C9TN6M; standing user UI/refactoring authorization. Leave multiline and structural clipboard behavior unverified."
sections:
  Summary: "Iteration150 atomic native single-paragraph table clipboard read. Add source-owned filter/basflt/shellio.ts creating one native Sfx list action from actual editing SwPaM ring point positions, independent SwUndoInsert fragment payloads, no selected-content deletion, no cell joins, no UI TextRuns editing or callback paste operations. SwWrtShell.PasteAtCursor dispatches only actual table mode plus one non-block paragraph with no list to this native read owner. Preserve native displayed table selection and adjust endpoint positions across inserted text; one Undo/Redo restores content and table selection. Keep the existing transfer parsing boundary and all other paste routes. Test noncontiguous selected columns, reverse endpoints, multiple paragraphs already in target cells, empty targets/empty transfer, formatted fragments, neighbor/table/box identities, repeated Undo/Redo, real DOM/Chromium paste and selection painting. Single-paragraph fragment transfer only: native ASCII default formatting/filter provenance, multiline/list/structural transfer and full reader import/SwUndoInsDoc lifetimes remain unverified. Scope seven paths: apps/office/src/sw/source/filter/basflt/shellio.ts, apps/office/src/sw/source/uibase/wrtsh/wrtsh1.ts, apps/office/src/sw/source/uibase/wrtsh/native-table-paste.test.ts, apps/office/src/sw/browser/editor/native-table-paste.test.tsx, apps/office/e2e/writer-native-table-paste.spec.ts, docs/program/source-provenance.json, docs/program/parity/runtime-inventory.json. Preserve all247 existing semantic statuses/contracts/defaults/classifications/exceptions, append new source-owned module as unverified; preserve existing tests byte-identical. Standing user authorization applies. No upstream copies/AP helpers/raw outputs/Python/probes/network/outside/subagents; one absent full profile only."
  Scope: |-
    apps/office/src/sw/source/filter/basflt/shellio.ts
    apps/office/src/sw/source/uibase/wrtsh/wrtsh1.ts
    apps/office/src/sw/source/uibase/wrtsh/native-table-paste.test.ts
    apps/office/src/sw/browser/editor/native-table-paste.test.tsx
    apps/office/e2e/writer-native-table-paste.spec.ts
    docs/program/source-provenance.json
    docs/program/parity/runtime-inventory.json
  Plan: "Iteration150 atomic native single-paragraph table clipboard read. Add source-owned filter/basflt/shellio.ts creating one native Sfx list action from actual editing SwPaM ring point positions, independent SwUndoInsert fragment payloads, no selected-content deletion, no cell joins, no UI TextRuns editing or callback paste operations. SwWrtShell.PasteAtCursor dispatches only actual table mode plus one non-block paragraph with no list to this native read owner. Preserve native displayed table selection and adjust endpoint positions across inserted text; one Undo/Redo restores content and table selection. Keep the existing transfer parsing boundary and all other paste routes. Test noncontiguous selected columns, reverse endpoints, multiple paragraphs already in target cells, empty targets/empty transfer, formatted fragments, neighbor/table/box identities, repeated Undo/Redo, real DOM/Chromium paste and selection painting. Single-paragraph fragment transfer only: native ASCII default formatting/filter provenance, multiline/list/structural transfer and full reader import/SwUndoInsDoc lifetimes remain unverified. Scope seven paths: apps/office/src/sw/source/filter/basflt/shellio.ts, apps/office/src/sw/source/uibase/wrtsh/wrtsh1.ts, apps/office/src/sw/source/uibase/wrtsh/native-table-paste.test.ts, apps/office/src/sw/browser/editor/native-table-paste.test.tsx, apps/office/e2e/writer-native-table-paste.spec.ts, docs/program/source-provenance.json, docs/program/parity/runtime-inventory.json. Preserve all247 existing semantic statuses/contracts/defaults/classifications/exceptions, append new source-owned module as unverified; preserve existing tests byte-identical. Standing user authorization applies. No upstream copies/AP helpers/raw outputs/Python/probes/network/outside/subagents; one absent full profile only."
  Verify Steps: |-
    1. Six statics first: npm run format:check; npm run lint; npm run typecheck; npm run check:dependencies; npm run check:docs; npm run check:file-size. Changed-file checks after fixes only.
    2. ONE sequential full upstream-absent profile: npm run test:static; npm run test:coverage --workspace @vite-office/office -- --coverage.reportOnFailure; npm run test:inventory:coverage -- --coverage.reportOnFailure; npm exec -- vitest run scripts/check-source-provenance.test.ts scripts/writer-ui-resource-model.test.ts; npm exec -- playwright test --config apps/office/playwright.config.ts. Rename vendor inside repo and restore in finally; no upstream access/execution by tests. Persist exact failed/error names before assertions. Only failed gates/cases and genuinely new unexecuted cases repeat; no passing full/static/build/suite/case replay; actual maps ignored appcache only.
    3. Source-independent tests prove native single-paragraph reader uses all actual table editing ring points without selected-content deletion or joining sections; single and noncontiguous/reverse selected cells, existing target paragraphs/empty cells, formatting, empty transfer, one grouped history with repeated Undo/Redo and preserved native table selection/DOM paint. Mounted and Chromium actual paste events exercise UI-to-native dispatch. All prior test files remain byte-identical.
    4. Restore vendor before five audits: writer resource generation --check, source-tree, source-provenance, inventory invariants and parity; repeat failed audits only. Preserve all247existing semantic states/defaults/classifications/exceptions and register new native single-paragraph reader module unverified with precise local/upstream/test references. Scope/old-test/changed-file/AP artifact checks, exact-SHA same-agent EVALUATOR phase before quality report, recorded verification and canonical finish, parent progress checkpoint; clean final tracked state. Broad goal remains active.
  Verification: "Pending declared gates."
  Rollback Plan: "Revert the scoped semantic commit without rewriting history; retain parent and task traceability."
  Findings: "Pinned in-place source: PasteData excludes table mode from selected-content deletion; PasteFileContent passes actual GetCursor ring into SwReader::Read, which invokes the reader once per point and groups document insertion history. MakeBoxSels owns start marks and last-paragraph end points. Full reader/filter formatting, multi-paragraph and structural clipboard behavior remain unverified. Existing task149 typing replacement already deletes all selected cells and inserts at the surviving displayed cell; do not reinterpret typing as external paste."
id_source: "generated"
---
## Summary

Iteration150 atomic native single-paragraph table clipboard read. Add source-owned filter/basflt/shellio.ts creating one native Sfx list action from actual editing SwPaM ring point positions, independent SwUndoInsert fragment payloads, no selected-content deletion, no cell joins, no UI TextRuns editing or callback paste operations. SwWrtShell.PasteAtCursor dispatches only actual table mode plus one non-block paragraph with no list to this native read owner. Preserve native displayed table selection and adjust endpoint positions across inserted text; one Undo/Redo restores content and table selection. Keep the existing transfer parsing boundary and all other paste routes. Test noncontiguous selected columns, reverse endpoints, multiple paragraphs already in target cells, empty targets/empty transfer, formatted fragments, neighbor/table/box identities, repeated Undo/Redo, real DOM/Chromium paste and selection painting. Single-paragraph fragment transfer only: native ASCII default formatting/filter provenance, multiline/list/structural transfer and full reader import/SwUndoInsDoc lifetimes remain unverified. Scope seven paths: apps/office/src/sw/source/filter/basflt/shellio.ts, apps/office/src/sw/source/uibase/wrtsh/wrtsh1.ts, apps/office/src/sw/source/uibase/wrtsh/native-table-paste.test.ts, apps/office/src/sw/browser/editor/native-table-paste.test.tsx, apps/office/e2e/writer-native-table-paste.spec.ts, docs/program/source-provenance.json, docs/program/parity/runtime-inventory.json. Preserve all247 existing semantic statuses/contracts/defaults/classifications/exceptions, append new source-owned module as unverified; preserve existing tests byte-identical. Standing user authorization applies. No upstream copies/AP helpers/raw outputs/Python/probes/network/outside/subagents; one absent full profile only.

## Scope

apps/office/src/sw/source/filter/basflt/shellio.ts
apps/office/src/sw/source/uibase/wrtsh/wrtsh1.ts
apps/office/src/sw/source/uibase/wrtsh/native-table-paste.test.ts
apps/office/src/sw/browser/editor/native-table-paste.test.tsx
apps/office/e2e/writer-native-table-paste.spec.ts
docs/program/source-provenance.json
docs/program/parity/runtime-inventory.json

## Plan

Iteration150 atomic native single-paragraph table clipboard read. Add source-owned filter/basflt/shellio.ts creating one native Sfx list action from actual editing SwPaM ring point positions, independent SwUndoInsert fragment payloads, no selected-content deletion, no cell joins, no UI TextRuns editing or callback paste operations. SwWrtShell.PasteAtCursor dispatches only actual table mode plus one non-block paragraph with no list to this native read owner. Preserve native displayed table selection and adjust endpoint positions across inserted text; one Undo/Redo restores content and table selection. Keep the existing transfer parsing boundary and all other paste routes. Test noncontiguous selected columns, reverse endpoints, multiple paragraphs already in target cells, empty targets/empty transfer, formatted fragments, neighbor/table/box identities, repeated Undo/Redo, real DOM/Chromium paste and selection painting. Single-paragraph fragment transfer only: native ASCII default formatting/filter provenance, multiline/list/structural transfer and full reader import/SwUndoInsDoc lifetimes remain unverified. Scope seven paths: apps/office/src/sw/source/filter/basflt/shellio.ts, apps/office/src/sw/source/uibase/wrtsh/wrtsh1.ts, apps/office/src/sw/source/uibase/wrtsh/native-table-paste.test.ts, apps/office/src/sw/browser/editor/native-table-paste.test.tsx, apps/office/e2e/writer-native-table-paste.spec.ts, docs/program/source-provenance.json, docs/program/parity/runtime-inventory.json. Preserve all247 existing semantic statuses/contracts/defaults/classifications/exceptions, append new source-owned module as unverified; preserve existing tests byte-identical. Standing user authorization applies. No upstream copies/AP helpers/raw outputs/Python/probes/network/outside/subagents; one absent full profile only.

## Verify Steps

1. Six statics first: npm run format:check; npm run lint; npm run typecheck; npm run check:dependencies; npm run check:docs; npm run check:file-size. Changed-file checks after fixes only.
2. ONE sequential full upstream-absent profile: npm run test:static; npm run test:coverage --workspace @vite-office/office -- --coverage.reportOnFailure; npm run test:inventory:coverage -- --coverage.reportOnFailure; npm exec -- vitest run scripts/check-source-provenance.test.ts scripts/writer-ui-resource-model.test.ts; npm exec -- playwright test --config apps/office/playwright.config.ts. Rename vendor inside repo and restore in finally; no upstream access/execution by tests. Persist exact failed/error names before assertions. Only failed gates/cases and genuinely new unexecuted cases repeat; no passing full/static/build/suite/case replay; actual maps ignored appcache only.
3. Source-independent tests prove native single-paragraph reader uses all actual table editing ring points without selected-content deletion or joining sections; single and noncontiguous/reverse selected cells, existing target paragraphs/empty cells, formatting, empty transfer, one grouped history with repeated Undo/Redo and preserved native table selection/DOM paint. Mounted and Chromium actual paste events exercise UI-to-native dispatch. All prior test files remain byte-identical.
4. Restore vendor before five audits: writer resource generation --check, source-tree, source-provenance, inventory invariants and parity; repeat failed audits only. Preserve all247existing semantic states/defaults/classifications/exceptions and register new native single-paragraph reader module unverified with precise local/upstream/test references. Scope/old-test/changed-file/AP artifact checks, exact-SHA same-agent EVALUATOR phase before quality report, recorded verification and canonical finish, parent progress checkpoint; clean final tracked state. Broad goal remains active.

## Verification

Pending declared gates.

## Rollback Plan

Revert the scoped semantic commit without rewriting history; retain parent and task traceability.

## Findings

Pinned in-place source: PasteData excludes table mode from selected-content deletion; PasteFileContent passes actual GetCursor ring into SwReader::Read, which invokes the reader once per point and groups document insertion history. MakeBoxSels owns start marks and last-paragraph end points. Full reader/filter formatting, multi-paragraph and structural clipboard behavior remain unverified. Existing task149 typing replacement already deletes all selected cells and inserts at the surviving displayed cell; do not reinterpret typing as external paste.
