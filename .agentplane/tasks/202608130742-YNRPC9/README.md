---
id: "202608130742-YNRPC9"
title: "Align Sfx document history and storage paths with LibreOffice"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 7
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-08-13T07:44:13.173Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-08-13T07:46:03.337Z"
  updated_by: "CODER"
  note: "Verified: docundomanager and docfile path alignment preserves 83 fast tests at 100% coverage; provenance, source-tree, JSDoc, format, lint, types, stale-path, diff, doctor, and routing checks passed."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-08-13T07:46:03.772Z"
  updated_by: "EVALUATOR"
  note: "Sfx document module paths now match pinned LibreOffice ownership."
  evaluated_sha: "9441fd2f53ccf4cec6f06ff62b530786909f2a4b"
  blueprint_digest: "466addc1d3ad7d9304745c59a31533c6f538b608df2a675b2bf46257bdaf56ca"
  evidence_refs:
    - ".agentplane/tasks/202608130742-YNRPC9/README.md"
    - ".agentplane/tasks/202608130742-YNRPC9/quality/20260813-074603772-recovery-context/quality-report.json"
    - ".agentplane/tasks/202608130742-YNRPC9/quality/20260813-074603772-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202608130742-YNRPC9/quality/20260813-074603772-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202608130742-YNRPC9/blueprint/resolved-snapshot.json"
    - "HEAD"
  findings:
    - "Fast coverage and every declared structural quality check passed."
commit: null
comments:
  -
    author: "CODER"
    body: "Start: align bounded Sfx history and document-medium modules with exact pinned LibreOffice paths."
events:
  -
    type: "status"
    at: "2026-08-13T07:44:13.760Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: align bounded Sfx history and document-medium modules with exact pinned LibreOffice paths."
  -
    type: "verify"
    at: "2026-08-13T07:46:03.337Z"
    author: "CODER"
    state: "ok"
    note: "Verified: docundomanager and docfile path alignment preserves 83 fast tests at 100% coverage; provenance, source-tree, JSDoc, format, lint, types, stale-path, diff, doctor, and routing checks passed."
doc_version: 3
doc_updated_at: "2026-08-13T07:46:03.421Z"
doc_updated_by: "CODER"
description: "Move the existing browser document history and storage modules to exact pinned LibreOffice-like docundomanager and docfile paths; update imports, tests, provenance, source-tree documentation, and path enforcement without changing behavior."
sections:
  Summary: |-
    Align Sfx document history and storage paths with LibreOffice

    Move the existing browser document history and storage modules to exact pinned LibreOffice-like docundomanager and docfile paths; update imports, tests, provenance, source-tree documentation, and path enforcement without changing behavior.
  Scope: |-
    - In scope: Move the existing browser document history and storage modules to exact pinned LibreOffice-like docundomanager and docfile paths; update imports, tests, provenance, source-tree documentation, and path enforcement without changing behavior.
    - Out of scope: unrelated refactors not required for "Align Sfx document history and storage paths with LibreOffice".
  Plan: "1. Rename sfx2/source/doc/history and its co-located test to docundomanager, retaining the bounded browser TransactionHistory API. 2. Rename storage and its co-located test to docfile, retaining the bounded browser document-medium persistence contract. 3. Update all imports, parity/provenance records, direct documentation links, and source-tree enforcement; make no Load/Save orchestration or format-compatibility change. 4. Verify 100% fast coverage plus provenance, source-tree, documentation, format, lint, type, stale-path, and diff checks. Full suite remains deferred until the next ten-task cadence."
  Verify Steps: "1. Run npm run test:coverage. Expected: renamed docundomanager and docfile modules retain 100 percent fast-test coverage. 2. Run npm run check:source-provenance && npm run check:source-tree && npm run check:docs && npm run format:check && npm run lint && npm run typecheck && git diff --check. Expected: exact LO-like paths, JSDoc, static quality, and a whitespace-clean diff all pass. 3. Run rg -n 'sfx2/source/doc/(history|storage)|from \"\\./(history|storage)\"' apps/office/src docs/program scripts. Expected: no active source, import, provenance, parity, or source-tree reference remains. 4. Defer npm run verify and the full browser matrix under the agreed ten-task cadence; record the residual risk."
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-08-13T07:46:03.337Z — VERIFY — ok

    By: CODER

    Note: Verified: docundomanager and docfile path alignment preserves 83 fast tests at 100% coverage; provenance, source-tree, JSDoc, format, lint, types, stale-path, diff, doctor, and routing checks passed.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-08-13T07:44:13.760Z, excerpt_hash=sha256:5db9ddcbdde685f82f5caeb8ea070217a1c07a4e72ba51b8a1a204a0da1d3d98

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202608130742-YNRPC9/blueprint/resolved-snapshot.json
    - old_digest: 466addc1d3ad7d9304745c59a31533c6f538b608df2a675b2bf46257bdaf56ca
    - current_digest: 466addc1d3ad7d9304745c59a31533c6f538b608df2a675b2bf46257bdaf56ca
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202608130742-YNRPC9

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task run 202608130742-YNRPC9
    - diagnostic_command: agentplane task run status 202608130742-YNRPC9
    - source_of_truth: route=task_next_action diagnostic=runner_status remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: true
    - repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
    - runner_required: true
    - runner_failure_means: runner_infrastructure_or_task_unknown
    - risks: runner_rail_confusion

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: |-
    - Revert task-related commit(s).
    - Re-run required checks to confirm rollback safety.
  Findings: |-
    - Observation: The bounded browser undo and document-medium contracts now occupy exact pinned Sfx doc module names.
      Impact: Runtime imports, local documentation, parity evidence, provenance, and path enforcement agree with docundomanager.cxx and docfile.cxx.
      Resolution: No Load/Save orchestration was added; objstor remains an explicitly separate future boundary. Full suite was completed in the immediately preceding cadence.
id_source: "generated"
---
## Summary

Align Sfx document history and storage paths with LibreOffice

Move the existing browser document history and storage modules to exact pinned LibreOffice-like docundomanager and docfile paths; update imports, tests, provenance, source-tree documentation, and path enforcement without changing behavior.

## Scope

- In scope: Move the existing browser document history and storage modules to exact pinned LibreOffice-like docundomanager and docfile paths; update imports, tests, provenance, source-tree documentation, and path enforcement without changing behavior.
- Out of scope: unrelated refactors not required for "Align Sfx document history and storage paths with LibreOffice".

## Plan

1. Rename sfx2/source/doc/history and its co-located test to docundomanager, retaining the bounded browser TransactionHistory API. 2. Rename storage and its co-located test to docfile, retaining the bounded browser document-medium persistence contract. 3. Update all imports, parity/provenance records, direct documentation links, and source-tree enforcement; make no Load/Save orchestration or format-compatibility change. 4. Verify 100% fast coverage plus provenance, source-tree, documentation, format, lint, type, stale-path, and diff checks. Full suite remains deferred until the next ten-task cadence.

## Verify Steps

1. Run npm run test:coverage. Expected: renamed docundomanager and docfile modules retain 100 percent fast-test coverage. 2. Run npm run check:source-provenance && npm run check:source-tree && npm run check:docs && npm run format:check && npm run lint && npm run typecheck && git diff --check. Expected: exact LO-like paths, JSDoc, static quality, and a whitespace-clean diff all pass. 3. Run rg -n 'sfx2/source/doc/(history|storage)|from "\./(history|storage)"' apps/office/src docs/program scripts. Expected: no active source, import, provenance, parity, or source-tree reference remains. 4. Defer npm run verify and the full browser matrix under the agreed ten-task cadence; record the residual risk.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-08-13T07:46:03.337Z — VERIFY — ok

By: CODER

Note: Verified: docundomanager and docfile path alignment preserves 83 fast tests at 100% coverage; provenance, source-tree, JSDoc, format, lint, types, stale-path, diff, doctor, and routing checks passed.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-08-13T07:44:13.760Z, excerpt_hash=sha256:5db9ddcbdde685f82f5caeb8ea070217a1c07a4e72ba51b8a1a204a0da1d3d98

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202608130742-YNRPC9/blueprint/resolved-snapshot.json
- old_digest: 466addc1d3ad7d9304745c59a31533c6f538b608df2a675b2bf46257bdaf56ca
- current_digest: 466addc1d3ad7d9304745c59a31533c6f538b608df2a675b2bf46257bdaf56ca
- route_changed: no
- safe_command: agentplane blueprint snapshot 202608130742-YNRPC9

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task run 202608130742-YNRPC9
- diagnostic_command: agentplane task run status 202608130742-YNRPC9
- source_of_truth: route=task_next_action diagnostic=runner_status remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: true
- repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
- runner_required: true
- runner_failure_means: runner_infrastructure_or_task_unknown
- risks: runner_rail_confusion

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert task-related commit(s).
- Re-run required checks to confirm rollback safety.

## Findings

- Observation: The bounded browser undo and document-medium contracts now occupy exact pinned Sfx doc module names.
  Impact: Runtime imports, local documentation, parity evidence, provenance, and path enforcement agree with docundomanager.cxx and docfile.cxx.
  Resolution: No Load/Save orchestration was added; objstor remains an explicitly separate future boundary. Full suite was completed in the immediately preceding cadence.
