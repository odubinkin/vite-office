---
id: "202610251643-F4JRT8"
title: "Complete represented Writer RTF character links and paragraph indentation"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 11
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
  state: "ok"
  updated_at: "2026-10-25T16:52:35.032Z"
  updated_by: "CODER"
  note: "Represented RTF character, hyperlink and first-line item contracts verified: 76 focused tests, typecheck, Prettier, ESLint, provenance, registry and dependencies; WRITER095 and remaining upstream gaps recorded."
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
  -
    type: "verify"
    at: "2026-10-25T16:52:35.032Z"
    author: "CODER"
    state: "ok"
    note: "Represented RTF character, hyperlink and first-line item contracts verified: 76 focused tests, typecheck, Prettier, ESLint, provenance, registry and dependencies; WRITER095 and remaining upstream gaps recorded."
doc_version: 3
doc_updated_at: "2026-10-25T16:52:35.115Z"
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
    Command: npx vitest run --config vitest.writer.config.ts src/sw/source/writerfilter/rtftok/rtftokenizer.test.ts src/sw/source/writerfilter/rtftok/rtfdocumentimpl.test.ts src/sw/source/filter/ww8/rtfexport.test.ts src/sw/source/core/attr/native-paragraph-first-line-indent.test.ts src/sw/source/uibase/app/docsh.test.ts src/sw/browser/presentation/WriterFileDialog.test.tsx (apps/office). Result: pass. Evidence: 6 files, 76 tests passed. Scope: RTF import/export, paragraph item owner, shell and UI.
    Command: npm run typecheck --workspace @vite-office/office. Result: pass. Evidence: tsc --noEmit exit 0. Scope: office TypeScript.
    Command: npx prettier --check and npx eslint on 7 changed TS files. Result: pass. Evidence: all matched files formatted; ESLint exit 0. Scope: changed source and tests.
    Command: npm run check:source-provenance; npm run inventory:parity:writer; npm run check:dependencies. Result: pass. Evidence: 1315 runtime source mappings, Writer inventory exit 0, 1314 runtime module boundaries pass. Scope: source mapping, registry and dependency edges.
    Inspection: RtfDocumentImpl imports into native paragraph/hint owners; RtfExport delegates attribute emission to RtfAttributeOutput; SwDocShell and existing UI remain the active native route. Result: pass. Scope: end-to-end ownership.

    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-10-25T16:52:35.032Z — VERIFY — ok

    By: CODER

    Note: Represented RTF character, hyperlink and first-line item contracts verified: 76 focused tests, typecheck, Prettier, ESLint, provenance, registry and dependencies; WRITER095 and remaining upstream gaps recorded.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-25T16:52:29.261Z, excerpt_hash=sha256:2972a57f1c5a72d2861143a4e1fe1efd3bf731f448c8fad5efb9dfaa0a4c3a40

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office-writer/.agentplane/tasks/202610251643-F4JRT8/blueprint/resolved-snapshot.json
    - old_digest: 594f8cb537a758b94712fa7b008cc0f26b757fdbfe34b33c928768d0d0ab5fc2
    - current_digest: 594f8cb537a758b94712fa7b008cc0f26b757fdbfe34b33c928768d0d0ab5fc2
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202610251643-F4JRT8

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202610251643-F4JRT8
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: false
    - repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: |-
    - Revert task-related commit(s).
    - Re-run focused checks to confirm rollback safety.
  Findings: "The represented native RTF filter now carries strikeout, super/sub and custom/automatic escapement, HYPERLINK field result spans, and authored first-line paragraph items through import/export. A missing final paragraph commit previously discarded root-group paragraph controls when input ended without explicit par; it is corrected. RtfAttributeOutput now owns paragraph/character emission at the upstream-shaped path. The existing browser shell/UI route remains unchanged. Other upstream field semantics, complete character and paragraph vocabularies, sections, pictures, drawings and desktop filter options remain unverified. Source behavior that suppresses nonstandard escapement at default proportional height is preserved and documented as WRITER095."
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

Command: npx vitest run --config vitest.writer.config.ts src/sw/source/writerfilter/rtftok/rtftokenizer.test.ts src/sw/source/writerfilter/rtftok/rtfdocumentimpl.test.ts src/sw/source/filter/ww8/rtfexport.test.ts src/sw/source/core/attr/native-paragraph-first-line-indent.test.ts src/sw/source/uibase/app/docsh.test.ts src/sw/browser/presentation/WriterFileDialog.test.tsx (apps/office). Result: pass. Evidence: 6 files, 76 tests passed. Scope: RTF import/export, paragraph item owner, shell and UI.
Command: npm run typecheck --workspace @vite-office/office. Result: pass. Evidence: tsc --noEmit exit 0. Scope: office TypeScript.
Command: npx prettier --check and npx eslint on 7 changed TS files. Result: pass. Evidence: all matched files formatted; ESLint exit 0. Scope: changed source and tests.
Command: npm run check:source-provenance; npm run inventory:parity:writer; npm run check:dependencies. Result: pass. Evidence: 1315 runtime source mappings, Writer inventory exit 0, 1314 runtime module boundaries pass. Scope: source mapping, registry and dependency edges.
Inspection: RtfDocumentImpl imports into native paragraph/hint owners; RtfExport delegates attribute emission to RtfAttributeOutput; SwDocShell and existing UI remain the active native route. Result: pass. Scope: end-to-end ownership.

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-10-25T16:52:35.032Z — VERIFY — ok

By: CODER

Note: Represented RTF character, hyperlink and first-line item contracts verified: 76 focused tests, typecheck, Prettier, ESLint, provenance, registry and dependencies; WRITER095 and remaining upstream gaps recorded.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-25T16:52:29.261Z, excerpt_hash=sha256:2972a57f1c5a72d2861143a4e1fe1efd3bf731f448c8fad5efb9dfaa0a4c3a40

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office-writer/.agentplane/tasks/202610251643-F4JRT8/blueprint/resolved-snapshot.json
- old_digest: 594f8cb537a758b94712fa7b008cc0f26b757fdbfe34b33c928768d0d0ab5fc2
- current_digest: 594f8cb537a758b94712fa7b008cc0f26b757fdbfe34b33c928768d0d0ab5fc2
- route_changed: no
- safe_command: agentplane blueprint snapshot 202610251643-F4JRT8

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202610251643-F4JRT8
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: false
- repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert task-related commit(s).
- Re-run focused checks to confirm rollback safety.

## Findings

The represented native RTF filter now carries strikeout, super/sub and custom/automatic escapement, HYPERLINK field result spans, and authored first-line paragraph items through import/export. A missing final paragraph commit previously discarded root-group paragraph controls when input ended without explicit par; it is corrected. RtfAttributeOutput now owns paragraph/character emission at the upstream-shaped path. The existing browser shell/UI route remains unchanged. Other upstream field semantics, complete character and paragraph vocabularies, sections, pictures, drawings and desktop filter options remain unverified. Source behavior that suppresses nonstandard escapement at default proportional height is preserved and documented as WRITER095.
