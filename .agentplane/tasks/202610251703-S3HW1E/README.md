---
id: "202610251703-S3HW1E"
title: "Complete current Writer model slice across TXT RTF Markdown filters"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 19
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
doc_updated_at: "2026-10-25T18:05:21.762Z"
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
  Findings: "Interim audit, not closure. Matrix: docs/program/writer-native-text-filter-slice.md. Task commits through 45feb80de25b cover native transfer decoration/position, RTF style inheritance/bookmarks/list controls/table geometry/row/cell borders and padding, paragraph spacing/keep/split/widow controls, native tabs/default distance, and selected Markdown block/list behavior. This batch adds source RTF page-before control emission and import into RES_BREAK after the first run, and corrects flag control admission: keep, keepn, contextualspace, widctlpar and pagebb follow keyword presence even with numeric zero. Pinned WW8 AttributeOutputBase::ParaWidows deliberately omits separate RES_PARATR_ORPHANS because Word has one shared control, so the matrix classifies that loss as source behavior. Focused 38 RTF tests pass; office TypeScript, changed-path ESLint/Prettier, source-provenance, module boundaries and Writer registry check pass. WRITER096/097 retain pinned list restart and tab-leader asymmetries. Open: line spacing including output-device measurement for leading mode, page-after/column/section controls, page descriptor/page number, soft page breaks, further field/style/list contracts and full md4c callback grammar. Pinned md4c source is absent locally; explicit network permission requested and pending. No claim of complete current-slice parity or final verification yet."
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

Interim audit, not closure. Matrix: docs/program/writer-native-text-filter-slice.md. Task commits through 45feb80de25b cover native transfer decoration/position, RTF style inheritance/bookmarks/list controls/table geometry/row/cell borders and padding, paragraph spacing/keep/split/widow controls, native tabs/default distance, and selected Markdown block/list behavior. This batch adds source RTF page-before control emission and import into RES_BREAK after the first run, and corrects flag control admission: keep, keepn, contextualspace, widctlpar and pagebb follow keyword presence even with numeric zero. Pinned WW8 AttributeOutputBase::ParaWidows deliberately omits separate RES_PARATR_ORPHANS because Word has one shared control, so the matrix classifies that loss as source behavior. Focused 38 RTF tests pass; office TypeScript, changed-path ESLint/Prettier, source-provenance, module boundaries and Writer registry check pass. WRITER096/097 retain pinned list restart and tab-leader asymmetries. Open: line spacing including output-device measurement for leading mode, page-after/column/section controls, page descriptor/page number, soft page breaks, further field/style/list contracts and full md4c callback grammar. Pinned md4c source is absent locally; explicit network permission requested and pending. No claim of complete current-slice parity or final verification yet.
