---
id: "202610251634-PDD03R"
title: "Implement native Writer Markdown import export and UI filters"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 8
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-25T16:34:29.190Z"
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
    body: "Start: implement upstream-shaped native Markdown import and export through the Writer shell and existing browser UI."
events:
  -
    type: "status"
    at: "2026-10-25T16:34:35.926Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implement upstream-shaped native Markdown import and export through the Writer shell and existing browser UI."
doc_version: 3
doc_updated_at: "2026-10-25T16:34:35.926Z"
doc_updated_by: "CODER"
description: "Port the represented LibreOffice Markdown parser callback and SwMDWriter pathways for the current Writer model, integrate them through SwDocShell and existing Open/Export UI, and verify focused model and UI round trips."
sections:
  Summary: |-
    Implement native Writer Markdown import export and UI filters

    Port the represented LibreOffice Markdown parser callback and SwMDWriter pathways for the current Writer model, integrate them through SwDocShell and existing Open/Export UI, and verify focused model and UI round trips.
  Scope: "In scope: upstream-shaped Markdown reader and callback mapping under sw/source/filter/md, writer under the same upstream filter directory, represented Writer text runs, paragraph styles, lists and tables, shell import/export, existing browser Open/Export UI, focused tests and source provenance. Preserve existing save/autosave deviations. Record unsupported upstream responsibilities in Findings; no network or external dependencies. Out of scope: unrepresented images, drawing, complex layout and desktop-only filter behavior."
  Plan: "Implement one cohesive Markdown filter slice: source-shaped parser and writer under sw/source/filter/md, current-model styles/runs/lists/tables, shell and existing browser UI routes, source mappings and focused acceptance tests. Keep unsupported upstream behavior explicit."
  Verify Steps: |-
    1. Run focused Vitest Markdown parser, import/export round-trip, shell lifecycle and Writer file dialog tests using apps/office/vitest.writer.config.ts. Expect represented headings, emphasis, lists, tables and text escaping to pass.
    2. Run npm run typecheck --workspace @vite-office/office. Expect no errors.
    3. Run targeted Prettier and ESLint on changed files. Expect no diagnostics.
    4. Run Writer registry/provenance and dependency boundary checks; inspect shell/UI routes for native Markdown ownership. Record evidence and final git status.
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

Implement native Writer Markdown import export and UI filters

Port the represented LibreOffice Markdown parser callback and SwMDWriter pathways for the current Writer model, integrate them through SwDocShell and existing Open/Export UI, and verify focused model and UI round trips.

## Scope

In scope: upstream-shaped Markdown reader and callback mapping under sw/source/filter/md, writer under the same upstream filter directory, represented Writer text runs, paragraph styles, lists and tables, shell import/export, existing browser Open/Export UI, focused tests and source provenance. Preserve existing save/autosave deviations. Record unsupported upstream responsibilities in Findings; no network or external dependencies. Out of scope: unrepresented images, drawing, complex layout and desktop-only filter behavior.

## Plan

Implement one cohesive Markdown filter slice: source-shaped parser and writer under sw/source/filter/md, current-model styles/runs/lists/tables, shell and existing browser UI routes, source mappings and focused acceptance tests. Keep unsupported upstream behavior explicit.

## Verify Steps

1. Run focused Vitest Markdown parser, import/export round-trip, shell lifecycle and Writer file dialog tests using apps/office/vitest.writer.config.ts. Expect represented headings, emphasis, lists, tables and text escaping to pass.
2. Run npm run typecheck --workspace @vite-office/office. Expect no errors.
3. Run targeted Prettier and ESLint on changed files. Expect no diagnostics.
4. Run Writer registry/provenance and dependency boundary checks; inspect shell/UI routes for native Markdown ownership. Record evidence and final git status.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert task-related commit(s).
- Re-run required checks to confirm rollback safety.

## Findings
