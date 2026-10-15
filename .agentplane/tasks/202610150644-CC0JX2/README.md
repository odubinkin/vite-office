---
id: "202610150644-CC0JX2"
title: "Implement native text escapement values for EditEngine pool"
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
  updated_at: "2026-10-15T06:45:16.303Z"
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
    body: "Start: native shared escapement constructor/value/Any family for actual EditEngine text defaults; preserve auto/manual quirks and reuse shared primitives, localization deferred."
events:
  -
    type: "status"
    at: "2026-10-15T06:45:22.381Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: native shared escapement constructor/value/Any family for actual EditEngine text defaults; preserve auto/manual quirks and reuse shared primitives, localization deferred."
doc_version: 3
doc_updated_at: "2026-10-15T06:45:22.381Z"
doc_updated_by: "CODER"
description: "Task150 ports original shared SvxEscapementItem, its constants/enum/member contracts and actual EditEngine0/100default witness. This is a missing real rich-text pool dependency; reuse shared SfxPoolItem/Any/Any2Bool, no fake engine/document or localized presentation."
sections:
  Summary: "Task150 implements native SvxEscapementItem value family as a missing actual EditEngine rich-text pool dependency."
  Scope: "At most24intentional non-agent paths: textitem.escapement.ts and canonical escapementitem.ts header; existing svxenum/memberids declarations, direct value tests with actual EditEngine default identity/source witness, matched runtime/provenance/capability records and calc-core/suspected-source docs. Actual constructor/copy/Clone/equality/Get/Set/enum/Any behavior and original constants. Necessary responsibility split because existing textitem.ts451lines plus full escapement owner exceeds500; no convenience naming exception. UI-localized GetPresentation deferred; no engine/pool facade, native memory manager, fake runtime ABI or new scalar query projection."
  Plan: "Port actual missing SvxEscapementItem complete value/typed member family, exact defaults/declarations and source transition semantics; reuse shared primitives, strict raw100 related/Calc, gates/build/inventory/source audit and24path clean calc finish."
  Verify Steps: "Compare escapementitem.hxx/textitem.cxx, actual4SvxEscapement enum declarations,3memberIDs and actual eerdll.cxx default0/100 with EE identity from original solar/eeitem offsets. Test all constructor/factory/copy forms, setters cast short/unsigned8, enum fallthrough/sign getter, clone independent Which-preserving and payload equality ignoring Which. Query real Any short/byte/bool incl signed8 output, unsigned8 member and ignored twips, unknown unchanged success, inherited no-argument undefined. Put native numeric extraction/ranges and nonmutation, height1..100, bool and int32 Any2Bool/failure fallback, auto-positive/negative/off decrements and unchanged proportional height. Record surprising auto-off boundary in Calc suspected file without changing behavior. Entire new/changed shared executable owners and whole Calc every raw S/B/F/L counter positive100; related enum/Any2Bool consumers tests as needed, no Writer-only coverage repairs. Four references absent during tests/build and restored finally. All13scoped source gates incl39boundary cases, inventory zero semantic violations, justified filename split, native source pins/exact24path bound/hashes and clean calc. No compiler/probes; full suite only on actual minimum connected UI plus same-model ODS then applicable repairs/pause."
  Verification: "Pending execution."
  Rollback Plan: "Revert intentional paths in a later authorized task; no reset/merge/publication."
  Findings: "Automatic on/off selectors do not reset proportional height; turning off an auto marker decrements magnitude14000to13999 rather than restoring ordinary33/-8. Preserve and document source behavior. Localized presentation is deferred, actual EditEngine/EditTextObject/ScPageHFItem and full Calc pool/model/UI/ODS remain pending. Same-agent evaluation is not independent."
id_source: "generated"
---
## Summary

Task150 implements native SvxEscapementItem value family as a missing actual EditEngine rich-text pool dependency.

## Scope

At most24intentional non-agent paths: textitem.escapement.ts and canonical escapementitem.ts header; existing svxenum/memberids declarations, direct value tests with actual EditEngine default identity/source witness, matched runtime/provenance/capability records and calc-core/suspected-source docs. Actual constructor/copy/Clone/equality/Get/Set/enum/Any behavior and original constants. Necessary responsibility split because existing textitem.ts451lines plus full escapement owner exceeds500; no convenience naming exception. UI-localized GetPresentation deferred; no engine/pool facade, native memory manager, fake runtime ABI or new scalar query projection.

## Plan

Port actual missing SvxEscapementItem complete value/typed member family, exact defaults/declarations and source transition semantics; reuse shared primitives, strict raw100 related/Calc, gates/build/inventory/source audit and24path clean calc finish.

## Verify Steps

Compare escapementitem.hxx/textitem.cxx, actual4SvxEscapement enum declarations,3memberIDs and actual eerdll.cxx default0/100 with EE identity from original solar/eeitem offsets. Test all constructor/factory/copy forms, setters cast short/unsigned8, enum fallthrough/sign getter, clone independent Which-preserving and payload equality ignoring Which. Query real Any short/byte/bool incl signed8 output, unsigned8 member and ignored twips, unknown unchanged success, inherited no-argument undefined. Put native numeric extraction/ranges and nonmutation, height1..100, bool and int32 Any2Bool/failure fallback, auto-positive/negative/off decrements and unchanged proportional height. Record surprising auto-off boundary in Calc suspected file without changing behavior. Entire new/changed shared executable owners and whole Calc every raw S/B/F/L counter positive100; related enum/Any2Bool consumers tests as needed, no Writer-only coverage repairs. Four references absent during tests/build and restored finally. All13scoped source gates incl39boundary cases, inventory zero semantic violations, justified filename split, native source pins/exact24path bound/hashes and clean calc. No compiler/probes; full suite only on actual minimum connected UI plus same-model ODS then applicable repairs/pause.

## Verification

Pending execution.

## Rollback Plan

Revert intentional paths in a later authorized task; no reset/merge/publication.

## Findings

Automatic on/off selectors do not reset proportional height; turning off an auto marker decrements magnitude14000to13999 rather than restoring ordinary33/-8. Preserve and document source behavior. Localized presentation is deferred, actual EditEngine/EditTextObject/ScPageHFItem and full Calc pool/model/UI/ODS remain pending. Same-agent evaluation is not independent.
