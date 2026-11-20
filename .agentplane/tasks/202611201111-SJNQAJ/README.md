---
id: "202611201111-SJNQAJ"
title: "Align Writer ODT table structure and default cell styles"
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
  - "git diff --check; ap doctor; node .agentplane/policy/check-routing.mjs"
  - "npm run test:writer -- src/sw/source/filter/xml --maxWorkers 4"
  - "npm run typecheck --workspace @vite-office/office"
plan_approval:
  state: "approved"
  updated_at: "2026-11-20T11:12:13.244Z"
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
    at: "2026-11-20T11:12:20.392Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: continue direct-mode task in current checkout."
doc_version: 3
doc_updated_at: "2026-11-20T11:12:20.392Z"
doc_updated_by: "CODER"
description: "Port the pinned SwXMLTableContext admission, defaults, grid grouping, and repeated row and cell behavior against native Writer tables, verify normal ODT import and export, and record suspected upstream behavior."
sections:
  Summary: |-
    Align Writer ODT table structure and default cell styles

    Port the pinned SwXMLTableContext admission, defaults, grid grouping, and repeated row and cell behavior against native Writer tables, verify normal ODT import and export, and record suspected upstream behavior.
  Scope: "Writer XML table SAX contexts and tokens, SwXMLTableContext state, canonical table/content copy owners as needed, ODT table serialization and package regression tests, source provenance and Writer suspected-issues documentation."
  Plan: "Compare native row, column, and cell SAX routes and defaults. Preserve table grid state and the source distinction between repeated rows and repeated cells. Verify against the native ODT import and export entry points and port applicable upstream assertions. Record suspicious source branches and rollback by reverting the scoped change."
  Verify Steps: |-
    1. npm run test:writer -- src/sw/source/filter/xml --maxWorkers 4. Include ODT package import and export assertions for default precedence, namespace admission, grouping and repeat semantics.
    2. npm run typecheck --workspace @vite-office/office. Check all table context consumers.
    3. Run git diff --check, ap doctor, and node .agentplane/policy/check-routing.mjs.
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert the scoped Writer XML table change and its tests and source notes together."
  Findings: ""
id_source: "generated"
---
## Summary

Align Writer ODT table structure and default cell styles

Port the pinned SwXMLTableContext admission, defaults, grid grouping, and repeated row and cell behavior against native Writer tables, verify normal ODT import and export, and record suspected upstream behavior.

## Scope

Writer XML table SAX contexts and tokens, SwXMLTableContext state, canonical table/content copy owners as needed, ODT table serialization and package regression tests, source provenance and Writer suspected-issues documentation.

## Plan

Compare native row, column, and cell SAX routes and defaults. Preserve table grid state and the source distinction between repeated rows and repeated cells. Verify against the native ODT import and export entry points and port applicable upstream assertions. Record suspicious source branches and rollback by reverting the scoped change.

## Verify Steps

1. npm run test:writer -- src/sw/source/filter/xml --maxWorkers 4. Include ODT package import and export assertions for default precedence, namespace admission, grouping and repeat semantics.
2. npm run typecheck --workspace @vite-office/office. Check all table context consumers.
3. Run git diff --check, ap doctor, and node .agentplane/policy/check-routing.mjs.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert the scoped Writer XML table change and its tests and source notes together.

## Findings
