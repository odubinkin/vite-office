---
id: "202608111435-5W664B"
title: "Preserve formatted Writer selections on copy"
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
  updated_at: "2026-08-11T14:35:22.457Z"
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
    body: "Start: fix Writer copy payload fidelity and preserve bounded paragraph formatting."
events:
  -
    type: "status"
    at: "2026-08-11T14:35:22.869Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: fix Writer copy payload fidelity and preserve bounded paragraph formatting."
doc_version: 3
doc_updated_at: "2026-08-11T14:36:18.215Z"
doc_updated_by: "CODER"
description: "Fix Writer clipboard copy so hidden accessibility descriptions never enter plain text and supported browsers receive sanitized rich HTML with bounded paragraph alignment and style when copying into another editor."
sections:
  Summary: |-
    Preserve formatted Writer selections on copy

    Fix Writer clipboard copy so hidden accessibility descriptions never enter plain text and supported browsers receive sanitized rich HTML with bounded paragraph alignment and style when copying into another editor.
  Scope: |-
    - In scope: Fix Writer clipboard copy so hidden accessibility descriptions never enter plain text and supported browsers receive sanitized rich HTML with bounded paragraph alignment and style when copying into another editor.
    - Out of scope: unrelated refactors not required for "Preserve formatted Writer selections on copy".
  Plan: |-
    1. Keep the bounded work within LO-WRITER-0103: inspect the pinned .uno:Copy menu and toolbar placement plus its Copy/Paste regression coverage, without claiming rich-document parity beyond the local paragraph model.
    2. Replace raw Selection.toString clipboard handling with a Writer-specific sanitized selection payload that excludes accessibility-only descriptions and exposes visible plain text plus inline HTML paragraphs carrying bounded alignment and Heading 1 styling.
    3. Prefer ClipboardItem text/html plus text/plain in supported browsers and retain correct text/plain fallback behavior when rich clipboard write is unavailable or rejected.
    4. Wire the existing Edit Copy and standard-toolbar Copy commands to the new behavior without adding non-Writer UI controls.
    5. Add unit, UI, targeted Chromium E2E, parity-manifest, and documentation evidence. Run fast coverage and targeted E2E plus static checks; defer aggregate verify under the user-approved ten-task cadence.
  Verify Steps: |-
    1. Run `npm run test:coverage`. Expected: all office tests pass at 100 percent coverage, including sanitized selection extraction, rich ClipboardItem payloads, plain-text fallback, and the Writer Copy menu/toolbar outcomes.
    2. Run `npm run test:e2e`. Expected: the production Writer flow continues to copy selected visible text without exposing accessibility-only descriptions and retains its bounded formatting behavior.
    3. Run `npm run inventory:parity -- --baseline docs/program/libreoffice-baseline.json --mappings docs/program/parity/writer-command-slice.json --local-root . --upstream-root vendor/libreoffice-reference`. Expected: LO-WRITER-0103 resolves its updated source, tests, and documentation evidence at the pinned baseline.
    4. Run `npm run format:check`, `npm run lint`, `npm run typecheck`, `npm run check:docs`, `npm run check:file-size`, `git diff --check`, `ap doctor`, and `node .agentplane/policy/check-routing.mjs`. Expected: all pass.
    5. Defer aggregate `npm run verify`, static smoke, inventory coverage, and full browser matrix under the user-approved ten-task cadence; record residual risk.
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

Preserve formatted Writer selections on copy

Fix Writer clipboard copy so hidden accessibility descriptions never enter plain text and supported browsers receive sanitized rich HTML with bounded paragraph alignment and style when copying into another editor.

## Scope

- In scope: Fix Writer clipboard copy so hidden accessibility descriptions never enter plain text and supported browsers receive sanitized rich HTML with bounded paragraph alignment and style when copying into another editor.
- Out of scope: unrelated refactors not required for "Preserve formatted Writer selections on copy".

## Plan

1. Keep the bounded work within LO-WRITER-0103: inspect the pinned .uno:Copy menu and toolbar placement plus its Copy/Paste regression coverage, without claiming rich-document parity beyond the local paragraph model.
2. Replace raw Selection.toString clipboard handling with a Writer-specific sanitized selection payload that excludes accessibility-only descriptions and exposes visible plain text plus inline HTML paragraphs carrying bounded alignment and Heading 1 styling.
3. Prefer ClipboardItem text/html plus text/plain in supported browsers and retain correct text/plain fallback behavior when rich clipboard write is unavailable or rejected.
4. Wire the existing Edit Copy and standard-toolbar Copy commands to the new behavior without adding non-Writer UI controls.
5. Add unit, UI, targeted Chromium E2E, parity-manifest, and documentation evidence. Run fast coverage and targeted E2E plus static checks; defer aggregate verify under the user-approved ten-task cadence.

## Verify Steps

1. Run `npm run test:coverage`. Expected: all office tests pass at 100 percent coverage, including sanitized selection extraction, rich ClipboardItem payloads, plain-text fallback, and the Writer Copy menu/toolbar outcomes.
2. Run `npm run test:e2e`. Expected: the production Writer flow continues to copy selected visible text without exposing accessibility-only descriptions and retains its bounded formatting behavior.
3. Run `npm run inventory:parity -- --baseline docs/program/libreoffice-baseline.json --mappings docs/program/parity/writer-command-slice.json --local-root . --upstream-root vendor/libreoffice-reference`. Expected: LO-WRITER-0103 resolves its updated source, tests, and documentation evidence at the pinned baseline.
4. Run `npm run format:check`, `npm run lint`, `npm run typecheck`, `npm run check:docs`, `npm run check:file-size`, `git diff --check`, `ap doctor`, and `node .agentplane/policy/check-routing.mjs`. Expected: all pass.
5. Defer aggregate `npm run verify`, static smoke, inventory coverage, and full browser matrix under the user-approved ten-task cadence; record residual risk.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert task-related commit(s).
- Re-run required checks to confirm rollback safety.

## Findings
