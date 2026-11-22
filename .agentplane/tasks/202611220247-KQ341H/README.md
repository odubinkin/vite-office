---
id: "202611220247-KQ341H"
title: "Align Calc ODS master-page headers and footers"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 5
origin:
  system: "manual"
depends_on:
  - "202611220216-0YJAN7"
tags:
  - "calc"
  - "code"
  - "ods"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-11-22T02:47:50.928Z"
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
    at: "2026-11-22T02:48:46.420Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: continue direct-mode task in current checkout."
doc_version: 3
doc_updated_at: "2026-11-22T02:48:46.420Z"
doc_updated_by: "CODER"
description: "Preserve native page-style header/footer variants, regions and dimensions through Calc ODS and Worker, including source fixture regressions."
sections:
  Summary: "Align Calc's ODF master-page header/footer text, visibility and page-layout item handling with the pinned LibreOffice implementation."
  Scope: |-
    - Use Calc's original right, left and first header/footer variants, native content regions and sharing flags. Match center-only and empty region emission, including hidden variants with stored content.
    - Apply the page-layout mapper to the original nested height, body distance, margins, background color, border and padding items. Reuse Calc's native page box mapper. Preserve authored and default values through the ODS stream and the Calc Worker style path.
    - Port the applicable pinned Calc ODS header/footer regression. Keep the scope on the existing page style and EditEngine field profile.
  Plan: "Trace pinned master-page text, layout and UNO setters; implement native header/footer region and nested item rules; verify original ODS fixtures and Worker transfer."
  Verify Steps: |-
    - Run focused Calc ODS page master, header/footer and native page-item tests plus directly affected Worker and page-style editor tests.
    - Run scoped ESLint and Prettier, Office typecheck, module boundaries, source provenance, Calc registry invariants, routing, AgentPlane doctor and git diff checks.
    - Record deterministic verification and refresh the graph at closeout. This is the ninth task in the next ten-task regression cadence.
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert this task's code and provenance commits and rerun the focused Calc page-style and header/footer tests."
  Findings: ""
id_source: "generated"
---
## Summary

Align Calc's ODF master-page header/footer text, visibility and page-layout item handling with the pinned LibreOffice implementation.

## Scope

- Use Calc's original right, left and first header/footer variants, native content regions and sharing flags. Match center-only and empty region emission, including hidden variants with stored content.
- Apply the page-layout mapper to the original nested height, body distance, margins, background color, border and padding items. Reuse Calc's native page box mapper. Preserve authored and default values through the ODS stream and the Calc Worker style path.
- Port the applicable pinned Calc ODS header/footer regression. Keep the scope on the existing page style and EditEngine field profile.

## Plan

Trace pinned master-page text, layout and UNO setters; implement native header/footer region and nested item rules; verify original ODS fixtures and Worker transfer.

## Verify Steps

- Run focused Calc ODS page master, header/footer and native page-item tests plus directly affected Worker and page-style editor tests.
- Run scoped ESLint and Prettier, Office typecheck, module boundaries, source provenance, Calc registry invariants, routing, AgentPlane doctor and git diff checks.
- Record deterministic verification and refresh the graph at closeout. This is the ninth task in the next ten-task regression cadence.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert this task's code and provenance commits and rerun the focused Calc page-style and header/footer tests.

## Findings
