---
id: "202611201136-3T5Y12"
title: "Port Calc ODS typed values and formula result attributes"
result_summary: "Verified Calc ODS typed scalar attributes and native formula cache round trips through the ODF filter and Worker"
status: "DONE"
priority: "high"
owner: "CODER"
revision: 11
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify:
  - "npm run test:calc -- src/sc/source/filter/xml src/sc/browser/filter/xml --maxWorkers 2 --testTimeout 120000"
  - "npm run typecheck --workspace @vite-office/office"
plan_approval:
  state: "approved"
  updated_at: "2026-11-20T11:36:24.675Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-11-20T11:50:10.411Z"
  updated_by: "CODER"
  note: "Verified Calc ODS typed scalar attributes and native formula cache round trips through the ODF filter and Worker"
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-11-20T11:49:58.264Z"
  updated_by: "EVALUATOR"
  note: "Same-agent review checked pinned scalar, temporal, number-format and cache contracts against the actual Calc and Worker entry points."
  evaluated_sha: "96a414491e30f929da6c8de14640912bc9094338"
  blueprint_digest: "a55f2524791cf974472aa52c8cff43f197332504ace4c1e2a1b66b5bff48fad1"
  evidence_refs:
    - ".agentplane/tasks/202611201136-3T5Y12/README.md"
    - ".agentplane/tasks/202611201136-3T5Y12/quality/20261120-114958264-recovery-context/quality-report.json"
    - ".agentplane/tasks/202611201136-3T5Y12/quality/20261120-114958264-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202611201136-3T5Y12/quality/20261120-114958264-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202611201136-3T5Y12/blueprint/resolved-snapshot.json"
    - "138 Calc assertions, 14 shared conversion assertions, external-ref-cache.ods and tdf126116 short-date assertions"
  findings:
    - "The represented Calc model retains its numeric scalar owner and formatter, including the ODS date-format exception for formulas and numeric nonbinary logical values."
commit:
  hash: "96a414491e30f929da6c8de14640912bc9094338"
  message: "🧩 3T5Y12 code: preserve typed Calc ODS values and formula caches"
comments:
  -
    author: "CODER"
    body: "Start: continue direct-mode task in current checkout."
  -
    author: "CODER"
    body: "Verified: Verified Calc ODS typed scalar attributes and native formula cache round trips through the ODF filter and Worker. Guided shortcut recorded verification and is closing the direct task with traceable commit metadata."
events:
  -
    type: "status"
    at: "2026-11-20T11:36:34.448Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: continue direct-mode task in current checkout."
  -
    type: "verify"
    at: "2026-11-20T11:49:55.633Z"
    author: "CODER"
    state: "ok"
    note: "Verified Calc ODS value categories, null dates, formula cache adoption and registration across ODS and Worker paths."
  -
    type: "verify"
    at: "2026-11-20T11:50:10.411Z"
    author: "CODER"
    state: "ok"
    note: "Verified Calc ODS typed scalar attributes and native formula cache round trips through the ODF filter and Worker"
  -
    type: "status"
    at: "2026-11-20T11:50:10.714Z"
    author: "CODER"
    from: "DOING"
    to: "DONE"
    note: "Verified: Verified Calc ODS typed scalar attributes and native formula cache round trips through the ODF filter and Worker. Guided shortcut recorded verification and is closing the direct task with traceable commit metadata."
doc_version: 3
doc_updated_at: "2026-11-20T11:50:10.715Z"
doc_updated_by: "CODER"
description: "Import and export native ODF scalar categories and supported hybrid formula caches directly in the Calc model, with LibreOffice date, duration and number-format rules."
sections:
  Summary: |-
    Port Calc ODS typed values and formula result attributes

    Import and export native ODF scalar categories and supported hybrid formula caches directly in the Calc model, with LibreOffice date, duration and number-format rules.
  Scope: "Calc XML cell import and export, number-format routing, supported formula result caching, shared SAX and xmloff date/duration and attribute helpers, ODS and helper tests and Calc upstream evidence."
  Plan: "Port SAX scalar admission and temporal serial conversion, associate native effective number formats with values, preserve represented hybrid formula caches, and export typed ODF scalar attributes from native format keys. Port applicable Calc QA assertions and record surprising pinned branches."
  Verify Steps: |-
    1. npm run test:calc -- src/sc/source/filter/xml src/sc/browser/filter/xml --maxWorkers 2 --testTimeout 120000. Verify typed values, authored formats, date origin and ODS package round trips.
    2. Run shared SAX and xmloff conversion tests for changed helpers.
    3. npm run typecheck --workspace @vite-office/office, git diff --check, ap doctor, and node .agentplane/policy/check-routing.mjs.
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-11-20T11:49:55.633Z — VERIFY — ok

    By: CODER

    Note: Verified Calc ODS value categories, null dates, formula cache adoption and registration across ODS and Worker paths.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-11-20T11:36:34.448Z, excerpt_hash=sha256:ae4b93f0be46e956f252f3f85c3f00da812ed2566dd4a1746c7cd897e48f4f22

    Details:

    npm run test:calc -- src/sc/source/filter/xml src/sc/browser/filter/xml src/sc/source/core/data/documentimport --maxWorkers 2 --testTimeout 120000: 138 passed in 27 files. npm run test:shared -- src/sax/source/tools/converter-temporal.test.ts src/xmloff/source/core/xmluconv.test.ts --maxWorkers 1: 14 passed. Initial focused Calc failures confirmed new cache semantics and uncovered external-link registration. Both cases passed on the final run. Application typecheck, scoped ESLint, diff check, module boundaries, source tree, provenance, shared registry, routing and doctor passed. Full application test run remains on the requested ten-task cadence.

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202611201136-3T5Y12/blueprint/resolved-snapshot.json
    - old_digest: a55f2524791cf974472aa52c8cff43f197332504ace4c1e2a1b66b5bff48fad1
    - current_digest: a55f2524791cf974472aa52c8cff43f197332504ace4c1e2a1b66b5bff48fad1
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202611201136-3T5Y12

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202611201136-3T5Y12
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: false
    - repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
    - risks: none

    ### 2026-11-20T11:50:10.411Z — VERIFY — ok

    By: CODER

    Note: Verified Calc ODS typed scalar attributes and native formula cache round trips through the ODF filter and Worker
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-11-20T11:49:55.882Z, excerpt_hash=sha256:ae4b93f0be46e956f252f3f85c3f00da812ed2566dd4a1746c7cd897e48f4f22

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202611201136-3T5Y12/blueprint/resolved-snapshot.json
    - old_digest: a55f2524791cf974472aa52c8cff43f197332504ace4c1e2a1b66b5bff48fad1
    - current_digest: a55f2524791cf974472aa52c8cff43f197332504ace4c1e2a1b66b5bff48fad1
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202611201136-3T5Y12

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task complete 202611201136-3T5Y12 --result verified-202611201136-3T5Y12 --commit df074b51e5a69b4331988257b7f7a3d5ef947d8c
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: true
    - repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert this task implementation and its associated tests and source findings together."
  Findings: ""
id_source: "generated"
---
## Summary

Port Calc ODS typed values and formula result attributes

Import and export native ODF scalar categories and supported hybrid formula caches directly in the Calc model, with LibreOffice date, duration and number-format rules.

## Scope

Calc XML cell import and export, number-format routing, supported formula result caching, shared SAX and xmloff date/duration and attribute helpers, ODS and helper tests and Calc upstream evidence.

## Plan

Port SAX scalar admission and temporal serial conversion, associate native effective number formats with values, preserve represented hybrid formula caches, and export typed ODF scalar attributes from native format keys. Port applicable Calc QA assertions and record surprising pinned branches.

## Verify Steps

1. npm run test:calc -- src/sc/source/filter/xml src/sc/browser/filter/xml --maxWorkers 2 --testTimeout 120000. Verify typed values, authored formats, date origin and ODS package round trips.
2. Run shared SAX and xmloff conversion tests for changed helpers.
3. npm run typecheck --workspace @vite-office/office, git diff --check, ap doctor, and node .agentplane/policy/check-routing.mjs.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-11-20T11:49:55.633Z — VERIFY — ok

By: CODER

Note: Verified Calc ODS value categories, null dates, formula cache adoption and registration across ODS and Worker paths.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-11-20T11:36:34.448Z, excerpt_hash=sha256:ae4b93f0be46e956f252f3f85c3f00da812ed2566dd4a1746c7cd897e48f4f22

Details:

npm run test:calc -- src/sc/source/filter/xml src/sc/browser/filter/xml src/sc/source/core/data/documentimport --maxWorkers 2 --testTimeout 120000: 138 passed in 27 files. npm run test:shared -- src/sax/source/tools/converter-temporal.test.ts src/xmloff/source/core/xmluconv.test.ts --maxWorkers 1: 14 passed. Initial focused Calc failures confirmed new cache semantics and uncovered external-link registration. Both cases passed on the final run. Application typecheck, scoped ESLint, diff check, module boundaries, source tree, provenance, shared registry, routing and doctor passed. Full application test run remains on the requested ten-task cadence.

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202611201136-3T5Y12/blueprint/resolved-snapshot.json
- old_digest: a55f2524791cf974472aa52c8cff43f197332504ace4c1e2a1b66b5bff48fad1
- current_digest: a55f2524791cf974472aa52c8cff43f197332504ace4c1e2a1b66b5bff48fad1
- route_changed: no
- safe_command: agentplane blueprint snapshot 202611201136-3T5Y12

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202611201136-3T5Y12
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: false
- repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
- risks: none

### 2026-11-20T11:50:10.411Z — VERIFY — ok

By: CODER

Note: Verified Calc ODS typed scalar attributes and native formula cache round trips through the ODF filter and Worker
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-11-20T11:49:55.882Z, excerpt_hash=sha256:ae4b93f0be46e956f252f3f85c3f00da812ed2566dd4a1746c7cd897e48f4f22

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202611201136-3T5Y12/blueprint/resolved-snapshot.json
- old_digest: a55f2524791cf974472aa52c8cff43f197332504ace4c1e2a1b66b5bff48fad1
- current_digest: a55f2524791cf974472aa52c8cff43f197332504ace4c1e2a1b66b5bff48fad1
- route_changed: no
- safe_command: agentplane blueprint snapshot 202611201136-3T5Y12

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task complete 202611201136-3T5Y12 --result verified-202611201136-3T5Y12 --commit df074b51e5a69b4331988257b7f7a3d5ef947d8c
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: true
- repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert this task implementation and its associated tests and source findings together.

## Findings
