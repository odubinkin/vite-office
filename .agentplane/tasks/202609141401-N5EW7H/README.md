---
id: "202609141401-N5EW7H"
title: "Implement Workstream 3 medium and persistence parity"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 10
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
  - "frontend"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-09-14T14:02:27.521Z"
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
    body: "Start: Implement approved Workstream 3 medium normalization and shell-neutral persistence ports against pinned LibreOffice evidence."
events:
  -
    type: "status"
    at: "2026-09-14T14:02:32.951Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: Implement approved Workstream 3 medium normalization and shell-neutral persistence ports against pinned LibreOffice evidence."
doc_version: 3
doc_updated_at: "2026-09-14T14:02:32.951Z"
doc_updated_by: "CODER"
description: "Implement P3.1 and P3.2 from docs/program/vite-office-upstream-parity-plan.md against pinned LibreOffice baseline: normalize SfxMediumDescriptor and introduce shell-neutral primary/recovery/open/export ports while preserving current Writer behavior."
sections:
  Summary: "Implement Workstream 3 (P3.1 and P3.2) from the upstream parity plan against the pinned LibreOffice baseline, preserving existing Writer behavior."
  Scope: "Normalize the SfxMedium descriptor and construction variants; separate source and destination without lifecycle duplication; add narrow independently replaceable primary-save, recovery-save, open, and export ports; keep IndexedDB transactions, quotas, leases, and browser events in vcl/browser; update directly affected tests, provenance, inventory, and documentation. No feature expansion beyond Workstream 3."
  Plan: "1. Inspect pinned LibreOffice SfxMedium construction, naming, source/destination, read-only, filter, and transfer semantics and map only the bounded browser-relevant invariants. 2. Replace the broad partial medium input with discriminated construction inputs and one authoritative lifecycle representation; remove duplicate operation state and avoid reconstruction on GetMedium reads. 3. Define narrow shell-neutral ports for primary save, recovery save, open, and export and adapt Writer shell/session composition to use them. 4. Retain IndexedDB-specific transaction, quota, lease, and event mechanics under vcl/browser and ensure primary/recovery ports are independently injectable. 5. Add tests for invalid combinations, stable medium identity/read behavior, distinct source/destination, independent adapters, versioned serialization, and failure atomicity. 6. Update directly affected provenance/inventory/docs and run the complete verification contract."
  Verify Steps: |-
    1. Run targeted Vitest suites for sfx2 docfile, Writer doc shell/session and browser storage/recovery. Expected: construction variants, independent ports, and failure atomicity pass.
    2. Run `npm run typecheck`. Expected: discriminated medium inputs and storage-port consumers compile without errors.
    3. Run `npm run check:dependencies && npm run check:source-provenance && npm run inventory:parity`. Expected: layer boundaries and pinned upstream evidence remain valid.
    4. Run `npm run verify`. Expected: formatting, lint, typecheck, dependency checks, unit/inventory coverage, E2E, static build, docs, file-size, source-tree, provenance, and parity all pass.
    5. Run `ap doctor` and `node .agentplane/policy/check-routing.mjs`. Expected: Agentplane repository and routing policy pass.
    6. Inspect `git status --short --untracked-files=all`. Expected: only intentional task artifacts and implementation changes exist before finish; final tracked state is clean after closure.
  Verification: "Pending implementation and execution of the approved Verify Steps."
  Rollback Plan: "Revert the task implementation commit and deterministic Agentplane close commit; no data migration or external state is involved."
  Findings: "No findings yet."
id_source: "generated"
---
## Summary

Implement Workstream 3 (P3.1 and P3.2) from the upstream parity plan against the pinned LibreOffice baseline, preserving existing Writer behavior.

## Scope

Normalize the SfxMedium descriptor and construction variants; separate source and destination without lifecycle duplication; add narrow independently replaceable primary-save, recovery-save, open, and export ports; keep IndexedDB transactions, quotas, leases, and browser events in vcl/browser; update directly affected tests, provenance, inventory, and documentation. No feature expansion beyond Workstream 3.

## Plan

1. Inspect pinned LibreOffice SfxMedium construction, naming, source/destination, read-only, filter, and transfer semantics and map only the bounded browser-relevant invariants. 2. Replace the broad partial medium input with discriminated construction inputs and one authoritative lifecycle representation; remove duplicate operation state and avoid reconstruction on GetMedium reads. 3. Define narrow shell-neutral ports for primary save, recovery save, open, and export and adapt Writer shell/session composition to use them. 4. Retain IndexedDB-specific transaction, quota, lease, and event mechanics under vcl/browser and ensure primary/recovery ports are independently injectable. 5. Add tests for invalid combinations, stable medium identity/read behavior, distinct source/destination, independent adapters, versioned serialization, and failure atomicity. 6. Update directly affected provenance/inventory/docs and run the complete verification contract.

## Verify Steps

1. Run targeted Vitest suites for sfx2 docfile, Writer doc shell/session and browser storage/recovery. Expected: construction variants, independent ports, and failure atomicity pass.
2. Run `npm run typecheck`. Expected: discriminated medium inputs and storage-port consumers compile without errors.
3. Run `npm run check:dependencies && npm run check:source-provenance && npm run inventory:parity`. Expected: layer boundaries and pinned upstream evidence remain valid.
4. Run `npm run verify`. Expected: formatting, lint, typecheck, dependency checks, unit/inventory coverage, E2E, static build, docs, file-size, source-tree, provenance, and parity all pass.
5. Run `ap doctor` and `node .agentplane/policy/check-routing.mjs`. Expected: Agentplane repository and routing policy pass.
6. Inspect `git status --short --untracked-files=all`. Expected: only intentional task artifacts and implementation changes exist before finish; final tracked state is clean after closure.

## Verification

Pending implementation and execution of the approved Verify Steps.

## Rollback Plan

Revert the task implementation commit and deterministic Agentplane close commit; no data migration or external state is involved.

## Findings

No findings yet.
