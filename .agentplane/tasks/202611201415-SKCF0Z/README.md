---
id: "202611201415-SKCF0Z"
title: "Align Writer ODT table-cell text styles"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 5
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify:
  - "Run office typecheck, scoped Prettier and ESLint, dependency guard, git diff --check, ap doctor and policy routing."
  - "Run related Writer ODT style, table and Worker suites and shared xmloff tests with fixture comparison."
  - "Run the tenth full regression using complete application coverage, tooling, inventory coverage and all Chromium projects on the production build. Retain existing gates and rerun recoverable failures."
plan_approval:
  state: "approved"
  updated_at: "2026-11-20T14:15:12.227Z"
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
    body: "Start: Align Writer ODT table-cell text styles. Guided shortcut created the task, approved the plan, and entered execution."
events:
  -
    type: "status"
    at: "2026-11-20T14:15:12.229Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: Align Writer ODT table-cell text styles. Guided shortcut created the task, approved the plan, and entered execution."
doc_version: 3
doc_updated_at: "2026-11-20T14:15:36.081Z"
doc_updated_by: "CODER"
description: "Port automatic table-cell paragraph and character style ownership, temporary cell paragraph defaults and string-value style handling in Writer ODT. Validate native cell and paragraph property precedence, nested/repeated content, package and Worker round-trips, and the scheduled tenth full regression."
sections:
  Summary: |-
    Align Writer ODT table-cell text styles

    Port automatic table-cell paragraph and character style ownership, temporary cell paragraph defaults and string-value style handling in Writer ODT. Validate native cell and paragraph property precedence, nested/repeated content, package and Worker round-trips, and the scheduled tenth full regression.
  Scope: |-
    - In scope: Port automatic table-cell paragraph and character style ownership, temporary cell paragraph defaults and string-value style handling in Writer ODT. Validate native cell and paragraph property precedence, nested/repeated content, package and Worker round-trips, and the scheduled tenth full regression.
    - Out of scope: unrelated refactors not required for "Align Writer ODT table-cell text styles".
  Plan: "Read pinned Writer item-set style, table-cell section and xmloff paragraph import/export contracts. Give automatic table-cell text children native paragraph style ownership separate from box item properties. Apply the scoped cell style before paragraph formatting without disturbing numbering, and apply the native string-value paragraph path. Preserve original covered/repeated/nested semantics and existing serialization contracts. Replay native fixtures and document suspected original behavior. Run focused Writer and shared suites, static checks and the scheduled full Office, tooling, inventory and Chromium regression. Allow related regression repairs within ODF or observed verification scope."
  Verify Steps: "1. Run scoped Writer ODT filter, table styles, and Worker suites and shared xmloff import suites. Replay fdo60842.odt and the pinned fdo62147 fixture if present. Compare explicit cell text and paragraph overrides, repeat and nested style scoping, list state, and canonical paragraph export. 2. Run office typecheck, scoped Prettier and ESLint, dependency guard, git diff --check, ap doctor and routing. 3. Run npm run test:coverage --workspace @vite-office/office -- --maxWorkers 4, npm run test:tooling, npm run test:inventory:coverage and npm run test:e2e for the tenth checkpoint. Preserve existing coverage gates and retry recoverable failures."
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

Align Writer ODT table-cell text styles

Port automatic table-cell paragraph and character style ownership, temporary cell paragraph defaults and string-value style handling in Writer ODT. Validate native cell and paragraph property precedence, nested/repeated content, package and Worker round-trips, and the scheduled tenth full regression.

## Scope

- In scope: Port automatic table-cell paragraph and character style ownership, temporary cell paragraph defaults and string-value style handling in Writer ODT. Validate native cell and paragraph property precedence, nested/repeated content, package and Worker round-trips, and the scheduled tenth full regression.
- Out of scope: unrelated refactors not required for "Align Writer ODT table-cell text styles".

## Plan

Read pinned Writer item-set style, table-cell section and xmloff paragraph import/export contracts. Give automatic table-cell text children native paragraph style ownership separate from box item properties. Apply the scoped cell style before paragraph formatting without disturbing numbering, and apply the native string-value paragraph path. Preserve original covered/repeated/nested semantics and existing serialization contracts. Replay native fixtures and document suspected original behavior. Run focused Writer and shared suites, static checks and the scheduled full Office, tooling, inventory and Chromium regression. Allow related regression repairs within ODF or observed verification scope.

## Verify Steps

1. Run scoped Writer ODT filter, table styles, and Worker suites and shared xmloff import suites. Replay fdo60842.odt and the pinned fdo62147 fixture if present. Compare explicit cell text and paragraph overrides, repeat and nested style scoping, list state, and canonical paragraph export. 2. Run office typecheck, scoped Prettier and ESLint, dependency guard, git diff --check, ap doctor and routing. 3. Run npm run test:coverage --workspace @vite-office/office -- --maxWorkers 4, npm run test:tooling, npm run test:inventory:coverage and npm run test:e2e for the tenth checkpoint. Preserve existing coverage gates and retry recoverable failures.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert task-related commit(s).
- Re-run required checks to confirm rollback safety.

## Findings
