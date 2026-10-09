---
id: "202610091723-P9JYX4"
title: "Port Calc mark-data selection owner and validate full cycle"
status: "TODO"
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
  updated_at: "2026-10-09T17:24:07.240Z"
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
doc_updated_at: "2026-10-09T17:24:05.943Z"
doc_updated_by: "PLANNER"
description: "Task10 of resumed cycle: complete original ScMarkData using actual ScMultiSel/range/bool/shared mdds owners; port original fstalgorithm span conversions and RowSpan/ColRowSpan values as needed; unchanged native comparison, actual100 Calc and full suite with Writer coverage left unchanged."
sections:
  Summary: "Port complete original ScMarkData selection owner over actual source-shaped dependencies; validate task10 full resumed cycle."
  Scope: "Only calc checkout/branch. User goal/resume authorizes safe local work. Add sc/inc/markdata.ts, sc/source/core/data/markdata.ts, sc/inc/fstalgorithm.ts and original RowSpan/ColRowSpan values in sc/inc/columnspanset.ts and sc/source/core/data/columnspanset.ts. Add portable tests, unchanged native probes/fixtures, runtime/provenance/capability records, calc-core and suspicious-case journal updates as needed. Reuse actual shared mdds, ScMultiSel/ScMarkArray, ScRangeList/ScRange, sheet limits and bool segments. No fake ScDocument/column/string/range/interval engines. Existing numerical document getter contracts remain adapters for original range shifting; full document core is later work. Original unordered-map envelope order and native allocation/moved pointer/lifetime differences remain explicitly bounded. No Writer implementation/coverage repairs, network writes, merges or new coverage exclusions. Full-suite validation due this task10; any unrelated failures documented and in-scope failures corrected."
  Plan: "Port complete original ScMarkData and actual span dependencies; actual100 Calc plus task10 full validation, preserving upstream behavior and Writer coverage exemption."
  Verify Steps: "Read pinned ScMarkData/header, fstalgorithm and span originals. Compare unchanged original selection operations, flags, selected tabs, simple/multi conversion, ranges/bounds, query/navigation, spans, assignments and all envelopes under ASan/UBSan using genuine dependencies; retain original literal mark_test cases and fail/output preservation. Compare all span conversion overloads including invalid/unbuilt/stale indexed trees and native boundary clipping. Ordinary tests must work without upstream/compiler/network. Run all Calc Istanbul actual100 four metrics; affected shared tests, related inventory/provenance/tooling tests; TS7/lint/format/docs/dependencies/size/source-tree/provenance and Calc/shared registry zero violations. Run full application unit scenarios, inventory coverage and tooling plus browser Writer/Calc/shared scenarios once at task10, preserve Writer coverage gaps per user and do not relax assertions or drop previous tests. Record exact native/runtime limits, outputs, failures and repairs, quality review, commits and final clean status on calc. No whole-module parity promotion from finite evidence."
  Verification: "Pending. Preflight clean calc at df1df10b5a7d;9 resumed tasks DONE, full suite due this task10. Two unrelated active tasks untouched."
  Rollback Plan: "Revert this task source/tests/probes/fixtures/registry/docs only; preserve existing common dependencies and prior selection work."
  Findings: "ScMarkData is an original948-line owner. Marked row/column spans depend on original fstalgorithm templates and two numerical span value structs; implement those boundaries rather than flattening them into mark-data or duplicating shared tree logic. Selection envelopes use existing bool row/column owners and unordered maps; native order must be researched and bounded separately from range content."
id_source: "generated"
---
## Summary

Port complete original ScMarkData selection owner over actual source-shaped dependencies; validate task10 full resumed cycle.

## Scope

Only calc checkout/branch. User goal/resume authorizes safe local work. Add sc/inc/markdata.ts, sc/source/core/data/markdata.ts, sc/inc/fstalgorithm.ts and original RowSpan/ColRowSpan values in sc/inc/columnspanset.ts and sc/source/core/data/columnspanset.ts. Add portable tests, unchanged native probes/fixtures, runtime/provenance/capability records, calc-core and suspicious-case journal updates as needed. Reuse actual shared mdds, ScMultiSel/ScMarkArray, ScRangeList/ScRange, sheet limits and bool segments. No fake ScDocument/column/string/range/interval engines. Existing numerical document getter contracts remain adapters for original range shifting; full document core is later work. Original unordered-map envelope order and native allocation/moved pointer/lifetime differences remain explicitly bounded. No Writer implementation/coverage repairs, network writes, merges or new coverage exclusions. Full-suite validation due this task10; any unrelated failures documented and in-scope failures corrected.

## Plan

Port complete original ScMarkData and actual span dependencies; actual100 Calc plus task10 full validation, preserving upstream behavior and Writer coverage exemption.

## Verify Steps

Read pinned ScMarkData/header, fstalgorithm and span originals. Compare unchanged original selection operations, flags, selected tabs, simple/multi conversion, ranges/bounds, query/navigation, spans, assignments and all envelopes under ASan/UBSan using genuine dependencies; retain original literal mark_test cases and fail/output preservation. Compare all span conversion overloads including invalid/unbuilt/stale indexed trees and native boundary clipping. Ordinary tests must work without upstream/compiler/network. Run all Calc Istanbul actual100 four metrics; affected shared tests, related inventory/provenance/tooling tests; TS7/lint/format/docs/dependencies/size/source-tree/provenance and Calc/shared registry zero violations. Run full application unit scenarios, inventory coverage and tooling plus browser Writer/Calc/shared scenarios once at task10, preserve Writer coverage gaps per user and do not relax assertions or drop previous tests. Record exact native/runtime limits, outputs, failures and repairs, quality review, commits and final clean status on calc. No whole-module parity promotion from finite evidence.

## Verification

Pending. Preflight clean calc at df1df10b5a7d;9 resumed tasks DONE, full suite due this task10. Two unrelated active tasks untouched.

## Rollback Plan

Revert this task source/tests/probes/fixtures/registry/docs only; preserve existing common dependencies and prior selection work.

## Findings

ScMarkData is an original948-line owner. Marked row/column spans depend on original fstalgorithm templates and two numerical span value structs; implement those boundaries rather than flattening them into mark-data or duplicating shared tree logic. Selection envelopes use existing bool row/column owners and unordered maps; native order must be researched and bounded separately from range content.
