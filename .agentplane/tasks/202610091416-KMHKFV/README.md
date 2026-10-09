---
id: "202610091416-KMHKFV"
title: "Port Calc paired range-list numerical owners"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 14
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-09T14:17:38.788Z"
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
    body: "Start: Implement approved paired-range numerical owners in calc using existing ScRange and ScRefUpdate."
events:
  -
    type: "status"
    at: "2026-10-09T14:17:48.241Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: Implement approved paired-range numerical owners in calc using existing ScRange and ScRefUpdate."
doc_version: 3
doc_updated_at: "2026-10-09T14:50:45.959Z"
doc_updated_by: "CODER"
description: "Add original inline ScRangePair and core ScRangePairList value ownership lookup deletion joining and reference updates for column/row name ranges; reuse numerical owners and validate native bounded contracts."
sections:
  Summary: "Port original inline ScRangePair and numerical ScRangePairList owners used by column/row name references."
  Scope: "Calc branch/checkout only. Existing sc/inc/address.ts inline owner, sc/inc/rangelst.ts export and core/tool/rangelst.ts numerical owner. New pair-list test/native fixture/probe, one capability, affected source/header runtime and provenance inventory and old range-list gap reconciliation plus calc-core docs. User additionally requested an English standalone upstream-suspected-issues.md record of observed suspicious original conditions with exact source, native reproduction, confidence and preserved behavior. Reuse existing ScRange and ScRefUpdateDocument/ScRefUpdate. No shared/Writer source duplication. Fifth task of resumed ten-task interval."
  Plan: "Port original paired-range owners with native numerical contracts, unchanged compiled release comparisons, actual100 Calc coverage and registry; task5 of10."
  Verify Steps: "Run node scripts/calc-rangepair-native-probe.mjs --write and --check with exact pinned Git class/body hashes and ASan/UBSan. Compare ordered pair values, all four merge directions, containment requiring equal data ranges, nonmatching paired adjacency, restart/borrowed aliases, label-only lookup/removal, identity versus equality removal, independent Clone/copies and both-range updates over native modes/deltas/document expansion. Explicit native release assert behavior must be recorded; original C++ bodies unchanged. Run npm run test:coverage:calc with actual100 four Istanbul metrics, npm run typecheck, npm run test:tooling, affected ESLint/Prettier, check:dependencies/docs/file-size/source-tree/source-provenance, inventory:parity:calc zero semantic violations, routing, doctor, diff and final clean status. Existing range-list and reference-update tests/fixtures preserved. Full Writer/E2E suites at task10; no Writer coverage fixes."
  Verification: "Pending. Prior task202610091404-4QBVYR completed at a3cbf1e5d57e with67 Calc tests and actual100 coverage; clean calc checkout and inherited two unrelated active tasks preserved."
  Rollback Plan: "Revert only this implementation commit. Existing single-range lists and numerical reference-update owners remain intact."
  Findings: |-
    Original paired numerical owners retain all observed upstream predicates. Initial Join comparison exposed the data end-minus-one asymmetry and was corrected literally. Registry Append evidence was corrected to original inline header ownership. TS7 fixture-boundary typing was made explicit after live high-CPU typecheck evidence. User requested a separate suspicious-case record and reaffirmed upstream behavior preservation: docs/program/upstream-suspected-issues.md records six bounded observations with source/test confidence and unchanged decisions, plus reviewed API distinctions. Name sorting awaits actual document/collator owners; native debug assertions and full vector/refcount/pointer lifetime remain uncertified. Optional consumer search path was corrected using repository file inventory; no network, merges or outside-scope files.

    - Observation: Superseded TS7 processes were confirmed still live after INT/TERM and then stopped by exact compiler PIDs. Direct imported JSON inference remained costly; the test now reads committed JSON through Node fs into its explicit native wire schema. The changed check completed and revealed unchecked tuple-destructuring types in the literal direction table.
      Impact: Only the new comparison test data boundary and literal input typing changed. No production behavior, compiler version, verification threshold or native fixture output changed.
      Resolution: Declare the four literal direction entries as original coordinate tuple pairs, keep the native wire schema, and run a fresh uniquely logged TS7 check plus Calc coverage/tooling and affected lint. The previous mixed log is not used as pass evidence.

    - Observation: After explicit native fixture decoding, TS7 typecheck and13 tooling tests passed. Calc runtime rejected the jsdom URL object passed to Node fs when importing the new paired test; coverage check failed at fixture loading before its cases ran.
      Impact: Only test environment URL ownership differs. Production numerical behavior and unchanged native fixture remain unaffected.
      Resolution: Use the Node URL constructor at the Node file-decoding boundary, retaining portable committed fixture data and the explicit native wire schema; rerun scoped coverage and affected type/lint checks.

    - Observation: Native wire decoding now uses NodeURL explicitly, avoiding the static asset URL transformation; the paired module smoke test passes all5 cases in1.52s. Concrete committed native snapshots confirm CALC-001 top trim [2,3,0,5,5,0] and CALC-005 disjoint insertion fragment [6,5,0,4,5,0].
      Impact: The requested separate suspicious-case file has concrete proof links/examples and retains the user preservation instruction. Test-data decoding does not change production or native outputs.
      Resolution: Complete fresh scoped coverage and TS7 checks, record final native/tooling/inventory/doc evidence and close task5 of10 on calc.
id_source: "generated"
---
## Summary

Port original inline ScRangePair and numerical ScRangePairList owners used by column/row name references.

## Scope

Calc branch/checkout only. Existing sc/inc/address.ts inline owner, sc/inc/rangelst.ts export and core/tool/rangelst.ts numerical owner. New pair-list test/native fixture/probe, one capability, affected source/header runtime and provenance inventory and old range-list gap reconciliation plus calc-core docs. User additionally requested an English standalone upstream-suspected-issues.md record of observed suspicious original conditions with exact source, native reproduction, confidence and preserved behavior. Reuse existing ScRange and ScRefUpdateDocument/ScRefUpdate. No shared/Writer source duplication. Fifth task of resumed ten-task interval.

## Plan

Port original paired-range owners with native numerical contracts, unchanged compiled release comparisons, actual100 Calc coverage and registry; task5 of10.

## Verify Steps

Run node scripts/calc-rangepair-native-probe.mjs --write and --check with exact pinned Git class/body hashes and ASan/UBSan. Compare ordered pair values, all four merge directions, containment requiring equal data ranges, nonmatching paired adjacency, restart/borrowed aliases, label-only lookup/removal, identity versus equality removal, independent Clone/copies and both-range updates over native modes/deltas/document expansion. Explicit native release assert behavior must be recorded; original C++ bodies unchanged. Run npm run test:coverage:calc with actual100 four Istanbul metrics, npm run typecheck, npm run test:tooling, affected ESLint/Prettier, check:dependencies/docs/file-size/source-tree/source-provenance, inventory:parity:calc zero semantic violations, routing, doctor, diff and final clean status. Existing range-list and reference-update tests/fixtures preserved. Full Writer/E2E suites at task10; no Writer coverage fixes.

## Verification

Pending. Prior task202610091404-4QBVYR completed at a3cbf1e5d57e with67 Calc tests and actual100 coverage; clean calc checkout and inherited two unrelated active tasks preserved.

## Rollback Plan

Revert only this implementation commit. Existing single-range lists and numerical reference-update owners remain intact.

## Findings

Original paired numerical owners retain all observed upstream predicates. Initial Join comparison exposed the data end-minus-one asymmetry and was corrected literally. Registry Append evidence was corrected to original inline header ownership. TS7 fixture-boundary typing was made explicit after live high-CPU typecheck evidence. User requested a separate suspicious-case record and reaffirmed upstream behavior preservation: docs/program/upstream-suspected-issues.md records six bounded observations with source/test confidence and unchanged decisions, plus reviewed API distinctions. Name sorting awaits actual document/collator owners; native debug assertions and full vector/refcount/pointer lifetime remain uncertified. Optional consumer search path was corrected using repository file inventory; no network, merges or outside-scope files.

- Observation: Superseded TS7 processes were confirmed still live after INT/TERM and then stopped by exact compiler PIDs. Direct imported JSON inference remained costly; the test now reads committed JSON through Node fs into its explicit native wire schema. The changed check completed and revealed unchecked tuple-destructuring types in the literal direction table.
  Impact: Only the new comparison test data boundary and literal input typing changed. No production behavior, compiler version, verification threshold or native fixture output changed.
  Resolution: Declare the four literal direction entries as original coordinate tuple pairs, keep the native wire schema, and run a fresh uniquely logged TS7 check plus Calc coverage/tooling and affected lint. The previous mixed log is not used as pass evidence.

- Observation: After explicit native fixture decoding, TS7 typecheck and13 tooling tests passed. Calc runtime rejected the jsdom URL object passed to Node fs when importing the new paired test; coverage check failed at fixture loading before its cases ran.
  Impact: Only test environment URL ownership differs. Production numerical behavior and unchanged native fixture remain unaffected.
  Resolution: Use the Node URL constructor at the Node file-decoding boundary, retaining portable committed fixture data and the explicit native wire schema; rerun scoped coverage and affected type/lint checks.

- Observation: Native wire decoding now uses NodeURL explicitly, avoiding the static asset URL transformation; the paired module smoke test passes all5 cases in1.52s. Concrete committed native snapshots confirm CALC-001 top trim [2,3,0,5,5,0] and CALC-005 disjoint insertion fragment [6,5,0,4,5,0].
  Impact: The requested separate suspicious-case file has concrete proof links/examples and retains the user preservation instruction. Test-data decoding does not change production or native outputs.
  Resolution: Complete fresh scoped coverage and TS7 checks, record final native/tooling/inventory/doc evidence and close task5 of10 on calc.
