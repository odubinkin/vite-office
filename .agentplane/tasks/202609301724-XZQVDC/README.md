---
id: "202609301724-XZQVDC"
title: "Restore native tab import position and alignment defaults"
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
  updated_at: "2026-09-30T17:24:39.835Z"
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
    body: "Start: implement approved native tab position and alignment defaults with source-derived ODT cases."
events:
  -
    type: "status"
    at: "2026-09-30T17:24:40.325Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implement approved native tab position and alignment defaults with source-derived ODT cases."
doc_version: 3
doc_updated_at: "2026-09-30T17:24:40.325Z"
doc_updated_by: "CODER"
description: "Child of runtime parity audit 202609240501-C9TN6M. Restore missing-position zero and unrecognized-type LEFT defaults from pinned xmltabi.cxx without changing registered browser deviations."
sections:
  Summary: |-
    Restore native tab import position and alignment defaults

    Child of runtime parity audit 202609240501-C9TN6M. Restore missing-position zero and unrecognized-type LEFT defaults from pinned xmltabi.cxx without changing registered browser deviations.
  Scope: "Only style/xmltabi.ts, sw/source/filter/xml/odt-property-roundtrip.test.ts, runtime-inventory.json, source-provenance.json and task evidence. Missing position becomes zero; missing, empty and unknown type retain LEFT; recognized types and source-order Default selection remain unchanged. Registered save/open/recovery deviations are excluded."
  Plan: "Restore native optional position and recognized-only alignment override in existing tab parser. Add source-derived literal ODT package cases and correct contradictory rejection assertion. Update only bounded evidence metadata; run mandatory verification, review and close leaf, then resume parent audit."
  Verify Steps: "1. Compare default initialization and recognized type branches with pinned xmloff/source/style/xmltabi.cxx. 2. Focused ODT test asserts literal bare/missing-position and missing/empty/unknown type defaults, all recognized alignments and signed positions for direct and inherited styles through import/export/reimport. Preserve existing Default-selection and leader assertions. 3. Run npm run verify with all coverage, browser, source/provenance/inventory and static gates, plus ap doctor, routing check and git diff --check. 4. Review scoped diff and record evidence without promoting broader unverified contracts."
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert the task implementation commit and its bounded metadata evidence if a regression is demonstrated; preserve unrelated completed tasks."
  Findings: ""
id_source: "generated"
---
## Summary

Restore native tab import position and alignment defaults

Child of runtime parity audit 202609240501-C9TN6M. Restore missing-position zero and unrecognized-type LEFT defaults from pinned xmltabi.cxx without changing registered browser deviations.

## Scope

Only style/xmltabi.ts, sw/source/filter/xml/odt-property-roundtrip.test.ts, runtime-inventory.json, source-provenance.json and task evidence. Missing position becomes zero; missing, empty and unknown type retain LEFT; recognized types and source-order Default selection remain unchanged. Registered save/open/recovery deviations are excluded.

## Plan

Restore native optional position and recognized-only alignment override in existing tab parser. Add source-derived literal ODT package cases and correct contradictory rejection assertion. Update only bounded evidence metadata; run mandatory verification, review and close leaf, then resume parent audit.

## Verify Steps

1. Compare default initialization and recognized type branches with pinned xmloff/source/style/xmltabi.cxx. 2. Focused ODT test asserts literal bare/missing-position and missing/empty/unknown type defaults, all recognized alignments and signed positions for direct and inherited styles through import/export/reimport. Preserve existing Default-selection and leader assertions. 3. Run npm run verify with all coverage, browser, source/provenance/inventory and static gates, plus ap doctor, routing check and git diff --check. 4. Review scoped diff and record evidence without promoting broader unverified contracts.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert the task implementation commit and its bounded metadata evidence if a regression is demonstrated; preserve unrelated completed tasks.

## Findings
