---
id: "202610191035-NYABVG"
title: "Run task30 full regression and resolve Calc/shared regressions"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 6
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-19T10:35:22.620Z"
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
    body: "Start:run the approved task30 complete regression checkpoint,retain raw evidence and resolve only actual Calc/shared regressions or source-backed dependent test inputs."
events:
  -
    type: "status"
    at: "2026-10-19T10:35:30.263Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start:run the approved task30 complete regression checkpoint,retain raw evidence and resolve only actual Calc/shared regressions or source-backed dependent test inputs."
doc_version: 3
doc_updated_at: "2026-10-19T10:35:30.263Z"
doc_updated_by: "CODER"
description: "Task30 of the approved Calc UI/core goal:perform the once-per-ten-task complete regression after task20. Run complete office raw100coverage,complete inventory and tooling tests,all Chromium projects,types/build/static/style/docs/dependencies/provenance/source-tree/resource/inventory/doctor/routing checks. Resolve actual in-scope Calc/shared regressions and source-backed dependent test input migrations without weakening tests,coverage thresholds,timeouts or validators. Preserve original LibreOffice logic/defaults and append newly suspected source defects to canonical ledger without fixing source behavior. Up to35non-task source/test/registry paths if required by actual failures;no new feature expansion. Only vite-office-calc branchcalc,offline,no merge. Next full cadence40 after this checkpoint;overall goal remains active."
sections:
  Summary: |-
    Run task30 full regression and resolve Calc/shared regressions

    Task30 of the approved Calc UI/core goal:perform the once-per-ten-task complete regression after task20. Run complete office raw100coverage,complete inventory and tooling tests,all Chromium projects,types/build/static/style/docs/dependencies/provenance/source-tree/resource/inventory/doctor/routing checks. Resolve actual in-scope Calc/shared regressions and source-backed dependent test input migrations without weakening tests,coverage thresholds,timeouts or validators. Preserve original LibreOffice logic/defaults and append newly suspected source defects to canonical ledger without fixing source behavior. Up to35non-task source/test/registry paths if required by actual failures;no new feature expansion. Only vite-office-calc branchcalc,offline,no merge. Next full cadence40 after this checkpoint;overall goal remains active.
  Scope: |-
    - In scope: Task30 of the approved Calc UI/core goal:perform the once-per-ten-task complete regression after task20. Run complete office raw100coverage,complete inventory and tooling tests,all Chromium projects,types/build/static/style/docs/dependencies/provenance/source-tree/resource/inventory/doctor/routing checks. Resolve actual in-scope Calc/shared regressions and source-backed dependent test input migrations without weakening tests,coverage thresholds,timeouts or validators. Preserve original LibreOffice logic/defaults and append newly suspected source defects to canonical ledger without fixing source behavior. Up to35non-task source/test/registry paths if required by actual failures;no new feature expansion. Only vite-office-calc branchcalc,offline,no merge. Next full cadence40 after this checkpoint;overall goal remains active.
    - Out of scope: unrelated refactors not required for "Run task30 full regression and resolve Calc/shared regressions".
  Plan: "Run the required task30 full all-app regression checkpoint on the current clean Calc branch after approved tasks21-29. Execute npm run test:coverage over all office tests with raw100S/B/F/L;complete inventory coverage and tooling suites;build before all-project Chromium tests and do not rebuild dist during browser use. Inspect failures against original source and current shared Writer/Calc contracts. Correct actual scoped regressions or dependent test input migrations using the same application/resource/command owners;preserve original kernel behavior and document any newly suspected source issue in canonical ledger. Up to35non-task source/test/registry files only when actual failures justify them;no guard,timeout,coverage,skip or threshold weakening,no unrelated feature work. Run wholeCalc100 separately,all deterministic type/build/static/format/lint/docs/size/tree/dependency/provenance/resource/inventory/doctor/routing checks. Retain full count/status/rawcounter and exact-run evidence,including failed diagnostics and specific replays;do not claim one clean invocation where results are accounted across runs. Complete quality/lifecycle commits on calc;next full40,broader goal active. Existing explicit user approval covers safe local execution;offline,no other checkout,branch changes,merge or publication."
  Verify Steps: "Run complete npm run test:coverage with whole-office raw100 S/B/F/L; npm run test:inventory:coverage; npm run test:tooling; whole npm run test:coverage:calc raw100. Build then run all projects via npx playwright test --config apps/office/playwright.config.ts,keeping dist immutable during browser execution. Account for every selected case with retained terminal status,actual failures and bounded justified reruns;no test/time/coverage/skip/validator weakening. npm run format:check,lint,typecheck,build;node scripts/check-static-build.mjs;npm run check:docs,check:file-size,check:source-tree,check:dependencies,check:source-provenance,check:writer-resources,check:calc-resources;shared/writer/calc scoped inventories;ap doctor;routing check. If repairs change source,run affected tests/complete changed-owner raw100 and relevant build/browser checks;retain source fidelity and ledger for actual new upstream suspicions. Reviewed exact intentional paths,recorded verification/evaluator report,commits and final clean calc state. This is full checkpoint30,next40."
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert only this task justified regression repairs and their registry/test changes;preserve tasks21-29 behavior and evidence,upstream ledger and user changes. Verification artifacts may remain as history. No reset,branch switch,other checkout,network or merge."
  Findings: ""
id_source: "generated"
---
## Summary

Run task30 full regression and resolve Calc/shared regressions

Task30 of the approved Calc UI/core goal:perform the once-per-ten-task complete regression after task20. Run complete office raw100coverage,complete inventory and tooling tests,all Chromium projects,types/build/static/style/docs/dependencies/provenance/source-tree/resource/inventory/doctor/routing checks. Resolve actual in-scope Calc/shared regressions and source-backed dependent test input migrations without weakening tests,coverage thresholds,timeouts or validators. Preserve original LibreOffice logic/defaults and append newly suspected source defects to canonical ledger without fixing source behavior. Up to35non-task source/test/registry paths if required by actual failures;no new feature expansion. Only vite-office-calc branchcalc,offline,no merge. Next full cadence40 after this checkpoint;overall goal remains active.

## Scope

- In scope: Task30 of the approved Calc UI/core goal:perform the once-per-ten-task complete regression after task20. Run complete office raw100coverage,complete inventory and tooling tests,all Chromium projects,types/build/static/style/docs/dependencies/provenance/source-tree/resource/inventory/doctor/routing checks. Resolve actual in-scope Calc/shared regressions and source-backed dependent test input migrations without weakening tests,coverage thresholds,timeouts or validators. Preserve original LibreOffice logic/defaults and append newly suspected source defects to canonical ledger without fixing source behavior. Up to35non-task source/test/registry paths if required by actual failures;no new feature expansion. Only vite-office-calc branchcalc,offline,no merge. Next full cadence40 after this checkpoint;overall goal remains active.
- Out of scope: unrelated refactors not required for "Run task30 full regression and resolve Calc/shared regressions".

## Plan

Run the required task30 full all-app regression checkpoint on the current clean Calc branch after approved tasks21-29. Execute npm run test:coverage over all office tests with raw100S/B/F/L;complete inventory coverage and tooling suites;build before all-project Chromium tests and do not rebuild dist during browser use. Inspect failures against original source and current shared Writer/Calc contracts. Correct actual scoped regressions or dependent test input migrations using the same application/resource/command owners;preserve original kernel behavior and document any newly suspected source issue in canonical ledger. Up to35non-task source/test/registry files only when actual failures justify them;no guard,timeout,coverage,skip or threshold weakening,no unrelated feature work. Run wholeCalc100 separately,all deterministic type/build/static/format/lint/docs/size/tree/dependency/provenance/resource/inventory/doctor/routing checks. Retain full count/status/rawcounter and exact-run evidence,including failed diagnostics and specific replays;do not claim one clean invocation where results are accounted across runs. Complete quality/lifecycle commits on calc;next full40,broader goal active. Existing explicit user approval covers safe local execution;offline,no other checkout,branch changes,merge or publication.

## Verify Steps

Run complete npm run test:coverage with whole-office raw100 S/B/F/L; npm run test:inventory:coverage; npm run test:tooling; whole npm run test:coverage:calc raw100. Build then run all projects via npx playwright test --config apps/office/playwright.config.ts,keeping dist immutable during browser execution. Account for every selected case with retained terminal status,actual failures and bounded justified reruns;no test/time/coverage/skip/validator weakening. npm run format:check,lint,typecheck,build;node scripts/check-static-build.mjs;npm run check:docs,check:file-size,check:source-tree,check:dependencies,check:source-provenance,check:writer-resources,check:calc-resources;shared/writer/calc scoped inventories;ap doctor;routing check. If repairs change source,run affected tests/complete changed-owner raw100 and relevant build/browser checks;retain source fidelity and ledger for actual new upstream suspicions. Reviewed exact intentional paths,recorded verification/evaluator report,commits and final clean calc state. This is full checkpoint30,next40.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert only this task justified regression repairs and their registry/test changes;preserve tasks21-29 behavior and evidence,upstream ledger and user changes. Verification artifacts may remain as history. No reset,branch switch,other checkout,network or merge.

## Findings
