---
id: "202610150608-A7TA3A"
title: "Implement native brush color values for Calc background defaults"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 10
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-15T06:09:36.557Z"
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
    body: "Start: actual non-graphic brush color/default/copy/member behavior for Calc background; shared values reused and missing real graphic/complex providers explicit, localization deferred."
events:
  -
    type: "status"
    at: "2026-10-15T06:09:43.552Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: actual non-graphic brush color/default/copy/member behavior for Calc background; shared values reused and missing real graphic/complex providers explicit, localization deferred."
doc_version: 3
doc_updated_at: "2026-10-15T06:09:43.552Z"
doc_updated_by: "CODER"
description: "Task147 ports original SvxBrushItem non-graphic color/copy/hash/scalar Any contracts and ShadingPattern declarations for actual Calc ATTR_BACKGROUND148. Reuse shared Color/ComplexColor/Any/hash primitives. Real graphic constructors/loaders/interfaces and complex-interface transport remain explicit missing providers; no fake Graphic object or localized presentation work."
sections:
  Summary: "Task147 implements actual brush color-constructor family used by Calc background defaults, not a replacement graphic layer. Reuse shared Color/ComplexColor/Any/hash primitives; retain upstream numeric/default/side-effect contracts. UI localization deferred per latest user instruction."
  Scope: "At most32intentional non-agent paths: editeng frmitems.brush.ts and canonical brushitem.ts header; original SvxGraphicPosition/BRUSH_GRAPHIC_VERSION declarations, published full ShadingPattern constant group; background/shading/transparency member IDs and actual Calc ATTR_BACKGROUND148; related value/Calc tests, matched runtime/provenance/capability and calc-core/suspected-source docs. Port Which-only,Color,Color+ComplexColor,copy/Clone family, native non-graphic equality/hash/isUsed, mutable Color, complex getter final-color side effect, filterColor, shading and numeric graphic-transparency state, actual supported scalar Any methods. Graphics constructors/positions/links/filter/URL/XGraphic loading and actual XComplexColor interfaces remain unported, known unsupported selectors returnfalse explicitly; no fake object/service or security/load code. No extra browser no-argument projection: base unsupported form remains undefined. Localization/GetPresentation deferred; no native memory/move/instance managers. Existing module boundaries reused unchanged."
  Plan: "Port original brush non-graphic value constructor family and actual supported scalar Any behavior using shared values, preserve native transparency/getter side effects and declarations, test actual Calc148default and related shared owners at raw100, honest inventory/source audits/portable build,32path clean calc closure. No fake graphics/complex interfaces, localized UI, memory managers or broad full suite."
  Verify Steps: "Source compare brushitem.hxx/frmitems.cxx/memberids.h/ShadingPattern.idl/docpool/scitems. Transparent factory/Calc148 default, independent full color value copies and Which-independent payload equality/hash, borrowed mutable color and ComplexColor getter side effect, color/filter/shading/graphic-transparency state, isUsed for full/partial transparency. Supported actual Any color/RGB/percent/fully-transparent/graphic-percent/shading queries and writes: RGB retains alpha, full Color replaces it; typed failures/nonmutation, native invalid-graphic-percent behavior and unknown unchanged success; unsigned8 member masks and private signed8 percent conversion including100percent -> alpha1. Native declarations all source-audited. No fake graphics/interface/localization/legacy codec. Entire changed shared owners and whole Calc every raw S/B/F/L counter positive100; related Color/ComplexColor/Any tests, existing boundary suite.4references absent/restored finally in tests/build. All13 scoped source gates, inventory zero violations/provenance necessary filename split, source hashes/native pins32path audit/clean calc. Full suite deferred until actual minimum connected UI+same-model ODS then fix/pause; Writer-only coverage gaps exempt."
  Verification: "Pending implementation and validation."
  Rollback Plan: "Revert only intentional task paths in a later authorized task; no reset, merge or publication."
  Findings: "Source reserves0xff transparency:100percent color transparency produces alpha1, so fully-transparent bool/isUsed differ from intuitive100percent expectations. Complex-color const getter writes its final color. Preserve/record these source cases without calling them confirmed bugs. Port actual non-graphic constructor/method behavior while explicitly leaving real graphic/interface services pending; do not fabricate unreachable graphic states to satisfy coverage. Same-agent evaluator is not independent."
id_source: "generated"
---
## Summary

Task147 implements actual brush color-constructor family used by Calc background defaults, not a replacement graphic layer. Reuse shared Color/ComplexColor/Any/hash primitives; retain upstream numeric/default/side-effect contracts. UI localization deferred per latest user instruction.

## Scope

At most32intentional non-agent paths: editeng frmitems.brush.ts and canonical brushitem.ts header; original SvxGraphicPosition/BRUSH_GRAPHIC_VERSION declarations, published full ShadingPattern constant group; background/shading/transparency member IDs and actual Calc ATTR_BACKGROUND148; related value/Calc tests, matched runtime/provenance/capability and calc-core/suspected-source docs. Port Which-only,Color,Color+ComplexColor,copy/Clone family, native non-graphic equality/hash/isUsed, mutable Color, complex getter final-color side effect, filterColor, shading and numeric graphic-transparency state, actual supported scalar Any methods. Graphics constructors/positions/links/filter/URL/XGraphic loading and actual XComplexColor interfaces remain unported, known unsupported selectors returnfalse explicitly; no fake object/service or security/load code. No extra browser no-argument projection: base unsupported form remains undefined. Localization/GetPresentation deferred; no native memory/move/instance managers. Existing module boundaries reused unchanged.

## Plan

Port original brush non-graphic value constructor family and actual supported scalar Any behavior using shared values, preserve native transparency/getter side effects and declarations, test actual Calc148default and related shared owners at raw100, honest inventory/source audits/portable build,32path clean calc closure. No fake graphics/complex interfaces, localized UI, memory managers or broad full suite.

## Verify Steps

Source compare brushitem.hxx/frmitems.cxx/memberids.h/ShadingPattern.idl/docpool/scitems. Transparent factory/Calc148 default, independent full color value copies and Which-independent payload equality/hash, borrowed mutable color and ComplexColor getter side effect, color/filter/shading/graphic-transparency state, isUsed for full/partial transparency. Supported actual Any color/RGB/percent/fully-transparent/graphic-percent/shading queries and writes: RGB retains alpha, full Color replaces it; typed failures/nonmutation, native invalid-graphic-percent behavior and unknown unchanged success; unsigned8 member masks and private signed8 percent conversion including100percent -> alpha1. Native declarations all source-audited. No fake graphics/interface/localization/legacy codec. Entire changed shared owners and whole Calc every raw S/B/F/L counter positive100; related Color/ComplexColor/Any tests, existing boundary suite.4references absent/restored finally in tests/build. All13 scoped source gates, inventory zero violations/provenance necessary filename split, source hashes/native pins32path audit/clean calc. Full suite deferred until actual minimum connected UI+same-model ODS then fix/pause; Writer-only coverage gaps exempt.

## Verification

Pending implementation and validation.

## Rollback Plan

Revert only intentional task paths in a later authorized task; no reset, merge or publication.

## Findings

Source reserves0xff transparency:100percent color transparency produces alpha1, so fully-transparent bool/isUsed differ from intuitive100percent expectations. Complex-color const getter writes its final color. Preserve/record these source cases without calling them confirmed bugs. Port actual non-graphic constructor/method behavior while explicitly leaving real graphic/interface services pending; do not fabricate unreachable graphic states to satisfy coverage. Same-agent evaluator is not independent.
