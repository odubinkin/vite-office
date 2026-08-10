---
id: "202608100959-2TZGN0"
title: "Extract pinned LibreOffice core test source targets into atomic records"
status: "DOING"
priority: "high"
owner: "CODER"
revision: 7
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
  - "tests"
task_kind: "code"
mutation_scope: "code"
blueprint_request: "code.direct"
verify:
  - "npm run verify"
plan_approval:
  state: "approved"
  updated_at: "2026-08-10T09:59:26.950Z"
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
    body: "Start: extract exact pinned core test source targets as deterministic provenance-only records."
events:
  -
    type: "status"
    at: "2026-08-10T09:59:28.360Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: extract exact pinned core test source targets as deterministic provenance-only records."
doc_version: 3
doc_updated_at: "2026-08-10T09:59:28.360Z"
doc_updated_by: "CODER"
description: "Parse pinned gbuild test declarations into deterministic provenance-only test source-target records that connect each inventoried constructor to exact referenced core paths without copying test content or claiming test parity."
sections:
  Summary: |-
    Extract pinned LibreOffice core test source targets into atomic records

    Parse pinned gbuild test declarations into deterministic provenance-only test source-target records that connect each inventoried constructor to exact referenced core paths without copying test content or claiming test parity.
  Scope: "In scope: deterministic provenance-only extraction of exact core paths declared as gbuild test source targets for the pinned constructor inventory. Out of scope: copying test source or fixtures, changing test parity claims, and implementing user-facing behavior."
  Plan: "1. Identify stable gbuild source-target declaration forms in the pinned core. 2. Extract exact path-level records linked to constructor inventory IDs. 3. Cover parsing and corpus generation at 100% inventory coverage. 4. Generate documented canonical JSON and prove equality with pinned Git paths. 5. Run full verification and close the task."
  Verify Steps: "1. Run strict TypeScript, lint, JSDoc, and size checks. 2. Run inventory coverage at 100%. 3. Prove deterministic byte-identical regeneration. 4. Compare every generated source target with the pinned core Git path set and linked constructor evidence. 5. Run npm run verify, agentplane doctor, and policy routing."
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert only this task commits and rerun npm run verify; no ignored reference content is modified."
  Findings: ""
id_source: "generated"
---
## Summary

Extract pinned LibreOffice core test source targets into atomic records

Parse pinned gbuild test declarations into deterministic provenance-only test source-target records that connect each inventoried constructor to exact referenced core paths without copying test content or claiming test parity.

## Scope

In scope: deterministic provenance-only extraction of exact core paths declared as gbuild test source targets for the pinned constructor inventory. Out of scope: copying test source or fixtures, changing test parity claims, and implementing user-facing behavior.

## Plan

1. Identify stable gbuild source-target declaration forms in the pinned core. 2. Extract exact path-level records linked to constructor inventory IDs. 3. Cover parsing and corpus generation at 100% inventory coverage. 4. Generate documented canonical JSON and prove equality with pinned Git paths. 5. Run full verification and close the task.

## Verify Steps

1. Run strict TypeScript, lint, JSDoc, and size checks. 2. Run inventory coverage at 100%. 3. Prove deterministic byte-identical regeneration. 4. Compare every generated source target with the pinned core Git path set and linked constructor evidence. 5. Run npm run verify, agentplane doctor, and policy routing.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert only this task commits and rerun npm run verify; no ignored reference content is modified.

## Findings
