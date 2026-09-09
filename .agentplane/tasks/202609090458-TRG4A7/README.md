---
id: "202609090458-TRG4A7"
title: "Fix Writer contenteditable crash and typing stalls"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 8
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-09-09T04:59:13.497Z"
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
    body: "Start: fix browser-owned editable DOM reconciliation and implement LibreOffice-aligned typing undo grouping with focused regression coverage."
events:
  -
    type: "status"
    at: "2026-09-09T04:59:28.677Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: fix browser-owned editable DOM reconciliation and implement LibreOffice-aligned typing undo grouping with focused regression coverage."
doc_version: 3
doc_updated_at: "2026-09-09T05:33:59.150Z"
doc_updated_by: "CODER"
description: "Eliminate intermittent Writer tab hangs and React removeChild NotFoundError during text input/deletion. Preserve implementation proximity to pinned upstream LibreOffice, including typing undo grouping semantics."
sections:
  Summary: |-
    Fix Writer contenteditable crash and typing stalls

    Eliminate intermittent Writer tab hangs and React removeChild NotFoundError during text input/deletion. Preserve implementation proximity to pinned upstream LibreOffice, including typing undo grouping semantics.
  Scope: |-
    - In scope: Eliminate intermittent Writer tab hangs and React removeChild NotFoundError during text input/deletion. Preserve implementation proximity to pinned upstream LibreOffice, including typing undo grouping semantics.
    - Out of scope: unrelated refactors not required for "Fix Writer contenteditable crash and typing stalls".
  Plan: "1. Inspect pinned upstream LibreOffice text editing and undo-manager paths that govern typing grouping, deletion, and document mutation. 2. Add regression coverage for browser-mutated formatted contenteditable deletion and bounded/coalesced typing history. 3. Refactor the editable paragraph DOM boundary so React does not reconcile descendants mutated by the browser while preserving semantic formatting and caret behavior. 4. Implement LO-aligned typing undo grouping and a defensible memory bound without changing non-typing transaction semantics. 5. Run focused unit/component/E2E checks plus repository policy validation."
  Verify Steps: |-
    - Run the focused Writer editable-view test suite and confirm deletion inside formatted content no longer throws a DOM NotFoundError.
    - Run transaction-history and Writer workbench tests covering typing coalescence, undo boundaries, redo truncation, formatting, caret restoration, and long input.
    - Run the relevant Writer browser E2E scenario in Chromium for native input/deletion.
    - Run the office typecheck/test checks selected by the repository package scripts.
    - Run ap doctor and node .agentplane/policy/check-routing.mjs.
  Verification: |-
    - Command: npm run test:coverage --workspace @vite-office/office
      Result: pass
      Evidence: 42 files, 168 tests passed; statements/branches/functions/lines all 100%.
      Scope: Writer DOM integration, history manager, core model, commands, and component regressions.
    - Command: npm run test:inventory:coverage
      Result: pass
      Evidence: 30 files, 74 tests passed; all coverage dimensions 100%.
      Scope: pinned LibreOffice parity markers and inventory contracts.
    - Command: npm run build --workspace @vite-office/office && npx playwright test --config apps/office/playwright.config.ts --workers=1
      Result: pass
      Evidence: production build succeeded; all 8 Chromium E2E tests passed with no pageerror in the formatted native-deletion regression.
      Scope: production React bundle, native contenteditable deletion/input, clipboard, selection, lists, and ODT flows.
    - Command: npm run lint && npm run typecheck && npm run check:docs && npm run check:file-size && npm run check:source-provenance && npm run check:source-tree
      Result: pass
      Evidence: lint, TypeScript, JSDoc, file budget, provenance, and source-tree checks passed.
      Scope: repository static quality and upstream mapping.
    - Command: npx playwright test --config apps/office/playwright.config.ts apps/office/e2e/writer-document-selection.spec.ts --repeat-each=5 --workers=1
      Result: pass
      Evidence: existing pointer-drag selection scenario passed 5/5. A parallel npm run verify attempt intermittently observed its known element-offset race; the task crash regression passed in parallel and all deterministic E2E checks passed.
      Scope: residual E2E concurrency observation, outside the text input/deletion crash behavior.
  Rollback Plan: |-
    - Revert task-related commit(s).
    - Re-run required checks to confirm rollback safety.
  Findings: |-
    - Observation: React rendered descendants inside a native contenteditable host, so browser deletion could detach a formatted node before React reconciliation and trigger removeChild NotFoundError.
      Impact: Uncaught commit-phase errors could leave Writer unresponsive or crash the browser tab during intermittent input and deletion sequences.
      Resolution: Keep the editing host in React but project canonical Writer runs into a DOM-only child boundary during layout, replacing descendants only when canonical markup differs.

    - Observation: The browser adapter appended a complete SwDoc snapshot for every character with no action limit.
      Impact: Typing retained unbounded full document graphs and diverged from LibreOffice SwUndoInsert/SwUndoDelete grouping, increasing latency and memory until the tab could stall.
      Resolution: Mirror upstream CanGrouping position/direction/character-class boundaries and the SfxUndoManager default maximum of twenty undo actions while retaining immutable browser snapshots.
id_source: "generated"
---
## Summary

Fix Writer contenteditable crash and typing stalls

Eliminate intermittent Writer tab hangs and React removeChild NotFoundError during text input/deletion. Preserve implementation proximity to pinned upstream LibreOffice, including typing undo grouping semantics.

## Scope

- In scope: Eliminate intermittent Writer tab hangs and React removeChild NotFoundError during text input/deletion. Preserve implementation proximity to pinned upstream LibreOffice, including typing undo grouping semantics.
- Out of scope: unrelated refactors not required for "Fix Writer contenteditable crash and typing stalls".

## Plan

1. Inspect pinned upstream LibreOffice text editing and undo-manager paths that govern typing grouping, deletion, and document mutation. 2. Add regression coverage for browser-mutated formatted contenteditable deletion and bounded/coalesced typing history. 3. Refactor the editable paragraph DOM boundary so React does not reconcile descendants mutated by the browser while preserving semantic formatting and caret behavior. 4. Implement LO-aligned typing undo grouping and a defensible memory bound without changing non-typing transaction semantics. 5. Run focused unit/component/E2E checks plus repository policy validation.

## Verify Steps

- Run the focused Writer editable-view test suite and confirm deletion inside formatted content no longer throws a DOM NotFoundError.
- Run transaction-history and Writer workbench tests covering typing coalescence, undo boundaries, redo truncation, formatting, caret restoration, and long input.
- Run the relevant Writer browser E2E scenario in Chromium for native input/deletion.
- Run the office typecheck/test checks selected by the repository package scripts.
- Run ap doctor and node .agentplane/policy/check-routing.mjs.

## Verification

- Command: npm run test:coverage --workspace @vite-office/office
  Result: pass
  Evidence: 42 files, 168 tests passed; statements/branches/functions/lines all 100%.
  Scope: Writer DOM integration, history manager, core model, commands, and component regressions.
- Command: npm run test:inventory:coverage
  Result: pass
  Evidence: 30 files, 74 tests passed; all coverage dimensions 100%.
  Scope: pinned LibreOffice parity markers and inventory contracts.
- Command: npm run build --workspace @vite-office/office && npx playwright test --config apps/office/playwright.config.ts --workers=1
  Result: pass
  Evidence: production build succeeded; all 8 Chromium E2E tests passed with no pageerror in the formatted native-deletion regression.
  Scope: production React bundle, native contenteditable deletion/input, clipboard, selection, lists, and ODT flows.
- Command: npm run lint && npm run typecheck && npm run check:docs && npm run check:file-size && npm run check:source-provenance && npm run check:source-tree
  Result: pass
  Evidence: lint, TypeScript, JSDoc, file budget, provenance, and source-tree checks passed.
  Scope: repository static quality and upstream mapping.
- Command: npx playwright test --config apps/office/playwright.config.ts apps/office/e2e/writer-document-selection.spec.ts --repeat-each=5 --workers=1
  Result: pass
  Evidence: existing pointer-drag selection scenario passed 5/5. A parallel npm run verify attempt intermittently observed its known element-offset race; the task crash regression passed in parallel and all deterministic E2E checks passed.
  Scope: residual E2E concurrency observation, outside the text input/deletion crash behavior.

## Rollback Plan

- Revert task-related commit(s).
- Re-run required checks to confirm rollback safety.

## Findings

- Observation: React rendered descendants inside a native contenteditable host, so browser deletion could detach a formatted node before React reconciliation and trigger removeChild NotFoundError.
  Impact: Uncaught commit-phase errors could leave Writer unresponsive or crash the browser tab during intermittent input and deletion sequences.
  Resolution: Keep the editing host in React but project canonical Writer runs into a DOM-only child boundary during layout, replacing descendants only when canonical markup differs.

- Observation: The browser adapter appended a complete SwDoc snapshot for every character with no action limit.
  Impact: Typing retained unbounded full document graphs and diverged from LibreOffice SwUndoInsert/SwUndoDelete grouping, increasing latency and memory until the tab could stall.
  Resolution: Mirror upstream CanGrouping position/direction/character-class boundaries and the SfxUndoManager default maximum of twenty undo actions while retaining immutable browser snapshots.
