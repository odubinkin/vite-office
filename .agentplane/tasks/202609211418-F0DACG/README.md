---
id: "202609211418-F0DACG"
title: "Implement Writer P1 upstream parity refactor"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 9
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-09-21T14:19:30.375Z"
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
    at: "2026-09-21T14:19:45.542Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: continue direct-mode task in current checkout."
doc_version: 3
doc_updated_at: "2026-09-21T14:19:45.542Z"
doc_updated_by: "CODER"
description: "Implement P1-1 through P1-6 from docs/program/vite-office-upstream-parity-plan.md against the pinned LibreOffice baseline. Preserve the existing inventory model while filling records accurately; do not add backward compatibility for changed persisted document schemas."
sections:
  Summary: "Refactor the supported Writer slice for P1-1 through P1-6 so mutation, shell, numbering, lifecycle, worker/storage, and ODT responsibilities follow the pinned LibreOffice ownership and contracts."
  Scope: "In scope: DocumentContentOperationsManager mutation ownership and range-based undo; upstream-shaped Writer shell and command partitioning; the exact currently supported SwNumRule/SwNumFormat subset; SfxObjectShell/SfxMedium-centered lifecycle; separate durable recovery, worker-transfer, and live filter contracts; property-level ODT behavior and errors; accurate updates to the existing runtime inventory model. Preserve browser adapters at explicit boundaries. Out of scope: expanding the P0-1 inventory mechanism, unsupported Writer feature families, other suite applications, and compatibility loading for superseded persisted schemas."
  Plan: "Implement approved P1-1 through P1-6 in dependency order: canonical mutation ownership; shell/command decomposition; upstream-shaped numbering subset; Sfx-centered lifecycle; separate durable/worker/filter contracts; granular ODT contracts; then inventory updates and full verification."
  Verify Steps: "1. Run targeted Vitest suites for core document operations, Writer shells/commands, undo, numbering, Sfx lifecycle/medium, storage/recovery codecs, worker protocol, and ODT import/export. 2. Run npm run verify. 3. Run ap doctor. 4. Run node .agentplane/policy/check-routing.mjs. 5. Confirm git status --short --untracked-files=all contains only intentional task changes plus the pre-existing modified task README outside this task."
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert only commits and files attributed to task 202609211418-F0DACG. Persisted schema compatibility is intentionally not retained; rollback restores the prior schema and implementation together."
  Findings: ""
id_source: "generated"
---
## Summary

Refactor the supported Writer slice for P1-1 through P1-6 so mutation, shell, numbering, lifecycle, worker/storage, and ODT responsibilities follow the pinned LibreOffice ownership and contracts.

## Scope

In scope: DocumentContentOperationsManager mutation ownership and range-based undo; upstream-shaped Writer shell and command partitioning; the exact currently supported SwNumRule/SwNumFormat subset; SfxObjectShell/SfxMedium-centered lifecycle; separate durable recovery, worker-transfer, and live filter contracts; property-level ODT behavior and errors; accurate updates to the existing runtime inventory model. Preserve browser adapters at explicit boundaries. Out of scope: expanding the P0-1 inventory mechanism, unsupported Writer feature families, other suite applications, and compatibility loading for superseded persisted schemas.

## Plan

Implement approved P1-1 through P1-6 in dependency order: canonical mutation ownership; shell/command decomposition; upstream-shaped numbering subset; Sfx-centered lifecycle; separate durable/worker/filter contracts; granular ODT contracts; then inventory updates and full verification.

## Verify Steps

1. Run targeted Vitest suites for core document operations, Writer shells/commands, undo, numbering, Sfx lifecycle/medium, storage/recovery codecs, worker protocol, and ODT import/export. 2. Run npm run verify. 3. Run ap doctor. 4. Run node .agentplane/policy/check-routing.mjs. 5. Confirm git status --short --untracked-files=all contains only intentional task changes plus the pre-existing modified task README outside this task.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert only commits and files attributed to task 202609211418-F0DACG. Persisted schema compatibility is intentionally not retained; rollback restores the prior schema and implementation together.

## Findings
