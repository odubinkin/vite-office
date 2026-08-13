---
id: "202608130525-JG88B2"
title: "Align the current source tree with LibreOffice-oriented feature layers"
status: "DOING"
priority: "high"
owner: "CODER"
revision: 7
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
task_kind: "code"
mutation_scope: "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-08-13T05:26:50.123Z"
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
    body: "Start: migrate the current application into documented LibreOffice-oriented browser feature layers before resuming the deferred Writer list capability."
events:
  -
    type: "status"
    at: "2026-08-13T05:26:50.470Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: migrate the current application into documented LibreOffice-oriented browser feature layers before resuming the deferred Writer list capability."
doc_version: 3
doc_updated_at: "2026-08-13T05:26:50.470Z"
doc_updated_by: "CODER"
description: "Reorganize the existing static browser application into explicit app, shared, and Writer feature layers; decompose oversized Writer editor behavior; preserve all behavior, tests, documentation, and parity links so later Writer capabilities can extend stable LibreOffice-aligned boundaries."
sections:
  Summary: |-
    Align the current source tree with LibreOffice-oriented feature layers

    Reorganize the existing static browser application into explicit app, shared, and Writer feature layers; decompose oversized Writer editor behavior; preserve all behavior, tests, documentation, and parity links so later Writer capabilities can extend stable LibreOffice-aligned boundaries.
  Scope: |-
    - In scope: establish the browser-native source layers `app`, `shared`, `platform`, and `features/writer`, with a documented relation to LibreOffice shell/shared/Writer boundaries; migrate every existing Writer and shared module into the appropriate layer without behavior changes.
    - In scope: decompose the oversized Writer document editor into independently testable rendering, selection/caret, and editable-paragraph modules; keep public DOM landmarks, accessible names, serialized data, shortcuts, storage behavior, and clipboard payloads stable.
    - In scope: move associated unit/component tests with their implementation, update imports, local documentation links, parity mappings, and architecture documentation.
    - Out of scope: new Writer commands, list semantics, visual redesign, format conversion, or changes to the user-observable behavior beyond correcting structural imports. The blocked list task 202608130521-XRVZ3V resumes after this prerequisite.
  Plan: |-
    1. Inventory all current `apps/office/src` modules, their imports, public DOM contracts, tests, documentation links, and parity references; publish the target ownership table that relates `app`, `shared`, `platform`, and `features/writer` to the browser-appropriate LibreOffice boundaries.
    2. Migrate the static app shell and reusable suite presentation to `app`; migrate generic document, history, storage, command, worker, recovery, and suite contracts to `shared`; retain browser adapters in `platform`.
    3. Move Writer-specific model, application orchestration, UI, and browser-facing Writer adapters under `features/writer`; use explicit public entrypoints only where a cross-layer import is needed.
    4. Decompose `WriterPlainTextEditor` into a focused document-body orchestrator plus independently documented selection/caret and editable-paragraph modules, keeping its current accessible and browser-selection contracts unchanged.
    5. Move or update all affected tests, imports, program docs, and parity mapping paths; add structural regression tests or import-boundary checks where the existing suite does not cover them.
    6. Run full fast coverage plus focused production Chromium and inventory-parity checks; defer only the aggregate verification suite under the approved ten-task cadence.
  Verify Steps: |-
    1. Run `npm run test:coverage`. Expected: all tests remain green at 100 percent coverage after the relocation and editor decomposition.
    2. Run `npm run test:e2e -- --grep "loads the Writer structural workspace"`. Expected: the production Chromium Writer workspace retains menus, toolbars, editing, selection, clipboard, paragraph-break, history, and accessibility behavior.
    3. Run `npm run inventory:parity -- --baseline docs/program/libreoffice-baseline.json --mappings docs/program/parity/writer-command-slice.json --local-root . --upstream-root vendor/libreoffice-reference`. Expected: every existing Writer record resolves the relocated implementation, test, and documentation markers.
    4. Run `npm run format:check && npm run lint && npm run typecheck && npm run check:docs && npm run check:file-size && git diff --check && ap doctor && node .agentplane/policy/check-routing.mjs`. Expected: all structural, documentation, size, and policy gates pass.
    5. Defer aggregate `npm run verify`, static smoke, inventory coverage, and the full browser matrix under the user-approved ten-task cadence; record residual risk.
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: |-
    - Revert the task-scoped source relocation/decomposition, documentation, mapping, and task-artifact commits together.
    - Re-run coverage and the focused Writer structural workspace E2E scenario to verify the original source layout still has its established behavior.
  Findings: ""
id_source: "generated"
---
## Summary

Align the current source tree with LibreOffice-oriented feature layers

Reorganize the existing static browser application into explicit app, shared, and Writer feature layers; decompose oversized Writer editor behavior; preserve all behavior, tests, documentation, and parity links so later Writer capabilities can extend stable LibreOffice-aligned boundaries.

## Scope

- In scope: establish the browser-native source layers `app`, `shared`, `platform`, and `features/writer`, with a documented relation to LibreOffice shell/shared/Writer boundaries; migrate every existing Writer and shared module into the appropriate layer without behavior changes.
- In scope: decompose the oversized Writer document editor into independently testable rendering, selection/caret, and editable-paragraph modules; keep public DOM landmarks, accessible names, serialized data, shortcuts, storage behavior, and clipboard payloads stable.
- In scope: move associated unit/component tests with their implementation, update imports, local documentation links, parity mappings, and architecture documentation.
- Out of scope: new Writer commands, list semantics, visual redesign, format conversion, or changes to the user-observable behavior beyond correcting structural imports. The blocked list task 202608130521-XRVZ3V resumes after this prerequisite.

## Plan

1. Inventory all current `apps/office/src` modules, their imports, public DOM contracts, tests, documentation links, and parity references; publish the target ownership table that relates `app`, `shared`, `platform`, and `features/writer` to the browser-appropriate LibreOffice boundaries.
2. Migrate the static app shell and reusable suite presentation to `app`; migrate generic document, history, storage, command, worker, recovery, and suite contracts to `shared`; retain browser adapters in `platform`.
3. Move Writer-specific model, application orchestration, UI, and browser-facing Writer adapters under `features/writer`; use explicit public entrypoints only where a cross-layer import is needed.
4. Decompose `WriterPlainTextEditor` into a focused document-body orchestrator plus independently documented selection/caret and editable-paragraph modules, keeping its current accessible and browser-selection contracts unchanged.
5. Move or update all affected tests, imports, program docs, and parity mapping paths; add structural regression tests or import-boundary checks where the existing suite does not cover them.
6. Run full fast coverage plus focused production Chromium and inventory-parity checks; defer only the aggregate verification suite under the approved ten-task cadence.

## Verify Steps

1. Run `npm run test:coverage`. Expected: all tests remain green at 100 percent coverage after the relocation and editor decomposition.
2. Run `npm run test:e2e -- --grep "loads the Writer structural workspace"`. Expected: the production Chromium Writer workspace retains menus, toolbars, editing, selection, clipboard, paragraph-break, history, and accessibility behavior.
3. Run `npm run inventory:parity -- --baseline docs/program/libreoffice-baseline.json --mappings docs/program/parity/writer-command-slice.json --local-root . --upstream-root vendor/libreoffice-reference`. Expected: every existing Writer record resolves the relocated implementation, test, and documentation markers.
4. Run `npm run format:check && npm run lint && npm run typecheck && npm run check:docs && npm run check:file-size && git diff --check && ap doctor && node .agentplane/policy/check-routing.mjs`. Expected: all structural, documentation, size, and policy gates pass.
5. Defer aggregate `npm run verify`, static smoke, inventory coverage, and the full browser matrix under the user-approved ten-task cadence; record residual risk.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert the task-scoped source relocation/decomposition, documentation, mapping, and task-artifact commits together.
- Re-run coverage and the focused Writer structural workspace E2E scenario to verify the original source layout still has its established behavior.

## Findings
