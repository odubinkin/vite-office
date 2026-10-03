---
id: "202610031635-2Z3962"
title: "Remove executable helpers from Agentplane artifacts"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 10
origin:
  system: "manual"
depends_on: []
tags:
  - "docs"
task_kind: "docs"
mutation_scope: "docs"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-03T16:36:31.099Z"
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
    body: "Start: remove historical executable helpers and copied sources from Agentplane artifacts under the user-approved storage cleanup scope."
events:
  -
    type: "status"
    at: "2026-10-03T16:36:31.520Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: remove historical executable helpers and copied sources from Agentplane artifacts under the user-approved storage cleanup scope."
doc_version: 3
doc_updated_at: "2026-10-03T16:36:31.520Z"
doc_updated_by: "CODER"
description: "Remove remaining historical TS/JS task helper scripts and ignored copied implementation source from Agentplane, and delete the obsolete native probe scratch-storage helper. Keep bounded results, hashes and historical task records. No product behavior, project test expectations, vendor contents or Git history changes."
sections:
  Summary: "Remove remaining executable task helpers and copied project sources from Agentplane artifact storage. Python and native source artifacts are already absent; historical TS/JS helpers remain and should not be retained as evidence."
  Scope: "Delete the 44 tracked TS/MJS helpers under historical .agentplane/tasks directories, five ignored TS source/helper files under .agentplane/tmp, and scripts/native_probe_storage.py, the obsolete unreferenced helper that recreates forbidden native scratch storage. Preserve policy/check-routing.mjs, framework-managed upgrade baseline, owned application/test/tool sources, logs, hashes, bounded JSON results and existing historical README records. No upstream reads or invocation are needed. No Git history rewrite."
  Plan: "1. Inventory exact tracked and ignored historical executable helper/source paths and confirm no live dependencies. 2. Delete only these paths and the obsolete source-storage helper; retain result evidence and canonical tooling. 3. Run declared static, format, lint, type and policy checks; record bounded hashes/counts only. 4. Commit cleanup separately, evaluate the exact semantic commit and close the leaf. Parent upstream alignment remains active."
  Verify Steps: |-
    1. Ignored-inclusive filesystem inventory and tracked index list show zero Python, bytecode, native-source or executable task helpers under .agentplane/tasks and .agentplane/tmp. Preserve the policy routing tool.
    2. Confirm application and project test/tool files are byte-identical to starting HEAD, except removal of the obsolete unreferenced storage helper; no project/package references point to removed helper files.
    3. Run npm run format:check, npm run lint, npm run typecheck:tools, npm run check:docs, npm run check:source-provenance and npm run inventory:parity; provenance/parity audits are static source audits, not project tests.
    4. Run node .agentplane/policy/check-routing.mjs and ap doctor; record any existing hook-readiness warning. Review exact deletions and git diff --check, record verification and finish with a dedicated cleanup commit and clean final checkout.
  Verification: "Pending implementation and declared checks. No project tests will invoke or read pinned upstream. No saved generators or helper script files will be created."
  Rollback Plan: "If an unexpected live dependency is found, stop and repair the approved cleanup scope before committing. Historical removed code remains recoverable in Git; do not restore executable helpers or upstream copies into Agentplane storage. Product sources and tests are unchanged."
  Findings: "Current read-only ignored-inclusive scan found zero .py/.pyc/.pyo or native C/C++ sources under .agentplane. It found 44 tracked TS/MJS task scripts, one ignored diagnostic TS helper and four ignored copied project TS source files. scripts/native_probe_storage.py has no remaining live reference and explicitly routes generated native sources into Agentplane ignored scratch, contrary to user storage restrictions. Historical scripts are not project tests."
id_source: "generated"
---
## Summary

Remove remaining executable task helpers and copied project sources from Agentplane artifact storage. Python and native source artifacts are already absent; historical TS/JS helpers remain and should not be retained as evidence.

## Scope

Delete the 44 tracked TS/MJS helpers under historical .agentplane/tasks directories, five ignored TS source/helper files under .agentplane/tmp, and scripts/native_probe_storage.py, the obsolete unreferenced helper that recreates forbidden native scratch storage. Preserve policy/check-routing.mjs, framework-managed upgrade baseline, owned application/test/tool sources, logs, hashes, bounded JSON results and existing historical README records. No upstream reads or invocation are needed. No Git history rewrite.

## Plan

1. Inventory exact tracked and ignored historical executable helper/source paths and confirm no live dependencies. 2. Delete only these paths and the obsolete source-storage helper; retain result evidence and canonical tooling. 3. Run declared static, format, lint, type and policy checks; record bounded hashes/counts only. 4. Commit cleanup separately, evaluate the exact semantic commit and close the leaf. Parent upstream alignment remains active.

## Verify Steps

1. Ignored-inclusive filesystem inventory and tracked index list show zero Python, bytecode, native-source or executable task helpers under .agentplane/tasks and .agentplane/tmp. Preserve the policy routing tool.
2. Confirm application and project test/tool files are byte-identical to starting HEAD, except removal of the obsolete unreferenced storage helper; no project/package references point to removed helper files.
3. Run npm run format:check, npm run lint, npm run typecheck:tools, npm run check:docs, npm run check:source-provenance and npm run inventory:parity; provenance/parity audits are static source audits, not project tests.
4. Run node .agentplane/policy/check-routing.mjs and ap doctor; record any existing hook-readiness warning. Review exact deletions and git diff --check, record verification and finish with a dedicated cleanup commit and clean final checkout.

## Verification

Pending implementation and declared checks. No project tests will invoke or read pinned upstream. No saved generators or helper script files will be created.

## Rollback Plan

If an unexpected live dependency is found, stop and repair the approved cleanup scope before committing. Historical removed code remains recoverable in Git; do not restore executable helpers or upstream copies into Agentplane storage. Product sources and tests are unchanged.

## Findings

Current read-only ignored-inclusive scan found zero .py/.pyc/.pyo or native C/C++ sources under .agentplane. It found 44 tracked TS/MJS task scripts, one ignored diagnostic TS helper and four ignored copied project TS source files. scripts/native_probe_storage.py has no remaining live reference and explicitly routes generated native sources into Agentplane ignored scratch, contrary to user storage restrictions. Historical scripts are not project tests.
