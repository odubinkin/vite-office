---
id: "202609130707-GXC6XE"
title: "Restore stage 1 module boundaries"
result_summary: "verified-202609130707-GXC6XE"
status: "DONE"
priority: "med"
owner: "CODER"
revision: 14
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-09-13T07:08:46.636Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-09-13T07:29:50.290Z"
  updated_by: "CODER"
  note: "verified-202609130707-GXC6XE"
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-09-13T07:29:13.859Z"
  updated_by: "EVALUATOR"
  note: "Stage 1 restores the specified module boundaries without changing the implemented Writer feature slice."
  evaluated_sha: "7cac83f35dcb96b922aaa29ca7f9811ad00780d5"
  blueprint_digest: "e85b1a8fa226ac90cae842537ed77e874a6c2b29c1727da4c1d1d11b25dc8df0"
  evidence_refs:
    - ".agentplane/tasks/202609130707-GXC6XE/README.md"
    - ".agentplane/tasks/202609130707-GXC6XE/quality/20260913-072913859-recovery-context/quality-report.json"
    - ".agentplane/tasks/202609130707-GXC6XE/quality/20260913-072913859-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202609130707-GXC6XE/quality/20260913-072913859-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202609130707-GXC6XE/blueprint/resolved-snapshot.json"
    - "npm run check:dependencies"
    - "npm run test:coverage"
    - "npm run test:inventory:coverage"
    - "npm run test:e2e"
    - "npm run test:static"
    - "apps/office/src/sw/source/uibase/app/swmodule.tsx"
    - "scripts/check-module-boundaries.mjs"
  findings:
    - "The diff removes every targeted reverse import, applies caller-owned WhichIds exactly like the pinned editeng constructors, isolates package manifest XML, injects neutral storage contracts, and activates Writer only through a composition-root factory; full regression and architecture checks pass."
commit:
  hash: "3785a949cd34440dde2a49f8311c8c356d434cd1"
  message: "🧪 GXC6XE task: record Stage 1 verification"
comments:
  -
    author: "CODER"
    body: "Start: Implement approved stage 1 module boundaries against pinned LibreOffice ownership, preserving current behavior and existing user changes."
  -
    author: "CODER"
    body: "Verified: verified-202609130707-GXC6XE. Guided shortcut recorded verification and is closing the direct task with traceable commit metadata."
events:
  -
    type: "status"
    at: "2026-09-13T07:08:51.368Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: Implement approved stage 1 module boundaries against pinned LibreOffice ownership, preserving current behavior and existing user changes."
  -
    type: "verify"
    at: "2026-09-13T07:29:03.035Z"
    author: "CODER"
    state: "ok"
    note: "Pass: check:dependencies (74 runtime sources, 211 relative imports, 12 allowed edges); format:check, lint, typecheck, check:docs and check:file-size; test:coverage (42 files, 176 tests, 100%); test:inventory:coverage (31 files, 79 tests, 100%); test:e2e (8/8); test:static; source provenance (74 modules); inventory:parity; policy routing; ap doctor; and git diff --check."
  -
    type: "verify"
    at: "2026-09-13T07:29:25.509Z"
    author: "CODER"
    state: "ok"
    note: "verified-202609130707-GXC6XE"
  -
    type: "verify"
    at: "2026-09-13T07:29:50.290Z"
    author: "CODER"
    state: "ok"
    note: "verified-202609130707-GXC6XE"
  -
    type: "status"
    at: "2026-09-13T07:29:50.481Z"
    author: "CODER"
    from: "DOING"
    to: "DONE"
    note: "Verified: verified-202609130707-GXC6XE. Guided shortcut recorded verification and is closing the direct task with traceable commit metadata."
doc_version: 3
doc_updated_at: "2026-09-13T07:29:50.482Z"
doc_updated_by: "CODER"
description: "Implement stage 1 from docs/program/vite-office-upstream-parity-plan.md: remove sfx2-to-framework, editeng-to-sw, package-to-xmloff, vcl/svl-to-sfx2 reverse dependencies; register Writer through a factory descriptor; add enforced import-graph validation while preserving current behavior and staying close to LibreOffice ownership boundaries."
sections:
  Summary: |-
    Restore stage 1 module boundaries

    Implement stage 1 from docs/program/vite-office-upstream-parity-plan.md: remove sfx2-to-framework, editeng-to-sw, package-to-xmloff, vcl/svl-to-sfx2 reverse dependencies; register Writer through a factory descriptor; add enforced import-graph validation while preserving current behavior and staying close to LibreOffice ownership boundaries.
  Scope: |-
    In scope:
    - Add neutral low-level contracts for document module identity and serializable snapshots so sfx2, svl, vcl, and framework depend in the intended direction.
    - Move generic editeng item IDs into editeng ownership and retain Writer aliases/mapping in sw.
    - Remove package imports from xmloff by using package-owned manifest XML serialization primitives.
    - Introduce OfficeModuleDescriptor/factory composition so framework desktop renders the active module without importing Writer implementation.
    - Add a deterministic dependency-graph checker and integrate it into the root verification pipeline.
    - Add or update focused tests and documentation/provenance needed by these changes.

    Expected implementation paths are limited to package scripts/config plus apps/office/src under framework, sfx2, svl, vcl, editeng, package, xmloff, and sw. Out of scope: document-session ownership, unified command dispatch, action-based undo, canonical selection/input, new product features, dependency upgrades, and network access.
  Plan: |-
    1. Characterize the current reverse import edges and compare the matching local upstream LibreOffice module ownership/build dependencies.
    2. Define the smallest neutral contracts and migrate sfx2/framework, editeng/sw, and storage/recovery imports without changing observable behavior.
    3. Make manifest serialization package-local and keep document XML mapping in xmloff.
    4. Register Writer through an OfficeModuleDescriptor factory owned by the composition root; keep framework desktop suite-agnostic.
    5. Implement an import-graph checker covering forbidden reverse edges, suite imports from framework core, browser-adapter imports from domain code, cycles, and non-allowlisted cross-layer edges; wire it into npm verify.
    6. Run focused tests, the complete repository verification pipeline, AgentPlane policy checks, and final diff/status review.
  Verify Steps: |-
    1. Run agentplane task verify-show 202609130707-GXC6XE. Expected: this acceptance contract is authoritative before verification.
    2. Run npm run check:dependencies. Expected: all runtime TypeScript imports conform to the declared layer allowlist; no reverse edge, framework-core concrete suite import, browser-adapter import from domain code, or cycle is reported.
    3. Run npm run format:check, npm run lint, npm run typecheck, npm run check:docs, and npm run check:file-size. Expected: formatting, lint/JSDoc, strict TypeScript, documentation, and file-size checks pass.
    4. Run npm run test:coverage and npm run test:inventory:coverage. Expected: unit/component tests and inventory tests pass at configured coverage thresholds, including focused boundary/factory/manifest/storage cases.
    5. Run npm run test:e2e and npm run test:static. Expected: Writer and suite navigation behavior remain intact in the production-like static build.
    6. Run node .agentplane/policy/check-routing.mjs and ap doctor. Expected: AgentPlane routing, policy budgets, and repository health pass.
    7. Run git diff --check and git status --short --untracked-files=all. Expected: no whitespace errors, no unintended tracked changes, user-preexisting changes remain preserved, and all new artifacts are reviewed.
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-09-13T07:29:03.035Z — VERIFY — ok

    By: CODER

    Note: Pass: check:dependencies (74 runtime sources, 211 relative imports, 12 allowed edges); format:check, lint, typecheck, check:docs and check:file-size; test:coverage (42 files, 176 tests, 100%); test:inventory:coverage (31 files, 79 tests, 100%); test:e2e (8/8); test:static; source provenance (74 modules); inventory:parity; policy routing; ap doctor; and git diff --check.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-13T07:08:51.368Z, excerpt_hash=sha256:7bded797894496f9a7cf781f135b44301833a245e241f63ffed2a20c4685c84a

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609130707-GXC6XE/blueprint/resolved-snapshot.json
    - old_digest: e85b1a8fa226ac90cae842537ed77e874a6c2b29c1727da4c1d1d11b25dc8df0
    - current_digest: e85b1a8fa226ac90cae842537ed77e874a6c2b29c1727da4c1d1d11b25dc8df0
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202609130707-GXC6XE

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202609130707-GXC6XE
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: true
    - repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
    - risks: none

    ### 2026-09-13T07:29:25.509Z — VERIFY — ok

    By: CODER

    Note: verified-202609130707-GXC6XE
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-13T07:29:03.116Z, excerpt_hash=sha256:7bded797894496f9a7cf781f135b44301833a245e241f63ffed2a20c4685c84a

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609130707-GXC6XE/blueprint/resolved-snapshot.json
    - old_digest: e85b1a8fa226ac90cae842537ed77e874a6c2b29c1727da4c1d1d11b25dc8df0
    - current_digest: e85b1a8fa226ac90cae842537ed77e874a6c2b29c1727da4c1d1d11b25dc8df0
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202609130707-GXC6XE

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task complete 202609130707-GXC6XE --result verified-202609130707-GXC6XE --commit 7cac83f35dcb96b922aaa29ca7f9811ad00780d5
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: true
    - repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
    - risks: none

    ### 2026-09-13T07:29:50.290Z — VERIFY — ok

    By: CODER

    Note: verified-202609130707-GXC6XE
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-13T07:29:25.587Z, excerpt_hash=sha256:7bded797894496f9a7cf781f135b44301833a245e241f63ffed2a20c4685c84a

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609130707-GXC6XE/blueprint/resolved-snapshot.json
    - old_digest: e85b1a8fa226ac90cae842537ed77e874a6c2b29c1727da4c1d1d11b25dc8df0
    - current_digest: e85b1a8fa226ac90cae842537ed77e874a6c2b29c1727da4c1d1d11b25dc8df0
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202609130707-GXC6XE

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task complete 202609130707-GXC6XE --result verified-202609130707-GXC6XE --commit 3785a949cd34440dde2a49f8311c8c356d434cd1
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: true
    - repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert only the implementation and task-artifact commits for 202609130707-GXC6XE, restore the prior import locations and direct Writer composition, then rerun the focused dependency and regression checks. Do not discard the pre-existing modified task README or the user-authored untracked parity plan."
  Findings: "Approval evidence: the user explicitly approved the stage 1 plan and repository mutations on 2026-09-13. Network access is not approved or required because the pinned LibreOffice checkout already exists at vendor/libreoffice-reference (commit 9bc445578). Pre-existing changes to .agentplane/tasks/202609130610-CYP0F8/README.md and docs/program/vite-office-upstream-parity-plan.md must be preserved."
extensions:
  implementation_commit:
    hash: "7cac83f35dcb96b922aaa29ca7f9811ad00780d5"
    message: "🧩 GXC6XE code: restore Stage 1 module boundaries"
id_source: "generated"
---
## Summary

Restore stage 1 module boundaries

Implement stage 1 from docs/program/vite-office-upstream-parity-plan.md: remove sfx2-to-framework, editeng-to-sw, package-to-xmloff, vcl/svl-to-sfx2 reverse dependencies; register Writer through a factory descriptor; add enforced import-graph validation while preserving current behavior and staying close to LibreOffice ownership boundaries.

## Scope

In scope:
- Add neutral low-level contracts for document module identity and serializable snapshots so sfx2, svl, vcl, and framework depend in the intended direction.
- Move generic editeng item IDs into editeng ownership and retain Writer aliases/mapping in sw.
- Remove package imports from xmloff by using package-owned manifest XML serialization primitives.
- Introduce OfficeModuleDescriptor/factory composition so framework desktop renders the active module without importing Writer implementation.
- Add a deterministic dependency-graph checker and integrate it into the root verification pipeline.
- Add or update focused tests and documentation/provenance needed by these changes.

Expected implementation paths are limited to package scripts/config plus apps/office/src under framework, sfx2, svl, vcl, editeng, package, xmloff, and sw. Out of scope: document-session ownership, unified command dispatch, action-based undo, canonical selection/input, new product features, dependency upgrades, and network access.

## Plan

1. Characterize the current reverse import edges and compare the matching local upstream LibreOffice module ownership/build dependencies.
2. Define the smallest neutral contracts and migrate sfx2/framework, editeng/sw, and storage/recovery imports without changing observable behavior.
3. Make manifest serialization package-local and keep document XML mapping in xmloff.
4. Register Writer through an OfficeModuleDescriptor factory owned by the composition root; keep framework desktop suite-agnostic.
5. Implement an import-graph checker covering forbidden reverse edges, suite imports from framework core, browser-adapter imports from domain code, cycles, and non-allowlisted cross-layer edges; wire it into npm verify.
6. Run focused tests, the complete repository verification pipeline, AgentPlane policy checks, and final diff/status review.

## Verify Steps

1. Run agentplane task verify-show 202609130707-GXC6XE. Expected: this acceptance contract is authoritative before verification.
2. Run npm run check:dependencies. Expected: all runtime TypeScript imports conform to the declared layer allowlist; no reverse edge, framework-core concrete suite import, browser-adapter import from domain code, or cycle is reported.
3. Run npm run format:check, npm run lint, npm run typecheck, npm run check:docs, and npm run check:file-size. Expected: formatting, lint/JSDoc, strict TypeScript, documentation, and file-size checks pass.
4. Run npm run test:coverage and npm run test:inventory:coverage. Expected: unit/component tests and inventory tests pass at configured coverage thresholds, including focused boundary/factory/manifest/storage cases.
5. Run npm run test:e2e and npm run test:static. Expected: Writer and suite navigation behavior remain intact in the production-like static build.
6. Run node .agentplane/policy/check-routing.mjs and ap doctor. Expected: AgentPlane routing, policy budgets, and repository health pass.
7. Run git diff --check and git status --short --untracked-files=all. Expected: no whitespace errors, no unintended tracked changes, user-preexisting changes remain preserved, and all new artifacts are reviewed.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-09-13T07:29:03.035Z — VERIFY — ok

By: CODER

Note: Pass: check:dependencies (74 runtime sources, 211 relative imports, 12 allowed edges); format:check, lint, typecheck, check:docs and check:file-size; test:coverage (42 files, 176 tests, 100%); test:inventory:coverage (31 files, 79 tests, 100%); test:e2e (8/8); test:static; source provenance (74 modules); inventory:parity; policy routing; ap doctor; and git diff --check.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-13T07:08:51.368Z, excerpt_hash=sha256:7bded797894496f9a7cf781f135b44301833a245e241f63ffed2a20c4685c84a

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609130707-GXC6XE/blueprint/resolved-snapshot.json
- old_digest: e85b1a8fa226ac90cae842537ed77e874a6c2b29c1727da4c1d1d11b25dc8df0
- current_digest: e85b1a8fa226ac90cae842537ed77e874a6c2b29c1727da4c1d1d11b25dc8df0
- route_changed: no
- safe_command: agentplane blueprint snapshot 202609130707-GXC6XE

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202609130707-GXC6XE
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: true
- repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
- risks: none

### 2026-09-13T07:29:25.509Z — VERIFY — ok

By: CODER

Note: verified-202609130707-GXC6XE
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-13T07:29:03.116Z, excerpt_hash=sha256:7bded797894496f9a7cf781f135b44301833a245e241f63ffed2a20c4685c84a

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609130707-GXC6XE/blueprint/resolved-snapshot.json
- old_digest: e85b1a8fa226ac90cae842537ed77e874a6c2b29c1727da4c1d1d11b25dc8df0
- current_digest: e85b1a8fa226ac90cae842537ed77e874a6c2b29c1727da4c1d1d11b25dc8df0
- route_changed: no
- safe_command: agentplane blueprint snapshot 202609130707-GXC6XE

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task complete 202609130707-GXC6XE --result verified-202609130707-GXC6XE --commit 7cac83f35dcb96b922aaa29ca7f9811ad00780d5
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: true
- repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
- risks: none

### 2026-09-13T07:29:50.290Z — VERIFY — ok

By: CODER

Note: verified-202609130707-GXC6XE
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-13T07:29:25.587Z, excerpt_hash=sha256:7bded797894496f9a7cf781f135b44301833a245e241f63ffed2a20c4685c84a

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609130707-GXC6XE/blueprint/resolved-snapshot.json
- old_digest: e85b1a8fa226ac90cae842537ed77e874a6c2b29c1727da4c1d1d11b25dc8df0
- current_digest: e85b1a8fa226ac90cae842537ed77e874a6c2b29c1727da4c1d1d11b25dc8df0
- route_changed: no
- safe_command: agentplane blueprint snapshot 202609130707-GXC6XE

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task complete 202609130707-GXC6XE --result verified-202609130707-GXC6XE --commit 3785a949cd34440dde2a49f8311c8c356d434cd1
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: true
- repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert only the implementation and task-artifact commits for 202609130707-GXC6XE, restore the prior import locations and direct Writer composition, then rerun the focused dependency and regression checks. Do not discard the pre-existing modified task README or the user-authored untracked parity plan.

## Findings

Approval evidence: the user explicitly approved the stage 1 plan and repository mutations on 2026-09-13. Network access is not approved or required because the pinned LibreOffice checkout already exists at vendor/libreoffice-reference (commit 9bc445578). Pre-existing changes to .agentplane/tasks/202609130610-CYP0F8/README.md and docs/program/vite-office-upstream-parity-plan.md must be preserved.
