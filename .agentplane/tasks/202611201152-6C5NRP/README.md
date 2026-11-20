---
id: "202611201152-6C5NRP"
title: "Align Writer ODT merged cell grid and covered border styles"
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
  - "npm run test:writer -- src/sw/source/filter/xml src/xmloff/source/text/txtimp.test.ts --maxWorkers 2 --testTimeout 120000"
  - "npm run typecheck --workspace @vite-office/office"
plan_approval:
  state: "approved"
  updated_at: "2026-11-20T11:52:26.774Z"
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
    at: "2026-11-20T11:52:38.249Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: continue direct-mode task in current checkout."
doc_version: 3
doc_updated_at: "2026-11-20T11:52:38.249Z"
doc_updated_by: "CODER"
description: "Port Writer XML table span normalization, reserved-slot handling, covered-cell compatibility and native box style export through ODT and Worker boundaries."
sections:
  Summary: |-
    Align Writer ODT merged cell grid and covered border styles

    Port Writer XML table span normalization, reserved-slot handling, covered-cell compatibility and native box style export through ODT and Worker boundaries.
  Scope: "Writer XML table import/export and shared XML table contexts, represented Writer table geometry and document settings including Worker transport, targeted tests, applicable pinned Writer QA fixture and provenance, and Writer suspected-issues documentation."
  Plan: "Align the streaming table grid cursor with native span clipping, occupied slots, covered-cell marker admission and repeat finalization. Port the TableRowKeep model setting, configuration XML and backward-compatible Worker decoding. Export table and box styles with native stable names and direct covered border properties. Run the pinned vertical-border regression and independent span/repeat coverage."
  Verify Steps: |-
    1. npm run test:writer -- src/sw/source/filter/xml src/xmloff/source/text/txtimp.test.ts --maxWorkers 2 --testTimeout 120000. Cover column bounds, preceding span collisions, existing row and cell repeats, pinned vertical border on original ODT, and the Worker round trip.
    2. npm run typecheck --workspace @vite-office/office. Check all importer and settings consumers.
    3. Run scoped lint, git diff --check, ap doctor, and node .agentplane/policy/check-routing.mjs.
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert the Writer table-merging commit with its pinned fixture tests and issue records."
  Findings: ""
id_source: "generated"
---
## Summary

Align Writer ODT merged cell grid and covered border styles

Port Writer XML table span normalization, reserved-slot handling, covered-cell compatibility and native box style export through ODT and Worker boundaries.

## Scope

Writer XML table import/export and shared XML table contexts, represented Writer table geometry and document settings including Worker transport, targeted tests, applicable pinned Writer QA fixture and provenance, and Writer suspected-issues documentation.

## Plan

Align the streaming table grid cursor with native span clipping, occupied slots, covered-cell marker admission and repeat finalization. Port the TableRowKeep model setting, configuration XML and backward-compatible Worker decoding. Export table and box styles with native stable names and direct covered border properties. Run the pinned vertical-border regression and independent span/repeat coverage.

## Verify Steps

1. npm run test:writer -- src/sw/source/filter/xml src/xmloff/source/text/txtimp.test.ts --maxWorkers 2 --testTimeout 120000. Cover column bounds, preceding span collisions, existing row and cell repeats, pinned vertical border on original ODT, and the Worker round trip.
2. npm run typecheck --workspace @vite-office/office. Check all importer and settings consumers.
3. Run scoped lint, git diff --check, ap doctor, and node .agentplane/policy/check-routing.mjs.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert the Writer table-merging commit with its pinned fixture tests and issue records.

## Findings
