---
id: "202610190012-CMHQFZ"
title: "Implement native OUStringBuffer ownership and construction contracts"
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
  - "Genuine full source-linked normal+ASanUBSan OUStringBuffer observations,checked assertions and bounded length/overflow conditions;entire new buffer/stringutils and touched OUString/macro scopes raw100 S/B/F/L plus related SAL;wholeCalc raw100. Types/build/static/style/docs/size/tree/dependencies/provenance/scopedinventories/doctor/routing. Next full regression30."
plan_approval:
  state: "approved"
  updated_at: "2026-10-19T00:12:45.111Z"
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
    body: "Start:implement real OUStringBuffer lifetime/construction/mutation bindings over actual C ownership and verify genuine initialized native states."
events:
  -
    type: "status"
    at: "2026-10-19T00:12:46.280Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start:implement real OUStringBuffer lifetime/construction/mutation bindings over actual C ownership and verify genuine initialized native states."
doc_version: 3
doc_updated_at: "2026-10-19T00:12:46.280Z"
doc_updated_by: "CODER"
description: "Task26 of approved Calc goal:port actual OUStringBuffer fundamental constructors/copy/move assignment/lifetime,capacity and borrowed access,known-length UTF16/ASCII literal/concat/number append and insert,native float/double/integer type bindings,mutation/truncate,copy and ownership transfer. Reuse genuine SAL buffers,OUString,StringConcat and numeric C owners. Add actual stringutils length/const-literal helpers and reuse literal guard in OUString;native double macro25. VCL tag encoding/serializer remains pending actual text conversion dependency. Only calc branch/checkout,offline,no merge."
sections:
  Summary: |-
    Implement native OUStringBuffer ownership and construction contracts

    Task26 of approved Calc goal:port actual OUStringBuffer fundamental constructors/copy/move assignment/lifetime,capacity and borrowed access,known-length UTF16/ASCII literal/concat/number append and insert,native float/double/integer type bindings,mutation/truncate,copy and ownership transfer. Reuse genuine SAL buffers,OUString,StringConcat and numeric C owners. Add actual stringutils length/const-literal helpers and reuse literal guard in OUString;native double macro25. VCL tag encoding/serializer remains pending actual text conversion dependency. Only calc branch/checkout,offline,no merge.
  Scope: |-
    - In scope: Task26 of approved Calc goal:port actual OUStringBuffer fundamental constructors/copy/move assignment/lifetime,capacity and borrowed access,known-length UTF16/ASCII literal/concat/number append and insert,native float/double/integer type bindings,mutation/truncate,copy and ownership transfer. Reuse genuine SAL buffers,OUString,StringConcat and numeric C owners. Add actual stringutils length/const-literal helpers and reuse literal guard in OUString;native double macro25. VCL tag encoding/serializer remains pending actual text conversion dependency. Only calc branch/checkout,offline,no merge.
    - Out of scope: unrelated refactors not required for "Implement native OUStringBuffer ownership and construction contracts".
  Plan: "Implement original fundamental OUStringBuffer responsibilities in canonical sal/inc/rtl/ustrbuf.ts over existing C/header/string/math owners. Preserve constructor capacities16/count+16/copy,copy versus transfer and actual address/refs,view/literal/concat/number overload dispatch,source checked UTF16 lengths,borrowed pointers,no-copy makeStringAndClear and explicit destructor. JS-erased float/int/char overloads use named type bindings;number append is native double. Include native length/literal helpers in stringutils,reuse OUString literal predicate,macroDouble25. Cover initialized setLength behavior without inventing zero fill or reading native uninitialized storage. True concat overflow uses repeated borrowed views over bounded real backing allocation,not fake providers. Genuine normal+ASanUBSan full cached SAL/CPPU graphs and assertions,entire changed modules raw100 plus wholeCalc100 and declared gates. Up to22non-task paths. No network/merge/UI fake providers;axis serializer awaits actual source encoding path. Existing broad user approval applies;nextfull30."
  Verify Steps: "Execute unchanged original OUStringBuffer headers and genuine full69normal+69ASanUBSan SAL/CPPU object graphs offline after pin/source/config/object hashes. Compare actual capacities,initialized logical units/terminator,refs,copy/borrow/transfer identity across constructors,assignment,self copy/move,reserve,known-length embeddedzero/surrogates,literals,concat/number,float/double/int/UTF32 insertion/removal/truncate,mutable access and destructor. Preserve source setLength writes;never treat uninitialized spare memory as zero-filled native output. Capture original assertions separately;check genuine length bounds and concat overflow before writes using real bounded allocation/repeated valid borrowed views. Entire new buffer/stringutils,touched OUString/macros raw100 S/B/F/L with related SAL/SVL source observations;wholeCalc100. Types/build/static/changedstyle/docs/size/tree/dependencies/provenance/shared+Calc inventories/doctor/routing. Full regression cadence30."
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert only task-owned implementation/registry/test commit;preserve unrelated tasks,user data,branch and checkout. No reset or merge."
  Findings: ""
id_source: "generated"
---
## Summary

Implement native OUStringBuffer ownership and construction contracts

Task26 of approved Calc goal:port actual OUStringBuffer fundamental constructors/copy/move assignment/lifetime,capacity and borrowed access,known-length UTF16/ASCII literal/concat/number append and insert,native float/double/integer type bindings,mutation/truncate,copy and ownership transfer. Reuse genuine SAL buffers,OUString,StringConcat and numeric C owners. Add actual stringutils length/const-literal helpers and reuse literal guard in OUString;native double macro25. VCL tag encoding/serializer remains pending actual text conversion dependency. Only calc branch/checkout,offline,no merge.

## Scope

- In scope: Task26 of approved Calc goal:port actual OUStringBuffer fundamental constructors/copy/move assignment/lifetime,capacity and borrowed access,known-length UTF16/ASCII literal/concat/number append and insert,native float/double/integer type bindings,mutation/truncate,copy and ownership transfer. Reuse genuine SAL buffers,OUString,StringConcat and numeric C owners. Add actual stringutils length/const-literal helpers and reuse literal guard in OUString;native double macro25. VCL tag encoding/serializer remains pending actual text conversion dependency. Only calc branch/checkout,offline,no merge.
- Out of scope: unrelated refactors not required for "Implement native OUStringBuffer ownership and construction contracts".

## Plan

Implement original fundamental OUStringBuffer responsibilities in canonical sal/inc/rtl/ustrbuf.ts over existing C/header/string/math owners. Preserve constructor capacities16/count+16/copy,copy versus transfer and actual address/refs,view/literal/concat/number overload dispatch,source checked UTF16 lengths,borrowed pointers,no-copy makeStringAndClear and explicit destructor. JS-erased float/int/char overloads use named type bindings;number append is native double. Include native length/literal helpers in stringutils,reuse OUString literal predicate,macroDouble25. Cover initialized setLength behavior without inventing zero fill or reading native uninitialized storage. True concat overflow uses repeated borrowed views over bounded real backing allocation,not fake providers. Genuine normal+ASanUBSan full cached SAL/CPPU graphs and assertions,entire changed modules raw100 plus wholeCalc100 and declared gates. Up to22non-task paths. No network/merge/UI fake providers;axis serializer awaits actual source encoding path. Existing broad user approval applies;nextfull30.

## Verify Steps

Execute unchanged original OUStringBuffer headers and genuine full69normal+69ASanUBSan SAL/CPPU object graphs offline after pin/source/config/object hashes. Compare actual capacities,initialized logical units/terminator,refs,copy/borrow/transfer identity across constructors,assignment,self copy/move,reserve,known-length embeddedzero/surrogates,literals,concat/number,float/double/int/UTF32 insertion/removal/truncate,mutable access and destructor. Preserve source setLength writes;never treat uninitialized spare memory as zero-filled native output. Capture original assertions separately;check genuine length bounds and concat overflow before writes using real bounded allocation/repeated valid borrowed views. Entire new buffer/stringutils,touched OUString/macros raw100 S/B/F/L with related SAL/SVL source observations;wholeCalc100. Types/build/static/changedstyle/docs/size/tree/dependencies/provenance/shared+Calc inventories/doctor/routing. Full regression cadence30.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert only task-owned implementation/registry/test commit;preserve unrelated tasks,user data,branch and checkout. No reset or merge.

## Findings
