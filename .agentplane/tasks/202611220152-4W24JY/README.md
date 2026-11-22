---
id: "202611220152-4W24JY"
title: "Connect Calc Number Format sidebar and currency controls"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 7
origin:
  system: "manual"
depends_on:
  - "202611220122-5AP3TA"
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-11-22T01:52:58.331Z"
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
    body: "Start: connect native Calc number format sidebar, request and currency control contracts."
events:
  -
    type: "status"
    at: "2026-11-22T01:52:58.527Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: connect native Calc number format sidebar, request and currency control contracts."
doc_version: 3
doc_updated_at: "2026-11-22T01:52:58.527Z"
doc_updated_by: "CODER"
description: "Mount the native Properties sidebar number panel and currency selector, with original Sfx category and option arguments, formatter-backed document currencies, and grid number-format colors."
sections:
  Summary: |-
    Connect Calc Number Format sidebar and currency controls

    Mount the native Properties sidebar number panel and currency selector, with original Sfx category and option arguments, formatter-backed document currencies, and grid number-format colors.
  Scope: "Connect the native Calc Properties child and Number Format panel over shared sidebar components. Represent category selection, decimal and denominator inputs, leading zeros, red negatives, grouping and engineering. Bind the native UInt16 and comma-separated String Sfx commands, existing formatting shortcuts, currency split buttons and the formatter-backed current document currency list. Include currency-key insertion, original currency ordering and sticky split-button selection, formatter colors in grid rendering, native regression ports, and canonical inventory updates. Other sidebar content, complete Format Cells dialog and persistence subsystems remain separate."
  Plan: "Derive category and option state from the selected pattern and cursor format. Build the shared right-docked Calc child and source panel controls, with native binds and selection history. Add formatter-owned currency resolution and current-document entries, shared toolbar chooser, and number-format drawing colors. Verify upstream tests and isolated browser acceptance."
  Verify Steps: |-
    - Run focused Calc tests for Properties, category and option selection, currency request and document list, mixed state, leading-zero and enabling rules, undo and stack isolation, formatted grid color and resize/focus behavior. Port the native currency-accessor regression and look for matching number-panel UI tests.
    - Run focused shared formatter and sidebar tests, typecheck, changed-path lint and format, resource and dependency checks, source provenance and inventory, AgentPlane doctor and routing.
    - Verify on a production build in Chromium. This is task eight of the ten-task checkpoint interval.
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert the task implementation and associated registry records. Workbook numeric formats and file ownership stay with their existing native model owners."
  Findings: ""
id_source: "generated"
---
## Summary

Connect Calc Number Format sidebar and currency controls

Mount the native Properties sidebar number panel and currency selector, with original Sfx category and option arguments, formatter-backed document currencies, and grid number-format colors.

## Scope

Connect the native Calc Properties child and Number Format panel over shared sidebar components. Represent category selection, decimal and denominator inputs, leading zeros, red negatives, grouping and engineering. Bind the native UInt16 and comma-separated String Sfx commands, existing formatting shortcuts, currency split buttons and the formatter-backed current document currency list. Include currency-key insertion, original currency ordering and sticky split-button selection, formatter colors in grid rendering, native regression ports, and canonical inventory updates. Other sidebar content, complete Format Cells dialog and persistence subsystems remain separate.

## Plan

Derive category and option state from the selected pattern and cursor format. Build the shared right-docked Calc child and source panel controls, with native binds and selection history. Add formatter-owned currency resolution and current-document entries, shared toolbar chooser, and number-format drawing colors. Verify upstream tests and isolated browser acceptance.

## Verify Steps

- Run focused Calc tests for Properties, category and option selection, currency request and document list, mixed state, leading-zero and enabling rules, undo and stack isolation, formatted grid color and resize/focus behavior. Port the native currency-accessor regression and look for matching number-panel UI tests.
- Run focused shared formatter and sidebar tests, typecheck, changed-path lint and format, resource and dependency checks, source provenance and inventory, AgentPlane doctor and routing.
- Verify on a production build in Chromium. This is task eight of the ten-task checkpoint interval.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert the task implementation and associated registry records. Workbook numeric formats and file ownership stay with their existing native model owners.

## Findings
