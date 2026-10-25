---
id: "202610251703-S3HW1E"
title: "Complete current Writer model slice across TXT RTF Markdown filters"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 18
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
doc_updated_at: "2026-10-25T18:00:44.292Z"
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
  Findings: "Interim audit, not closure. Matrix: docs/program/writer-native-text-filter-slice.md. Earlier task commits through aa8b0d0e8ad6 cover native transfer decoration/position, RTF style inheritance/bookmarks/list controls/table geometry/row/cell borders and padding, paragraph spacing/keep/split/widow controls, and selected Markdown block/list behavior. Current block maps explicit RTF tab positions/alignment/leaders and default tab distance through native SvxTabStopItem and SfxItemPool user defaults; relative Writer tabs export with the source left-margin offset and imported Word tabs use absolute coordinates. Bounded SfxItemPool registration now supports source user-default set/query/reset/copy instead of rejecting it. WRITER097 records pinned tlth/tleq writer-reader asymmetry and local code preserves the source mapping. Focused tests: 36 RTF, 24 shared pool and 29 Writer ruler/UI tests passed. Office TypeScript, changed-path ESLint/Prettier, source-provenance, module boundaries and Writer registry check passed. A first implementation of user defaults exposed missing bounded-pool support and failed RTF tests; the pool contract was repaired and all related tests passed afterward. WRITER096 retains pinned RTF list restart identifier loss. Table background and cell direction have shared item types but no registered Writer which IDs in this core. Open: line spacing, orphan counts, page/section items, soft page breaks, further field/style/list contracts and full md4c callback grammar. Pinned md4c source is absent locally; explicit network permission requested and pending. No claim of complete current-slice parity or final verification yet."
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

Interim audit, not closure. Matrix: docs/program/writer-native-text-filter-slice.md. Earlier task commits through aa8b0d0e8ad6 cover native transfer decoration/position, RTF style inheritance/bookmarks/list controls/table geometry/row/cell borders and padding, paragraph spacing/keep/split/widow controls, and selected Markdown block/list behavior. Current block maps explicit RTF tab positions/alignment/leaders and default tab distance through native SvxTabStopItem and SfxItemPool user defaults; relative Writer tabs export with the source left-margin offset and imported Word tabs use absolute coordinates. Bounded SfxItemPool registration now supports source user-default set/query/reset/copy instead of rejecting it. WRITER097 records pinned tlth/tleq writer-reader asymmetry and local code preserves the source mapping. Focused tests: 36 RTF, 24 shared pool and 29 Writer ruler/UI tests passed. Office TypeScript, changed-path ESLint/Prettier, source-provenance, module boundaries and Writer registry check passed. A first implementation of user defaults exposed missing bounded-pool support and failed RTF tests; the pool contract was repaired and all related tests passed afterward. WRITER096 retains pinned RTF list restart identifier loss. Table background and cell direction have shared item types but no registered Writer which IDs in this core. Open: line spacing, orphan counts, page/section items, soft page breaks, further field/style/list contracts and full md4c callback grammar. Pinned md4c source is absent locally; explicit network permission requested and pending. No claim of complete current-slice parity or final verification yet.
