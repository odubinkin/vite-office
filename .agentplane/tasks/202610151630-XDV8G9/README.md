---
id: "202610151630-XDV8G9"
title: "Port native text-object paragraph content values"
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
  updated_at: "2026-10-15T16:31:51.865Z"
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
    body: "Start: real native paragraph content and character/spell-state values, canonical item-set copies and GC value bindings; no high-level pool/text-engine facade."
events:
  -
    type: "status"
    at: "2026-10-15T16:31:54.092Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: real native paragraph content and character/spell-state values, canonical item-set copies and GC value bindings; no high-level pool/text-engine facade."
doc_version: 3
doc_updated_at: "2026-10-15T16:31:54.092Z"
doc_updated_by: "CODER"
description: "Task158 implements original ContentInfo and XEditAttribute text/style/paragraph/character value storage and pool-aware copies from editobj.cxx/editobj2.hxx, genuine WrongList range/value transformations required by copied spell state, original EE Which declarations and SfxStyleFamily, and required SfxItemSet.Set plus GC-owned item-holder value binding. Reuse OUString/SharedString and existing pools/items. Full actual EditTextObject/EditEngine pool, normalization provider and ContentNode-dependent spell operation remain subsequent owners, with no fake factories or memory manager."
sections:
  Summary: "Task158 ports actual paragraph content and character-attribute value owners used by EditTextObject, with their required range/spell-state values and shared item-set copy contract."
  Scope: "At most140intentional non-agent paths: original editeng editobj/editobj2/edtspell/misspellrange/eeitem owners; SfxStyleFamily declaration; existing SVL itemset/itempool/poolitem type signature and GC-owned SfxPoolItemHolder logical value binding only; relevant tests and canonical inventory/capability/provenance/docs. Correct the task157 numeric EE_PARA_JUST test/documentation assumption using actual declarations. No fake EditTextObject/ContentNode/SharedStringPool/EditEngine pool factory, translated UI resources, native compiler/probe, cache/refcount/deletion/ownership manager, or unrelated Writer feature. Normalization and ContentNode-dependent ClearWrongs stay absent until actual providers exist; do not implement no-op/empty success substitutes. Native physical pointer/cache identity and iterator ABI are not reproduced under JS GC."
  Plan: "Implement native EE Which and style-family declarations from actual source offsets; port ContentInfo text/style/family/paragraph/character/spell-state value storage and target-pool copy/equality with genuine XEditAttribute. Restore SfxItemSet.Set deep/shallow/clear semantics used by copy; implement only logical item/pool binding of SfxPoolItemHolder with native public value/access/copy/assignment behavior under ordinary JS references, erasing native memory machinery. Port real WrongList values, copy, query and non-ContentNode text-range transformations with exact unsigned64 invalid sentinel. Reuse existing shared Unicode/items/pools; no fake high-level class. Add direct nonempty/source-backed tests, strict whole-owner shared/Calc coverage, all source gates/build and related Writer tests, then review/verify/commit/finish. This coherent data boundary leads into real EditTextObject/pool/model work, not standalone declaration-only tasks."
  Verify Steps: "Pinned editeng/source/editeng/editobj.cxx and editobj2.hxx, editeng/inc/edtspell.hxx and edtspell.cxx, misspellrange.hxx/cxx, svl/itemset.hxx/itemset.cxx/globalpool.cxx/itempool.cxx and solar.hrc/eeitem.hxx/style.hxx authoritative. EE_ITEMS_START4021, PARA_JUST4037, CHAR_START4042, CHAR_END4077, feature4078..4081, complete61item IDs and9style-family values. ContentInfo default actual SharedString/OUString/Para family and fixed paragraph-character range, text UTF16/copy/stable style/shared views, independent target-pool paragraph/character copies, exact raw positions and feature boundaries, payload equality versus separate spelling equality. SfxItemSet.Set clears first including self-set, intersects declared ranges, deep copies effective SET-only parents, shallow reuses actual PutSet(false); preserve INVALID/DISABLED and return behavior. GC item holder is a logical pool/value binding with native empty/copy/assignment/query and borrowed getters, actual clone/copy/shareability/default cases, no counters/managers/native lifetime APIs. WrongList range/invalid-state constructors/copy/queries/insertion/deletion and all represented methods match source including native unsigned64 wrap and fixed original insertion loop bound; no spell service or fabricated ContentNode. Reuse actual OUString/SharedString/items and pools, not mock providers. All changed/new executable shared owners and all Calc measured raw S/B/F/L100, every raw counter positive and exact owner sets; type-only base Clone signature must prove unchanged emitted behavior or include whole-owner coverage. Related Writer tests, Writer-only coverage gaps exempt. All13source gates, inventory semanticViolationCount0, portable build and applicable related browser regression; source refs absent during tests/build/browser and restored finally, native source pins and <=140intentional paths/exact source hashes/clean calc proof. Full all-app run only on genuine minimum connected UI+same-model ODS readiness, then repairs and pause per user."
  Verification: "Pending actual implementation and deterministic checks. No complete text-engine/pool/document/UI/ODS readiness is claimed."
  Rollback Plan: "Revert only task intentional source and lifecycle artifacts. Preserve user merges and unrelated tasks; no destructive history operations."
  Findings: "Preflight clean calc at266c0fcf76a838e5639513fb964370befa696f29. Actual getEditEngineItemPool uses dynamic_cast EditEngineItemPool across real secondary pools, then actual EditEngine.CreatePool. SfxItemPool has no full secondary-pool/font/default-engine producer yet; do not fabricate a named generic pool. Actual ContentInfo and XEditAttribute are absent; SharedString exists but SharedStringPool implementation currently only has StringWithHash, so NormalizeString cannot be faked. WrongList.ClearWrongs needs actual ContentNode.Len/GetChar/IsFeature; leave this absent until its owner exists. Native OWN_ATTR_VALUE_END4020 means EE_ITEMS_START4021 and PARA_JUST4037; task157 used arbitrary4016 in a constructor test but incorrectly described it as the actual EE identity. Correct via canonical constants; runtime pool/document was not implemented and unaffected. Earlier bounded read searches found no full field/bullet/font-variation/grab-bag defaults, so complete engine factory remains subsequent work. Native item-holder memory registration/refcounts/caches are deliberately erased under user JS-GC instruction; preserve logical value/pool/copy contracts without a memory-management library."
id_source: "generated"
---
## Summary

Task158 ports actual paragraph content and character-attribute value owners used by EditTextObject, with their required range/spell-state values and shared item-set copy contract.

## Scope

At most140intentional non-agent paths: original editeng editobj/editobj2/edtspell/misspellrange/eeitem owners; SfxStyleFamily declaration; existing SVL itemset/itempool/poolitem type signature and GC-owned SfxPoolItemHolder logical value binding only; relevant tests and canonical inventory/capability/provenance/docs. Correct the task157 numeric EE_PARA_JUST test/documentation assumption using actual declarations. No fake EditTextObject/ContentNode/SharedStringPool/EditEngine pool factory, translated UI resources, native compiler/probe, cache/refcount/deletion/ownership manager, or unrelated Writer feature. Normalization and ContentNode-dependent ClearWrongs stay absent until actual providers exist; do not implement no-op/empty success substitutes. Native physical pointer/cache identity and iterator ABI are not reproduced under JS GC.

## Plan

Implement native EE Which and style-family declarations from actual source offsets; port ContentInfo text/style/family/paragraph/character/spell-state value storage and target-pool copy/equality with genuine XEditAttribute. Restore SfxItemSet.Set deep/shallow/clear semantics used by copy; implement only logical item/pool binding of SfxPoolItemHolder with native public value/access/copy/assignment behavior under ordinary JS references, erasing native memory machinery. Port real WrongList values, copy, query and non-ContentNode text-range transformations with exact unsigned64 invalid sentinel. Reuse existing shared Unicode/items/pools; no fake high-level class. Add direct nonempty/source-backed tests, strict whole-owner shared/Calc coverage, all source gates/build and related Writer tests, then review/verify/commit/finish. This coherent data boundary leads into real EditTextObject/pool/model work, not standalone declaration-only tasks.

## Verify Steps

Pinned editeng/source/editeng/editobj.cxx and editobj2.hxx, editeng/inc/edtspell.hxx and edtspell.cxx, misspellrange.hxx/cxx, svl/itemset.hxx/itemset.cxx/globalpool.cxx/itempool.cxx and solar.hrc/eeitem.hxx/style.hxx authoritative. EE_ITEMS_START4021, PARA_JUST4037, CHAR_START4042, CHAR_END4077, feature4078..4081, complete61item IDs and9style-family values. ContentInfo default actual SharedString/OUString/Para family and fixed paragraph-character range, text UTF16/copy/stable style/shared views, independent target-pool paragraph/character copies, exact raw positions and feature boundaries, payload equality versus separate spelling equality. SfxItemSet.Set clears first including self-set, intersects declared ranges, deep copies effective SET-only parents, shallow reuses actual PutSet(false); preserve INVALID/DISABLED and return behavior. GC item holder is a logical pool/value binding with native empty/copy/assignment/query and borrowed getters, actual clone/copy/shareability/default cases, no counters/managers/native lifetime APIs. WrongList range/invalid-state constructors/copy/queries/insertion/deletion and all represented methods match source including native unsigned64 wrap and fixed original insertion loop bound; no spell service or fabricated ContentNode. Reuse actual OUString/SharedString/items and pools, not mock providers. All changed/new executable shared owners and all Calc measured raw S/B/F/L100, every raw counter positive and exact owner sets; type-only base Clone signature must prove unchanged emitted behavior or include whole-owner coverage. Related Writer tests, Writer-only coverage gaps exempt. All13source gates, inventory semanticViolationCount0, portable build and applicable related browser regression; source refs absent during tests/build/browser and restored finally, native source pins and <=140intentional paths/exact source hashes/clean calc proof. Full all-app run only on genuine minimum connected UI+same-model ODS readiness, then repairs and pause per user.

## Verification

Pending actual implementation and deterministic checks. No complete text-engine/pool/document/UI/ODS readiness is claimed.

## Rollback Plan

Revert only task intentional source and lifecycle artifacts. Preserve user merges and unrelated tasks; no destructive history operations.

## Findings

Preflight clean calc at266c0fcf76a838e5639513fb964370befa696f29. Actual getEditEngineItemPool uses dynamic_cast EditEngineItemPool across real secondary pools, then actual EditEngine.CreatePool. SfxItemPool has no full secondary-pool/font/default-engine producer yet; do not fabricate a named generic pool. Actual ContentInfo and XEditAttribute are absent; SharedString exists but SharedStringPool implementation currently only has StringWithHash, so NormalizeString cannot be faked. WrongList.ClearWrongs needs actual ContentNode.Len/GetChar/IsFeature; leave this absent until its owner exists. Native OWN_ATTR_VALUE_END4020 means EE_ITEMS_START4021 and PARA_JUST4037; task157 used arbitrary4016 in a constructor test but incorrectly described it as the actual EE identity. Correct via canonical constants; runtime pool/document was not implemented and unaffected. Earlier bounded read searches found no full field/bullet/font-variation/grab-bag defaults, so complete engine factory remains subsequent work. Native item-holder memory registration/refcounts/caches are deliberately erased under user JS-GC instruction; preserve logical value/pool/copy contracts without a memory-management library.
