---
id: "202610050044-KV0T73"
title: "Restore native empty hint ownership through erasure"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 10
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
task_kind: "code"
mutation_scope: "code"
verify:
  - "ap doctor"
  - "node .agentplane/policy/check-routing.mjs"
  - "npm exec -- playwright test --config apps/office/playwright.config.ts"
  - "npm exec -- tsx scripts/generate-writer-ui-resources.ts --check"
  - "npm exec -- vitest run scripts/check-source-provenance.test.ts scripts/writer-ui-resource-model.test.ts"
  - "npm run check:dependencies"
  - "npm run check:docs"
  - "npm run check:file-size"
  - "npm run check:source-provenance"
  - "npm run check:source-tree"
  - "npm run format:check"
  - "npm run inventory:invariants"
  - "npm run inventory:parity"
  - "npm run lint"
  - "npm run test:coverage --workspace @vite-office/office -- --coverage.reportOnFailure"
  - "npm run test:inventory:coverage -- --coverage.reportOnFailure"
  - "npm run test:static"
  - "npm run typecheck"
plan_approval:
  state: "approved"
  updated_at: "2026-10-05T01:01:32.458Z"
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
    body: "Start: Restore native no-dummy empty range ownership/erase GC/default insertion under standing goal authorization;retain flag and broader native gaps."
  -
    author: "CODER"
    body: "Start: continue approved zero-hint ownership and bounded native CutImpl expectation corrections under the standing parity goal;one absent profile retained and failed-only replays."
events:
  -
    type: "status"
    at: "2026-10-05T00:44:57.986Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: Restore native no-dummy empty range ownership/erase GC/default insertion under standing goal authorization;retain flag and broader native gaps."
  -
    type: "status"
    at: "2026-10-05T01:01:32.923Z"
    author: "CODER"
    from: "DOING"
    to: "DOING"
    note: "Start: continue approved zero-hint ownership and bounded native CutImpl expectation corrections under the standing parity goal;one absent profile retained and failed-only replays."
doc_version: 3
doc_updated_at: "2026-10-05T01:01:32.923Z"
doc_updated_by: "CODER"
description: "Restore native zero-length no-dummy ranged AUTO53/INET54 hint ownership through erasure and ordinary default insertion. Keep meaningful zero ranges in SwpHints instead of pruning all start==end;ignore zero ranges during AUTO adjacent merging and nonempty overlap detection while preserving rejection of overlapping positive ranges. Add native CanBeDeleted contract and use it at existing node hint release boundaries. Add source-owned EraseTextHints pre-erasure garbage collection:only hints starting inside inclusive deletion bounds with end strictly before deletion end are dropped for these implemented families;end-equal hints survive and negative Update collapses them to actual zero ranges. Keep generic negative Update separate from erasure GC. Expose SwpHints.EraseText and route existing pure node deletion to it;zero-count deletion retains actual meaningful map and releases allocated empty map. Port default InsertText zero-point postprocessing:at insertion point DontExpand zero hints return to old point,other zero hints move to insertion end and stay empty;paragraph-start expansion applies only to nonempty ranges. Existing assertTextRange moves unchanged to existing ndhints-range to retain1000-line gates;map its added export. Add one literal source-independent test file for both families/eight flag masks/native erasure boundary matrix and zero insertion boundaries,owned item/map/backlinks/style IDs,nonempty normalization guards,query/projection inactivity,clones/node copies/graph16/Worker5 and actual history paths. Preserve356prior test files unless a demonstrated native empty-hint expectation requires an explicitly recorded correction;do not weaken tests. Preserve241existing runtime states/defaults/exceptions;four bounded appendices and added range-helper export only,no new module/promotion. Six static gates then one sequential five-suite absent-reference profile/finally restore;failed-only replays;five restored source audits afterward. Exact scope/native hashes/artifact audit,same-actor readonly exact-SHA quality,doctor/routing,recorded verification/canonical finish. Native Insert flags/EMPTY/FORCE/NOHINT/selection replacement,GCAttr invocation/full zero-range slicing/COPY/BuildPortions/dummy/endless/other families/client/UNO/refcounts/full core/UI remain unverified. No network/global reads/saved helpers/upstream source artifacts or upstream runtime invocation. Registered save/open/recovery deviations remain unchanged."
sections:
  Summary: "Restore native empty-hint ownership through erasure and default insertion."
  Scope: |-
    - apps/office/src/sw/source/core/txtnode/ndtxt.ts
    - apps/office/src/sw/source/core/txtnode/ndhints.ts
    - apps/office/src/sw/source/core/txtnode/ndtxt-hint-update.ts
    - apps/office/src/sw/source/core/txtnode/ndhints-range.ts
    - apps/office/src/sw/source/core/txtnode/native-empty-hint-ownership.test.ts
    - docs/program/source-provenance.json
    - docs/program/parity/runtime-inventory.json
    - apps/office/src/sw/source/core/doc/text-hint-copy.test.ts
    - apps/office/src/sw/source/core/doc/text-hint-cut.test.ts
    - apps/office/src/sw/source/core/doc/owned-text-move.test.ts
    - apps/office/src/sw/source/core/txtnode/owned-hint-cut.test.ts
    - apps/office/src/sw/source/core/txtnode/owned-hint-notifications.test.ts
    - apps/office/src/sw/source/core/txtnode/secondary-hint-transfer.test.ts
    - apps/office/src/sw/source/core/txtnode/internet-node-ownership.test.ts
  Plan: "Restore native zero-length no-dummy ranged AUTO53/INET54 hint ownership through erasure and ordinary default insertion. Keep meaningful zero ranges in SwpHints instead of pruning all start==end;ignore zero ranges during AUTO adjacent merging and nonempty overlap detection while preserving rejection of overlapping positive ranges. Add native CanBeDeleted contract and use it at existing node hint release boundaries. Add source-owned EraseTextHints pre-erasure garbage collection:only hints starting inside inclusive deletion bounds with end strictly before deletion end are dropped for these implemented families;end-equal hints survive and negative Update collapses them to actual zero ranges. Keep generic negative Update separate from erasure GC. Expose SwpHints.EraseText and route existing pure node deletion to it;zero-count deletion retains actual meaningful map and releases allocated empty map. Port default InsertText zero-point postprocessing:at insertion point DontExpand zero hints return to old point,other zero hints move to insertion end and stay empty;paragraph-start expansion applies only to nonempty ranges. Existing assertTextRange moves unchanged to existing ndhints-range to retain1000-line gates;map its added export. Add one literal source-independent test file for both families/eight flag masks/native erasure boundary matrix and zero insertion boundaries,owned item/map/backlinks/style IDs,nonempty normalization guards,query/projection inactivity,clones/node copies/graph16/Worker5 and actual history paths. Preserve356prior test files unless a demonstrated native empty-hint expectation requires an explicitly recorded correction;do not weaken tests. Preserve241existing runtime states/defaults/exceptions;four bounded appendices and added range-helper export only,no new module/promotion. Six static gates then one sequential five-suite absent-reference profile/finally restore;failed-only replays;five restored source audits afterward. Exact scope/native hashes/artifact audit,same-actor readonly exact-SHA quality,doctor/routing,recorded verification/canonical finish. Native Insert flags/EMPTY/FORCE/NOHINT/selection replacement,GCAttr invocation/full zero-range slicing/COPY/BuildPortions/dummy/endless/other families/client/UNO/refcounts/full core/UI remain unverified. No network/global reads/saved helpers/upstream source artifacts or upstream runtime invocation. Registered save/open/recovery deviations remain unchanged. Refinement after first absent profile: native CutImpl2713-2827 reconstructs exact-right-end destination hints while retaining the original source attributes,negative Update collapses them,and MergePortions ignores meaningful zeros. Correct57 obsolete zero-pruning expectations across the seven listed prior test files,keeping all other prior inputs/assertions unchanged and strengthening actual object/map/backlink/range/flag checks. Scope includes these seven test-only paths;349 other prior tests remain byte-identical. Correct only concrete failures in the new fixtures without changing native behavior or transport schemas. The first full absent profile is immutable:2951passed/60failed app cases with100%all coverage;build/inventory109/scripts5/Chromium99 pass. Repeat only demonstrated failed cases absent upstream;no full suite/build replay."
  Verify Steps: |-
    - `npm run format:check`
    - `npm run lint`
    - `npm run typecheck`
    - `npm run check:dependencies`
    - `npm run check:docs`
    - `npm run check:file-size`
    - `npm run test:static`
    - `npm run test:coverage --workspace @vite-office/office -- --coverage.reportOnFailure`
    - `npm run test:inventory:coverage -- --coverage.reportOnFailure`
    - `npm exec -- vitest run scripts/check-source-provenance.test.ts scripts/writer-ui-resource-model.test.ts`
    - `npm exec -- playwright test --config apps/office/playwright.config.ts`
    - `npm exec -- tsx scripts/generate-writer-ui-resources.ts --check`
    - `npm run check:source-tree`
    - `npm run check:source-provenance`
    - `npm run inventory:invariants`
    - `npm run inventory:parity`
    - `ap doctor`
    - `node .agentplane/policy/check-routing.mjs`

    Static first,one absent-reference full profile,failed-only replays,restored source audits afterward. Audit356prior tests/241module states and native hashes. No saved upstream source or helper artifacts.
  Verification: "Pending implementation and validation."
  Rollback Plan: "Revert semantic leaf commit without rewriting history."
  Findings: "Pin26.8.0.2/9bc445578031fecf56086729d8e4940c77e14d65. Native EraseText ndtxt.cxx2849 prunes interior hints ending strictly before deletion end,retains AUTO/INET end-equal ranges,then negative Update preserves actual zero ranges. Native SwpHints CanBeDeleted checks empty start map,not range extent. MergePortions thints.cxx ignores zero AUTO ranges and does not merge internet ranges. Native default InsertText2495 distinguishes empty end-equal hints before paragraph-start expansion,so zero points cannot be indiscriminately expanded by current helper. Existing SwpHints removes every zero range and generic deletion lacks native pre-GC;selection force expansion cannot preserve a fully deleted link until these foundations are repaired. Existing graph/Worker restore uses canonical native hints,so correcting ownership should retain zero primitive records without schema changes. Standing goal authorizes safe local implementation/refactoring. First absent profile: app2951passed/60failed of3011/274files,100%all coverage. Native CutImpl proof shows57 prior failures are obsolete source-zero-pruning expectations,not a transfer implementation regression. Native graph16/Worker5 encode item values and range coordinates but reconstruct constructor flags;transport tests must assert that actual existing contract rather than presumed snapshot flags. No production correction yet after the profile."
id_source: "generated"
---
## Summary

Restore native empty-hint ownership through erasure and default insertion.

## Scope

- apps/office/src/sw/source/core/txtnode/ndtxt.ts
- apps/office/src/sw/source/core/txtnode/ndhints.ts
- apps/office/src/sw/source/core/txtnode/ndtxt-hint-update.ts
- apps/office/src/sw/source/core/txtnode/ndhints-range.ts
- apps/office/src/sw/source/core/txtnode/native-empty-hint-ownership.test.ts
- docs/program/source-provenance.json
- docs/program/parity/runtime-inventory.json
- apps/office/src/sw/source/core/doc/text-hint-copy.test.ts
- apps/office/src/sw/source/core/doc/text-hint-cut.test.ts
- apps/office/src/sw/source/core/doc/owned-text-move.test.ts
- apps/office/src/sw/source/core/txtnode/owned-hint-cut.test.ts
- apps/office/src/sw/source/core/txtnode/owned-hint-notifications.test.ts
- apps/office/src/sw/source/core/txtnode/secondary-hint-transfer.test.ts
- apps/office/src/sw/source/core/txtnode/internet-node-ownership.test.ts

## Plan

Restore native zero-length no-dummy ranged AUTO53/INET54 hint ownership through erasure and ordinary default insertion. Keep meaningful zero ranges in SwpHints instead of pruning all start==end;ignore zero ranges during AUTO adjacent merging and nonempty overlap detection while preserving rejection of overlapping positive ranges. Add native CanBeDeleted contract and use it at existing node hint release boundaries. Add source-owned EraseTextHints pre-erasure garbage collection:only hints starting inside inclusive deletion bounds with end strictly before deletion end are dropped for these implemented families;end-equal hints survive and negative Update collapses them to actual zero ranges. Keep generic negative Update separate from erasure GC. Expose SwpHints.EraseText and route existing pure node deletion to it;zero-count deletion retains actual meaningful map and releases allocated empty map. Port default InsertText zero-point postprocessing:at insertion point DontExpand zero hints return to old point,other zero hints move to insertion end and stay empty;paragraph-start expansion applies only to nonempty ranges. Existing assertTextRange moves unchanged to existing ndhints-range to retain1000-line gates;map its added export. Add one literal source-independent test file for both families/eight flag masks/native erasure boundary matrix and zero insertion boundaries,owned item/map/backlinks/style IDs,nonempty normalization guards,query/projection inactivity,clones/node copies/graph16/Worker5 and actual history paths. Preserve356prior test files unless a demonstrated native empty-hint expectation requires an explicitly recorded correction;do not weaken tests. Preserve241existing runtime states/defaults/exceptions;four bounded appendices and added range-helper export only,no new module/promotion. Six static gates then one sequential five-suite absent-reference profile/finally restore;failed-only replays;five restored source audits afterward. Exact scope/native hashes/artifact audit,same-actor readonly exact-SHA quality,doctor/routing,recorded verification/canonical finish. Native Insert flags/EMPTY/FORCE/NOHINT/selection replacement,GCAttr invocation/full zero-range slicing/COPY/BuildPortions/dummy/endless/other families/client/UNO/refcounts/full core/UI remain unverified. No network/global reads/saved helpers/upstream source artifacts or upstream runtime invocation. Registered save/open/recovery deviations remain unchanged. Refinement after first absent profile: native CutImpl2713-2827 reconstructs exact-right-end destination hints while retaining the original source attributes,negative Update collapses them,and MergePortions ignores meaningful zeros. Correct57 obsolete zero-pruning expectations across the seven listed prior test files,keeping all other prior inputs/assertions unchanged and strengthening actual object/map/backlink/range/flag checks. Scope includes these seven test-only paths;349 other prior tests remain byte-identical. Correct only concrete failures in the new fixtures without changing native behavior or transport schemas. The first full absent profile is immutable:2951passed/60failed app cases with100%all coverage;build/inventory109/scripts5/Chromium99 pass. Repeat only demonstrated failed cases absent upstream;no full suite/build replay.

## Verify Steps

- `npm run format:check`
- `npm run lint`
- `npm run typecheck`
- `npm run check:dependencies`
- `npm run check:docs`
- `npm run check:file-size`
- `npm run test:static`
- `npm run test:coverage --workspace @vite-office/office -- --coverage.reportOnFailure`
- `npm run test:inventory:coverage -- --coverage.reportOnFailure`
- `npm exec -- vitest run scripts/check-source-provenance.test.ts scripts/writer-ui-resource-model.test.ts`
- `npm exec -- playwright test --config apps/office/playwright.config.ts`
- `npm exec -- tsx scripts/generate-writer-ui-resources.ts --check`
- `npm run check:source-tree`
- `npm run check:source-provenance`
- `npm run inventory:invariants`
- `npm run inventory:parity`
- `ap doctor`
- `node .agentplane/policy/check-routing.mjs`

Static first,one absent-reference full profile,failed-only replays,restored source audits afterward. Audit356prior tests/241module states and native hashes. No saved upstream source or helper artifacts.

## Verification

Pending implementation and validation.

## Rollback Plan

Revert semantic leaf commit without rewriting history.

## Findings

Pin26.8.0.2/9bc445578031fecf56086729d8e4940c77e14d65. Native EraseText ndtxt.cxx2849 prunes interior hints ending strictly before deletion end,retains AUTO/INET end-equal ranges,then negative Update preserves actual zero ranges. Native SwpHints CanBeDeleted checks empty start map,not range extent. MergePortions thints.cxx ignores zero AUTO ranges and does not merge internet ranges. Native default InsertText2495 distinguishes empty end-equal hints before paragraph-start expansion,so zero points cannot be indiscriminately expanded by current helper. Existing SwpHints removes every zero range and generic deletion lacks native pre-GC;selection force expansion cannot preserve a fully deleted link until these foundations are repaired. Existing graph/Worker restore uses canonical native hints,so correcting ownership should retain zero primitive records without schema changes. Standing goal authorizes safe local implementation/refactoring. First absent profile: app2951passed/60failed of3011/274files,100%all coverage. Native CutImpl proof shows57 prior failures are obsolete source-zero-pruning expectations,not a transfer implementation regression. Native graph16/Worker5 encode item values and range coordinates but reconstruct constructor flags;transport tests must assert that actual existing contract rather than presumed snapshot flags. No production correction yet after the profile.
