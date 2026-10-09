---
id: "202610091416-KMHKFV"
title: "Port Calc paired range-list numerical owners"
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
doc_updated_at: "2026-10-09T14:17:48.241Z"
doc_updated_by: "CODER"
description: "Add original inline ScRangePair and core ScRangePairList value ownership lookup deletion joining and reference updates for column/row name ranges; reuse numerical owners and validate native bounded contracts."
sections:
  Summary: "Port original inline ScRangePair and numerical ScRangePairList owners used by column/row name references."
  Scope: "Calc branch/checkout only. Existing sc/inc/address.ts inline owner, sc/inc/rangelst.ts export and core/tool/rangelst.ts numerical owner. New pair-list test/native fixture/probe, one capability, affected source/header runtime and provenance inventory and old range-list gap reconciliation plus calc-core docs. Reuse existing ScRange and ScRefUpdateDocument/ScRefUpdate. No shared/Writer source duplication. Fifth task of resumed ten-task interval."
  Plan: "Port original paired-range owners with native numerical contracts, unchanged compiled release comparisons, actual100 Calc coverage and registry; task5 of10."
  Verify Steps: "Run node scripts/calc-rangepair-native-probe.mjs --write and --check with exact pinned Git class/body hashes and ASan/UBSan. Compare ordered pair values, all four merge directions, containment requiring equal data ranges, nonmatching paired adjacency, restart/borrowed aliases, label-only lookup/removal, identity versus equality removal, independent Clone/copies and both-range updates over native modes/deltas/document expansion. Explicit native release assert behavior must be recorded; original C++ bodies unchanged. Run npm run test:coverage:calc with actual100 four Istanbul metrics, npm run typecheck, npm run test:tooling, affected ESLint/Prettier, check:dependencies/docs/file-size/source-tree/source-provenance, inventory:parity:calc zero semantic violations, routing, doctor, diff and final clean status. Existing range-list and reference-update tests/fixtures preserved. Full Writer/E2E suites at task10; no Writer coverage fixes."
  Verification: "Pending. Prior task202610091404-4QBVYR completed at a3cbf1e5d57e with67 Calc tests and actual100 coverage; clean calc checkout and inherited two unrelated active tasks preserved."
  Rollback Plan: "Revert only this implementation commit. Existing single-range lists and numerical reference-update owners remain intact."
  Findings: "ScRangePair has no default constructor: explicit two-range or copy construction only. Pair-list Find(address) tests label containment whereas Find(range) requires exact label equality; data ranges do not participate. Remove(pair) compares identity. Name sorting requires original document sheet-name and shared collator owners and remains pending. Native Join contains a diagnostic unconditional assert after searching a later source entry; release behavior is compared with NDEBUG explicitly, retaining unchanged native bodies. No network or merges required."
id_source: "generated"
---
## Summary

Port original inline ScRangePair and numerical ScRangePairList owners used by column/row name references.

## Scope

Calc branch/checkout only. Existing sc/inc/address.ts inline owner, sc/inc/rangelst.ts export and core/tool/rangelst.ts numerical owner. New pair-list test/native fixture/probe, one capability, affected source/header runtime and provenance inventory and old range-list gap reconciliation plus calc-core docs. Reuse existing ScRange and ScRefUpdateDocument/ScRefUpdate. No shared/Writer source duplication. Fifth task of resumed ten-task interval.

## Plan

Port original paired-range owners with native numerical contracts, unchanged compiled release comparisons, actual100 Calc coverage and registry; task5 of10.

## Verify Steps

Run node scripts/calc-rangepair-native-probe.mjs --write and --check with exact pinned Git class/body hashes and ASan/UBSan. Compare ordered pair values, all four merge directions, containment requiring equal data ranges, nonmatching paired adjacency, restart/borrowed aliases, label-only lookup/removal, identity versus equality removal, independent Clone/copies and both-range updates over native modes/deltas/document expansion. Explicit native release assert behavior must be recorded; original C++ bodies unchanged. Run npm run test:coverage:calc with actual100 four Istanbul metrics, npm run typecheck, npm run test:tooling, affected ESLint/Prettier, check:dependencies/docs/file-size/source-tree/source-provenance, inventory:parity:calc zero semantic violations, routing, doctor, diff and final clean status. Existing range-list and reference-update tests/fixtures preserved. Full Writer/E2E suites at task10; no Writer coverage fixes.

## Verification

Pending. Prior task202610091404-4QBVYR completed at a3cbf1e5d57e with67 Calc tests and actual100 coverage; clean calc checkout and inherited two unrelated active tasks preserved.

## Rollback Plan

Revert only this implementation commit. Existing single-range lists and numerical reference-update owners remain intact.

## Findings

ScRangePair has no default constructor: explicit two-range or copy construction only. Pair-list Find(address) tests label containment whereas Find(range) requires exact label equality; data ranges do not participate. Remove(pair) compares identity. Name sorting requires original document sheet-name and shared collator owners and remains pending. Native Join contains a diagnostic unconditional assert after searching a later source entry; release behavior is compared with NDEBUG explicitly, retaining unchanged native bodies. No network or merges required.
