---
id: "202610221740-98YRBY"
title: "Connect formula ranges to native area recalculation and aggregate execution"
status: "DOING"
priority: "high"
owner: "CODER"
revision: 9
origin:
  system: "manual"
depends_on:
  - "202610221740-JMM9C5"
tags:
  - "calc"
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-22T17:41:25.408Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-10-22T20:20:24.441Z"
  updated_by: "CODER"
  note: "642 Calc and64 related scenarios pass;142 Calc and2 changed shared owners raw100 S/B/F/L;2 Chromium/Worker cases,4097 native rows/138 original objects,15 gates,production build and actual UI history/ODS reopen pass. Immutable source-pinned audit passes."
  attempts: 0
commit:
  hash: "6135d82cdadf7a04fbbc2a3c922899b341337194"
  message: "🧩 98YRBY calc: execute native range formulas and area recalculation"
comments:
  -
    author: "CODER"
    body: "Start: continue direct-mode task in current checkout."
  -
    author: "CODER"
    body: "Start: pin the verified range implementation and immutable evidence for evaluation."
events:
  -
    type: "status"
    at: "2026-10-22T18:48:38.038Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: continue direct-mode task in current checkout."
  -
    type: "verify"
    at: "2026-10-22T20:20:24.441Z"
    author: "CODER"
    state: "ok"
    note: "642 Calc and64 related scenarios pass;142 Calc and2 changed shared owners raw100 S/B/F/L;2 Chromium/Worker cases,4097 native rows/138 original objects,15 gates,production build and actual UI history/ODS reopen pass. Immutable source-pinned audit passes."
  -
    type: "status"
    at: "2026-10-22T20:20:25.050Z"
    author: "CODER"
    from: "DOING"
    to: "DOING"
    note: "Start: pin the verified range implementation and immutable evidence for evaluation."
doc_version: 3
doc_updated_at: "2026-10-22T20:20:25.050Z"
doc_updated_by: "CODER"
description: "Block73 dependent on72: implement native local-A1/ODFF double-reference compilation/output,real area dependency notifications through ScBroadcastArea/Slot/SlotMachine and ScDocument lifetime,then aggregate range traversal through actual RangeColumnSpanSet/NumericCellAccumulator and native array summation. Do not flatten ranges into individual cell listeners or use a browser evaluator. Verify liveSUMrange edits,errors,history,large sparse ranges and ODS/browser reopen. Preserve source slot distribution,bulk/deferred erasure and default non-grouped semantics;unported advanced modes stay explicit. Scope up to80source/test/registry/probe paths. Calc and changed shared100;full checkpoint80."
sections:
  Summary: "Connect real range operands to native dependency notifications and aggregate range computation."
  Scope: "Block73 depends on block72. Native local and ODFF rectangular double references,source area slots/document lifetime/bulk erasure,range column actions and numeric accumulation. Up to80source/test/registry/probe paths. No individual-cell listener expansion or browser computations;advanced unported modes remain explicit."
  Plan: "After72,port canonical range references,area subscriptions and native aggregate range actions,then verify live full-range SUM through UI and ODS without substitute dependency/evaluation models."
  Verify Steps: "Require complete source-shaped area geometry,duplicate/listener/bulk/deferred erasure and lifetime tests;independent compiler/reference vectors;native summation observations. Mounted range formulas must recompute after editing any range member and after undo/redo and ODS reload,including large sparse spans and style/geometry preservation. Calc and all changed shared owners must retain raw100 S/B/F/L with original thresholds;run related Writer cases and actual browser/Worker checks. All static/source/build/registry/routing/doctor gates pass. No full all-app checkpoint before80 unless material failures require it."
  Verification: |-
    Command:npm run test:coverage:calc -- --maxWorkers=1 --coverage.reportsDirectory=../../output/playwright/task73-calc-final-coverage --reporter=default --reporter=json --outputFile.json=../../output/playwright/task73-calc-final-results.json(from apps/office).
    Result:pass.
    Evidence:642/642 scenarios,184files,142 instrumented Calc owners,raw positive100 S12097/B7435/F2189/L10854. Thresholds and exclusions unchanged. Archive retains earlier contention failure and isolated4-case recheck.
    Scope:complete Calc profile,including actual import/autosave/ODS workflows,sparse5000-row regression and all new range/lifetime/update/aggregation cases.

    Command:npx vitest run --config vitest.shared-coverage.config.ts src/formula/inc src/formula/source/core/api src/sc/source/core/tool/numeric-formula.test.ts src/sc/source/core/tool/aggregate-formula.test.ts src/sc/source/core/tool/range-formula.test.ts --coverage --coverage.include=src/formula/inc/core_resource.ts --coverage.include=src/formula/source/core/api/FormulaCompiler.ts --coverage.reportsDirectory=../../output/playwright/task73-shared-final-coverage --reporter=default --reporter=json --outputFile.json=../../output/playwright/task73-shared-final-results.json.
    Result:pass.
    Evidence:64 scenarios/11files;both changed shared owners raw positive100 S206/B137/F22/L186. No direct sw consumer of these owners;Writer resources gate passes.
    Scope:actual shared compiler/opcode/string/missing/range contracts and Calc consumers.

    Command:node output/playwright/task73-run-gates.mjs; npm run build; npx playwright test e2e/calc/range-formulas.spec.ts e2e/calc/aggregate-formulas.spec.ts --project=calc --reporter=line,json.
    Result:pass.
    Evidence:15/15 gates(types,scoped lint,format,boundaries,JSDoc,size,source tree,provenance,registry,Calc/Writer resources,static,native array probe,routing,doctor);production build passes;2/2 Chromium/DOM-free Worker scenarios. Native4097rows/138original objects match under normal and ASan/UBSan. No skipped/flaky e2e results.
    Scope:all intentional sources and actual browser/core boundaries. Existing build chunk-size warnings remain informational.

    Command:playwright-cli -s=calc71 input/edit/Undo/Redo/Meta+s/reload/open; node .agentplane/tasks/202610221740-98YRBY/evidence/audit.mjs.
    Result:pass.
    Evidence:actual mounted formula SUM(A1:A3)+AVERAGE(A1:A3)+SUMSQ(A1:A3)+PRODUCT(A1:A3) gives91,source edit gives220,Undo91,Redo220;fresh stored ODS reopen retains220 and original formula source. Screenshots inspected. Immutable archive audit verifies85source hashes,all positive raw coverage counters,complete test/e2e/gate results,original numeric streams and browser snapshots. git diff --check passes;branch remains calc.
    Scope:approved block73 only. Full all-application checkpoint next80;goal remains active.

    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-10-22T20:20:24.441Z — VERIFY — ok

    By: CODER

    Note: 642 Calc and64 related scenarios pass;142 Calc and2 changed shared owners raw100 S/B/F/L;2 Chromium/Worker cases,4097 native rows/138 original objects,15 gates,production build and actual UI history/ODS reopen pass. Immutable source-pinned audit passes.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-22T20:20:04.489Z, excerpt_hash=sha256:24560f86393b4293965ced8aa6d5ba1addc6c9fc2681e0cad21f94b4ddfd3cb6

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202610221740-98YRBY/blueprint/resolved-snapshot.json
    - old_digest: 3df2c4aeaec7c24a9c1dcdaa37d7b3f1fc933ed904972f5836f815566d5481bc
    - current_digest: 3df2c4aeaec7c24a9c1dcdaa37d7b3f1fc933ed904972f5836f815566d5481bc
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202610221740-98YRBY

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202610221740-98YRBY
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: false
    - repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert task-owned implementation commits only;preserve integrated user changes."
  Findings: |-
    Block73 implements native local/ODFF rectangular and whole-axis double references,shared RangeLine compilation,ordinary scalar intersection,and default SUM/SUMSQ/PRODUCT/AVERAGE ranges. Actual ScBroadcastArea/Slot/SlotMachine own logarithmic geometry,shared reciprocal listeners,bulk/deferred erasure,reference updates and document destruction. Native column actions,ScValueIterator,ParseBlock and original portable array summation consume real typed stores. Range subscriptions are not expanded into individual-cell registrations. The independent5000-row import/autosave case remains in Calc;the human's actual5000-row filename is still unknown.

    Scope:85 non-task source/test/registry/probe paths,within the approved80 plus the policy's five-file nonmaterial allowance. Additional source files follow the original bcaslot/documen2/documen7/interpr6/header responsibilities. Out-of-class document functions run on the same original instance;TypeScript literal private-member access bridges source-file boundaries without duplicate state. Default arguments stay in class declarations rather than duplicated implementation definitions. The original missing-table OSL_FAIL diagnostic during non-callback detachment is outside the initialized ordinary owner contract;the invariant actual table is borrowed directly. Source provenance records this boundary.

    Native numeric evidence:4097 original output rows(PROFILE0 plus4096 sequences),138 verified original dependency objects,unchanged complete arraysumfunctor.hxx/kahan.hxx,normal and ASan/UBSan streams identical for finite/NoValue-empty and isolated infinity profiles. Encoded NaN values require typed double out-references because packed JS arrays can canonicalize payloads. CALC252 retains original normal/ASan disagreement for mixed encoded NaN errors;no broad payload-arithmetic parity is claimed. CALC250/251 record retained upstream full-sheet terminal-slot and nested-erasure edge behavior. Grouped/3D/external/named-reference expressions,matrix evaluation,other functions,nondefault subtotal/text-as-zero and number-format services remain unavailable. Whole-module parity flags remain unverified.

    Command:npm run test:coverage:calc(initial final-profile attempt).
    Result:fail coverage gate;all638 test scenarios passed.
    Evidence:99.89 statements/99.75 branches/100 functions/99.92 lines;remaining source boundaries received four additional real-owner scenarios. No thresholds or coverage exclusions changed.
    Scope:Calc-only profile.

    Command:npm run test:coverage:calc(second final-profile attempt).
    Result:fail;641/642 passed,one existing saved-document dialog test exceeded its asynchronous role-query wait during competing builds/checks.
    Evidence:output/playwright/task73-calc-contention.log and task73-calc-contention-results.json.
    Scope:Calc-only profile. No source behavior or timeout was changed for this observation.

    Command:npx vitest run --config vitest.calc.config.ts src/sc/browser/presentation/calc-files.test.tsx.
    Result:pass;4 scenarios.
    Evidence:output/playwright/task73-files-recheck.log.
    Scope:the same real saved/opened document workflow. Final strict full Calc rerun uses maxWorkers1 without concurrent build/check execution.

    Changed shared owners:FormulaCompiler.ts and core_resource.ts only.64 related scenarios passed with raw100 S/B/F/L over both. No direct FormulaCompiler/core_resource consumer exists under sw;the Writer resource gate passes and shared compiler unit tests exercise the altered contracts. Full all-application checkpoint70 was completed previously;next checkpoint80 remains unchanged.
id_source: "generated"
---
## Summary

Connect real range operands to native dependency notifications and aggregate range computation.

## Scope

Block73 depends on block72. Native local and ODFF rectangular double references,source area slots/document lifetime/bulk erasure,range column actions and numeric accumulation. Up to80source/test/registry/probe paths. No individual-cell listener expansion or browser computations;advanced unported modes remain explicit.

## Plan

After72,port canonical range references,area subscriptions and native aggregate range actions,then verify live full-range SUM through UI and ODS without substitute dependency/evaluation models.

## Verify Steps

Require complete source-shaped area geometry,duplicate/listener/bulk/deferred erasure and lifetime tests;independent compiler/reference vectors;native summation observations. Mounted range formulas must recompute after editing any range member and after undo/redo and ODS reload,including large sparse spans and style/geometry preservation. Calc and all changed shared owners must retain raw100 S/B/F/L with original thresholds;run related Writer cases and actual browser/Worker checks. All static/source/build/registry/routing/doctor gates pass. No full all-app checkpoint before80 unless material failures require it.

## Verification

Command:npm run test:coverage:calc -- --maxWorkers=1 --coverage.reportsDirectory=../../output/playwright/task73-calc-final-coverage --reporter=default --reporter=json --outputFile.json=../../output/playwright/task73-calc-final-results.json(from apps/office).
Result:pass.
Evidence:642/642 scenarios,184files,142 instrumented Calc owners,raw positive100 S12097/B7435/F2189/L10854. Thresholds and exclusions unchanged. Archive retains earlier contention failure and isolated4-case recheck.
Scope:complete Calc profile,including actual import/autosave/ODS workflows,sparse5000-row regression and all new range/lifetime/update/aggregation cases.

Command:npx vitest run --config vitest.shared-coverage.config.ts src/formula/inc src/formula/source/core/api src/sc/source/core/tool/numeric-formula.test.ts src/sc/source/core/tool/aggregate-formula.test.ts src/sc/source/core/tool/range-formula.test.ts --coverage --coverage.include=src/formula/inc/core_resource.ts --coverage.include=src/formula/source/core/api/FormulaCompiler.ts --coverage.reportsDirectory=../../output/playwright/task73-shared-final-coverage --reporter=default --reporter=json --outputFile.json=../../output/playwright/task73-shared-final-results.json.
Result:pass.
Evidence:64 scenarios/11files;both changed shared owners raw positive100 S206/B137/F22/L186. No direct sw consumer of these owners;Writer resources gate passes.
Scope:actual shared compiler/opcode/string/missing/range contracts and Calc consumers.

Command:node output/playwright/task73-run-gates.mjs; npm run build; npx playwright test e2e/calc/range-formulas.spec.ts e2e/calc/aggregate-formulas.spec.ts --project=calc --reporter=line,json.
Result:pass.
Evidence:15/15 gates(types,scoped lint,format,boundaries,JSDoc,size,source tree,provenance,registry,Calc/Writer resources,static,native array probe,routing,doctor);production build passes;2/2 Chromium/DOM-free Worker scenarios. Native4097rows/138original objects match under normal and ASan/UBSan. No skipped/flaky e2e results.
Scope:all intentional sources and actual browser/core boundaries. Existing build chunk-size warnings remain informational.

Command:playwright-cli -s=calc71 input/edit/Undo/Redo/Meta+s/reload/open; node .agentplane/tasks/202610221740-98YRBY/evidence/audit.mjs.
Result:pass.
Evidence:actual mounted formula SUM(A1:A3)+AVERAGE(A1:A3)+SUMSQ(A1:A3)+PRODUCT(A1:A3) gives91,source edit gives220,Undo91,Redo220;fresh stored ODS reopen retains220 and original formula source. Screenshots inspected. Immutable archive audit verifies85source hashes,all positive raw coverage counters,complete test/e2e/gate results,original numeric streams and browser snapshots. git diff --check passes;branch remains calc.
Scope:approved block73 only. Full all-application checkpoint next80;goal remains active.

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-10-22T20:20:24.441Z — VERIFY — ok

By: CODER

Note: 642 Calc and64 related scenarios pass;142 Calc and2 changed shared owners raw100 S/B/F/L;2 Chromium/Worker cases,4097 native rows/138 original objects,15 gates,production build and actual UI history/ODS reopen pass. Immutable source-pinned audit passes.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-22T20:20:04.489Z, excerpt_hash=sha256:24560f86393b4293965ced8aa6d5ba1addc6c9fc2681e0cad21f94b4ddfd3cb6

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202610221740-98YRBY/blueprint/resolved-snapshot.json
- old_digest: 3df2c4aeaec7c24a9c1dcdaa37d7b3f1fc933ed904972f5836f815566d5481bc
- current_digest: 3df2c4aeaec7c24a9c1dcdaa37d7b3f1fc933ed904972f5836f815566d5481bc
- route_changed: no
- safe_command: agentplane blueprint snapshot 202610221740-98YRBY

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202610221740-98YRBY
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: false
- repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert task-owned implementation commits only;preserve integrated user changes.

## Findings

Block73 implements native local/ODFF rectangular and whole-axis double references,shared RangeLine compilation,ordinary scalar intersection,and default SUM/SUMSQ/PRODUCT/AVERAGE ranges. Actual ScBroadcastArea/Slot/SlotMachine own logarithmic geometry,shared reciprocal listeners,bulk/deferred erasure,reference updates and document destruction. Native column actions,ScValueIterator,ParseBlock and original portable array summation consume real typed stores. Range subscriptions are not expanded into individual-cell registrations. The independent5000-row import/autosave case remains in Calc;the human's actual5000-row filename is still unknown.

Scope:85 non-task source/test/registry/probe paths,within the approved80 plus the policy's five-file nonmaterial allowance. Additional source files follow the original bcaslot/documen2/documen7/interpr6/header responsibilities. Out-of-class document functions run on the same original instance;TypeScript literal private-member access bridges source-file boundaries without duplicate state. Default arguments stay in class declarations rather than duplicated implementation definitions. The original missing-table OSL_FAIL diagnostic during non-callback detachment is outside the initialized ordinary owner contract;the invariant actual table is borrowed directly. Source provenance records this boundary.

Native numeric evidence:4097 original output rows(PROFILE0 plus4096 sequences),138 verified original dependency objects,unchanged complete arraysumfunctor.hxx/kahan.hxx,normal and ASan/UBSan streams identical for finite/NoValue-empty and isolated infinity profiles. Encoded NaN values require typed double out-references because packed JS arrays can canonicalize payloads. CALC252 retains original normal/ASan disagreement for mixed encoded NaN errors;no broad payload-arithmetic parity is claimed. CALC250/251 record retained upstream full-sheet terminal-slot and nested-erasure edge behavior. Grouped/3D/external/named-reference expressions,matrix evaluation,other functions,nondefault subtotal/text-as-zero and number-format services remain unavailable. Whole-module parity flags remain unverified.

Command:npm run test:coverage:calc(initial final-profile attempt).
Result:fail coverage gate;all638 test scenarios passed.
Evidence:99.89 statements/99.75 branches/100 functions/99.92 lines;remaining source boundaries received four additional real-owner scenarios. No thresholds or coverage exclusions changed.
Scope:Calc-only profile.

Command:npm run test:coverage:calc(second final-profile attempt).
Result:fail;641/642 passed,one existing saved-document dialog test exceeded its asynchronous role-query wait during competing builds/checks.
Evidence:output/playwright/task73-calc-contention.log and task73-calc-contention-results.json.
Scope:Calc-only profile. No source behavior or timeout was changed for this observation.

Command:npx vitest run --config vitest.calc.config.ts src/sc/browser/presentation/calc-files.test.tsx.
Result:pass;4 scenarios.
Evidence:output/playwright/task73-files-recheck.log.
Scope:the same real saved/opened document workflow. Final strict full Calc rerun uses maxWorkers1 without concurrent build/check execution.

Changed shared owners:FormulaCompiler.ts and core_resource.ts only.64 related scenarios passed with raw100 S/B/F/L over both. No direct FormulaCompiler/core_resource consumer exists under sw;the Writer resource gate passes and shared compiler unit tests exercise the altered contracts. Full all-application checkpoint70 was completed previously;next checkpoint80 remains unchanged.
