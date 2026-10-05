---
id: "202610051420-T1QNV8"
title: "Move inserted table content into native undo storage only during Undo"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 11
origin:
  system: "manual"
depends_on:
  - "202610051334-PY9DJV"
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-05T14:22:06.463Z"
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
    body: "Start: Port native numeric range and removed-content undo storage lifecycle for represented table plain imports."
events:
  -
    type: "status"
    at: "2026-10-05T14:22:07.674Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: Port native numeric range and removed-content undo storage lifecycle for represented table plain imports."
doc_version: 3
doc_updated_at: "2026-10-05T14:22:07.674Z"
doc_updated_by: "CODER"
description: "Iteration152: replace eager plain table import snapshots/retained live nodes with native SwUndRng coordinates and SwUndoSaveContent move lifecycle; record native range in SetInsertRange, cut/detach into storage during Undo, consume/reconnect and release storage during Redo. Preserve current table UI behavior, old content/list/format/selection and registered I/O exceptions."
sections:
  Summary: "Move represented plain selected-table insertion content into native undo storage only when Undo removes it, and consume it on Redo instead of retaining snapshots and live node references at read completion."
  Scope: |-
    apps/office/src/sw/source/core/undo/undobj.ts
    apps/office/src/sw/source/core/undo/untblk.ts
    apps/office/src/sw/source/core/undo/native-insert-storage.test.ts
    apps/office/src/sw/source/uibase/wrtsh/native-table-plain-paste.test.ts
    docs/program/source-provenance.json
    docs/program/parity/runtime-inventory.json
    Exactly two prior151storage count assertions may change; all prior semantic states/defaults/classifications/conscious exceptions preserved. Parent goal C9TN6M remains active.
  Plan: "Iteration152 atomic native document-read undo content lifecycle. Add native SwUndRng numeric start/end coordinates with native unmarked sentinel/defaults, SetValues and SetPaM; add SwUndoSaveContent native append-only MoveToUndoNds/MoveFromUndoNds responsibility in existing undobj owner. SwUndoInserts uses these native facets (composition expresses native multiple bases) and existing SwHistory: SetInsertRange validates represented section and records coordinates only, no retained snapshots/live nodes; Undo resolves current absolute native indices, cuts actual inserted boundary text/hints and detaches actual added paragraphs into undo storage, then restores original item/hint/collection history; Redo consumes retained native content back into live section and releases storage. GetPayloadSize counts original history and actual disconnected storage only, never duplicates live document payload. Dispose drops only retained removed content; repeated range recording before Undo is allocation-free. SwUndoNodes Map remains existing portable storage boundary, complete physical native SwNodes undo array and nonend/suffix/fly/redline/index ownership unverified. Scope6paths:apps/office/src/sw/source/core/undo/undobj.ts, apps/office/src/sw/source/core/undo/untblk.ts, apps/office/src/sw/source/core/undo/native-insert-storage.test.ts, apps/office/src/sw/source/uibase/wrtsh/native-table-plain-paste.test.ts, docs/program/source-provenance.json, docs/program/parity/runtime-inventory.json. Add source-independent tests for initial0storage, numeric coordinate resolution, repeated Undo/Redo0live/retained-only undo, blank and single-line/multiline cell insertion, editing inserted content then Undo ordered actions and native re-capture, disposal while applied/undone, redo discard, range/move guards and flags. Correct exactly two source-confirmed storage assertions in prior151test from eager9/4 to0 after paste; preserve every other old assertion and test file. Additive provenance/evidence/local-native symbol contracts only for existing undobj/untblk; preserve all250 module states/statuses/classifications/defaults/conscious exceptions and prior evidence. Six statics first, ONE full absent profile and only failed/new closure. No network/outside/global/subagents/AP sources/helpers/Python/probes/raw diagnostics; ignored appcache maps only. User standing explicit UI/refactoring authorization applies."
  Verify Steps: |-
    1. Six statics first: npm run format:check; npm run lint; npm run typecheck; npm run check:dependencies; npm run check:docs; npm run check:file-size. After correction changed-file checks only.
    2. ONE sequential upstream-absent full profile: npm run test:static; npm run test:coverage --workspace @vite-office/office -- --coverage.reportOnFailure; npm run test:inventory:coverage -- --coverage.reportOnFailure; npm exec -- vitest run scripts/check-source-provenance.test.ts scripts/writer-ui-resource-model.test.ts; npm exec -- playwright test --config apps/office/playwright.config.ts. Rename vendor inside repository and restore in finally. Persist exact failure/error names before assertions, use skipped Vitest status, no tests access or invoke upstream. Repeat only failed gates/cases and genuinely new cases; never passing full/build/suite/case replay. Actual initial maps ignored appcache only.
    3. Source-independent new native tests prove SetInsertRange allocation-free numeric range ownership; native Undo cut/detach to storage and Redo consume/reconnect/release, applied0storage/undone removed-only payload, blank and text imports, actual node/list/format identities, repeated history navigation, disposal and redo discard, ordered later edit cancellation and re-capture, native source guard/default contracts. Existing mounted/Chromium selected-table clipboard flows remain unchanged. Exactly two prior151storage expected counts9and4 become0 based on native source; all other404prior test files/assertions byte-identical. No whole-module promotion.
    4. Restore vendor before five source audits: writer resource generation --check, source-tree, source-provenance, inventory invariants and parity. Preserve all250 prior module statuses/defaults/classifications and all prior evidence, additive native facet symbols/evidence only for two owners. Scope/test correction/AP scan, exact-SHA same-agent EVALUATOR review, recorded verification/canonical finish/parent checkpoint; clean final tracked state. Broad goal stays active.
  Verification: "Pending declared checks. No whole-module or broad parity completion claim."
  Rollback Plan: "Use a new task and revert only this leaf semantic commit if native lifetime regression is demonstrated; preserve task evidence and unrelated work, no history rewrite."
  Findings: "Source read in place: native untblk.cxx SetInsertRange118 records coordinates, UndoImpl318 MoveToUndoNds, RedoImpl404 detaches undo index before MoveFromUndoNds. Native undobj.cxx SwUndRng45-100 stores absolute coordinates; MoveToUndoNds787 moves from document into undo nodes, MoveFromUndoNds823 moves back and deletes remnants. Current eager RetainText/RetainNode in SetInsertRange duplicates live ownership; this leaf removes it. Native source comments explicitly resolve numeric indices rather than verifying original node identities. Full native structural/non-end/redline/fly/lifetime contracts unverified."
id_source: "generated"
---
## Summary

Move represented plain selected-table insertion content into native undo storage only when Undo removes it, and consume it on Redo instead of retaining snapshots and live node references at read completion.

## Scope

apps/office/src/sw/source/core/undo/undobj.ts
apps/office/src/sw/source/core/undo/untblk.ts
apps/office/src/sw/source/core/undo/native-insert-storage.test.ts
apps/office/src/sw/source/uibase/wrtsh/native-table-plain-paste.test.ts
docs/program/source-provenance.json
docs/program/parity/runtime-inventory.json
Exactly two prior151storage count assertions may change; all prior semantic states/defaults/classifications/conscious exceptions preserved. Parent goal C9TN6M remains active.

## Plan

Iteration152 atomic native document-read undo content lifecycle. Add native SwUndRng numeric start/end coordinates with native unmarked sentinel/defaults, SetValues and SetPaM; add SwUndoSaveContent native append-only MoveToUndoNds/MoveFromUndoNds responsibility in existing undobj owner. SwUndoInserts uses these native facets (composition expresses native multiple bases) and existing SwHistory: SetInsertRange validates represented section and records coordinates only, no retained snapshots/live nodes; Undo resolves current absolute native indices, cuts actual inserted boundary text/hints and detaches actual added paragraphs into undo storage, then restores original item/hint/collection history; Redo consumes retained native content back into live section and releases storage. GetPayloadSize counts original history and actual disconnected storage only, never duplicates live document payload. Dispose drops only retained removed content; repeated range recording before Undo is allocation-free. SwUndoNodes Map remains existing portable storage boundary, complete physical native SwNodes undo array and nonend/suffix/fly/redline/index ownership unverified. Scope6paths:apps/office/src/sw/source/core/undo/undobj.ts, apps/office/src/sw/source/core/undo/untblk.ts, apps/office/src/sw/source/core/undo/native-insert-storage.test.ts, apps/office/src/sw/source/uibase/wrtsh/native-table-plain-paste.test.ts, docs/program/source-provenance.json, docs/program/parity/runtime-inventory.json. Add source-independent tests for initial0storage, numeric coordinate resolution, repeated Undo/Redo0live/retained-only undo, blank and single-line/multiline cell insertion, editing inserted content then Undo ordered actions and native re-capture, disposal while applied/undone, redo discard, range/move guards and flags. Correct exactly two source-confirmed storage assertions in prior151test from eager9/4 to0 after paste; preserve every other old assertion and test file. Additive provenance/evidence/local-native symbol contracts only for existing undobj/untblk; preserve all250 module states/statuses/classifications/defaults/conscious exceptions and prior evidence. Six statics first, ONE full absent profile and only failed/new closure. No network/outside/global/subagents/AP sources/helpers/Python/probes/raw diagnostics; ignored appcache maps only. User standing explicit UI/refactoring authorization applies.

## Verify Steps

1. Six statics first: npm run format:check; npm run lint; npm run typecheck; npm run check:dependencies; npm run check:docs; npm run check:file-size. After correction changed-file checks only.
2. ONE sequential upstream-absent full profile: npm run test:static; npm run test:coverage --workspace @vite-office/office -- --coverage.reportOnFailure; npm run test:inventory:coverage -- --coverage.reportOnFailure; npm exec -- vitest run scripts/check-source-provenance.test.ts scripts/writer-ui-resource-model.test.ts; npm exec -- playwright test --config apps/office/playwright.config.ts. Rename vendor inside repository and restore in finally. Persist exact failure/error names before assertions, use skipped Vitest status, no tests access or invoke upstream. Repeat only failed gates/cases and genuinely new cases; never passing full/build/suite/case replay. Actual initial maps ignored appcache only.
3. Source-independent new native tests prove SetInsertRange allocation-free numeric range ownership; native Undo cut/detach to storage and Redo consume/reconnect/release, applied0storage/undone removed-only payload, blank and text imports, actual node/list/format identities, repeated history navigation, disposal and redo discard, ordered later edit cancellation and re-capture, native source guard/default contracts. Existing mounted/Chromium selected-table clipboard flows remain unchanged. Exactly two prior151storage expected counts9and4 become0 based on native source; all other404prior test files/assertions byte-identical. No whole-module promotion.
4. Restore vendor before five source audits: writer resource generation --check, source-tree, source-provenance, inventory invariants and parity. Preserve all250 prior module statuses/defaults/classifications and all prior evidence, additive native facet symbols/evidence only for two owners. Scope/test correction/AP scan, exact-SHA same-agent EVALUATOR review, recorded verification/canonical finish/parent checkpoint; clean final tracked state. Broad goal stays active.

## Verification

Pending declared checks. No whole-module or broad parity completion claim.

## Rollback Plan

Use a new task and revert only this leaf semantic commit if native lifetime regression is demonstrated; preserve task evidence and unrelated work, no history rewrite.

## Findings

Source read in place: native untblk.cxx SetInsertRange118 records coordinates, UndoImpl318 MoveToUndoNds, RedoImpl404 detaches undo index before MoveFromUndoNds. Native undobj.cxx SwUndRng45-100 stores absolute coordinates; MoveToUndoNds787 moves from document into undo nodes, MoveFromUndoNds823 moves back and deletes remnants. Current eager RetainText/RetainNode in SetInsertRange duplicates live ownership; this leaf removes it. Native source comments explicitly resolve numeric indices rather than verifying original node identities. Full native structural/non-end/redline/fly/lifetime contracts unverified.
