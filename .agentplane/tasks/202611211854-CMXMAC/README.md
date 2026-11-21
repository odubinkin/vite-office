---
id: "202611211854-CMXMAC"
title: "Run the Writer and Calc ODF full regression checkpoint"
status: "DOING"
priority: "high"
owner: "CODER"
revision: 5
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
  - "regression"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-11-21T18:54:47.993Z"
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
    body: "Start: run full Office, Chromium, tooling and inventory regressions from the tenth ODF task checkpoint."
events:
  -
    type: "status"
    at: "2026-11-21T18:54:52.637Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: run full Office, Chromium, tooling and inventory regressions from the tenth ODF task checkpoint."
doc_version: 3
doc_updated_at: "2026-11-21T18:54:52.637Z"
doc_updated_by: "CODER"
description: "After ten completed Writer and Calc ODF tasks, run all application unit and integration projects with coverage, all browser projects, tooling, and inventory checks. Diagnose and fix regressions and validate repaired owners. Keep the active alignment goal running after the checkpoint."
sections:
  Summary: "Full regression after ten Calc and Writer ODF alignment tasks. Baseline application source is the post-XEPNMP commit 45ca914ef039."
  Scope: "All Office unit and integration projects, all production Chromium projects, tooling and inventory. Diagnose and fix observed functional regressions in their owners. Preserve coverage gates, test expectations derived from upstream and the established save/recovery deviations."
  Plan: |-
    - Run application coverage, production browser tests, tooling and inventory independently with durable logs and exit codes. Serialize steps to limit memory pressure.
    - Reproduce failures in their owners, classify timeouts and pre-existing issues, and repair source-backed functional failures.
    - Verify fixes in owner suites, record remaining reported coverage deficits and close the checkpoint. Keep the active goal running.
  Verify Steps: |-
    - Run `npm run test:coverage -- --maxWorkers=1 --hookTimeout=120000 --testTimeout=120000` with a durable JSON reporter and unchanged coverage thresholds.
    - Run `npm run test:e2e -- --workers=1 --timeout=120000` across Writer, Calc and shared Chromium projects.
    - Run `npm run test:tooling -- --hookTimeout=60000 --testTimeout=60000` and `npm run test:inventory:coverage -- --maxWorkers=1 --hookTimeout=60000 --testTimeout=60000`.
    - Rerun each functional failure in its owning test suite after diagnosis or repair. Check changed TypeScript with lint, formatting and office typecheck and run boundary and provenance guards for any code changes.
    - Run `node .agentplane/policy/check-routing.mjs`, `ap doctor` and `git diff --check`, and record the finished tracked status.
  Verification: "Pending full regression."
  Rollback Plan: "Revert any scoped repair commit independently of the checkpoint evidence."
  Findings: "The preceding task records baseline repository file-size debt."
id_source: "generated"
---
## Summary

Full regression after ten Calc and Writer ODF alignment tasks. Baseline application source is the post-XEPNMP commit 45ca914ef039.

## Scope

All Office unit and integration projects, all production Chromium projects, tooling and inventory. Diagnose and fix observed functional regressions in their owners. Preserve coverage gates, test expectations derived from upstream and the established save/recovery deviations.

## Plan

- Run application coverage, production browser tests, tooling and inventory independently with durable logs and exit codes. Serialize steps to limit memory pressure.
- Reproduce failures in their owners, classify timeouts and pre-existing issues, and repair source-backed functional failures.
- Verify fixes in owner suites, record remaining reported coverage deficits and close the checkpoint. Keep the active goal running.

## Verify Steps

- Run `npm run test:coverage -- --maxWorkers=1 --hookTimeout=120000 --testTimeout=120000` with a durable JSON reporter and unchanged coverage thresholds.
- Run `npm run test:e2e -- --workers=1 --timeout=120000` across Writer, Calc and shared Chromium projects.
- Run `npm run test:tooling -- --hookTimeout=60000 --testTimeout=60000` and `npm run test:inventory:coverage -- --maxWorkers=1 --hookTimeout=60000 --testTimeout=60000`.
- Rerun each functional failure in its owning test suite after diagnosis or repair. Check changed TypeScript with lint, formatting and office typecheck and run boundary and provenance guards for any code changes.
- Run `node .agentplane/policy/check-routing.mjs`, `ap doctor` and `git diff --check`, and record the finished tracked status.

## Verification

Pending full regression.

## Rollback Plan

Revert any scoped repair commit independently of the checkpoint evidence.

## Findings

The preceding task records baseline repository file-size debt.
