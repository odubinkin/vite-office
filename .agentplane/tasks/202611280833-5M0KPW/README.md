---
id: "202611280833-5M0KPW"
title: "Connect Calc value highlighting and formula marks to the native view"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 6
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-11-28T08:33:17.066Z"
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
    body: "Start: continue direct-mode task in current checkout."
events:
  -
    type: "status"
    at: "2026-11-28T08:33:25.213Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: continue direct-mode task in current checkout."
doc_version: 3
doc_updated_at: "2026-11-28T08:33:25.213Z"
doc_updated_by: "CODER"
description: "Connect the existing Calc ScViewOptions value-highlighting and formula-mark state to the browser grid, the original View menu command, and the native Calc View options surface. Preserve the original Sfx syntax dispatch and state, formula marks and source color configuration defaults, foreground precedence, merged/hidden cell handling and ODS view settings. Reuse the established Calc Options dialog, ScViewData and text painter. Keep renderer and accessibility semantics tied to the underlying cell type and stored formula."
sections:
  Summary: |-
    Connect Calc value highlighting and formula marks to the native view

    Connect the existing Calc ScViewOptions value-highlighting and formula-mark state to the browser grid, the original View menu command, and the native Calc View options surface. Preserve the original Sfx syntax dispatch and state, formula marks and source color configuration defaults, foreground precedence, merged/hidden cell handling and ODS view settings. Reuse the established Calc Options dialog, ScViewData and text painter. Keep renderer and accessibility semantics tied to the underlying cell type and stored formula.
  Scope: "Connect the existing Calc ScViewOptions value-highlighting and formula-mark state to the browser grid, the original View menu command, and the native Calc View options surface. Preserve the original Sfx syntax dispatch and state, formula marks and source color configuration defaults, foreground precedence, merged/hidden cell handling and ODS view settings. Reuse the established Calc Options dialog, ScViewData and text painter. Keep renderer and accessibility semantics tied to the underlying cell type and stored formula."
  Plan: "Trace Calc native initial and persisted view state, connect menu and options, paint original marks and syntax colors, and verify normal grid and ODS paths."
  Verify Steps: |-
    - Trace Calc View syntax dispatch and GridWin/output drawing decisions from the pinned source.
    - Run only targeted Calc view options, grid and ODS settings tests plus a focused Chromium view-command scenario.
    - Cover explicit and toggled value highlighting, numeric/text/formula colors, formula-mark defaults and visibility, merged cells and view settings reopen.
    - Check Office types, scoped lint, JSDoc, provenance, dependencies, source structure and AgentPlane routing.
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

Connect Calc value highlighting and formula marks to the native view

Connect the existing Calc ScViewOptions value-highlighting and formula-mark state to the browser grid, the original View menu command, and the native Calc View options surface. Preserve the original Sfx syntax dispatch and state, formula marks and source color configuration defaults, foreground precedence, merged/hidden cell handling and ODS view settings. Reuse the established Calc Options dialog, ScViewData and text painter. Keep renderer and accessibility semantics tied to the underlying cell type and stored formula.

## Scope

Connect the existing Calc ScViewOptions value-highlighting and formula-mark state to the browser grid, the original View menu command, and the native Calc View options surface. Preserve the original Sfx syntax dispatch and state, formula marks and source color configuration defaults, foreground precedence, merged/hidden cell handling and ODS view settings. Reuse the established Calc Options dialog, ScViewData and text painter. Keep renderer and accessibility semantics tied to the underlying cell type and stored formula.

## Plan

Trace Calc native initial and persisted view state, connect menu and options, paint original marks and syntax colors, and verify normal grid and ODS paths.

## Verify Steps

- Trace Calc View syntax dispatch and GridWin/output drawing decisions from the pinned source.
- Run only targeted Calc view options, grid and ODS settings tests plus a focused Chromium view-command scenario.
- Cover explicit and toggled value highlighting, numeric/text/formula colors, formula-mark defaults and visibility, merged cells and view settings reopen.
- Check Office types, scoped lint, JSDoc, provenance, dependencies, source structure and AgentPlane routing.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert task-related commit(s).
- Re-run required checks to confirm rollback safety.

## Findings
