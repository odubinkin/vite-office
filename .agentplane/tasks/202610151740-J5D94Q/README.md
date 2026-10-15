---
id: "202610151740-J5D94Q"
title: "Port native text-field values and polymorphic field items"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 4
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-15T17:41:45.968Z"
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
    body: "Start: implement actual polymorphic text-field values and pooled field item over shared Unicode/items, with explicit GC overload binding and source-backed tests."
events:
  -
    type: "status"
    at: "2026-10-15T17:41:52.740Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implement actual polymorphic text-field values and pooled field item over shared Unicode/items, with explicit GC overload binding and source-backed tests."
doc_version: 3
doc_updated_at: "2026-10-15T17:41:52.740Z"
doc_updated_by: "CODER"
description: "Task160: actual SvxFieldData/SvxFieldItem plus URL/page/pages/page-title/time/document-title/table value contracts over existing shared Unicode/items. Preserve dynamic clone/adoption/null/equality/hash relationships and field IDs for upcoming EditTextObject/ODS, without fake factory/provider or native ownership machinery."
sections:
  Summary: "Task160 ports genuine shared text-field values and SvxFieldItem for EditTextObject, URL content and Calc/header-footer/ODS field preservation."
  Scope: "At most100intentional non-agent paths: original editeng flditem source/header; complete OffAPI textfield Type constants; SvxFieldData, SvxFieldItem, SvxURLField/SvxURLFormat and actual SvxPageField/SvxPagesField/SvxPageTitleField/SvxTimeField/SvxFileField/SvxTableField stored values; related tests and canonical registry/inventory/docs. Reuse existing SfxPoolItem/holder/Unicode/hash/ContentInfo. Native unique_ptr constructor versus const-reference constructor is an erased overload selector only (explicit adopt=true), ordinary JS references/GC own lifetime. No pointer/refcount/cache/deletion manager, native compiler/probe/generator/sanitizer or binary type-index hash reproduction. Opaque process-specific type_index hashing binds to JS dynamic class reflection and existing SAL string hash; exact opaque native numeric values are not portable and are not document data. URL value/hash order remains exact and uses existing native integer/Unicode combine. UNO field Create/XTextContent/XPropertySet producer, actual date/time/file-system formatting and other field families, translated presentation and diagnostic XML remain absent until real dependencies exist; no no-op provider/factory or fake text engine."
  Plan: "Port original default/copy/assignment/virtual Clone/base equality/class ID and opaque type hash contracts. Implement SvxFieldItem actual independent const-field copy, explicit unique_ptr/adoption/null binding, polymorphic copied item and stable const field getter; exact pointer/null/dynamic-type/value equality and field hash delegation, no core JSON or new native factory. Implement complete URL four-string and enum storage, stable const Unicode getters/setters, default/copy/Clone, source type/payload equality and hash omissions. Port page/pages/page-title/time/file stateless value contracts and table default/int/copy/set/get/Clone/equality under native IDs. Reuse full shared item/pool/ContentInfo paths in nonempty tests; preserve suspicious source results and record them. Strict whole-owner shared/Calc100, related Writer tests, all13source gates/inventory/build/browser, native pins/exact hashes/clean calc, same-agent review/verify/commit/finish. Actual full text-engine/pool/Calc document/UI/ODS remains subsequent work."
  Verify Steps: "Pinned include/editeng/flditem.hxx and editeng/source/items/flditem.cxx plus OffAPI text/textfield/Type.idl and real EditTextObject/default-pool consumers authoritative. All17constant values UNSPECIFIED-1 through DOCINFO_CUSTOM15 exact. SvxFieldData base Clone slices to genuine empty base; release base equality always true while debug-only type diagnosis is excluded; native class identity and runtime-opaque hash contract use JS class reflection with existing SAL hash (not ABI numeric equivalence). SvxFieldItem exact copied versus adopted/null field, stable borrowed getter, independent polymorphic item copies, pointer fast path/null guards/dynamic type gate/value equality, Which-independent payload and Which-sensitive areSame, hash delegation/null0. URL defaultUrl/empty strings, all getters/setters/copy independence including embedded nul/surrogates, clone copies Name even though source equality/hash ignore it, equality field order/type and scalar enum conversion. Page/pages/page-title/time/file actual default/copy/ClassId/Clone/dynamic-type equality; table default0/int copy/set/get, exact type/value equality, inherited type-only hash. Real SfxItemSet/holder/XEditAttribute/ContentInfo nonempty feature field copies and source/query mutation checks, no fake engine/default pool. Every new/changed executable shared owner and all Calc owners raw S/B/F/L100/every counter positive/exact owner sets; related Writer regression with Writer-only coverage gaps exempt. All13source gates including inventory semanticViolationCount0, portable build/relevant existing browser cases, all4native reference links absent while executing and restored finally, source pins and exact source hashes/<=100paths/clean calc. No full all-app run until genuine minimum connected UI+same-model ODS readiness, then applicable fixes and requested pause. No broader parity/readiness promotion."
  Verification: "Pending implementation and deterministic evidence."
  Rollback Plan: "Revert only task-owned intentional implementation/lifecycle files; preserve user merges, unrelated tasks and original reference links. No destructive history changes."
  Findings: "Preflight clean calc at6bbafc4b86d6829ec6212f1fd3af2465609ff887. Native EditEngine default EE_FEATURE_FIELD4081 is SvxFieldItem(SvxFieldData(),which); no field owner exists locally. Existing ContentInfo and XEditAttribute are real and reusable. Upstream SvxURLField copies four strings but equality/hash omit m_Name; preserve and record as CALC142. Base hash uses std::type_index(typeid).hash_code, inherently process/compiler-specific; browser reflection plus existing SAL string hash preserves logical hash/type contracts without a native binary/stdlib/type registry. It is not a new memory-management library. Native SvxFieldData::Create depends on real UNO property producers and unported date/time field families, so leave absent rather than a null-only implementation. Existing Writer URL hyperlinks are a different native item responsibility and are not replaced by EditEngine URL fields. Native bulletitem.hxx path differs from the guessed bulitem.hxx; ordinary font/default-font/graphic dependencies remain later. Full goal active; no all-app run or pause before readiness condition."
id_source: "generated"
---
## Summary

Task160 ports genuine shared text-field values and SvxFieldItem for EditTextObject, URL content and Calc/header-footer/ODS field preservation.

## Scope

At most100intentional non-agent paths: original editeng flditem source/header; complete OffAPI textfield Type constants; SvxFieldData, SvxFieldItem, SvxURLField/SvxURLFormat and actual SvxPageField/SvxPagesField/SvxPageTitleField/SvxTimeField/SvxFileField/SvxTableField stored values; related tests and canonical registry/inventory/docs. Reuse existing SfxPoolItem/holder/Unicode/hash/ContentInfo. Native unique_ptr constructor versus const-reference constructor is an erased overload selector only (explicit adopt=true), ordinary JS references/GC own lifetime. No pointer/refcount/cache/deletion manager, native compiler/probe/generator/sanitizer or binary type-index hash reproduction. Opaque process-specific type_index hashing binds to JS dynamic class reflection and existing SAL string hash; exact opaque native numeric values are not portable and are not document data. URL value/hash order remains exact and uses existing native integer/Unicode combine. UNO field Create/XTextContent/XPropertySet producer, actual date/time/file-system formatting and other field families, translated presentation and diagnostic XML remain absent until real dependencies exist; no no-op provider/factory or fake text engine.

## Plan

Port original default/copy/assignment/virtual Clone/base equality/class ID and opaque type hash contracts. Implement SvxFieldItem actual independent const-field copy, explicit unique_ptr/adoption/null binding, polymorphic copied item and stable const field getter; exact pointer/null/dynamic-type/value equality and field hash delegation, no core JSON or new native factory. Implement complete URL four-string and enum storage, stable const Unicode getters/setters, default/copy/Clone, source type/payload equality and hash omissions. Port page/pages/page-title/time/file stateless value contracts and table default/int/copy/set/get/Clone/equality under native IDs. Reuse full shared item/pool/ContentInfo paths in nonempty tests; preserve suspicious source results and record them. Strict whole-owner shared/Calc100, related Writer tests, all13source gates/inventory/build/browser, native pins/exact hashes/clean calc, same-agent review/verify/commit/finish. Actual full text-engine/pool/Calc document/UI/ODS remains subsequent work.

## Verify Steps

Pinned include/editeng/flditem.hxx and editeng/source/items/flditem.cxx plus OffAPI text/textfield/Type.idl and real EditTextObject/default-pool consumers authoritative. All17constant values UNSPECIFIED-1 through DOCINFO_CUSTOM15 exact. SvxFieldData base Clone slices to genuine empty base; release base equality always true while debug-only type diagnosis is excluded; native class identity and runtime-opaque hash contract use JS class reflection with existing SAL hash (not ABI numeric equivalence). SvxFieldItem exact copied versus adopted/null field, stable borrowed getter, independent polymorphic item copies, pointer fast path/null guards/dynamic type gate/value equality, Which-independent payload and Which-sensitive areSame, hash delegation/null0. URL defaultUrl/empty strings, all getters/setters/copy independence including embedded nul/surrogates, clone copies Name even though source equality/hash ignore it, equality field order/type and scalar enum conversion. Page/pages/page-title/time/file actual default/copy/ClassId/Clone/dynamic-type equality; table default0/int copy/set/get, exact type/value equality, inherited type-only hash. Real SfxItemSet/holder/XEditAttribute/ContentInfo nonempty feature field copies and source/query mutation checks, no fake engine/default pool. Every new/changed executable shared owner and all Calc owners raw S/B/F/L100/every counter positive/exact owner sets; related Writer regression with Writer-only coverage gaps exempt. All13source gates including inventory semanticViolationCount0, portable build/relevant existing browser cases, all4native reference links absent while executing and restored finally, source pins and exact source hashes/<=100paths/clean calc. No full all-app run until genuine minimum connected UI+same-model ODS readiness, then applicable fixes and requested pause. No broader parity/readiness promotion.

## Verification

Pending implementation and deterministic evidence.

## Rollback Plan

Revert only task-owned intentional implementation/lifecycle files; preserve user merges, unrelated tasks and original reference links. No destructive history changes.

## Findings

Preflight clean calc at6bbafc4b86d6829ec6212f1fd3af2465609ff887. Native EditEngine default EE_FEATURE_FIELD4081 is SvxFieldItem(SvxFieldData(),which); no field owner exists locally. Existing ContentInfo and XEditAttribute are real and reusable. Upstream SvxURLField copies four strings but equality/hash omit m_Name; preserve and record as CALC142. Base hash uses std::type_index(typeid).hash_code, inherently process/compiler-specific; browser reflection plus existing SAL string hash preserves logical hash/type contracts without a native binary/stdlib/type registry. It is not a new memory-management library. Native SvxFieldData::Create depends on real UNO property producers and unported date/time field families, so leave absent rather than a null-only implementation. Existing Writer URL hyperlinks are a different native item responsibility and are not replaced by EditEngine URL fields. Native bulletitem.hxx path differs from the guessed bulitem.hxx; ordinary font/default-font/graphic dependencies remain later. Full goal active; no all-app run or pause before readiness condition.
