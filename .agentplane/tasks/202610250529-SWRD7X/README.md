---
id: "202610250529-SWRD7X"
title: "Integrate Writer Calc and main and consolidate vendor"
status: "DOING"
priority: "high"
owner: "CODER"
revision: 5
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify:
  - "Check remote branch equality, main ancestry, clean working trees and vendor content preservation and symlinks across all three checkouts"
  - "ap doctor"
  - "node .agentplane/policy/check-routing.mjs"
  - "npm run verify"
plan_approval:
  state: "approved"
  updated_at: "2026-10-25T05:30:08.435Z"
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
    body: "Start: Execute the user-approved branch integration, complete verification and shared vendor consolidation across the three named checkouts."
events:
  -
    type: "status"
    at: "2026-10-25T05:30:08.866Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: Execute the user-approved branch integration, complete verification and shared vendor consolidation across the three named checkouts."
doc_version: 3
doc_updated_at: "2026-10-25T05:30:08.866Z"
doc_updated_by: "CODER"
description: "Execute the user-approved nine-step branch synchronization across vite-office, vite-office-writer and vite-office-calc; resolve merge conflicts, run and repair the complete verification suite, publish all three branches, and consolidate vendor content in main with ignored directory symlinks in the feature checkouts."
sections:
  Summary: "Integrate and publish all current main, Writer and Calc work and consolidate local vendor dependencies."
  Scope: "The three user-named checkouts, their Git branches and remote refs, conflict resolutions and verification repairs, .gitignore, vendor content and directory symlinks. Preserve all existing commits and local dependency content. No force pushes or history rewriting."
  Plan: "Execute the user-approved synchronization and vendor-consolidation plan documented in the task README, preserving all commits and dependency content, with full npm verification before publishing main and reverse-merging it into writer and calc."
  Verify Steps: |-
    - Run npm run verify: formatting, lint, both TypeScript checks, module boundaries, Writer and Calc resource checks, tooling tests, application and inventory coverage, all browser projects, static build, JSDoc, file size, source tree/provenance and inventory invariants/parity.
    - Run ap doctor and node .agentplane/policy/check-routing.mjs.
    - Verify git diff --check, no unmerged entries, no tracked vendor files, and ignored vendor directories/symlinks.
    - Verify every local branch equals its remote tip and main is an ancestor of writer and calc; inspect git status --short --untracked-files=all in each checkout.
    - Inventory vendor sources before changing links; compare differing entries and confirm all preserved contents remain accessible from each checkout.
  Verification: "Pending execution."
  Rollback Plan: "Record initial branch hashes in Findings. Abort an incomplete merge if needed. Preserve vendor content until copy verification succeeds. Use explicit follow-up commits to reverse integration changes; never reset published history."
  Findings: "User explicitly authorized local edits, merge conflict resolution, test repairs, network fetch/push, outside-primary access to the two named sibling checkouts and vendor consolidation. Initial main: cddbdb991; writer: ffa444835; calc: 9f6656f18. All tracked working trees are clean. Calc has existing untracked .DS_Store and output/.DS_Store files; preserve them. Main and Calc reference Boost via a symlink chain into Calc output, so vendor consolidation must materialize the dependency before removing the old links."
id_source: "generated"
---
## Summary

Integrate and publish all current main, Writer and Calc work and consolidate local vendor dependencies.

## Scope

The three user-named checkouts, their Git branches and remote refs, conflict resolutions and verification repairs, .gitignore, vendor content and directory symlinks. Preserve all existing commits and local dependency content. No force pushes or history rewriting.

## Plan

Execute the user-approved synchronization and vendor-consolidation plan documented in the task README, preserving all commits and dependency content, with full npm verification before publishing main and reverse-merging it into writer and calc.

## Verify Steps

- Run npm run verify: formatting, lint, both TypeScript checks, module boundaries, Writer and Calc resource checks, tooling tests, application and inventory coverage, all browser projects, static build, JSDoc, file size, source tree/provenance and inventory invariants/parity.
- Run ap doctor and node .agentplane/policy/check-routing.mjs.
- Verify git diff --check, no unmerged entries, no tracked vendor files, and ignored vendor directories/symlinks.
- Verify every local branch equals its remote tip and main is an ancestor of writer and calc; inspect git status --short --untracked-files=all in each checkout.
- Inventory vendor sources before changing links; compare differing entries and confirm all preserved contents remain accessible from each checkout.

## Verification

Pending execution.

## Rollback Plan

Record initial branch hashes in Findings. Abort an incomplete merge if needed. Preserve vendor content until copy verification succeeds. Use explicit follow-up commits to reverse integration changes; never reset published history.

## Findings

User explicitly authorized local edits, merge conflict resolution, test repairs, network fetch/push, outside-primary access to the two named sibling checkouts and vendor consolidation. Initial main: cddbdb991; writer: ffa444835; calc: 9f6656f18. All tracked working trees are clean. Calc has existing untracked .DS_Store and output/.DS_Store files; preserve them. Main and Calc reference Boost via a symlink chain into Calc output, so vendor consolidation must materialize the dependency before removing the old links.
