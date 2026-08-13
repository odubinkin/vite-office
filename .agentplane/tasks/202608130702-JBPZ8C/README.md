---
id: "202608130702-JBPZ8C"
title: "Enforce provenance for every current source module"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 5
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-08-13T07:02:22.697Z"
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
    body: "Start: Building an enforceable complete source-provenance manifest for the current browser source tree."
events:
  -
    type: "status"
    at: "2026-08-13T07:02:28.470Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: Building an enforceable complete source-provenance manifest for the current browser source tree."
doc_version: 3
doc_updated_at: "2026-08-13T07:02:28.470Z"
doc_updated_by: "CODER"
description: "Create a complete, machine-validated source provenance manifest for every authored runtime module in the current browser project. Each entry must cite a concrete LibreOffice source/configuration path or document a browser-only exception; extend the source-tree gate and documentation so later feature tasks cannot introduce unmapped module names or hierarchy."
sections:
  Summary: |-
    Enforce provenance for every current source module

    Create a complete, machine-validated source provenance manifest for every authored runtime module in the current browser project. Each entry must cite a concrete LibreOffice source/configuration path or document a browser-only exception; extend the source-tree gate and documentation so later feature tasks cannot introduce unmapped module names or hierarchy.
  Scope: |-
    - In scope: Create a complete, machine-validated source provenance manifest for every authored runtime module in the current browser project. Each entry must cite a concrete LibreOffice source/configuration path or document a browser-only exception; extend the source-tree gate and documentation so later feature tasks cannot introduce unmapped module names or hierarchy.
    - Out of scope: unrelated refactors not required for "Enforce provenance for every current source module".
  Plan: "1. Inventory every authored non-test runtime TypeScript/TSX module under apps/office/src and identify its direct pinned LibreOffice counterpart or a browser-only exception. 2. Add a machine-readable provenance manifest that records local path, status, concrete upstream path when applicable, and a detailed browser-environment rationale otherwise. 3. Add a deterministic source-provenance validator and tests, integrate it into package checks, and make it reject omitted, stale, non-existent, or undocumented mappings. 4. Normalize any clearly mistaken existing source-tree claim discovered by the inventory, but defer actual module moves to bounded follow-up tasks. 5. Document the manifest contract, direct mapping versus exception semantics, and the initial current-project coverage. 6. Run focused validator tests plus formatting, lint, typecheck, JSDoc, file-size, source-tree, parity, doctor, and routing checks; defer full suite under the approved ten-task cadence."
  Verify Steps: "1. Run focused provenance-validator tests. Expected: every current non-test runtime module is represented exactly once, with a valid pinned upstream path or a detailed browser-only exception, and malformed manifests fail. 2. Run npm run check:source-provenance. Expected: deterministic success over the current authored runtime tree and pinned libreoffice-26.8.0.2 checkout. 3. Run npm run format:check && npm run lint && npm run typecheck && npm run check:docs && npm run check:file-size && npm run check:source-tree && git diff --check && ap doctor && node .agentplane/policy/check-routing.mjs. Expected: all pass. 4. Run npm run inventory:parity -- --baseline docs/program/libreoffice-baseline.json --mappings docs/program/parity/writer-command-slice.json --local-root . --upstream-root vendor/libreoffice-reference. Expected: no evidence exceptions. 5. Defer npm run verify, static smoke, inventory coverage, and full browser matrix under the user-approved ten-task cadence; record residual risk."
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: |-
    - Revert task-related commit(s).
    - Re-run required checks to confirm rollback safety.
  Findings: ""
id_source: "generated"
---
## Summary

Enforce provenance for every current source module

Create a complete, machine-validated source provenance manifest for every authored runtime module in the current browser project. Each entry must cite a concrete LibreOffice source/configuration path or document a browser-only exception; extend the source-tree gate and documentation so later feature tasks cannot introduce unmapped module names or hierarchy.

## Scope

- In scope: Create a complete, machine-validated source provenance manifest for every authored runtime module in the current browser project. Each entry must cite a concrete LibreOffice source/configuration path or document a browser-only exception; extend the source-tree gate and documentation so later feature tasks cannot introduce unmapped module names or hierarchy.
- Out of scope: unrelated refactors not required for "Enforce provenance for every current source module".

## Plan

1. Inventory every authored non-test runtime TypeScript/TSX module under apps/office/src and identify its direct pinned LibreOffice counterpart or a browser-only exception. 2. Add a machine-readable provenance manifest that records local path, status, concrete upstream path when applicable, and a detailed browser-environment rationale otherwise. 3. Add a deterministic source-provenance validator and tests, integrate it into package checks, and make it reject omitted, stale, non-existent, or undocumented mappings. 4. Normalize any clearly mistaken existing source-tree claim discovered by the inventory, but defer actual module moves to bounded follow-up tasks. 5. Document the manifest contract, direct mapping versus exception semantics, and the initial current-project coverage. 6. Run focused validator tests plus formatting, lint, typecheck, JSDoc, file-size, source-tree, parity, doctor, and routing checks; defer full suite under the approved ten-task cadence.

## Verify Steps

1. Run focused provenance-validator tests. Expected: every current non-test runtime module is represented exactly once, with a valid pinned upstream path or a detailed browser-only exception, and malformed manifests fail. 2. Run npm run check:source-provenance. Expected: deterministic success over the current authored runtime tree and pinned libreoffice-26.8.0.2 checkout. 3. Run npm run format:check && npm run lint && npm run typecheck && npm run check:docs && npm run check:file-size && npm run check:source-tree && git diff --check && ap doctor && node .agentplane/policy/check-routing.mjs. Expected: all pass. 4. Run npm run inventory:parity -- --baseline docs/program/libreoffice-baseline.json --mappings docs/program/parity/writer-command-slice.json --local-root . --upstream-root vendor/libreoffice-reference. Expected: no evidence exceptions. 5. Defer npm run verify, static smoke, inventory coverage, and full browser matrix under the user-approved ten-task cadence; record residual risk.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert task-related commit(s).
- Re-run required checks to confirm rollback safety.

## Findings
