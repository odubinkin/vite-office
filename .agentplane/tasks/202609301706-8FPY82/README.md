---
id: "202609301706-8FPY82"
title: "Restore native XML tab and unit conversion module ownership"
result_summary: "Tab context now lives in style/xmltabi.ts under the native SvxXMLTabStopImportContext name, conversion in core/xmluconv.ts, and text-property dispatch imports the correct owner without compatibility re-exports. AST equality and 27 unchanged focused tests passed; full 577 application, 109 inventory and 19 browser tests passed at 100% required coverage. All gates, doctor and routing passed. Deliberate deviations remain intact; wider contracts and the overall audit remain open."
status: "DONE"
priority: "med"
owner: "CODER"
revision: 10
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-09-30T17:07:29.190Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-09-30T17:17:44.385Z"
  updated_by: "CODER"
  note: "Command: npm run verify. Result: pass (exit 0). Evidence: verify.log; 577 application, 109 inventory, 19 browser tests; required coverage 100%; all dependency/build/static/docs/source/invariant/parity gates, 194 provenance modules and semanticViolationCount=0. AST equality in architecture.log and 27 unchanged focused tests pass. Doctor/routing pass. Scope: native XML dispatch/tab/conversion responsibility split and direct consumer imports; wider contracts remain unverified."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-09-30T17:18:15.339Z"
  updated_by: "EVALUATOR"
  note: "Existing XML tab-import and bounded conversion implementations now reside in their native style/core owners; dispatcher and all direct consumers use the corresponding modules."
  evaluated_sha: "cfdbf407ac5c42f45358d3f5fa94cfd2eba712b7"
  blueprint_digest: "09fd8aa3242f965f9b0249b2ff7ffa18b589f6d3b5e66493f8e040be32aebf1b"
  evidence_refs:
    - ".agentplane/tasks/202609301706-8FPY82/README.md"
    - ".agentplane/tasks/202609301706-8FPY82/quality/20260930-171815339-recovery-context/quality-report.json"
    - ".agentplane/tasks/202609301706-8FPY82/quality/20260930-171815339-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202609301706-8FPY82/quality/20260930-171815339-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202609301706-8FPY82/blueprint/resolved-snapshot.json"
    - ".agentplane/tasks/202609301706-8FPY82/architecture.log"
    - ".agentplane/tasks/202609301706-8FPY82/verify.log"
  findings:
    - "Reviewed native dispatch, xmltabi and xmluconv ownership against pinned sources. AST equality proves all four context members and complete converter unchanged. No compatibility aliases, new parser/default behavior, test rewrites, validators/schemas/generators or deliberate product changes. Metadata narrows dispatch and adds separate unverified owner records without unrelated reordering. 27 existing focused tests and full 577/109/19 verification at 100% coverage passed; doctor/routing pass. Native leaf defaults/fallback and complete conversion contracts remain open."
commit:
  hash: "cfdbf407ac5c42f45358d3f5fa94cfd2eba712b7"
  message: "🛠️ 8FPY82 task: restore XML tab and unit source owners"
comments:
  -
    author: "CODER"
    body: "Start: separate existing tab-import and length-conversion bodies into the pinned style/core owners and update direct consumers without behavior changes."
  -
    author: "CODER"
    body: "Verified: native XML dispatch, tab-import and conversion responsibilities are separated into their pinned owners with unchanged implementation bodies and updated direct consumers; full verification passes."
events:
  -
    type: "status"
    at: "2026-09-30T17:07:30.060Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: separate existing tab-import and length-conversion bodies into the pinned style/core owners and update direct consumers without behavior changes."
  -
    type: "verify"
    at: "2026-09-30T17:17:44.385Z"
    author: "CODER"
    state: "ok"
    note: "Command: npm run verify. Result: pass (exit 0). Evidence: verify.log; 577 application, 109 inventory, 19 browser tests; required coverage 100%; all dependency/build/static/docs/source/invariant/parity gates, 194 provenance modules and semanticViolationCount=0. AST equality in architecture.log and 27 unchanged focused tests pass. Doctor/routing pass. Scope: native XML dispatch/tab/conversion responsibility split and direct consumer imports; wider contracts remain unverified."
  -
    type: "status"
    at: "2026-09-30T17:18:39.611Z"
    author: "CODER"
    from: "DOING"
    to: "DONE"
    note: "Verified: native XML dispatch, tab-import and conversion responsibilities are separated into their pinned owners with unchanged implementation bodies and updated direct consumers; full verification passes."
doc_version: 3
doc_updated_at: "2026-09-30T17:18:39.612Z"
doc_updated_by: "CODER"
description: "One architecture refactor under the approved iterative parity goal: separate native tab-import and shared unit-conversion responsibilities from XMLTextPropertySetContext into their pinned source owners, preserving implementation behavior and updating direct consumers and provenance."
sections:
  Summary: |-
    Restore native XML tab and unit conversion module ownership

    One architecture refactor under the approved iterative parity goal: separate native tab-import and shared unit-conversion responsibilities from XMLTextPropertySetContext into their pinned source owners, preserving implementation behavior and updating direct consumers and provenance.
  Scope: "apps/office/src/xmloff/source/text/XMLTextPropertySetContext.ts; new apps/office/src/xmloff/source/style/xmltabi.ts and core/xmluconv.ts; direct consumers style/xmlstyle.ts, table/XMLTableImport.ts and text/XMLLineNumberingImportContext.ts; docs/program/parity/runtime-inventory.json and docs/program/source-provenance.json; canonical task artifacts. Move existing tab/context and conversion bodies unchanged, use the pinned tab context name, update direct imports and owner evidence, and remove old helper exports/embedded classes. No parser/default/domain changes, compatibility re-exports, tests mirroring implementation, validators/schemas/generators, unsupported APIs or deliberate product deviations."
  Plan: "CODER performs one native source-owner architecture refactor. Extract existing XMLTabStopsContext from text/XMLTextPropertySetContext.ts into style/xmltabi.ts, export it as SvxXMLTabStopImportContext, and keep all member logic unchanged. Move the complete importOdfLength function into core/xmluconv.ts unchanged. Keep the text module as the element-property dispatcher; update its context construction and all direct conversion imports in xmlstyle.ts, XMLTableImport.ts and XMLLineNumberingImportContext.ts, with no old re-exports or static cycle. Update runtime inventory and provenance for the two new source owners and narrowed dispatcher evidence; keep broader contracts unverified. Use AST body equality and existing focused source-backed ODT/consumer tests, then full npm run verify at 100%, doctor/routing and scoped review. Record verification and quality evidence, implementation commit and clean close. Work is local direct mode; no network, behavior/default changes, unsupported APIs, validators/schema/generators or conscious product-policy changes."
  Verify Steps: "1. TypeScript AST comparison against pre-refactor HEAD proves tab context member implementations and complete conversion function body are unchanged; only native class naming/export and module imports change. 2. Inspect dispatch and all length imports: XMLTextPropertySetContext exports only its dispatcher, creates the native-named context in style/xmltabi, and every direct length consumer imports core/xmluconv without compatibility aliases. 3. Existing focused mapped ODT, signed paragraph, line-number/table and native tab tests pass unchanged, covering signed values, Default source order, empty sequences and shared conversion consumers. 4. npm run verify passes every required gate at 100% coverage; ap doctor and node .agentplane/policy/check-routing.mjs pass. New runtime/provenance entries map each implemented responsibility to its pinned owner without semantic promotion. 5. Review scoped diff and finish with clean tracked/untracked git status."
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-09-30T17:17:44.385Z — VERIFY — ok

    By: CODER

    Note: Command: npm run verify. Result: pass (exit 0). Evidence: verify.log; 577 application, 109 inventory, 19 browser tests; required coverage 100%; all dependency/build/static/docs/source/invariant/parity gates, 194 provenance modules and semanticViolationCount=0. AST equality in architecture.log and 27 unchanged focused tests pass. Doctor/routing pass. Scope: native XML dispatch/tab/conversion responsibility split and direct consumer imports; wider contracts remain unverified.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-30T17:17:44.023Z, excerpt_hash=sha256:4b56a3e17ff3a521b9fa94e7b2236449cdf1612408aa28425ffcb3013330eb89

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609301706-8FPY82/blueprint/resolved-snapshot.json
    - old_digest: 09fd8aa3242f965f9b0249b2ff7ffa18b589f6d3b5e66493f8e040be32aebf1b
    - current_digest: 09fd8aa3242f965f9b0249b2ff7ffa18b589f6d3b5e66493f8e040be32aebf1b
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202609301706-8FPY82

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202609301706-8FPY82
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
  Findings: |-
    - Observation: The local XMLTextPropertySetContext module embedded tab parsing/selection and a shared length converter. Pinned XMLTextPropertySetContext.cxx dispatches to SvxXMLTabStopImportContext in style/xmltabi.cxx, while generic conversion is owned by core/xmluconv.cxx. Three other direct consumers imported conversion from the dispatcher.
      Impact: Temporary mixed ownership obscured the native responsibility graph and coupled paragraph/style, table and line-number conversion to a text-property context.
      Resolution: Extracted the tab context into style/xmltabi.ts with the pinned SvxXMLTabStopImportContext name and the complete importOdfLength helper into core/xmluconv.ts; the dispatcher and every direct consumer now import the correct owner with no compatibility re-export. AST comparison proves all four context members and the complete function unchanged (architecture.log). Metadata maps the narrowed dispatcher and two new owners individually, preserves existing record order, and leaves broader contracts/defaults unverified. Existing focused tests passed unchanged (27). Command: npm run verify. Result: pass (exit 0). Evidence: verify.log; 577 application, 109 inventory and 19 browser tests, all required coverage 100%, 193 runtime source dependency checks, 194 provenance modules (118 mapped), all build/static/docs/source/invariant/parity gates; semanticViolationCount=0. Doctor/routing passed with pre-existing doctor warnings. No parser/default behavior, tests, validators/schemas/generators or deliberate product deviations were changed. Native tab leaf default/fallback and full conversion contracts remain open.
id_source: "generated"
---
## Summary

Restore native XML tab and unit conversion module ownership

One architecture refactor under the approved iterative parity goal: separate native tab-import and shared unit-conversion responsibilities from XMLTextPropertySetContext into their pinned source owners, preserving implementation behavior and updating direct consumers and provenance.

## Scope

apps/office/src/xmloff/source/text/XMLTextPropertySetContext.ts; new apps/office/src/xmloff/source/style/xmltabi.ts and core/xmluconv.ts; direct consumers style/xmlstyle.ts, table/XMLTableImport.ts and text/XMLLineNumberingImportContext.ts; docs/program/parity/runtime-inventory.json and docs/program/source-provenance.json; canonical task artifacts. Move existing tab/context and conversion bodies unchanged, use the pinned tab context name, update direct imports and owner evidence, and remove old helper exports/embedded classes. No parser/default/domain changes, compatibility re-exports, tests mirroring implementation, validators/schemas/generators, unsupported APIs or deliberate product deviations.

## Plan

CODER performs one native source-owner architecture refactor. Extract existing XMLTabStopsContext from text/XMLTextPropertySetContext.ts into style/xmltabi.ts, export it as SvxXMLTabStopImportContext, and keep all member logic unchanged. Move the complete importOdfLength function into core/xmluconv.ts unchanged. Keep the text module as the element-property dispatcher; update its context construction and all direct conversion imports in xmlstyle.ts, XMLTableImport.ts and XMLLineNumberingImportContext.ts, with no old re-exports or static cycle. Update runtime inventory and provenance for the two new source owners and narrowed dispatcher evidence; keep broader contracts unverified. Use AST body equality and existing focused source-backed ODT/consumer tests, then full npm run verify at 100%, doctor/routing and scoped review. Record verification and quality evidence, implementation commit and clean close. Work is local direct mode; no network, behavior/default changes, unsupported APIs, validators/schema/generators or conscious product-policy changes.

## Verify Steps

1. TypeScript AST comparison against pre-refactor HEAD proves tab context member implementations and complete conversion function body are unchanged; only native class naming/export and module imports change. 2. Inspect dispatch and all length imports: XMLTextPropertySetContext exports only its dispatcher, creates the native-named context in style/xmltabi, and every direct length consumer imports core/xmluconv without compatibility aliases. 3. Existing focused mapped ODT, signed paragraph, line-number/table and native tab tests pass unchanged, covering signed values, Default source order, empty sequences and shared conversion consumers. 4. npm run verify passes every required gate at 100% coverage; ap doctor and node .agentplane/policy/check-routing.mjs pass. New runtime/provenance entries map each implemented responsibility to its pinned owner without semantic promotion. 5. Review scoped diff and finish with clean tracked/untracked git status.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-09-30T17:17:44.385Z — VERIFY — ok

By: CODER

Note: Command: npm run verify. Result: pass (exit 0). Evidence: verify.log; 577 application, 109 inventory, 19 browser tests; required coverage 100%; all dependency/build/static/docs/source/invariant/parity gates, 194 provenance modules and semanticViolationCount=0. AST equality in architecture.log and 27 unchanged focused tests pass. Doctor/routing pass. Scope: native XML dispatch/tab/conversion responsibility split and direct consumer imports; wider contracts remain unverified.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-30T17:17:44.023Z, excerpt_hash=sha256:4b56a3e17ff3a521b9fa94e7b2236449cdf1612408aa28425ffcb3013330eb89

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609301706-8FPY82/blueprint/resolved-snapshot.json
- old_digest: 09fd8aa3242f965f9b0249b2ff7ffa18b589f6d3b5e66493f8e040be32aebf1b
- current_digest: 09fd8aa3242f965f9b0249b2ff7ffa18b589f6d3b5e66493f8e040be32aebf1b
- route_changed: no
- safe_command: agentplane blueprint snapshot 202609301706-8FPY82

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202609301706-8FPY82
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

- Observation: The local XMLTextPropertySetContext module embedded tab parsing/selection and a shared length converter. Pinned XMLTextPropertySetContext.cxx dispatches to SvxXMLTabStopImportContext in style/xmltabi.cxx, while generic conversion is owned by core/xmluconv.cxx. Three other direct consumers imported conversion from the dispatcher.
  Impact: Temporary mixed ownership obscured the native responsibility graph and coupled paragraph/style, table and line-number conversion to a text-property context.
  Resolution: Extracted the tab context into style/xmltabi.ts with the pinned SvxXMLTabStopImportContext name and the complete importOdfLength helper into core/xmluconv.ts; the dispatcher and every direct consumer now import the correct owner with no compatibility re-export. AST comparison proves all four context members and the complete function unchanged (architecture.log). Metadata maps the narrowed dispatcher and two new owners individually, preserves existing record order, and leaves broader contracts/defaults unverified. Existing focused tests passed unchanged (27). Command: npm run verify. Result: pass (exit 0). Evidence: verify.log; 577 application, 109 inventory and 19 browser tests, all required coverage 100%, 193 runtime source dependency checks, 194 provenance modules (118 mapped), all build/static/docs/source/invariant/parity gates; semanticViolationCount=0. Doctor/routing passed with pre-existing doctor warnings. No parser/default behavior, tests, validators/schemas/generators or deliberate product deviations were changed. Native tab leaf default/fallback and full conversion contracts remain open.
