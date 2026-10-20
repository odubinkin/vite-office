Command: npm run test:coverage:calc
Result: pass
Evidence: 102files,271tests;100% statements6433/6433,branches4134/4134,functions1334/1334,lines5770/5770 (calc-coverage.log).
Scope: Entire current Calc application after semantic markup repair,including real grid header selection,input,Go to Sheet and sheet/history/file operations.

Command: DEBUG_PRINT_LIMIT=1000 npm run test:coverage -- src/sw/browser src/framework/browser src/sc --coverage.include=src/framework/browser/presentation/CommandMenuBar.tsx --coverage.include=src/framework/browser/presentation/OfficeWorkspaceHeader.tsx --coverage.include=src/sc/browser/presentation/ScGridWindow.tsx --coverage.reportsDirectory=coverage/office-accessibility
Result: initial query migrations required repair
Evidence: 1709passed,14failed in8files (related-ui.log);failures referenced old top-button roles or ambiguous root/submenu Insert queries. No production command/selection behavior failure was identified. Queries now select actual root menuitems or the owned Table popup.
Scope: Broad affected browser UI graph,319files/1723cases.

Command: DEBUG_PRINT_LIMIT=1000 npm run test:coverage -- CommandMenuBar native-menubar native-disabled-menubar native-empty-menubar native-context-menu WriterMenuBar.test WriterPageLayout.test calc-files.test calc-presenters.test writer-view-document-key.test native-hyperlink-begin-edit.test native-numeric-row-insertion.test native-table-column-commands.test native-table-row-commands.test native-independent-column-insertion.test native-internet-edit-range.test native-internet-state-query.test --coverage.include=src/framework/browser/presentation/CommandMenuBar.tsx --coverage.include=src/framework/browser/presentation/OfficeWorkspaceHeader.tsx --coverage.include=src/sc/browser/presentation/ScGridWindow.tsx --coverage.reportsDirectory=coverage/office-accessibility
Result: pass
Evidence: 32files/286cases,including every repaired broad-run case;100% statements306/306,branches273/273,functions74/74,lines272/272 (related-final.log).
Scope: Actual shared menubar/title and Calc grid renderers,all previously failing native Writer UI cases,and native keyboard/focus/command contracts. Assertions and thresholds remain intact.

Command: npx playwright test --config apps/office/playwright.config.ts foundation.spec.ts shared/launcher.spec.ts writer-dialog-layout.spec.ts
Result: pass
Evidence: All6cases pass (axe-final.log):zero actual Calc axe violations,editable scalar+Undo,shared launcher,three Writer dialog geometry viewports.
Scope: Built shared Writer/Calc chrome and actual Calc grid/status semantics.

Command: npx playwright test --config apps/office/playwright.config.ts
Result: 372passed;2remaining test-role queries repaired and revalidated
Evidence: browser-regression.log records the complete374-case run. Only Home/End root-boundary cases still queried a button with a conditional File/Tools name. Both were updated to actual root menuitems;the focused file then passes all3cases (browser-boundary-final.log). No production changes followed that full browser run.
Scope: All existing browser menu/dialog,editing,layout and shared-runtime acceptance cases;all374 original cases are accounted for after the focused query repair.

Command: npm run typecheck; npm run build; node .agentplane/tasks/202610181929-YDAWMM/touched-checks.mjs; npm run check:dependencies; npm run check:docs; npm run check:file-size; npm run check:source-tree; npm run check:source-provenance; npm run inventory:parity:calc; npm run inventory:parity:shared; npm run inventory:parity:writer; ap doctor; node .agentplane/policy/check-routing.mjs
Result: pass
Evidence: App/tools types and production build pass;touched style and all module/docs/size/source gates pass;844runtime modules mapped and zero scoped semantic violations;doctorOK/routingOK. Existing chunk-size and managed-shim advisories remain unchanged.
Scope: Four runtime presentation modules,mechanical test-query migrations and bounded provenance updates;no kernel/command-state/style defaults were changed.

Command: Production Chromium http://127.0.0.1:5176/calc after semantic repair
Result: pass
Evidence: browser-calc-review.json confirms real h1,11top menuitems,native selection button inside columnheader,valid DIV status owner and Go to Sheet double-click returning to actual Sheet1;console0errors/0warnings.
Scope: Final built Calc owner chain and shared menu controls.

Cadence evidence: Task10 full application retry passes all16998cases/987files with100% all4metrics;full inventory123cases100% and tooling107cases pass. These results live under202610181859-1J8SQQ. This leaf uses only affected-module and browser verification after that scheduled full baseline.

Remaining scope: The overall Calc UI goal remains active. Unported formatting/input-mode/context-menu/clipboard services and broader chrome fidelity are recorded in task10 remaining-ui-audit.md. Correct browser ARIA does not certify whole native UI/accessibility parity.
