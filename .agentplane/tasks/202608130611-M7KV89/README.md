---
id: "202608130611-M7KV89"
title: "Normalize existing Writer module identities to LibreOffice files"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 8
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-08-13T06:11:41.064Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-08-13T06:14:44.626Z"
  updated_by: "CODER"
  note: "Verified 100% coverage, production build, concrete source-tree gate, format, lint, types, JSDoc, file-size, diff, doctor, and routing checks after the module identity migration; aggregate suite deferred under approved cadence."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-08-13T06:14:45.058Z"
  updated_by: "EVALUATOR"
  note: "Existing Writer modules now use concrete pinned LibreOffice file identities while retaining the verified import graph and browser behavior."
  evaluated_sha: "0eeba1838b9547d3dbdf493f884969811c26af3c"
  blueprint_digest: "50c4ed0a10b0258fefb26e6c770f7db6a91ef5205da41c434d6c0c267e1bdf0c"
  evidence_refs:
    - ".agentplane/tasks/202608130611-M7KV89/README.md"
    - ".agentplane/tasks/202608130611-M7KV89/quality/20260813-061445058-recovery-context/quality-report.json"
    - ".agentplane/tasks/202608130611-M7KV89/quality/20260813-061445058-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202608130611-M7KV89/quality/20260813-061445058-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202608130611-M7KV89/blueprint/resolved-snapshot.json"
    - "npm run test:coverage; npm run build; npm run check:source-tree; npm run format:check; npm run lint; npm run typecheck; npm run check:docs"
  findings:
    - "view, viewfunc, viewstat, mainwn, edtwin, inputwin, and WriterInspectorTextPanel replace the prior generic file identities; the source-tree gate enforces them."
commit: null
comments:
  -
    author: "CODER"
    body: "Start: normalize existing Writer modules to audited concrete LibreOffice file identities."
events:
  -
    type: "status"
    at: "2026-08-13T06:11:41.655Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: normalize existing Writer modules to audited concrete LibreOffice file identities."
  -
    type: "verify"
    at: "2026-08-13T06:14:44.626Z"
    author: "CODER"
    state: "ok"
    note: "Verified 100% coverage, production build, concrete source-tree gate, format, lint, types, JSDoc, file-size, diff, doctor, and routing checks after the module identity migration; aggregate suite deferred under approved cadence."
doc_version: 3
doc_updated_at: "2026-08-13T06:14:44.710Z"
doc_updated_by: "CODER"
description: "Rename and relocate existing Writer browser modules from generic local names to concrete pinned LibreOffice-derived module names, update imports/tests/docs/source-tree gate, and preserve behavior."
sections:
  Summary: |-
    Normalize existing Writer module identities to LibreOffice files

    Rename and relocate existing Writer browser modules from generic local names to concrete pinned LibreOffice-derived module names, update imports/tests/docs/source-tree gate, and preserve behavior.
  Scope: |-
    - In scope: Rename and relocate existing Writer browser modules from generic local names to concrete pinned LibreOffice-derived module names, update imports/tests/docs/source-tree gate, and preserve behavior.
    - Out of scope: unrelated refactors not required for "Normalize existing Writer module identities to LibreOffice files".
  Plan: "1. Build an audited one-to-one map from each existing Writer browser module to the narrowest concrete file in pinned LibreOffice 26.8.0.2, retaining browser-only supporting leaf names only where no upstream analogue exists. 2. Rename/move existing Writer view, document-view, formatting-bar, sidebar, shell, and utility modules and their colocated tests to that map; update all imports without behavior changes. 3. Update the source-tree documentation and automated source-tree gate so required module identities are concrete files, not only broad directories. 4. Add/adjust targeted module-identity tests and documentation evidence. 5. Run fast coverage, type/lint/format/JSDoc/source-tree checks and import/build validation; defer full browser matrix under the approved ten-task cadence."
  Verify Steps: |-
    1. Run npm run test:coverage. Expected: all unit and component tests pass at 100 percent coverage after renamed module imports.
    2. Run npm run build && npm run check:source-tree. Expected: production bundle compiles and every required concrete LibreOffice-derived module identity exists.
    3. Run npm run format:check && npm run lint && npm run typecheck && npm run check:docs && npm run check:file-size && git diff --check && ap doctor && node .agentplane/policy/check-routing.mjs. Expected: all pass.
    4. Defer npm run verify, static smoke, inventory coverage, and the full browser matrix under the user-approved ten-task cadence; record residual risk.
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-08-13T06:14:44.626Z — VERIFY — ok

    By: CODER

    Note: Verified 100% coverage, production build, concrete source-tree gate, format, lint, types, JSDoc, file-size, diff, doctor, and routing checks after the module identity migration; aggregate suite deferred under approved cadence.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-08-13T06:14:21.449Z, excerpt_hash=sha256:f9c9a7ed1d4587e1e433ebf632ee9ce54b7386e148185172729040040b65e71c

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202608130611-M7KV89/blueprint/resolved-snapshot.json
    - old_digest: 50c4ed0a10b0258fefb26e6c770f7db6a91ef5205da41c434d6c0c267e1bdf0c
    - current_digest: 50c4ed0a10b0258fefb26e6c770f7db6a91ef5205da41c434d6c0c267e1bdf0c
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202608130611-M7KV89

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task run 202608130611-M7KV89
    - diagnostic_command: agentplane task run status 202608130611-M7KV89
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
    Command: npm run test:coverage
    Result: pass
    Evidence: 24 test files, 69 tests, 100 percent statements, branches, functions, and lines.
    Scope: renamed Writer module imports retain existing behavior.

    Command: npm run build && npm run check:source-tree
    Result: pass
    Evidence: Vite production bundle succeeds; 19 required concrete source-tree paths pass.
    Scope: compiled import graph and LibreOffice file-identity gate.

    Command: npm run format:check && npm run lint && npm run typecheck && npm run check:docs && npm run check:file-size && git diff --check && ap doctor && node .agentplane/policy/check-routing.mjs
    Result: pass
    Evidence: all quality gates pass; file-size reports only existing decomposition candidates.
    Scope: renamed source, tests, documentation, and source-tree enforcement.

    Skipped: npm run verify, static smoke, inventory coverage, and full browser matrix.
    Reason: user-approved full-run cadence is every ten closed tasks.
    Risk: no intended runtime behavior changed, but aggregate integration checks remain deferred until the scheduled run.
    Approval: user blanket approval and explicit cadence instruction.
id_source: "generated"
---
## Summary

Normalize existing Writer module identities to LibreOffice files

Rename and relocate existing Writer browser modules from generic local names to concrete pinned LibreOffice-derived module names, update imports/tests/docs/source-tree gate, and preserve behavior.

## Scope

- In scope: Rename and relocate existing Writer browser modules from generic local names to concrete pinned LibreOffice-derived module names, update imports/tests/docs/source-tree gate, and preserve behavior.
- Out of scope: unrelated refactors not required for "Normalize existing Writer module identities to LibreOffice files".

## Plan

1. Build an audited one-to-one map from each existing Writer browser module to the narrowest concrete file in pinned LibreOffice 26.8.0.2, retaining browser-only supporting leaf names only where no upstream analogue exists. 2. Rename/move existing Writer view, document-view, formatting-bar, sidebar, shell, and utility modules and their colocated tests to that map; update all imports without behavior changes. 3. Update the source-tree documentation and automated source-tree gate so required module identities are concrete files, not only broad directories. 4. Add/adjust targeted module-identity tests and documentation evidence. 5. Run fast coverage, type/lint/format/JSDoc/source-tree checks and import/build validation; defer full browser matrix under the approved ten-task cadence.

## Verify Steps

1. Run npm run test:coverage. Expected: all unit and component tests pass at 100 percent coverage after renamed module imports.
2. Run npm run build && npm run check:source-tree. Expected: production bundle compiles and every required concrete LibreOffice-derived module identity exists.
3. Run npm run format:check && npm run lint && npm run typecheck && npm run check:docs && npm run check:file-size && git diff --check && ap doctor && node .agentplane/policy/check-routing.mjs. Expected: all pass.
4. Defer npm run verify, static smoke, inventory coverage, and the full browser matrix under the user-approved ten-task cadence; record residual risk.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-08-13T06:14:44.626Z — VERIFY — ok

By: CODER

Note: Verified 100% coverage, production build, concrete source-tree gate, format, lint, types, JSDoc, file-size, diff, doctor, and routing checks after the module identity migration; aggregate suite deferred under approved cadence.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-08-13T06:14:21.449Z, excerpt_hash=sha256:f9c9a7ed1d4587e1e433ebf632ee9ce54b7386e148185172729040040b65e71c

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202608130611-M7KV89/blueprint/resolved-snapshot.json
- old_digest: 50c4ed0a10b0258fefb26e6c770f7db6a91ef5205da41c434d6c0c267e1bdf0c
- current_digest: 50c4ed0a10b0258fefb26e6c770f7db6a91ef5205da41c434d6c0c267e1bdf0c
- route_changed: no
- safe_command: agentplane blueprint snapshot 202608130611-M7KV89

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task run 202608130611-M7KV89
- diagnostic_command: agentplane task run status 202608130611-M7KV89
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

Command: npm run test:coverage
Result: pass
Evidence: 24 test files, 69 tests, 100 percent statements, branches, functions, and lines.
Scope: renamed Writer module imports retain existing behavior.

Command: npm run build && npm run check:source-tree
Result: pass
Evidence: Vite production bundle succeeds; 19 required concrete source-tree paths pass.
Scope: compiled import graph and LibreOffice file-identity gate.

Command: npm run format:check && npm run lint && npm run typecheck && npm run check:docs && npm run check:file-size && git diff --check && ap doctor && node .agentplane/policy/check-routing.mjs
Result: pass
Evidence: all quality gates pass; file-size reports only existing decomposition candidates.
Scope: renamed source, tests, documentation, and source-tree enforcement.

Skipped: npm run verify, static smoke, inventory coverage, and full browser matrix.
Reason: user-approved full-run cadence is every ten closed tasks.
Risk: no intended runtime behavior changed, but aggregate integration checks remain deferred until the scheduled run.
Approval: user blanket approval and explicit cadence instruction.
