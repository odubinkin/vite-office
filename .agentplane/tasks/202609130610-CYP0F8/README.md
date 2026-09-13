---
id: "202609130610-CYP0F8"
title: "Implement Stage 0 upstream parity foundation"
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
  updated_at: "2026-09-13T06:11:16.205Z"
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
    body: "Start: Implement approved Stage 0 lifecycle generations, parity inventory validation, documentation synchronization, and regression coverage."
events:
  -
    type: "status"
    at: "2026-09-13T06:11:21.567Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: Implement approved Stage 0 lifecycle generations, parity inventory validation, documentation synchronization, and regression coverage."
doc_version: 3
doc_updated_at: "2026-09-13T06:11:21.567Z"
doc_updated_by: "CODER"
description: "Implement Stage 0 of docs/program/vite-office-upstream-parity-plan.md: lifecycle generations, parity record model and inventory, stronger validators, synchronized documentation, and required tests."
sections:
  Summary: "Implement Stage 0 of the approved upstream-parity plan: correct Writer lifecycle generations and recovery behavior, replace path-only parity claims with evidence-bearing capability records, classify the current runtime surface, strengthen inventory validation, and synchronize affected program documentation."
  Scope: |-
    - In scope: lifecycle generation state and tests; recovery autosave generation handling; parity capability schema/data/validators/tests; complete classification of current runtime modules, exported domain operations, user commands, browser adapters, foundation code, internal operations, and placeholder suites; Stage 0 documentation corrections.
    - Out of scope: Stage 1 dependency-boundary refactors, Stage 2 session/dispatch redesign, new LibreOffice feature slices, network access, and unrelated cleanup.
    - Constraints: preserve the user-owned untracked plan unless a Stage 0 documentation correction is required; no network operations; stop for re-approval on material drift under gateway policy.
  Plan: |-
    1. Inspect lifecycle, recovery, command registry, parity schema/data, validators, tests, and affected documentation; establish the exact current behavior and bounded file set.
    2. Implement independent contentGeneration, savedGeneration, and recoveryGeneration semantics with stable identity, successful-save-only acknowledgement, and correct undo/redo behavior.
    3. Expand capability records and current-surface inventory; strengthen validators for IDs, evidence, tests, gaps, exceptions, command coverage, and closed-record traceability.
    4. Synchronize documentation for record counts/status semantics, transaction history, recovery/workers, save versus recovery/export, and working suites.
    5. Add focused regression tests, run the declared verification suite, record evidence, and finish with a traceable commit.
  Verify Steps: |-
    1. Run focused lifecycle/recovery tests. Expected: consecutive dirty mutations receive distinct generations; the second autosave is not skipped; failed primary saves do not advance savedGeneration; undo/redo preserve correct modified state.
    2. Run parity inventory unit tests and npm run inventory:parity. Expected: validators reject duplicate IDs, verified records without precise evidence/local tests, unresolved verified gaps, unapproved stack exceptions, uncovered/runtime-only command IDs, and closed records without task/commit evidence.
    3. Run npm run verify. Expected: formatting, lint, TypeScript, unit/coverage, inventory coverage, Playwright E2E, static build, JSDoc, and file-size checks pass.
    4. Run node .agentplane/policy/check-routing.mjs and ap doctor. Expected: repository policy/routing and Agentplane health checks pass.
    5. Inspect git diff and git status --short --untracked-files=all. Expected: only approved Stage 0 changes and Agentplane task artifacts are present; any residual gap is recorded in Findings.
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert the Stage 0 implementation and task close commits using normal non-destructive Git history operations, then rerun the focused lifecycle and inventory tests plus policy routing validation. No data migration or external rollback is required."
  Findings: "No material drift identified during planning."
id_source: "generated"
---
## Summary

Implement Stage 0 of the approved upstream-parity plan: correct Writer lifecycle generations and recovery behavior, replace path-only parity claims with evidence-bearing capability records, classify the current runtime surface, strengthen inventory validation, and synchronize affected program documentation.

## Scope

- In scope: lifecycle generation state and tests; recovery autosave generation handling; parity capability schema/data/validators/tests; complete classification of current runtime modules, exported domain operations, user commands, browser adapters, foundation code, internal operations, and placeholder suites; Stage 0 documentation corrections.
- Out of scope: Stage 1 dependency-boundary refactors, Stage 2 session/dispatch redesign, new LibreOffice feature slices, network access, and unrelated cleanup.
- Constraints: preserve the user-owned untracked plan unless a Stage 0 documentation correction is required; no network operations; stop for re-approval on material drift under gateway policy.

## Plan

1. Inspect lifecycle, recovery, command registry, parity schema/data, validators, tests, and affected documentation; establish the exact current behavior and bounded file set.
2. Implement independent contentGeneration, savedGeneration, and recoveryGeneration semantics with stable identity, successful-save-only acknowledgement, and correct undo/redo behavior.
3. Expand capability records and current-surface inventory; strengthen validators for IDs, evidence, tests, gaps, exceptions, command coverage, and closed-record traceability.
4. Synchronize documentation for record counts/status semantics, transaction history, recovery/workers, save versus recovery/export, and working suites.
5. Add focused regression tests, run the declared verification suite, record evidence, and finish with a traceable commit.

## Verify Steps

1. Run focused lifecycle/recovery tests. Expected: consecutive dirty mutations receive distinct generations; the second autosave is not skipped; failed primary saves do not advance savedGeneration; undo/redo preserve correct modified state.
2. Run parity inventory unit tests and npm run inventory:parity. Expected: validators reject duplicate IDs, verified records without precise evidence/local tests, unresolved verified gaps, unapproved stack exceptions, uncovered/runtime-only command IDs, and closed records without task/commit evidence.
3. Run npm run verify. Expected: formatting, lint, TypeScript, unit/coverage, inventory coverage, Playwright E2E, static build, JSDoc, and file-size checks pass.
4. Run node .agentplane/policy/check-routing.mjs and ap doctor. Expected: repository policy/routing and Agentplane health checks pass.
5. Inspect git diff and git status --short --untracked-files=all. Expected: only approved Stage 0 changes and Agentplane task artifacts are present; any residual gap is recorded in Findings.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert the Stage 0 implementation and task close commits using normal non-destructive Git history operations, then rerun the focused lifecycle and inventory tests plus policy routing validation. No data migration or external rollback is required.

## Findings

No material drift identified during planning.
