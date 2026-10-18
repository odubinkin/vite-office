---
id: "202610181638-N4JV15"
title: "Implement Calc native A1 formula input and output"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 7
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify:
  - "npm run test:coverage:calc"
  - "npm run typecheck --workspace @vite-office/office"
plan_approval:
  state: "approved"
  updated_at: "2026-10-18T16:39:05.933Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-10-18T16:43:23.659Z"
  updated_by: "CODER"
  note: "PASS: Calc 89 files/239 tests, coverage 5461 statements/3514 branches/1095 functions/4897 lines, all 100%. Focused shared FormulaCompiler + native-token + Calc tests 100% (153 statements/104 branches/19 functions/139 lines). Typecheck, touched ESLint/Prettier, dependency boundaries, docs, source-tree/provenance, Calc parity, file sizes, doctor and policy routing passed. Logs output/calc-native-a1-*.log; no full regression per approved once-per-ten-task cadence."
  attempts: 0
commit: null
comments:
  -
    author: "CODER"
    body: "Start: Implement approved native A1 Calc formula input and serialization on the existing document and token owners, then verify Calc and touched shared serializer."
events:
  -
    type: "status"
    at: "2026-10-18T16:39:11.414Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: Implement approved native A1 Calc formula input and serialization on the existing document and token owners, then verify Calc and touched shared serializer."
  -
    type: "verify"
    at: "2026-10-18T16:43:23.659Z"
    author: "CODER"
    state: "ok"
    note: "PASS: Calc 89 files/239 tests, coverage 5461 statements/3514 branches/1095 functions/4897 lines, all 100%. Focused shared FormulaCompiler + native-token + Calc tests 100% (153 statements/104 branches/19 functions/139 lines). Typecheck, touched ESLint/Prettier, dependency boundaries, docs, source-tree/provenance, Calc parity, file sizes, doctor and policy routing passed. Logs output/calc-native-a1-*.log; no full regression per approved once-per-ten-task cadence."
doc_version: 3
doc_updated_at: "2026-10-18T16:43:23.711Z"
doc_updated_by: "CODER"
description: "Approved Calc UI plan first core prerequisite: preserve existing token and document owners while adding upstream native A1 arithmetic/local-reference compilation and serialization alongside ODFF. All changes remain on calc in vite-office-calc; no merges. Follow with native cell entry, view/input owners, shared browser composition and ODS UI tasks."
sections:
  Summary: |-
    Implement Calc native A1 formula input and output

    Approved Calc UI plan first core prerequisite: preserve existing token and document owners while adding upstream native A1 arithmetic/local-reference compilation and serialization alongside ODFF. All changes remain on calc in vite-office-calc; no merges. Follow with native cell entry, view/input owners, shared browser composition and ODS UI tasks.
  Scope: |-
    - In scope: Approved Calc UI plan first core prerequisite: preserve existing token and document owners while adding upstream native A1 arithmetic/local-reference compilation and serialization alongside ODFF. All changes remain on calc in vite-office-calc; no merges. Follow with native cell entry, view/input owners, shared browser composition and ODS UI tasks.
    - Out of scope: unrelated refactors not required for "Implement Calc native A1 formula input and output".
  Plan: "Add source-backed native/English OOO A1 conventions to existing ScCompiler and shared scalar serializer, preserving actual reference token flags, dirty/listening state and ODFF import/export. Add bidirectional native/ODFF document tests and keep unsupported languages/conventions explicit. Changes limited to compiler owners, directly affected tests and required registry records. User approved complete Calc plan on 2026-10-18. Next leaves deliver cell entry, view/input UI and shared file handling. No merges or network."
  Verify Steps: "1. npm run test:coverage:calc: all Calc scenarios pass with 100% coverage. 2. npm run typecheck --workspace @vite-office/office. 3. Run focused shared FormulaCompiler tests and 100% coverage for the touched shared serializer. 4. Run formatting/lint for touched files and dependency, docs, file-size, source-tree/provenance and Calc parity checks as applicable. Native A1 mixed absolute references must round-trip through ODFF without changing tokens/listeners or values; unsupported conventions must reject. Full regression deferred under user-approved once-per-ten-task cadence (first task of new UI cycle)."
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-10-18T16:43:23.659Z — VERIFY — ok

    By: CODER

    Note: PASS: Calc 89 files/239 tests, coverage 5461 statements/3514 branches/1095 functions/4897 lines, all 100%. Focused shared FormulaCompiler + native-token + Calc tests 100% (153 statements/104 branches/19 functions/139 lines). Typecheck, touched ESLint/Prettier, dependency boundaries, docs, source-tree/provenance, Calc parity, file sizes, doctor and policy routing passed. Logs output/calc-native-a1-*.log; no full regression per approved once-per-ten-task cadence.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-18T16:43:23.178Z, excerpt_hash=sha256:60a2330c3d6b67b9c66c19ec68a83c2512cbdcb5c5a22edb61fc07f35e82db0b

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202610181638-N4JV15/blueprint/resolved-snapshot.json
    - old_digest: f4b1c06bf982a285c5b177e63fa929d04efca36d96c01d858932d8a264a0d0fb
    - current_digest: f4b1c06bf982a285c5b177e63fa929d04efca36d96c01d858932d8a264a0d0fb
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202610181638-N4JV15

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202610181638-N4JV15
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: false
    - repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: |-
    - Revert task-related commit(s).
    - Re-run required checks to confirm rollback safety.
  Findings: "Implemented native/English OOO A1 and ODFF_A1 compilation/output over existing document/token/listener owners. Source: pinned sc/source/core/tool/compiler.cxx ConventionOOO_A1 and MakeOneRefStrImpl. Native scalar arithmetic symbols coincide with existing ODFF symbols; localized numeric/function-symbol services remain unsupported, as do ranges/cross-sheet/names/functions. Existing ODF deleted-reference output is unchanged. Initial tests exposed stale grammar rejection and test expectations that ignored InitAddress resetting absolute flags; corrected acceptance from source, with no production workaround. First task of new UI ten-task regression cycle; previous task204 milestone had an all-app checkpoint. No full-suite run needed this task. Doctor passes with existing managed-hook warning; no policy/tooling changes. No new or modified file exceeds 500 lines."
id_source: "generated"
---
## Summary

Implement Calc native A1 formula input and output

Approved Calc UI plan first core prerequisite: preserve existing token and document owners while adding upstream native A1 arithmetic/local-reference compilation and serialization alongside ODFF. All changes remain on calc in vite-office-calc; no merges. Follow with native cell entry, view/input owners, shared browser composition and ODS UI tasks.

## Scope

- In scope: Approved Calc UI plan first core prerequisite: preserve existing token and document owners while adding upstream native A1 arithmetic/local-reference compilation and serialization alongside ODFF. All changes remain on calc in vite-office-calc; no merges. Follow with native cell entry, view/input owners, shared browser composition and ODS UI tasks.
- Out of scope: unrelated refactors not required for "Implement Calc native A1 formula input and output".

## Plan

Add source-backed native/English OOO A1 conventions to existing ScCompiler and shared scalar serializer, preserving actual reference token flags, dirty/listening state and ODFF import/export. Add bidirectional native/ODFF document tests and keep unsupported languages/conventions explicit. Changes limited to compiler owners, directly affected tests and required registry records. User approved complete Calc plan on 2026-10-18. Next leaves deliver cell entry, view/input UI and shared file handling. No merges or network.

## Verify Steps

1. npm run test:coverage:calc: all Calc scenarios pass with 100% coverage. 2. npm run typecheck --workspace @vite-office/office. 3. Run focused shared FormulaCompiler tests and 100% coverage for the touched shared serializer. 4. Run formatting/lint for touched files and dependency, docs, file-size, source-tree/provenance and Calc parity checks as applicable. Native A1 mixed absolute references must round-trip through ODFF without changing tokens/listeners or values; unsupported conventions must reject. Full regression deferred under user-approved once-per-ten-task cadence (first task of new UI cycle).

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-10-18T16:43:23.659Z — VERIFY — ok

By: CODER

Note: PASS: Calc 89 files/239 tests, coverage 5461 statements/3514 branches/1095 functions/4897 lines, all 100%. Focused shared FormulaCompiler + native-token + Calc tests 100% (153 statements/104 branches/19 functions/139 lines). Typecheck, touched ESLint/Prettier, dependency boundaries, docs, source-tree/provenance, Calc parity, file sizes, doctor and policy routing passed. Logs output/calc-native-a1-*.log; no full regression per approved once-per-ten-task cadence.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-18T16:43:23.178Z, excerpt_hash=sha256:60a2330c3d6b67b9c66c19ec68a83c2512cbdcb5c5a22edb61fc07f35e82db0b

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202610181638-N4JV15/blueprint/resolved-snapshot.json
- old_digest: f4b1c06bf982a285c5b177e63fa929d04efca36d96c01d858932d8a264a0d0fb
- current_digest: f4b1c06bf982a285c5b177e63fa929d04efca36d96c01d858932d8a264a0d0fb
- route_changed: no
- safe_command: agentplane blueprint snapshot 202610181638-N4JV15

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202610181638-N4JV15
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: false
- repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert task-related commit(s).
- Re-run required checks to confirm rollback safety.

## Findings

Implemented native/English OOO A1 and ODFF_A1 compilation/output over existing document/token/listener owners. Source: pinned sc/source/core/tool/compiler.cxx ConventionOOO_A1 and MakeOneRefStrImpl. Native scalar arithmetic symbols coincide with existing ODFF symbols; localized numeric/function-symbol services remain unsupported, as do ranges/cross-sheet/names/functions. Existing ODF deleted-reference output is unchanged. Initial tests exposed stale grammar rejection and test expectations that ignored InitAddress resetting absolute flags; corrected acceptance from source, with no production workaround. First task of new UI ten-task regression cycle; previous task204 milestone had an all-app checkpoint. No full-suite run needed this task. Doctor passes with existing managed-hook warning; no policy/tooling changes. No new or modified file exceeds 500 lines.
