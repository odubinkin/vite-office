---
id: "202609231540-4FPJYY"
title: "Restore Writer page descriptor and settings contracts"
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
  updated_at: "2026-09-23T15:41:18.864Z"
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
    body: "Start: Implement the approved upstream-shaped Writer page descriptor collection and relevant document settings contracts, adapt persistence/filter/UI boundaries, and verify focused behavior."
events:
  -
    type: "status"
    at: "2026-09-23T15:41:25.451Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: Implement the approved upstream-shaped Writer page descriptor collection and relevant document settings contracts, adapt persistence/filter/UI boundaries, and verify focused behavior."
doc_version: 3
doc_updated_at: "2026-09-23T15:41:25.451Z"
doc_updated_by: "CODER"
description: "Implement item 4 of docs/program/vite-office-upstream-parity-plan.md against pinned LibreOffice: page descriptor collection/identity/follow contracts and relevant document settings defaults, including current codec and ODT boundaries without legacy schema compatibility."
sections:
  Summary: "Restore the upstream-shaped Writer page descriptor collection and the relevant document settings contracts required by the currently implemented page, paragraph, list, import, export, cache, undo, and Page Style paths."
  Scope: "Modify the relevant implementation and focused tests under apps/office/src/sw/source/core/{layout,doc,undo}, apps/office/src/sw/source/filter/xml, apps/office/src/sw/source/uibase, and browser Page Style projections. Use the pinned vendor/libreoffice-reference source as the behavioral authority. Preserve twip units. If the canonical stored record changes, increment its schema version and reject older versions without compatibility code. Do not modify parity inventory machinery or add unrelated Writer/native features."
  Plan: "1. Trace pinned SwPageDesc/docdesc and DocumentSettingManager contracts used by the supported slice. 2. Implement descriptor collection, stable identities, follow links, upstream-derived defaults, and relevant setting identities/defaults. 3. Adapt document mutation, undo, ODT, cache codec, shell, and UI projections. 4. Add focused source-derived tests for blank and loaded documents, geometry/follow behavior, settings, style/list interaction, and round trips. 5. Run and record all verification checks."
  Verify Steps: |-
    - pnpm --filter @vite-office/office test -- --run
    - pnpm --filter @vite-office/office typecheck
    - pnpm --filter @vite-office/office build
    - ap doctor
    - node .agentplane/policy/check-routing.mjs
    - git status --short --untracked-files=all

    Acceptance: focused tests demonstrate multiple named page descriptors, identity-preserving master/follow links, applicable descriptor mutation, upstream-derived relevant DocumentSettingManager defaults, paragraph/list/style behavior, undo, current-schema cache round trip, and ODT round trip. Older stored schema versions are rejected.
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert only the implementation commit and the task close commit for 202609231540-4FPJYY. No stored-schema downgrade or compatibility path is provided."
  Findings: "No findings yet."
id_source: "generated"
---
## Summary

Restore the upstream-shaped Writer page descriptor collection and the relevant document settings contracts required by the currently implemented page, paragraph, list, import, export, cache, undo, and Page Style paths.

## Scope

Modify the relevant implementation and focused tests under apps/office/src/sw/source/core/{layout,doc,undo}, apps/office/src/sw/source/filter/xml, apps/office/src/sw/source/uibase, and browser Page Style projections. Use the pinned vendor/libreoffice-reference source as the behavioral authority. Preserve twip units. If the canonical stored record changes, increment its schema version and reject older versions without compatibility code. Do not modify parity inventory machinery or add unrelated Writer/native features.

## Plan

1. Trace pinned SwPageDesc/docdesc and DocumentSettingManager contracts used by the supported slice. 2. Implement descriptor collection, stable identities, follow links, upstream-derived defaults, and relevant setting identities/defaults. 3. Adapt document mutation, undo, ODT, cache codec, shell, and UI projections. 4. Add focused source-derived tests for blank and loaded documents, geometry/follow behavior, settings, style/list interaction, and round trips. 5. Run and record all verification checks.

## Verify Steps

- pnpm --filter @vite-office/office test -- --run
- pnpm --filter @vite-office/office typecheck
- pnpm --filter @vite-office/office build
- ap doctor
- node .agentplane/policy/check-routing.mjs
- git status --short --untracked-files=all

Acceptance: focused tests demonstrate multiple named page descriptors, identity-preserving master/follow links, applicable descriptor mutation, upstream-derived relevant DocumentSettingManager defaults, paragraph/list/style behavior, undo, current-schema cache round trip, and ODT round trip. Older stored schema versions are rejected.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert only the implementation commit and the task close commit for 202609231540-4FPJYY. No stored-schema downgrade or compatibility path is provided.

## Findings

No findings yet.
