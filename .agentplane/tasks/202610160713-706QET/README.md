---
id: "202610160713-706QET"
title: "Connect numeric arithmetic formulas to Calc document cells"
status: "DOING"
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
  updated_at: "2026-10-16T07:14:03.800Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-10-16T07:46:56.284Z"
  updated_by: "CODER"
  note: "Command: node output/playwright/task200-checks/source-audit.mjs; portable.mjs; browser-portable.mjs; source-gates.mjs; final-audit.mjs. Result: pass. Evidence:24 pinned reached native/header/QA files audited without native execution, including native by-value pointer append and type-only shared mdds container correction.194 related tests/40files pass. Exact5 changed shared executable owners reach raw S508/B331/F117/L471 with every counter positive. Whole Calc206tests/81files and exact47 executable owners reach raw S4671/B3039/F959/L4184 with every counter positive. Production build and3 actual Chromium plus DOM-free Worker cases pass. All13 source/inventory gates pass. All5 source-reference links absent during portable tests/build/browser runs and restored afterward. Exact86 intentional source/test/metadata/doc paths hashed in output/playwright/task200-checks/final-audit.json. Post-test edits only clarified one-line code descriptions and metadata; runtime implementation and coverage source locations stayed unchanged, and affected source/inventory gates were rechecked. Scope: real numeric ODFF formula entry/lazy results on actual document owners, normal finite arithmetic/powers and explicit error/gap boundaries. Unsupported: reference/function/dependency/listener/serialization services, unproven subnormal power classification, ODS and UI. No full all-app run; requested milestone-triggered full run/pause remains pending."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-10-16T07:49:03.475Z"
  updated_by: "EVALUATOR"
  note: "Same-agent review passes bounded numeric ODFF document formula editing at 0c88b33ccffeed1379a919902fc4550853d6b473; no independent review or overall UI/ODS readiness claim."
  evaluated_sha: "0c88b33ccffeed1379a919902fc4550853d6b473"
  blueprint_digest: "6bc9b227e6b005c91c4148603a7e39fef1a4f3512295cfb3d48406d7f93d1442"
  evidence_refs:
    - ".agentplane/tasks/202610160713-706QET/README.md"
    - ".agentplane/tasks/202610160713-706QET/quality/20261016-074903475-recovery-context/quality-report.json"
    - ".agentplane/tasks/202610160713-706QET/quality/20261016-074903475-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202610160713-706QET/quality/20261016-074903475-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202610160713-706QET/blueprint/resolved-snapshot.json"
    - "output/playwright/task200-checks/final-audit.json"
  findings:
    - "Reviewed actual document-sheet-column formula blocks, native logical block events and sheet position updates, scalar scanner/shared RPN compiler, lazy result ownership, compiler/runtime error distinction, common RTL cancellation, and explicit missing service boundaries. The shared mdds container correction is type-only and pointer move append maps to its native by-value operation; no physical object lifetime engine or alternate grid/AST was added.24 pinned native/header/QA sources support this bounded slice without native execution.194related and206Calc tests, exact shared5+Calc47 raw-positive100 owners,3 Chromium/Worker cases, build and13 source gates pass; final86path hashes match committed scope. References/functions/listening/invalidation, serialization/ODS/UI, full modes/services and subnormal power fenv remain explicit gaps."
commit: null
comments:
  -
    author: "CODER"
    body: "Start: implement real numeric formula entry and lazy results in the existing Calc cell store; preserve native operations and explicit unsupported boundaries without adding UI or a second expression model."
events:
  -
    type: "status"
    at: "2026-10-16T07:14:09.194Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implement real numeric formula entry and lazy results in the existing Calc cell store; preserve native operations and explicit unsupported boundaries without adding UI or a second expression model."
  -
    type: "verify"
    at: "2026-10-16T07:46:56.284Z"
    author: "CODER"
    state: "ok"
    note: "Command: node output/playwright/task200-checks/source-audit.mjs; portable.mjs; browser-portable.mjs; source-gates.mjs; final-audit.mjs. Result: pass. Evidence:24 pinned reached native/header/QA files audited without native execution, including native by-value pointer append and type-only shared mdds container correction.194 related tests/40files pass. Exact5 changed shared executable owners reach raw S508/B331/F117/L471 with every counter positive. Whole Calc206tests/81files and exact47 executable owners reach raw S4671/B3039/F959/L4184 with every counter positive. Production build and3 actual Chromium plus DOM-free Worker cases pass. All13 source/inventory gates pass. All5 source-reference links absent during portable tests/build/browser runs and restored afterward. Exact86 intentional source/test/metadata/doc paths hashed in output/playwright/task200-checks/final-audit.json. Post-test edits only clarified one-line code descriptions and metadata; runtime implementation and coverage source locations stayed unchanged, and affected source/inventory gates were rechecked. Scope: real numeric ODFF formula entry/lazy results on actual document owners, normal finite arithmetic/powers and explicit error/gap boundaries. Unsupported: reference/function/dependency/listener/serialization services, unproven subnormal power classification, ODS and UI. No full all-app run; requested milestone-triggered full run/pause remains pending."
doc_version: 3
doc_updated_at: "2026-10-16T07:49:02.267Z"
doc_updated_by: "CODER"
description: "Task200: implement numeric formula entry, real token/RPN evaluation and lazy ScFormulaCell results in the existing document-sheet-column store. Reuse shared compiler, RTL parsing, mdds and formula result. No UI or unrelated language expansion."
sections:
  Summary: "Task200: connect numeric arithmetic formulas end-to-end to the actual Calc document-sheet-column cell store, using the existing shared compiler, numeric parser and formula result."
  Scope: "Calc sc/inc and source/core data/tool owners: ScTokenArray, ScCompiler, ScInterpreterContext, ScInterpreter, ScFormulaCell, formula block/CellStoreEvent and existing document/table/column/mtvelements. Reuse ScSheetLimits and ScFormulaResult. Shared SAL math owner/facades gain only consumed approxEqual/approxAdd/approxSub; shared FormulaCompiler array reference becomes mutable as native CompileString requires. Numeric ODFF grammar, parentheses, unary minus, arithmetic and percent; normal finite powers with negative reciprocal odd roots. Explicit unsupported boundaries for references/functions/string formulas, locale formatting and unproven subnormal power regions. Add focused real-model unit/browser/Worker tests, paired runtime/provenance and capability records and update Calc readiness. No UI, ODS implementation, unrelated language/cache/RNG/physical ownership engine or complete native constructor graph. Approximately20 runtime/header paths plus their paired registry records, tests/docs/task evidence."
  Plan: "1. Audit the reached native formula entry, numeric scanner, arithmetic/default/error/result and typed-store/event paths. 2. Implement the numeric specialization with actual shared RPN/result/block owners and GC object lifetime, maintaining source module boundaries and explicit omitted services. 3. Verify public document entry/read/replacement/clear and lazy results, operator precedence/errors/numeric boundaries and block events. 4. Update exact inventory; portable whole Calc and changed-shared raw100 plus related tests, actual browser/Worker, source gates and same-agent evaluation. Keep references/SUM/dependency listening and ODS as the next minimal critical-path slices; no full all-app run until that stage is ready, then pause."
  Verify Steps: |-
    - node output/playwright/task200-checks/source-audit.mjs: pinned reached native methods/defaults/QA and explicit GC adaptation; no C++ execution.
    - node output/playwright/task200-checks/portable.mjs: exact executable whole-Calc and changed shared owner sets with raw S/B/F/L100 and every counter positive; directly related compiler/token/number/parser/block tests; reference links absent/restored.
    - node output/playwright/task200-checks/browser-portable.mjs: production build and real document formula editing/lazy evaluation in Chromium and DOM-free Worker without references.
    - node output/playwright/task200-checks/source-gates.mjs: existing format/lint/type/docs/size/dependency/tree/provenance/inventory/routing/doctor/diff gates.
    - Final scope/hash audit, recorded verify, source commit and same-agent quality review before finish. Explicitly no UI/full all-app run or claim of formula references/functions/ODS readiness.
  Verification: |-
    Command: node output/playwright/task200-checks/source-audit.mjs; portable.mjs; browser-portable.mjs; source-gates.mjs; final-audit.mjs. Result: pass. Evidence:24 pinned reached native/header/QA files audited without native execution, including native by-value pointer append and type-only shared mdds container correction.194 related tests/40files pass. Exact5 changed shared executable owners reach raw S508/B331/F117/L471 with every counter positive. Whole Calc206tests/81files and exact47 executable owners reach raw S4671/B3039/F959/L4184 with every counter positive. Production build and3 actual Chromium plus DOM-free Worker cases pass. All13 source/inventory gates pass. All5 source-reference links absent during portable tests/build/browser runs and restored afterward. Exact86 intentional source/test/metadata/doc paths hashed in output/playwright/task200-checks/final-audit.json. Post-test edits only clarified one-line code descriptions and metadata; runtime implementation and coverage source locations stayed unchanged, and affected source/inventory gates were rechecked. Scope: real numeric ODFF formula entry/lazy results on actual document owners, normal finite arithmetic/powers and explicit error/gap boundaries. Unsupported: reference/function/dependency/listener/serialization services, unproven subnormal power classification, ODS and UI. No full all-app run; requested milestone-triggered full run/pause remains pending.

    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-10-16T07:46:56.284Z — VERIFY — ok

    By: CODER

    Note: Command: node output/playwright/task200-checks/source-audit.mjs; portable.mjs; browser-portable.mjs; source-gates.mjs; final-audit.mjs. Result: pass. Evidence:24 pinned reached native/header/QA files audited without native execution, including native by-value pointer append and type-only shared mdds container correction.194 related tests/40files pass. Exact5 changed shared executable owners reach raw S508/B331/F117/L471 with every counter positive. Whole Calc206tests/81files and exact47 executable owners reach raw S4671/B3039/F959/L4184 with every counter positive. Production build and3 actual Chromium plus DOM-free Worker cases pass. All13 source/inventory gates pass. All5 source-reference links absent during portable tests/build/browser runs and restored afterward. Exact86 intentional source/test/metadata/doc paths hashed in output/playwright/task200-checks/final-audit.json. Post-test edits only clarified one-line code descriptions and metadata; runtime implementation and coverage source locations stayed unchanged, and affected source/inventory gates were rechecked. Scope: real numeric ODFF formula entry/lazy results on actual document owners, normal finite arithmetic/powers and explicit error/gap boundaries. Unsupported: reference/function/dependency/listener/serialization services, unproven subnormal power classification, ODS and UI. No full all-app run; requested milestone-triggered full run/pause remains pending.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-16T07:46:55.564Z, excerpt_hash=sha256:2f0deae1b910e43b90744974a69052b1ebdffd05ba28eba360a6b4e39bdb90d3

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202610160713-706QET/blueprint/resolved-snapshot.json
    - old_digest: 6bc9b227e6b005c91c4148603a7e39fef1a4f3512295cfb3d48406d7f93d1442
    - current_digest: 6bc9b227e6b005c91c4148603a7e39fef1a4f3512295cfb3d48406d7f93d1442
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202610160713-706QET

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202610160713-706QET
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: false
    - repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert only task200 source and metadata commits, preserving unrelated work and deferred LanguageTag snapshot. No reset, branch merge, publication or network writes."
  Findings: "Task200 is limited to real numeric ODFF formula entry/lazy results. References/functions/listeners/dependency invalidation, serialization/ODS/UI and full native constructor/context services remain unsupported. Initial failures and resolutions: common mdds callback type required unconsumed emplace helpers and lacked a moved-pointer append witness; corrected consumed types and native by-value pointer append without a Writer shim. Two focused test errors were incorrect nested FormulaGrammar enum access and repeated equals in an overflow string; fixed test inputs only. A large test exposed quadratic regex space trimming; terminated only confirmed test descendants, retained the wrapper to restore all5 refs, replaced trimming with native-shaped linear bounds and retained the regression (all8 focused tests then passed in2.7s). First whole Calc run passed206tests but missed3 statements/3 branches/1function; corrected canonical ScTable-to-ScColumn GetErrCode forwarding and added the numeric token-limit boundary. Provenance required native filename placement; moved ScTokenArray into existing token.ts matching token.cxx without new divergence exceptions. Routes were recomputed after failures. Final194related tests/206Calc tests/3 browser+Worker cases, exact shared5+Calc47 strict raw100 owners,24-source audit and all13 gates pass; see Verification and final-audit.json. Follow-up one-line code descriptions and metadata corrections do not change executable behavior/source positions. CALC-185 preserves native numeric-overflow error distinction; CALC-184 is reserved by deferred task197. No native code execution, physical pointer deletion/refcount engine, full all-app run or UI readiness claim. Source commit0c88b33ccffeed1379a919902fc4550853d6b473. Same-agent quality review is a separate phase and is not independent review."
id_source: "generated"
---
## Summary

Task200: connect numeric arithmetic formulas end-to-end to the actual Calc document-sheet-column cell store, using the existing shared compiler, numeric parser and formula result.

## Scope

Calc sc/inc and source/core data/tool owners: ScTokenArray, ScCompiler, ScInterpreterContext, ScInterpreter, ScFormulaCell, formula block/CellStoreEvent and existing document/table/column/mtvelements. Reuse ScSheetLimits and ScFormulaResult. Shared SAL math owner/facades gain only consumed approxEqual/approxAdd/approxSub; shared FormulaCompiler array reference becomes mutable as native CompileString requires. Numeric ODFF grammar, parentheses, unary minus, arithmetic and percent; normal finite powers with negative reciprocal odd roots. Explicit unsupported boundaries for references/functions/string formulas, locale formatting and unproven subnormal power regions. Add focused real-model unit/browser/Worker tests, paired runtime/provenance and capability records and update Calc readiness. No UI, ODS implementation, unrelated language/cache/RNG/physical ownership engine or complete native constructor graph. Approximately20 runtime/header paths plus their paired registry records, tests/docs/task evidence.

## Plan

1. Audit the reached native formula entry, numeric scanner, arithmetic/default/error/result and typed-store/event paths. 2. Implement the numeric specialization with actual shared RPN/result/block owners and GC object lifetime, maintaining source module boundaries and explicit omitted services. 3. Verify public document entry/read/replacement/clear and lazy results, operator precedence/errors/numeric boundaries and block events. 4. Update exact inventory; portable whole Calc and changed-shared raw100 plus related tests, actual browser/Worker, source gates and same-agent evaluation. Keep references/SUM/dependency listening and ODS as the next minimal critical-path slices; no full all-app run until that stage is ready, then pause.

## Verify Steps

- node output/playwright/task200-checks/source-audit.mjs: pinned reached native methods/defaults/QA and explicit GC adaptation; no C++ execution.
- node output/playwright/task200-checks/portable.mjs: exact executable whole-Calc and changed shared owner sets with raw S/B/F/L100 and every counter positive; directly related compiler/token/number/parser/block tests; reference links absent/restored.
- node output/playwright/task200-checks/browser-portable.mjs: production build and real document formula editing/lazy evaluation in Chromium and DOM-free Worker without references.
- node output/playwright/task200-checks/source-gates.mjs: existing format/lint/type/docs/size/dependency/tree/provenance/inventory/routing/doctor/diff gates.
- Final scope/hash audit, recorded verify, source commit and same-agent quality review before finish. Explicitly no UI/full all-app run or claim of formula references/functions/ODS readiness.

## Verification

Command: node output/playwright/task200-checks/source-audit.mjs; portable.mjs; browser-portable.mjs; source-gates.mjs; final-audit.mjs. Result: pass. Evidence:24 pinned reached native/header/QA files audited without native execution, including native by-value pointer append and type-only shared mdds container correction.194 related tests/40files pass. Exact5 changed shared executable owners reach raw S508/B331/F117/L471 with every counter positive. Whole Calc206tests/81files and exact47 executable owners reach raw S4671/B3039/F959/L4184 with every counter positive. Production build and3 actual Chromium plus DOM-free Worker cases pass. All13 source/inventory gates pass. All5 source-reference links absent during portable tests/build/browser runs and restored afterward. Exact86 intentional source/test/metadata/doc paths hashed in output/playwright/task200-checks/final-audit.json. Post-test edits only clarified one-line code descriptions and metadata; runtime implementation and coverage source locations stayed unchanged, and affected source/inventory gates were rechecked. Scope: real numeric ODFF formula entry/lazy results on actual document owners, normal finite arithmetic/powers and explicit error/gap boundaries. Unsupported: reference/function/dependency/listener/serialization services, unproven subnormal power classification, ODS and UI. No full all-app run; requested milestone-triggered full run/pause remains pending.

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-10-16T07:46:56.284Z — VERIFY — ok

By: CODER

Note: Command: node output/playwright/task200-checks/source-audit.mjs; portable.mjs; browser-portable.mjs; source-gates.mjs; final-audit.mjs. Result: pass. Evidence:24 pinned reached native/header/QA files audited without native execution, including native by-value pointer append and type-only shared mdds container correction.194 related tests/40files pass. Exact5 changed shared executable owners reach raw S508/B331/F117/L471 with every counter positive. Whole Calc206tests/81files and exact47 executable owners reach raw S4671/B3039/F959/L4184 with every counter positive. Production build and3 actual Chromium plus DOM-free Worker cases pass. All13 source/inventory gates pass. All5 source-reference links absent during portable tests/build/browser runs and restored afterward. Exact86 intentional source/test/metadata/doc paths hashed in output/playwright/task200-checks/final-audit.json. Post-test edits only clarified one-line code descriptions and metadata; runtime implementation and coverage source locations stayed unchanged, and affected source/inventory gates were rechecked. Scope: real numeric ODFF formula entry/lazy results on actual document owners, normal finite arithmetic/powers and explicit error/gap boundaries. Unsupported: reference/function/dependency/listener/serialization services, unproven subnormal power classification, ODS and UI. No full all-app run; requested milestone-triggered full run/pause remains pending.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-16T07:46:55.564Z, excerpt_hash=sha256:2f0deae1b910e43b90744974a69052b1ebdffd05ba28eba360a6b4e39bdb90d3

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202610160713-706QET/blueprint/resolved-snapshot.json
- old_digest: 6bc9b227e6b005c91c4148603a7e39fef1a4f3512295cfb3d48406d7f93d1442
- current_digest: 6bc9b227e6b005c91c4148603a7e39fef1a4f3512295cfb3d48406d7f93d1442
- route_changed: no
- safe_command: agentplane blueprint snapshot 202610160713-706QET

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202610160713-706QET
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: false
- repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert only task200 source and metadata commits, preserving unrelated work and deferred LanguageTag snapshot. No reset, branch merge, publication or network writes.

## Findings

Task200 is limited to real numeric ODFF formula entry/lazy results. References/functions/listeners/dependency invalidation, serialization/ODS/UI and full native constructor/context services remain unsupported. Initial failures and resolutions: common mdds callback type required unconsumed emplace helpers and lacked a moved-pointer append witness; corrected consumed types and native by-value pointer append without a Writer shim. Two focused test errors were incorrect nested FormulaGrammar enum access and repeated equals in an overflow string; fixed test inputs only. A large test exposed quadratic regex space trimming; terminated only confirmed test descendants, retained the wrapper to restore all5 refs, replaced trimming with native-shaped linear bounds and retained the regression (all8 focused tests then passed in2.7s). First whole Calc run passed206tests but missed3 statements/3 branches/1function; corrected canonical ScTable-to-ScColumn GetErrCode forwarding and added the numeric token-limit boundary. Provenance required native filename placement; moved ScTokenArray into existing token.ts matching token.cxx without new divergence exceptions. Routes were recomputed after failures. Final194related tests/206Calc tests/3 browser+Worker cases, exact shared5+Calc47 strict raw100 owners,24-source audit and all13 gates pass; see Verification and final-audit.json. Follow-up one-line code descriptions and metadata corrections do not change executable behavior/source positions. CALC-185 preserves native numeric-overflow error distinction; CALC-184 is reserved by deferred task197. No native code execution, physical pointer deletion/refcount engine, full all-app run or UI readiness claim. Source commit0c88b33ccffeed1379a919902fc4550853d6b473. Same-agent quality review is a separate phase and is not independent review.
