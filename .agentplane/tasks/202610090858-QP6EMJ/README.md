---
id: "202610090858-QP6EMJ"
title: "Port Calc full signed64 big address and range owners"
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
  updated_at: "2026-10-09T08:59:38.892Z"
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
    body: "Start: port original signed64 big coordinates and ranges with exact sentinel/validity/conversion contracts, reusing ordinary owners."
events:
  -
    type: "status"
    at: "2026-10-09T08:59:39.720Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: port original signed64 big coordinates and ranges with exact sentinel/validity/conversion contracts, reusing ordinary owners."
doc_version: 3
doc_updated_at: "2026-10-09T08:59:39.720Z"
doc_updated_by: "CODER"
description: "Implement complete ScBigAddress and ScBigRange numerical header/source contracts for change-tracking/reference-update consumers with exact bigint coordinates, native sentinels, validity and clipped ordinary conversion."
sections:
  Summary: "Port complete defined numerical ScBigAddress/ScBigRange ownership as the signed64 dependency for original reference updates and change-tracking geometry."
  Scope: "New sc/inc/bigrange.ts and sc/source/core/data/bigrange.ts, focused acceptance test and native fixture, scripts/calc-bigrange-native-probe.mjs, new Calc capability and two runtime/provenance records, calc-core docs. Reuse ScAddress, ScRange and existing document getter view. Preserve all prior tests/fixtures/status flags and shared/Writer sources. Only calc checkout/branch; no merges. Calc milestone8; full suite at10."
  Plan: "Implement complete original initialized address/range constructors, copy/assignment, raw setters/increments/GetVars/equality, independent stable range endpoint owners, signed64 min/max whole-axis sentinels, exact doc validity and native clipped MakeAddress/MakeRange with pair-constructor sorting. Use bigint for native64 values without floating-point rounding or fabricated signed-overflow behavior; preserve raw reversed and outside-document values. Consolidate inline numerical classes with original source validity body under same header/data file boundaries as prior coordinate owners. Compile original full big header/class and unchanged IsValid body using original ordinary address/range inline owners in bounded three-getter doc shell; compare every raw/converted output, relation and mutation under ASan/UBSan, including values beyond2^53. Inventory leaves full document/change-tracking integration and undefined arithmetic/lifetime unverified. Run actual100 Calc coverage and scoped guards, record quality/commit/clean state. Next native owner is ScRefUpdate, followed by range-list reference-update integration and full suite atCalc10. User goal authorizes this core progression."
  Verify Steps: "Run node scripts/calc-bigrange-native-probe.mjs --write then --check; require exact pinned Git blobs, full/source interval hashes and ASan/UBSan-clean defined64 states. Compare every native address/range/relation/mutation outcome through actual TS owners, preserve raw reversed endpoints, clipping/sentinel/table-count distinction and copy ownership. Run npm run test:coverage:calc actual100 all4 metrics, npm run typecheck, check:dependencies, check:docs, check:file-size, check:source-tree and affected ESLint/Prettier. Scoped Calc registry0 semantic violations; preserve previous tests/fixtures/status flags/shared code. Routing, ap doctor, diff check and final clean tracked/untracked calc state. Full suite remains scheduled after Calc10."
  Verification: "Pending complete owner port and bounded native acceptance."
  Rollback Plan: "Revert only this implementation commit, preserving ordinary address/range/reference/list owners and existing native evidence."
  Findings: "Native64 min/max sentinels count as valid on each axis independently. Ordinary sheet validity is exclusive GetTableCount; MakeAddress clips sheets to global MAXTAB instead. MakeRange invokes the sorting address-pair ScRange constructor. Numeric big range initialization never sorts. No existing shared64 geometry owner exists in the inspected runtime tree; use exact bigint values without duplicating ordinary range contracts. Native signed-overflow and pointer/move lifetime domains are not certified."
id_source: "generated"
---
## Summary

Port complete defined numerical ScBigAddress/ScBigRange ownership as the signed64 dependency for original reference updates and change-tracking geometry.

## Scope

New sc/inc/bigrange.ts and sc/source/core/data/bigrange.ts, focused acceptance test and native fixture, scripts/calc-bigrange-native-probe.mjs, new Calc capability and two runtime/provenance records, calc-core docs. Reuse ScAddress, ScRange and existing document getter view. Preserve all prior tests/fixtures/status flags and shared/Writer sources. Only calc checkout/branch; no merges. Calc milestone8; full suite at10.

## Plan

Implement complete original initialized address/range constructors, copy/assignment, raw setters/increments/GetVars/equality, independent stable range endpoint owners, signed64 min/max whole-axis sentinels, exact doc validity and native clipped MakeAddress/MakeRange with pair-constructor sorting. Use bigint for native64 values without floating-point rounding or fabricated signed-overflow behavior; preserve raw reversed and outside-document values. Consolidate inline numerical classes with original source validity body under same header/data file boundaries as prior coordinate owners. Compile original full big header/class and unchanged IsValid body using original ordinary address/range inline owners in bounded three-getter doc shell; compare every raw/converted output, relation and mutation under ASan/UBSan, including values beyond2^53. Inventory leaves full document/change-tracking integration and undefined arithmetic/lifetime unverified. Run actual100 Calc coverage and scoped guards, record quality/commit/clean state. Next native owner is ScRefUpdate, followed by range-list reference-update integration and full suite atCalc10. User goal authorizes this core progression.

## Verify Steps

Run node scripts/calc-bigrange-native-probe.mjs --write then --check; require exact pinned Git blobs, full/source interval hashes and ASan/UBSan-clean defined64 states. Compare every native address/range/relation/mutation outcome through actual TS owners, preserve raw reversed endpoints, clipping/sentinel/table-count distinction and copy ownership. Run npm run test:coverage:calc actual100 all4 metrics, npm run typecheck, check:dependencies, check:docs, check:file-size, check:source-tree and affected ESLint/Prettier. Scoped Calc registry0 semantic violations; preserve previous tests/fixtures/status flags/shared code. Routing, ap doctor, diff check and final clean tracked/untracked calc state. Full suite remains scheduled after Calc10.

## Verification

Pending complete owner port and bounded native acceptance.

## Rollback Plan

Revert only this implementation commit, preserving ordinary address/range/reference/list owners and existing native evidence.

## Findings

Native64 min/max sentinels count as valid on each axis independently. Ordinary sheet validity is exclusive GetTableCount; MakeAddress clips sheets to global MAXTAB instead. MakeRange invokes the sorting address-pair ScRange constructor. Numeric big range initialization never sorts. No existing shared64 geometry owner exists in the inspected runtime tree; use exact bigint values without duplicating ordinary range contracts. Native signed-overflow and pointer/move lifetime domains are not certified.
