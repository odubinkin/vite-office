---
id: "202609231301-QBYCZX"
title: "Correct Writer ODT paragraph spacing for certification document"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 9
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-09-23T13:01:44.034Z"
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
    body: "Start: Reproduce the certification ODT paragraph spacing in isolated LibreOffice, correct Writer import and layout, and verify full coverage."
events:
  -
    type: "status"
    at: "2026-09-23T13:01:44.280Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: Reproduce the certification ODT paragraph spacing in isolated LibreOffice, correct Writer import and layout, and verify full coverage."
doc_version: 3
doc_updated_at: "2026-09-23T13:31:32.625Z"
doc_updated_by: "CODER"
description: "Use the user-provided certification ODT to correct LibreOffice paragraph spacing, line-height import, and inherited style resolution while preserving 100 percent coverage."
sections:
  Summary: |-
    Correct Writer ODT paragraph spacing for certification document

    Use the user-provided certification ODT to correct LibreOffice paragraph spacing, line-height import, and inherited style resolution while preserving 100 percent coverage.
  Scope: "Read only /Users/odubinkin/Downloads/сертификация.odt as the user-approved regression sample. In repo: adjust xmloff paragraph attribute import/export and style inheritance, editeng paragraph spacing items where needed, Writer browser projection/rendering/pagination, focused regression tests and documentation. Preserve unrelated working-tree changes from the active DOCS task."
  Plan: "Use the approved certification ODT as a read-only fixture for diagnosis. Correct paragraph spacing and bounded line-spacing modes in existing xmloff/model/browser layers, preserve inherited style properties, add regression coverage, and require npm run verify with 100% coverage. Avoid unrelated DOCS task change."
  Verify Steps: "1. Verify imported P3 style from certification ODT has 12 pt upper and lower spacing, 100% line height, contextual-spacing=false, and effective style inheritance. 2. Verify neighboring paragraph gaps, pagination, and ODT round trips in focused Vitest suites, including contextual spacing and supported line spacing modes. 3. Run npm run verify and require all gates, including 100% statements, branches, functions and lines, to pass. 4. Run git diff --check and inspect git status --short --untracked-files=all, leaving only the pre-existing unrelated deletion outside this task."
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: |-
    - Revert task-related commit(s).
    - Re-run required checks to confirm rollback safety.
  Findings: |-
    Command: isolated local LibreOffice PDF export of the user-provided ODT. Result: pass. Evidence: 5 A4 pages; ordinary 11 pt text has approximately 12.5 pt line baselines. Scope: reference geometry only; generated PDF and profile were removed.
    Command: importWriterXml on the supplied styles.xml/content.xml. Result: pass. Evidence: P3 paragraphs resolve to 240/240 twips above/below, 100% proportional line spacing, contextual-spacing=false; 59 body paragraphs imported from 74 ODT paragraphs. Scope: ODT import mapping.
    Command: npm run verify. Result: pass. Evidence: 377 office tests and 96 inventory tests with 100% statement, branch, function and line coverage; 11 e2e; static build, JSDoc, source-tree, provenance, invariants and parity checks passed. Scope: repository gate.
    Residual limitation: the supplied ODT has one 5-row, 15-cell table. The paragraph-only Writer model intentionally omits tables, so its 15 paragraphs and their page area are absent. Full-document page parity requires a separate table-model implementation; the bounded line-spacing changes cannot restore that content. Font substitution can also affect wrapping.
id_source: "generated"
---
## Summary

Correct Writer ODT paragraph spacing for certification document

Use the user-provided certification ODT to correct LibreOffice paragraph spacing, line-height import, and inherited style resolution while preserving 100 percent coverage.

## Scope

Read only /Users/odubinkin/Downloads/сертификация.odt as the user-approved regression sample. In repo: adjust xmloff paragraph attribute import/export and style inheritance, editeng paragraph spacing items where needed, Writer browser projection/rendering/pagination, focused regression tests and documentation. Preserve unrelated working-tree changes from the active DOCS task.

## Plan

Use the approved certification ODT as a read-only fixture for diagnosis. Correct paragraph spacing and bounded line-spacing modes in existing xmloff/model/browser layers, preserve inherited style properties, add regression coverage, and require npm run verify with 100% coverage. Avoid unrelated DOCS task change.

## Verify Steps

1. Verify imported P3 style from certification ODT has 12 pt upper and lower spacing, 100% line height, contextual-spacing=false, and effective style inheritance. 2. Verify neighboring paragraph gaps, pagination, and ODT round trips in focused Vitest suites, including contextual spacing and supported line spacing modes. 3. Run npm run verify and require all gates, including 100% statements, branches, functions and lines, to pass. 4. Run git diff --check and inspect git status --short --untracked-files=all, leaving only the pre-existing unrelated deletion outside this task.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert task-related commit(s).
- Re-run required checks to confirm rollback safety.

## Findings

Command: isolated local LibreOffice PDF export of the user-provided ODT. Result: pass. Evidence: 5 A4 pages; ordinary 11 pt text has approximately 12.5 pt line baselines. Scope: reference geometry only; generated PDF and profile were removed.
Command: importWriterXml on the supplied styles.xml/content.xml. Result: pass. Evidence: P3 paragraphs resolve to 240/240 twips above/below, 100% proportional line spacing, contextual-spacing=false; 59 body paragraphs imported from 74 ODT paragraphs. Scope: ODT import mapping.
Command: npm run verify. Result: pass. Evidence: 377 office tests and 96 inventory tests with 100% statement, branch, function and line coverage; 11 e2e; static build, JSDoc, source-tree, provenance, invariants and parity checks passed. Scope: repository gate.
Residual limitation: the supplied ODT has one 5-row, 15-cell table. The paragraph-only Writer model intentionally omits tables, so its 15 paragraphs and their page area are absent. Full-document page parity requires a separate table-model implementation; the bounded line-spacing changes cannot restore that content. Font substitution can also affect wrapping.
