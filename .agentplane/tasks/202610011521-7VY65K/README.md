---
id: "202610011521-7VY65K"
title: "Remove duplicated upstream sources from Agentplane artifacts"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 14
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-01T15:22:33.802Z"
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
    body: "Start: Execute user-authorized isolated cleanup of duplicated upstream sources and prevent source persistence in Agentplane artifacts."
events:
  -
    type: "status"
    at: "2026-10-01T15:22:58.954Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: Execute user-authorized isolated cleanup of duplicated upstream sources and prevent source persistence in Agentplane artifacts."
doc_version: 3
doc_updated_at: "2026-10-01T15:28:37.319Z"
doc_updated_by: "CODER"
description: "User-authorized separate cleanup commit removing every persisted upstream C/C++ source copy and embedded source body from Agentplane artifacts. Preserve vendor pin, hashes, native output fixtures and logs; prevent generators from persisting new source copies. Keep in-progress runtime task separate."
sections:
  Summary: "Remove all persisted upstream source copies from Agentplane artifacts at the user's explicit request, in a separate cleanup commit."
  Scope: "All C/C++ source copies under .agentplane/tasks, embedded complete source text in native identity JSON, native generator source-path/output handling, and .gitignore prevention. Preserve pinned vendor sources, identity hashes, native results, logs, implementation fixtures, production files and the in-progress numbering correction. Historical task READMEs remain unchanged; this task records supersession of source-file retention."
  Plan: "Inventory tracked and untracked source copies and JSON source bodies. Delete copies and strip source text while preserving hashes and metadata. Redirect generated C/C++ paths to ignored .agentplane/tmp/upstream-probes and filter source text from identity serialization. Validate inventory, generator syntax and representative regeneration, unchanged native results/production files, doctor/routing/diff. Commit only this cleanup scope separately; close this leaf and resume the existing parity goal."
  Verify Steps: "Check zero C/C++ source files remain in .agentplane/tasks and no embedded source-body fields remain in native identity JSON. Compile all changed Python generators without bytecode artifacts. Regenerate representative native probes from pinned vendor into ignored temporary paths and compare their output with retained native fixtures; inspect path rewrites for both producer and consumer consistency. Prove production/test files, vendor contents, native results and hashes unchanged versus baseline except removal of source text. Run ap doctor, node .agentplane/policy/check-routing.mjs, git diff --check, and inspect exact commit scope. Record canonical verification and evaluator phase; finish cleanup leaf only, preserving existing task work."
  Verification: "PASS: removed 41 tracked C++ files and 3 untracked current-task C++ files; stripped 51 source-body fields across 8 identity JSON files while preserving every remaining field/hash. Redirected 36 committed historical generators (37 working generators including in-progress task48) to ignored scratch; Python compilation succeeds. Regenerated default, 188 marker and 42 restart states; outputs and generated-source hashes match retained baseline. Exact diff changes no production/test/native result bytes. ap doctor passes with zero errors and two pre-existing warnings; routing and git diff --check pass. Native developer probes are separate from project tests. Full application suite unnecessary for this artifact-only cleanup; one existing tooling test vendor read is queued for separate correction. Cleanup implementation commit pending."
  Rollback Plan: "Revert the isolated cleanup implementation commit if necessary. Do not rewrite Git history. Native source can be regenerated from the pinned vendor checkout into ignored scratch storage."
  Findings: |-
    The user explicitly requested removal of already-committed upstream source copies. This overrides previous source-retention practice and historical artifact immutability for the narrow cleanup scope. In-progress numbering tests and fixture remain uncommitted and excluded from cleanup.

    - Observation: Project tests must not invoke pinned upstream. Application tests/config have no upstream or compiler references, but scripts/check-module-boundaries.test.ts reads vendor Library_editeng.mk. Static npm verify provenance/resource/inventory gates also read vendor separately from runtime tests.
      Impact: One existing tooling test violates the explicit user constraint and must be corrected separately; native developer probes are not project test dependencies.
      Resolution: Cleanup preserves fixtures and hashes. Queue an isolated correction removing the tooling test native read after this cleanup commit. Current task48 generator working changes and tests remain excluded from cleanup commit.

    - Observation: The cleanup implementation commit was created as 581224c02406a2b6c00126fea6b6220a0636e130, then ap commit returned E_GIT Working tree is dirty during post-commit bookkeeping because task48 has separately owned generator edits.
      Impact: Source deletion is committed, but command success and lifecycle bookkeeping must not be inferred from partial completion.
      Resolution: Recomputed route and inspected actual HEAD scope. Temporarily preserve task48 generator working bytes in ignored repository scratch, restore its committed baseline for cleanup lifecycle checks, and restore task48 work after cleanup closure. No history rewrite or inclusion of task48 implementation in cleanup.
id_source: "generated"
---
## Summary

Remove all persisted upstream source copies from Agentplane artifacts at the user's explicit request, in a separate cleanup commit.

## Scope

All C/C++ source copies under .agentplane/tasks, embedded complete source text in native identity JSON, native generator source-path/output handling, and .gitignore prevention. Preserve pinned vendor sources, identity hashes, native results, logs, implementation fixtures, production files and the in-progress numbering correction. Historical task READMEs remain unchanged; this task records supersession of source-file retention.

## Plan

Inventory tracked and untracked source copies and JSON source bodies. Delete copies and strip source text while preserving hashes and metadata. Redirect generated C/C++ paths to ignored .agentplane/tmp/upstream-probes and filter source text from identity serialization. Validate inventory, generator syntax and representative regeneration, unchanged native results/production files, doctor/routing/diff. Commit only this cleanup scope separately; close this leaf and resume the existing parity goal.

## Verify Steps

Check zero C/C++ source files remain in .agentplane/tasks and no embedded source-body fields remain in native identity JSON. Compile all changed Python generators without bytecode artifacts. Regenerate representative native probes from pinned vendor into ignored temporary paths and compare their output with retained native fixtures; inspect path rewrites for both producer and consumer consistency. Prove production/test files, vendor contents, native results and hashes unchanged versus baseline except removal of source text. Run ap doctor, node .agentplane/policy/check-routing.mjs, git diff --check, and inspect exact commit scope. Record canonical verification and evaluator phase; finish cleanup leaf only, preserving existing task work.

## Verification

PASS: removed 41 tracked C++ files and 3 untracked current-task C++ files; stripped 51 source-body fields across 8 identity JSON files while preserving every remaining field/hash. Redirected 36 committed historical generators (37 working generators including in-progress task48) to ignored scratch; Python compilation succeeds. Regenerated default, 188 marker and 42 restart states; outputs and generated-source hashes match retained baseline. Exact diff changes no production/test/native result bytes. ap doctor passes with zero errors and two pre-existing warnings; routing and git diff --check pass. Native developer probes are separate from project tests. Full application suite unnecessary for this artifact-only cleanup; one existing tooling test vendor read is queued for separate correction. Cleanup implementation commit pending.

## Rollback Plan

Revert the isolated cleanup implementation commit if necessary. Do not rewrite Git history. Native source can be regenerated from the pinned vendor checkout into ignored scratch storage.

## Findings

The user explicitly requested removal of already-committed upstream source copies. This overrides previous source-retention practice and historical artifact immutability for the narrow cleanup scope. In-progress numbering tests and fixture remain uncommitted and excluded from cleanup.

- Observation: Project tests must not invoke pinned upstream. Application tests/config have no upstream or compiler references, but scripts/check-module-boundaries.test.ts reads vendor Library_editeng.mk. Static npm verify provenance/resource/inventory gates also read vendor separately from runtime tests.
  Impact: One existing tooling test violates the explicit user constraint and must be corrected separately; native developer probes are not project test dependencies.
  Resolution: Cleanup preserves fixtures and hashes. Queue an isolated correction removing the tooling test native read after this cleanup commit. Current task48 generator working changes and tests remain excluded from cleanup commit.

- Observation: The cleanup implementation commit was created as 581224c02406a2b6c00126fea6b6220a0636e130, then ap commit returned E_GIT Working tree is dirty during post-commit bookkeeping because task48 has separately owned generator edits.
  Impact: Source deletion is committed, but command success and lifecycle bookkeeping must not be inferred from partial completion.
  Resolution: Recomputed route and inspected actual HEAD scope. Temporarily preserve task48 generator working bytes in ignored repository scratch, restore its committed baseline for cleanup lifecycle checks, and restore task48 work after cleanup closure. No history rewrite or inclusion of task48 implementation in cleanup.
