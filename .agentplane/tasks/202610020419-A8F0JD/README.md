---
id: "202610020419-A8F0JD"
title: "Remove one-off Python sources from Agentplane artifacts"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 6
origin:
  system: "manual"
depends_on: []
tags:
  - "docs"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-02T04:19:38.801Z"
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
    body: "Start: User-authorized separate cleanup of 44 Python artifact sources and targeted ignore rule; preserve results and historical DONE documentation, with no upstream execution."
events:
  -
    type: "status"
    at: "2026-10-02T04:19:39.567Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: User-authorized separate cleanup of 44 Python artifact sources and targeted ignore rule; preserve results and historical DONE documentation, with no upstream execution."
doc_version: 3
doc_updated_at: "2026-10-02T04:20:49.396Z"
doc_updated_by: "CODER"
description: "User-directed cleanup: delete all 44 tracked Python generator/edit helper sources under .agentplane/tasks in a separate commit; add a targeted ignore rule preventing future task artifact Python sources. Retain historical results and hash evidence, do not run upstream or change implementation/test code, and do not rewrite completed task documentation or Git history."
sections:
  Summary: "Remove Python source scripts from Agentplane task artifacts as explicitly requested by the user. This separate cleanup does not advance or resume the paused implementation goal."
  Scope: "Delete the exact 44 tracked .py files currently under .agentplane/tasks. Add one .agentplane/tasks/**/*.py ignore rule in .gitignore. New task documentation and concise verification metadata are in scope. Preserve application code, project tests, results, hashes, historical DONE task READMEs, and Git history."
  Plan: "Delete the exact 44 tracked Python source scripts under .agentplane/tasks and add a targeted .gitignore rule; keep result/hash evidence and historical DONE documentation unchanged. Verify file inventory, consumer absence, ignored source paths, precise diff, routing, doctor and clean final state; commit and close separately. User correction authorizes this cleanup; no upstream execution, network access or implementation-goal resumption."
  Verify Steps: |-
    1. Exact tracked/on-disk inventory contains 44 task .py sources before deletion; no outside consumer in package.json, scripts, docs or .gitignore references deleted generator entry points. After deletion, rg --files --hidden --no-ignore .agentplane/tasks with py/pyc/pyo filters returns no files.
    2. git diff --name-status contains exactly the 44 inventoried deletions plus .gitignore and active task bookkeeping. git check-ignore --no-index matches nested task Python paths and does not ignore retained JSON result evidence.
    3. node .agentplane/policy/check-routing.mjs passes; ap doctor has no errors and any existing warnings are recorded. git diff --check passes. This source-artifact-only cleanup requires no upstream execution or application regression run.
    4. Canonical verification records the separate cleanup implementation SHA; task finishes DONE and git status --short --untracked-files=all is clean.
  Verification: "Command: exact manifest-based Python inventory and diff assertions; git check-ignore --no-index; fixed-string rg consumer scan over package.json/scripts/docs/.gitignore; git diff --check. Result: pass. Evidence: 44 Python source deletions, zero remaining task Python sources or bytecode, no consumers outside historical artifacts, exactly 45 semantic paths, ignore rule matches Python helpers and preserves JSON result evidence. Scope: the exact deleted-paths.json manifest and .gitignore. Links: verification-results.json and deleted-paths.json. Command: node .agentplane/policy/check-routing.mjs. Result: pass (policy routing OK). Command: ap doctor. Result: pass, zero errors; two pre-existing warnings (managed shim readiness and historical F1JT8K close-commit reference). No upstream execution or application regression test is needed for deletion of unreferenced artifact sources. Separate cleanup commit and canonical verification follow."
  Rollback Plan: "If needed, revert this cleanup commit after explicit user authorization to restore artifact sources; no history rewrite is required."
  Findings: "The previous cleanup removed extracted native sources but retained generator and edit helper Python sources for reproducibility. The user has explicitly prohibited these artifact sources too. Historical references document checks already performed; they are not executable test dependencies. All 44 current on-disk Python files match the tracked set; no extra bytecode was discovered."
id_source: "generated"
---
## Summary

Remove Python source scripts from Agentplane task artifacts as explicitly requested by the user. This separate cleanup does not advance or resume the paused implementation goal.

## Scope

Delete the exact 44 tracked .py files currently under .agentplane/tasks. Add one .agentplane/tasks/**/*.py ignore rule in .gitignore. New task documentation and concise verification metadata are in scope. Preserve application code, project tests, results, hashes, historical DONE task READMEs, and Git history.

## Plan

Delete the exact 44 tracked Python source scripts under .agentplane/tasks and add a targeted .gitignore rule; keep result/hash evidence and historical DONE documentation unchanged. Verify file inventory, consumer absence, ignored source paths, precise diff, routing, doctor and clean final state; commit and close separately. User correction authorizes this cleanup; no upstream execution, network access or implementation-goal resumption.

## Verify Steps

1. Exact tracked/on-disk inventory contains 44 task .py sources before deletion; no outside consumer in package.json, scripts, docs or .gitignore references deleted generator entry points. After deletion, rg --files --hidden --no-ignore .agentplane/tasks with py/pyc/pyo filters returns no files.
2. git diff --name-status contains exactly the 44 inventoried deletions plus .gitignore and active task bookkeeping. git check-ignore --no-index matches nested task Python paths and does not ignore retained JSON result evidence.
3. node .agentplane/policy/check-routing.mjs passes; ap doctor has no errors and any existing warnings are recorded. git diff --check passes. This source-artifact-only cleanup requires no upstream execution or application regression run.
4. Canonical verification records the separate cleanup implementation SHA; task finishes DONE and git status --short --untracked-files=all is clean.

## Verification

Command: exact manifest-based Python inventory and diff assertions; git check-ignore --no-index; fixed-string rg consumer scan over package.json/scripts/docs/.gitignore; git diff --check. Result: pass. Evidence: 44 Python source deletions, zero remaining task Python sources or bytecode, no consumers outside historical artifacts, exactly 45 semantic paths, ignore rule matches Python helpers and preserves JSON result evidence. Scope: the exact deleted-paths.json manifest and .gitignore. Links: verification-results.json and deleted-paths.json. Command: node .agentplane/policy/check-routing.mjs. Result: pass (policy routing OK). Command: ap doctor. Result: pass, zero errors; two pre-existing warnings (managed shim readiness and historical F1JT8K close-commit reference). No upstream execution or application regression test is needed for deletion of unreferenced artifact sources. Separate cleanup commit and canonical verification follow.

## Rollback Plan

If needed, revert this cleanup commit after explicit user authorization to restore artifact sources; no history rewrite is required.

## Findings

The previous cleanup removed extracted native sources but retained generator and edit helper Python sources for reproducibility. The user has explicitly prohibited these artifact sources too. Historical references document checks already performed; they are not executable test dependencies. All 44 current on-disk Python files match the tracked set; no extra bytecode was discovered.
