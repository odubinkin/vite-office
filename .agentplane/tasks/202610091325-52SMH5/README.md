---
id: "202610091325-52SMH5"
title: "Port Calc relative reference wrapping"
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
  updated_at: "2026-10-09T13:26:12.049Z"
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
    body: "Start: implement approved original relative wrapping with native differential evidence and scoped Calc actual100 coverage after resumed goal."
events:
  -
    type: "status"
    at: "2026-10-09T13:26:14.057Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implement approved original relative wrapping with native differential evidence and scoped Calc actual100 coverage after resumed goal."
doc_version: 3
doc_updated_at: "2026-10-09T13:30:23.504Z"
doc_updated_by: "CODER"
description: "Resume Calc after Writer merge and TS7/Istanbul adoption. Port unchanged MoveRelWrap responsibilities and private wrap helper in original ScRefUpdate owner, reuse existing references/limits, native differential comparison, inventory and actual100 scoped coverage. First task of next ten-task full-suite interval."
sections:
  Summary: "Resume Calc with original relative reference wrapping after TS7 and Istanbul merge."
  Scope: "Only calc branch and checkout. Extend apps/office/src/sc/source/core/tool/refupdat.ts, add focused MoveRelWrap test and native fixture, scripts/calc-refwrap-native-probe.mjs, one Calc capability and existing refupdat header/source runtime and provenance records, docs/program/calc-core.md. Existing shared address/reference/limits owners are reused; Writer and coverage configuration unchanged. This is task 1 of the next ten-task full-suite interval."
  Plan: "Port original MoveRelWrap using existing numerical references; exact native differential acceptance, updated inventory, actual100 Istanbul and TS7 scoped checks. First of ten resumed Calc tasks."
  Verify Steps: "Run node scripts/calc-refwrap-native-probe.mjs --write and --check under ASan/UBSan with exact pinned source hashes; canonical-format generated fixture. Compare all native outputs and literal single-step wrap, invalid/deleted, mixed-axis flags, sorted endpoint, custom maxima, positive table counts and identity behavior. Run npm run test:coverage:calc with actual100 Istanbul statements/branches/functions/lines, npm run typecheck, affected ESLint/Prettier, check:dependencies, check:docs, check:file-size, check:source-tree, inventory:parity:calc zero violations, node .agentplane/policy/check-routing.mjs, ap doctor, git diff --check and final clean git status. No full Writer/full E2E run at this milestone; full run every ten tasks per user instruction."
  Verification: "Preflight on clean calc checkout at 44ed369e: existing 48 tests/11 files pass with Istanbul actual100 (959 statements,802 branches,213 functions,853 lines); TS7 tools/application typecheck passes. Implementation evidence pending."
  Rollback Plan: "Revert only the implementation commit for this task; existing transpose/growth and reference owners remain independently verified."
  Findings: |-
    User resumed the paused goal and confirmed merging Writer changes plus TS7/Istanbul. Previous pause instruction was fulfilled and revoked by explicit resume. The helper wraps once, not repeated modulo. toAbs masks invalid axes to -1 before relative wrapping and orders endpoints; SetRange adds deletion flags without clearing old ones. Undefined signed arithmetic remains outside native defined acceptance. No global files/network or merge operations needed.

    - Observation: Native probe stopped at upstream ValidCol debug assertion: native debug build restricts maxima to standard/jumbo constants, while release comparison includes explicit custom limits.
      Impact: No fixture produced; sanitizer-clean release semantics must be selected explicitly before bounded custom-maximum acceptance.
      Resolution: Compile the unchanged native sources with NDEBUG, matching release-only comparison and prior documented exclusion of debug assertion enforcement; retain ASan/UBSan and all original function bodies.

    - Observation: Inventory ID CLI rejects --help; it accepts only id/build/check plus scope.
      Impact: No records changed; capability ID allocation not performed.
      Resolution: Read declared CLI usage and invoke existing npm run inventory:id without extra flags.
id_source: "generated"
---
## Summary

Resume Calc with original relative reference wrapping after TS7 and Istanbul merge.

## Scope

Only calc branch and checkout. Extend apps/office/src/sc/source/core/tool/refupdat.ts, add focused MoveRelWrap test and native fixture, scripts/calc-refwrap-native-probe.mjs, one Calc capability and existing refupdat header/source runtime and provenance records, docs/program/calc-core.md. Existing shared address/reference/limits owners are reused; Writer and coverage configuration unchanged. This is task 1 of the next ten-task full-suite interval.

## Plan

Port original MoveRelWrap using existing numerical references; exact native differential acceptance, updated inventory, actual100 Istanbul and TS7 scoped checks. First of ten resumed Calc tasks.

## Verify Steps

Run node scripts/calc-refwrap-native-probe.mjs --write and --check under ASan/UBSan with exact pinned source hashes; canonical-format generated fixture. Compare all native outputs and literal single-step wrap, invalid/deleted, mixed-axis flags, sorted endpoint, custom maxima, positive table counts and identity behavior. Run npm run test:coverage:calc with actual100 Istanbul statements/branches/functions/lines, npm run typecheck, affected ESLint/Prettier, check:dependencies, check:docs, check:file-size, check:source-tree, inventory:parity:calc zero violations, node .agentplane/policy/check-routing.mjs, ap doctor, git diff --check and final clean git status. No full Writer/full E2E run at this milestone; full run every ten tasks per user instruction.

## Verification

Preflight on clean calc checkout at 44ed369e: existing 48 tests/11 files pass with Istanbul actual100 (959 statements,802 branches,213 functions,853 lines); TS7 tools/application typecheck passes. Implementation evidence pending.

## Rollback Plan

Revert only the implementation commit for this task; existing transpose/growth and reference owners remain independently verified.

## Findings

User resumed the paused goal and confirmed merging Writer changes plus TS7/Istanbul. Previous pause instruction was fulfilled and revoked by explicit resume. The helper wraps once, not repeated modulo. toAbs masks invalid axes to -1 before relative wrapping and orders endpoints; SetRange adds deletion flags without clearing old ones. Undefined signed arithmetic remains outside native defined acceptance. No global files/network or merge operations needed.

- Observation: Native probe stopped at upstream ValidCol debug assertion: native debug build restricts maxima to standard/jumbo constants, while release comparison includes explicit custom limits.
  Impact: No fixture produced; sanitizer-clean release semantics must be selected explicitly before bounded custom-maximum acceptance.
  Resolution: Compile the unchanged native sources with NDEBUG, matching release-only comparison and prior documented exclusion of debug assertion enforcement; retain ASan/UBSan and all original function bodies.

- Observation: Inventory ID CLI rejects --help; it accepts only id/build/check plus scope.
  Impact: No records changed; capability ID allocation not performed.
  Resolution: Read declared CLI usage and invoke existing npm run inventory:id without extra flags.
