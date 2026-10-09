---
id: "202610091404-4QBVYR"
title: "Port Calc range-list reference updates"
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
  updated_at: "2026-10-09T14:04:54.941Z"
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
    body: "Start: Implement approved native range-list update pipeline in calc checkout."
events:
  -
    type: "status"
    at: "2026-10-09T14:05:04.440Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: Implement approved native range-list update pipeline in calc checkout."
doc_version: 3
doc_updated_at: "2026-10-09T14:13:01.072Z"
doc_updated_by: "CODER"
description: "Connect original ScRangeList UpdateReference deletion, update and join ordering to the existing ScRefUpdate owner, with native comparisons, 100 percent Calc coverage and inventory."
sections:
  Summary: "Port original ScRangeList UpdateReference using the existing ScRefUpdate numerical owner."
  Scope: "Calc branch and checkout only. Existing range-list source/header registries, new range-list update test/native fixture and native probe, one new capability, reconciliation of previous capability gaps and calc-core documentation. Existing geometry, shared and Writer owners remain reused without source duplication. Fourth task of the resumed ten-task full-validation interval."
  Plan: "Port original ScRangeList UpdateReference, compare unchanged native deletion/update/join pipeline, actual100 Calc coverage and inventory; task4 of10."
  Verify Steps: "Run node scripts/calc-rangelist-update-native-probe.mjs --write and --check; retain exact pinned Git bodies/hashes and sanitizer checks. Compare ordered values, changed results and cache-sensitive follow-up joins over all modes, axes, clipping, empty/deleted lists, same/multiple tabs, expansion and native dual-negative-delta overwrite. Retain original ucalc_rangelst deletion test assertions. Run npm run test:coverage:calc with actual100 statements/branches/functions/lines, npm run typecheck, npm run test:tooling, affected ESLint/Prettier, check:dependencies, check:docs, check:file-size, check:source-tree, check:source-provenance, inventory:parity:calc, routing, doctor and final clean status. Full suites run at task10, no Writer coverage fixes."
  Verification: "Pending implementation. Clean calc HEAD00508595e78e; previous three resumed tasks passed actual100 Calc coverage and native differential checks."
  Rollback Plan: "Revert only this implementation commit, leaving existing range-list geometry and ScRefUpdate owners intact."
  Findings: |-
    Native dual-negative delta overwrites changed with the second DeleteArea result. Input ranges borrowed from a list may be invalidated by native vector deletion, so differential inputs use independent where values. The document surface remains the existing structural getter contract; full ScDocument/compiler/I/O owners are subsequent work. No network, merge or global file access required.

    - Observation: Initial read used the old source-root shorthand; Calc sources reside under apps/office/src/sc. The native driver must parse displacement inputs wider than their receiving native parameter types to test boundary conversion.
      Impact: No production change or verification criteria changed.
      Resolution: Use verified application paths and signed64 driver input before native parameter conversion.

    - Observation: inventory:parity:calc rejected an upstream header marker with normalized spacing: bool UpdateReference( is absent.
      Impact: Evidence marker only; native execution and runtime tests passed. No scope or verification criterion change.
      Resolution: Use the exact pinned declaration spelling and rerun scoped registry validation.
id_source: "generated"
---
## Summary

Port original ScRangeList UpdateReference using the existing ScRefUpdate numerical owner.

## Scope

Calc branch and checkout only. Existing range-list source/header registries, new range-list update test/native fixture and native probe, one new capability, reconciliation of previous capability gaps and calc-core documentation. Existing geometry, shared and Writer owners remain reused without source duplication. Fourth task of the resumed ten-task full-validation interval.

## Plan

Port original ScRangeList UpdateReference, compare unchanged native deletion/update/join pipeline, actual100 Calc coverage and inventory; task4 of10.

## Verify Steps

Run node scripts/calc-rangelist-update-native-probe.mjs --write and --check; retain exact pinned Git bodies/hashes and sanitizer checks. Compare ordered values, changed results and cache-sensitive follow-up joins over all modes, axes, clipping, empty/deleted lists, same/multiple tabs, expansion and native dual-negative-delta overwrite. Retain original ucalc_rangelst deletion test assertions. Run npm run test:coverage:calc with actual100 statements/branches/functions/lines, npm run typecheck, npm run test:tooling, affected ESLint/Prettier, check:dependencies, check:docs, check:file-size, check:source-tree, check:source-provenance, inventory:parity:calc, routing, doctor and final clean status. Full suites run at task10, no Writer coverage fixes.

## Verification

Pending implementation. Clean calc HEAD00508595e78e; previous three resumed tasks passed actual100 Calc coverage and native differential checks.

## Rollback Plan

Revert only this implementation commit, leaving existing range-list geometry and ScRefUpdate owners intact.

## Findings

Native dual-negative delta overwrites changed with the second DeleteArea result. Input ranges borrowed from a list may be invalidated by native vector deletion, so differential inputs use independent where values. The document surface remains the existing structural getter contract; full ScDocument/compiler/I/O owners are subsequent work. No network, merge or global file access required.

- Observation: Initial read used the old source-root shorthand; Calc sources reside under apps/office/src/sc. The native driver must parse displacement inputs wider than their receiving native parameter types to test boundary conversion.
  Impact: No production change or verification criteria changed.
  Resolution: Use verified application paths and signed64 driver input before native parameter conversion.

- Observation: inventory:parity:calc rejected an upstream header marker with normalized spacing: bool UpdateReference( is absent.
  Impact: Evidence marker only; native execution and runtime tests passed. No scope or verification criterion change.
  Resolution: Use the exact pinned declaration spelling and rerun scoped registry validation.
