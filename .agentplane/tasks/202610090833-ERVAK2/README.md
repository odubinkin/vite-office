---
id: "202610090833-ERVAK2"
title: "Port Calc numerical range list geometry and edit operations"
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
  updated_at: "2026-10-09T08:34:31.317Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-10-09T08:54:04.572Z"
  updated_by: "CODER"
  note: "Command: node scripts/calc-rangelst-native-probe.mjs --write; node scripts/calc-rangelst-native-probe.mjs --check Result: pass. Evidence: exact pinned Git blobs and full/source interval hashes; original class, numerical definition/helper intervals and address/range inline bodies unchanged; ASan/UBSan clean. Scope:13432 initialized operation sequences with17391 native snapshots, including joins, partial combining, deletion fragments, insertion overloads, cache-sensitive follow-ups, ownership/copy/swap, queries and unsigned64 modular counts. Portable tests compare every public output and retain original numerical ucalc_rangelst examples. Command: npm run test:coverage:calc Result: pass. Evidence:40 tests across9 files; statements860/860,branches712/712,functions184/184,lines762/762,all100%; no coverage exclusions or configuration changes. Scope: all current Calc core owners and prior acceptance. Four redundant guard paths are expressed from original preceding finite-integer predicates with proof comments; original C++ probe bodies remain unchanged. No defined native output or public owner boundary changes. Command: npm run typecheck; node_modules/.bin/eslint apps/office/src/sc/inc/address.ts apps/office/src/sc/inc/rangelst.ts apps/office/src/sc/source/core/tool/rangelst.ts apps/office/src/sc/source/core/tool/rangelst.test.ts scripts/calc-rangelst-native-probe.mjs; node_modules/.bin/prettier --check apps/office/src/sc/inc/address.ts apps/office/src/sc/inc/rangelst.ts apps/office/src/sc/source/core/tool/rangelst.ts apps/office/src/sc/source/core/tool/rangelst.test.ts scripts/calc-rangelst-native-probe.mjs Result: pass. Evidence: no type/lint diagnostics; all matched files formatted. Final corrections use the native at valid-index boundary, with no fabricated fallback values or disabled enforcement. Scope: complete application/tool static types and affected source/tests/probe. Command: npm run check:dependencies; npm run check:docs; npm run check:file-size; npm run check:source-tree Result: pass. Evidence:328 runtime sources,1562 relative imports,29 allowed cross-module edges;1078 documented sources;1081 authored files checked, rangelst grouping reviewed;114 required paths and33 retired roots. Scope: static module, documentation, size and tree guards. Existing shared/Writer implementation, previous test bodies/native fixtures and all prior capability flags are unchanged. Command: node_modules/.bin/tsx scripts/libreoffice-inventory/registry-cli.ts check --scope calc Result: pass. Evidence:7 capabilities,120 applicable modules (8 Calc and112 shared),0 semantic violations. Actual100 local coverage does not promote parity statuses. Scope: new range-list capability/header/tool provenance/runtime and existing address SCSIZE mapping; full document/compiler/lifetime/pointer-width/undefined domains remain unverified. Command: node .agentplane/policy/check-routing.mjs; ap doctor; git diff --check Result: pass. Evidence: routing OK; doctor0 errors,1 pre-existing managed hook readiness warning; no whitespace errors. Scope: task policy and reviewed diff. Final clean tracked/untracked state on calc is required after closure. Full suite cadence: Calc milestone7 of10. Full test suites run after milestone10 under the user instruction; affected/shared tests are required when shared implementations change, which this task does not do."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-10-09T08:55:07.370Z"
  updated_by: "EVALUATOR"
  note: "Numerical range-list owner retains native storage, join/cache and edit fragment behavior with exact bounded comparison; all declared checks pass at actual100 Calc coverage."
  evaluated_sha: "50cc72277bb69f9e27cfb51c1807eac86c73f525"
  blueprint_digest: "9a7c0c7172edd29655ba86e0b6f571583640587e2748ef3155e8cdf543d6c856"
  evidence_refs:
    - ".agentplane/tasks/202610090833-ERVAK2/README.md"
    - ".agentplane/tasks/202610090833-ERVAK2/quality/20261009-085507370-recovery-context/quality-report.json"
    - ".agentplane/tasks/202610090833-ERVAK2/quality/20261009-085507370-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202610090833-ERVAK2/quality/20261009-085507370-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202610090833-ERVAK2/blueprint/resolved-snapshot.json"
    - "apps/office/src/sc/source/core/tool/rangelst.test.ts"
    - "apps/office/src/sc/source/core/tool/native-range-list-cases.json"
    - "scripts/calc-rangelst-native-probe.mjs"
    - "output/playwright/calc7-verification.md"
    - "output/playwright/calc-registry7.json"
  findings:
    - "Reviewed original numerical source/body intervals against TS owner and helper order; existing address/range owners are reused and shared/Writer implementation paths are unchanged."
    - "Four unreachable guard paths are expressed directly after original numeric implications, documented with proof comments; native probe definitions remain unchanged, without coverage exclusions."
    - "Soft541-line review retains original range-list and anonymous helper grouping; hard1000 guard passes. Existing test bodies, native fixtures and semantic status flags are preserved."
commit: null
comments:
  -
    author: "CODER"
    body: "Start: port numerical range list ownership and native join/insertion/deletion contracts, retaining original ordering and bounded native evidence."
events:
  -
    type: "status"
    at: "2026-10-09T08:34:41.597Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: port numerical range list ownership and native join/insertion/deletion contracts, retaining original ordering and bounded native evidence."
  -
    type: "verify"
    at: "2026-10-09T08:54:04.572Z"
    author: "CODER"
    state: "ok"
    note: "Command: node scripts/calc-rangelst-native-probe.mjs --write; node scripts/calc-rangelst-native-probe.mjs --check Result: pass. Evidence: exact pinned Git blobs and full/source interval hashes; original class, numerical definition/helper intervals and address/range inline bodies unchanged; ASan/UBSan clean. Scope:13432 initialized operation sequences with17391 native snapshots, including joins, partial combining, deletion fragments, insertion overloads, cache-sensitive follow-ups, ownership/copy/swap, queries and unsigned64 modular counts. Portable tests compare every public output and retain original numerical ucalc_rangelst examples. Command: npm run test:coverage:calc Result: pass. Evidence:40 tests across9 files; statements860/860,branches712/712,functions184/184,lines762/762,all100%; no coverage exclusions or configuration changes. Scope: all current Calc core owners and prior acceptance. Four redundant guard paths are expressed from original preceding finite-integer predicates with proof comments; original C++ probe bodies remain unchanged. No defined native output or public owner boundary changes. Command: npm run typecheck; node_modules/.bin/eslint apps/office/src/sc/inc/address.ts apps/office/src/sc/inc/rangelst.ts apps/office/src/sc/source/core/tool/rangelst.ts apps/office/src/sc/source/core/tool/rangelst.test.ts scripts/calc-rangelst-native-probe.mjs; node_modules/.bin/prettier --check apps/office/src/sc/inc/address.ts apps/office/src/sc/inc/rangelst.ts apps/office/src/sc/source/core/tool/rangelst.ts apps/office/src/sc/source/core/tool/rangelst.test.ts scripts/calc-rangelst-native-probe.mjs Result: pass. Evidence: no type/lint diagnostics; all matched files formatted. Final corrections use the native at valid-index boundary, with no fabricated fallback values or disabled enforcement. Scope: complete application/tool static types and affected source/tests/probe. Command: npm run check:dependencies; npm run check:docs; npm run check:file-size; npm run check:source-tree Result: pass. Evidence:328 runtime sources,1562 relative imports,29 allowed cross-module edges;1078 documented sources;1081 authored files checked, rangelst grouping reviewed;114 required paths and33 retired roots. Scope: static module, documentation, size and tree guards. Existing shared/Writer implementation, previous test bodies/native fixtures and all prior capability flags are unchanged. Command: node_modules/.bin/tsx scripts/libreoffice-inventory/registry-cli.ts check --scope calc Result: pass. Evidence:7 capabilities,120 applicable modules (8 Calc and112 shared),0 semantic violations. Actual100 local coverage does not promote parity statuses. Scope: new range-list capability/header/tool provenance/runtime and existing address SCSIZE mapping; full document/compiler/lifetime/pointer-width/undefined domains remain unverified. Command: node .agentplane/policy/check-routing.mjs; ap doctor; git diff --check Result: pass. Evidence: routing OK; doctor0 errors,1 pre-existing managed hook readiness warning; no whitespace errors. Scope: task policy and reviewed diff. Final clean tracked/untracked state on calc is required after closure. Full suite cadence: Calc milestone7 of10. Full test suites run after milestone10 under the user instruction; affected/shared tests are required when shared implementations change, which this task does not do."
doc_version: 3
doc_updated_at: "2026-10-09T08:54:04.627Z"
doc_updated_by: "CODER"
description: "Implement ScRangeList value ownership, joining, partial combining, insertion, area deletion and numerical queries at original rangelst boundaries; compare unchanged native implementations and preserve existing Calc/shared evidence."
sections:
  Summary: "Port the original numerical ScRangeList owner and edit geometry, reusing established address/range values."
  Scope: "New sc/inc/rangelst.ts re-export and sc/source/core/tool/rangelst.ts owner, numerical acceptance tests and native fixture, scripts/calc-rangelst-native-probe.mjs, Calc capability/runtime/provenance records, calc-core docs. Add original SCSIZE type at existing sc/inc/address.ts and update its runtime/provenance mapping. No shared/Writer implementation changes, no merges. Calc milestone7; full suite after10."
  Plan: "Implement native numerical list default/copy/assignment, stable owned range values, sequence access/iteration/insertion/swap, Join restart and row cache semantics, AddAndPartialCombine, all InsertRow/InsertCol overloads and original one/two/three/four-fragment DeleteArea helpers, Find/Contains/Intersects/Combine/GetTopLeftCorner/GetIntersectedRange, unsigned64 cell counting. Reuse existing ScAddress/ScRange; preserve original algorithm order, predicates and surprising boundary results. Keep absent document-dependent Parse/Format/UpdateReference and ScRangePairList explicit in inventory; do not fabricate document/compiler owners. Compile unchanged pinned numerical definitions/helper bodies and original numerical range/address bodies under ASan/UBSan; record differential fixtures with full/source-body hashes and original unit examples. Retain all previous test bodies/fixtures/status flags. Validate scoped Calc actual100 coverage, affected/static/inventory guards, review size grouping, record review and close with actual implementation commit. Authorized core progression under user goal."
  Verify Steps: "Run node scripts/calc-rangelst-native-probe.mjs --write then --check requiring exact pinned blobs and ASan/UBSan-clean bounded numeric states; compare all portable TS outcomes and retained upstream numeric unit examples. Run npm run test:coverage:calc actual100 for statements/branches/functions/lines, npm run typecheck, check:dependencies, check:docs, check:file-size, check:source-tree, affected ESLint/Prettier. Calc registry check0 semantic violations; previous fixtures/tests/status flags/shared source unchanged. Review original grouping if file exceeds500 lines; hard1000 limit. Routing, ap doctor, diff check and final clean branch calc. Full suite scheduled atCalc10."
  Verification: |-
    Pending implementation and original numerical differential acceptance.

    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-10-09T08:54:04.572Z — VERIFY — ok

    By: CODER

    Note: Command: node scripts/calc-rangelst-native-probe.mjs --write; node scripts/calc-rangelst-native-probe.mjs --check Result: pass. Evidence: exact pinned Git blobs and full/source interval hashes; original class, numerical definition/helper intervals and address/range inline bodies unchanged; ASan/UBSan clean. Scope:13432 initialized operation sequences with17391 native snapshots, including joins, partial combining, deletion fragments, insertion overloads, cache-sensitive follow-ups, ownership/copy/swap, queries and unsigned64 modular counts. Portable tests compare every public output and retain original numerical ucalc_rangelst examples. Command: npm run test:coverage:calc Result: pass. Evidence:40 tests across9 files; statements860/860,branches712/712,functions184/184,lines762/762,all100%; no coverage exclusions or configuration changes. Scope: all current Calc core owners and prior acceptance. Four redundant guard paths are expressed from original preceding finite-integer predicates with proof comments; original C++ probe bodies remain unchanged. No defined native output or public owner boundary changes. Command: npm run typecheck; node_modules/.bin/eslint apps/office/src/sc/inc/address.ts apps/office/src/sc/inc/rangelst.ts apps/office/src/sc/source/core/tool/rangelst.ts apps/office/src/sc/source/core/tool/rangelst.test.ts scripts/calc-rangelst-native-probe.mjs; node_modules/.bin/prettier --check apps/office/src/sc/inc/address.ts apps/office/src/sc/inc/rangelst.ts apps/office/src/sc/source/core/tool/rangelst.ts apps/office/src/sc/source/core/tool/rangelst.test.ts scripts/calc-rangelst-native-probe.mjs Result: pass. Evidence: no type/lint diagnostics; all matched files formatted. Final corrections use the native at valid-index boundary, with no fabricated fallback values or disabled enforcement. Scope: complete application/tool static types and affected source/tests/probe. Command: npm run check:dependencies; npm run check:docs; npm run check:file-size; npm run check:source-tree Result: pass. Evidence:328 runtime sources,1562 relative imports,29 allowed cross-module edges;1078 documented sources;1081 authored files checked, rangelst grouping reviewed;114 required paths and33 retired roots. Scope: static module, documentation, size and tree guards. Existing shared/Writer implementation, previous test bodies/native fixtures and all prior capability flags are unchanged. Command: node_modules/.bin/tsx scripts/libreoffice-inventory/registry-cli.ts check --scope calc Result: pass. Evidence:7 capabilities,120 applicable modules (8 Calc and112 shared),0 semantic violations. Actual100 local coverage does not promote parity statuses. Scope: new range-list capability/header/tool provenance/runtime and existing address SCSIZE mapping; full document/compiler/lifetime/pointer-width/undefined domains remain unverified. Command: node .agentplane/policy/check-routing.mjs; ap doctor; git diff --check Result: pass. Evidence: routing OK; doctor0 errors,1 pre-existing managed hook readiness warning; no whitespace errors. Scope: task policy and reviewed diff. Final clean tracked/untracked state on calc is required after closure. Full suite cadence: Calc milestone7 of10. Full test suites run after milestone10 under the user instruction; affected/shared tests are required when shared implementations change, which this task does not do.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-09T08:54:04.005Z, excerpt_hash=sha256:b56627aefd6c3938fc925661e5ed0c721c6360bfd4ef0b80f32262fde7bc528a

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202610090833-ERVAK2/blueprint/resolved-snapshot.json
    - old_digest: 9a7c0c7172edd29655ba86e0b6f571583640587e2748ef3155e8cdf543d6c856
    - current_digest: 9a7c0c7172edd29655ba86e0b6f571583640587e2748ef3155e8cdf543d6c856
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202610090833-ERVAK2

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202610090833-ERVAK2
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: false
    - repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert only this implementation commit, preserving previous initialized formula reference owners and native evidence."
  Findings: |-
    Native row cache is monotone except RemoveAll and explicit copy/swap; direct insert and Remove do not recompute it. Join uses original restart and input ownership semantics rather than arbitrary union geometry. Insert predicates use logical OR; deletion first removes fully contained ranges then handles fragments in original order. handleOneRange top trimming uses deleting start row plus1; preserve original result. DeleteArea assumes equal deleting sheet endpoints; native existing multitab behavior is retained without invented3D subtraction.

    - Observation: Initial native probe failed before compilation: PutInOrder extraction end marker precedes the helper in the original header.
      Impact: No fixture or application evidence was produced by this attempt; scope and verification criteria are unchanged.
      Resolution: Locate the exact following marker and retain the complete original helper interval; rerun native acceptance.

    - Observation: Initial portable acceptance matches every native output and all40 tests pass, but coverage has6 uncovered branches and2 statements; typecheck flags native valid-index vector accesses under noUncheckedIndexedAccess.
      Impact: Actual100 coverage and static typing are not yet satisfied; native sequence evidence passes without sanitizer errors.
      Resolution: Inspect coverage locations, add missing native input transitions and use explicit native valid-index assertions at vector access boundaries without introducing new guards or changing preconditions.

    - Observation: Coverage identifies four logically unreachable numeric paths: one-fragment trailing conditions follow a predicate guaranteeing them; encountered Join source index is strictly below the current scan index; intersection with containment/edge fragments excluded guarantees an interior four-fragment split.
      Impact: Literal redundant C++ guards cannot produce false outcomes for the finite native integer values; fabricated NaN tests or coverage exclusions would not provide valid evidence.
      Resolution: Express those implications directly in TS with local proof comments, retain original owner boundaries, helper order, boolean handler contract and every defined output. Exhaustive8-axis0..3 relation search found no four-fragment fallthrough. Add a duplicate owned-range native sequence for the remaining reachable Join branch; require unchanged original C++ bodies and actual100 coverage.

    - Observation: Final native comparison and all40 tests reach actual100 coverage; typecheck finds the now-unused cached first row in the interior-only fourth fragment handler.
      Impact: Runtime outputs and all coverage metrics pass; one noUnusedLocals diagnostic remains.
      Resolution: Omit the unused destructured slot, retaining the same cached coordinates and fragment values; rerun static checks.

    - Observation: Typecheck now passes; affected ESLint rejects non-null assertions used for native vector valid-index preconditions.
      Impact: No native or portable result mismatch; repository static guard remains unsatisfied.
      Resolution: Use the existing public at operator boundary with an explicit ScRange type representation for valid native indices, and reuse it within checked loops. Preserve native unchecked access preconditions; do not disable lint or add fabricated fallback values.

    - Observation: Module boundary and Calc registry checks pass; JSDoc guard identifies the new root describe callback lacking its documentation.
      Impact: Static documentation gate is incomplete; numerical acceptance remains passing at actual100.
      Resolution: Document the test group callback and rerun declared documentation, size and source-tree guards.

    - Observation: Final scoped validation passes; rangelst.ts is a541-line decomposition review candidate including final empty line, with40 tests and all13432 native sequences matching.
      Impact: Original range-list/anonymous fragment helper grouping exceeds the soft500 review threshold but remains below hard1000. Full ScDocument/compiler work and native lifetime/pointer-width inputs remain unverified.
      Resolution: Retain the coherent upstream rangelst grouping and record bounded proof in capability/runtime/provenance. Exact unsigned64 count accumulation uses bigint; unchanged shared/Writer paths and prior fixtures/tests/status flags are verified. doctor0 errors and1 pre-existing managed-hook readiness warning; full suite remains due after Calc10.
id_source: "generated"
---
## Summary

Port the original numerical ScRangeList owner and edit geometry, reusing established address/range values.

## Scope

New sc/inc/rangelst.ts re-export and sc/source/core/tool/rangelst.ts owner, numerical acceptance tests and native fixture, scripts/calc-rangelst-native-probe.mjs, Calc capability/runtime/provenance records, calc-core docs. Add original SCSIZE type at existing sc/inc/address.ts and update its runtime/provenance mapping. No shared/Writer implementation changes, no merges. Calc milestone7; full suite after10.

## Plan

Implement native numerical list default/copy/assignment, stable owned range values, sequence access/iteration/insertion/swap, Join restart and row cache semantics, AddAndPartialCombine, all InsertRow/InsertCol overloads and original one/two/three/four-fragment DeleteArea helpers, Find/Contains/Intersects/Combine/GetTopLeftCorner/GetIntersectedRange, unsigned64 cell counting. Reuse existing ScAddress/ScRange; preserve original algorithm order, predicates and surprising boundary results. Keep absent document-dependent Parse/Format/UpdateReference and ScRangePairList explicit in inventory; do not fabricate document/compiler owners. Compile unchanged pinned numerical definitions/helper bodies and original numerical range/address bodies under ASan/UBSan; record differential fixtures with full/source-body hashes and original unit examples. Retain all previous test bodies/fixtures/status flags. Validate scoped Calc actual100 coverage, affected/static/inventory guards, review size grouping, record review and close with actual implementation commit. Authorized core progression under user goal.

## Verify Steps

Run node scripts/calc-rangelst-native-probe.mjs --write then --check requiring exact pinned blobs and ASan/UBSan-clean bounded numeric states; compare all portable TS outcomes and retained upstream numeric unit examples. Run npm run test:coverage:calc actual100 for statements/branches/functions/lines, npm run typecheck, check:dependencies, check:docs, check:file-size, check:source-tree, affected ESLint/Prettier. Calc registry check0 semantic violations; previous fixtures/tests/status flags/shared source unchanged. Review original grouping if file exceeds500 lines; hard1000 limit. Routing, ap doctor, diff check and final clean branch calc. Full suite scheduled atCalc10.

## Verification

Pending implementation and original numerical differential acceptance.

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-10-09T08:54:04.572Z — VERIFY — ok

By: CODER

Note: Command: node scripts/calc-rangelst-native-probe.mjs --write; node scripts/calc-rangelst-native-probe.mjs --check Result: pass. Evidence: exact pinned Git blobs and full/source interval hashes; original class, numerical definition/helper intervals and address/range inline bodies unchanged; ASan/UBSan clean. Scope:13432 initialized operation sequences with17391 native snapshots, including joins, partial combining, deletion fragments, insertion overloads, cache-sensitive follow-ups, ownership/copy/swap, queries and unsigned64 modular counts. Portable tests compare every public output and retain original numerical ucalc_rangelst examples. Command: npm run test:coverage:calc Result: pass. Evidence:40 tests across9 files; statements860/860,branches712/712,functions184/184,lines762/762,all100%; no coverage exclusions or configuration changes. Scope: all current Calc core owners and prior acceptance. Four redundant guard paths are expressed from original preceding finite-integer predicates with proof comments; original C++ probe bodies remain unchanged. No defined native output or public owner boundary changes. Command: npm run typecheck; node_modules/.bin/eslint apps/office/src/sc/inc/address.ts apps/office/src/sc/inc/rangelst.ts apps/office/src/sc/source/core/tool/rangelst.ts apps/office/src/sc/source/core/tool/rangelst.test.ts scripts/calc-rangelst-native-probe.mjs; node_modules/.bin/prettier --check apps/office/src/sc/inc/address.ts apps/office/src/sc/inc/rangelst.ts apps/office/src/sc/source/core/tool/rangelst.ts apps/office/src/sc/source/core/tool/rangelst.test.ts scripts/calc-rangelst-native-probe.mjs Result: pass. Evidence: no type/lint diagnostics; all matched files formatted. Final corrections use the native at valid-index boundary, with no fabricated fallback values or disabled enforcement. Scope: complete application/tool static types and affected source/tests/probe. Command: npm run check:dependencies; npm run check:docs; npm run check:file-size; npm run check:source-tree Result: pass. Evidence:328 runtime sources,1562 relative imports,29 allowed cross-module edges;1078 documented sources;1081 authored files checked, rangelst grouping reviewed;114 required paths and33 retired roots. Scope: static module, documentation, size and tree guards. Existing shared/Writer implementation, previous test bodies/native fixtures and all prior capability flags are unchanged. Command: node_modules/.bin/tsx scripts/libreoffice-inventory/registry-cli.ts check --scope calc Result: pass. Evidence:7 capabilities,120 applicable modules (8 Calc and112 shared),0 semantic violations. Actual100 local coverage does not promote parity statuses. Scope: new range-list capability/header/tool provenance/runtime and existing address SCSIZE mapping; full document/compiler/lifetime/pointer-width/undefined domains remain unverified. Command: node .agentplane/policy/check-routing.mjs; ap doctor; git diff --check Result: pass. Evidence: routing OK; doctor0 errors,1 pre-existing managed hook readiness warning; no whitespace errors. Scope: task policy and reviewed diff. Final clean tracked/untracked state on calc is required after closure. Full suite cadence: Calc milestone7 of10. Full test suites run after milestone10 under the user instruction; affected/shared tests are required when shared implementations change, which this task does not do.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-09T08:54:04.005Z, excerpt_hash=sha256:b56627aefd6c3938fc925661e5ed0c721c6360bfd4ef0b80f32262fde7bc528a

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202610090833-ERVAK2/blueprint/resolved-snapshot.json
- old_digest: 9a7c0c7172edd29655ba86e0b6f571583640587e2748ef3155e8cdf543d6c856
- current_digest: 9a7c0c7172edd29655ba86e0b6f571583640587e2748ef3155e8cdf543d6c856
- route_changed: no
- safe_command: agentplane blueprint snapshot 202610090833-ERVAK2

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202610090833-ERVAK2
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: false
- repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert only this implementation commit, preserving previous initialized formula reference owners and native evidence.

## Findings

Native row cache is monotone except RemoveAll and explicit copy/swap; direct insert and Remove do not recompute it. Join uses original restart and input ownership semantics rather than arbitrary union geometry. Insert predicates use logical OR; deletion first removes fully contained ranges then handles fragments in original order. handleOneRange top trimming uses deleting start row plus1; preserve original result. DeleteArea assumes equal deleting sheet endpoints; native existing multitab behavior is retained without invented3D subtraction.

- Observation: Initial native probe failed before compilation: PutInOrder extraction end marker precedes the helper in the original header.
  Impact: No fixture or application evidence was produced by this attempt; scope and verification criteria are unchanged.
  Resolution: Locate the exact following marker and retain the complete original helper interval; rerun native acceptance.

- Observation: Initial portable acceptance matches every native output and all40 tests pass, but coverage has6 uncovered branches and2 statements; typecheck flags native valid-index vector accesses under noUncheckedIndexedAccess.
  Impact: Actual100 coverage and static typing are not yet satisfied; native sequence evidence passes without sanitizer errors.
  Resolution: Inspect coverage locations, add missing native input transitions and use explicit native valid-index assertions at vector access boundaries without introducing new guards or changing preconditions.

- Observation: Coverage identifies four logically unreachable numeric paths: one-fragment trailing conditions follow a predicate guaranteeing them; encountered Join source index is strictly below the current scan index; intersection with containment/edge fragments excluded guarantees an interior four-fragment split.
  Impact: Literal redundant C++ guards cannot produce false outcomes for the finite native integer values; fabricated NaN tests or coverage exclusions would not provide valid evidence.
  Resolution: Express those implications directly in TS with local proof comments, retain original owner boundaries, helper order, boolean handler contract and every defined output. Exhaustive8-axis0..3 relation search found no four-fragment fallthrough. Add a duplicate owned-range native sequence for the remaining reachable Join branch; require unchanged original C++ bodies and actual100 coverage.

- Observation: Final native comparison and all40 tests reach actual100 coverage; typecheck finds the now-unused cached first row in the interior-only fourth fragment handler.
  Impact: Runtime outputs and all coverage metrics pass; one noUnusedLocals diagnostic remains.
  Resolution: Omit the unused destructured slot, retaining the same cached coordinates and fragment values; rerun static checks.

- Observation: Typecheck now passes; affected ESLint rejects non-null assertions used for native vector valid-index preconditions.
  Impact: No native or portable result mismatch; repository static guard remains unsatisfied.
  Resolution: Use the existing public at operator boundary with an explicit ScRange type representation for valid native indices, and reuse it within checked loops. Preserve native unchecked access preconditions; do not disable lint or add fabricated fallback values.

- Observation: Module boundary and Calc registry checks pass; JSDoc guard identifies the new root describe callback lacking its documentation.
  Impact: Static documentation gate is incomplete; numerical acceptance remains passing at actual100.
  Resolution: Document the test group callback and rerun declared documentation, size and source-tree guards.

- Observation: Final scoped validation passes; rangelst.ts is a541-line decomposition review candidate including final empty line, with40 tests and all13432 native sequences matching.
  Impact: Original range-list/anonymous fragment helper grouping exceeds the soft500 review threshold but remains below hard1000. Full ScDocument/compiler work and native lifetime/pointer-width inputs remain unverified.
  Resolution: Retain the coherent upstream rangelst grouping and record bounded proof in capability/runtime/provenance. Exact unsigned64 count accumulation uses bigint; unchanged shared/Writer paths and prior fixtures/tests/status flags are verified. doctor0 errors and1 pre-existing managed-hook readiness warning; full suite remains due after Calc10.
