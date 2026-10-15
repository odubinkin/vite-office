---
id: "202610151714-B4RVN2"
title: "Port native grab-bag property values for text attributes"
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
  updated_at: "2026-10-15T17:15:40.490Z"
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
    body: "Start: implement genuine shared grab-bag property values and UDK dependencies over existing transport; preserve source behavior and GC adaptation within approved scope."
events:
  -
    type: "status"
    at: "2026-10-15T17:15:45.215Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implement genuine shared grab-bag property values and UDK dependencies over existing transport; preserve source behavior and GC adaptation within approved scope."
doc_version: 3
doc_updated_at: "2026-10-15T17:15:45.215Z"
doc_updated_by: "CODER"
description: "Task159: implement genuine shared SfxGrabBagItem and required UDK PropertyValue/PropertyState typed values over existing Any/Sequence/Unicode owners; preserve sorted UTF16 key/value semantics, duplicate replacement, copy/equality/hash/property transport and native failure behavior. Required missing EditEngine/ODS metadata dependency, not a fake text-engine/pool facade."
sections:
  Summary: "Task159 implements the actual SfxGrabBagItem metadata value required by the native EditEngine default table and later Calc/ODS property preservation, including its genuine UDK PropertyValue/PropertyState dependencies over existing CPPU transport."
  Scope: "At most110 intentional non-agent paths: new canonical svl grabbagitem source/header, UDK beans PropertyValue/PropertyState declaration values and generated normal static type bindings; directly required existing shared string/Any/Sequence borrowing only if absent, related tests and canonical inventory/provenance/capability/docs. Use ordinary JS Map with primitive UTF16 string keys as the std::map key binding; preserve value-key equivalence, exact unsigned-code-unit order, no normalization, embedded nul/surrogate units and stable const map view. Values remain real independent Any objects. No duplicate Writer-only property implementation, native lifetime/cache/refcount manager, JSON methods in shared core, fake engine/pool/provider, UI localization or unrelated font rendering. No native compiler/probe/sanitizer. No new policy or guard exceptions; actual native library graph corrections only if source-proven and all algorithm bodies remain unchanged."
  Plan: "Implement native PropertyState enum and PropertyValue default/copy/member construction, assignment, stable string/Any fields, equality and normal CPPU compound/enum bindings using actual existing type/sequence/Any owners. Logical member offsets are the existing compound dispatcher contract, not document bytes. Port SfxGrabBagItem default/Which/map/copy/factory/Clone/equality/keys-only hash and actual Sequence<PropertyValue> QueryValue/PutValue semantics; native member selectors ignored, failed extraction unchanged, duplicate names last-wins and incoming Handle/State discarded. Reuse existing SAL Unicode hash and o3tl combine. Verify nonempty/nested typed Any values and actual shared pool/set/ContentInfo target copies plus real Writer property transport users where applicable. Register exact metadata without broad parity promotion; run strict whole-owner shared and Calc100, related tests, all13source gates and portable build/relevant browser checks. Record source quirks, review/verify/commit/finish."
  Verify Steps: "Pinned include/svl/grabbagitem.hxx and svl/source/items/grabbagitem.cxx plus UDK beans PropertyValue.idl/PropertyState.idl and real cppumaker enum/struct rules authoritative. Constructor defaults Which0/mapempty; value/copy independence; exact concrete payload/Which participation per actual base equality; full sorted case-sensitive UTF16 key equivalence/order; keys-only hash omissions; Query emits real Sequence<PropertyValue> sorted names/independent typed Any values with generated Handle0/StateDIRECT_VALUE; Put accepts exact declared sequence, clears on successful empty input, last duplicate wins, ignores Handle/State/member selector and rejects wrong types unchanged. PropertyValue actual string/long/Any/enum values preserve live member references, implicit value copies, signed32 conversions and typed compound transport without fabricated value/type providers. Test initialized/nonempty/nested Any and source/clone/query mutations plus real shared item-set/ContentInfo copies. Every changed/new executable shared owner and all Calc owners strict raw S/B/F/L100/every counter positive/exact measured owner sets; Writer-only gaps exempt, real related tests required. All13source gates/inventory semanticViolationCount0, portable production build and relevant existing Writer/browser scenarios. All4reference symlinks absent during tests/build/browser and restored exactly finally; exact source hashes, pinned native evidence, <=110 intentional paths and clean calc branch. Full all-app run remains deferred until genuine minimum connected UI+same-model ODS readiness, then applicable fixes and requested pause. No readiness claim for full engine/model/UI/ODS."
  Verification: "Pending implementation and deterministic evidence."
  Rollback Plan: "Revert only intentional task implementation and lifecycle artifacts; preserve user merges, unrelated tasks and native reference links. No history destruction."
  Findings: "Preflight clean calc at a7f22a3658e2db9b06e270c8c02d4a80ca3ba83b. Existing EditEngine native61default table explicitly needs SfxGrabBagItem at EE_CHAR_GRABBAG; no implementation exists under any current app owner. PropertyValue/PropertyState are genuine UDK APIs, absent locally; existing Locale/TabStop values and Any/Sequence/normal type-init owners are reusable. Current shared numbering covers only SvxNumberType/SvxNumberFormat slices, not the complete SvxNumRule/NumBullet item; optical sizing already exists and must not be duplicated. Font variation parsing also needs absent float conversion/string-buffer services; it is not folded into this metadata dependency task. Earlier bounded guessed source/header paths missed internal bulitem.hxx and absent ustrbuf/math; no source changes or external reads occurred. The key binding uses native JS strings because JS Map object identity would violate std::map<OUString,...> value equality; it is a declared stack binding, not a new map/memory library. Physical native pointer/refcount/cache behavior remains deliberately erased under user GC instructions. Goal remains active."
id_source: "generated"
---
## Summary

Task159 implements the actual SfxGrabBagItem metadata value required by the native EditEngine default table and later Calc/ODS property preservation, including its genuine UDK PropertyValue/PropertyState dependencies over existing CPPU transport.

## Scope

At most110 intentional non-agent paths: new canonical svl grabbagitem source/header, UDK beans PropertyValue/PropertyState declaration values and generated normal static type bindings; directly required existing shared string/Any/Sequence borrowing only if absent, related tests and canonical inventory/provenance/capability/docs. Use ordinary JS Map with primitive UTF16 string keys as the std::map key binding; preserve value-key equivalence, exact unsigned-code-unit order, no normalization, embedded nul/surrogate units and stable const map view. Values remain real independent Any objects. No duplicate Writer-only property implementation, native lifetime/cache/refcount manager, JSON methods in shared core, fake engine/pool/provider, UI localization or unrelated font rendering. No native compiler/probe/sanitizer. No new policy or guard exceptions; actual native library graph corrections only if source-proven and all algorithm bodies remain unchanged.

## Plan

Implement native PropertyState enum and PropertyValue default/copy/member construction, assignment, stable string/Any fields, equality and normal CPPU compound/enum bindings using actual existing type/sequence/Any owners. Logical member offsets are the existing compound dispatcher contract, not document bytes. Port SfxGrabBagItem default/Which/map/copy/factory/Clone/equality/keys-only hash and actual Sequence<PropertyValue> QueryValue/PutValue semantics; native member selectors ignored, failed extraction unchanged, duplicate names last-wins and incoming Handle/State discarded. Reuse existing SAL Unicode hash and o3tl combine. Verify nonempty/nested typed Any values and actual shared pool/set/ContentInfo target copies plus real Writer property transport users where applicable. Register exact metadata without broad parity promotion; run strict whole-owner shared and Calc100, related tests, all13source gates and portable build/relevant browser checks. Record source quirks, review/verify/commit/finish.

## Verify Steps

Pinned include/svl/grabbagitem.hxx and svl/source/items/grabbagitem.cxx plus UDK beans PropertyValue.idl/PropertyState.idl and real cppumaker enum/struct rules authoritative. Constructor defaults Which0/mapempty; value/copy independence; exact concrete payload/Which participation per actual base equality; full sorted case-sensitive UTF16 key equivalence/order; keys-only hash omissions; Query emits real Sequence<PropertyValue> sorted names/independent typed Any values with generated Handle0/StateDIRECT_VALUE; Put accepts exact declared sequence, clears on successful empty input, last duplicate wins, ignores Handle/State/member selector and rejects wrong types unchanged. PropertyValue actual string/long/Any/enum values preserve live member references, implicit value copies, signed32 conversions and typed compound transport without fabricated value/type providers. Test initialized/nonempty/nested Any and source/clone/query mutations plus real shared item-set/ContentInfo copies. Every changed/new executable shared owner and all Calc owners strict raw S/B/F/L100/every counter positive/exact measured owner sets; Writer-only gaps exempt, real related tests required. All13source gates/inventory semanticViolationCount0, portable production build and relevant existing Writer/browser scenarios. All4reference symlinks absent during tests/build/browser and restored exactly finally; exact source hashes, pinned native evidence, <=110 intentional paths and clean calc branch. Full all-app run remains deferred until genuine minimum connected UI+same-model ODS readiness, then applicable fixes and requested pause. No readiness claim for full engine/model/UI/ODS.

## Verification

Pending implementation and deterministic evidence.

## Rollback Plan

Revert only intentional task implementation and lifecycle artifacts; preserve user merges, unrelated tasks and native reference links. No history destruction.

## Findings

Preflight clean calc at a7f22a3658e2db9b06e270c8c02d4a80ca3ba83b. Existing EditEngine native61default table explicitly needs SfxGrabBagItem at EE_CHAR_GRABBAG; no implementation exists under any current app owner. PropertyValue/PropertyState are genuine UDK APIs, absent locally; existing Locale/TabStop values and Any/Sequence/normal type-init owners are reusable. Current shared numbering covers only SvxNumberType/SvxNumberFormat slices, not the complete SvxNumRule/NumBullet item; optical sizing already exists and must not be duplicated. Font variation parsing also needs absent float conversion/string-buffer services; it is not folded into this metadata dependency task. Earlier bounded guessed source/header paths missed internal bulitem.hxx and absent ustrbuf/math; no source changes or external reads occurred. The key binding uses native JS strings because JS Map object identity would violate std::map<OUString,...> value equality; it is a declared stack binding, not a new map/memory library. Physical native pointer/refcount/cache behavior remains deliberately erased under user GC instructions. Goal remains active.
