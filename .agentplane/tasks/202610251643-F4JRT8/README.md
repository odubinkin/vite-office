---
id: "202610251643-F4JRT8"
title: "Complete represented Writer RTF character links and paragraph indentation"
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
  updated_at: "2026-10-25T16:44:02.350Z"
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
    body: "Start: close represented native RTF character, link and paragraph formatting gaps through canonical Writer owners."
events:
  -
    type: "status"
    at: "2026-10-25T16:44:09.686Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: close represented native RTF character, link and paragraph formatting gaps through canonical Writer owners."
doc_version: 3
doc_updated_at: "2026-10-25T16:44:09.686Z"
doc_updated_by: "CODER"
description: "Close gaps in the native RTF filter for currently modeled character decoration, hyperlink spans and first-line paragraph indentation, retaining upstream contracts and focused round-trip evidence."
sections:
  Summary: |-
    Complete represented Writer RTF character links and paragraph indentation

    Close gaps in the native RTF filter for currently modeled character decoration, hyperlink spans and first-line paragraph indentation, retaining upstream contracts and focused round-trip evidence.
  Scope: "In scope: refine the existing RTF tokenizer/document mapper/exporter for currently modeled strikeout, escapement, hyperlink spans and first-line paragraph indentation; add the missing native paragraph setter if required, update shell/filter tests and source provenance. Keep existing browser Save/Open deviations and do not broaden to unsupported field types, objects or layout. Use only pinned local LibreOffice source and focused checks."
  Plan: "Complete the represented RTF contract in one coherent filter closeout: direct decoration, hyperlink fields, first-line paragraph indentation, native model setter if needed, source-backed fixtures, provenance and focused checks."
  Verify Steps: |-
    1. Run focused Vitest RTF tokenizer, document mapper, exporter, shell and Writer UI tests plus any new paragraph item owner tests. Expect strikeout, links, escapement and first-line indentation to survive native round trips.
    2. Run npm run typecheck --workspace @vite-office/office. Expect no errors.
    3. Run targeted Prettier and ESLint on changed files. Expect no diagnostics.
    4. Run source provenance, Writer registry and dependency boundary checks. Inspect shell/UI ownership and final git status.
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: |-
    - Revert task-related commit(s).
    - Re-run focused checks to confirm rollback safety.
  Findings: ""
id_source: "generated"
---
## Summary

Complete represented Writer RTF character links and paragraph indentation

Close gaps in the native RTF filter for currently modeled character decoration, hyperlink spans and first-line paragraph indentation, retaining upstream contracts and focused round-trip evidence.

## Scope

In scope: refine the existing RTF tokenizer/document mapper/exporter for currently modeled strikeout, escapement, hyperlink spans and first-line paragraph indentation; add the missing native paragraph setter if required, update shell/filter tests and source provenance. Keep existing browser Save/Open deviations and do not broaden to unsupported field types, objects or layout. Use only pinned local LibreOffice source and focused checks.

## Plan

Complete the represented RTF contract in one coherent filter closeout: direct decoration, hyperlink fields, first-line paragraph indentation, native model setter if needed, source-backed fixtures, provenance and focused checks.

## Verify Steps

1. Run focused Vitest RTF tokenizer, document mapper, exporter, shell and Writer UI tests plus any new paragraph item owner tests. Expect strikeout, links, escapement and first-line indentation to survive native round trips.
2. Run npm run typecheck --workspace @vite-office/office. Expect no errors.
3. Run targeted Prettier and ESLint on changed files. Expect no diagnostics.
4. Run source provenance, Writer registry and dependency boundary checks. Inspect shell/UI ownership and final git status.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert task-related commit(s).
- Re-run focused checks to confirm rollback safety.

## Findings
