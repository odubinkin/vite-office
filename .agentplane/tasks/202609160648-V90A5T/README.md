---
id: "202609160648-V90A5T"
title: "Move document recovery messages to footer status"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 5
origin:
  system: "manual"
depends_on: []
tags:
  - "frontend"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-09-16T06:49:02.579Z"
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
    body: "Start: move recovery result messages into the existing Writer footer status while preserving the current status presentation model."
events:
  -
    type: "status"
    at: "2026-09-16T06:49:18.172Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: move recovery result messages into the existing Writer footer status while preserving the current status presentation model."
doc_version: 3
doc_updated_at: "2026-09-16T06:54:40.102Z"
doc_updated_by: "CODER"
description: "Move Writer document recovery result messages from the standalone top notice panel into the existing Writer footer status area. Preserve the current status presentation model for all operation and command statuses; do not refactor status precedence or introduce a last-event status history."
sections:
  Summary: |-
    Move document recovery messages to footer status

    Move Writer document recovery result messages from the standalone top notice panel into the existing Writer footer status area. Preserve the current status presentation model for all operation and command statuses; do not refactor status precedence or introduce a last-event status history.
  Scope: |-
    - In scope: Move Writer document recovery result messages from the standalone top notice panel into the existing Writer footer status area. Preserve the current status presentation model for all operation and command statuses; do not refactor status precedence or introduce a last-event status history.
    - Out of scope: unrelated refactors not required for "Move document recovery messages to footer status".
  Plan: |-
    1. Update WriterRecoveryPrompt to stop rendering a standalone notice panel and expose recovery notice state to the workspace renderer.
    2. Pass the notice through WriterWorkspaceSession into WriterWorkbench and feed it into the existing footer status value without changing presentWriterStatus behavior for command/operation statuses.
    3. Update recovery presentation tests and relevant integration assertions to verify recovery messages appear in Writer status bar and no top notice panel is rendered.
    4. Run targeted tests, formatting/lint/typecheck checks, Agentplane doctor and routing validation; record evidence.
  Verify Steps: |-
    1. Run the focused recovery, Writer view, and Writer module Vitest suites from apps/office; expected: all tests pass, including recovery feedback rendered in the Writer status bar and no standalone notice panel.
    2. Run npm run typecheck --workspace @vite-office/office; expected: TypeScript passes.
    3. Run targeted ESLint and Prettier checks for the five changed files; expected: both pass.
    4. Run npm run build, ap doctor, and node .agentplane/policy/check-routing.mjs; expected: build succeeds, doctor is OK, and policy routing passes.
    5. Inspect git diff --check and final git status; expected: no whitespace errors and only approved implementation/task artifacts are present.
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

Move document recovery messages to footer status

Move Writer document recovery result messages from the standalone top notice panel into the existing Writer footer status area. Preserve the current status presentation model for all operation and command statuses; do not refactor status precedence or introduce a last-event status history.

## Scope

- In scope: Move Writer document recovery result messages from the standalone top notice panel into the existing Writer footer status area. Preserve the current status presentation model for all operation and command statuses; do not refactor status precedence or introduce a last-event status history.
- Out of scope: unrelated refactors not required for "Move document recovery messages to footer status".

## Plan

1. Update WriterRecoveryPrompt to stop rendering a standalone notice panel and expose recovery notice state to the workspace renderer.
2. Pass the notice through WriterWorkspaceSession into WriterWorkbench and feed it into the existing footer status value without changing presentWriterStatus behavior for command/operation statuses.
3. Update recovery presentation tests and relevant integration assertions to verify recovery messages appear in Writer status bar and no top notice panel is rendered.
4. Run targeted tests, formatting/lint/typecheck checks, Agentplane doctor and routing validation; record evidence.

## Verify Steps

1. Run the focused recovery, Writer view, and Writer module Vitest suites from apps/office; expected: all tests pass, including recovery feedback rendered in the Writer status bar and no standalone notice panel.
2. Run npm run typecheck --workspace @vite-office/office; expected: TypeScript passes.
3. Run targeted ESLint and Prettier checks for the five changed files; expected: both pass.
4. Run npm run build, ap doctor, and node .agentplane/policy/check-routing.mjs; expected: build succeeds, doctor is OK, and policy routing passes.
5. Inspect git diff --check and final git status; expected: no whitespace errors and only approved implementation/task artifacts are present.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert task-related commit(s).
- Re-run required checks to confirm rollback safety.

## Findings
