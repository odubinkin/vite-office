Command: npm run test:coverage:calc -- --maxWorkers=4 --reporter=dot
Result: pass
Evidence: calc-coverage-final.log;107 files,284 cases;raw statements6548/6548,branches4203/4203,functions1353/1353,lines5878/5878. No thresholds,exclusions or counter certification changes.
Scope: all Calc runtime owners,deep token clone,same-position formula copy,owning cell values,production UI,real document/history/files.

Command: npm exec --workspace @vite-office/office -- vitest run tokenarray.test formularesult undo.test CommandMenuBar WriterMenuBar --maxWorkers=4 --reporter=dot
Result: pass
Evidence: related-final.log;13 files,127 cases. Initial filter token.array.test was too narrow;corrected to actual formula/inc/tokenarray.test.ts and retained all other selected tests.
Scope: shared FormulaTokenArray storage,formula results,Undo manager and actual Writer/shared menu consumers.

Command: npm run typecheck; npm run build; npx vitest run scripts/calc-sheet-command-source.test.ts scripts/writer-ui-resource-model.test.ts
Result: pass
Evidence: contracts-final.log;7 pinned-source/resource cases,app/tools typechecks,production build. build-final.log rebuild after lint-only type casts produces the same index-DiPb_Ydm.js artifact as the tested build:the final non-null-assertion-to-cast edits erase to identical production JavaScript. gates-repaired.log also confirms final typechecks.
Scope: original deep Clone code/RPN identity,formula result/dirty copy and error reset/recompile,ScCellValue original ownership and document commit contracts.

Command: node .agentplane/tasks/202610182023-GBSSRW/touched-checks.mjs; npm run check:dependencies; npm run check:docs; npm run check:file-size; npm run check:source-tree; npm run check:source-provenance; npm run inventory:parity:calc; npm run inventory:parity:shared; ap doctor; node .agentplane/policy/check-routing.mjs
Result: pass
Evidence: gates-repaired.log and build-final.log;24 intentional non-task paths;845 module sources,846 provenance runtime modules,730 mapped/98 browser/18 infrastructure;both scoped semanticViolationCount0;doctor OK with existing shim-readiness warning;policy routing OK. Production bundle-size warnings remain.
Scope: existing source owners and explicit bounded clone/ownership responsibilities without full parity claims.

Command: Production browser http://127.0.0.1:5176/calc via actual grid,input and Undo/Redo toolbar controls
Result: pass
Evidence: browser-review.json and tool transcript. A1=2,B1=A1*3;replaced B1 with plain text,Undo restored formula text and result6. New A1=4 truncates the old redo snapshot and B1 still recalculates12. Undo A1 restores2/6;Redo restores4/12. This verifies live formula independence after history snapshot disposal and actual dependency subscriptions.
Scope: built current UI,real formula owners,history clear/truncation and dependency recalculation.

Findings: Initial283pass/1failure demanded lexer overflow code502 survive Undo. Original formula copying resets nonempty code errors and recompiles tokens without rescanning text;the explicit =1e999 expectation now uses native NONE while other existing error cases remain unchanged. Initial typechecks caught an accidentally duplicated existing Dispose method and test calls to protected Add;removed the duplicate and used public AddDouble/ReplaceToken. Touched lint rejected ten non-null assertions;replaced them with existing native getter-contract type casts. Final type/style/source checks pass,with identical production bundle proving those final casts changed no runtime behavior.

Native scope: ScCellValue owns actual empty/numeric/shared-string/formula content and deep detached formula clones;browser CalcCellContent and token snapshot reconstruction are removed. History owners clear through actual shared SfxUndoAction Dispose. The existing native formula Dispose remains reused. Formula copying is limited to same document and position for current local-reference input;relocation/foreign-document copies explicitly reject unported reference services. Names,external/group references,clipboard/undo-document modes,rich text,format services and full EditEngine remain unported. Literal string commits use the real current-kernel SetTextCell implementation of native SetString/setTextInput plain-text behavior;normal string recognition is not substituted. Deep token clones preserve all represented flags;hash/vector/OpenCL/threading state absent from this kernel is not fabricated.

Cadence: Approved UI task14. Full regression completed/repaired at task10;next full task20. Original Calc UI goal remains active.
