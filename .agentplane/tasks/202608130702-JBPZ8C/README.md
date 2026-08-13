---
id: "202608130702-JBPZ8C"
title: "Enforce provenance for every current source module"
result_summary: "Added a complete validated source-provenance manifest and gate for the current static browser runtime."
status: "DONE"
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
  updated_at: "2026-08-13T07:02:22.697Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-08-13T07:11:20.352Z"
  updated_by: "CODER"
  note: "Verified: source provenance tests passed; the exhaustive gate validates 42 runtime modules with 35 concrete pinned mappings and 7 detailed browser-only exceptions; app fast coverage is 79 tests at 100 percent; parity inventory resolved 112 evidence references with no exceptions; all declared static gates passed. Full suite remains deferred under the approved ten-task cadence."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-08-13T07:11:19.844Z"
  updated_by: "EVALUATOR"
  note: "Every current browser runtime module now has validated LibreOffice file provenance or a detailed browser-only exception."
  evaluated_sha: "dcb53609af6b74dd57641274674bf8f126818e16"
  blueprint_digest: "c652756cab3e529e753c318fdbf88bf3cc37190bfdd7105bbe6ea2cb6dcef72b"
  evidence_refs:
    - ".agentplane/tasks/202608130702-JBPZ8C/README.md"
    - ".agentplane/tasks/202608130702-JBPZ8C/quality/20260813-071119844-recovery-context/quality-report.json"
    - ".agentplane/tasks/202608130702-JBPZ8C/quality/20260813-071119844-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202608130702-JBPZ8C/quality/20260813-071119844-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202608130702-JBPZ8C/blueprint/resolved-snapshot.json"
    - "dcb53609af6b"
  findings:
    - "Focused provenance tests, the exhaustive source gate, fast application coverage, parity inventory, and static quality checks passed; full suite remains deferred under the approved ten-task cadence."
commit:
  hash: "dcb53609af6b74dd57641274674bf8f126818e16"
  message: "🧭 JBPZ8C code: enforce source provenance"
comments:
  -
    author: "CODER"
    body: "Start: Building an enforceable complete source-provenance manifest for the current browser source tree."
  -
    author: "CODER"
    body: "Verified: every current runtime module now has a concrete pinned LibreOffice source mapping or a detailed browser-only exception, with exhaustive validation and fast quality evidence."
events:
  -
    type: "status"
    at: "2026-08-13T07:02:28.470Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: Building an enforceable complete source-provenance manifest for the current browser source tree."
  -
    type: "verify"
    at: "2026-08-13T07:11:20.352Z"
    author: "CODER"
    state: "ok"
    note: "Verified: source provenance tests passed; the exhaustive gate validates 42 runtime modules with 35 concrete pinned mappings and 7 detailed browser-only exceptions; app fast coverage is 79 tests at 100 percent; parity inventory resolved 112 evidence references with no exceptions; all declared static gates passed. Full suite remains deferred under the approved ten-task cadence."
  -
    type: "status"
    at: "2026-08-13T07:11:35.603Z"
    author: "CODER"
    from: "DOING"
    to: "DONE"
    note: "Verified: every current runtime module now has a concrete pinned LibreOffice source mapping or a detailed browser-only exception, with exhaustive validation and fast quality evidence."
doc_version: 3
doc_updated_at: "2026-08-13T07:11:35.604Z"
doc_updated_by: "CODER"
description: "Create a complete, machine-validated source provenance manifest for every authored runtime module in the current browser project. Each entry must cite a concrete LibreOffice source/configuration path or document a browser-only exception; extend the source-tree gate and documentation so later feature tasks cannot introduce unmapped module names or hierarchy."
sections:
  Summary: |-
    Enforce provenance for every current source module

    Create a complete, machine-validated source provenance manifest for every authored runtime module in the current browser project. Each entry must cite a concrete LibreOffice source/configuration path or document a browser-only exception; extend the source-tree gate and documentation so later feature tasks cannot introduce unmapped module names or hierarchy.
  Scope: |-
    - In scope: Create a complete, machine-validated source provenance manifest for every authored runtime module in the current browser project. Each entry must cite a concrete LibreOffice source/configuration path or document a browser-only exception; extend the source-tree gate and documentation so later feature tasks cannot introduce unmapped module names or hierarchy.
    - Out of scope: unrelated refactors not required for "Enforce provenance for every current source module".
  Plan: "1. Inventory every authored non-test runtime TypeScript/TSX module under apps/office/src and identify its direct pinned LibreOffice counterpart or a browser-only exception. 2. Add a machine-readable provenance manifest that records local path, status, concrete upstream path when applicable, and a detailed browser-environment rationale otherwise. 3. Add a deterministic source-provenance validator and tests, integrate it into package checks, and make it reject omitted, stale, non-existent, or undocumented mappings. 4. Normalize any clearly mistaken existing source-tree claim discovered by the inventory, but defer actual module moves to bounded follow-up tasks. 5. Document the manifest contract, direct mapping versus exception semantics, and the initial current-project coverage. 6. Run focused validator tests plus formatting, lint, typecheck, JSDoc, file-size, source-tree, parity, doctor, and routing checks; defer full suite under the approved ten-task cadence."
  Verify Steps: "1. Run focused provenance-validator tests. Expected: every current non-test runtime module is represented exactly once, with a valid pinned upstream path or a detailed browser-only exception, and malformed manifests fail. 2. Run npm run check:source-provenance. Expected: deterministic success over the current authored runtime tree and pinned libreoffice-26.8.0.2 checkout. 3. Run npm run format:check && npm run lint && npm run typecheck && npm run check:docs && npm run check:file-size && npm run check:source-tree && git diff --check && ap doctor && node .agentplane/policy/check-routing.mjs. Expected: all pass. 4. Run npm run inventory:parity -- --baseline docs/program/libreoffice-baseline.json --mappings docs/program/parity/writer-command-slice.json --local-root . --upstream-root vendor/libreoffice-reference. Expected: no evidence exceptions. 5. Defer npm run verify, static smoke, inventory coverage, and full browser matrix under the user-approved ten-task cadence; record residual risk."
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-08-13T07:11:20.352Z — VERIFY — ok

    By: CODER

    Note: Verified: source provenance tests passed; the exhaustive gate validates 42 runtime modules with 35 concrete pinned mappings and 7 detailed browser-only exceptions; app fast coverage is 79 tests at 100 percent; parity inventory resolved 112 evidence references with no exceptions; all declared static gates passed. Full suite remains deferred under the approved ten-task cadence.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-08-13T07:02:28.470Z, excerpt_hash=sha256:0f011454b89ebeb8654c573fe055f8763425848cda7b6bff7b2c1e152ad9300a

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202608130702-JBPZ8C/blueprint/resolved-snapshot.json
    - old_digest: c652756cab3e529e753c318fdbf88bf3cc37190bfdd7105bbe6ea2cb6dcef72b
    - current_digest: c652756cab3e529e753c318fdbf88bf3cc37190bfdd7105bbe6ea2cb6dcef72b
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202608130702-JBPZ8C

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane commit 202608130702-JBPZ8C -m 🧩 JBPZ8C task: persist canonical task artifacts --allow-tasks
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: true
    - repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: |-
    - Revert task-related commit(s).
    - Re-run required checks to confirm rollback safety.
  Findings: ""
id_source: "generated"
---
## Summary

Enforce provenance for every current source module

Create a complete, machine-validated source provenance manifest for every authored runtime module in the current browser project. Each entry must cite a concrete LibreOffice source/configuration path or document a browser-only exception; extend the source-tree gate and documentation so later feature tasks cannot introduce unmapped module names or hierarchy.

## Scope

- In scope: Create a complete, machine-validated source provenance manifest for every authored runtime module in the current browser project. Each entry must cite a concrete LibreOffice source/configuration path or document a browser-only exception; extend the source-tree gate and documentation so later feature tasks cannot introduce unmapped module names or hierarchy.
- Out of scope: unrelated refactors not required for "Enforce provenance for every current source module".

## Plan

1. Inventory every authored non-test runtime TypeScript/TSX module under apps/office/src and identify its direct pinned LibreOffice counterpart or a browser-only exception. 2. Add a machine-readable provenance manifest that records local path, status, concrete upstream path when applicable, and a detailed browser-environment rationale otherwise. 3. Add a deterministic source-provenance validator and tests, integrate it into package checks, and make it reject omitted, stale, non-existent, or undocumented mappings. 4. Normalize any clearly mistaken existing source-tree claim discovered by the inventory, but defer actual module moves to bounded follow-up tasks. 5. Document the manifest contract, direct mapping versus exception semantics, and the initial current-project coverage. 6. Run focused validator tests plus formatting, lint, typecheck, JSDoc, file-size, source-tree, parity, doctor, and routing checks; defer full suite under the approved ten-task cadence.

## Verify Steps

1. Run focused provenance-validator tests. Expected: every current non-test runtime module is represented exactly once, with a valid pinned upstream path or a detailed browser-only exception, and malformed manifests fail. 2. Run npm run check:source-provenance. Expected: deterministic success over the current authored runtime tree and pinned libreoffice-26.8.0.2 checkout. 3. Run npm run format:check && npm run lint && npm run typecheck && npm run check:docs && npm run check:file-size && npm run check:source-tree && git diff --check && ap doctor && node .agentplane/policy/check-routing.mjs. Expected: all pass. 4. Run npm run inventory:parity -- --baseline docs/program/libreoffice-baseline.json --mappings docs/program/parity/writer-command-slice.json --local-root . --upstream-root vendor/libreoffice-reference. Expected: no evidence exceptions. 5. Defer npm run verify, static smoke, inventory coverage, and full browser matrix under the user-approved ten-task cadence; record residual risk.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-08-13T07:11:20.352Z — VERIFY — ok

By: CODER

Note: Verified: source provenance tests passed; the exhaustive gate validates 42 runtime modules with 35 concrete pinned mappings and 7 detailed browser-only exceptions; app fast coverage is 79 tests at 100 percent; parity inventory resolved 112 evidence references with no exceptions; all declared static gates passed. Full suite remains deferred under the approved ten-task cadence.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-08-13T07:02:28.470Z, excerpt_hash=sha256:0f011454b89ebeb8654c573fe055f8763425848cda7b6bff7b2c1e152ad9300a

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202608130702-JBPZ8C/blueprint/resolved-snapshot.json
- old_digest: c652756cab3e529e753c318fdbf88bf3cc37190bfdd7105bbe6ea2cb6dcef72b
- current_digest: c652756cab3e529e753c318fdbf88bf3cc37190bfdd7105bbe6ea2cb6dcef72b
- route_changed: no
- safe_command: agentplane blueprint snapshot 202608130702-JBPZ8C

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane commit 202608130702-JBPZ8C -m 🧩 JBPZ8C task: persist canonical task artifacts --allow-tasks
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: true
- repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert task-related commit(s).
- Re-run required checks to confirm rollback safety.

## Findings
