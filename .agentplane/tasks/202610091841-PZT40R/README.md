---
id: "202610091841-PZT40R"
title: "Port original Calc compressed width and flag arrays"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 19
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-09T18:42:51.730Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-10-09T19:02:26.068Z"
  updated_by: "CODER"
  note: "All104 Calc tests actual100 Istanbul four metrics; original5272 sequences/640 full snapshots, two assertions and separate A/O non-progress diagnostics pass; portable104+30, tooling14/provenance3, TS7/scoped lint/format/docs/boundaries/size/tree/provenance and zero Calc/shared registry violations pass. CALC-018/019 preserve upstream. No Writer changes, broad parity claim or full-suite rerun; task2/10."
  attempts: 0
commit: null
comments:
  -
    author: "CODER"
    body: "Start: implement original complete compressed width and flag owners with explicit native template descriptors, unchanged native and portable actual100 evidence on calc; task2/10."
events:
  -
    type: "status"
    at: "2026-10-09T18:42:52.978Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implement original complete compressed width and flag owners with explicit native template descriptors, unchanged native and portable actual100 evidence on calc; task2/10."
  -
    type: "verify"
    at: "2026-10-09T19:02:26.068Z"
    author: "CODER"
    state: "ok"
    note: "All104 Calc tests actual100 Istanbul four metrics; original5272 sequences/640 full snapshots, two assertions and separate A/O non-progress diagnostics pass; portable104+30, tooling14/provenance3, TS7/scoped lint/format/docs/boundaries/size/tree/provenance and zero Calc/shared registry violations pass. CALC-018/019 preserve upstream. No Writer changes, broad parity claim or full-suite rerun; task2/10."
doc_version: 3
doc_updated_at: "2026-10-09T19:02:26.133Z"
doc_updated_by: "CODER"
description: "Task2 of next10 cadence: complete ScCompressedArray and ScBitMaskCompressedArray core for actual row/column flags and column widths, original CRFlags and explicit erased-template scalar descriptors, pinned unchanged native comparison and portable actual100 acceptance. Preserve original conditions and journal suspicious cases."
sections:
  Summary: "Complete original compressed row/column width and flag array owners, task2 of the next10-task cycle."
  Scope: "Only vite-office-calc branch calc. User goal/resume authorizes safe local implementation. Add sc/inc/compressedarray.ts and sc/source/core/data/compressedarray.ts with complete original ScCompressedArray, ScBitMaskCompressedArray and Iterator contracts; add original CRFlags in existing global header. Explicit required scalar descriptors adapt erased native template syntax for SCROW/SCCOL and sal_uInt16/CRFlags, with no invented constructor defaults or alternative interval/storage engine. Reuse coordinate names/global owner and existing toolchain/inventory. Add compressedarray tests/native fixture/research probe, runtime/provenance records for the two new owners, update existing global runtime/provenance, new capability, calc-core and suspicious journal as needed. Compare complete unchanged original declarations/definitions and genuine original typed-flag operators under ASan/UBSan with pinned hashes. Preserve capacity/count, search, split/merge, copying, unsigned-size/narrowing, insertion/removal/preserving-size and iterator preconditions. Generic object values/allocation/reference lifetime and undefined input arithmetic remain unverified; do not fabricate native clones or private malformed state. No Writer changes, policy changes, network, merges or full-suite rerun; full run due task10."
  Plan: "Complete source-shaped compressed width/flag owners and CRFlags; preserve upstream count/capacity/narrowing/copy/iterator contracts with unchanged native evidence, actual100 Calc and scoped checks. Task2/10."
  Verify Steps: "Read exact pinned compressedarray.hxx/cxx, CRFlags/typed_flags_set and table width/flag consumers. Compile complete unchanged native classes/methods and genuine original flag operators under ASan/UBSan; compare row and column numeric/flag specializations, explicit required defaults/native widths, Search out-of-domain fallback, both SetValue overloads/splits/combinations/removals/capacity branches through legitimate calls, Reset alias-safe numeric values, both getters/range/next repeated terminal behavior, original insertion inherited previous-boundary value/truncation, Remove exact-entry/adjacent merge, preserving-size behavior, distinct-owner CopyFrom offset/overload and CopyFromAnded, all single/range And/Or and last-any-bit sentinel, iterator increment/add/borrowed mutations under defined preconditions. Keep self-copy assertion and typed-flag diagnostics separately; document original suspect behavior and native invalid/lifetime/arithmetic limits without repairs. Run all Calc tests actual100 Istanbul four metrics, related inventory30/provenance3/tooling14, TS7/scoped lint/format/docs/boundaries/size/tree/provenance, Calc/shared registry zero violations, routing/doctor; temporarily detach both upstream symlinks and run Calc plus related inventory portable acceptance with links restored. No full office/browser/inventory-suite run this task2/10."
  Verification: |-
    Command: node scripts/calc-compressedarray-native-probe.mjs --write; node scripts/calc-compressedarray-native-probe.mjs --check; node scripts/calc-compressedarray-native-probe.mjs --assertions; node scripts/calc-compressedarray-native-probe.mjs --nontermination.
    Result: pass for defined comparison and isolated diagnostics; no successful result assigned to nontermination.
    Evidence: 5272 complete numeric/CRFlags row/column sequences compare both genuine owners after every command; 640 losslessly interned full snapshots include original entries, count/capacity, range/value/search/next/mask outputs. Complete original class/header/definition groups and genuine unchanged o3tl flags/underlying/config headers compile under ASan/UBSan with pinned hashes. Borrowed iterator Reset replacement is compared natively. Legal read-only base-member pointers observe the real final bit owner, without subclassing/replacing it or injecting state. Logs: output/playwright/task12-native-borrow-write.log, task12-native-borrow-check.log, task12-native-assertions.log, task12-native-nontermination.log; original self/mask stderr and A/O ETIMEDOUT/SIGTERM diagnostics in calc-native/compressedarray-*. The owned original invalid-start non-progress diagnostic is isolated with 1000ms process timeout; source trace proves unchanged restart at same entry.
    Scope: all public numeric/flag operations and both iterator methods, required defaults/widths/unsigned sizes, binary fallback, original entry/capacity algorithm, insertion predecessor/truncation, removal adjacency/terminal end, preserving-size call order, distinct copy offsets/inline overload, scalar/range masks/reverse sentinel, mutable-output tuples and borrowed storage. Two redundant guards specialize original ordered Search/active-insertion-count invariants with explicit proofs; native bodies remain unchanged. CALC-018/019 preserve original non-progress and unused ordinary removal-fill behavior. Generic object equality/copy, native allocation/ABI/references/dangling lifetime, undefined arithmetic, malformed index/entry families, mismatched template witnesses, full global/table/document/browser and complete module parity remain unverified.

    Command: npm run test:coverage:calc.
    Result: pass.
    Evidence: all104 tests/23 files; actual100 Istanbul 2904/2904 statements,2051/2051 branches,467/467 functions,2548/2548 lines. No coverage exclusions or malformed private-state injection. Initial104 tests passed with branch2055/2057 (99.9%); only source-proven implied guards were specialized, no acceptance or original native body changed. Log: output/playwright/task12-calc-coverage-borrow.log; apps/office/coverage/calc/coverage-summary.json.
    Scope: all Calc runtime source owners including new numeric/flag compressed arrays and existing global modes/segments/selections/reference owners.

    Command: npm run test:calc; node_modules/.bin/vitest run --config scripts/libreoffice-inventory/vitest.config.ts scripts/libreoffice-inventory/registry-validation.test.ts scripts/libreoffice-inventory/runtime-inventory.test.ts scripts/libreoffice-inventory/registry-storage.test.ts scripts/libreoffice-inventory/parity-mappings.test.ts scripts/libreoffice-inventory/parity-mapping-cli.test.ts, with both upstream references temporarily detached and restored by EXIT trap.
    Result: pass.
    Evidence:104 Calc and30 related inventory tests, no upstream/compiler/network. Both original links restored and detached names absent. Logs: output/playwright/task12-portable-calc.log,task12-portable-inventory.log.
    Scope: portable committed-fixture replay, explicit independent scalar/flag/copy/insertion/removal/iterator assertions and registry/runtime/provenance/capability contracts. Shared implementation is not modified; existing shared owners are reused.

    Command: npm run test:tooling; npm run test:source-provenance; npm run typecheck; node_modules/.bin/eslint apps/office/src/sc/inc/compressedarray.ts apps/office/src/sc/inc/global.ts apps/office/src/sc/source/core/data/compressedarray.ts apps/office/src/sc/source/core/data/compressedarray.test.ts scripts/calc-compressedarray-native-probe.mjs --max-warnings 0; node_modules/.bin/prettier --check apps/office/src/sc/inc/compressedarray.ts apps/office/src/sc/inc/global.ts apps/office/src/sc/source/core/data/compressedarray.ts apps/office/src/sc/source/core/data/compressedarray.test.ts scripts/calc-compressedarray-native-probe.mjs; npm run check:docs; npm run check:dependencies; npm run check:file-size; npm run check:source-tree; npm run check:source-provenance; npm run inventory:parity:calc; npm run inventory:parity:shared; node .agentplane/policy/check-routing.mjs; ap doctor; git diff --check.
    Result: pass.
    Evidence: tooling14 and provenance3 pass; TS7 tools/app, focused lint/format, documentation1144 authored sources, size1147 files, boundaries351 sources/1629 imports/30 allowed edges, source tree114 required paths, provenance352 owners (261 mapped/74 browser/17 local) pass. Calc22 capabilities/143 modules and shared1/116 have zero semantic violations; all broader semantic/default/contract statuses remain unverified. Doctor0 errors/two inherited warnings (old hook shim, old task202610090715-PJV0JK missing hash). Coherent new core module475 physical lines (below500 review and1000 hard budgets); explicit original base/derived/nested boundaries retained. Logs: output/playwright/task12-{tooling,provenance-tests,types-borrow,lint-borrow,format,docs-final,boundaries,size,tree,provenance-final,registry-calc-final,registry-shared,doctor}.log.
    Scope: scoped implementation/metadata source boundaries and deterministic traceability. User-authorized safe local work only in calc; no network, Writer changes/coverage repair, merges, new UI or policy edits. Full application/browser/inventory suite completed at task10 previous cycle; this is task2/10, full rerun not due under user cadence. Native assertion/nontermination, initial authoring/lint/type/metadata/branch failures and bounded corrections are recorded in Findings.

    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-10-09T19:02:26.068Z — VERIFY — ok

    By: CODER

    Note: All104 Calc tests actual100 Istanbul four metrics; original5272 sequences/640 full snapshots, two assertions and separate A/O non-progress diagnostics pass; portable104+30, tooling14/provenance3, TS7/scoped lint/format/docs/boundaries/size/tree/provenance and zero Calc/shared registry violations pass. CALC-018/019 preserve upstream. No Writer changes, broad parity claim or full-suite rerun; task2/10.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-09T19:01:54.709Z, excerpt_hash=sha256:535b177dce9a8e758d74400eac515e8f21d45e76c0753db11a0e13528ecf54db

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202610091841-PZT40R/blueprint/resolved-snapshot.json
    - old_digest: 55865968f0fa74bd57103fc230dbd65b96b9302a7d47970c9785424244418da1
    - current_digest: 55865968f0fa74bd57103fc230dbd65b96b9302a7d47970c9785424244418da1
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202610091841-PZT40R

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202610091841-PZT40R
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: false
    - repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert only this task implementation commit through a separately approved task on calc; preserve completed selection/numeric/shared core. Ignored native outputs are research evidence; upstream copies remain read-only."
  Findings: |-
    Original source inspection confirms ScTable column widths/flags construct maxima MaxCol()+1, row flags MaxRow(). CopyFrom disallows self by assertion. Iterator requires valid region with no end API. Preserving-size methods retain exact original call order even though Remove resets terminal end to nMaxAccess; investigate against unchanged native bodies without normalizing.

    - Observation: First native probe compilation rejects the observer subclass for CRFlags specializations because original ScBitMaskCompressedArray is final; original mechanism source remains unchanged. Read-only tsconfig.app.json lookup was absent; actual app config will be located by rg.
      Impact: No native fixture or parity evidence exists yet. Do not remove final or replace native bit owners to make the probe compile.
      Resolution: Recompute route; use genuine Native owners and a separate derived base observer solely to obtain legal protected member pointers for read-only count/capacity/entry observations. Keep every original class/method/operator unchanged.

    - Observation: Initial TS7/lint authoring reports unused original output-reference input end, useless initial local start assignment, literal-enum rule for CRFlags.All, and overload signature unification rule.
      Impact: Core verification is not yet complete; original numeric/flag algorithms remain unchanged in native probe. No acceptance thresholds need adjustment.
      Resolution: Recompute route, adapt output-reference parameter spelling, local declaration lifetime, literal value15 (original four-bit mask), and overload signature syntax while preserving native behavior; rerun TS7/lint.

    - Observation: Confirmed live original probe stalls at native case4304, CRFlags row max7 with seeded tail3 and AndValue(8,8,NONE). Partial output ends immediately before this command; owned PID64787 was terminated after observing it live.
      Impact: Original Search(8) returns last entry ending7; range update chooses SetValue(8,7,0), which is rejected, then repeats Search(8) at the same entry forever. This is not a TS/native mismatch or completed native comparison. Do not add a guard or normalize original behavior.
      Resolution: Recompute route; reproduce in a separate bounded original nontermination diagnostic, record source/caller-precondition limits in CALC journal, and restrict defined range-bit replay to valid initial positions or vacuous ranges. Preserve complete original bodies/TS loop and all successful command observations; rerun native fixture generation.

    - Observation: Defined native5264 sequences and four focused tests pass. Second TS7/lint pass reports unused overwritten output-reference inputs and literal invalid-enum diagnostic arguments16/255 requiring explicit enum casts.
      Impact: No native behavior mismatch. Output-reference inputs are overwritten in original getters; JS tuple syntax still carries them only to preserve call contracts.
      Resolution: Recompute route; explicitly consume overwritten input arguments with void and cast diagnostic literals as original static_cast<CRFlags>, preserving all assertions and expected values. Rerun TS7/lint and inspect full Calc coverage.

    - Observation: Full Calc104 tests pass and all statements/functions/lines are100%, but initial branch coverage is2055/2057 (99.9%): the remaining branches are original SetValue previous-boundary and insertion-index guards.
      Impact: Required actual100 branch acceptance is unmet. Do not inject malformed private entries, exclude coverage or alter native groups to reach the branches.
      Resolution: Recompute route; prove the guards from original Search and insertion/removal invariants for defined owners. Specialize only logically implied checks with explicit source proofs, leaving native bodies unchanged; rerun all Calc actual100 plus typed/lint checks.

    - Observation: Static JSDoc gate requires @returns on protected pData setter; runtime inventory cannot resolve getter/setter pData as a declared local symbol, reporting missing-local-symbol:pData. Source provenance passes. Additional native borrowed Reset cases pass, raising corpus to5272/640.
      Impact: Documentation/metadata gates remain incomplete. Actual production accessor exists, native comparison and source responsibility are unchanged; do not alter inventory validation or create violations to mask authoring errors.
      Resolution: Recompute route; add setter return documentation, omit the accessor from runtime declared-symbol list as existing mpImpl accessors are handled, retain original pData storage responsibility in prose/provenance, update finite corpus counts and rerun scoped gates plus final coverage.

    - Observation: Read-only registry log summarizer assumed a manifest wrapper and raised KeyError after unnecessarily broad output; actual CLI report exposes capabilityCount/moduleCount directly. Production checks remain passing.
      Impact: No repo or report changes; do not infer registry counts from nonexistent wrapper or rerun production checks for this read error.
      Resolution: Recompute route and read only actual top-level counts/runtime violation summary, keeping output bounded.
id_source: "generated"
---
## Summary

Complete original compressed row/column width and flag array owners, task2 of the next10-task cycle.

## Scope

Only vite-office-calc branch calc. User goal/resume authorizes safe local implementation. Add sc/inc/compressedarray.ts and sc/source/core/data/compressedarray.ts with complete original ScCompressedArray, ScBitMaskCompressedArray and Iterator contracts; add original CRFlags in existing global header. Explicit required scalar descriptors adapt erased native template syntax for SCROW/SCCOL and sal_uInt16/CRFlags, with no invented constructor defaults or alternative interval/storage engine. Reuse coordinate names/global owner and existing toolchain/inventory. Add compressedarray tests/native fixture/research probe, runtime/provenance records for the two new owners, update existing global runtime/provenance, new capability, calc-core and suspicious journal as needed. Compare complete unchanged original declarations/definitions and genuine original typed-flag operators under ASan/UBSan with pinned hashes. Preserve capacity/count, search, split/merge, copying, unsigned-size/narrowing, insertion/removal/preserving-size and iterator preconditions. Generic object values/allocation/reference lifetime and undefined input arithmetic remain unverified; do not fabricate native clones or private malformed state. No Writer changes, policy changes, network, merges or full-suite rerun; full run due task10.

## Plan

Complete source-shaped compressed width/flag owners and CRFlags; preserve upstream count/capacity/narrowing/copy/iterator contracts with unchanged native evidence, actual100 Calc and scoped checks. Task2/10.

## Verify Steps

Read exact pinned compressedarray.hxx/cxx, CRFlags/typed_flags_set and table width/flag consumers. Compile complete unchanged native classes/methods and genuine original flag operators under ASan/UBSan; compare row and column numeric/flag specializations, explicit required defaults/native widths, Search out-of-domain fallback, both SetValue overloads/splits/combinations/removals/capacity branches through legitimate calls, Reset alias-safe numeric values, both getters/range/next repeated terminal behavior, original insertion inherited previous-boundary value/truncation, Remove exact-entry/adjacent merge, preserving-size behavior, distinct-owner CopyFrom offset/overload and CopyFromAnded, all single/range And/Or and last-any-bit sentinel, iterator increment/add/borrowed mutations under defined preconditions. Keep self-copy assertion and typed-flag diagnostics separately; document original suspect behavior and native invalid/lifetime/arithmetic limits without repairs. Run all Calc tests actual100 Istanbul four metrics, related inventory30/provenance3/tooling14, TS7/scoped lint/format/docs/boundaries/size/tree/provenance, Calc/shared registry zero violations, routing/doctor; temporarily detach both upstream symlinks and run Calc plus related inventory portable acceptance with links restored. No full office/browser/inventory-suite run this task2/10.

## Verification

Command: node scripts/calc-compressedarray-native-probe.mjs --write; node scripts/calc-compressedarray-native-probe.mjs --check; node scripts/calc-compressedarray-native-probe.mjs --assertions; node scripts/calc-compressedarray-native-probe.mjs --nontermination.
Result: pass for defined comparison and isolated diagnostics; no successful result assigned to nontermination.
Evidence: 5272 complete numeric/CRFlags row/column sequences compare both genuine owners after every command; 640 losslessly interned full snapshots include original entries, count/capacity, range/value/search/next/mask outputs. Complete original class/header/definition groups and genuine unchanged o3tl flags/underlying/config headers compile under ASan/UBSan with pinned hashes. Borrowed iterator Reset replacement is compared natively. Legal read-only base-member pointers observe the real final bit owner, without subclassing/replacing it or injecting state. Logs: output/playwright/task12-native-borrow-write.log, task12-native-borrow-check.log, task12-native-assertions.log, task12-native-nontermination.log; original self/mask stderr and A/O ETIMEDOUT/SIGTERM diagnostics in calc-native/compressedarray-*. The owned original invalid-start non-progress diagnostic is isolated with 1000ms process timeout; source trace proves unchanged restart at same entry.
Scope: all public numeric/flag operations and both iterator methods, required defaults/widths/unsigned sizes, binary fallback, original entry/capacity algorithm, insertion predecessor/truncation, removal adjacency/terminal end, preserving-size call order, distinct copy offsets/inline overload, scalar/range masks/reverse sentinel, mutable-output tuples and borrowed storage. Two redundant guards specialize original ordered Search/active-insertion-count invariants with explicit proofs; native bodies remain unchanged. CALC-018/019 preserve original non-progress and unused ordinary removal-fill behavior. Generic object equality/copy, native allocation/ABI/references/dangling lifetime, undefined arithmetic, malformed index/entry families, mismatched template witnesses, full global/table/document/browser and complete module parity remain unverified.

Command: npm run test:coverage:calc.
Result: pass.
Evidence: all104 tests/23 files; actual100 Istanbul 2904/2904 statements,2051/2051 branches,467/467 functions,2548/2548 lines. No coverage exclusions or malformed private-state injection. Initial104 tests passed with branch2055/2057 (99.9%); only source-proven implied guards were specialized, no acceptance or original native body changed. Log: output/playwright/task12-calc-coverage-borrow.log; apps/office/coverage/calc/coverage-summary.json.
Scope: all Calc runtime source owners including new numeric/flag compressed arrays and existing global modes/segments/selections/reference owners.

Command: npm run test:calc; node_modules/.bin/vitest run --config scripts/libreoffice-inventory/vitest.config.ts scripts/libreoffice-inventory/registry-validation.test.ts scripts/libreoffice-inventory/runtime-inventory.test.ts scripts/libreoffice-inventory/registry-storage.test.ts scripts/libreoffice-inventory/parity-mappings.test.ts scripts/libreoffice-inventory/parity-mapping-cli.test.ts, with both upstream references temporarily detached and restored by EXIT trap.
Result: pass.
Evidence:104 Calc and30 related inventory tests, no upstream/compiler/network. Both original links restored and detached names absent. Logs: output/playwright/task12-portable-calc.log,task12-portable-inventory.log.
Scope: portable committed-fixture replay, explicit independent scalar/flag/copy/insertion/removal/iterator assertions and registry/runtime/provenance/capability contracts. Shared implementation is not modified; existing shared owners are reused.

Command: npm run test:tooling; npm run test:source-provenance; npm run typecheck; node_modules/.bin/eslint apps/office/src/sc/inc/compressedarray.ts apps/office/src/sc/inc/global.ts apps/office/src/sc/source/core/data/compressedarray.ts apps/office/src/sc/source/core/data/compressedarray.test.ts scripts/calc-compressedarray-native-probe.mjs --max-warnings 0; node_modules/.bin/prettier --check apps/office/src/sc/inc/compressedarray.ts apps/office/src/sc/inc/global.ts apps/office/src/sc/source/core/data/compressedarray.ts apps/office/src/sc/source/core/data/compressedarray.test.ts scripts/calc-compressedarray-native-probe.mjs; npm run check:docs; npm run check:dependencies; npm run check:file-size; npm run check:source-tree; npm run check:source-provenance; npm run inventory:parity:calc; npm run inventory:parity:shared; node .agentplane/policy/check-routing.mjs; ap doctor; git diff --check.
Result: pass.
Evidence: tooling14 and provenance3 pass; TS7 tools/app, focused lint/format, documentation1144 authored sources, size1147 files, boundaries351 sources/1629 imports/30 allowed edges, source tree114 required paths, provenance352 owners (261 mapped/74 browser/17 local) pass. Calc22 capabilities/143 modules and shared1/116 have zero semantic violations; all broader semantic/default/contract statuses remain unverified. Doctor0 errors/two inherited warnings (old hook shim, old task202610090715-PJV0JK missing hash). Coherent new core module475 physical lines (below500 review and1000 hard budgets); explicit original base/derived/nested boundaries retained. Logs: output/playwright/task12-{tooling,provenance-tests,types-borrow,lint-borrow,format,docs-final,boundaries,size,tree,provenance-final,registry-calc-final,registry-shared,doctor}.log.
Scope: scoped implementation/metadata source boundaries and deterministic traceability. User-authorized safe local work only in calc; no network, Writer changes/coverage repair, merges, new UI or policy edits. Full application/browser/inventory suite completed at task10 previous cycle; this is task2/10, full rerun not due under user cadence. Native assertion/nontermination, initial authoring/lint/type/metadata/branch failures and bounded corrections are recorded in Findings.

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-10-09T19:02:26.068Z — VERIFY — ok

By: CODER

Note: All104 Calc tests actual100 Istanbul four metrics; original5272 sequences/640 full snapshots, two assertions and separate A/O non-progress diagnostics pass; portable104+30, tooling14/provenance3, TS7/scoped lint/format/docs/boundaries/size/tree/provenance and zero Calc/shared registry violations pass. CALC-018/019 preserve upstream. No Writer changes, broad parity claim or full-suite rerun; task2/10.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-09T19:01:54.709Z, excerpt_hash=sha256:535b177dce9a8e758d74400eac515e8f21d45e76c0753db11a0e13528ecf54db

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202610091841-PZT40R/blueprint/resolved-snapshot.json
- old_digest: 55865968f0fa74bd57103fc230dbd65b96b9302a7d47970c9785424244418da1
- current_digest: 55865968f0fa74bd57103fc230dbd65b96b9302a7d47970c9785424244418da1
- route_changed: no
- safe_command: agentplane blueprint snapshot 202610091841-PZT40R

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202610091841-PZT40R
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: false
- repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert only this task implementation commit through a separately approved task on calc; preserve completed selection/numeric/shared core. Ignored native outputs are research evidence; upstream copies remain read-only.

## Findings

Original source inspection confirms ScTable column widths/flags construct maxima MaxCol()+1, row flags MaxRow(). CopyFrom disallows self by assertion. Iterator requires valid region with no end API. Preserving-size methods retain exact original call order even though Remove resets terminal end to nMaxAccess; investigate against unchanged native bodies without normalizing.

- Observation: First native probe compilation rejects the observer subclass for CRFlags specializations because original ScBitMaskCompressedArray is final; original mechanism source remains unchanged. Read-only tsconfig.app.json lookup was absent; actual app config will be located by rg.
  Impact: No native fixture or parity evidence exists yet. Do not remove final or replace native bit owners to make the probe compile.
  Resolution: Recompute route; use genuine Native owners and a separate derived base observer solely to obtain legal protected member pointers for read-only count/capacity/entry observations. Keep every original class/method/operator unchanged.

- Observation: Initial TS7/lint authoring reports unused original output-reference input end, useless initial local start assignment, literal-enum rule for CRFlags.All, and overload signature unification rule.
  Impact: Core verification is not yet complete; original numeric/flag algorithms remain unchanged in native probe. No acceptance thresholds need adjustment.
  Resolution: Recompute route, adapt output-reference parameter spelling, local declaration lifetime, literal value15 (original four-bit mask), and overload signature syntax while preserving native behavior; rerun TS7/lint.

- Observation: Confirmed live original probe stalls at native case4304, CRFlags row max7 with seeded tail3 and AndValue(8,8,NONE). Partial output ends immediately before this command; owned PID64787 was terminated after observing it live.
  Impact: Original Search(8) returns last entry ending7; range update chooses SetValue(8,7,0), which is rejected, then repeats Search(8) at the same entry forever. This is not a TS/native mismatch or completed native comparison. Do not add a guard or normalize original behavior.
  Resolution: Recompute route; reproduce in a separate bounded original nontermination diagnostic, record source/caller-precondition limits in CALC journal, and restrict defined range-bit replay to valid initial positions or vacuous ranges. Preserve complete original bodies/TS loop and all successful command observations; rerun native fixture generation.

- Observation: Defined native5264 sequences and four focused tests pass. Second TS7/lint pass reports unused overwritten output-reference inputs and literal invalid-enum diagnostic arguments16/255 requiring explicit enum casts.
  Impact: No native behavior mismatch. Output-reference inputs are overwritten in original getters; JS tuple syntax still carries them only to preserve call contracts.
  Resolution: Recompute route; explicitly consume overwritten input arguments with void and cast diagnostic literals as original static_cast<CRFlags>, preserving all assertions and expected values. Rerun TS7/lint and inspect full Calc coverage.

- Observation: Full Calc104 tests pass and all statements/functions/lines are100%, but initial branch coverage is2055/2057 (99.9%): the remaining branches are original SetValue previous-boundary and insertion-index guards.
  Impact: Required actual100 branch acceptance is unmet. Do not inject malformed private entries, exclude coverage or alter native groups to reach the branches.
  Resolution: Recompute route; prove the guards from original Search and insertion/removal invariants for defined owners. Specialize only logically implied checks with explicit source proofs, leaving native bodies unchanged; rerun all Calc actual100 plus typed/lint checks.

- Observation: Static JSDoc gate requires @returns on protected pData setter; runtime inventory cannot resolve getter/setter pData as a declared local symbol, reporting missing-local-symbol:pData. Source provenance passes. Additional native borrowed Reset cases pass, raising corpus to5272/640.
  Impact: Documentation/metadata gates remain incomplete. Actual production accessor exists, native comparison and source responsibility are unchanged; do not alter inventory validation or create violations to mask authoring errors.
  Resolution: Recompute route; add setter return documentation, omit the accessor from runtime declared-symbol list as existing mpImpl accessors are handled, retain original pData storage responsibility in prose/provenance, update finite corpus counts and rerun scoped gates plus final coverage.

- Observation: Read-only registry log summarizer assumed a manifest wrapper and raised KeyError after unnecessarily broad output; actual CLI report exposes capabilityCount/moduleCount directly. Production checks remain passing.
  Impact: No repo or report changes; do not infer registry counts from nonexistent wrapper or rerun production checks for this read error.
  Resolution: Recompute route and read only actual top-level counts/runtime violation summary, keeping output bounded.
