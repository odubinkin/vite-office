---
id: "202611211845-XEPNMP"
title: "Preserve Calc ODS conditional data bars"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 5
origin:
  system: "manual"
depends_on: []
tags:
  - "calc"
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-11-21T18:45:41.478Z"
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
    body: "Start: implement Calc ODS data-bar import, rule evaluation and round-trip serialization."
events:
  -
    type: "status"
    at: "2026-11-21T18:45:45.969Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implement Calc ODS data-bar import, rule evaluation and round-trip serialization."
doc_version: 3
doc_updated_at: "2026-11-21T18:45:45.969Z"
doc_updated_by: "CODER"
description: "Port the native ScDataBarFormat owner, threshold evaluation and ODS import/export contexts. Preserve rules through the Calc Worker and use the pinned LibreOffice ODS data-bar regression and model checks. Scope is core and filter, not user interface or XLSX."
sections:
  Summary: "Preserve Calc conditional data bars across ODS import, Worker transfer and export."
  Scope: "Native conditional-format data-bar value owner, threshold computation and reference/copy behavior, ODF context and serialization, shared threshold helpers, focused tests and metadata. Browser rendering and XLSX data bar support are outside this ODS filter work. Keep and document observable upstream behaviors."
  Plan: |-
    - Port the native data-bar value and conditional entry over ScColorFormat and ScColorScaleEntry.
    - Use the native ODS property names, threshold contexts and type/number serialization.
    - Verify the LibreOffice data-bar workbook and source-driven edge cases.
    - Run the scheduled full regression after closing this implementation.
  Verify Steps: |-
    - Run `npm run test:calc -- xmlcondformat.admission.test.ts condformatbuffer.colorscale.test.ts ods-data-bars.test.ts conditional-copy.test.ts ods-worker --maxWorkers 2 --testTimeout 120000`.
    - Run office typecheck and targeted ESLint and Prettier for changed TypeScript.
    - Run `npm run check:dependencies`, `npm run check:source-provenance`, `node .agentplane/policy/check-routing.mjs`, `ap doctor` and `git diff --check`.
  Verification: "Pending."
  Rollback Plan: "Revert the scoped implementation commit."
  Findings: "None recorded yet."
id_source: "generated"
---
## Summary

Preserve Calc conditional data bars across ODS import, Worker transfer and export.

## Scope

Native conditional-format data-bar value owner, threshold computation and reference/copy behavior, ODF context and serialization, shared threshold helpers, focused tests and metadata. Browser rendering and XLSX data bar support are outside this ODS filter work. Keep and document observable upstream behaviors.

## Plan

- Port the native data-bar value and conditional entry over ScColorFormat and ScColorScaleEntry.
- Use the native ODS property names, threshold contexts and type/number serialization.
- Verify the LibreOffice data-bar workbook and source-driven edge cases.
- Run the scheduled full regression after closing this implementation.

## Verify Steps

- Run `npm run test:calc -- xmlcondformat.admission.test.ts condformatbuffer.colorscale.test.ts ods-data-bars.test.ts conditional-copy.test.ts ods-worker --maxWorkers 2 --testTimeout 120000`.
- Run office typecheck and targeted ESLint and Prettier for changed TypeScript.
- Run `npm run check:dependencies`, `npm run check:source-provenance`, `node .agentplane/policy/check-routing.mjs`, `ap doctor` and `git diff --check`.

## Verification

Pending.

## Rollback Plan

Revert the scoped implementation commit.

## Findings

None recorded yet.
