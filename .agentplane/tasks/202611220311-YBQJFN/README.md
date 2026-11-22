---
id: "202611220311-YBQJFN"
title: "Run full Writer and Calc ODF regression after annotation range parity"
status: "DOING"
priority: "high"
owner: "CODER"
revision: 5
origin:
  system: "manual"
depends_on:
  - "202611220300-C7EE7Q"
tags:
  - "code"
  - "regression"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-11-22T03:12:42.007Z"
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
    body: "Start: continue direct-mode task in current checkout."
events:
  -
    type: "status"
    at: "2026-11-22T03:18:02.795Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: continue direct-mode task in current checkout."
doc_version: 3
doc_updated_at: "2026-11-22T03:18:02.795Z"
doc_updated_by: "CODER"
description: "Run all Office, production Chromium, tooling and inventory tests after the tenth scoped alignment task, repair functional regressions and keep the alignment goal active."
sections:
  Summary: "Run the complete Office ODF regression checkpoint after ten closed Writer and Calc alignment tasks."
  Scope: |-
    - Run all Office unit and integration projects with unchanged coverage thresholds, all production Chromium projects, tooling and inventory.
    - Reproduce and fix confirmed functional regressions and stale source-backed witnesses in their owning modules. Preserve the deliberate browser save, recovery and autosave behavior and record any pre-existing coverage deficit.
    - Keep the ongoing ODT and ODS alignment goal active after this checkpoint.
  Plan: "Run full Office, Chromium, tooling and inventory on the tenth task baseline with durable reports. Reproduce failures and apply only source-backed repairs. Keep coverage thresholds and the ongoing goal active."
  Verify Steps: |-
    - Run `npm run test:coverage -- --maxWorkers=1 --hookTimeout=120000 --testTimeout=120000` with JSON output and unchanged coverage thresholds.
    - Run `npm run test:e2e -- --workers=1 --timeout=120000` across Writer, Calc and shared using the repository's installed Chromium.
    - Run `npm run test:tooling -- --hookTimeout=60000 --testTimeout=60000` and `npm run test:inventory:coverage -- --maxWorkers=1 --hookTimeout=60000 --testTimeout=60000`.
    - Rerun each functional failure in its owner suite. Check changed sources with ESLint, Prettier, Office typecheck, module boundaries and source provenance when repairs are made.
    - Run inventory parity, routing, AgentPlane doctor and git diff checks, and record the final status.
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert checkpoint-owned functional repairs independently and rerun their owning test selections."
  Findings: ""
id_source: "generated"
---
## Summary

Run the complete Office ODF regression checkpoint after ten closed Writer and Calc alignment tasks.

## Scope

- Run all Office unit and integration projects with unchanged coverage thresholds, all production Chromium projects, tooling and inventory.
- Reproduce and fix confirmed functional regressions and stale source-backed witnesses in their owning modules. Preserve the deliberate browser save, recovery and autosave behavior and record any pre-existing coverage deficit.
- Keep the ongoing ODT and ODS alignment goal active after this checkpoint.

## Plan

Run full Office, Chromium, tooling and inventory on the tenth task baseline with durable reports. Reproduce failures and apply only source-backed repairs. Keep coverage thresholds and the ongoing goal active.

## Verify Steps

- Run `npm run test:coverage -- --maxWorkers=1 --hookTimeout=120000 --testTimeout=120000` with JSON output and unchanged coverage thresholds.
- Run `npm run test:e2e -- --workers=1 --timeout=120000` across Writer, Calc and shared using the repository's installed Chromium.
- Run `npm run test:tooling -- --hookTimeout=60000 --testTimeout=60000` and `npm run test:inventory:coverage -- --maxWorkers=1 --hookTimeout=60000 --testTimeout=60000`.
- Rerun each functional failure in its owner suite. Check changed sources with ESLint, Prettier, Office typecheck, module boundaries and source provenance when repairs are made.
- Run inventory parity, routing, AgentPlane doctor and git diff checks, and record the final status.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert checkpoint-owned functional repairs independently and rerun their owning test selections.

## Findings
