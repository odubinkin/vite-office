---
id: "202609150900-RD8B9V"
title: "Plan upstream LibreOffice parity for implemented functionality"
status: "DOING"
priority: "med"
owner: "PLANNER"
revision: 13
origin:
  system: "manual"
depends_on: []
tags:
  - "docs"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-09-15T09:01:29.194Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-09-15T09:26:36.624Z"
  updated_by: "CODER"
  note: "verified-202609150900-RD8B9V"
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-09-15T09:26:25.457Z"
  updated_by: "EVALUATOR"
  note: "The replacement plan is complete, evidence-based, and executable against the pinned LibreOffice baseline."
  evaluated_sha: "f352473f5368dc09ced950cd7cfd0c9b663b4afa"
  blueprint_digest: "5aa00cbcc04fdd718cc26ea1ecaf0f2cf14495930be60f0846fb30f3a20cd3d8"
  evidence_refs:
    - ".agentplane/tasks/202609150900-RD8B9V/README.md"
    - ".agentplane/tasks/202609150900-RD8B9V/quality/20260915-092625457-recovery-context/quality-report.json"
    - ".agentplane/tasks/202609150900-RD8B9V/quality/20260915-092625457-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202609150900-RD8B9V/quality/20260915-092625457-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202609150900-RD8B9V/blueprint/resolved-snapshot.json"
    - "docs/program/vite-office-upstream-parity-plan.md"
    - "npm test: 60/296 application and 32/84 inventory tests passed with 100% reported coverage"
    - "npm run format:check; node .agentplane/policy/check-routing.mjs; ap doctor; git diff --check"
  findings:
    - "All 35 current Writer capabilities are individually inventoried; concrete contract, ownership, default, path, UI/DOM, persistence, and verification gaps are mapped to nine dependency-ordered phases with acceptance criteria and risk controls."
commit: null
comments:
  -
    author: "PLANNER"
    body: "Start: inventory local implementation and pinned LibreOffice sources, classify parity deviations, and author the approved upstream-parity plan."
events:
  -
    type: "status"
    at: "2026-09-15T09:01:38.774Z"
    author: "PLANNER"
    from: "TODO"
    to: "DOING"
    note: "Start: inventory local implementation and pinned LibreOffice sources, classify parity deviations, and author the approved upstream-parity plan."
  -
    type: "verify"
    at: "2026-09-15T09:25:22.306Z"
    author: "PLANNER"
    state: "ok"
    note: "Verified the replacement upstream-parity plan: 892 lines, all 35 current Writer capability records assessed, nine phases (0-8), concrete local/upstream path evidence, UI/refactoring findings, target architecture, acceptance gates, risks, exclusions, and stop rules. Structural check, npm test (60/296 app and 32/84 inventory), Prettier, routing policy, Agentplane doctor, and git diff whitespace checks passed."
  -
    type: "verify"
    at: "2026-09-15T09:25:32.905Z"
    author: "CODER"
    state: "ok"
    note: "verified-202609150900-RD8B9V"
  -
    type: "verify"
    at: "2026-09-15T09:26:36.624Z"
    author: "CODER"
    state: "ok"
    note: "verified-202609150900-RD8B9V"
doc_version: 3
doc_updated_at: "2026-09-15T09:26:36.675Z"
doc_updated_by: "PLANNER"
description: "Inventory implemented vite-office functionality against the locally pinned LibreOffice upstream; identify unjustified architectural, data-model, contract, default-behavior, file-layout, UI adapter, and refactoring deviations; write an executable remediation plan to docs/program/vite-office-upstream-parity-plan.md."
sections:
  Summary: "Create a fresh, evidence-based plan for bringing the currently implemented vite-office functionality into architectural, data-model, contract, file-layout, and default-behavior parity with the locally pinned LibreOffice upstream."
  Scope: "In scope: read-only inventory of apps/office/src, tests, scripts, docs/program inventories, package configuration, and vendor/libreoffice-reference; comparison of implemented non-UI and React/UI layers with relevant upstream sources; identification of unjustified deviations, redundant adapters, workarounds, and refactoring residue; creation of docs/program/vite-office-upstream-parity-plan.md. Out of scope: implementation refactors, network access, changes to pinned upstream, and browser-irrelevant LibreOffice modules."
  Plan: |-
    1. Inventory implemented modules, tests, boundaries, public contracts, and data ownership.
    2. Resolve the pinned upstream revision and map each implemented domain to authoritative LibreOffice files.
    3. Compare architecture, state/data models, interfaces, defaults, file placement, and behavior; distinguish stack-required adaptations from avoidable divergence.
    4. Audit React/UI composition for redundant adapters, duplicated state, command bypasses, compatibility shims, and refactoring residue.
    5. Write a prioritized executable parity plan with target structure, work packages, dependencies, acceptance criteria, verification, exclusions, and risks.
    6. Validate the document and record evidence.
  Verify Steps: |-
    1. Run a structural content check that docs/program/vite-office-upstream-parity-plan.md exists and contains baseline/scope, inventory, upstream mapping, deviation taxonomy, UI/refactoring findings, target architecture, phased work packages, acceptance criteria, verification strategy, exclusions, and risks. Expected: every required section exists and cites concrete repository/upstream paths.
    2. Run npm test. Expected: existing unit and inventory suites pass; the docs-only change introduces no repository regression.
    3. Run node .agentplane/policy/check-routing.mjs. Expected: Agentplane routing policy passes.
    4. Run ap doctor. Expected: repository workflow/task state is healthy.
    5. Run git diff --check and git status --short --untracked-files=all. Expected: no whitespace errors and only intentional plan/task artifacts are present.
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-09-15T09:25:22.306Z — VERIFY — ok

    By: PLANNER

    Note: Verified the replacement upstream-parity plan: 892 lines, all 35 current Writer capability records assessed, nine phases (0-8), concrete local/upstream path evidence, UI/refactoring findings, target architecture, acceptance gates, risks, exclusions, and stop rules. Structural check, npm test (60/296 app and 32/84 inventory), Prettier, routing policy, Agentplane doctor, and git diff whitespace checks passed.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-15T09:01:38.774Z, excerpt_hash=sha256:e809aea743640c89ba3e9e0f548871f306e1db924c33f68682f34fe9da4f0a72

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609150900-RD8B9V/blueprint/resolved-snapshot.json
    - old_digest: 5aa00cbcc04fdd718cc26ea1ecaf0f2cf14495930be60f0846fb30f3a20cd3d8
    - current_digest: 5aa00cbcc04fdd718cc26ea1ecaf0f2cf14495930be60f0846fb30f3a20cd3d8
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202609150900-RD8B9V

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202609150900-RD8B9V
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: true
    - repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
    - risks: none

    ### 2026-09-15T09:25:32.905Z — VERIFY — ok

    By: CODER

    Note: verified-202609150900-RD8B9V
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-15T09:25:22.362Z, excerpt_hash=sha256:e809aea743640c89ba3e9e0f548871f306e1db924c33f68682f34fe9da4f0a72

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609150900-RD8B9V/blueprint/resolved-snapshot.json
    - old_digest: 5aa00cbcc04fdd718cc26ea1ecaf0f2cf14495930be60f0846fb30f3a20cd3d8
    - current_digest: 5aa00cbcc04fdd718cc26ea1ecaf0f2cf14495930be60f0846fb30f3a20cd3d8
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202609150900-RD8B9V

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task complete 202609150900-RD8B9V --result verified-202609150900-RD8B9V --commit 9f286ab2db1295f1a0c5d49b6f66ec9c54deda68
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: true
    - repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
    - risks: none

    ### 2026-09-15T09:26:36.624Z — VERIFY — ok

    By: CODER

    Note: verified-202609150900-RD8B9V
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-15T09:25:32.957Z, excerpt_hash=sha256:e809aea743640c89ba3e9e0f548871f306e1db924c33f68682f34fe9da4f0a72

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609150900-RD8B9V/blueprint/resolved-snapshot.json
    - old_digest: 5aa00cbcc04fdd718cc26ea1ecaf0f2cf14495930be60f0846fb30f3a20cd3d8
    - current_digest: 5aa00cbcc04fdd718cc26ea1ecaf0f2cf14495930be60f0846fb30f3a20cd3d8
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202609150900-RD8B9V

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task complete 202609150900-RD8B9V --result verified-202609150900-RD8B9V --commit f352473f5368dc09ced950cd7cfd0c9b663b4afa
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: true
    - repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Remove only docs/program/vite-office-upstream-parity-plan.md and close or supersede this task through Agentplane. Do not restore the previously deleted plan because the user explicitly requested a fresh replacement."
  Findings: |-
    No material drift identified at task setup. The pre-existing deletion of docs/program/vite-office-upstream-parity-plan.md is intentional user context.

    - Observation: The current parity inventory resolves evidence but does not detect semantic defects such as incorrect Writer WhichIds, incompatible command identities, ownership divergence, or browser/React imports in upstream core paths.
      Impact: Existing implemented labels cannot be treated as upstream parity; feature expansion before correcting the P0 contracts would compound incompatible persisted data, dispatch, and selection models.
      Resolution: The plan begins with generated pinned invariants, semantic provenance and boundary enforcement, and capability re-attestation, then migrates core ownership, defaults, shells, browser projection, React presentation, filters, and persistence in dependency order.
id_source: "generated"
---
## Summary

Create a fresh, evidence-based plan for bringing the currently implemented vite-office functionality into architectural, data-model, contract, file-layout, and default-behavior parity with the locally pinned LibreOffice upstream.

## Scope

In scope: read-only inventory of apps/office/src, tests, scripts, docs/program inventories, package configuration, and vendor/libreoffice-reference; comparison of implemented non-UI and React/UI layers with relevant upstream sources; identification of unjustified deviations, redundant adapters, workarounds, and refactoring residue; creation of docs/program/vite-office-upstream-parity-plan.md. Out of scope: implementation refactors, network access, changes to pinned upstream, and browser-irrelevant LibreOffice modules.

## Plan

1. Inventory implemented modules, tests, boundaries, public contracts, and data ownership.
2. Resolve the pinned upstream revision and map each implemented domain to authoritative LibreOffice files.
3. Compare architecture, state/data models, interfaces, defaults, file placement, and behavior; distinguish stack-required adaptations from avoidable divergence.
4. Audit React/UI composition for redundant adapters, duplicated state, command bypasses, compatibility shims, and refactoring residue.
5. Write a prioritized executable parity plan with target structure, work packages, dependencies, acceptance criteria, verification, exclusions, and risks.
6. Validate the document and record evidence.

## Verify Steps

1. Run a structural content check that docs/program/vite-office-upstream-parity-plan.md exists and contains baseline/scope, inventory, upstream mapping, deviation taxonomy, UI/refactoring findings, target architecture, phased work packages, acceptance criteria, verification strategy, exclusions, and risks. Expected: every required section exists and cites concrete repository/upstream paths.
2. Run npm test. Expected: existing unit and inventory suites pass; the docs-only change introduces no repository regression.
3. Run node .agentplane/policy/check-routing.mjs. Expected: Agentplane routing policy passes.
4. Run ap doctor. Expected: repository workflow/task state is healthy.
5. Run git diff --check and git status --short --untracked-files=all. Expected: no whitespace errors and only intentional plan/task artifacts are present.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-09-15T09:25:22.306Z — VERIFY — ok

By: PLANNER

Note: Verified the replacement upstream-parity plan: 892 lines, all 35 current Writer capability records assessed, nine phases (0-8), concrete local/upstream path evidence, UI/refactoring findings, target architecture, acceptance gates, risks, exclusions, and stop rules. Structural check, npm test (60/296 app and 32/84 inventory), Prettier, routing policy, Agentplane doctor, and git diff whitespace checks passed.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-15T09:01:38.774Z, excerpt_hash=sha256:e809aea743640c89ba3e9e0f548871f306e1db924c33f68682f34fe9da4f0a72

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609150900-RD8B9V/blueprint/resolved-snapshot.json
- old_digest: 5aa00cbcc04fdd718cc26ea1ecaf0f2cf14495930be60f0846fb30f3a20cd3d8
- current_digest: 5aa00cbcc04fdd718cc26ea1ecaf0f2cf14495930be60f0846fb30f3a20cd3d8
- route_changed: no
- safe_command: agentplane blueprint snapshot 202609150900-RD8B9V

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202609150900-RD8B9V
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: true
- repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
- risks: none

### 2026-09-15T09:25:32.905Z — VERIFY — ok

By: CODER

Note: verified-202609150900-RD8B9V
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-15T09:25:22.362Z, excerpt_hash=sha256:e809aea743640c89ba3e9e0f548871f306e1db924c33f68682f34fe9da4f0a72

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609150900-RD8B9V/blueprint/resolved-snapshot.json
- old_digest: 5aa00cbcc04fdd718cc26ea1ecaf0f2cf14495930be60f0846fb30f3a20cd3d8
- current_digest: 5aa00cbcc04fdd718cc26ea1ecaf0f2cf14495930be60f0846fb30f3a20cd3d8
- route_changed: no
- safe_command: agentplane blueprint snapshot 202609150900-RD8B9V

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task complete 202609150900-RD8B9V --result verified-202609150900-RD8B9V --commit 9f286ab2db1295f1a0c5d49b6f66ec9c54deda68
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: true
- repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
- risks: none

### 2026-09-15T09:26:36.624Z — VERIFY — ok

By: CODER

Note: verified-202609150900-RD8B9V
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-15T09:25:32.957Z, excerpt_hash=sha256:e809aea743640c89ba3e9e0f548871f306e1db924c33f68682f34fe9da4f0a72

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609150900-RD8B9V/blueprint/resolved-snapshot.json
- old_digest: 5aa00cbcc04fdd718cc26ea1ecaf0f2cf14495930be60f0846fb30f3a20cd3d8
- current_digest: 5aa00cbcc04fdd718cc26ea1ecaf0f2cf14495930be60f0846fb30f3a20cd3d8
- route_changed: no
- safe_command: agentplane blueprint snapshot 202609150900-RD8B9V

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task complete 202609150900-RD8B9V --result verified-202609150900-RD8B9V --commit f352473f5368dc09ced950cd7cfd0c9b663b4afa
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: true
- repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Remove only docs/program/vite-office-upstream-parity-plan.md and close or supersede this task through Agentplane. Do not restore the previously deleted plan because the user explicitly requested a fresh replacement.

## Findings

No material drift identified at task setup. The pre-existing deletion of docs/program/vite-office-upstream-parity-plan.md is intentional user context.

- Observation: The current parity inventory resolves evidence but does not detect semantic defects such as incorrect Writer WhichIds, incompatible command identities, ownership divergence, or browser/React imports in upstream core paths.
  Impact: Existing implemented labels cannot be treated as upstream parity; feature expansion before correcting the P0 contracts would compound incompatible persisted data, dispatch, and selection models.
  Resolution: The plan begins with generated pinned invariants, semantic provenance and boundary enforcement, and capability re-attestation, then migrates core ownership, defaults, shells, browser projection, React presentation, filters, and persistence in dependency order.
