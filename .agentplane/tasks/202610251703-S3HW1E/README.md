---
id: "202610251703-S3HW1E"
title: "Complete current Writer model slice across TXT RTF Markdown filters"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 52
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
doc_updated_at: "2026-10-25T21:26:42.833Z"
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
  Findings: "Interim audit, not closure. Capability matrix: docs/program/writer-native-text-filter-slice.md. Prior commits through 347978702308 cover native TXT/RTF/Markdown paths, SAL single-byte and UTF-8 decoding, DBCS MS-932/936/949/950, JOHAB/MS-1361, EUC-CN/KR and Apple Korean/Japanese/Simplified Chinese/Traditional Chinese. This batch ports the pinned separate EUC-JP converter, JIS-0208/JIS-0212 forward and reverse tables, SS2 half-width katakana and SS3 three-byte decoding, and RTF code page 51932 selection. Source comparison verified 330 numeric arrays (55,316 values) and 768 pointer entries. Focused RTF/SAL tests (97), office typecheck, changed-path ESLint/Prettier, source provenance, Writer/shared registry and module-boundary checks pass. WRITER112 records the pinned EUC-JP undefined-pair classification and pointer advancement; focused tests preserve them. Repository-wide check:docs has pre-existing JSDoc failures; changed source diagnostics were repaired. Remaining current-model gaps include ISO-2022, UTF-7 and ISCII RTF code pages, full md4c syntax/callback parity and URL normalization, RTF field/style/list/table/paragraph/section differentials, physical font metrics and compiled upstream comparisons. Pinned md4c source is absent locally; network approval is pending. Full current-slice parity is not confirmed; no final verification yet."
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

Interim audit, not closure. Capability matrix: docs/program/writer-native-text-filter-slice.md. Prior commits through 347978702308 cover native TXT/RTF/Markdown paths, SAL single-byte and UTF-8 decoding, DBCS MS-932/936/949/950, JOHAB/MS-1361, EUC-CN/KR and Apple Korean/Japanese/Simplified Chinese/Traditional Chinese. This batch ports the pinned separate EUC-JP converter, JIS-0208/JIS-0212 forward and reverse tables, SS2 half-width katakana and SS3 three-byte decoding, and RTF code page 51932 selection. Source comparison verified 330 numeric arrays (55,316 values) and 768 pointer entries. Focused RTF/SAL tests (97), office typecheck, changed-path ESLint/Prettier, source provenance, Writer/shared registry and module-boundary checks pass. WRITER112 records the pinned EUC-JP undefined-pair classification and pointer advancement; focused tests preserve them. Repository-wide check:docs has pre-existing JSDoc failures; changed source diagnostics were repaired. Remaining current-model gaps include ISO-2022, UTF-7 and ISCII RTF code pages, full md4c syntax/callback parity and URL normalization, RTF field/style/list/table/paragraph/section differentials, physical font metrics and compiled upstream comparisons. Pinned md4c source is absent locally; network approval is pending. Full current-slice parity is not confirmed; no final verification yet.
