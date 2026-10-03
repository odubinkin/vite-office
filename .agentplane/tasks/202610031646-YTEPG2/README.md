---
id: "202610031646-YTEPG2"
title: "Restore native protected number-tree helper contracts"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 14
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
task_kind: "code"
mutation_scope: "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-03T16:47:22.155Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-10-03T17:03:00.915Z"
  updated_by: "CODER"
  note: "Full npm run verify exit0: 798 application/109 inventory/20 browser tests and both100% gates; selected six protected contracts restored, baseline3trace/type failures corrected, vendor-absent92+9 tests pass and pin restored. Six semantic paths only,3body changes/52unchanged methods,216other old test files and old matcher values retained. Hashes and bounded logs only; no upstream test access/native execution/whole-module promotion."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-10-03T17:03:01.802Z"
  updated_by: "EVALUATOR"
  note: "All selected native protected number-tree helper access, arity, null-pointer and source policy/transfer dispatch contracts are restored with direct baseline failures, owned post-fix evidence and passing full verification."
  evaluated_sha: "224bce74a50b7812485e7bfeab9c45ff85870711"
  blueprint_digest: "92e083450f0fb490d6c135f3e076e65d4eef1dc0013e7a4bfd335c5198377084"
  evidence_refs:
    - ".agentplane/tasks/202610031646-YTEPG2/README.md"
    - ".agentplane/tasks/202610031646-YTEPG2/quality/20261003-170301802-recovery-context/quality-report.json"
    - ".agentplane/tasks/202610031646-YTEPG2/quality/20261003-170301802-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202610031646-YTEPG2/quality/20261003-170301802-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202610031646-YTEPG2/blueprint/resolved-snapshot.json"
    - ".agentplane/tasks/202610031646-YTEPG2/native-helper-inspection.json"
    - ".agentplane/tasks/202610031646-YTEPG2/verification-results.json"
    - ".agentplane/tasks/202610031646-YTEPG2/offline-results.json"
    - ".agentplane/tasks/202610031646-YTEPG2/scope-integrity.json"
    - ".agentplane/tasks/202610031646-YTEPG2/implementation-integrity.json"
  findings:
    - "Fresh pinned two-file/ten-span hashes support protected access for all six helpers, required nullable validation/transfer pointers, count-before-empty dispatch, phantom-before-counted ancestry dispatch and factory/retained-tail transfer selection. No native compilation or copied source bodies."
    - "Six owned tests and inherited type checks directly cover contracts and valid domains; baseline three runtime trace failures and type mismatch become passes. Vendor-absent92numbering plus9boundary/resource tests pass with exact pin restored."
    - "Full verify exit0:798application,109inventory,20browser and2resource tests; application and inventory coverage remain100%. Six semantic paths only;3method bodies changed,52others and216oldtestfiles unchanged; two protected diagnostic adaptations preserve old matcher arguments. Other metadata rows, status/default/deviation fields and gates unchanged."
    - "Artifact source/helper/executable count is zero, source evidence is hashes/conclusions only and no project test reads or invokes upstream. Parent parity remains unverified; remaining notification/document-context, layout/redline/range/browser/native lifetime contracts are explicitly open."
commit: null
comments:
  -
    author: "CODER"
    body: "Start: restore selected native protected helper contracts and call order with owned evidence, preserving prior tests and registered IO deviations."
events:
  -
    type: "status"
    at: "2026-10-03T16:47:22.672Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: restore selected native protected helper contracts and call order with owned evidence, preserving prior tests and registered IO deviations."
  -
    type: "verify"
    at: "2026-10-03T17:03:00.915Z"
    author: "CODER"
    state: "ok"
    note: "Full npm run verify exit0: 798 application/109 inventory/20 browser tests and both100% gates; selected six protected contracts restored, baseline3trace/type failures corrected, vendor-absent92+9 tests pass and pin restored. Six semantic paths only,3body changes/52unchanged methods,216other old test files and old matcher values retained. Hashes and bounded logs only; no upstream test access/native execution/whole-module promotion."
doc_version: 3
doc_updated_at: "2026-10-03T17:03:00.970Z"
doc_updated_by: "CODER"
description: "Iteration62: restore protected access and required nullable pointer contracts for the six existing native number-tree validation/phantom/transfer helpers, source GetChildCount and phantom-parent dispatch order, and source destination selection in MoveChildren. Add owned type/trace/document tests without upstream access; adapt two existing tests to protected diagnostics preserving expected values. No IO/recovery/deviation or broad parity status changes."
sections:
  Summary: "Restore the complete selected native protected validation/phantom/child-transfer helper family. Six helpers currently expose different access, two required pointer arguments exclude native null, and phantom policy dispatch bypasses or reorders virtual calls."
  Scope: "Change only SwNumberTree.ts, add SwNumberTree-helper-contracts.test.ts, adapt protected diagnostic calls in SwNumberTree.test.ts and SwNumberTree-phantoms.test.ts while retaining matcher values, and append narrow evidence to the exact SwNumberTree metadata rows in source-provenance.json and runtime-inventory.json. Restore protected Validate, HasOnlyPhantoms, HasPhantomCountedParent, GetFirstNonPhantomChild, MoveChildren and MoveGreaterChildren; required nullable Validate/MoveChildren arguments; GetChildCount one-child then empty ordering; parent phantom-before-count branch; empty versus retained-tail MoveChildren selection. Do not introduce public compatibility wrappers or nonempty-null fallback behavior. Empty source MoveChildren(undefined) follows release-body pointer domain only; native DBG_UTIL sanity dereference is not certified. No recorded save/open/recovery deviation changes."
  Plan: "1. Capture fresh local pin/declaration/body hashes and owned baseline evidence without source/helper artifacts. 2. Restore the six protected helper contracts and source-shaped policy/transfer dispatch; add meaningful owned type/trace/document tests and diagnostic-only adaptation preserving old matcher values. 3. Append narrow row evidence, verify focused tests with vendor unavailable and restore pin, then run full verify and policy checks. 4. Commit only six semantic paths, evaluate exact semantic SHA and close leaf; record residual full parity obligations in the parent."
  Verify Steps: |-
    1. Fresh read/hash pinned SwNumberTree.hxx declarations and selected SwNumberTree.cxx bodies; retain hashes/conclusions only. Baseline owned new runtime traces and inherited type assertions fail for confirmed mismatches; final pass.
    2. New owned tests prove inherited protected arity/return types and public absence for all six methods, explicit-null validation dispatch and raw prefix/counters, real/phantom counted-parent ordering, GetChildCount/recursion ordering, and child-transfer valid-domain ownership/tail/factory behavior. Existing numbering tests and matcher arguments remain intact; all other old test files remain byte-identical.
    3. Focused numbering application tests and boundary/resource tests pass while vendor/libreoffice-reference is temporarily unavailable, restored in finally to the exact pin. No project test reads, compiles or invokes upstream. No helpers/generators or upstream source copies saved in Agentplane, including ignored scratch.
    4. npm run verify passes all current project format/lint/type/static/source/provenance/inventory/coverage/browser checks; both coverage gates remain 100%. Run policy routing and ap doctor, review exact semantic paths and final clean Git state. Record verification, evaluate exact semantic commit, finish leaf; do not promote whole module/parent/goal from selected helper evidence.
  Verification: |-
    Command: npm run verify. Result: pass, terminal exit 0. Evidence: 798 application tests/180 files,109 inventory tests/36 files,20 browser tests,2 resource tests; application coverage11043statements/8334branches/2952functions/10135lines and inventory1523/1080/384/1464 all100%. All format/lint/type/dependency/resource/static/docs/file-size/source-tree/provenance/invariant/parity gates pass;498 authored JSDoc files,214 provenance modules,zero semantic violations. Full stdout is bounded in full-verify.log with original SHA-256, totals/stages in verification-results.json. Baseline6 owned tests:3failed/3passed for exact call order; baseline types exit2 for protected access/required nullable/public exclusion; final6tests/types/lint exit0. Vendor-absent focused92numbering tests/22files plus9boundary/resource tests/2files pass, exact pin restored in finally. Source evidence: two files/ten manual spans, hashes only; no native execution/copies/helper files. Scope: six semantic paths,3selected method bodies changed,52other bodies and216other old test files unchanged; two diagnostic adaptations retain all matcher arguments. Only one metadata row per file changed and status/deviation fields unchanged. Policy routing exit0; doctor exit0,zeroerrors,two warnings (existing hook readiness and closed duplicate cleanup bookkeeping without own commit, canonical cleanup SHA recorded elsewhere),two info. Artifact source/helper/executable count zero. Empty-source nullable transfer is a release-body domain statement, not DBG_UTIL/null undefined-behavior/const/dtor certification; full parent parity stays open.

    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-10-03T17:03:00.915Z — VERIFY — ok

    By: CODER

    Note: Full npm run verify exit0: 798 application/109 inventory/20 browser tests and both100% gates; selected six protected contracts restored, baseline3trace/type failures corrected, vendor-absent92+9 tests pass and pin restored. Six semantic paths only,3body changes/52unchanged methods,216other old test files and old matcher values retained. Hashes and bounded logs only; no upstream test access/native execution/whole-module promotion.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-03T17:02:18.443Z, excerpt_hash=sha256:d9e17ced7a68d6d88bb938ca99c103b30ef0b7c755ddc58ce3ef038a73306573

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202610031646-YTEPG2/blueprint/resolved-snapshot.json
    - old_digest: 92e083450f0fb490d6c135f3e076e65d4eef1dc0013e7a4bfd335c5198377084
    - current_digest: 92e083450f0fb490d6c135f3e076e65d4eef1dc0013e7a4bfd335c5198377084
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202610031646-YTEPG2

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202610031646-YTEPG2
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: false
    - repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert the semantic task commit if the selected helper correction regresses valid-domain numbering. Keep all prior matcher values and public native contracts; do not restore helper-source artifact storage or introduce production compatibility bridges."
  Findings: |-
    Fresh source pin 9bc445578031fecf56086729d8e4940c77e14d65: sw/inc/SwNumberTree.hxx protected section starts at 338; selected declarations at 499,539,541,550,567,583. Native bodies at 284-293,305-311,316-360,362-407,693-706,715-738. Current local Validate/GetFirstNonPhantomChild/MoveChildren/MoveGreaterChildren/HasOnlyPhantoms are private and HasPhantomCountedParent is public. Native Validate and MoveChildren pointer parameters are required and nullable in release valid-domain paths. Existing local validation engines already accept explicit undefined. HasOnlyPhantoms bypasses GetChildCount and checks empty before one child; counted-parent policy checks parent IsCounted before its IsPhantom branch. All production helper consumers are internal; two existing tests need test-only protected diagnostic access. Previous goal turn made authoritative progress through complete artifact helper cleanup, with no product parity promotion.

    - Observation: Fresh full verification passes but completion remains limited to the selected six protected helpers. Native Notify is protected while local Notify remains public; native mutation/notification SwDoc references remain required while local document parameters are optional. These source API/context gaps are the next bounded audit candidate.
      Impact: No whole module/parent/goal completion is proven by helper tests. Doctor also flags the already-closed duplicate cleanup task missing its own commit field, despite canonical task tracing actual implementation; its route forbids further mutation.
      Resolution: Retain unverified statuses and existing deliberate IO/recovery deviations; record passing narrow helper evidence only. Review notification access/context separately and audit duplicate bookkeeping through an authorized route if needed, without changing this completed implementation scope.
id_source: "generated"
---
## Summary

Restore the complete selected native protected validation/phantom/child-transfer helper family. Six helpers currently expose different access, two required pointer arguments exclude native null, and phantom policy dispatch bypasses or reorders virtual calls.

## Scope

Change only SwNumberTree.ts, add SwNumberTree-helper-contracts.test.ts, adapt protected diagnostic calls in SwNumberTree.test.ts and SwNumberTree-phantoms.test.ts while retaining matcher values, and append narrow evidence to the exact SwNumberTree metadata rows in source-provenance.json and runtime-inventory.json. Restore protected Validate, HasOnlyPhantoms, HasPhantomCountedParent, GetFirstNonPhantomChild, MoveChildren and MoveGreaterChildren; required nullable Validate/MoveChildren arguments; GetChildCount one-child then empty ordering; parent phantom-before-count branch; empty versus retained-tail MoveChildren selection. Do not introduce public compatibility wrappers or nonempty-null fallback behavior. Empty source MoveChildren(undefined) follows release-body pointer domain only; native DBG_UTIL sanity dereference is not certified. No recorded save/open/recovery deviation changes.

## Plan

1. Capture fresh local pin/declaration/body hashes and owned baseline evidence without source/helper artifacts. 2. Restore the six protected helper contracts and source-shaped policy/transfer dispatch; add meaningful owned type/trace/document tests and diagnostic-only adaptation preserving old matcher values. 3. Append narrow row evidence, verify focused tests with vendor unavailable and restore pin, then run full verify and policy checks. 4. Commit only six semantic paths, evaluate exact semantic SHA and close leaf; record residual full parity obligations in the parent.

## Verify Steps

1. Fresh read/hash pinned SwNumberTree.hxx declarations and selected SwNumberTree.cxx bodies; retain hashes/conclusions only. Baseline owned new runtime traces and inherited type assertions fail for confirmed mismatches; final pass.
2. New owned tests prove inherited protected arity/return types and public absence for all six methods, explicit-null validation dispatch and raw prefix/counters, real/phantom counted-parent ordering, GetChildCount/recursion ordering, and child-transfer valid-domain ownership/tail/factory behavior. Existing numbering tests and matcher arguments remain intact; all other old test files remain byte-identical.
3. Focused numbering application tests and boundary/resource tests pass while vendor/libreoffice-reference is temporarily unavailable, restored in finally to the exact pin. No project test reads, compiles or invokes upstream. No helpers/generators or upstream source copies saved in Agentplane, including ignored scratch.
4. npm run verify passes all current project format/lint/type/static/source/provenance/inventory/coverage/browser checks; both coverage gates remain 100%. Run policy routing and ap doctor, review exact semantic paths and final clean Git state. Record verification, evaluate exact semantic commit, finish leaf; do not promote whole module/parent/goal from selected helper evidence.

## Verification

Command: npm run verify. Result: pass, terminal exit 0. Evidence: 798 application tests/180 files,109 inventory tests/36 files,20 browser tests,2 resource tests; application coverage11043statements/8334branches/2952functions/10135lines and inventory1523/1080/384/1464 all100%. All format/lint/type/dependency/resource/static/docs/file-size/source-tree/provenance/invariant/parity gates pass;498 authored JSDoc files,214 provenance modules,zero semantic violations. Full stdout is bounded in full-verify.log with original SHA-256, totals/stages in verification-results.json. Baseline6 owned tests:3failed/3passed for exact call order; baseline types exit2 for protected access/required nullable/public exclusion; final6tests/types/lint exit0. Vendor-absent focused92numbering tests/22files plus9boundary/resource tests/2files pass, exact pin restored in finally. Source evidence: two files/ten manual spans, hashes only; no native execution/copies/helper files. Scope: six semantic paths,3selected method bodies changed,52other bodies and216other old test files unchanged; two diagnostic adaptations retain all matcher arguments. Only one metadata row per file changed and status/deviation fields unchanged. Policy routing exit0; doctor exit0,zeroerrors,two warnings (existing hook readiness and closed duplicate cleanup bookkeeping without own commit, canonical cleanup SHA recorded elsewhere),two info. Artifact source/helper/executable count zero. Empty-source nullable transfer is a release-body domain statement, not DBG_UTIL/null undefined-behavior/const/dtor certification; full parent parity stays open.

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-10-03T17:03:00.915Z — VERIFY — ok

By: CODER

Note: Full npm run verify exit0: 798 application/109 inventory/20 browser tests and both100% gates; selected six protected contracts restored, baseline3trace/type failures corrected, vendor-absent92+9 tests pass and pin restored. Six semantic paths only,3body changes/52unchanged methods,216other old test files and old matcher values retained. Hashes and bounded logs only; no upstream test access/native execution/whole-module promotion.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-03T17:02:18.443Z, excerpt_hash=sha256:d9e17ced7a68d6d88bb938ca99c103b30ef0b7c755ddc58ce3ef038a73306573

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202610031646-YTEPG2/blueprint/resolved-snapshot.json
- old_digest: 92e083450f0fb490d6c135f3e076e65d4eef1dc0013e7a4bfd335c5198377084
- current_digest: 92e083450f0fb490d6c135f3e076e65d4eef1dc0013e7a4bfd335c5198377084
- route_changed: no
- safe_command: agentplane blueprint snapshot 202610031646-YTEPG2

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202610031646-YTEPG2
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: false
- repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert the semantic task commit if the selected helper correction regresses valid-domain numbering. Keep all prior matcher values and public native contracts; do not restore helper-source artifact storage or introduce production compatibility bridges.

## Findings

Fresh source pin 9bc445578031fecf56086729d8e4940c77e14d65: sw/inc/SwNumberTree.hxx protected section starts at 338; selected declarations at 499,539,541,550,567,583. Native bodies at 284-293,305-311,316-360,362-407,693-706,715-738. Current local Validate/GetFirstNonPhantomChild/MoveChildren/MoveGreaterChildren/HasOnlyPhantoms are private and HasPhantomCountedParent is public. Native Validate and MoveChildren pointer parameters are required and nullable in release valid-domain paths. Existing local validation engines already accept explicit undefined. HasOnlyPhantoms bypasses GetChildCount and checks empty before one child; counted-parent policy checks parent IsCounted before its IsPhantom branch. All production helper consumers are internal; two existing tests need test-only protected diagnostic access. Previous goal turn made authoritative progress through complete artifact helper cleanup, with no product parity promotion.

- Observation: Fresh full verification passes but completion remains limited to the selected six protected helpers. Native Notify is protected while local Notify remains public; native mutation/notification SwDoc references remain required while local document parameters are optional. These source API/context gaps are the next bounded audit candidate.
  Impact: No whole module/parent/goal completion is proven by helper tests. Doctor also flags the already-closed duplicate cleanup task missing its own commit field, despite canonical task tracing actual implementation; its route forbids further mutation.
  Resolution: Retain unverified statuses and existing deliberate IO/recovery deviations; record passing narrow helper evidence only. Review notification access/context separately and audit duplicate bookkeeping through an authorized route if needed, without changing this completed implementation scope.
