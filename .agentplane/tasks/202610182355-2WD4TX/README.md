---
id: "202610182355-2WD4TX"
title: "Implement native RTL general Unicode number formatting and buffer insertion"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 6
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify:
  - "Native complete formatter differential matrix and real replace/insert states normal+ASanUBSan;entire changed formatting scopes raw100 S/B/F/L and related SAL tests;wholeCalc raw100;types/build/static/style/docs/size/tree/dependencies/provenance/shared+Calc inventories/doctor/routing. Full regression next task30."
plan_approval:
  state: "approved"
  updated_at: "2026-10-18T23:55:49.300Z"
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
    body: "Start:port full native RTL number formatting and real Unicode replace/insert contracts for the approved Calc buffer and font serialization path."
events:
  -
    type: "status"
    at: "2026-10-18T23:55:50.459Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start:port full native RTL number formatting and real Unicode replace/insert contracts for the approved Calc buffer and font serialization path."
doc_version: 3
doc_updated_at: "2026-10-18T23:55:50.459Z"
doc_updated_by: "CODER"
description: "Task25 of approved Calc goal:port complete E/F/G/Automatic/E1/E2/G1/G2 numeric formatting responsibility and rtl_math_doubleToUString over real SAL allocation/buffer owners. Preserve source enum/constants,precision,rounding,grouping,special values,replace versus insert contracts. Verify full native normal and ASanUBSan observations offline using unchanged source graph. Only calc checkout/branch;no merge/network."
sections:
  Summary: |-
    Implement native RTL general Unicode number formatting and buffer insertion

    Task25 of approved Calc goal:port complete E/F/G/Automatic/E1/E2/G1/G2 numeric formatting responsibility and rtl_math_doubleToUString over real SAL allocation/buffer owners. Preserve source enum/constants,precision,rounding,grouping,special values,replace versus insert contracts. Verify full native normal and ASanUBSan observations offline using unchanged source graph. Only calc checkout/branch;no merge/network.
  Scope: |-
    - In scope: Task25 of approved Calc goal:port complete E/F/G/Automatic/E1/E2/G1/G2 numeric formatting responsibility and rtl_math_doubleToUString over real SAL allocation/buffer owners. Preserve source enum/constants,precision,rounding,grouping,special values,replace versus insert contracts. Verify full native normal and ASanUBSan observations offline using unchanged source graph. Only calc checkout/branch;no merge/network.
    - Out of scope: unrelated refactors not required for "Implement native RTL general Unicode number formatting and buffer insertion".
  Plan: "Port full original numeric formatting algorithm in existing strtmpl.math responsibility:source enums/precision constants,all eight formats,sign/specials,exact integers,pre-round format selection,half-up integer significand rounding,decimal/grouping/clamp/exponent rules. Generalize existing scalar/float adapters to one algorithm while retaining prior source-derived and genuine float observations. Add original Unicode C writer using actual existing newFromStr_WithLength/stringbuffer_insert and capacity ownership;header exports and honest mapped/unverified registries. Verify genuine normal+ASanUBSan source-linked oracle including binary64 boundaries,precision/grouping/erase and replace/insert states;entire changed numeric/C scopes100 plus related SAL and wholeCalc100. Types/build/static/style/docs/size/tree/dependency/provenance/scopedinventories/doctor/routing. Up to20non-task paths. Existing user goal approval applies;no network/merge,full regression next30."
  Verify Steps: "Run offline native observer against unchanged verified full69normal+69ASanUBSan SAL/CPPU objects;compare identical successful streams and no sanitizer errors. Replay all eight formats,precision sentinels/clamps/negative places,IEEE specials/signedzero/subnormal/max/carry/tie/exact integer boundaries,valid repeating grouping including zero group separator,Unicode decimal/group units and erase modes. Verify actual replace versus insert output/terminator/capacity/relative identity and old data release with valid real buffers. Entire changed formatter and math C owner raw100 S/B/F/L with related SAL native float and legacy scalar/parser tests;wholeCalc100. Run typecheck/build/static,changed-path prettier/eslint,docs/size/tree/dependencies/provenance,shared+Calc inventories,ap doctor,routing. Full regression cadence30,not25."
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert only this task implementation commit and task-owned registry/test changes. Preserve unrelated tasks and user changes. Do not reset branch or merge."
  Findings: ""
id_source: "generated"
---
## Summary

Implement native RTL general Unicode number formatting and buffer insertion

Task25 of approved Calc goal:port complete E/F/G/Automatic/E1/E2/G1/G2 numeric formatting responsibility and rtl_math_doubleToUString over real SAL allocation/buffer owners. Preserve source enum/constants,precision,rounding,grouping,special values,replace versus insert contracts. Verify full native normal and ASanUBSan observations offline using unchanged source graph. Only calc checkout/branch;no merge/network.

## Scope

- In scope: Task25 of approved Calc goal:port complete E/F/G/Automatic/E1/E2/G1/G2 numeric formatting responsibility and rtl_math_doubleToUString over real SAL allocation/buffer owners. Preserve source enum/constants,precision,rounding,grouping,special values,replace versus insert contracts. Verify full native normal and ASanUBSan observations offline using unchanged source graph. Only calc checkout/branch;no merge/network.
- Out of scope: unrelated refactors not required for "Implement native RTL general Unicode number formatting and buffer insertion".

## Plan

Port full original numeric formatting algorithm in existing strtmpl.math responsibility:source enums/precision constants,all eight formats,sign/specials,exact integers,pre-round format selection,half-up integer significand rounding,decimal/grouping/clamp/exponent rules. Generalize existing scalar/float adapters to one algorithm while retaining prior source-derived and genuine float observations. Add original Unicode C writer using actual existing newFromStr_WithLength/stringbuffer_insert and capacity ownership;header exports and honest mapped/unverified registries. Verify genuine normal+ASanUBSan source-linked oracle including binary64 boundaries,precision/grouping/erase and replace/insert states;entire changed numeric/C scopes100 plus related SAL and wholeCalc100. Types/build/static/style/docs/size/tree/dependency/provenance/scopedinventories/doctor/routing. Up to20non-task paths. Existing user goal approval applies;no network/merge,full regression next30.

## Verify Steps

Run offline native observer against unchanged verified full69normal+69ASanUBSan SAL/CPPU objects;compare identical successful streams and no sanitizer errors. Replay all eight formats,precision sentinels/clamps/negative places,IEEE specials/signedzero/subnormal/max/carry/tie/exact integer boundaries,valid repeating grouping including zero group separator,Unicode decimal/group units and erase modes. Verify actual replace versus insert output/terminator/capacity/relative identity and old data release with valid real buffers. Entire changed formatter and math C owner raw100 S/B/F/L with related SAL native float and legacy scalar/parser tests;wholeCalc100. Run typecheck/build/static,changed-path prettier/eslint,docs/size/tree/dependencies/provenance,shared+Calc inventories,ap doctor,routing. Full regression cadence30,not25.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert only this task implementation commit and task-owned registry/test changes. Preserve unrelated tasks and user changes. Do not reset branch or merge.

## Findings
