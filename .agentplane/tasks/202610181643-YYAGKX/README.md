---
id: "202610181643-YYAGKX"
title: "Implement Calc source simple-number input scanner"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 8
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
  updated_at: "2026-10-18T16:44:27.680Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-10-18T16:49:13.827Z"
  updated_by: "CODER"
  note: "PASS: Calc 90 files/241 tests; 5527 statements,3581 branches,1096 functions,4948 lines all100 percent on final const-object implementation. Related shared RTL and scanner5 tests pass. Typecheck,touched ESLint and Prettier,dependency boundaries,docs,source-tree,source-provenance,Calc parity,file-size,doctor and policy routing pass. Evidence in task evidence directory. Full all-app run deferred per user cadence (UI task2/10)."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-10-18T16:49:15.476Z"
  updated_by: "EVALUATOR"
  note: "Unicode simple-number scanner matches pinned source control flow and consumes actual shared RTL conversion."
  evaluated_sha: "0ee0fdaea19aa416a0349840cf20d195586a01c2"
  blueprint_digest: "332adf35be2fe8a645cc3f5e1d3ab321380164403bbad8d6ddce9754729bdf81"
  evidence_refs:
    - ".agentplane/tasks/202610181643-YYAGKX/README.md"
    - ".agentplane/tasks/202610181643-YYAGKX/quality/20261018-164915476-recovery-context/quality-report.json"
    - ".agentplane/tasks/202610181643-YYAGKX/quality/20261018-164915476-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202610181643-YYAGKX/quality/20261018-164915476-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202610181643-YYAGKX/blueprint/resolved-snapshot.json"
    - ".agentplane/tasks/202610181643-YYAGKX/evidence/calc-coverage.log"
    - ".agentplane/tasks/202610181643-YYAGKX/evidence/related-rtl.log"
    - ".agentplane/tasks/202610181643-YYAGKX/evidence/parity.log"
  findings:
    - "All16 original testCSV numeric cases pass; boundary evidence covers native grouping,alternate decimals,spaces/NBSP,scientific flag,sign ordering,overflow/underflow and output-reference behavior. Final Calc coverage100 percent across90files/241tests. Typecheck,lint,format,provenance and scoped parity gates pass. No weakened thresholds or fake formatter."
commit: null
comments:
  -
    author: "CODER"
    body: "Start: Port pinned Unicode simple-number scanner with original grouping, decimal and scientific semantics, then verify all Calc coverage and related RTL behavior."
events:
  -
    type: "status"
    at: "2026-10-18T16:44:41.305Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: Port pinned Unicode simple-number scanner with original grouping, decimal and scientific semantics, then verify all Calc coverage and related RTL behavior."
  -
    type: "verify"
    at: "2026-10-18T16:49:13.827Z"
    author: "CODER"
    state: "ok"
    note: "PASS: Calc 90 files/241 tests; 5527 statements,3581 branches,1096 functions,4948 lines all100 percent on final const-object implementation. Related shared RTL and scanner5 tests pass. Typecheck,touched ESLint and Prettier,dependency boundaries,docs,source-tree,source-provenance,Calc parity,file-size,doctor and policy routing pass. Evidence in task evidence directory. Full all-app run deferred per user cadence (UI task2/10)."
doc_version: 3
doc_updated_at: "2026-10-18T16:49:13.880Z"
doc_updated_by: "CODER"
description: "Approved UI core prerequisite: port the Unicode ScStringUtil::parseSimpleNumber operation exactly from pinned sc/source/core/tool/stringutil.cxx, reusing existing RTL Unicode binary64 parsing and preserving decimal/group/alternative separators, scientific switch, trimming, grouping validation and output-reference semantics. No fake number formatter or browser parsing shortcut. This scanner feeds the upcoming native cell-entry path. Add exhaustive source cases and 100 percent Calc coverage, registry provenance and runtime records. Second task in Calc UI ten-task full-regression cycle."
sections:
  Summary: |-
    Implement Calc source simple-number input scanner

    Approved UI core prerequisite: port the Unicode ScStringUtil::parseSimpleNumber operation exactly from pinned sc/source/core/tool/stringutil.cxx, reusing existing RTL Unicode binary64 parsing and preserving decimal/group/alternative separators, scientific switch, trimming, grouping validation and output-reference semantics. No fake number formatter or browser parsing shortcut. This scanner feeds the upcoming native cell-entry path. Add exhaustive source cases and 100 percent Calc coverage, registry provenance and runtime records. Second task in Calc UI ten-task full-regression cycle.
  Scope: |-
    - In scope: Approved UI core prerequisite: port the Unicode ScStringUtil::parseSimpleNumber operation exactly from pinned sc/source/core/tool/stringutil.cxx, reusing existing RTL Unicode binary64 parsing and preserving decimal/group/alternative separators, scientific switch, trimming, grouping validation and output-reference semantics. No fake number formatter or browser parsing shortcut. This scanner feeds the upcoming native cell-entry path. Add exhaustive source cases and 100 percent Calc coverage, registry provenance and runtime records. Second task in Calc UI ten-task full-regression cycle.
    - Out of scope: unrelated refactors not required for "Implement Calc source simple-number input scanner".
  Plan: "Port exact Unicode ScStringUtil::parseSimpleNumber scanner into sc/source/core/tool/stringutil.ts and original sc/inc/stringutil.ts boundary. Reuse rtl_math_uStringToDouble and output reference. Cover native simple-number corpus and separator/exponent/grouping/error boundaries at 100 percent. Register runtime, provenance and operation/capability evidence using existing schemas. No generic formatter facade or native allocator. Approved core-first UI plan; UI cycle task2/10. Bound scope to these owners, tests and their registry records."
  Verify Steps: "1. npm run test:coverage:calc: all Calc tests and 100 percent statements, branches, functions and lines including the new scanner. 2. npm run typecheck --workspace @vite-office/office. 3. Touched ESLint and Prettier; dependency, documentation, file-size, source-tree and source-provenance gates. 4. npm run inventory:parity:calc. 5. Inspect pinned sc/qa/unit/ucalc.cxx simple number tests and sc/source/core/tool/stringutil.cxx for literal behavior; scientific disabled, sign-only, malformed grouping, NBSP, alternate decimal, RTL overflow and parse-end behavior must preserve source results. Full all-app run deferred under approved once-per-ten cadence."
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-10-18T16:49:13.827Z — VERIFY — ok

    By: CODER

    Note: PASS: Calc 90 files/241 tests; 5527 statements,3581 branches,1096 functions,4948 lines all100 percent on final const-object implementation. Related shared RTL and scanner5 tests pass. Typecheck,touched ESLint and Prettier,dependency boundaries,docs,source-tree,source-provenance,Calc parity,file-size,doctor and policy routing pass. Evidence in task evidence directory. Full all-app run deferred per user cadence (UI task2/10).
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-18T16:49:13.221Z, excerpt_hash=sha256:0878be78a6497e1a4a4a72904186bad3d1927e40e84422a80358ea07d5b12873

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202610181643-YYAGKX/blueprint/resolved-snapshot.json
    - old_digest: 332adf35be2fe8a645cc3f5e1d3ab321380164403bbad8d6ddce9754729bdf81
    - current_digest: 332adf35be2fe8a645cc3f5e1d3ab321380164403bbad8d6ddce9754729bdf81
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202610181643-YYAGKX

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane commit 202610181643-YYAGKX -m 🧩 YYAGKX task: persist canonical task artifacts --allow-tasks
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: true
    - repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: |-
    - Revert task-related commit(s).
    - Re-run required checks to confirm rollback safety.
  Findings: "Implemented original Unicode ScStringUtil::parseSimpleNumber only. All 16 original testCSV numeric cases and source-derived boundary cases pass. Native prechecks preserve output; RTL failure assigns output. Initial underflow acceptance expectation was corrected: actual shared RTL returns OutOfRange for 1e-999, so source scanner rejects. Namespace-like static helper uses the repository const-object convention (ScOptionsUtil) to satisfy no-extraneous-class without inventing instances or disabling lint. Exact source grouping checks and exponent handling remain unchanged. No copied upstream fixture, native build/probe, formatter facade, locale heuristic or Number conversion. UI cycle task2/10; broad regression deferred to task10. New files under500 lines; file-size gate passes with pre-existing candidates. Doctor passes with existing managed-shim warning. Next: native per-sheet cursor/view ownership and scalar input integration into a real editable browser view, then shared file/menu composition."
id_source: "generated"
---
## Summary

Implement Calc source simple-number input scanner

Approved UI core prerequisite: port the Unicode ScStringUtil::parseSimpleNumber operation exactly from pinned sc/source/core/tool/stringutil.cxx, reusing existing RTL Unicode binary64 parsing and preserving decimal/group/alternative separators, scientific switch, trimming, grouping validation and output-reference semantics. No fake number formatter or browser parsing shortcut. This scanner feeds the upcoming native cell-entry path. Add exhaustive source cases and 100 percent Calc coverage, registry provenance and runtime records. Second task in Calc UI ten-task full-regression cycle.

## Scope

- In scope: Approved UI core prerequisite: port the Unicode ScStringUtil::parseSimpleNumber operation exactly from pinned sc/source/core/tool/stringutil.cxx, reusing existing RTL Unicode binary64 parsing and preserving decimal/group/alternative separators, scientific switch, trimming, grouping validation and output-reference semantics. No fake number formatter or browser parsing shortcut. This scanner feeds the upcoming native cell-entry path. Add exhaustive source cases and 100 percent Calc coverage, registry provenance and runtime records. Second task in Calc UI ten-task full-regression cycle.
- Out of scope: unrelated refactors not required for "Implement Calc source simple-number input scanner".

## Plan

Port exact Unicode ScStringUtil::parseSimpleNumber scanner into sc/source/core/tool/stringutil.ts and original sc/inc/stringutil.ts boundary. Reuse rtl_math_uStringToDouble and output reference. Cover native simple-number corpus and separator/exponent/grouping/error boundaries at 100 percent. Register runtime, provenance and operation/capability evidence using existing schemas. No generic formatter facade or native allocator. Approved core-first UI plan; UI cycle task2/10. Bound scope to these owners, tests and their registry records.

## Verify Steps

1. npm run test:coverage:calc: all Calc tests and 100 percent statements, branches, functions and lines including the new scanner. 2. npm run typecheck --workspace @vite-office/office. 3. Touched ESLint and Prettier; dependency, documentation, file-size, source-tree and source-provenance gates. 4. npm run inventory:parity:calc. 5. Inspect pinned sc/qa/unit/ucalc.cxx simple number tests and sc/source/core/tool/stringutil.cxx for literal behavior; scientific disabled, sign-only, malformed grouping, NBSP, alternate decimal, RTL overflow and parse-end behavior must preserve source results. Full all-app run deferred under approved once-per-ten cadence.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-10-18T16:49:13.827Z — VERIFY — ok

By: CODER

Note: PASS: Calc 90 files/241 tests; 5527 statements,3581 branches,1096 functions,4948 lines all100 percent on final const-object implementation. Related shared RTL and scanner5 tests pass. Typecheck,touched ESLint and Prettier,dependency boundaries,docs,source-tree,source-provenance,Calc parity,file-size,doctor and policy routing pass. Evidence in task evidence directory. Full all-app run deferred per user cadence (UI task2/10).
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-18T16:49:13.221Z, excerpt_hash=sha256:0878be78a6497e1a4a4a72904186bad3d1927e40e84422a80358ea07d5b12873

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202610181643-YYAGKX/blueprint/resolved-snapshot.json
- old_digest: 332adf35be2fe8a645cc3f5e1d3ab321380164403bbad8d6ddce9754729bdf81
- current_digest: 332adf35be2fe8a645cc3f5e1d3ab321380164403bbad8d6ddce9754729bdf81
- route_changed: no
- safe_command: agentplane blueprint snapshot 202610181643-YYAGKX

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane commit 202610181643-YYAGKX -m 🧩 YYAGKX task: persist canonical task artifacts --allow-tasks
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: true
- repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert task-related commit(s).
- Re-run required checks to confirm rollback safety.

## Findings

Implemented original Unicode ScStringUtil::parseSimpleNumber only. All 16 original testCSV numeric cases and source-derived boundary cases pass. Native prechecks preserve output; RTL failure assigns output. Initial underflow acceptance expectation was corrected: actual shared RTL returns OutOfRange for 1e-999, so source scanner rejects. Namespace-like static helper uses the repository const-object convention (ScOptionsUtil) to satisfy no-extraneous-class without inventing instances or disabling lint. Exact source grouping checks and exponent handling remain unchanged. No copied upstream fixture, native build/probe, formatter facade, locale heuristic or Number conversion. UI cycle task2/10; broad regression deferred to task10. New files under500 lines; file-size gate passes with pre-existing candidates. Doctor passes with existing managed-shim warning. Next: native per-sheet cursor/view ownership and scalar input integration into a real editable browser view, then shared file/menu composition.
