---
id: "202610020531-4N8JF2"
title: "Exclude Python sources throughout Agentplane storage"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 11
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
task_kind: "code"
mutation_scope: "code"
verify:
  - "ap doctor"
  - "git diff --check"
  - "node .agentplane/policy/check-routing.mjs"
plan_approval:
  state: "approved"
  updated_at: "2026-10-02T05:31:46.153Z"
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
    body: "Start: apply the explicitly authorized exclusion of Python source and bytecode throughout Agentplane storage, with a separate configuration-only commit."
events:
  -
    type: "status"
    at: "2026-10-02T05:31:47.105Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: apply the explicitly authorized exclusion of Python source and bytecode throughout Agentplane storage, with a separate configuration-only commit."
doc_version: 3
doc_updated_at: "2026-10-02T05:31:47.105Z"
doc_updated_by: "CODER"
description: "Extend the user-requested Python artifact exclusion from task directories to the entire Agentplane subtree, including bytecode. Configuration-only follow-up to VTGES9 cleanup; separate .gitignore commit, no application or source changes."
sections:
  Summary: "Exclude Python source and bytecode throughout Agentplane storage, following the user's explicit prohibition and the VTGES9 removal of the three ignored leftovers."
  Scope: ".gitignore only plus active task evidence. No application, test, policy module, or upstream changes. The existing cleanup record is cea5d14c1d73376eee8b598face9a021f55df373."
  Plan: "Extend the existing task-only Python ignore pattern to .agentplane/**/*.py and add pyc/pyo exclusions. Verify representative paths, zero existing Python/bytecode inventory, scoped diff, routing and doctor. Commit separately, record canonical verification and same-actor quality, close after application leaf HGKX68 is persisted."
  Verify Steps: |-
    1. git check-ignore confirms py/pyc/pyo paths under task directories and scratch are excluded. Filesystem and tracked inventory under .agentplane contain zero such files. No Python helper source saved.
    2. Exact semantic diff is .gitignore only; git diff --check, policy routing and doctor pass without new errors. No application or upstream tests required for artifact exclusion.
    3. Separate actual implementation SHA, canonical verification and quality evidence recorded. No unrelated changes staged; finish with clean tracked state once HGKX68 is committed.
  Verification: "Pending local scoped checks."
  Rollback Plan: "Revert only this .gitignore commit if requested; do not restore forbidden helpers to Agentplane artifacts."
  Findings: "The earlier docs task could record ignored local file removal but enforcement requires code intent for .gitignore mutations. No hook bypass or scope expansion."
id_source: "generated"
---
## Summary

Exclude Python source and bytecode throughout Agentplane storage, following the user's explicit prohibition and the VTGES9 removal of the three ignored leftovers.

## Scope

.gitignore only plus active task evidence. No application, test, policy module, or upstream changes. The existing cleanup record is cea5d14c1d73376eee8b598face9a021f55df373.

## Plan

Extend the existing task-only Python ignore pattern to .agentplane/**/*.py and add pyc/pyo exclusions. Verify representative paths, zero existing Python/bytecode inventory, scoped diff, routing and doctor. Commit separately, record canonical verification and same-actor quality, close after application leaf HGKX68 is persisted.

## Verify Steps

1. git check-ignore confirms py/pyc/pyo paths under task directories and scratch are excluded. Filesystem and tracked inventory under .agentplane contain zero such files. No Python helper source saved.
2. Exact semantic diff is .gitignore only; git diff --check, policy routing and doctor pass without new errors. No application or upstream tests required for artifact exclusion.
3. Separate actual implementation SHA, canonical verification and quality evidence recorded. No unrelated changes staged; finish with clean tracked state once HGKX68 is committed.

## Verification

Pending local scoped checks.

## Rollback Plan

Revert only this .gitignore commit if requested; do not restore forbidden helpers to Agentplane artifacts.

## Findings

The earlier docs task could record ignored local file removal but enforcement requires code intent for .gitignore mutations. No hook bypass or scope expansion.
