---
id: "202610140434-C59ZJG"
title: "Implement shared configuration types and localized setting nodes"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 11
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-14T04:35:11.214Z"
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
    body: "Start: implement original shared configuration type and localized-node contracts over actual Any/UnoType/Node owners, with source-backed tests and strict affected coverage; goal approval applies."
events:
  -
    type: "status"
    at: "2026-10-14T04:35:28.063Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implement original shared configuration type and localized-node contracts over actual Any/UnoType/Node owners, with source-backed tests and strict affected coverage; goal approval applies."
doc_version: 3
doc_updated_at: "2026-10-14T04:35:28.063Z"
doc_updated_by: "CODER"
description: "Task106: unblock real Calc configuration loading by implementing original configmgr type classification/mapping plus LocalizedPropertyNode and LocalizedValueNode, reusing actual existing CPPU Any/UnoType and Node/NodeMap. No fake type/configuration provider or lifetime library. Source-backed tests, complete affected owner raw100, Calc/static/Calc0UI and16gates; no full office before111."
sections:
  Summary: "Task106 implements actual shared configmgr Type classification/mapping and LocalizedPropertyNode/LocalizedValueNode to unblock original Calc configuration defaults. Reuse real CPPU Any/UnoType, Node/NodeMap and SAL values; no fake backend/provider or memory library."
  Scope: "Three new runtime files configmgr/source/type.ts, localizedpropertynode.ts, localizedvaluenode.ts; two tests; six shared runtime/provenance records; one shared capability; Calc core/GC docs; two existing module-boundary files for exact configmgr->udkapi dependency from original TypeClass include and rejection tests. Sixteen non-task paths planned. Existing CPPU/Node/SAL implementations unchanged. Native qualifiers/private-copy/ABI/assertion/lifetime machinery excluded, ordinary JS node refs. Actual Property/Set/Data/XML/backend/default/Calc document/grid/ODS integration pending."
  Plan: "Port complete original type.hxx/type.cxx enum/list/element/mapType/getDynamicType using existing actual UnoType/Any/IDL TypeClass. Preserve unsigned assignability-based classification, exact sequence-name whitelist and real RuntimeException release fallback. Port complete initialized LocalizedPropertyNode and LocalizedValueNode metadata/member/value/modified/clone logical bodies, independent actual Any copies, stable value pointer, self-value skip and base-copy description omission. Native copy syntax/qualifiers erased explicitly, no fake Any/type/config provider or refcount/staticize/no-op lifetime layer. Add exact original configmgr->udkapi edge; keep reverse/application/browser edges forbidden. Source-backed actual-owner tests and existing Any/UnoType/tree/SortedVector tests, no C++ generator/new native/sanitizer run. Whole Calc/raw100 complete eleven-owner profile, source-absent static/Calc0UI/four link restoration and16gates/exact hashes/separate same-agent evaluator/DONE/clean. Firstfull101 passed, pause after nextfull111 and relevant repairs; no Writer-only repair."
  Verify Steps: |-
    1. Review pinned complete type/localizedproperty/localizedvalue declarations/bodies and actual reused CPPU contracts. Source-backed tests cover17enumvalues, list/element allbranches, all15mappedtype shapes/borrowed cache identity, realAny numeric/unsigned extractability and8sequence names plus unsupported names/classes, release exceptions; actual localized nodes defaults/staticType/nillable/metadata/deepclone/description drop/templates/Any copy and stable pointer/user-modified/self-set behavior. No fake subtype/provider or private-state forcing; native ABI/private-access/qualifier/debug/lifetime/fullQA/compiled differential excluded.
    2. Whole source-absent Calc coverage plus complete3new+5existingtree+SortedVector+Any+UnoType owner profile with new and genuine existing tests, rawS/B/F/L100 and allrawcounterspositive. Actual static/Calc0UI, four links absent and exact restoration. Unchanged remaining SAL/cppu dependencies reused without modified-owner claims; Writer-only repairs/full office before111 excluded.
    3. All16 repository gates, exact configmgr->udkapi edge and reverse/browser/application restrictions, current intentional formatting and truthful runtime/provenance/capability/GC records. No source/threshold weakening. Retain failures before bounded corrections. Record any newly discovered suspected behavior while preserving upstream.
    4. Exact3357 baseline/current/committed hashes and only16plannedpaths; actual source/gate/coverage manifests bound to source commit. Separate same-agent evaluator is not independent review. APverify/DONE/clean branchcalc; goalactive until requested full111/repairs pause.
  Verification: "Pending actual implementation and current checks."
  Rollback Plan: "Restore four exact source links in finally on every test exit. Revert only intentional task changes through a new task if needed; no branch merge/history rewrite/unrelated work changes."
  Findings: "TypeClass is the actual UDKAPI generated IDL owner already reused by CPPU, so the original configmgr include requires an exact configmgr->udkapi dependency edge, planned upfront. LocalizedValueNode defaulted copy preserves modified and copies Any while base Node copy omits descriptions (existing CALC-090). Native modified flag is set by both getValuePtr and setValue, including self-value set; value_ itself remains stable. Native external configuration backend/PropertyNode provider is not fabricated."
id_source: "generated"
---
## Summary

Task106 implements actual shared configmgr Type classification/mapping and LocalizedPropertyNode/LocalizedValueNode to unblock original Calc configuration defaults. Reuse real CPPU Any/UnoType, Node/NodeMap and SAL values; no fake backend/provider or memory library.

## Scope

Three new runtime files configmgr/source/type.ts, localizedpropertynode.ts, localizedvaluenode.ts; two tests; six shared runtime/provenance records; one shared capability; Calc core/GC docs; two existing module-boundary files for exact configmgr->udkapi dependency from original TypeClass include and rejection tests. Sixteen non-task paths planned. Existing CPPU/Node/SAL implementations unchanged. Native qualifiers/private-copy/ABI/assertion/lifetime machinery excluded, ordinary JS node refs. Actual Property/Set/Data/XML/backend/default/Calc document/grid/ODS integration pending.

## Plan

Port complete original type.hxx/type.cxx enum/list/element/mapType/getDynamicType using existing actual UnoType/Any/IDL TypeClass. Preserve unsigned assignability-based classification, exact sequence-name whitelist and real RuntimeException release fallback. Port complete initialized LocalizedPropertyNode and LocalizedValueNode metadata/member/value/modified/clone logical bodies, independent actual Any copies, stable value pointer, self-value skip and base-copy description omission. Native copy syntax/qualifiers erased explicitly, no fake Any/type/config provider or refcount/staticize/no-op lifetime layer. Add exact original configmgr->udkapi edge; keep reverse/application/browser edges forbidden. Source-backed actual-owner tests and existing Any/UnoType/tree/SortedVector tests, no C++ generator/new native/sanitizer run. Whole Calc/raw100 complete eleven-owner profile, source-absent static/Calc0UI/four link restoration and16gates/exact hashes/separate same-agent evaluator/DONE/clean. Firstfull101 passed, pause after nextfull111 and relevant repairs; no Writer-only repair.

## Verify Steps

1. Review pinned complete type/localizedproperty/localizedvalue declarations/bodies and actual reused CPPU contracts. Source-backed tests cover17enumvalues, list/element allbranches, all15mappedtype shapes/borrowed cache identity, realAny numeric/unsigned extractability and8sequence names plus unsupported names/classes, release exceptions; actual localized nodes defaults/staticType/nillable/metadata/deepclone/description drop/templates/Any copy and stable pointer/user-modified/self-set behavior. No fake subtype/provider or private-state forcing; native ABI/private-access/qualifier/debug/lifetime/fullQA/compiled differential excluded.
2. Whole source-absent Calc coverage plus complete3new+5existingtree+SortedVector+Any+UnoType owner profile with new and genuine existing tests, rawS/B/F/L100 and allrawcounterspositive. Actual static/Calc0UI, four links absent and exact restoration. Unchanged remaining SAL/cppu dependencies reused without modified-owner claims; Writer-only repairs/full office before111 excluded.
3. All16 repository gates, exact configmgr->udkapi edge and reverse/browser/application restrictions, current intentional formatting and truthful runtime/provenance/capability/GC records. No source/threshold weakening. Retain failures before bounded corrections. Record any newly discovered suspected behavior while preserving upstream.
4. Exact3357 baseline/current/committed hashes and only16plannedpaths; actual source/gate/coverage manifests bound to source commit. Separate same-agent evaluator is not independent review. APverify/DONE/clean branchcalc; goalactive until requested full111/repairs pause.

## Verification

Pending actual implementation and current checks.

## Rollback Plan

Restore four exact source links in finally on every test exit. Revert only intentional task changes through a new task if needed; no branch merge/history rewrite/unrelated work changes.

## Findings

TypeClass is the actual UDKAPI generated IDL owner already reused by CPPU, so the original configmgr include requires an exact configmgr->udkapi dependency edge, planned upfront. LocalizedValueNode defaulted copy preserves modified and copies Any while base Node copy omits descriptions (existing CALC-090). Native modified flag is set by both getValuePtr and setValue, including self-value set; value_ itself remains stable. Native external configuration backend/PropertyNode provider is not fabricated.
