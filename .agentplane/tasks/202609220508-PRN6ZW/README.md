---
id: "202609220508-PRN6ZW"
title: "Close Writer parity ownership gaps"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 10
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-09-22T05:09:24.279Z"
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
    body: "Start: replace boundary run DTO mutation APIs, neutralize ODT filter worker types, strengthen ownership checks, and verify the complete repository contract."
events:
  -
    type: "status"
    at: "2026-09-22T05:09:32.000Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: replace boundary run DTO mutation APIs, neutralize ODT filter worker types, strengthen ownership checks, and verify the complete repository contract."
doc_version: 3
doc_updated_at: "2026-09-22T05:09:32.000Z"
doc_updated_by: "CODER"
description: "Remove boundary text-run DTOs from public Writer shell mutation APIs, make the ODT filter service worker-neutral, and enforce filter/browser ownership with negative tests."
sections:
  Summary: "Close the two non-P0-1 ownership gaps found in the Writer upstream parity audit."
  Scope: "Replace public Writer shell run-DTO mutation arguments with canonical SwTextFragment input and perform run conversion only at browser/filter transfer boundaries. Remove the sw/source/filter dependency on the framework worker protocol by defining filter-native error categories. Strengthen module-boundary enforcement and negative tests for protected filter-to-worker dependencies. Update required runtime inventory/provenance evidence. No P0-1 parity-pipeline redesign, product feature expansion, network action, or release action."
  Plan: "1. Trace all production and test callers of SwWrtShell.ReplaceRange and introduce a canonical fragment-based shell operation, keeping run conversion in transfer/browser adapters. 2. Define ODT filter error categories inside the neutral filter contract and adapt the browser worker protocol at sw/browser. 3. Extend ownership checks and tests so protected filter layers cannot import worker-protocol/browser concerns. 4. Update exact inventory/provenance records required by changed runtime files. 5. Run focused unit and architecture tests, then full npm run verify and AgentPlane policy checks."
  Verify Steps: "1. Run focused Vitest suites for Writer shell editing/paste/undo and ODT filter worker client/runtime. Expected: canonical fragment mutations preserve formatting, clipboard, undo, import, and export behavior. 2. Run module-boundary tests plus npm run check:dependencies. Expected: a writer-filter import of the framework worker protocol is rejected while approved neutral dependencies pass. 3. Run npm run check:source-provenance, npm run inventory:invariants, and npm run inventory:parity. Expected: changed runtime files remain exhaustively and truthfully classified. 4. Run npm run verify. Expected: format, lint, typecheck, dependency/resource checks, unit/inventory coverage, Playwright, static build, docs, file size, source tree, provenance, invariants, and parity all pass. 5. Run git diff --check, node .agentplane/policy/check-routing.mjs, ap doctor, and git status --short --untracked-files=all. Expected: no whitespace/policy/health failures and only intentional task-scope artifacts before finish."
  Verification: "Pending implementation and execution of the declared Verify Steps."
  Rollback Plan: "Revert the implementation and task-state commits, then rerun the focused architecture and Writer tests to confirm restoration."
  Findings: "Audit evidence: public Writer shell mutation accepts WriterTextRun boundary DTOs, and sw/source/filter imports framework worker-protocol types while the dependency checker does not reject that edge."
id_source: "generated"
---
## Summary

Close the two non-P0-1 ownership gaps found in the Writer upstream parity audit.

## Scope

Replace public Writer shell run-DTO mutation arguments with canonical SwTextFragment input and perform run conversion only at browser/filter transfer boundaries. Remove the sw/source/filter dependency on the framework worker protocol by defining filter-native error categories. Strengthen module-boundary enforcement and negative tests for protected filter-to-worker dependencies. Update required runtime inventory/provenance evidence. No P0-1 parity-pipeline redesign, product feature expansion, network action, or release action.

## Plan

1. Trace all production and test callers of SwWrtShell.ReplaceRange and introduce a canonical fragment-based shell operation, keeping run conversion in transfer/browser adapters. 2. Define ODT filter error categories inside the neutral filter contract and adapt the browser worker protocol at sw/browser. 3. Extend ownership checks and tests so protected filter layers cannot import worker-protocol/browser concerns. 4. Update exact inventory/provenance records required by changed runtime files. 5. Run focused unit and architecture tests, then full npm run verify and AgentPlane policy checks.

## Verify Steps

1. Run focused Vitest suites for Writer shell editing/paste/undo and ODT filter worker client/runtime. Expected: canonical fragment mutations preserve formatting, clipboard, undo, import, and export behavior. 2. Run module-boundary tests plus npm run check:dependencies. Expected: a writer-filter import of the framework worker protocol is rejected while approved neutral dependencies pass. 3. Run npm run check:source-provenance, npm run inventory:invariants, and npm run inventory:parity. Expected: changed runtime files remain exhaustively and truthfully classified. 4. Run npm run verify. Expected: format, lint, typecheck, dependency/resource checks, unit/inventory coverage, Playwright, static build, docs, file size, source tree, provenance, invariants, and parity all pass. 5. Run git diff --check, node .agentplane/policy/check-routing.mjs, ap doctor, and git status --short --untracked-files=all. Expected: no whitespace/policy/health failures and only intentional task-scope artifacts before finish.

## Verification

Pending implementation and execution of the declared Verify Steps.

## Rollback Plan

Revert the implementation and task-state commits, then rerun the focused architecture and Writer tests to confirm restoration.

## Findings

Audit evidence: public Writer shell mutation accepts WriterTextRun boundary DTOs, and sw/source/filter imports framework worker-protocol types while the dependency checker does not reject that edge.
