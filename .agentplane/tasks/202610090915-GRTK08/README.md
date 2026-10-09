---
id: "202610090915-GRTK08"
title: "Port Calc reference transpose and growth geometry"
result_summary: "Implemented ScRefUpdate transpose and growth geometry retaining source containment, native numeric widths, sheet wrapping and aliased value ownership"
status: "DONE"
priority: "med"
owner: "CODER"
revision: 15
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-09T09:15:53.816Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-10-09T09:22:18.630Z"
  updated_by: "CODER"
  note: "Command: node scripts/calc-refupdat-native-probe.mjs --write; node scripts/calc-refupdat-native-probe.mjs --check Result: pass after adding original range-order dependency to native shell. Evidence:20203 initialized cases, exact pinned HEAD/five Git blobs and source/extracted hashes, unchanged original three-method interval and header/coordinate bodies; ASan/UBSan clean, saved output exact. Scope: all public defined transpose/growth results and raw values, signed widths, sheet wrapping, raw range containment, pre-mutation growth predicates, source/reference and destination/endpoint aliases. Native debug checks and undefined arithmetic remain uncertified. Command: npm run test:coverage:calc Result: pass. Evidence:48 tests/11 files; actual V8 statements959/959, branches802/802, functions213/213, lines853/853 all100. No exclusions/settings/test-body changes to previous owners. Scope: all current Calc owners including every saved geometry output and literal rules. Command: npm run typecheck; npm run check:dependencies; npm run check:docs; npm run check:file-size; npm run check:source-tree Result: pass. Evidence:tools/application typecheck clean;332 sources/1570 imports/29 edges;1086 documented authored sources;1089 files reviewed, old grouping candidates unchanged;114 required paths/33 retired roots. Scope: original core/inc and core/tool owners reuse existing ordinary coordinates and document getter view; shared/Writer sources unchanged. Command: node_modules/.bin/eslint apps/office/src/sc/source/core/inc/refupdat.ts apps/office/src/sc/source/core/tool/refupdat.ts apps/office/src/sc/source/core/tool/refupdat.test.ts scripts/calc-refupdat-native-probe.mjs Result: pass after narrow original-static-class lint annotation. Evidence:affected source/test/probe clean; original ScRefUpdate all-static owner retained, repository policy unchanged. Scope:four new authored code files. Command: node_modules/.bin/prettier --check apps/office/src/sc/source/core/inc/refupdat.ts apps/office/src/sc/source/core/tool/refupdat.ts apps/office/src/sc/source/core/tool/refupdat.test.ts scripts/calc-refupdat-native-probe.mjs Result: pass. Evidence:all matched files formatted; native fixture compact. Scope:four authored code files. Command: npm run inventory:parity:calc Result: pass. Evidence:9 capabilities/124 modules (12 Calc/112 shared), zero semantic violations; new capability and two runtime/provenance records map original header/source. Previous status flags unchanged, new semantic parity unverified. Scope: bounded geometry evidence; other Update overloads, MoveRelWrap and full document/compiler/change-tracking integration remain absent rather than stubbed. Command: node .agentplane/policy/check-routing.mjs; ap doctor; git diff --check; git status --short --untracked-files=all Result: pass. Evidence:routing OK, doctor zero errors/one pre-existing managed shim warning, diff clean, only active task/new implementation records and calc-core docs intentional. Final clean calc state checked after finish. Scope:milestone9; full suites are next milestone10, then pause goal on user request after any error remediation. No merges or out-of-checkout modifications."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-10-09T09:22:31.960Z"
  updated_by: "EVALUATOR"
  note: "Original transpose and growth geometry retains source containment, native widths, sheet wrapping and alias ownership."
  evaluated_sha: "7cfa2999f25a851dc42a5980e0d84f55edcc413f"
  blueprint_digest: "2d60a203ca87886f40e93189e00a14be567025d26703b9d903c470e2274b5c93"
  evidence_refs:
    - ".agentplane/tasks/202610090915-GRTK08/README.md"
    - ".agentplane/tasks/202610090915-GRTK08/quality/20261009-092231960-recovery-context/quality-report.json"
    - ".agentplane/tasks/202610090915-GRTK08/quality/20261009-092231960-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202610090915-GRTK08/quality/20261009-092231960-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202610090915-GRTK08/blueprint/resolved-snapshot.json"
    - "apps/office/src/sc/source/core/tool/refupdat.test.ts"
    - "apps/office/coverage/calc/coverage-summary.json"
    - "output/playwright/calc-registry9.json"
    - "7cfa2999f25a"
  findings:
    - "20203 compiled unchanged original outcomes and all prior Calc fixtures pass; actual100 all four metrics, registry zero violations and affected guards clean. Original static owner retains a narrow lint annotation."
commit:
  hash: "7cfa2999f25a851dc42a5980e0d84f55edcc413f"
  message: "✨ GRTK08 calc: port reference transpose and growth geometry"
comments:
  -
    author: "CODER"
    body: "Start: port original transpose and growth geometry using existing coordinate owners with pinned native comparison and scoped actual100 tests."
  -
    author: "CODER"
    body: "Verified: original transpose and growth numerical geometry with native comparison, actual100 Calc coverage and zero inventory violations."
events:
  -
    type: "status"
    at: "2026-10-09T09:15:55.758Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: port original transpose and growth geometry using existing coordinate owners with pinned native comparison and scoped actual100 tests."
  -
    type: "verify"
    at: "2026-10-09T09:22:18.630Z"
    author: "CODER"
    state: "ok"
    note: "Command: node scripts/calc-refupdat-native-probe.mjs --write; node scripts/calc-refupdat-native-probe.mjs --check Result: pass after adding original range-order dependency to native shell. Evidence:20203 initialized cases, exact pinned HEAD/five Git blobs and source/extracted hashes, unchanged original three-method interval and header/coordinate bodies; ASan/UBSan clean, saved output exact. Scope: all public defined transpose/growth results and raw values, signed widths, sheet wrapping, raw range containment, pre-mutation growth predicates, source/reference and destination/endpoint aliases. Native debug checks and undefined arithmetic remain uncertified. Command: npm run test:coverage:calc Result: pass. Evidence:48 tests/11 files; actual V8 statements959/959, branches802/802, functions213/213, lines853/853 all100. No exclusions/settings/test-body changes to previous owners. Scope: all current Calc owners including every saved geometry output and literal rules. Command: npm run typecheck; npm run check:dependencies; npm run check:docs; npm run check:file-size; npm run check:source-tree Result: pass. Evidence:tools/application typecheck clean;332 sources/1570 imports/29 edges;1086 documented authored sources;1089 files reviewed, old grouping candidates unchanged;114 required paths/33 retired roots. Scope: original core/inc and core/tool owners reuse existing ordinary coordinates and document getter view; shared/Writer sources unchanged. Command: node_modules/.bin/eslint apps/office/src/sc/source/core/inc/refupdat.ts apps/office/src/sc/source/core/tool/refupdat.ts apps/office/src/sc/source/core/tool/refupdat.test.ts scripts/calc-refupdat-native-probe.mjs Result: pass after narrow original-static-class lint annotation. Evidence:affected source/test/probe clean; original ScRefUpdate all-static owner retained, repository policy unchanged. Scope:four new authored code files. Command: node_modules/.bin/prettier --check apps/office/src/sc/source/core/inc/refupdat.ts apps/office/src/sc/source/core/tool/refupdat.ts apps/office/src/sc/source/core/tool/refupdat.test.ts scripts/calc-refupdat-native-probe.mjs Result: pass. Evidence:all matched files formatted; native fixture compact. Scope:four authored code files. Command: npm run inventory:parity:calc Result: pass. Evidence:9 capabilities/124 modules (12 Calc/112 shared), zero semantic violations; new capability and two runtime/provenance records map original header/source. Previous status flags unchanged, new semantic parity unverified. Scope: bounded geometry evidence; other Update overloads, MoveRelWrap and full document/compiler/change-tracking integration remain absent rather than stubbed. Command: node .agentplane/policy/check-routing.mjs; ap doctor; git diff --check; git status --short --untracked-files=all Result: pass. Evidence:routing OK, doctor zero errors/one pre-existing managed shim warning, diff clean, only active task/new implementation records and calc-core docs intentional. Final clean calc state checked after finish. Scope:milestone9; full suites are next milestone10, then pause goal on user request after any error remediation. No merges or out-of-checkout modifications."
  -
    type: "status"
    at: "2026-10-09T09:22:47.249Z"
    author: "CODER"
    from: "DOING"
    to: "DONE"
    note: "Verified: original transpose and growth numerical geometry with native comparison, actual100 Calc coverage and zero inventory violations."
doc_version: 3
doc_updated_at: "2026-10-09T09:22:47.251Z"
doc_updated_by: "CODER"
description: "Implement original ScRefUpdate result domain and DoTranspose, UpdateTranspose and UpdateGrow numerical operations using existing ScAddress/ScRange owners, then native differential acceptance and inventory. Calc milestone9; milestone10 full suites followed by explicit goal pause."
sections:
  Summary: "Port original ScRefUpdate transpose and area-growth geometry without document/compiler stubs; prepare full validation and user-requested pause."
  Scope: "New sc/source/core/inc/refupdat.ts and sc/source/core/tool/refupdat.ts, focused test and native fixture, scripts/calc-refupdat-native-probe.mjs, new Calc capability and two runtime/provenance records, calc-core docs. Reuse original ScAddress/ScRange and ScAddressDocument. No existing shared/Writer or earlier source/test/fixture changes. Only calc branch/checkout. Milestone9; milestone10 full-suite validation and fixes, then pause goal."
  Plan: "Implement original result enum and static DoTranspose/UpdateTranspose/UpdateGrow at core/inc and core/tool boundaries, using explicit output tuple for native references and existing value-owner assignment. Native comparison compiles unchanged complete three-method source interval and original address/range numerical inline bodies in bounded table-count getter shell; use defined native arithmetic and positive table counts. Enumerate independent axes, reversed/raw ranges, multiwrap tabs, narrow boundaries, growth predicates and original source aliasing. Leave other original methods absent and registry parity unverified; actual100 coverage and scoped guards validate milestone9. Then execute a separate milestone10 full test validation/fixes task and pause the goal as explicitly requested."
  Verify Steps: "Run native probe --write and --check requiring unchanged pinned original DoTranspose/UpdateTranspose/UpdateGrow bodies and original coordinate constructors/Contains under ASan/UBSan. Compare every saved result and raw endpoint through TS, cover sheet wrap, coordinate narrowing, source containment, header row growth and recipient endpoint identities. Run npm run test:coverage:calc actual100 all four metrics, npm run typecheck, check:dependencies, check:docs, check:file-size, check:source-tree, affected ESLint/Prettier, inventory:parity:calc zero semantic violations, routing, doctor, diff and final clean calc state. Preserve prior fixtures/tests/status flags. Full suites in next milestone10, followed by explicit goal pause."
  Verification: |-
    Pending native geometry implementation and actual100 scoped checks.

    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-10-09T09:22:18.630Z — VERIFY — ok

    By: CODER

    Note: Command: node scripts/calc-refupdat-native-probe.mjs --write; node scripts/calc-refupdat-native-probe.mjs --check Result: pass after adding original range-order dependency to native shell. Evidence:20203 initialized cases, exact pinned HEAD/five Git blobs and source/extracted hashes, unchanged original three-method interval and header/coordinate bodies; ASan/UBSan clean, saved output exact. Scope: all public defined transpose/growth results and raw values, signed widths, sheet wrapping, raw range containment, pre-mutation growth predicates, source/reference and destination/endpoint aliases. Native debug checks and undefined arithmetic remain uncertified. Command: npm run test:coverage:calc Result: pass. Evidence:48 tests/11 files; actual V8 statements959/959, branches802/802, functions213/213, lines853/853 all100. No exclusions/settings/test-body changes to previous owners. Scope: all current Calc owners including every saved geometry output and literal rules. Command: npm run typecheck; npm run check:dependencies; npm run check:docs; npm run check:file-size; npm run check:source-tree Result: pass. Evidence:tools/application typecheck clean;332 sources/1570 imports/29 edges;1086 documented authored sources;1089 files reviewed, old grouping candidates unchanged;114 required paths/33 retired roots. Scope: original core/inc and core/tool owners reuse existing ordinary coordinates and document getter view; shared/Writer sources unchanged. Command: node_modules/.bin/eslint apps/office/src/sc/source/core/inc/refupdat.ts apps/office/src/sc/source/core/tool/refupdat.ts apps/office/src/sc/source/core/tool/refupdat.test.ts scripts/calc-refupdat-native-probe.mjs Result: pass after narrow original-static-class lint annotation. Evidence:affected source/test/probe clean; original ScRefUpdate all-static owner retained, repository policy unchanged. Scope:four new authored code files. Command: node_modules/.bin/prettier --check apps/office/src/sc/source/core/inc/refupdat.ts apps/office/src/sc/source/core/tool/refupdat.ts apps/office/src/sc/source/core/tool/refupdat.test.ts scripts/calc-refupdat-native-probe.mjs Result: pass. Evidence:all matched files formatted; native fixture compact. Scope:four authored code files. Command: npm run inventory:parity:calc Result: pass. Evidence:9 capabilities/124 modules (12 Calc/112 shared), zero semantic violations; new capability and two runtime/provenance records map original header/source. Previous status flags unchanged, new semantic parity unverified. Scope: bounded geometry evidence; other Update overloads, MoveRelWrap and full document/compiler/change-tracking integration remain absent rather than stubbed. Command: node .agentplane/policy/check-routing.mjs; ap doctor; git diff --check; git status --short --untracked-files=all Result: pass. Evidence:routing OK, doctor zero errors/one pre-existing managed shim warning, diff clean, only active task/new implementation records and calc-core docs intentional. Final clean calc state checked after finish. Scope:milestone9; full suites are next milestone10, then pause goal on user request after any error remediation. No merges or out-of-checkout modifications.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-09T09:20:26.861Z, excerpt_hash=sha256:9a13dd4552ab920d57226927a2acfc29f809eb33c34dac6064121ebc97787cb3

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202610090915-GRTK08/blueprint/resolved-snapshot.json
    - old_digest: 2d60a203ca87886f40e93189e00a14be567025d26703b9d903c470e2274b5c93
    - current_digest: 2d60a203ca87886f40e93189e00a14be567025d26703b9d903c470e2274b5c93
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202610090915-GRTK08

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202610090915-GRTK08
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: false
    - repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert only this implementation commit; earlier ordinary/big/reference/range-list owners and fixtures remain independent."
  Findings: |-
    Use the original core/inc header boundary rather than sc/inc. DoTranspose uses signed16 relative column and tab temporaries, signed32 row/SCCOLROW and repeated sheet wrapping with positive document table count. UpdateTranspose affects only source-contained references, including no-op coordinate transforms returning UPDATED; aliases must retain native snapshot-before-assignment behavior. UpdateGrow computes both predicates before either mutation and permits row headers. Ordinary/big Update overloads and MoveRelWrap remain absent, with no temporary replacements. Full validation has a separate verification deliverable and fulfills the tenth-task cadence; user explicitly requires pausing after success and error remediation.

    - Observation: First native probe compile lacked the original ScRange::PutInOrder inline dependency required by its address-pair constructor.
      Impact: No fixture was generated; implementation validation cannot proceed until complete original constructor dependencies are present.
      Resolution: Include the unchanged original range ordering interval in the comparison shell; keep production scope and verification criteria unchanged.

    - Observation: Affected ESLint rejects the upstream ScRefUpdate all-static class via no-extraneous-class.
      Impact: Replacing the original class owner with free functions would move the upstream public contract; implementation uses a real original static owner.
      Resolution: Apply a narrowly scoped lint annotation for this original all-static class only; no behavior, test exclusions or repository lint policy changes.
extensions:
  implementation_commit:
    hash: "7cfa2999f25a851dc42a5980e0d84f55edcc413f"
    message: "✨ GRTK08 calc: port reference transpose and growth geometry"
id_source: "generated"
---
## Summary

Port original ScRefUpdate transpose and area-growth geometry without document/compiler stubs; prepare full validation and user-requested pause.

## Scope

New sc/source/core/inc/refupdat.ts and sc/source/core/tool/refupdat.ts, focused test and native fixture, scripts/calc-refupdat-native-probe.mjs, new Calc capability and two runtime/provenance records, calc-core docs. Reuse original ScAddress/ScRange and ScAddressDocument. No existing shared/Writer or earlier source/test/fixture changes. Only calc branch/checkout. Milestone9; milestone10 full-suite validation and fixes, then pause goal.

## Plan

Implement original result enum and static DoTranspose/UpdateTranspose/UpdateGrow at core/inc and core/tool boundaries, using explicit output tuple for native references and existing value-owner assignment. Native comparison compiles unchanged complete three-method source interval and original address/range numerical inline bodies in bounded table-count getter shell; use defined native arithmetic and positive table counts. Enumerate independent axes, reversed/raw ranges, multiwrap tabs, narrow boundaries, growth predicates and original source aliasing. Leave other original methods absent and registry parity unverified; actual100 coverage and scoped guards validate milestone9. Then execute a separate milestone10 full test validation/fixes task and pause the goal as explicitly requested.

## Verify Steps

Run native probe --write and --check requiring unchanged pinned original DoTranspose/UpdateTranspose/UpdateGrow bodies and original coordinate constructors/Contains under ASan/UBSan. Compare every saved result and raw endpoint through TS, cover sheet wrap, coordinate narrowing, source containment, header row growth and recipient endpoint identities. Run npm run test:coverage:calc actual100 all four metrics, npm run typecheck, check:dependencies, check:docs, check:file-size, check:source-tree, affected ESLint/Prettier, inventory:parity:calc zero semantic violations, routing, doctor, diff and final clean calc state. Preserve prior fixtures/tests/status flags. Full suites in next milestone10, followed by explicit goal pause.

## Verification

Pending native geometry implementation and actual100 scoped checks.

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-10-09T09:22:18.630Z — VERIFY — ok

By: CODER

Note: Command: node scripts/calc-refupdat-native-probe.mjs --write; node scripts/calc-refupdat-native-probe.mjs --check Result: pass after adding original range-order dependency to native shell. Evidence:20203 initialized cases, exact pinned HEAD/five Git blobs and source/extracted hashes, unchanged original three-method interval and header/coordinate bodies; ASan/UBSan clean, saved output exact. Scope: all public defined transpose/growth results and raw values, signed widths, sheet wrapping, raw range containment, pre-mutation growth predicates, source/reference and destination/endpoint aliases. Native debug checks and undefined arithmetic remain uncertified. Command: npm run test:coverage:calc Result: pass. Evidence:48 tests/11 files; actual V8 statements959/959, branches802/802, functions213/213, lines853/853 all100. No exclusions/settings/test-body changes to previous owners. Scope: all current Calc owners including every saved geometry output and literal rules. Command: npm run typecheck; npm run check:dependencies; npm run check:docs; npm run check:file-size; npm run check:source-tree Result: pass. Evidence:tools/application typecheck clean;332 sources/1570 imports/29 edges;1086 documented authored sources;1089 files reviewed, old grouping candidates unchanged;114 required paths/33 retired roots. Scope: original core/inc and core/tool owners reuse existing ordinary coordinates and document getter view; shared/Writer sources unchanged. Command: node_modules/.bin/eslint apps/office/src/sc/source/core/inc/refupdat.ts apps/office/src/sc/source/core/tool/refupdat.ts apps/office/src/sc/source/core/tool/refupdat.test.ts scripts/calc-refupdat-native-probe.mjs Result: pass after narrow original-static-class lint annotation. Evidence:affected source/test/probe clean; original ScRefUpdate all-static owner retained, repository policy unchanged. Scope:four new authored code files. Command: node_modules/.bin/prettier --check apps/office/src/sc/source/core/inc/refupdat.ts apps/office/src/sc/source/core/tool/refupdat.ts apps/office/src/sc/source/core/tool/refupdat.test.ts scripts/calc-refupdat-native-probe.mjs Result: pass. Evidence:all matched files formatted; native fixture compact. Scope:four authored code files. Command: npm run inventory:parity:calc Result: pass. Evidence:9 capabilities/124 modules (12 Calc/112 shared), zero semantic violations; new capability and two runtime/provenance records map original header/source. Previous status flags unchanged, new semantic parity unverified. Scope: bounded geometry evidence; other Update overloads, MoveRelWrap and full document/compiler/change-tracking integration remain absent rather than stubbed. Command: node .agentplane/policy/check-routing.mjs; ap doctor; git diff --check; git status --short --untracked-files=all Result: pass. Evidence:routing OK, doctor zero errors/one pre-existing managed shim warning, diff clean, only active task/new implementation records and calc-core docs intentional. Final clean calc state checked after finish. Scope:milestone9; full suites are next milestone10, then pause goal on user request after any error remediation. No merges or out-of-checkout modifications.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-09T09:20:26.861Z, excerpt_hash=sha256:9a13dd4552ab920d57226927a2acfc29f809eb33c34dac6064121ebc97787cb3

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202610090915-GRTK08/blueprint/resolved-snapshot.json
- old_digest: 2d60a203ca87886f40e93189e00a14be567025d26703b9d903c470e2274b5c93
- current_digest: 2d60a203ca87886f40e93189e00a14be567025d26703b9d903c470e2274b5c93
- route_changed: no
- safe_command: agentplane blueprint snapshot 202610090915-GRTK08

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202610090915-GRTK08
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: false
- repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert only this implementation commit; earlier ordinary/big/reference/range-list owners and fixtures remain independent.

## Findings

Use the original core/inc header boundary rather than sc/inc. DoTranspose uses signed16 relative column and tab temporaries, signed32 row/SCCOLROW and repeated sheet wrapping with positive document table count. UpdateTranspose affects only source-contained references, including no-op coordinate transforms returning UPDATED; aliases must retain native snapshot-before-assignment behavior. UpdateGrow computes both predicates before either mutation and permits row headers. Ordinary/big Update overloads and MoveRelWrap remain absent, with no temporary replacements. Full validation has a separate verification deliverable and fulfills the tenth-task cadence; user explicitly requires pausing after success and error remediation.

- Observation: First native probe compile lacked the original ScRange::PutInOrder inline dependency required by its address-pair constructor.
  Impact: No fixture was generated; implementation validation cannot proceed until complete original constructor dependencies are present.
  Resolution: Include the unchanged original range ordering interval in the comparison shell; keep production scope and verification criteria unchanged.

- Observation: Affected ESLint rejects the upstream ScRefUpdate all-static class via no-extraneous-class.
  Impact: Replacing the original class owner with free functions would move the upstream public contract; implementation uses a real original static owner.
  Resolution: Apply a narrowly scoped lint annotation for this original all-static class only; no behavior, test exclusions or repository lint policy changes.
