---
id: "202611220229-W6AEMB"
title: "Connect Writer paragraph border formatting"
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
  updated_at: "2026-11-22T02:29:58.575Z"
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
    body: "Start: connect the native paragraph border page, item exchange, paint, and ODT persistence in Writer."
events:
  -
    type: "status"
    at: "2026-11-22T02:30:17.591Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: connect the native paragraph border page, item exchange, paint, and ODT persistence in Writer."
doc_version: 3
doc_updated_at: "2026-11-22T02:30:17.591Z"
doc_updated_by: "CODER"
description: "Connect the native Borders page to the ordinary Writer Paragraph dialog. Reuse the CUI border editor and pooled box, shadow and connect-border items; preserve mixed selections, paint and ODT round trip."
sections:
  Summary: |-
    Connect Writer paragraph border formatting

    Connect the native Borders page to the ordinary Writer Paragraph dialog. Reuse the CUI border editor and pooled box, shadow and connect-border items; preserve mixed selections, paint and ODT round trip.
  Scope: |-
    - In scope: Connect the native Borders page to the ordinary Writer Paragraph dialog. Reuse the CUI border editor and pooled box, shadow and connect-border items; preserve mixed selections, paint and ODT round trip.
    - Out of scope: unrelated refactors not required for "Connect Writer paragraph border formatting".
  Plan: "Port the native SwParaDlg Borders item exchange and mode using the shared CUI border editor. Use document-owned box, shadow and connect-border values. Preserve unaffected mixed edges on apply and support undo, rendering and ODT reopen. Verify with focused tests and the production browser path. Do not alter file lifecycle behavior."
  Verify Steps: "Run focused Writer tests for Paragraph Borders, native selection and history, paragraph border projection and ODT round trip. Run shared CUI Borders tests. Build the office workspace and run the focused Chromium Paragraph acceptance case. Run Writer resources, source and provenance checks, module boundaries, scoped lint/format, AgentPlane doctor and policy routing. Check repository-wide docs and size, and record applicable baseline failures."
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert the scoped implementation commits and rerun the focused paragraph border, shared CUI and ODT checks."
  Findings: ""
id_source: "generated"
---
## Summary

Connect Writer paragraph border formatting

Connect the native Borders page to the ordinary Writer Paragraph dialog. Reuse the CUI border editor and pooled box, shadow and connect-border items; preserve mixed selections, paint and ODT round trip.

## Scope

- In scope: Connect the native Borders page to the ordinary Writer Paragraph dialog. Reuse the CUI border editor and pooled box, shadow and connect-border items; preserve mixed selections, paint and ODT round trip.
- Out of scope: unrelated refactors not required for "Connect Writer paragraph border formatting".

## Plan

Port the native SwParaDlg Borders item exchange and mode using the shared CUI border editor. Use document-owned box, shadow and connect-border values. Preserve unaffected mixed edges on apply and support undo, rendering and ODT reopen. Verify with focused tests and the production browser path. Do not alter file lifecycle behavior.

## Verify Steps

Run focused Writer tests for Paragraph Borders, native selection and history, paragraph border projection and ODT round trip. Run shared CUI Borders tests. Build the office workspace and run the focused Chromium Paragraph acceptance case. Run Writer resources, source and provenance checks, module boundaries, scoped lint/format, AgentPlane doctor and policy routing. Check repository-wide docs and size, and record applicable baseline failures.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert the scoped implementation commits and rerun the focused paragraph border, shared CUI and ODT checks.

## Findings
