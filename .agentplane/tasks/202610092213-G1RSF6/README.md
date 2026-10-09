---
id: "202610092213-G1RSF6"
title: "Port original shared SoA block lookup and scalar read contracts"
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
  updated_at: "2026-10-09T22:14:46.222Z"
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
    body: "Start: port original block search/positions/scalar reads over actual shared metadata/callback/iterator owners, extend unchanged native callers and preserve every original lifetime sequence; cycle2 scoped acceptance only."
events:
  -
    type: "status"
    at: "2026-10-09T22:14:55.828Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: port original block search/positions/scalar reads over actual shared metadata/callback/iterator owners, extend unchanged native callers and preserve every original lifetime sequence; cycle2 scoped acceptance only."
doc_version: 3
doc_updated_at: "2026-10-09T22:14:55.828Z"
doc_updated_by: "CODER"
description: "Cycle2 task1/10. Extend the actual original shared container with default/hinted block lookup, mutable/const positions, scalar reads/type/empty queries and original forward iterator construction over existing shared metadata/callback/iterator owners. Preserve upstream end-position, hint parent/cache and exact diagnostics. Reuse unchanged native lifetime observer/corpus with query cases; scoped actual100 and no-upstream ordinary acceptance, no full run due."
sections:
  Summary: "Cycle2 task1/10: port the actual original SoA container block-search and scalar-read responsibility group over existing shared owners. Preserve source algorithms, original position-end distinction, hint-parent/cache behavior and exact diagnostics. Full cycle was completed in FMVJ21; no full suite is due here."
  Scope: "Extend soa/main.ts and main_def.ts with original default/hinted get_block_position, get_iterator/get_const_iterator, four mutable/const position overloads, get_type/is_empty and typed get_impl/get overload results. Use existing scalar callback families and real iterator/block owners. Consolidate existing iterator factory construction as original inline member implementation helpers to keep module budgets; preserve all existing lifetime/endpoints. Extend existing native container probe/corpus and container.test.ts rather than duplicate its actual field/payload/event observer or input loading. If the native std::lower_bound syntax witness requires shared infrastructure, add only that erased standard algorithm to existing vector_storage.ts with direct meaningful tests and update its existing runtime/provenance; do not add another container engine. Update affected shared runtime/provenance/capability records, Calc core docs and confirmed upstream case journal. Explicit size_t64 row witnesses permit exact bigint early-out before number projection, with bounded representable stored metadata. Source-contextual diagnostics retain pinned original caller-line witnesses. No segment mutation/next/advance/static typed-position getter, trace/debug, generic custom/managed blocks, invalid native lifetimes/hints or Calc document/browser implementation claims. No Writer/save/recovery/runtime changes, branches, merges or network. Already approved goal authorizes safe local implementation/verification and bounded Calc/shared check corrections. Unrelated tasks remain untouched."
  Plan: "Port original read-only SoA block search, hinted mutable/const positions and typed scalar/type/empty queries using shared actual owners; extend unchanged native ownership probe/corpus and original prefix, preserve exact errors/end/default/hint behavior, actual100 scoped portable acceptance and source inventory. Cycle2 task1/10, full suites not due."
  Verify Steps: "node scripts/mdds-container-native-probe.mjs --write then node scripts/mdds-container-native-probe.mjs, sequential with node scripts/mdds-block-store-native-probe.mjs if shared storage changes: pinned complete original archives/compiler headers, ASan/UBSan, no original algorithm rewriting. All original217 ownership sequences retained plus deterministic default/hinted query matrices over all12 scalar families, empty/mixed/copy/move owners, zero/end/beyond-end and uint64 maximum row early-outs. Native actual pointer/handler/event/payload/capacity/endpoints remain unchanged by valid reads; full mutable/const query result/error/hint evidence. Invalid native hints/end dereference/uninitialized lifetimes receive no invented successful output. Actual native binary byte replay, all portable raw record decodes, driver/source/archive hashes and positive raw coverage counters. npm run test:coverage:calc: all Calc tests actual100 four metrics. npm run test:coverage:shared -- src/external/mdds/include/mdds/multi_type_vector/soa/container.test.ts src/external/mdds/include/mdds/multi_type_vector/soa/main.test.ts src/external/mdds/include/mdds/multi_type_vector/soa/iterator.test.ts src/external/mdds/include/mdds/multi_type_vector/soa/block_util.test.ts src/external/mdds/include/mdds/multi_type_vector/util.test.ts src/external/mdds/include/mdds/multi_type_vector/types.test.ts src/external/mdds/include/mdds/multi_type_vector/block_funcs.test.ts plus vector_storage.test.ts if added, with explicit coverage.include changed runtime files only and reportsDirectory coverage/container: actual100 four metrics/positive denominators. Ordinary Calc/affected shared and registry-storage/registry-validation/runtime-inventory tests with both upstream symlinks absent, exact finally restoration. npm run typecheck; npm run lint; npm run format:check; npm run check:docs; npm run check:file-size; npm run check:dependencies; npm run check:source-tree; npm run check:source-provenance; npm run test:source-provenance; npm run inventory:parity:calc; npm run inventory:parity:shared; node .agentplane/policy/check-routing.mjs; ap doctor; git diff --check. No full office/inventory/browser suite due at cycle2 task1/10; approved cadence keeps once per10. Never restart a confirmed live native/test process on observation timeout."
  Verification: "Pending implementation and scoped native/portable/static acceptance. No full suite due; FMVJ21 full acceptance recorded in prior task."
  Rollback Plan: "Revert only intentional G1RSF6 commits on calc if requested; preserve prior original ownership/helpers, exact upstream links, native source inputs and unrelated tasks."
  Findings: "Read source confirms position(size) returns a valid endpoint pair before lookup; scalar get/get_type/is_empty reject that row. Hinted lookup consumes original cached private parent/index, including source swap behavior; no heuristic repair is introduced. Existing shared util already supplies original size_t diagnostic, scalar callbacks adapt output reference as typed return, and existing iterators cache node values with original forward category updates. Main.ts currently485 lines; helper placement must preserve source responsibility and budgets."
id_source: "generated"
---
## Summary

Cycle2 task1/10: port the actual original SoA container block-search and scalar-read responsibility group over existing shared owners. Preserve source algorithms, original position-end distinction, hint-parent/cache behavior and exact diagnostics. Full cycle was completed in FMVJ21; no full suite is due here.

## Scope

Extend soa/main.ts and main_def.ts with original default/hinted get_block_position, get_iterator/get_const_iterator, four mutable/const position overloads, get_type/is_empty and typed get_impl/get overload results. Use existing scalar callback families and real iterator/block owners. Consolidate existing iterator factory construction as original inline member implementation helpers to keep module budgets; preserve all existing lifetime/endpoints. Extend existing native container probe/corpus and container.test.ts rather than duplicate its actual field/payload/event observer or input loading. If the native std::lower_bound syntax witness requires shared infrastructure, add only that erased standard algorithm to existing vector_storage.ts with direct meaningful tests and update its existing runtime/provenance; do not add another container engine. Update affected shared runtime/provenance/capability records, Calc core docs and confirmed upstream case journal. Explicit size_t64 row witnesses permit exact bigint early-out before number projection, with bounded representable stored metadata. Source-contextual diagnostics retain pinned original caller-line witnesses. No segment mutation/next/advance/static typed-position getter, trace/debug, generic custom/managed blocks, invalid native lifetimes/hints or Calc document/browser implementation claims. No Writer/save/recovery/runtime changes, branches, merges or network. Already approved goal authorizes safe local implementation/verification and bounded Calc/shared check corrections. Unrelated tasks remain untouched.

## Plan

Port original read-only SoA block search, hinted mutable/const positions and typed scalar/type/empty queries using shared actual owners; extend unchanged native ownership probe/corpus and original prefix, preserve exact errors/end/default/hint behavior, actual100 scoped portable acceptance and source inventory. Cycle2 task1/10, full suites not due.

## Verify Steps

node scripts/mdds-container-native-probe.mjs --write then node scripts/mdds-container-native-probe.mjs, sequential with node scripts/mdds-block-store-native-probe.mjs if shared storage changes: pinned complete original archives/compiler headers, ASan/UBSan, no original algorithm rewriting. All original217 ownership sequences retained plus deterministic default/hinted query matrices over all12 scalar families, empty/mixed/copy/move owners, zero/end/beyond-end and uint64 maximum row early-outs. Native actual pointer/handler/event/payload/capacity/endpoints remain unchanged by valid reads; full mutable/const query result/error/hint evidence. Invalid native hints/end dereference/uninitialized lifetimes receive no invented successful output. Actual native binary byte replay, all portable raw record decodes, driver/source/archive hashes and positive raw coverage counters. npm run test:coverage:calc: all Calc tests actual100 four metrics. npm run test:coverage:shared -- src/external/mdds/include/mdds/multi_type_vector/soa/container.test.ts src/external/mdds/include/mdds/multi_type_vector/soa/main.test.ts src/external/mdds/include/mdds/multi_type_vector/soa/iterator.test.ts src/external/mdds/include/mdds/multi_type_vector/soa/block_util.test.ts src/external/mdds/include/mdds/multi_type_vector/util.test.ts src/external/mdds/include/mdds/multi_type_vector/types.test.ts src/external/mdds/include/mdds/multi_type_vector/block_funcs.test.ts plus vector_storage.test.ts if added, with explicit coverage.include changed runtime files only and reportsDirectory coverage/container: actual100 four metrics/positive denominators. Ordinary Calc/affected shared and registry-storage/registry-validation/runtime-inventory tests with both upstream symlinks absent, exact finally restoration. npm run typecheck; npm run lint; npm run format:check; npm run check:docs; npm run check:file-size; npm run check:dependencies; npm run check:source-tree; npm run check:source-provenance; npm run test:source-provenance; npm run inventory:parity:calc; npm run inventory:parity:shared; node .agentplane/policy/check-routing.mjs; ap doctor; git diff --check. No full office/inventory/browser suite due at cycle2 task1/10; approved cadence keeps once per10. Never restart a confirmed live native/test process on observation timeout.

## Verification

Pending implementation and scoped native/portable/static acceptance. No full suite due; FMVJ21 full acceptance recorded in prior task.

## Rollback Plan

Revert only intentional G1RSF6 commits on calc if requested; preserve prior original ownership/helpers, exact upstream links, native source inputs and unrelated tasks.

## Findings

Read source confirms position(size) returns a valid endpoint pair before lookup; scalar get/get_type/is_empty reject that row. Hinted lookup consumes original cached private parent/index, including source swap behavior; no heuristic repair is introduced. Existing shared util already supplies original size_t diagnostic, scalar callbacks adapt output reference as typed return, and existing iterators cache node values with original forward category updates. Main.ts currently485 lines; helper placement must preserve source responsibility and budgets.
