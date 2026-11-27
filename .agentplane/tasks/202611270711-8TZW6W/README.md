---
id: "202611270711-8TZW6W"
title: "Preserve Calc ODS threaded notes and document persons"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 7
origin:
  system: "manual"
depends_on: []
tags:
  - "calc"
  - "code"
  - "ods"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-11-27T07:12:41.854Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-11-27T07:20:12.061Z"
  updated_by: "CODER"
  note: "32 focused Calc ODS and Worker cases pass, including the pinned root/reply/person scenario; scoped static and registry checks pass. See output/playwright/8TZW6W/verification.md."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-11-27T07:20:12.571Z"
  updated_by: "EVALUATOR"
  note: "Native threaded note data and document persons survive the Calc ODS and Worker round trip."
  evaluated_sha: "84d2d7ba835d82e0037f17b6e4152d689c6521b2"
  blueprint_digest: "50dbad09189326add89907e8a8c2686c2e868bd18d80907451aa2b96d6f16ede"
  evidence_refs:
    - ".agentplane/tasks/202611270711-8TZW6W/README.md"
    - ".agentplane/tasks/202611270711-8TZW6W/quality/20261127-072012571-recovery-context/quality-report.json"
    - ".agentplane/tasks/202611270711-8TZW6W/quality/20261127-072012571-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202611270711-8TZW6W/quality/20261127-072012571-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202611270711-8TZW6W/blueprint/resolved-snapshot.json"
    - "output/playwright/8TZW6W/verification.md"
    - "84d2d7ba835d82e0037f17b6e4152d689c6521b2"
  findings:
    - "Source owner defaults, person deduplication, extension XML and version-one transfer preserve the represented native note contract. Implementation: 84d2d7ba835d82e0037f17b6e4152d689c6521b2."
commit: null
comments:
  -
    author: "CODER"
    body: "Start: continue direct-mode task in current checkout."
events:
  -
    type: "status"
    at: "2026-11-27T07:12:58.374Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: continue direct-mode task in current checkout."
  -
    type: "verify"
    at: "2026-11-27T07:20:12.061Z"
    author: "CODER"
    state: "ok"
    note: "32 focused Calc ODS and Worker cases pass, including the pinned root/reply/person scenario; scoped static and registry checks pass. See output/playwright/8TZW6W/verification.md."
doc_version: 3
doc_updated_at: "2026-11-27T07:20:12.118Z"
doc_updated_by: "CODER"
description: "Port native ScPostIt threaded metadata, ordered unique document persons and the LibreOffice ODS thread extension. Retain thread data through version-one Worker transfer and verify the pinned ODS comment round-trip scenario."
sections:
  Summary: "Retain LibreOffice threaded cell comments and their document persons through Calc's existing note owners, ODS filter and Worker transfer."
  Scope: "ScPostIt and person value ownership, native comment/reply and spreadsheet persons XML contexts, extended ODS output, and backward-compatible version-one Worker records. Include classic annotation fallback, resolution state, and the relevant pinned ODS round-trip assertions. Work stays within the current Calc note model and ODS path."
  Plan: "Port native threaded note entries, document persons, LibreOffice ODS extension and version-one Worker transfer. Verify the relevant upstream ODS round-trip assertions."
  Verify Steps: |-
    - Run existing Calc ODS notes and Worker tests and the focused threaded-note case with the pinned native root/reply/person assertions.
    - Run Office typecheck, changed-file ESLint and Prettier, dependencies, source provenance, Calc registry invariants, routing, AgentPlane doctor and git diff checks.
  Verification: |-
    Pending verification.

    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-11-27T07:20:12.061Z — VERIFY — ok

    By: CODER

    Note: 32 focused Calc ODS and Worker cases pass, including the pinned root/reply/person scenario; scoped static and registry checks pass. See output/playwright/8TZW6W/verification.md.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-11-27T07:12:58.374Z, excerpt_hash=sha256:3a8258598eb3153ea379121e5e151584b3137b6107e7bcd278e9c41492aae2d6

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202611270711-8TZW6W/blueprint/resolved-snapshot.json
    - old_digest: 50dbad09189326add89907e8a8c2686c2e868bd18d80907451aa2b96d6f16ede
    - current_digest: 50dbad09189326add89907e8a8c2686c2e868bd18d80907451aa2b96d6f16ede
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202611270711-8TZW6W

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202611270711-8TZW6W
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: false
    - repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert task implementation commits. Legacy version-one Worker records omit the new thread and person metadata."
  Findings: "The pinned export QA seeds its model by importing an XLSX package. This task exercises the ODS save/reopen segment using the same native comment metadata and classic note owner."
id_source: "generated"
---
## Summary

Retain LibreOffice threaded cell comments and their document persons through Calc's existing note owners, ODS filter and Worker transfer.

## Scope

ScPostIt and person value ownership, native comment/reply and spreadsheet persons XML contexts, extended ODS output, and backward-compatible version-one Worker records. Include classic annotation fallback, resolution state, and the relevant pinned ODS round-trip assertions. Work stays within the current Calc note model and ODS path.

## Plan

Port native threaded note entries, document persons, LibreOffice ODS extension and version-one Worker transfer. Verify the relevant upstream ODS round-trip assertions.

## Verify Steps

- Run existing Calc ODS notes and Worker tests and the focused threaded-note case with the pinned native root/reply/person assertions.
- Run Office typecheck, changed-file ESLint and Prettier, dependencies, source provenance, Calc registry invariants, routing, AgentPlane doctor and git diff checks.

## Verification

Pending verification.

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-11-27T07:20:12.061Z — VERIFY — ok

By: CODER

Note: 32 focused Calc ODS and Worker cases pass, including the pinned root/reply/person scenario; scoped static and registry checks pass. See output/playwright/8TZW6W/verification.md.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-11-27T07:12:58.374Z, excerpt_hash=sha256:3a8258598eb3153ea379121e5e151584b3137b6107e7bcd278e9c41492aae2d6

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202611270711-8TZW6W/blueprint/resolved-snapshot.json
- old_digest: 50dbad09189326add89907e8a8c2686c2e868bd18d80907451aa2b96d6f16ede
- current_digest: 50dbad09189326add89907e8a8c2686c2e868bd18d80907451aa2b96d6f16ede
- route_changed: no
- safe_command: agentplane blueprint snapshot 202611270711-8TZW6W

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202611270711-8TZW6W
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: false
- repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert task implementation commits. Legacy version-one Worker records omit the new thread and person metadata.

## Findings

The pinned export QA seeds its model by importing an XLSX package. This task exercises the ODS save/reopen segment using the same native comment metadata and classic note owner.
