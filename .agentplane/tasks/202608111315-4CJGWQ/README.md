---
id: "202608111315-4CJGWQ"
title: "Decompose oversized Writer domain and workbench modules"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 7
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-08-11T13:15:34.573Z"
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
    body: "Start: decomposing oversized Writer domain and workbench modules without changing behavior."
events:
  -
    type: "status"
    at: "2026-08-11T13:15:35.003Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: decomposing oversized Writer domain and workbench modules without changing behavior."
doc_version: 3
doc_updated_at: "2026-08-11T13:15:35.003Z"
doc_updated_by: "CODER"
description: "Split the Writer pure paragraph operations and workbench editing handlers into cohesive documented modules so the current 543-line writer domain and 520-line WriterWorkbench are no longer file-size decomposition candidates. Preserve public behavior, test coverage, browser-local storage, command placement, and immutable history contracts."
sections:
  Summary: |-
    Decompose oversized Writer domain and workbench modules

    Split the Writer pure paragraph operations and workbench editing handlers into cohesive documented modules so the current 543-line writer domain and 520-line WriterWorkbench are no longer file-size decomposition candidates. Preserve public behavior, test coverage, browser-local storage, command placement, and immutable history contracts.
  Scope: |-
    - In scope: move cohesive paragraph-edit transitions from writer.ts and editing/history handlers from WriterWorkbench.tsx into documented modules; keep public imports stable or update all consumers.
    - In scope: regression tests, file-size check, and architecture documentation for the new module boundaries.
    - Out of scope: changing Writer features, UI layout, persistence schema, or command semantics.
  Plan: |-
    1. Identify stable pure paragraph-operation and workbench-handler boundaries, then extract them with complete JSDoc.
    2. Rewire imports and tests without behavior changes; ensure both former candidates are at or below 500 lines.
    3. Run fast verification plus focused browser coverage and record the user-approved aggregate-check deferral.
  Verify Steps: |-
    1. Run format, lint, TypeScript, JSDoc, file-size, and office coverage checks. Expected: all pass at 100 percent coverage and neither extracted source module is a file-size candidate.
    2. Run focused production Playwright. Expected: existing Writer editing and accessible chrome remain unchanged.
    3. Run diff, doctor, and policy routing checks. Expected: all pass.
    4. Defer static smoke, inventory, and aggregate verify to the user-approved ten-task cadence and record residual risk.
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "- Revert the decomposition commit and rerun regression checks to restore the prior module layout."
  Findings: ""
id_source: "generated"
---
## Summary

Decompose oversized Writer domain and workbench modules

Split the Writer pure paragraph operations and workbench editing handlers into cohesive documented modules so the current 543-line writer domain and 520-line WriterWorkbench are no longer file-size decomposition candidates. Preserve public behavior, test coverage, browser-local storage, command placement, and immutable history contracts.

## Scope

- In scope: move cohesive paragraph-edit transitions from writer.ts and editing/history handlers from WriterWorkbench.tsx into documented modules; keep public imports stable or update all consumers.
- In scope: regression tests, file-size check, and architecture documentation for the new module boundaries.
- Out of scope: changing Writer features, UI layout, persistence schema, or command semantics.

## Plan

1. Identify stable pure paragraph-operation and workbench-handler boundaries, then extract them with complete JSDoc.
2. Rewire imports and tests without behavior changes; ensure both former candidates are at or below 500 lines.
3. Run fast verification plus focused browser coverage and record the user-approved aggregate-check deferral.

## Verify Steps

1. Run format, lint, TypeScript, JSDoc, file-size, and office coverage checks. Expected: all pass at 100 percent coverage and neither extracted source module is a file-size candidate.
2. Run focused production Playwright. Expected: existing Writer editing and accessible chrome remain unchanged.
3. Run diff, doctor, and policy routing checks. Expected: all pass.
4. Defer static smoke, inventory, and aggregate verify to the user-approved ten-task cadence and record residual risk.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert the decomposition commit and rerun regression checks to restore the prior module layout.

## Findings
