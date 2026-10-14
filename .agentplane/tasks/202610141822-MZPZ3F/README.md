---
id: "202610141822-MZPZ3F"
title: "Implement canonical shared set items for Calc page attributes"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 5
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-14T18:23:52.855Z"
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
    body: "Start: implement original shared set items/base value-copy contracts and Calc183/184 dependencies; preserve native named-rvalue copy and Writer hidden overload without move or lifetime machinery."
events:
  -
    type: "status"
    at: "2026-10-14T18:23:59.721Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implement original shared set items/base value-copy contracts and Calc183/184 dependencies; preserve native named-rvalue copy and Writer hidden overload without move or lifetime machinery."
doc_version: 3
doc_updated_at: "2026-10-14T18:23:59.721Z"
doc_updated_by: "CODER"
description: "Task140 ports actual SfxSetItem/SvxSetItem and required SfxItemSet copy/CloneAsValue plus isSetItem flag for real Calc183/184. Both native initial-value overloads copy even rvalue; no move or lifetime engine. Preserve native pool/parent/state behavior and reuse existing item-set ownership."
sections:
  Summary: "Task140 adds actual shared SfxSetItem/SvxSetItem for Calc header/footer sets, with required original SfxItemSet copy/CloneAsValue contracts and item classification flag. User continuation authorizes canonical shared and necessary Writer edits in calc."
  Scope: "At most45source/doc/inventory paths: SfxPoolItem flag and presentation enum header; SfxItemSet original copy/CloneAsValue; SfxSetItem sitem implementation/setitem header; SvxSetItem pageitem implementation/header; required override annotation in SwAttrSet preserving its native hidden overload behavior; Calc183/184 and direct source-range item-set witnesses; focused shared/Writer tests, matching runtime/provenance/capability, calc-core and calc-upstream-suspected-issues documentation. Reuse item storage, real OUString and MapUnit types. No SfxAllItemSet fake, actual move/lifetime engine, localization service, native probe, full DocPool or document stub."
  Plan: "Port original shared set-item ownership, base item-set copy/CloneAsValue and classification, Svx page-set wrapper and no-service presentation for Calc183/184. Both upstream initial overloads copy. Preserve Writer hidden overload behavior, no move/lifetime or fake provider. Bound45paths, strict whole shared/Calc raw100/related Writer tests/portable build/source gates/pins/hashes and clean calc."
  Verify Steps: "Original SfxItemSet copy constructor with SET/INVALID/DISABLED and parent/ranges/pool, independent mutable deltas, slicing real derived set without calling virtual Clone, empty ranges. CloneAsValue defaults and includeItems false, same/foreign pool SET-only semantics, parent/state rules and base-only debug-precondition host guard. Preserve SwAttrSet native CloneAsValue overload and Clone behavior; annotate override only where TypeScript requires it, measure Writer changed-owner gaps but do not repair coverage-only gaps. SfxPoolItem isSetItem false for normal items and true for set items; original SfxItemPresentation Nameless0Complete1. SfxSetItem abstract base, Which/value and copy(pool) construction, independent owned set, concrete same-type nested Equals(true), retained pool/parent identity comparisons; SvxSetItem explicit initial set/copy/default-pool/foreign-pool Clone. Both erased native initial argument categories copy the source, no move/reset. Real OUString base GetPresentation false leaves text; Svx false clears text, all parameters ignored. Calc183/184 sets have actual upstream ranges148,150-152,156-157,160,163-166 and start empty; no fake dynamic ItemInfo provider. Whole changed shared executable owners and whole Calc every raw S/B/F/L counter positive100, related actual Writer tests, reference links absent during tests/build and restored finally. Scoped prettier/eslint, typecheck/docs/size/dependencies/tree/provenance/inventory/routing/doctor/diff, module-boundary tests, production build. Pin actual native sources, audit exact45paths and source hashes, clean calc. Full suite remains human readiness-gated to real minimum UI plus same-model ODS then repair/pause."
  Verification: "Pending execution."
  Rollback Plan: "Revert only task changes through a subsequent authorized task; no destructive reset, merge or publication."
  Findings: "Native SfxSetItem rvalue overload initializes maSet(pS), which copies the named lvalue. Preserve source behavior and do not infer a move from the signature or build memory machinery. Native CloneAsValue asserts base type; construction from a derived source uses real base copy instead. Existing SwAttrSet hides the C++ nonvirtual method with its native own return type; TypeScript requires an override annotation without new Writer behavior. Same-agent quality review is not independent."
id_source: "generated"
---
## Summary

Task140 adds actual shared SfxSetItem/SvxSetItem for Calc header/footer sets, with required original SfxItemSet copy/CloneAsValue contracts and item classification flag. User continuation authorizes canonical shared and necessary Writer edits in calc.

## Scope

At most45source/doc/inventory paths: SfxPoolItem flag and presentation enum header; SfxItemSet original copy/CloneAsValue; SfxSetItem sitem implementation/setitem header; SvxSetItem pageitem implementation/header; required override annotation in SwAttrSet preserving its native hidden overload behavior; Calc183/184 and direct source-range item-set witnesses; focused shared/Writer tests, matching runtime/provenance/capability, calc-core and calc-upstream-suspected-issues documentation. Reuse item storage, real OUString and MapUnit types. No SfxAllItemSet fake, actual move/lifetime engine, localization service, native probe, full DocPool or document stub.

## Plan

Port original shared set-item ownership, base item-set copy/CloneAsValue and classification, Svx page-set wrapper and no-service presentation for Calc183/184. Both upstream initial overloads copy. Preserve Writer hidden overload behavior, no move/lifetime or fake provider. Bound45paths, strict whole shared/Calc raw100/related Writer tests/portable build/source gates/pins/hashes and clean calc.

## Verify Steps

Original SfxItemSet copy constructor with SET/INVALID/DISABLED and parent/ranges/pool, independent mutable deltas, slicing real derived set without calling virtual Clone, empty ranges. CloneAsValue defaults and includeItems false, same/foreign pool SET-only semantics, parent/state rules and base-only debug-precondition host guard. Preserve SwAttrSet native CloneAsValue overload and Clone behavior; annotate override only where TypeScript requires it, measure Writer changed-owner gaps but do not repair coverage-only gaps. SfxPoolItem isSetItem false for normal items and true for set items; original SfxItemPresentation Nameless0Complete1. SfxSetItem abstract base, Which/value and copy(pool) construction, independent owned set, concrete same-type nested Equals(true), retained pool/parent identity comparisons; SvxSetItem explicit initial set/copy/default-pool/foreign-pool Clone. Both erased native initial argument categories copy the source, no move/reset. Real OUString base GetPresentation false leaves text; Svx false clears text, all parameters ignored. Calc183/184 sets have actual upstream ranges148,150-152,156-157,160,163-166 and start empty; no fake dynamic ItemInfo provider. Whole changed shared executable owners and whole Calc every raw S/B/F/L counter positive100, related actual Writer tests, reference links absent during tests/build and restored finally. Scoped prettier/eslint, typecheck/docs/size/dependencies/tree/provenance/inventory/routing/doctor/diff, module-boundary tests, production build. Pin actual native sources, audit exact45paths and source hashes, clean calc. Full suite remains human readiness-gated to real minimum UI plus same-model ODS then repair/pause.

## Verification

Pending execution.

## Rollback Plan

Revert only task changes through a subsequent authorized task; no destructive reset, merge or publication.

## Findings

Native SfxSetItem rvalue overload initializes maSet(pS), which copies the named lvalue. Preserve source behavior and do not infer a move from the signature or build memory machinery. Native CloneAsValue asserts base type; construction from a derived source uses real base copy instead. Existing SwAttrSet hides the C++ nonvirtual method with its native own return type; TypeScript requires an override annotation without new Writer behavior. Same-agent quality review is not independent.
