---
id: "202611220524-FE39NC"
title: "Connect Writer page line-spacing and the baseline grid"
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
  updated_at: "2026-11-22T05:25:03.957Z"
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
    at: "2026-11-22T05:25:40.948Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: continue direct-mode task in current checkout."
doc_version: 3
doc_updated_at: "2026-11-22T05:25:40.948Z"
doc_updated_by: "CODER"
description: "Expose the page register format and paragraph register attribute through their original controls, connect line placement, and add the native View Baseline Grid command and paint."
sections:
  Summary: |-
    Connect Writer page line-spacing and the baseline grid

    Expose the page register format and paragraph register attribute through their original controls, connect line placement, and add the native View Baseline Grid command and paint.
  Scope: "Writer page line-spacing reference style, paragraph register control, native item exchange and descriptor ownership with copy, history and storage, the represented text-frame baseline placement and original View Baseline Grid command and paint. Scope includes Writer view preferences, generated menu resources and focused tests, provenance and upstream observations."
  Plan: "Follow the original SwPageDesc register style and Sfx item exchange in uitool.cxx, the Page and Paragraph controls in page.cxx and paragrph.cxx, SwTextFrame::FillRegister and SwPageFrame::ComputeRegister, and the separate View Baseline Grid in view0.cxx and paintfrm.cxx. Preserve style identity and default fallback, browser print and view behavior, and existing CJK Text Grid. Use the existing browser device projection for font metrics and maintain ODF and Worker compatibility. Record source-backed upstream issues while preserving the source behavior."
  Verify Steps: "Run targeted Writer Page Style, paragraph register formatting, native register ownership and history, baseline layout and command state, ODF and Worker tests. Verify reference style selection, rename or removal, paragraph participation, view toggle, preview or paint, and undo and redo. Run focused Chromium Page Style and baseline-grid scenarios, production build, scoped lint and formatting, module boundaries, provenance, source tree, generated Writer resources, doctor, and routing. Existing global Calc size and documentation reports are baseline. Defer the full run to the ten-task checkpoint."
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

Connect Writer page line-spacing and the baseline grid

Expose the page register format and paragraph register attribute through their original controls, connect line placement, and add the native View Baseline Grid command and paint.

## Scope

Writer page line-spacing reference style, paragraph register control, native item exchange and descriptor ownership with copy, history and storage, the represented text-frame baseline placement and original View Baseline Grid command and paint. Scope includes Writer view preferences, generated menu resources and focused tests, provenance and upstream observations.

## Plan

Follow the original SwPageDesc register style and Sfx item exchange in uitool.cxx, the Page and Paragraph controls in page.cxx and paragrph.cxx, SwTextFrame::FillRegister and SwPageFrame::ComputeRegister, and the separate View Baseline Grid in view0.cxx and paintfrm.cxx. Preserve style identity and default fallback, browser print and view behavior, and existing CJK Text Grid. Use the existing browser device projection for font metrics and maintain ODF and Worker compatibility. Record source-backed upstream issues while preserving the source behavior.

## Verify Steps

Run targeted Writer Page Style, paragraph register formatting, native register ownership and history, baseline layout and command state, ODF and Worker tests. Verify reference style selection, rename or removal, paragraph participation, view toggle, preview or paint, and undo and redo. Run focused Chromium Page Style and baseline-grid scenarios, production build, scoped lint and formatting, module boundaries, provenance, source tree, generated Writer resources, doctor, and routing. Existing global Calc size and documentation reports are baseline. Defer the full run to the ten-task checkpoint.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert task-related commit(s).
- Re-run required checks to confirm rollback safety.

## Findings
