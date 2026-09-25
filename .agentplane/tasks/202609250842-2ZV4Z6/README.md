---
id: "202609250842-2ZV4Z6"
title: "Match supported Writer rendering and print output to LibreOffice"
status: "DOING"
priority: "high"
owner: "CODER"
revision: 9
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-09-25T08:43:35.592Z"
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
    body: "Start: Implement approved LibreOffice rendering parity for supported Writer formatting, table pagination and print-only document presentation."
events:
  -
    type: "status"
    at: "2026-09-25T08:43:36.303Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: Implement approved LibreOffice rendering parity for supported Writer formatting, table pagination and print-only document presentation."
doc_version: 3
doc_updated_at: "2026-09-25T10:51:11.468Z"
doc_updated_by: "CODER"
description: "Correct existing supported ODT style defaults, text geometry, page filling, table layout and print presentation against vendored LibreOffice and the supplied certification document; printed pages contain only document content."
sections:
  Summary: |-
    Match supported Writer rendering and print output to LibreOffice

    Correct existing supported ODT style defaults, text geometry, page filling, table layout and print presentation against vendored LibreOffice and the supplied certification document; printed pages contain only document content.
  Scope: "In scope: existing supported ODT character and paragraph properties, defaults, page geometry, text shaping and pagination, table sizing and page splitting, and print-only document projection. Compare supplied certification ODT against LibreOffice and vendored source. No new ODT feature families or network access."
  Plan: "1. Reproduce ODT and table/print discrepancies; map each to vendored LibreOffice symbols and current core/UI paths. 2. Correct core defaults, style resolution, text and table layout while preserving source ownership and public interfaces. 3. Make browser projection and print output use document geometry and hide all editor-only controls and states. 4. Add targeted differential and browser print assertions; run focused checks, then npm run verify, inspect diff and finish."
  Verify Steps: "Accepted closeout scope (user direction on 2026-09-25): 1. Supported table cells wrap at document width, rows flow between pages without internal scrollbars, and focused layout/browser tests pass. 2. Print output hides editor selection, focus, controls, and helper chrome, with focused print test evidence. 3. Embedded font style/weight and ODF generic-family metadata round-trip; all locally installed LibreOffice runtime font files are present and covered by source and inventory records. 4. npm run verify passes, including coverage and inventory checks. 5. Record the remaining LibreOffice GUI first-page and font-substitution deviation in repository docs and runtime inventory, then commit task-scoped changes with clean tracked state. Exact 1:1 layout parity is an accepted residual for this closeout."
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert the task commit and rerun focused Writer layout and print tests plus npm run verify."
  Findings: "Upstream font binaries are external packages: external/more_fonts/ExternalPackage_*.mk lists runtime faces and download.lst declares their archives. The local installed LibreOffice application supplies 127 runtime TTF/OTF files under Contents/Resources/fonts/truetype; these are now copied to the analogous browser public path. No Overpass face is present in the pinned source tree, the installed LibreOffice font bundle, or the ODT package. VCL font matching runs through PhysicalFontCollection::FindFontFamily and PhysicalFontFamily::CalcType, including host physical font enumeration. The browser generic-family adapter is only partial and remains classified divergent. GUI LibreOffice places the Dell Technologies Info Hub link at the end of page 1 of the supplied ODT; the current browser page 1 also contains the following DelfiN and EQTY paragraphs. Table flow, print cleanup, and embedded font style metadata were improved and tested, but first-page 1:1 parity and full VCL/CoreText substitution are not verified."
id_source: "generated"
---
## Summary

Match supported Writer rendering and print output to LibreOffice

Correct existing supported ODT style defaults, text geometry, page filling, table layout and print presentation against vendored LibreOffice and the supplied certification document; printed pages contain only document content.

## Scope

In scope: existing supported ODT character and paragraph properties, defaults, page geometry, text shaping and pagination, table sizing and page splitting, and print-only document projection. Compare supplied certification ODT against LibreOffice and vendored source. No new ODT feature families or network access.

## Plan

1. Reproduce ODT and table/print discrepancies; map each to vendored LibreOffice symbols and current core/UI paths. 2. Correct core defaults, style resolution, text and table layout while preserving source ownership and public interfaces. 3. Make browser projection and print output use document geometry and hide all editor-only controls and states. 4. Add targeted differential and browser print assertions; run focused checks, then npm run verify, inspect diff and finish.

## Verify Steps

Accepted closeout scope (user direction on 2026-09-25): 1. Supported table cells wrap at document width, rows flow between pages without internal scrollbars, and focused layout/browser tests pass. 2. Print output hides editor selection, focus, controls, and helper chrome, with focused print test evidence. 3. Embedded font style/weight and ODF generic-family metadata round-trip; all locally installed LibreOffice runtime font files are present and covered by source and inventory records. 4. npm run verify passes, including coverage and inventory checks. 5. Record the remaining LibreOffice GUI first-page and font-substitution deviation in repository docs and runtime inventory, then commit task-scoped changes with clean tracked state. Exact 1:1 layout parity is an accepted residual for this closeout.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert the task commit and rerun focused Writer layout and print tests plus npm run verify.

## Findings

Upstream font binaries are external packages: external/more_fonts/ExternalPackage_*.mk lists runtime faces and download.lst declares their archives. The local installed LibreOffice application supplies 127 runtime TTF/OTF files under Contents/Resources/fonts/truetype; these are now copied to the analogous browser public path. No Overpass face is present in the pinned source tree, the installed LibreOffice font bundle, or the ODT package. VCL font matching runs through PhysicalFontCollection::FindFontFamily and PhysicalFontFamily::CalcType, including host physical font enumeration. The browser generic-family adapter is only partial and remains classified divergent. GUI LibreOffice places the Dell Technologies Info Hub link at the end of page 1 of the supplied ODT; the current browser page 1 also contains the following DelfiN and EQTY paragraphs. Table flow, print cleanup, and embedded font style metadata were improved and tested, but first-page 1:1 parity and full VCL/CoreText substitution are not verified.
