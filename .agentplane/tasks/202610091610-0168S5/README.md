---
id: "202610091610-0168S5"
title: "Port Calc boolean row and column segment owners"
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
  updated_at: "2026-10-09T16:11:46.948Z"
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
    body: "Start: Implement approved original boolean segment owners and shared cache/iterator contracts on actual mdds, preserving pinned native evidence and Calc scoped100 gates."
events:
  -
    type: "status"
    at: "2026-10-09T16:11:47.773Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: Implement approved original boolean segment owners and shared cache/iterator contracts on actual mdds, preserving pinned native evidence and Calc scoped100 gates."
doc_version: 3
doc_updated_at: "2026-10-09T16:11:47.773Z"
doc_updated_by: "CODER"
description: "Task8 of resumed interval: port actual segmenttree boolean owners/iterators on shared mdds, preserve original cache/shared-cursor and bounds contracts with pinned native evidence; introduce actual ScGlobal threaded-calculation flag where used."
sections:
  Summary: "Port original Calc boolean row/column flat segment owners and both row iterators over the already shared pinned mdds implementation. Preserve real implementation sharing, inclusive outer bounds, cached hint and owner-shared iteration state."
  Scope: "Calc checkout/branch only, task8 of resumed10. Add sc/inc/segmenttree.ts and sc/source/core/data/segmenttree.ts with complete boolean row/column public methods and needed original internal template specialization. Add the actual ScGlobal threaded-group-calculation flag at its core-data owner and re-export through existing inc/global.ts, preserving original false initialization and assertion preconditions. Native debug assertion uses explicit JS fail-fast diagnostic adaptation; native process-abort/release diagnostic policy remains uncertified. dumpAsString preserves original scalar ASCII text via JS immutable strings; RTL allocation/refcount/buffer capacity is not represented. Numeric UInt16 owners, conditional setters/sums and other ScGlobal services remain follow-up work, not replaced by stubs. Add portable native fixture/tests/probe, Calc runtime/provenance/capability records and update existing global provenance if needed, calc-core/suspected-case docs. Original native classes/method bodies are compiled unchanged for implemented boolean mechanisms with genuine mdds/Boost headers; diagnostic string methods not native-certified until actual RTL linkage exists. No native tree/engine/RTL stand-ins, Writer coverage repair, external writes or merges."
  Plan: "Port original boolean row/column segment owners and iterators over shared mdds, preserve owner cursor/cache/defaults/global preconditions with native evidence; task8 of10."
  Verify Steps: "Run pinned native bool-segment probe --write/--check under ASan/UBSan with unchanged original declarations/needed boolean methods, original global flag definition and genuine source-verified mdds/Boost. Compare inclusive ranges, failure output preservation, insertion changed flags, remove half-open boundaries, insert skip-start behavior, copy/cache state, reverse findLastTrue sentinel, ForwardIterator monotonic cursor/stale cached value and RangeIterator shared owner cursor, query interactions and repeated ends. Native uninitialized RangeIterator-before-first, dangling iterator/malformed mutation and arithmetic overflow remain excluded; preserve source expressions. Verify original diagnostic text with literal independent tests, JS assertion adaptation with explicit tests and isolated native debug assertion evidence. Ordinary tests require no upstream/native compiler/network. Run all Calc actual100 Istanbul four metrics, targeted shared mdds tests, TS7/tools, affected lint/format/docs/ownership/file-size/source-tree/provenance, Calc/shared registry zero semantic violations, related provenance/inventory/tooling tests where changes require them, routing/doctor/diff and final clean status. Full suite only task10; do not repair Writer coverage or promote whole-module parity from finite snapshots."
  Verification: "Pending. Preflight confirms clean calc at751133615d64; seven resumed tasks completed, full suite due task10. Two unrelated active tasks preserved. Actual source inspection identifies shared implementation, iterator cache/shared cursor and real global assertion-state dependency."
  Rollback Plan: "Revert only task8 implementation commits; retain shared mdds prerequisite and all earlier Calc owners. Remove only newly introduced segment/global owner registrations if reverting."
  Findings: "Prior goal turn was concrete progress: completed task7 with3020 native sequences and actual100 scoped coverage, metadata committed and clean. Original bool wrappers share ScFlatSegmentsImpl<bool>; RangeIterator uses the implementation owner cursor while ForwardIterator retains its own cache. Native terminal range traversal can update implementation scratch outputs before failure, while public wrappers preserve supplied RangeData on failure. Numeric template methods and RTL/native diagnostic process semantics are not silently substituted."
id_source: "generated"
---
## Summary

Port original Calc boolean row/column flat segment owners and both row iterators over the already shared pinned mdds implementation. Preserve real implementation sharing, inclusive outer bounds, cached hint and owner-shared iteration state.

## Scope

Calc checkout/branch only, task8 of resumed10. Add sc/inc/segmenttree.ts and sc/source/core/data/segmenttree.ts with complete boolean row/column public methods and needed original internal template specialization. Add the actual ScGlobal threaded-group-calculation flag at its core-data owner and re-export through existing inc/global.ts, preserving original false initialization and assertion preconditions. Native debug assertion uses explicit JS fail-fast diagnostic adaptation; native process-abort/release diagnostic policy remains uncertified. dumpAsString preserves original scalar ASCII text via JS immutable strings; RTL allocation/refcount/buffer capacity is not represented. Numeric UInt16 owners, conditional setters/sums and other ScGlobal services remain follow-up work, not replaced by stubs. Add portable native fixture/tests/probe, Calc runtime/provenance/capability records and update existing global provenance if needed, calc-core/suspected-case docs. Original native classes/method bodies are compiled unchanged for implemented boolean mechanisms with genuine mdds/Boost headers; diagnostic string methods not native-certified until actual RTL linkage exists. No native tree/engine/RTL stand-ins, Writer coverage repair, external writes or merges.

## Plan

Port original boolean row/column segment owners and iterators over shared mdds, preserve owner cursor/cache/defaults/global preconditions with native evidence; task8 of10.

## Verify Steps

Run pinned native bool-segment probe --write/--check under ASan/UBSan with unchanged original declarations/needed boolean methods, original global flag definition and genuine source-verified mdds/Boost. Compare inclusive ranges, failure output preservation, insertion changed flags, remove half-open boundaries, insert skip-start behavior, copy/cache state, reverse findLastTrue sentinel, ForwardIterator monotonic cursor/stale cached value and RangeIterator shared owner cursor, query interactions and repeated ends. Native uninitialized RangeIterator-before-first, dangling iterator/malformed mutation and arithmetic overflow remain excluded; preserve source expressions. Verify original diagnostic text with literal independent tests, JS assertion adaptation with explicit tests and isolated native debug assertion evidence. Ordinary tests require no upstream/native compiler/network. Run all Calc actual100 Istanbul four metrics, targeted shared mdds tests, TS7/tools, affected lint/format/docs/ownership/file-size/source-tree/provenance, Calc/shared registry zero semantic violations, related provenance/inventory/tooling tests where changes require them, routing/doctor/diff and final clean status. Full suite only task10; do not repair Writer coverage or promote whole-module parity from finite snapshots.

## Verification

Pending. Preflight confirms clean calc at751133615d64; seven resumed tasks completed, full suite due task10. Two unrelated active tasks preserved. Actual source inspection identifies shared implementation, iterator cache/shared cursor and real global assertion-state dependency.

## Rollback Plan

Revert only task8 implementation commits; retain shared mdds prerequisite and all earlier Calc owners. Remove only newly introduced segment/global owner registrations if reverting.

## Findings

Prior goal turn was concrete progress: completed task7 with3020 native sequences and actual100 scoped coverage, metadata committed and clean. Original bool wrappers share ScFlatSegmentsImpl<bool>; RangeIterator uses the implementation owner cursor while ForwardIterator retains its own cache. Native terminal range traversal can update implementation scratch outputs before failure, while public wrappers preserve supplied RangeData on failure. Numeric template methods and RTL/native diagnostic process semantics are not silently substituted.
