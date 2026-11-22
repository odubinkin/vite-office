---
id: "202611220203-VKG8BT"
title: "Align shared Writer ODT and Calc ODS font member import"
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
  - "odf"
  - "writer"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-11-22T02:04:08.376Z"
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
    body: "Start: align the original shared font property selection, lexical conversions and defaults in the two ODF filters without changing font embedding or file lifecycle."
events:
  -
    type: "status"
    at: "2026-11-22T02:04:14.057Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: align the original shared font property selection, lexical conversions and defaults in the two ODF filters without changing font embedding or file lifecycle."
doc_version: 3
doc_updated_at: "2026-11-22T02:04:14.057Z"
doc_updated_by: "CODER"
description: "Unify font declaration and inline property resolution through the original three-script xmloff font member map, preserving file export and Worker round trips."
sections:
  Summary: "Align the consumed xmloff five-member font property path for western, CJK, and CTL typography in Writer ODT and Calc ODS."
  Scope: |-
    - Port native family-list lexical handling and the font declaration/inline property map for family names, style, generic family, pitch, and character encoding.
    - Reuse the common mapper in Writer character and paragraph styles and Calc cell and edit-run styles. Retain valid declarations, import the source-supported inline fallback, and preserve native default and failed-conversion behavior.
    - Verify real ODT and ODS package and Worker round trips. Leave unrelated font embedding, browser font loading, unsupported text layout, and file lifecycle outside this task.
  Plan: |-
    1. Trace the pinned font handlers, XMLFontStylesContext, XMLTextImportPropertyMapper, Writer style/UNO path, and Calc edit/cell style paths.
    2. Replace the separate declaration-only or bare family handling with the represented common script font member conversion, exercising source-order interactions and defaults.
    3. Replay applicable LibreOffice regression inputs. Verify round trips, diagnostics on malformed values and exact lexical boundary cases. Record suspect source behavior where reproduced.
  Verify Steps: |-
    - Run related Writer ODT font, text-style and Worker cases and Calc ODS native font, rich-text, style and Worker cases.
    - Run shared sax/xmloff font-name and family/pitch/encoding tests.
    - Run scoped ESLint and Prettier, Office typecheck, module boundaries, source provenance, Writer and Calc registry invariants, routing, AgentPlane doctor and git diff checks.
    - Record scoped verification, commit the implementation and evidence, then graph-refresh and close. This is the seventh task in the current ten-task cadence.
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert the implementation commit and source registry changes, then rerun both applications' ODF font and Worker regressions."
  Findings: ""
id_source: "generated"
---
## Summary

Align the consumed xmloff five-member font property path for western, CJK, and CTL typography in Writer ODT and Calc ODS.

## Scope

- Port native family-list lexical handling and the font declaration/inline property map for family names, style, generic family, pitch, and character encoding.
- Reuse the common mapper in Writer character and paragraph styles and Calc cell and edit-run styles. Retain valid declarations, import the source-supported inline fallback, and preserve native default and failed-conversion behavior.
- Verify real ODT and ODS package and Worker round trips. Leave unrelated font embedding, browser font loading, unsupported text layout, and file lifecycle outside this task.

## Plan

1. Trace the pinned font handlers, XMLFontStylesContext, XMLTextImportPropertyMapper, Writer style/UNO path, and Calc edit/cell style paths.
2. Replace the separate declaration-only or bare family handling with the represented common script font member conversion, exercising source-order interactions and defaults.
3. Replay applicable LibreOffice regression inputs. Verify round trips, diagnostics on malformed values and exact lexical boundary cases. Record suspect source behavior where reproduced.

## Verify Steps

- Run related Writer ODT font, text-style and Worker cases and Calc ODS native font, rich-text, style and Worker cases.
- Run shared sax/xmloff font-name and family/pitch/encoding tests.
- Run scoped ESLint and Prettier, Office typecheck, module boundaries, source provenance, Writer and Calc registry invariants, routing, AgentPlane doctor and git diff checks.
- Record scoped verification, commit the implementation and evidence, then graph-refresh and close. This is the seventh task in the current ten-task cadence.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert the implementation commit and source registry changes, then rerun both applications' ODF font and Worker regressions.

## Findings
