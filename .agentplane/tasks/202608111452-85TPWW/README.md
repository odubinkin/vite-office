---
id: "202608111452-85TPWW"
title: "Support document-wide Writer selection shortcuts"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 7
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-08-11T14:52:58.242Z"
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
    body: "Start: route document-wide native selection through Writer controls and permit cross-paragraph pointer selection with focused parity coverage."
events:
  -
    type: "status"
    at: "2026-08-11T14:52:58.873Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: route document-wide native selection through Writer controls and permit cross-paragraph pointer selection with focused parity coverage."
doc_version: 3
doc_updated_at: "2026-08-11T14:52:58.873Z"
doc_updated_by: "CODER"
description: "Make Ctrl/Cmd+A invoke Writer Select All and allow native mouse selections to span visible Writer paragraphs while preserving the sanitized clipboard selection contract."
sections:
  Summary: |-
    Support document-wide Writer selection shortcuts

    Make Ctrl/Cmd+A invoke Writer Select All and allow native mouse selections to span visible Writer paragraphs while preserving the sanitized clipboard selection contract.
  Scope: |-
    - In scope: handle Ctrl/Cmd+A as Edit → Select All only while focus is within the Writer document; preserve browser shortcuts outside Writer.
    - In scope: allow native pointer selection to span rendered Writer paragraphs and retain the existing sanitized plain-text/rich-HTML Copy contract.
    - In scope: component and production E2E coverage, parity mapping, and Writer selection documentation.
    - Out of scope: selection of tables, frames, inline character formatting, object selection, or unrelated editor architecture.
  Plan: |-
    1. Inspect the existing document selection request and editable paragraph ownership to identify why browser Ctrl/Cmd+A and pointer selection stop at one paragraph.
    2. Route the platform select-all shortcut through the existing Writer Select All request and make the document body a single editable selection surface without changing paragraph-model commands.
    3. Add focused component and production-browser tests for Ctrl/Cmd+A and a pointer drag from the first paragraph into a following paragraph; retain sanitized Copy assertions.
    4. Update LO-WRITER-0103 mapping and Writer selection documentation, run focused fast checks plus the target Playwright scenario, and record the approved deferred full-suite cadence.
  Verify Steps: |-
    1. Run `npm run test:coverage`. Expected: all office tests pass at 100 percent coverage, including Ctrl/Cmd+A routing, cross-paragraph selection serialization, and existing copy behavior.
    2. Run `npm run test:e2e -- --grep "document-wide selection"`. Expected: production Chromium confirms Ctrl/Cmd+A selects all Writer paragraphs and pointer drag selection crosses from the leading into the following paragraph.
    3. Run `npm run inventory:parity -- --baseline docs/program/libreoffice-baseline.json --mappings docs/program/parity/writer-command-slice.json --local-root . --upstream-root vendor/libreoffice-reference`. Expected: LO-WRITER-0103 resolves the changed source, tests, and documentation evidence.
    4. Run `npm run format:check && npm run lint && npm run typecheck && npm run check:docs && npm run check:file-size && git diff --check && ap doctor && node .agentplane/policy/check-routing.mjs`. Expected: all pass.
    5. Defer aggregate `npm run verify`, static smoke, inventory coverage, and the full Playwright matrix under the user-approved ten-task cadence; record residual risk.
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: |-
    - Revert the task-scoped commit(s).
    - Re-run coverage and the focused document-wide selection E2E scenario to confirm that normal Writer editing and Copy behavior are restored.
  Findings: ""
id_source: "generated"
---
## Summary

Support document-wide Writer selection shortcuts

Make Ctrl/Cmd+A invoke Writer Select All and allow native mouse selections to span visible Writer paragraphs while preserving the sanitized clipboard selection contract.

## Scope

- In scope: handle Ctrl/Cmd+A as Edit → Select All only while focus is within the Writer document; preserve browser shortcuts outside Writer.
- In scope: allow native pointer selection to span rendered Writer paragraphs and retain the existing sanitized plain-text/rich-HTML Copy contract.
- In scope: component and production E2E coverage, parity mapping, and Writer selection documentation.
- Out of scope: selection of tables, frames, inline character formatting, object selection, or unrelated editor architecture.

## Plan

1. Inspect the existing document selection request and editable paragraph ownership to identify why browser Ctrl/Cmd+A and pointer selection stop at one paragraph.
2. Route the platform select-all shortcut through the existing Writer Select All request and make the document body a single editable selection surface without changing paragraph-model commands.
3. Add focused component and production-browser tests for Ctrl/Cmd+A and a pointer drag from the first paragraph into a following paragraph; retain sanitized Copy assertions.
4. Update LO-WRITER-0103 mapping and Writer selection documentation, run focused fast checks plus the target Playwright scenario, and record the approved deferred full-suite cadence.

## Verify Steps

1. Run `npm run test:coverage`. Expected: all office tests pass at 100 percent coverage, including Ctrl/Cmd+A routing, cross-paragraph selection serialization, and existing copy behavior.
2. Run `npm run test:e2e -- --grep "document-wide selection"`. Expected: production Chromium confirms Ctrl/Cmd+A selects all Writer paragraphs and pointer drag selection crosses from the leading into the following paragraph.
3. Run `npm run inventory:parity -- --baseline docs/program/libreoffice-baseline.json --mappings docs/program/parity/writer-command-slice.json --local-root . --upstream-root vendor/libreoffice-reference`. Expected: LO-WRITER-0103 resolves the changed source, tests, and documentation evidence.
4. Run `npm run format:check && npm run lint && npm run typecheck && npm run check:docs && npm run check:file-size && git diff --check && ap doctor && node .agentplane/policy/check-routing.mjs`. Expected: all pass.
5. Defer aggregate `npm run verify`, static smoke, inventory coverage, and the full Playwright matrix under the user-approved ten-task cadence; record residual risk.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert the task-scoped commit(s).
- Re-run coverage and the focused document-wide selection E2E scenario to confirm that normal Writer editing and Copy behavior are restored.

## Findings
