---
id: "202609130707-GXC6XE"
title: "Restore stage 1 module boundaries"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 9
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
  state: "pending"
  updated_at: null
  updated_by: null
  note: null
  attempts: 0
commit: null
comments:
  -
    author: "CODER"
    body: "Start: Implement approved stage 1 module boundaries against pinned LibreOffice ownership, preserving current behavior and existing user changes."
events:
  -
    type: "status"
    at: "2026-09-13T07:08:51.368Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: Implement approved stage 1 module boundaries against pinned LibreOffice ownership, preserving current behavior and existing user changes."
doc_version: 3
doc_updated_at: "2026-09-13T07:08:51.368Z"
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
    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert only the implementation and task-artifact commits for 202609130707-GXC6XE, restore the prior import locations and direct Writer composition, then rerun the focused dependency and regression checks. Do not discard the pre-existing modified task README or the user-authored untracked parity plan."
  Findings: "Approval evidence: the user explicitly approved the stage 1 plan and repository mutations on 2026-09-13. Network access is not approved or required because the pinned LibreOffice checkout already exists at vendor/libreoffice-reference (commit 9bc445578). Pre-existing changes to .agentplane/tasks/202609130610-CYP0F8/README.md and docs/program/vite-office-upstream-parity-plan.md must be preserved."
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
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert only the implementation and task-artifact commits for 202609130707-GXC6XE, restore the prior import locations and direct Writer composition, then rerun the focused dependency and regression checks. Do not discard the pre-existing modified task README or the user-authored untracked parity plan.

## Findings

Approval evidence: the user explicitly approved the stage 1 plan and repository mutations on 2026-09-13. Network access is not approved or required because the pinned LibreOffice checkout already exists at vendor/libreoffice-reference (commit 9bc445578). Pre-existing changes to .agentplane/tasks/202609130610-CYP0F8/README.md and docs/program/vite-office-upstream-parity-plan.md must be preserved.
