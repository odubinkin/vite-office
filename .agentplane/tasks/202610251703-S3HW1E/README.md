---
id: "202610251703-S3HW1E"
title: "Complete current Writer model slice across TXT RTF Markdown filters"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 55
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
doc_updated_at: "2026-10-25T21:41:49.191Z"
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
  Findings: "Interim audit; full current-slice closure remains pending. Capability matrix: docs/program/writer-native-text-filter-slice.md. This batch ports the pinned SAL ISO-2022-JP/KR text-to-Unicode state machines for RTF code pages 50220/50225, binding existing JIS X 0208 and KS X 1001 tables, preserving streaming context, source bad-input actions and UI-connected RTF dispatch. Command: npx vitest run apps/office/src/sal/textenc/convertiso2022.test.ts apps/office/src/sw/source/writerfilter/rtftok/rtfdocumentimpl.test.ts apps/office/src/sal/textenc/tcvtutf7.test.ts apps/office/src/sal/textenc/tcvtmb.test.ts. Result: pass. Evidence: 108 tests in four files. Scope: ISO-2022 state transitions and RTF integration, adjacent UTF-7/DBCS regressions. Command: npm run typecheck; npx eslint changed source --max-warnings 0; npx prettier --check changed source. Result: pass. Scope: changed TypeScript. Command: npm run check:source-provenance; npm run inventory:parity:writer; npm run inventory:parity:shared; npm run check:dependencies. Result: pass. Evidence: 1406 runtime modules mapped by provenance; Writer/shared registries and 1405 runtime-source boundaries pass. Remaining gaps include full md4c syntax/callback parity and URL normalization, RTF field/style/list/table/paragraph/section differentials, physical font metrics, the remaining byte/code-page matrix and compiled upstream comparisons. Pinned md4c source is absent locally; network approval is pending. No final verification or full-slice parity claim yet."
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

Interim audit; full current-slice closure remains pending. Capability matrix: docs/program/writer-native-text-filter-slice.md. This batch ports the pinned SAL ISO-2022-JP/KR text-to-Unicode state machines for RTF code pages 50220/50225, binding existing JIS X 0208 and KS X 1001 tables, preserving streaming context, source bad-input actions and UI-connected RTF dispatch. Command: npx vitest run apps/office/src/sal/textenc/convertiso2022.test.ts apps/office/src/sw/source/writerfilter/rtftok/rtfdocumentimpl.test.ts apps/office/src/sal/textenc/tcvtutf7.test.ts apps/office/src/sal/textenc/tcvtmb.test.ts. Result: pass. Evidence: 108 tests in four files. Scope: ISO-2022 state transitions and RTF integration, adjacent UTF-7/DBCS regressions. Command: npm run typecheck; npx eslint changed source --max-warnings 0; npx prettier --check changed source. Result: pass. Scope: changed TypeScript. Command: npm run check:source-provenance; npm run inventory:parity:writer; npm run inventory:parity:shared; npm run check:dependencies. Result: pass. Evidence: 1406 runtime modules mapped by provenance; Writer/shared registries and 1405 runtime-source boundaries pass. Remaining gaps include full md4c syntax/callback parity and URL normalization, RTF field/style/list/table/paragraph/section differentials, physical font metrics, the remaining byte/code-page matrix and compiled upstream comparisons. Pinned md4c source is absent locally; network approval is pending. No final verification or full-slice parity claim yet.
