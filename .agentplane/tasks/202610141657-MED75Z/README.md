---
id: "202610141657-MED75Z"
title: "Implement canonical shared shadow attribute and Calc pool defaults"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 14
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
doc_updated_at: "2026-10-14T17:12:00.360Z"
doc_updated_by: "CODER"
description: "Task136: missing real ScDocumentPool dependency SvxShadowItem. Port native color/width/location value/default/copy/setters/equality/hash/metrics/space and complete typed QueryValue/PutValue over actual CPPU ShadowFormat/ShadowLocation generated declarations, reusing Color/o3tl. Calc ATTR_SHADOW and real owned-item tests; precise inventory/provenance and source quirks. No native memory machinery, full presentation/DocPool/UI/ODS not claimed."
sections:
  Summary: "Task136 removes a concrete missing dependency of ScDocumentPool by implementing the single shared SvxShadowItem from native shaditem.hxx/frmitems.cxx, reusing actual Color, existing Any/type machinery and o3tl conversion/hash. Scope follows the active UI/ODS critical path and standing human authorization. Only calc checkout/branch; no native memory machinery."
  Scope: "At most40intentional source/doc/inventory paths, expected25-35: new frmitems.shadow.ts native owner and shaditem.ts reexport, existing frmitems.ts reexport; actual SvxShadowLocation/member identifiers and original svl MID_WIDTH declaration; ShadowFormat/ShadowLocation IDL values and normal static type getters over existing CPPU, tests, source-confirmed ATTR_SHADOW152 and actual item-set defaults tests, precise registry pairs/capability, calc-core and suspected-issues documentation. Full localized presentation/XML diagnostics and complete document/UI/ODS remain pending; no custom allocator, refcount, lifecycle/helper provider, C++generator/probe/build or network."
  Plan: "Port complete native shadow value and typed transport, including defaults gray100NONE, independent Color copies, implicit copy/clone, Which-independent native equality/hash, side-space switch and llround metrics. Original ShadowFormat field order/static types/native integral casts, enum/default/copy/equality and actual Any roundtrip. Query/Put preserve memberbyte conversion, short widths, ignored IsTransparent, extraction failures and overflow transparency semantics; source quirks documented. Real Calc slot/owned defaults test. Update exact inventory/provenance and run strict changedshared/Calc100, related tests,12source gates/boundaries, hashes/pins/link restoration. No full run until minimal realUI+ODS readiness."
  Verify Steps: "Source-faithful SvxShadowItem Which/default/full/copy/clone/color value ownership, setters/uint16 widths, location sentinel, equality/hash and side-space cases, ScaleMetrics negative/half/narrow domains and HasMetrics. ShadowLocation normal getter/enum sentinel; ShadowFormat actual IDL order/default/value/copy/assignment/equality/livecells and native Any roundtrip over existing CPPU. Query all members/convertbit/unknown untouched, native short widths/transparency percentage. Put all members, enum-to-short fallback, malformed types, ignored IsTransparent and ignored extraction failures, integer multiplication overflow, unknown locations and native color byte conversion. Real Calc ATTR_SHADOW from scitems.hxx/docpool.cxx and item-set ownership. Related source tests and strict raw S/B/F/L100 with every counter positive for entire changed shared executable owners, npm run test:coverage:calc100; native links absent/restoredfinally. Writer-only coverage gaps measured and left per human exemption.12format/lint/typecheck/docs/size/dependencies/tree/provenance/registry/routing/doctor/diff gates plus boundaries, exact40path ceiling/nativepins/sourcehashes/clean calc. Presentation/nativeXML diagnostics/fullDocPool/document/UI/ODS remain unclaimed; no full-suite checkpoint yet."
  Verification: |-
    - Command: `node output/playwright/task136-checks/final-portable.mjs`.
    - Result: pass.
    - Evidence:321related tests in29files,7complete changed shared executable owners raw S502/B350/F123/L468 with every counter positive;176Calc tests in69files,33owners raw S4166/B2731/F821/L3714 at100. Production build passes. All4reference links absent during testing/build and restored in finally. No Writer runtime owner changed or instrumented, so Writer-only gap exemption needed no repair. No repository test threshold, counter map or runtime exclusion changed; the retained portable wrapper manually rejects any nonpositive shared/Calc raw counter independently of its command-local aggregate report threshold.
    - Scope: original shadow defaults/value ownership/equality/hash/space/metrics, actual typed enum/struct Any binding, every Query/Put member, enum/short fallback, source conversion narrowing/ignored-input quirks, transparency checked multiplication and actual Calc item-set default ownership. Existing related frame/box/Writer consumers pass unchanged. No fake Any providers or native build/probes.

    - Command: scoped `npx prettier --check` and `npx eslint ... --max-warnings 0` over12source paths; `npm run typecheck`; `npm run check:docs`; `npm run check:file-size`; `npm run check:dependencies`; `npm run check:source-tree`; `npm run check:source-provenance`; `npm run inventory:parity`; `node .agentplane/policy/check-routing.mjs`; `ap doctor`; `git diff --check`; `npx vitest run scripts/check-module-boundaries.test.ts`.
    - Result: pass.
    - Evidence:1870authored JSDoc files;622runtime dependency owners/2789relative imports/91allowed edges;114required tree paths/33retired roots;623runtime/provenance records and zero semantic violations;36boundary cases. Existing doctor hook-shim warning and build chunk-size advisory remain outside scope. Exact33paths within40approved,9runtime/provenance pairs and one new bounded capability. Source fingerprint3751to3770:14existing changes,19new,3737unchanged;11native source pins and4reference links restored. Evidence: `output/playwright/task136-checks/verification.json` and final logs.

    Native localized presentation/XML diagnostics, noncanonical raw boolean bytes, ABI and complete ScDocumentPool/ScPatternAttr/ScColumn/ScTable/ScDocument/UI/ODS remain unverified. Current final-class Query0 always succeeds, so redundant left success conjunct is source-folded while both real query/extract operations execute; no fake failure path was added for coverage. Native logical IDL booleans use JS booleans through existing CPPU bool extraction, while sal_Bool numeric observations remain in the shared library. No full suite/browser UI run is required by this non-UI task; human moved the full checkpoint to actual minimal connected UI+ODS readiness. Same-agent EVALUATOR is not independent.
  Rollback Plan: "Revert only intentional task changes through a later authorized task; never reset unrelated work, merge or publish."
  Findings: |-
    Task136 removes the missing real SvxShadowItem dependency of Calc default pool. One shared native value owner/header and original generated ShadowFormat/ShadowLocation values reuse Color, Any/type metadata, hash and unit conversion. Ordinary JS GC owns state; no allocator, refcount, weak helper, binary address manager, generator or C++build/probe. Original gray100NONE defaults and Calc152 are source-confirmed. Full presentation/diagnostic XML and full Calc document/UI/ODS remain pending.

    Initial validation found a test observer selecting numeric sal_Bool extraction while expecting a JS boolean; native codemaker emits sal_Bool (unsigned char), and the existing Any deliberately distinguishes its numeric observer from bool. The actual logical IDL field/observer now use JS boolean extraction without changing shared CPPU or introducing a compatibility type. Explicit erased Color tag-family selectors use the existing correct shared Color contract. These are ordinary host value adaptations, not binary-format claims; raw noncanonical boolean-byte domains remain unverified.

    All new runtime owners reached100first; the old frmitems owner needed existing related size/frame/box/Writer tests to cover its whole body. Those unchanged tests now pass with complete raw coverage. A final independent literal test confirms native failed-width extraction in converted units changes65535to56762 while returning true. CALC-115 records ignored IsTransparent and ignored extraction results; source quirks are preserved. The original native final-class member0 query always succeeds, allowing its redundant true conjunct to be folded without a fake failure source. Provenance initially rejected basename-only IDL symbol references; real ShadowWidth/IsTransparent and TOP_LEFT/BOTTOM_RIGHT declarations and evidence were added without relaxing validators.

    Thirty-three paths stay within the approved40path ceiling,9runtime/provenance pairs retain existing status/classification/history, and no Writer runtime changes or coverage-only repairs occur. Previous managed hook-shim warning remains unrelated. Full goal incomplete; full test checkpoint only at actual UI+ODS minimum then requested pause. Same-agent EVALUATOR is explicitly not independent.
id_source: "generated"
---
## Summary

Task136 removes a concrete missing dependency of ScDocumentPool by implementing the single shared SvxShadowItem from native shaditem.hxx/frmitems.cxx, reusing actual Color, existing Any/type machinery and o3tl conversion/hash. Scope follows the active UI/ODS critical path and standing human authorization. Only calc checkout/branch; no native memory machinery.

## Scope

At most40intentional source/doc/inventory paths, expected25-35: new frmitems.shadow.ts native owner and shaditem.ts reexport, existing frmitems.ts reexport; actual SvxShadowLocation/member identifiers and original svl MID_WIDTH declaration; ShadowFormat/ShadowLocation IDL values and normal static type getters over existing CPPU, tests, source-confirmed ATTR_SHADOW152 and actual item-set defaults tests, precise registry pairs/capability, calc-core and suspected-issues documentation. Full localized presentation/XML diagnostics and complete document/UI/ODS remain pending; no custom allocator, refcount, lifecycle/helper provider, C++generator/probe/build or network.

## Plan

Port complete native shadow value and typed transport, including defaults gray100NONE, independent Color copies, implicit copy/clone, Which-independent native equality/hash, side-space switch and llround metrics. Original ShadowFormat field order/static types/native integral casts, enum/default/copy/equality and actual Any roundtrip. Query/Put preserve memberbyte conversion, short widths, ignored IsTransparent, extraction failures and overflow transparency semantics; source quirks documented. Real Calc slot/owned defaults test. Update exact inventory/provenance and run strict changedshared/Calc100, related tests,12source gates/boundaries, hashes/pins/link restoration. No full run until minimal realUI+ODS readiness.

## Verify Steps

Source-faithful SvxShadowItem Which/default/full/copy/clone/color value ownership, setters/uint16 widths, location sentinel, equality/hash and side-space cases, ScaleMetrics negative/half/narrow domains and HasMetrics. ShadowLocation normal getter/enum sentinel; ShadowFormat actual IDL order/default/value/copy/assignment/equality/livecells and native Any roundtrip over existing CPPU. Query all members/convertbit/unknown untouched, native short widths/transparency percentage. Put all members, enum-to-short fallback, malformed types, ignored IsTransparent and ignored extraction failures, integer multiplication overflow, unknown locations and native color byte conversion. Real Calc ATTR_SHADOW from scitems.hxx/docpool.cxx and item-set ownership. Related source tests and strict raw S/B/F/L100 with every counter positive for entire changed shared executable owners, npm run test:coverage:calc100; native links absent/restoredfinally. Writer-only coverage gaps measured and left per human exemption.12format/lint/typecheck/docs/size/dependencies/tree/provenance/registry/routing/doctor/diff gates plus boundaries, exact40path ceiling/nativepins/sourcehashes/clean calc. Presentation/nativeXML diagnostics/fullDocPool/document/UI/ODS remain unclaimed; no full-suite checkpoint yet.

## Verification

- Command: `node output/playwright/task136-checks/final-portable.mjs`.
- Result: pass.
- Evidence:321related tests in29files,7complete changed shared executable owners raw S502/B350/F123/L468 with every counter positive;176Calc tests in69files,33owners raw S4166/B2731/F821/L3714 at100. Production build passes. All4reference links absent during testing/build and restored in finally. No Writer runtime owner changed or instrumented, so Writer-only gap exemption needed no repair. No repository test threshold, counter map or runtime exclusion changed; the retained portable wrapper manually rejects any nonpositive shared/Calc raw counter independently of its command-local aggregate report threshold.
- Scope: original shadow defaults/value ownership/equality/hash/space/metrics, actual typed enum/struct Any binding, every Query/Put member, enum/short fallback, source conversion narrowing/ignored-input quirks, transparency checked multiplication and actual Calc item-set default ownership. Existing related frame/box/Writer consumers pass unchanged. No fake Any providers or native build/probes.

- Command: scoped `npx prettier --check` and `npx eslint ... --max-warnings 0` over12source paths; `npm run typecheck`; `npm run check:docs`; `npm run check:file-size`; `npm run check:dependencies`; `npm run check:source-tree`; `npm run check:source-provenance`; `npm run inventory:parity`; `node .agentplane/policy/check-routing.mjs`; `ap doctor`; `git diff --check`; `npx vitest run scripts/check-module-boundaries.test.ts`.
- Result: pass.
- Evidence:1870authored JSDoc files;622runtime dependency owners/2789relative imports/91allowed edges;114required tree paths/33retired roots;623runtime/provenance records and zero semantic violations;36boundary cases. Existing doctor hook-shim warning and build chunk-size advisory remain outside scope. Exact33paths within40approved,9runtime/provenance pairs and one new bounded capability. Source fingerprint3751to3770:14existing changes,19new,3737unchanged;11native source pins and4reference links restored. Evidence: `output/playwright/task136-checks/verification.json` and final logs.

Native localized presentation/XML diagnostics, noncanonical raw boolean bytes, ABI and complete ScDocumentPool/ScPatternAttr/ScColumn/ScTable/ScDocument/UI/ODS remain unverified. Current final-class Query0 always succeeds, so redundant left success conjunct is source-folded while both real query/extract operations execute; no fake failure path was added for coverage. Native logical IDL booleans use JS booleans through existing CPPU bool extraction, while sal_Bool numeric observations remain in the shared library. No full suite/browser UI run is required by this non-UI task; human moved the full checkpoint to actual minimal connected UI+ODS readiness. Same-agent EVALUATOR is not independent.

## Rollback Plan

Revert only intentional task changes through a later authorized task; never reset unrelated work, merge or publish.

## Findings

Task136 removes the missing real SvxShadowItem dependency of Calc default pool. One shared native value owner/header and original generated ShadowFormat/ShadowLocation values reuse Color, Any/type metadata, hash and unit conversion. Ordinary JS GC owns state; no allocator, refcount, weak helper, binary address manager, generator or C++build/probe. Original gray100NONE defaults and Calc152 are source-confirmed. Full presentation/diagnostic XML and full Calc document/UI/ODS remain pending.

Initial validation found a test observer selecting numeric sal_Bool extraction while expecting a JS boolean; native codemaker emits sal_Bool (unsigned char), and the existing Any deliberately distinguishes its numeric observer from bool. The actual logical IDL field/observer now use JS boolean extraction without changing shared CPPU or introducing a compatibility type. Explicit erased Color tag-family selectors use the existing correct shared Color contract. These are ordinary host value adaptations, not binary-format claims; raw noncanonical boolean-byte domains remain unverified.

All new runtime owners reached100first; the old frmitems owner needed existing related size/frame/box/Writer tests to cover its whole body. Those unchanged tests now pass with complete raw coverage. A final independent literal test confirms native failed-width extraction in converted units changes65535to56762 while returning true. CALC-115 records ignored IsTransparent and ignored extraction results; source quirks are preserved. The original native final-class member0 query always succeeds, allowing its redundant true conjunct to be folded without a fake failure source. Provenance initially rejected basename-only IDL symbol references; real ShadowWidth/IsTransparent and TOP_LEFT/BOTTOM_RIGHT declarations and evidence were added without relaxing validators.

Thirty-three paths stay within the approved40path ceiling,9runtime/provenance pairs retain existing status/classification/history, and no Writer runtime changes or coverage-only repairs occur. Previous managed hook-shim warning remains unrelated. Full goal incomplete; full test checkpoint only at actual UI+ODS minimum then requested pause. Same-agent EVALUATOR is explicitly not independent.
