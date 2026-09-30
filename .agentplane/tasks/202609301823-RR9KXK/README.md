---
id: "202609301823-RR9KXK"
title: "Restore optional text span style contract"
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
  updated_at: "2026-09-30T18:24:56.186Z"
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
    body: "Start: restore native optional span style behavior and verify inherited inline state through real ODT cycles."
events:
  -
    type: "status"
    at: "2026-09-30T18:24:56.652Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: restore native optional span style behavior and verify inherited inline state through real ODT cycles."
doc_version: 3
doc_updated_at: "2026-09-30T18:24:56.652Z"
doc_updated_by: "CODER"
description: "Child of C9TN6M. Native XMLImpSpanContext_Impl accepts spans with absent/empty style names and applies no additional character-style hint. Preserve inherited inline properties, control content and hyperlinks through ODT import/export/reimport."
sections:
  Summary: |-
    Restore optional text span style contract

    Child of C9TN6M. Native XMLImpSpanContext_Impl accepts spans with absent/empty style names and applies no additional character-style hint. Preserve inherited inline properties, control content and hyperlinks through ODT import/export/reimport.
  Scope: "Only xmloff/source/text/txtparai.ts, txtpara.test.ts, new sw/source/filter/xml/odt-span-roundtrip.test.ts, runtime-inventory.json, source-provenance.json and task evidence. Absent/empty span style means no additional character-style delta. Preserve effective formatting, hyperlink metadata, nested styled children and supported whitespace/control/marker handling. Named-style fallback and global null-context policies remain separate audits. Registered save/open/recovery deviations excluded."
  Plan: "Skip character-style resolution for absent/empty span names, retaining effective inherited state. Add source-derived context and real ODT cycle assertions for plain/nested/styled/control/hyperlink cases, correct contradictory failure fixtures, update bounded provenance/inventory evidence, run mandatory checks, review and close leaf before resuming parent audit."
  Verify Steps: "1. Compare optional style hint, text delivery and child factory with pinned XMLImpSpanContext_Impl constructor/characters/createFastChildContext in txtparai.cxx. 2. Focused context assertions cover bare/empty-style and nested spans, inherited paragraph/character formatting, explicit child overrides and scope restoration, controls and active hyperlinks. Correct contradictory bare-span rejection fixtures while retaining other failure assertions. 3. Real literal ODT packages assert manual text/format/link results on import, export and reimport, including inherited paragraph and named character styles. 4. npm run verify, ap doctor, routing and diff checks pass; metadata evidence remains narrowly bounded without whole-module parity promotion."
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert task implementation commit if optional-style handling produces a verified regression; preserve unrelated completed parity corrections."
  Findings: ""
id_source: "generated"
---
## Summary

Restore optional text span style contract

Child of C9TN6M. Native XMLImpSpanContext_Impl accepts spans with absent/empty style names and applies no additional character-style hint. Preserve inherited inline properties, control content and hyperlinks through ODT import/export/reimport.

## Scope

Only xmloff/source/text/txtparai.ts, txtpara.test.ts, new sw/source/filter/xml/odt-span-roundtrip.test.ts, runtime-inventory.json, source-provenance.json and task evidence. Absent/empty span style means no additional character-style delta. Preserve effective formatting, hyperlink metadata, nested styled children and supported whitespace/control/marker handling. Named-style fallback and global null-context policies remain separate audits. Registered save/open/recovery deviations excluded.

## Plan

Skip character-style resolution for absent/empty span names, retaining effective inherited state. Add source-derived context and real ODT cycle assertions for plain/nested/styled/control/hyperlink cases, correct contradictory failure fixtures, update bounded provenance/inventory evidence, run mandatory checks, review and close leaf before resuming parent audit.

## Verify Steps

1. Compare optional style hint, text delivery and child factory with pinned XMLImpSpanContext_Impl constructor/characters/createFastChildContext in txtparai.cxx. 2. Focused context assertions cover bare/empty-style and nested spans, inherited paragraph/character formatting, explicit child overrides and scope restoration, controls and active hyperlinks. Correct contradictory bare-span rejection fixtures while retaining other failure assertions. 3. Real literal ODT packages assert manual text/format/link results on import, export and reimport, including inherited paragraph and named character styles. 4. npm run verify, ap doctor, routing and diff checks pass; metadata evidence remains narrowly bounded without whole-module parity promotion.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert task implementation commit if optional-style handling produces a verified regression; preserve unrelated completed parity corrections.

## Findings
