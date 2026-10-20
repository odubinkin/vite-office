Command: npm run test:coverage:calc
Result: pass
Evidence: 99 files,264 tests;100% statements6299/6299,branches4028/4028,functions1300/1300,lines5655/5655 (calc-coverage.log).
Scope: Entire Calc application and actual source menu adapters.

Command: npm run test:coverage -- menubar-commands.test WriterCommandToolbar.test WriterMenuBar.test --coverage.include=src/framework/browser/presentation/toolbar-resource.ts --coverage.include=src/sw/uiconfig/swriter/ui-resource.ts --coverage.reportsDirectory=coverage/calc-shared-resources
Result: pass
Evidence: 10 tests,2 files;shared normalization100% all metrics (shared-coverage.log).
Scope: Affected Writer toolbar resource consumer and shared normalizer.

Command: npm run check:calc-resources; npm run check:writer-resources; npx vitest run scripts/office-ui-command-catalog.test.ts scripts/writer-ui-resource-model.test.ts
Result: pass
Evidence: Calc450 source commands,11 top menus,17 explicit browser-policy dispositions;Writer generation byte-identical;5 related tooling tests pass. Source hashes include native Commands.xcs toggle flag schema.
Scope: Shared generator extraction,source catalog/accelerator projection,source drift and closure.

Command: npm run typecheck; npm run build; node .agentplane/tasks/202610181835-905DK4/touched-checks.mjs; npm run check:dependencies; npm run check:docs; npm run check:file-size; npm run check:source-tree; npm run check:source-provenance; npm run inventory:parity:calc; npm run inventory:parity:shared; npm run inventory:parity:writer; ap doctor; node .agentplane/policy/check-routing.mjs
Result: pass
Evidence: Application/tools typecheck and production build pass;24 non-task files;all touched style and required source/registry gates pass;840 runtime modules mapped;zero scoped semantic violations;doctor OK;policy routing OK.
Scope: All changed source/tooling/registry paths. Existing build chunk-size and managed-shim readiness advisories remain unchanged.

Command: Production Chromium navigation http://127.0.0.1:5176/calc and mounted real menu/file interactions
Result: pass
Evidence: browser-review.json records all11 top menus,source shortcut captions and Open/Save As/Export dialogs;no menu crashes or application exceptions. Only console error is the existing absent favicon.ico404.
Scope: Actual built React/Sfx UI and preferred shortcut caption presentation.

Findings: Unsupported native operations remain disabled through missing real Sfx slots. This is resource projection,not new execution/formatting services. Native menus and toolbar surfaces retain source identity/order/visibility;intentional Writer autosave/open/recovery dispositions are explicit. Full all-app suite is deferred under the user's cadence: current task8/10,full run at10. All changes remain in the Calc checkout on branch calc;no merges or other checkouts.
