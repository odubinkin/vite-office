---
id: "202610092112-5PF7GY"
title: "Port original shared SoA position adjustment specializations"
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
  updated_at: "2026-10-09T21:13:34.019Z"
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
    body: "Start: port original five scalar SoA position-adjustment specializations, reusing shared owners and preserving default/native behavior under the resumed Calc goal."
events:
  -
    type: "status"
    at: "2026-10-09T21:13:34.858Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: port original five scalar SoA position-adjustment specializations, reusing shared owners and preserving default/native behavior under the resumed Calc goal."
doc_version: 3
doc_updated_at: "2026-10-09T21:13:34.858Z"
doc_updated_by: "CODER"
description: "Task9/10: implement original none/lu4/lu8/lu16/lu32 SoA block position adjustment over reused shared real vectors, preserving default lu16 and unchanged original native observations. No alternate container or SIMD fallback; inventory explicit architecture/generic gaps. Active user goal authorizes local Calc branch work."
sections:
  Summary: "Port the original SoA position-adjustment dependencies needed by the real shared mdds container. Task9/10 under the already approved resumed Calc goal. Match original scalar specialization boundaries, defaults and ordered unrolled loops; no alternative engine or architecture fallback."
  Scope: "New shared soa/block_util.ts and block_util.test.ts, committed portable native-position-adjustment-cases.json; new scripts/mdds-position-adjustment-native-probe.mjs consuming the existing unchanged source verifier; new shared capability/runtime/provenance records and exhaustive helper operation if required; docs/program/calc-core.md and upstream-suspected-issues.md if confirmed evidence requires an entry. Reuse shared std_vector, actual blocks_type, scalar block_funcs, lu_factor_t and default_traits. No existing module behavior changes, Writer/UI/save/recovery changes, merges, branches, network or compiler input rewrites. Exact scalar specializations none/lu4/lu8/lu16/lu32 as the original architecture-neutral source; browser callable specialization factory is template-syntax adaptation, not public engine. Original SIMD compile-time-disabled families on this arm64 native target and OpenMP are explicit unimplemented responsibilities, no successful fallback claims."
  Plan: "Execute approved shared SoA scalar position-adjustment dependency plan in task README; exact original none/lu4/lu8/lu16/lu32 loops, reused real owners, unchanged native full-state corpus, actual100 scoped coverage and inventory. Task9/10, no SIMD fallback or full container claim."
  Verify Steps: "node scripts/mdds-position-adjustment-native-probe.mjs --write and node scripts/mdds-position-adjustment-native-probe.mjs: verify complete pinned original sources/archives, unchanged actual private owner and original scalar specialization calls under ASan/UBSan. Every committed case decodes complete native before/after snapshots, original five factors/default and target architecture macros; all valid size/start/unrolled remainder paths, zero/positive/negative int64 deltas, uint64 wrap and >int32 early-return indices. Original source and default helper loop grouping retained; metadata, block pointers/data and capacities unchanged. Never give successful fixture results to invalid negative native indices. Independent raw decode, actual binary replay and driver/13-header/2-archive hashes. npm run test:coverage:calc: all Calc tests, actual100 statements/branches/functions/lines with positive scope denominators. npm run test:coverage:shared -- src/external/mdds/include/mdds/multi_type_vector/soa/block_util.test.ts src/external/mdds/include/mdds/multi_type_vector/soa/main.test.ts src/external/mdds/include/mdds/multi_type_vector/soa/iterator.test.ts src/external/mdds/include/mdds/multi_type_vector/util.test.ts --coverage.include=src/external/mdds/include/mdds/multi_type_vector/soa/block_util.ts --coverage.reportsDirectory=coverage/position-adjustment: changed runtime owner actual100 four metrics, positive denominators and raw-counter independent audit. Detach both upstream symlinks in try/finally, run all Calc/selected4 shared and affected registry-storage/registry-validation/runtime-inventory tests, restore exact targets. npm run typecheck; npm run test:tooling; npm run test:source-provenance; scoped ESLint/Prettier; npm run check:docs; npm run check:file-size; npm run check:dependencies; npm run check:source-tree; npm run check:source-provenance; npm run inventory:parity:calc; npm run inventory:parity:shared; node .agentplane/policy/check-routing.mjs; ap doctor; git diff --check. Record exact scope evidence and honest generic/SIMD/OpenMP/container gaps. Full office/browser/inventory suites skipped under user once-per10 completed tasks cadence, currenttask9."
  Verification: "Pending implementation and declared checks."
  Rollback Plan: "Revert only intentional task source/docs/registry commits on calc if requested. Preserve existing common owners, local upstream references, original compiler sources and all unrelated task state."
  Findings: "Previous task8 completed with clean branch. Native host is arm64, size_t64; __SSE2__/__AVX2__ absent. Original default_traits::loop_unrolling is lu16 (not lu32). Existing scalar enum values and genuine shared real reserved-slot vectors/three-array owners are reused. This dependency task does not claim complete multi_type_vector, Calc column/document or UI readiness."
id_source: "generated"
---
## Summary

Port the original SoA position-adjustment dependencies needed by the real shared mdds container. Task9/10 under the already approved resumed Calc goal. Match original scalar specialization boundaries, defaults and ordered unrolled loops; no alternative engine or architecture fallback.

## Scope

New shared soa/block_util.ts and block_util.test.ts, committed portable native-position-adjustment-cases.json; new scripts/mdds-position-adjustment-native-probe.mjs consuming the existing unchanged source verifier; new shared capability/runtime/provenance records and exhaustive helper operation if required; docs/program/calc-core.md and upstream-suspected-issues.md if confirmed evidence requires an entry. Reuse shared std_vector, actual blocks_type, scalar block_funcs, lu_factor_t and default_traits. No existing module behavior changes, Writer/UI/save/recovery changes, merges, branches, network or compiler input rewrites. Exact scalar specializations none/lu4/lu8/lu16/lu32 as the original architecture-neutral source; browser callable specialization factory is template-syntax adaptation, not public engine. Original SIMD compile-time-disabled families on this arm64 native target and OpenMP are explicit unimplemented responsibilities, no successful fallback claims.

## Plan

Execute approved shared SoA scalar position-adjustment dependency plan in task README; exact original none/lu4/lu8/lu16/lu32 loops, reused real owners, unchanged native full-state corpus, actual100 scoped coverage and inventory. Task9/10, no SIMD fallback or full container claim.

## Verify Steps

node scripts/mdds-position-adjustment-native-probe.mjs --write and node scripts/mdds-position-adjustment-native-probe.mjs: verify complete pinned original sources/archives, unchanged actual private owner and original scalar specialization calls under ASan/UBSan. Every committed case decodes complete native before/after snapshots, original five factors/default and target architecture macros; all valid size/start/unrolled remainder paths, zero/positive/negative int64 deltas, uint64 wrap and >int32 early-return indices. Original source and default helper loop grouping retained; metadata, block pointers/data and capacities unchanged. Never give successful fixture results to invalid negative native indices. Independent raw decode, actual binary replay and driver/13-header/2-archive hashes. npm run test:coverage:calc: all Calc tests, actual100 statements/branches/functions/lines with positive scope denominators. npm run test:coverage:shared -- src/external/mdds/include/mdds/multi_type_vector/soa/block_util.test.ts src/external/mdds/include/mdds/multi_type_vector/soa/main.test.ts src/external/mdds/include/mdds/multi_type_vector/soa/iterator.test.ts src/external/mdds/include/mdds/multi_type_vector/util.test.ts --coverage.include=src/external/mdds/include/mdds/multi_type_vector/soa/block_util.ts --coverage.reportsDirectory=coverage/position-adjustment: changed runtime owner actual100 four metrics, positive denominators and raw-counter independent audit. Detach both upstream symlinks in try/finally, run all Calc/selected4 shared and affected registry-storage/registry-validation/runtime-inventory tests, restore exact targets. npm run typecheck; npm run test:tooling; npm run test:source-provenance; scoped ESLint/Prettier; npm run check:docs; npm run check:file-size; npm run check:dependencies; npm run check:source-tree; npm run check:source-provenance; npm run inventory:parity:calc; npm run inventory:parity:shared; node .agentplane/policy/check-routing.mjs; ap doctor; git diff --check. Record exact scope evidence and honest generic/SIMD/OpenMP/container gaps. Full office/browser/inventory suites skipped under user once-per10 completed tasks cadence, currenttask9.

## Verification

Pending implementation and declared checks.

## Rollback Plan

Revert only intentional task source/docs/registry commits on calc if requested. Preserve existing common owners, local upstream references, original compiler sources and all unrelated task state.

## Findings

Previous task8 completed with clean branch. Native host is arm64, size_t64; __SSE2__/__AVX2__ absent. Original default_traits::loop_unrolling is lu16 (not lu32). Existing scalar enum values and genuine shared real reserved-slot vectors/three-array owners are reused. This dependency task does not claim complete multi_type_vector, Calc column/document or UI readiness.
