---
id: "202610181334-NXE4RF"
title: "Serialize scalar Calc formulas through canonical compiler owners"
result_summary: "Implemented ScFormulaCell.GetFormula with explicit ODFF through real shared and Calc compiler owners,including source whitespace/quotes,forced equals,relative/absolute local references and canonical consumed decimal output. Shared scalar symbols are reused and no alternate formula text model exists. Inventory/provenance and CALC-187 updated. ODS filters remain next;UI is separate;minimal readiness and full all-app verification remain pending."
status: "DONE"
priority: "med"
owner: "CODER"
revision: 16
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-18T13:36:22.554Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-10-18T13:49:21.770Z"
  updated_by: "CODER"
  note: "Passed215Calc/206related cases;49Calc/3shared owners strict raw100;build+5Chromium/DOM-free Worker scenarios;13source gates;8pinned-source and24path/hash audit. Core formula serialization complete;ODS/UI readiness unclaimed."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-10-18T13:49:54.575Z"
  updated_by: "EVALUATOR"
  note: "Same-agent source review passes scalar ODFF serialization at c01a5ffd9013;24source hashes and25commit paths match final evidence. Minimal ODS/UI handoff is not yet claimed."
  evaluated_sha: "c01a5ffd901369b8431049602efc3c4d0f4cc5ca"
  blueprint_digest: "b73dc28e4bd8f471abdda2ac0e2b325ce1bd10bcab2e2253779a649a2c8219a6"
  evidence_refs:
    - ".agentplane/tasks/202610181334-NXE4RF/README.md"
    - ".agentplane/tasks/202610181334-NXE4RF/quality/20261018-134954575-recovery-context/quality-report.json"
    - ".agentplane/tasks/202610181334-NXE4RF/quality/20261018-134954575-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202610181334-NXE4RF/quality/20261018-134954575-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202610181334-NXE4RF/blueprint/resolved-snapshot.json"
    - "output/playwright/task202-checks/quality-source-audit.json"
    - "output/playwright/task202-checks/final-audit.json"
    - "output/playwright/task202-checks/source-audit.json"
    - "output/playwright/task202-checks/source-gates.json"
    - "output/playwright/task202-checks/value-coverage-audit.json"
    - "output/playwright/task202-checks/build-browser-manifest.json"
  findings:
    - "Formula output uses real source-order tokens and Calc reference convention,with native grammar-state ownership and empty base virtual. Existing shared RPN bodies are byte-identical. English symbol entries are reused by scanning and output. RTL consumed decimal rules preserve signed zero,integer precision,rounding and exponent/max guards using native JS shortest decomposition plus exact integer arithmetic."
    - "Whole Calc215cases/exact49owners and related206cases/exact3shared owners pass every raw S/B/F/L counter;build+5Chromium/DOM-free Worker scenarios and13gates pass with restored source links. Inventory remains partial/unverified and CALC-187 records precision behavior."
commit:
  hash: "c01a5ffd901369b8431049602efc3c4d0f4cc5ca"
  message: "🧮 NXE4RF calc: serialize scalar formulas through real token owners"
comments:
  -
    author: "CODER"
    body: "Start: serialize real scalar/local-reference tokens through shared and Calc compiler owners for ODS, with consumed native decimal formatting and no UI or second formula model."
  -
    author: "CODER"
    body: "Verified: source-token formula serialization and consumed RTL decimal formatting pass215Calc/206related tests,49Calc/3shared strict raw100,build+5Chromium/Worker cases,13source gates and same-agent source review."
events:
  -
    type: "status"
    at: "2026-10-18T13:36:27.766Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: serialize real scalar/local-reference tokens through shared and Calc compiler owners for ODS, with consumed native decimal formatting and no UI or second formula model."
  -
    type: "verify"
    at: "2026-10-18T13:49:21.770Z"
    author: "CODER"
    state: "ok"
    note: "Passed215Calc/206related cases;49Calc/3shared owners strict raw100;build+5Chromium/DOM-free Worker scenarios;13source gates;8pinned-source and24path/hash audit. Core formula serialization complete;ODS/UI readiness unclaimed."
  -
    type: "status"
    at: "2026-10-18T13:49:56.320Z"
    author: "CODER"
    from: "DOING"
    to: "DONE"
    note: "Verified: source-token formula serialization and consumed RTL decimal formatting pass215Calc/206related tests,49Calc/3shared strict raw100,build+5Chromium/Worker cases,13source gates and same-agent source review."
doc_version: 3
doc_updated_at: "2026-10-18T13:49:56.322Z"
doc_updated_by: "CODER"
description: "Task202: expose source-token formula serialization on the actual shared FormulaCompiler/Calc compiler/cell/document chain for same-model ODS. Implement the consumed native RTL Automatic/Max decimal-format specialization with JS shortest-decimal primitives and source integer rounding; retain native exponent/default/sign rules. No UI or broad locale/function parity."
sections:
  Summary: "Task202: serialize the actual scalar/local-reference formula token owner through shared FormulaCompiler, ScCompiler reference output and ScFormulaCell.GetFormula(GRAM_ODFF), directly enabling same-model ODS export. No UI implementation."
  Scope: "Existing formula/source/core/api/FormulaCompiler.ts, sc/source/core/tool/compiler.ts, sc/source/core/data/formulacell.ts and their header facades as needed. Shared consumed Automatic/Max/erase/no-group RTL decimal specialization in sal/rtl/strtmpl.math.ts, with native JS shortest decimal decomposition and exact integer half-up rounding; formula/inc/core_resource.ts bounded real ODFF resource data reused by the scanner and serializer. English ODFF only; native shared compiler grammar state/default and native empty reference virtual are preserved; actual string/space tokens may serialize without promising interpreter support. Original buffer/output-reference contracts use actual OUString assignment or returned text fragments, no physical buffer/memory manager. Paired inventory/provenance/capabilities, readiness/journal docs and focused tests including numeric-format source witnesses and real Chromium/Worker formula serialization. No full locale/format modes, names/external/range/function/matrix/rewrite services or document-native grammar facade are claimed."
  Plan: "1. Audit pinned FormulaCompiler token-array/token/AppendDouble flow, native RTL Automatic/Max rounding/exponent rules, ScCompiler ODFF reference convention and ScFormulaCell GetFormula. 2. Implement actual source owners and reuse native ODFF resource data and shared strings; preserve explicit unsupported boundaries. 3. Verify canonical source/result serialization, edits and A1 offset/absolute flags, signed zero/infinities/rounding/max/subnormal numeric cases, no mutation of code/RPN/result, and actual browser/Worker portability. 4. Update paired inventory without parity promotion; record raw100 whole Calc/changed shared and related tests, existing source gates, source/path/hash audits, commit and same-agent quality review."
  Verify Steps: |-
    node output/playwright/task202-checks/source-audit.mjs: pinned source behavior/markers/hashes, no native compilation.
    node output/playwright/task202-checks/portable.mjs: whole Calc strict raw S/B/F/L100 exact owners plus all changed shared owners every raw counter positive and related compiler/token/SAL tests; all5native references absent/restored; Writer-only gaps exempt.
    node output/playwright/task202-checks/browser-portable.mjs: production build and actual Calc formula serialization in Chromium and DOM-free Worker with all5native references absent/restored.
    node output/playwright/task202-checks/source-gates.mjs: all13existing format/lint/types/docs/size/dependency/tree/provenance/inventory/routing/doctor/diff/boundary gates, no criteria relaxation.
    Final exact path/hash/reference/coverage audit; recorded verification, source commit and same-agent quality review. No UI/ODS readiness or full all-app run until minimal ODS milestone.
  Verification: |-
    Command: node output/playwright/task202-checks/source-audit.mjs. Result: pass. Evidence:8pinned native source/resource/QA files;actual scalar ODFF resource entries;existing shared RPN method bodies byte-identical to pre-task source. Scope:source-order output,protected grammar default,Calc grammar/reference convention,RTL Automatic/Max decimal specialization. No native compilation or execution.
    Command: node output/playwright/task202-checks/portable.mjs. Result: pass. Evidence:whole Calc215cases/84files with exact49executable owners;raw5070statements/3273branches/1034functions/4548lines all100 and every raw counter positive. Related206cases/45files and exact3changed shared owners;raw183/134/20/165 all100. Scope:actual formula/token/string/numeric owners and real cell serialization,all5source references absent/restored. No Writer-only coverage remediation.
    Command: node output/playwright/task202-checks/browser-portable.mjs. Result: pass. Evidence:production build and5Chromium cases;each executes actual modules in page and DOM-free Worker,including forced/local-absolute reference serialization,re-entry and numeric result edit propagation. Scope:core portability only,all5native references absent/restored,no UI implementation.
    Command: node output/playwright/task202-checks/source-gates.mjs (all13gates with recorded focused remediation/resume;final format/lint/types/docs pass after source changes). Result: pass. Evidence:format,lint,types,docs,size,dependencies,tree,provenance,inventory,routing,doctor,diff,boundaries. Native filename responsibility split documented in the paired provenance;no checker,allowlist or threshold edits. Existing managed-hook warning retained.
    Command: node output/playwright/task202-checks/final-audit.mjs. Result: pass. Evidence:exact24non-task paths and final portable snapshot hashes,49Calc/3shared raw100,13gates,8pinned native sources and restored links. Scope:scalar ODFF formula serialization only;ODS filters,full service parity and UI remain pending. Full all-app run remains due at the user milestone,then pause. Same-agent quality review follows implementation commit.

    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-10-18T13:49:21.770Z — VERIFY — ok

    By: CODER

    Note: Passed215Calc/206related cases;49Calc/3shared owners strict raw100;build+5Chromium/DOM-free Worker scenarios;13source gates;8pinned-source and24path/hash audit. Core formula serialization complete;ODS/UI readiness unclaimed.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-18T13:49:20.579Z, excerpt_hash=sha256:dcefb904098940759b4c2176972edea6e4ae46d637998eaec19c717c51df851d

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202610181334-NXE4RF/blueprint/resolved-snapshot.json
    - old_digest: b73dc28e4bd8f471abdda2ac0e2b325ce1bd10bcab2e2253779a649a2c8219a6
    - current_digest: b73dc28e4bd8f471abdda2ac0e2b325ce1bd10bcab2e2253779a649a2c8219a6
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202610181334-NXE4RF

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202610181334-NXE4RF
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: false
    - repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert only the task202 implementation commit and associated inventory/docs;retain completed task201 and shared existing owners. No branch integration or user changes."
  Findings: "Task202 initial focused assertions incorrectly expected prefix plus and a space immediately after equals to disappear; source-order serialization correctly preserves both, so expectations were corrected. Initial typecheck found an unused import after shared grammar-state reuse. Source review placed native SetGrammar in ScCompiler rather than shared FormulaCompiler; base protected GRAM_UNSPECIFIED default and empty-array return are retained, with native derived-class setup in direct base tests. Module-boundary validation rejected formula-to-i18nlangtag helpers; exact UTF16 OUString conversion now stays within shared SAL, tested with quotes,emoji and embedded zero. JSDoc callback contracts and the independently consumed numeric-template filename split were documented through existing provenance, without guard or threshold relaxation. Source-derived numeric precision behavior is journaled as CALC-187. No native C++ execution,network,UI,buffer-memory port or full all-app run. Final portable checks are pending;source gates currently pass."
id_source: "generated"
---
## Summary

Task202: serialize the actual scalar/local-reference formula token owner through shared FormulaCompiler, ScCompiler reference output and ScFormulaCell.GetFormula(GRAM_ODFF), directly enabling same-model ODS export. No UI implementation.

## Scope

Existing formula/source/core/api/FormulaCompiler.ts, sc/source/core/tool/compiler.ts, sc/source/core/data/formulacell.ts and their header facades as needed. Shared consumed Automatic/Max/erase/no-group RTL decimal specialization in sal/rtl/strtmpl.math.ts, with native JS shortest decimal decomposition and exact integer half-up rounding; formula/inc/core_resource.ts bounded real ODFF resource data reused by the scanner and serializer. English ODFF only; native shared compiler grammar state/default and native empty reference virtual are preserved; actual string/space tokens may serialize without promising interpreter support. Original buffer/output-reference contracts use actual OUString assignment or returned text fragments, no physical buffer/memory manager. Paired inventory/provenance/capabilities, readiness/journal docs and focused tests including numeric-format source witnesses and real Chromium/Worker formula serialization. No full locale/format modes, names/external/range/function/matrix/rewrite services or document-native grammar facade are claimed.

## Plan

1. Audit pinned FormulaCompiler token-array/token/AppendDouble flow, native RTL Automatic/Max rounding/exponent rules, ScCompiler ODFF reference convention and ScFormulaCell GetFormula. 2. Implement actual source owners and reuse native ODFF resource data and shared strings; preserve explicit unsupported boundaries. 3. Verify canonical source/result serialization, edits and A1 offset/absolute flags, signed zero/infinities/rounding/max/subnormal numeric cases, no mutation of code/RPN/result, and actual browser/Worker portability. 4. Update paired inventory without parity promotion; record raw100 whole Calc/changed shared and related tests, existing source gates, source/path/hash audits, commit and same-agent quality review.

## Verify Steps

node output/playwright/task202-checks/source-audit.mjs: pinned source behavior/markers/hashes, no native compilation.
node output/playwright/task202-checks/portable.mjs: whole Calc strict raw S/B/F/L100 exact owners plus all changed shared owners every raw counter positive and related compiler/token/SAL tests; all5native references absent/restored; Writer-only gaps exempt.
node output/playwright/task202-checks/browser-portable.mjs: production build and actual Calc formula serialization in Chromium and DOM-free Worker with all5native references absent/restored.
node output/playwright/task202-checks/source-gates.mjs: all13existing format/lint/types/docs/size/dependency/tree/provenance/inventory/routing/doctor/diff/boundary gates, no criteria relaxation.
Final exact path/hash/reference/coverage audit; recorded verification, source commit and same-agent quality review. No UI/ODS readiness or full all-app run until minimal ODS milestone.

## Verification

Command: node output/playwright/task202-checks/source-audit.mjs. Result: pass. Evidence:8pinned native source/resource/QA files;actual scalar ODFF resource entries;existing shared RPN method bodies byte-identical to pre-task source. Scope:source-order output,protected grammar default,Calc grammar/reference convention,RTL Automatic/Max decimal specialization. No native compilation or execution.
Command: node output/playwright/task202-checks/portable.mjs. Result: pass. Evidence:whole Calc215cases/84files with exact49executable owners;raw5070statements/3273branches/1034functions/4548lines all100 and every raw counter positive. Related206cases/45files and exact3changed shared owners;raw183/134/20/165 all100. Scope:actual formula/token/string/numeric owners and real cell serialization,all5source references absent/restored. No Writer-only coverage remediation.
Command: node output/playwright/task202-checks/browser-portable.mjs. Result: pass. Evidence:production build and5Chromium cases;each executes actual modules in page and DOM-free Worker,including forced/local-absolute reference serialization,re-entry and numeric result edit propagation. Scope:core portability only,all5native references absent/restored,no UI implementation.
Command: node output/playwright/task202-checks/source-gates.mjs (all13gates with recorded focused remediation/resume;final format/lint/types/docs pass after source changes). Result: pass. Evidence:format,lint,types,docs,size,dependencies,tree,provenance,inventory,routing,doctor,diff,boundaries. Native filename responsibility split documented in the paired provenance;no checker,allowlist or threshold edits. Existing managed-hook warning retained.
Command: node output/playwright/task202-checks/final-audit.mjs. Result: pass. Evidence:exact24non-task paths and final portable snapshot hashes,49Calc/3shared raw100,13gates,8pinned native sources and restored links. Scope:scalar ODFF formula serialization only;ODS filters,full service parity and UI remain pending. Full all-app run remains due at the user milestone,then pause. Same-agent quality review follows implementation commit.

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-10-18T13:49:21.770Z — VERIFY — ok

By: CODER

Note: Passed215Calc/206related cases;49Calc/3shared owners strict raw100;build+5Chromium/DOM-free Worker scenarios;13source gates;8pinned-source and24path/hash audit. Core formula serialization complete;ODS/UI readiness unclaimed.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-18T13:49:20.579Z, excerpt_hash=sha256:dcefb904098940759b4c2176972edea6e4ae46d637998eaec19c717c51df851d

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202610181334-NXE4RF/blueprint/resolved-snapshot.json
- old_digest: b73dc28e4bd8f471abdda2ac0e2b325ce1bd10bcab2e2253779a649a2c8219a6
- current_digest: b73dc28e4bd8f471abdda2ac0e2b325ce1bd10bcab2e2253779a649a2c8219a6
- route_changed: no
- safe_command: agentplane blueprint snapshot 202610181334-NXE4RF

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202610181334-NXE4RF
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: false
- repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert only the task202 implementation commit and associated inventory/docs;retain completed task201 and shared existing owners. No branch integration or user changes.

## Findings

Task202 initial focused assertions incorrectly expected prefix plus and a space immediately after equals to disappear; source-order serialization correctly preserves both, so expectations were corrected. Initial typecheck found an unused import after shared grammar-state reuse. Source review placed native SetGrammar in ScCompiler rather than shared FormulaCompiler; base protected GRAM_UNSPECIFIED default and empty-array return are retained, with native derived-class setup in direct base tests. Module-boundary validation rejected formula-to-i18nlangtag helpers; exact UTF16 OUString conversion now stays within shared SAL, tested with quotes,emoji and embedded zero. JSDoc callback contracts and the independently consumed numeric-template filename split were documented through existing provenance, without guard or threshold relaxation. Source-derived numeric precision behavior is journaled as CALC-187. No native C++ execution,network,UI,buffer-memory port or full all-app run. Final portable checks are pending;source gates currently pass.
