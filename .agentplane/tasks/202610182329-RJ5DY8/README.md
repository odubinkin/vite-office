---
id: "202610182329-RJ5DY8"
title: "Implement original mutable Unicode string buffer ownership and mutations"
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
  - "WholeCalc raw100percent;entire new buffer template/C scopes raw100percent with real native source vectors,growth/identity/ref/transfer and checked mutation boundaries,related unchanged SAL ownership/float tests. Native original buffer observations under normal+ASanUBSan linked against prior verified full genuine offline SAL graph. Types/build/static/style/docs/dependency/provenance/scopedinventories/doctor/routing. Nextfull30."
plan_approval:
  state: "approved"
  updated_at: "2026-10-18T23:31:57.988Z"
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
    body: "Start:implement real native Unicode buffer ownership/mutation primitives and verify original capacity/transfer contracts before building OUStringBuffer/axis output."
events:
  -
    type: "status"
    at: "2026-10-18T23:31:58.771Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start:implement real native Unicode buffer ownership/mutation primitives and verify original capacity/transfer contracts before building OUStringBuffer/axis output."
doc_version: 3
doc_updated_at: "2026-10-18T23:31:58.771Z"
doc_updated_by: "CODER"
description: "Task24 of approved Calc UI/core goal:port genuine SAL Unicode buffer C/header/template responsibilities required by OUStringBuffer and VariationsToString. Preserve native constructor/copy capacity,growth based on length,checked mutation order,tail moves,UTF16/ASCII copy,null source,reserve/remove,ref return and makeStringAndClear transfer on actual existing rtl_uString allocator/refcount owners. No JS string-builder substitute or fake buffer. Only calc checkout/branch,offline,no merge."
sections:
  Summary: |-
    Implement original mutable Unicode string buffer ownership and mutations

    Task24 of approved Calc UI/core goal:port genuine SAL Unicode buffer C/header/template responsibilities required by OUStringBuffer and VariationsToString. Preserve native constructor/copy capacity,growth based on length,checked mutation order,tail moves,UTF16/ASCII copy,null source,reserve/remove,ref return and makeStringAndClear transfer on actual existing rtl_uString allocator/refcount owners. No JS string-builder substitute or fake buffer. Only calc checkout/branch,offline,no merge.
  Scope: |-
    - In scope: Task24 of approved Calc UI/core goal:port genuine SAL Unicode buffer C/header/template responsibilities required by OUStringBuffer and VariationsToString. Preserve native constructor/copy capacity,growth based on length,checked mutation order,tail moves,UTF16/ASCII copy,null source,reserve/remove,ref return and makeStringAndClear transfer on actual existing rtl_uString allocator/refcount owners. No JS string-builder substitute or fake buffer. Only calc checkout/branch,offline,no merge.
    - Out of scope: unrelated refactors not required for "Implement original mutable Unicode string buffer ownership and mutations".
  Plan: "CODER ports actual mutable Unicode stringbuffer template functions and C/header boundary on existing rtl_uString allocation/refcount owners:source/copy constructors,length-based capacity growth,UTF16/ASCII insertion,remove,refReturn and makeStringAndClear transfer/reset. Preserve assertion order,no minimum-capacity assertion absent upstream,no invented zero-fill/COW. Keep source responsibility split if original392line template owner would exceed500. Up to22non-task paths:new template/C/header and their owner records,canonical template reexports/records,native caller/fixture,new tests and Calc prerequisite docs. Observe genuine unchanged original normal+ASanUBSan buffers by linking prior task23 verified full SAL/CPPU objects,verify source/config/header/object hashes and original compile-success graph;no unnecessary rebuild of unchanged69object graphs,no stubs/network. Native vectors compare logical initialized units,capacity,refs and identity plus transfer/reuse and original checked assertions/overflow. WholeCalc100percent andentire new scope100percent plus related existing ownership/float tests anddeclaredgates. No class/pool/UI placeholder. Existinggoalapproval applies;nextfull30."
  Verify Steps: "Native C buffer observation caller links genuine verified prior task23 normal+ASanUBSan69object graphs after pin/source/config/object checks;both streams identical,exit0,nosanitizer diagnostics. Compare source/copy constructors,logicalUTF16+terminator,capacitygrowth based on length,negative reserve noop,UTF16/ASCII tail moves,known-length embeddedzeros,null-source insertion preserving initialized gaps,remove clamp/noop,ref acquire/release,makeStringAndClear identity/ref transfer/reset/reuse,null-held transfer. Original checked assertions and insert overflow before allocation are separate observations. App source replay and targeted boundary/ownership tests achieve raw100percent entire new C/template scopes;original SAL ownership/integer/float tests unchanged and pass. WholeCalc raw100percent S/B/F/L. Types/build/static/style/docs/size/tree/dependency/provenance,shared+Calc inventories,doctor/routing;nofull/E2Ecadence before30."
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert only task24 native buffer responsibilities,C/header/template additions and actual source/test/registry/docs artifacts. Preserve existing mutable allocation owners and all scalar formatting/UI/core source. No resets or merges."
  Findings: ""
id_source: "generated"
---
## Summary

Implement original mutable Unicode string buffer ownership and mutations

Task24 of approved Calc UI/core goal:port genuine SAL Unicode buffer C/header/template responsibilities required by OUStringBuffer and VariationsToString. Preserve native constructor/copy capacity,growth based on length,checked mutation order,tail moves,UTF16/ASCII copy,null source,reserve/remove,ref return and makeStringAndClear transfer on actual existing rtl_uString allocator/refcount owners. No JS string-builder substitute or fake buffer. Only calc checkout/branch,offline,no merge.

## Scope

- In scope: Task24 of approved Calc UI/core goal:port genuine SAL Unicode buffer C/header/template responsibilities required by OUStringBuffer and VariationsToString. Preserve native constructor/copy capacity,growth based on length,checked mutation order,tail moves,UTF16/ASCII copy,null source,reserve/remove,ref return and makeStringAndClear transfer on actual existing rtl_uString allocator/refcount owners. No JS string-builder substitute or fake buffer. Only calc checkout/branch,offline,no merge.
- Out of scope: unrelated refactors not required for "Implement original mutable Unicode string buffer ownership and mutations".

## Plan

CODER ports actual mutable Unicode stringbuffer template functions and C/header boundary on existing rtl_uString allocation/refcount owners:source/copy constructors,length-based capacity growth,UTF16/ASCII insertion,remove,refReturn and makeStringAndClear transfer/reset. Preserve assertion order,no minimum-capacity assertion absent upstream,no invented zero-fill/COW. Keep source responsibility split if original392line template owner would exceed500. Up to22non-task paths:new template/C/header and their owner records,canonical template reexports/records,native caller/fixture,new tests and Calc prerequisite docs. Observe genuine unchanged original normal+ASanUBSan buffers by linking prior task23 verified full SAL/CPPU objects,verify source/config/header/object hashes and original compile-success graph;no unnecessary rebuild of unchanged69object graphs,no stubs/network. Native vectors compare logical initialized units,capacity,refs and identity plus transfer/reuse and original checked assertions/overflow. WholeCalc100percent andentire new scope100percent plus related existing ownership/float tests anddeclaredgates. No class/pool/UI placeholder. Existinggoalapproval applies;nextfull30.

## Verify Steps

Native C buffer observation caller links genuine verified prior task23 normal+ASanUBSan69object graphs after pin/source/config/object checks;both streams identical,exit0,nosanitizer diagnostics. Compare source/copy constructors,logicalUTF16+terminator,capacitygrowth based on length,negative reserve noop,UTF16/ASCII tail moves,known-length embeddedzeros,null-source insertion preserving initialized gaps,remove clamp/noop,ref acquire/release,makeStringAndClear identity/ref transfer/reset/reuse,null-held transfer. Original checked assertions and insert overflow before allocation are separate observations. App source replay and targeted boundary/ownership tests achieve raw100percent entire new C/template scopes;original SAL ownership/integer/float tests unchanged and pass. WholeCalc raw100percent S/B/F/L. Types/build/static/style/docs/size/tree/dependency/provenance,shared+Calc inventories,doctor/routing;nofull/E2Ecadence before30.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert only task24 native buffer responsibilities,C/header/template additions and actual source/test/registry/docs artifacts. Preserve existing mutable allocation owners and all scalar formatting/UI/core source. No resets or merges.

## Findings
