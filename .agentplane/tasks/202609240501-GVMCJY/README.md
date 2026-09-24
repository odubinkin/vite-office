---
id: "202609240501-GVMCJY"
title: "Restore ODT XML and package contracts"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 5
origin:
  system: "manual"
depends_on:
  - "202609240501-81449V"
tags:
  - "code"
verify:
  - "npm run verify"
plan_approval:
  state: "approved"
  updated_at: "2026-09-24T08:08:03.271Z"
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
    body: "Start: compare pinned LibreOffice ODT contracts, repair demonstrated differences, isolate Worker transport, and verify."
events:
  -
    type: "status"
    at: "2026-09-24T08:08:13.488Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: compare pinned LibreOffice ODT contracts, repair demonstrated differences, isolate Worker transport, and verify."
doc_version: 3
doc_updated_at: "2026-09-24T08:08:13.488Z"
doc_updated_by: "CODER"
description: "Stage 6: audit supported ODT streams and properties, repair demonstrated differences including processing instructions, and isolate Worker transport"
sections:
  Summary: |-
    Restore ODT XML and package contracts

    Stage 6: audit supported ODT streams and properties, repair demonstrated differences including processing instructions, and isolate Worker transport
  Scope: |-
    - In scope: Stage 6: audit supported ODT streams and properties, repair demonstrated differences including processing instructions, and isolate Worker transport.
    - Out of scope: unrelated refactors not required for "Restore ODT XML and package contracts".
  Plan: |-
    1. Compare each supported ODT stream, style/property/list/hyperlink mapping, ZIP manifest default, malformed XML behavior, and emission order against pinned LibreOffice owners and existing fixtures; record precise matches and discrepancies.
    2. Repair demonstrated mismatches in corresponding sax/xmloff/package/sw filter modules, including legal XML processing instructions. Keep browser resource ceilings and supported format scope.
    3. Move Worker transport/envelope and clone codec behind sw/browser/filter/xml while retaining the single SwDoc and ODT filter contract; update imports and provenance.
    4. Add source-backed cases, update inventory data, run focused and full verification, review scope, commit and close.
  Verify Steps: |-
    1. Each changed XML, package, filter, or transport operation identifies a pinned upstream owner/symbol and a bounded assertion; unsupported formats remain explicit.
    2. Valid ODT XML with comments and processing instructions imports; hostile or over-budget input remains rejected. Supported stream/property/list/hyperlink and manifest round trips preserve canonical SwDoc values and stable output.
    3. Worker transport records and clone codec reside under sw/browser/filter/xml, with filter interfaces free of transport types; existing ODT workflow and browser save behavior pass.
    4. Existing inventory/provenance data accurately describe changes; npm run verify passes and final tracked state is clean.
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

Restore ODT XML and package contracts

Stage 6: audit supported ODT streams and properties, repair demonstrated differences including processing instructions, and isolate Worker transport

## Scope

- In scope: Stage 6: audit supported ODT streams and properties, repair demonstrated differences including processing instructions, and isolate Worker transport.
- Out of scope: unrelated refactors not required for "Restore ODT XML and package contracts".

## Plan

1. Compare each supported ODT stream, style/property/list/hyperlink mapping, ZIP manifest default, malformed XML behavior, and emission order against pinned LibreOffice owners and existing fixtures; record precise matches and discrepancies.
2. Repair demonstrated mismatches in corresponding sax/xmloff/package/sw filter modules, including legal XML processing instructions. Keep browser resource ceilings and supported format scope.
3. Move Worker transport/envelope and clone codec behind sw/browser/filter/xml while retaining the single SwDoc and ODT filter contract; update imports and provenance.
4. Add source-backed cases, update inventory data, run focused and full verification, review scope, commit and close.

## Verify Steps

1. Each changed XML, package, filter, or transport operation identifies a pinned upstream owner/symbol and a bounded assertion; unsupported formats remain explicit.
2. Valid ODT XML with comments and processing instructions imports; hostile or over-budget input remains rejected. Supported stream/property/list/hyperlink and manifest round trips preserve canonical SwDoc values and stable output.
3. Worker transport records and clone codec reside under sw/browser/filter/xml, with filter interfaces free of transport types; existing ODT workflow and browser save behavior pass.
4. Existing inventory/provenance data accurately describe changes; npm run verify passes and final tracked state is clean.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert task-related commit(s).
- Re-run required checks to confirm rollback safety.

## Findings
