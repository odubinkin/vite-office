---
id: "202610091459-8FSH81"
title: "Port Calc row mark array and iterator"
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
  updated_at: "2026-10-09T15:00:33.356Z"
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
    body: "Start: Implement approved original row mark array and iterator in calc using existing ScSheetLimits."
events:
  -
    type: "status"
    at: "2026-10-09T15:00:41.064Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: Implement approved original row mark array and iterator in calc using existing ScSheetLimits."
doc_version: 3
doc_updated_at: "2026-10-09T15:13:44.031Z"
doc_updated_by: "CODER"
description: "Implement original ScMarkArray compressed row-selection owner and ScMarkArrayIter with native comparison, actual100 Calc coverage and inventory. Sixth task of resumed ten-task interval; preserve upstream quirks."
sections:
  Summary: "Port original ScMarkArray compressed row-selection owner and ScMarkArrayIter, used by Calc marking and column consumers."
  Scope: "Calc checkout and branch only. New sc/inc/markarr.ts header and sc/source/core/data/markarr.ts owner, colocated tests/native JSON, scripts/calc-markarr-native-probe.mjs, matching Calc runtime/provenance/capability records and calc-core documentation. Add a suspicious-case record only if a concrete source observation is confirmed. Reuse ScSheetLimits, native SCROW and existing numerical contracts. No string/document/formula stand-ins, shared owner duplication, Writer edits or test partition changes. Sixth task of resumed ten-task interval."
  Plan: "Port original compressed row marks and iterator with real ScSheetLimits, unchanged native comparisons, actual100 Calc coverage and inventory; task6 of10."
  Verify Steps: "Run native --write and --check with pinned Git blobs/full and extracted source hashes and ASan/UBSan. Compare Search negative/beyond-limit indices, marking splitting/shrinking/coalescing, raw Set, empty/moved state only on defined operations, copy/assignment with destination limits retained, equality independent of limits, next-mark/end and iterator reset/unchanged output references. Include valid start/end and forward interval callers; do not certify native empty Search, out-of-bounds vector access, reversed unsafe mutations or signed64 overflow. Run npm run test:coverage:calc (all four Istanbul metrics actual100), npm run typecheck, npm run test:tooling, affected ESLint/Prettier, check:dependencies/docs/file-size/source-tree/source-provenance, inventory:parity:calc with zero semantic violations, routing, doctor, diff and final clean status. Full suite remains due at task10; no Writer coverage repair."
  Verification: "Pending. Prior paired task completed at 5aa36d3e27f0; 72 Calc tests/16files with actual100 coverage. Clean calc checkout, two unrelated active tasks preserved. No independent native manual-refcount string owner exists yet; current selection owner has its real dependency ScSheetLimits."
  Rollback Plan: "Revert this implementation commit only; existing address/range/reference owners remain intact."
  Findings: |-
    Pinned header records signed30 row bitfields. Original Shift modifies boundaries individually and does not normalize adjacent or collapsed entries. Search accepts negative rows at its first boundary. Native integer narrowing and reference-output preservation require explicit comparisons; no upstream behavior corrections authorized.

    - Observation: Native unchanged classes/methods pass2814 initialized sequences and all5 portable tests. Registry ID command rejected unsupported --prefix; no registry mutation occurred.
      Impact: Only capability ID discovery syntax needs correction; approved scope and validation unchanged.
      Resolution: Use installed inventory:id without unsupported arguments, then reconcile new mapped owners and capability.

    - Observation: All77 Calc tests pass with actual100 Istanbul; TS7 passes. Affected ESLint/JSDoc checks found missing wire-type comments and @returns on void methods/callbacks.
      Impact: Documentation-only omissions in new authored files; numerical behavior and scope unchanged.
      Resolution: Add required JSDoc, rerun affected lint/docs and proceed with inventory/native final checks.

    - Observation: Native --check, affected lint/format, ownership, docs and provenance pass. Runtime inventory rejects header re-export names listed as local declarations.
      Impact: Pure upstream header re-export contains no owned local declarations; provenance correctly maps public exported names, but runtime declaration evidence needs correction.
      Resolution: Follow existing pure-header runtime pattern with empty localSymbols, retain upstream/header/provenance responsibility and new source symbols, rerun Calc inventory and tooling.

    - Observation: Runtime inventory also excludes class fields/accessors from its local declaration symbol extraction; nRow/bMarked are rejected despite real initialized entry fields.
      Impact: Runtime localSymbols must describe supported declaration evidence, while provenance continues to record the real entry field contract.
      Resolution: Remove these two field names only from runtime localSymbols, keep class/method owners and source evidence unchanged, rerun inventory.

    - Observation: Final native --check matches2814 initialized sequences with debug assertions and ASan/UBSan. Calc77tests and all four actual Istanbul metrics100; TS7, tooling13tests, affected lint/format, ownership/docs/size/tree/provenance and inventory pass.
      Impact: Original row selection owners reuse ScSheetLimits;15 capabilities/127 scoped modules and zero semantic violations. CALC-007 documents collapsed Shift boundaries with unchanged outcomes.
      Resolution: Record complete bounded evidence, commit approved files and close task6 of10. Full multi-selection/document/UI consumers and native undefined/unspecified domains remain explicitly uncertified; no Writer/full-suite changes.
id_source: "generated"
---
## Summary

Port original ScMarkArray compressed row-selection owner and ScMarkArrayIter, used by Calc marking and column consumers.

## Scope

Calc checkout and branch only. New sc/inc/markarr.ts header and sc/source/core/data/markarr.ts owner, colocated tests/native JSON, scripts/calc-markarr-native-probe.mjs, matching Calc runtime/provenance/capability records and calc-core documentation. Add a suspicious-case record only if a concrete source observation is confirmed. Reuse ScSheetLimits, native SCROW and existing numerical contracts. No string/document/formula stand-ins, shared owner duplication, Writer edits or test partition changes. Sixth task of resumed ten-task interval.

## Plan

Port original compressed row marks and iterator with real ScSheetLimits, unchanged native comparisons, actual100 Calc coverage and inventory; task6 of10.

## Verify Steps

Run native --write and --check with pinned Git blobs/full and extracted source hashes and ASan/UBSan. Compare Search negative/beyond-limit indices, marking splitting/shrinking/coalescing, raw Set, empty/moved state only on defined operations, copy/assignment with destination limits retained, equality independent of limits, next-mark/end and iterator reset/unchanged output references. Include valid start/end and forward interval callers; do not certify native empty Search, out-of-bounds vector access, reversed unsafe mutations or signed64 overflow. Run npm run test:coverage:calc (all four Istanbul metrics actual100), npm run typecheck, npm run test:tooling, affected ESLint/Prettier, check:dependencies/docs/file-size/source-tree/source-provenance, inventory:parity:calc with zero semantic violations, routing, doctor, diff and final clean status. Full suite remains due at task10; no Writer coverage repair.

## Verification

Pending. Prior paired task completed at 5aa36d3e27f0; 72 Calc tests/16files with actual100 coverage. Clean calc checkout, two unrelated active tasks preserved. No independent native manual-refcount string owner exists yet; current selection owner has its real dependency ScSheetLimits.

## Rollback Plan

Revert this implementation commit only; existing address/range/reference owners remain intact.

## Findings

Pinned header records signed30 row bitfields. Original Shift modifies boundaries individually and does not normalize adjacent or collapsed entries. Search accepts negative rows at its first boundary. Native integer narrowing and reference-output preservation require explicit comparisons; no upstream behavior corrections authorized.

- Observation: Native unchanged classes/methods pass2814 initialized sequences and all5 portable tests. Registry ID command rejected unsupported --prefix; no registry mutation occurred.
  Impact: Only capability ID discovery syntax needs correction; approved scope and validation unchanged.
  Resolution: Use installed inventory:id without unsupported arguments, then reconcile new mapped owners and capability.

- Observation: All77 Calc tests pass with actual100 Istanbul; TS7 passes. Affected ESLint/JSDoc checks found missing wire-type comments and @returns on void methods/callbacks.
  Impact: Documentation-only omissions in new authored files; numerical behavior and scope unchanged.
  Resolution: Add required JSDoc, rerun affected lint/docs and proceed with inventory/native final checks.

- Observation: Native --check, affected lint/format, ownership, docs and provenance pass. Runtime inventory rejects header re-export names listed as local declarations.
  Impact: Pure upstream header re-export contains no owned local declarations; provenance correctly maps public exported names, but runtime declaration evidence needs correction.
  Resolution: Follow existing pure-header runtime pattern with empty localSymbols, retain upstream/header/provenance responsibility and new source symbols, rerun Calc inventory and tooling.

- Observation: Runtime inventory also excludes class fields/accessors from its local declaration symbol extraction; nRow/bMarked are rejected despite real initialized entry fields.
  Impact: Runtime localSymbols must describe supported declaration evidence, while provenance continues to record the real entry field contract.
  Resolution: Remove these two field names only from runtime localSymbols, keep class/method owners and source evidence unchanged, rerun inventory.

- Observation: Final native --check matches2814 initialized sequences with debug assertions and ASan/UBSan. Calc77tests and all four actual Istanbul metrics100; TS7, tooling13tests, affected lint/format, ownership/docs/size/tree/provenance and inventory pass.
  Impact: Original row selection owners reuse ScSheetLimits;15 capabilities/127 scoped modules and zero semantic violations. CALC-007 documents collapsed Shift boundaries with unchanged outcomes.
  Resolution: Record complete bounded evidence, commit approved files and close task6 of10. Full multi-selection/document/UI consumers and native undefined/unspecified domains remain explicitly uncertified; no Writer/full-suite changes.
