---
id: "202610051948-V7JNNJ"
title: "Own table ring list commands in the native editing shell"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 10
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
task_kind: "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-05T19:48:08.605Z"
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
    body: "Start: repair native table-ring list commands and editing-shell ownership under existing iterative user authorization;one scoped leaf,full goal remainsactive."
events:
  -
    type: "status"
    at: "2026-10-05T19:48:09.845Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: repair native table-ring list commands and editing-shell ownership under existing iterative user authorization;one scoped leaf,full goal remainsactive."
doc_version: 3
doc_updated_at: "2026-10-05T19:48:09.845Z"
doc_updated_by: "CODER"
description: "Iteration162 repair actual table row/column/disjoint ring list commands, native numbering state and redundant level route under standing user authorization;previous161verifiedprogress;parent202609240501-C9TN6M remainsDOING."
sections:
  Summary: "Repair table selection ring numbering behavior with native editing-shell ownership;one bounded iterative task,full broadgoal remainsactive."
  Scope: |-
    apps/office/src/sw/source/core/edit/ednumber.ts
    apps/office/src/sw/source/uibase/wrtsh/wrtsh1.ts
    apps/office/src/sw/source/uibase/shells/listsh.ts
    apps/office/src/sw/source/uibase/shells/textsh1.ts
    apps/office/src/sw/source/core/undo/unnum.ts
    apps/office/src/sw/source/core/doc/native-list-level-range.test.ts
    apps/office/src/sw/source/core/undo/native-list-rule-range.test.ts
    apps/office/src/sw/source/core/edit/native-list-ring.test.ts
    apps/office/e2e/writer-table-row-lists.spec.ts
    docs/program/source-provenance.json
    docs/program/parity/runtime-inventory.json
    416prior tests:414byteidentical2boundedAPI/ownerfixturecorrections.250states/defaults/classifications/IOexceptions/prior evidencepreserved exceptdeletedhelperexport/owneranchormigration. No external/registeredIO changes.
  Plan: "Iteration162 repair existing table-row/ring list commands and native numbering state ownership. Introduce actual abstract SwEditShell owner in source-native ednumber.ts (SwModify broadcaster base remains represented; full SwCursorShell inheritance unverified), SwWrtShell inherits it. Native HasNumber/HasBullet and SelectionHasNumber/SelectionHasBullet traverse actual ordered SwPaM rings, ignore structural and eligible empty nodes exactly, preserve native per-ring break semantics and reserved Outline uncounted exception using existing doc named-rule lookup; default outline factory/layout/merged unsupported. Move SetCurNumRule and DelNumRules into core shell: every actual ring range, one created list ID reused after first range, native rule/count/reset flags, shared SfxListUndoAction/current numeric InsNum or DelNum history, original displayed table cursor preserved. Port exact SwPamRanges sorted numeric source insertion/containment/adjacency/same-start semantics and SetPam endpoint0 to native NumUpDown ring normalization and native range-specific delta history; existing single-range action API/comment/payload unchanged, optional borrowed native PaM separately captured numerically while command cursor boundary stays whole. UI/list shell directly calls core methods for state/toggle/removal/level; remove WriterIndentTarget/canChangeWriterParagraphListLevel/changeWriterParagraphListLevel wrappers and cyclic wrtsh→listsh→helper→doc level route. Existing text indent availability calls inherited core owner; no TextRuns/new adapter/DTO/helper module. ContinueNumbering per-ring/complete native rulefactory/outline activation/client/SwHistory/documentowned undo remain explicitly open; do not claim all list/UI parity.11paths,5owner metadata records;416prior testfiles preserve414byteidentical and2bounded old API/owner fixture corrections. Old source marker for deleted helper explicitly replaced by native owner marker, local export lists updated, other prior evidence/250states/defaults/classifications/conscious save/open/recovery exceptions preserved. New actual table row/column/disjoint body/empty/outline/structural/multiple ring state/sortedrange/duplicates/partial eligibility/listID/default/count/indents/neighbors/physical replacement/cursor/history assertions; Chromium real row selector lists/toggle/level/removal/UndoRedo/menu/marker behavior. Sixstatics first;ONEfull upstream-absent build/app/inventory/scripts/Chromium profile using in-repo vendor rename try/finally, exact failures/errors persisted before assertions, skipped=skipped, only failed/new cases/gates repeated/no passing replays;actual100%app/inventoryL/S/F/B. Restore before5sourceaudits;maps/results onlyignoredappcache;AP onlyboundedEnglishprose/counts/hashes/exactfailednames, no sources/helpers/Python/native probes/binaries/rawdiffs/sourceframes/diagnostics. SameagentexplicitEVALUATORexactsemanticSHApass/recordverify/meaningfulfinish/wholeparentcheckpointcleanmain. Standing iterative user core/UI/refactoring authorization, no network/outside/global/subagents. Previous161verifiedprogress,parentDOING/goalactive."
  Verify Steps: |-
    1. Six statics first: npm run format:check; npm run lint; npm run typecheck; npm run check:dependencies; npm run check:docs; npm run check:file-size. Only failed gates/changed-file remediation repeated.
    2. ONE sequential upstream-absent profile: npm run test:static; npm run test:coverage --workspace @vite-office/office -- --coverage.reportOnFailure; npm run test:inventory:coverage -- --coverage.reportOnFailure; npm exec -- vitest run scripts/check-source-provenance.test.ts scripts/writer-ui-resource-model.test.ts; npm exec -- playwright test --config apps/office/playwright.config.ts. Vendor rename in repository try/finally restore before source audits; tests never invoke/access upstream. Persist exact failures/errors before assertions, failed/new-only repeats, skipped=skipped. Actual app/inventory L/S/F/B100%; maps only ignored appcache.
    3. Native document rule0/1/2/4/8flags, lookup/add/assignment/listID, collapsed direct/style rule policy, inclusive body/cell/mixed ranges, counted reset, indent reset only labelalignment;actualshell toggle/continue grouped currentnumeric InsNum history,cursor/native replacement/independence/foreigndoc/neighbors.416prior testfiles:414byteidentical,2bounded source-confirmed API/owner fixture corrections;250states/defaults/classifications/consciousIOexceptions/prior evidence preserved;11paths/additive5owners. ActualChromium selectedrange labels/menu/undo/redo/currentcaret. Fullnative SwHistory/documentundo/client/layout/merged/Repeat/broadUI unverified.
    4. After restoration: npm exec -- tsx scripts/generate-writer-ui-resources.ts --check; npm run check:source-tree; npm run check:source-provenance; npm run inventory:invariants; npm run inventory:parity. Scope/prior tests/defaults/APartifact audit,doctor/routing, same-agent explicit EVALUATOR exact semantic SHApass,recordedverify/meaningfulfinish/parentcheckpoint clean main.
    5. Native core editing owner and exact SwPamRanges/ring state,SetCurNumRule one-list-ID,DelNumRules/NumUpDown disjoint actual table boxes;no cyclic/helper level adapters. Five owner symbols/evidence migration only;414prior tests unchanged,2boundedAPI corrections. Full history/factory/client/layout/ContinueNumbering rings unverified.
  Verification: "Pending declared checks; no upstream test/runtime dependency."
  Rollback Plan: "Revert only intentional semantic task commit; retain lifecycle evidence and recorded limitations."
  Findings: "Previous iteration161 verifiedprogress. Source inspection confirms SetCurNumRule ring traversal/single created list reuse, native state empty/ring semantics and NumUpDown normalized SwPamRanges. Current list toggle/state/level process first PaM or browser family consensus; real table selector creates ring. Exact old helper source evidence marker must migrate rather than preserve a dead-code marker. Full native SwCursorShell/client/history/factory/layout/ContinueNumbering rings remain unverified."
id_source: "generated"
---
## Summary

Repair table selection ring numbering behavior with native editing-shell ownership;one bounded iterative task,full broadgoal remainsactive.

## Scope

apps/office/src/sw/source/core/edit/ednumber.ts
apps/office/src/sw/source/uibase/wrtsh/wrtsh1.ts
apps/office/src/sw/source/uibase/shells/listsh.ts
apps/office/src/sw/source/uibase/shells/textsh1.ts
apps/office/src/sw/source/core/undo/unnum.ts
apps/office/src/sw/source/core/doc/native-list-level-range.test.ts
apps/office/src/sw/source/core/undo/native-list-rule-range.test.ts
apps/office/src/sw/source/core/edit/native-list-ring.test.ts
apps/office/e2e/writer-table-row-lists.spec.ts
docs/program/source-provenance.json
docs/program/parity/runtime-inventory.json
416prior tests:414byteidentical2boundedAPI/ownerfixturecorrections.250states/defaults/classifications/IOexceptions/prior evidencepreserved exceptdeletedhelperexport/owneranchormigration. No external/registeredIO changes.

## Plan

Iteration162 repair existing table-row/ring list commands and native numbering state ownership. Introduce actual abstract SwEditShell owner in source-native ednumber.ts (SwModify broadcaster base remains represented; full SwCursorShell inheritance unverified), SwWrtShell inherits it. Native HasNumber/HasBullet and SelectionHasNumber/SelectionHasBullet traverse actual ordered SwPaM rings, ignore structural and eligible empty nodes exactly, preserve native per-ring break semantics and reserved Outline uncounted exception using existing doc named-rule lookup; default outline factory/layout/merged unsupported. Move SetCurNumRule and DelNumRules into core shell: every actual ring range, one created list ID reused after first range, native rule/count/reset flags, shared SfxListUndoAction/current numeric InsNum or DelNum history, original displayed table cursor preserved. Port exact SwPamRanges sorted numeric source insertion/containment/adjacency/same-start semantics and SetPam endpoint0 to native NumUpDown ring normalization and native range-specific delta history; existing single-range action API/comment/payload unchanged, optional borrowed native PaM separately captured numerically while command cursor boundary stays whole. UI/list shell directly calls core methods for state/toggle/removal/level; remove WriterIndentTarget/canChangeWriterParagraphListLevel/changeWriterParagraphListLevel wrappers and cyclic wrtsh→listsh→helper→doc level route. Existing text indent availability calls inherited core owner; no TextRuns/new adapter/DTO/helper module. ContinueNumbering per-ring/complete native rulefactory/outline activation/client/SwHistory/documentowned undo remain explicitly open; do not claim all list/UI parity.11paths,5owner metadata records;416prior testfiles preserve414byteidentical and2bounded old API/owner fixture corrections. Old source marker for deleted helper explicitly replaced by native owner marker, local export lists updated, other prior evidence/250states/defaults/classifications/conscious save/open/recovery exceptions preserved. New actual table row/column/disjoint body/empty/outline/structural/multiple ring state/sortedrange/duplicates/partial eligibility/listID/default/count/indents/neighbors/physical replacement/cursor/history assertions; Chromium real row selector lists/toggle/level/removal/UndoRedo/menu/marker behavior. Sixstatics first;ONEfull upstream-absent build/app/inventory/scripts/Chromium profile using in-repo vendor rename try/finally, exact failures/errors persisted before assertions, skipped=skipped, only failed/new cases/gates repeated/no passing replays;actual100%app/inventoryL/S/F/B. Restore before5sourceaudits;maps/results onlyignoredappcache;AP onlyboundedEnglishprose/counts/hashes/exactfailednames, no sources/helpers/Python/native probes/binaries/rawdiffs/sourceframes/diagnostics. SameagentexplicitEVALUATORexactsemanticSHApass/recordverify/meaningfulfinish/wholeparentcheckpointcleanmain. Standing iterative user core/UI/refactoring authorization, no network/outside/global/subagents. Previous161verifiedprogress,parentDOING/goalactive.

## Verify Steps

1. Six statics first: npm run format:check; npm run lint; npm run typecheck; npm run check:dependencies; npm run check:docs; npm run check:file-size. Only failed gates/changed-file remediation repeated.
2. ONE sequential upstream-absent profile: npm run test:static; npm run test:coverage --workspace @vite-office/office -- --coverage.reportOnFailure; npm run test:inventory:coverage -- --coverage.reportOnFailure; npm exec -- vitest run scripts/check-source-provenance.test.ts scripts/writer-ui-resource-model.test.ts; npm exec -- playwright test --config apps/office/playwright.config.ts. Vendor rename in repository try/finally restore before source audits; tests never invoke/access upstream. Persist exact failures/errors before assertions, failed/new-only repeats, skipped=skipped. Actual app/inventory L/S/F/B100%; maps only ignored appcache.
3. Native document rule0/1/2/4/8flags, lookup/add/assignment/listID, collapsed direct/style rule policy, inclusive body/cell/mixed ranges, counted reset, indent reset only labelalignment;actualshell toggle/continue grouped currentnumeric InsNum history,cursor/native replacement/independence/foreigndoc/neighbors.416prior testfiles:414byteidentical,2bounded source-confirmed API/owner fixture corrections;250states/defaults/classifications/consciousIOexceptions/prior evidence preserved;11paths/additive5owners. ActualChromium selectedrange labels/menu/undo/redo/currentcaret. Fullnative SwHistory/documentundo/client/layout/merged/Repeat/broadUI unverified.
4. After restoration: npm exec -- tsx scripts/generate-writer-ui-resources.ts --check; npm run check:source-tree; npm run check:source-provenance; npm run inventory:invariants; npm run inventory:parity. Scope/prior tests/defaults/APartifact audit,doctor/routing, same-agent explicit EVALUATOR exact semantic SHApass,recordedverify/meaningfulfinish/parentcheckpoint clean main.
5. Native core editing owner and exact SwPamRanges/ring state,SetCurNumRule one-list-ID,DelNumRules/NumUpDown disjoint actual table boxes;no cyclic/helper level adapters. Five owner symbols/evidence migration only;414prior tests unchanged,2boundedAPI corrections. Full history/factory/client/layout/ContinueNumbering rings unverified.

## Verification

Pending declared checks; no upstream test/runtime dependency.

## Rollback Plan

Revert only intentional semantic task commit; retain lifecycle evidence and recorded limitations.

## Findings

Previous iteration161 verifiedprogress. Source inspection confirms SetCurNumRule ring traversal/single created list reuse, native state empty/ring semantics and NumUpDown normalized SwPamRanges. Current list toggle/state/level process first PaM or browser family consensus; real table selector creates ring. Exact old helper source evidence marker must migrate rather than preserve a dead-code marker. Full native SwCursorShell/client/history/factory/layout/ContinueNumbering rings remain unverified.
