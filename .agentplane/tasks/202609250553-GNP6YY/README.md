---
id: "202609250553-GNP6YY"
title: "Align Writer dialogs and browser print with upstream"
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
  updated_at: "2026-09-25T05:54:03.859Z"
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
    body: "Start: implement approved Writer dialog, print, and mobile UI corrections against pinned upstream."
events:
  -
    type: "status"
    at: "2026-09-25T05:54:09.195Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implement approved Writer dialog, print, and mobile UI corrections against pinned upstream."
doc_version: 3
doc_updated_at: "2026-09-25T05:54:09.195Z"
doc_updated_by: "CODER"
description: "Implement the approved Writer UI corrections: upstream dialog and quick popup parity, mobile viewport containment, and browser print of document pages only."
sections:
  Summary: |-
    Align Writer dialogs and browser print with upstream

    Implement the approved Writer UI corrections: upstream dialog and quick popup parity, mobile viewport containment, and browser print of document pages only.
  Scope: "Writer browser presentation, command resources, page print CSS, and focused UI tests. Match local pinned LibreOffice dialog layouts and settings where supported by the document model; retain browser print dialog."
  Plan: "1. Audit each Writer modal and quick popup against pinned upstream UI resources and align layout, labels, tabs, and supported settings. 2. Share modal presentation and viewport scrolling; close palettes on outside interaction. 3. Contain mobile viewport overflow. 4. Wire Print at upstream menu and toolbar locations to browser print; print document pages only. 5. Remove unsupported toolbar line-spacing dropdown. 6. Add focused regression coverage, run verification, and commit intentional changes."
  Verify Steps: "Run npm run typecheck and focused Vitest suites for Writer dialogs, menu, toolbar, page layout, and mobile/print behavior; run npm run verify if feasible. Browser-check at a narrow mobile viewport that the document canvas alone scrolls and dialogs scroll within the viewport. Browser-check print preview or print CSS: only document pages appear, without Writer chrome or page overlays. Compare dialog layouts and controls against pinned LibreOffice UI XML."
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert only the task implementation commit; preserve unrelated existing task state."
  Findings: ""
id_source: "generated"
---
## Summary

Align Writer dialogs and browser print with upstream

Implement the approved Writer UI corrections: upstream dialog and quick popup parity, mobile viewport containment, and browser print of document pages only.

## Scope

Writer browser presentation, command resources, page print CSS, and focused UI tests. Match local pinned LibreOffice dialog layouts and settings where supported by the document model; retain browser print dialog.

## Plan

1. Audit each Writer modal and quick popup against pinned upstream UI resources and align layout, labels, tabs, and supported settings. 2. Share modal presentation and viewport scrolling; close palettes on outside interaction. 3. Contain mobile viewport overflow. 4. Wire Print at upstream menu and toolbar locations to browser print; print document pages only. 5. Remove unsupported toolbar line-spacing dropdown. 6. Add focused regression coverage, run verification, and commit intentional changes.

## Verify Steps

Run npm run typecheck and focused Vitest suites for Writer dialogs, menu, toolbar, page layout, and mobile/print behavior; run npm run verify if feasible. Browser-check at a narrow mobile viewport that the document canvas alone scrolls and dialogs scroll within the viewport. Browser-check print preview or print CSS: only document pages appear, without Writer chrome or page overlays. Compare dialog layouts and controls against pinned LibreOffice UI XML.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert only the task implementation commit; preserve unrelated existing task state.

## Findings
