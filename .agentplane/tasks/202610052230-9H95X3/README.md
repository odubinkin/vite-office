---
id: "202610052230-9H95X3"
title: "Implement native Writer outline level movement for paragraph Tab"
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
  updated_at: "2026-10-05T22:48:18.766Z"
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
    body: "Start: implement approved iteration167 native outline movement and heading Tab behavior under standing explicit iterative authorization."
events:
  -
    type: "status"
    at: "2026-10-05T22:31:13.345Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implement approved iteration167 native outline movement and heading Tab behavior under standing explicit iterative authorization."
doc_version: 3
doc_updated_at: "2026-10-05T22:48:18.151Z"
doc_updated_by: "CODER"
description: "Iteration167: native docnum outline style move-table and range preflight, SwUndoOutlineLeftRight inverse-delta history, SwEditShell normalized ring execution and SwEditWin assigned-heading Tab routing. Remove unsupported outline fallback. One bounded executable leaf under standing explicit iterative core/UI/refactor authorization."
sections:
  Summary: "Implement native Writer outline level movement and replace the eligible heading Tab unsupported fallback."
  Scope: |-
    12 intentional semantic paths;6 production owners. apps/office/src/sw/source/core/doc/docnum.ts
    apps/office/src/sw/source/core/undo/unoutl.ts
    apps/office/src/sw/source/core/doc/doc.ts
    apps/office/src/sw/source/core/edit/ednumber.ts
    apps/office/src/sw/source/uibase/docvw/edtwin.ts
    apps/office/src/sw/source/uibase/docvw/native-list-tab.test.ts
    apps/office/src/sw/source/core/doc/native-outline-movement.test.ts
    apps/office/src/sw/browser/editor/native-outline-tab.test.tsx
    apps/office/e2e/writer-native-outline-tab.spec.ts
    docs/program/source-provenance.json
    docs/program/parity/runtime-inventory.json
    apps/office/src/sw/source/core/doc/number.ts
    Source-confirmed MAXLEVEL10 recovery within current native Tab/outline behavior. Prior tests/states/IO exceptions unchanged per approved contract.
  Plan: |-
    Iteration167 continues the standing expressly authorized iterative core/UI/refactor goal with one CODER leaf in direct main. Implement pinned SwDoc::OutlineUpDown from docnum.cxx at matching core/doc/docnum.ts as an actual source-shaped method-body function called by the SwDoc aggregate, without inventing a manager/model/DTO/compatibility adapter. Use actual sorted SwOutlineNodes.Seek_Entry, preceding-outline range semantics, all document collection creation-order assignments, native lazy next/previous pool heading admission, signed offset steps across occupied styles, whole-range boundary preflight, native ChgFormatColl for assigned styles and SetAttrOutlineLevel for direct outline attributes. All validation before node mutation; preserve collection-pool lazy side effects and source no-outline/zero-offset behavior. Existing GetTextFormatColl performs actual native pool materialization by registered heading identity; no invented outline style cache. No merged paragraph props/layout/conditional collections exist in represented runtime; retain these explicitly unverified.
    Add matching core/undo/unoutl.ts SwUndoOutlineLeftRight with numeric SwUndRng and signed offset, inverse direction through the same document operation for Undo/Redo; no style/list snapshots or retained paragraph object for mutation. Retain existing portable SwUndo cursor/pending item restoration and core ApplyAction-independent recording boundary: SwEditShell brackets actual native execution in existing shell/model notification transactions and native UndoManager groups, recording only successful range delta actions directly. Preserve native SwPamRanges sorted normalization and bRet short-circuit after first failed range, including earlier successful changes and grouped history. Shell offset defaults to native one. Existing core document mutators separate primitive execution from portable shell history recording; direct SwDoc auto-history, framework Repeat, native StartAllAction layout batching/SetModified even on failure and ChkCondColls are unrepresented rather than simulated. No new no-op ApplyAction callback, dry-run clone, preparation adapter, or duplicated move algorithm.
    SwEditWin assigned-outline paragraph-at-start Tab/ShiftTab must call the actual shell OutlineUpDown in eligible directions and own the key, replacing return-false unsupported fallback; retain native list-before-table-before-outline priority, top/bottom limits and ordinary text fallback, no browser heuristics. Actual native gap/creation-order/missing-pool-assignment/multi-step/direct-level/predecessor/mixed-range/all-or-nothing/ring-short-circuit/inverse-history/current-numeric-slot/preserved format and text/cell cases, mounted actual DOM/session caret/styles/history, production Chromium1280/390 heading Tab/ShiftTab/editing/history and valid locally generated ODT import/export/fresh-context reopen.12 semantic paths,6 production owners including2 new partial native owners.429 prior testfiles:428 byte-identical; only exact source-confirmed four-case formerly unsupported outline expectation/title/comment/text/style correction in native-list-tab.test.ts, preserve all other cases/bytes/assertions.253 prior runtime semantic states/defaults/classes/IO deviations/evidence preserved;2 new partial unverified owners=255 modules, no full-module/broad parity promotion. Conscious save/open/recovery deviations unchanged.
    Six initial statics then ONE full upstream-absent build/app/inventory/scripts/Chromium profile via in-repo vendor rename try/finally restore. Only original failed/genuinely new cases or failed/changed-file checks afterward; no passing/full profile replay. Actual100%app/inventory L/S/F/B, exact failures/errors/counts/hashes persisted before assertions, skipped=skipped. Five restored source audits, exact scope/prior-tests/metadata/sourcehash/AP ignored-inclusive/doctor/routing/diffcheck; same current agent explicit EVALUATOR exact semantic SHA pass, canonical meaningful finish and whole parent Findings append, clean tracked/untracked main. AP bounded English prose/counts/hashes/outcomes/exact failed names only; no sources/helpers/generators/Python/probes/binaries/rawdiffs/sourceframes/rawdiagnostics. No network/outside/global/subagents. Previous166 verified progress; parent DOING, goal ACTIVE; full native/core/UI/list/table parity remains unverified.
    Initial single absent profile completed: build, inventory109/scripts5/Chromium141 passed; app12559 passed6failed. Source-confirmed recovery: pinned swtypes.hxx MAXLEVEL10 versus local max zero-based index9. Correct docnum count10 and prior native NumDownChangesIndent tenth-level guard in number.ts (>max index), retain same approved Tab/outline behavior contract; add genuine level8 NONE/equal-indent literal Tab, assigned heading9→10/inverse and direct9→10/inverse cases and two new production boundary Chromium1280/390 cases. Fix only failed new DOM text selection and value-based direct item preservation assertions consistent with existing SfxItemSet Clone contract. Do not replay passing cases. Remaining limits unchanged.
  Verify Steps: |-
    1. Six initial statics: npm run format:check; npm run lint; npm run typecheck; npm run check:dependencies; npm run check:docs; npm run check:file-size. Repeat onlyfailedgates or changed-file remediation.
    2. ONE upstream-absent profile: npm run test:static; npm run test:coverage --workspace @vite-office/office -- --coverage.reportOnFailure; npm run test:inventory:coverage -- --coverage.reportOnFailure; npm exec -- vitest run scripts/check-source-provenance.test.ts scripts/writer-ui-resource-model.test.ts; npm exec -- playwright test --config apps/office/playwright.config.ts. In-repo vendor rename try/finallyrestore; tests neverread/invoke/compileupstream. Exactfailure/errors/countshashspersistedbeforeassertions;skipped=skipped. Onlyoriginalfailed or genuinelynewunexecutedcases afterwards;no passing/fullprofile replay. Actual100%app/inventoryL/S/F/B with source/map identity-checked counters onlyignoredappcache.
    3. Verify native docnum complete represented nonmerged outline move-table algorithm: actual sorted outline range and predecessor, style creation-order ties, native lazy pool admission and skipped assignments, signed multi-step movement across gaps, direct outline increments, whole-range rejection, preserved text/char/list items and actual shell grouping/normalized rings with native short-circuit semantics. UndoRedo must call the same primitive with inverse/same offset, numeric current node slots and fixed-size delta payload rather than style snapshots. Default shell offset one. Native MAXLEVEL10 movement and level8 NONE/equal-indent literal Tab guard plus genuinely new assigned/direct ninth-to-tenth boundary cases. SwEditWin eligible heading Tab owns actual native outline operation with list/table priority and boundary text/no-op unchanged. Actual mounted DOM session/history/caret and production Chromium1280/390 ordinary Open/export/fresh-storage reopen, no runtime injection.
    4.429 prior tests:428 byte-identical; exact source-confirmed old unsupported four-case outline expectation correction only in native-list-tab.test.ts.253 prior semantic states/defaults/classifications/IO exceptions/evidence preserved;2 new partial unverified owners=255 modules. No broad native or full-module promotion. Direct document auto-history/framework Repeat/failed-operation dirty flag/native layout batching/merged props/conditional collections and full KeyInput remain unverified, no fake simulation.
    5. Five restored audits: npm exec -- tsx scripts/generate-writer-ui-resources.ts --check; npm run check:source-tree; npm run check:source-provenance; npm run inventory:invariants; npm run inventory:parity. Exact scope/prior-test/metadata/sourcehash/AP ignored-inclusive/doctor/routing/diffcheck, same-agent exact-SHA EVALUATOR pass, record verify/canonical meaningful finish, whole prior parent Findings append and clean tracked/untracked. Full objective stays active; conscious IO deviations unchanged.
  Verification: "Pending declared checks; no full native parity claim."
  Rollback Plan: "Revert only the semantic implementation commit if necessary; preserve task evidence and conscious IO deviations."
  Findings: "Read-only evidence: pinned docnum.cxx SwDoc::OutlineUpDown uses actual outline index, creation-order style map and lazy adjacent pool styles, movement across occupied levels, full-range preflight, assignment/direct outline changes. Native unoutl.cxx retains numeric range and signed delta; undo reuses the same document operation with inverse offset. ednumber.cxx normalizes multiple ranges and short-circuits after first failure. Current eligible heading Tab returns false; no OutlineUpDown owner exists. Existing core primitive/shell history boundary will be retained explicitly, without fake callbacks or snapshot adapters."
id_source: "generated"
---
## Summary

Implement native Writer outline level movement and replace the eligible heading Tab unsupported fallback.

## Scope

12 intentional semantic paths;6 production owners. apps/office/src/sw/source/core/doc/docnum.ts
apps/office/src/sw/source/core/undo/unoutl.ts
apps/office/src/sw/source/core/doc/doc.ts
apps/office/src/sw/source/core/edit/ednumber.ts
apps/office/src/sw/source/uibase/docvw/edtwin.ts
apps/office/src/sw/source/uibase/docvw/native-list-tab.test.ts
apps/office/src/sw/source/core/doc/native-outline-movement.test.ts
apps/office/src/sw/browser/editor/native-outline-tab.test.tsx
apps/office/e2e/writer-native-outline-tab.spec.ts
docs/program/source-provenance.json
docs/program/parity/runtime-inventory.json
apps/office/src/sw/source/core/doc/number.ts
Source-confirmed MAXLEVEL10 recovery within current native Tab/outline behavior. Prior tests/states/IO exceptions unchanged per approved contract.

## Plan

Iteration167 continues the standing expressly authorized iterative core/UI/refactor goal with one CODER leaf in direct main. Implement pinned SwDoc::OutlineUpDown from docnum.cxx at matching core/doc/docnum.ts as an actual source-shaped method-body function called by the SwDoc aggregate, without inventing a manager/model/DTO/compatibility adapter. Use actual sorted SwOutlineNodes.Seek_Entry, preceding-outline range semantics, all document collection creation-order assignments, native lazy next/previous pool heading admission, signed offset steps across occupied styles, whole-range boundary preflight, native ChgFormatColl for assigned styles and SetAttrOutlineLevel for direct outline attributes. All validation before node mutation; preserve collection-pool lazy side effects and source no-outline/zero-offset behavior. Existing GetTextFormatColl performs actual native pool materialization by registered heading identity; no invented outline style cache. No merged paragraph props/layout/conditional collections exist in represented runtime; retain these explicitly unverified.
Add matching core/undo/unoutl.ts SwUndoOutlineLeftRight with numeric SwUndRng and signed offset, inverse direction through the same document operation for Undo/Redo; no style/list snapshots or retained paragraph object for mutation. Retain existing portable SwUndo cursor/pending item restoration and core ApplyAction-independent recording boundary: SwEditShell brackets actual native execution in existing shell/model notification transactions and native UndoManager groups, recording only successful range delta actions directly. Preserve native SwPamRanges sorted normalization and bRet short-circuit after first failed range, including earlier successful changes and grouped history. Shell offset defaults to native one. Existing core document mutators separate primitive execution from portable shell history recording; direct SwDoc auto-history, framework Repeat, native StartAllAction layout batching/SetModified even on failure and ChkCondColls are unrepresented rather than simulated. No new no-op ApplyAction callback, dry-run clone, preparation adapter, or duplicated move algorithm.
SwEditWin assigned-outline paragraph-at-start Tab/ShiftTab must call the actual shell OutlineUpDown in eligible directions and own the key, replacing return-false unsupported fallback; retain native list-before-table-before-outline priority, top/bottom limits and ordinary text fallback, no browser heuristics. Actual native gap/creation-order/missing-pool-assignment/multi-step/direct-level/predecessor/mixed-range/all-or-nothing/ring-short-circuit/inverse-history/current-numeric-slot/preserved format and text/cell cases, mounted actual DOM/session caret/styles/history, production Chromium1280/390 heading Tab/ShiftTab/editing/history and valid locally generated ODT import/export/fresh-context reopen.12 semantic paths,6 production owners including2 new partial native owners.429 prior testfiles:428 byte-identical; only exact source-confirmed four-case formerly unsupported outline expectation/title/comment/text/style correction in native-list-tab.test.ts, preserve all other cases/bytes/assertions.253 prior runtime semantic states/defaults/classes/IO deviations/evidence preserved;2 new partial unverified owners=255 modules, no full-module/broad parity promotion. Conscious save/open/recovery deviations unchanged.
Six initial statics then ONE full upstream-absent build/app/inventory/scripts/Chromium profile via in-repo vendor rename try/finally restore. Only original failed/genuinely new cases or failed/changed-file checks afterward; no passing/full profile replay. Actual100%app/inventory L/S/F/B, exact failures/errors/counts/hashes persisted before assertions, skipped=skipped. Five restored source audits, exact scope/prior-tests/metadata/sourcehash/AP ignored-inclusive/doctor/routing/diffcheck; same current agent explicit EVALUATOR exact semantic SHA pass, canonical meaningful finish and whole parent Findings append, clean tracked/untracked main. AP bounded English prose/counts/hashes/outcomes/exact failed names only; no sources/helpers/generators/Python/probes/binaries/rawdiffs/sourceframes/rawdiagnostics. No network/outside/global/subagents. Previous166 verified progress; parent DOING, goal ACTIVE; full native/core/UI/list/table parity remains unverified.
Initial single absent profile completed: build, inventory109/scripts5/Chromium141 passed; app12559 passed6failed. Source-confirmed recovery: pinned swtypes.hxx MAXLEVEL10 versus local max zero-based index9. Correct docnum count10 and prior native NumDownChangesIndent tenth-level guard in number.ts (>max index), retain same approved Tab/outline behavior contract; add genuine level8 NONE/equal-indent literal Tab, assigned heading9→10/inverse and direct9→10/inverse cases and two new production boundary Chromium1280/390 cases. Fix only failed new DOM text selection and value-based direct item preservation assertions consistent with existing SfxItemSet Clone contract. Do not replay passing cases. Remaining limits unchanged.

## Verify Steps

1. Six initial statics: npm run format:check; npm run lint; npm run typecheck; npm run check:dependencies; npm run check:docs; npm run check:file-size. Repeat onlyfailedgates or changed-file remediation.
2. ONE upstream-absent profile: npm run test:static; npm run test:coverage --workspace @vite-office/office -- --coverage.reportOnFailure; npm run test:inventory:coverage -- --coverage.reportOnFailure; npm exec -- vitest run scripts/check-source-provenance.test.ts scripts/writer-ui-resource-model.test.ts; npm exec -- playwright test --config apps/office/playwright.config.ts. In-repo vendor rename try/finallyrestore; tests neverread/invoke/compileupstream. Exactfailure/errors/countshashspersistedbeforeassertions;skipped=skipped. Onlyoriginalfailed or genuinelynewunexecutedcases afterwards;no passing/fullprofile replay. Actual100%app/inventoryL/S/F/B with source/map identity-checked counters onlyignoredappcache.
3. Verify native docnum complete represented nonmerged outline move-table algorithm: actual sorted outline range and predecessor, style creation-order ties, native lazy pool admission and skipped assignments, signed multi-step movement across gaps, direct outline increments, whole-range rejection, preserved text/char/list items and actual shell grouping/normalized rings with native short-circuit semantics. UndoRedo must call the same primitive with inverse/same offset, numeric current node slots and fixed-size delta payload rather than style snapshots. Default shell offset one. Native MAXLEVEL10 movement and level8 NONE/equal-indent literal Tab guard plus genuinely new assigned/direct ninth-to-tenth boundary cases. SwEditWin eligible heading Tab owns actual native outline operation with list/table priority and boundary text/no-op unchanged. Actual mounted DOM session/history/caret and production Chromium1280/390 ordinary Open/export/fresh-storage reopen, no runtime injection.
4.429 prior tests:428 byte-identical; exact source-confirmed old unsupported four-case outline expectation correction only in native-list-tab.test.ts.253 prior semantic states/defaults/classifications/IO exceptions/evidence preserved;2 new partial unverified owners=255 modules. No broad native or full-module promotion. Direct document auto-history/framework Repeat/failed-operation dirty flag/native layout batching/merged props/conditional collections and full KeyInput remain unverified, no fake simulation.
5. Five restored audits: npm exec -- tsx scripts/generate-writer-ui-resources.ts --check; npm run check:source-tree; npm run check:source-provenance; npm run inventory:invariants; npm run inventory:parity. Exact scope/prior-test/metadata/sourcehash/AP ignored-inclusive/doctor/routing/diffcheck, same-agent exact-SHA EVALUATOR pass, record verify/canonical meaningful finish, whole prior parent Findings append and clean tracked/untracked. Full objective stays active; conscious IO deviations unchanged.

## Verification

Pending declared checks; no full native parity claim.

## Rollback Plan

Revert only the semantic implementation commit if necessary; preserve task evidence and conscious IO deviations.

## Findings

Read-only evidence: pinned docnum.cxx SwDoc::OutlineUpDown uses actual outline index, creation-order style map and lazy adjacent pool styles, movement across occupied levels, full-range preflight, assignment/direct outline changes. Native unoutl.cxx retains numeric range and signed delta; undo reuses the same document operation with inverse offset. ednumber.cxx normalizes multiple ranges and short-circuits after first failure. Current eligible heading Tab returns false; no OutlineUpDown owner exists. Existing core primitive/shell history boundary will be retained explicitly, without fake callbacks or snapshot adapters.
