---
id: "202610090816-5YGKY3"
title: "Port Calc complex formula reference data and native range inheritance"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 12
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-09T08:17:06.659Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-10-09T08:29:41.112Z"
  updated_by: "CODER"
  note: "Command: node scripts/calc-refdata-native-probe.mjs --complex-write; node scripts/calc-refdata-native-probe.mjs --complex-check; node scripts/calc-refdata-native-probe.mjs --check Result: pass. Evidence: exact pinned Git blobs and source/body hashes; original complex class,14 complete non-debug definitions and range constructors/order compiled unchanged; ASan/UBSan-clean fixture outputs. Old single fixture remains byte-identical. Scope:3072 property/ordering states,6400 single extensions,1600 complex extensions,300 alias cases,1792 sticky updates,256 mixed-address initializers,36 range/flag initializers and4 equalities. Bounded initialized states, not whole Calc parity. Command: npm run test:coverage:calc Result: pass. Evidence:36 tests across8 files; statements567/567,branches488/488,functions146/146,lines497/497,all100%. Scope: all current Calc core sources and prior acceptance; every saved native output compared through actual TS owners; both original complex testFormulaRefData assertions retained. Command: npm run typecheck; node_modules/.bin/eslint apps/office/src/sc/inc/refdata.ts apps/office/src/sc/source/core/tool/refdata.ts apps/office/src/sc/source/core/tool/complex-refdata.test.ts scripts/calc-refdata-native-probe.mjs; node_modules/.bin/prettier --check apps/office/src/sc/inc/refdata.ts apps/office/src/sc/source/core/tool/refdata.ts apps/office/src/sc/source/core/tool/complex-refdata.test.ts scripts/calc-refdata-native-probe.mjs Result: pass. Evidence: no type/lint diagnostics; all matched files formatted. Scope: static application types and affected source/probe/test paths. Command: npm run check:dependencies; npm run check:docs; npm run check:file-size; npm run check:source-tree Result: pass. Evidence:326 runtime sources,1558 imports,29 allowed module edges;1074 documented sources;1077 files checked, refdata grouping reviewed;114 required source-tree paths and33 retired roots checked. Scope: declared repository static guards; no changed shared owners or Writer tests. Command: node_modules/.bin/tsx scripts/libreoffice-inventory/registry-cli.ts check --scope calc Result: pass. Evidence:6 capabilities,118 applicable modules (6 Calc and112 shared),0 semantic violations. Existing capability flags preserved; module/default/behavior/contract parity stays unverified. Scope: Calc capability/runtime/provenance records and reused shared ownership. Command: node .agentplane/policy/check-routing.mjs; ap doctor; git diff --check Result: pass. Evidence: routing OK; doctor0 errors,1 pre-existing managed hook readiness warning; no whitespace errors. Scope: task policy and affected diff. Final clean state on calc is required after task closure. Full suite schedule: Calc milestone6 of10; the user requires the full run after milestone10. No cadence change or mandatory check omission."
  attempts: 0
commit: null
comments:
  -
    author: "CODER"
    body: "Start: port original complex reference inheritance and sticky contracts on existing owners, preserving prior single-reference acceptance."
events:
  -
    type: "status"
    at: "2026-10-09T08:17:18.973Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: port original complex reference inheritance and sticky contracts on existing owners, preserving prior single-reference acceptance."
  -
    type: "verify"
    at: "2026-10-09T08:29:41.112Z"
    author: "CODER"
    state: "ok"
    note: "Command: node scripts/calc-refdata-native-probe.mjs --complex-write; node scripts/calc-refdata-native-probe.mjs --complex-check; node scripts/calc-refdata-native-probe.mjs --check Result: pass. Evidence: exact pinned Git blobs and source/body hashes; original complex class,14 complete non-debug definitions and range constructors/order compiled unchanged; ASan/UBSan-clean fixture outputs. Old single fixture remains byte-identical. Scope:3072 property/ordering states,6400 single extensions,1600 complex extensions,300 alias cases,1792 sticky updates,256 mixed-address initializers,36 range/flag initializers and4 equalities. Bounded initialized states, not whole Calc parity. Command: npm run test:coverage:calc Result: pass. Evidence:36 tests across8 files; statements567/567,branches488/488,functions146/146,lines497/497,all100%. Scope: all current Calc core sources and prior acceptance; every saved native output compared through actual TS owners; both original complex testFormulaRefData assertions retained. Command: npm run typecheck; node_modules/.bin/eslint apps/office/src/sc/inc/refdata.ts apps/office/src/sc/source/core/tool/refdata.ts apps/office/src/sc/source/core/tool/complex-refdata.test.ts scripts/calc-refdata-native-probe.mjs; node_modules/.bin/prettier --check apps/office/src/sc/inc/refdata.ts apps/office/src/sc/source/core/tool/refdata.ts apps/office/src/sc/source/core/tool/complex-refdata.test.ts scripts/calc-refdata-native-probe.mjs Result: pass. Evidence: no type/lint diagnostics; all matched files formatted. Scope: static application types and affected source/probe/test paths. Command: npm run check:dependencies; npm run check:docs; npm run check:file-size; npm run check:source-tree Result: pass. Evidence:326 runtime sources,1558 imports,29 allowed module edges;1074 documented sources;1077 files checked, refdata grouping reviewed;114 required source-tree paths and33 retired roots checked. Scope: declared repository static guards; no changed shared owners or Writer tests. Command: node_modules/.bin/tsx scripts/libreoffice-inventory/registry-cli.ts check --scope calc Result: pass. Evidence:6 capabilities,118 applicable modules (6 Calc and112 shared),0 semantic violations. Existing capability flags preserved; module/default/behavior/contract parity stays unverified. Scope: Calc capability/runtime/provenance records and reused shared ownership. Command: node .agentplane/policy/check-routing.mjs; ap doctor; git diff --check Result: pass. Evidence: routing OK; doctor0 errors,1 pre-existing managed hook readiness warning; no whitespace errors. Scope: task policy and affected diff. Final clean state on calc is required after task closure. Full suite schedule: Calc milestone6 of10; the user requires the full run after milestone10. No cadence change or mandatory check omission."
doc_version: 3
doc_updated_at: "2026-10-09T08:29:41.164Z"
doc_updated_by: "CODER"
description: "Implement complete initialized ScComplexRefData header/source contracts on original refdata boundaries, including stable copied endpoints, trim defaults, conversion/validation, original extension flag inheritance and sticky endpoint updates. Extend the existing native reference comparison harness while preserving all prior single-reference evidence; update Calc inventory."
sections:
  Summary: "Port the initialized native complex formula range reference owner and prove bounded native inheritance, conversion and sticky behavior."
  Scope: "Existing sc/inc/refdata.ts and sc/source/core/tool/refdata.ts, new complex-reference acceptance tests and native fixture, existing scripts/calc-refdata-native-probe.mjs, existing refdata runtime/provenance records and single capability gaps, new complex Calc capability, calc-core docs. Preserve all existing test bodies, single-reference fixture and original semantic statuses, shared/Writer sources. Work only in calc checkout on calc; no merges. Calc milestone6, full suite at10."
  Plan: "Implement original ScComplexRefData with stable independent Ref1/Ref2 values, implicit copy/assignment semantics, false trim default and trim-independent equality. Implement every non-debug header/source method: initializers, checks, sorted absolute conversion, SetRange, source-owned single-reference ordering, original Extend overloads with sheet/relativity/3D/name inheritance and alias semantics, entire-axis checks and masked/relative sticky increments. Reuse ScSingleRefData, ScAddress, ScRefAddress, ScRange and ScSheetLimits. Extend existing native harness with original ScRange constructors and complete14 complex definitions plus original complex header, same pinned blob checks and sanitizers. Separate complex mode/fixture; retain byte-identical single fixture and acceptance. Add source-derived upstream testFormulaRefData extension cases and bounded literal edge assertions. Validate100 Calc coverage and scoped static/inventory checks; document complete document/token/compiler/undefined/debug limitations without promotion. Core progression authorized by original user goal."
  Verify Steps: "Run native probe --complex-write then --complex-check and original --check; require exact pinned Git blobs, unchanged single fixture and ASan/UBSan-clean states. Compare every complex fixture output through TS owner. Retain prior test bodies and run npm run test:coverage:calc requiring actual100 all4 metrics. Run typecheck, check:dependencies, check:docs, check:file-size, check:source-tree, affected ESLint/Prettier. Calc registry0 semantic violations; preserve all prior flags/shared ownership. Routing and ap doctor; diff check; final clean tracked/untracked state on calc. Full suite scheduled atCalc10. Review original refdata owner grouping if the combined file crosses500 lines; hard1000 line limit stays enforced."
  Verification: |-
    Pending port and source/native acceptance.

    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-10-09T08:29:41.112Z — VERIFY — ok

    By: CODER

    Note: Command: node scripts/calc-refdata-native-probe.mjs --complex-write; node scripts/calc-refdata-native-probe.mjs --complex-check; node scripts/calc-refdata-native-probe.mjs --check Result: pass. Evidence: exact pinned Git blobs and source/body hashes; original complex class,14 complete non-debug definitions and range constructors/order compiled unchanged; ASan/UBSan-clean fixture outputs. Old single fixture remains byte-identical. Scope:3072 property/ordering states,6400 single extensions,1600 complex extensions,300 alias cases,1792 sticky updates,256 mixed-address initializers,36 range/flag initializers and4 equalities. Bounded initialized states, not whole Calc parity. Command: npm run test:coverage:calc Result: pass. Evidence:36 tests across8 files; statements567/567,branches488/488,functions146/146,lines497/497,all100%. Scope: all current Calc core sources and prior acceptance; every saved native output compared through actual TS owners; both original complex testFormulaRefData assertions retained. Command: npm run typecheck; node_modules/.bin/eslint apps/office/src/sc/inc/refdata.ts apps/office/src/sc/source/core/tool/refdata.ts apps/office/src/sc/source/core/tool/complex-refdata.test.ts scripts/calc-refdata-native-probe.mjs; node_modules/.bin/prettier --check apps/office/src/sc/inc/refdata.ts apps/office/src/sc/source/core/tool/refdata.ts apps/office/src/sc/source/core/tool/complex-refdata.test.ts scripts/calc-refdata-native-probe.mjs Result: pass. Evidence: no type/lint diagnostics; all matched files formatted. Scope: static application types and affected source/probe/test paths. Command: npm run check:dependencies; npm run check:docs; npm run check:file-size; npm run check:source-tree Result: pass. Evidence:326 runtime sources,1558 imports,29 allowed module edges;1074 documented sources;1077 files checked, refdata grouping reviewed;114 required source-tree paths and33 retired roots checked. Scope: declared repository static guards; no changed shared owners or Writer tests. Command: node_modules/.bin/tsx scripts/libreoffice-inventory/registry-cli.ts check --scope calc Result: pass. Evidence:6 capabilities,118 applicable modules (6 Calc and112 shared),0 semantic violations. Existing capability flags preserved; module/default/behavior/contract parity stays unverified. Scope: Calc capability/runtime/provenance records and reused shared ownership. Command: node .agentplane/policy/check-routing.mjs; ap doctor; git diff --check Result: pass. Evidence: routing OK; doctor0 errors,1 pre-existing managed hook readiness warning; no whitespace errors. Scope: task policy and affected diff. Final clean state on calc is required after task closure. Full suite schedule: Calc milestone6 of10; the user requires the full run after milestone10. No cadence change or mandatory check omission.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-09T08:29:40.713Z, excerpt_hash=sha256:5c7fb550508ac563d44c647ff549565d8803a456005c732b07a23922b427feb5

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202610090816-5YGKY3/blueprint/resolved-snapshot.json
    - old_digest: c06fc6c0f775a153a5493be83e4ffdc8decbb0c292d5703a7b1359f20da6f9f3
    - current_digest: c06fc6c0f775a153a5493be83e4ffdc8decbb0c292d5703a7b1359f20da6f9f3
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202610090816-5YGKY3

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202610090816-5YGKY3
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: false
    - repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert only this implementation commit while retaining initialized single references and prior fixture evidence."
  Findings: |-
    Complex absolute conversion invokes the native address-pair ScRange constructor, which sorts axes independently even when reference data itself is unsorted. External validity compares deletion-masked sheet getters. Trim remains unchanged by initializers and is omitted from equality. Complex sticky operations use masked reference getters and retain relative flags, so replacing them with address-range operations would alter native contracts. Extension overloads preserve own-endpoint and self alias semantics.

    Decomposition review: check:file-size reports refdata.ts at524 lines (523 newline-terminated source lines). Both classes retain the original refdata owner and header/source responsibility. Their compact, related implementations remain together instead of moving native responsibilities into an arbitrary module; hard1000 line enforcement passes. Existing single-reference class body, fixture, acceptance test bodies and all prior semantic status flags remain unchanged. Shared/Writer implementation paths are untouched.

    Native evidence is a bounded four-getter document comparison shell, not production C++ generation, complete ScDocument integration or whole formula/compiler parity. Full document/raw token/compiler/listener ownership, native union/pointer layout, debug-only dumping and undefined/uninitialized arithmetic domains remain unverified in inventory.

    ap doctor passes with0 errors and1 pre-existing managed hook readiness warning. It does not prevent scoped implementation verification and is outside this task scope. Calc milestone6 preserves the user cadence: full suites after milestone10, targeted tests plus actual100 Calc coverage between full runs.
id_source: "generated"
---
## Summary

Port the initialized native complex formula range reference owner and prove bounded native inheritance, conversion and sticky behavior.

## Scope

Existing sc/inc/refdata.ts and sc/source/core/tool/refdata.ts, new complex-reference acceptance tests and native fixture, existing scripts/calc-refdata-native-probe.mjs, existing refdata runtime/provenance records and single capability gaps, new complex Calc capability, calc-core docs. Preserve all existing test bodies, single-reference fixture and original semantic statuses, shared/Writer sources. Work only in calc checkout on calc; no merges. Calc milestone6, full suite at10.

## Plan

Implement original ScComplexRefData with stable independent Ref1/Ref2 values, implicit copy/assignment semantics, false trim default and trim-independent equality. Implement every non-debug header/source method: initializers, checks, sorted absolute conversion, SetRange, source-owned single-reference ordering, original Extend overloads with sheet/relativity/3D/name inheritance and alias semantics, entire-axis checks and masked/relative sticky increments. Reuse ScSingleRefData, ScAddress, ScRefAddress, ScRange and ScSheetLimits. Extend existing native harness with original ScRange constructors and complete14 complex definitions plus original complex header, same pinned blob checks and sanitizers. Separate complex mode/fixture; retain byte-identical single fixture and acceptance. Add source-derived upstream testFormulaRefData extension cases and bounded literal edge assertions. Validate100 Calc coverage and scoped static/inventory checks; document complete document/token/compiler/undefined/debug limitations without promotion. Core progression authorized by original user goal.

## Verify Steps

Run native probe --complex-write then --complex-check and original --check; require exact pinned Git blobs, unchanged single fixture and ASan/UBSan-clean states. Compare every complex fixture output through TS owner. Retain prior test bodies and run npm run test:coverage:calc requiring actual100 all4 metrics. Run typecheck, check:dependencies, check:docs, check:file-size, check:source-tree, affected ESLint/Prettier. Calc registry0 semantic violations; preserve all prior flags/shared ownership. Routing and ap doctor; diff check; final clean tracked/untracked state on calc. Full suite scheduled atCalc10. Review original refdata owner grouping if the combined file crosses500 lines; hard1000 line limit stays enforced.

## Verification

Pending port and source/native acceptance.

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-10-09T08:29:41.112Z — VERIFY — ok

By: CODER

Note: Command: node scripts/calc-refdata-native-probe.mjs --complex-write; node scripts/calc-refdata-native-probe.mjs --complex-check; node scripts/calc-refdata-native-probe.mjs --check Result: pass. Evidence: exact pinned Git blobs and source/body hashes; original complex class,14 complete non-debug definitions and range constructors/order compiled unchanged; ASan/UBSan-clean fixture outputs. Old single fixture remains byte-identical. Scope:3072 property/ordering states,6400 single extensions,1600 complex extensions,300 alias cases,1792 sticky updates,256 mixed-address initializers,36 range/flag initializers and4 equalities. Bounded initialized states, not whole Calc parity. Command: npm run test:coverage:calc Result: pass. Evidence:36 tests across8 files; statements567/567,branches488/488,functions146/146,lines497/497,all100%. Scope: all current Calc core sources and prior acceptance; every saved native output compared through actual TS owners; both original complex testFormulaRefData assertions retained. Command: npm run typecheck; node_modules/.bin/eslint apps/office/src/sc/inc/refdata.ts apps/office/src/sc/source/core/tool/refdata.ts apps/office/src/sc/source/core/tool/complex-refdata.test.ts scripts/calc-refdata-native-probe.mjs; node_modules/.bin/prettier --check apps/office/src/sc/inc/refdata.ts apps/office/src/sc/source/core/tool/refdata.ts apps/office/src/sc/source/core/tool/complex-refdata.test.ts scripts/calc-refdata-native-probe.mjs Result: pass. Evidence: no type/lint diagnostics; all matched files formatted. Scope: static application types and affected source/probe/test paths. Command: npm run check:dependencies; npm run check:docs; npm run check:file-size; npm run check:source-tree Result: pass. Evidence:326 runtime sources,1558 imports,29 allowed module edges;1074 documented sources;1077 files checked, refdata grouping reviewed;114 required source-tree paths and33 retired roots checked. Scope: declared repository static guards; no changed shared owners or Writer tests. Command: node_modules/.bin/tsx scripts/libreoffice-inventory/registry-cli.ts check --scope calc Result: pass. Evidence:6 capabilities,118 applicable modules (6 Calc and112 shared),0 semantic violations. Existing capability flags preserved; module/default/behavior/contract parity stays unverified. Scope: Calc capability/runtime/provenance records and reused shared ownership. Command: node .agentplane/policy/check-routing.mjs; ap doctor; git diff --check Result: pass. Evidence: routing OK; doctor0 errors,1 pre-existing managed hook readiness warning; no whitespace errors. Scope: task policy and affected diff. Final clean state on calc is required after task closure. Full suite schedule: Calc milestone6 of10; the user requires the full run after milestone10. No cadence change or mandatory check omission.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-09T08:29:40.713Z, excerpt_hash=sha256:5c7fb550508ac563d44c647ff549565d8803a456005c732b07a23922b427feb5

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202610090816-5YGKY3/blueprint/resolved-snapshot.json
- old_digest: c06fc6c0f775a153a5493be83e4ffdc8decbb0c292d5703a7b1359f20da6f9f3
- current_digest: c06fc6c0f775a153a5493be83e4ffdc8decbb0c292d5703a7b1359f20da6f9f3
- route_changed: no
- safe_command: agentplane blueprint snapshot 202610090816-5YGKY3

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202610090816-5YGKY3
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: false
- repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert only this implementation commit while retaining initialized single references and prior fixture evidence.

## Findings

Complex absolute conversion invokes the native address-pair ScRange constructor, which sorts axes independently even when reference data itself is unsorted. External validity compares deletion-masked sheet getters. Trim remains unchanged by initializers and is omitted from equality. Complex sticky operations use masked reference getters and retain relative flags, so replacing them with address-range operations would alter native contracts. Extension overloads preserve own-endpoint and self alias semantics.

Decomposition review: check:file-size reports refdata.ts at524 lines (523 newline-terminated source lines). Both classes retain the original refdata owner and header/source responsibility. Their compact, related implementations remain together instead of moving native responsibilities into an arbitrary module; hard1000 line enforcement passes. Existing single-reference class body, fixture, acceptance test bodies and all prior semantic status flags remain unchanged. Shared/Writer implementation paths are untouched.

Native evidence is a bounded four-getter document comparison shell, not production C++ generation, complete ScDocument integration or whole formula/compiler parity. Full document/raw token/compiler/listener ownership, native union/pointer layout, debug-only dumping and undefined/uninitialized arithmetic domains remain unverified in inventory.

ap doctor passes with0 errors and1 pre-existing managed hook readiness warning. It does not prevent scoped implementation verification and is outside this task scope. Calc milestone6 preserves the user cadence: full suites after milestone10, targeted tests plus actual100 Calc coverage between full runs.
