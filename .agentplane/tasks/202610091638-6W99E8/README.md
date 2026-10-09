---
id: "202610091638-6W99E8"
title: "Port Calc multi-selection owner and iterator"
status: "TODO"
priority: "med"
owner: "CODER"
revision: 4
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-09T16:40:02.364Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "pending"
  updated_at: null
  updated_by: null
  note: null
  attempts: 0
commit: null
comments: []
events: []
doc_version: 3
doc_updated_at: "2026-10-09T16:39:42.977Z"
doc_updated_by: "PLANNER"
description: "Task9 of resumed cycle: original ScMultiSel and ScMultiSelIter over existing ScMarkArray, ScFlatBoolRowSegments and ScRangeList; preserve raw Set, row migration, borrowed versus snapshot iteration and shifts with unchanged native evidence."
sections:
  Summary: "Port original ScMultiSel and ScMultiSelIter using existing actual Calc row-mark, bool segment, range-list and sheet-limit owners."
  Scope: "Only calc checkout/branch. Task9 of resumed10; user goal/resume authorizes safe local changes. Add sc/inc/markmulti.ts and sc/source/core/data/markmulti.ts, complete public owner/iterator methods including copy/move/assignment adapters, raw range-list Set, row-to-column migration, borrowed storage access and original shifts. Add native fixture/probe and portable tests, Calc runtime/provenance/capability records, calc-core and suspicious-case documentation. Reuse actual shared mdds and Calc dependencies without duplicate implementations. Native comparison compiles unchanged original ScMultiSel/ScMultiSelIter bodies and needed original dependency mechanisms with genuine mdds/Boost, source blob/group hashes and ASan/UBSan. No replacement native interval/range-list/string/document engine. Scalar output references use tuples/aggregates; debug assertions use explicit fail-fast diagnostics. JS sort preserves the row comparator; native std::sort equal-key permutation and cross-standard-library move/vector lifetime are implementation-dependent and explicitly uncertified. Negative/out-of-bounds vector indices, dangling/reallocated borrowed pointers, uninitialized/malformed arithmetic remain excluded from defined native comparison. No ScMarkData/document/UI stand-ins, Writer coverage repairs, network writes or merges."
  Plan: "Port complete original multi-selection owner/iterator on actual dependencies with unchanged native evidence and Calc actual100; task9 of10, no behavior normalization."
  Verify Steps: "Read exact pinned originals. Run native markmulti probe --write/--check with unchanged original owner/iterator groups and real dependency mechanisms under ASan/UBSan; compare every public query, raw selection count, row/per-column arrays, HasOneMark output preservation, union IsAllMarked, equal-row/start-column logic, navigation, Set raw entries, all-column row migration, copy/assignment limits, moves in defined live storage and original row/column shifts. Compare borrowed one-source versus snapshot two-source iterator behavior, failed/terminal output preservation and GetRangeData precondition with explicit tests/native diagnosis. Retain literal upstream mark_test coordinates/expectations. Ordinary tests must work without upstream/compiler/network. Run all Calc tests with all four actual Istanbul metrics100 and affected markarr/segmenttree/shared mdds tests, related30 inventory and3 provenance/14 tooling tests, TS7 tools/application, focused lint/format, dependencies/docs/size/source-tree/provenance, Calc/shared registry zero semantic violations, routing/doctor/diff/final clean status. No coverage exclusions or fabricated native outcomes. Full suite remains task10, not task9. Keep finite bounded evidence and native/JS runtime limits explicit."
  Verification: "Pending. Preflight clean calc at9bdfa4025428; eight resumed tasks completed, full suite due task10. Two unrelated active tasks preserved."
  Rollback Plan: "Revert only this task implementation/registry/docs; preserve all existing shared mdds and Calc dependencies."
  Findings: "Original source distinguishes borrowed single-array iteration from two-array bool-segment snapshots. Bulk Set retains raw mark entries without an unmarked terminal. HasOneMark, missing-column equality and ShiftCols trailing-entry behavior require native evidence and preservation, not repairs. std::sort equal-key order is unspecified; this is recorded as a runtime limitation rather than adding a platform-specific sorting substitute."
id_source: "generated"
---
## Summary

Port original ScMultiSel and ScMultiSelIter using existing actual Calc row-mark, bool segment, range-list and sheet-limit owners.

## Scope

Only calc checkout/branch. Task9 of resumed10; user goal/resume authorizes safe local changes. Add sc/inc/markmulti.ts and sc/source/core/data/markmulti.ts, complete public owner/iterator methods including copy/move/assignment adapters, raw range-list Set, row-to-column migration, borrowed storage access and original shifts. Add native fixture/probe and portable tests, Calc runtime/provenance/capability records, calc-core and suspicious-case documentation. Reuse actual shared mdds and Calc dependencies without duplicate implementations. Native comparison compiles unchanged original ScMultiSel/ScMultiSelIter bodies and needed original dependency mechanisms with genuine mdds/Boost, source blob/group hashes and ASan/UBSan. No replacement native interval/range-list/string/document engine. Scalar output references use tuples/aggregates; debug assertions use explicit fail-fast diagnostics. JS sort preserves the row comparator; native std::sort equal-key permutation and cross-standard-library move/vector lifetime are implementation-dependent and explicitly uncertified. Negative/out-of-bounds vector indices, dangling/reallocated borrowed pointers, uninitialized/malformed arithmetic remain excluded from defined native comparison. No ScMarkData/document/UI stand-ins, Writer coverage repairs, network writes or merges.

## Plan

Port complete original multi-selection owner/iterator on actual dependencies with unchanged native evidence and Calc actual100; task9 of10, no behavior normalization.

## Verify Steps

Read exact pinned originals. Run native markmulti probe --write/--check with unchanged original owner/iterator groups and real dependency mechanisms under ASan/UBSan; compare every public query, raw selection count, row/per-column arrays, HasOneMark output preservation, union IsAllMarked, equal-row/start-column logic, navigation, Set raw entries, all-column row migration, copy/assignment limits, moves in defined live storage and original row/column shifts. Compare borrowed one-source versus snapshot two-source iterator behavior, failed/terminal output preservation and GetRangeData precondition with explicit tests/native diagnosis. Retain literal upstream mark_test coordinates/expectations. Ordinary tests must work without upstream/compiler/network. Run all Calc tests with all four actual Istanbul metrics100 and affected markarr/segmenttree/shared mdds tests, related30 inventory and3 provenance/14 tooling tests, TS7 tools/application, focused lint/format, dependencies/docs/size/source-tree/provenance, Calc/shared registry zero semantic violations, routing/doctor/diff/final clean status. No coverage exclusions or fabricated native outcomes. Full suite remains task10, not task9. Keep finite bounded evidence and native/JS runtime limits explicit.

## Verification

Pending. Preflight clean calc at9bdfa4025428; eight resumed tasks completed, full suite due task10. Two unrelated active tasks preserved.

## Rollback Plan

Revert only this task implementation/registry/docs; preserve all existing shared mdds and Calc dependencies.

## Findings

Original source distinguishes borrowed single-array iteration from two-array bool-segment snapshots. Bulk Set retains raw mark entries without an unmarked terminal. HasOneMark, missing-column equality and ShiftCols trailing-entry behavior require native evidence and preservation, not repairs. std::sort equal-key order is unspecified; this is recorded as a runtime limitation rather than adding a platform-specific sorting substitute.
