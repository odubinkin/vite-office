---
id: "202611220122-5AP3TA"
title: "Connect Calc number format shortcuts and precision controls"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 8
origin:
  system: "manual"
depends_on:
  - "202611220105-51SY7G"
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-11-22T01:23:14.001Z"
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
    body: "Start: connect native Calc numeric formats and precision controls to the existing formatter and history."
events:
  -
    type: "status"
    at: "2026-11-22T01:23:14.389Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: connect native Calc numeric formats and precision controls to the existing formatter and history."
doc_version: 3
doc_updated_at: "2026-11-22T01:48:38.539Z"
doc_updated_by: "CODER"
description: "Connect native Calc menu and toolbar format commands, their state and history, and the shared source numeric picture generation needed by decimal and thousands controls."
sections:
  Summary: |-
    Connect Calc number format shortcuts and precision controls

    Connect native Calc menu and toolbar format commands, their state and history, and the shared source numeric picture generation needed by decimal and thousands controls.
  Scope: "Cover the ten pinned NumberFormat shortcut slots, including explicit currency key input, menu and visible toolbar actions, expanded marked-range format state, decimal steps, and thousands separator toggling. Route source locale, metadata and generated format strings through the existing SvNumberFormatter. The full Format Cells dialog, generic sidebar number formatting and currency chooser are separate bindings."
  Plan: "Connect native Calc preset and precision commands using compiled document formats, actual locale and checked state, the existing model and selection format history. Port source numeric picture generation and test both menu and toolbar."
  Verify Steps: |-
    - Run focused Calc tests for native toolbar and menu commands, exact format keys and display, selected ranges, history, language context, and ODS reopening. Port the tdf133342 localized percent precision regression.
    - Run focused shared number formatting tests, application typecheck, changed-source lint/format, Calc resources, dependency and source provenance/inventory, AgentPlane routing and doctor.
    - Verify production build and Chromium toolbar/menu behavior. This is task seven of the current ten-task checkpoint interval.
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert the task implementation commits. Actual number formats and persisted styles remain in the existing formatter and workbook filter owners."
  Findings: |-
    The original French percent fixture exposed a Calc import defect. Calc assigned the ODS style's format key and inherited the system format language. The source UNO property applies both. Binding both items retained the French style, the exact space before the percent sign, and the generated decimal precision on reopening.

    The same ODS path now carries generated fractional seconds, elapsed-time overflow, fraction grouping and the currency-symbol language. The original tdf82398 regression now applies Date through the toolbar before running Text to Columns and checks all sixteen cells.

    CALC-828 through CALC-830 record the source localized Number toggle, the active-edit Time branch, and the category difference between contiguous and separate marked runs. The task retains each behavior. The dedicated Format Cells dialog, sidebar controls and currency chooser are separate bindings.
id_source: "generated"
---
## Summary

Connect Calc number format shortcuts and precision controls

Connect native Calc menu and toolbar format commands, their state and history, and the shared source numeric picture generation needed by decimal and thousands controls.

## Scope

Cover the ten pinned NumberFormat shortcut slots, including explicit currency key input, menu and visible toolbar actions, expanded marked-range format state, decimal steps, and thousands separator toggling. Route source locale, metadata and generated format strings through the existing SvNumberFormatter. The full Format Cells dialog, generic sidebar number formatting and currency chooser are separate bindings.

## Plan

Connect native Calc preset and precision commands using compiled document formats, actual locale and checked state, the existing model and selection format history. Port source numeric picture generation and test both menu and toolbar.

## Verify Steps

- Run focused Calc tests for native toolbar and menu commands, exact format keys and display, selected ranges, history, language context, and ODS reopening. Port the tdf133342 localized percent precision regression.
- Run focused shared number formatting tests, application typecheck, changed-source lint/format, Calc resources, dependency and source provenance/inventory, AgentPlane routing and doctor.
- Verify production build and Chromium toolbar/menu behavior. This is task seven of the current ten-task checkpoint interval.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert the task implementation commits. Actual number formats and persisted styles remain in the existing formatter and workbook filter owners.

## Findings

The original French percent fixture exposed a Calc import defect. Calc assigned the ODS style's format key and inherited the system format language. The source UNO property applies both. Binding both items retained the French style, the exact space before the percent sign, and the generated decimal precision on reopening.

The same ODS path now carries generated fractional seconds, elapsed-time overflow, fraction grouping and the currency-symbol language. The original tdf82398 regression now applies Date through the toolbar before running Text to Columns and checks all sixteen cells.

CALC-828 through CALC-830 record the source localized Number toggle, the active-edit Time branch, and the category difference between contiguous and separate marked runs. The task retains each behavior. The dedicated Format Cells dialog, sidebar controls and currency chooser are separate bindings.
