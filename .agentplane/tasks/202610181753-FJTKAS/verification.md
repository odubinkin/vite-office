Command: npm run test:coverage:calc
Result: pass
Evidence: calc-coverage.log;259tests,97files;6221/6221statements,3988/3988branches,1271/1271functions,5583/5583lines;all100%.
Scope: All Calc runtime including primary ODS IO,atomic shell ownership,generation/history races,and mounted production composition.

Command: npm run test:coverage -- writer-odt-store.test writer-autosave.test writer-odt-io.test writer-module.test current-dialog-baseline.test WriterFileDialog.test writer-view-title-collision.test desktop.test calc-ods-io.test --coverage.include='src/framework/browser/storage/document-store.ts' --coverage.include='src/framework/browser/workflows/document-autosave.ts' --coverage.include='src/sw/browser/storage/writer-odt-store.ts' --coverage.include='src/sw/browser/workflows/writer-autosave.ts' --coverage.reportsDirectory=coverage/calc-shared-persistence
Result: pass
Evidence: shared-coverage.log;72tests,9files;217/217statements,77/77branches,55/55functions,203/203lines;all100%.
Scope: Shared extracted storage/scheduler and permanent Writer domain adapters;existing Writer dialogs,collisions,primary saving and composition remain compatible.

Command: npm run typecheck --workspace @vite-office/office; npm run build
Result: pass
Evidence: typecheck.log,build.log;existing bundle-size advisory remains.
Scope: Complete application compile and static production bundle.

Command: npx eslint apps/office/src/framework/browser/{storage/document-store,workflows/document-autosave}.ts apps/office/src/sw/browser/{storage/writer-odt-store,workflows/writer-autosave,workflows/writer-odt-io}.ts apps/office/src/sc/source/ui/docshell apps/office/src/sc/browser/{controller/calc-view-controller.ts,composition/calc-module.tsx,workflows} --max-warnings 0
Result: pass
Evidence: lint.log.
Scope: All changed/new source and tests.

Command: npx prettier --check apps/office/src/framework/browser/{storage/document-store,workflows/document-autosave}.ts apps/office/src/sw/browser/{storage/writer-odt-store,workflows/writer-autosave,workflows/writer-odt-io}.ts apps/office/src/sc/source/ui/docshell apps/office/src/sc/browser/{controller/calc-view-controller.ts,composition/calc-module.tsx,workflows} docs/program/registry/{calc,shared,writer}
Result: pass
Evidence: format.log.
Scope: Touched source and required registry records.

Command: npm run check:dependencies; npm run check:docs; npm run check:file-size; npm run check:source-tree; npm run check:source-provenance
Result: pass
Evidence: dependencies.log,docs.log,file-size.log,source-tree.log,provenance.log.
Scope: Application architecture and source ownership;830runtime provenance modules;existing decomposition candidates remain outside scope.

Command: npm run inventory:parity:calc; npm run inventory:parity:shared; npm run inventory:parity:writer
Result: pass
Evidence: parity-calc.log,parity-shared.log,parity-writer.log;compact scalar summaries with SHA256of the full successful CLI output;0semantic violations/unclassified divergences.
Scope: Required records for shared extraction and bounded Calc persistence;whole-native parity is not claimed.

Command: ap doctor; node .agentplane/policy/check-routing.mjs
Result: pass
Evidence: doctor.log,routing.log;doctorOK with existing managed-shim readiness advisory;policy routingOK.
Scope: Repository lifecycle readiness;unrelated shim is unchanged.

Command: Browser production /calc actual input,11second autosave,IndexedDB read and native ODS re-import
Result: pass
Evidence: browser-review.json;1589byte ODS,version2,A1=42,B1formularesult84;zero warnings/errors.
Scope: Real production browser persistence rather than test-only in-memory storage.

Skipped: Full all-app regression
Reason: User cadence requires it once per10Agentplane tasks;this is UI-cycle task6.
Risk: Only related Writer/shared suites are included at this step.
Approval: User goal testing instructions.
