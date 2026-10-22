---
id: "202610221740-JMM9C5"
title: "Compile and evaluate native aggregate functions through Calc formula input"
status: "DOING"
priority: "high"
owner: "CODER"
revision: 7
origin:
  system: "manual"
depends_on: []
tags:
  - "calc"
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-22T17:41:25.651Z"
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
    body: "Start: implement native aggregate function argument compilation and compensated scalar/reference execution with source-backed probes and live Calc UI tests."
events:
  -
    type: "status"
    at: "2026-10-22T17:41:26.051Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implement native aggregate function argument compilation and compensated scalar/reference execution with source-backed probes and live Calc UI tests."
doc_version: 3
doc_updated_at: "2026-10-22T18:46:43.114Z"
doc_updated_by: "CODER"
description: "Block72: implement shared native variable-argument Factor grammar,consumedSUM/SUMSQ/PRODUCT/AVERAGE symbols,argument scanning and native compensated aggregation for numeric and single-reference operands,with live recalculation,errors,history and ODS/browser integration. Port actual KahanSum methods with original normal/ASan native evidence. Range operands require native area broadcast ownership and are the next dependent block,not flattened to cell lists or browser computations. Scope up to80intentional implementation/test/registry/probe paths including existing invalid-input fixtures that currently use SUM(A1). Require unchanged Calc100 and changed shared owners100;no full all-app before80."
sections:
  Summary: "Add actual variable-argument aggregate formula execution before connecting range broadcasts in dependent block73."
  Scope: "Block72: shared Factor function-argument grammar,consumed SUM/SUMSQ/PRODUCT/AVERAGE resource entries and Calc scanning/output;native KahanSum and scalar/single-reference aggregate branches;actual input/history/recalc/ODS/browser integration. Up to80source/test/registry/native-probe paths,including existing unsupported-input fixtures that currently use SUM(A1). No fake range traversal or area listeners;73 owns those required dependencies."
  Plan: "Implement the original aggregate function compilation/numeric execution slice with source-backed compensated sums and actual UI recalculation/ODS. Preserve full goal scope by tracking native range subscriptions/execution in dependent73;do not emulate missing range owners."
  Verify Steps: "Native Kahan observations must use unchanged full original sources and verified dependencies,normal and ASan/UBSan streams matching,with source/input/raw pins. Verify default/copy/add/get/product behavior,cancellation and source binary64 corner cases. Shared compiler tests must prove nested argument order,arity255 bounds,separator/missing/error behavior and source serialization. Native aggregate fixtures must cover ordinary numeric/single-reference operands,empty/text/error differences,nesting,live edits,history and ODS. Calc coverage100 and each changed shared owner raw100 S/B/F/L;run all related modified test modules and browser/Worker acceptance. Types,lint,format,dependencies,resources,docs,size,tree,provenance,registry,routing,doctor,production/static gates pass. Full all-app only at80 unless justified by new failures."
  Verification: |-
    Command: Calc Vitest config with Istanbul coverage; shared formula tests plus aggregate/numeric/ODS/primary-save integration with exactly the two changed shared coverage owners; two selected Playwright browser/Worker specs; all exact gate argv are archived in evidence/raw-results.json.gz under task72-gate-exits.json.
    Result: pass. Calc617tests/183files/136owners;related46tests/12files/2sharedowners. Raw positive counters and summary S/B/F/L are100% in both profiles. Calc S11289/B7026/F2074/L10140;shared S183/B127/F19/L165. No pending/failed scenarios. Two Chromium/Worker specs pass with no skip/retry/flaky result. All15gates pass: types,targeted intentional-source lint,format,dependencies,JSDoc,size,tree,provenance,registry,Calcresources,Writerresources,production/static,native,routing,doctor.
    Evidence: evidence/audit.mjs,acceptance.json,raw-results.json.gz. Re-running the audit checks source hashes,archived results,all raw positive counters,2050matching native normal/ASan observation rows and138verified original objects. Native full-source profile is portable non-SSE2;source input pins remain9bc445578031fecf56086729d8e4940c77e14d65. Cases0/1 preserve the cancellation consequence recorded as CALC-249.
    Scope: actual shared Factor variable-argument grammar,Calc scanning/RPN/string output,native scalar/single-reference SUM/SUMSQ/PRODUCT/AVERAGE,Kahan operations and numeric cell predicate. Real UI input/Undo/Redo/live edits,Cmd+S and primary ODS save/reload/open retain the same formula source and22result. Native range-area ownership and range aggregation remain dependent73. Full all-app checkpoint remains80.
  Rollback Plan: "Revert only this task implementation commits;preserve user integration and other work."
  Findings: |-
    Block72 completes the approved scalar/single-reference aggregate slice and preserves full goal scope through dependent202610221740-98YRBY for ranges. English/ODFF source serialization and native argument byte255 bounds are represented. Existing invalid-input scenarios now use UNPORTED(A1) while retaining their failure/history assertions. Other functions,range/named/external/matrix operands,locale string-to-number conversion and nondefault subtotal/number-format services remain unavailable.
    CALC-249 documents original portable Kahan cancellation returning zero for1e16,1,-1e16 in both orders. Full unchanged native header observations match normal and ASan/UBSan;source behavior is retained. No broad aggregate/native-engine parity is certified.
    One earlier concurrent Calc run timed out waiting for the existing primary-save dialog list. Its isolated related group and the final617-case Calc run pass with unchanged timing/assertions. The initial repository-wide lint also scanned generated ignored scratch output;intentional-source non-null assertion issues were corrected and the final scoped lint and all15recorded gates pass. No tests or coverage thresholds were weakened.
    The original human5000-row filename remains unspecified. Block71 independent5000-row sparse import/autosave/reopen regression passes in this Calc run. No claim that every feature of the unspecified external file is covered.
id_source: "generated"
---
## Summary

Add actual variable-argument aggregate formula execution before connecting range broadcasts in dependent block73.

## Scope

Block72: shared Factor function-argument grammar,consumed SUM/SUMSQ/PRODUCT/AVERAGE resource entries and Calc scanning/output;native KahanSum and scalar/single-reference aggregate branches;actual input/history/recalc/ODS/browser integration. Up to80source/test/registry/native-probe paths,including existing unsupported-input fixtures that currently use SUM(A1). No fake range traversal or area listeners;73 owns those required dependencies.

## Plan

Implement the original aggregate function compilation/numeric execution slice with source-backed compensated sums and actual UI recalculation/ODS. Preserve full goal scope by tracking native range subscriptions/execution in dependent73;do not emulate missing range owners.

## Verify Steps

Native Kahan observations must use unchanged full original sources and verified dependencies,normal and ASan/UBSan streams matching,with source/input/raw pins. Verify default/copy/add/get/product behavior,cancellation and source binary64 corner cases. Shared compiler tests must prove nested argument order,arity255 bounds,separator/missing/error behavior and source serialization. Native aggregate fixtures must cover ordinary numeric/single-reference operands,empty/text/error differences,nesting,live edits,history and ODS. Calc coverage100 and each changed shared owner raw100 S/B/F/L;run all related modified test modules and browser/Worker acceptance. Types,lint,format,dependencies,resources,docs,size,tree,provenance,registry,routing,doctor,production/static gates pass. Full all-app only at80 unless justified by new failures.

## Verification

Command: Calc Vitest config with Istanbul coverage; shared formula tests plus aggregate/numeric/ODS/primary-save integration with exactly the two changed shared coverage owners; two selected Playwright browser/Worker specs; all exact gate argv are archived in evidence/raw-results.json.gz under task72-gate-exits.json.
Result: pass. Calc617tests/183files/136owners;related46tests/12files/2sharedowners. Raw positive counters and summary S/B/F/L are100% in both profiles. Calc S11289/B7026/F2074/L10140;shared S183/B127/F19/L165. No pending/failed scenarios. Two Chromium/Worker specs pass with no skip/retry/flaky result. All15gates pass: types,targeted intentional-source lint,format,dependencies,JSDoc,size,tree,provenance,registry,Calcresources,Writerresources,production/static,native,routing,doctor.
Evidence: evidence/audit.mjs,acceptance.json,raw-results.json.gz. Re-running the audit checks source hashes,archived results,all raw positive counters,2050matching native normal/ASan observation rows and138verified original objects. Native full-source profile is portable non-SSE2;source input pins remain9bc445578031fecf56086729d8e4940c77e14d65. Cases0/1 preserve the cancellation consequence recorded as CALC-249.
Scope: actual shared Factor variable-argument grammar,Calc scanning/RPN/string output,native scalar/single-reference SUM/SUMSQ/PRODUCT/AVERAGE,Kahan operations and numeric cell predicate. Real UI input/Undo/Redo/live edits,Cmd+S and primary ODS save/reload/open retain the same formula source and22result. Native range-area ownership and range aggregation remain dependent73. Full all-app checkpoint remains80.

## Rollback Plan

Revert only this task implementation commits;preserve user integration and other work.

## Findings

Block72 completes the approved scalar/single-reference aggregate slice and preserves full goal scope through dependent202610221740-98YRBY for ranges. English/ODFF source serialization and native argument byte255 bounds are represented. Existing invalid-input scenarios now use UNPORTED(A1) while retaining their failure/history assertions. Other functions,range/named/external/matrix operands,locale string-to-number conversion and nondefault subtotal/number-format services remain unavailable.
CALC-249 documents original portable Kahan cancellation returning zero for1e16,1,-1e16 in both orders. Full unchanged native header observations match normal and ASan/UBSan;source behavior is retained. No broad aggregate/native-engine parity is certified.
One earlier concurrent Calc run timed out waiting for the existing primary-save dialog list. Its isolated related group and the final617-case Calc run pass with unchanged timing/assertions. The initial repository-wide lint also scanned generated ignored scratch output;intentional-source non-null assertion issues were corrected and the final scoped lint and all15recorded gates pass. No tests or coverage thresholds were weakened.
The original human5000-row filename remains unspecified. Block71 independent5000-row sparse import/autosave/reopen regression passes in this Calc run. No claim that every feature of the unspecified external file is covered.
