---
id: "202610251703-S3HW1E"
title: "Complete current Writer model slice across TXT RTF Markdown filters"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 42
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-25T17:03:38.624Z"
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
    at: "2026-10-25T17:03:46.873Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: continue direct-mode task in current checkout."
doc_version: 3
doc_updated_at: "2026-10-25T20:20:19.511Z"
doc_updated_by: "CODER"
description: "Audit represented Writer body, paragraph, character, list, table, and hyperlink contracts against pinned LibreOffice sources; close format import/export gaps in the already approved native filter scope and verify targeted behavior."
sections:
  Summary: |-
    Complete current Writer model slice across TXT RTF Markdown filters

    Audit represented Writer body, paragraph, character, list, table, and hyperlink contracts against pinned LibreOffice sources; close format import/export gaps in the already approved native filter scope and verify targeted behavior.
  Scope: "In scope: current Writer document model body blocks, text runs, hyperlinks, paragraph attributes, lists and tables across native TXT export, RTF and Markdown import/export; filter-to-shell-to-browser connection; pinned upstream comparison; targeted tests and provenance. Out of scope: model features absent from the current core, recovery and browser save/autosave deviations, unrelated formats and full regression suite before task ten."
  Plan: "Audit canonical Writer body and attribute model against pinned LibreOffice TXT RTF Markdown paths; repair all represented import and export gaps in current filter scope; add a capability matrix and targeted round-trip tests; run TypeScript, lint, provenance, registry and module-boundary checks. Keep browser save deviations intact; no full suite before tenth task."
  Verify Steps: "1. Run focused Writer TXT, RTF, Markdown filter and document I/O tests; all pass. 2. Run TypeScript typecheck and ESLint/Prettier for changed source; all pass. 3. Run source-provenance, Writer registry and module-boundary checks; all pass. 4. Review the capability matrix against current SwDoc/SwTextNode/SwTable and pinned upstream sources, recording supported, format-inapplicable and unsupported cases with evidence. 5. Confirm git status has no unintended changes."
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: |-
    - Revert task-related commit(s).
    - Re-run required checks to confirm rollback safety.
  Findings: "Interim audit, not closure. Capability matrix: docs/program/writer-native-text-filter-slice.md. Commits through c0d2d3f24c22 cover native TXT, RTF and Markdown paths, RTF document-owned ANSI code-page selection, streaming Shift-JIS lexical feedback, and pinned SAL IBM 437/850 plus Windows-874/1250-1258 conversion. This batch adds the pinned SAL Apple Roman forward/reverse tables and separate Symbol converter; RTF selection covers ansicpg42, mac and font charset 2/77. Apple Roman forward 128, reverse 96 and extension 48 entries were exhaustively compared with pinned source; Symbol control/private-use and reverse alias branches were source-reviewed. Focused 118 Writer tests and 3 Symbol tests, office TypeScript, changed-path ESLint/Prettier, source provenance, Writer/shared registry, module-boundary and diff checks pass. The repo-wide file-size check still fails on three pre-existing over-limit files (ndtxt.ts, rtfexport.test.ts, rtfdocumentimpl.ts); none was introduced by this batch. WRITER096-109 document retained source asymmetries. Remaining current-model gaps include complete md4c syntax/callback parity and URL normalization; other browser-unsupported legacy code pages and the full code-page differential matrix; RTF field/style/list/table/paragraph and section-chain differentials; physical font metrics and compiled upstream comparisons. Pinned md4c source is absent locally and separate network approval remains pending. Full current-slice parity is not confirmed; no final verification yet."
id_source: "generated"
---
## Summary

Complete current Writer model slice across TXT RTF Markdown filters

Audit represented Writer body, paragraph, character, list, table, and hyperlink contracts against pinned LibreOffice sources; close format import/export gaps in the already approved native filter scope and verify targeted behavior.

## Scope

In scope: current Writer document model body blocks, text runs, hyperlinks, paragraph attributes, lists and tables across native TXT export, RTF and Markdown import/export; filter-to-shell-to-browser connection; pinned upstream comparison; targeted tests and provenance. Out of scope: model features absent from the current core, recovery and browser save/autosave deviations, unrelated formats and full regression suite before task ten.

## Plan

Audit canonical Writer body and attribute model against pinned LibreOffice TXT RTF Markdown paths; repair all represented import and export gaps in current filter scope; add a capability matrix and targeted round-trip tests; run TypeScript, lint, provenance, registry and module-boundary checks. Keep browser save deviations intact; no full suite before tenth task.

## Verify Steps

1. Run focused Writer TXT, RTF, Markdown filter and document I/O tests; all pass. 2. Run TypeScript typecheck and ESLint/Prettier for changed source; all pass. 3. Run source-provenance, Writer registry and module-boundary checks; all pass. 4. Review the capability matrix against current SwDoc/SwTextNode/SwTable and pinned upstream sources, recording supported, format-inapplicable and unsupported cases with evidence. 5. Confirm git status has no unintended changes.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert task-related commit(s).
- Re-run required checks to confirm rollback safety.

## Findings

Interim audit, not closure. Capability matrix: docs/program/writer-native-text-filter-slice.md. Commits through c0d2d3f24c22 cover native TXT, RTF and Markdown paths, RTF document-owned ANSI code-page selection, streaming Shift-JIS lexical feedback, and pinned SAL IBM 437/850 plus Windows-874/1250-1258 conversion. This batch adds the pinned SAL Apple Roman forward/reverse tables and separate Symbol converter; RTF selection covers ansicpg42, mac and font charset 2/77. Apple Roman forward 128, reverse 96 and extension 48 entries were exhaustively compared with pinned source; Symbol control/private-use and reverse alias branches were source-reviewed. Focused 118 Writer tests and 3 Symbol tests, office TypeScript, changed-path ESLint/Prettier, source provenance, Writer/shared registry, module-boundary and diff checks pass. The repo-wide file-size check still fails on three pre-existing over-limit files (ndtxt.ts, rtfexport.test.ts, rtfdocumentimpl.ts); none was introduced by this batch. WRITER096-109 document retained source asymmetries. Remaining current-model gaps include complete md4c syntax/callback parity and URL normalization; other browser-unsupported legacy code pages and the full code-page differential matrix; RTF field/style/list/table/paragraph and section-chain differentials; physical font metrics and compiled upstream comparisons. Pinned md4c source is absent locally and separate network approval remains pending. Full current-slice parity is not confirmed; no final verification yet.
