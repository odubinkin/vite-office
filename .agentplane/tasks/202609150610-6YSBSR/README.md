---
id: "202609150610-6YSBSR"
title: "Accept LibreOffice default page layout in ODT import"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 16
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-09-15T06:22:12.234Z"
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
doc_updated_at: "2026-09-15T06:17:26.962Z"
doc_updated_by: "CODER"
description: "Align the bounded Writer ODF importer with pinned LibreOffice handling of style:default-page-layout and add a package-level regression test."
sections:
  Summary: "Accept LibreOffice-produced ODT files containing style:default-page-layout by aligning the bounded token and styles-context dispatch with pinned upstream LibreOffice."
  Scope: "Modify apps/office/src/xmloff/source/core/xmltoken.ts, apps/office/src/xmloff/source/core/xml-parser.ts, apps/office/src/xmloff/source/core/xml-parser.test.ts, apps/office/src/xmloff/source/style/xmlstylei.ts, and apps/office/src/sw/source/filter/xml/odt-roundtrip.test.ts. Align default-page-layout handling and unknown child-element tolerance with pinned upstream. Preserve fatal unknown-root handling, existing known-element semantic rejection, resource limits, and the bounded importer architecture."
  Plan: "1. Add the upstream XML_DEFAULT_PAGE_LAYOUT equivalent and dispatch it beside STYLE_PAGE_LAYOUT through the bounded ignored page-layout policy. 2. Match upstream unknown-element tolerance by warning on an unhandled unknown child and substituting an ignore context for its complete subtree, while preserving root and known semantic failures. 3. Add fast-parser and package-level ODT regressions. 4. Run targeted and repository verification, record evidence, and finish the direct-mode task."
  Verify Steps: |-
    1. Run: npm exec vitest run --workspace @vite-office/office -- src/xmloff/source/core/xml-parser.test.ts src/sw/source/filter/xml/odt-roundtrip.test.ts. Expected: default-page-layout and unknown-child regressions plus existing parser/filter tests pass.
    2. Run: npm run verify. Expected: formatting, lint, typechecking, dependency boundaries, coverage, browser E2E/static checks, documentation, source tree/provenance, and parity checks all pass.
    3. Run: ap doctor. Expected: Agentplane repository health checks pass.
    4. Run: node .agentplane/policy/check-routing.mjs. Expected: policy routing and size budgets pass.
  Verification: "Pending execution by TESTER after implementation."
  Rollback Plan: "Revert only the token entry, style-context dispatch entry, and regression test introduced by this task; no data migration or external state is involved."
  Findings: "Pinned LibreOffice 9bc445578031fecf56086729d8e4940c77e14d65 tokenizes default-page-layout and handles it beside page-layout in SvXMLStylesContext::CreateStyleChildContext. Its fast parser and SvXMLImport semantic layer do not abort on an unhandled unknown child: the missing context causes the subtree to be skipped, with SvXMLImport::startUnknownElement emitting a diagnostic; an unknown root is still recorded as a severe import error. The local parser currently throws for every null context, so the approved correction distinguishes unknown children from roots and known semantic rejections."
id_source: "generated"
---
## Summary

Accept LibreOffice-produced ODT files containing style:default-page-layout by aligning the bounded token and styles-context dispatch with pinned upstream LibreOffice.

## Scope

Modify apps/office/src/xmloff/source/core/xmltoken.ts, apps/office/src/xmloff/source/core/xml-parser.ts, apps/office/src/xmloff/source/core/xml-parser.test.ts, apps/office/src/xmloff/source/style/xmlstylei.ts, and apps/office/src/sw/source/filter/xml/odt-roundtrip.test.ts. Align default-page-layout handling and unknown child-element tolerance with pinned upstream. Preserve fatal unknown-root handling, existing known-element semantic rejection, resource limits, and the bounded importer architecture.

## Plan

1. Add the upstream XML_DEFAULT_PAGE_LAYOUT equivalent and dispatch it beside STYLE_PAGE_LAYOUT through the bounded ignored page-layout policy. 2. Match upstream unknown-element tolerance by warning on an unhandled unknown child and substituting an ignore context for its complete subtree, while preserving root and known semantic failures. 3. Add fast-parser and package-level ODT regressions. 4. Run targeted and repository verification, record evidence, and finish the direct-mode task.

## Verify Steps

1. Run: npm exec vitest run --workspace @vite-office/office -- src/xmloff/source/core/xml-parser.test.ts src/sw/source/filter/xml/odt-roundtrip.test.ts. Expected: default-page-layout and unknown-child regressions plus existing parser/filter tests pass.
2. Run: npm run verify. Expected: formatting, lint, typechecking, dependency boundaries, coverage, browser E2E/static checks, documentation, source tree/provenance, and parity checks all pass.
3. Run: ap doctor. Expected: Agentplane repository health checks pass.
4. Run: node .agentplane/policy/check-routing.mjs. Expected: policy routing and size budgets pass.

## Verification

Pending execution by TESTER after implementation.

## Rollback Plan

Revert only the token entry, style-context dispatch entry, and regression test introduced by this task; no data migration or external state is involved.

## Findings

Pinned LibreOffice 9bc445578031fecf56086729d8e4940c77e14d65 tokenizes default-page-layout and handles it beside page-layout in SvXMLStylesContext::CreateStyleChildContext. Its fast parser and SvXMLImport semantic layer do not abort on an unhandled unknown child: the missing context causes the subtree to be skipped, with SvXMLImport::startUnknownElement emitting a diagnostic; an unknown root is still recorded as a severe import error. The local parser currently throws for every null context, so the approved correction distinguishes unknown children from roots and known semantic rejections.
