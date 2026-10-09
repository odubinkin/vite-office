---
id: "202610092130-FMVJ21"
title: "Port original shared SoA container lifetime and iterator ownership"
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
  updated_at: "2026-10-09T21:31:48.497Z"
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
    body: "Start: port actual original container lifetime/value/iterator ownership over existing shared arrays and callbacks, then execute the due full suites under the resumed Calc goal."
events:
  -
    type: "status"
    at: "2026-10-09T21:31:49.321Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: port actual original container lifetime/value/iterator ownership over existing shared arrays and callbacks, then execute the due full suites under the resumed Calc goal."
doc_version: 3
doc_updated_at: "2026-10-09T21:31:49.321Z"
doc_updated_by: "CODER"
description: "Task10/10: port the actual original multi_type_vector ownership/constructor lifecycle, value-semantic event witness and iterator/size access over existing shared blocks_type/block funcs; original behavior and defaults including moved-from logical size. Full office/inventory/browser checks due in this task; no Writer-only coverage repairs."
sections:
  Summary: "Port the actual original shared SoA multi_type_vector container ownership group over already implemented original blocks, arrays and iterators. Task10/10 under the resumed approved Calc goal. Full suites are due after scoped acceptance in this task. Preserve upstream behavior, including moved-from logical size, event value semantics and sequential callback ordering."
  Scope: "Modify existing soa/main.ts and soa/main_def.ts, add soa/container.test.ts and native-container-cases.json, scripts/mdds-container-native-probe.mjs, new shared capability plus existing main/main_def runtime/provenance additions, docs/program/calc-core.md and confirmed suspected-issue journal. Real original default/handler/empty-size/typed-fill/input-range/copy/clone/move constructors, copy/move assignment, destructor-to-dispose syntax mapping, clear/full swap/shrink, equality/inequality, event_handler/size/block_size/empty and all four mutable/const forward/reverse iterator endpoint factories. Reuse existing scalar macro callbacks, standard blocks/block_funcs, blocks_type, main_def helpers, normal storage and iterator owners. Explicit typed witnesses adapt erased native scalar overloads and event copy/move/swap operations; use actual default empty_event_func, preserve borrowed event_handler field identity. No fake document/segment engine, field pretense, unsupported methods or SIMD fallback. Row lookup/value retrieval/segment mutations and optional trace/debug instrumentation are subsequent original responsibility groups, explicitly unverified. No Writer/UI/save/recovery changes, branches, merges, source rewriting or network. Full-run failure corrections only within Calc/shared scope; Writer-only coverage gaps retained per user. Existing unrelated tasks untouched."
  Plan: "Port genuine original SoA container lifecycle/constructor/operator/iterator ownership group with real existing shared owners and explicit erased native value operators. Verify unchanged native full states and actual100 Calc/changed shared, then execute due full suites once for current10-task cycle; retain user-approved Writer-only coverage gaps."
  Verify Steps: "node scripts/mdds-container-native-probe.mjs --write and node scripts/mdds-container-native-probe.mjs: complete pinned archive/header verification, unchanged original actual container owner/constructors/assigned temporaries/iterators, ASan/UBSan. All12 scalar families, no guessing JS numeric types; zero/nonzero empty/fill/range/handler/copy/clone/move paths, exact invalid_arg_error diagnostic, no range dereference when init_size0. Full states and sequential acquired/released event records before/after every command, scalar data/capacity and stable pointer tokens; original copied handler values, moved shared state, event field identity and moved-from logical size, self-copy and self-move assignment, full/self swap, clear/dispose and iterator endpoints. Nonthrowing event witness and no_trace/default execution target explicitly scoped; invalid object lifetimes/end dereference/throwing native destructor paths receive no invented successful results. Native byte-for-byte raw replay, every portable full state decode, source/archive/driver hashes. npm run test:coverage:calc: all Calc tests actual100 four metrics, positive denominators. npm run test:coverage:shared -- src/external/mdds/include/mdds/multi_type_vector/soa/container.test.ts src/external/mdds/include/mdds/multi_type_vector/soa/main.test.ts src/external/mdds/include/mdds/multi_type_vector/soa/iterator.test.ts src/external/mdds/include/mdds/multi_type_vector/soa/block_util.test.ts src/external/mdds/include/mdds/multi_type_vector/util.test.ts src/external/mdds/include/mdds/multi_type_vector/types.test.ts src/external/mdds/include/mdds/multi_type_vector/block_funcs.test.ts --coverage.include=src/external/mdds/include/mdds/multi_type_vector/soa/main.ts --coverage.include=src/external/mdds/include/mdds/multi_type_vector/soa/main_def.ts --coverage.reportsDirectory=coverage/container: changed2 files actual100 four metrics with positive scope denominators and independently audited raw counters. Original unchanged block-store native probe must still pass. Ordinary selected Calc/shared plus affected registry-storage/registry-validation/runtime-inventory tests without both upstream links, try/finally exact restoration. Due full run: npm run test:coverage -- --coverage.reportOnFailure=true; npm run test:inventory:coverage; npm run test:tooling; npm run test:e2e (all named projects, Calc absence explicit); npm run test:static. Full suites run with both reference links absent to prove portable acceptance, sequential heavy jobs and exact restoration. Coverage gate failures attributable only to Writer are user-approved residuals, not globally green evidence. npm run format:check; npm run lint; npm run typecheck; npm run check:docs; npm run check:file-size; npm run check:dependencies; npm run check:source-tree; npm run check:source-provenance; npm run test:source-provenance; npm run inventory:parity:calc; npm run inventory:parity:shared; node .agentplane/policy/check-routing.mjs; ap doctor; git diff --check. Record every required command result, actual full-suite counts/coverage exceptions and related correction evidence. No reset/restart of a confirmed live process on observation timeout."
  Verification: "Pending implementation, scoped acceptance and due full run."
  Rollback Plan: "Revert only deliberate task implementation/docs/registry commits on calc if requested. Preserve prior original shared modules, compiler inputs, exact local reference links and unrelated tasks."
  Findings: "Preflight branch calc clean; previous task9 completed. Original move constructor moves the primitive size value without resetting the source, while vectors move away; source size and empty therefore differ until clear. Original assignments use a temporary and swap even for self-copy/self-move. Event handler references name stable native fields, so runtime event value witnesses must exchange contents rather than swap JS object references. Optional native trace/debug and ABI qualifications are explicitly unverified; no whole-container or UI readiness claim."
id_source: "generated"
---
## Summary

Port the actual original shared SoA multi_type_vector container ownership group over already implemented original blocks, arrays and iterators. Task10/10 under the resumed approved Calc goal. Full suites are due after scoped acceptance in this task. Preserve upstream behavior, including moved-from logical size, event value semantics and sequential callback ordering.

## Scope

Modify existing soa/main.ts and soa/main_def.ts, add soa/container.test.ts and native-container-cases.json, scripts/mdds-container-native-probe.mjs, new shared capability plus existing main/main_def runtime/provenance additions, docs/program/calc-core.md and confirmed suspected-issue journal. Real original default/handler/empty-size/typed-fill/input-range/copy/clone/move constructors, copy/move assignment, destructor-to-dispose syntax mapping, clear/full swap/shrink, equality/inequality, event_handler/size/block_size/empty and all four mutable/const forward/reverse iterator endpoint factories. Reuse existing scalar macro callbacks, standard blocks/block_funcs, blocks_type, main_def helpers, normal storage and iterator owners. Explicit typed witnesses adapt erased native scalar overloads and event copy/move/swap operations; use actual default empty_event_func, preserve borrowed event_handler field identity. No fake document/segment engine, field pretense, unsupported methods or SIMD fallback. Row lookup/value retrieval/segment mutations and optional trace/debug instrumentation are subsequent original responsibility groups, explicitly unverified. No Writer/UI/save/recovery changes, branches, merges, source rewriting or network. Full-run failure corrections only within Calc/shared scope; Writer-only coverage gaps retained per user. Existing unrelated tasks untouched.

## Plan

Port genuine original SoA container lifecycle/constructor/operator/iterator ownership group with real existing shared owners and explicit erased native value operators. Verify unchanged native full states and actual100 Calc/changed shared, then execute due full suites once for current10-task cycle; retain user-approved Writer-only coverage gaps.

## Verify Steps

node scripts/mdds-container-native-probe.mjs --write and node scripts/mdds-container-native-probe.mjs: complete pinned archive/header verification, unchanged original actual container owner/constructors/assigned temporaries/iterators, ASan/UBSan. All12 scalar families, no guessing JS numeric types; zero/nonzero empty/fill/range/handler/copy/clone/move paths, exact invalid_arg_error diagnostic, no range dereference when init_size0. Full states and sequential acquired/released event records before/after every command, scalar data/capacity and stable pointer tokens; original copied handler values, moved shared state, event field identity and moved-from logical size, self-copy and self-move assignment, full/self swap, clear/dispose and iterator endpoints. Nonthrowing event witness and no_trace/default execution target explicitly scoped; invalid object lifetimes/end dereference/throwing native destructor paths receive no invented successful results. Native byte-for-byte raw replay, every portable full state decode, source/archive/driver hashes. npm run test:coverage:calc: all Calc tests actual100 four metrics, positive denominators. npm run test:coverage:shared -- src/external/mdds/include/mdds/multi_type_vector/soa/container.test.ts src/external/mdds/include/mdds/multi_type_vector/soa/main.test.ts src/external/mdds/include/mdds/multi_type_vector/soa/iterator.test.ts src/external/mdds/include/mdds/multi_type_vector/soa/block_util.test.ts src/external/mdds/include/mdds/multi_type_vector/util.test.ts src/external/mdds/include/mdds/multi_type_vector/types.test.ts src/external/mdds/include/mdds/multi_type_vector/block_funcs.test.ts --coverage.include=src/external/mdds/include/mdds/multi_type_vector/soa/main.ts --coverage.include=src/external/mdds/include/mdds/multi_type_vector/soa/main_def.ts --coverage.reportsDirectory=coverage/container: changed2 files actual100 four metrics with positive scope denominators and independently audited raw counters. Original unchanged block-store native probe must still pass. Ordinary selected Calc/shared plus affected registry-storage/registry-validation/runtime-inventory tests without both upstream links, try/finally exact restoration. Due full run: npm run test:coverage -- --coverage.reportOnFailure=true; npm run test:inventory:coverage; npm run test:tooling; npm run test:e2e (all named projects, Calc absence explicit); npm run test:static. Full suites run with both reference links absent to prove portable acceptance, sequential heavy jobs and exact restoration. Coverage gate failures attributable only to Writer are user-approved residuals, not globally green evidence. npm run format:check; npm run lint; npm run typecheck; npm run check:docs; npm run check:file-size; npm run check:dependencies; npm run check:source-tree; npm run check:source-provenance; npm run test:source-provenance; npm run inventory:parity:calc; npm run inventory:parity:shared; node .agentplane/policy/check-routing.mjs; ap doctor; git diff --check. Record every required command result, actual full-suite counts/coverage exceptions and related correction evidence. No reset/restart of a confirmed live process on observation timeout.

## Verification

Pending implementation, scoped acceptance and due full run.

## Rollback Plan

Revert only deliberate task implementation/docs/registry commits on calc if requested. Preserve prior original shared modules, compiler inputs, exact local reference links and unrelated tasks.

## Findings

Preflight branch calc clean; previous task9 completed. Original move constructor moves the primitive size value without resetting the source, while vectors move away; source size and empty therefore differ until clear. Original assignments use a temporary and swap even for self-copy/self-move. Event handler references name stable native fields, so runtime event value witnesses must exchange contents rather than swap JS object references. Optional native trace/debug and ABI qualifications are explicitly unverified; no whole-container or UI readiness claim.
