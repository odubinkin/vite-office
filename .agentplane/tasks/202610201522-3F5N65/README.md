---
id: "202610201522-3F5N65"
title: "Integrate current Calc and Writer changes and synchronize branches"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 7
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify:
  - "Verify clean main writer calc checkouts, remote equality and main ancestry in writer/calc"
  - "ap doctor"
  - "node .agentplane/policy/check-routing.mjs"
  - "npm run verify"
plan_approval:
  state: "approved"
  updated_at: "2026-10-20T15:22:31.586Z"
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
    body: "Start: Execute the user-authorized three-checkout integration, full verification repairs and remote synchronization."
events:
  -
    type: "status"
    at: "2026-10-20T15:22:32.513Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: Execute the user-authorized three-checkout integration, full verification repairs and remote synchronization."
doc_version: 3
doc_updated_at: "2026-10-20T15:22:32.513Z"
doc_updated_by: "CODER"
description: "Publish current writer and calc, merge both into main, resolve integration conflicts, run complete project checks and fix failures with regression coverage, publish main, back-merge into writer and calc and leave clean synchronized branch checkouts. User explicitly authorized all nine steps including network push and cross-checkout access."
sections:
  Summary: |-
    Integrate current Calc and Writer changes and synchronize branches

    Publish current writer and calc, merge both into main, resolve integration conflicts, run complete project checks and fix failures with regression coverage, publish main, back-merge into writer and calc and leave clean synchronized branch checkouts. User explicitly authorized all nine steps including network push and cross-checkout access.
  Scope: "All three user-named checkouts, writer/calc/main Git synchronization, integration fixes and regression tests, and task evidence. Preserve existing development task records. Network pushes are expressly authorized."
  Plan: "User-approved plan: publish clean writer and calc histories; fetch and merge writer/calc into main preserving all work; resolve conflicts and repair full verification failures with meaningful regression tests; run npm run verify, doctor and routing checks; publish tested main; fetch and merge main back to writer/calc, publish both and verify clean synchronized checkouts. No force push or destructive history edits."
  Verify Steps: "1. Run npm run verify: formatting, lint, tools/application typecheck, dependency boundaries, Writer/Calc resources, tooling, full application/inventory coverage, all Playwright projects, static build, docs, file sizes, source tree/provenance, invariants and parity. Fix failures and cover discovered defects. 2. Run ap doctor and node .agentplane/policy/check-routing.mjs. 3. Verify writer/calc commits are ancestors of main; final main is ancestor of writer/calc; each checkout stays on its designated branch, is clean and equals the remote tip."
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Retain starting tips main/writer dd5047ff7 and calc d0b6e787c. Abort unresolved merges if necessary; use forward corrective/revert commits only after publication. Never reset or force-push user branches."
  Findings: ""
id_source: "generated"
---
## Summary

Integrate current Calc and Writer changes and synchronize branches

Publish current writer and calc, merge both into main, resolve integration conflicts, run complete project checks and fix failures with regression coverage, publish main, back-merge into writer and calc and leave clean synchronized branch checkouts. User explicitly authorized all nine steps including network push and cross-checkout access.

## Scope

All three user-named checkouts, writer/calc/main Git synchronization, integration fixes and regression tests, and task evidence. Preserve existing development task records. Network pushes are expressly authorized.

## Plan

User-approved plan: publish clean writer and calc histories; fetch and merge writer/calc into main preserving all work; resolve conflicts and repair full verification failures with meaningful regression tests; run npm run verify, doctor and routing checks; publish tested main; fetch and merge main back to writer/calc, publish both and verify clean synchronized checkouts. No force push or destructive history edits.

## Verify Steps

1. Run npm run verify: formatting, lint, tools/application typecheck, dependency boundaries, Writer/Calc resources, tooling, full application/inventory coverage, all Playwright projects, static build, docs, file sizes, source tree/provenance, invariants and parity. Fix failures and cover discovered defects. 2. Run ap doctor and node .agentplane/policy/check-routing.mjs. 3. Verify writer/calc commits are ancestors of main; final main is ancestor of writer/calc; each checkout stays on its designated branch, is clean and equals the remote tip.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Retain starting tips main/writer dd5047ff7 and calc d0b6e787c. Abort unresolved merges if necessary; use forward corrective/revert commits only after publication. Never reset or force-push user branches.

## Findings
