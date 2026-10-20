---
id: "202610202254-D9RYSD"
title: "Complete native Calc document pool and header-footer ownership"
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
  updated_at: "2026-10-20T22:55:41.818Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-10-20T23:19:00.226Z"
  updated_by: "CODER"
  note: "528 Calc and58 related tests pass;Calc130 and changed4 owners100%;7 Calc/Worker and6 Writer browser regressions,static gates and portable source/native/raw coverage audit pass. Actual services left explicitly unported."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-10-20T23:19:46.810Z"
  updated_by: "EVALUATOR"
  note: "Native default package and nullable rich-text ownership satisfy bounded scope;reviewed implementation08bc40fd2bc0."
  evaluated_sha: "08bc40fd2bc0cb386fa0163b38d5c47235897bdd"
  blueprint_digest: "679069c53f09abd05366b35ee25a9c319046e642ecb5648878ff4f6be13f72f1"
  evidence_refs:
    - ".agentplane/tasks/202610202254-D9RYSD/README.md"
    - ".agentplane/tasks/202610202254-D9RYSD/quality/20261020-231946810-recovery-context/quality-report.json"
    - ".agentplane/tasks/202610202254-D9RYSD/quality/20261020-231946810-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202610202254-D9RYSD/quality/20261020-231946810-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202610202254-D9RYSD/blueprint/resolved-snapshot.json"
    - ".agentplane/tasks/202610202254-D9RYSD/evidence/acceptance.json"
    - ".agentplane/tasks/202610202254-D9RYSD/evidence/audit.mjs"
    - ".agentplane/tasks/202610202254-D9RYSD/evidence/raw-results.json.gz"
  findings:
    - "Verified89entries100..188,static/dynamic split,slots10057/10058,five source range pairs,base Clone and real text null/copy/alias semantics. Raw528Calc/58related tests and130+4owners100percent are reproducible by audit. Chromium/Worker and Writer regressions pass;shared emitted JS identical."
commit: null
comments:
  -
    author: "CODER"
    body: "Start: complete actual Calc document pool100..188 and native nullable header/footer ownership using task57 real text objects and existing shared set/scale values;preserve explicit unported service boundaries."
events:
  -
    type: "status"
    at: "2026-10-20T22:56:52.429Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: complete actual Calc document pool100..188 and native nullable header/footer ownership using task57 real text objects and existing shared set/scale values;preserve explicit unported service boundaries."
  -
    type: "verify"
    at: "2026-10-20T23:19:00.226Z"
    author: "CODER"
    state: "ok"
    note: "528 Calc and58 related tests pass;Calc130 and changed4 owners100%;7 Calc/Worker and6 Writer browser regressions,static gates and portable source/native/raw coverage audit pass. Actual services left explicitly unported."
doc_version: 3
doc_updated_at: "2026-10-20T23:19:45.792Z"
doc_updated_by: "CODER"
description: "Block58: complete original ScDocumentPool package100..188 using actual ScPageHFItem value ownership,ScGlobal EETextObjEqual and existing shared EditTextObject/SvxSetItem/ScPageScaleToItem. Preserve static versus per-pool dynamic defaults,ranges,slots,copy/base Clone and native null/text equality. No fake style pool,UNO header/footer content,renderer or lifetime service. Reuse actual shared values and document unported APIs. Work only calc checkout/branch;user performs integration."
sections:
  Summary: |-
    Complete native Calc document pool and header-footer ownership

    Block58: complete original ScDocumentPool package100..188 using actual ScPageHFItem value ownership,ScGlobal EETextObjEqual and existing shared EditTextObject/SvxSetItem/ScPageScaleToItem. Preserve static versus per-pool dynamic defaults,ranges,slots,copy/base Clone and native null/text equality. No fake style pool,UNO header/footer content,renderer or lifetime service. Reuse actual shared values and document unported APIs. Work only calc checkout/branch;user performs integration.
  Scope: "Complete original Calc ItemInfoPackage/ScDocumentPool100..188 and consumed ScPageHFItem/ScGlobal text-value equality over real shared EditTextObject,SfxItemSet and SvxSetItem. Reuse existing ScPageScaleToItem. Up to25source/test files plus registry/provenance/readiness/evidence. Preserve source null/default/clone/range/slot/metric semantics. Actual header/footer UNO content,EditEngine editing/layout,ScStyleSheet/ScStyleSheetPool/ScPoolHelper and style UI remain unported rather than faked. Only calc checkout/branch;no network,global files,branch changes or merges."
  Plan: "Block58 completes the original Calc pool as one coherent dependency for genuine styles:port ScPageHFItem default/copy/owned nullable text areas,Clone,equality and native setters/getters using actual EditTextObject;add original ScGlobal EETextObjEqual and explicit const binding. Complete missing Which declarations and all89native package entries,including dynamic header/footer SvxSetItem sets with exact original ranges;retain existing static items,flags,default metrics and base-pool Clone semantics. Reuse existing ScPageScaleToItem and fix native temporary string ownership at the pool constructor. Do not invent or stub header/footer UNO services,style pools,renderer or lifetime management;omitted APIs remain explicit. Update existing prefix-boundary tests/browser fixture and add real owner/default/copy tests. Up to25source/test files plus metadata/evidence. Validate Calc100 and affected-owner/shared tests100,all required static/build/browser/Worker gates,raw source/native proof and evaluator. Full all-app next60. Task may span turns;do not close a partial implementation."
  Verify Steps: "Compare pinned attrib.cxx/hxx,global.cxx,docpool.cxx and scitems.hxx. Verify all89entries100..188 with literal native slots/flags,87shared static defaults,two independent pool-local header/footer sets,exact Which ranges and foreign/base Clone behavior. Real rich-text null/copy/alias-setter/field/style and pool-insensitive equality tests. Run all Calc tests/coverage100,related shared value/pool/itemset tests and100coverage for every changed runtime owner;type-only shared changes must retain identical emitted runtime where applicable. Do not replay all1098application test files for ordinary shared verification;full all-app checkpoint remains60. Changed-source lint/format,types,dependencies,resources,docs,tree,size,provenance,registry,routing,doctor,production/static build. Actual Chromium/DOM-freeWorker pool/header-footer acceptance plus current Calc font/wrap/ODS and Writer regressions;inspect screenshots. Preserve raw failures/results/current source and native pins with portable audit,separate EVALUATOR pass and clean calc close. Use a descriptive actual result in canonical finish;guided generic verified-ID result is rejected by close-commit policy."
  Verification: |-
    Command: npm run test:coverage:calc -- --maxWorkers=1 --reporter=default --reporter=json --outputFile=../../output/playwright/task58-calc-results.json
    Result: pass. Scope: every Calc runtime owner and Calc test. Evidence: 528/528 tests;130 owners;S10688/B6621/F1997/L9599,all100%. No thresholds,scope filters or counters weakened.

    Command: node ../../node_modules/vitest/vitest.mjs run src/sc/source/core/data/{native-page-hf,native-document-pool-complete,docpool,docpool-style-defaults,pageattr,text-size-context}.test.ts src/svl/source/items/{native-pool-copy,native-user-defaults,itemset,sitem}.test.ts --coverage --coverage.include='src/sc/source/core/data/{attrib.page,docpool,global}.ts' --coverage.include=src/sc/inc/scitems.ts --coverage.reportsDirectory=../../output/playwright/task58-owner-coverage --coverage.reportOnFailure --reporter=default --reporter=json --outputFile=../../output/playwright/task58-owner-results.json
    Result: pass. Scope: related shared pool/itemset consumers and every changed emitted runtime owner. Evidence:58tests,4owners,S151/B25/F22/L149,all100%. The earlier9file53test repaired run also passes.

    Command: npm run typecheck; npm run test:static; changed11source/test paths through eslint --max-warnings0 and prettier --check; npm run check:dependencies; npm run check:docs; npm run check:file-size; npm run check:source-tree; npm run check:source-provenance; npm run inventory:registry:check; npm run check:writer-resources; npm run check:calc-resources; node .agentplane/policy/check-routing.mjs; ap doctor.
    Result: pass. Scope: application/tools types,production/static assets,module boundaries,native provenance,registry,resources,documentation and policy routing. Doctor errors0;existing managed-hook shim readiness warning retained,no hook changes. Existing build bundle-size advisory retained. Final metadata registry/provenance checks also pass.

    Command: node node_modules/@playwright/test/cli.js test apps/office/e2e/calc/{style-naming-defaults,font-family,wrap-text,ods}.spec.ts --config apps/office/playwright.config.ts --project=calc --output=output/playwright/task58-calc-browser
    Result: pass. Evidence:7tests,actual Chromium/DOM-free Worker source classes,nullable defaults,real text clone/pool ownership,dynamic set slots/ranges and base-pool copy;existing fonts/history/wrap/primary ODS accepted at1280/390px.

    Command: node node_modules/@playwright/test/cli.js test apps/office/e2e/{native-bullet-font-roundtrip,native-numbering-font,writer-style-selector}.spec.ts --config apps/office/playwright.config.ts --project=writer --output=output/playwright/task58-writer-browser
    Result: pass. Evidence:6Writer browser regressions. Inspected four Calc screenshots(font and ODS wrap at1280/390px) and desktop Writer style screenshot. Shared header type alias emits identical JS to a25904fdcf81;no shared runtime changed.

    Command: node .agentplane/tasks/202610202254-D9RYSD/evidence/audit.mjs
    Result: pass. Evidence:57 raw reports/logs/screens archived with hashes,152source pins,8native blobs at9bc445578031fecf56086729d8e4940c77e14d65;every actual coverage counter positive,original3failing assertions retained,actual test counts and shared emitted JS independently rechecked. Complete all-app checkpoint remains60 per approved scope.

    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-10-20T23:19:00.226Z — VERIFY — ok

    By: CODER

    Note: 528 Calc and58 related tests pass;Calc130 and changed4 owners100%;7 Calc/Worker and6 Writer browser regressions,static gates and portable source/native/raw coverage audit pass. Actual services left explicitly unported.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-20T23:18:59.454Z, excerpt_hash=sha256:1940f4da6cb9b86fd5f1f742da63f5a7a48e1d4f1d2e149b739461fcea4b811e

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202610202254-D9RYSD/blueprint/resolved-snapshot.json
    - old_digest: 679069c53f09abd05366b35ee25a9c319046e642ecb5648878ff4f6be13f72f1
    - current_digest: 679069c53f09abd05366b35ee25a9c319046e642ecb5648878ff4f6be13f72f1
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202610202254-D9RYSD

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane commit 202610202254-D9RYSD -m 🧩 D9RYSD task: persist canonical task artifacts --allow-tasks
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: true
    - repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert only this task's intentional implementation commits after inspecting its source/evidence paths. Preserve task57 actual shared owners and all previous Calc behavior. The user performs integration."
  Findings: |-
    Original ScDocumentPool now has all89entries100..188,87static defaults and two pool-local SvxSetItem owners. Source Which/slots/flags,ranges,base Clone and1,1pool scale versus0,0standalone default remain intact. ScPageHFItem retains real nullable EditTextObject owners,independent copying and alias-safe replacement;ScGlobal calls original base pool-insensitive Equals. No actual editing-engine,UNO-content,style-pool or renderer service is replaced.

    Initial focused run had3test assertion failures:two old tests still treated177as out of range;one expected adjacent ranges160/161merged. Actual upstream preserves5pairs. Fixed only stale/wrong test expectations;repaired53tests and final58tests pass. Two preparation scripts stopped before writing because existing Which declarations or wrong cwd invalidated assumptions;corrected from Calc root. All raw first/repaired outcomes retained. A later formatting invocation lacked the local Node PATH;rerun successfully with explicit PATH. No production change was made to mask a test failure.

    CALC246 records nullable header/footer defaults versus unconditional XML diagnostic dereferences. Diagnostics and genuine UNO QueryValue/PutValue remain unported;native null state was preserved. Shared style bases already exist;Calc style/helper/standard-style creation and actual EditEngine editing/layout remain subsequent real owners. User-visible style UI is not claimed complete. No network,global files,branch switches or merges. Full all-app checkpoint remains60.

    Closeout tooling: initial implementation commit subject was rejected because it lacked the repository emoji/task-suffix/scope format. No commit was created. The prematurely attempted evaluator recording also rejected the still-staged implementation. Route was recomputed;implementation then committed as08bc40fd2bc0 with the required format. Evaluator is rerun against that clean source commit;no policy was weakened.
id_source: "generated"
---
## Summary

Complete native Calc document pool and header-footer ownership

Block58: complete original ScDocumentPool package100..188 using actual ScPageHFItem value ownership,ScGlobal EETextObjEqual and existing shared EditTextObject/SvxSetItem/ScPageScaleToItem. Preserve static versus per-pool dynamic defaults,ranges,slots,copy/base Clone and native null/text equality. No fake style pool,UNO header/footer content,renderer or lifetime service. Reuse actual shared values and document unported APIs. Work only calc checkout/branch;user performs integration.

## Scope

Complete original Calc ItemInfoPackage/ScDocumentPool100..188 and consumed ScPageHFItem/ScGlobal text-value equality over real shared EditTextObject,SfxItemSet and SvxSetItem. Reuse existing ScPageScaleToItem. Up to25source/test files plus registry/provenance/readiness/evidence. Preserve source null/default/clone/range/slot/metric semantics. Actual header/footer UNO content,EditEngine editing/layout,ScStyleSheet/ScStyleSheetPool/ScPoolHelper and style UI remain unported rather than faked. Only calc checkout/branch;no network,global files,branch changes or merges.

## Plan

Block58 completes the original Calc pool as one coherent dependency for genuine styles:port ScPageHFItem default/copy/owned nullable text areas,Clone,equality and native setters/getters using actual EditTextObject;add original ScGlobal EETextObjEqual and explicit const binding. Complete missing Which declarations and all89native package entries,including dynamic header/footer SvxSetItem sets with exact original ranges;retain existing static items,flags,default metrics and base-pool Clone semantics. Reuse existing ScPageScaleToItem and fix native temporary string ownership at the pool constructor. Do not invent or stub header/footer UNO services,style pools,renderer or lifetime management;omitted APIs remain explicit. Update existing prefix-boundary tests/browser fixture and add real owner/default/copy tests. Up to25source/test files plus metadata/evidence. Validate Calc100 and affected-owner/shared tests100,all required static/build/browser/Worker gates,raw source/native proof and evaluator. Full all-app next60. Task may span turns;do not close a partial implementation.

## Verify Steps

Compare pinned attrib.cxx/hxx,global.cxx,docpool.cxx and scitems.hxx. Verify all89entries100..188 with literal native slots/flags,87shared static defaults,two independent pool-local header/footer sets,exact Which ranges and foreign/base Clone behavior. Real rich-text null/copy/alias-setter/field/style and pool-insensitive equality tests. Run all Calc tests/coverage100,related shared value/pool/itemset tests and100coverage for every changed runtime owner;type-only shared changes must retain identical emitted runtime where applicable. Do not replay all1098application test files for ordinary shared verification;full all-app checkpoint remains60. Changed-source lint/format,types,dependencies,resources,docs,tree,size,provenance,registry,routing,doctor,production/static build. Actual Chromium/DOM-freeWorker pool/header-footer acceptance plus current Calc font/wrap/ODS and Writer regressions;inspect screenshots. Preserve raw failures/results/current source and native pins with portable audit,separate EVALUATOR pass and clean calc close. Use a descriptive actual result in canonical finish;guided generic verified-ID result is rejected by close-commit policy.

## Verification

Command: npm run test:coverage:calc -- --maxWorkers=1 --reporter=default --reporter=json --outputFile=../../output/playwright/task58-calc-results.json
Result: pass. Scope: every Calc runtime owner and Calc test. Evidence: 528/528 tests;130 owners;S10688/B6621/F1997/L9599,all100%. No thresholds,scope filters or counters weakened.

Command: node ../../node_modules/vitest/vitest.mjs run src/sc/source/core/data/{native-page-hf,native-document-pool-complete,docpool,docpool-style-defaults,pageattr,text-size-context}.test.ts src/svl/source/items/{native-pool-copy,native-user-defaults,itemset,sitem}.test.ts --coverage --coverage.include='src/sc/source/core/data/{attrib.page,docpool,global}.ts' --coverage.include=src/sc/inc/scitems.ts --coverage.reportsDirectory=../../output/playwright/task58-owner-coverage --coverage.reportOnFailure --reporter=default --reporter=json --outputFile=../../output/playwright/task58-owner-results.json
Result: pass. Scope: related shared pool/itemset consumers and every changed emitted runtime owner. Evidence:58tests,4owners,S151/B25/F22/L149,all100%. The earlier9file53test repaired run also passes.

Command: npm run typecheck; npm run test:static; changed11source/test paths through eslint --max-warnings0 and prettier --check; npm run check:dependencies; npm run check:docs; npm run check:file-size; npm run check:source-tree; npm run check:source-provenance; npm run inventory:registry:check; npm run check:writer-resources; npm run check:calc-resources; node .agentplane/policy/check-routing.mjs; ap doctor.
Result: pass. Scope: application/tools types,production/static assets,module boundaries,native provenance,registry,resources,documentation and policy routing. Doctor errors0;existing managed-hook shim readiness warning retained,no hook changes. Existing build bundle-size advisory retained. Final metadata registry/provenance checks also pass.

Command: node node_modules/@playwright/test/cli.js test apps/office/e2e/calc/{style-naming-defaults,font-family,wrap-text,ods}.spec.ts --config apps/office/playwright.config.ts --project=calc --output=output/playwright/task58-calc-browser
Result: pass. Evidence:7tests,actual Chromium/DOM-free Worker source classes,nullable defaults,real text clone/pool ownership,dynamic set slots/ranges and base-pool copy;existing fonts/history/wrap/primary ODS accepted at1280/390px.

Command: node node_modules/@playwright/test/cli.js test apps/office/e2e/{native-bullet-font-roundtrip,native-numbering-font,writer-style-selector}.spec.ts --config apps/office/playwright.config.ts --project=writer --output=output/playwright/task58-writer-browser
Result: pass. Evidence:6Writer browser regressions. Inspected four Calc screenshots(font and ODS wrap at1280/390px) and desktop Writer style screenshot. Shared header type alias emits identical JS to a25904fdcf81;no shared runtime changed.

Command: node .agentplane/tasks/202610202254-D9RYSD/evidence/audit.mjs
Result: pass. Evidence:57 raw reports/logs/screens archived with hashes,152source pins,8native blobs at9bc445578031fecf56086729d8e4940c77e14d65;every actual coverage counter positive,original3failing assertions retained,actual test counts and shared emitted JS independently rechecked. Complete all-app checkpoint remains60 per approved scope.

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-10-20T23:19:00.226Z — VERIFY — ok

By: CODER

Note: 528 Calc and58 related tests pass;Calc130 and changed4 owners100%;7 Calc/Worker and6 Writer browser regressions,static gates and portable source/native/raw coverage audit pass. Actual services left explicitly unported.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-20T23:18:59.454Z, excerpt_hash=sha256:1940f4da6cb9b86fd5f1f742da63f5a7a48e1d4f1d2e149b739461fcea4b811e

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202610202254-D9RYSD/blueprint/resolved-snapshot.json
- old_digest: 679069c53f09abd05366b35ee25a9c319046e642ecb5648878ff4f6be13f72f1
- current_digest: 679069c53f09abd05366b35ee25a9c319046e642ecb5648878ff4f6be13f72f1
- route_changed: no
- safe_command: agentplane blueprint snapshot 202610202254-D9RYSD

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane commit 202610202254-D9RYSD -m 🧩 D9RYSD task: persist canonical task artifacts --allow-tasks
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: true
- repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert only this task's intentional implementation commits after inspecting its source/evidence paths. Preserve task57 actual shared owners and all previous Calc behavior. The user performs integration.

## Findings

Original ScDocumentPool now has all89entries100..188,87static defaults and two pool-local SvxSetItem owners. Source Which/slots/flags,ranges,base Clone and1,1pool scale versus0,0standalone default remain intact. ScPageHFItem retains real nullable EditTextObject owners,independent copying and alias-safe replacement;ScGlobal calls original base pool-insensitive Equals. No actual editing-engine,UNO-content,style-pool or renderer service is replaced.

Initial focused run had3test assertion failures:two old tests still treated177as out of range;one expected adjacent ranges160/161merged. Actual upstream preserves5pairs. Fixed only stale/wrong test expectations;repaired53tests and final58tests pass. Two preparation scripts stopped before writing because existing Which declarations or wrong cwd invalidated assumptions;corrected from Calc root. All raw first/repaired outcomes retained. A later formatting invocation lacked the local Node PATH;rerun successfully with explicit PATH. No production change was made to mask a test failure.

CALC246 records nullable header/footer defaults versus unconditional XML diagnostic dereferences. Diagnostics and genuine UNO QueryValue/PutValue remain unported;native null state was preserved. Shared style bases already exist;Calc style/helper/standard-style creation and actual EditEngine editing/layout remain subsequent real owners. User-visible style UI is not claimed complete. No network,global files,branch switches or merges. Full all-app checkpoint remains60.

Closeout tooling: initial implementation commit subject was rejected because it lacked the repository emoji/task-suffix/scope format. No commit was created. The prematurely attempted evaluator recording also rejected the still-staged implementation. Route was recomputed;implementation then committed as08bc40fd2bc0 with the required format. Evaluator is rerun against that clean source commit;no policy was weakened.
