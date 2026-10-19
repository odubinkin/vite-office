---
id: "202610192106-5G2DBD"
title: "Connect Calc alignment controls to native items and ODS properties"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 14
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-19T21:06:45.145Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "pending"
  updated_at: null
  updated_by: null
  note: null
  attempts: 0
commit: null
comments:
  -
    author: "CODER"
    body: "Start: implement the authorized native alignment toolbar/menu and ODS slice,using shared Writer controls,original item/history ownership and scoped raw100 checks;calc checkout only."
events:
  -
    type: "status"
    at: "2026-10-19T21:06:50.979Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implement the authorized native alignment toolbar/menu and ODS slice,using shared Writer controls,original item/history ownership and scoped raw100 checks;calc checkout only."
doc_version: 3
doc_updated_at: "2026-10-19T21:33:12.211Z"
doc_updated_by: "CODER"
description: "Task39 of the authorized Calc UI goal:actual shared Writer command buttons and Format menu use original horizontal/vertical alignment slots,toggle versus explicit semantics,native selection/history and ODS property handlers. Work only vite-office-calc on calc. Full Calc and changed executable owner raw100,related tests,fresh1280/390browser evidence;next all-app task40."
sections:
  Summary: "Task39 continues the active Calc UI goal with horizontal/vertical native cell alignment. Previous turn made verified progress:task38 completed with implementation c83f70943eb3,Calc363cases and related11891cases raw100 plus21browser cases;checkout clean on calc."
  Scope: "Only /Users/odubinkin/Projects/vite-office-calc on calc. Up to80non-task paths:existing Calc formatsh/controller/SDI/grid and formatting resource tests;native cell-alignment XML handlers/maps/contexts/export plus consumed shared token/base handler contracts if required;focused unit/native/ODS/browser tests;affected Calc/shared runtime/provenance/capability records,boundary rules and suspected-upstream-issue documentation. Actual shared Writer toolbar/menu composition remains reused. No network,other checkout,merge,branch,recovery/save-policy change or unrelated dependency programme. Native full rich/wrapped/bidirectional layout,configuration and named-style services stay unported and unverified."
  Plan: "Implement original toolbar alignment toggles and explicit Format-menu operations using actual horizontal129/vertical132 native items;preserve mixed/default state,selection/history and failed-input behavior. Bind existing shared Writer command components;paint supported plain cells using actual native values. Port consumed original Calc ODS horizontal/source/repeat and vertical property handlers with exact Any types,merge/default behavior and explicit unsupported diagnostics;test independently authored XML and real bytes/reopens. Run Calc and full changed executable owner raw S/B/F/L100,related tests,fresh1280/390browser and all declared static/source/resource/scoped inventory gates;record quality and clean local closure. Full all-app next task40."
  Verify Steps: "Run npm run test:coverage:calc with nonempty raw S/B/F/L100,without coverage exclusions/threshold changes. Verify all changed executable application owners100 with current source hashes and related tests. Exercise actual toolbar toggle versus explicit menu selection,native enum/default/mixed states,unrelated item preservation,sparse/grouped/full-axis selection,history,failed input and disabled/unimplemented requests. Verify real ODS bytes,repeated reopen,independent horizontal/source/repeat/vertical XML,all consumed handler branches and merge/default/type semantics. Compare source functions/defaults to pinned local upstream9bc445578031fecf56086729d8e4940c77e14d65. Fresh build and1280/390browser verify actual buttons/menu,CSS geometry,history and no exceptions;page/Worker ODS keeps native attributes. Root/app types,changed-path ESLint/Prettier,JSDoc,size/tree,dependencies,boundary tests,provenance,resources,affected Calc/shared/Writer scoped inventories,static smoke,routing,doctor,diff;retained raw evidence and quality review;clean calc tree. Full all-app regression next task40 per user cadence."
  Verification: |-
    Command:npm run test:coverage:calc -- --coverage.reportsDirectory=coverage/task39-calc-final --coverage.reporter=json --coverage.reporter=text,cwd apps/office. Result:pass. Evidence:125files372cases;raw S8123/B5113/F1601/L7284 all100,current source hashes and raw SHA in evidence/calc-alignment-final-proof.json. Scope:all Calc coverage owners and actual alignment/ODS/UI/selection/history contracts.

    Command:node .agentplane/tasks/202610192106-5G2DBD/run-related-alignment.mjs. Result:initial related graph467files8582cases produced8573passed/9failed across2Writer expectation files. Exact4shared production hashes remain unchanged. Corrections retain the actual native boolean menu roles and complete SvxFontItem payloads;the FontCommandSelects test also checks the real missing-command descriptor. Fresh targeted command in evidence/related-alignment-focused-third-command.json passed26files213cases and measured all4complete shared owners raw S551/B306/F79/L519 all100. All3modified Writer files are in that fresh run;no test case removed. Scope:original related graph plus fresh affected-source/test reconciliation;no replay of465unchanged passing files. Full changed-owner evidence verifies11executable application owners100,current hashes,in changed-alignment-owners-proof.json.

    Command:npm run build;npx playwright test --config apps/office/playwright.config.ts --project calc --workers=1;node scripts/check-static-build.mjs. Result:pass. Evidence:23browser cases in one fresh run;actual1280/390screenshots visually inspected. Scope:toolbar radio/default/mixed state,explicit Format menu,keyboard shortcuts,physical top/middle/bottom text placement,native undo/redo and ODS native129/132attributes in page and DOM-free Worker;no exceptions.

    Command:npm run typecheck;changed-path ESLint/Prettier;npm run check:docs;npm run check:dependencies;npm run check:file-size;npm run check:source-tree;npm run check:source-provenance;npm run inventory:parity:calc/shared/writer;npm run check:calc-resources;npm run check:writer-resources;npx vitest run scripts/check-module-boundaries.test.ts;node .agentplane/policy/check-routing.mjs;ap doctor;git diff --check. Result:pass,with final post-test-expectation lint/type refresh recorded before closure. Evidence:task39logs,89boundary/tooling cases and2Writerresource cases;12native source owners anchored at pinned9bc445578031fecf56086729d8e4940c77e14d65. Scope:approved changed paths and complete declared gates. Full all-app remains scheduled for task40,last done30,under user cadence;no mandatory gate skipped.

    Limitations:bounded source audit and actual managed/browser evidence are not a compiled full-native parity certificate. Full native request redispatch/service/context lifecycle,rich/wrapped/bidirectional/rotation/repeated-content/device layout,named styles and complete UNO filter graph remain unported or unverified. No broad parity flags promoted. Overall goal remains active.
  Rollback Plan: "Revert only intentional task39 implementation commits if necessary;preserve task evidence and unrelated active tasks. No merge/reset or save/recovery-policy changes."
  Findings: |-
    Preflight:direct workflow;branch calc;clean tree. No nested source AGENTS or .agentplane/user-instructions.md found. Network approval required and unused. Existing native SvxHorJustifyItem/SvxVerJustifyItem and contiguous pool defaults129/132 are available. Native toolbar ExecuteTextAttr toggles matching alignment to Standard;Format-menu ExecuteAlignment applies explicit values. Actual source XML mapping merges paragraph fo:text-align and cell style:text-align-source/style:repeat-content into one horizontal UNO property;vertical is a typed32cell property. Existing browser grid paints only scalar-derived left/right;new UI must consume actual native attributes. Full RTL/rich/wrapped/device rendering is not assumed.

    Implementation progress:original7toolbar and9explicit pseudo slots are bound to real item129/132 state,actual selection/undo and common Writer buttons/menu. Native toolbar boolean/INVALID state and framework menu boolean state reveal a shared simplification:resource metadata alone suppressed checked state for non-Toggle SDI slots. Common command presentation now honors live boolean/mixed state,as pinned tbxitem.cxx/menubarmanager.cxx do;the existing keyboard action fixture now omits boolean state rather than providing a fake false bool for every action. Shared checked/mixed UI is tested through actual Calc dispatch.

    Source ODS horizontal merge uses one actual style-owned Any across paragraph/cell groups,with native fix/false no-write success,REPEAT precedence and value-type reset. Native handler lexical/type/failure/equality tests and actual package/independent XML tests pass. Original12source-owner hashes/markers retained. The native formatCells alignment-tab test is a source reference for stored horizontal/vertical choices;it is not an executed test certificate or a claim that its dialog/other properties are ported.

    Verification observations:focused native/ODS/UI checks pass. Third full Calc run passes125files372cases with S8123/B5114of5115/F1601/L7284;one redundant consumer failure guard remains unreachable because real SvxVerJustifyItem.QueryValue always maps to supported signed32 CellVertJustify2 values. The consumer now relies on that original typed precondition while the property handler retains its failed-Any branches,which are tested directly. Final Calc raw run is pending. Earlier two full runs found a stale unsupported-paragraph expectation and then an unknown graphic-properties test fixture;the actual unported known row-property group now retains the diagnostic coverage,with17focused ODS cases green. Root types found an exact-optional fixture issue,corrected by omitting the absent checked property. No gates weakened,no exclusions or thresholds changed. Current source inventories,boundaries,docs,size/tree,provenance,resources,doctor/routing passed before the final typed-precondition refinement. Full all-app next task40.

    Final acceptance:Calc372cases and23fresh browser cases pass. Related initial graph8582cases found9stale Writer expectations;all modified Writer test files pass in the fresh213case focused run with4complete shared owners raw100. All11changed executable owners are measured100 with current source hashes. Source native formats preserve original toolbar toggling versus explicit menu semantics and typed ODS merged properties. Fresh screenshot geometry is visually inspected. Under80approved non-task paths,no scope expansion,no network/merge/other checkout. All-app next task40. Initial and intermediate failures/raw coverage remain retained;final-proof files are authoritative. No native full-module parity promotion.
id_source: "generated"
---
## Summary

Task39 continues the active Calc UI goal with horizontal/vertical native cell alignment. Previous turn made verified progress:task38 completed with implementation c83f70943eb3,Calc363cases and related11891cases raw100 plus21browser cases;checkout clean on calc.

## Scope

Only /Users/odubinkin/Projects/vite-office-calc on calc. Up to80non-task paths:existing Calc formatsh/controller/SDI/grid and formatting resource tests;native cell-alignment XML handlers/maps/contexts/export plus consumed shared token/base handler contracts if required;focused unit/native/ODS/browser tests;affected Calc/shared runtime/provenance/capability records,boundary rules and suspected-upstream-issue documentation. Actual shared Writer toolbar/menu composition remains reused. No network,other checkout,merge,branch,recovery/save-policy change or unrelated dependency programme. Native full rich/wrapped/bidirectional layout,configuration and named-style services stay unported and unverified.

## Plan

Implement original toolbar alignment toggles and explicit Format-menu operations using actual horizontal129/vertical132 native items;preserve mixed/default state,selection/history and failed-input behavior. Bind existing shared Writer command components;paint supported plain cells using actual native values. Port consumed original Calc ODS horizontal/source/repeat and vertical property handlers with exact Any types,merge/default behavior and explicit unsupported diagnostics;test independently authored XML and real bytes/reopens. Run Calc and full changed executable owner raw S/B/F/L100,related tests,fresh1280/390browser and all declared static/source/resource/scoped inventory gates;record quality and clean local closure. Full all-app next task40.

## Verify Steps

Run npm run test:coverage:calc with nonempty raw S/B/F/L100,without coverage exclusions/threshold changes. Verify all changed executable application owners100 with current source hashes and related tests. Exercise actual toolbar toggle versus explicit menu selection,native enum/default/mixed states,unrelated item preservation,sparse/grouped/full-axis selection,history,failed input and disabled/unimplemented requests. Verify real ODS bytes,repeated reopen,independent horizontal/source/repeat/vertical XML,all consumed handler branches and merge/default/type semantics. Compare source functions/defaults to pinned local upstream9bc445578031fecf56086729d8e4940c77e14d65. Fresh build and1280/390browser verify actual buttons/menu,CSS geometry,history and no exceptions;page/Worker ODS keeps native attributes. Root/app types,changed-path ESLint/Prettier,JSDoc,size/tree,dependencies,boundary tests,provenance,resources,affected Calc/shared/Writer scoped inventories,static smoke,routing,doctor,diff;retained raw evidence and quality review;clean calc tree. Full all-app regression next task40 per user cadence.

## Verification

Command:npm run test:coverage:calc -- --coverage.reportsDirectory=coverage/task39-calc-final --coverage.reporter=json --coverage.reporter=text,cwd apps/office. Result:pass. Evidence:125files372cases;raw S8123/B5113/F1601/L7284 all100,current source hashes and raw SHA in evidence/calc-alignment-final-proof.json. Scope:all Calc coverage owners and actual alignment/ODS/UI/selection/history contracts.

Command:node .agentplane/tasks/202610192106-5G2DBD/run-related-alignment.mjs. Result:initial related graph467files8582cases produced8573passed/9failed across2Writer expectation files. Exact4shared production hashes remain unchanged. Corrections retain the actual native boolean menu roles and complete SvxFontItem payloads;the FontCommandSelects test also checks the real missing-command descriptor. Fresh targeted command in evidence/related-alignment-focused-third-command.json passed26files213cases and measured all4complete shared owners raw S551/B306/F79/L519 all100. All3modified Writer files are in that fresh run;no test case removed. Scope:original related graph plus fresh affected-source/test reconciliation;no replay of465unchanged passing files. Full changed-owner evidence verifies11executable application owners100,current hashes,in changed-alignment-owners-proof.json.

Command:npm run build;npx playwright test --config apps/office/playwright.config.ts --project calc --workers=1;node scripts/check-static-build.mjs. Result:pass. Evidence:23browser cases in one fresh run;actual1280/390screenshots visually inspected. Scope:toolbar radio/default/mixed state,explicit Format menu,keyboard shortcuts,physical top/middle/bottom text placement,native undo/redo and ODS native129/132attributes in page and DOM-free Worker;no exceptions.

Command:npm run typecheck;changed-path ESLint/Prettier;npm run check:docs;npm run check:dependencies;npm run check:file-size;npm run check:source-tree;npm run check:source-provenance;npm run inventory:parity:calc/shared/writer;npm run check:calc-resources;npm run check:writer-resources;npx vitest run scripts/check-module-boundaries.test.ts;node .agentplane/policy/check-routing.mjs;ap doctor;git diff --check. Result:pass,with final post-test-expectation lint/type refresh recorded before closure. Evidence:task39logs,89boundary/tooling cases and2Writerresource cases;12native source owners anchored at pinned9bc445578031fecf56086729d8e4940c77e14d65. Scope:approved changed paths and complete declared gates. Full all-app remains scheduled for task40,last done30,under user cadence;no mandatory gate skipped.

Limitations:bounded source audit and actual managed/browser evidence are not a compiled full-native parity certificate. Full native request redispatch/service/context lifecycle,rich/wrapped/bidirectional/rotation/repeated-content/device layout,named styles and complete UNO filter graph remain unported or unverified. No broad parity flags promoted. Overall goal remains active.

## Rollback Plan

Revert only intentional task39 implementation commits if necessary;preserve task evidence and unrelated active tasks. No merge/reset or save/recovery-policy changes.

## Findings

Preflight:direct workflow;branch calc;clean tree. No nested source AGENTS or .agentplane/user-instructions.md found. Network approval required and unused. Existing native SvxHorJustifyItem/SvxVerJustifyItem and contiguous pool defaults129/132 are available. Native toolbar ExecuteTextAttr toggles matching alignment to Standard;Format-menu ExecuteAlignment applies explicit values. Actual source XML mapping merges paragraph fo:text-align and cell style:text-align-source/style:repeat-content into one horizontal UNO property;vertical is a typed32cell property. Existing browser grid paints only scalar-derived left/right;new UI must consume actual native attributes. Full RTL/rich/wrapped/device rendering is not assumed.

Implementation progress:original7toolbar and9explicit pseudo slots are bound to real item129/132 state,actual selection/undo and common Writer buttons/menu. Native toolbar boolean/INVALID state and framework menu boolean state reveal a shared simplification:resource metadata alone suppressed checked state for non-Toggle SDI slots. Common command presentation now honors live boolean/mixed state,as pinned tbxitem.cxx/menubarmanager.cxx do;the existing keyboard action fixture now omits boolean state rather than providing a fake false bool for every action. Shared checked/mixed UI is tested through actual Calc dispatch.

Source ODS horizontal merge uses one actual style-owned Any across paragraph/cell groups,with native fix/false no-write success,REPEAT precedence and value-type reset. Native handler lexical/type/failure/equality tests and actual package/independent XML tests pass. Original12source-owner hashes/markers retained. The native formatCells alignment-tab test is a source reference for stored horizontal/vertical choices;it is not an executed test certificate or a claim that its dialog/other properties are ported.

Verification observations:focused native/ODS/UI checks pass. Third full Calc run passes125files372cases with S8123/B5114of5115/F1601/L7284;one redundant consumer failure guard remains unreachable because real SvxVerJustifyItem.QueryValue always maps to supported signed32 CellVertJustify2 values. The consumer now relies on that original typed precondition while the property handler retains its failed-Any branches,which are tested directly. Final Calc raw run is pending. Earlier two full runs found a stale unsupported-paragraph expectation and then an unknown graphic-properties test fixture;the actual unported known row-property group now retains the diagnostic coverage,with17focused ODS cases green. Root types found an exact-optional fixture issue,corrected by omitting the absent checked property. No gates weakened,no exclusions or thresholds changed. Current source inventories,boundaries,docs,size/tree,provenance,resources,doctor/routing passed before the final typed-precondition refinement. Full all-app next task40.

Final acceptance:Calc372cases and23fresh browser cases pass. Related initial graph8582cases found9stale Writer expectations;all modified Writer test files pass in the fresh213case focused run with4complete shared owners raw100. All11changed executable owners are measured100 with current source hashes. Source native formats preserve original toolbar toggling versus explicit menu semantics and typed ODS merged properties. Fresh screenshot geometry is visually inspected. Under80approved non-task paths,no scope expansion,no network/merge/other checkout. All-app next task40. Initial and intermediate failures/raw coverage remain retained;final-proof files are authoritative. No native full-module parity promotion.
