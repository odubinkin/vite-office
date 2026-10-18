---
id: "202610182309-6AHF5X"
title: "Port native VCL variation parsing and exact UTF16 view dependencies"
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
  - "WholeCalc raw100percent S/B/F/L;entire new VCL value/parser and changed shared helper scopes raw100percent,source-pinned malformed/valid numeric and tag vectors,related native RTL/o3tl tests. Types/build/dependency/docs/size/tree/provenance/shared+Calc inventories,doctor/routing,touchedstyle. No full suite beforecadence30."
plan_approval:
  state: "approved"
  updated_at: "2026-10-18T23:10:24.325Z"
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
    body: "Start:port actual VCL axis parser and native UTF16 helpers as the missing font-variation pool prerequisite,without fake pool defaults or output formatting."
events:
  -
    type: "status"
    at: "2026-10-18T23:10:25.098Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start:port actual VCL axis parser and native UTF16 helpers as the missing font-variation pool prerequisite,without fake pool defaults or output formatting."
doc_version: 3
doc_updated_at: "2026-10-18T23:10:25.098Z"
doc_updated_by: "CODER"
description: "Task22 of approved Calc UI/core goal:implement actual VCL Variation value and VariationsFromString for missing SvxFontVariationsItem/EditEngine package dependency. Reuse native RTL decimal lexer and o3tl UTF16 whitespace/view helpers;native quoted4byte alphanumeric/space tags,binary32 values,invalid-token handling,order/duplicates and defaults. No fake pool or formatting slot. Only calc checkout/branch;no network/merge. Serialization awaits actual RTL float formatter rather than guessed JS formatting."
sections:
  Summary: |-
    Port native VCL variation parsing and exact UTF16 view dependencies

    Task22 of approved Calc UI/core goal:implement actual VCL Variation value and VariationsFromString for missing SvxFontVariationsItem/EditEngine package dependency. Reuse native RTL decimal lexer and o3tl UTF16 whitespace/view helpers;native quoted4byte alphanumeric/space tags,binary32 values,invalid-token handling,order/duplicates and defaults. No fake pool or formatting slot. Only calc checkout/branch;no network/merge. Serialization awaits actual RTL float formatter rather than guessed JS formatting.
  Scope: |-
    - In scope: Task22 of approved Calc UI/core goal:implement actual VCL Variation value and VariationsFromString for missing SvxFontVariationsItem/EditEngine package dependency. Reuse native RTL decimal lexer and o3tl UTF16 whitespace/view helpers;native quoted4byte alphanumeric/space tags,binary32 values,invalid-token handling,order/duplicates and defaults. No fake pool or formatting slot. Only calc checkout/branch;no network/merge. Serialization awaits actual RTL float formatter rather than guessed JS formatting.
    - Out of scope: unrelated refactors not required for "Port native VCL variation parsing and exact UTF16 view dependencies".
  Plan: "Implement native VCL Variation aggregate values and complete VariationsFromString with original getToken/trim/toDouble UTF16 helpers and inline OpenType tag packing. Reuse real RTL lexer,not parseFloat/JS trim;binary32 via platform binding Math.fround. Preserve original min length,quotes,4ASCII letters/digits/spaces,missing-value rejection,invalid-number-to0 behavior,duplicates and order. Correct source getToken size_t assertion/npos boundary via borrowed subarrays. Expose canonical native header paths,update honest runtime/provenance records and dependency audit docs. Up to18non-task paths:new VCL source/header/test,Feature inline header,o3tl source/tests,actual owner registry records and Calc prerequisite documentation. Source-backed independent cases and raw100percent new/changed scopes,relatedRTL/o3tl,wholeCalc100percent anddeclaredgates. Missing VariationsToString awaits actual RTL float-format owner;no serialization placeholder,full Variation item/pool/slots not claimed. Existinggoalapproval applies,no network/merge;nextfull30."
  Verify Steps: "npm run test:coverage:calc raw100percent S/B/F/L. Scope coverage raw100percent for new VCL Variation/parser,inline Feature packing and changed o3tl string_view,with real source references and meaningful borrowed-view/token-position/whitespace/RTL parsing vectors. Include native SAL math/strtmpl and o3tl existing tests;preserve assertions and fixtures. Verify malformed/valid tags,duplicates/order,no mandatory space beyond source minimum,non-ASCII rejection,Unicode whitespace source differences,partial/malformed/special numeric input,binary32 rounding/overflow/signedzero and value copy/equality semantics. npm run typecheck/build/check:dependencies/check:docs/check:file-size/check:source-tree/check:source-provenance,shared/Calc scopedinventory,touchedPrettier/eslint,ap doctor androuting. NoUI behavior changed;no new full/E2E suite at task22. Fullcadence30."
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert only task22 native variation parsing/value and UTF16 helper additions with their own tests,registry and prerequisite documentation. Preserve existing formatting UI/menu/core owners and original integer/whitespace APIs. No branch resets or merges."
  Findings: ""
id_source: "generated"
---
## Summary

Port native VCL variation parsing and exact UTF16 view dependencies

Task22 of approved Calc UI/core goal:implement actual VCL Variation value and VariationsFromString for missing SvxFontVariationsItem/EditEngine package dependency. Reuse native RTL decimal lexer and o3tl UTF16 whitespace/view helpers;native quoted4byte alphanumeric/space tags,binary32 values,invalid-token handling,order/duplicates and defaults. No fake pool or formatting slot. Only calc checkout/branch;no network/merge. Serialization awaits actual RTL float formatter rather than guessed JS formatting.

## Scope

- In scope: Task22 of approved Calc UI/core goal:implement actual VCL Variation value and VariationsFromString for missing SvxFontVariationsItem/EditEngine package dependency. Reuse native RTL decimal lexer and o3tl UTF16 whitespace/view helpers;native quoted4byte alphanumeric/space tags,binary32 values,invalid-token handling,order/duplicates and defaults. No fake pool or formatting slot. Only calc checkout/branch;no network/merge. Serialization awaits actual RTL float formatter rather than guessed JS formatting.
- Out of scope: unrelated refactors not required for "Port native VCL variation parsing and exact UTF16 view dependencies".

## Plan

Implement native VCL Variation aggregate values and complete VariationsFromString with original getToken/trim/toDouble UTF16 helpers and inline OpenType tag packing. Reuse real RTL lexer,not parseFloat/JS trim;binary32 via platform binding Math.fround. Preserve original min length,quotes,4ASCII letters/digits/spaces,missing-value rejection,invalid-number-to0 behavior,duplicates and order. Correct source getToken size_t assertion/npos boundary via borrowed subarrays. Expose canonical native header paths,update honest runtime/provenance records and dependency audit docs. Up to18non-task paths:new VCL source/header/test,Feature inline header,o3tl source/tests,actual owner registry records and Calc prerequisite documentation. Source-backed independent cases and raw100percent new/changed scopes,relatedRTL/o3tl,wholeCalc100percent anddeclaredgates. Missing VariationsToString awaits actual RTL float-format owner;no serialization placeholder,full Variation item/pool/slots not claimed. Existinggoalapproval applies,no network/merge;nextfull30.

## Verify Steps

npm run test:coverage:calc raw100percent S/B/F/L. Scope coverage raw100percent for new VCL Variation/parser,inline Feature packing and changed o3tl string_view,with real source references and meaningful borrowed-view/token-position/whitespace/RTL parsing vectors. Include native SAL math/strtmpl and o3tl existing tests;preserve assertions and fixtures. Verify malformed/valid tags,duplicates/order,no mandatory space beyond source minimum,non-ASCII rejection,Unicode whitespace source differences,partial/malformed/special numeric input,binary32 rounding/overflow/signedzero and value copy/equality semantics. npm run typecheck/build/check:dependencies/check:docs/check:file-size/check:source-tree/check:source-provenance,shared/Calc scopedinventory,touchedPrettier/eslint,ap doctor androuting. NoUI behavior changed;no new full/E2E suite at task22. Fullcadence30.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert only task22 native variation parsing/value and UTF16 helper additions with their own tests,registry and prerequisite documentation. Preserve existing formatting UI/menu/core owners and original integer/whitespace APIs. No branch resets or merges.

## Findings
