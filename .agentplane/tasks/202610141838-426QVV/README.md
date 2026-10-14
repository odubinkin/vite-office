---
id: "202610141838-426QVV"
title: "Implement shared native item-info packages and pool registration"
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
  updated_at: "2026-10-14T18:39:41.177Z"
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
    body: "Start: port native ItemInfo packages and single-pool registration/defaults for Calc; reuse actual set items, ordinary GC storage and logical default tags without refcount/lifetime machinery."
events:
  -
    type: "status"
    at: "2026-10-14T18:39:46.120Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: port native ItemInfo packages and single-pool registration/defaults for Calc; reuse actual set items, ordinary GC storage and logical default tags without refcount/lifetime machinery."
doc_version: 3
doc_updated_at: "2026-10-14T18:39:46.120Z"
doc_updated_by: "CODER"
description: "Task141 ports actual ItemInfo/Static/Dynamic/Package and single-pool package registration/default lookup/slot mapping in existing SfxItemPool. Reuse shared set items for actual Calc-style dynamic witnesses. Ordinary JS fields/Maps/GC replace ownership storage; no reference counts, weak managers or native memory machinery. Native pool chains/user defaults/full Calc DocPool remain unported."
sections:
  Summary: "Task141 advances the actual ScDocumentPool prerequisite with shared ItemInfo/Static/Dynamic/Package contracts and native package registration/default lookup and single-pool slot mapping in the existing SfxItemPool. User continuation authorizes canonical shared/core work in calc."
  Scope: "At most35intentional source/doc/inventory paths: existing svl itempool/poolitem owners, canonical itempool header, logical default classification flags, native package/class registration and lookup, focused tests including real Calc183/184 set-item dynamic catalog witnesses, source-backed registry/capability and calc-core/suspected-issues documentation. Existing Writer browser default factories remain their current distinct adapter API. No actual Calc default package fabricated before missing real types exist; no secondary pool chain, ItemInfoUser/user default, surrogate registration/lifetime/cache engine, refcount/free/weak mechanism or native build/probe. Ordinary JS object references and Maps own data under GC. C++ friend-only setters stay protected/private; narrowly erased structural access models only the original native friend calls."
  Plan: "Implement actual shared ItemInfo metadata/default/package contracts and single-pool native registration/lookup/slot mapping using existing SfxItemPool and Calc183/184 real set-item witnesses. Bound35paths; logical classification only, ordinary GC storage, exact erased native friend access and no lifetime engine. Strict whole shared/Calc raw100, relevant Writer tests, portable build/source gates/pins/hashes/clean calc; real Calc package and chains/user defaults remain pending."
  Verify Steps: "ItemInfo native3field/copy values and unsigned16 narrowing. Static/Dynamic getItem identity/null and original static/dynamic default tags; ordinary items/clones have false tags, no reference counting. Protected replacement marks new nonnull static item and allows null; source-independent metadata copy. ItemInfoPackage native protected abstract access, default shared EMPTY0/null result, nonzero slot map and cache identity, skipzero slots, empty-map rescan and duplicate-slot host debug-precondition guard. Native single-pool registration: original getItemInfo receives actual pool, uses provided static/dynamic entries unchanged, missing-item callback produces actual ItemInfoDynamic, derives first/last range and map, reads native default identity without clone. Reject original invalid empty/noncontiguous/repeated packages, missing/null callbacks at host assertion boundary, no fabricated success. Existing flat browser default registry/factories retain their behavior when no native package exists. IsSlot/first/last/range and single-pool Which/Slot mapping with identity fallbacks, default bDeep and explicit false; pool chains are not supplied or certified. Real Calc183/184 nested-set package witnesses retain pool-specific defaults and exact ranges148,150-152,156-157,160,163-166 with independent document pools. Whole changed shared executable owners and whole Calc every raw S/B/F/L counter positive100, related actual Writer tests; four source links absent during tests/build/restored finally. Scoped prettier/eslint, typecheck/docs/size/dependencies/tree/provenance/inventory/routing/doctor/diff and boundary tests, production build. Pin actual native headers/bodies, exact35paths/source hashes/clean calc. Writer-only coverage gaps exempt. Full suite remains human-gated to actual minimum connected UI plus same-model ODS, then repair/pause."
  Verification: "Pending execution."
  Rollback Plan: "Revert only intentional task changes through a subsequent authorized task; no reset, merge or publication."
  Findings: "ItemInfo owns attribute metadata/default references, not an object memory manager. Logical static/dynamic flags preserve source classification only; all lifetime uses JS GC. Native ItemInfoStatic/Dynamic and Package are explicit friends of private/protected setters: TS compiler-only structural casts bridge that access without widening public APIs or adding runtime machinery. Single-pool registration is a real original path; secondary pools/user defaults and complete Calc item package remain pending. Source map cache is checked for actual empty-map behavior, not inferred from its comment. Same-agent quality review is not independent."
id_source: "generated"
---
## Summary

Task141 advances the actual ScDocumentPool prerequisite with shared ItemInfo/Static/Dynamic/Package contracts and native package registration/default lookup and single-pool slot mapping in the existing SfxItemPool. User continuation authorizes canonical shared/core work in calc.

## Scope

At most35intentional source/doc/inventory paths: existing svl itempool/poolitem owners, canonical itempool header, logical default classification flags, native package/class registration and lookup, focused tests including real Calc183/184 set-item dynamic catalog witnesses, source-backed registry/capability and calc-core/suspected-issues documentation. Existing Writer browser default factories remain their current distinct adapter API. No actual Calc default package fabricated before missing real types exist; no secondary pool chain, ItemInfoUser/user default, surrogate registration/lifetime/cache engine, refcount/free/weak mechanism or native build/probe. Ordinary JS object references and Maps own data under GC. C++ friend-only setters stay protected/private; narrowly erased structural access models only the original native friend calls.

## Plan

Implement actual shared ItemInfo metadata/default/package contracts and single-pool native registration/lookup/slot mapping using existing SfxItemPool and Calc183/184 real set-item witnesses. Bound35paths; logical classification only, ordinary GC storage, exact erased native friend access and no lifetime engine. Strict whole shared/Calc raw100, relevant Writer tests, portable build/source gates/pins/hashes/clean calc; real Calc package and chains/user defaults remain pending.

## Verify Steps

ItemInfo native3field/copy values and unsigned16 narrowing. Static/Dynamic getItem identity/null and original static/dynamic default tags; ordinary items/clones have false tags, no reference counting. Protected replacement marks new nonnull static item and allows null; source-independent metadata copy. ItemInfoPackage native protected abstract access, default shared EMPTY0/null result, nonzero slot map and cache identity, skipzero slots, empty-map rescan and duplicate-slot host debug-precondition guard. Native single-pool registration: original getItemInfo receives actual pool, uses provided static/dynamic entries unchanged, missing-item callback produces actual ItemInfoDynamic, derives first/last range and map, reads native default identity without clone. Reject original invalid empty/noncontiguous/repeated packages, missing/null callbacks at host assertion boundary, no fabricated success. Existing flat browser default registry/factories retain their behavior when no native package exists. IsSlot/first/last/range and single-pool Which/Slot mapping with identity fallbacks, default bDeep and explicit false; pool chains are not supplied or certified. Real Calc183/184 nested-set package witnesses retain pool-specific defaults and exact ranges148,150-152,156-157,160,163-166 with independent document pools. Whole changed shared executable owners and whole Calc every raw S/B/F/L counter positive100, related actual Writer tests; four source links absent during tests/build/restored finally. Scoped prettier/eslint, typecheck/docs/size/dependencies/tree/provenance/inventory/routing/doctor/diff and boundary tests, production build. Pin actual native headers/bodies, exact35paths/source hashes/clean calc. Writer-only coverage gaps exempt. Full suite remains human-gated to actual minimum connected UI plus same-model ODS, then repair/pause.

## Verification

Pending execution.

## Rollback Plan

Revert only intentional task changes through a subsequent authorized task; no reset, merge or publication.

## Findings

ItemInfo owns attribute metadata/default references, not an object memory manager. Logical static/dynamic flags preserve source classification only; all lifetime uses JS GC. Native ItemInfoStatic/Dynamic and Package are explicit friends of private/protected setters: TS compiler-only structural casts bridge that access without widening public APIs or adding runtime machinery. Single-pool registration is a real original path; secondary pools/user defaults and complete Calc item package remain pending. Source map cache is checked for actual empty-map behavior, not inferred from its comment. Same-agent quality review is not independent.
