---
id: "202611270722-HWX9NV"
title: "Align Writer ODT master-page style identity and references with LibreOffice"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 4
origin:
  system: "manual"
depends_on: []
tags:
  - "odt"
  - "writer"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-11-27T07:22:49.525Z"
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
    body: "Start: Align Writer ODT master-page identity and style links with the pinned native contracts."
events:
  -
    type: "status"
    at: "2026-11-27T07:22:49.910Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: Align Writer ODT master-page identity and style links with the pinned native contracts."
doc_version: 3
doc_updated_at: "2026-11-27T07:22:49.910Z"
doc_updated_by: "CODER"
description: "Use the pinned XMLTextMasterPageContext and XMLPageExport contracts to preserve encoded names, display identity, page-layout and follow links, and paragraph references through the existing Writer ODT and Worker owners. Compare fallback behavior and run focused page-style, paragraph-style and ODT round-trip checks."
sections:
  Summary: |-
    Align Writer ODT master-page style identity and references with LibreOffice

    Use the pinned XMLTextMasterPageContext and XMLPageExport contracts to preserve encoded names, display identity, page-layout and follow links, and paragraph references through the existing Writer ODT and Worker owners. Compare fallback behavior and run focused page-style, paragraph-style and ODT round-trip checks.
  Scope: |-
    - In scope: Use the pinned XMLTextMasterPageContext and XMLPageExport contracts to preserve encoded names, display identity, page-layout and follow links, and paragraph references through the existing Writer ODT and Worker owners. Compare fallback behavior and run focused page-style, paragraph-style and ODT round-trip checks.
    - Out of scope: unrelated refactors not required for "Align Writer ODT master-page style identity and references with LibreOffice".
  Plan: |-
    1. Compare the native master-page context, display-name registration, layout lookup, FollowStyle and paragraph PageDescName assignment. Use the repository and pinned source graphs to locate the owners.
    2. Apply the original declarative master-page identity and resolution rules to the existing page-style, paragraph style and XML import/export entry points. Preserve the existing header/footer owner and package lifecycle.
    3. Update existing master-page assertions for the corrected behavior. Run the related Writer ODT, page-style and Worker tests and required static checks.
  Verify Steps: |-
    PLANNER fallback scaffold for "Align Writer ODT master-page style identity and references with LibreOffice". Replace with task-specific acceptance checks when PLANNER context is available.

    1. Review the requested outcome for "Align Writer ODT master-page style identity and references with LibreOffice". Expected: the visible result matches ## Summary and stays inside approved scope.
    2. Run the most relevant validation step for this task. Expected: it succeeds without unexpected regressions in touched behavior.
    3. Compare the final result against ## Scope and record any residual follow-up in ## Findings. Expected: open edges are explicit rather than implicit.
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

Align Writer ODT master-page style identity and references with LibreOffice

Use the pinned XMLTextMasterPageContext and XMLPageExport contracts to preserve encoded names, display identity, page-layout and follow links, and paragraph references through the existing Writer ODT and Worker owners. Compare fallback behavior and run focused page-style, paragraph-style and ODT round-trip checks.

## Scope

- In scope: Use the pinned XMLTextMasterPageContext and XMLPageExport contracts to preserve encoded names, display identity, page-layout and follow links, and paragraph references through the existing Writer ODT and Worker owners. Compare fallback behavior and run focused page-style, paragraph-style and ODT round-trip checks.
- Out of scope: unrelated refactors not required for "Align Writer ODT master-page style identity and references with LibreOffice".

## Plan

1. Compare the native master-page context, display-name registration, layout lookup, FollowStyle and paragraph PageDescName assignment. Use the repository and pinned source graphs to locate the owners.
2. Apply the original declarative master-page identity and resolution rules to the existing page-style, paragraph style and XML import/export entry points. Preserve the existing header/footer owner and package lifecycle.
3. Update existing master-page assertions for the corrected behavior. Run the related Writer ODT, page-style and Worker tests and required static checks.

## Verify Steps

PLANNER fallback scaffold for "Align Writer ODT master-page style identity and references with LibreOffice". Replace with task-specific acceptance checks when PLANNER context is available.

1. Review the requested outcome for "Align Writer ODT master-page style identity and references with LibreOffice". Expected: the visible result matches ## Summary and stays inside approved scope.
2. Run the most relevant validation step for this task. Expected: it succeeds without unexpected regressions in touched behavior.
3. Compare the final result against ## Scope and record any residual follow-up in ## Findings. Expected: open edges are explicit rather than implicit.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert task-related commit(s).
- Re-run required checks to confirm rollback safety.

## Findings
