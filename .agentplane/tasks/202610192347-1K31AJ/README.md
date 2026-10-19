---
id: "202610192347-1K31AJ"
title: "Implement Calc overline UI with canonical shared attribute toggle and ODS properties"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 12
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-19T23:47:28.004Z"
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
    body: "Start: implement native Overline UI and source shared toggle preparation with actual selection/history/ODS owners;keep approved calc scope and raw100 validation."
events:
  -
    type: "status"
    at: "2026-10-19T23:47:33.228Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implement native Overline UI and source shared toggle preparation with actual selection/history/ODS owners;keep approved calc scope and raw100 validation."
doc_version: 3
doc_updated_at: "2026-10-19T23:58:14.295Z"
doc_updated_by: "CODER"
description: "Task42 of the authorized Calc UI goal after verified task41. Implement native Overline11568/Which105 through shared source toggle semantics,actual font items,selection/history and existing Writer menu components;preserve complete line metadata in native ODS and browser painting. Only calc checkout/branch;Calc100 plus related/current-owner100 checks,next full checkpoint50."
sections:
  Summary: "Task42 connects the native Overline action to the actual Calc document and shared Writer UI after verified task41 (implementation7d39aed21bac,closure0b3351f11a50). Previous goal turn made authoritative implementation and verification progress;overall UI goal remains active."
  Scope: "Only vite-office-calc branch calc,up to50non-task paths for consumed shared Sfx attribute-toggle responsibility,Calc Overline formatting/controller/slot/presentation,shared XML tokens and existing line property handlers,actual ODS tests/browser and accurate runtime/provenance/capability documentation. No network,branches,merges,outside-repo reads,full device services or verification weakening. Existing Writer primary-save/open/no-recovery deviations preserved."
  Plan: "Audit pinned SfxBindings::Execute_Impl toggle preparation and Calc ExecuteAttr/GetAttrState,Overline SDI and Calc chained XML line mappings. Extract consumed common bool/enum toggle preparation over actual SfxItemSet/default/INVALID states and real factory items,without inventing shell/pool/service providers. Bind source Overline11568/105 through actual native item and existing selection/history;typed requests retain full line metadata. Reuse Writer menu rendering;paint plain-cell overline together with underline. Extend actual XML token/property mapping to native overline style/type/width/color using existing common line handlers and source merge/default rules. Test native states,selection/history,pending input,typed items,independently authored ODS and page/Worker/UI persistence. Retain raw100 evidence and accurate source/registry boundaries;record quality,commit and clean closure."
  Verify Steps: "Read task brief/verify-show and pinned source hash/marker evidence. Run npm run test:coverage:calc with raw S/B/F/L100 and real nonempty reports;related shared/Writer tests and complete changed executable owner raw100,current source hashes,no threshold/exclusion reduction. Verify native bool/enum/default/SET/INVALID/DISABLED/UNKNOWN toggle/factory branches,actual overline typed metadata,mixed/grouped/disjoint selections,Undo/Redo,pending-input admission,source ODS multi-property handlers/color/automatic-style registration,independent XML and DOM-free Worker. Fresh build and focused browser at1280/390 actual Format/Text menu checked/mixed state,glyph painting,history and primary-save/reload/reopen,no uncaught errors. Run types,authored lint/format respecting existing ignored artifacts,dependencies,JSDoc,size,Calc/Writer resources,source tree/provenance,inventory invariants/scoped parity,affected tooling,static smoke,routing/doctor,diff. Record exact commands/exits/counts/raw/source evidence,quality report,implementation commit and clean final calc status. No full suite repeat before checkpoint50."
  Verification: |-
    Command: npm run test:coverage:calc -- --coverage.reportsDirectory=coverage/task42-calc-final --coverage.reporter=json --coverage.reporter=text --coverage.reportOnFailure=true --reporter=json --outputFile=../../output/playwright/task42-calc-final-results.json
    Result: pass,exit0. Evidence: evidence/calc-proof.json,calc-raw.json.gz,calc-results.json.gz,calc-complete.log. Scope:128files390cases;raw S8355/B5292/F1631/L7477 all100,current source hashes.

    Command: npm run test:coverage:shared -- src/sfx2/source/control src/xmloff/source/core src/sw/source/filter/xml/odt-span-roundtrip.test.ts --coverage.include=src/sfx2/source/control/bindings.ts --coverage.include=src/xmloff/source/core/xmltoken.ts --coverage.reportsDirectory=coverage/task42-shared-final --coverage.reporter=json --coverage.reporter=text --coverage.reportOnFailure=true --reporter=json --outputFile=../../output/playwright/task42-shared-final-results.json
    Result: pass,exit0. Evidence: shared-proof.json,shared-raw.json.gz,shared-results.json.gz,shared-complete.log. Scope:12files58cases including actual Writer XML-span consumer;complete shared owners S260/B29/F10/L258 all100. Complete-owner-proof.json checks all7changed executable owners and all current raw hashes;no coverage exclusions or thresholds reduced.

    Command: npm run build; npx playwright test --config apps/office/playwright.config.ts --project calc --workers=2 apps/office/e2e/calc/overline.spec.ts apps/office/e2e/calc/formatting-toolbar.spec.ts apps/office/e2e/calc/ods.spec.ts
    Result: pass,exit0,6cases. Command: npx playwright test --config apps/office/playwright.config.ts --project shared --workers=2 apps/office/e2e/shared/menubar-pointer.spec.ts apps/office/e2e/shared/popup-pointer.spec.ts
    Result: pass,exit0,8cases. Evidence: task42-browser-final.log,task42-shared-browser-final.log,browser-proof.json. Scope:actual1280/390shared Writer/Calc UI,Overline menu/check state,simultaneous underline painting,Undo/Redo,primary autosave/reload/reopen and true DOM-free Worker native-item/ODS history. Two inspected initial screenshots are retained with an explicit initial-versus-final rebuild distinction;the final6case rebuilt suite confirms the same behavior. Initial shared-popup failure was a stale disabled Overline sample,replaced by the actual unsupported Strikethrough with all disabled-pointer assertions retained.

    Command: npm run typecheck; npx eslint . --max-warnings 0 --ignore-pattern 'output/playwright/**'; npx prettier --check . --ignore-path .prettierignore --ignore-path .gitignore; npm run check:dependencies; npm run check:docs; npm run check:file-size; npm run check:calc-resources; npm run check:writer-resources; npm run check:source-tree; npm run check:source-provenance; npm run inventory:invariants; npm run inventory:parity:calc; npm run inventory:parity:shared; npx vitest run scripts/check-source-provenance.test.ts scripts/check-lo-source-tree.test.ts; node scripts/check-static-build.mjs; node .agentplane/policy/check-routing.mjs; ap doctor; git diff --check
    Result: pass,exit0 for every listed check. Evidence: retained task42-* logs,compressed inventory/scoped parity. Scope:source/resource/static checks;925runtime owners791mapped/115browser/19infrastructure,0semantic violations;Calc463commands/11menus/17policy dispositions;Writer resource1file2cases and matched tooling1file3cases. No source-tree test file matched the optional path pattern and no nonexistent tests are counted. Final changed shared browser fixture separately passes ESLint/Prettier after its label correction.

    No mandatory checks skipped. Source-audit.json contains pinned native hashes/line markers and honest consumed-scope boundaries. CALC211 documents original mixed-factory line-color reset. Broad parity flags remain false. No full all-app repeat after checkpoint40;next checkpoint50. Final implementation/quality/closure identifiers are recorded through lifecycle commands.
  Rollback Plan: "Revert only intentional task42 implementation commits if required;retain task source/evidence and unrelated task state. User owns branch integration."
  Findings: |-
    Task42 follows existing user authorization in vite-office-calc branch calc only. Prior goal turn was progress:task41 implementation7d39aed21bac/closure0b3351f11a50 is authoritative,verified and clean. Unrelated C9TN6M/X6VV8G/Z7BW2Y remain untouched.

    Source-audit.json records pinned9bc445578031fecf56086729d8e4940c77e14d65 anchors for SfxBindings::Execute_Impl,Calc ExecuteAttr/GetAttrState,Overline SDI/default,shared XML property factory/map and native testRichTextExportODS. The shared createAttributeToggleItem is only the native value-state preparation portion;existing browser routing owns requests. No fake SfxShell,pool or native service is added. Actual Calc105selection states are known/toggleable and the concrete source factory is used. Generic disabled/unknown/non-bool states are tested at the shared boundary;an initial redundant consumer return was removed under this native precondition. This is not a full SfxBindings/UNO dispatch certificate.

    Command: focused Calc unit,scoped Calc raw coverage and related shared/Writer owner coverage. Result:pass final128files390Calc cases and12files58related cases. Evidence:raw/proof/results/log files,complete-owner-proof.json. Initial3case Overline tests passed;initial full Calc found only the redundant native consumer guard. Final raw S/B/F/L100 for Calc and every7complete changed executable owner,with current source hashes. No thresholds/exclusions lowered,no fake-state provider introduced. Initial type candidates required optional checked-state omission and accurate native clone typing;JSDoc candidates required keeping the opening fileoverview before imports and documenting the runtime type. All corrected gates pass.

    Command:fresh build and actual browser suites. Result:pass14unique finalcases at1280/390. Evidence:browser-proof.json,logs and inspected initial screenshots with their temporal scope stated. Actual menu toggles keep uniform line metadata,mixed marks use source factory defaults,grouped/disjoint selections have actual attribute-only history and primary ODS bytes retain style/type/width/color. Independent authored XML and page/DOM-free Worker exercise true owners. Initial shared-popup tests expected Overline disabled because it was previously unimplemented. Disabled-row assertions now use the still unsupported Strikethrough;8shared tests pass with assertions retained. No production fallback was added.

    Native mixed INVALID toggle creates a new default item and resets independent line color;uniform toggling clones and retains that color. Preserve both and document CALC211. Native overline maps to the same type/style/width/color handlers as underline;independent per-group Any values and real Which105automatic-style registration are used. Tokens append to the existing stable browser token enum without renumbering existing identities. Existing Writer controls/storage/no-recovery policy remain. Browser plain-cell painting represents NONE/SINGLE/DOUBLE and independent color;device-specific dash/wave/thickness,theme-color XML,rich edit,line modes,filtered/alternate sheet views and full native service parity remain unverified. Native rich-text QA is a source reference,not an executed full EditEngine certificate. Broad parity flags remain false.

    Scope stays within approved50non-task paths (27actual). No network,external writes,branch changes,merges or outside-repo access. Full checkpoint cadence remains next50. All declared acceptance evidence passes;overall Calc UI goal remains active after bounded task42 closure.
id_source: "generated"
---
## Summary

Task42 connects the native Overline action to the actual Calc document and shared Writer UI after verified task41 (implementation7d39aed21bac,closure0b3351f11a50). Previous goal turn made authoritative implementation and verification progress;overall UI goal remains active.

## Scope

Only vite-office-calc branch calc,up to50non-task paths for consumed shared Sfx attribute-toggle responsibility,Calc Overline formatting/controller/slot/presentation,shared XML tokens and existing line property handlers,actual ODS tests/browser and accurate runtime/provenance/capability documentation. No network,branches,merges,outside-repo reads,full device services or verification weakening. Existing Writer primary-save/open/no-recovery deviations preserved.

## Plan

Audit pinned SfxBindings::Execute_Impl toggle preparation and Calc ExecuteAttr/GetAttrState,Overline SDI and Calc chained XML line mappings. Extract consumed common bool/enum toggle preparation over actual SfxItemSet/default/INVALID states and real factory items,without inventing shell/pool/service providers. Bind source Overline11568/105 through actual native item and existing selection/history;typed requests retain full line metadata. Reuse Writer menu rendering;paint plain-cell overline together with underline. Extend actual XML token/property mapping to native overline style/type/width/color using existing common line handlers and source merge/default rules. Test native states,selection/history,pending input,typed items,independently authored ODS and page/Worker/UI persistence. Retain raw100 evidence and accurate source/registry boundaries;record quality,commit and clean closure.

## Verify Steps

Read task brief/verify-show and pinned source hash/marker evidence. Run npm run test:coverage:calc with raw S/B/F/L100 and real nonempty reports;related shared/Writer tests and complete changed executable owner raw100,current source hashes,no threshold/exclusion reduction. Verify native bool/enum/default/SET/INVALID/DISABLED/UNKNOWN toggle/factory branches,actual overline typed metadata,mixed/grouped/disjoint selections,Undo/Redo,pending-input admission,source ODS multi-property handlers/color/automatic-style registration,independent XML and DOM-free Worker. Fresh build and focused browser at1280/390 actual Format/Text menu checked/mixed state,glyph painting,history and primary-save/reload/reopen,no uncaught errors. Run types,authored lint/format respecting existing ignored artifacts,dependencies,JSDoc,size,Calc/Writer resources,source tree/provenance,inventory invariants/scoped parity,affected tooling,static smoke,routing/doctor,diff. Record exact commands/exits/counts/raw/source evidence,quality report,implementation commit and clean final calc status. No full suite repeat before checkpoint50.

## Verification

Command: npm run test:coverage:calc -- --coverage.reportsDirectory=coverage/task42-calc-final --coverage.reporter=json --coverage.reporter=text --coverage.reportOnFailure=true --reporter=json --outputFile=../../output/playwright/task42-calc-final-results.json
Result: pass,exit0. Evidence: evidence/calc-proof.json,calc-raw.json.gz,calc-results.json.gz,calc-complete.log. Scope:128files390cases;raw S8355/B5292/F1631/L7477 all100,current source hashes.

Command: npm run test:coverage:shared -- src/sfx2/source/control src/xmloff/source/core src/sw/source/filter/xml/odt-span-roundtrip.test.ts --coverage.include=src/sfx2/source/control/bindings.ts --coverage.include=src/xmloff/source/core/xmltoken.ts --coverage.reportsDirectory=coverage/task42-shared-final --coverage.reporter=json --coverage.reporter=text --coverage.reportOnFailure=true --reporter=json --outputFile=../../output/playwright/task42-shared-final-results.json
Result: pass,exit0. Evidence: shared-proof.json,shared-raw.json.gz,shared-results.json.gz,shared-complete.log. Scope:12files58cases including actual Writer XML-span consumer;complete shared owners S260/B29/F10/L258 all100. Complete-owner-proof.json checks all7changed executable owners and all current raw hashes;no coverage exclusions or thresholds reduced.

Command: npm run build; npx playwright test --config apps/office/playwright.config.ts --project calc --workers=2 apps/office/e2e/calc/overline.spec.ts apps/office/e2e/calc/formatting-toolbar.spec.ts apps/office/e2e/calc/ods.spec.ts
Result: pass,exit0,6cases. Command: npx playwright test --config apps/office/playwright.config.ts --project shared --workers=2 apps/office/e2e/shared/menubar-pointer.spec.ts apps/office/e2e/shared/popup-pointer.spec.ts
Result: pass,exit0,8cases. Evidence: task42-browser-final.log,task42-shared-browser-final.log,browser-proof.json. Scope:actual1280/390shared Writer/Calc UI,Overline menu/check state,simultaneous underline painting,Undo/Redo,primary autosave/reload/reopen and true DOM-free Worker native-item/ODS history. Two inspected initial screenshots are retained with an explicit initial-versus-final rebuild distinction;the final6case rebuilt suite confirms the same behavior. Initial shared-popup failure was a stale disabled Overline sample,replaced by the actual unsupported Strikethrough with all disabled-pointer assertions retained.

Command: npm run typecheck; npx eslint . --max-warnings 0 --ignore-pattern 'output/playwright/**'; npx prettier --check . --ignore-path .prettierignore --ignore-path .gitignore; npm run check:dependencies; npm run check:docs; npm run check:file-size; npm run check:calc-resources; npm run check:writer-resources; npm run check:source-tree; npm run check:source-provenance; npm run inventory:invariants; npm run inventory:parity:calc; npm run inventory:parity:shared; npx vitest run scripts/check-source-provenance.test.ts scripts/check-lo-source-tree.test.ts; node scripts/check-static-build.mjs; node .agentplane/policy/check-routing.mjs; ap doctor; git diff --check
Result: pass,exit0 for every listed check. Evidence: retained task42-* logs,compressed inventory/scoped parity. Scope:source/resource/static checks;925runtime owners791mapped/115browser/19infrastructure,0semantic violations;Calc463commands/11menus/17policy dispositions;Writer resource1file2cases and matched tooling1file3cases. No source-tree test file matched the optional path pattern and no nonexistent tests are counted. Final changed shared browser fixture separately passes ESLint/Prettier after its label correction.

No mandatory checks skipped. Source-audit.json contains pinned native hashes/line markers and honest consumed-scope boundaries. CALC211 documents original mixed-factory line-color reset. Broad parity flags remain false. No full all-app repeat after checkpoint40;next checkpoint50. Final implementation/quality/closure identifiers are recorded through lifecycle commands.

## Rollback Plan

Revert only intentional task42 implementation commits if required;retain task source/evidence and unrelated task state. User owns branch integration.

## Findings

Task42 follows existing user authorization in vite-office-calc branch calc only. Prior goal turn was progress:task41 implementation7d39aed21bac/closure0b3351f11a50 is authoritative,verified and clean. Unrelated C9TN6M/X6VV8G/Z7BW2Y remain untouched.

Source-audit.json records pinned9bc445578031fecf56086729d8e4940c77e14d65 anchors for SfxBindings::Execute_Impl,Calc ExecuteAttr/GetAttrState,Overline SDI/default,shared XML property factory/map and native testRichTextExportODS. The shared createAttributeToggleItem is only the native value-state preparation portion;existing browser routing owns requests. No fake SfxShell,pool or native service is added. Actual Calc105selection states are known/toggleable and the concrete source factory is used. Generic disabled/unknown/non-bool states are tested at the shared boundary;an initial redundant consumer return was removed under this native precondition. This is not a full SfxBindings/UNO dispatch certificate.

Command: focused Calc unit,scoped Calc raw coverage and related shared/Writer owner coverage. Result:pass final128files390Calc cases and12files58related cases. Evidence:raw/proof/results/log files,complete-owner-proof.json. Initial3case Overline tests passed;initial full Calc found only the redundant native consumer guard. Final raw S/B/F/L100 for Calc and every7complete changed executable owner,with current source hashes. No thresholds/exclusions lowered,no fake-state provider introduced. Initial type candidates required optional checked-state omission and accurate native clone typing;JSDoc candidates required keeping the opening fileoverview before imports and documenting the runtime type. All corrected gates pass.

Command:fresh build and actual browser suites. Result:pass14unique finalcases at1280/390. Evidence:browser-proof.json,logs and inspected initial screenshots with their temporal scope stated. Actual menu toggles keep uniform line metadata,mixed marks use source factory defaults,grouped/disjoint selections have actual attribute-only history and primary ODS bytes retain style/type/width/color. Independent authored XML and page/DOM-free Worker exercise true owners. Initial shared-popup tests expected Overline disabled because it was previously unimplemented. Disabled-row assertions now use the still unsupported Strikethrough;8shared tests pass with assertions retained. No production fallback was added.

Native mixed INVALID toggle creates a new default item and resets independent line color;uniform toggling clones and retains that color. Preserve both and document CALC211. Native overline maps to the same type/style/width/color handlers as underline;independent per-group Any values and real Which105automatic-style registration are used. Tokens append to the existing stable browser token enum without renumbering existing identities. Existing Writer controls/storage/no-recovery policy remain. Browser plain-cell painting represents NONE/SINGLE/DOUBLE and independent color;device-specific dash/wave/thickness,theme-color XML,rich edit,line modes,filtered/alternate sheet views and full native service parity remain unverified. Native rich-text QA is a source reference,not an executed full EditEngine certificate. Broad parity flags remain false.

Scope stays within approved50non-task paths (27actual). No network,external writes,branch changes,merges or outside-repo access. Full checkpoint cadence remains next50. All declared acceptance evidence passes;overall Calc UI goal remains active after bounded task42 closure.
