---
id: "202610020526-VTGES9"
title: "Remove remaining Python helpers from Agentplane scratch"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 11
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
  updated_at: "2026-10-02T05:27:09.513Z"
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
events:
  -
    type: "status"
    at: "2026-10-02T05:27:11.235Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: execute the user-authorized cleanup of the three remaining ignored Python helpers, with a separate scoped commit and no application changes."
doc_version: 3
doc_updated_at: "2026-10-02T05:27:11.235Z"
doc_updated_by: "CODER"
description: "User explicitly forbids Python helper sources in Agentplane artifacts. Remove the three ignored leftover scripts under .agentplane/tmp/upstream-cleanup, expand Python artifact ignore rules, record bounded evidence and a separate commit. No implementation or upstream access."
sections:
  Summary: "Remove three ignored leftover Python scripts from Agentplane scratch, following the user's explicit prohibition. Prior committed cleanup 53373dff removed 44 tracked scripts; this leaf addresses the remaining local copies."
  Scope: "Only .gitignore and the three ignored files .agentplane/tmp/upstream-cleanup/check-browser-without-vendor.py, task48-working.py, check-without-vendor.py, plus this task's evidence. No application changes, upstream access, network, or history rewriting."
  Plan: "Delete exactly the three leftover ignored scripts, expand existing Python artifact ignore patterns to the full .agentplane subtree including bytecode, inspect absence and scoped diff, record verification, and create a separate cleanup commit. Finish after the current application leaf is committed so direct closure sees clean tracked state."
  Verify Steps: |-
    1. Inventory the three paths with byte counts and hashes before deletion. Afterwards both filesystem and tracked inventory contain zero Python/bytecode files under .agentplane. No helper sources are introduced.
    2. Expanded .gitignore covers Python and bytecode in tasks and scratch. git diff --check, routing and doctor pass without new errors. Semantic diff is .gitignore only.
    3. Separate actual cleanup implementation commit and bounded verification evidence are recorded. Existing application changes belong exclusively to HGKX68 and remain untouched.
  Verification: "Pending scoped verification."
  Rollback Plan: "Revert the .gitignore cleanup commit if requested. Do not restore Python scripts into Agentplane artifacts; the user explicitly prohibited them."
  Findings: "The three remaining scripts are ignored and have never been tracked at their current paths. Their deletion therefore cannot appear as git file deletions; the separate commit records the artifact exclusion and verified local cleanup."
id_source: "generated"
---
## Summary

Remove three ignored leftover Python scripts from Agentplane scratch, following the user's explicit prohibition. Prior committed cleanup 53373dff removed 44 tracked scripts; this leaf addresses the remaining local copies.

## Scope

Only .gitignore and the three ignored files .agentplane/tmp/upstream-cleanup/check-browser-without-vendor.py, task48-working.py, check-without-vendor.py, plus this task's evidence. No application changes, upstream access, network, or history rewriting.

## Plan

Delete exactly the three leftover ignored scripts, expand existing Python artifact ignore patterns to the full .agentplane subtree including bytecode, inspect absence and scoped diff, record verification, and create a separate cleanup commit. Finish after the current application leaf is committed so direct closure sees clean tracked state.

## Verify Steps

1. Inventory the three paths with byte counts and hashes before deletion. Afterwards both filesystem and tracked inventory contain zero Python/bytecode files under .agentplane. No helper sources are introduced.
2. Expanded .gitignore covers Python and bytecode in tasks and scratch. git diff --check, routing and doctor pass without new errors. Semantic diff is .gitignore only.
3. Separate actual cleanup implementation commit and bounded verification evidence are recorded. Existing application changes belong exclusively to HGKX68 and remain untouched.

## Verification

Pending scoped verification.

## Rollback Plan

Revert the .gitignore cleanup commit if requested. Do not restore Python scripts into Agentplane artifacts; the user explicitly prohibited them.

## Findings

The three remaining scripts are ignored and have never been tracked at their current paths. Their deletion therefore cannot appear as git file deletions; the separate commit records the artifact exclusion and verified local cleanup.
