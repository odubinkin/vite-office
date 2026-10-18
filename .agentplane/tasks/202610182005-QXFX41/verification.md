Command: npm run test:coverage:calc -- --maxWorkers=4 --reporter=dot
Result: pass
Evidence: calc-coverage.log;104 files,275 cases;raw statements6471/6471,branches4174/4174,functions1344/1344,lines5807/5807. No coverage exclusions or lower thresholds.
Scope: all current Calc runtime owners including native input mode subset,real controller and production presenters.

Command: npm exec --workspace @vite-office/office -- vitest run CommandMenuBar WriterMenuBar --maxWorkers=4 --reporter=dot
Result: pass
Evidence: related.log;9 files,110 cases.
Scope: shared menu behavior and Writer consumption.

Command: npm run typecheck; npx vitest run scripts/calc-sheet-command-source.test.ts scripts/writer-ui-resource-model.test.ts; npm run check:calc-resources; npm run check:writer-resources
Result: pass
Evidence: contracts-final.log;tools/app types,5 source/tooling cases,2 Writer resource cases;450 Calc commands,11 menus,17 explicit save-policy dispositions;generated resources unchanged.
Scope: native mode enum,source mode guard/toggle and original slot26552;resource freshness.

Command: npm run build; node .agentplane/tasks/202610182005-QXFX41/touched-checks.mjs; npm run check:dependencies; npm run check:docs; npm run check:file-size; npm run check:source-tree; npm run check:source-provenance
Result: pass
Evidence: build.log,style-final.log,gates-final.log;32 intentional non-task paths;846 runtime modules,730 mapped,98 browser adaptations,18 infrastructure. Existing bundle-size warnings unchanged.
Scope: production build,touched style,source/module/documentation/provenance constraints.

Command: npm run inventory:parity:calc; npm run inventory:parity:shared; ap doctor; node .agentplane/policy/check-routing.mjs
Result: pass
Evidence: inventory-final.log;both scoped semanticViolationCount0;doctor OK with existing managed-shim readiness warning;policy routing OK.
Scope: truthful bounded mode subset and source ownership;no whole Calc parity certification.

Command: Production browser http://127.0.0.1:5176/calc using actual keyboard/menu controls
Result: pass
Evidence: browser-review.json and tool transcript. Typed72 in F10,F2 entered TABLE,ArrowLeft moved caret to1 without modifying cell/history. Shared Edit/Cell Edit Mode switched to TYPE;ArrowRight committed72 and selected G10. Actual Undo cleared F10. TOP input42,F2 and Escape retained committed42 with Undo available.
Scope: built application,focus/caret,draft preservation,cell movement and real history.

Observations: Initial JSDoc gate found two missing comments on test act callbacks;added comments and reran gates successfully. Metadata update initially assumed native provenance shape for a browser-owned record;corrected to its actual responsibilities schema and all source/inventory checks passed. An intermediate task-artifact commit attempt encountered a log still changing after staging;execution/test handles were polled to terminal and final task-owned staging refreshes those logs. No source work was discarded and no test process restarted.

Cadence: This is approved UI task12. Full application regression was completed/repaired at task10;next full regression task20. The original goal remains active.
