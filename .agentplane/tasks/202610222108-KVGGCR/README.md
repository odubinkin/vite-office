---
id: "202610222108-KVGGCR"
title: "Implement native internal clipboard fill and paste undo"
status: "DOING"
priority: "high"
owner: "CODER"
revision: 16
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
doc_updated_at: "2026-10-23T17:49:01.701Z"
doc_updated_by: "CODER"
description: "Block76 depends on75 and completes the kernel path needed by74 empty-marked AutoSum. Implement real clipboard document/reset/shared pool lifetime,ScClipParam,source default content-only single-cell clipboard fill through native copy contexts/column/table/document routines,and original paste undo/redo and source selection rules. Consume actual grouped formula copying from75;do not loop browser EnterData,reparse formula text,flatten groups or use alternate document/storage models. Preserve scalar/local-reference/aggregate/default format behavior;external OS clipboard,rich edit,drawings,notes,3D/matrix/nondefault paste services remain explicit. Up to110 source/test/registry/probe paths. Calc and changed shared raw100,related native/browser/Worker/ODS/history evidence and all static/build/source gates. Full all-app checkpoint80;then complete74 against its unchanged final acceptance contract."
sections:
  Summary: "Implement the original internal clipboard/PasteFromClip path required by empty-marked AutoSum instead of a repeated-cell shortcut."
  Scope: "Block76 depends on75. Real clipboard document/reset/shared pool lifetime,ScClipParam,default content-only single-cell clipboard fill through native contexts/column/table/document routines,paste undo/redo and original mark/cursor rules. Consume genuine group copying from75. Scalar/local-reference/aggregate/default-format profile;OS clipboard,rich edit,drawings,notes,external/3D/matrix and nondefault paste services stay explicit. Up to110 source/test/registry/probe paths;only calc checkout/branch,no merges,network or external writes. Then complete74 without changing its final acceptance criteria."
  Plan: "After75,port source clipboard parameter/document/pool ownership and actual copy-context/store paths,then original default PasteFromClip and native paste undo. Connect EnterAutoSum/EnterBlock,including source multi-selection fallback and selection-relative formulas;remove the corresponding74 unavailable boundary only when native behavior is present. Verify default formats,geometry,grouped references,history,ODS and browser/Worker with complete Calc and changed shared raw100 and all static/build/source gates. Full all-app checkpoint80."
  Verify Steps: "Verify original clipboard/reset/default/pool ownership and parameter values,real sparse sheet/source selection,relative/absolute formula copying and shared group behavior through the native context/store paths. Empty marked AutoSum must use actual EnterBlock/PasteFromClip and native paste undo,including multi-selection source fallback;no repeated EnterData loop,formula-source reparse or alternate workbook model. Test row/column/sheet bounds,empty/error content,default formats,style/geometry preservation,Undo/Redo and fresh ODS reopen. Complete Calc and changed shared raw100 S/B/F/L with unchanged thresholds,related consumers,actual Chromium/DOM-free Worker,production build and all type/lint/format/boundary/JSDoc/size/source/provenance/registry/resources/static/routing/doctor gates. Final74 acceptance remains required after this prerequisite. No full all-app checkpoint before80."
  Verification: "In progress,not final task acceptance. General native column/table copy and document dirty/broadcast completion pass851/851 Calc scenarios across215files with raw100 S15519/B9418/F2675/L13896;all475 captured source/test/config hashes stable. Six actual Chromium/Worker scenarios,production build,app/tools types,full Calc lint/format and static/source/registry gates pass. General document/reference orchestration,paste Undo/Redo,EnterBlock and final74 UI acceptance remain pending. Immutable checkpoint:evidence/progress-copy/manifest.json and raw.json.gz."
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

    Pre-deletion checkpoint after77 (task76 still DOING;no acceptance closure): Original SingleColumnSpanSet set/getSpans/swap/empty and the ColumnSpanSet single-column overload use the actual shared flat_segment_tree and existing toSpanArray. Native DeleteCells captures formula group extents before one shared EndListeningContext teardown and explicit purge,then unshares only top/bottom boundaries and empties real typed stores in reverse span order. Document10/table7/column4 pre-deletion cycles sparse clip tabs/source columns,visits allocated destinations only,and defers changed-span broadcasts/listener restoration. Default CONTENTS preserves patterns. No row-wise browser writes,formula-source reparse,alternate workbook,private test store edits or coverage/config changes were used.

    Command:npm run test:coverage:calc -- --coverage.reportOnFailure=true.
    Result:pass;843/843 scenarios across214 files;raw100 statements15330/15330,branches9315/9315,functions2643/2643,lines13728/13728.
    Evidence:evidence/progress-deletion/coverage.log,coverage-summary.json,coverage-final.json.gz,source-hashes.json and manifest.json;all472 captured Calc source/test/E2E/config hashes unchanged throughout this final run.
    Scope:complete current Calc profile,including the six genuine deletion scenarios and all related native contexts,groups,listeners and span algorithms. Earlier coverage1 is a diagnostic made while the table7 source partition and tests were still changing;it is not final evidence.

    Command:npx vitest run --config vitest.calc.config.ts src/sc/source/core/data/clipboard-deletion.test.ts src/sc/source/core/data/clipboard-context.test.ts src/sc/source/core/data/clipboard-formula-clone.test.ts src/sc/source/core/tool/shared-formula.test.ts src/sc/source/core/data/listener-context.test.ts src/sc/source/core/tool/group-area-listener.test.ts src/sc/inc/fstalgorithm.test.ts --reporter=default.
    Result:pass;64scenarios in7files;the final complete Calc run re-certifies their current source and assertions.
    Evidence:evidence/progress-deletion/related.log and deletion.log.
    Scope:compact span merge/clear/swap/output replacement,actual middle/full-group deletion and surviving subscriptions,purged old broadcasters,sparse source indexes,repeated source columns,empty/no-selection/missing-table/invalid-row/invalid-column/unadopted-cursor behavior,selective string/formula masks and unsupported formatter/nondefault mask boundaries.

    Command:npx playwright test e2e/calc/formula-pointing.spec.ts e2e/calc/cell-selection.spec.ts --config playwright.config.ts --project=calc.
    Result:pass;5actual Chromium/DOM-free Worker scenarios at1280/390px.
    Evidence:evidence/progress-deletion/chromium.log.
    Scope:existing formula pointing and cell/header/mouse selection UI regression;this does not certify new browser paste/fill interactions,which remain unconnected.

    Commands:npm run build;scoped full Calc ESLint and Prettier;npm run check:docs;check:file-size;check:dependencies;check:source-tree;check:source-provenance;inventory:parity:calc;check:calc-resources;node scripts/check-static-build.mjs;node .agentplane/policy/check-routing.mjs;ap doctor.
    Result:pass;registry has0semantic violations;Calc resources464commands/11menus/17dispositions.
    Evidence:corresponding immutable logs in evidence/progress-deletion. Browser/shared production code was not changed;no all-repository lint claim is made.

    Remaining acceptance:document/table/column general CopyFromClip/CopyBlockFromClip and native reference-update orchestration,dirty/broadcast completion,undo-document initialization and original paste Undo/Redo,EnterBlock/empty-marked AutoSum and final74 UI acceptance. The native single-row optimization deliberately rejects a sparse clipboard vector with size>1 even when just one sheet is populated;the general path must handle it. ScFormulaCell::UpdateReferenceOnCopy keeps compiled relative offsets;its metadata/recalc/undo steps still need their original owners rather than source text reparsing. Selective date/number deletion requires the unported formatter;nondefault paste services,rich edit/note/sparkline storage,formula-group compute cache invalidation and stream-valid shell notifications remain explicit unrepresented responsibilities. No fake cache or shell service was added. Full all-app cadence remains80;goal is active and the human stop rule after the next full checkpoint remains in force.

    General-copy/completion checkpoint (still DOING;no task acceptance closure): Original CopyCellsFromClipHandler/CopyTextAttrsFromClipHandler retain two source block passes,actual independent cached cursor values,context writeback and foreign scalar string interning. Original hinted scalar/formula setters preserve broadcast controls,actual native group/listener ownership and the hinted void versus ordinary owned-pointer result. Table2 CopyFromClip validates/clamps and uses the actual sparse source sheet supplied by its original caller. Bounded ProcessFormula dispatches native formula pointers and separate non-formula spans;ParseBlock consumes the original container-event template without copying nodes or introducing another store. Original document/table/column SetDirtyFromClip and deferred BroadcastAction/rectangular BroadcastCells coordinate real scalar and area subscriptions under actual bulk owners.

    Command:npm run test:coverage:calc -- --coverage.reportOnFailure=true.
    Result:pass;851/851scenarios across215files;raw100 statements15519/15519,branches9418/9418,functions2675/2675,lines13896/13896. All475 captured Calc source/test/E2E/config hashes remain unchanged through the final run.
    Evidence:evidence/progress-copy/manifest.json and raw.json.gz contain full original check outputs,per-file Istanbul raw coverage/summary and source hashes.
    Scope:complete current Calc profile,including eight new general-copy/completion scenarios;default numeric/string/empty/error/local-reference/grouped formula behavior,foreign string pools,sparse clip sheet2,original width/script metadata,destination patterns/geometry,hinted setter controls/returns,original first-failed cursor fallback and matrix admission boundaries,fresh ODS reopen,cached formula invalidation and existing individual/area dependents. Actual absent-sheet rectangular broadcasts and native TEMPORARY hard-recalc mode are exercised through public owners.

    Command:npx playwright test e2e/calc/clipboard-copy.spec.ts e2e/calc/formula-pointing.spec.ts e2e/calc/cell-selection.spec.ts --config playwright.config.ts --project=calc.
    Result:pass;6actual Chromium/DOM-free Worker scenarios. The new clipboard case runs identical actual pre-deletion,table/column copy,listener,dirty and deferred broadcast owners in both runtimes and compares21/34dependency results,relocated formula and sparse source index. The other five re-certify mouse formula pointing,cell/header selection and input/history behavior.
    Evidence:chromium-worker output in the immutable raw archive.
    Scope:real production owners,without browser DOM substitutes,test globals in shipped production code,alternate documents,source formula reparsing or repeated browser EnterData writes. This is core phase acceptance,not completion of the unconnected document-level paste/Undo/UI entry point.

    Commands:npm run build;app/tools TypeScript;full Calc scoped ESLint/Prettier;JSDoc;file size;module boundaries;source tree;source provenance;Calc registry/resources;static bundle smoke;routing;ap doctor.
    Result:pass;Calc registry0semantic violations. Immutable exact commands and complete outputs are in progress-copy/raw.json.gz. Source/test/registry/probe cumulative task76 scope63/110. No shared/browser production files,coverage thresholds,coverage exclusions or ignore pragmas were changed. Full all-application replay remains deferred to80 per human cadence;this checkpoint does not certify broad repository lint or unrelated application suites.

    Diagnostics repaired within scope:fixtures now use the genuine precompiled matrix metadata constructor and the public TEMPORARY enum;broadcast control checks inspect the actual dirty flag without invoking unavailable locale string-to-number conversion. Handler fallback tests use fresh real contexts,retaining CALC-257 failed-initialization caching and avoiding consumption of undefined native cursor values. coverage1 was diagnostic (one missing absent-sheet branch);the final raw100 run covers it. No production policy or check was weakened.

    Remaining unchanged acceptance:original general document CopyFromClip/CopyBlockFromClip and reference-update orchestration;real undo-document initialization and paste Undo/Redo;EnterBlock/empty-marked AutoSum and final74 UI acceptance. Number-format inheritance,full formatter/note/edit/drawing services,group-compute cache invalidation and stream-valid/UNO shell notifications remain explicit unrepresented services rather than fake owners. Final default-profile behavior and original contract gaps still need review before finishing76. Task74 depends on76;77 is already done. Goal remains active;the stop rule after the next full all-app checkpoint remains in force.
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

In progress,not final task acceptance. General native column/table copy and document dirty/broadcast completion pass851/851 Calc scenarios across215files with raw100 S15519/B9418/F2675/L13896;all475 captured source/test/config hashes stable. Six actual Chromium/Worker scenarios,production build,app/tools types,full Calc lint/format and static/source/registry gates pass. General document/reference orchestration,paste Undo/Redo,EnterBlock and final74 UI acceptance remain pending. Immutable checkpoint:evidence/progress-copy/manifest.json and raw.json.gz.

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

Pre-deletion checkpoint after77 (task76 still DOING;no acceptance closure): Original SingleColumnSpanSet set/getSpans/swap/empty and the ColumnSpanSet single-column overload use the actual shared flat_segment_tree and existing toSpanArray. Native DeleteCells captures formula group extents before one shared EndListeningContext teardown and explicit purge,then unshares only top/bottom boundaries and empties real typed stores in reverse span order. Document10/table7/column4 pre-deletion cycles sparse clip tabs/source columns,visits allocated destinations only,and defers changed-span broadcasts/listener restoration. Default CONTENTS preserves patterns. No row-wise browser writes,formula-source reparse,alternate workbook,private test store edits or coverage/config changes were used.

Command:npm run test:coverage:calc -- --coverage.reportOnFailure=true.
Result:pass;843/843 scenarios across214 files;raw100 statements15330/15330,branches9315/9315,functions2643/2643,lines13728/13728.
Evidence:evidence/progress-deletion/coverage.log,coverage-summary.json,coverage-final.json.gz,source-hashes.json and manifest.json;all472 captured Calc source/test/E2E/config hashes unchanged throughout this final run.
Scope:complete current Calc profile,including the six genuine deletion scenarios and all related native contexts,groups,listeners and span algorithms. Earlier coverage1 is a diagnostic made while the table7 source partition and tests were still changing;it is not final evidence.

Command:npx vitest run --config vitest.calc.config.ts src/sc/source/core/data/clipboard-deletion.test.ts src/sc/source/core/data/clipboard-context.test.ts src/sc/source/core/data/clipboard-formula-clone.test.ts src/sc/source/core/tool/shared-formula.test.ts src/sc/source/core/data/listener-context.test.ts src/sc/source/core/tool/group-area-listener.test.ts src/sc/inc/fstalgorithm.test.ts --reporter=default.
Result:pass;64scenarios in7files;the final complete Calc run re-certifies their current source and assertions.
Evidence:evidence/progress-deletion/related.log and deletion.log.
Scope:compact span merge/clear/swap/output replacement,actual middle/full-group deletion and surviving subscriptions,purged old broadcasters,sparse source indexes,repeated source columns,empty/no-selection/missing-table/invalid-row/invalid-column/unadopted-cursor behavior,selective string/formula masks and unsupported formatter/nondefault mask boundaries.

Command:npx playwright test e2e/calc/formula-pointing.spec.ts e2e/calc/cell-selection.spec.ts --config playwright.config.ts --project=calc.
Result:pass;5actual Chromium/DOM-free Worker scenarios at1280/390px.
Evidence:evidence/progress-deletion/chromium.log.
Scope:existing formula pointing and cell/header/mouse selection UI regression;this does not certify new browser paste/fill interactions,which remain unconnected.

Commands:npm run build;scoped full Calc ESLint and Prettier;npm run check:docs;check:file-size;check:dependencies;check:source-tree;check:source-provenance;inventory:parity:calc;check:calc-resources;node scripts/check-static-build.mjs;node .agentplane/policy/check-routing.mjs;ap doctor.
Result:pass;registry has0semantic violations;Calc resources464commands/11menus/17dispositions.
Evidence:corresponding immutable logs in evidence/progress-deletion. Browser/shared production code was not changed;no all-repository lint claim is made.

Remaining acceptance:document/table/column general CopyFromClip/CopyBlockFromClip and native reference-update orchestration,dirty/broadcast completion,undo-document initialization and original paste Undo/Redo,EnterBlock/empty-marked AutoSum and final74 UI acceptance. The native single-row optimization deliberately rejects a sparse clipboard vector with size>1 even when just one sheet is populated;the general path must handle it. ScFormulaCell::UpdateReferenceOnCopy keeps compiled relative offsets;its metadata/recalc/undo steps still need their original owners rather than source text reparsing. Selective date/number deletion requires the unported formatter;nondefault paste services,rich edit/note/sparkline storage,formula-group compute cache invalidation and stream-valid shell notifications remain explicit unrepresented responsibilities. No fake cache or shell service was added. Full all-app cadence remains80;goal is active and the human stop rule after the next full checkpoint remains in force.

General-copy/completion checkpoint (still DOING;no task acceptance closure): Original CopyCellsFromClipHandler/CopyTextAttrsFromClipHandler retain two source block passes,actual independent cached cursor values,context writeback and foreign scalar string interning. Original hinted scalar/formula setters preserve broadcast controls,actual native group/listener ownership and the hinted void versus ordinary owned-pointer result. Table2 CopyFromClip validates/clamps and uses the actual sparse source sheet supplied by its original caller. Bounded ProcessFormula dispatches native formula pointers and separate non-formula spans;ParseBlock consumes the original container-event template without copying nodes or introducing another store. Original document/table/column SetDirtyFromClip and deferred BroadcastAction/rectangular BroadcastCells coordinate real scalar and area subscriptions under actual bulk owners.

Command:npm run test:coverage:calc -- --coverage.reportOnFailure=true.
Result:pass;851/851scenarios across215files;raw100 statements15519/15519,branches9418/9418,functions2675/2675,lines13896/13896. All475 captured Calc source/test/E2E/config hashes remain unchanged through the final run.
Evidence:evidence/progress-copy/manifest.json and raw.json.gz contain full original check outputs,per-file Istanbul raw coverage/summary and source hashes.
Scope:complete current Calc profile,including eight new general-copy/completion scenarios;default numeric/string/empty/error/local-reference/grouped formula behavior,foreign string pools,sparse clip sheet2,original width/script metadata,destination patterns/geometry,hinted setter controls/returns,original first-failed cursor fallback and matrix admission boundaries,fresh ODS reopen,cached formula invalidation and existing individual/area dependents. Actual absent-sheet rectangular broadcasts and native TEMPORARY hard-recalc mode are exercised through public owners.

Command:npx playwright test e2e/calc/clipboard-copy.spec.ts e2e/calc/formula-pointing.spec.ts e2e/calc/cell-selection.spec.ts --config playwright.config.ts --project=calc.
Result:pass;6actual Chromium/DOM-free Worker scenarios. The new clipboard case runs identical actual pre-deletion,table/column copy,listener,dirty and deferred broadcast owners in both runtimes and compares21/34dependency results,relocated formula and sparse source index. The other five re-certify mouse formula pointing,cell/header selection and input/history behavior.
Evidence:chromium-worker output in the immutable raw archive.
Scope:real production owners,without browser DOM substitutes,test globals in shipped production code,alternate documents,source formula reparsing or repeated browser EnterData writes. This is core phase acceptance,not completion of the unconnected document-level paste/Undo/UI entry point.

Commands:npm run build;app/tools TypeScript;full Calc scoped ESLint/Prettier;JSDoc;file size;module boundaries;source tree;source provenance;Calc registry/resources;static bundle smoke;routing;ap doctor.
Result:pass;Calc registry0semantic violations. Immutable exact commands and complete outputs are in progress-copy/raw.json.gz. Source/test/registry/probe cumulative task76 scope63/110. No shared/browser production files,coverage thresholds,coverage exclusions or ignore pragmas were changed. Full all-application replay remains deferred to80 per human cadence;this checkpoint does not certify broad repository lint or unrelated application suites.

Diagnostics repaired within scope:fixtures now use the genuine precompiled matrix metadata constructor and the public TEMPORARY enum;broadcast control checks inspect the actual dirty flag without invoking unavailable locale string-to-number conversion. Handler fallback tests use fresh real contexts,retaining CALC-257 failed-initialization caching and avoiding consumption of undefined native cursor values. coverage1 was diagnostic (one missing absent-sheet branch);the final raw100 run covers it. No production policy or check was weakened.

Remaining unchanged acceptance:original general document CopyFromClip/CopyBlockFromClip and reference-update orchestration;real undo-document initialization and paste Undo/Redo;EnterBlock/empty-marked AutoSum and final74 UI acceptance. Number-format inheritance,full formatter/note/edit/drawing services,group-compute cache invalidation and stream-valid/UNO shell notifications remain explicit unrepresented services rather than fake owners. Final default-profile behavior and original contract gaps still need review before finishing76. Task74 depends on76;77 is already done. Goal remains active;the stop rule after the next full all-app checkpoint remains in force.
