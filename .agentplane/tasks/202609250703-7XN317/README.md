---
id: "202609250703-7XN317"
title: "Restore upstream Writer command and dialog entry points"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 10
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-09-25T07:04:04.053Z"
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
    body: "Start: audit all implemented Writer actions and match upstream command placements and supported dialog behavior."
events:
  -
    type: "status"
    at: "2026-09-25T07:04:11.112Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: audit all implemented Writer actions and match upstream command placements and supported dialog behavior."
doc_version: 3
doc_updated_at: "2026-09-25T07:54:15.944Z"
doc_updated_by: "CODER"
description: "Audit implemented Writer operations against pinned LibreOffice UI; restore missing command placements and faithful quick/full dialog behavior while preserving existing save/export UI."
sections:
  Summary: |-
    Restore upstream Writer command and dialog entry points

    Audit implemented Writer operations against pinned LibreOffice UI; restore missing command placements and faithful quick/full dialog behavior while preserving existing save/export UI.
  Scope: "Writer command resource generation, toolbar and menubar placement, table quick popover, existing Writer dialogs, model-backed line-number settings, and focused tests. Audit every currently implemented document action against local pinned LibreOffice UI resources. Preserve save/export controls and behavior. No network or outside-repository access."
  Plan: "Audit implemented Writer actions and supported dialog fields against pinned LibreOffice UI; restore missing upstream placements and quick/full table interaction; validate with targeted and full tests without altering save/export."
  Verify Steps: "Check the audited implemented-action/UI placement matrix against pinned LibreOffice XML and popup source. Run focused Vitest tests for generated resources, menus, toolbar, table grid, table dialog, line numbering, and existing dialogs. Run browser e2e at desktop and mobile widths for table grid, More Options, menu/dialog entry points and dismissal. Run npm run verify. Confirm save/export controls and behavior remain unchanged."
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert the implementation commit for this task only; do not change existing save/export workflow or the unrelated active task."
  Findings: "Audited implemented Writer actions against pinned menubar.xml, standardbar.xml, textobjectbar.xml, tablewindow.ui, paralinespacingcontrol.ui, and linenumbering.ui. Restored missing entry points: Insert Table in standard toolbar and Table menu; Table Properties in Table menu; direct Page Break in Insert menu and standard toolbar; Line Numbering in Tools; Single Underline in Format > Text; active Line Spacing quick control in formatting toolbar. The standard toolbar Table button now opens the 10 by 15 grid with keyboard sizing and More Options; repeat-header settings moved to Table Properties > Text Flow. The supported action matrix is recorded in docs/program/writer-command-placement.md. Save and export command specifications, placements, and handlers remain unchanged. Validation: npm run verify passed, including 547 office tests and 109 inventory tests at 100 percent coverage, 18 browser e2e tests including mobile table grid, static build, provenance, and parity."
id_source: "generated"
---
## Summary

Restore upstream Writer command and dialog entry points

Audit implemented Writer operations against pinned LibreOffice UI; restore missing command placements and faithful quick/full dialog behavior while preserving existing save/export UI.

## Scope

Writer command resource generation, toolbar and menubar placement, table quick popover, existing Writer dialogs, model-backed line-number settings, and focused tests. Audit every currently implemented document action against local pinned LibreOffice UI resources. Preserve save/export controls and behavior. No network or outside-repository access.

## Plan

Audit implemented Writer actions and supported dialog fields against pinned LibreOffice UI; restore missing upstream placements and quick/full table interaction; validate with targeted and full tests without altering save/export.

## Verify Steps

Check the audited implemented-action/UI placement matrix against pinned LibreOffice XML and popup source. Run focused Vitest tests for generated resources, menus, toolbar, table grid, table dialog, line numbering, and existing dialogs. Run browser e2e at desktop and mobile widths for table grid, More Options, menu/dialog entry points and dismissal. Run npm run verify. Confirm save/export controls and behavior remain unchanged.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert the implementation commit for this task only; do not change existing save/export workflow or the unrelated active task.

## Findings

Audited implemented Writer actions against pinned menubar.xml, standardbar.xml, textobjectbar.xml, tablewindow.ui, paralinespacingcontrol.ui, and linenumbering.ui. Restored missing entry points: Insert Table in standard toolbar and Table menu; Table Properties in Table menu; direct Page Break in Insert menu and standard toolbar; Line Numbering in Tools; Single Underline in Format > Text; active Line Spacing quick control in formatting toolbar. The standard toolbar Table button now opens the 10 by 15 grid with keyboard sizing and More Options; repeat-header settings moved to Table Properties > Text Flow. The supported action matrix is recorded in docs/program/writer-command-placement.md. Save and export command specifications, placements, and handlers remain unchanged. Validation: npm run verify passed, including 547 office tests and 109 inventory tests at 100 percent coverage, 18 browser e2e tests including mobile table grid, static build, provenance, and parity.
