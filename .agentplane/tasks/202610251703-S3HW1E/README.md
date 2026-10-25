---
id: "202610251703-S3HW1E"
title: "Complete current Writer model slice across TXT RTF Markdown filters"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 35
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
doc_updated_at: "2026-10-25T19:46:20.180Z"
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
  Findings: "Interim audit, not closure. The capability matrix is docs/program/writer-native-text-filter-slice.md. Commits through f95fd3932e18 cover native TXT, RTF and Markdown paths, including upstream-ordered RTF table row controls and document-owned mixed Markdown list levels. WRITER096-107 document retained source asymmetries. This batch aligns RTF Unicode and escaped-byte text handling with pinned rtftokenizer.cxx, rtfdispatchvalue.cxx and rtfdocumentimpl.cxx: control words survive pending Unicode fallback, fallback counts are group-scoped, hex CR and LF reach the destination-aware paragraph handler, and signed uc and u bounds follow source. WRITER108 documents negative uc suppressing subsequent text. Focused 90 RTF tests, office TypeScript, changed-path ESLint/Prettier, source provenance, Writer registry, module-boundary and diff checks pass. Current-model gaps remain: complete md4c syntax/callback parity and URL normalization; RTF per-font and nested code-page decoding, field/style/list/table/paragraph and section-chain differentials; physical font metrics and compiled upstream comparisons. Pinned md4c source is absent locally and separate network approval remains pending. Full current-slice parity is not confirmed; no final verification yet."
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

Interim audit, not closure. The capability matrix is docs/program/writer-native-text-filter-slice.md. Commits through f95fd3932e18 cover native TXT, RTF and Markdown paths, including upstream-ordered RTF table row controls and document-owned mixed Markdown list levels. WRITER096-107 document retained source asymmetries. This batch aligns RTF Unicode and escaped-byte text handling with pinned rtftokenizer.cxx, rtfdispatchvalue.cxx and rtfdocumentimpl.cxx: control words survive pending Unicode fallback, fallback counts are group-scoped, hex CR and LF reach the destination-aware paragraph handler, and signed uc and u bounds follow source. WRITER108 documents negative uc suppressing subsequent text. Focused 90 RTF tests, office TypeScript, changed-path ESLint/Prettier, source provenance, Writer registry, module-boundary and diff checks pass. Current-model gaps remain: complete md4c syntax/callback parity and URL normalization; RTF per-font and nested code-page decoding, field/style/list/table/paragraph and section-chain differentials; physical font metrics and compiled upstream comparisons. Pinned md4c source is absent locally and separate network approval remains pending. Full current-slice parity is not confirmed; no final verification yet.
