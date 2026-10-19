---
id: "202610192137-N3DVTJ"
title: "Validate integrated Calc and Writer UI at the task40 regression checkpoint"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 16
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-19T21:38:16.800Z"
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
    body: "Start: execute the authorized task40 full integrated regression checkpoint,repair proven native/UI contract regressions without weakening gates,and retain current-source raw100/browser evidence;calc checkout only."
events:
  -
    type: "status"
    at: "2026-10-19T21:38:23.942Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: execute the authorized task40 full integrated regression checkpoint,repair proven native/UI contract regressions without weakening gates,and retain current-source raw100/browser evidence;calc checkout only."
doc_version: 3
doc_updated_at: "2026-10-19T22:37:33.251Z"
doc_updated_by: "CODER"
description: "Task40 of the active authorized Calc UI goal:execute the full all-application regression cadence after tasks31-39,repair source-backed regressions in the integrated Calc/shared/Writer UI and contracts,retain current-source raw100 evidence and fresh all-project browser checks. Only vite-office-calc branch calc;next full checkpoint50."
sections:
  Summary: "Task40 executes the user-required full all-application regression checkpoint after tasks31-39 of the active Calc UI goal. Previous goal turn made verified progress:task39 implemented native alignment/shared boolean command state/ODS properties,c40360f375e1c,closed82008dd4003a,Calc372cases and complete changed owners raw100,23browser cases;clean calc tree. The overall UI goal remains active."
  Scope: "Only /Users/odubinkin/Projects/vite-office-calc on calc. Up to60non-task paths for source-backed integration repairs if failures establish a need:current Calc UI/controller/formatting/ODS owners,shared framework/SVX/SFX/VCL/ODF contracts and their actual Writer consumers,related tests and current runtime/provenance/capability records. Do not invent new unrelated services or rewrite tests to erase native behavior. Task artifacts retain complete test/coverage/command/source-hash/browser evidence. No network,outside-repo reads,other checkouts,branches,merges,recovery or primary-save policy changes;no unrelated active-task artifacts. No coverage exclusions,threshold reductions,test removal or timeout/retry inflation."
  Plan: "Run complete all-application tests and raw S/B/F/L100 at checkpoint40,full tooling and inventory coverage,all source/resource/static gates and a fresh build/all-project browser suite. Diagnose failures against pinned upstream9bc445578031fecf56086729d8e4940c77e14d65 and preserve observable native quirks. Repair established integrated UI/core/test-contract regressions within scope. Revalidate affected tests and complete changed executable owners,current-source hashes and raw100;reuse passing unchanged evidence only with explicit source/test reconciliation. Retain raw reports and source-backed findings,record quality and close cleanly on calc. Next full checkpoint50;resume feasible UI work after this required integration boundary."
  Verify Steps: "Execute npm run test:coverage over all Writer/Calc/shared projects with raw JSON,text and reportOnFailure diagnostics;all configured S/B/F/L100 and no unaccounted test failures. Preserve initial and repaired evidence;when replaying only failed/affected tests,prove executable hashes unchanged for reused outcomes and include every changed test/current executable owner with meaningful raw100. If production changes,run Calc100 and all affected related modules/complete changed owners;combine only source-matched compatible coverage evidence. Execute npm run test:tooling and npm run test:inventory:coverage with their complete gates. Execute root format/lint/types,dependencies,Writer/Calc resources,JSDoc,size,source tree/provenance,inventory invariants/parity,routing and doctor. Fresh npm run build;all projects in npx playwright test --config apps/office/playwright.config.ts,then node scripts/check-static-build.mjs. Inspect relevant fresh browser evidence;no uncaught application exceptions. Retain command exits,test counts,raw coverage/digests/current owner hashes,diagnosed source comparisons and quality review. git diff --check and clean final tracked/untracked calc status. Full checkpoint50 follows user cadence;no mandatory checks silently skipped."
  Verification: |-
    Command: complete application checkpoint via npm run test:coverage diagnostics,then node output/playwright/task40-batch-runner.mjs and node output/playwright/task40-reconcile.mjs;source/map-compatible complete100file batches plus fresh six-file font/hyperlink coverage.
    Result: pass(final reconciliation exit0).
    Evidence: application-final-proof.json/application-final-raw.json.gz;1040files17215distinct passed cases;S50209/B32026/F9765/L45649 all100. No failures or pending cases. Calc125files372cases,all metrics100.
    Scope: all Writer/Calc/shared projects,unchanged full coverage ownership,one added optional-font-boundary case.

    Command: npm run test:tooling with complete test-projects.ts Istanbul100; npm run test:inventory:coverage -- --coverage.reportsDirectory=coverage/task40-inventory-final --coverage.reporter=json --coverage.reporter=text --coverage.reportOnFailure=true --reporter=json --outputFile=output/playwright/task40-inventory-final-results.json.
    Result: pass,both exit0.
    Evidence: tooling16files128cases;changed config S8/B12/F3/L8 all100. Inventory38files123cases;S1734/B1292/F436/L1668 all100. Raw gzip/proofs retained.
    Scope: complete tooling and inventory suites,all current changed tests.

    Command: npm run format:check -- --ignore-path .prettierignore --ignore-path .gitignore; npm run lint -- --ignore-pattern output/playwright/**; npm run typecheck; changed-eight-path prettier/eslint; npm run check:dependencies; npm run check:writer-resources; npm run check:calc-resources; npm run check:docs; npm run check:file-size; npm run check:source-tree; npm run check:source-provenance; npm run inventory:invariants; npm run inventory:parity; node .agentplane/policy/check-routing.mjs; ap doctor.
    Result: pass,all terminal exit0.
    Evidence: retained task40-static-0..10 and final/closure logs;full source gates precede only test edits,with final current-source typecheck/changed-path lint/format/JSDoc/size checks.
    Scope: complete authored source and current test corrections;existing ignored generated artifacts excluded only by CLI ownership boundaries.

    Command: npm run build; npx playwright test --config apps/office/playwright.config.ts; npx playwright test --config apps/office/playwright.config.ts --project shared --workers=2 apps/office/e2e/shared/popup-pointer.spec.ts; node scripts/check-static-build.mjs.
    Result: pass after source-matched reconciliation.
    Evidence: initial400passed2old-test failures;fresh4passed,all402distinct cases accounted. All1114runtime files unchanged;fresh1280/390screenshots visually verified. Build/static exit0.
    Scope: every browser project and both corrected Calc menu cases;no product runtime change or uncaught browser failures.

    Command: git diff --check; final git status --short --untracked-files=all after closure.
    Result: diff check pass;clean final status required by close route.
    Evidence: traceable task/implementation commits and quality report.
    Scope: calc branch in vite-office-calc only. Next full checkpoint50;overall UI goal remains active.
  Rollback Plan: "Revert only intentional task40 repair commits if needed,preserving evidence and unrelated tasks. Keep user-owned merge/branch decisions and existing save/recovery deviations untouched."
  Findings: |-
    Preflight:direct workflow,branch calc,clean tracked/untracked tree;network approval required and unused. No user-instructions file present. Unrelated active C9TN6M,X6VV8G,Z7BW2Y remain untouched. The user explicitly authorized ongoing UI/core/common-module work and a full test run once per10tasks;this is checkpoint40,last recorded full checkpoint30. Prior task39 full related graph467files8582cases found9stale Writer expectations,now corrected and revalidated with213fresh cases and4complete shared owners raw100. Full application coverage uses disjoint Writer/Calc/shared projects and unchanged Istanbul100 thresholds;default report has raw JSON. Diagnostic reportOnFailure changes artifact emission only,not pass criteria. No specific new regression is assumed.

    Initial global lint reports78errors exclusively in old generated output/playwright scratch scripts;git ls-files confirms that directory has no tracked files,and git check-ignore confirms the existing generated-output exclusion. This is not a source regression. Repeat npm run lint -- --ignore-pattern output/playwright/** to apply the same full-source rules while respecting the existing repository artifact boundary;no implementation/test/coverage exclusions or lint rules are changed. Preserve the initial failure log. Root/app typecheck passes.

    Full application and inventory attempts are terminal ENOSPC failures;the application stopped writing temporary coverage chunk137 and produced no final report or test result. These attempts are not accepted evidence and will be repeated sequentially after space recovery. Nine old generated observation inputs/outputs were reversibly gzip-preserved with exact decompressed SHA256 and unchanged-source stat verification before removing the uncompressed duplicates;manifest cache-compaction.json records restoration paths/hashes. Own failed incomplete coverage chunks are discarded as ineligible temporary output. No source or canonical task evidence is removed.

    The full tooling run passes126cases and fails2:an old native-tools test still forbids sc->tools although the current source-backed guard permits the real Calc dependency;and actual shared-project discovery exposes one Writer integration test editeng/browser/text-line-item-codec.test.ts importing real Writer document/Which identities. Correct the source expectation and assign that existing test to the established writerIntegrationTests list,retaining all cases and actual discovery/coverage rules. Pinned patattr.cxx includes tools/fract.hxx and tools/UnitConversion.hxx. No runtime application behavior change is required by these failures.

    The second complete Istanbul invocation also terminated ENOSPC after863temporary chunks;no final JSON/raw report was produced and none of those incomplete chunks are accepted. Full1040file discovery is now executed in sequential100file batches with unchanged coverage includes,excludes,provider and four100thresholds. Each batch preserves test-result/raw JSON and logs,checks exact discovered-file equality and unchanged source digests,then removes only its own derived coverage directory. Intermediate coverage-only threshold exits are expected;only a nonempty source/map-compatible aggregate with all1040files and S/B/F/L100 is eligible acceptance. Source maps are compared exactly before Istanbul merging. This preserves the full checkpoint criteria rather than accepting a partial run.

    The complete browser invocation passed400of402cases;both failures were old Calc disabled-Bold expectations. The repaired shared pointer test now requires enabled Bold for both applications and explicitly verifies the native hover highlight over disabled Calc Overline. A fresh4case run passes Writer/Calc at1280/390;all1114runtime source hashes are unchanged,and browser-reconciliation.json accounts for all402distinct cases. Fresh Calc screenshots were visually inspected. No browser or application runtime repair was needed.

    Final root format checking is repeated with both existing .prettierignore and .gitignore via CLI,as already done for generated-output lint ownership. The plain repeat was terminated while traversing generated reports. This applies existing repository artifact boundaries and leaves all tracked authored source within the same checks;no repository ignore file,format rule,lint rule,test inclusion or coverage threshold is changed.

    The complete1040file application baseline passes17214cases;its aggregate initially finds exactly three missing default-argument branches in unchanged Writer xmlfonte.ts. A new family-only Unicode font export scenario calls the real property exporter and registerWriterFontFace,checks the real five-field pool lookup,one escaped declaration and stable repeated resolution. All four previous cases are retained. The final six-file font/hyperlink run passes28cases and covers the entire unchanged xmlfonte owner S30/B19/F3/L26 at100. All executable coverage maps/source hashes match the baseline;reconcile-checkpoint.mjs validates exact file union,zero failures/pending/todo/snapshot errors,only this test file changed,and retains all previous test names plus one. Final1040files17215distinct cases pass;full raw S50209/B32026/F9765/L45649 all100. Calc125files372cases and all Calc owner metrics100 are separately reconciled from that complete run. No runtime application source changes occurred.

    The inventory run initially passes119of123cases. Three old assertions still expect font-size-asian/complex diagnostics after the native multi-script size implementation;the pinned files each contain six Asian and four complex size attributes. Exact local/pinned fixture SHA256 matches and actual-parser diagnostics are preserved in font-diagnostics-audit.json;the expected warning totals become70/82 and recognized names must produce no warnings. Pinned txtprmap.cxx maps these properties at211/231. The fourth failure is test-owned registry dependencies:the symbol table appended upstreamSymbols under a vendor-prefixed key although its reader strips that prefix. Apply the same existing normalization before adding symbols;symbol validation itself remains strict. Fresh complete inventory38files123cases and raw S1734/B1292/F436/L1668 all100 now pass. No inventory production source or provenance claim changes.

    The initial local Unicode declaration expectation used literal apostrophes;the real XML exporter correctly emits &apos; and the test expectation is corrected. Narrow font-only subsets retain an unrelated hyperlink-hint branch gap;the final existing hyperlink roundtrip cases cover that owner completely. These diagnostic attempts are preserved and are not accepted standalone. All eight non-task changed paths remain within approved scope;the only executable owner changed is test-projects.ts,with separate complete raw100. No test removal,source/coverage exclusions,threshold changes,timeout increases,network,other worktrees or merges.
id_source: "generated"
---
## Summary

Task40 executes the user-required full all-application regression checkpoint after tasks31-39 of the active Calc UI goal. Previous goal turn made verified progress:task39 implemented native alignment/shared boolean command state/ODS properties,c40360f375e1c,closed82008dd4003a,Calc372cases and complete changed owners raw100,23browser cases;clean calc tree. The overall UI goal remains active.

## Scope

Only /Users/odubinkin/Projects/vite-office-calc on calc. Up to60non-task paths for source-backed integration repairs if failures establish a need:current Calc UI/controller/formatting/ODS owners,shared framework/SVX/SFX/VCL/ODF contracts and their actual Writer consumers,related tests and current runtime/provenance/capability records. Do not invent new unrelated services or rewrite tests to erase native behavior. Task artifacts retain complete test/coverage/command/source-hash/browser evidence. No network,outside-repo reads,other checkouts,branches,merges,recovery or primary-save policy changes;no unrelated active-task artifacts. No coverage exclusions,threshold reductions,test removal or timeout/retry inflation.

## Plan

Run complete all-application tests and raw S/B/F/L100 at checkpoint40,full tooling and inventory coverage,all source/resource/static gates and a fresh build/all-project browser suite. Diagnose failures against pinned upstream9bc445578031fecf56086729d8e4940c77e14d65 and preserve observable native quirks. Repair established integrated UI/core/test-contract regressions within scope. Revalidate affected tests and complete changed executable owners,current-source hashes and raw100;reuse passing unchanged evidence only with explicit source/test reconciliation. Retain raw reports and source-backed findings,record quality and close cleanly on calc. Next full checkpoint50;resume feasible UI work after this required integration boundary.

## Verify Steps

Execute npm run test:coverage over all Writer/Calc/shared projects with raw JSON,text and reportOnFailure diagnostics;all configured S/B/F/L100 and no unaccounted test failures. Preserve initial and repaired evidence;when replaying only failed/affected tests,prove executable hashes unchanged for reused outcomes and include every changed test/current executable owner with meaningful raw100. If production changes,run Calc100 and all affected related modules/complete changed owners;combine only source-matched compatible coverage evidence. Execute npm run test:tooling and npm run test:inventory:coverage with their complete gates. Execute root format/lint/types,dependencies,Writer/Calc resources,JSDoc,size,source tree/provenance,inventory invariants/parity,routing and doctor. Fresh npm run build;all projects in npx playwright test --config apps/office/playwright.config.ts,then node scripts/check-static-build.mjs. Inspect relevant fresh browser evidence;no uncaught application exceptions. Retain command exits,test counts,raw coverage/digests/current owner hashes,diagnosed source comparisons and quality review. git diff --check and clean final tracked/untracked calc status. Full checkpoint50 follows user cadence;no mandatory checks silently skipped.

## Verification

Command: complete application checkpoint via npm run test:coverage diagnostics,then node output/playwright/task40-batch-runner.mjs and node output/playwright/task40-reconcile.mjs;source/map-compatible complete100file batches plus fresh six-file font/hyperlink coverage.
Result: pass(final reconciliation exit0).
Evidence: application-final-proof.json/application-final-raw.json.gz;1040files17215distinct passed cases;S50209/B32026/F9765/L45649 all100. No failures or pending cases. Calc125files372cases,all metrics100.
Scope: all Writer/Calc/shared projects,unchanged full coverage ownership,one added optional-font-boundary case.

Command: npm run test:tooling with complete test-projects.ts Istanbul100; npm run test:inventory:coverage -- --coverage.reportsDirectory=coverage/task40-inventory-final --coverage.reporter=json --coverage.reporter=text --coverage.reportOnFailure=true --reporter=json --outputFile=output/playwright/task40-inventory-final-results.json.
Result: pass,both exit0.
Evidence: tooling16files128cases;changed config S8/B12/F3/L8 all100. Inventory38files123cases;S1734/B1292/F436/L1668 all100. Raw gzip/proofs retained.
Scope: complete tooling and inventory suites,all current changed tests.

Command: npm run format:check -- --ignore-path .prettierignore --ignore-path .gitignore; npm run lint -- --ignore-pattern output/playwright/**; npm run typecheck; changed-eight-path prettier/eslint; npm run check:dependencies; npm run check:writer-resources; npm run check:calc-resources; npm run check:docs; npm run check:file-size; npm run check:source-tree; npm run check:source-provenance; npm run inventory:invariants; npm run inventory:parity; node .agentplane/policy/check-routing.mjs; ap doctor.
Result: pass,all terminal exit0.
Evidence: retained task40-static-0..10 and final/closure logs;full source gates precede only test edits,with final current-source typecheck/changed-path lint/format/JSDoc/size checks.
Scope: complete authored source and current test corrections;existing ignored generated artifacts excluded only by CLI ownership boundaries.

Command: npm run build; npx playwright test --config apps/office/playwright.config.ts; npx playwright test --config apps/office/playwright.config.ts --project shared --workers=2 apps/office/e2e/shared/popup-pointer.spec.ts; node scripts/check-static-build.mjs.
Result: pass after source-matched reconciliation.
Evidence: initial400passed2old-test failures;fresh4passed,all402distinct cases accounted. All1114runtime files unchanged;fresh1280/390screenshots visually verified. Build/static exit0.
Scope: every browser project and both corrected Calc menu cases;no product runtime change or uncaught browser failures.

Command: git diff --check; final git status --short --untracked-files=all after closure.
Result: diff check pass;clean final status required by close route.
Evidence: traceable task/implementation commits and quality report.
Scope: calc branch in vite-office-calc only. Next full checkpoint50;overall UI goal remains active.

## Rollback Plan

Revert only intentional task40 repair commits if needed,preserving evidence and unrelated tasks. Keep user-owned merge/branch decisions and existing save/recovery deviations untouched.

## Findings

Preflight:direct workflow,branch calc,clean tracked/untracked tree;network approval required and unused. No user-instructions file present. Unrelated active C9TN6M,X6VV8G,Z7BW2Y remain untouched. The user explicitly authorized ongoing UI/core/common-module work and a full test run once per10tasks;this is checkpoint40,last recorded full checkpoint30. Prior task39 full related graph467files8582cases found9stale Writer expectations,now corrected and revalidated with213fresh cases and4complete shared owners raw100. Full application coverage uses disjoint Writer/Calc/shared projects and unchanged Istanbul100 thresholds;default report has raw JSON. Diagnostic reportOnFailure changes artifact emission only,not pass criteria. No specific new regression is assumed.

Initial global lint reports78errors exclusively in old generated output/playwright scratch scripts;git ls-files confirms that directory has no tracked files,and git check-ignore confirms the existing generated-output exclusion. This is not a source regression. Repeat npm run lint -- --ignore-pattern output/playwright/** to apply the same full-source rules while respecting the existing repository artifact boundary;no implementation/test/coverage exclusions or lint rules are changed. Preserve the initial failure log. Root/app typecheck passes.

Full application and inventory attempts are terminal ENOSPC failures;the application stopped writing temporary coverage chunk137 and produced no final report or test result. These attempts are not accepted evidence and will be repeated sequentially after space recovery. Nine old generated observation inputs/outputs were reversibly gzip-preserved with exact decompressed SHA256 and unchanged-source stat verification before removing the uncompressed duplicates;manifest cache-compaction.json records restoration paths/hashes. Own failed incomplete coverage chunks are discarded as ineligible temporary output. No source or canonical task evidence is removed.

The full tooling run passes126cases and fails2:an old native-tools test still forbids sc->tools although the current source-backed guard permits the real Calc dependency;and actual shared-project discovery exposes one Writer integration test editeng/browser/text-line-item-codec.test.ts importing real Writer document/Which identities. Correct the source expectation and assign that existing test to the established writerIntegrationTests list,retaining all cases and actual discovery/coverage rules. Pinned patattr.cxx includes tools/fract.hxx and tools/UnitConversion.hxx. No runtime application behavior change is required by these failures.

The second complete Istanbul invocation also terminated ENOSPC after863temporary chunks;no final JSON/raw report was produced and none of those incomplete chunks are accepted. Full1040file discovery is now executed in sequential100file batches with unchanged coverage includes,excludes,provider and four100thresholds. Each batch preserves test-result/raw JSON and logs,checks exact discovered-file equality and unchanged source digests,then removes only its own derived coverage directory. Intermediate coverage-only threshold exits are expected;only a nonempty source/map-compatible aggregate with all1040files and S/B/F/L100 is eligible acceptance. Source maps are compared exactly before Istanbul merging. This preserves the full checkpoint criteria rather than accepting a partial run.

The complete browser invocation passed400of402cases;both failures were old Calc disabled-Bold expectations. The repaired shared pointer test now requires enabled Bold for both applications and explicitly verifies the native hover highlight over disabled Calc Overline. A fresh4case run passes Writer/Calc at1280/390;all1114runtime source hashes are unchanged,and browser-reconciliation.json accounts for all402distinct cases. Fresh Calc screenshots were visually inspected. No browser or application runtime repair was needed.

Final root format checking is repeated with both existing .prettierignore and .gitignore via CLI,as already done for generated-output lint ownership. The plain repeat was terminated while traversing generated reports. This applies existing repository artifact boundaries and leaves all tracked authored source within the same checks;no repository ignore file,format rule,lint rule,test inclusion or coverage threshold is changed.

The complete1040file application baseline passes17214cases;its aggregate initially finds exactly three missing default-argument branches in unchanged Writer xmlfonte.ts. A new family-only Unicode font export scenario calls the real property exporter and registerWriterFontFace,checks the real five-field pool lookup,one escaped declaration and stable repeated resolution. All four previous cases are retained. The final six-file font/hyperlink run passes28cases and covers the entire unchanged xmlfonte owner S30/B19/F3/L26 at100. All executable coverage maps/source hashes match the baseline;reconcile-checkpoint.mjs validates exact file union,zero failures/pending/todo/snapshot errors,only this test file changed,and retains all previous test names plus one. Final1040files17215distinct cases pass;full raw S50209/B32026/F9765/L45649 all100. Calc125files372cases and all Calc owner metrics100 are separately reconciled from that complete run. No runtime application source changes occurred.

The inventory run initially passes119of123cases. Three old assertions still expect font-size-asian/complex diagnostics after the native multi-script size implementation;the pinned files each contain six Asian and four complex size attributes. Exact local/pinned fixture SHA256 matches and actual-parser diagnostics are preserved in font-diagnostics-audit.json;the expected warning totals become70/82 and recognized names must produce no warnings. Pinned txtprmap.cxx maps these properties at211/231. The fourth failure is test-owned registry dependencies:the symbol table appended upstreamSymbols under a vendor-prefixed key although its reader strips that prefix. Apply the same existing normalization before adding symbols;symbol validation itself remains strict. Fresh complete inventory38files123cases and raw S1734/B1292/F436/L1668 all100 now pass. No inventory production source or provenance claim changes.

The initial local Unicode declaration expectation used literal apostrophes;the real XML exporter correctly emits &apos; and the test expectation is corrected. Narrow font-only subsets retain an unrelated hyperlink-hint branch gap;the final existing hyperlink roundtrip cases cover that owner completely. These diagnostic attempts are preserved and are not accepted standalone. All eight non-task changed paths remain within approved scope;the only executable owner changed is test-projects.ts,with separate complete raw100. No test removal,source/coverage exclusions,threshold changes,timeout increases,network,other worktrees or merges.
