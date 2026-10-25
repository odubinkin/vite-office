---
id: "202610251703-S3HW1E"
title: "Complete current Writer model slice across TXT RTF Markdown filters"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 7
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
doc_updated_at: "2026-10-25T17:14:56.583Z"
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
  Findings: "Interim audit, not closure. Current model comparison is recorded in docs/program/writer-native-text-filter-slice.md. Closed in this batch: shared text transfer retains native strikeout and escapement; RTF stylesheet names and effective paragraph/character controls; point bookmarks at text and table-cell offsets; Markdown setext headings, indented code, multiline quotations and grouped preformatted export. Commands: targeted Vitest on eight related files, 70 tests pass; office TypeScript typecheck pass; changed-path ESLint and Prettier pass; source-provenance and module-boundary checks pass; Writer registry check passed but reports wider inventory gaps. Open: current-model numbering variants and restart/count, complex table properties, page/section items, remaining style and field contracts, and full md4c Markdown grammar. The pinned md4c source is absent locally and network access awaits explicit approval. No claim of complete parity yet."
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

Interim audit, not closure. Current model comparison is recorded in docs/program/writer-native-text-filter-slice.md. Closed in this batch: shared text transfer retains native strikeout and escapement; RTF stylesheet names and effective paragraph/character controls; point bookmarks at text and table-cell offsets; Markdown setext headings, indented code, multiline quotations and grouped preformatted export. Commands: targeted Vitest on eight related files, 70 tests pass; office TypeScript typecheck pass; changed-path ESLint and Prettier pass; source-provenance and module-boundary checks pass; Writer registry check passed but reports wider inventory gaps. Open: current-model numbering variants and restart/count, complex table properties, page/section items, remaining style and field contracts, and full md4c Markdown grammar. The pinned md4c source is absent locally and network access awaits explicit approval. No claim of complete parity yet.
