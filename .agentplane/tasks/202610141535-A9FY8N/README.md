---
id: "202610141535-A9FY8N"
title: "Restore native Type references in shared UNO Sequence indexing"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 9
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-14T15:35:24.599Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-10-14T15:39:33.569Z"
  updated_by: "CODER"
  note: "Verified source0e8a2e84add8 exact6paths3731sourcehashes4nativepins; shared Sequence Type methods/liveborrowedalias native contract. Related5tests wholeowner100, Calc174tests strict100;12gates33boundaries. Same-agent EVALUATOR not independent. UI/ODS readiness still pending."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-10-14T15:39:12.173Z"
  updated_by: "EVALUATOR"
  note: "Task133 source review: native Type const-element alias restored with existing shared view; all focused checks pass. Same-agent review is not independent."
  evaluated_sha: "0e8a2e84add80accfb554a08d73ad457cf5536dd"
  blueprint_digest: "3db984f9a0491d2c300ad7cd4a54a7c2bc57fb7de86b8e91e3fcba096865cf91"
  evidence_refs:
    - ".agentplane/tasks/202610141535-A9FY8N/README.md"
    - ".agentplane/tasks/202610141535-A9FY8N/quality/20261014-153912173-recovery-context/quality-report.json"
    - ".agentplane/tasks/202610141535-A9FY8N/quality/20261014-153912173-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202610141535-A9FY8N/quality/20261014-153912173-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202610141535-A9FY8N/blueprint/resolved-snapshot.json"
    - "output/playwright/task133-checks/value-coverage-audit.json"
    - "output/playwright/task133-checks/gates-results.json"
    - "output/playwright/task133-checks/original-source-review.json"
    - "output/playwright/task133-checks/boundary-tests.log"
  findings:
    - "Six scoped paths only; actual Type API, stable/shared alias, C element assignment, COW separation and explicit copy preserve native value/lifetime contracts without a new ownership engine. Original fixture streams unchanged. Entire shared Sequence and Calc strict raw100;12gates33boundaries pass."
commit: null
comments:
  -
    author: "CODER"
    body: "Start: restore shared Sequence Type index contract through existing borrowed view under explicit human canonical shared-code authorization."
events:
  -
    type: "status"
    at: "2026-10-14T15:35:29.948Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: restore shared Sequence Type index contract through existing borrowed view under explicit human canonical shared-code authorization."
  -
    type: "verify"
    at: "2026-10-14T15:39:33.569Z"
    author: "CODER"
    state: "ok"
    note: "Verified source0e8a2e84add8 exact6paths3731sourcehashes4nativepins; shared Sequence Type methods/liveborrowedalias native contract. Related5tests wholeowner100, Calc174tests strict100;12gates33boundaries. Same-agent EVALUATOR not independent. UI/ODS readiness still pending."
doc_version: 3
doc_updated_at: "2026-10-14T15:39:33.626Z"
doc_updated_by: "CODER"
description: "Task133: correct shared Sequence<Type> const index to the existing live borrowed Type view, retaining original sequence storage and consumer observations; prerequisite for real XTypeProvider/complex color transport. Standing human canonical shared/Writer authorization. No new memory library/native probes."
sections:
  Summary: "Task133 restores the native const Type element reference from shared Sequence<Type> indexing, reusing the existing borrowed Type alias. Explicit human authorization permits canonical shared and Writer corrections. Only calc branch/checkout, JS GC, no native compilation or new ownership engine."
  Scope: "At most10 paths: shared Sequence.ts, its Sequence.test.ts, an additional focused Type-index test, both existing Sequence registry records, calc-core progress, and task-local artifacts. Other template element/address contracts remain unchanged. No interfaces/components or UI/ODS completeness claim."
  Plan: "Task133: restore Sequence<Type> const indexing through existing borrowed Type view with exact native method/alias/counter contract; update real consumer observation and registry, strict wholeowner/Calc100 and12focusedgates, clean exactsource. Scope10paths. Human explicit canonical shared/Writer authorization already granted; no new lifetime mechanism, native compilation or readiness/full-run claim."
  Verify Steps: "Native Sequence.h const operator[] and Sequence.hxx implementation must return const E&, without acquiring/copying E. Real Sequence<Type> indexing returns actual Type prototype and stable view, shares underlying pointer cell, sees subsequent C-level assignment, leaves type counts unchanged and preserves held Type copy across sequence mutations. Existing complete Sequence fixture replays including scalar/Any/Reference/nested values pass unchanged native observation streams; only test observation adapts from erased cell to returned Type method. Invalid indices retain assertions. Related tests must cover every raw S/B/F/L counter of complete changed Sequence owner at100; npm run test:coverage:calc100, native links absent and restored. Run focused format/lint/typecheck/docs/size/dependency/tree/provenance/registry/routing/doctor/diff gates and existing boundaries. No browser changes; full suite only readiness checkpoint. Record exact commands, scopes and results; final clean calc with exact source commit."
  Verification: |-
    Command: node output/playwright/task133-checks/portable.mjs. Result: pass. Evidence: related5tests2files, entire shared Sequence owner68S42B24F64L100 and every raw counter positive; wholeCalc174tests67files33owners4162S2731B821F3710L100. All4native links absent during tests and restored finally. Scope: actual Type methods, stable no-acquire alias, same shared cell, real C assignment, COW separation and explicit Type copy lifetime; complete unchanged native Sequence fixture observation streams retained. Source0e8a2e84add80accfb554a08d73ad457cf5536dd. No native compiler/generator/binary/memory probe, threshold change or counter-map manipulation.

    Command: node output/playwright/task133-checks/gates.mjs; npx vitest run scripts/check-module-boundaries.test.ts. Result: pass. Evidence: all12scoped gates and33boundaries pass. Scope:6paths5existing1new,3730to3731sourcehashes,4originalsourceSHA256pins. Format/lint/typecheck/docs/size/dependencies/tree/provenance/inventory/routing/doctor/diff pass. Existing Sequence runtime/provenance records append this correction without rewriting history or broad unverified flags. This is host type erasure correction, so no upstream-suspected-issue record. Same-agent EVALUATOR review explicitly not independent.

    Skipped: full application/browser suites. Reason: no UI component changed; human full-run checkpoint requires actual minimum Calc UI/document and same-model ODS readiness, still pending. Risk: broader generic object-reference/ABI behavior, real UnoComplexColor/helper integration and document/UI/ODS not certified by this prerequisite. Approval: standing human focused-test/readiness instructions and explicit shared/Writer canonical correction authorization.

    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-10-14T15:39:33.569Z — VERIFY — ok

    By: CODER

    Note: Verified source0e8a2e84add8 exact6paths3731sourcehashes4nativepins; shared Sequence Type methods/liveborrowedalias native contract. Related5tests wholeowner100, Calc174tests strict100;12gates33boundaries. Same-agent EVALUATOR not independent. UI/ODS readiness still pending.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-14T15:39:33.083Z, excerpt_hash=sha256:5cbb0501b5824dc3758a36a5e82d46e5a1064c80674cd68942f992e3569b1435

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202610141535-A9FY8N/blueprint/resolved-snapshot.json
    - old_digest: 3db984f9a0491d2c300ad7cd4a54a7c2bc57fb7de86b8e91e3fcba096865cf91
    - current_digest: 3db984f9a0491d2c300ad7cd4a54a7c2bc57fb7de86b8e91e3fcba096865cf91
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202610141535-A9FY8N

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane commit 202610141535-A9FY8N -m 🧩 A9FY8N task: persist canonical task artifacts --allow-tasks
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: true
    - repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert only scoped task changes in a later authorized task; never reset other work or merge branches."
  Findings: "Clean calc preflight947b1ac6. Native Sequence.hxx const operator[] returns const E& directly from elements; returning raw Type pointer cell was a host binding discrepancy. Existing getTypeFromTypeDescriptionReference supplies a stable live view with no constructor/acquire. Source uses declared compiler Type specialization only, not runtime inferred value types. All other logical element and range-address contracts unchanged. Existing native fixture observer now reads returned Type through public getTypeLibType; original fixture bytes/counts/expected stream unchanged. Direct new Type test confirms methods, native no-acquire count, shared identity, C assignment visibility, getArray COW and independent owned Type copy. No native refcount or memory library introduced. No Writer consumer accommodation; future shared clients receive correct Type API. All5related and174Calc tests passed on first run at strict raw100,12gates33boundaries pass. Final source6paths within10approved,5existing1new3731sourceblobs4nativepins. Actual helper/component/ColorItem Any and document/UI/ODS remain next prerequisites; no readiness or full-run claim. Same-agent evaluator not independent."
id_source: "generated"
---
## Summary

Task133 restores the native const Type element reference from shared Sequence<Type> indexing, reusing the existing borrowed Type alias. Explicit human authorization permits canonical shared and Writer corrections. Only calc branch/checkout, JS GC, no native compilation or new ownership engine.

## Scope

At most10 paths: shared Sequence.ts, its Sequence.test.ts, an additional focused Type-index test, both existing Sequence registry records, calc-core progress, and task-local artifacts. Other template element/address contracts remain unchanged. No interfaces/components or UI/ODS completeness claim.

## Plan

Task133: restore Sequence<Type> const indexing through existing borrowed Type view with exact native method/alias/counter contract; update real consumer observation and registry, strict wholeowner/Calc100 and12focusedgates, clean exactsource. Scope10paths. Human explicit canonical shared/Writer authorization already granted; no new lifetime mechanism, native compilation or readiness/full-run claim.

## Verify Steps

Native Sequence.h const operator[] and Sequence.hxx implementation must return const E&, without acquiring/copying E. Real Sequence<Type> indexing returns actual Type prototype and stable view, shares underlying pointer cell, sees subsequent C-level assignment, leaves type counts unchanged and preserves held Type copy across sequence mutations. Existing complete Sequence fixture replays including scalar/Any/Reference/nested values pass unchanged native observation streams; only test observation adapts from erased cell to returned Type method. Invalid indices retain assertions. Related tests must cover every raw S/B/F/L counter of complete changed Sequence owner at100; npm run test:coverage:calc100, native links absent and restored. Run focused format/lint/typecheck/docs/size/dependency/tree/provenance/registry/routing/doctor/diff gates and existing boundaries. No browser changes; full suite only readiness checkpoint. Record exact commands, scopes and results; final clean calc with exact source commit.

## Verification

Command: node output/playwright/task133-checks/portable.mjs. Result: pass. Evidence: related5tests2files, entire shared Sequence owner68S42B24F64L100 and every raw counter positive; wholeCalc174tests67files33owners4162S2731B821F3710L100. All4native links absent during tests and restored finally. Scope: actual Type methods, stable no-acquire alias, same shared cell, real C assignment, COW separation and explicit Type copy lifetime; complete unchanged native Sequence fixture observation streams retained. Source0e8a2e84add80accfb554a08d73ad457cf5536dd. No native compiler/generator/binary/memory probe, threshold change or counter-map manipulation.

Command: node output/playwright/task133-checks/gates.mjs; npx vitest run scripts/check-module-boundaries.test.ts. Result: pass. Evidence: all12scoped gates and33boundaries pass. Scope:6paths5existing1new,3730to3731sourcehashes,4originalsourceSHA256pins. Format/lint/typecheck/docs/size/dependencies/tree/provenance/inventory/routing/doctor/diff pass. Existing Sequence runtime/provenance records append this correction without rewriting history or broad unverified flags. This is host type erasure correction, so no upstream-suspected-issue record. Same-agent EVALUATOR review explicitly not independent.

Skipped: full application/browser suites. Reason: no UI component changed; human full-run checkpoint requires actual minimum Calc UI/document and same-model ODS readiness, still pending. Risk: broader generic object-reference/ABI behavior, real UnoComplexColor/helper integration and document/UI/ODS not certified by this prerequisite. Approval: standing human focused-test/readiness instructions and explicit shared/Writer canonical correction authorization.

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-10-14T15:39:33.569Z — VERIFY — ok

By: CODER

Note: Verified source0e8a2e84add8 exact6paths3731sourcehashes4nativepins; shared Sequence Type methods/liveborrowedalias native contract. Related5tests wholeowner100, Calc174tests strict100;12gates33boundaries. Same-agent EVALUATOR not independent. UI/ODS readiness still pending.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-14T15:39:33.083Z, excerpt_hash=sha256:5cbb0501b5824dc3758a36a5e82d46e5a1064c80674cd68942f992e3569b1435

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202610141535-A9FY8N/blueprint/resolved-snapshot.json
- old_digest: 3db984f9a0491d2c300ad7cd4a54a7c2bc57fb7de86b8e91e3fcba096865cf91
- current_digest: 3db984f9a0491d2c300ad7cd4a54a7c2bc57fb7de86b8e91e3fcba096865cf91
- route_changed: no
- safe_command: agentplane blueprint snapshot 202610141535-A9FY8N

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane commit 202610141535-A9FY8N -m 🧩 A9FY8N task: persist canonical task artifacts --allow-tasks
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: true
- repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert only scoped task changes in a later authorized task; never reset other work or merge branches.

## Findings

Clean calc preflight947b1ac6. Native Sequence.hxx const operator[] returns const E& directly from elements; returning raw Type pointer cell was a host binding discrepancy. Existing getTypeFromTypeDescriptionReference supplies a stable live view with no constructor/acquire. Source uses declared compiler Type specialization only, not runtime inferred value types. All other logical element and range-address contracts unchanged. Existing native fixture observer now reads returned Type through public getTypeLibType; original fixture bytes/counts/expected stream unchanged. Direct new Type test confirms methods, native no-acquire count, shared identity, C assignment visibility, getArray COW and independent owned Type copy. No native refcount or memory library introduced. No Writer consumer accommodation; future shared clients receive correct Type API. All5related and174Calc tests passed on first run at strict raw100,12gates33boundaries pass. Final source6paths within10approved,5existing1new3731sourceblobs4nativepins. Actual helper/component/ColorItem Any and document/UI/ODS remain next prerequisites; no readiness or full-run claim. Same-agent evaluator not independent.
