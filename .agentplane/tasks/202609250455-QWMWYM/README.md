---
id: "202609250455-QWMWYM"
title: "Correct Writer toolbar, diagnostics, and local save"
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
  updated_at: "2026-09-25T04:55:55.871Z"
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
    body: "Start: correct the four requested Writer regressions using pinned upstream resources and focused verification."
events:
  -
    type: "status"
    at: "2026-09-25T04:56:02.523Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: correct the four requested Writer regressions using pinned upstream resources and focused verification."
doc_version: 3
doc_updated_at: "2026-09-25T04:56:02.523Z"
doc_updated_by: "CODER"
description: "Remove generated certification ODT documents; restore unique import diagnostics; align Writer toolbar and dialogs with pinned upstream resources; make Ctrl/Meta+S flush browser autosave"
sections:
  Summary: |-
    Correct Writer toolbar, diagnostics, and local save

    Remove generated certification ODT documents; restore unique import diagnostics; align Writer toolbar and dialogs with pinned upstream resources; make Ctrl/Meta+S flush browser autosave
  Scope: |-
    - In scope: Remove generated certification ODT documents; restore unique import diagnostics; align Writer toolbar and dialogs with pinned upstream resources; make Ctrl/Meta+S flush browser autosave.
    - Out of scope: unrelated refactors not required for "Correct Writer toolbar, diagnostics, and local save".
  Plan: "Remove the eight generated ODT certification docs; restore full unique import diagnostics; align command and supplemental toolbar UI to pinned upstream resources including icons and dialogs; route save accelerator to immediate local autosave; run focused and repository verification."
  Verify Steps: "1. Confirm docs/program/certification-odt-*.md is absent and no unintended files were removed. 2. Confirm ODT import warning reports total and every distinct diagnostic with stream, path, kind and name; run focused filter tests. 3. Compare standard and formatting toolbar placements to pinned generated upstream resources, with only documented Save As deviation; verify every visible toolbar button has an icon and relevant dialogs match pinned upstream UI. 4. Verify Ctrl/Meta+S calls immediate browser autosave with no download, including failure handling. 5. Run npm run verify and inspect final git diff/status."
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

Correct Writer toolbar, diagnostics, and local save

Remove generated certification ODT documents; restore unique import diagnostics; align Writer toolbar and dialogs with pinned upstream resources; make Ctrl/Meta+S flush browser autosave

## Scope

- In scope: Remove generated certification ODT documents; restore unique import diagnostics; align Writer toolbar and dialogs with pinned upstream resources; make Ctrl/Meta+S flush browser autosave.
- Out of scope: unrelated refactors not required for "Correct Writer toolbar, diagnostics, and local save".

## Plan

Remove the eight generated ODT certification docs; restore full unique import diagnostics; align command and supplemental toolbar UI to pinned upstream resources including icons and dialogs; route save accelerator to immediate local autosave; run focused and repository verification.

## Verify Steps

1. Confirm docs/program/certification-odt-*.md is absent and no unintended files were removed. 2. Confirm ODT import warning reports total and every distinct diagnostic with stream, path, kind and name; run focused filter tests. 3. Compare standard and formatting toolbar placements to pinned generated upstream resources, with only documented Save As deviation; verify every visible toolbar button has an icon and relevant dialogs match pinned upstream UI. 4. Verify Ctrl/Meta+S calls immediate browser autosave with no download, including failure handling. 5. Run npm run verify and inspect final git diff/status.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert task-related commit(s).
- Re-run required checks to confirm rollback safety.

## Findings
