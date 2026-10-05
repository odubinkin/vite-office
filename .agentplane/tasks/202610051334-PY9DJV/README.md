---
id: "202610051334-PY9DJV"
title: "Read plain clipboard text into selected table sections with native document undo"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 8
origin:
  system: "manual"
depends_on: []
tags:
  - "clipboard"
  - "code"
  - "table"
  - "upstream"
  - "writer"
task_kind: "code"
mutation_scope: "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-05T14:04:58.318Z"
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
    body: "Start: Preserve plain clipboard format and implement native per-cell ASCII import with SwUndoInsDoc history."
  -
    author: "CODER"
    body: "Start: Source-confirmed empty/end split inheritance correction within approved plain table reader scope."
events:
  -
    type: "status"
    at: "2026-10-05T13:35:59.273Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: Preserve plain clipboard format and implement native per-cell ASCII import with SwUndoInsDoc history."
  -
    type: "status"
    at: "2026-10-05T14:05:33.081Z"
    author: "CODER"
    from: "DOING"
    to: "DOING"
    note: "Start: Source-confirmed empty/end split inheritance correction within approved plain table reader scope."
doc_version: 3
doc_updated_at: "2026-10-05T14:05:33.081Z"
doc_updated_by: "CODER"
description: "Iteration151 under parent 202609240501-C9TN6M: preserve plain clipboard format, read actual selected-cell cursor rings through native ASCII insertion/split ownership and SwUndoInsDoc range history; remove TextRuns/compound shell-command insertion from this path, including multiline and inherited formatting. Keep structural/rich transfer and consciously registered I/O/recovery deviations outside scope."
sections:
  Summary: "Iteration151 atomic external plain-text table clipboard native read. Preserve existing parser source as optional WriterTransferDocument source; SwTransferable detects plain text plus actual table mode before explicit fragment conversion, reconstructs normalized text at the boundary and delegates to SwWrtShell native plain read. Add ASCII parasc owner for LF/CRLF/CR normalization and native terminal newline omission, empty lines and representable control-character rules; use IDocumentContentOperations.InsertString native EMPTYEXPAND and SplitNode, preserving target hint/paragraph/list inheritance. Add bounded SwUndoInserts/SwUndoInsDoc owner in core/undo/untblk.ts for append-only selected-cell imports: capture original SwHistory items/collection at current native indices, SetInsertRange records inserted boundary fragment and actual new paragraph nodes in SwUndoNodes, Undo removes inserted nodes/text and restores original native history, Redo reconnects retained native content; no whole-document snapshots or shell command replay. Existing shellio loops actual native cell PaM points with sequential history capture and tracked display endpoint clones, grouped one undo action; standard existing initial-execute/redo pattern forwards actual undo context. Existing generic rich/body/list paste remains separate. SwWrtShell only forwards to native operation within986+small method lines; no new display/context adapter. Scope12paths: apps/office/src/sw/source/filter/ascii/parasc.ts, apps/office/src/sw/source/core/undo/untblk.ts, apps/office/src/sw/source/filter/basflt/shellio.ts, apps/office/src/sw/source/uibase/wrtsh/wrtsh1.ts, apps/office/src/sw/source/uibase/wrtsh/wrtsh-editing.ts, apps/office/src/sw/source/uibase/dochdl/swdtflvr.ts, apps/office/src/sw/browser/editor/writer-clipboard-events.ts, apps/office/src/sw/source/uibase/wrtsh/native-table-plain-paste.test.ts, apps/office/src/sw/browser/editor/native-table-plain-paste.test.tsx, apps/office/e2e/writer-native-table-plain-paste.spec.ts, docs/program/source-provenance.json, docs/program/parity/runtime-inventory.json. Test native multiline/empty/trailing lines, selected columns/reverse direction, existing multi-paragraph and numbered/formatted targets, native inheritance/identities/cursor/ring painting, repeated Undo/Redo, retained history disposal and ODT serialization, real mounted and Chromium plain paste. Preserve401 prior test files byte-identical unless source-confirmed fixture contract correction is explicitly revised before editing. Preserve all248 prior runtime states/contracts/defaults/classifications/deviations and provenance contracts/evidence; append two mapped native modules with whole-module statuses unverified. ASCII page-break/form-feed, huge paragraph wrap and legacy encoding/options may remain explicit unsupported guards if not represented, never pretend unsupported native mechanism is implemented; full SwUndoInserts non-end/suffix/fly/redline/native index lifetime, rich/internal/multiline structured table copy remains separate. Standing user UI/refactoring authorization covers safe local task; no network/outside/subagents/AP upstream sources/helpers/raw diagnostics/Python/probes. One full absent profile only and failed/new-only closure."
  Scope: |-
    apps/office/src/sw/source/filter/ascii/parasc.ts
    apps/office/src/sw/source/core/undo/untblk.ts
    apps/office/src/sw/source/filter/basflt/shellio.ts
    apps/office/src/sw/source/uibase/wrtsh/wrtsh1.ts
    apps/office/src/sw/source/uibase/wrtsh/wrtsh-editing.ts
    apps/office/src/sw/source/uibase/dochdl/swdtflvr.ts
    apps/office/src/sw/browser/editor/writer-clipboard-events.ts
    apps/office/src/sw/source/uibase/wrtsh/native-table-plain-paste.test.ts
    apps/office/src/sw/browser/editor/native-table-plain-paste.test.tsx
    apps/office/e2e/writer-native-table-plain-paste.spec.ts
    docs/program/source-provenance.json
    docs/program/parity/runtime-inventory.json
  Plan: "Iteration151 atomic external plain-text table clipboard native read. Preserve existing parser source as optional WriterTransferDocument source; SwTransferable detects plain text plus actual table mode before explicit fragment conversion, reconstructs normalized text at the boundary and delegates to SwWrtShell native plain read. Add ASCII parasc owner for LF/CRLF/CR normalization and native terminal newline omission, empty lines and representable control-character rules; use IDocumentContentOperations.InsertString native EMPTYEXPAND and SplitNode, preserving target hint/paragraph/list inheritance. Add bounded SwUndoInserts/SwUndoInsDoc owner in core/undo/untblk.ts for append-only selected-cell imports: capture original SwHistory items/collection at current native indices, SetInsertRange records inserted boundary fragment and actual new paragraph nodes in SwUndoNodes, Undo removes inserted nodes/text and restores original native history, Redo reconnects retained native content; no whole-document snapshots or shell command replay. Existing shellio loops actual native cell PaM points with sequential history capture and tracked display endpoint clones, grouped one undo action; standard existing initial-execute/redo pattern forwards actual undo context. Existing generic rich/body/list paste remains separate. SwWrtShell only forwards to native operation within986+small method lines; no new display/context adapter. Scope12paths: apps/office/src/sw/source/filter/ascii/parasc.ts, apps/office/src/sw/source/core/undo/untblk.ts, apps/office/src/sw/source/filter/basflt/shellio.ts, apps/office/src/sw/source/uibase/wrtsh/wrtsh1.ts, apps/office/src/sw/source/uibase/wrtsh/wrtsh-editing.ts, apps/office/src/sw/source/uibase/dochdl/swdtflvr.ts, apps/office/src/sw/browser/editor/writer-clipboard-events.ts, apps/office/src/sw/source/uibase/wrtsh/native-table-plain-paste.test.ts, apps/office/src/sw/browser/editor/native-table-plain-paste.test.tsx, apps/office/e2e/writer-native-table-plain-paste.spec.ts, docs/program/source-provenance.json, docs/program/parity/runtime-inventory.json. Test native multiline/empty/trailing lines, selected columns/reverse direction, existing multi-paragraph and numbered/formatted targets, native inheritance/identities/cursor/ring painting, repeated Undo/Redo, retained history disposal and ODT serialization, real mounted and Chromium plain paste. Preserve401 prior test files byte-identical unless source-confirmed fixture contract correction is explicitly revised before editing. Preserve all248 prior runtime states/contracts/defaults/classifications/deviations and provenance contracts/evidence; append two mapped native modules with whole-module statuses unverified. ASCII page-break/form-feed, huge paragraph wrap and legacy encoding/options may remain explicit unsupported guards if not represented, never pretend unsupported native mechanism is implemented; full SwUndoInserts non-end/suffix/fly/redline/native index lifetime, rich/internal/multiline structured table copy remains separate. Standing user UI/refactoring authorization covers safe local task; no network/outside/subagents/AP upstream sources/helpers/raw diagnostics/Python/probes. One full absent profile only and failed/new-only closure. Source-confirmed within-scope correction after initial six failures: extend scope to existing ndtxt.ts and ndtxt-hints.ts (14 paths total). Native ndtxt.cxx SplitContentNode 637-661 calls CutText(prefix), retains equal-end expanding attributes in empty suffix, removes DontExpand empties and MoveTextAttr_To_AttrSet 833-870 transfers supported whole-paragraph AUTO items to direct attributes. Implement bounded end/empty split hint preservation and native supported AUTO-to-item transfer in existing helper, preserving non-end fragment semantics and whole-owner unverified status. Add genuinely new tests covering empty/end formatting, DontExpand and DontMove, non-end/unformatted branches. Correct only new Chromium fixture by restoring actual paragraph focus after toolbar Bold and asserting Keep/Second before paste. No old tests changed. Initial 6 app and2 Chromium failures recorded; repeat only exact failed and new cases, carry unchanged contiguous actual coverage counters, restore before source audits."
  Verify Steps: |-
    1. Six statics first: npm run format:check; npm run lint; npm run typecheck; npm run check:dependencies; npm run check:docs; npm run check:file-size. Changed-file checks after fixes only.
    2. ONE sequential full upstream-absent profile: npm run test:static; npm run test:coverage --workspace @vite-office/office -- --coverage.reportOnFailure; npm run test:inventory:coverage -- --coverage.reportOnFailure; npm exec -- vitest run scripts/check-source-provenance.test.ts scripts/writer-ui-resource-model.test.ts; npm exec -- playwright test --config apps/office/playwright.config.ts. Rename vendor inside repo and restore in finally; no upstream access/execution by tests. Persist exact failed/error names before assertions. Only failed gates/cases and genuinely new unexecuted cases repeat; no passing full/static/build/suite/case replay; actual maps ignored appcache only.
    3. Source-independent native and browser tests prove plain format provenance dispatch before fragment conversion, actual selected-cell ring points, multiline/blank/trailing-newline behavior, preserved old cell paragraphs and neighbors, inherited character/list/paragraph attributes, native SetInsertRange/SwUndoNodes/SwHistory ownership, one reversible history unit with repeated Undo/Redo and disposal, native table display endpoints/rings/DOM paint and ODT serialization. Mounted and Chromium real paste events cover one-line and multiline text. All old tests remain byte-identical; any correction must be source-confirmed and recorded before edit.
    4. Restore vendor before five audits: writer resource generation --check, source-tree, source-provenance, inventory invariants and parity; repeat failed audits only. Preserve all248existing semantic states/defaults/classifications/exceptions and register two new native ASCII/history modules unverified with precise local/upstream/test references. Scope/old-test/changed-file/AP artifact checks, exact-SHA same-agent EVALUATOR phase before quality report, recorded verification and canonical finish, parent progress checkpoint; clean final tracked state. Broad goal remains active.
  Verification: "Pending declared checks."
  Rollback Plan: "Revert scoped semantic commit without rewriting history. Preserve task/parent evidence."
  Findings: "Pinned PasteFileContent passes the actual cell cursor ring into SwReader. ASCII reader clones only the point, inserts plain text using default EMPTYEXPAND and splits nodes inside each target cell; native terminal newline is omitted. SwReader creates SwUndoInsDoc before each read and SetInsertRange after read, grouped by INSDOKUMENT. Current browser drops parser source and translates plain text through explicit TextRuns fragments; multiline currently deletes selection then uses shell cursor callbacks. Native untblk captures pre-import text hints/direct format/collection, moves inserted content into undo storage and restores old history; this leaf ports append-only represented table selections, not complete import/undo mechanisms. All registered conscious save/open/recovery deviations remain unchanged."
id_source: "generated"
---
## Summary

Iteration151 atomic external plain-text table clipboard native read. Preserve existing parser source as optional WriterTransferDocument source; SwTransferable detects plain text plus actual table mode before explicit fragment conversion, reconstructs normalized text at the boundary and delegates to SwWrtShell native plain read. Add ASCII parasc owner for LF/CRLF/CR normalization and native terminal newline omission, empty lines and representable control-character rules; use IDocumentContentOperations.InsertString native EMPTYEXPAND and SplitNode, preserving target hint/paragraph/list inheritance. Add bounded SwUndoInserts/SwUndoInsDoc owner in core/undo/untblk.ts for append-only selected-cell imports: capture original SwHistory items/collection at current native indices, SetInsertRange records inserted boundary fragment and actual new paragraph nodes in SwUndoNodes, Undo removes inserted nodes/text and restores original native history, Redo reconnects retained native content; no whole-document snapshots or shell command replay. Existing shellio loops actual native cell PaM points with sequential history capture and tracked display endpoint clones, grouped one undo action; standard existing initial-execute/redo pattern forwards actual undo context. Existing generic rich/body/list paste remains separate. SwWrtShell only forwards to native operation within986+small method lines; no new display/context adapter. Scope12paths: apps/office/src/sw/source/filter/ascii/parasc.ts, apps/office/src/sw/source/core/undo/untblk.ts, apps/office/src/sw/source/filter/basflt/shellio.ts, apps/office/src/sw/source/uibase/wrtsh/wrtsh1.ts, apps/office/src/sw/source/uibase/wrtsh/wrtsh-editing.ts, apps/office/src/sw/source/uibase/dochdl/swdtflvr.ts, apps/office/src/sw/browser/editor/writer-clipboard-events.ts, apps/office/src/sw/source/uibase/wrtsh/native-table-plain-paste.test.ts, apps/office/src/sw/browser/editor/native-table-plain-paste.test.tsx, apps/office/e2e/writer-native-table-plain-paste.spec.ts, docs/program/source-provenance.json, docs/program/parity/runtime-inventory.json. Test native multiline/empty/trailing lines, selected columns/reverse direction, existing multi-paragraph and numbered/formatted targets, native inheritance/identities/cursor/ring painting, repeated Undo/Redo, retained history disposal and ODT serialization, real mounted and Chromium plain paste. Preserve401 prior test files byte-identical unless source-confirmed fixture contract correction is explicitly revised before editing. Preserve all248 prior runtime states/contracts/defaults/classifications/deviations and provenance contracts/evidence; append two mapped native modules with whole-module statuses unverified. ASCII page-break/form-feed, huge paragraph wrap and legacy encoding/options may remain explicit unsupported guards if not represented, never pretend unsupported native mechanism is implemented; full SwUndoInserts non-end/suffix/fly/redline/native index lifetime, rich/internal/multiline structured table copy remains separate. Standing user UI/refactoring authorization covers safe local task; no network/outside/subagents/AP upstream sources/helpers/raw diagnostics/Python/probes. One full absent profile only and failed/new-only closure.

## Scope

apps/office/src/sw/source/filter/ascii/parasc.ts
apps/office/src/sw/source/core/undo/untblk.ts
apps/office/src/sw/source/filter/basflt/shellio.ts
apps/office/src/sw/source/uibase/wrtsh/wrtsh1.ts
apps/office/src/sw/source/uibase/wrtsh/wrtsh-editing.ts
apps/office/src/sw/source/uibase/dochdl/swdtflvr.ts
apps/office/src/sw/browser/editor/writer-clipboard-events.ts
apps/office/src/sw/source/uibase/wrtsh/native-table-plain-paste.test.ts
apps/office/src/sw/browser/editor/native-table-plain-paste.test.tsx
apps/office/e2e/writer-native-table-plain-paste.spec.ts
docs/program/source-provenance.json
docs/program/parity/runtime-inventory.json

## Plan

Iteration151 atomic external plain-text table clipboard native read. Preserve existing parser source as optional WriterTransferDocument source; SwTransferable detects plain text plus actual table mode before explicit fragment conversion, reconstructs normalized text at the boundary and delegates to SwWrtShell native plain read. Add ASCII parasc owner for LF/CRLF/CR normalization and native terminal newline omission, empty lines and representable control-character rules; use IDocumentContentOperations.InsertString native EMPTYEXPAND and SplitNode, preserving target hint/paragraph/list inheritance. Add bounded SwUndoInserts/SwUndoInsDoc owner in core/undo/untblk.ts for append-only selected-cell imports: capture original SwHistory items/collection at current native indices, SetInsertRange records inserted boundary fragment and actual new paragraph nodes in SwUndoNodes, Undo removes inserted nodes/text and restores original native history, Redo reconnects retained native content; no whole-document snapshots or shell command replay. Existing shellio loops actual native cell PaM points with sequential history capture and tracked display endpoint clones, grouped one undo action; standard existing initial-execute/redo pattern forwards actual undo context. Existing generic rich/body/list paste remains separate. SwWrtShell only forwards to native operation within986+small method lines; no new display/context adapter. Scope12paths: apps/office/src/sw/source/filter/ascii/parasc.ts, apps/office/src/sw/source/core/undo/untblk.ts, apps/office/src/sw/source/filter/basflt/shellio.ts, apps/office/src/sw/source/uibase/wrtsh/wrtsh1.ts, apps/office/src/sw/source/uibase/wrtsh/wrtsh-editing.ts, apps/office/src/sw/source/uibase/dochdl/swdtflvr.ts, apps/office/src/sw/browser/editor/writer-clipboard-events.ts, apps/office/src/sw/source/uibase/wrtsh/native-table-plain-paste.test.ts, apps/office/src/sw/browser/editor/native-table-plain-paste.test.tsx, apps/office/e2e/writer-native-table-plain-paste.spec.ts, docs/program/source-provenance.json, docs/program/parity/runtime-inventory.json. Test native multiline/empty/trailing lines, selected columns/reverse direction, existing multi-paragraph and numbered/formatted targets, native inheritance/identities/cursor/ring painting, repeated Undo/Redo, retained history disposal and ODT serialization, real mounted and Chromium plain paste. Preserve401 prior test files byte-identical unless source-confirmed fixture contract correction is explicitly revised before editing. Preserve all248 prior runtime states/contracts/defaults/classifications/deviations and provenance contracts/evidence; append two mapped native modules with whole-module statuses unverified. ASCII page-break/form-feed, huge paragraph wrap and legacy encoding/options may remain explicit unsupported guards if not represented, never pretend unsupported native mechanism is implemented; full SwUndoInserts non-end/suffix/fly/redline/native index lifetime, rich/internal/multiline structured table copy remains separate. Standing user UI/refactoring authorization covers safe local task; no network/outside/subagents/AP upstream sources/helpers/raw diagnostics/Python/probes. One full absent profile only and failed/new-only closure. Source-confirmed within-scope correction after initial six failures: extend scope to existing ndtxt.ts and ndtxt-hints.ts (14 paths total). Native ndtxt.cxx SplitContentNode 637-661 calls CutText(prefix), retains equal-end expanding attributes in empty suffix, removes DontExpand empties and MoveTextAttr_To_AttrSet 833-870 transfers supported whole-paragraph AUTO items to direct attributes. Implement bounded end/empty split hint preservation and native supported AUTO-to-item transfer in existing helper, preserving non-end fragment semantics and whole-owner unverified status. Add genuinely new tests covering empty/end formatting, DontExpand and DontMove, non-end/unformatted branches. Correct only new Chromium fixture by restoring actual paragraph focus after toolbar Bold and asserting Keep/Second before paste. No old tests changed. Initial 6 app and2 Chromium failures recorded; repeat only exact failed and new cases, carry unchanged contiguous actual coverage counters, restore before source audits.

## Verify Steps

1. Six statics first: npm run format:check; npm run lint; npm run typecheck; npm run check:dependencies; npm run check:docs; npm run check:file-size. Changed-file checks after fixes only.
2. ONE sequential full upstream-absent profile: npm run test:static; npm run test:coverage --workspace @vite-office/office -- --coverage.reportOnFailure; npm run test:inventory:coverage -- --coverage.reportOnFailure; npm exec -- vitest run scripts/check-source-provenance.test.ts scripts/writer-ui-resource-model.test.ts; npm exec -- playwright test --config apps/office/playwright.config.ts. Rename vendor inside repo and restore in finally; no upstream access/execution by tests. Persist exact failed/error names before assertions. Only failed gates/cases and genuinely new unexecuted cases repeat; no passing full/static/build/suite/case replay; actual maps ignored appcache only.
3. Source-independent native and browser tests prove plain format provenance dispatch before fragment conversion, actual selected-cell ring points, multiline/blank/trailing-newline behavior, preserved old cell paragraphs and neighbors, inherited character/list/paragraph attributes, native SetInsertRange/SwUndoNodes/SwHistory ownership, one reversible history unit with repeated Undo/Redo and disposal, native table display endpoints/rings/DOM paint and ODT serialization. Mounted and Chromium real paste events cover one-line and multiline text. All old tests remain byte-identical; any correction must be source-confirmed and recorded before edit.
4. Restore vendor before five audits: writer resource generation --check, source-tree, source-provenance, inventory invariants and parity; repeat failed audits only. Preserve all248existing semantic states/defaults/classifications/exceptions and register two new native ASCII/history modules unverified with precise local/upstream/test references. Scope/old-test/changed-file/AP artifact checks, exact-SHA same-agent EVALUATOR phase before quality report, recorded verification and canonical finish, parent progress checkpoint; clean final tracked state. Broad goal remains active.

## Verification

Pending declared checks.

## Rollback Plan

Revert scoped semantic commit without rewriting history. Preserve task/parent evidence.

## Findings

Pinned PasteFileContent passes the actual cell cursor ring into SwReader. ASCII reader clones only the point, inserts plain text using default EMPTYEXPAND and splits nodes inside each target cell; native terminal newline is omitted. SwReader creates SwUndoInsDoc before each read and SetInsertRange after read, grouped by INSDOKUMENT. Current browser drops parser source and translates plain text through explicit TextRuns fragments; multiline currently deletes selection then uses shell cursor callbacks. Native untblk captures pre-import text hints/direct format/collection, moves inserted content into undo storage and restores old history; this leaf ports append-only represented table selections, not complete import/undo mechanisms. All registered conscious save/open/recovery deviations remain unchanged.
