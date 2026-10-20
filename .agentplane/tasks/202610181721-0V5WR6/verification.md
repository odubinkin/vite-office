Command: npm run test:coverage:calc
Result: pass
Evidence: calc-coverage.log;95files,252tests;6047/6047statements,3889/3889branches,1239/1239functions,5420/5420lines,all100%.
Scope: All Calc runtime modules,current core and new mounted production UI.

Command: npm run test:shared -- modulemanager.test bootstrap.test dispatch.test objsh.test undo.test
Result: pass
Evidence: shared-tests.log;25tests,5files.
Scope: Shared app registration,mounting,Sfx dispatch,shell and action history.

Command: npm run test:writer -- desktop.test.tsx
Result: pass
Evidence: desktop-tests.log;11tests.
Scope: Existing Writer desktop,launcher and remaining placeholder-suite route.

Command: npm run typecheck --workspace @vite-office/office; npm run build
Result: pass
Evidence: typecheck.log,build.log.
Scope: Complete application compilation/static production bundle;existing bundle-size advisory remains.

Command: npx eslint <all touched/new application source paths> --max-warnings 0; npx prettier --check <all touched/new source paths and Calc registry>
Result: pass
Evidence: lint.log,format.log.
Scope: Task source and metadata;exact path sets are present in the tool execution history.

Command: npm run check:dependencies; npm run check:docs; npm run check:file-size; npm run check:source-tree; npm run check:source-provenance; npm run inventory:parity:calc
Result: pass
Evidence: dependencies.log,docs.log,file-size.log,source-tree.log,provenance.log,parity.log.
Scope: Architecture boundaries,documentation,source ownership and bounded Calc registry evidence;no broad native parity claimed.

Command: Browser navigate /calc and browser evaluate actual rendered editing,history,sheets and last-cell geometry
Result: pass
Evidence: browser-review.json;result12,Undo empty,2sheets,last cell visible,scroll-independent cursor,zero console errors/warnings.
Scope: Production application;real source owners;React/Tailwind/shared Writer control style.

Skipped: Full all-app test run
Reason: User requires full regression once per10Agentplane tasks;current UI-cycle task5.
Risk: Changes outside Calc are covered only by focused shared/Writer tests at this step.
Approval: User testing instructions in the goal.
