---
id: "202610092310-2H4HBC"
title: "Port original shared SoA scalar append and new-cell ownership contracts"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 11
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-09T23:11:27.808Z"
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
    body: "Start: port original shared scalar append/new-cell ownership contracts with unchanged genuine native evidence on calc."
events:
  -
    type: "status"
    at: "2026-10-09T23:11:29.017Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: port original shared scalar append/new-cell ownership contracts with unchanged genuine native evidence on calc."
doc_version: 3
doc_updated_at: "2026-10-09T23:11:29.017Z"
doc_updated_by: "CODER"
description: "Continue authorized Calc core on calc branch by porting original shared push_back/push_back_impl/create_new_block_with_new_cell with actual scalar callbacks and lossless native evidence; cycle2 task4/10."
sections:
  Summary: "Port the original shared SoA scalar append group for the authorized Calc core. Cycle2 task4/10; previous goal turn made progress by closing YGCB8W. Work only in vite-office-calc on calc, reuse shared owners and preserve upstream behavior."
  Scope: "Actual main.ts push_back, push_back_impl and create_new_block_with_new_cell member bodies; existing container.test.ts, native-container-cases.json, scripts/mdds-container-native-probe.mjs; shared main.ts runtime/provenance and one new capability record; docs/program/calc-core.md and upstream-suspected-issues.md only if a new evidenced suspicion appears; this task artifacts. No Writer-only changes, separate engine, upstream source rewriting, branch/merge, external publication or arbitrary API repair."
  Plan: "1. Inspect unchanged pinned original member contracts and dependencies. 2. Port exact original scalar append/new-cell member logic using existing explicit scalar callbacks, metadata and iterators. 3. Extend genuine original public callers and valid original private-helper caller bridge across all12 standard types, empty/same/different tails, copy/move/swap and capacity boundaries; include actual original null creation diagnostic through explicit custom native failure-cell ADL. Retain all578 existing complete sequences exactly. 4. Update honest inventory and documentation, keep whole parity flags false. 5. Run declared focused acceptance and gates; bounded repairs inside this scope allowed, never weaken gates. 6. Commit implementation, separate EVALUATOR review, commit review and follow live direct closure. Existing user implementation authorization persists; no additional permission required."
  Verify Steps: "Read task brief/next-action/verify-show. Run node scripts/mdds-container-native-probe.mjs --write then node scripts/mdds-container-native-probe.mjs sequential; actual unchanged full native headers and archive hashes, clang++ libc++ ASan/UBSan, public scalar append and original private helper instantiated through caller-only member bridge, no native algorithm rewriting. Independently decode all raw records, replay actual binary byte-identically, verify driver/header/archive hashes and compare every prior578 complete command/state/final log against plan baseline. Native forwarding caller evidence must prove empty acquisition-before-append and replacement release/delete/create/acquire/append, exact null creation error without normalization. Run npm run test:coverage:calc and affected container/main/iterator/block_util/util/types/block_funcs shared coverage with only main.ts included and reportsDirectory=coverage/append: actual100 S/B/F/L with positive raw counters. Run ordinary npm run test:calc and affected shared and registry-storage/registry-validation/runtime-inventory tests with both upstream symlinks absent, restoring exact targets in finally. Run npm run typecheck; npm run lint; npm run format:check; npm run check:docs; npm run check:file-size (source-shaped existing files may exceed500 but must remain below1000); npm run check:dependencies; npm run check:source-tree; npm run check:source-provenance; npm run test:source-provenance; npm run inventory:parity:calc; npm run inventory:parity:shared; node .agentplane/policy/check-routing.mjs; ap doctor; git diff --check. Full office/inventory/browser suite not due until cycle2 task10; previous full run FMVJ21. No gate weakening or Writer-only coverage repairs. Poll a confirmed live process rather than restarting after timeout."
  Verification: "Pending owner execution; exact commands, results, evidence paths and limitations will be recorded before close."
  Rollback Plan: "Revert only this task implementation commit if required; preserve prior complete native578 corpus and shared ownership/query/resize behavior. User owns merges; do not reset or change branches."
  Findings: "Pinned original no_trace/default execution libc++ target; explicit scalar family witnesses preserve erased C++ overload selection. Custom failure ADL only exercises the original null guard and its actual metadata state. Valid private helper callers replace a single cell block, keeping original metadata invariant. Throwing allocation/events, arbitrary managed/custom types, emplace/variadic construction, other segment mutators, trace/debug/SIMD, native ABI and full Calc/browser parity remain outside this group."
id_source: "generated"
---
## Summary

Port the original shared SoA scalar append group for the authorized Calc core. Cycle2 task4/10; previous goal turn made progress by closing YGCB8W. Work only in vite-office-calc on calc, reuse shared owners and preserve upstream behavior.

## Scope

Actual main.ts push_back, push_back_impl and create_new_block_with_new_cell member bodies; existing container.test.ts, native-container-cases.json, scripts/mdds-container-native-probe.mjs; shared main.ts runtime/provenance and one new capability record; docs/program/calc-core.md and upstream-suspected-issues.md only if a new evidenced suspicion appears; this task artifacts. No Writer-only changes, separate engine, upstream source rewriting, branch/merge, external publication or arbitrary API repair.

## Plan

1. Inspect unchanged pinned original member contracts and dependencies. 2. Port exact original scalar append/new-cell member logic using existing explicit scalar callbacks, metadata and iterators. 3. Extend genuine original public callers and valid original private-helper caller bridge across all12 standard types, empty/same/different tails, copy/move/swap and capacity boundaries; include actual original null creation diagnostic through explicit custom native failure-cell ADL. Retain all578 existing complete sequences exactly. 4. Update honest inventory and documentation, keep whole parity flags false. 5. Run declared focused acceptance and gates; bounded repairs inside this scope allowed, never weaken gates. 6. Commit implementation, separate EVALUATOR review, commit review and follow live direct closure. Existing user implementation authorization persists; no additional permission required.

## Verify Steps

Read task brief/next-action/verify-show. Run node scripts/mdds-container-native-probe.mjs --write then node scripts/mdds-container-native-probe.mjs sequential; actual unchanged full native headers and archive hashes, clang++ libc++ ASan/UBSan, public scalar append and original private helper instantiated through caller-only member bridge, no native algorithm rewriting. Independently decode all raw records, replay actual binary byte-identically, verify driver/header/archive hashes and compare every prior578 complete command/state/final log against plan baseline. Native forwarding caller evidence must prove empty acquisition-before-append and replacement release/delete/create/acquire/append, exact null creation error without normalization. Run npm run test:coverage:calc and affected container/main/iterator/block_util/util/types/block_funcs shared coverage with only main.ts included and reportsDirectory=coverage/append: actual100 S/B/F/L with positive raw counters. Run ordinary npm run test:calc and affected shared and registry-storage/registry-validation/runtime-inventory tests with both upstream symlinks absent, restoring exact targets in finally. Run npm run typecheck; npm run lint; npm run format:check; npm run check:docs; npm run check:file-size (source-shaped existing files may exceed500 but must remain below1000); npm run check:dependencies; npm run check:source-tree; npm run check:source-provenance; npm run test:source-provenance; npm run inventory:parity:calc; npm run inventory:parity:shared; node .agentplane/policy/check-routing.mjs; ap doctor; git diff --check. Full office/inventory/browser suite not due until cycle2 task10; previous full run FMVJ21. No gate weakening or Writer-only coverage repairs. Poll a confirmed live process rather than restarting after timeout.

## Verification

Pending owner execution; exact commands, results, evidence paths and limitations will be recorded before close.

## Rollback Plan

Revert only this task implementation commit if required; preserve prior complete native578 corpus and shared ownership/query/resize behavior. User owns merges; do not reset or change branches.

## Findings

Pinned original no_trace/default execution libc++ target; explicit scalar family witnesses preserve erased C++ overload selection. Custom failure ADL only exercises the original null guard and its actual metadata state. Valid private helper callers replace a single cell block, keeping original metadata invariant. Throwing allocation/events, arbitrary managed/custom types, emplace/variadic construction, other segment mutators, trace/debug/SIMD, native ABI and full Calc/browser parity remain outside this group.
