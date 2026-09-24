---
id: "202609241135-RF2T8B"
title: "F3 Move Writer edit and transfer operations to upstream owners"
status: "DOING"
priority: "high"
owner: "CODER"
revision: 5
origin:
  system: "manual"
depends_on:
  - "202609241135-WGR5X8"
tags:
  - "code"
  - "parity"
verify:
  - "npm run verify"
plan_approval:
  state: "approved"
  updated_at: "2026-09-24T12:01:59.326Z"
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
    body: "Start: implement F3 ownership corrections against pinned Writer edit and transfer modules, preserving the browser boundary."
events:
  -
    type: "status"
    at: "2026-09-24T12:02:00.244Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implement F3 ownership corrections against pinned Writer edit and transfer modules, preserving the browser boundary."
doc_version: 3
doc_updated_at: "2026-09-24T12:02:00.244Z"
doc_updated_by: "CODER"
description: "Implement F3: put edit and transfer logic under upstream-corresponding core/edit and uibase/dochdl owners; keep browser DTOs at boundaries."
sections:
  Summary: |-
    F3 Move Writer edit and transfer operations to upstream owners

    Implement F3: put edit and transfer logic under upstream-corresponding core/edit and uibase/dochdl owners; keep browser DTOs at boundaries.
  Scope: |-
    - In scope: Implement F3: put edit and transfer logic under upstream-corresponding core/edit and uibase/dochdl owners; keep browser DTOs at boundaries.
    - Out of scope: unrelated refactors not required for "F3 Move Writer edit and transfer operations to upstream owners".
  Plan: |-
    1. Trace F3 exports and imports to pinned ndtxt.cxx/ndhints.cxx, editsh.cxx and swdtflvr.cxx.
    2. Move ownership and boundary DTOs to the closest upstream or browser module; remove forwarding files after imports migrate.
    3. Update only existing provenance/inventory data, run focused and full checks, then record verification.
  Verify Steps: |-
    1. Hyperlink editing resolves to the core/edit editsh owner and transfer preparation/paste to uibase/dochdl swdtflvr; run DTO normalization lives in a browser boundary and filter DTOs sit with their producer/consumer.
    2. Existing hyperlink, clipboard, HTML and ODT tests plus focused boundary checks pass; source provenance and runtime inventory data match every moved export.
    3. npm run verify and git diff --check pass.
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

F3 Move Writer edit and transfer operations to upstream owners

Implement F3: put edit and transfer logic under upstream-corresponding core/edit and uibase/dochdl owners; keep browser DTOs at boundaries.

## Scope

- In scope: Implement F3: put edit and transfer logic under upstream-corresponding core/edit and uibase/dochdl owners; keep browser DTOs at boundaries.
- Out of scope: unrelated refactors not required for "F3 Move Writer edit and transfer operations to upstream owners".

## Plan

1. Trace F3 exports and imports to pinned ndtxt.cxx/ndhints.cxx, editsh.cxx and swdtflvr.cxx.
2. Move ownership and boundary DTOs to the closest upstream or browser module; remove forwarding files after imports migrate.
3. Update only existing provenance/inventory data, run focused and full checks, then record verification.

## Verify Steps

1. Hyperlink editing resolves to the core/edit editsh owner and transfer preparation/paste to uibase/dochdl swdtflvr; run DTO normalization lives in a browser boundary and filter DTOs sit with their producer/consumer.
2. Existing hyperlink, clipboard, HTML and ODT tests plus focused boundary checks pass; source provenance and runtime inventory data match every moved export.
3. npm run verify and git diff --check pass.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert task-related commit(s).
- Re-run required checks to confirm rollback safety.

## Findings
