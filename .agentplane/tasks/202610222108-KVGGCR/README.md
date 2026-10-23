---
id: "202610222108-KVGGCR"
title: "Implement native internal clipboard fill and paste undo"
status: "DOING"
priority: "high"
owner: "CODER"
revision: 21
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
doc_updated_at: "2026-10-23T19:28:33.716Z"
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

    Task76 reference-copy checkpoint: preserved native RefUpdateContext/RefErrorContext/UpdatedRangeNames and sparse ColumnSet ownership/defaults,actual document/table/column COPY traversal and both shared-formula boundary joins. Added native ScFormulaCell Compile/CompileTokenArray,copy-update metadata,on-reference-move dirty handling and oldest undo-formula retention. The ordinary source-string constructor now calls the actual Compile path;clipboard/undo source-string construction retains the original empty-array early return. Existing undo-error vectors now provide actual precompiled arrays. Shared FormulaTokenArray::AddBad owns a non-interned native shared string. CALC-260 documents insertion-only global-name normalization. Non-copy engines and unavailable names/printing/drawing/validation/embedded/UNO/formatter services remain unported;no alternate workbook or relocation by formula-source reparsing was introduced. Native bad/name/subtotal opcodes retain the actual shared compiler admission boundary;no fake subtotal registration owner.

    Command:npx vitest run --config vitest.calc.config.ts --coverage --coverage.reportsDirectory=../../output/playwright/task76-reference-final-coverage.
    Result:863/863 scenarios across216 files pass;current raw100 S15708/B9558/F2707/L14063. Twelve new reference/compile/undo/context scenarios plus corrected existing undo-source construction. No thresholds,exclusions or coverage ignores changed.
    Scope:complete Calc only;not the all-application checkpoint. Earlier failed diagnostic reports and the prior863/raw100 report before the final constructor correction are retained as historical evidence,not current-source acceptance.

    Command:npx vitest run --config vitest.shared.config.ts src/formula/inc/tokenarray.test.ts --coverage --coverage.include=src/formula/source/core/api/token.array.ts --coverage.reportsDirectory=../../output/playwright/task76-reference-shared-final-coverage.
    Result:3/3 shared native-array scenarios pass;changed shared owner raw100 S234/B84/F69/L201.
    Scope:the actual changed shared token-array owner and existing consumers,not a complete shared-suite replay.

    Command:npx playwright test e2e/calc/clipboard-copy.spec.ts e2e/calc/formula-pointing.spec.ts e2e/calc/cell-selection.spec.ts --config playwright.config.ts --project=calc.
    Result:6/6 actual Chromium/DOM-free Worker and1280/390px UI selection/pointing scenarios pass. The clipboard probe now executes document.UpdateReference with real shared block-position caching before listener restart and deferred notifications;expected21/34 dependency values and=D6+1 remain unchanged.
    Scope:actual copied-owner graph,not completed document PasteFromClip/Undo UI behavior.

    All current app/tools types,production build,scoped Calc/changed-shared/E2E lint,changed-file format,JSDoc,size,boundary,source-tree,provenance,Calc/shared registry,resources,static,routing and doctor checks pass. Immutable evidence/progress-reference contains the logs,raw Istanbul reports and448 stable source/test/config hashes. Current task source/test/registry/probe footprint98/110. Repository-wide lint is not recertified;its previous unrelated Writer/probe failures remain outside this checkpoint.

    Remaining:general document CopyFromClip/CopyBlockFromClip and optimized document/table single-cell dispatch;actual Undo document initialization,source paste history and EnterBlock/AutoSum integration;final76 acceptance then74 acceptance. Existing number-format inheritance/formatter service boundaries still require review before76 closure. Task76 remains DOING/verification pending;task74 waits on76. Full all-application checkpoint stays80,then repairs,coverage,current-task closure and the human-requested stop. Goal remains active.

    Task76 block-copy checkpoint:original CopyBlockFromClip now cycles genuine sparse source-sheet vectors only for selected existing destinations,then processes consecutive selected sheets through actual RefUpdateContext and the shared mdds cursor cache. Default CONTENTS is the admitted context;unrepresented drawing/non-content owners are not simulated. Same-pool cut/move has an explicit pre-mutation admission failure;foreign-pool cut preserves the source skipped-reference phase. Native CopyNonFilteredFromClip uses the first populated source sheet's real FilterData segments,retains hidden rows,advances the real source cursor and preserves the signed SCROW-max count/output behavior documented in CALC-261. FirstNonFilteredRow keeps native missing-sheet/invalid/no-match sentinels;initialized segment partitions guarantee valid-row lookup,without simulating allocator/corrupt-store failures. Existing DeleteSelection body is partitioned unchanged onto the same ScDocument instance through documen7 to keep document.ts at999lines.

    Command:npx vitest run --config vitest.calc.config.ts --coverage --coverage.reportsDirectory=../../output/playwright/task76-block-calc-coverage.
    Result:870/870 scenarios across217 physical files pass;raw100 S15778/B9592/F2714/L14125. Seven new genuine owner vectors cover sparse source cycling,selected/consecutive/missing destination sheets,foreign/same-pool cut boundary,filtered/hidden rows,source/destination run limits,SCROW-max outputs,maximum source tab9999 and fresh ODS reopen with live copied relative/absolute formulas. Original ResetClip explicitly permits a missing source sheet and creates the actual sparse clipboard slot;no intervening worksheets or fake tables are allocated in the boundary vector. No thresholds,exclusions or ignores changed.
    Scope:complete Calc only,not an all-application checkpoint. Shared source is unchanged since the prior changed-owner raw100 evidence.

    Command:npx playwright test e2e/calc/clipboard-copy.spec.ts --config playwright.config.ts --project=calc.
    Result:1/1 actual Chromium/DOM-free Worker scenario passes. The probe now calls native document.CopyBlockFromClip,which includes the real reference-update phase,instead of manually composing table copy and document reference calls. Actual expected dependency results21/34 and=D6+1 remain unchanged.
    Scope:actual core block-copy graph;full browser PasteFromClip/history acceptance is not claimed.

    All current app/tools types,production build,changed source/test/E2E lint and format,JSDoc,size,boundary,source-tree,provenance,Calc registry,resources,static,routing and doctor checks pass. Evidence/progress-blocks preserves raw Istanbul,logs and446 stable source/test/config hashes. Conservative cumulative task footprint102/110,including four prior generated images that were removed from Git;no generated screenshots are included in this checkpoint.

    Remaining unchanged:complete document CopyFromClip orchestration and original single-source-row optimization with its actual script/format services;native Undo initialization and paste history;EnterBlock/AutoSum and final76 acceptance,then74. Number-format inheritance/service boundaries remain under review. Task76 stays DOING/verification pending;task74 depends on76. Full all-app checkpoint80 remains the requested stop checkpoint after repairs,coverage and current-task closure. Goal remains active.

    Task76 Undo-initialization checkpoint:ported original InitUndo,InitUndoSelected and AddUndoTab using actual shared source pools,empty native table names,sparse native sheet vectors and original false/false geometry defaults. ScTable constructor now preserves independent colInfo/rowInfo allocation,with native true/true constructor defaults. Absent owners are actually null;no simulated geometry buffers or replacement workbook are introduced. Native width/height setters,getters and CopyToTable guards consume these actual nullable owners. Column width/flag and row height/flag pairs are allocated together,so paired-pointer casts rely on constructor ownership invariants. Browser range borrowers,CopyRowHeight and optimal-height calculation retain their existing allocated-geometry caller preconditions;no absent range is fabricated. GetClipArea body is partitioned unchanged onto the same document instance to keep document.ts below1000lines. Source shell-medium URL propagation remains unrepresented. CALC-262 preserves empty selected initialization's one-null-slot result through original GetLastSelected fallback0.

    Command:npx vitest run --config vitest.calc.config.ts --coverage --coverage.reportsDirectory=../../output/playwright/task76-undo-calc-coverage.
    Result:877/877 scenarios across218 physical files pass;raw100 S15808/B9630/F2721/L14149. Seven new native resource/geometry/sparse-tab vectors and existing reference-copy vectors now use actual InitUndo. Tests retain existing tables during AddUndoTab,exercise all geometry allocation combinations,normal-document no-ops,hidden-without-geometry getter defaults,source closure with pooled text/compiled formulas,selected initialization and optional geometry-copy guards. No thresholds,exclusions or coverage ignores changed.
    Scope:complete Calc only;not an all-application checkpoint. Earlier fixture failures used nonexistent SetRawString and were corrected to the real SetTextCell API;diagnostic logs are retained. Shared implementation is unchanged from the prior changed-owner raw100 checkpoint.

    Command:npx playwright test e2e/calc/clipboard-copy.spec.ts --config playwright.config.ts --project=calc.
    Result:1/1 actual Chromium/DOM-free Worker scenario passes. The copied-owner graph now constructs a genuine Undo document with InitUndo,observes shared pool identity and disabled default width storage,and passes that actual Undo document through CopyFromClipContext. Actual copy dependency values21/34 and=D6+1 remain unchanged.
    Scope:native Undo initialization and block-copy graph,not complete user-facing paste Undo/Redo.

    All current app/tools types,production build,changed source/test/E2E lint and format,JSDoc,size,boundary,source-tree,provenance,Calc registry,resources,static,routing and doctor checks pass. Immutable evidence/progress-undo-init stores raw Istanbul,logs and447 stable source/test/config hashes. Conservative cumulative footprint103/110 includes the previously removed generated images;no generated screenshots are committed in this block.

    Remaining:full document CopyFromClip orchestration,original one-source-row optimization and its real ScCellFormat/number-formatter/script services,native paste history and EnterBlock/AutoSum integration. Those formatting owners remain unported;do not substitute ad-hoc display formatting or skip the source optimization to enable UI. Number-format inheritance remains under review. Then perform final76 acceptance and74 acceptance. Task76 stays DOING/verification pending;74 waits on76. Full all-application checkpoint80 remains the requested stop point after fixes,coverage and current-task closure. Goal remains active.

    Task76 single-row table-copy checkpoint:ported native ScTable.CopyOneCellFromClip and GetOriginalHeight using actual clipboard/context/column owners. Column modulo repetition retains source script attributes and genuine shared formulas. Full-axis paste copies original source height across the range and preserves upstream first-row-only ManualSize flag updates (CALC-263). Missing native height/flag owners retain original guards;no replacement buffers,formatter or workbook are introduced.

    Command:npx vitest run --config vitest.calc.config.ts --coverage --coverage.reportsDirectory=../../output/playwright/task76-row-calc-coverage.
    Result:pass,881/881 scenarios across219 physical files;raw100 S15824/B9645/F2724/L14164. Four new genuine-owner scenarios cover value/script repetition,shared formulas/relative and absolute refs/fresh ODS recalculation,all16384 columns and native height/manual flag asymmetry,missing source and Undo geometry owners. Coverage configuration,thresholds and exclusions unchanged.

    Command:npx playwright test e2e/calc/clipboard-copy.spec.ts --config playwright.config.ts --project=calc.
    Result:pass,1/1 actual Chromium/DOM-free Worker scenario;native repeated-row values[3,7,3,3,7,3],existing dependency results21/34 and=D6+1 preserved.
    Scope:actual table-level single-row copy;document optimized entry and user-facing paste history remain incomplete.

    Production build/app types,tools types,scoped lint/format,JSDoc,size,boundaries,source-tree,resources,static,routing and doctor pass. Immutable evidence/progress-single-row stores raw coverage,logs and448 stable source/test/config hashes. Footprint104/110 includes prior removed images. Human baseline .DS_Store and output/.DS_Store remain untouched and outside task commits.

    Command:npm run check:source-provenance.
    Result:fail,ENOENT vendor/icu-reference/source/common/ucase.h.
    Command:npm run inventory:parity:calc.
    Result:fail,ENOENT vendor/mdds-reference/include/mdds/multi_type_matrix_def.inl.
    Scope:full source-comparison gates. Human intentionally removed ignored research references to reclaim disk. Ordinary Calc tests/build/browser work without them. CLI inspection confirms no upstream-absent switch for these two checks. Direct canonical provenance validation of only changed table.ts/table7.ts passes against the retained pinned LO source;this does not substitute full gates. No sources were downloaded,checks weakened,or final acceptance/approved skip claimed. Final source/registry verification remains pending.

    Remaining:document CopyFromClip orchestration,optimized single-row entry with genuine formatting/script services,native paste history and EnterBlock/AutoSum,then final76 and74 acceptance. Task76 remains DOING/verification pending;74 depends on76. Full all-app checkpoint80 and human stop instruction remain unchanged. Goal remains active.

    Task76 formula-format metadata checkpoint:original ScFormulaCell needs/allow-format flags retain false constructor defaults,copy-constructor needs-state and reset allow-state,and SetNeedNumberFormat/NeedsNumberFormat contracts. Both ScColumn.SetFormulaCell overloads retain inheritNumFormatIfNeeded default true and actual canonical-pattern General-format handling. CopyCellsFromClipHandler forwards the source request exactly. Native ScPatternAttr number-format key/language caches,copy values,threaded uncached reads,HasValidNumberFormat and writable/item/style/edit/delta invalidation now use actual SfxItemSet/SfxUInt32Item/SvxLanguageItem owners. SV_COUNTRY_LANGUAGE_OFFSET is shared from the original svl header owner. The context fast branch supports system-language built-in keys;native null formatter returns the raw key. Missing context language conversion is explicit,without a fake formatter or display approximation.

    Command:npx vitest run --config vitest.calc.config.ts --coverage --coverage.reportsDirectory=../../output/playwright/task76-format-calc-coverage.
    Result:pass,884/884 scenarios across219 physical files;raw100 S15871/B9673/F2733/L14206.
    Command:npx vitest run --config vitest.calc.config.ts src/sc/source/core/tool/compiler-format-type.test.ts --coverage --coverage.include=src/svl/inc/zforlist.ts --coverage.reportsDirectory=../../output/playwright/task76-format-shared-coverage.
    Result:pass,5/5 scenarios;changed shared owner raw100 S2/B0/F0/L2.
    Scope:complete Calc profile and only the changed shared zforlist header owner. Thresholds,exclusions and persistent coverage config unchanged. Three new actual-owner cases verify cache/default/invalid-item behavior,threaded uncached and warmed/copy behavior,and ordinary/hinted formula adoption with independent source request and destination format. Final focused19/19,type/lint/format/JSDoc pass after test-only documentation repair and adopting the already-asserted detached copy for proper document cleanup. Production and config hashes remain identical throughout Calc coverage and final checks;immutable evidence stores before/after test hashes explicitly.

    Command:npx playwright test e2e/calc/clipboard-copy.spec.ts --config playwright.config.ts --project=calc.
    Result:pass,1/1 actual Chromium/DOM-free Worker scenario. Source false format request remains false after native general block copy;actual dependency values21/34,=D6+1,sparse sheet and repeated-row values remain unchanged.
    Scope:real core copy phases,not full browser PasteFromClip/history acceptance.

    Production build/app types,tools types,scoped lint/format,JSDoc,size,boundaries,source-tree,resources,static,routing and doctor pass. Canonical provenance validation of five changed source modules passes against retained LO source. Full npm run check:source-provenance still fails ENOENT vendor/icu-reference/source/common/ucase.h;full npm run inventory:parity:calc still fails ENOENT vendor/mdds-reference/include/mdds/multi_type_matrix_def.inl. Their acceptance criteria were not changed,no approved skip is claimed,and deleted references were not restored/downloaded. Evidence/progress-format-metadata preserves current raw Istanbul,logs,commands and hashes. Human .DS_Store files stay outside commits.

    Remaining:context/result-format services and script update owners,document CopyFromClip orchestration,native paste history,EnterBlock/AutoSum,final76 acceptance and then74. In particular,the new formula request metadata does not claim completion of native InterpretTail format compatibility,request clearing or hard-format mutation. Cumulative footprint now110/110,including prior removed probe images. Further new owner/test/registry paths need material-scope re-approval under dod.core. No extra paths have been edited. Task76 remains DOING/verification pending;74 depends on76;full all-app checkpoint80 and human stop rule remain unchanged. Goal remains active.
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

Task76 reference-copy checkpoint: preserved native RefUpdateContext/RefErrorContext/UpdatedRangeNames and sparse ColumnSet ownership/defaults,actual document/table/column COPY traversal and both shared-formula boundary joins. Added native ScFormulaCell Compile/CompileTokenArray,copy-update metadata,on-reference-move dirty handling and oldest undo-formula retention. The ordinary source-string constructor now calls the actual Compile path;clipboard/undo source-string construction retains the original empty-array early return. Existing undo-error vectors now provide actual precompiled arrays. Shared FormulaTokenArray::AddBad owns a non-interned native shared string. CALC-260 documents insertion-only global-name normalization. Non-copy engines and unavailable names/printing/drawing/validation/embedded/UNO/formatter services remain unported;no alternate workbook or relocation by formula-source reparsing was introduced. Native bad/name/subtotal opcodes retain the actual shared compiler admission boundary;no fake subtotal registration owner.

Command:npx vitest run --config vitest.calc.config.ts --coverage --coverage.reportsDirectory=../../output/playwright/task76-reference-final-coverage.
Result:863/863 scenarios across216 files pass;current raw100 S15708/B9558/F2707/L14063. Twelve new reference/compile/undo/context scenarios plus corrected existing undo-source construction. No thresholds,exclusions or coverage ignores changed.
Scope:complete Calc only;not the all-application checkpoint. Earlier failed diagnostic reports and the prior863/raw100 report before the final constructor correction are retained as historical evidence,not current-source acceptance.

Command:npx vitest run --config vitest.shared.config.ts src/formula/inc/tokenarray.test.ts --coverage --coverage.include=src/formula/source/core/api/token.array.ts --coverage.reportsDirectory=../../output/playwright/task76-reference-shared-final-coverage.
Result:3/3 shared native-array scenarios pass;changed shared owner raw100 S234/B84/F69/L201.
Scope:the actual changed shared token-array owner and existing consumers,not a complete shared-suite replay.

Command:npx playwright test e2e/calc/clipboard-copy.spec.ts e2e/calc/formula-pointing.spec.ts e2e/calc/cell-selection.spec.ts --config playwright.config.ts --project=calc.
Result:6/6 actual Chromium/DOM-free Worker and1280/390px UI selection/pointing scenarios pass. The clipboard probe now executes document.UpdateReference with real shared block-position caching before listener restart and deferred notifications;expected21/34 dependency values and=D6+1 remain unchanged.
Scope:actual copied-owner graph,not completed document PasteFromClip/Undo UI behavior.

All current app/tools types,production build,scoped Calc/changed-shared/E2E lint,changed-file format,JSDoc,size,boundary,source-tree,provenance,Calc/shared registry,resources,static,routing and doctor checks pass. Immutable evidence/progress-reference contains the logs,raw Istanbul reports and448 stable source/test/config hashes. Current task source/test/registry/probe footprint98/110. Repository-wide lint is not recertified;its previous unrelated Writer/probe failures remain outside this checkpoint.

Remaining:general document CopyFromClip/CopyBlockFromClip and optimized document/table single-cell dispatch;actual Undo document initialization,source paste history and EnterBlock/AutoSum integration;final76 acceptance then74 acceptance. Existing number-format inheritance/formatter service boundaries still require review before76 closure. Task76 remains DOING/verification pending;task74 waits on76. Full all-application checkpoint stays80,then repairs,coverage,current-task closure and the human-requested stop. Goal remains active.

Task76 block-copy checkpoint:original CopyBlockFromClip now cycles genuine sparse source-sheet vectors only for selected existing destinations,then processes consecutive selected sheets through actual RefUpdateContext and the shared mdds cursor cache. Default CONTENTS is the admitted context;unrepresented drawing/non-content owners are not simulated. Same-pool cut/move has an explicit pre-mutation admission failure;foreign-pool cut preserves the source skipped-reference phase. Native CopyNonFilteredFromClip uses the first populated source sheet's real FilterData segments,retains hidden rows,advances the real source cursor and preserves the signed SCROW-max count/output behavior documented in CALC-261. FirstNonFilteredRow keeps native missing-sheet/invalid/no-match sentinels;initialized segment partitions guarantee valid-row lookup,without simulating allocator/corrupt-store failures. Existing DeleteSelection body is partitioned unchanged onto the same ScDocument instance through documen7 to keep document.ts at999lines.

Command:npx vitest run --config vitest.calc.config.ts --coverage --coverage.reportsDirectory=../../output/playwright/task76-block-calc-coverage.
Result:870/870 scenarios across217 physical files pass;raw100 S15778/B9592/F2714/L14125. Seven new genuine owner vectors cover sparse source cycling,selected/consecutive/missing destination sheets,foreign/same-pool cut boundary,filtered/hidden rows,source/destination run limits,SCROW-max outputs,maximum source tab9999 and fresh ODS reopen with live copied relative/absolute formulas. Original ResetClip explicitly permits a missing source sheet and creates the actual sparse clipboard slot;no intervening worksheets or fake tables are allocated in the boundary vector. No thresholds,exclusions or ignores changed.
Scope:complete Calc only,not an all-application checkpoint. Shared source is unchanged since the prior changed-owner raw100 evidence.

Command:npx playwright test e2e/calc/clipboard-copy.spec.ts --config playwright.config.ts --project=calc.
Result:1/1 actual Chromium/DOM-free Worker scenario passes. The probe now calls native document.CopyBlockFromClip,which includes the real reference-update phase,instead of manually composing table copy and document reference calls. Actual expected dependency results21/34 and=D6+1 remain unchanged.
Scope:actual core block-copy graph;full browser PasteFromClip/history acceptance is not claimed.

All current app/tools types,production build,changed source/test/E2E lint and format,JSDoc,size,boundary,source-tree,provenance,Calc registry,resources,static,routing and doctor checks pass. Evidence/progress-blocks preserves raw Istanbul,logs and446 stable source/test/config hashes. Conservative cumulative task footprint102/110,including four prior generated images that were removed from Git;no generated screenshots are included in this checkpoint.

Remaining unchanged:complete document CopyFromClip orchestration and original single-source-row optimization with its actual script/format services;native Undo initialization and paste history;EnterBlock/AutoSum and final76 acceptance,then74. Number-format inheritance/service boundaries remain under review. Task76 stays DOING/verification pending;task74 depends on76. Full all-app checkpoint80 remains the requested stop checkpoint after repairs,coverage and current-task closure. Goal remains active.

Task76 Undo-initialization checkpoint:ported original InitUndo,InitUndoSelected and AddUndoTab using actual shared source pools,empty native table names,sparse native sheet vectors and original false/false geometry defaults. ScTable constructor now preserves independent colInfo/rowInfo allocation,with native true/true constructor defaults. Absent owners are actually null;no simulated geometry buffers or replacement workbook are introduced. Native width/height setters,getters and CopyToTable guards consume these actual nullable owners. Column width/flag and row height/flag pairs are allocated together,so paired-pointer casts rely on constructor ownership invariants. Browser range borrowers,CopyRowHeight and optimal-height calculation retain their existing allocated-geometry caller preconditions;no absent range is fabricated. GetClipArea body is partitioned unchanged onto the same document instance to keep document.ts below1000lines. Source shell-medium URL propagation remains unrepresented. CALC-262 preserves empty selected initialization's one-null-slot result through original GetLastSelected fallback0.

Command:npx vitest run --config vitest.calc.config.ts --coverage --coverage.reportsDirectory=../../output/playwright/task76-undo-calc-coverage.
Result:877/877 scenarios across218 physical files pass;raw100 S15808/B9630/F2721/L14149. Seven new native resource/geometry/sparse-tab vectors and existing reference-copy vectors now use actual InitUndo. Tests retain existing tables during AddUndoTab,exercise all geometry allocation combinations,normal-document no-ops,hidden-without-geometry getter defaults,source closure with pooled text/compiled formulas,selected initialization and optional geometry-copy guards. No thresholds,exclusions or coverage ignores changed.
Scope:complete Calc only;not an all-application checkpoint. Earlier fixture failures used nonexistent SetRawString and were corrected to the real SetTextCell API;diagnostic logs are retained. Shared implementation is unchanged from the prior changed-owner raw100 checkpoint.

Command:npx playwright test e2e/calc/clipboard-copy.spec.ts --config playwright.config.ts --project=calc.
Result:1/1 actual Chromium/DOM-free Worker scenario passes. The copied-owner graph now constructs a genuine Undo document with InitUndo,observes shared pool identity and disabled default width storage,and passes that actual Undo document through CopyFromClipContext. Actual copy dependency values21/34 and=D6+1 remain unchanged.
Scope:native Undo initialization and block-copy graph,not complete user-facing paste Undo/Redo.

All current app/tools types,production build,changed source/test/E2E lint and format,JSDoc,size,boundary,source-tree,provenance,Calc registry,resources,static,routing and doctor checks pass. Immutable evidence/progress-undo-init stores raw Istanbul,logs and447 stable source/test/config hashes. Conservative cumulative footprint103/110 includes the previously removed generated images;no generated screenshots are committed in this block.

Remaining:full document CopyFromClip orchestration,original one-source-row optimization and its real ScCellFormat/number-formatter/script services,native paste history and EnterBlock/AutoSum integration. Those formatting owners remain unported;do not substitute ad-hoc display formatting or skip the source optimization to enable UI. Number-format inheritance remains under review. Then perform final76 acceptance and74 acceptance. Task76 stays DOING/verification pending;74 waits on76. Full all-application checkpoint80 remains the requested stop point after fixes,coverage and current-task closure. Goal remains active.

Task76 single-row table-copy checkpoint:ported native ScTable.CopyOneCellFromClip and GetOriginalHeight using actual clipboard/context/column owners. Column modulo repetition retains source script attributes and genuine shared formulas. Full-axis paste copies original source height across the range and preserves upstream first-row-only ManualSize flag updates (CALC-263). Missing native height/flag owners retain original guards;no replacement buffers,formatter or workbook are introduced.

Command:npx vitest run --config vitest.calc.config.ts --coverage --coverage.reportsDirectory=../../output/playwright/task76-row-calc-coverage.
Result:pass,881/881 scenarios across219 physical files;raw100 S15824/B9645/F2724/L14164. Four new genuine-owner scenarios cover value/script repetition,shared formulas/relative and absolute refs/fresh ODS recalculation,all16384 columns and native height/manual flag asymmetry,missing source and Undo geometry owners. Coverage configuration,thresholds and exclusions unchanged.

Command:npx playwright test e2e/calc/clipboard-copy.spec.ts --config playwright.config.ts --project=calc.
Result:pass,1/1 actual Chromium/DOM-free Worker scenario;native repeated-row values[3,7,3,3,7,3],existing dependency results21/34 and=D6+1 preserved.
Scope:actual table-level single-row copy;document optimized entry and user-facing paste history remain incomplete.

Production build/app types,tools types,scoped lint/format,JSDoc,size,boundaries,source-tree,resources,static,routing and doctor pass. Immutable evidence/progress-single-row stores raw coverage,logs and448 stable source/test/config hashes. Footprint104/110 includes prior removed images. Human baseline .DS_Store and output/.DS_Store remain untouched and outside task commits.

Command:npm run check:source-provenance.
Result:fail,ENOENT vendor/icu-reference/source/common/ucase.h.
Command:npm run inventory:parity:calc.
Result:fail,ENOENT vendor/mdds-reference/include/mdds/multi_type_matrix_def.inl.
Scope:full source-comparison gates. Human intentionally removed ignored research references to reclaim disk. Ordinary Calc tests/build/browser work without them. CLI inspection confirms no upstream-absent switch for these two checks. Direct canonical provenance validation of only changed table.ts/table7.ts passes against the retained pinned LO source;this does not substitute full gates. No sources were downloaded,checks weakened,or final acceptance/approved skip claimed. Final source/registry verification remains pending.

Remaining:document CopyFromClip orchestration,optimized single-row entry with genuine formatting/script services,native paste history and EnterBlock/AutoSum,then final76 and74 acceptance. Task76 remains DOING/verification pending;74 depends on76. Full all-app checkpoint80 and human stop instruction remain unchanged. Goal remains active.

Task76 formula-format metadata checkpoint:original ScFormulaCell needs/allow-format flags retain false constructor defaults,copy-constructor needs-state and reset allow-state,and SetNeedNumberFormat/NeedsNumberFormat contracts. Both ScColumn.SetFormulaCell overloads retain inheritNumFormatIfNeeded default true and actual canonical-pattern General-format handling. CopyCellsFromClipHandler forwards the source request exactly. Native ScPatternAttr number-format key/language caches,copy values,threaded uncached reads,HasValidNumberFormat and writable/item/style/edit/delta invalidation now use actual SfxItemSet/SfxUInt32Item/SvxLanguageItem owners. SV_COUNTRY_LANGUAGE_OFFSET is shared from the original svl header owner. The context fast branch supports system-language built-in keys;native null formatter returns the raw key. Missing context language conversion is explicit,without a fake formatter or display approximation.

Command:npx vitest run --config vitest.calc.config.ts --coverage --coverage.reportsDirectory=../../output/playwright/task76-format-calc-coverage.
Result:pass,884/884 scenarios across219 physical files;raw100 S15871/B9673/F2733/L14206.
Command:npx vitest run --config vitest.calc.config.ts src/sc/source/core/tool/compiler-format-type.test.ts --coverage --coverage.include=src/svl/inc/zforlist.ts --coverage.reportsDirectory=../../output/playwright/task76-format-shared-coverage.
Result:pass,5/5 scenarios;changed shared owner raw100 S2/B0/F0/L2.
Scope:complete Calc profile and only the changed shared zforlist header owner. Thresholds,exclusions and persistent coverage config unchanged. Three new actual-owner cases verify cache/default/invalid-item behavior,threaded uncached and warmed/copy behavior,and ordinary/hinted formula adoption with independent source request and destination format. Final focused19/19,type/lint/format/JSDoc pass after test-only documentation repair and adopting the already-asserted detached copy for proper document cleanup. Production and config hashes remain identical throughout Calc coverage and final checks;immutable evidence stores before/after test hashes explicitly.

Command:npx playwright test e2e/calc/clipboard-copy.spec.ts --config playwright.config.ts --project=calc.
Result:pass,1/1 actual Chromium/DOM-free Worker scenario. Source false format request remains false after native general block copy;actual dependency values21/34,=D6+1,sparse sheet and repeated-row values remain unchanged.
Scope:real core copy phases,not full browser PasteFromClip/history acceptance.

Production build/app types,tools types,scoped lint/format,JSDoc,size,boundaries,source-tree,resources,static,routing and doctor pass. Canonical provenance validation of five changed source modules passes against retained LO source. Full npm run check:source-provenance still fails ENOENT vendor/icu-reference/source/common/ucase.h;full npm run inventory:parity:calc still fails ENOENT vendor/mdds-reference/include/mdds/multi_type_matrix_def.inl. Their acceptance criteria were not changed,no approved skip is claimed,and deleted references were not restored/downloaded. Evidence/progress-format-metadata preserves current raw Istanbul,logs,commands and hashes. Human .DS_Store files stay outside commits.

Remaining:context/result-format services and script update owners,document CopyFromClip orchestration,native paste history,EnterBlock/AutoSum,final76 acceptance and then74. In particular,the new formula request metadata does not claim completion of native InterpretTail format compatibility,request clearing or hard-format mutation. Cumulative footprint now110/110,including prior removed probe images. Further new owner/test/registry paths need material-scope re-approval under dod.core. No extra paths have been edited. Task76 remains DOING/verification pending;74 depends on76;full all-app checkpoint80 and human stop rule remain unchanged. Goal remains active.
