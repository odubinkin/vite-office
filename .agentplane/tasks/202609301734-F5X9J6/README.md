---
id: "202609301734-F5X9J6"
title: "Restore native tab measure conversion pipeline"
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
  updated_at: "2026-09-30T17:35:38.303Z"
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
    body: "Start: restore source-owned native tab measure pipeline and verify parser and package contracts."
events:
  -
    type: "status"
    at: "2026-09-30T17:35:38.764Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: restore source-owned native tab measure pipeline and verify parser and package contracts."
doc_version: 3
doc_updated_at: "2026-09-30T17:35:38.764Z"
doc_updated_by: "CODER"
description: "Child of C9TN6M: source-backed SAX measure parsing and XML unit converter delegation, MM100 tab import values, signed integer conversion to Writer twips, and failure retaining zero. Preserve deliberate save/open/recovery deviations."
sections:
  Summary: |-
    Restore native tab measure conversion pipeline

    Child of C9TN6M: source-backed SAX measure parsing and XML unit converter delegation, MM100 tab import values, signed integer conversion to Writer twips, and failure retaining zero. Preserve deliberate save/open/recovery deviations.
  Scope: "sax/source/tools/converter.ts and focused test; xmloff/core/xmluconv.ts and focused test; style/xmltabi.ts, style/xmlstyle.ts, text/XMLTextPropertySetContext.ts, text/txtparai.ts import contracts; sw/filter/xml/xmlimp.ts and odt-property-roundtrip.test.ts; runtime inventory/provenance data and task evidence. Implement native parsing for existing Twip and tab MM100 targets, with nullable failure and min/max saturation. MM100 import data stays separate from twip export data. Other helper callers retain their existing syntax/error policy until audited; numeric conversion delegates to native owner. No validator/schema/tooling changes or deliberate browser-deviation changes."
  Plan: "Introduce source-owned SAX Converter measure parser and SvXMLUnitConverter delegation. Remove duplicated helper arithmetic while retaining unaudited callers syntax/error policy. Import tab positions in MM100 with failure retaining zero and convert at Writer item application using native signed integer ratio. Name import-only contracts to distinguish their unit from export. Add source-derived parser and literal ODT integration evidence, update mapping data, run full checks, review and close leaf."
  Verify Steps: "1. Compare parsing, supported target units, signed rounding and bounds with sax converter.cxx; compare XML delegation, tab MM100 factory and failure fallback; compare o3tl MulDiv and SvxTabStopItem::PutValue. 2. Source-derived tests cover native whitespace, unitless/empty input, decimals, negative half rounding, unit case/boundaries, pica, MM100 pixel acceptance/Twip rejection, unsupported units, range saturation and configurable limits. 3. Literal tab XML direct/inherited import/export/reimport assertions cover malformed fallback, two-stage quantization, unitless/MM100 input, signed ties and saturation; unchanged Default/alignment/leader tests pass. 4. Run npm run verify, ap doctor, routing and diff checks. Review only bounded evidence; broader contracts stay unverified."
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert task implementation commit if native-conversion integration regressions are demonstrated; retain unrelated completed fixes."
  Findings: ""
id_source: "generated"
---
## Summary

Restore native tab measure conversion pipeline

Child of C9TN6M: source-backed SAX measure parsing and XML unit converter delegation, MM100 tab import values, signed integer conversion to Writer twips, and failure retaining zero. Preserve deliberate save/open/recovery deviations.

## Scope

sax/source/tools/converter.ts and focused test; xmloff/core/xmluconv.ts and focused test; style/xmltabi.ts, style/xmlstyle.ts, text/XMLTextPropertySetContext.ts, text/txtparai.ts import contracts; sw/filter/xml/xmlimp.ts and odt-property-roundtrip.test.ts; runtime inventory/provenance data and task evidence. Implement native parsing for existing Twip and tab MM100 targets, with nullable failure and min/max saturation. MM100 import data stays separate from twip export data. Other helper callers retain their existing syntax/error policy until audited; numeric conversion delegates to native owner. No validator/schema/tooling changes or deliberate browser-deviation changes.

## Plan

Introduce source-owned SAX Converter measure parser and SvXMLUnitConverter delegation. Remove duplicated helper arithmetic while retaining unaudited callers syntax/error policy. Import tab positions in MM100 with failure retaining zero and convert at Writer item application using native signed integer ratio. Name import-only contracts to distinguish their unit from export. Add source-derived parser and literal ODT integration evidence, update mapping data, run full checks, review and close leaf.

## Verify Steps

1. Compare parsing, supported target units, signed rounding and bounds with sax converter.cxx; compare XML delegation, tab MM100 factory and failure fallback; compare o3tl MulDiv and SvxTabStopItem::PutValue. 2. Source-derived tests cover native whitespace, unitless/empty input, decimals, negative half rounding, unit case/boundaries, pica, MM100 pixel acceptance/Twip rejection, unsupported units, range saturation and configurable limits. 3. Literal tab XML direct/inherited import/export/reimport assertions cover malformed fallback, two-stage quantization, unitless/MM100 input, signed ties and saturation; unchanged Default/alignment/leader tests pass. 4. Run npm run verify, ap doctor, routing and diff checks. Review only bounded evidence; broader contracts stay unverified.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert task implementation commit if native-conversion integration regressions are demonstrated; retain unrelated completed fixes.

## Findings
