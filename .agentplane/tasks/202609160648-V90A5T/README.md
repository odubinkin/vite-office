---
id: "202609160648-V90A5T"
title: "Move document recovery messages to footer status"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 4
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
doc_updated_at: "2026-09-16T06:49:18.172Z"
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
    PLANNER fallback scaffold for "Move document recovery messages to footer status". Replace with task-specific acceptance checks when PLANNER context is available.

    1. Review the requested outcome for "Move document recovery messages to footer status". Expected: the visible result matches ## Summary and stays inside approved scope.
    2. Run the most relevant validation step for this task. Expected: it succeeds without unexpected regressions in touched behavior.
    3. Compare the final result against ## Scope and record any residual follow-up in ## Findings. Expected: open edges are explicit rather than implicit.
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

PLANNER fallback scaffold for "Move document recovery messages to footer status". Replace with task-specific acceptance checks when PLANNER context is available.

1. Review the requested outcome for "Move document recovery messages to footer status". Expected: the visible result matches ## Summary and stays inside approved scope.
2. Run the most relevant validation step for this task. Expected: it succeeds without unexpected regressions in touched behavior.
3. Compare the final result against ## Scope and record any residual follow-up in ## Findings. Expected: open edges are explicit rather than implicit.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert task-related commit(s).
- Re-run required checks to confirm rollback safety.

## Findings
