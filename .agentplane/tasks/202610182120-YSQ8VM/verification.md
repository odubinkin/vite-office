Command: npm run test:coverage:calc -- --maxWorkers=4 --reporter=dot
Result: pass
Evidence: calc-coverage.log;110files,293cases. Raw statements6648/6648,branches4273/4273,functions1372/1372,lines5966/5966,all100percent. No coverage exclusions or thresholds changed.
Scope: whole current Calc runtime including complete source toolbar projection,actual unknown-slot disabled state,all30icon controls,real Open dialog and existing input/history/files/sheet-popup behavior.

Command: npm exec --workspace @vite-office/office -- vitest run CommandToolbar WriterUpstreamEntryPoints WriterUpstreamQuickControls native-insert-table-command writer-view.test menubar-commands --maxWorkers=4 --reporter=dot
Result: pass
Evidence: related.log;7files,29cases. New Writer regression checks exact standardbar order and all11original Lucide symbol classes through actual Writer Sfx frame. Shared control test requires missing slots to remain visible disabled and proves clicks cannot dispatch. Existing table-grid/native-dialog/format/Writer entry-point checks pass.
Scope: actual shared renderer and both suite consumers;the common vocabulary replaces Writer's previous local map without changing its icons.

Command: npm run typecheck; npm run build; npx vitest run scripts/calc-sheet-command-source.test.ts scripts/writer-ui-resource-model.test.ts; npm run check:calc-resources; npm run check:writer-resources
Result: pass
Evidence: types-final.log,build.log,source.log,calc-resources.log,writer-resources.log. 10source/resource cases plus2Writer freshness cases. Source test independently reads pinned standardbar XML and checks all30visible identities after explicit existing AddDirect/Save deviations. Generated Calc and Writer resources unchanged. Existing bundle-size warning remains.
Scope: actual XML visibility,stable command identities,current browser policy and whole application build/types.

Command: node .agentplane/tasks/202610182120-YSQ8VM/touched-checks.mjs; npm run check:dependencies; npm run check:docs; npm run check:file-size; npm run check:source-tree; npm run check:source-provenance; npm run inventory:parity:calc; npm run inventory:parity:shared; npm run inventory:parity:writer; ap doctor; node .agentplane/policy/check-routing.mjs
Result: pass
Evidence: style.log,dependencies.log,docs.log,size.log,tree.log,provenance.log,inventory-calc.log,inventory-shared.log,inventory-writer.log,doctor.log,routing.log. 20intentional non-task paths;849runtime module sources,3694relative imports,124allowed cross-module edges;850provenance modules (733mapped/99browser/18infrastructure). All three scoped semanticViolationCount0. Inventory logs explicitly retain counts/flags and SHA256 of original successful output while omitting bulk record arrays;they do not claim complete Calc parity. Doctor OK with pre-existing managed shim warning;routing OK.
Scope: shared browser icon vocabulary,existing owner registry evidence and source resources;no new execution slots,security code,network or outside-checkout writes.

Command: npx playwright test standard-toolbar.spec.ts sheet-context-menu.spec.ts --config apps/office/playwright.config.ts --project=calc
Result: pass
Evidence: browser.log;4cases at1280x800 and390x600. Exact30source labels/order,each actualSVG,unavailable commands disabled,36px shared button width,confined mobile horizontal overflow and actual cell value edit/Undo/Redo verified. Both existing context-popup cases still pass. Each case uses unfiltered axe (violations=[]) and pageerror collection ([]).
Scope: built production application using actual shared Writer header/control styles,Calc core history and source context popup.

Findings: Initial typecheck caught a Lucide export typo PanelTopBottom (actual installed export PanelsTopBottom) and Playwright-only exact option accidentally supplied to Testing Library role queries. Corrected symbol and fixture options;all final types/tests pass. No production behavior or verification thresholds weakened. Earlier unknown-command omission expectation was intentionally replaced with visible-disabled source composition,matching actual Sfx state and menu behavior.

Remaining scope: This task restores composition of the complete pinned visible standardbar;unported operations are disabled. No generic fake handlers or private availability model were introduced. Full formatting toolbar and input-line fidelity,remaining native document/edit/sheet/formatting services and whole Calc UI parity remain unfinished. The original goal remains active. This is UI task17;full regression next task20.
