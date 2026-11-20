---
id: "202611201136-3T5Y12"
title: "Port Calc ODS typed values and formula result attributes"
status: "DOING"
priority: "high"
owner: "CODER"
revision: 7
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify:
  - "npm run test:calc -- src/sc/source/filter/xml src/sc/browser/filter/xml --maxWorkers 2 --testTimeout 120000"
  - "npm run typecheck --workspace @vite-office/office"
plan_approval:
  state: "approved"
  updated_at: "2026-11-20T11:36:24.675Z"
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
    at: "2026-11-20T11:36:34.448Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: continue direct-mode task in current checkout."
doc_version: 3
doc_updated_at: "2026-11-20T11:36:34.448Z"
doc_updated_by: "CODER"
description: "Import and export native ODF scalar categories and supported hybrid formula caches directly in the Calc model, with LibreOffice date, duration and number-format rules."
sections:
  Summary: |-
    Port Calc ODS typed values and formula result attributes

    Import and export native ODF scalar categories and supported hybrid formula caches directly in the Calc model, with LibreOffice date, duration and number-format rules.
  Scope: "Calc XML cell import and export, number-format routing, supported formula result caching, shared SAX and xmloff date/duration and attribute helpers, ODS and helper tests and Calc upstream evidence."
  Plan: "Port SAX scalar admission and temporal serial conversion, associate native effective number formats with values, preserve represented hybrid formula caches, and export typed ODF scalar attributes from native format keys. Port applicable Calc QA assertions and record surprising pinned branches."
  Verify Steps: |-
    1. npm run test:calc -- src/sc/source/filter/xml src/sc/browser/filter/xml --maxWorkers 2 --testTimeout 120000. Verify typed values, authored formats, date origin and ODS package round trips.
    2. Run shared SAX and xmloff conversion tests for changed helpers.
    3. npm run typecheck --workspace @vite-office/office, git diff --check, ap doctor, and node .agentplane/policy/check-routing.mjs.
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert this task implementation and its associated tests and source findings together."
  Findings: ""
id_source: "generated"
---
## Summary

Port Calc ODS typed values and formula result attributes

Import and export native ODF scalar categories and supported hybrid formula caches directly in the Calc model, with LibreOffice date, duration and number-format rules.

## Scope

Calc XML cell import and export, number-format routing, supported formula result caching, shared SAX and xmloff date/duration and attribute helpers, ODS and helper tests and Calc upstream evidence.

## Plan

Port SAX scalar admission and temporal serial conversion, associate native effective number formats with values, preserve represented hybrid formula caches, and export typed ODF scalar attributes from native format keys. Port applicable Calc QA assertions and record surprising pinned branches.

## Verify Steps

1. npm run test:calc -- src/sc/source/filter/xml src/sc/browser/filter/xml --maxWorkers 2 --testTimeout 120000. Verify typed values, authored formats, date origin and ODS package round trips.
2. Run shared SAX and xmloff conversion tests for changed helpers.
3. npm run typecheck --workspace @vite-office/office, git diff --check, ap doctor, and node .agentplane/policy/check-routing.mjs.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert this task implementation and its associated tests and source findings together.

## Findings
