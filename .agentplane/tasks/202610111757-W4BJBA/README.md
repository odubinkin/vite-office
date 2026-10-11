---
id: "202610111757-W4BJBA"
title: "Port original CPPu UNO equality engine"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 16
origin:
  system: "manual"
depends_on: []
tags:
  - "calc"
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-11T17:58:19.438Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-10-11T18:29:47.299Z"
  updated_by: "CODER"
  note: "Complete original equality/query owners implemented; latest358-source normal/ASan/UBSan --write/--check and5 source-absent portable streams match. Calc106/shared125 raw100 across19/52 owners with exact hash binding; extended equality3 owners raw100. All scoped gates and final changed-input checks pass; limitations and CALC-052 recorded."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-10-11T18:30:52.416Z"
  updated_by: "EVALUATOR"
  note: "Reviewed0194432eb290: approved original equality/query scope is complete with actual unchanged native and source-absent portable evidence; scoped checks and raw100 satisfy bounded acceptance. Ready for clean direct closure."
  evaluated_sha: "0194432eb2904920065a3d08a8833c5f515339b6"
  blueprint_digest: "58974774354db7121c5be496ba60106b2284e2a0a21b2744cdfc019abda88689"
  evidence_refs:
    - ".agentplane/tasks/202610111757-W4BJBA/README.md"
    - ".agentplane/tasks/202610111757-W4BJBA/quality/20261011-183052416-recovery-context/quality-report.json"
    - ".agentplane/tasks/202610111757-W4BJBA/quality/20261011-183052416-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202610111757-W4BJBA/quality/20261011-183052416-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202610111757-W4BJBA/blueprint/resolved-snapshot.json"
    - "apps/office/src/cppu/source/uno/native-equality-cases.json"
    - "output/playwright/task43-checks/native-check-extended.log"
    - "output/playwright/task43-checks/value-coverage-audit.json"
    - "output/playwright/task43-checks/extended-coverage-audit.json"
    - "output/playwright/task43-checks/value-gates-final-manifest.json"
    - "output/playwright/task43-checks/final-evidence-gates.json"
  findings:
    - "Original eq.hxx switches, independent Any flattening, borrowed/acquired description boundaries, base-first/reverse members and descending sequence/interface query/release ordering remain source-shaped. Real data.cxx retained query method dispatch and return/exception ownership use existing shared owners; declarations reference the single implementation."
    - "Native --check terminal0 independently verifies358 complete source hashes and entire current5 captures against normal/ASan/UBSan. Actual raw Istanbul maps independently inspected: every S/F/B counter positive across19 Calc and52 related shared owners. Current commit hashes match combined acceptance before/after strengthened test replay; all3 equality owners fresh raw100. No weakened checks or fabricated runtime owner."
    - "Native integer64 double-rounding counterexample justifies only the narrow BigInt binary32 adapter; exact native casts and signed reads of unsigned-hyper sources are preserved. CALC-052 and registry accurately bound source observations; broad parity/default/verified flags remain false."
commit: null
comments:
  -
    author: "CODER"
    body: "Start: implement complete original shared CPPu equality and real query boundaries in calc checkout, using existing owners and bounded complete native/portable source-absent verification."
events:
  -
    type: "status"
    at: "2026-10-11T17:58:20.203Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implement complete original shared CPPu equality and real query boundaries in calc checkout, using existing owners and bounded complete native/portable source-absent verification."
  -
    type: "verify"
    at: "2026-10-11T18:29:47.299Z"
    author: "CODER"
    state: "ok"
    note: "Complete original equality/query owners implemented; latest358-source normal/ASan/UBSan --write/--check and5 source-absent portable streams match. Calc106/shared125 raw100 across19/52 owners with exact hash binding; extended equality3 owners raw100. All scoped gates and final changed-input checks pass; limitations and CALC-052 recorded."
doc_version: 3
doc_updated_at: "2026-10-11T18:29:47.372Z"
doc_updated_by: "CODER"
description: "Task43: implement complete original eq.hxx comparison and its data.cxx entry/query boundaries as the real shared dependency of Sequence value equality and downstream Calc casing services, retaining native numeric/type/interface/compound/sequence ordering with complete genuine native captures and source-absent100 coverage."
sections:
  Summary: "Task43 implements the complete original shared CPPu eq.hxx equality engine and actual data.cxx boundaries, the next dependency of public Sequence equality and downstream casing/CharClass/shared-string/Calc owners."
  Scope: "Only vite-office-calc branch calc. New source-shaped cppu/source/uno/eq.ts and function-boundary eq-sequence.ts or eq-numeric.ts split if required by the600-line budget; original _equalObject/_equalStruct/_equalSequence/_equalData logic and switches, exact numeric casts and ordering, Any flattening, type identity, compound base/reverse members, descending sequence elements and actual interface query/acquire/release. Existing data.ts owns genuine binuno_queryInterface, equalStruct/equalSequence and public uno_type_equalData/uno_equalData wrappers; data declarations reuse owners. Existing prim.ts declaration reexports actual binuno_queryInterface only if required by source architecture; existing shared SAL/CPPu type/string/storage/FFI/default/copy/destruction functions are reused. Adjacent complete portable native replay test/fixture and scripts/uno-equality-native-probe.mjs reuse original native build and shared native-value caller/observer; narrowly extend those shared callers if necessary, no duplicate type/provider/allocator. Native full any/data/sequence TUs and genuine SAL/CPPu dependencies unchanged. Per-owner registry runtime/provenance/capability records, Calc core documentation and genuine suspected upstream journal entries. No stub equality, custom recursive JS structural comparison, broad behavior/default parity promotion, native pointer/byte ABI/OOM/undefined float-cast claim or entire downstream template/service/pool/document/UI implementation in this leaf. Source-absent Calc and directly related shared raw100, actual scoped gates; no full suite until task51, no Writer-only repair, network/publication/merge/new branch or subagents."
  Plan: "Implement complete original shared equality/data-query boundaries; preserve native switches/casts/Any/type/descending compound-sequence/interface ownership; actual unchanged native normal-ASan full capture and portable replay, source-absent Calc/related shared raw100, all scoped gates, accurate inventory, EVALUATOR review and clean close. Next full task51."
  Verify Steps: |-
    1. Inspect whole pinned eq.hxx/data.cxx/header and all reused types/storage/query/string owners; verify original source hashes. Preserve literal destination/source type switch behavior, unsigned-hyper signed reinterpretation where present, mathematical cmp_equal, original float/double casts, floor/nonnegative guards, Any flattening, source description borrowing and all acquisition/release/short-circuit order. Do not execute undefined floating-to-integer casts or invalid pointer/tail reads.
    2. Run node scripts/uno-equality-native-probe.mjs --write then --check; pure observation caller invokes complete original eq/data/any/sequence and genuine dependencies, all full source/dependency hashes bound to pin. Normal and ASan/UBSan complete outputs identical, native/portable entire byte streams agree for numeric pairs, scalar/Any/meta/type/default/compound/sequence/interface and actual binuno query boundaries. Original floating-to-u64 out-of-range inputs, native ABI/address/resources, consumer QA and unsupported inputs explicitly unverified.
    3. With all3 original links absent, run npm run test:coverage:calc and exact related shared profile (latest task42 manifest plus equality tests/new runtime owners); all raw S/F/B counters positive and S/B/F/L100. Restore exact targets in finally; no coverage/assertion/timeout/test-scope weakening.
    4. Run TS7, exact ESLint/Prettier/JSDoc, file-size, actual module boundary, exhaustive provenance/tree, shared/Calc inventory, directly related tooling, routing/doctor/diff. Use native JS conversions where original comparison proves equivalence, implement only evidence-required exact casts. Native sources unchanged; no unnecessary full or unchanged native replay.
    5. Record actual verification and residual public-template/service/CharClass/pool/cell/document/view/UI gaps. Intentional implementation commit, separate EVALUATOR quality phase and persisted quality artifact checkpoint, clean direct closure. Next full task51, full goal active until entire requested Calc outcome is achieved.
  Verification: |-
    Command: node scripts/uno-equality-native-probe.mjs --write; node scripts/uno-equality-native-probe.mjs --check.
    Result: pass (latest expanded caller, both terminal0).
    Evidence: 358 complete original source hashes and13 generated inputs; complete72 actual original translation units (3 CPPu plus69 genuine dependencies). Normal and ASan/UBSan captures identical: numeric2112864, scalar651680, sequence89468, interface5008, diagnostic28 bytes. Latest check log native-check-extended.log and committed native-equality-cases.json bind full input/caller hashes and captures.
    Scope: complete original eq.hxx/data-query wrappers with initialized typed/Any/meta/compound/sequence/interface values, all three original comparison APIs, ordered callbacks, actual retained method-description fields/identity, real dispatch return/exception ownership and explicit integer64 rounding ties. Diagnostic unsupported cases remain bounded; no native ABI/OOM/undefined-cast/consumer-QA claim.

    Command: node output/playwright/task43-checks/equality-portable.mjs; node output/playwright/task43-checks/equality-extended-portable.mjs.
    Result: pass. All3 original source links absent for both runs and exact targets restored in finally.
    Evidence: value-calc-manifest.json and value-shared-manifest.json record exact npm run test:coverage:calc and related Vitest argv (task42 baseline plus equality test/new owners). Calc106 tests/24 files/19 owners raw S2920/B2055/F474/L2564; shared125 tests/37 files/52 owners raw S3441/B1794/F440/L3072. Every raw S/F/B counter positive, all S/B/F/L100. Extended test-only native observer/input improvements replay all5 current streams and have raw S219/B232/F8/L193, all100 for3 equality owners. extended-coverage-audit.json verifies all19/52 combined runtime owner hashes unchanged before and after replay; original combined raw audits remain applicable. No coverage threshold, assertion, timeout, source-presence requirement or profile relaxation.
    Scope: Calc and directly related shared original SAL/CPPu/type/string/storage/case owners. Full Writer regression deliberately not run; next full task51 (last task41).

    Command: node output/playwright/task43-checks/equality-gates.mjs; node output/playwright/task43-checks/final-evidence-gates.mjs.
    Result: pass, all declared scoped checks.
    Evidence: value-gates-final-manifest.json records TS7, exact lint, docs, file-size, dependencies, source provenance/tree, shared/Calc inventory, directly related tooling (4 files), routing, doctor and git diff --check, all terminal0. final-evidence-gates.json records fresh TS7/exact lint/Prettier/docs/size/provenance/shared+Calc inventory/diff after test observer/input and evidence metadata changes, all terminal0. Existing successful checks on unchanged inputs are retained rather than repeated.
    Scope: actual approved task paths; no policy/coverage/boundary waivers. Registry source ownership and declaration references remain distinct, broad parity/default/verified flags remain false. Actual inherited SAL/CPPu/OUString owners reused; native JS conversions retained except independently demonstrated integer64-to-binary32 double-rounding gap.

    Output: original shared CPPu equality engine and data.cxx binary query ownership, adjacent complete native/portable replay and source-shaped registry/provenance documentation; CALC-052 preserves native unsigned-hyper signed-read asymmetry.
    Residual gaps: filtered SAL logging, physical binary/pointer ABI, allocator/resource OOM, NaN payload families, undefined floating-to-u64 casts, native threads/shutdown and full original consumer QA unverified. Public Sequence/UnoType, original locale services/CharClass/pool/Calc cell/document/edit/view/UI remain subsequent work. Goal stays ACTIVE; no claim of complete Calc UI readiness.

    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-10-11T18:29:47.299Z — VERIFY — ok

    By: CODER

    Note: Complete original equality/query owners implemented; latest358-source normal/ASan/UBSan --write/--check and5 source-absent portable streams match. Calc106/shared125 raw100 across19/52 owners with exact hash binding; extended equality3 owners raw100. All scoped gates and final changed-input checks pass; limitations and CALC-052 recorded.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-11T18:29:46.156Z, excerpt_hash=sha256:5f9f8b029b305f7d73808ca7b27a86d29c13da9b8fbfab980bcf1090e51fc03b

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202610111757-W4BJBA/blueprint/resolved-snapshot.json
    - old_digest: 58974774354db7121c5be496ba60106b2284e2a0a21b2744cdfc019abda88689
    - current_digest: 58974774354db7121c5be496ba60106b2284e2a0a21b2744cdfc019abda88689
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202610111757-W4BJBA

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202610111757-W4BJBA
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: false
    - repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert only intentional task43 commits if required. Preserve task42 and unrelated active tasks. Restore exact original3links on every source-absent runner exit; never mutate original native sources."
  Findings: |-
    Previous goal turn made concrete verified progress: task42 DONE with original C sequence engine, complete358-source native captures, Calc106/24 and shared120/36 raw100, all13 gates and clean50595181829e close. Public Sequence.hxx equality calls uno_type_equalData, currently absent. Its original fallback uses actual data.cxx::binuno_queryInterface, also absent. No provisional class/structural equality/provider will substitute for these source owners. This executable single-owner equality leaf is a direct prerequisite; later UI remains incomplete.

    - Observation: Initial normal observation caller compilation failed: dispatcher second parameter must be const TypeDescription as declared in original uno/dispatcher.h.
      Impact: No native captures accepted; runtime sources passed TS7. Caller ABI declaration requires correction before observations.
      Resolution: Use actual const signature without modifying original code. Complete planned true/false sequence fixtures before recapturing; retain whole native owners and guards.

    - Observation: Normal and ASan/UBSan numeric/scalar/sequence/interface streams agree, but diagnostic caller writes into allocSeq(1,1) whose9-byte allocation is smaller than sizeof(sal_Sequence); UBSan rejects caller member access.
      Impact: No final fixture accepted and no unsupported allocator/ABI behavior claim. This is invalid diagnostic setup, not an upstream equality defect.
      Resolution: Use two actual initialized full stack sequence headers for unsupported-element diagnostics, avoiding heap allocation and all invalid/indeterminate reads; retain original equality code and complete sanitizer gate.

    - Observation: Complete actual numeric normal/ASan stream shows int64 0x4000004000000001 converts directly to float4611686568183201792, while Math.fround(Number(value)) yields4611686018427387904 due to double rounding.
      Impact: Native JS two-step conversion does not preserve original int64-to-binary32 cast. Source algorithm/casts must not be normalized or approximated.
      Resolution: Use native Math.fround for number and exact-number integer inputs; add only the evidence-required integer64-to-binary32 ties-to-even cast adaptation with BigInt discarded-bit rounding. Reuse it for the identical original C caller operand initialization and complete comparison replay. No separate SAL numeric library.

    - Observation: All5 complete portable equality streams match. Three new equality owners have every raw counter positive; focused profile fails only for8 old data.ts wrappers/getter not called by equality. JSDoc also requires the caller cast parameter.
      Impact: Focused coverage is not final acceptance; combined related baseline contains original data wrapper/getter callers. Static docs gate stopped after TS7/lint passed.
      Resolution: Document actual cast argument, retain unchanged coverage thresholds and run source-absent combined latest task42 related profile with new equality owners after native check terminal. No passing tests replay solely for this documentation correction.

    - Observation: JSDoc checker still rejects typed dispatcher arrow because its documentation was attached to variable declaration rather than arrow initializer.
      Impact: Documentation-only gate remains unmet; native/portable runtime behavior unchanged.
      Resolution: Move existing callback documentation to the arrow initializer, preserving callback body and verification criteria.

    - Observation: Shared inventory rejects new localSymbols on declaration modules: TS reexports are references to source-owned functions, not local runtime declarations.
      Impact: Actual C export functions exist only at data.ts, preserving correct ownership; metadata overstated local implementation at inc/data.ts and prim.ts.
      Resolution: Keep the public/source declarations and upstream symbol evidence, remove reexport-only names from runtime localSymbols. Do not fabricate violation waivers or duplicate function wrappers.

    - Observation: Five full streams match and equality owners raw100, but the binary dispatcher observer only records method class and therefore does not fully establish retained method-description ownership; new integer64 rounding adapter also needs explicit odd-half ties.
      Impact: Existing passing evidence is narrower than the declared cached-description/typed-cast contract.
      Resolution: Strengthen actual native dispatcher observation with all initialized common method description fields and repeated pointer identity; add positive/negative odd-half and next even-half integer seeds. Preserve all existing modes, full original owners and strict comparisons; recapture/check and source-absent combined proof, no threshold or scope relaxation.

    - Observation: Extended current native --write/--check and all5 source-absent portable streams pass after stronger cached-description and integer64 tie observers. Combined Calc106/shared125 runtime code is unchanged.
      Impact: Original cached descriptor ownership and exact cast behavior now have complete declared bounded evidence; no extra repetition of125 passing cases is required for test-only observation improvements.
      Resolution: Preserve combined raw100 audits with before/after SHA256 bindings for all19/52 covered owners and fresh3-owner raw100 replay. Final metadata states actual358-source capture sizes and limitations; CALC-052 preserves observed signed-read asymmetry. This task has no material scope drift; no consumer-QA, physical ABI or full UI claim.
id_source: "generated"
---
## Summary

Task43 implements the complete original shared CPPu eq.hxx equality engine and actual data.cxx boundaries, the next dependency of public Sequence equality and downstream casing/CharClass/shared-string/Calc owners.

## Scope

Only vite-office-calc branch calc. New source-shaped cppu/source/uno/eq.ts and function-boundary eq-sequence.ts or eq-numeric.ts split if required by the600-line budget; original _equalObject/_equalStruct/_equalSequence/_equalData logic and switches, exact numeric casts and ordering, Any flattening, type identity, compound base/reverse members, descending sequence elements and actual interface query/acquire/release. Existing data.ts owns genuine binuno_queryInterface, equalStruct/equalSequence and public uno_type_equalData/uno_equalData wrappers; data declarations reuse owners. Existing prim.ts declaration reexports actual binuno_queryInterface only if required by source architecture; existing shared SAL/CPPu type/string/storage/FFI/default/copy/destruction functions are reused. Adjacent complete portable native replay test/fixture and scripts/uno-equality-native-probe.mjs reuse original native build and shared native-value caller/observer; narrowly extend those shared callers if necessary, no duplicate type/provider/allocator. Native full any/data/sequence TUs and genuine SAL/CPPu dependencies unchanged. Per-owner registry runtime/provenance/capability records, Calc core documentation and genuine suspected upstream journal entries. No stub equality, custom recursive JS structural comparison, broad behavior/default parity promotion, native pointer/byte ABI/OOM/undefined float-cast claim or entire downstream template/service/pool/document/UI implementation in this leaf. Source-absent Calc and directly related shared raw100, actual scoped gates; no full suite until task51, no Writer-only repair, network/publication/merge/new branch or subagents.

## Plan

Implement complete original shared equality/data-query boundaries; preserve native switches/casts/Any/type/descending compound-sequence/interface ownership; actual unchanged native normal-ASan full capture and portable replay, source-absent Calc/related shared raw100, all scoped gates, accurate inventory, EVALUATOR review and clean close. Next full task51.

## Verify Steps

1. Inspect whole pinned eq.hxx/data.cxx/header and all reused types/storage/query/string owners; verify original source hashes. Preserve literal destination/source type switch behavior, unsigned-hyper signed reinterpretation where present, mathematical cmp_equal, original float/double casts, floor/nonnegative guards, Any flattening, source description borrowing and all acquisition/release/short-circuit order. Do not execute undefined floating-to-integer casts or invalid pointer/tail reads.
2. Run node scripts/uno-equality-native-probe.mjs --write then --check; pure observation caller invokes complete original eq/data/any/sequence and genuine dependencies, all full source/dependency hashes bound to pin. Normal and ASan/UBSan complete outputs identical, native/portable entire byte streams agree for numeric pairs, scalar/Any/meta/type/default/compound/sequence/interface and actual binuno query boundaries. Original floating-to-u64 out-of-range inputs, native ABI/address/resources, consumer QA and unsupported inputs explicitly unverified.
3. With all3 original links absent, run npm run test:coverage:calc and exact related shared profile (latest task42 manifest plus equality tests/new runtime owners); all raw S/F/B counters positive and S/B/F/L100. Restore exact targets in finally; no coverage/assertion/timeout/test-scope weakening.
4. Run TS7, exact ESLint/Prettier/JSDoc, file-size, actual module boundary, exhaustive provenance/tree, shared/Calc inventory, directly related tooling, routing/doctor/diff. Use native JS conversions where original comparison proves equivalence, implement only evidence-required exact casts. Native sources unchanged; no unnecessary full or unchanged native replay.
5. Record actual verification and residual public-template/service/CharClass/pool/cell/document/view/UI gaps. Intentional implementation commit, separate EVALUATOR quality phase and persisted quality artifact checkpoint, clean direct closure. Next full task51, full goal active until entire requested Calc outcome is achieved.

## Verification

Command: node scripts/uno-equality-native-probe.mjs --write; node scripts/uno-equality-native-probe.mjs --check.
Result: pass (latest expanded caller, both terminal0).
Evidence: 358 complete original source hashes and13 generated inputs; complete72 actual original translation units (3 CPPu plus69 genuine dependencies). Normal and ASan/UBSan captures identical: numeric2112864, scalar651680, sequence89468, interface5008, diagnostic28 bytes. Latest check log native-check-extended.log and committed native-equality-cases.json bind full input/caller hashes and captures.
Scope: complete original eq.hxx/data-query wrappers with initialized typed/Any/meta/compound/sequence/interface values, all three original comparison APIs, ordered callbacks, actual retained method-description fields/identity, real dispatch return/exception ownership and explicit integer64 rounding ties. Diagnostic unsupported cases remain bounded; no native ABI/OOM/undefined-cast/consumer-QA claim.

Command: node output/playwright/task43-checks/equality-portable.mjs; node output/playwright/task43-checks/equality-extended-portable.mjs.
Result: pass. All3 original source links absent for both runs and exact targets restored in finally.
Evidence: value-calc-manifest.json and value-shared-manifest.json record exact npm run test:coverage:calc and related Vitest argv (task42 baseline plus equality test/new owners). Calc106 tests/24 files/19 owners raw S2920/B2055/F474/L2564; shared125 tests/37 files/52 owners raw S3441/B1794/F440/L3072. Every raw S/F/B counter positive, all S/B/F/L100. Extended test-only native observer/input improvements replay all5 current streams and have raw S219/B232/F8/L193, all100 for3 equality owners. extended-coverage-audit.json verifies all19/52 combined runtime owner hashes unchanged before and after replay; original combined raw audits remain applicable. No coverage threshold, assertion, timeout, source-presence requirement or profile relaxation.
Scope: Calc and directly related shared original SAL/CPPu/type/string/storage/case owners. Full Writer regression deliberately not run; next full task51 (last task41).

Command: node output/playwright/task43-checks/equality-gates.mjs; node output/playwright/task43-checks/final-evidence-gates.mjs.
Result: pass, all declared scoped checks.
Evidence: value-gates-final-manifest.json records TS7, exact lint, docs, file-size, dependencies, source provenance/tree, shared/Calc inventory, directly related tooling (4 files), routing, doctor and git diff --check, all terminal0. final-evidence-gates.json records fresh TS7/exact lint/Prettier/docs/size/provenance/shared+Calc inventory/diff after test observer/input and evidence metadata changes, all terminal0. Existing successful checks on unchanged inputs are retained rather than repeated.
Scope: actual approved task paths; no policy/coverage/boundary waivers. Registry source ownership and declaration references remain distinct, broad parity/default/verified flags remain false. Actual inherited SAL/CPPu/OUString owners reused; native JS conversions retained except independently demonstrated integer64-to-binary32 double-rounding gap.

Output: original shared CPPu equality engine and data.cxx binary query ownership, adjacent complete native/portable replay and source-shaped registry/provenance documentation; CALC-052 preserves native unsigned-hyper signed-read asymmetry.
Residual gaps: filtered SAL logging, physical binary/pointer ABI, allocator/resource OOM, NaN payload families, undefined floating-to-u64 casts, native threads/shutdown and full original consumer QA unverified. Public Sequence/UnoType, original locale services/CharClass/pool/Calc cell/document/edit/view/UI remain subsequent work. Goal stays ACTIVE; no claim of complete Calc UI readiness.

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-10-11T18:29:47.299Z — VERIFY — ok

By: CODER

Note: Complete original equality/query owners implemented; latest358-source normal/ASan/UBSan --write/--check and5 source-absent portable streams match. Calc106/shared125 raw100 across19/52 owners with exact hash binding; extended equality3 owners raw100. All scoped gates and final changed-input checks pass; limitations and CALC-052 recorded.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-11T18:29:46.156Z, excerpt_hash=sha256:5f9f8b029b305f7d73808ca7b27a86d29c13da9b8fbfab980bcf1090e51fc03b

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202610111757-W4BJBA/blueprint/resolved-snapshot.json
- old_digest: 58974774354db7121c5be496ba60106b2284e2a0a21b2744cdfc019abda88689
- current_digest: 58974774354db7121c5be496ba60106b2284e2a0a21b2744cdfc019abda88689
- route_changed: no
- safe_command: agentplane blueprint snapshot 202610111757-W4BJBA

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202610111757-W4BJBA
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: false
- repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert only intentional task43 commits if required. Preserve task42 and unrelated active tasks. Restore exact original3links on every source-absent runner exit; never mutate original native sources.

## Findings

Previous goal turn made concrete verified progress: task42 DONE with original C sequence engine, complete358-source native captures, Calc106/24 and shared120/36 raw100, all13 gates and clean50595181829e close. Public Sequence.hxx equality calls uno_type_equalData, currently absent. Its original fallback uses actual data.cxx::binuno_queryInterface, also absent. No provisional class/structural equality/provider will substitute for these source owners. This executable single-owner equality leaf is a direct prerequisite; later UI remains incomplete.

- Observation: Initial normal observation caller compilation failed: dispatcher second parameter must be const TypeDescription as declared in original uno/dispatcher.h.
  Impact: No native captures accepted; runtime sources passed TS7. Caller ABI declaration requires correction before observations.
  Resolution: Use actual const signature without modifying original code. Complete planned true/false sequence fixtures before recapturing; retain whole native owners and guards.

- Observation: Normal and ASan/UBSan numeric/scalar/sequence/interface streams agree, but diagnostic caller writes into allocSeq(1,1) whose9-byte allocation is smaller than sizeof(sal_Sequence); UBSan rejects caller member access.
  Impact: No final fixture accepted and no unsupported allocator/ABI behavior claim. This is invalid diagnostic setup, not an upstream equality defect.
  Resolution: Use two actual initialized full stack sequence headers for unsupported-element diagnostics, avoiding heap allocation and all invalid/indeterminate reads; retain original equality code and complete sanitizer gate.

- Observation: Complete actual numeric normal/ASan stream shows int64 0x4000004000000001 converts directly to float4611686568183201792, while Math.fround(Number(value)) yields4611686018427387904 due to double rounding.
  Impact: Native JS two-step conversion does not preserve original int64-to-binary32 cast. Source algorithm/casts must not be normalized or approximated.
  Resolution: Use native Math.fround for number and exact-number integer inputs; add only the evidence-required integer64-to-binary32 ties-to-even cast adaptation with BigInt discarded-bit rounding. Reuse it for the identical original C caller operand initialization and complete comparison replay. No separate SAL numeric library.

- Observation: All5 complete portable equality streams match. Three new equality owners have every raw counter positive; focused profile fails only for8 old data.ts wrappers/getter not called by equality. JSDoc also requires the caller cast parameter.
  Impact: Focused coverage is not final acceptance; combined related baseline contains original data wrapper/getter callers. Static docs gate stopped after TS7/lint passed.
  Resolution: Document actual cast argument, retain unchanged coverage thresholds and run source-absent combined latest task42 related profile with new equality owners after native check terminal. No passing tests replay solely for this documentation correction.

- Observation: JSDoc checker still rejects typed dispatcher arrow because its documentation was attached to variable declaration rather than arrow initializer.
  Impact: Documentation-only gate remains unmet; native/portable runtime behavior unchanged.
  Resolution: Move existing callback documentation to the arrow initializer, preserving callback body and verification criteria.

- Observation: Shared inventory rejects new localSymbols on declaration modules: TS reexports are references to source-owned functions, not local runtime declarations.
  Impact: Actual C export functions exist only at data.ts, preserving correct ownership; metadata overstated local implementation at inc/data.ts and prim.ts.
  Resolution: Keep the public/source declarations and upstream symbol evidence, remove reexport-only names from runtime localSymbols. Do not fabricate violation waivers or duplicate function wrappers.

- Observation: Five full streams match and equality owners raw100, but the binary dispatcher observer only records method class and therefore does not fully establish retained method-description ownership; new integer64 rounding adapter also needs explicit odd-half ties.
  Impact: Existing passing evidence is narrower than the declared cached-description/typed-cast contract.
  Resolution: Strengthen actual native dispatcher observation with all initialized common method description fields and repeated pointer identity; add positive/negative odd-half and next even-half integer seeds. Preserve all existing modes, full original owners and strict comparisons; recapture/check and source-absent combined proof, no threshold or scope relaxation.

- Observation: Extended current native --write/--check and all5 source-absent portable streams pass after stronger cached-description and integer64 tie observers. Combined Calc106/shared125 runtime code is unchanged.
  Impact: Original cached descriptor ownership and exact cast behavior now have complete declared bounded evidence; no extra repetition of125 passing cases is required for test-only observation improvements.
  Resolution: Preserve combined raw100 audits with before/after SHA256 bindings for all19/52 covered owners and fresh3-owner raw100 replay. Final metadata states actual358-source capture sizes and limitations; CALC-052 preserves observed signed-read asymmetry. This task has no material scope drift; no consumer-QA, physical ABI or full UI claim.
