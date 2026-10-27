---
id: "202610270250-6VDB2H"
title: "Integrate Writer and Calc branches and synchronize all checkouts"
status: "DOING"
priority: "high"
owner: "CODER"
revision: 11
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-27T02:50:51.435Z"
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
    body: "Start: Execute approved cross-checkout integration, verification, publication and reverse merges."
events:
  -
    type: "status"
    at: "2026-10-27T02:50:51.886Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: Execute approved cross-checkout integration, verification, publication and reverse merges."
doc_version: 3
doc_updated_at: "2026-10-27T02:50:51.886Z"
doc_updated_by: "CODER"
description: "User-approved integration: commit current Writer work, push Writer and Calc, merge both into main, resolve conflicts, run full project verification and repair regressions, push main, then merge main back and push both development branches. Preserve local generated artifacts and finish on original branch names."
sections:
  Summary: "Integrate all current Writer and Calc development into main and synchronize all three user-authorized checkouts."
  Scope: "Three checkouts: vite-office main, vite-office-writer writer, vite-office-calc calc. Include existing uncommitted Writer Markdown code/tests/registry changes; preserve generated local Calc output and unrelated pending task README. Repair integration failures and add regression tests when needed. User explicitly authorized network pushes and cross-checkout access."
  Plan: "Execute the user-approved nine-step integration and synchronization with complete npm verification, regression fixes as needed, no history rewriting, preserve local artifacts, and finish on main/writer/calc respectively."
  Verify Steps: "Run npm run verify (format, lint, tools/application typecheck, boundaries, Writer/Calc resources, tooling tests, application coverage, inventory coverage, browser E2E, static build, docs, file sizes, source tree, Writer hint IDs, provenance, invariant/parity registries). Run ap doctor and node .agentplane/policy/check-routing.mjs. Run git diff --check. Confirm main contains both original branch tips; writer/calc contain final main; local branches equal origin refs after push; inspect full git status in all three checkouts. Preserve pre-existing generated output."
  Verification: "Pending complete integration and project checks."
  Rollback Plan: "Preserve existing histories and local generated files. Use ordinary revert commits for published integration if required; no force pushes, resets or deletion of user work."
  Findings: "Baseline: main f85cd725a ahead 41; writer 142e0a584 ahead 31 with 15 Markdown code/test/registry changes; calc b7243fe91 ahead 12, tracked clean with 1180 generated files under output/native/AQF9AG-icu-grego. main has pre-existing untracked task README 202610251549-J0Z0KF."
id_source: "generated"
---
## Summary

Integrate all current Writer and Calc development into main and synchronize all three user-authorized checkouts.

## Scope

Three checkouts: vite-office main, vite-office-writer writer, vite-office-calc calc. Include existing uncommitted Writer Markdown code/tests/registry changes; preserve generated local Calc output and unrelated pending task README. Repair integration failures and add regression tests when needed. User explicitly authorized network pushes and cross-checkout access.

## Plan

Execute the user-approved nine-step integration and synchronization with complete npm verification, regression fixes as needed, no history rewriting, preserve local artifacts, and finish on main/writer/calc respectively.

## Verify Steps

Run npm run verify (format, lint, tools/application typecheck, boundaries, Writer/Calc resources, tooling tests, application coverage, inventory coverage, browser E2E, static build, docs, file sizes, source tree, Writer hint IDs, provenance, invariant/parity registries). Run ap doctor and node .agentplane/policy/check-routing.mjs. Run git diff --check. Confirm main contains both original branch tips; writer/calc contain final main; local branches equal origin refs after push; inspect full git status in all three checkouts. Preserve pre-existing generated output.

## Verification

Pending complete integration and project checks.

## Rollback Plan

Preserve existing histories and local generated files. Use ordinary revert commits for published integration if required; no force pushes, resets or deletion of user work.

## Findings

Baseline: main f85cd725a ahead 41; writer 142e0a584 ahead 31 with 15 Markdown code/test/registry changes; calc b7243fe91 ahead 12, tracked clean with 1180 generated files under output/native/AQF9AG-icu-grego. main has pre-existing untracked task README 202610251549-J0Z0KF.
