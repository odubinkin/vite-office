---
id: "202608101030-KVFYSK"
title: "Extract pinned LibreOffice JunitTest source targets into atomic records"
status: "DOING"
priority: "high"
owner: "CODER"
revision: 13
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-08-10T10:32:14.693Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-08-10T10:42:00.725Z"
  updated_by: "REVIEWER"
  note: "Verified: full npm verify passed; regeneration was byte-identical; all 160 Junit Java targets link to constructor IDs with 156 tracked and 4 explicit missing paths."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-08-10T10:42:07.616Z"
  updated_by: "EVALUATOR"
  note: "Pinned JunitTest Java source-target inventory satisfies the approved provenance-only scope."
  evaluated_sha: "a8d1ebac24d3843235a0c50a532b71aa23e03c54"
  blueprint_digest: "6b9e210e69711dd1ef1a775da95d558c86f3ff48713ebe6ae318f571f775971e"
  evidence_refs:
    - ".agentplane/tasks/202608101030-KVFYSK/README.md"
    - ".agentplane/tasks/202608101030-KVFYSK/quality/20260810-104207616-recovery-context/quality-report.json"
    - ".agentplane/tasks/202608101030-KVFYSK/quality/20260810-104207616-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202608101030-KVFYSK/quality/20260810-104207616-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202608101030-KVFYSK/blueprint/resolved-snapshot.json"
    - "npm run verify"
  findings:
    - "No defects found; full verification, path classification, and deterministic regeneration passed."
commit: null
comments:
  -
    author: "CODER"
    body: "Start: extract deterministic linked Java source-target provenance from pinned JunitTest declarations."
events:
  -
    type: "status"
    at: "2026-08-10T10:30:41.771Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: extract deterministic linked Java source-target provenance from pinned JunitTest declarations."
  -
    type: "verify"
    at: "2026-08-10T10:42:00.725Z"
    author: "REVIEWER"
    state: "ok"
    note: "Verified: full npm verify passed; regeneration was byte-identical; all 160 Junit Java targets link to constructor IDs with 156 tracked and 4 explicit missing paths."
doc_version: 3
doc_updated_at: "2026-08-10T10:42:00.840Z"
doc_updated_by: "CODER"
description: "Parse pinned gb_JunitTest_add_sourcefiles declarations into deterministic provenance-only Java source-target records linked to existing JunitTest constructor IDs without copying source content or claiming test parity."
sections:
  Summary: |-
    Extract pinned LibreOffice JunitTest source targets into atomic records

    Parse pinned gb_JunitTest_add_sourcefiles declarations into deterministic provenance-only Java source-target records linked to existing JunitTest constructor IDs without copying source content or claiming test parity.
  Scope: "In scope: deterministic provenance-only extraction of Java paths declared through pinned gb_JunitTest_add_sourcefiles macros, linked only to existing JunitTest constructor IDs. Every literal declaration remains visible: Git-tracked paths and declared-but-absent paths receive distinct explicit statuses. Out of scope: copying Java source, evaluating Make expressions, modifying prior Cppunit inventory, or claiming test parity."
  Plan: "1. Identify stable gb_JunitTest_add_sourcefiles declaration forms and Make-expression boundaries. 2. Extract exact Java source target records and link them to pinned JunitTest constructor IDs. 3. Verify each literal target against pinned Git and preserve declared-but-absent paths with explicit status rather than hiding them. 4. Cover parser and corpus generation at 100%, generate canonical JSON and program documentation. 5. Prove deterministic regeneration and run full verification."
  Verify Steps: "1. Run strict TypeScript, lint, JSDoc, and size checks. 2. Run inventory coverage at 100%. 3. Prove deterministic byte-identical regeneration. 4. Compare every generated Java target with the pinned core Git path set and existing Junit constructor evidence, including explicit absence status. 5. Run npm run verify, agentplane doctor, and policy routing."
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-08-10T10:42:00.725Z — VERIFY — ok

    By: REVIEWER

    Note: Verified: full npm verify passed; regeneration was byte-identical; all 160 Junit Java targets link to constructor IDs with 156 tracked and 4 explicit missing paths.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-08-10T10:32:14.350Z, excerpt_hash=sha256:ee46a39c937640e5458bf76d2edf3bae134e83bdc578303bb220d162a5157ab0

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202608101030-KVFYSK/blueprint/resolved-snapshot.json
    - old_digest: 6b9e210e69711dd1ef1a775da95d558c86f3ff48713ebe6ae318f571f775971e
    - current_digest: 6b9e210e69711dd1ef1a775da95d558c86f3ff48713ebe6ae318f571f775971e
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202608101030-KVFYSK

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task run 202608101030-KVFYSK
    - diagnostic_command: agentplane task run status 202608101030-KVFYSK
    - source_of_truth: route=task_next_action diagnostic=runner_status remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: true
    - repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
    - runner_required: true
    - runner_failure_means: runner_infrastructure_or_task_unknown
    - risks: runner_rail_confusion

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert only this task commits and rerun npm run verify; no ignored reference content is modified."
  Findings: ""
id_source: "generated"
---
## Summary

Extract pinned LibreOffice JunitTest source targets into atomic records

Parse pinned gb_JunitTest_add_sourcefiles declarations into deterministic provenance-only Java source-target records linked to existing JunitTest constructor IDs without copying source content or claiming test parity.

## Scope

In scope: deterministic provenance-only extraction of Java paths declared through pinned gb_JunitTest_add_sourcefiles macros, linked only to existing JunitTest constructor IDs. Every literal declaration remains visible: Git-tracked paths and declared-but-absent paths receive distinct explicit statuses. Out of scope: copying Java source, evaluating Make expressions, modifying prior Cppunit inventory, or claiming test parity.

## Plan

1. Identify stable gb_JunitTest_add_sourcefiles declaration forms and Make-expression boundaries. 2. Extract exact Java source target records and link them to pinned JunitTest constructor IDs. 3. Verify each literal target against pinned Git and preserve declared-but-absent paths with explicit status rather than hiding them. 4. Cover parser and corpus generation at 100%, generate canonical JSON and program documentation. 5. Prove deterministic regeneration and run full verification.

## Verify Steps

1. Run strict TypeScript, lint, JSDoc, and size checks. 2. Run inventory coverage at 100%. 3. Prove deterministic byte-identical regeneration. 4. Compare every generated Java target with the pinned core Git path set and existing Junit constructor evidence, including explicit absence status. 5. Run npm run verify, agentplane doctor, and policy routing.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-08-10T10:42:00.725Z — VERIFY — ok

By: REVIEWER

Note: Verified: full npm verify passed; regeneration was byte-identical; all 160 Junit Java targets link to constructor IDs with 156 tracked and 4 explicit missing paths.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-08-10T10:32:14.350Z, excerpt_hash=sha256:ee46a39c937640e5458bf76d2edf3bae134e83bdc578303bb220d162a5157ab0

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202608101030-KVFYSK/blueprint/resolved-snapshot.json
- old_digest: 6b9e210e69711dd1ef1a775da95d558c86f3ff48713ebe6ae318f571f775971e
- current_digest: 6b9e210e69711dd1ef1a775da95d558c86f3ff48713ebe6ae318f571f775971e
- route_changed: no
- safe_command: agentplane blueprint snapshot 202608101030-KVFYSK

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task run 202608101030-KVFYSK
- diagnostic_command: agentplane task run status 202608101030-KVFYSK
- source_of_truth: route=task_next_action diagnostic=runner_status remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: true
- repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
- runner_required: true
- runner_failure_means: runner_infrastructure_or_task_unknown
- risks: runner_rail_confusion

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert only this task commits and rerun npm run verify; no ignored reference content is modified.

## Findings
