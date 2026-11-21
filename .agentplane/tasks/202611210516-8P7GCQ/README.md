---
id: "202611210516-8P7GCQ"
title: "Connect Calc page style settings to the Format dialog"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 12
origin:
  system: "manual"
depends_on: []
tags:
  - "calc"
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-11-21T05:17:08.468Z"
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
    body: "Start: Connect the canonical page style item sets and source-ordered dialog to the Calc Format slot."
events:
  -
    type: "status"
    at: "2026-11-21T05:17:08.832Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: Connect the canonical page style item sets and source-ordered dialog to the Calc Format slot."
doc_version: 3
doc_updated_at: "2026-11-21T05:42:17.612Z"
doc_updated_by: "CODER"
description: "Connect native Calc page style editing to the shared style and item pool, preserving the LibreOffice tab structure and printed sheet settings."
sections:
  Summary: "Connect the original Calc Format Page Style dialog to canonical page styles."
  Scope: "Use original General, Page, Borders, Background, Header, Footer, and Sheet structure to edit existing page style state. Retain the typed Sfx item contract, style-sharing semantics, and existing ODS save and reopen route. Standalone header and footer content editing and printer rendering remain separate workflows."
  Plan: "Port the source Sheet and header/footer settings and reuse shared page controls. Build the source-ordered browser dialog, bind the original view-shell slot and document style transaction, and verify persisted and shared state."
  Verify Steps: |-
    - Run the focused Calc page-style, ODS and Excel page-settings, and relevant UI resource tests.
    - Run tooling and office TypeScript, changed-path ESLint and Prettier.
    - Verify Calc resource generation, provenance, file size, and patch whitespace.
  Verification: "Pending implementation and targeted verification."
  Rollback Plan: "Revert the implementation commit to remove the connected dialog and preserve previously stored page settings."
  Findings: |-
    The original Format Page Style slot edits the active sheet's shared Page-family style. Page formatting, borders, solid page background, header and footer settings, and the three Sheet scaling modes use the current native items. ODS master pages without a header or footer child are imported with the corresponding component off, even when the initialized style has native default geometry. CALC-787 and CALC-788 retain the observed source scaling comparisons and fallback order.

    The covered upstream UI scenarios are tdf123508 and tdf144940. The standalone and nested header/footer content editors, printer-driven pagination, and graphic page fills remain separate source work. The shared border presenter uses the existing Writer and Calc metric controls via their browser adapters, respecting the CUI module boundary.
id_source: "generated"
---
## Summary

Connect the original Calc Format Page Style dialog to canonical page styles.

## Scope

Use original General, Page, Borders, Background, Header, Footer, and Sheet structure to edit existing page style state. Retain the typed Sfx item contract, style-sharing semantics, and existing ODS save and reopen route. Standalone header and footer content editing and printer rendering remain separate workflows.

## Plan

Port the source Sheet and header/footer settings and reuse shared page controls. Build the source-ordered browser dialog, bind the original view-shell slot and document style transaction, and verify persisted and shared state.

## Verify Steps

- Run the focused Calc page-style, ODS and Excel page-settings, and relevant UI resource tests.
- Run tooling and office TypeScript, changed-path ESLint and Prettier.
- Verify Calc resource generation, provenance, file size, and patch whitespace.

## Verification

Pending implementation and targeted verification.

## Rollback Plan

Revert the implementation commit to remove the connected dialog and preserve previously stored page settings.

## Findings

The original Format Page Style slot edits the active sheet's shared Page-family style. Page formatting, borders, solid page background, header and footer settings, and the three Sheet scaling modes use the current native items. ODS master pages without a header or footer child are imported with the corresponding component off, even when the initialized style has native default geometry. CALC-787 and CALC-788 retain the observed source scaling comparisons and fallback order.

The covered upstream UI scenarios are tdf123508 and tdf144940. The standalone and nested header/footer content editors, printer-driven pagination, and graphic page fills remain separate source work. The shared border presenter uses the existing Writer and Calc metric controls via their browser adapters, respecting the CUI module boundary.
