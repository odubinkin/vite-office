---
id: "202609220629-GPYZ92"
title: "Audit implemented LibreOffice parity and publish remediation plan"
status: "DOING"
priority: "high"
owner: "DOCS"
revision: 16
origin:
  system: "manual"
depends_on: []
tags:
  - "docs"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-09-22T06:29:40.336Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-09-22T06:44:16.647Z"
  updated_by: "CODER"
  note: "verified-202609220629-GPYZ92"
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-09-22T06:44:06.560Z"
  updated_by: "EVALUATOR"
  note: "Parity plan is complete, evidence-based, actionable, and policy-compliant."
  evaluated_sha: "feef2502c7e5e0ec3629aea76756fff426cd8b2e"
  blueprint_digest: "77827e6f994a82f6b761686a73b3071c0d0b4961197c5e41ff93ba035eb64c6b"
  evidence_refs:
    - ".agentplane/tasks/202609220629-GPYZ92/README.md"
    - ".agentplane/tasks/202609220629-GPYZ92/quality/20260922-064406560-recovery-context/quality-report.json"
    - ".agentplane/tasks/202609220629-GPYZ92/quality/20260922-064406560-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202609220629-GPYZ92/quality/20260922-064406560-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202609220629-GPYZ92/blueprint/resolved-snapshot.json"
    - "docs/program/vite-office-upstream-parity-plan.md"
    - "npx prettier --check docs/program/vite-office-upstream-parity-plan.md"
    - "node .agentplane/policy/check-routing.mjs"
    - "ap doctor"
  findings:
    - "Document inventories the implemented surface, distinguishes justified browser adaptations from unjustified divergences, prioritizes concrete refactoring findings, and defines phased acceptance criteria."
commit: null
comments:
  -
    author: "DOCS"
    body: "Start: audit current implementation against pinned upstream and write the approved parity plan."
events:
  -
    type: "status"
    at: "2026-09-22T06:29:52.570Z"
    author: "DOCS"
    from: "TODO"
    to: "DOING"
    note: "Start: audit current implementation against pinned upstream and write the approved parity plan."
  -
    type: "verify"
    at: "2026-09-22T06:43:31.010Z"
    author: "DOCS"
    state: "ok"
    note: "New parity plan is present, formatted, structurally complete, path-checked, and grounded in local implementation/upstream audit evidence."
  -
    type: "verify"
    at: "2026-09-22T06:43:40.616Z"
    author: "CODER"
    state: "ok"
    note: "verified-202609220629-GPYZ92"
  -
    type: "verify"
    at: "2026-09-22T06:44:16.647Z"
    author: "CODER"
    state: "ok"
    note: "verified-202609220629-GPYZ92"
doc_version: 3
doc_updated_at: "2026-09-22T06:44:16.723Z"
doc_updated_by: "DOCS"
description: "Inventory implemented vite-office functionality against the repository-pinned LibreOffice upstream; identify unjustified architecture, contract, data-model, default-behavior, file-layout, UI adapter, and prior-refactor deviations; publish a prioritized remediation plan at docs/program/vite-office-upstream-parity-plan.md."
sections:
  Summary: "Audit the already implemented vite-office scope against the locally pinned LibreOffice upstream and replace the deleted parity-plan document with a new evidence-based remediation program."
  Scope: "Read-only inventory and comparison of repository implementation, tests, configuration, and pinned upstream; focused review of architecture, data models, public contracts, defaults, source-tree correspondence, React UI components, adapters, and artifacts from prior refactors. The only product-file mutation is docs/program/vite-office-upstream-parity-plan.md; Agentplane task artifacts are lifecycle metadata. Browser-irrelevant LibreOffice modules are explicitly out of implementation scope."
  Plan: "1. Inventory repository topology, manifests, tests, and pinned upstream mapping. 2. Map implemented features/modules to LibreOffice counterparts. 3. Compare representative implementations for architecture, data models, contracts, defaults, and file placement. 4. Audit React/UI and adapter layers for duplication, shims, stale abstractions, and refactor residue. 5. Produce a phased, prioritized parity plan with concrete file/module targets, acceptance criteria, dependencies, and verification. 6. Validate the document, links/paths, Agentplane routing, and final repository state."
  Verify Steps: "1. test -s docs/program/vite-office-upstream-parity-plan.md. 2. Confirm every cited repository and pinned-upstream path exists using a path-extraction/check script. 3. Confirm the plan includes inventory, divergence findings, UI/refactor artifacts, target architecture principles, phased work items, priorities/dependencies, parity acceptance criteria, and explicit browser exclusions. 4. node .agentplane/policy/check-routing.mjs. 5. ap doctor. 6. git diff --check and git status --short --untracked-files=all."
  Verification: |-
    PASS: test -s docs/program/vite-office-upstream-parity-plan.md; custom path extraction found 8 exact cited repo/upstream paths and 0 missing; required-section and keyword checks found inventory, divergences, UI artifacts, target architecture, seven execution phases, dependencies, verification, browser exclusions, and Definition of Done; npx prettier --check docs/program/vite-office-upstream-parity-plan.md; git diff --check; node .agentplane/policy/check-routing.mjs (OK); ap doctor (OK, with one pre-existing historical-task warning and informational fallback-hook notices). Audit evidence also passed npm run inventory:parity, npm run check:dependencies, npm run check:source-tree, npm run check:source-provenance, and npm run check:writer-resources.

    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-09-22T06:43:31.010Z — VERIFY — ok

    By: DOCS

    Note: New parity plan is present, formatted, structurally complete, path-checked, and grounded in local implementation/upstream audit evidence.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-22T06:43:06.519Z, excerpt_hash=sha256:3183ded56cd2571de27e58cf138d302229b7c05d43946267e6de8880e6a2220d

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609220629-GPYZ92/blueprint/resolved-snapshot.json
    - old_digest: 77827e6f994a82f6b761686a73b3071c0d0b4961197c5e41ff93ba035eb64c6b
    - current_digest: 77827e6f994a82f6b761686a73b3071c0d0b4961197c5e41ff93ba035eb64c6b
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202609220629-GPYZ92

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202609220629-GPYZ92
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: true
    - repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
    - risks: none

    ### 2026-09-22T06:43:40.616Z — VERIFY — ok

    By: CODER

    Note: verified-202609220629-GPYZ92
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-22T06:43:31.088Z, excerpt_hash=sha256:3183ded56cd2571de27e58cf138d302229b7c05d43946267e6de8880e6a2220d

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609220629-GPYZ92/blueprint/resolved-snapshot.json
    - old_digest: 77827e6f994a82f6b761686a73b3071c0d0b4961197c5e41ff93ba035eb64c6b
    - current_digest: 77827e6f994a82f6b761686a73b3071c0d0b4961197c5e41ff93ba035eb64c6b
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202609220629-GPYZ92

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task complete 202609220629-GPYZ92 --result verified-202609220629-GPYZ92 --commit feef2502c7e5e0ec3629aea76756fff426cd8b2e
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: true
    - repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
    - risks: none

    ### 2026-09-22T06:44:16.647Z — VERIFY — ok

    By: CODER

    Note: verified-202609220629-GPYZ92
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-22T06:43:40.688Z, excerpt_hash=sha256:3183ded56cd2571de27e58cf138d302229b7c05d43946267e6de8880e6a2220d

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609220629-GPYZ92/blueprint/resolved-snapshot.json
    - old_digest: 77827e6f994a82f6b761686a73b3071c0d0b4961197c5e41ff93ba035eb64c6b
    - current_digest: 77827e6f994a82f6b761686a73b3071c0d0b4961197c5e41ff93ba035eb64c6b
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202609220629-GPYZ92

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task complete 202609220629-GPYZ92 --result verified-202609220629-GPYZ92 --commit feef2502c7e5e0ec3629aea76756fff426cd8b2e
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: true
    - repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Remove the newly recreated docs/program/vite-office-upstream-parity-plan.md and revert only task-local Agentplane lifecycle changes if explicitly requested; do not alter pre-existing user changes."
  Findings: |-
    Audit inventory: 149 production TS/TSX runtime files plus one test helper currently included by provenance inventory; 45 capability records; 92 upstream-mechanism, 37 browser-adaptation, and 21 local-infrastructure records. The existing parity gate reports 45/45 capabilities ready with zero gaps while module-level evidence still has 119 behavior-unverified, 84 contract-unverified, and 74 defaults-unverified records. Confirmed priority findings include .uno:ExportTo semantic mismatch, AutoRecovery 1-minute versus upstream 10-minute default, StartPara forced to left, fixed English untitled title, monolithic/custom Sfx dispatch adapters, parallel Writer DTO and persistence models, React-owned controller/orchestration logic, handwritten resource allowlists, misleading browser persistence placement under filter ownership, stale docvw references, and a duplicated SetListRestart attribute write. The plan preserves justified React/DOM/Worker/IndexedDB/File/Clipboard boundaries and excludes non-browser suites from current scope.

    - Observation: The prior parity gate reports 45/45 ready despite extensive unverified module-level contract, behavior, and default evidence.
      Impact: The new phased plan first repairs evidence semantics, then resolves command/default, Sfx, model, UI, persistence, and Writer breadth deviations.
      Resolution: Verified document, policy routing, repository doctor, formatting, path references, and diff integrity; unrelated phase-8 deletion remains outside task scope.
id_source: "generated"
---
## Summary

Audit the already implemented vite-office scope against the locally pinned LibreOffice upstream and replace the deleted parity-plan document with a new evidence-based remediation program.

## Scope

Read-only inventory and comparison of repository implementation, tests, configuration, and pinned upstream; focused review of architecture, data models, public contracts, defaults, source-tree correspondence, React UI components, adapters, and artifacts from prior refactors. The only product-file mutation is docs/program/vite-office-upstream-parity-plan.md; Agentplane task artifacts are lifecycle metadata. Browser-irrelevant LibreOffice modules are explicitly out of implementation scope.

## Plan

1. Inventory repository topology, manifests, tests, and pinned upstream mapping. 2. Map implemented features/modules to LibreOffice counterparts. 3. Compare representative implementations for architecture, data models, contracts, defaults, and file placement. 4. Audit React/UI and adapter layers for duplication, shims, stale abstractions, and refactor residue. 5. Produce a phased, prioritized parity plan with concrete file/module targets, acceptance criteria, dependencies, and verification. 6. Validate the document, links/paths, Agentplane routing, and final repository state.

## Verify Steps

1. test -s docs/program/vite-office-upstream-parity-plan.md. 2. Confirm every cited repository and pinned-upstream path exists using a path-extraction/check script. 3. Confirm the plan includes inventory, divergence findings, UI/refactor artifacts, target architecture principles, phased work items, priorities/dependencies, parity acceptance criteria, and explicit browser exclusions. 4. node .agentplane/policy/check-routing.mjs. 5. ap doctor. 6. git diff --check and git status --short --untracked-files=all.

## Verification

PASS: test -s docs/program/vite-office-upstream-parity-plan.md; custom path extraction found 8 exact cited repo/upstream paths and 0 missing; required-section and keyword checks found inventory, divergences, UI artifacts, target architecture, seven execution phases, dependencies, verification, browser exclusions, and Definition of Done; npx prettier --check docs/program/vite-office-upstream-parity-plan.md; git diff --check; node .agentplane/policy/check-routing.mjs (OK); ap doctor (OK, with one pre-existing historical-task warning and informational fallback-hook notices). Audit evidence also passed npm run inventory:parity, npm run check:dependencies, npm run check:source-tree, npm run check:source-provenance, and npm run check:writer-resources.

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-09-22T06:43:31.010Z — VERIFY — ok

By: DOCS

Note: New parity plan is present, formatted, structurally complete, path-checked, and grounded in local implementation/upstream audit evidence.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-22T06:43:06.519Z, excerpt_hash=sha256:3183ded56cd2571de27e58cf138d302229b7c05d43946267e6de8880e6a2220d

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609220629-GPYZ92/blueprint/resolved-snapshot.json
- old_digest: 77827e6f994a82f6b761686a73b3071c0d0b4961197c5e41ff93ba035eb64c6b
- current_digest: 77827e6f994a82f6b761686a73b3071c0d0b4961197c5e41ff93ba035eb64c6b
- route_changed: no
- safe_command: agentplane blueprint snapshot 202609220629-GPYZ92

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202609220629-GPYZ92
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: true
- repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
- risks: none

### 2026-09-22T06:43:40.616Z — VERIFY — ok

By: CODER

Note: verified-202609220629-GPYZ92
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-22T06:43:31.088Z, excerpt_hash=sha256:3183ded56cd2571de27e58cf138d302229b7c05d43946267e6de8880e6a2220d

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609220629-GPYZ92/blueprint/resolved-snapshot.json
- old_digest: 77827e6f994a82f6b761686a73b3071c0d0b4961197c5e41ff93ba035eb64c6b
- current_digest: 77827e6f994a82f6b761686a73b3071c0d0b4961197c5e41ff93ba035eb64c6b
- route_changed: no
- safe_command: agentplane blueprint snapshot 202609220629-GPYZ92

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task complete 202609220629-GPYZ92 --result verified-202609220629-GPYZ92 --commit feef2502c7e5e0ec3629aea76756fff426cd8b2e
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: true
- repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
- risks: none

### 2026-09-22T06:44:16.647Z — VERIFY — ok

By: CODER

Note: verified-202609220629-GPYZ92
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-22T06:43:40.688Z, excerpt_hash=sha256:3183ded56cd2571de27e58cf138d302229b7c05d43946267e6de8880e6a2220d

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609220629-GPYZ92/blueprint/resolved-snapshot.json
- old_digest: 77827e6f994a82f6b761686a73b3071c0d0b4961197c5e41ff93ba035eb64c6b
- current_digest: 77827e6f994a82f6b761686a73b3071c0d0b4961197c5e41ff93ba035eb64c6b
- route_changed: no
- safe_command: agentplane blueprint snapshot 202609220629-GPYZ92

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task complete 202609220629-GPYZ92 --result verified-202609220629-GPYZ92 --commit feef2502c7e5e0ec3629aea76756fff426cd8b2e
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: true
- repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Remove the newly recreated docs/program/vite-office-upstream-parity-plan.md and revert only task-local Agentplane lifecycle changes if explicitly requested; do not alter pre-existing user changes.

## Findings

Audit inventory: 149 production TS/TSX runtime files plus one test helper currently included by provenance inventory; 45 capability records; 92 upstream-mechanism, 37 browser-adaptation, and 21 local-infrastructure records. The existing parity gate reports 45/45 capabilities ready with zero gaps while module-level evidence still has 119 behavior-unverified, 84 contract-unverified, and 74 defaults-unverified records. Confirmed priority findings include .uno:ExportTo semantic mismatch, AutoRecovery 1-minute versus upstream 10-minute default, StartPara forced to left, fixed English untitled title, monolithic/custom Sfx dispatch adapters, parallel Writer DTO and persistence models, React-owned controller/orchestration logic, handwritten resource allowlists, misleading browser persistence placement under filter ownership, stale docvw references, and a duplicated SetListRestart attribute write. The plan preserves justified React/DOM/Worker/IndexedDB/File/Clipboard boundaries and excludes non-browser suites from current scope.

- Observation: The prior parity gate reports 45/45 ready despite extensive unverified module-level contract, behavior, and default evidence.
  Impact: The new phased plan first repairs evidence semantics, then resolves command/default, Sfx, model, UI, persistence, and Writer breadth deviations.
  Resolution: Verified document, policy routing, repository doctor, formatting, path references, and diff integrity; unrelated phase-8 deletion remains outside task scope.
