---
id: "202610031610-JKV7Z1"
title: "Move owned inventory test scratch outside Agentplane"
status: "DOING"
priority: "med"
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
  updated_at: "2026-10-03T16:12:07.503Z"
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
    body: "Start: eliminate owned test-source storage under Agentplane, honoring explicit user restriction with one scratch path and stale exclusion-comment correction."
events:
  -
    type: "status"
    at: "2026-10-03T16:12:07.940Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: eliminate owned test-source storage under Agentplane, honoring explicit user restriction with one scratch path and stale exclusion-comment correction."
doc_version: 3
doc_updated_at: "2026-10-03T16:12:07.940Z"
doc_updated_by: "CODER"
description: "Honor user source/helper artifact restriction by relocating repository-owned inventory fixture scratch from Agentplane to ignored test-results; fixtures and test assertions remain independent of pinned upstream."
sections:
  Summary: "Stop project test fixtures from creating even transient source files inside Agentplane; user no-source/no-Python/helper restriction remains absolute."
  Scope: "Only scripts/test-fixtures/inventory-reference.ts and one .gitignore comment; own task bookkeeping and related parent/core evidence only."
  Plan: "Relocate only inventory fixture scratch constant from .agentplane/tmp/inventory-test-fixtures to ignored repository-local test-results/inventory-fixtures. Clarify stale .gitignore native-source comment: exclusion is a guard, not permission to save upstream/native sources in Agentplane. Preserve every fixture body, test expectation, CLI guard, git isolation and cleanup contract. No helpers/upstream source copies saved, no policy/dependency/production/runtime/IO changes. Run inventory109tests with vendor absent/restored; observe owned fixture path during its lifetime and require ignored-inclusive Agentplane source count0. Types/tools,format,lint,doctor,routing,diff pass. Commit correction separately, same-actor evaluator actual semantic SHA, clean close; retain parent/full goal active and core closure evidence separately."
  Verify Steps: |-
    1. Actual owned inventory fixture directory resolves under test-results/inventory-fixtures and is git-ignored; source_0.cxx is outside Agentplane during its lifetime. Finally cleanup succeeds; Agentplane ignored-inclusive Python/bytecode/native/helper source scan0. No test may read/compile/invoke pinned upstream.
    2. Inventory coverage109tests/36files passes with vendor absent/restored in finally,both100%; fixture bodies/Git adapter/old expected values unchanged except scratch constant. Existing full792app/109inventory/20browser all gates passes remain browser/core evidence; this path/comment-only change requires no repeated browser coverage.
    3. format:check,lint,typecheck:tools,check:docs,doctor0newerrors,routing,diff/scope pass. Separate semantic commit2paths; distinct same-actor EVALUATOR actual SHA, clean task close, parent/full goal active.
  Verification: "Pending."
  Rollback Plan: "Revert only cleanup semantic commit on request; never restore source/helper artifacts or rewrite history."
  Findings: "Fresh full verification792/109/20 passes. At-rest source scans0, but concurrent inventory run briefly produces one authored source_0.cxx under .agentplane/tmp/inventory-test-fixtures; fixture helper explicitly writes synthetic parser inputs and never reads upstream. Previously removed Python/helper files remain absent. Moving test data outside Agentplane closes repeated artifact-storage route without disabling tests or changing gates."
id_source: "generated"
---
## Summary

Stop project test fixtures from creating even transient source files inside Agentplane; user no-source/no-Python/helper restriction remains absolute.

## Scope

Only scripts/test-fixtures/inventory-reference.ts and one .gitignore comment; own task bookkeeping and related parent/core evidence only.

## Plan

Relocate only inventory fixture scratch constant from .agentplane/tmp/inventory-test-fixtures to ignored repository-local test-results/inventory-fixtures. Clarify stale .gitignore native-source comment: exclusion is a guard, not permission to save upstream/native sources in Agentplane. Preserve every fixture body, test expectation, CLI guard, git isolation and cleanup contract. No helpers/upstream source copies saved, no policy/dependency/production/runtime/IO changes. Run inventory109tests with vendor absent/restored; observe owned fixture path during its lifetime and require ignored-inclusive Agentplane source count0. Types/tools,format,lint,doctor,routing,diff pass. Commit correction separately, same-actor evaluator actual semantic SHA, clean close; retain parent/full goal active and core closure evidence separately.

## Verify Steps

1. Actual owned inventory fixture directory resolves under test-results/inventory-fixtures and is git-ignored; source_0.cxx is outside Agentplane during its lifetime. Finally cleanup succeeds; Agentplane ignored-inclusive Python/bytecode/native/helper source scan0. No test may read/compile/invoke pinned upstream.
2. Inventory coverage109tests/36files passes with vendor absent/restored in finally,both100%; fixture bodies/Git adapter/old expected values unchanged except scratch constant. Existing full792app/109inventory/20browser all gates passes remain browser/core evidence; this path/comment-only change requires no repeated browser coverage.
3. format:check,lint,typecheck:tools,check:docs,doctor0newerrors,routing,diff/scope pass. Separate semantic commit2paths; distinct same-actor EVALUATOR actual SHA, clean task close, parent/full goal active.

## Verification

Pending.

## Rollback Plan

Revert only cleanup semantic commit on request; never restore source/helper artifacts or rewrite history.

## Findings

Fresh full verification792/109/20 passes. At-rest source scans0, but concurrent inventory run briefly produces one authored source_0.cxx under .agentplane/tmp/inventory-test-fixtures; fixture helper explicitly writes synthetic parser inputs and never reads upstream. Previously removed Python/helper files remain absent. Moving test data outside Agentplane closes repeated artifact-storage route without disabling tests or changing gates.
