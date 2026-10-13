---
id: "202610130348-GA0F9C"
title: "Integrate writer and calc and synchronize development branches"
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
  updated_at: "2026-10-13T03:48:54.906Z"
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
    body: "Start: Execute user-approved integration of writer and calc into main with full verification and reverse branch synchronization."
events:
  -
    type: "status"
    at: "2026-10-13T03:48:55.613Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: Execute user-approved integration of writer and calc into main with full verification and reverse branch synchronization."
doc_version: 3
doc_updated_at: "2026-10-13T04:11:12.898Z"
doc_updated_by: "CODER"
description: "User-approved nine-step integration: publish writer/calc, merge both into main, resolve conflicts, run full verification and repair failures with regression coverage, publish main and merge it back into writer/calc while preserving their active branches."
sections:
  Summary: "Publish and integrate the user-approved writer and calc development branches into main and synchronize all three repositories."
  Scope: "All changes already committed in writer and calc; merge conflict resolutions and required verification repairs with regression tests; task traceability; push and fetch for these three branches and repositories. Preserve branch history and existing unrelated task records."
  Plan: "Publish writer and calc; fetch and merge both in main; resolve conflicts preserving both applications; run npm run verify, ap doctor and routing check; repair failures and add regression coverage; finish and publish main; merge main back into writer and calc and push; confirm ancestry, remote equality, clean status and correct active branches."
  Verify Steps: "Run npm run verify with all declared checks and no unapproved skips. Run ap doctor and node .agentplane/policy/check-routing.mjs. Confirm original writer and calc tips are ancestors of final main; main is an ancestor of final writer and calc; each local branch equals its remote branch and all three git status --short --untracked-files=all outputs are empty. Inspect conflict resolutions and regression coverage for any repaired behavioral failure."
  Verification: "Command: npm run verify. Result: initial run passed format, lint, typecheck, dependency boundaries, Writer resources (2 tests), tooling (36 tests), application Istanbul coverage (761 files, 15713 tests; all four metrics 100%), inventory V8 coverage (38 files,123 tests; all four metrics 100%), E2E (316 tests), static build, docs, file-size and source-tree. Source-provenance failed because the ignored local Boost reference link was absent. Evidence: full-verify.log. Restored vendor/boost-reference as a link to the existing original Boost 1.91 reference in the authorized calc repository. Command: npm run check:source-provenance. Result: pass for504 runtime modules; evidence: provenance-verify.log. Commands: npm run inventory:invariants and npm run inventory:parity. Result: pass,504 modules,164 capabilities,34 invariants,1229 global records; existing parity gaps remain recorded. Commands: ap doctor and node .agentplane/policy/check-routing.mjs. Result: pass; doctor has two pre-existing warnings (hook shim readiness and unrelated historical task missing commit). Scope: complete merged project. No checks skipped and no behavioral test failures or missing conflict regression tests found. Branch publication and reverse synchronization pending."
  Rollback Plan: "Preserve initial commit references main 9100ec1c, writer 057f5863, calc 8162ed1a. Before publication use merge --abort if needed; after publication use reviewed revert commits, never forced pushes or resets."
  Findings: "Writer and calc original tips published via HTTPS; existing SSH remotes failed publickey authentication. Calc HTTPS push needed one retry for a transient GitHub pack-file error. Writer merge had no file conflicts. Calc merge had one conflict in scripts/check-module-boundaries.mjs: retained both tools/inc and formula/inc upstream-mechanism classifications. Existing native-tools-ownership.test.ts and check-module-boundaries.test.ts exercised both and passed. Provenance environment repair added only an ignored vendor/boost-reference symlink to the existing calc Boost1.91 reference, without altering tracked upstream material or application code. Initial tips remain ancestors of main. No history rewrite."
id_source: "generated"
---
## Summary

Publish and integrate the user-approved writer and calc development branches into main and synchronize all three repositories.

## Scope

All changes already committed in writer and calc; merge conflict resolutions and required verification repairs with regression tests; task traceability; push and fetch for these three branches and repositories. Preserve branch history and existing unrelated task records.

## Plan

Publish writer and calc; fetch and merge both in main; resolve conflicts preserving both applications; run npm run verify, ap doctor and routing check; repair failures and add regression coverage; finish and publish main; merge main back into writer and calc and push; confirm ancestry, remote equality, clean status and correct active branches.

## Verify Steps

Run npm run verify with all declared checks and no unapproved skips. Run ap doctor and node .agentplane/policy/check-routing.mjs. Confirm original writer and calc tips are ancestors of final main; main is an ancestor of final writer and calc; each local branch equals its remote branch and all three git status --short --untracked-files=all outputs are empty. Inspect conflict resolutions and regression coverage for any repaired behavioral failure.

## Verification

Command: npm run verify. Result: initial run passed format, lint, typecheck, dependency boundaries, Writer resources (2 tests), tooling (36 tests), application Istanbul coverage (761 files, 15713 tests; all four metrics 100%), inventory V8 coverage (38 files,123 tests; all four metrics 100%), E2E (316 tests), static build, docs, file-size and source-tree. Source-provenance failed because the ignored local Boost reference link was absent. Evidence: full-verify.log. Restored vendor/boost-reference as a link to the existing original Boost 1.91 reference in the authorized calc repository. Command: npm run check:source-provenance. Result: pass for504 runtime modules; evidence: provenance-verify.log. Commands: npm run inventory:invariants and npm run inventory:parity. Result: pass,504 modules,164 capabilities,34 invariants,1229 global records; existing parity gaps remain recorded. Commands: ap doctor and node .agentplane/policy/check-routing.mjs. Result: pass; doctor has two pre-existing warnings (hook shim readiness and unrelated historical task missing commit). Scope: complete merged project. No checks skipped and no behavioral test failures or missing conflict regression tests found. Branch publication and reverse synchronization pending.

## Rollback Plan

Preserve initial commit references main 9100ec1c, writer 057f5863, calc 8162ed1a. Before publication use merge --abort if needed; after publication use reviewed revert commits, never forced pushes or resets.

## Findings

Writer and calc original tips published via HTTPS; existing SSH remotes failed publickey authentication. Calc HTTPS push needed one retry for a transient GitHub pack-file error. Writer merge had no file conflicts. Calc merge had one conflict in scripts/check-module-boundaries.mjs: retained both tools/inc and formula/inc upstream-mechanism classifications. Existing native-tools-ownership.test.ts and check-module-boundaries.test.ts exercised both and passed. Provenance environment repair added only an ignored vendor/boost-reference symlink to the existing calc Boost1.91 reference, without altering tracked upstream material or application code. Initial tips remain ancestors of main. No history rewrite.
