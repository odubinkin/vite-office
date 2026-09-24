---
id: "202609240501-23YVPN"
title: "Align upstream paths and remove redundant adapters"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 7
origin:
  system: "manual"
depends_on:
  - "202609240501-GVMCJY"
tags:
  - "code"
verify:
  - "npm run verify"
plan_approval:
  state: "approved"
  updated_at: "2026-09-24T08:28:30.229Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-09-24T08:37:59.496Z"
  updated_by: "CODER"
  note: "GetCommands had no production caller; generated menubar pass-through removed; reverse page adapter already absent. Twenty remaining filename divergences have existing stack-necessity records and paths. npm run verify passed with 469 office tests, 96 inventory tests, 14 browser tests and 100% coverage."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-09-24T08:38:06.418Z"
  updated_by: "EVALUATOR"
  note: "Stage 7 redundant adapters removed and path data reconciled."
  evaluated_sha: "97032880b4d58be0c83d23dcedc169a3582d7800"
  blueprint_digest: "0f77f2de6ea0920bce10f33520696beac08be3923720a90c26003bd3c6263eb6"
  evidence_refs:
    - ".agentplane/tasks/202609240501-23YVPN/README.md"
    - ".agentplane/tasks/202609240501-23YVPN/quality/20260924-083806418-recovery-context/quality-report.json"
    - ".agentplane/tasks/202609240501-23YVPN/quality/20260924-083806418-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202609240501-23YVPN/quality/20260924-083806418-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202609240501-23YVPN/blueprint/resolved-snapshot.json"
    - "apps/office/src/sfx2/source/control/dispatch.ts"
    - "docs/program/source-provenance.json"
    - "/tmp/vite-office-stage7-verify.log"
  findings:
    - "Unused Sfx alias and generated menubar pass-through deleted; retained transforms have real filter, clipboard, DOM or React consumers; full verification passed."
commit: null
comments:
  -
    author: "CODER"
    body: "Start: trace adapter callers, remove proven residue, reconcile paths, and verify."
events:
  -
    type: "status"
    at: "2026-09-24T08:28:37.534Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: trace adapter callers, remove proven residue, reconcile paths, and verify."
  -
    type: "verify"
    at: "2026-09-24T08:37:59.496Z"
    author: "CODER"
    state: "ok"
    note: "GetCommands had no production caller; generated menubar pass-through removed; reverse page adapter already absent. Twenty remaining filename divergences have existing stack-necessity records and paths. npm run verify passed with 469 office tests, 96 inventory tests, 14 browser tests and 100% coverage."
doc_version: 3
doc_updated_at: "2026-09-24T08:37:59.576Z"
doc_updated_by: "CODER"
description: "Stage 7: remove confirmed unused aliases and DTO adapters; update source provenance and runtime inventory data without deleting browser ports"
sections:
  Summary: |-
    Align upstream paths and remove redundant adapters

    Stage 7: remove confirmed unused aliases and DTO adapters; update source provenance and runtime inventory data without deleting browser ports
  Scope: |-
    - In scope: Stage 7: remove confirmed unused aliases and DTO adapters; update source provenance and runtime inventory data without deleting browser ports.
    - Out of scope: unrelated refactors not required for "Align upstream paths and remove redundant adapters".
  Plan: |-
    1. Trace callers and producers for GetCommands, writer-command-surfaces, reverse page adapters, text-run projection, transfer DTOs, and remaining mapped path divergences against pinned upstream responsibility.
    2. Remove proven unused/pass-through layers and move any remaining domain policy into the corresponding upstream-shaped owner; retain genuine React, DOM, Worker, storage, clipboard and device boundaries.
    3. Reconcile source-provenance, runtime-inventory data and source-tree path list without changing schemas or verification logic.
    4. Run focused checks and npm run verify, review the diff, commit and close.
  Verify Steps: |-
    1. Caller tracing proves each deleted alias/reexport/adapter is unused or pass-through; upstream-shaped ownership remains in the mapped implementation, with browser ports retained where required.
    2. No production import references a removed path; supported command, layout, clipboard, ODT, and React behavior passes focused checks.
    3. Every moved or removed path is reconciled in source-provenance.json, runtime-inventory.json and source-tree documentation/data without schema changes.
    4. npm run verify passes, source-tree/provenance validations pass, and the final tracked state is clean.
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-09-24T08:37:59.496Z — VERIFY — ok

    By: CODER

    Note: GetCommands had no production caller; generated menubar pass-through removed; reverse page adapter already absent. Twenty remaining filename divergences have existing stack-necessity records and paths. npm run verify passed with 469 office tests, 96 inventory tests, 14 browser tests and 100% coverage.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-24T08:28:37.534Z, excerpt_hash=sha256:3aaf2396bbdb8723535680c09d2120fce9b6658127d27c04b86cf61864dc42c3

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609240501-23YVPN/blueprint/resolved-snapshot.json
    - old_digest: 0f77f2de6ea0920bce10f33520696beac08be3923720a90c26003bd3c6263eb6
    - current_digest: 0f77f2de6ea0920bce10f33520696beac08be3923720a90c26003bd3c6263eb6
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202609240501-23YVPN

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202609240501-23YVPN
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
    - Observation: Obsolete aliases and stale parity descriptions obscured upstream ownership.
      Impact: Extra exported surfaces and inventory records could be mistaken for implemented policy.
      Resolution: Removed alias/reexport and duplicate test, routed view to generated uiconfig, and corrected inventory/provenance data.
id_source: "generated"
---
## Summary

Align upstream paths and remove redundant adapters

Stage 7: remove confirmed unused aliases and DTO adapters; update source provenance and runtime inventory data without deleting browser ports

## Scope

- In scope: Stage 7: remove confirmed unused aliases and DTO adapters; update source provenance and runtime inventory data without deleting browser ports.
- Out of scope: unrelated refactors not required for "Align upstream paths and remove redundant adapters".

## Plan

1. Trace callers and producers for GetCommands, writer-command-surfaces, reverse page adapters, text-run projection, transfer DTOs, and remaining mapped path divergences against pinned upstream responsibility.
2. Remove proven unused/pass-through layers and move any remaining domain policy into the corresponding upstream-shaped owner; retain genuine React, DOM, Worker, storage, clipboard and device boundaries.
3. Reconcile source-provenance, runtime-inventory data and source-tree path list without changing schemas or verification logic.
4. Run focused checks and npm run verify, review the diff, commit and close.

## Verify Steps

1. Caller tracing proves each deleted alias/reexport/adapter is unused or pass-through; upstream-shaped ownership remains in the mapped implementation, with browser ports retained where required.
2. No production import references a removed path; supported command, layout, clipboard, ODT, and React behavior passes focused checks.
3. Every moved or removed path is reconciled in source-provenance.json, runtime-inventory.json and source-tree documentation/data without schema changes.
4. npm run verify passes, source-tree/provenance validations pass, and the final tracked state is clean.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-09-24T08:37:59.496Z — VERIFY — ok

By: CODER

Note: GetCommands had no production caller; generated menubar pass-through removed; reverse page adapter already absent. Twenty remaining filename divergences have existing stack-necessity records and paths. npm run verify passed with 469 office tests, 96 inventory tests, 14 browser tests and 100% coverage.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-24T08:28:37.534Z, excerpt_hash=sha256:3aaf2396bbdb8723535680c09d2120fce9b6658127d27c04b86cf61864dc42c3

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609240501-23YVPN/blueprint/resolved-snapshot.json
- old_digest: 0f77f2de6ea0920bce10f33520696beac08be3923720a90c26003bd3c6263eb6
- current_digest: 0f77f2de6ea0920bce10f33520696beac08be3923720a90c26003bd3c6263eb6
- route_changed: no
- safe_command: agentplane blueprint snapshot 202609240501-23YVPN

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202609240501-23YVPN
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

- Observation: Obsolete aliases and stale parity descriptions obscured upstream ownership.
  Impact: Extra exported surfaces and inventory records could be mistaken for implemented policy.
  Resolution: Removed alias/reexport and duplicate test, routed view to generated uiconfig, and corrected inventory/provenance data.
