---
id: "202610160652-ZP7Q8G"
title: "Compile basic arithmetic formula tokens to canonical RPN"
result_summary: "Compiled scalar arithmetic tokens to RPN"
status: "DONE"
priority: "med"
owner: "CODER"
revision: 17
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-16T06:52:54.645Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-10-16T07:06:14.967Z"
  updated_by: "CODER"
  note: "Command: node output/playwright/task199-checks/source-audit.mjs; portable.mjs; browser-portable.mjs; source-gates.mjs. Result: pass. Evidence: six pinned upstream implementation/header/QA files audited without native execution; 31 related formula tests in7 files pass; exact changed shared executable owner1 reaches raw S117/B75/F14/L107 with every counter positive; whole Calc199 tests/79files and exact39 executable owners reach raw S4420/B2851/F906/L3956 every counter positive. Production build and2 actual Chromium/DOM-free Worker cases pass. All13 source gates pass. All5 reference links absent during portable runs/restored afterward. Final exact9source/metadata path hash audit: output/playwright/task199-checks/final-audit.json. Scope: token-to-RPN scalar arithmetic only; no text scanner, formula-cell evaluation/recalc, ODS or UI readiness; no full all-app run. Follow-on scope remains minimal Calc formula editing then same-model ODS."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-10-16T07:06:39.849Z"
  updated_by: "EVALUATOR"
  note: "Same-agent review passes the bounded shared scalar arithmetic compiler at ddcdb90f74e8; not independent review or formula editing/ODS readiness."
  evaluated_sha: "ddcdb90f74e8f40d1d8f3cffe7e1a3838765caba"
  blueprint_digest: "477ad55d42635f41f4ca23c8ef73911bbb2a634c1ab0edef8d7e25ff8cb6470d"
  evidence_refs:
    - ".agentplane/tasks/202610160652-ZP7Q8G/README.md"
    - ".agentplane/tasks/202610160652-ZP7Q8G/quality/20261016-070639849-recovery-context/quality-report.json"
    - ".agentplane/tasks/202610160652-ZP7Q8G/quality/20261016-070639849-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202610160652-ZP7Q8G/quality/20261016-070639849-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202610160652-ZP7Q8G/blueprint/resolved-snapshot.json"
    - "output/playwright/task199-checks/final-audit.json"
  findings:
    - "Reviewed source-shaped recursive precedence, original token identity output, default virtual error hook and consumer recording test, recalc/return behavior, and explicit pre-mutation rejection of missing opcode/array contexts. Six pinned native files support the implemented subset without native execution. All31 related and199 Calc tests, strict raw coverage of shared1+Calc39 owners, two Chromium/Worker cases, build and13 gates pass. Exact9path final hashes match committed scope. Scanner, Calc interpreter/formula cells/recalc, ODS and UI remain pending; no full all-app run."
commit:
  hash: "ddcdb90f74e8f40d1d8f3cffe7e1a3838765caba"
  message: "🧮 ZP7Q8G formula: compile scalar arithmetic tokens to RPN"
comments:
  -
    author: "CODER"
    body: "Start: implement source-backed shared arithmetic token compilation for the minimal Calc formula path, preserving explicit unsupported boundaries and existing token owners."
  -
    author: "CODER"
    body: "Verified: bounded shared arithmetic token-to-RPN compilation, strict changed-shared and whole-Calc raw coverage, related tests, portable Chromium/Worker and source gates; same-agent evaluation passed. Scanner/evaluation/recalc and ODS readiness remain pending; UI stays separate."
events:
  -
    type: "status"
    at: "2026-10-16T06:52:59.373Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implement source-backed shared arithmetic token compilation for the minimal Calc formula path, preserving explicit unsupported boundaries and existing token owners."
  -
    type: "verify"
    at: "2026-10-16T07:06:14.967Z"
    author: "CODER"
    state: "ok"
    note: "Command: node output/playwright/task199-checks/source-audit.mjs; portable.mjs; browser-portable.mjs; source-gates.mjs. Result: pass. Evidence: six pinned upstream implementation/header/QA files audited without native execution; 31 related formula tests in7 files pass; exact changed shared executable owner1 reaches raw S117/B75/F14/L107 with every counter positive; whole Calc199 tests/79files and exact39 executable owners reach raw S4420/B2851/F906/L3956 every counter positive. Production build and2 actual Chromium/DOM-free Worker cases pass. All13 source gates pass. All5 reference links absent during portable runs/restored afterward. Final exact9source/metadata path hash audit: output/playwright/task199-checks/final-audit.json. Scope: token-to-RPN scalar arithmetic only; no text scanner, formula-cell evaluation/recalc, ODS or UI readiness; no full all-app run. Follow-on scope remains minimal Calc formula editing then same-model ODS."
  -
    type: "status"
    at: "2026-10-16T07:06:50.618Z"
    author: "CODER"
    from: "DOING"
    to: "DONE"
    note: "Verified: bounded shared arithmetic token-to-RPN compilation, strict changed-shared and whole-Calc raw coverage, related tests, portable Chromium/Worker and source gates; same-agent evaluation passed. Scanner/evaluation/recalc and ODS readiness remain pending; UI stays separate."
doc_version: 3
doc_updated_at: "2026-10-16T07:06:50.620Z"
doc_updated_by: "CODER"
description: "Advance the minimal Calc formula editing path by extending the existing shared FormulaCompiler with the source-shaped scalar arithmetic compilation subset over the actual FormulaTokenArray. No UI, locale expansion or alternate expression model."
sections:
  Summary: "Task199: implement the existing shared FormulaCompiler scalar token-to-RPN arithmetic subset required by upcoming Calc formula entry/evaluation. Reuse FormulaTokenArray and real FormulaToken identities; no new grid or AST."
  Scope: "Existing shared formula/source/core/api/FormulaCompiler.ts; focused arithmetic tests; its runtime/provenance records and existing capability; Calc readiness documentation and task evidence. Preserve static jump classification. Supported default-mode tokens: ocPush, parentheses, scalar arithmetic, unary negation, percent and whitespace. Other opcode families or non-default implicit-intersection/matrix compilation modes must reject explicitly before modifying RPN. No text scanner, Calc formula-cell/recalc, ODS or UI implementation in this slice."
  Plan: "1. Audit pinned compiler grammar, defaults, first-error virtual hook and arithmetic QA. 2. Extend the existing shared owner into a class with source-shaped precedence/member boundaries and actual shared array output. 3. Verify precedence, token identity, errors, repeat compilation and explicit unsupported boundaries. 4. Update inventory without claiming full compiler parity; run portable Calc coverage and strict changed-shared coverage, related token tests, browser/Worker smoke, source gates and same-agent evaluation."
  Verify Steps: |-
    - node output/playwright/task199-checks/source-audit.mjs: source-backed precedence/default/error/return-value audit, no native execution.
    - node output/playwright/task199-checks/portable.mjs: whole Calc strict raw S/B/F/L100 with exact owner set; changed shared FormulaCompiler every counter positive and related formula token/array tests, all reference links absent/restored.
    - node output/playwright/task199-checks/browser-portable.mjs: production build and actual compiled shared compiler in Chromium/DOM-free Worker; same-model scalar Calc smoke.
    - node output/playwright/task199-checks/source-gates.mjs: format/lint/types/docs/size/dependencies/tree/provenance/inventory/routing/doctor/diff.
    - Final hash/scope audit, recorded verify/source commit/same-agent quality review before finish. No full all-app run until minimal formula editing and same-model ODS are ready; then pause. UI remains separate.
  Verification: |-
    Command: node output/playwright/task199-checks/source-audit.mjs; portable.mjs; browser-portable.mjs; source-gates.mjs. Result: pass. Evidence: six pinned upstream implementation/header/QA files audited without native execution; 31 related formula tests in7 files pass; exact changed shared executable owner1 reaches raw S117/B75/F14/L107 with every counter positive; whole Calc199 tests/79files and exact39 executable owners reach raw S4420/B2851/F906/L3956 every counter positive. Production build and2 actual Chromium/DOM-free Worker cases pass. All13 source gates pass. All5 reference links absent during portable runs/restored afterward. Final exact9source/metadata path hash audit: output/playwright/task199-checks/final-audit.json. Scope: token-to-RPN scalar arithmetic only; no text scanner, formula-cell evaluation/recalc, ODS or UI readiness; no full all-app run. Follow-on scope remains minimal Calc formula editing then same-model ODS.

    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-10-16T07:06:14.967Z — VERIFY — ok

    By: CODER

    Note: Command: node output/playwright/task199-checks/source-audit.mjs; portable.mjs; browser-portable.mjs; source-gates.mjs. Result: pass. Evidence: six pinned upstream implementation/header/QA files audited without native execution; 31 related formula tests in7 files pass; exact changed shared executable owner1 reaches raw S117/B75/F14/L107 with every counter positive; whole Calc199 tests/79files and exact39 executable owners reach raw S4420/B2851/F906/L3956 every counter positive. Production build and2 actual Chromium/DOM-free Worker cases pass. All13 source gates pass. All5 reference links absent during portable runs/restored afterward. Final exact9source/metadata path hash audit: output/playwright/task199-checks/final-audit.json. Scope: token-to-RPN scalar arithmetic only; no text scanner, formula-cell evaluation/recalc, ODS or UI readiness; no full all-app run. Follow-on scope remains minimal Calc formula editing then same-model ODS.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-16T07:06:14.178Z, excerpt_hash=sha256:f1aba26732c7b801aa9ca7133ba5373271326ee4af029a7f49876aece6eb611a

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202610160652-ZP7Q8G/blueprint/resolved-snapshot.json
    - old_digest: 477ad55d42635f41f4ca23c8ef73911bbb2a634c1ab0edef8d7e25ff8cb6470d
    - current_digest: 477ad55d42635f41f4ca23c8ef73911bbb2a634c1ab0edef8d7e25ff8cb6470d
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202610160652-ZP7Q8G

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202610160652-ZP7Q8G
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: false
    - repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert only the task source/metadata commits, preserving unrelated work and the deferred LanguageTag snapshot. No destructive reset."
  Findings: "Task199 preserves the original empty shared virtual SetError boundary; Calc error recording remains a consumer override. Native return is subtotal presence, not success. Source-based hand-derived RPN witnesses cover left-associative power and unary-before-power. Initial test failure was reverse lookup selecting ocStartBinaryOperators instead of its ocAdd alias; fixed test display only. Initial gate wrapper --only invocation lacked its empty result file; initialized task-local evidence. TS7 found a literal-inferred opcode field and a required concrete token payload cast; corrected type annotations only. Initial source audit looked for inline CreateNewRPNArrayFromData in token.cxx; corrected evidence location to include/formula/tokenarray.hxx. Routes recomputed after failures; all affected checks subsequently pass. Final source audit found array-context propagation outside the supported default scalar subset; such inputs now explicitly reject before RPN mutation, with real token classification tests. No test thresholds or owner sets relaxed. UI and full all-app run remain excluded. Same-agent quality review is not independent review."
id_source: "generated"
---
## Summary

Task199: implement the existing shared FormulaCompiler scalar token-to-RPN arithmetic subset required by upcoming Calc formula entry/evaluation. Reuse FormulaTokenArray and real FormulaToken identities; no new grid or AST.

## Scope

Existing shared formula/source/core/api/FormulaCompiler.ts; focused arithmetic tests; its runtime/provenance records and existing capability; Calc readiness documentation and task evidence. Preserve static jump classification. Supported default-mode tokens: ocPush, parentheses, scalar arithmetic, unary negation, percent and whitespace. Other opcode families or non-default implicit-intersection/matrix compilation modes must reject explicitly before modifying RPN. No text scanner, Calc formula-cell/recalc, ODS or UI implementation in this slice.

## Plan

1. Audit pinned compiler grammar, defaults, first-error virtual hook and arithmetic QA. 2. Extend the existing shared owner into a class with source-shaped precedence/member boundaries and actual shared array output. 3. Verify precedence, token identity, errors, repeat compilation and explicit unsupported boundaries. 4. Update inventory without claiming full compiler parity; run portable Calc coverage and strict changed-shared coverage, related token tests, browser/Worker smoke, source gates and same-agent evaluation.

## Verify Steps

- node output/playwright/task199-checks/source-audit.mjs: source-backed precedence/default/error/return-value audit, no native execution.
- node output/playwright/task199-checks/portable.mjs: whole Calc strict raw S/B/F/L100 with exact owner set; changed shared FormulaCompiler every counter positive and related formula token/array tests, all reference links absent/restored.
- node output/playwright/task199-checks/browser-portable.mjs: production build and actual compiled shared compiler in Chromium/DOM-free Worker; same-model scalar Calc smoke.
- node output/playwright/task199-checks/source-gates.mjs: format/lint/types/docs/size/dependencies/tree/provenance/inventory/routing/doctor/diff.
- Final hash/scope audit, recorded verify/source commit/same-agent quality review before finish. No full all-app run until minimal formula editing and same-model ODS are ready; then pause. UI remains separate.

## Verification

Command: node output/playwright/task199-checks/source-audit.mjs; portable.mjs; browser-portable.mjs; source-gates.mjs. Result: pass. Evidence: six pinned upstream implementation/header/QA files audited without native execution; 31 related formula tests in7 files pass; exact changed shared executable owner1 reaches raw S117/B75/F14/L107 with every counter positive; whole Calc199 tests/79files and exact39 executable owners reach raw S4420/B2851/F906/L3956 every counter positive. Production build and2 actual Chromium/DOM-free Worker cases pass. All13 source gates pass. All5 reference links absent during portable runs/restored afterward. Final exact9source/metadata path hash audit: output/playwright/task199-checks/final-audit.json. Scope: token-to-RPN scalar arithmetic only; no text scanner, formula-cell evaluation/recalc, ODS or UI readiness; no full all-app run. Follow-on scope remains minimal Calc formula editing then same-model ODS.

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-10-16T07:06:14.967Z — VERIFY — ok

By: CODER

Note: Command: node output/playwright/task199-checks/source-audit.mjs; portable.mjs; browser-portable.mjs; source-gates.mjs. Result: pass. Evidence: six pinned upstream implementation/header/QA files audited without native execution; 31 related formula tests in7 files pass; exact changed shared executable owner1 reaches raw S117/B75/F14/L107 with every counter positive; whole Calc199 tests/79files and exact39 executable owners reach raw S4420/B2851/F906/L3956 every counter positive. Production build and2 actual Chromium/DOM-free Worker cases pass. All13 source gates pass. All5 reference links absent during portable runs/restored afterward. Final exact9source/metadata path hash audit: output/playwright/task199-checks/final-audit.json. Scope: token-to-RPN scalar arithmetic only; no text scanner, formula-cell evaluation/recalc, ODS or UI readiness; no full all-app run. Follow-on scope remains minimal Calc formula editing then same-model ODS.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-16T07:06:14.178Z, excerpt_hash=sha256:f1aba26732c7b801aa9ca7133ba5373271326ee4af029a7f49876aece6eb611a

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202610160652-ZP7Q8G/blueprint/resolved-snapshot.json
- old_digest: 477ad55d42635f41f4ca23c8ef73911bbb2a634c1ab0edef8d7e25ff8cb6470d
- current_digest: 477ad55d42635f41f4ca23c8ef73911bbb2a634c1ab0edef8d7e25ff8cb6470d
- route_changed: no
- safe_command: agentplane blueprint snapshot 202610160652-ZP7Q8G

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202610160652-ZP7Q8G
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: false
- repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert only the task source/metadata commits, preserving unrelated work and the deferred LanguageTag snapshot. No destructive reset.

## Findings

Task199 preserves the original empty shared virtual SetError boundary; Calc error recording remains a consumer override. Native return is subtotal presence, not success. Source-based hand-derived RPN witnesses cover left-associative power and unary-before-power. Initial test failure was reverse lookup selecting ocStartBinaryOperators instead of its ocAdd alias; fixed test display only. Initial gate wrapper --only invocation lacked its empty result file; initialized task-local evidence. TS7 found a literal-inferred opcode field and a required concrete token payload cast; corrected type annotations only. Initial source audit looked for inline CreateNewRPNArrayFromData in token.cxx; corrected evidence location to include/formula/tokenarray.hxx. Routes recomputed after failures; all affected checks subsequently pass. Final source audit found array-context propagation outside the supported default scalar subset; such inputs now explicitly reject before RPN mutation, with real token classification tests. No test thresholds or owner sets relaxed. UI and full all-app run remain excluded. Same-agent quality review is not independent review.
