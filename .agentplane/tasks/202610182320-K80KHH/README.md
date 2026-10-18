---
id: "202610182320-K80KHH"
title: "Implement native RTL float output for VCL axis serialization"
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
  - "WholeCalc raw100percent S/B/F/L;new/changed RTL float formatter scope100percent plus existing Automatic/Max and integer/parse tests. Native compiled full original differential normal+ASan/UBSan with edge/exponent/mantissa/random binary32 buffer observations and original null assertion. Types/build/static/style/docs/dependency/provenance/inventories/doctor/routing. No full application regression beforecadence30."
plan_approval:
  state: "approved"
  updated_at: "2026-10-18T23:21:06.792Z"
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
    body: "Start:implement exact native float output primitive and compare full genuine native caller buffers under normal and sanitized execution before connecting VCL serialization."
events:
  -
    type: "status"
    at: "2026-10-18T23:21:07.601Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start:implement exact native float output primitive and compare full genuine native caller buffers under normal and sanitized execution before connecting VCL serialization."
doc_version: 3
doc_updated_at: "2026-10-18T23:21:07.601Z"
doc_updated_by: "CODER"
description: "Task23 of approved Calc UI/core goal:port original rtl_ustr_valueOfFloat/valueOfFP bound G7/no-group/erase float contract and macro/header ownership,without altering existing Automatic/Max output. Compare complete caller buffer writes against genuine full pinned SAL/CPPU under normal and ASan/UBSan using cached verified native dependencies. This is required by native VariationsToString and the actual missing font-variation item/pool. No approximate formatter,UI placeholder,network or merge;only calc checkout/branch."
sections:
  Summary: |-
    Implement native RTL float output for VCL axis serialization

    Task23 of approved Calc UI/core goal:port original rtl_ustr_valueOfFloat/valueOfFP bound G7/no-group/erase float contract and macro/header ownership,without altering existing Automatic/Max output. Compare complete caller buffer writes against genuine full pinned SAL/CPPU under normal and ASan/UBSan using cached verified native dependencies. This is required by native VariationsToString and the actual missing font-variation item/pool. No approximate formatter,UI placeholder,network or merge;only calc checkout/branch.
  Scope: |-
    - In scope: Task23 of approved Calc UI/core goal:port original rtl_ustr_valueOfFloat/valueOfFP bound G7/no-group/erase float contract and macro/header ownership,without altering existing Automatic/Max output. Compare complete caller buffer writes against genuine full pinned SAL/CPPU under normal and ASan/UBSan using cached verified native dependencies. This is required by native VariationsToString and the actual missing font-variation item/pool. No approximate formatter,UI placeholder,network or merge;only calc checkout/branch.
    - Out of scope: unrelated refactors not required for "Implement native RTL float output for VCL axis serialization".
  Plan: "CODER ports original Unicode C rtl_ustr_valueOfFloat plus source valueOfFP float/maxLen15 specialization:period,no-group,G7,erase trailing zeros,three-digit exponents,signbit/NaN/INF and original null assertion. Preserve existing Automatic/Max formatter function body and integer formatting. Host shortest binary64 decimal replaces Dragonbox as already represented;native integer significand rounding and pre-round G/E/F selection retain source order. Build genuine full pinned SAL/CPPU twice(normal andASan/UBSan) through existing offline cached dependency infrastructure;capture complete macro-sized caller buffers for binary32 exponent/mantissa/boundary/random inputs and original assertion,store compact native fixture and compare exact bytes. Up to22non-task paths:5existing RTL source/header owners,their10registry records,new probe/fixture/test and Calc prerequisite docs. No network,unrelated source replacements,new formatter options,UI defaults/slots or VCL serializer before primitiveverified. WholeCalc100percent,affected/newscope100percent anddeclaredgates;nextfull30. Existingusergoalapprovalapplies."
  Verify Steps: "Native probe --write with genuine full original normal+ASan/UBSan builds and verified offline dependencies:both complete buffer streams identical,exit0,no sanitizer diagnoses;original null output assertion aborts with original expression. Replay full source-pinned native fixtures through original public C/header/macro owners;edge powers/exponents,mantissa edges,rounding/notation boundaries,random binary32,NaNs/INF/signedzero,sentinels/terminators verified. Existing Automatic/Max and integer/RTL parsing tests remain unchanged and pass. Scoped raw100percent for changed strtmpl.math module including oldAutomatic/newG7 responsibility;wholeCalc raw100percent S/B/F/L. Types/build/static,touchedPrettier/eslint,dependency/docs/size/tree/provenance,shared+Calc scopedinventory,ap doctor/routing. Full application/e2e cadence not due(task30)."
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert only task23 float C/template/header/macro additions,native observation caller/fixture/test,owner records and prerequisite docs. Retain prior integer/Automatic formatter bodies and VCL parser/UI/core tasks. No resets,merges or outside checkout actions."
  Findings: ""
id_source: "generated"
---
## Summary

Implement native RTL float output for VCL axis serialization

Task23 of approved Calc UI/core goal:port original rtl_ustr_valueOfFloat/valueOfFP bound G7/no-group/erase float contract and macro/header ownership,without altering existing Automatic/Max output. Compare complete caller buffer writes against genuine full pinned SAL/CPPU under normal and ASan/UBSan using cached verified native dependencies. This is required by native VariationsToString and the actual missing font-variation item/pool. No approximate formatter,UI placeholder,network or merge;only calc checkout/branch.

## Scope

- In scope: Task23 of approved Calc UI/core goal:port original rtl_ustr_valueOfFloat/valueOfFP bound G7/no-group/erase float contract and macro/header ownership,without altering existing Automatic/Max output. Compare complete caller buffer writes against genuine full pinned SAL/CPPU under normal and ASan/UBSan using cached verified native dependencies. This is required by native VariationsToString and the actual missing font-variation item/pool. No approximate formatter,UI placeholder,network or merge;only calc checkout/branch.
- Out of scope: unrelated refactors not required for "Implement native RTL float output for VCL axis serialization".

## Plan

CODER ports original Unicode C rtl_ustr_valueOfFloat plus source valueOfFP float/maxLen15 specialization:period,no-group,G7,erase trailing zeros,three-digit exponents,signbit/NaN/INF and original null assertion. Preserve existing Automatic/Max formatter function body and integer formatting. Host shortest binary64 decimal replaces Dragonbox as already represented;native integer significand rounding and pre-round G/E/F selection retain source order. Build genuine full pinned SAL/CPPU twice(normal andASan/UBSan) through existing offline cached dependency infrastructure;capture complete macro-sized caller buffers for binary32 exponent/mantissa/boundary/random inputs and original assertion,store compact native fixture and compare exact bytes. Up to22non-task paths:5existing RTL source/header owners,their10registry records,new probe/fixture/test and Calc prerequisite docs. No network,unrelated source replacements,new formatter options,UI defaults/slots or VCL serializer before primitiveverified. WholeCalc100percent,affected/newscope100percent anddeclaredgates;nextfull30. Existingusergoalapprovalapplies.

## Verify Steps

Native probe --write with genuine full original normal+ASan/UBSan builds and verified offline dependencies:both complete buffer streams identical,exit0,no sanitizer diagnoses;original null output assertion aborts with original expression. Replay full source-pinned native fixtures through original public C/header/macro owners;edge powers/exponents,mantissa edges,rounding/notation boundaries,random binary32,NaNs/INF/signedzero,sentinels/terminators verified. Existing Automatic/Max and integer/RTL parsing tests remain unchanged and pass. Scoped raw100percent for changed strtmpl.math module including oldAutomatic/newG7 responsibility;wholeCalc raw100percent S/B/F/L. Types/build/static,touchedPrettier/eslint,dependency/docs/size/tree/provenance,shared+Calc scopedinventory,ap doctor/routing. Full application/e2e cadence not due(task30).

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert only task23 float C/template/header/macro additions,native observation caller/fixture/test,owner records and prerequisite docs. Retain prior integer/Automatic formatter bodies and VCL parser/UI/core tasks. No resets,merges or outside checkout actions.

## Findings
