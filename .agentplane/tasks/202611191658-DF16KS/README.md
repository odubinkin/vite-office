---
id: "202611191658-DF16KS"
title: "Polish Writer and Calc browser controls and document opening"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 4
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-11-19T16:58:56.120Z"
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
    body: "Start: Refine shared Writer and Calc browser controls and show progress while opening documents."
events:
  -
    type: "status"
    at: "2026-11-19T16:59:00.483Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: Refine shared Writer and Calc browser controls and show progress while opening documents."
doc_version: 3
doc_updated_at: "2026-11-19T16:59:00.483Z"
doc_updated_by: "CODER"
description: "Remove unavailable launcher controls, stabilize font lists, tighten toolbar spacing, hide unavailable commands, improve menu checkmark spacing, show immediate tooltips and indicate document-opening progress in Writer and Calc."
sections:
  Summary: "Polish the integrated browser office launcher, Writer and Calc controls, and the document-opening experience."
  Scope: "Launcher chrome, browser presentation and file-opening workflow, and relevant local regression tests. Keep generated resources and native command semantics intact."
  Plan: |-
    1. Remove placeholder launcher chrome and size the shared font popup independently of preview rows.
    2. Compact toolbars, filter disconnected commands while retaining implemented commands with context-dependent availability, space menu checkmarks, and show immediate tooltips.
    3. Present opening progress for browser-stored and imported documents through completion, errors and filename collisions.
    4. Verify and close the local task.
  Verify Steps: |-
    1. Run `npm run build` and `git diff --check`. Expected: build succeeds and no whitespace errors.
    2. Run built-app Playwright launcher, shared and Writer/Calc browser-chrome cases plus relevant file-opening cases. Expected: launcher has no search/help placeholders, font width stays stable during scrolling in both editors, compact controls and immediate tooltips are visible, unavailable items are hidden while implemented controls remain, checkmarks are spaced, and opening progress appears and clears.
    3. Run focused unit tests for changed presentation components and existing combobox behavior. Expected: no regressions within the changed scope.
  Verification: "Pending implementation."
  Rollback Plan: "Revert the implementation commit to restore the original browser presentation and opening flow."
  Findings: "None at intake."
id_source: "generated"
---
## Summary

Polish the integrated browser office launcher, Writer and Calc controls, and the document-opening experience.

## Scope

Launcher chrome, browser presentation and file-opening workflow, and relevant local regression tests. Keep generated resources and native command semantics intact.

## Plan

1. Remove placeholder launcher chrome and size the shared font popup independently of preview rows.
2. Compact toolbars, filter disconnected commands while retaining implemented commands with context-dependent availability, space menu checkmarks, and show immediate tooltips.
3. Present opening progress for browser-stored and imported documents through completion, errors and filename collisions.
4. Verify and close the local task.

## Verify Steps

1. Run `npm run build` and `git diff --check`. Expected: build succeeds and no whitespace errors.
2. Run built-app Playwright launcher, shared and Writer/Calc browser-chrome cases plus relevant file-opening cases. Expected: launcher has no search/help placeholders, font width stays stable during scrolling in both editors, compact controls and immediate tooltips are visible, unavailable items are hidden while implemented controls remain, checkmarks are spaced, and opening progress appears and clears.
3. Run focused unit tests for changed presentation components and existing combobox behavior. Expected: no regressions within the changed scope.

## Verification

Pending implementation.

## Rollback Plan

Revert the implementation commit to restore the original browser presentation and opening flow.

## Findings

None at intake.
