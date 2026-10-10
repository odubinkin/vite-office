---
id: "202610101428-D9PRQV"
title: "Port original shared RTL Unicode data ownership and intern pool for Calc strings"
status: "DOING"
priority: "high"
owner: "CODER"
revision: 10
origin:
  system: "manual"
depends_on: []
tags:
  - "calc"
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-10T14:34:01.047Z"
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
    body: "Start: Port original shared RTL Unicode ownership and intern pool dependency closure with native source evidence on branch calc only."
events:
  -
    type: "status"
    at: "2026-10-10T14:34:02.626Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: Port original shared RTL Unicode ownership and intern pool dependency closure with native source evidence on branch calc only."
doc_version: 3
doc_updated_at: "2026-10-10T14:34:02.626Z"
doc_updated_by: "CODER"
description: "Task34: implement original RTL Unicode buffer/empty/refcount/allocation/copy/assignment and intern/release dependency closure needed by actual OUString/SharedString; reuse existing UTF16 comparison, preserve original source/header/hash owners and defaults, unchanged native comparisons including live identities/payloads/counters/table layout and allocation/free order. Branchcalc only, bounded initialized browser-realm storage, no fake strings/locks, native concurrent ABI not certified. Calc and changed shared coverage100; full cadence task3/10,next41."
sections:
  Summary: "Task34 ports the actual shared RTL Unicode string data, allocation/refcount/copy/assignment and intern pool dependency closure required by original OUString/SharedString for editable Calc. Reuse existing SAL reverse comparison; preserve original defaults, separate static C empty identity, signed32/UInt16 semantics and operation order. This is task3/10 after full task31; next full run is task41."
  Scope: "Only branch calc in /Users/odubinkin/Projects/vite-office-calc. Implementation owners: apps/office/src/sal/inc/rtl/ustring.h.ts, sal/rtl/{strtmpl,ustring,strimp,hash}.ts; optional exact upstream header/platform owners under sal/inc/rtl and sal/osl only if a real required consumer needs them. Tests/fixtures in sal/rtl; scripts/rtl-ustring-ownership-native-probe.mjs; shared provenance/runtime/capability records and generated registry indexes; docs/program/calc-core.md and calc-upstream-suspected-issues.md only for reproduced suspicious behavior; active task artifacts. In scope: concrete initialized UTF16 storage and pointer-slot adaptation, allocation/free hooks, static C empty, native signed refcounts, copy/alias/selfassignment ordering, forward comparison and hashing required by original hash pool, complete hash table probing/growth/removal, intern/release. Browser adaptation explicitly limits synchronization to one synchronous realm; preserve all observable sequential original behavior and record concurrent/ABI/uninitialized-memory gaps. No synthetic OUString/SharedString, new document placeholders, unrelated Writer changes, network, merges or config/gate relaxations."
  Plan: |-
    1. Capture complete pinned original source/header/helper dependencies and unchanged native allocation/refcount/hash/intern/mutex/atomic bodies; define concrete browser storage/pointer/allocator adaptations without substitute string semantics.
    2. Port original shared source/header owners and native defaults/order, keeping separate original C empty identity, complete hash algorithms and real dependency closure; record only native-reproduced suspicious cases while preserving them.
    3. Generate a deterministic initialized native corpus with actual original C++ operations. Compare full live identities/refcounts/length/payload/terminators, allocation/free events, complete table slots/growth/removal, aliasing/selfassignment, hashes/comparisons and fail-fast original guards. Include collision/wrap/growth and replaceable original allocator failures; no native core algorithm rewrites.
    4. Register every source/export/contract with original provenance and derive required mutable-helper inventory from the repository extractor; document limitations and next real UI dependencies.
    5. Run Calc and affected shared coverage with all four metrics100 and all actual counters positive, portable tests with both upstream symlinks absent/restored in finally, affected tooling and static/type/lint/provenance/tree/registry/routing/doctor gates. Serial heavy tests; no full run until task41. Commit implementation; separate EVALUATOR read-only review and quality evidence; finish with route DONE and intentional clean state.
  Verify Steps: |-
    1. node scripts/rtl-ustring-ownership-native-probe.mjs --check: pinned complete bodies/headers and source hashes; compare deterministic full initialized live storage and pool states, original allocator events, guards and exact results. Native concurrent ABI and uninitialized spare bytes explicitly not certified.
    2. npm run test:coverage:calc: all Calc scenarios pass, statements/branches/functions/lines100; inspect coverage-final raw counters and source completeness. Run affected SAL tests with scoped Istanbul include and all four100; portable repeat while both local upstream symlinks are removed and restored in finally.
    3. npm run typecheck; npm run lint; npm run check:docs; npm run check:file-size; npm run check:dependencies; npm run check:source-tree; npm run check:source-provenance; npm run inventory:parity:calc; npm run inventory:parity:shared; affected source-provenance/module-boundary/registry tests; format check on all changed files. All pass without weakening assertions, thresholds, configs, inventory, or source boundaries.
    4. ap doctor; node .agentplane/policy/check-routing.mjs; git diff --check; task verify-show and separate EVALUATOR quality report against actual implementation commit. Verify current branchcalc and git status --short --untracked-files=all contains only intentional task state before close and is clean afterward. Full suite cadence task3/10, next41, not run this task.
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert only intentional task34 implementation and registry/documentation commits via a new authorized forward change if needed; rerun exact scoped gates. Never reset history, modify Writer-only gaps, merge branches, or delete shared upstream assets. Native temporary evidence stays ignored under output/playwright; always restore both symlinks in finally."
  Findings: "Preflight: branchcalc, authoritative direct checkout /Users/odubinkin/Projects/vite-office-calc; only this newly created README is untracked. Existing unrelated DOING tasks C9TN6M and X6VV8G untouched. User ongoing goal and explicit continue authorize safe in-scope implementation. Source evidence: actual hash pool first size2039 and two getNextSize applications on growth; original intern fast branch acquires without releasing old destination. Preserve behavior and document only after actual native proof. Original C static empty differs from future OUString literal empty, so keep identities distinct."
id_source: "generated"
---
## Summary

Task34 ports the actual shared RTL Unicode string data, allocation/refcount/copy/assignment and intern pool dependency closure required by original OUString/SharedString for editable Calc. Reuse existing SAL reverse comparison; preserve original defaults, separate static C empty identity, signed32/UInt16 semantics and operation order. This is task3/10 after full task31; next full run is task41.

## Scope

Only branch calc in /Users/odubinkin/Projects/vite-office-calc. Implementation owners: apps/office/src/sal/inc/rtl/ustring.h.ts, sal/rtl/{strtmpl,ustring,strimp,hash}.ts; optional exact upstream header/platform owners under sal/inc/rtl and sal/osl only if a real required consumer needs them. Tests/fixtures in sal/rtl; scripts/rtl-ustring-ownership-native-probe.mjs; shared provenance/runtime/capability records and generated registry indexes; docs/program/calc-core.md and calc-upstream-suspected-issues.md only for reproduced suspicious behavior; active task artifacts. In scope: concrete initialized UTF16 storage and pointer-slot adaptation, allocation/free hooks, static C empty, native signed refcounts, copy/alias/selfassignment ordering, forward comparison and hashing required by original hash pool, complete hash table probing/growth/removal, intern/release. Browser adaptation explicitly limits synchronization to one synchronous realm; preserve all observable sequential original behavior and record concurrent/ABI/uninitialized-memory gaps. No synthetic OUString/SharedString, new document placeholders, unrelated Writer changes, network, merges or config/gate relaxations.

## Plan

1. Capture complete pinned original source/header/helper dependencies and unchanged native allocation/refcount/hash/intern/mutex/atomic bodies; define concrete browser storage/pointer/allocator adaptations without substitute string semantics.
2. Port original shared source/header owners and native defaults/order, keeping separate original C empty identity, complete hash algorithms and real dependency closure; record only native-reproduced suspicious cases while preserving them.
3. Generate a deterministic initialized native corpus with actual original C++ operations. Compare full live identities/refcounts/length/payload/terminators, allocation/free events, complete table slots/growth/removal, aliasing/selfassignment, hashes/comparisons and fail-fast original guards. Include collision/wrap/growth and replaceable original allocator failures; no native core algorithm rewrites.
4. Register every source/export/contract with original provenance and derive required mutable-helper inventory from the repository extractor; document limitations and next real UI dependencies.
5. Run Calc and affected shared coverage with all four metrics100 and all actual counters positive, portable tests with both upstream symlinks absent/restored in finally, affected tooling and static/type/lint/provenance/tree/registry/routing/doctor gates. Serial heavy tests; no full run until task41. Commit implementation; separate EVALUATOR read-only review and quality evidence; finish with route DONE and intentional clean state.

## Verify Steps

1. node scripts/rtl-ustring-ownership-native-probe.mjs --check: pinned complete bodies/headers and source hashes; compare deterministic full initialized live storage and pool states, original allocator events, guards and exact results. Native concurrent ABI and uninitialized spare bytes explicitly not certified.
2. npm run test:coverage:calc: all Calc scenarios pass, statements/branches/functions/lines100; inspect coverage-final raw counters and source completeness. Run affected SAL tests with scoped Istanbul include and all four100; portable repeat while both local upstream symlinks are removed and restored in finally.
3. npm run typecheck; npm run lint; npm run check:docs; npm run check:file-size; npm run check:dependencies; npm run check:source-tree; npm run check:source-provenance; npm run inventory:parity:calc; npm run inventory:parity:shared; affected source-provenance/module-boundary/registry tests; format check on all changed files. All pass without weakening assertions, thresholds, configs, inventory, or source boundaries.
4. ap doctor; node .agentplane/policy/check-routing.mjs; git diff --check; task verify-show and separate EVALUATOR quality report against actual implementation commit. Verify current branchcalc and git status --short --untracked-files=all contains only intentional task state before close and is clean afterward. Full suite cadence task3/10, next41, not run this task.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert only intentional task34 implementation and registry/documentation commits via a new authorized forward change if needed; rerun exact scoped gates. Never reset history, modify Writer-only gaps, merge branches, or delete shared upstream assets. Native temporary evidence stays ignored under output/playwright; always restore both symlinks in finally.

## Findings

Preflight: branchcalc, authoritative direct checkout /Users/odubinkin/Projects/vite-office-calc; only this newly created README is untracked. Existing unrelated DOING tasks C9TN6M and X6VV8G untouched. User ongoing goal and explicit continue authorize safe in-scope implementation. Source evidence: actual hash pool first size2039 and two getNextSize applications on growth; original intern fast branch acquires without releasing old destination. Preserve behavior and document only after actual native proof. Original C static empty differs from future OUString literal empty, so keep identities distinct.
