---
id: "202609220629-GPYZ92"
title: "Audit implemented LibreOffice parity and publish remediation plan"
status: "DOING"
priority: "high"
owner: "DOCS"
revision: 12
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
  state: "pending"
  updated_at: null
  updated_by: null
  note: null
  attempts: 0
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
doc_version: 3
doc_updated_at: "2026-09-22T06:43:06.519Z"
doc_updated_by: "DOCS"
description: "Inventory implemented vite-office functionality against the repository-pinned LibreOffice upstream; identify unjustified architecture, contract, data-model, default-behavior, file-layout, UI adapter, and prior-refactor deviations; publish a prioritized remediation plan at docs/program/vite-office-upstream-parity-plan.md."
sections:
  Summary: "Audit the already implemented vite-office scope against the locally pinned LibreOffice upstream and replace the deleted parity-plan document with a new evidence-based remediation program."
  Scope: "Read-only inventory and comparison of repository implementation, tests, configuration, and pinned upstream; focused review of architecture, data models, public contracts, defaults, source-tree correspondence, React UI components, adapters, and artifacts from prior refactors. The only product-file mutation is docs/program/vite-office-upstream-parity-plan.md; Agentplane task artifacts are lifecycle metadata. Browser-irrelevant LibreOffice modules are explicitly out of implementation scope."
  Plan: "1. Inventory repository topology, manifests, tests, and pinned upstream mapping. 2. Map implemented features/modules to LibreOffice counterparts. 3. Compare representative implementations for architecture, data models, contracts, defaults, and file placement. 4. Audit React/UI and adapter layers for duplication, shims, stale abstractions, and refactor residue. 5. Produce a phased, prioritized parity plan with concrete file/module targets, acceptance criteria, dependencies, and verification. 6. Validate the document, links/paths, Agentplane routing, and final repository state."
  Verify Steps: "1. test -s docs/program/vite-office-upstream-parity-plan.md. 2. Confirm every cited repository and pinned-upstream path exists using a path-extraction/check script. 3. Confirm the plan includes inventory, divergence findings, UI/refactor artifacts, target architecture principles, phased work items, priorities/dependencies, parity acceptance criteria, and explicit browser exclusions. 4. node .agentplane/policy/check-routing.mjs. 5. ap doctor. 6. git diff --check and git status --short --untracked-files=all."
  Verification: "PASS: test -s docs/program/vite-office-upstream-parity-plan.md; custom path extraction found 8 exact cited repo/upstream paths and 0 missing; required-section and keyword checks found inventory, divergences, UI artifacts, target architecture, seven execution phases, dependencies, verification, browser exclusions, and Definition of Done; npx prettier --check docs/program/vite-office-upstream-parity-plan.md; git diff --check; node .agentplane/policy/check-routing.mjs (OK); ap doctor (OK, with one pre-existing historical-task warning and informational fallback-hook notices). Audit evidence also passed npm run inventory:parity, npm run check:dependencies, npm run check:source-tree, npm run check:source-provenance, and npm run check:writer-resources."
  Rollback Plan: "Remove the newly recreated docs/program/vite-office-upstream-parity-plan.md and revert only task-local Agentplane lifecycle changes if explicitly requested; do not alter pre-existing user changes."
  Findings: "Audit inventory: 149 production TS/TSX runtime files plus one test helper currently included by provenance inventory; 45 capability records; 92 upstream-mechanism, 37 browser-adaptation, and 21 local-infrastructure records. The existing parity gate reports 45/45 capabilities ready with zero gaps while module-level evidence still has 119 behavior-unverified, 84 contract-unverified, and 74 defaults-unverified records. Confirmed priority findings include .uno:ExportTo semantic mismatch, AutoRecovery 1-minute versus upstream 10-minute default, StartPara forced to left, fixed English untitled title, monolithic/custom Sfx dispatch adapters, parallel Writer DTO and persistence models, React-owned controller/orchestration logic, handwritten resource allowlists, misleading browser persistence placement under filter ownership, stale docvw references, and a duplicated SetListRestart attribute write. The plan preserves justified React/DOM/Worker/IndexedDB/File/Clipboard boundaries and excludes non-browser suites from current scope."
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

## Rollback Plan

Remove the newly recreated docs/program/vite-office-upstream-parity-plan.md and revert only task-local Agentplane lifecycle changes if explicitly requested; do not alter pre-existing user changes.

## Findings

Audit inventory: 149 production TS/TSX runtime files plus one test helper currently included by provenance inventory; 45 capability records; 92 upstream-mechanism, 37 browser-adaptation, and 21 local-infrastructure records. The existing parity gate reports 45/45 capabilities ready with zero gaps while module-level evidence still has 119 behavior-unverified, 84 contract-unverified, and 74 defaults-unverified records. Confirmed priority findings include .uno:ExportTo semantic mismatch, AutoRecovery 1-minute versus upstream 10-minute default, StartPara forced to left, fixed English untitled title, monolithic/custom Sfx dispatch adapters, parallel Writer DTO and persistence models, React-owned controller/orchestration logic, handwritten resource allowlists, misleading browser persistence placement under filter ownership, stale docvw references, and a duplicated SetListRestart attribute write. The plan preserves justified React/DOM/Worker/IndexedDB/File/Clipboard boundaries and excludes non-browser suites from current scope.
