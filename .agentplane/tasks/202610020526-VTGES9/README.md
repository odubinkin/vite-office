---
id: "202610020526-VTGES9"
title: "Remove remaining Python helpers from Agentplane scratch"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 20
origin:
  system: "manual"
depends_on: []
tags:
  - "docs"
task_kind: "docs"
mutation_scope: "docs"
verify:
  - "ap doctor"
  - "node .agentplane/policy/check-routing.mjs"
plan_approval:
  state: "approved"
  updated_at: "2026-10-02T05:29:34.007Z"
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
    body: "Start: execute the user-authorized cleanup of the three remaining ignored Python helpers, with a separate scoped commit and no application changes."
  -
    author: "CODER"
    body: "Start: resume the same explicitly user-authorized cleanup with the enforcement-required code primary tag, without any scope or acceptance changes."
  -
    author: "CODER"
    body: "Start: persist only removal evidence for the three ignored scripts; route the configuration extension separately to a code task."
events:
  -
    type: "status"
    at: "2026-10-02T05:27:11.235Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: execute the user-authorized cleanup of the three remaining ignored Python helpers, with a separate scoped commit and no application changes."
  -
    type: "status"
    at: "2026-10-02T05:28:38.218Z"
    author: "CODER"
    from: "DOING"
    to: "DOING"
    note: "Start: resume the same explicitly user-authorized cleanup with the enforcement-required code primary tag, without any scope or acceptance changes."
  -
    type: "status"
    at: "2026-10-02T05:29:35.277Z"
    author: "CODER"
    from: "DOING"
    to: "DOING"
    note: "Start: persist only removal evidence for the three ignored scripts; route the configuration extension separately to a code task."
doc_version: 3
doc_updated_at: "2026-10-02T05:29:35.277Z"
doc_updated_by: "CODER"
description: "User explicitly forbids Python helper sources in Agentplane artifacts. Remove the three ignored leftover scripts under .agentplane/tmp/upstream-cleanup, expand Python artifact ignore rules, record bounded evidence and a separate commit. No implementation or upstream access."
sections:
  Summary: "Remove three ignored leftover Python scripts from Agentplane scratch, following the user's explicit prohibition. Prior committed cleanup 53373dff removed 44 tracked scripts; this leaf addresses the remaining local copies."
  Scope: "Delete exactly the three ignored Python helper files under .agentplane/tmp/upstream-cleanup and record their hashes, zero remaining inventory, and a separate cleanup evidence commit. No tracked application/configuration changes. The .gitignore extension requires a separate code task because explicit blueprint intent is immutable in installed CLI."
  Plan: "Remove three ignored Python helper files and record only bounded cleanup evidence. The attempted .gitignore extension is excluded from this docs task per enforcement and will be handled through a code task. No implementation source changes."
  Verify Steps: "1. Three ignored leftover scripts are inventoried with byte counts and hashes then removed. Filesystem and git inventories contain zero Python/bytecode paths under .agentplane. 2. Routing, doctor and diff check pass without new errors. Commit scope contains only this cleanup task evidence; no helper source saved. 3. Existing HGKX68 application changes and .gitignore are excluded from this commit. Ignore extension is routed to a separate code task; close this leaf after tracked semantic changes are persisted."
  Verification: "Pending scoped verification."
  Rollback Plan: "Revert the .gitignore cleanup commit if requested. Do not restore Python scripts into Agentplane artifacts; the user explicitly prohibited them."
  Findings: |-
    The three remaining scripts are ignored and have never been tracked at their current paths. Their deletion therefore cannot appear as git file deletions; the separate commit records the artifact exclusion and verified local cleanup.

    - Observation: The pre-commit hook rejects .gitignore as implementation mutation for docs-tagged tasks.
      Impact: The cleanup commit was not created; both scoped paths remain staged.
      Resolution: Correct primary tag to code to satisfy enforcement. Scope and verification remain identical; no hooks bypassed.
id_source: "generated"
---
## Summary

Remove three ignored leftover Python scripts from Agentplane scratch, following the user's explicit prohibition. Prior committed cleanup 53373dff removed 44 tracked scripts; this leaf addresses the remaining local copies.

## Scope

Delete exactly the three ignored Python helper files under .agentplane/tmp/upstream-cleanup and record their hashes, zero remaining inventory, and a separate cleanup evidence commit. No tracked application/configuration changes. The .gitignore extension requires a separate code task because explicit blueprint intent is immutable in installed CLI.

## Plan

Remove three ignored Python helper files and record only bounded cleanup evidence. The attempted .gitignore extension is excluded from this docs task per enforcement and will be handled through a code task. No implementation source changes.

## Verify Steps

1. Three ignored leftover scripts are inventoried with byte counts and hashes then removed. Filesystem and git inventories contain zero Python/bytecode paths under .agentplane. 2. Routing, doctor and diff check pass without new errors. Commit scope contains only this cleanup task evidence; no helper source saved. 3. Existing HGKX68 application changes and .gitignore are excluded from this commit. Ignore extension is routed to a separate code task; close this leaf after tracked semantic changes are persisted.

## Verification

Pending scoped verification.

## Rollback Plan

Revert the .gitignore cleanup commit if requested. Do not restore Python scripts into Agentplane artifacts; the user explicitly prohibited them.

## Findings

The three remaining scripts are ignored and have never been tracked at their current paths. Their deletion therefore cannot appear as git file deletions; the separate commit records the artifact exclusion and verified local cleanup.

- Observation: The pre-commit hook rejects .gitignore as implementation mutation for docs-tagged tasks.
  Impact: The cleanup commit was not created; both scoped paths remain staged.
  Resolution: Correct primary tag to code to satisfy enforcement. Scope and verification remain identical; no hooks bypassed.
