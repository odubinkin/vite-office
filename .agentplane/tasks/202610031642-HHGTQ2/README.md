---
id: "202610031642-HHGTQ2"
title: "Clean obsolete executable artifact storage"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 10
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
task_kind: "code"
mutation_scope: "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-03T16:42:48.790Z"
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
    body: "Start: adopt exact authorized artifact cleanup and completed checks under the required implementation-capable route; preserve all project behavior and tests."
events:
  -
    type: "status"
    at: "2026-10-03T16:42:49.217Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: adopt exact authorized artifact cleanup and completed checks under the required implementation-capable route; preserve all project behavior and tests."
doc_version: 3
doc_updated_at: "2026-10-03T16:42:49.217Z"
doc_updated_by: "CODER"
description: "Execute the already authorized removal of all remaining historical Agentplane helper scripts, temporary copied implementation files, native executable/debug probes and obsolete scripts/native_probe_storage.py. This code-routed replacement of 202610031635-2Z3962 is required by the commit hook because deleting the external storage helper counts as implementation mutation. No product behavior, project tests, vendor contents or Git history changes."
sections:
  Summary: "Remove remaining executable task helpers and copied project sources from Agentplane artifact storage. Python and native source artifacts are already absent; historical TS/JS helpers remain and should not be retained as evidence."
  Scope: "Delete all 50 tracked TS/MTS/MJS helpers under historical .agentplane/tasks directories, five ignored TS source/helper files under .agentplane/tmp, 15 ignored obsolete native probe executables and their three debug-symbol bundles, and scripts/native_probe_storage.py, the obsolete unreferenced helper that recreates forbidden native scratch storage. Preserve policy/check-routing.mjs, framework-managed upgrade baseline, owned application/test/tool sources, logs, hashes, bounded JSON results and existing historical README records. No upstream reads or invocation are needed. No Git history rewrite."
  Plan: "Adopt the exact approved cleanup and successful checks from 202610031635-2Z3962 under the code.direct route required by the implementation-path hook. Persist canonical task, commit exact deletion scope plus bounded evidence, verify and evaluate that semantic SHA, then close. No new behavior, helper sources, upstream source copies or vendor execution."
  Verify Steps: |-
    1. Ignored-inclusive filesystem inventory and tracked index list show zero Python, bytecode, native-source or executable task helpers under .agentplane/tasks and .agentplane/tmp. Preserve the policy routing tool.
    2. Confirm application and project test/tool files are byte-identical to starting HEAD, except removal of the obsolete unreferenced storage helper; no project/package references point to removed helper files.
    3. Run npm run format:check, npm run lint, npm run typecheck:tools, npm run check:docs, npm run check:source-provenance and npm run inventory:parity; provenance/parity audits are static source audits, not project tests.
    4. Run node .agentplane/policy/check-routing.mjs and ap doctor; record any existing hook-readiness warning. Review exact deletions and git diff --check, record verification and finish with a dedicated cleanup commit and clean final checkout.
  Verification: "Command: npm run format:check; npm run lint; npm run typecheck:tools; npm run check:docs; npm run check:source-provenance; npm run inventory:parity; node .agentplane/policy/check-routing.mjs; ap doctor; git diff --check. Result: all exit 0. Evidence: logs plus verification-results.json and exact path/hash cleanup-results.json. JSDoc passed for 497 authored source files; provenance passed for 214 runtime modules; inventory parity has zero semantic violations. Doctor has zero errors, one pre-existing hook-readiness warning and two informational findings. Scope: deletion of historical task scripts, ignored copied source/native executables/debug bundles and the obsolete storage helper. No application or test assertion changes; live source/package references to deleted helpers are absent; canonical policy routing tool preserved. Ignored-inclusive task/tmp artifact source/helper/executable count is zero. Project tests are unchanged and were not rerun for storage-only deletions. Provenance/parity commands are static CLI audits and do not execute native upstream. Links: existing canonical policy modules unchanged. Parent runtime parity remains open."
  Rollback Plan: "If an unexpected live dependency is found, stop and repair the approved cleanup scope before committing. Historical removed code remains recoverable in Git; do not restore executable helpers or upstream copies into Agentplane storage. Product sources and tests are unchanged."
  Findings: "Initial extension-filtered scan found zero Python, bytecode or native C/C++ source artifacts. Comprehensive filesystem inventory additionally identified five MTS helpers, 15 obsolete executable probes and three debug-symbol bundles in the same historical artifact storage. Exact cleanup total: 50 tracked task helper scripts, five ignored TS source/helper files, 15 ignored executable probes, three ignored debug bundles and one tracked obsolete Python storage helper. No live project references to deleted helper paths exist; historical README descriptions remain a record of earlier work. Commit hook rejected the docs.change task intent because deleting scripts/native_probe_storage.py is an implementation path. Changing primary tags did not alter explicit task intent. Canonical code.direct replacement 202610031642-HHGTQ2 adopts the same approved cleanup scope and completed check evidence from 202610031635-2Z3962; no gate is bypassed and no additional product change is introduced."
id_source: "generated"
---
## Summary

Remove remaining executable task helpers and copied project sources from Agentplane artifact storage. Python and native source artifacts are already absent; historical TS/JS helpers remain and should not be retained as evidence.

## Scope

Delete all 50 tracked TS/MTS/MJS helpers under historical .agentplane/tasks directories, five ignored TS source/helper files under .agentplane/tmp, 15 ignored obsolete native probe executables and their three debug-symbol bundles, and scripts/native_probe_storage.py, the obsolete unreferenced helper that recreates forbidden native scratch storage. Preserve policy/check-routing.mjs, framework-managed upgrade baseline, owned application/test/tool sources, logs, hashes, bounded JSON results and existing historical README records. No upstream reads or invocation are needed. No Git history rewrite.

## Plan

Adopt the exact approved cleanup and successful checks from 202610031635-2Z3962 under the code.direct route required by the implementation-path hook. Persist canonical task, commit exact deletion scope plus bounded evidence, verify and evaluate that semantic SHA, then close. No new behavior, helper sources, upstream source copies or vendor execution.

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

Initial extension-filtered scan found zero Python, bytecode or native C/C++ source artifacts. Comprehensive filesystem inventory additionally identified five MTS helpers, 15 obsolete executable probes and three debug-symbol bundles in the same historical artifact storage. Exact cleanup total: 50 tracked task helper scripts, five ignored TS source/helper files, 15 ignored executable probes, three ignored debug bundles and one tracked obsolete Python storage helper. No live project references to deleted helper paths exist; historical README descriptions remain a record of earlier work. Commit hook rejected the docs.change task intent because deleting scripts/native_probe_storage.py is an implementation path. Changing primary tags did not alter explicit task intent. Canonical code.direct replacement 202610031642-HHGTQ2 adopts the same approved cleanup scope and completed check evidence from 202610031635-2Z3962; no gate is bypassed and no additional product change is introduced.
