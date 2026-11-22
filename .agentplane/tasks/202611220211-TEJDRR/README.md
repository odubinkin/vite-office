---
id: "202611220211-TEJDRR"
title: "Connect Calc Format Cells dialog and native scalar attribute pages"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 8
origin:
  system: "manual"
depends_on:
  - "202611220152-4W24JY"
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-11-22T02:11:14.583Z"
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
    body: "Start: connect Format Cells, native formatter preview and scalar attribute pages."
events:
  -
    type: "status"
    at: "2026-11-22T02:11:14.770Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: connect Format Cells, native formatter preview and scalar attribute pages."
doc_version: 3
doc_updated_at: "2026-11-22T02:33:16.222Z"
doc_updated_by: "CODER"
description: "Bind the native Format Cells entry points and asynchronous item-set exchange with Numbers, Alignment, Background and Cell Protection pages, selection history and formatter preview."
sections:
  Summary: |-
    Connect Calc Format Cells dialog and native scalar attribute pages

    Bind the native Format Cells entry points and asynchronous item-set exchange with Numbers, Alignment, Background and Cell Protection pages, selection history and formatter preview.
  Scope: "Implement Format Cells Sfx entry points, main menu, keyboard, cell popup and sidebar access. Preserve input snapshot and typed damage-free output, one ApplyAttributes history step, protected-sheet admission and cancellation. Port Numbers (category, locale, formats, available currency list, options, code, validation and preview), Alignment (native selection items), Background color and Cell Protection pages in original relative order. Use formatter-owned codes and original source item defaults. Font, Font Effects, Borders and conditional Asian typography pages, advanced custom format administration and unsupported background types are a subsequent block."
  Plan: "Create the native ScAttrDlg exchange and format shell route. Bind the Numbers draft and locale-aware preview to existing formatter services, then connect Alignment, Background and Cell Protection item pages. Reuse existing modal and history owners, wire the natural menu, accelerator and popup entry points, and port upstream focused cases."
  Verify Steps: |-
    - Run targeted Calc regressions for mounted Numbers, Alignment, Background, Protection, source defaults and mixed selection, typed requests, cancellation and single undo. Port corresponding upstream regressions for represented controls and exercise ODS and production Chromium entry points.
    - Run related shared formatter tests, types, changed-source lint/format, dependency, resources, source provenance and inventory, AgentPlane routing and doctor, and production build. This is task nine of ten before the next full run.
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert this dialog and registry update. The original document formatter, attribute history and storage routes remain the owners."
  Findings: |-
    - The Format Cells command routes through the active native view and applies the dialog output with one ApplyAttributes call. Numbers supports original examples and color, categories, locales, currency selection, option-based picture generation, validation and a scratch formatter for read-only previews. Alignment, solid/no fill and Cell Protection write native pool items.
    - CALC-833 records the unmatched default style popup identifier in the pinned resources. The generator preserves the source ID and its missing registration.
    - The adapted tdf88999 dialog case enters the scientific value through the existing ScDocument recognizer. Browser plain input has its own simpler parsing and history path. Automatic scientific format assignment through that browser path remains a separate binding.
    - Font, Font Effects, Borders, conditional Asian typography, expanded fills and advanced custom format administration remain separate scope.
id_source: "generated"
---
## Summary

Connect Calc Format Cells dialog and native scalar attribute pages

Bind the native Format Cells entry points and asynchronous item-set exchange with Numbers, Alignment, Background and Cell Protection pages, selection history and formatter preview.

## Scope

Implement Format Cells Sfx entry points, main menu, keyboard, cell popup and sidebar access. Preserve input snapshot and typed damage-free output, one ApplyAttributes history step, protected-sheet admission and cancellation. Port Numbers (category, locale, formats, available currency list, options, code, validation and preview), Alignment (native selection items), Background color and Cell Protection pages in original relative order. Use formatter-owned codes and original source item defaults. Font, Font Effects, Borders and conditional Asian typography pages, advanced custom format administration and unsupported background types are a subsequent block.

## Plan

Create the native ScAttrDlg exchange and format shell route. Bind the Numbers draft and locale-aware preview to existing formatter services, then connect Alignment, Background and Cell Protection item pages. Reuse existing modal and history owners, wire the natural menu, accelerator and popup entry points, and port upstream focused cases.

## Verify Steps

- Run targeted Calc regressions for mounted Numbers, Alignment, Background, Protection, source defaults and mixed selection, typed requests, cancellation and single undo. Port corresponding upstream regressions for represented controls and exercise ODS and production Chromium entry points.
- Run related shared formatter tests, types, changed-source lint/format, dependency, resources, source provenance and inventory, AgentPlane routing and doctor, and production build. This is task nine of ten before the next full run.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert this dialog and registry update. The original document formatter, attribute history and storage routes remain the owners.

## Findings

- The Format Cells command routes through the active native view and applies the dialog output with one ApplyAttributes call. Numbers supports original examples and color, categories, locales, currency selection, option-based picture generation, validation and a scratch formatter for read-only previews. Alignment, solid/no fill and Cell Protection write native pool items.
- CALC-833 records the unmatched default style popup identifier in the pinned resources. The generator preserves the source ID and its missing registration.
- The adapted tdf88999 dialog case enters the scientific value through the existing ScDocument recognizer. Browser plain input has its own simpler parsing and history path. Automatic scientific format assignment through that browser path remains a separate binding.
- Font, Font Effects, Borders, conditional Asian typography, expanded fills and advanced custom format administration remain separate scope.
