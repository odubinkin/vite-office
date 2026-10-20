Command: npm run test:coverage:calc
Result: pass
Evidence: 101files,268tests;100% statements6359/6359,branches4087/4087,functions1314/1314,lines5701/5701 (calc-coverage.log).
Scope: Entire Calc plus new native ScTabView navigation/grouping and real Sfx UI integration. Tests cover default wrapping,no-wrap branch,zero/single sheet,invalid/absent tab,partial/all groups,bNew refresh,per-sheet/old cursors,real source numeric slots,pending input commit and rejected formula retention,selection-only generation/history/dirty independence,menu and Ctrl/Meta page navigation.

Command: npm run test:coverage -- CommandMenuBar WriterMenuBar.test WriterCommandToolbar.test native-menubar native-disabled-menubar native-empty-menubar native-context-menu.test calc-sheet-commands.test --coverage.include=src/framework/browser/presentation/CommandMenuBar.tsx --coverage.reportsDirectory=coverage/calc-sheet-menus
Result: pass
Evidence: 17files,180tests;100% all four metrics for the actual shared menu presenter (shared-coverage.log).
Scope: Affected shared menu behavior,Writer menu/toolbar and actual Calc sheet command consumers.

Command: npx vitest run scripts/calc-sheet-command-source.test.ts; npm run check:calc-resources; npm run check:writer-resources
Result: pass
Evidence: Pinned Calc.xcs wrap=true and source slot declarations pass;Calc450commands/11topmenus/17policy dispositions fresh;Writer generation unchanged and2resource tests pass.
Scope: Original source contract/configuration and shared generated resources.

Command: npm run typecheck; npm run build; node .agentplane/tasks/202610181850-FKYDT8/touched-checks.mjs; npm run check:dependencies; npm run check:docs; npm run check:file-size; npm run check:source-tree; npm run check:source-provenance; npm run inventory:parity:calc; npm run inventory:parity:shared; ap doctor; node .agentplane/policy/check-routing.mjs
Result: pass
Evidence: App/tools typecheck and production build pass;20non-task paths;style/docs/size/module/source/provenance gates pass;842runtime modules,728mapped;zero scoped semantic violations;doctorOK/routingOK. Production build retains existing chunk-size/timing advisories;doctor retains existing managed shim readiness advisory.
Scope: All task implementation and registry paths. Initial test accessed ResolvedShellCommand.slotId rather than slot.slotId;corrected. Initial header provenance had empty localSymbols;fixed to the existing native reexport provenance convention. Initial narrow shared test selection omitted native menu acceptance cases;expanded related selection proves100percent without reducing thresholds.

Command: Production Chromium http://127.0.0.1:5176/calc with real menu controls and document keyboard events
Result: pass
Evidence: browser-review.json shows Navigate->next actual sheet,Edit Select->extend to previous,select-all,Ctrl+PageUp wraps first->last and collapses all-group,Meta+PageDown wraps last->first. Console0errors/0warnings.
Scope: Built application,actual shared command menu,source view/mark owners and rendered active/selected tabs.

Findings: Existing Calc core only represents visible sheets;hidden/alternate-sheet views,formula reference mode,drawing/window services remain explicitly unported. DeselectAllTables is a source dispatcher operation,not an invented extra main-menu item. Navigation/grouping does not create substitute workbook/selection state. Current task9/10;full all-app suite runs at task10 under the user testing cadence. Work stays on Calc checkout/branch;no merges,network or other checkouts.
