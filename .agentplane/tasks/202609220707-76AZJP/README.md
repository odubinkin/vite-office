---
id: "202609220707-76AZJP"
title: "Converge Sfx command architecture for P1"
status: "DOING"
priority: "high"
owner: "CODER"
revision: 5
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
  - "parity"
  - "writer"
task_kind: "code"
mutation_scope: "code"
blueprint_request: "code.direct"
verify:
  - "npm run check:writer-resources && npm run check:dependencies && npm run check:source-provenance && npm run inventory:parity"
  - "npm run format:check && npm run lint && npm run typecheck && npm run check:file-size && git diff --check"
  - "npm run test:coverage"
plan_approval:
  state: "approved"
  updated_at: "2026-09-22T07:09:53.625Z"
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
    body: "Start: continue direct-mode task in current checkout."
events:
  -
    type: "status"
    at: "2026-09-22T07:10:02.744Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: continue direct-mode task in current checkout."
doc_version: 3
doc_updated_at: "2026-09-22T07:10:02.744Z"
doc_updated_by: "CODER"
description: "Implement P1.1-P1.3 from docs/program/vite-office-upstream-parity-plan.md: port bounded SfxSlot and SfxInterface metadata from pinned LibreOffice, decompose dispatcher responsibilities, and remove Writer registry glue."
sections:
  Summary: |-
    Converge Sfx command architecture for P1

    Implement P1.1-P1.3 from docs/program/vite-office-upstream-parity-plan.md: port bounded SfxSlot and SfxInterface metadata from pinned LibreOffice, decompose dispatcher responsibilities, and remove Writer registry glue.
  Scope: |-
    - In scope: Implement P1.1-P1.3 from docs/program/vite-office-upstream-parity-plan.md: port bounded SfxSlot and SfxInterface metadata from pinned LibreOffice, decompose dispatcher responsibilities, and remove Writer registry glue.
    - Out of scope: unrelated refactors not required for "Converge Sfx command architecture for P1".
  Plan: |-
    1. Compare the supported local command surface with pinned SfxSlot, SfxInterface, SfxShell, SfxDispatcher, SfxRequest, SfxBindings, SDI, HRC, and XCU owners.
    2. Add bounded upstream-shaped slot/interface modules and generate Writer metadata from pinned resources.
    3. Move request conversion, binding state, accelerators, and browser async observation to their owning modules; reduce dispatch.ts to stack, lookup, and execution.
    4. Move Execute/GetState behavior into concrete Writer shells and delete writercommands.ts plus duplicate list-shell metadata assembly.
    5. Update affected inventory/provenance/docs and verify shell shadowing, request items, command state, browser extension IDs, and source boundaries.
  Verify Steps: |-
    1. Run focused Sfx/Writer command tests. Expected: generated slot/interface metadata, shell shadowing, request-item execution, binding invalidation, shortcuts, and async browser observation pass.
    2. Run npm run test:coverage. Expected: all application tests pass with required coverage.
    3. Run npm run check:writer-resources && npm run check:dependencies && npm run check:source-provenance && npm run inventory:parity. Expected: no synthetic upstream slot, browser/core dependency, stale source owner, or parity evidence failure.
    4. Run npm run format:check && npm run lint && npm run typecheck && npm run check:file-size && git diff --check. Expected: static and repository hygiene checks pass.
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

Converge Sfx command architecture for P1

Implement P1.1-P1.3 from docs/program/vite-office-upstream-parity-plan.md: port bounded SfxSlot and SfxInterface metadata from pinned LibreOffice, decompose dispatcher responsibilities, and remove Writer registry glue.

## Scope

- In scope: Implement P1.1-P1.3 from docs/program/vite-office-upstream-parity-plan.md: port bounded SfxSlot and SfxInterface metadata from pinned LibreOffice, decompose dispatcher responsibilities, and remove Writer registry glue.
- Out of scope: unrelated refactors not required for "Converge Sfx command architecture for P1".

## Plan

1. Compare the supported local command surface with pinned SfxSlot, SfxInterface, SfxShell, SfxDispatcher, SfxRequest, SfxBindings, SDI, HRC, and XCU owners.
2. Add bounded upstream-shaped slot/interface modules and generate Writer metadata from pinned resources.
3. Move request conversion, binding state, accelerators, and browser async observation to their owning modules; reduce dispatch.ts to stack, lookup, and execution.
4. Move Execute/GetState behavior into concrete Writer shells and delete writercommands.ts plus duplicate list-shell metadata assembly.
5. Update affected inventory/provenance/docs and verify shell shadowing, request items, command state, browser extension IDs, and source boundaries.

## Verify Steps

1. Run focused Sfx/Writer command tests. Expected: generated slot/interface metadata, shell shadowing, request-item execution, binding invalidation, shortcuts, and async browser observation pass.
2. Run npm run test:coverage. Expected: all application tests pass with required coverage.
3. Run npm run check:writer-resources && npm run check:dependencies && npm run check:source-provenance && npm run inventory:parity. Expected: no synthetic upstream slot, browser/core dependency, stale source owner, or parity evidence failure.
4. Run npm run format:check && npm run lint && npm run typecheck && npm run check:file-size && git diff --check. Expected: static and repository hygiene checks pass.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert task-related commit(s).
- Re-run required checks to confirm rollback safety.

## Findings
