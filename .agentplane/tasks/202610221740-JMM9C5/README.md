---
id: "202610221740-JMM9C5"
title: "Compile and evaluate native aggregate functions through Calc formula input"
status: "DOING"
priority: "high"
owner: "CODER"
revision: 5
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
doc_updated_at: "2026-10-22T17:41:26.051Z"
doc_updated_by: "CODER"
description: "Block72: implement shared native variable-argument Factor grammar,consumedSUM/SUMSQ/PRODUCT/AVERAGE symbols,argument scanning and native compensated aggregation for numeric and single-reference operands,with live recalculation,errors,history and ODS/browser integration. Port actual KahanSum methods with original normal/ASan native evidence. Range operands require native area broadcast ownership and are the next dependent block,not flattened to cell lists or browser computations. Scope up to80intentional implementation/test/registry/probe paths including existing invalid-input fixtures that currently use SUM(A1). Require unchanged Calc100 and changed shared owners100;no full all-app before80."
sections:
  Summary: "Add actual variable-argument aggregate formula execution before connecting range broadcasts in dependent block73."
  Scope: "Block72: shared Factor function-argument grammar,consumed SUM/SUMSQ/PRODUCT/AVERAGE resource entries and Calc scanning/output;native KahanSum and scalar/single-reference aggregate branches;actual input/history/recalc/ODS/browser integration. Up to80source/test/registry/native-probe paths,including existing unsupported-input fixtures that currently use SUM(A1). No fake range traversal or area listeners;73 owns those required dependencies."
  Plan: "Implement the original aggregate function compilation/numeric execution slice with source-backed compensated sums and actual UI recalculation/ODS. Preserve full goal scope by tracking native range subscriptions/execution in dependent73;do not emulate missing range owners."
  Verify Steps: "Native Kahan observations must use unchanged full original sources and verified dependencies,normal and ASan/UBSan streams matching,with source/input/raw pins. Verify default/copy/add/get/product behavior,cancellation and source binary64 corner cases. Shared compiler tests must prove nested argument order,arity255 bounds,separator/missing/error behavior and source serialization. Native aggregate fixtures must cover ordinary numeric/single-reference operands,empty/text/error differences,nesting,live edits,history and ODS. Calc coverage100 and each changed shared owner raw100 S/B/F/L;run all related modified test modules and browser/Worker acceptance. Types,lint,format,dependencies,resources,docs,size,tree,provenance,registry,routing,doctor,production/static gates pass. Full all-app only at80 unless justified by new failures."
  Verification: "Pending."
  Rollback Plan: "Revert only this task implementation commits;preserve user integration and other work."
  Findings: "Current shared Factor accepts only scalar pushes/groups and scanner resources omit function names/separators. About30UI invalid-input scenarios use SUM(A1) as an unsupported formula;those fixtures must change when SUM becomes supported without dropping their failure assertions. Range compilation and native area broadcaster graph are explicitly tracked as dependent task202610221740-98YRBY."
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

Pending.

## Rollback Plan

Revert only this task implementation commits;preserve user integration and other work.

## Findings

Current shared Factor accepts only scalar pushes/groups and scanner resources omit function names/separators. About30UI invalid-input scenarios use SUM(A1) as an unsupported formula;those fixtures must change when SUM becomes supported without dropping their failure assertions. Range compilation and native area broadcaster graph are explicitly tracked as dependent task202610221740-98YRBY.
