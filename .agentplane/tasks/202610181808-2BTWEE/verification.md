Command: npm run test:coverage:calc
Result: pass
Evidence: calc-coverage.log;263tests,98files;all statements/branches/functions/lines100%.
Scope: All Calc runtime;actual file slots,menu/toolbar resources,ODS import/browser copy/collision/export,canonical owner and medium/history preservation.

Command: npm run test:coverage -- WriterFileDialog.test current-dialog-baseline.test writer-view-title-collision.test desktop.test writer-module.test writer-workflows.test calc-files.test WriterPageLayout.test CommandMenuBar native-menubar native-disabled-menubar native-empty-menubar WriterMenuBar.test native-context-menu.test --coverage.include='src/framework/browser/presentation/BrowserFileDialog.tsx' --coverage.include='src/framework/browser/presentation/DialogHeader.tsx' --coverage.include='src/framework/browser/presentation/NameCollisionPanel.tsx' --coverage.include='src/framework/browser/presentation/OfficeWorkspaceHeader.tsx' --coverage.include='src/framework/browser/presentation/CommandMenuBar.tsx' --coverage.include='src/framework/browser/workflows/file-dialog-controller.ts' --coverage.include='src/sw/browser/presentation/WriterFileDialog.tsx' --coverage.include='src/sw/browser/presentation/WriterWorkspaceChrome.tsx' --coverage.reportsDirectory=coverage/calc-shared-files
Result: pass
Evidence: shared-coverage.log;247tests,24files;408/408statements,358/358branches,112/112functions,364/364lines;all100%.
Scope: Extracted shared file/header presentation,original Writer domain adapters,affected Writer layout/files and all related menu/context behavior.

Command: npm run test:shared -- CommandMenuBar.test
Result: pass
Evidence: menu-regression.log;7tests including literal native UNO and quoted submenu identities.
Scope: Reported File/Edit browser crash;popup lookup remains scoped to its own menubar.

Command: npm run typecheck --workspace @vite-office/office; npm run build
Result: pass
Evidence: typecheck.log,build.log;existing bundle-size advisory remains.
Scope: Complete application compile and static production bundle.

Command: node .agentplane/tasks/202610181808-2BTWEE/touched-checks.mjs
Result: pass
Evidence: style.log contains exact Prettier/ESLint argument lists;63non-task paths.
Scope: All changed/new application source,tests,CSS and registry formatting;no policy/config relaxation.

Command: npm run check:dependencies; npm run check:docs; npm run check:file-size; npm run check:source-tree; npm run check:source-provenance
Result: pass
Evidence: dependencies.log,docs.log,file-size.log,source-tree.log,provenance.log;839runtime provenance modules.
Scope: Module boundaries,source contracts and required provenance. Shared presentation injects file-reading IO instead of importing VCL across a forbidden framework edge.

Command: npm run inventory:parity:calc; npm run inventory:parity:shared; npm run inventory:parity:writer
Result: pass
Evidence: parity-calc.log,parity-shared.log,parity-writer.log;compact scalar summaries with raw-outputSHA256;zero semantic violations.
Scope: Runtime/provenance/capability records. Resource projections map to original XML;Writer alias boundaries attribute implementations to shared framework owners. Whole-native UI parity is not claimed.

Command: ap doctor; node .agentplane/policy/check-routing.mjs
Result: pass
Evidence: doctor.log,routing.log;doctorOK with the existing managed-shim readiness advisory;policy routingOK.
Scope: Repository lifecycle readiness;unrelated shim remains unchanged.

Command: Production browser /calc:repeat File/Edit open-close;open existing primary ODS;open Save As/Export;inspect shared header/toolbar geometry and shortcut captions
Result: pass
Evidence: browser-review.json;three cycles,no crashes,correct Ctrl captions,adjacent title/menu,same standard-button classes,576pixel shared modal,background inert,actual saved42/84 restored;zero console errors/warnings.
Scope: Chromium production behavior in addition to jsdom integration evidence.

Skipped: Full all-app regression
Reason: User requires a full run once per10Agentplane tasks;this is UI-cycle task7.
Risk: Only Calc and related Writer/shared behavior are validated at this step.
Approval: User goal testing instructions.
