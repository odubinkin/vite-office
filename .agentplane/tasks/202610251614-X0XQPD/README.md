---
id: "202610251614-X0XQPD"
title: "Implement native Writer RTF import export and UI filters"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 6
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-25T16:15:14.416Z"
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
    body: "Start: implement upstream-shaped native RTF reader and writer through the Writer shell and existing browser UI."
events:
  -
    type: "status"
    at: "2026-10-25T16:15:20.700Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implement upstream-shaped native RTF reader and writer through the Writer shell and existing browser UI."
doc_version: 3
doc_updated_at: "2026-10-25T16:15:20.700Z"
doc_updated_by: "CODER"
description: "Port the represented upstream RTF tokenizer/import and writer/export pathways for the current Writer core model, integrate document shell and browser Open/Export UI, and verify focused core and UI round trips."
sections:
  Summary: |-
    Implement native Writer RTF import export and UI filters

    Port the represented upstream RTF tokenizer/import and writer/export pathways for the current Writer core model, integrate document shell and browser Open/Export UI, and verify focused core and UI round trips.
  Scope: "In scope: RTF tokenizer and document import modules under sw/source/writerfilter/rtftok, RTF writer modules under sw/source/filter/ww8, their currently modeled Writer body/text/run/paragraph/list/table values, SwDocShell filter boundary, browser import/export adapters, existing Open/Export UI, related tests and source provenance. Preserve current save/autosave deviations. Unsupported upstream responsibilities must be explicit in Findings rather than silently flattened. Out of scope: unrepresented drawing, layout, embedded-object and desktop-only subsystems unless required by the represented model."
  Plan: "Map the pinned RTF reader/tokenizer and exporter contracts to the implemented Writer model. Implement coherent native tokenizer, reader, writer and supporting modules at upstream-shaped paths. Integrate the filter through SwDocShell and existing browser Open/Export UI. Add representative import/export and malformed-input tests for modeled content, update provenance and suspected upstream issues if discovered, then run focused verification and finish."
  Verify Steps: |-
    1. Run focused Vitest RTF tokenizer, import/export round-trip, shell lifecycle and Writer file dialog tests using apps/office/vitest.writer.config.ts. Expect all pass, including malformed input and formatting cases.
    2. Run npm run typecheck --workspace @vite-office/office. Expect no errors.
    3. Run targeted Prettier and ESLint on changed files. Expect no diagnostics.
    4. Run Writer registry/provenance checks and inspect shell/UI routes for native RTF ownership. Record evidence and final git status.
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

Implement native Writer RTF import export and UI filters

Port the represented upstream RTF tokenizer/import and writer/export pathways for the current Writer core model, integrate document shell and browser Open/Export UI, and verify focused core and UI round trips.

## Scope

In scope: RTF tokenizer and document import modules under sw/source/writerfilter/rtftok, RTF writer modules under sw/source/filter/ww8, their currently modeled Writer body/text/run/paragraph/list/table values, SwDocShell filter boundary, browser import/export adapters, existing Open/Export UI, related tests and source provenance. Preserve current save/autosave deviations. Unsupported upstream responsibilities must be explicit in Findings rather than silently flattened. Out of scope: unrepresented drawing, layout, embedded-object and desktop-only subsystems unless required by the represented model.

## Plan

Map the pinned RTF reader/tokenizer and exporter contracts to the implemented Writer model. Implement coherent native tokenizer, reader, writer and supporting modules at upstream-shaped paths. Integrate the filter through SwDocShell and existing browser Open/Export UI. Add representative import/export and malformed-input tests for modeled content, update provenance and suspected upstream issues if discovered, then run focused verification and finish.

## Verify Steps

1. Run focused Vitest RTF tokenizer, import/export round-trip, shell lifecycle and Writer file dialog tests using apps/office/vitest.writer.config.ts. Expect all pass, including malformed input and formatting cases.
2. Run npm run typecheck --workspace @vite-office/office. Expect no errors.
3. Run targeted Prettier and ESLint on changed files. Expect no diagnostics.
4. Run Writer registry/provenance checks and inspect shell/UI routes for native RTF ownership. Record evidence and final git status.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert task-related commit(s).
- Re-run required checks to confirm rollback safety.

## Findings
