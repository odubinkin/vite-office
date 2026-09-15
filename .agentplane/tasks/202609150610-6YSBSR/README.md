---
id: "202609150610-6YSBSR"
title: "Accept LibreOffice default page layout in ODT import"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 10
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-09-15T06:11:23.857Z"
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
    body: "Start: align default-page-layout token and styles dispatch with pinned LibreOffice, add the approved ODT import regression, then hand off verification."
events:
  -
    type: "status"
    at: "2026-09-15T06:11:32.406Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: align default-page-layout token and styles dispatch with pinned LibreOffice, add the approved ODT import regression, then hand off verification."
doc_version: 3
doc_updated_at: "2026-09-15T06:11:32.406Z"
doc_updated_by: "CODER"
description: "Align the bounded Writer ODF importer with pinned LibreOffice handling of style:default-page-layout and add a package-level regression test."
sections:
  Summary: "Accept LibreOffice-produced ODT files containing style:default-page-layout by aligning the bounded token and styles-context dispatch with pinned upstream LibreOffice."
  Scope: "Modify apps/office/src/xmloff/source/core/xmltoken.ts and apps/office/src/xmloff/source/style/xmlstylei.ts; add a package-level regression in apps/office/src/sw/source/filter/xml/odt-roundtrip.test.ts. Preserve the existing bounded importer and ignore unsupported page-layout semantics."
  Plan: "1. Add the upstream XML_DEFAULT_PAGE_LAYOUT equivalent to the local style namespace token table. 2. Dispatch it beside STYLE_PAGE_LAYOUT through the existing ignored page-layout subtree policy. 3. Add an ODT import regression using LibreOffice-shaped styles.xml with nested default page layout properties. 4. Run targeted and repository verification, record evidence, and finish the direct-mode task."
  Verify Steps: |-
    1. Run: npm exec vitest run --workspace @vite-office/office -- apps/office/src/sw/source/filter/xml/odt-roundtrip.test.ts. Expected: the LibreOffice default-page-layout regression and existing ODT filter tests pass.
    2. Run: npm run verify. Expected: formatting, lint, typechecking, dependency boundaries, coverage, browser E2E/static checks, documentation, source tree/provenance, and parity checks all pass.
    3. Run: ap doctor. Expected: Agentplane repository health checks pass.
    4. Run: node .agentplane/policy/check-routing.mjs. Expected: policy routing and size budgets pass.
  Verification: "Pending execution by TESTER after implementation."
  Rollback Plan: "Revert only the token entry, style-context dispatch entry, and regression test introduced by this task; no data migration or external state is involved."
  Findings: "Pinned LibreOffice 9bc445578031fecf56086729d8e4940c77e14d65 tokenizes default-page-layout and handles it beside page-layout in SvXMLStylesContext::CreateStyleChildContext. The local omission makes the SAX adapter reject the element before XMLStylesContext can apply its bounded ignore policy."
id_source: "generated"
---
## Summary

Accept LibreOffice-produced ODT files containing style:default-page-layout by aligning the bounded token and styles-context dispatch with pinned upstream LibreOffice.

## Scope

Modify apps/office/src/xmloff/source/core/xmltoken.ts and apps/office/src/xmloff/source/style/xmlstylei.ts; add a package-level regression in apps/office/src/sw/source/filter/xml/odt-roundtrip.test.ts. Preserve the existing bounded importer and ignore unsupported page-layout semantics.

## Plan

1. Add the upstream XML_DEFAULT_PAGE_LAYOUT equivalent to the local style namespace token table. 2. Dispatch it beside STYLE_PAGE_LAYOUT through the existing ignored page-layout subtree policy. 3. Add an ODT import regression using LibreOffice-shaped styles.xml with nested default page layout properties. 4. Run targeted and repository verification, record evidence, and finish the direct-mode task.

## Verify Steps

1. Run: npm exec vitest run --workspace @vite-office/office -- apps/office/src/sw/source/filter/xml/odt-roundtrip.test.ts. Expected: the LibreOffice default-page-layout regression and existing ODT filter tests pass.
2. Run: npm run verify. Expected: formatting, lint, typechecking, dependency boundaries, coverage, browser E2E/static checks, documentation, source tree/provenance, and parity checks all pass.
3. Run: ap doctor. Expected: Agentplane repository health checks pass.
4. Run: node .agentplane/policy/check-routing.mjs. Expected: policy routing and size budgets pass.

## Verification

Pending execution by TESTER after implementation.

## Rollback Plan

Revert only the token entry, style-context dispatch entry, and regression test introduced by this task; no data migration or external state is involved.

## Findings

Pinned LibreOffice 9bc445578031fecf56086729d8e4940c77e14d65 tokenizes default-page-layout and handles it beside page-layout in SvXMLStylesContext::CreateStyleChildContext. The local omission makes the SAX adapter reject the element before XMLStylesContext can apply its bounded ignore policy.
