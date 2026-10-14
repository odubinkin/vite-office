---
id: "202610141657-MED75Z"
title: "Implement canonical shared shadow attribute and Calc pool defaults"
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
  updated_at: "2026-10-14T16:58:06.295Z"
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
    body: "Start: implement source-faithful shared shadow attribute and actual Any contracts for missing Calc default dependency; reuse existing shared Color/CPPU, no lifetime engine."
events:
  -
    type: "status"
    at: "2026-10-14T16:58:20.703Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implement source-faithful shared shadow attribute and actual Any contracts for missing Calc default dependency; reuse existing shared Color/CPPU, no lifetime engine."
doc_version: 3
doc_updated_at: "2026-10-14T16:58:20.703Z"
doc_updated_by: "CODER"
description: "Task136: missing real ScDocumentPool dependency SvxShadowItem. Port native color/width/location value/default/copy/setters/equality/hash/metrics/space and complete typed QueryValue/PutValue over actual CPPU ShadowFormat/ShadowLocation generated declarations, reusing Color/o3tl. Calc ATTR_SHADOW and real owned-item tests; precise inventory/provenance and source quirks. No native memory machinery, full presentation/DocPool/UI/ODS not claimed."
sections:
  Summary: "Task136 removes a concrete missing dependency of ScDocumentPool by implementing the single shared SvxShadowItem from native shaditem.hxx/frmitems.cxx, reusing actual Color, existing Any/type machinery and o3tl conversion/hash. Scope follows the active UI/ODS critical path and standing human authorization. Only calc checkout/branch; no native memory machinery."
  Scope: "At most40intentional source/doc/inventory paths, expected25-35: new frmitems.shadow.ts native owner and shaditem.ts reexport, existing frmitems.ts reexport; actual SvxShadowLocation/member identifiers; ShadowFormat/ShadowLocation IDL values and normal static type getters over existing CPPU, tests, ATTR_SHADOW150? source-confirm before declaration, actual item-set defaults tests, precise registry pairs/capability, calc-core and suspected-issues documentation. Full localized presentation/XML diagnostics and complete document/UI/ODS remain pending; no custom allocator, refcount, lifecycle/helper provider, C++generator/probe/build or network."
  Plan: "Port complete native shadow value and typed transport, including defaults gray100NONE, independent Color copies, implicit copy/clone, Which-independent native equality/hash, side-space switch and llround metrics. Original ShadowFormat field order/static types/native integral casts, enum/default/copy/equality and actual Any roundtrip. Query/Put preserve memberbyte conversion, short widths, ignored IsTransparent, extraction failures and overflow transparency semantics; source quirks documented. Real Calc slot/owned defaults test. Update exact inventory/provenance and run strict changedshared/Calc100, related tests,12source gates/boundaries, hashes/pins/link restoration. No full run until minimal realUI+ODS readiness."
  Verify Steps: "Source-faithful SvxShadowItem Which/default/full/copy/clone/color value ownership, setters/uint16 widths, location sentinel, equality/hash and side-space cases, ScaleMetrics negative/half/narrow domains and HasMetrics. ShadowLocation normal getter/enum sentinel; ShadowFormat actual IDL order/default/value/copy/assignment/equality/livecells and native Any roundtrip over existing CPPU. Query all members/convertbit/unknown untouched, native short widths/transparency percentage. Put all members, enum-to-short fallback, malformed types, ignored IsTransparent and ignored extraction failures, integer multiplication overflow, unknown locations and native color byte conversion. Real Calc ATTR_SHADOW from scitems.hxx/docpool.cxx and item-set ownership. Related source tests and strict raw S/B/F/L100 with every counter positive for entire changed shared executable owners, npm run test:coverage:calc100; native links absent/restoredfinally. Writer-only coverage gaps measured and left per human exemption.12format/lint/typecheck/docs/size/dependencies/tree/provenance/registry/routing/doctor/diff gates plus boundaries, exact40path ceiling/nativepins/sourcehashes/clean calc. Presentation/nativeXML diagnostics/fullDocPool/document/UI/ODS remain unclaimed; no full-suite checkpoint yet."
  Verification: "Pending."
  Rollback Plan: "Revert only intentional task changes through a later authorized task; never reset unrelated work, merge or publish."
  Findings: "Task135 closed clean at2f028b3b. Native DocPool includes missing SvxShadowItem, and existing shared Color/CPPU/hash/conversion can serve its contract without OWeakObject or an ownership engine. Native PutValue reads IsTransparent but only Color is committed; non-location extraction failures retain initial true result, and short signed width conversion can change stored unsigned width. Preserve and document source quirks. Full presentation/diagnostic XML and full CalcUI/ODS remain pending; same-agent EVALUATOR is not independent. No subagents authorized."
id_source: "generated"
---
## Summary

Task136 removes a concrete missing dependency of ScDocumentPool by implementing the single shared SvxShadowItem from native shaditem.hxx/frmitems.cxx, reusing actual Color, existing Any/type machinery and o3tl conversion/hash. Scope follows the active UI/ODS critical path and standing human authorization. Only calc checkout/branch; no native memory machinery.

## Scope

At most40intentional source/doc/inventory paths, expected25-35: new frmitems.shadow.ts native owner and shaditem.ts reexport, existing frmitems.ts reexport; actual SvxShadowLocation/member identifiers; ShadowFormat/ShadowLocation IDL values and normal static type getters over existing CPPU, tests, ATTR_SHADOW150? source-confirm before declaration, actual item-set defaults tests, precise registry pairs/capability, calc-core and suspected-issues documentation. Full localized presentation/XML diagnostics and complete document/UI/ODS remain pending; no custom allocator, refcount, lifecycle/helper provider, C++generator/probe/build or network.

## Plan

Port complete native shadow value and typed transport, including defaults gray100NONE, independent Color copies, implicit copy/clone, Which-independent native equality/hash, side-space switch and llround metrics. Original ShadowFormat field order/static types/native integral casts, enum/default/copy/equality and actual Any roundtrip. Query/Put preserve memberbyte conversion, short widths, ignored IsTransparent, extraction failures and overflow transparency semantics; source quirks documented. Real Calc slot/owned defaults test. Update exact inventory/provenance and run strict changedshared/Calc100, related tests,12source gates/boundaries, hashes/pins/link restoration. No full run until minimal realUI+ODS readiness.

## Verify Steps

Source-faithful SvxShadowItem Which/default/full/copy/clone/color value ownership, setters/uint16 widths, location sentinel, equality/hash and side-space cases, ScaleMetrics negative/half/narrow domains and HasMetrics. ShadowLocation normal getter/enum sentinel; ShadowFormat actual IDL order/default/value/copy/assignment/equality/livecells and native Any roundtrip over existing CPPU. Query all members/convertbit/unknown untouched, native short widths/transparency percentage. Put all members, enum-to-short fallback, malformed types, ignored IsTransparent and ignored extraction failures, integer multiplication overflow, unknown locations and native color byte conversion. Real Calc ATTR_SHADOW from scitems.hxx/docpool.cxx and item-set ownership. Related source tests and strict raw S/B/F/L100 with every counter positive for entire changed shared executable owners, npm run test:coverage:calc100; native links absent/restoredfinally. Writer-only coverage gaps measured and left per human exemption.12format/lint/typecheck/docs/size/dependencies/tree/provenance/registry/routing/doctor/diff gates plus boundaries, exact40path ceiling/nativepins/sourcehashes/clean calc. Presentation/nativeXML diagnostics/fullDocPool/document/UI/ODS remain unclaimed; no full-suite checkpoint yet.

## Verification

Pending.

## Rollback Plan

Revert only intentional task changes through a later authorized task; never reset unrelated work, merge or publish.

## Findings

Task135 closed clean at2f028b3b. Native DocPool includes missing SvxShadowItem, and existing shared Color/CPPU/hash/conversion can serve its contract without OWeakObject or an ownership engine. Native PutValue reads IsTransparent but only Color is committed; non-location extraction failures retain initial true result, and short signed width conversion can change stored unsigned width. Preserve and document source quirks. Full presentation/diagnostic XML and full CalcUI/ODS remain pending; same-agent EVALUATOR is not independent. No subagents authorized.
