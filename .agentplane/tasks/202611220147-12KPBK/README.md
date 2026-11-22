---
id: "202611220147-12KPBK"
title: "Preserve Writer ODT paragraph hyphenation settings"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 4
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
  - "odt"
  - "writer"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-11-22T01:47:32.277Z"
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
    body: "Start: wire pinned Writer hyphenation members through their real pool item, UNO style properties, ODT property maps and Worker records."
events:
  -
    type: "status"
    at: "2026-11-22T01:47:37.246Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: wire pinned Writer hyphenation members through their real pool item, UNO style properties, ODT property maps and Worker records."
doc_version: 3
doc_updated_at: "2026-11-22T01:47:37.246Z"
doc_updated_by: "CODER"
description: "Port the native hyphenation zone item with its Writer pool default, UNO members, ODT text and paragraph maps and Worker transfer."
sections:
  Summary: "Preserve native Writer paragraph hyphenation settings through ODT import, the actual Writer pool and UNO style model, Worker transfer, and ODT export."
  Scope: |-
    - Implement the pinned EditEngine SvxHyphenZoneItem with original storage, defaults, value contracts and Writer Which identity. Preserve the distinct Writer default and exact UNO property rows.
    - Port the consumed Writer paragraph style hyphenation mappings, including ODF text properties, paragraph properties, and LibreOffice extensions. Respect the separate character-level no-hyphenation property.
    - Retain complete item state through Worker records and preserve represented named/automatic style behavior. Word-breaking dictionaries, native layout and UI are outside this filter and item task.
    - Document original behavior that appears incorrect without changing the reproduced behavior.
  Plan: |-
    1. Trace the original item, UNO rows, pooling, property handlers, and export filtering against the existing Writer style and Worker owners.
    2. Implement the item and complete ODF handler transport with source defaults and typed member conversion. Register source provenance.
    3. Port the applicable LibreOffice ODT hyphenation tests and verify import, core, Worker, export and reopening.
  Verify Steps: |-
    - Run Writer ODT hyphenation, named paragraph, Worker, UNO metadata, and native item tests.
    - Run shared xmloff tests for native numeric, named boolean and hyphenation mode policies.
    - Run scoped ESLint and Prettier, Office typecheck, module boundaries, source provenance, Writer registry invariants, policy routing, AgentPlane doctor and git diff checks.
    - Record scoped verification, commit the implementation and task evidence, and refresh the graph at closeout. This is the sixth task in the current ten-task regression cadence.
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert the standalone implementation commit and source registry changes. Rerun affected Writer ODT and Worker tests."
  Findings: ""
id_source: "generated"
---
## Summary

Preserve native Writer paragraph hyphenation settings through ODT import, the actual Writer pool and UNO style model, Worker transfer, and ODT export.

## Scope

- Implement the pinned EditEngine SvxHyphenZoneItem with original storage, defaults, value contracts and Writer Which identity. Preserve the distinct Writer default and exact UNO property rows.
- Port the consumed Writer paragraph style hyphenation mappings, including ODF text properties, paragraph properties, and LibreOffice extensions. Respect the separate character-level no-hyphenation property.
- Retain complete item state through Worker records and preserve represented named/automatic style behavior. Word-breaking dictionaries, native layout and UI are outside this filter and item task.
- Document original behavior that appears incorrect without changing the reproduced behavior.

## Plan

1. Trace the original item, UNO rows, pooling, property handlers, and export filtering against the existing Writer style and Worker owners.
2. Implement the item and complete ODF handler transport with source defaults and typed member conversion. Register source provenance.
3. Port the applicable LibreOffice ODT hyphenation tests and verify import, core, Worker, export and reopening.

## Verify Steps

- Run Writer ODT hyphenation, named paragraph, Worker, UNO metadata, and native item tests.
- Run shared xmloff tests for native numeric, named boolean and hyphenation mode policies.
- Run scoped ESLint and Prettier, Office typecheck, module boundaries, source provenance, Writer registry invariants, policy routing, AgentPlane doctor and git diff checks.
- Record scoped verification, commit the implementation and task evidence, and refresh the graph at closeout. This is the sixth task in the current ten-task regression cadence.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert the standalone implementation commit and source registry changes. Rerun affected Writer ODT and Worker tests.

## Findings
