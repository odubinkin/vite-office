---
id: "202610141838-426QVV"
title: "Implement shared native item-info packages and pool registration"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 7
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
doc_updated_at: "2026-10-15T04:10:58.412Z"
doc_updated_by: "CODER"
description: "Task141 ports actual ItemInfo/Static/Dynamic/Package and single-pool package registration/default lookup/slot mapping in existing SfxItemPool. Reuse shared set items for actual Calc-style dynamic witnesses. Ordinary JS fields/Maps/GC replace ownership storage; no reference counts, weak managers or native memory machinery. Native pool chains/user defaults/full Calc DocPool remain unported."
sections:
  Summary: "Task141 advances the actual ScDocumentPool prerequisite with shared ItemInfo/Static/Dynamic/Package contracts and native package registration/default lookup and single-pool slot mapping in the existing SfxItemPool. User continuation authorizes canonical shared/core work in calc."
  Scope: "At most35intentional source/doc/inventory paths: existing svl itempool/poolitem owners, canonical itempool header, logical default classification flags, native package/class registration and lookup, focused tests including real Calc183/184 set-item dynamic catalog witnesses, source-backed registry/capability and calc-core/suspected-issues documentation. Existing Writer browser default factories remain their current distinct adapter API. No actual Calc default package fabricated before missing real types exist; no secondary pool chain, ItemInfoUser/user default, surrogate registration/lifetime/cache engine, refcount/free/weak mechanism or native build/probe. Ordinary JS object references and Maps own data under GC. C++ friend-only setters stay protected/private; narrowly erased structural access models only the original native friend calls."
  Plan: "Implement actual shared ItemInfo metadata/default/package contracts and single-pool native registration/lookup/slot mapping using existing SfxItemPool and Calc183/184 real set-item witnesses. Bound35paths; logical classification only, ordinary GC storage, exact erased native friend access and no lifetime engine. Strict whole shared/Calc raw100, relevant Writer tests, portable build/source gates/pins/hashes/clean calc; real Calc package and chains/user defaults remain pending."
  Verify Steps: "ItemInfo native3field/copy values and unsigned16 narrowing. Static/Dynamic getItem identity/null and original static/dynamic default tags; ordinary items/clones have false tags, no reference counting. Protected replacement marks new nonnull static item and allows null; source-independent metadata copy. ItemInfoPackage native protected abstract access, default shared EMPTY0/null result, nonzero slot map and cache identity, skipzero slots, empty-map rescan and duplicate-slot host debug-precondition guard. Native single-pool registration: original getItemInfo receives actual pool, uses provided static/dynamic entries unchanged, missing-item callback produces actual ItemInfoDynamic, derives first/last range and map, reads native default identity without clone. Reject original invalid empty/noncontiguous/repeated packages, missing/null callbacks at host assertion boundary, no fabricated success. Existing flat browser default registry/factories retain their behavior when no native package exists. IsSlot/first/last/range and single-pool Which/Slot mapping with identity fallbacks, default bDeep and explicit false; pool chains are not supplied or certified. Real Calc183/184 nested-set package witnesses retain pool-specific defaults and exact ranges148,150-152,156-157,160,163-166 with independent document pools. Whole changed shared executable owners and whole Calc every raw S/B/F/L counter positive100, related actual Writer tests; four source links absent during tests/build/restored finally. Scoped prettier/eslint, typecheck/docs/size/dependencies/tree/provenance/inventory/routing/doctor/diff and boundary tests, production build. Pin actual native headers/bodies, exact35paths/source hashes/clean calc. Writer-only coverage gaps exempt. Full suite remains human-gated to actual minimum connected UI plus same-model ODS, then repair/pause."
  Verification: |-
    - Command: `node output/playwright/task141-checks/portable.mjs`.
    - Result: pass.
    - Evidence:46related cases/6files;2complete changed shared executable owners strict raw S133/B71/F46/L116 at100, every counter positive. WholeCalc181cases/71files,33owners raw S4172/B2731/F821/L3720 at100, every counter positive. All4source reference links absent during tests/restored in finally. Relevant existing Writer default/factory, notification/history and browser-component consumers pass unchanged. No Writer source owner changed or coverage-only repair, no repository threshold/exclusion/map modifications.
    - Scope: original metadata/copy/narrowing/default identity/classification, private/protected native friend calls, native EMPTY and empty/nonempty slot-cache behavior, single-pool package registration/default lookup/ranges/slot conversion and host errors for original invalid/debug cases. Actual Calc183/184 dynamic set-package witnesses bind defaults to separate real pools and exact native ranges; zero witness slot IDs do not claim the unported Calc SID table or complete ScDocumentPool.

    - Command: `node output/playwright/task141-checks/build-portable.mjs`.
    - Result: pass.
    - Evidence:production build with4source links absent/restored finally. Existing chunk-size advisory retained.
    - Scope: application compilation/bundling; no frontend behavior change or browser-flow replay required.

    - Command: scoped `npx prettier --check`, `npx eslint ... --max-warnings 0`, `npm run typecheck`, `npm run check:docs`, `npm run check:file-size`, `npm run check:dependencies`, `npm run check:source-tree`, `npm run check:source-provenance`, `npm run inventory:parity`, `node .agentplane/policy/check-routing.mjs`, `ap doctor`, `git diff --check`, `npx vitest run scripts/check-module-boundaries.test.ts`.
    - Result: pass after the original private-friend compiler access was made visible to TypeScript through exact constant-member access.
    - Evidence:1893authored JSDoc files,635runtime dependency sources/2841relative imports/94allowed edges,114required tree paths/33retired roots,636runtime/provenance records/zero semantic violations,38boundary tests.13source gates pass. Initial TS unused-private-method failure is retained in typecheck-initial.log and task Findings; no widened public setter, private API deletion, lint/typecheck suppression or runtime access adapter. Existing managed hook-shim warning unchanged.
    - Scope:14intentional paths within35approved;3runtime/provenance pairs and one bounded capability.3819to3824non-agent source hashes,9existing changes/5new/3810unchanged,6native source pins/original native HEAD/four restored links/calc branch. Source audit directly checks original three fields, actual native friends/boolean classifications, shared EMPTY, empty-map/skipzero conditions, actual requesting-pool registration/dynamic constructor and first/last range. Evidence: `output/playwright/task141-checks/verification.json`, `source-gates.json`, `source-contract-audit.json` and retained logs. This is source comparison, not generated/compiled C++/ABI/native memory evidence. Same-agent evaluator is not independent.

    CALC-120 records the all-zero slot-map rescan as a possible redundant-work concern, not a confirmed bug; the source condition is preserved. Static/dynamic classification is value metadata only, object lifetime remains JS GC. No reference counting, weak/deletion/disposal manager, pool/user/secondary-chain or surrogate registration engine was added. Existing flat browser factory/default API is explicitly separate and retained for pools without native packages; complete native Writer/Calc pool architecture is not certified. ItemInfoUser/chains/full pool copying, complete ScDocumentPool and real document/UI/ODS remain pending. Human full-suite/pause checkpoint remains actual minimum connected UI+ODS readiness and is not yet reached.
  Rollback Plan: "Revert only intentional task changes through a subsequent authorized task; no reset, merge or publication."
  Findings: |-
    ItemInfo owns attribute metadata/default references, not an object memory manager. Logical static/dynamic flags preserve source classification only; all lifetime uses JS GC. Native ItemInfoStatic/Dynamic and Package are explicit friends of private/protected setters: TS compiler-only structural casts bridge that access without widening public APIs or adding runtime machinery. Single-pool registration is a real original path; secondary pools/user defaults and complete Calc item package remain pending. Source map cache is checked for actual empty-map behavior, not inferred from its comment. Same-agent quality review is not independent.

    - Observation: Initial TypeScript check treats the original private ItemInfoStatic.setItem method as unused when its native friend call is erased through an unrelated structural type.
      Impact: Compiler-only C++ friendship binding issue; no runtime test failure or scope drift.
      Resolution: Use one exact typed constant-member access at ItemInfoPackage native friend call, preserving private visibility and allowing TS to track the actual method reference. Protected default flags retain narrow erased friend casts; no public APIs or runtime access engine are added.
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

- Command: `node output/playwright/task141-checks/portable.mjs`.
- Result: pass.
- Evidence:46related cases/6files;2complete changed shared executable owners strict raw S133/B71/F46/L116 at100, every counter positive. WholeCalc181cases/71files,33owners raw S4172/B2731/F821/L3720 at100, every counter positive. All4source reference links absent during tests/restored in finally. Relevant existing Writer default/factory, notification/history and browser-component consumers pass unchanged. No Writer source owner changed or coverage-only repair, no repository threshold/exclusion/map modifications.
- Scope: original metadata/copy/narrowing/default identity/classification, private/protected native friend calls, native EMPTY and empty/nonempty slot-cache behavior, single-pool package registration/default lookup/ranges/slot conversion and host errors for original invalid/debug cases. Actual Calc183/184 dynamic set-package witnesses bind defaults to separate real pools and exact native ranges; zero witness slot IDs do not claim the unported Calc SID table or complete ScDocumentPool.

- Command: `node output/playwright/task141-checks/build-portable.mjs`.
- Result: pass.
- Evidence:production build with4source links absent/restored finally. Existing chunk-size advisory retained.
- Scope: application compilation/bundling; no frontend behavior change or browser-flow replay required.

- Command: scoped `npx prettier --check`, `npx eslint ... --max-warnings 0`, `npm run typecheck`, `npm run check:docs`, `npm run check:file-size`, `npm run check:dependencies`, `npm run check:source-tree`, `npm run check:source-provenance`, `npm run inventory:parity`, `node .agentplane/policy/check-routing.mjs`, `ap doctor`, `git diff --check`, `npx vitest run scripts/check-module-boundaries.test.ts`.
- Result: pass after the original private-friend compiler access was made visible to TypeScript through exact constant-member access.
- Evidence:1893authored JSDoc files,635runtime dependency sources/2841relative imports/94allowed edges,114required tree paths/33retired roots,636runtime/provenance records/zero semantic violations,38boundary tests.13source gates pass. Initial TS unused-private-method failure is retained in typecheck-initial.log and task Findings; no widened public setter, private API deletion, lint/typecheck suppression or runtime access adapter. Existing managed hook-shim warning unchanged.
- Scope:14intentional paths within35approved;3runtime/provenance pairs and one bounded capability.3819to3824non-agent source hashes,9existing changes/5new/3810unchanged,6native source pins/original native HEAD/four restored links/calc branch. Source audit directly checks original three fields, actual native friends/boolean classifications, shared EMPTY, empty-map/skipzero conditions, actual requesting-pool registration/dynamic constructor and first/last range. Evidence: `output/playwright/task141-checks/verification.json`, `source-gates.json`, `source-contract-audit.json` and retained logs. This is source comparison, not generated/compiled C++/ABI/native memory evidence. Same-agent evaluator is not independent.

CALC-120 records the all-zero slot-map rescan as a possible redundant-work concern, not a confirmed bug; the source condition is preserved. Static/dynamic classification is value metadata only, object lifetime remains JS GC. No reference counting, weak/deletion/disposal manager, pool/user/secondary-chain or surrogate registration engine was added. Existing flat browser factory/default API is explicitly separate and retained for pools without native packages; complete native Writer/Calc pool architecture is not certified. ItemInfoUser/chains/full pool copying, complete ScDocumentPool and real document/UI/ODS remain pending. Human full-suite/pause checkpoint remains actual minimum connected UI+ODS readiness and is not yet reached.

## Rollback Plan

Revert only intentional task changes through a subsequent authorized task; no reset, merge or publication.

## Findings

ItemInfo owns attribute metadata/default references, not an object memory manager. Logical static/dynamic flags preserve source classification only; all lifetime uses JS GC. Native ItemInfoStatic/Dynamic and Package are explicit friends of private/protected setters: TS compiler-only structural casts bridge that access without widening public APIs or adding runtime machinery. Single-pool registration is a real original path; secondary pools/user defaults and complete Calc item package remain pending. Source map cache is checked for actual empty-map behavior, not inferred from its comment. Same-agent quality review is not independent.

- Observation: Initial TypeScript check treats the original private ItemInfoStatic.setItem method as unused when its native friend call is erased through an unrelated structural type.
  Impact: Compiler-only C++ friendship binding issue; no runtime test failure or scope drift.
  Resolution: Use one exact typed constant-member access at ItemInfoPackage native friend call, preserving private visibility and allowing TS to track the actual method reference. Protected default flags retain narrow erased friend casts; no public APIs or runtime access engine are added.
