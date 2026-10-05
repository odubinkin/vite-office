---
id: "202610051420-T1QNV8"
title: "Move inserted table content into native undo storage only during Undo"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 17
origin:
  system: "manual"
depends_on:
  - "202610051334-PY9DJV"
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-05T14:25:44.733Z"
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
  -
    author: "CODER"
    body: "Start: Consume actual cut hints through existing undo storage without an extra historical clone; prior RetainText defaults preserved."
events:
  -
    type: "status"
    at: "2026-10-05T14:22:07.674Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: Port native numeric range and removed-content undo storage lifecycle for represented table plain imports."
  -
    type: "status"
    at: "2026-10-05T14:25:45.949Z"
    author: "CODER"
    from: "DOING"
    to: "DOING"
    note: "Start: Consume actual cut hints through existing undo storage without an extra historical clone; prior RetainText defaults preserved."
doc_version: 3
doc_updated_at: "2026-10-05T14:46:26.927Z"
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
    apps/office/src/sw/source/core/undo/docundo.ts
    Seven paths in approved refinement. Only two source-confirmed applied-storage literals change in one prior test;403other prior test files and all other assertions unchanged.250module states/defaults/classifications preserved; additive native evidence for three owners.
  Plan: "Iteration152 atomic native document-read undo content lifecycle. Add native SwUndRng numeric start/end coordinates with native unmarked sentinel/defaults, SetValues and SetPaM; add SwUndoSaveContent native append-only MoveToUndoNds/MoveFromUndoNds responsibility in existing undobj owner. SwUndoInserts uses these native facets (composition expresses native multiple bases) and existing SwHistory: SetInsertRange validates represented section and records coordinates only, no retained snapshots/live nodes; Undo resolves current absolute native indices, cuts actual inserted boundary text/hints and detaches actual added paragraphs into undo storage, then restores original item/hint/collection history; Redo consumes retained native content back into live section and releases storage. GetPayloadSize counts original history and actual disconnected storage only, never duplicates live document payload. Dispose drops only retained removed content; repeated range recording before Undo is allocation-free. SwUndoNodes Map remains existing portable storage boundary, complete physical native SwNodes undo array and nonend/suffix/fly/redline/index ownership unverified. Scope6paths:apps/office/src/sw/source/core/undo/undobj.ts, apps/office/src/sw/source/core/undo/untblk.ts, apps/office/src/sw/source/core/undo/native-insert-storage.test.ts, apps/office/src/sw/source/uibase/wrtsh/native-table-plain-paste.test.ts, docs/program/source-provenance.json, docs/program/parity/runtime-inventory.json. Add source-independent tests for initial0storage, numeric coordinate resolution, repeated Undo/Redo0live/retained-only undo, blank and single-line/multiline cell insertion, editing inserted content then Undo ordered actions and native re-capture, disposal while applied/undone, redo discard, range/move guards and flags. Correct exactly two source-confirmed storage assertions in prior151test from eager9/4 to0 after paste; preserve every other old assertion and test file. Additive provenance/evidence/local-native symbol contracts only for existing undobj/untblk; preserve all250 module states/statuses/classifications/defaults/conscious exceptions and prior evidence. Six statics first, ONE full absent profile and only failed/new closure. No network/outside/global/subagents/AP sources/helpers/Python/probes/raw diagnostics; ignored appcache maps only. User standing explicit UI/refactoring authorization applies. Native removed hint ownership refinement: scope7paths includes existing docundo.ts. Extend existing RetainText with optional copy=true preserving every prior default/caller; SwUndoSaveContent alone passes copy=false so actual CutTextFragment owned hints enter storage without another snapshot and ReplaceRange(...transferHints=true) consumes them on Redo. Additive native move evidence for docundo owner only; all prior statuses/defaults preserved."
  Verify Steps: |-
    1. Six statics first: npm run format:check; npm run lint; npm run typecheck; npm run check:dependencies; npm run check:docs; npm run check:file-size. After correction changed-file checks only.
    2. ONE sequential upstream-absent full profile: npm run test:static; npm run test:coverage --workspace @vite-office/office -- --coverage.reportOnFailure; npm run test:inventory:coverage -- --coverage.reportOnFailure; npm exec -- vitest run scripts/check-source-provenance.test.ts scripts/writer-ui-resource-model.test.ts; npm exec -- playwright test --config apps/office/playwright.config.ts. Rename vendor inside repository and restore in finally. Persist exact failure/error names before assertions, use skipped Vitest status, no tests access or invoke upstream. Repeat only failed gates/cases and genuinely new cases; never passing full/build/suite/case replay. Actual initial maps ignored appcache only.
    3. Source-independent new native tests prove SetInsertRange allocation-free numeric range ownership; native Undo cut/detach to storage and Redo consume/reconnect/release, applied0storage/undone removed-only payload, blank and text imports, actual node/list/format identities, repeated history navigation, disposal and redo discard, ordered later edit cancellation and re-capture, native source guard/default contracts. Existing mounted/Chromium selected-table clipboard flows remain unchanged. Exactly two prior151storage expected counts9and4 become0 based on native source; 403other prior test files and every other assertion byte-identical. No whole-module promotion.
    4. Restore vendor before five source audits: writer resource generation --check, source-tree, source-provenance, inventory invariants and parity. Preserve all250 prior module statuses/defaults/classifications and all prior evidence, additive native facet symbols/evidence only for three owners. Scope/test correction/AP scan, exact-SHA same-agent EVALUATOR review, recorded verification/canonical finish/parent checkpoint; clean final tracked state. Broad goal stays active.
  Verification: "Pending declared checks. No whole-module or broad parity completion claim."
  Rollback Plan: "Use a new task and revert only this leaf semantic commit if native lifetime regression is demonstrated; preserve task evidence and unrelated work, no history rewrite."
  Findings: |-
    Pinned sources read in place: LibreOffice26.8.0.2/9bc445578031fecf56086729d8e4940c77e14d65. Native undobj.cxx SwUndRng45-100 stores absolute sorted start/end node/content indices; no-mark uses endnode0/COMPLETE_STRING, and reconstruction resolves current indices. Native swtypes.hxx55 COMPLETE_STRING=SAL_MAX_INT32. Native untblk.cxx SetInsertRange118 records range coordinates, UndoImpl318 MoveToUndoNds removes content, RedoImpl404 detaches undo index before MoveFromUndoNds consumes it. Source comments explicitly resolve numeric indices, rather than retained node identity. Native undobj.cxx MoveToUndoNds787/MoveFromUndoNds823 own content movement and undo-area cleanup.

    Implemented native SwUndRng and represented append-only SwUndoSaveContent facets in existing undobj owner; composition in SwUndoInserts expresses native multiple-base responsibilities. SetInsertRange allocates no stored document content, and only records numeric span/display state. Undo reconstructs current actual PaM from coordinates, cuts inserted native text/hints and detaches added actual paragraphs into storage, then restores original SwHistory hints/items/collection. Redo transfers actual retained hint ownership into live text, reconnects retained native paragraphs and releases consumed undo entries. Existing RetainText default copy=true unchanged for every old caller; native removed-content move alone uses copy=false, paired with ReplaceRange transferHints=true. GetPayloadSize counts original history plus actually disconnected content, without duplicating live inserted nodes/text. Disposal while applied cannot delete live content; disposal while undone drops only removed content. No new UI/context adapter, whole-document snapshots, shell callbacks or runtime upstream access.

    Exactly two source-confirmed prior151assertion corrections approved before editing: storage count immediately after paste9and4 become0, matching native SetInsertRange ownership.403other prior test files byte-identical; every other assertion in changed file byte-identical (404prior total). Added12native cases: default/sorted/unmarked numeric coordinates, current-index reconstruction after owner replacement, actual interior hint identity across cut/storage/consume without second snapshot, one-line/multiline/blank imports with original formatted/numbered cell and untouched neighbor,3Undo/Redo cycles and removed-only payload, applied/undone disposal, dropping redo after new insert, later native insertion cancellation before original range re-capture, repeated SetInsertRange allocation-free, blank paragraphs/hints and explicit unsupported ranges. Existing mounted/Chromium clipboard/table/list/format/selection/history assertions passed unchanged.

    Command: six declared statics. Result: pass first attempt. Evidence: static-gates.json. Scope:7approvedpaths.
    Command: ONE sequential full upstream-absent build/app/inventory/scripts/Chromium profile. Result: all pass first attempt. Evidence: absent-profile.json records exact commands, outcomes, hashes/counts, zero failed/error names.12148app cases/308files,109inventory/36files,5scripts/2files,120Chromium/0flaky/0skip; app and inventory L/S/F/B100%. Initial maps ignored appcache only. No full/profile/build/suite/case replay, no post-profile production edits. Long app run was inspected through current process metadata; active workers advanced and the same session completed, no restarted run. No raw diagnostics/probes saved in AP.
    Command: restore vendor, then five declared source audits. Result: pass/0semanticViolationCount. Evidence: restored-source-audits.json. Scope:250runtime records; all prior states/statuses/defaults/classifications/exceptions preserved. Native symbols/evidence/responsibility prose extended only for undobj/untblk/docundo, all prior evidence preserved; overbroad omitted-responsibility prose for undobj updated to represented facets. Whole modules remain unverified. scope-audit.json records exact corrected test, hashes and comparison limits. Ignored-inclusive AP scan4163files/0forbidden; no upstream copies/helpers/Python/probes/raw frames.

    Residuals: undo area remains existing portable Map of actual disconnected native text/nodes, not a complete physical native SwNodes extras/postits array; disconnected paragraphs still refer to original SwNodes owner, complete MoveRange/MoveNodes boundary join and registered content/node index lifetimes unverified. Append-only represented reader path only: full nonend/suffix/fly/redline/protection/conditional styles, format-collection swap, native cursor supplier, history placement in SwUndoSaveContent and SwUndRng nontext-sentinel content correction remain unverified. Existing SwUndo cursor display-state boundary still retains node identities separately; only content span coordinates moved native. Browser plain parsing/encoding/page-break, rich/internal/structured table clipboard and complete list/layout/rendering contracts remain unverified. Conscious save/open/recovery deviations unchanged; broad parent/goal active, no module or broad parity completion claim.
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
apps/office/src/sw/source/core/undo/docundo.ts
Seven paths in approved refinement. Only two source-confirmed applied-storage literals change in one prior test;403other prior test files and all other assertions unchanged.250module states/defaults/classifications preserved; additive native evidence for three owners.

## Plan

Iteration152 atomic native document-read undo content lifecycle. Add native SwUndRng numeric start/end coordinates with native unmarked sentinel/defaults, SetValues and SetPaM; add SwUndoSaveContent native append-only MoveToUndoNds/MoveFromUndoNds responsibility in existing undobj owner. SwUndoInserts uses these native facets (composition expresses native multiple bases) and existing SwHistory: SetInsertRange validates represented section and records coordinates only, no retained snapshots/live nodes; Undo resolves current absolute native indices, cuts actual inserted boundary text/hints and detaches actual added paragraphs into undo storage, then restores original item/hint/collection history; Redo consumes retained native content back into live section and releases storage. GetPayloadSize counts original history and actual disconnected storage only, never duplicates live document payload. Dispose drops only retained removed content; repeated range recording before Undo is allocation-free. SwUndoNodes Map remains existing portable storage boundary, complete physical native SwNodes undo array and nonend/suffix/fly/redline/index ownership unverified. Scope6paths:apps/office/src/sw/source/core/undo/undobj.ts, apps/office/src/sw/source/core/undo/untblk.ts, apps/office/src/sw/source/core/undo/native-insert-storage.test.ts, apps/office/src/sw/source/uibase/wrtsh/native-table-plain-paste.test.ts, docs/program/source-provenance.json, docs/program/parity/runtime-inventory.json. Add source-independent tests for initial0storage, numeric coordinate resolution, repeated Undo/Redo0live/retained-only undo, blank and single-line/multiline cell insertion, editing inserted content then Undo ordered actions and native re-capture, disposal while applied/undone, redo discard, range/move guards and flags. Correct exactly two source-confirmed storage assertions in prior151test from eager9/4 to0 after paste; preserve every other old assertion and test file. Additive provenance/evidence/local-native symbol contracts only for existing undobj/untblk; preserve all250 module states/statuses/classifications/defaults/conscious exceptions and prior evidence. Six statics first, ONE full absent profile and only failed/new closure. No network/outside/global/subagents/AP sources/helpers/Python/probes/raw diagnostics; ignored appcache maps only. User standing explicit UI/refactoring authorization applies. Native removed hint ownership refinement: scope7paths includes existing docundo.ts. Extend existing RetainText with optional copy=true preserving every prior default/caller; SwUndoSaveContent alone passes copy=false so actual CutTextFragment owned hints enter storage without another snapshot and ReplaceRange(...transferHints=true) consumes them on Redo. Additive native move evidence for docundo owner only; all prior statuses/defaults preserved.

## Verify Steps

1. Six statics first: npm run format:check; npm run lint; npm run typecheck; npm run check:dependencies; npm run check:docs; npm run check:file-size. After correction changed-file checks only.
2. ONE sequential upstream-absent full profile: npm run test:static; npm run test:coverage --workspace @vite-office/office -- --coverage.reportOnFailure; npm run test:inventory:coverage -- --coverage.reportOnFailure; npm exec -- vitest run scripts/check-source-provenance.test.ts scripts/writer-ui-resource-model.test.ts; npm exec -- playwright test --config apps/office/playwright.config.ts. Rename vendor inside repository and restore in finally. Persist exact failure/error names before assertions, use skipped Vitest status, no tests access or invoke upstream. Repeat only failed gates/cases and genuinely new cases; never passing full/build/suite/case replay. Actual initial maps ignored appcache only.
3. Source-independent new native tests prove SetInsertRange allocation-free numeric range ownership; native Undo cut/detach to storage and Redo consume/reconnect/release, applied0storage/undone removed-only payload, blank and text imports, actual node/list/format identities, repeated history navigation, disposal and redo discard, ordered later edit cancellation and re-capture, native source guard/default contracts. Existing mounted/Chromium selected-table clipboard flows remain unchanged. Exactly two prior151storage expected counts9and4 become0 based on native source; 403other prior test files and every other assertion byte-identical. No whole-module promotion.
4. Restore vendor before five source audits: writer resource generation --check, source-tree, source-provenance, inventory invariants and parity. Preserve all250 prior module statuses/defaults/classifications and all prior evidence, additive native facet symbols/evidence only for three owners. Scope/test correction/AP scan, exact-SHA same-agent EVALUATOR review, recorded verification/canonical finish/parent checkpoint; clean final tracked state. Broad goal stays active.

## Verification

Pending declared checks. No whole-module or broad parity completion claim.

## Rollback Plan

Use a new task and revert only this leaf semantic commit if native lifetime regression is demonstrated; preserve task evidence and unrelated work, no history rewrite.

## Findings

Pinned sources read in place: LibreOffice26.8.0.2/9bc445578031fecf56086729d8e4940c77e14d65. Native undobj.cxx SwUndRng45-100 stores absolute sorted start/end node/content indices; no-mark uses endnode0/COMPLETE_STRING, and reconstruction resolves current indices. Native swtypes.hxx55 COMPLETE_STRING=SAL_MAX_INT32. Native untblk.cxx SetInsertRange118 records range coordinates, UndoImpl318 MoveToUndoNds removes content, RedoImpl404 detaches undo index before MoveFromUndoNds consumes it. Source comments explicitly resolve numeric indices, rather than retained node identity. Native undobj.cxx MoveToUndoNds787/MoveFromUndoNds823 own content movement and undo-area cleanup.

Implemented native SwUndRng and represented append-only SwUndoSaveContent facets in existing undobj owner; composition in SwUndoInserts expresses native multiple-base responsibilities. SetInsertRange allocates no stored document content, and only records numeric span/display state. Undo reconstructs current actual PaM from coordinates, cuts inserted native text/hints and detaches added actual paragraphs into storage, then restores original SwHistory hints/items/collection. Redo transfers actual retained hint ownership into live text, reconnects retained native paragraphs and releases consumed undo entries. Existing RetainText default copy=true unchanged for every old caller; native removed-content move alone uses copy=false, paired with ReplaceRange transferHints=true. GetPayloadSize counts original history plus actually disconnected content, without duplicating live inserted nodes/text. Disposal while applied cannot delete live content; disposal while undone drops only removed content. No new UI/context adapter, whole-document snapshots, shell callbacks or runtime upstream access.

Exactly two source-confirmed prior151assertion corrections approved before editing: storage count immediately after paste9and4 become0, matching native SetInsertRange ownership.403other prior test files byte-identical; every other assertion in changed file byte-identical (404prior total). Added12native cases: default/sorted/unmarked numeric coordinates, current-index reconstruction after owner replacement, actual interior hint identity across cut/storage/consume without second snapshot, one-line/multiline/blank imports with original formatted/numbered cell and untouched neighbor,3Undo/Redo cycles and removed-only payload, applied/undone disposal, dropping redo after new insert, later native insertion cancellation before original range re-capture, repeated SetInsertRange allocation-free, blank paragraphs/hints and explicit unsupported ranges. Existing mounted/Chromium clipboard/table/list/format/selection/history assertions passed unchanged.

Command: six declared statics. Result: pass first attempt. Evidence: static-gates.json. Scope:7approvedpaths.
Command: ONE sequential full upstream-absent build/app/inventory/scripts/Chromium profile. Result: all pass first attempt. Evidence: absent-profile.json records exact commands, outcomes, hashes/counts, zero failed/error names.12148app cases/308files,109inventory/36files,5scripts/2files,120Chromium/0flaky/0skip; app and inventory L/S/F/B100%. Initial maps ignored appcache only. No full/profile/build/suite/case replay, no post-profile production edits. Long app run was inspected through current process metadata; active workers advanced and the same session completed, no restarted run. No raw diagnostics/probes saved in AP.
Command: restore vendor, then five declared source audits. Result: pass/0semanticViolationCount. Evidence: restored-source-audits.json. Scope:250runtime records; all prior states/statuses/defaults/classifications/exceptions preserved. Native symbols/evidence/responsibility prose extended only for undobj/untblk/docundo, all prior evidence preserved; overbroad omitted-responsibility prose for undobj updated to represented facets. Whole modules remain unverified. scope-audit.json records exact corrected test, hashes and comparison limits. Ignored-inclusive AP scan4163files/0forbidden; no upstream copies/helpers/Python/probes/raw frames.

Residuals: undo area remains existing portable Map of actual disconnected native text/nodes, not a complete physical native SwNodes extras/postits array; disconnected paragraphs still refer to original SwNodes owner, complete MoveRange/MoveNodes boundary join and registered content/node index lifetimes unverified. Append-only represented reader path only: full nonend/suffix/fly/redline/protection/conditional styles, format-collection swap, native cursor supplier, history placement in SwUndoSaveContent and SwUndRng nontext-sentinel content correction remain unverified. Existing SwUndo cursor display-state boundary still retains node identities separately; only content span coordinates moved native. Browser plain parsing/encoding/page-break, rich/internal/structured table clipboard and complete list/layout/rendering contracts remain unverified. Conscious save/open/recovery deviations unchanged; broad parent/goal active, no module or broad parity completion claim.
