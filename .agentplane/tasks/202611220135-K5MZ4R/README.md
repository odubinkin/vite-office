---
id: "202611220135-K5MZ4R"
title: "Align Calc ODS rich text with the native edit attribute map"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 4
origin:
  system: "manual"
depends_on: []
tags:
  - "calc"
  - "code"
  - "ods"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-11-22T01:36:09.806Z"
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
    body: "Start: trace and port pinned Calc ODF edit-run attribute mappings through the existing EditEngine and Worker boundaries."
events:
  -
    type: "status"
    at: "2026-11-22T01:36:13.891Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: trace and port pinned Calc ODF edit-run attribute mappings through the existing EditEngine and Worker boundaries."
doc_version: 3
doc_updated_at: "2026-11-22T01:36:13.891Z"
doc_updated_by: "CODER"
description: "Port consumed ScXMLEditAttributeMap span mappings and use native EditEngine item values in Calc ODS import, export, and Worker round trips."
sections:
  Summary: "Preserve the pinned LibreOffice Calc rich-text character attribute values in ODS cell spans from import through edit-object storage, Worker transport, and export."
  Scope: |-
    - Port the consumed native ScXMLEditAttributeMap for edit runs. Preserve the supported text and font properties, and connect the missing word mode, kerning, scale, emphasis, and script locales through real EditEngine pool items.
    - Preserve legal values, explicit resets, member conversion and item defaults, including partial escapement, and verify existing decoration and font behavior.
    - Keep the Calc cell pattern, formatted runs, and underlying document format boundaries distinct. Leave unrelated cell layout, file UI, recovery, other format families, and newly unsupported UNO services outside this task.
  Plan: |-
    1. Trace ScXMLEditAttributeMap, ScXMLTableRowCellContext text style import, and ScXMLExport::CollectTextAutoStyles against the current rich-text and Worker paths.
    2. Install a shared Calc XML mapping of edit item identities and UNO members, reuse shared xmloff codecs, and replace the escapement-only handoff with the represented native attribute contract.
    3. Replay the supported assertions from LibreOffice's rich-text ODS tests. Verify named and automatic text styles, canonical items, and round trips through actual ODS and Worker transfer. Document any suspicious original behavior reproduced by this task.
  Verify Steps: |-
    - Run Calc ODS rich-text, related style, font, style-routing, Worker and format tests.
    - Run shared EditEngine and xmloff tests for the affected item members, lexical codecs, and script locale conversions.
    - Run scoped ESLint and Prettier, Office typecheck, module boundaries, source provenance, Calc registry invariants, routing, doctor and git diff checks.
    - Record the implementation and verification, then close and refresh the repository graph. This is the fifth task in the current ten-task regression cadence.
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert the implementation commit with its source-provenance records and rerun ODS rich-text and Worker tests."
  Findings: ""
id_source: "generated"
---
## Summary

Preserve the pinned LibreOffice Calc rich-text character attribute values in ODS cell spans from import through edit-object storage, Worker transport, and export.

## Scope

- Port the consumed native ScXMLEditAttributeMap for edit runs. Preserve the supported text and font properties, and connect the missing word mode, kerning, scale, emphasis, and script locales through real EditEngine pool items.
- Preserve legal values, explicit resets, member conversion and item defaults, including partial escapement, and verify existing decoration and font behavior.
- Keep the Calc cell pattern, formatted runs, and underlying document format boundaries distinct. Leave unrelated cell layout, file UI, recovery, other format families, and newly unsupported UNO services outside this task.

## Plan

1. Trace ScXMLEditAttributeMap, ScXMLTableRowCellContext text style import, and ScXMLExport::CollectTextAutoStyles against the current rich-text and Worker paths.
2. Install a shared Calc XML mapping of edit item identities and UNO members, reuse shared xmloff codecs, and replace the escapement-only handoff with the represented native attribute contract.
3. Replay the supported assertions from LibreOffice's rich-text ODS tests. Verify named and automatic text styles, canonical items, and round trips through actual ODS and Worker transfer. Document any suspicious original behavior reproduced by this task.

## Verify Steps

- Run Calc ODS rich-text, related style, font, style-routing, Worker and format tests.
- Run shared EditEngine and xmloff tests for the affected item members, lexical codecs, and script locale conversions.
- Run scoped ESLint and Prettier, Office typecheck, module boundaries, source provenance, Calc registry invariants, routing, doctor and git diff checks.
- Record the implementation and verification, then close and refresh the repository graph. This is the fifth task in the current ten-task regression cadence.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert the implementation commit with its source-provenance records and rerun ODS rich-text and Worker tests.

## Findings
