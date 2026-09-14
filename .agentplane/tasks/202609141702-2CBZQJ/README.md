---
id: "202609141702-2CBZQJ"
title: "Implement Workstream 7 lazy Writer lifecycle"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 8
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
  - "frontend"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-09-14T17:02:31.976Z"
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
    body: "Start: implement approved Workstream 7 lazy Writer lifecycle, extracted view services, and explicit recovery choice using the pinned upstream baseline."
events:
  -
    type: "status"
    at: "2026-09-14T17:02:39.963Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implement approved Workstream 7 lazy Writer lifecycle, extracted view services, and explicit recovery choice using the pinned upstream baseline."
doc_version: 3
doc_updated_at: "2026-09-14T17:02:39.963Z"
doc_updated_by: "CODER"
description: "Split SwView browser workflow services, make Writer sessions lazy/disposable, and add explicit recovery presentation policy based on the pinned LibreOffice baseline."
sections:
  Summary: "Implement Workstream 7 from docs/program/vite-office-upstream-parity-plan.md: reduce SwView responsibilities, lazily own Writer sessions, and require an explicit recovery choice."
  Scope: "Modify Writer view/session composition, framework module lifecycle, browser workflow and recovery presenters, focused tests, and parity/provenance records. Preserve current Writer behavior and follow the pinned LibreOffice 26.8.0.2 ownership model where browser constraints permit. No legacy persisted-model compatibility layer."
  Plan: "1. Inspect pinned LibreOffice view, module, desktop, and AutoRecovery ownership and map bounded local responsibilities. 2. Extract browser file/export, clipboard, local-storage, chrome-preference, and typed operation-status services from SwView. 3. Change the Writer module factory and framework workspace mounting so sessions are created on Writer activation and disposed on close/unmount under an explicit retention policy. 4. Add an explicit recovery-candidate presentation controller and restore/discard/continue UI, preserving save/recovery generations and tolerating corrupt candidates. 5. Update inventories/provenance and add focused lifecycle, controller, recovery, and regression tests. 6. Run the declared verification suite and record evidence."
  Verify Steps: |-
    - npm run test:coverage --workspace @vite-office/office -- --runInBand (or the repository-supported equivalent without --runInBand if Vitest rejects it): all Writer/framework unit tests pass, including lazy lifecycle, disposal, controller boundaries, and recovery choice coverage.
    - npm run typecheck: TypeScript checks pass.
    - npm run build: production build succeeds.
    - npm run check:dependencies: module-boundary validation passes.
    - npm run check:source-provenance: provenance validation passes.
    - npm run check:source-tree: LibreOffice-aligned source-tree validation passes.
    - node .agentplane/policy/check-routing.mjs: routing policy passes.
    - ap doctor: repository/task workflow diagnostics pass.
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert only the task commit produced for 202609141702-2CBZQJ. The prior eager Writer session factory and SwView-owned browser workflows are restored together; no storage migration or compatibility cleanup is required."
  Findings: ""
id_source: "generated"
---
## Summary

Implement Workstream 7 from docs/program/vite-office-upstream-parity-plan.md: reduce SwView responsibilities, lazily own Writer sessions, and require an explicit recovery choice.

## Scope

Modify Writer view/session composition, framework module lifecycle, browser workflow and recovery presenters, focused tests, and parity/provenance records. Preserve current Writer behavior and follow the pinned LibreOffice 26.8.0.2 ownership model where browser constraints permit. No legacy persisted-model compatibility layer.

## Plan

1. Inspect pinned LibreOffice view, module, desktop, and AutoRecovery ownership and map bounded local responsibilities. 2. Extract browser file/export, clipboard, local-storage, chrome-preference, and typed operation-status services from SwView. 3. Change the Writer module factory and framework workspace mounting so sessions are created on Writer activation and disposed on close/unmount under an explicit retention policy. 4. Add an explicit recovery-candidate presentation controller and restore/discard/continue UI, preserving save/recovery generations and tolerating corrupt candidates. 5. Update inventories/provenance and add focused lifecycle, controller, recovery, and regression tests. 6. Run the declared verification suite and record evidence.

## Verify Steps

- npm run test:coverage --workspace @vite-office/office -- --runInBand (or the repository-supported equivalent without --runInBand if Vitest rejects it): all Writer/framework unit tests pass, including lazy lifecycle, disposal, controller boundaries, and recovery choice coverage.
- npm run typecheck: TypeScript checks pass.
- npm run build: production build succeeds.
- npm run check:dependencies: module-boundary validation passes.
- npm run check:source-provenance: provenance validation passes.
- npm run check:source-tree: LibreOffice-aligned source-tree validation passes.
- node .agentplane/policy/check-routing.mjs: routing policy passes.
- ap doctor: repository/task workflow diagnostics pass.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert only the task commit produced for 202609141702-2CBZQJ. The prior eager Writer session factory and SwView-owned browser workflows are restored together; no storage migration or compatibility cleanup is required.

## Findings
