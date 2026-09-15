---
id: "202609150900-RD8B9V"
title: "Plan upstream LibreOffice parity for implemented functionality"
status: "DOING"
priority: "med"
owner: "PLANNER"
revision: 9
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
  state: "pending"
  updated_at: null
  updated_by: null
  note: null
  attempts: 0
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
doc_version: 3
doc_updated_at: "2026-09-15T09:01:38.774Z"
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
    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Remove only docs/program/vite-office-upstream-parity-plan.md and close or supersede this task through Agentplane. Do not restore the previously deleted plan because the user explicitly requested a fresh replacement."
  Findings: "No material drift identified at task setup. The pre-existing deletion of docs/program/vite-office-upstream-parity-plan.md is intentional user context."
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
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Remove only docs/program/vite-office-upstream-parity-plan.md and close or supersede this task through Agentplane. Do not restore the previously deleted plan because the user explicitly requested a fresh replacement.

## Findings

No material drift identified at task setup. The pre-existing deletion of docs/program/vite-office-upstream-parity-plan.md is intentional user context.
