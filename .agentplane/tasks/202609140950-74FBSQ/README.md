---
id: "202609140950-74FBSQ"
title: "Implement stage 6 ODT worker pipeline"
result_summary: "Implemented Stage 6 ODT worker pipeline"
status: "DONE"
priority: "high"
owner: "CODER"
revision: 12
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
  - "frontend"
task_kind: "code"
mutation_scope: "code"
verify:
  - "node .agentplane/policy/check-routing.mjs"
  - "npm run check:dependencies"
  - "npm run check:docs"
  - "npm run check:file-size"
  - "npm run inventory:parity"
  - "npm run lint"
  - "npm run test:coverage --workspace @vite-office/office"
  - "npm run test:e2e -- --grep ODT"
  - "npm run typecheck"
plan_approval:
  state: "approved"
  updated_at: "2026-09-14T09:51:29.793Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-09-14T10:37:15.193Z"
  updated_by: "CODER"
  note: "verified-202609140950-74FBSQ"
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-09-14T10:35:35.161Z"
  updated_by: "EVALUATOR"
  note: "Stage 6 implements the bounded LibreOffice-shaped ODT package/xmloff/sw filter pipeline in a Dedicated Worker with atomic main-thread installation."
  evaluated_sha: "28af106234e503c26b8aca0ad0c53799b04c7ec6"
  blueprint_digest: "fb0147a27b59986a3da883751b7645a4d71493b72dbecfc042034ef05c543cc0"
  evidence_refs:
    - ".agentplane/tasks/202609140950-74FBSQ/README.md"
    - ".agentplane/tasks/202609140950-74FBSQ/quality/20260914-103535161-recovery-context/quality-report.json"
    - ".agentplane/tasks/202609140950-74FBSQ/quality/20260914-103535161-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202609140950-74FBSQ/quality/20260914-103535161-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202609140950-74FBSQ/blueprint/resolved-snapshot.json"
    - "28af106234e5"
  findings:
    - "Implementation commit 28af106 passes 100% office and inventory coverage, pinned LibreOffice feature fixtures, Chromium ODT E2E, build, type, lint, dependency, documentation, file-size, provenance, parity, and routing checks."
commit:
  hash: "c6867d1c2e8787bb1284a68ba4d3911937f4fde1"
  message: "🧪 74FBSQ task: persist verification evidence"
comments:
  -
    author: "CODER"
    body: "Start: Implement the approved Stage 6 ODT worker pipeline against the pinned LibreOffice reference, including cancellation, atomic integration, bounded resources, and declared verification."
  -
    author: "CODER"
    body: "Verified: verified-202609140950-74FBSQ. Guided shortcut recorded verification and is closing the direct task with traceable commit metadata."
  -
    author: "CODER"
    body: "Verified: Implemented Stage 6 ODT import/export in a Dedicated Worker with upstream-shaped package, SAX, xmloff, and SwDocShell boundaries."
events:
  -
    type: "status"
    at: "2026-09-14T09:51:35.324Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: Implement the approved Stage 6 ODT worker pipeline against the pinned LibreOffice reference, including cancellation, atomic integration, bounded resources, and declared verification."
  -
    type: "verify"
    at: "2026-09-14T10:35:26.489Z"
    author: "CODER"
    state: "ok"
    note: "Stage 6 ODT worker pipeline passed the complete declared verification contract."
  -
    type: "verify"
    at: "2026-09-14T10:37:15.193Z"
    author: "CODER"
    state: "ok"
    note: "verified-202609140950-74FBSQ"
  -
    type: "status"
    at: "2026-09-14T10:37:15.383Z"
    author: "CODER"
    from: "DOING"
    to: "DONE"
    note: "Verified: verified-202609140950-74FBSQ. Guided shortcut recorded verification and is closing the direct task with traceable commit metadata."
  -
    type: "status"
    at: "2026-09-14T10:38:08.639Z"
    author: "CODER"
    from: "DONE"
    to: "DONE"
    note: "Verified: Implemented Stage 6 ODT import/export in a Dedicated Worker with upstream-shaped package, SAX, xmloff, and SwDocShell boundaries."
doc_version: 3
doc_updated_at: "2026-09-14T10:38:08.641Z"
doc_updated_by: "CODER"
description: "Implement section 10 (Stage 6) of docs/program/vite-office-upstream-parity-plan.md: move bounded ODT import/export ZIP and XML work behind a real versioned Web Worker protocol with cancellation, stale-result rejection, structured errors, transferables, resource limits, atomic document replacement, upstream-pinned semantic fixtures, and explicit STORE-only export constraints, staying maximally aligned with pinned LibreOffice ownership and behavior."
sections:
  Summary: |-
    Implement stage 6 ODT worker pipeline

    Implement section 10 (Stage 6) of docs/program/vite-office-upstream-parity-plan.md: move bounded ODT import/export ZIP and XML work behind a real versioned Web Worker protocol with cancellation, stale-result rejection, structured errors, transferables, resource limits, atomic document replacement, upstream-pinned semantic fixtures, and explicit STORE-only export constraints, staying maximally aligned with pinned LibreOffice ownership and behavior.
  Scope: |-
    - In scope: the bounded ODT import/export pipeline under `apps/office/src/{framework,package,xmloff,sw,vcl}`; the Writer document-shell integration; Web Worker entry/runtime; cancellation, stale-result rejection, transferable buffers, structured errors, protocol versioning, resource limits; semantic ODT fixtures/tests; parity/runtime records and Stage 6 documentation.
    - Upstream reference: the pinned local checkout at `vendor/libreoffice-reference` and baseline commit `9bc445578031fecf56086729d8e4940c77e14d65`; preserve LibreOffice package/xmloff/sw ownership and observable ODT semantics while adapting worker/browser plumbing.
    - Out of scope: unsupported ODT features, DEFLATE export, server-side services, unrelated Writer features, and byte-for-byte archive equivalence.
  Plan: |-
    1. Inspect the existing ODT, package, worker-protocol, document-shell, and browser medium paths, plus the exact pinned LibreOffice package/xmloff/sw counterparts and tests.
    2. Implement a real versioned ODT worker boundary whose import and export requests carry IDs, use transferable buffers, report typed progress/errors, support cancellation/disposal, reject stale results, and keep heavy ZIP/XML work off the UI path.
    3. Route Writer open/save/export through the worker service while validating the neutral result on the main thread and replacing the active SwDoc atomically only after complete success; retain the existing document on failure/cancellation.
    4. Enforce bounded archive/XML/resource behavior and keep STORE-only export explicit and size-controlled.
    5. Add upstream-pinned fixtures and focused unit/integration/E2E coverage for semantic roundtrip, malformed input, cancellation, stale results, transfer semantics, and session atomicity; update parity/runtime and technical documentation.
    6. Run all declared verification and Agentplane checks, record evidence, and finish the task without unrelated changes.
  Verify Steps: |-
    1. Run `npm run test:coverage --workspace @vite-office/office`. Expected: all office tests pass, including worker protocol/service, ODT semantic roundtrip, malformed-resource limits, cancellation/stale-result behavior, and atomic document-shell integration.
    2. Run `npm run typecheck`. Expected: worker messages, transferables, neutral ODT results, and document-shell integration type-check in both app and tooling projects.
    3. Run `npm run lint`. Expected: all changed TypeScript/TSX and tests pass lint with no warnings.
    4. Run `npm run check:dependencies`. Expected: package → xmloff → sw/filter → document-shell/browser boundaries remain valid with worker/browser code at the framework edge.
    5. Run `npm run check:docs`. Expected: all added public/internal symbols have the required JSDoc and file overviews.
    6. Run `npm run check:file-size`. Expected: no authored file violates the mandatory size threshold.
    7. Run `npm run inventory:parity`. Expected: Stage 6 runtime/parity mappings validate against the pinned local LibreOffice checkout.
    8. Run `npm run test:e2e -- --grep ODT`. Expected: ODT open/export scenarios pass through the worker-backed UI path.
    9. Run `npm run build`. Expected: Vite emits the worker and application static bundles successfully.
    10. Run `node .agentplane/policy/check-routing.mjs`. Expected: Agentplane policy routing remains valid.
    11. Inspect `git diff --check` and `git status --short --untracked-files=all`. Expected: no whitespace errors or unintended artifacts; the pre-existing untracked parity plan remains preserved.
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-09-14T10:35:26.489Z — VERIFY — ok

    By: CODER

    Note: Stage 6 ODT worker pipeline passed the complete declared verification contract.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-14T09:51:35.324Z, excerpt_hash=sha256:b3ceeaa2c017c13da824a54ae83d70269c27eb1efbb2a61ae71be7323094ce2d

    Details:

    Command: npm run test:coverage --workspace @vite-office/office. Result: pass. Evidence: 50 files, 240 tests, 100% statements/branches/functions/lines. Scope: ODT worker protocol, service, parser, filters, cancellation, stale results, and document-shell integration. Command: npm run typecheck. Result: pass. Evidence: tooling and office TypeScript projects completed with no errors. Scope: structured-clone messages, transferables, snapshots, and UI integration. Command: npm run lint. Result: pass. Evidence: ESLint completed with zero warnings. Scope: repository authored sources. Command: npm run check:dependencies. Result: pass. Evidence: 89 runtime sources, 280 imports, 12 allowed cross-module edges. Scope: package/xmloff/sw/framework boundaries. Command: npm run check:docs. Result: pass. Evidence: 224 authored source files validated. Scope: JSDoc contract. Command: npm run check:file-size. Result: pass. Evidence: 226 authored files scanned with no mandatory violation. Scope: decomposition gate. Command: npm run inventory:parity. Result: pass. Evidence: pinned baseline 9bc445578031fecf56086729d8e4940c77e14d65, zero exceptions. Scope: runtime/parity evidence. Command: npm run test:e2e -- --grep ODT. Result: pass. Evidence: Chromium ODT open/save scenario passed through emitted odt-worker bundle. Scope: production browser path. Command: npm run build. Result: pass. Evidence: Vite emitted odt-worker-CJXyx8nq.js and static application assets. Scope: production build. Command: node .agentplane/policy/check-routing.mjs. Result: pass. Evidence: policy routing OK. Scope: AgentPlane policy. Command: git diff --check and git status --short --untracked-files=all. Result: pass. Evidence: no whitespace errors or unintended artifacts; pre-existing docs/program/vite-office-upstream-parity-plan.md remains untracked. Scope: final repository state.

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609140950-74FBSQ/blueprint/resolved-snapshot.json
    - old_digest: fb0147a27b59986a3da883751b7645a4d71493b72dbecfc042034ef05c543cc0
    - current_digest: fb0147a27b59986a3da883751b7645a4d71493b72dbecfc042034ef05c543cc0
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202609140950-74FBSQ

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202609140950-74FBSQ
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: true
    - repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
    - risks: none

    ### 2026-09-14T10:37:15.193Z — VERIFY — ok

    By: CODER

    Note: verified-202609140950-74FBSQ
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-14T10:35:26.571Z, excerpt_hash=sha256:b3ceeaa2c017c13da824a54ae83d70269c27eb1efbb2a61ae71be7323094ce2d

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609140950-74FBSQ/blueprint/resolved-snapshot.json
    - old_digest: fb0147a27b59986a3da883751b7645a4d71493b72dbecfc042034ef05c543cc0
    - current_digest: fb0147a27b59986a3da883751b7645a4d71493b72dbecfc042034ef05c543cc0
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202609140950-74FBSQ

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task complete 202609140950-74FBSQ --result verified-202609140950-74FBSQ --commit c6867d1c2e8787bb1284a68ba4d3911937f4fde1
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: true
    - repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: |-
    - Revert only the implementation and task close commits for `202609140950-74FBSQ`; do not remove the pre-existing untracked Stage 6 plan.
    - Re-run the focused ODT tests, typecheck, dependency check, and production build to confirm the prior synchronous path is restored.
  Findings: ""
extensions:
  implementation_commit:
    hash: "28af106234e503c26b8aca0ad0c53799b04c7ec6"
    message: "⚙️ 74FBSQ task: implement ODT worker pipeline"
id_source: "generated"
---
## Summary

Implement stage 6 ODT worker pipeline

Implement section 10 (Stage 6) of docs/program/vite-office-upstream-parity-plan.md: move bounded ODT import/export ZIP and XML work behind a real versioned Web Worker protocol with cancellation, stale-result rejection, structured errors, transferables, resource limits, atomic document replacement, upstream-pinned semantic fixtures, and explicit STORE-only export constraints, staying maximally aligned with pinned LibreOffice ownership and behavior.

## Scope

- In scope: the bounded ODT import/export pipeline under `apps/office/src/{framework,package,xmloff,sw,vcl}`; the Writer document-shell integration; Web Worker entry/runtime; cancellation, stale-result rejection, transferable buffers, structured errors, protocol versioning, resource limits; semantic ODT fixtures/tests; parity/runtime records and Stage 6 documentation.
- Upstream reference: the pinned local checkout at `vendor/libreoffice-reference` and baseline commit `9bc445578031fecf56086729d8e4940c77e14d65`; preserve LibreOffice package/xmloff/sw ownership and observable ODT semantics while adapting worker/browser plumbing.
- Out of scope: unsupported ODT features, DEFLATE export, server-side services, unrelated Writer features, and byte-for-byte archive equivalence.

## Plan

1. Inspect the existing ODT, package, worker-protocol, document-shell, and browser medium paths, plus the exact pinned LibreOffice package/xmloff/sw counterparts and tests.
2. Implement a real versioned ODT worker boundary whose import and export requests carry IDs, use transferable buffers, report typed progress/errors, support cancellation/disposal, reject stale results, and keep heavy ZIP/XML work off the UI path.
3. Route Writer open/save/export through the worker service while validating the neutral result on the main thread and replacing the active SwDoc atomically only after complete success; retain the existing document on failure/cancellation.
4. Enforce bounded archive/XML/resource behavior and keep STORE-only export explicit and size-controlled.
5. Add upstream-pinned fixtures and focused unit/integration/E2E coverage for semantic roundtrip, malformed input, cancellation, stale results, transfer semantics, and session atomicity; update parity/runtime and technical documentation.
6. Run all declared verification and Agentplane checks, record evidence, and finish the task without unrelated changes.

## Verify Steps

1. Run `npm run test:coverage --workspace @vite-office/office`. Expected: all office tests pass, including worker protocol/service, ODT semantic roundtrip, malformed-resource limits, cancellation/stale-result behavior, and atomic document-shell integration.
2. Run `npm run typecheck`. Expected: worker messages, transferables, neutral ODT results, and document-shell integration type-check in both app and tooling projects.
3. Run `npm run lint`. Expected: all changed TypeScript/TSX and tests pass lint with no warnings.
4. Run `npm run check:dependencies`. Expected: package → xmloff → sw/filter → document-shell/browser boundaries remain valid with worker/browser code at the framework edge.
5. Run `npm run check:docs`. Expected: all added public/internal symbols have the required JSDoc and file overviews.
6. Run `npm run check:file-size`. Expected: no authored file violates the mandatory size threshold.
7. Run `npm run inventory:parity`. Expected: Stage 6 runtime/parity mappings validate against the pinned local LibreOffice checkout.
8. Run `npm run test:e2e -- --grep ODT`. Expected: ODT open/export scenarios pass through the worker-backed UI path.
9. Run `npm run build`. Expected: Vite emits the worker and application static bundles successfully.
10. Run `node .agentplane/policy/check-routing.mjs`. Expected: Agentplane policy routing remains valid.
11. Inspect `git diff --check` and `git status --short --untracked-files=all`. Expected: no whitespace errors or unintended artifacts; the pre-existing untracked parity plan remains preserved.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-09-14T10:35:26.489Z — VERIFY — ok

By: CODER

Note: Stage 6 ODT worker pipeline passed the complete declared verification contract.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-14T09:51:35.324Z, excerpt_hash=sha256:b3ceeaa2c017c13da824a54ae83d70269c27eb1efbb2a61ae71be7323094ce2d

Details:

Command: npm run test:coverage --workspace @vite-office/office. Result: pass. Evidence: 50 files, 240 tests, 100% statements/branches/functions/lines. Scope: ODT worker protocol, service, parser, filters, cancellation, stale results, and document-shell integration. Command: npm run typecheck. Result: pass. Evidence: tooling and office TypeScript projects completed with no errors. Scope: structured-clone messages, transferables, snapshots, and UI integration. Command: npm run lint. Result: pass. Evidence: ESLint completed with zero warnings. Scope: repository authored sources. Command: npm run check:dependencies. Result: pass. Evidence: 89 runtime sources, 280 imports, 12 allowed cross-module edges. Scope: package/xmloff/sw/framework boundaries. Command: npm run check:docs. Result: pass. Evidence: 224 authored source files validated. Scope: JSDoc contract. Command: npm run check:file-size. Result: pass. Evidence: 226 authored files scanned with no mandatory violation. Scope: decomposition gate. Command: npm run inventory:parity. Result: pass. Evidence: pinned baseline 9bc445578031fecf56086729d8e4940c77e14d65, zero exceptions. Scope: runtime/parity evidence. Command: npm run test:e2e -- --grep ODT. Result: pass. Evidence: Chromium ODT open/save scenario passed through emitted odt-worker bundle. Scope: production browser path. Command: npm run build. Result: pass. Evidence: Vite emitted odt-worker-CJXyx8nq.js and static application assets. Scope: production build. Command: node .agentplane/policy/check-routing.mjs. Result: pass. Evidence: policy routing OK. Scope: AgentPlane policy. Command: git diff --check and git status --short --untracked-files=all. Result: pass. Evidence: no whitespace errors or unintended artifacts; pre-existing docs/program/vite-office-upstream-parity-plan.md remains untracked. Scope: final repository state.

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609140950-74FBSQ/blueprint/resolved-snapshot.json
- old_digest: fb0147a27b59986a3da883751b7645a4d71493b72dbecfc042034ef05c543cc0
- current_digest: fb0147a27b59986a3da883751b7645a4d71493b72dbecfc042034ef05c543cc0
- route_changed: no
- safe_command: agentplane blueprint snapshot 202609140950-74FBSQ

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202609140950-74FBSQ
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: true
- repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
- risks: none

### 2026-09-14T10:37:15.193Z — VERIFY — ok

By: CODER

Note: verified-202609140950-74FBSQ
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-14T10:35:26.571Z, excerpt_hash=sha256:b3ceeaa2c017c13da824a54ae83d70269c27eb1efbb2a61ae71be7323094ce2d

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609140950-74FBSQ/blueprint/resolved-snapshot.json
- old_digest: fb0147a27b59986a3da883751b7645a4d71493b72dbecfc042034ef05c543cc0
- current_digest: fb0147a27b59986a3da883751b7645a4d71493b72dbecfc042034ef05c543cc0
- route_changed: no
- safe_command: agentplane blueprint snapshot 202609140950-74FBSQ

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task complete 202609140950-74FBSQ --result verified-202609140950-74FBSQ --commit c6867d1c2e8787bb1284a68ba4d3911937f4fde1
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: true
- repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert only the implementation and task close commits for `202609140950-74FBSQ`; do not remove the pre-existing untracked Stage 6 plan.
- Re-run the focused ODT tests, typecheck, dependency check, and production build to confirm the prior synchronous path is restored.

## Findings
