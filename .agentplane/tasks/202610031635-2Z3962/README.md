---
id: "202610031635-2Z3962"
title: "Remove executable helpers from Agentplane artifacts"
result_summary: "Closed as duplicate of 202610031642-HHGTQ2."
risk_level: "low"
breaking: false
status: "DONE"
priority: "med"
owner: "CODER"
revision: 16
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
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
  -
    author: "PLANNER"
    body: |-
      Verified: 202610031635-2Z3962 is a bookkeeping duplicate of 202610031642-HHGTQ2 (Clean obsolete executable artifact storage); no code/config changes are expected in this task and closure is recorded as no-op.

      Reason: Explicit docs task intent cannot commit obsolete external source-storage helper deletion; code.direct replacement adopts unchanged cleanup scope and successful verification evidence.
events:
  -
    type: "status"
    at: "2026-10-03T16:36:31.520Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: remove historical executable helpers and copied sources from Agentplane artifacts under the user-approved storage cleanup scope."
  -
    type: "status"
    at: "2026-10-03T16:42:48.330Z"
    author: "PLANNER"
    from: "DOING"
    to: "DONE"
    note: |-
      Verified: 202610031635-2Z3962 is a bookkeeping duplicate of 202610031642-HHGTQ2 (Clean obsolete executable artifact storage); no code/config changes are expected in this task and closure is recorded as no-op.

      Reason: Explicit docs task intent cannot commit obsolete external source-storage helper deletion; code.direct replacement adopts unchanged cleanup scope and successful verification evidence.
doc_version: 3
doc_updated_at: "2026-10-03T16:42:48.330Z"
doc_updated_by: "PLANNER"
description: "Remove remaining historical TS/JS task helper scripts and ignored copied implementation source from Agentplane, and delete the obsolete native probe scratch-storage helper. Keep bounded results, hashes and historical task records. No product behavior, project test expectations, vendor contents or Git history changes."
sections:
  Summary: "Remove remaining executable task helpers and copied project sources from Agentplane artifact storage. Python and native source artifacts are already absent; historical TS/JS helpers remain and should not be retained as evidence."
  Scope: "Delete all 50 tracked TS/MTS/MJS helpers under historical .agentplane/tasks directories, five ignored TS source/helper files under .agentplane/tmp, 15 ignored obsolete native probe executables and their three debug-symbol bundles, and scripts/native_probe_storage.py, the obsolete unreferenced helper that recreates forbidden native scratch storage. Preserve policy/check-routing.mjs, framework-managed upgrade baseline, owned application/test/tool sources, logs, hashes, bounded JSON results and existing historical README records. No upstream reads or invocation are needed. No Git history rewrite."
  Plan: "1. Inventory exact tracked and ignored historical executable helper/source paths and confirm no live dependencies. 2. Delete only these paths and the obsolete source-storage helper; retain result evidence and canonical tooling. 3. Run declared static, format, lint, type and policy checks; record bounded hashes/counts only. 4. Commit cleanup separately, evaluate the exact semantic commit and close the leaf. Parent upstream alignment remains active."
  Verify Steps: |-
    1. Ignored-inclusive filesystem inventory and tracked index list show zero Python, bytecode, native-source or executable task helpers under .agentplane/tasks and .agentplane/tmp. Preserve the policy routing tool.
    2. Confirm application and project test/tool files are byte-identical to starting HEAD, except removal of the obsolete unreferenced storage helper; no project/package references point to removed helper files.
    3. Run npm run format:check, npm run lint, npm run typecheck:tools, npm run check:docs, npm run check:source-provenance and npm run inventory:parity; provenance/parity audits are static source audits, not project tests.
    4. Run node .agentplane/policy/check-routing.mjs and ap doctor; record any existing hook-readiness warning. Review exact deletions and git diff --check, record verification and finish with a dedicated cleanup commit and clean final checkout.
  Verification: "Command: npm run format:check; npm run lint; npm run typecheck:tools; npm run check:docs; npm run check:source-provenance; npm run inventory:parity; node .agentplane/policy/check-routing.mjs; ap doctor; git diff --check. Result: all exit 0. Evidence: logs plus verification-results.json and exact path/hash cleanup-results.json. JSDoc passed for 497 authored source files; provenance passed for 214 runtime modules; inventory parity has zero semantic violations. Doctor has zero errors, one pre-existing hook-readiness warning and two informational findings. Scope: deletion of historical task scripts, ignored copied source/native executables/debug bundles and the obsolete storage helper. No application or test assertion changes; live source/package references to deleted helpers are absent; canonical policy routing tool preserved. Ignored-inclusive task/tmp artifact source/helper/executable count is zero. Project tests are unchanged and were not rerun for storage-only deletions. Provenance/parity commands are static CLI audits and do not execute native upstream. Links: existing canonical policy modules unchanged. Parent runtime parity remains open."
  Rollback Plan: "If an unexpected live dependency is found, stop and repair the approved cleanup scope before committing. Historical removed code remains recoverable in Git; do not restore executable helpers or upstream copies into Agentplane storage. Product sources and tests are unchanged."
  Findings: "Initial extension-filtered scan found zero Python, bytecode or native C/C++ source artifacts. Comprehensive filesystem inventory additionally identified five MTS helpers, 15 obsolete executable probes and three debug-symbol bundles in the same historical artifact storage. Exact cleanup total: 50 tracked task helper scripts, five ignored TS source/helper files, 15 ignored executable probes, three ignored debug bundles and one tracked obsolete Python storage helper. No live project references to deleted helper paths exist; historical README descriptions remain a record of earlier work."
id_source: "generated"
---
## Summary

Remove remaining executable task helpers and copied project sources from Agentplane artifact storage. Python and native source artifacts are already absent; historical TS/JS helpers remain and should not be retained as evidence.

## Scope

Delete all 50 tracked TS/MTS/MJS helpers under historical .agentplane/tasks directories, five ignored TS source/helper files under .agentplane/tmp, 15 ignored obsolete native probe executables and their three debug-symbol bundles, and scripts/native_probe_storage.py, the obsolete unreferenced helper that recreates forbidden native scratch storage. Preserve policy/check-routing.mjs, framework-managed upgrade baseline, owned application/test/tool sources, logs, hashes, bounded JSON results and existing historical README records. No upstream reads or invocation are needed. No Git history rewrite.

## Plan

1. Inventory exact tracked and ignored historical executable helper/source paths and confirm no live dependencies. 2. Delete only these paths and the obsolete source-storage helper; retain result evidence and canonical tooling. 3. Run declared static, format, lint, type and policy checks; record bounded hashes/counts only. 4. Commit cleanup separately, evaluate the exact semantic commit and close the leaf. Parent upstream alignment remains active.

## Verify Steps

1. Ignored-inclusive filesystem inventory and tracked index list show zero Python, bytecode, native-source or executable task helpers under .agentplane/tasks and .agentplane/tmp. Preserve the policy routing tool.
2. Confirm application and project test/tool files are byte-identical to starting HEAD, except removal of the obsolete unreferenced storage helper; no project/package references point to removed helper files.
3. Run npm run format:check, npm run lint, npm run typecheck:tools, npm run check:docs, npm run check:source-provenance and npm run inventory:parity; provenance/parity audits are static source audits, not project tests.
4. Run node .agentplane/policy/check-routing.mjs and ap doctor; record any existing hook-readiness warning. Review exact deletions and git diff --check, record verification and finish with a dedicated cleanup commit and clean final checkout.

## Verification

Command: npm run format:check; npm run lint; npm run typecheck:tools; npm run check:docs; npm run check:source-provenance; npm run inventory:parity; node .agentplane/policy/check-routing.mjs; ap doctor; git diff --check. Result: all exit 0. Evidence: logs plus verification-results.json and exact path/hash cleanup-results.json. JSDoc passed for 497 authored source files; provenance passed for 214 runtime modules; inventory parity has zero semantic violations. Doctor has zero errors, one pre-existing hook-readiness warning and two informational findings. Scope: deletion of historical task scripts, ignored copied source/native executables/debug bundles and the obsolete storage helper. No application or test assertion changes; live source/package references to deleted helpers are absent; canonical policy routing tool preserved. Ignored-inclusive task/tmp artifact source/helper/executable count is zero. Project tests are unchanged and were not rerun for storage-only deletions. Provenance/parity commands are static CLI audits and do not execute native upstream. Links: existing canonical policy modules unchanged. Parent runtime parity remains open.

## Rollback Plan

If an unexpected live dependency is found, stop and repair the approved cleanup scope before committing. Historical removed code remains recoverable in Git; do not restore executable helpers or upstream copies into Agentplane storage. Product sources and tests are unchanged.

## Findings

Initial extension-filtered scan found zero Python, bytecode or native C/C++ source artifacts. Comprehensive filesystem inventory additionally identified five MTS helpers, 15 obsolete executable probes and three debug-symbol bundles in the same historical artifact storage. Exact cleanup total: 50 tracked task helper scripts, five ignored TS source/helper files, 15 ignored executable probes, three ignored debug bundles and one tracked obsolete Python storage helper. No live project references to deleted helper paths exist; historical README descriptions remain a record of earlier work.
