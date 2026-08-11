---
id: "202608111311-BFCRET"
title: "Merge Writer paragraphs through Backspace"
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
  updated_at: "2026-08-11T13:11:33.788Z"
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
    body: "Start: implementing bounded Writer Backspace paragraph merge at an eligible document caret without new command UI."
events:
  -
    type: "status"
    at: "2026-08-11T13:11:34.215Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implementing bounded Writer Backspace paragraph merge at an eligible document caret without new command UI."
doc_version: 3
doc_updated_at: "2026-08-11T13:11:34.215Z"
doc_updated_by: "CODER"
description: "Implement bounded native Backspace behavior in the integrated Writer document canvas: at a collapsed caret offset zero in a non-first plain-text paragraph, merge its text into the preceding paragraph, retain history and browser-local persistence, and focus the merged paragraph at the join offset. Do not add a toolbar or menu control."
sections:
  Summary: |-
    Merge Writer paragraphs through Backspace

    Implement bounded native Backspace behavior in the integrated Writer document canvas: at a collapsed caret offset zero in a non-first plain-text paragraph, merge its text into the preceding paragraph, retain history and browser-local persistence, and focus the merged paragraph at the join offset. Do not add a toolbar or menu control.
  Scope: |-
    - In scope: pure adjacent paragraph merge, collapsed-caret Backspace handling at offset zero, focus restoration at the join offset, history/storage/download retention, tests, and Writer-parity documentation.
    - Out of scope: Backspace inside text, non-collapsed selections, first-paragraph behavior, Shift/modified Backspace, list/table/rich-text semantics, and UI command surfaces.
  Plan: |-
    1. Add a small immutable adjacent-merge domain primitive with deterministic retained paragraph identity and documented formatting rule.
    2. Wire Backspace at an eligible native caret to history and post-render focus without adding UI controls.
    3. Add unit, component, and targeted production-browser coverage plus documentation; run fast checks and record the approved aggregate-check deferral.
  Verify Steps: |-
    1. Run format, lint, TypeScript, JSDoc, file-size, and office coverage checks. Expected: all pass at 100 percent coverage.
    2. Run targeted production Playwright. Expected: Backspace merges the second paragraph at its beginning and retains accessible Writer chrome.
    3. Run diff, doctor, and policy routing checks. Expected: all pass.
    4. Defer static smoke, inventory, and aggregate verify to the user-approved ten-task cadence and record residual risk.
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "- Revert the task implementation commit and rerun focused tests to restore non-modeled browser Backspace behavior."
  Findings: ""
id_source: "generated"
---
## Summary

Merge Writer paragraphs through Backspace

Implement bounded native Backspace behavior in the integrated Writer document canvas: at a collapsed caret offset zero in a non-first plain-text paragraph, merge its text into the preceding paragraph, retain history and browser-local persistence, and focus the merged paragraph at the join offset. Do not add a toolbar or menu control.

## Scope

- In scope: pure adjacent paragraph merge, collapsed-caret Backspace handling at offset zero, focus restoration at the join offset, history/storage/download retention, tests, and Writer-parity documentation.
- Out of scope: Backspace inside text, non-collapsed selections, first-paragraph behavior, Shift/modified Backspace, list/table/rich-text semantics, and UI command surfaces.

## Plan

1. Add a small immutable adjacent-merge domain primitive with deterministic retained paragraph identity and documented formatting rule.
2. Wire Backspace at an eligible native caret to history and post-render focus without adding UI controls.
3. Add unit, component, and targeted production-browser coverage plus documentation; run fast checks and record the approved aggregate-check deferral.

## Verify Steps

1. Run format, lint, TypeScript, JSDoc, file-size, and office coverage checks. Expected: all pass at 100 percent coverage.
2. Run targeted production Playwright. Expected: Backspace merges the second paragraph at its beginning and retains accessible Writer chrome.
3. Run diff, doctor, and policy routing checks. Expected: all pass.
4. Defer static smoke, inventory, and aggregate verify to the user-approved ten-task cadence and record residual risk.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert the task implementation commit and rerun focused tests to restore non-modeled browser Backspace behavior.

## Findings
