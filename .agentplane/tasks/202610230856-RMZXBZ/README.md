---
id: "202610230856-RMZXBZ"
title: "Integrate Writer and Calc branches and synchronize all checkouts"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 8
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify:
  - "ap doctor"
  - "git status --short --untracked-files=all"
  - "node .agentplane/policy/check-routing.mjs"
  - "npm run verify"
plan_approval:
  state: "approved"
  updated_at: "2026-10-23T08:56:20.834Z"
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
    body: "Start: Integrate and verify the user-approved Writer and Calc branches, then synchronize the three checkouts and remote branches."
events:
  -
    type: "status"
    at: "2026-10-23T08:56:22.529Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: Integrate and verify the user-approved Writer and Calc branches, then synchronize the three checkouts and remote branches."
doc_version: 3
doc_updated_at: "2026-10-23T09:19:16.960Z"
doc_updated_by: "CODER"
description: "Push current Writer and Calc work, merge both into main, resolve conflicts, run full verification and repair regressions, publish main and merge it back into both development branches. User explicitly authorized all three repositories and network pushes."
sections:
  Summary: |-
    Integrate Writer and Calc branches and synchronize all checkouts

    Push current Writer and Calc work, merge both into main, resolve conflicts, run full verification and repair regressions, publish main and merge it back into both development branches. User explicitly authorized all three repositories and network pushes.
  Scope: "All three user-authorized checkouts; integration conflicts, regression repairs, necessary tests and task traceability; remote main/writer/calc publication."
  Plan: "Push writer and calc; fetch and merge writer then calc into main; preserve both implementations and task records; run npm run verify plus AgentPlane checks and fix regressions with targeted tests; finish and push main; fetch and merge main into writer and calc, push each, and confirm clean correct branches and remote parity. No force pushes or history rewriting."
  Verify Steps: "Run npm run verify (format, lint, tools/application typechecks, boundaries, generated resources, tooling tests, application and inventory coverage, browser e2e, static build, documentation, size, source tree/provenance and inventory invariants/parity). Run ap doctor and node .agentplane/policy/check-routing.mjs. Confirm writer and calc contain published main and each checkout is clean on its intended branch with HEAD equal to its remote."
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Preserve original commits in Git history. If integration fails, repair before publication; use a reviewed revert if a published merge must be reversed. Never reset user work or force push."
  Findings: "Initial SSH pushes failed; HTTPS to the same authorized GitHub repository succeeded for both development branches. Writer merged cleanly; Calc conflicts in writer-native-paper.spec.ts and xmlexprt.ts were resolved by preserving label selection, range-based export and pattern-name caching. Added an exporter reuse/style-edit regression test (3 sparse-export tests pass). Updated two Calc persistence tests from ZIP bytes to actual unpacked XML storage (both pass; typecheck passes). Added seven missing runtime and seven matching provenance records for existing browser I/O infrastructure; registry/parity and source provenance now pass, and inventory tests pass 124/124 with strict 100 percent coverage. Full application coverage initially hit ENOSPC; removed only failed-run generated coverage and switched to sequential full-suite Istanbul shards with merged counters and unchanged final strict 100 percent thresholds. All static gates, initial full format/lint and subsequent changed-file checks pass. E2E is in progress; two transient page-loading timeouts occurred during a concurrent deterministic static rebuild and require isolated reruns on the stable build."
id_source: "generated"
---
## Summary

Integrate Writer and Calc branches and synchronize all checkouts

Push current Writer and Calc work, merge both into main, resolve conflicts, run full verification and repair regressions, publish main and merge it back into both development branches. User explicitly authorized all three repositories and network pushes.

## Scope

All three user-authorized checkouts; integration conflicts, regression repairs, necessary tests and task traceability; remote main/writer/calc publication.

## Plan

Push writer and calc; fetch and merge writer then calc into main; preserve both implementations and task records; run npm run verify plus AgentPlane checks and fix regressions with targeted tests; finish and push main; fetch and merge main into writer and calc, push each, and confirm clean correct branches and remote parity. No force pushes or history rewriting.

## Verify Steps

Run npm run verify (format, lint, tools/application typechecks, boundaries, generated resources, tooling tests, application and inventory coverage, browser e2e, static build, documentation, size, source tree/provenance and inventory invariants/parity). Run ap doctor and node .agentplane/policy/check-routing.mjs. Confirm writer and calc contain published main and each checkout is clean on its intended branch with HEAD equal to its remote.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Preserve original commits in Git history. If integration fails, repair before publication; use a reviewed revert if a published merge must be reversed. Never reset user work or force push.

## Findings

Initial SSH pushes failed; HTTPS to the same authorized GitHub repository succeeded for both development branches. Writer merged cleanly; Calc conflicts in writer-native-paper.spec.ts and xmlexprt.ts were resolved by preserving label selection, range-based export and pattern-name caching. Added an exporter reuse/style-edit regression test (3 sparse-export tests pass). Updated two Calc persistence tests from ZIP bytes to actual unpacked XML storage (both pass; typecheck passes). Added seven missing runtime and seven matching provenance records for existing browser I/O infrastructure; registry/parity and source provenance now pass, and inventory tests pass 124/124 with strict 100 percent coverage. Full application coverage initially hit ENOSPC; removed only failed-run generated coverage and switched to sequential full-suite Istanbul shards with merged counters and unchanged final strict 100 percent thresholds. All static gates, initial full format/lint and subsequent changed-file checks pass. E2E is in progress; two transient page-loading timeouts occurred during a concurrent deterministic static rebuild and require isolated reruns on the stable build.
