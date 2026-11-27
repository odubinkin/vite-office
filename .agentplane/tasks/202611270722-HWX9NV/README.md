---
id: "202611270722-HWX9NV"
title: "Align Writer ODT master-page style identity and references with LibreOffice"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 5
origin:
  system: "manual"
depends_on: []
tags:
  - "odt"
  - "writer"
  - "code"
verify:
  - "Run focused Writer ODT master-page, header/footer, paragraph-style and Worker round-trip tests."
  - "Run Office typecheck, scoped ESLint and format, dependency and provenance checks, Writer/shared registry invariants, routing and git diff checks."
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
doc_updated_at: "2026-11-27T07:24:32.756Z"
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
    - Run existing Writer master-page, header/footer, paragraph style, declarations, ODT round-trip and related Worker filters. Exercise the pinned default page usage assertion and encoded page names through ODT and Worker.
    - Run Office typecheck, changed-file lint and format, dependencies, source provenance, Writer/shared inventory, routing, AgentPlane doctor and git diff checks.
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

- Run existing Writer master-page, header/footer, paragraph style, declarations, ODT round-trip and related Worker filters. Exercise the pinned default page usage assertion and encoded page names through ODT and Worker.
- Run Office typecheck, changed-file lint and format, dependencies, source provenance, Writer/shared inventory, routing, AgentPlane doctor and git diff checks.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert task-related commit(s).
- Re-run required checks to confirm rollback safety.

## Findings
