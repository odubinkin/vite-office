---
id: "202611220429-J9FSBJ"
title: "Connect Writer Page Style borders and shadows"
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
  updated_at: "2026-11-22T04:29:46.721Z"
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
    body: "Start: Connect the native page border and shadow items to Page Style and the physical page frame."
events:
  -
    type: "status"
    at: "2026-11-22T04:30:22.757Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: Connect the native page border and shadow items to Page Style and the physical page frame."
doc_version: 3
doc_updated_at: "2026-11-22T04:30:22.757Z"
doc_updated_by: "CODER"
description: "Connect the native page box and shadow items to the Page Style Borders tab, physical page paint and layout reservation."
sections:
  Summary: |-
    Connect Writer Page Style borders and shadows

    Connect the native page box and shadow items to the Page Style Borders tab, physical page paint and layout reservation.
  Scope: "Writer Page Style Borders tab, shared frame border and shadow widgets, pooled input and output, native physical page margins and border/shadow reservation, browser paint, existing Page Style history and ODF/Worker transport. Include tests, source registry, and tightly scoped refactoring of the shared border UI and frame paint projections."
  Plan: "Follow SwTemplateDlgController page ordering and PageDescToItemSet box-info defaults. Reuse the existing shared border-tab owner for line and padding controls and the Writer shadow widgets. Submit native RES_BOX and RES_SHADOW through the Page Style exchange and undo. Account for SvxShadowItem side geometry in the print area and render the physical page border and shadow separately from the view chrome. Verify known format and history paths with focused tests."
  Verify Steps: "Run targeted Writer Page Style borders, paragraph border regression, page layout, native history and ODT/Worker tests. Verify default padding policy, accepted border and shadow geometry, page position, cancellation and undo/redo. Run a focused Chromium Page Style Borders scenario, previous Page Style scenarios, and the production build. Check scoped lint, formatting, module boundaries, source tree, provenance, Writer resources, doctor and routing. Record existing global documentation and size baseline failures. Defer the full run to the ten-task checkpoint."
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

Connect Writer Page Style borders and shadows

Connect the native page box and shadow items to the Page Style Borders tab, physical page paint and layout reservation.

## Scope

Writer Page Style Borders tab, shared frame border and shadow widgets, pooled input and output, native physical page margins and border/shadow reservation, browser paint, existing Page Style history and ODF/Worker transport. Include tests, source registry, and tightly scoped refactoring of the shared border UI and frame paint projections.

## Plan

Follow SwTemplateDlgController page ordering and PageDescToItemSet box-info defaults. Reuse the existing shared border-tab owner for line and padding controls and the Writer shadow widgets. Submit native RES_BOX and RES_SHADOW through the Page Style exchange and undo. Account for SvxShadowItem side geometry in the print area and render the physical page border and shadow separately from the view chrome. Verify known format and history paths with focused tests.

## Verify Steps

Run targeted Writer Page Style borders, paragraph border regression, page layout, native history and ODT/Worker tests. Verify default padding policy, accepted border and shadow geometry, page position, cancellation and undo/redo. Run a focused Chromium Page Style Borders scenario, previous Page Style scenarios, and the production build. Check scoped lint, formatting, module boundaries, source tree, provenance, Writer resources, doctor and routing. Record existing global documentation and size baseline failures. Defer the full run to the ten-task checkpoint.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert task-related commit(s).
- Re-run required checks to confirm rollback safety.

## Findings
