---
id: "202611270654-F36CFN"
title: "Preserve Calc ODS external cache number formats and source metadata"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 8
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
  updated_at: "2026-11-27T06:55:07.842Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-11-27T07:09:49.393Z"
  updated_by: "CODER"
  note: "All 32 selected Calc cases pass across the initial run and the corrected ODS/XLSX cache replay. All static checks passed."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-11-27T07:09:52.855Z"
  updated_by: "EVALUATOR"
  note: "Calc ODS retains native cache formats and source filter metadata."
  evaluated_sha: "5a6146604c2d69d5d54d29593bf4ab487434f993"
  blueprint_digest: "346cae7f12ded2af0ab6ed0c9ec364d8db611b6af026c3472e8ce4235d2702e1"
  evidence_refs:
    - ".agentplane/tasks/202611270654-F36CFN/README.md"
    - ".agentplane/tasks/202611270654-F36CFN/quality/20261127-070952855-recovery-context/quality-report.json"
    - ".agentplane/tasks/202611270654-F36CFN/quality/20261127-070952855-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202611270654-F36CFN/quality/20261127-070952855-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202611270654-F36CFN/blueprint/resolved-snapshot.json"
    - "output/playwright/F36CFN/verification.md"
    - "a890e2055a2b"
    - "d3e2478eeedb"
  findings:
    - "Styled date caches and numeric durations pass ODS and Worker round trips, and the original relative XLSX link survives an ODS reopen."
commit: null
comments:
  -
    author: "CODER"
    body: "Start: continue direct-mode task in current checkout."
  -
    author: "CODER"
    body: "Implementation evidence: a890e2055a2b and d3e2478eeedb. Verification is recorded in output/playwright/F36CFN/verification.md."
events:
  -
    type: "status"
    at: "2026-11-27T06:56:35.702Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: continue direct-mode task in current checkout."
  -
    type: "verify"
    at: "2026-11-27T07:09:49.393Z"
    author: "CODER"
    state: "ok"
    note: "All 32 selected Calc cases pass across the initial run and the corrected ODS/XLSX cache replay. All static checks passed."
  -
    type: "comment"
    at: "2026-11-27T07:09:49.638Z"
    author: "CODER"
    body: "Implementation evidence: a890e2055a2b and d3e2478eeedb. Verification is recorded in output/playwright/F36CFN/verification.md."
doc_version: 3
doc_updated_at: "2026-11-27T07:09:49.638Z"
doc_updated_by: "CODER"
description: "Port external cache cell format indices and temporal values through native ODS import/export and Worker transfer. Preserve the upstream source filter metadata and numeric cache token representation."
sections:
  Summary: "Preserve the represented Calc external workbook cache values, number formats and source metadata in ODS and Worker snapshots."
  Scope: "Native ScExternalRefCache::Table cell data, ScXMLExternalRefCellContext and table-source context, ScXMLExport::WriteExternalRefCaches, and their existing Worker bridge. Include import of temporal and logical values, persistence of cached number-format identity, and external source filter options. Existing external workbook resolution and browser file-open/save policy define the boundary."
  Plan: "Port native external cache format indices and source filter metadata through ODS import, export and Worker transfer, then verify existing cache tests and a focused format round trip."
  Verify Steps: |-
    - Run existing external cache ODS/XLSX and worker tests and one format-retention round trip for temporal and styled cached cells.
    - Run Office typecheck, scoped lint/format, dependencies, provenance, Calc registry invariants, routing, AgentPlane doctor and git diff checks.
  Verification: |-
    Pending verification.

    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-11-27T07:09:49.393Z — VERIFY — ok

    By: CODER

    Note: All 32 selected Calc cases pass across the initial run and the corrected ODS/XLSX cache replay. All static checks passed.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-11-27T06:56:35.702Z, excerpt_hash=sha256:825b73aeb8e2a8976bc5d0f02b765d24fdd678d0b2e057f32c18b5b34168c6cb

    Details:

    # Native Calc external ODS cache formats and filter metadata
    - Command: `npm run test:calc -- xmlexternaltabi ods-worker calc-ods-io externallinkbuffer --maxWorkers=2 --testTimeout=120000`.
      - Initial result: 30 passed. The new duration-format assertion and the existing XLSX relation test identified two regressions.
      - Resolution: the importer marks duration tokens as numeric. ODS export preserves a portable relative source name while using the native empty href when no relative source is available.
    - Command: `npm run test:calc -- xmlexternaltabi externallinkbuffer --maxWorkers=1 --testTimeout=300000`.
      - Result: pass.
      - Evidence: 11 cases in two files, including both failures. All 32 unique selected cases passed across the original run and retest.
      - Scope: original external-reference workbooks, temporal float cache values, native format identity, Worker and ODS transfer, and XLSX through ODS reopen.
    - Commands: final Office typecheck, changed-file ESLint and Prettier, `npm run check:dependencies`, `npm run check:source-provenance`, `npm run inventory:invariants -- --scope calc`, `node .agentplane/policy/check-routing.mjs`, `ap doctor`, and `git diff --check`.
      - Result: pass.
      - Evidence: global provenance for 3141 runtime modules and zero semantic inventory violations.

    The browser retains a known relative target during packaging. A source with no relative reference has the upstream empty link fallback documented in CALC-850. External links are stored with their cache. The scoped work does not initiate remote workbook refreshes.

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202611270654-F36CFN/blueprint/resolved-snapshot.json
    - old_digest: 346cae7f12ded2af0ab6ed0c9ec364d8db611b6af026c3472e8ce4235d2702e1
    - current_digest: 346cae7f12ded2af0ab6ed0c9ec364d8db611b6af026c3472e8ce4235d2702e1
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202611270654-F36CFN

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202611270654-F36CFN
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: false
    - repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert the task implementation commits. The external cache Worker payload extends its existing optional fields."
  Findings: "The native ODF writer emits double cache tokens as float even when they carry a date, duration or logical display format. Type identity lives in the cache's number-format index and its automatic cell style."
id_source: "generated"
---
## Summary

Preserve the represented Calc external workbook cache values, number formats and source metadata in ODS and Worker snapshots.

## Scope

Native ScExternalRefCache::Table cell data, ScXMLExternalRefCellContext and table-source context, ScXMLExport::WriteExternalRefCaches, and their existing Worker bridge. Include import of temporal and logical values, persistence of cached number-format identity, and external source filter options. Existing external workbook resolution and browser file-open/save policy define the boundary.

## Plan

Port native external cache format indices and source filter metadata through ODS import, export and Worker transfer, then verify existing cache tests and a focused format round trip.

## Verify Steps

- Run existing external cache ODS/XLSX and worker tests and one format-retention round trip for temporal and styled cached cells.
- Run Office typecheck, scoped lint/format, dependencies, provenance, Calc registry invariants, routing, AgentPlane doctor and git diff checks.

## Verification

Pending verification.

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-11-27T07:09:49.393Z — VERIFY — ok

By: CODER

Note: All 32 selected Calc cases pass across the initial run and the corrected ODS/XLSX cache replay. All static checks passed.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-11-27T06:56:35.702Z, excerpt_hash=sha256:825b73aeb8e2a8976bc5d0f02b765d24fdd678d0b2e057f32c18b5b34168c6cb

Details:

# Native Calc external ODS cache formats and filter metadata
- Command: `npm run test:calc -- xmlexternaltabi ods-worker calc-ods-io externallinkbuffer --maxWorkers=2 --testTimeout=120000`.
  - Initial result: 30 passed. The new duration-format assertion and the existing XLSX relation test identified two regressions.
  - Resolution: the importer marks duration tokens as numeric. ODS export preserves a portable relative source name while using the native empty href when no relative source is available.
- Command: `npm run test:calc -- xmlexternaltabi externallinkbuffer --maxWorkers=1 --testTimeout=300000`.
  - Result: pass.
  - Evidence: 11 cases in two files, including both failures. All 32 unique selected cases passed across the original run and retest.
  - Scope: original external-reference workbooks, temporal float cache values, native format identity, Worker and ODS transfer, and XLSX through ODS reopen.
- Commands: final Office typecheck, changed-file ESLint and Prettier, `npm run check:dependencies`, `npm run check:source-provenance`, `npm run inventory:invariants -- --scope calc`, `node .agentplane/policy/check-routing.mjs`, `ap doctor`, and `git diff --check`.
  - Result: pass.
  - Evidence: global provenance for 3141 runtime modules and zero semantic inventory violations.

The browser retains a known relative target during packaging. A source with no relative reference has the upstream empty link fallback documented in CALC-850. External links are stored with their cache. The scoped work does not initiate remote workbook refreshes.

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202611270654-F36CFN/blueprint/resolved-snapshot.json
- old_digest: 346cae7f12ded2af0ab6ed0c9ec364d8db611b6af026c3472e8ce4235d2702e1
- current_digest: 346cae7f12ded2af0ab6ed0c9ec364d8db611b6af026c3472e8ce4235d2702e1
- route_changed: no
- safe_command: agentplane blueprint snapshot 202611270654-F36CFN

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202611270654-F36CFN
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: false
- repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert the task implementation commits. The external cache Worker payload extends its existing optional fields.

## Findings

The native ODF writer emits double cache tokens as float even when they carry a date, duration or logical display format. Type identity lives in the cache's number-format index and its automatic cell style.
