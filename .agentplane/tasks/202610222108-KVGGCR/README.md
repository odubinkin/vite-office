---
id: "202610222108-KVGGCR"
title: "Implement native internal clipboard fill and paste undo"
status: "DOING"
priority: "high"
owner: "CODER"
revision: 12
origin:
  system: "manual"
depends_on:
  - "202610222107-NCTYV6"
tags:
  - "calc"
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-22T21:10:11.213Z"
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
    body: "Start: continue direct-mode task in current checkout."
events:
  -
    type: "status"
    at: "2026-10-23T12:07:27.066Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: continue direct-mode task in current checkout."
doc_version: 3
doc_updated_at: "2026-10-23T12:33:20.341Z"
doc_updated_by: "CODER"
description: "Block76 depends on75 and completes the kernel path needed by74 empty-marked AutoSum. Implement real clipboard document/reset/shared pool lifetime,ScClipParam,source default content-only single-cell clipboard fill through native copy contexts/column/table/document routines,and original paste undo/redo and source selection rules. Consume actual grouped formula copying from75;do not loop browser EnterData,reparse formula text,flatten groups or use alternate document/storage models. Preserve scalar/local-reference/aggregate/default format behavior;external OS clipboard,rich edit,drawings,notes,3D/matrix/nondefault paste services remain explicit. Up to110 source/test/registry/probe paths. Calc and changed shared raw100,related native/browser/Worker/ODS/history evidence and all static/build/source gates. Full all-app checkpoint80;then complete74 against its unchanged final acceptance contract."
sections:
  Summary: "Implement the original internal clipboard/PasteFromClip path required by empty-marked AutoSum instead of a repeated-cell shortcut."
  Scope: "Block76 depends on75. Real clipboard document/reset/shared pool lifetime,ScClipParam,default content-only single-cell clipboard fill through native contexts/column/table/document routines,paste undo/redo and original mark/cursor rules. Consume genuine group copying from75. Scalar/local-reference/aggregate/default-format profile;OS clipboard,rich edit,drawings,notes,external/3D/matrix and nondefault paste services stay explicit. Up to110 source/test/registry/probe paths;only calc checkout/branch,no merges,network or external writes. Then complete74 without changing its final acceptance criteria."
  Plan: "After75,port source clipboard parameter/document/pool ownership and actual copy-context/store paths,then original default PasteFromClip and native paste undo. Connect EnterAutoSum/EnterBlock,including source multi-selection fallback and selection-relative formulas;remove the corresponding74 unavailable boundary only when native behavior is present. Verify default formats,geometry,grouped references,history,ODS and browser/Worker with complete Calc and changed shared raw100 and all static/build/source gates. Full all-app checkpoint80."
  Verify Steps: "Verify original clipboard/reset/default/pool ownership and parameter values,real sparse sheet/source selection,relative/absolute formula copying and shared group behavior through the native context/store paths. Empty marked AutoSum must use actual EnterBlock/PasteFromClip and native paste undo,including multi-selection source fallback;no repeated EnterData loop,formula-source reparse or alternate workbook model. Test row/column/sheet bounds,empty/error content,default formats,style/geometry preservation,Undo/Redo and fresh ODS reopen. Complete Calc and changed shared raw100 S/B/F/L with unchanged thresholds,related consumers,actual Chromium/DOM-free Worker,production build and all type/lint/format/boundary/JSDoc/size/source/provenance/registry/resources/static/routing/doctor gates. Final74 acceptance remains required after this prerequisite. No full all-app checkpoint before80."
  Verification: "In progress,not verified. Source-pinned800-scenario Calc diagnostic passes tests but raw100 remains pending;current71related scenarios and type/lint/format/docs/size/boundary/provenance/registry checks pass. Native clipboard resource/context/grouped-column foundation is implemented;document paste/history/EnterBlock and final browser/Worker/ODS/raw100 acceptance remain required."
  Rollback Plan: "Revert only task-owned clipboard/paste commits,preserving completed75 and the74 UI checkpoint."
  Findings: |-
    Task76 remains DOING and unverified;this is a source-bound implementation checkpoint,not final paste/UI acceptance.

    Implemented native SharePooledResources and ResetClip/InitClipPtrs with actual shared ScPoolHelper,SharedStringPool and lazy CellAttributeHelper identities;source-selected sheets retain null slots and original indexes,including the explicit-sheet native baeh name and RTL copy. Source options use the existing ScDocOptions/ScViewOptions value owners;ScPoolHelper retains actual formatter options without allocating an unavailable formatter. Native Clear explicitly releases observable formula/attribute owners before GC releases sheets. Existing sparse-sheet traversal sites now retain original null guards.

    Implemented original ColumnBlockPositionSet-backed ClipContextBase/CopyFromClipContext for default CONTENTS,original flag values,real ScCellValue/text metadata storage and ColumnSpanSet deferred listening. Native column4 CloneFormulaCell uses genuine per-span ScFormulaCellGroup code,bulk mdds insertion and neighboring group joins;single-cell column repetition handles represented values,strings,empty and grouped formulas. Native temporary-document/inserting guards suppress premature listening and broadcasting. No alternate workbook,formula-source reparse,browser EnterData loop or physical reference-count facade is used.

    Command:npx vitest run --config vitest.calc.config.ts --coverage --coverage.reportOnFailure=true --maxWorkers=2 --coverage.reportsDirectory=/Users/odubinkin/Projects/vite-office-calc/output/playwright/task76-progress-coverage --reporter=default --reporter=json --outputFile.json=/Users/odubinkin/Projects/vite-office-calc/output/playwright/task76-progress-results.json.
    Result:800/800 scenarios across206physical files pass;raw100 gate correctly fails at this intermediate source profile.
    Evidence:14590/14594statements,8812/8818branches,2508/2510functions,13061/13064lines;immutable source/report/failure archive evidence/progress-resources. This precedes the unchanged selection-frame definition partition,static repairs and two additional boundary scenarios;it is not current-source final coverage. No thresholds,exclusions or coverage ignores changed.
    Scope:Calc-specific diagnostic,not another all-app checkpoint. Full final Calc/changed-shared raw100 remains required.

    Command:npx vitest run --config vitest.calc.config.ts src/sc/source/core/data/clipboard-resources.test.ts src/sc/source/core/data/clipboard-formula-clone.test.ts src/sc/source/core/data/clipboard-context.test.ts src/sc/source/core/data/formula-copy.test.ts src/sc/source/core/tool/shared-formula.test.ts src/sc/source/core/tool/group-area-listener.test.ts src/sc/source/core/data/selection-frame.test.ts src/sc/browser/presentation/calc-borders.test.tsx --reporter=default --reporter=json --outputFile.json=/Users/odubinkin/Projects/vite-office-calc/output/playwright/task76-checkpoint-results.json.
    Result:71/71scenarios across7physical matched files pass after static repairs and two genuine public-boundary additions. The selection-frame filename was unmatched;existing mounted border controls exercise its actual definition.
    Evidence:13new clipboard/resource/context/column scenarios and58existing related cases. Genuine matrix metadata is rejected at the scalar clipboard boundary;an actual unadopted column retains the native failed-cursor early return. Copied groups recalculate through actual listeners.
    Scope:Current native clipboard foundation and unchanged frame-definition partition. Native GetSelectionFrame body was moved onto the same ScDocument instance through the existing out-of-class documen7 partition to keep document.ts below1000lines;no frame state or behavior was changed.

    Current typecheck,scoped ESLint,Prettier,JSDoc,size,module-boundary,source-provenance and Calc registry checks pass. Earlier diagnostic static failures are retained in evidence/progress-resources. Current counted source/test/registry scope39/110. Production build/static evidence is appended with the checkpoint archive.

    Remaining work:original document/table CopyFromClip/CopyBlockFromClip,including the general path for sparse source indexes beyond0;real deletion/reference/deferred-listening/broadcast orchestration;Undo-document initialization and original paste undo/redo;EnterBlock/AutoSum and final74 acceptance;current complete Calc/changed-shared raw100,ODS reopen,browser/DOM-free Worker and remaining acceptance gates. Do not shortcut those source services with repeated browser writes. Full all-app cadence remains80;the previous stop condition was fulfilled at75 and the human explicitly resumed after merging. Goal remains active. The large-file ODS autosave issue remains queued unchanged.
id_source: "generated"
---
## Summary

Implement the original internal clipboard/PasteFromClip path required by empty-marked AutoSum instead of a repeated-cell shortcut.

## Scope

Block76 depends on75. Real clipboard document/reset/shared pool lifetime,ScClipParam,default content-only single-cell clipboard fill through native contexts/column/table/document routines,paste undo/redo and original mark/cursor rules. Consume genuine group copying from75. Scalar/local-reference/aggregate/default-format profile;OS clipboard,rich edit,drawings,notes,external/3D/matrix and nondefault paste services stay explicit. Up to110 source/test/registry/probe paths;only calc checkout/branch,no merges,network or external writes. Then complete74 without changing its final acceptance criteria.

## Plan

After75,port source clipboard parameter/document/pool ownership and actual copy-context/store paths,then original default PasteFromClip and native paste undo. Connect EnterAutoSum/EnterBlock,including source multi-selection fallback and selection-relative formulas;remove the corresponding74 unavailable boundary only when native behavior is present. Verify default formats,geometry,grouped references,history,ODS and browser/Worker with complete Calc and changed shared raw100 and all static/build/source gates. Full all-app checkpoint80.

## Verify Steps

Verify original clipboard/reset/default/pool ownership and parameter values,real sparse sheet/source selection,relative/absolute formula copying and shared group behavior through the native context/store paths. Empty marked AutoSum must use actual EnterBlock/PasteFromClip and native paste undo,including multi-selection source fallback;no repeated EnterData loop,formula-source reparse or alternate workbook model. Test row/column/sheet bounds,empty/error content,default formats,style/geometry preservation,Undo/Redo and fresh ODS reopen. Complete Calc and changed shared raw100 S/B/F/L with unchanged thresholds,related consumers,actual Chromium/DOM-free Worker,production build and all type/lint/format/boundary/JSDoc/size/source/provenance/registry/resources/static/routing/doctor gates. Final74 acceptance remains required after this prerequisite. No full all-app checkpoint before80.

## Verification

In progress,not verified. Source-pinned800-scenario Calc diagnostic passes tests but raw100 remains pending;current71related scenarios and type/lint/format/docs/size/boundary/provenance/registry checks pass. Native clipboard resource/context/grouped-column foundation is implemented;document paste/history/EnterBlock and final browser/Worker/ODS/raw100 acceptance remain required.

## Rollback Plan

Revert only task-owned clipboard/paste commits,preserving completed75 and the74 UI checkpoint.

## Findings

Task76 remains DOING and unverified;this is a source-bound implementation checkpoint,not final paste/UI acceptance.

Implemented native SharePooledResources and ResetClip/InitClipPtrs with actual shared ScPoolHelper,SharedStringPool and lazy CellAttributeHelper identities;source-selected sheets retain null slots and original indexes,including the explicit-sheet native baeh name and RTL copy. Source options use the existing ScDocOptions/ScViewOptions value owners;ScPoolHelper retains actual formatter options without allocating an unavailable formatter. Native Clear explicitly releases observable formula/attribute owners before GC releases sheets. Existing sparse-sheet traversal sites now retain original null guards.

Implemented original ColumnBlockPositionSet-backed ClipContextBase/CopyFromClipContext for default CONTENTS,original flag values,real ScCellValue/text metadata storage and ColumnSpanSet deferred listening. Native column4 CloneFormulaCell uses genuine per-span ScFormulaCellGroup code,bulk mdds insertion and neighboring group joins;single-cell column repetition handles represented values,strings,empty and grouped formulas. Native temporary-document/inserting guards suppress premature listening and broadcasting. No alternate workbook,formula-source reparse,browser EnterData loop or physical reference-count facade is used.

Command:npx vitest run --config vitest.calc.config.ts --coverage --coverage.reportOnFailure=true --maxWorkers=2 --coverage.reportsDirectory=/Users/odubinkin/Projects/vite-office-calc/output/playwright/task76-progress-coverage --reporter=default --reporter=json --outputFile.json=/Users/odubinkin/Projects/vite-office-calc/output/playwright/task76-progress-results.json.
Result:800/800 scenarios across206physical files pass;raw100 gate correctly fails at this intermediate source profile.
Evidence:14590/14594statements,8812/8818branches,2508/2510functions,13061/13064lines;immutable source/report/failure archive evidence/progress-resources. This precedes the unchanged selection-frame definition partition,static repairs and two additional boundary scenarios;it is not current-source final coverage. No thresholds,exclusions or coverage ignores changed.
Scope:Calc-specific diagnostic,not another all-app checkpoint. Full final Calc/changed-shared raw100 remains required.

Command:npx vitest run --config vitest.calc.config.ts src/sc/source/core/data/clipboard-resources.test.ts src/sc/source/core/data/clipboard-formula-clone.test.ts src/sc/source/core/data/clipboard-context.test.ts src/sc/source/core/data/formula-copy.test.ts src/sc/source/core/tool/shared-formula.test.ts src/sc/source/core/tool/group-area-listener.test.ts src/sc/source/core/data/selection-frame.test.ts src/sc/browser/presentation/calc-borders.test.tsx --reporter=default --reporter=json --outputFile.json=/Users/odubinkin/Projects/vite-office-calc/output/playwright/task76-checkpoint-results.json.
Result:71/71scenarios across7physical matched files pass after static repairs and two genuine public-boundary additions. The selection-frame filename was unmatched;existing mounted border controls exercise its actual definition.
Evidence:13new clipboard/resource/context/column scenarios and58existing related cases. Genuine matrix metadata is rejected at the scalar clipboard boundary;an actual unadopted column retains the native failed-cursor early return. Copied groups recalculate through actual listeners.
Scope:Current native clipboard foundation and unchanged frame-definition partition. Native GetSelectionFrame body was moved onto the same ScDocument instance through the existing out-of-class documen7 partition to keep document.ts below1000lines;no frame state or behavior was changed.

Current typecheck,scoped ESLint,Prettier,JSDoc,size,module-boundary,source-provenance and Calc registry checks pass. Earlier diagnostic static failures are retained in evidence/progress-resources. Current counted source/test/registry scope39/110. Production build/static evidence is appended with the checkpoint archive.

Remaining work:original document/table CopyFromClip/CopyBlockFromClip,including the general path for sparse source indexes beyond0;real deletion/reference/deferred-listening/broadcast orchestration;Undo-document initialization and original paste undo/redo;EnterBlock/AutoSum and final74 acceptance;current complete Calc/changed-shared raw100,ODS reopen,browser/DOM-free Worker and remaining acceptance gates. Do not shortcut those source services with repeated browser writes. Full all-app cadence remains80;the previous stop condition was fulfilled at75 and the human explicitly resumed after merging. Goal remains active. The large-file ODS autosave issue remains queued unchanged.
