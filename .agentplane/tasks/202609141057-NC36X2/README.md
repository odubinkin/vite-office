---
id: "202609141057-NC36X2"
title: "Document upstream parity refactoring plan"
status: "DOING"
priority: "high"
owner: "DOCS"
revision: 10
origin:
  system: "manual"
depends_on: []
tags:
  - "docs"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-09-14T10:57:44.556Z"
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
    author: "DOCS"
    body: "Start: continue direct-mode task in current checkout."
events:
  -
    type: "status"
    at: "2026-09-14T10:57:59.451Z"
    author: "DOCS"
    from: "TODO"
    to: "DOING"
    note: "Start: continue direct-mode task in current checkout."
doc_version: 3
doc_updated_at: "2026-09-14T10:57:59.451Z"
doc_updated_by: "DOCS"
description: "Create a detailed, evidence-based refactoring plan for the implemented Vite Office scope, covering inventory corrections, unjustified LibreOffice architecture divergences, UI/browser adapter cleanup, sequencing, acceptance criteria, risks, and verification."
sections:
  Summary: "Produce the canonical detailed refactoring plan for bringing the currently implemented browser office scope closer to pinned LibreOffice architecture and data-model parity."
  Scope: "In scope: docs/program/vite-office-upstream-parity-plan.md and task traceability artifacts. The plan covers findings already confirmed against the local pinned LibreOffice reference. Out of scope: implementation changes, policy changes, dependency updates, network access, and upstream baseline updates."
  Plan: "1. Consolidate audit evidence and current implementation inventory. 2. Define target LibreOffice-aligned architecture and explicit browser exceptions. 3. Specify phased refactoring workstreams for inventory, core model, lifecycle, command routing, UI/DOM editing, xmloff, storage, and verification. 4. Add dependencies, acceptance criteria, migration safeguards, and prioritization. 5. Validate document links and repository docs gates."
  Verify Steps: "1. Run a local script to validate every repository-relative Markdown link in docs/program/vite-office-upstream-parity-plan.md. 2. Run npm run check:docs. 3. Run node .agentplane/policy/check-routing.mjs. 4. Run ap doctor. 5. Review git diff --check and git status --short --untracked-files=all."
  Verification: "Pending implementation and execution of the approved verification steps."
  Rollback Plan: "Revert only docs/program/vite-office-upstream-parity-plan.md and the task-local state generated for this task if the document is rejected; no implementation or policy files are in scope."
  Findings: "The audit found false-positive provenance mappings, stale parity records, duplicated immutable command adapters, missing registered position correction and model notifications, browser lifecycle leakage into SwDoc, an eager Writer session, an oversized UI controller, and a DOM-like xmloff intermediate tree."
id_source: "generated"
---
## Summary

Produce the canonical detailed refactoring plan for bringing the currently implemented browser office scope closer to pinned LibreOffice architecture and data-model parity.

## Scope

In scope: docs/program/vite-office-upstream-parity-plan.md and task traceability artifacts. The plan covers findings already confirmed against the local pinned LibreOffice reference. Out of scope: implementation changes, policy changes, dependency updates, network access, and upstream baseline updates.

## Plan

1. Consolidate audit evidence and current implementation inventory. 2. Define target LibreOffice-aligned architecture and explicit browser exceptions. 3. Specify phased refactoring workstreams for inventory, core model, lifecycle, command routing, UI/DOM editing, xmloff, storage, and verification. 4. Add dependencies, acceptance criteria, migration safeguards, and prioritization. 5. Validate document links and repository docs gates.

## Verify Steps

1. Run a local script to validate every repository-relative Markdown link in docs/program/vite-office-upstream-parity-plan.md. 2. Run npm run check:docs. 3. Run node .agentplane/policy/check-routing.mjs. 4. Run ap doctor. 5. Review git diff --check and git status --short --untracked-files=all.

## Verification

Pending implementation and execution of the approved verification steps.

## Rollback Plan

Revert only docs/program/vite-office-upstream-parity-plan.md and the task-local state generated for this task if the document is rejected; no implementation or policy files are in scope.

## Findings

The audit found false-positive provenance mappings, stale parity records, duplicated immutable command adapters, missing registered position correction and model notifications, browser lifecycle leakage into SwDoc, an eager Writer session, an oversized UI controller, and a DOM-like xmloff intermediate tree.
