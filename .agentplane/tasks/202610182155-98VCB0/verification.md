# Task20 verification

Scope: native formatobjectbar projection (33 visible placements), actual shared Writer font widgets/glyphs/icons/styles, Sfx select controller composition and unchanged unavailable core state.39 intentional non-task paths. No architecture allowlist, coverage threshold, audit exclusion or fake slot was added.

## Completed checks

- Command: npm run test:coverage:calc. Result: pass. Evidence: calc-coverage-final-verified.log,111files/299cases;raw S6823/6823 B4390/4390 F1410/1410 L6112/6112,100percent each. Scope: whole Calc, including real production toolbar composition, unavailable state and native resource order.
- Command: focused Writer/shared Vitest checks. Result: pass. Evidence: related-final.log,4files/12cases;header-contract.log,1file/1case. Scope: genuine Writer font dispatch, preserved resolver arguments, embedded/nonstandard fonts,lifecycle and optional header region.
- Command: npm run test:inventory:coverage. Result: pass. Evidence: full-inventory-coverage.log,38files/123cases;raw S1734/1734 B1292/1292 F436/436 L1668/1668,100percent each. Scope: complete inventory suite.
- Command: npm run test:tooling. Result: pass. Evidence: full-tooling-final.log,14files/118cases. Scope: full tooling, native source fixtures and owner partition.
- Command: npm run test:e2e. Result: initially379passed/1failed of380. Evidence: full-browser.log and browser-worker-404 trace/network evidence. Observation: concurrent test:static rebuild removed a worker asset while the browser suite was importing ODT;request returned404. Impact: one native-bullet-font-roundtrip mobile case failed without a production semantic defect. Resolution: serialized final build, then npx playwright test native-bullet-font-roundtrip.spec.ts formatting-toolbar.spec.ts standard-toolbar.spec.ts sheet-context-menu.spec.ts --config apps/office/playwright.config.ts --project=writer --project=calc. Result:8passed. Evidence: build-verified.log and browser-verified.log. All380 cases are accounted for across the original run and replay;this is not one clean380case run. Final replay also validates final resolver consolidation at both viewports. No force clicks or weakened audit criteria.
- Command: npm run test:static;node scripts/check-static-build.mjs after final build. Result: pass. Evidence: full-static.log,static-verified.log. Scope: complete built static app.
- Command: npm run typecheck; npm run check:calc-resources; npm run check:writer-resources. Result: pass. Evidence: types-final.log,calc-resources-final.log,writer-resources-final.log. Scope: app/tools and generated native resources (463commands,11menus,17explicit policy dispositions).
- Command: touched-path Prettier/eslint runner; npm run check:dependencies; npm run check:docs; npm run check:file-size; npm run check:source-tree; npm run check:source-provenance. Result: pass. Evidence: style-complete.log39paths;dependencies-verified.log857runtime sources/3726relative imports/124allowed edges;docs-final-verified.log2293authored sources;size-final.log,tree.log,provenance-verified.log858runtime modules. Scope: declared complete gates.
- Command: npm run inventory:parity:calc; npm run inventory:parity:shared; npm run inventory:parity:writer; ap doctor; node .agentplane/policy/check-routing.mjs. Result: pass. Evidence: scoped inventory logs eachsemanticViolationCount0,doctor.log,routing.log. Existing managed hook readiness warning retained.

## Final full application coverage

Command: npm run test:coverage -- --maxWorkers=4 --reporter=dot. Result: pass. Evidence: full-app-coverage-complete.log,1000files/17055cases,807.21seconds;raw S46835/46835 B30178/30178 F9379/9379 L42581/42581,all100percent. Scope: complete Writer/Calc/shared application suite. Process84335 is terminal and JSON summary confirms raw100percent with0skipped. No tests or coverage criteria were weakened.

Previous complete full-app-coverage-verified.log:999files/17054cases all passed;raw S46835/46835 F9379/9379 L42581/42581,branch30177/30178. Missing branch was optional absent formatting region in OfficeWorkspaceHeader:both production apps now mount formatting. Added one real public optional-region contract test,without source changes or exclusions,and restarted required full coverage. Earlier interrupted full-app logs are not pass evidence.

## Repairs and limits

Initial shared font widget placement violated Framework/VCL and then SVX/Framework module boundaries. Final split keeps controlled SVX widgets dependent on VCL and injects them into Framework's generic Sfx controller. Actual Writer and Calc own integration tests;no partition exceptions.

GoToSheet option assertions now query the actual listbox rather than all document options,which include the new font widgets. Original expected row counts remain unchanged.

An automated resolver edit consumed neighboring standard toolbar JSX. Restored the standard toolbar,reviewed the final diff,and reran whole Calc100percent and final browser formatting/standard/context checks.

The task-artifact persistence command created50c4bb5aa but returned E_GIT because implementation changes remained in the direct checkout. Route recomputation returned continue_direct with no blocker. Only approved paths are present.

See remaining-ui-audit.md for actual unported services and mobile menubar clipping. Overall goal remains active;next full cadence30.
