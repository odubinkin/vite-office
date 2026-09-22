---
id: "202609220336-9W42WT"
title: "Close remaining Writer parity gaps"
status: "DOING"
priority: "high"
owner: "CODER"
revision: 10
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-09-22T03:37:16.208Z"
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
    body: "Start: implement approved Writer style defaults, symmetric tolerant ODT property support, binding-backed style options, and explicit continuous-view presentation with focused and full verification."
events:
  -
    type: "status"
    at: "2026-09-22T03:37:33.937Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implement approved Writer style defaults, symmetric tolerant ODT property support, binding-backed style options, and explicit continuous-view presentation with focused and full verification."
doc_version: 3
doc_updated_at: "2026-09-22T03:37:33.937Z"
doc_updated_by: "CODER"
description: "Complete the approved non-P0-1 remediation: align exposed Writer style defaults with the pinned upstream baseline, guarantee symmetric ODT import/export for the supported slice while continuing to ignore unsupported data, move style hierarchy ownership out of React, and label the browser layout contract as continuous."
sections:
  Summary: "Close the remaining implementation gaps from docs/program/vite-office-upstream-parity-plan.md except intentionally abandoned P0-1."
  Scope: "In scope: supported Writer paragraph-style item defaults and source-derived tests; ODT property-level import/export symmetry with tolerant ignore behavior for unsupported content; browser style-list view-model ownership; explicit continuous-view presentation; related parity/provenance records and tests. Out of scope: P0-1 mechanics, pagination, unsupported Writer features, network access, and backward compatibility for obsolete persisted schemas."
  Plan: "1. Build exact pinned-upstream style and ODT property matrices for the current slice. 2. Add missing representable Writer pool items/defaults and independent source-derived tests. 3. Make every supported ODT property symmetric across import/export and retain tolerant ignore behavior for unsupported data. 4. Move paragraph-style hierarchy construction from React into a binding-backed browser view model. 5. Name and expose the layout as continuous browser view. 6. Update accurate existing parity/provenance records without changing P0-1 mechanics. 7. Run focused and full verification, record evidence, and close cleanly."
  Verify Steps: "1. Run focused Vitest suites covering paragraph-style defaults, item codecs, ODT import/export/round-trip, command view models, and Writer presentation. Expected: all pass with explicit asymmetric-property and ignored-unsupported-data cases. 2. Run npm run inventory:parity and npm run check:source-provenance. Expected: zero gaps/exceptions and truthful bounded claims. 3. Run npm run verify. Expected: formatting, lint, typecheck, dependency checks, unit/inventory/e2e tests, static build, docs, file-size, source-tree, provenance, invariants, and parity all pass. 4. Run git diff --check, node .agentplane/policy/check-routing.mjs, ap doctor, and git status --short --untracked-files=all. Expected: clean checks and only intentional task-scope changes before finish."
  Verification: "Pending implementation and execution of the declared Verify Steps."
  Rollback Plan: "Revert the task implementation and task-state commits, then rerun the focused suites and npm run verify to confirm restoration."
  Findings: "Initial audit found incomplete upstream item-set defaults for exposed styles, import/export symmetry gaps hidden by permissive ODF parsing, React-owned style hierarchy construction, and an unnamed continuous layout contract. Unsupported ODF data must remain non-blocking and ignored by design."
id_source: "generated"
---
## Summary

Close the remaining implementation gaps from docs/program/vite-office-upstream-parity-plan.md except intentionally abandoned P0-1.

## Scope

In scope: supported Writer paragraph-style item defaults and source-derived tests; ODT property-level import/export symmetry with tolerant ignore behavior for unsupported content; browser style-list view-model ownership; explicit continuous-view presentation; related parity/provenance records and tests. Out of scope: P0-1 mechanics, pagination, unsupported Writer features, network access, and backward compatibility for obsolete persisted schemas.

## Plan

1. Build exact pinned-upstream style and ODT property matrices for the current slice. 2. Add missing representable Writer pool items/defaults and independent source-derived tests. 3. Make every supported ODT property symmetric across import/export and retain tolerant ignore behavior for unsupported data. 4. Move paragraph-style hierarchy construction from React into a binding-backed browser view model. 5. Name and expose the layout as continuous browser view. 6. Update accurate existing parity/provenance records without changing P0-1 mechanics. 7. Run focused and full verification, record evidence, and close cleanly.

## Verify Steps

1. Run focused Vitest suites covering paragraph-style defaults, item codecs, ODT import/export/round-trip, command view models, and Writer presentation. Expected: all pass with explicit asymmetric-property and ignored-unsupported-data cases. 2. Run npm run inventory:parity and npm run check:source-provenance. Expected: zero gaps/exceptions and truthful bounded claims. 3. Run npm run verify. Expected: formatting, lint, typecheck, dependency checks, unit/inventory/e2e tests, static build, docs, file-size, source-tree, provenance, invariants, and parity all pass. 4. Run git diff --check, node .agentplane/policy/check-routing.mjs, ap doctor, and git status --short --untracked-files=all. Expected: clean checks and only intentional task-scope changes before finish.

## Verification

Pending implementation and execution of the declared Verify Steps.

## Rollback Plan

Revert the task implementation and task-state commits, then rerun the focused suites and npm run verify to confirm restoration.

## Findings

Initial audit found incomplete upstream item-set defaults for exposed styles, import/export symmetry gaps hidden by permissive ODF parsing, React-owned style hierarchy construction, and an unnamed continuous layout contract. Unsupported ODF data must remain non-blocking and ignored by design.
