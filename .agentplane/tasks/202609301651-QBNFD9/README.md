---
id: "202609301651-QBNFD9"
title: "Match upstream default tab-stop import filtering"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 6
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-09-30T16:53:04.873Z"
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
    body: "Start: match source-order Default tab filtering at the ODF sequence sink and replace the contradictory existing assertion with native package behavior."
events:
  -
    type: "status"
    at: "2026-09-30T16:53:05.564Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: match source-order Default tab filtering at the ODF sequence sink and replace the contradictory existing assertion with native package behavior."
doc_version: 3
doc_updated_at: "2026-09-30T16:53:05.564Z"
doc_updated_by: "CODER"
description: "One bounded import correction under the approved iterative parity audit: apply pinned source-order Default tab-stop sequence filtering before canonical sorting, preserving first-Default exclusivity, later-Default removal and explicit empty sequences."
sections:
  Summary: |-
    Match upstream default tab-stop import filtering

    One bounded import correction under the approved iterative parity audit: apply pinned source-order Default tab-stop sequence filtering before canonical sorting, preserving first-Default exclusivity, later-Default removal and explicit empty sequences.
  Scope: "apps/office/src/xmloff/source/text/XMLTextPropertySetContext.ts; apps/office/src/sw/source/filter/xml/odt-property-roundtrip.test.ts; docs/program/parity/runtime-inventory.json and docs/program/source-provenance.json; canonical task artifacts. Only default-tab import sequence filtering, source-backed assertion corrections and focused package regressions. Keep signed positions, explicit empty sequences, alignment/leaders, core container and exporter behavior, unsupported APIs, deliberate save/open/recovery decisions and all validators/schemas/generators outside mutation scope."
  Plan: "CODER performs one default-tab import selection correction. Mirror the pinned endFastElement loop at the sequence sink: select first Default only and stop, otherwise retain normal stops and skip later Default stops. Preserve XML source order until downstream SvxTabStopItem handles position sorting; preserve explicit empty sequence and all retained values. Correct the existing ODT test whose middle Default expectation contradicts upstream. Add literal package sequence cases for first/later/multiple/only Default, no Default, empty and signed positions, including inherited styles and canonical export/reimport. Update relevant provenance/inventory data with bounded evidence while keeping broader XML status unverified. Verify focused tests, full npm run verify, doctor/routing, record evidence and quality review, then clean close. No network, unsupported APIs, validation/schema/generator changes or conscious product deviations."
  Verify Steps: "1. Compare final tab-sequence sink with pinned xmltabi.cxx SvxXMLTabStopImportContext::endFastElement: first Default entry terminates selection; later Default entries are omitted in original XML order before canonical sorting. 2. Focused mapped-property/core tab tests cover default first at a greater position than following signed stops, only/multiple defaults, non-first defaults interspersed with normal alignments, no defaults, empty sequence, alignment/decimal/leader retention, direct and inherited style import, package export/reimport stability, and corrected previous middle-Default assertion. 3. npm run verify passes all required gates with 100% required coverage; ap doctor and node .agentplane/policy/check-routing.mjs pass. 4. Metadata adds exact bounded source/test evidence without promoting wider module contracts; scoped diff review and clean tracked/untracked final state."
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: |-
    - Revert task-related commit(s).
    - Re-run required checks to confirm rollback safety.
  Findings: ""
id_source: "generated"
---
## Summary

Match upstream default tab-stop import filtering

One bounded import correction under the approved iterative parity audit: apply pinned source-order Default tab-stop sequence filtering before canonical sorting, preserving first-Default exclusivity, later-Default removal and explicit empty sequences.

## Scope

apps/office/src/xmloff/source/text/XMLTextPropertySetContext.ts; apps/office/src/sw/source/filter/xml/odt-property-roundtrip.test.ts; docs/program/parity/runtime-inventory.json and docs/program/source-provenance.json; canonical task artifacts. Only default-tab import sequence filtering, source-backed assertion corrections and focused package regressions. Keep signed positions, explicit empty sequences, alignment/leaders, core container and exporter behavior, unsupported APIs, deliberate save/open/recovery decisions and all validators/schemas/generators outside mutation scope.

## Plan

CODER performs one default-tab import selection correction. Mirror the pinned endFastElement loop at the sequence sink: select first Default only and stop, otherwise retain normal stops and skip later Default stops. Preserve XML source order until downstream SvxTabStopItem handles position sorting; preserve explicit empty sequence and all retained values. Correct the existing ODT test whose middle Default expectation contradicts upstream. Add literal package sequence cases for first/later/multiple/only Default, no Default, empty and signed positions, including inherited styles and canonical export/reimport. Update relevant provenance/inventory data with bounded evidence while keeping broader XML status unverified. Verify focused tests, full npm run verify, doctor/routing, record evidence and quality review, then clean close. No network, unsupported APIs, validation/schema/generator changes or conscious product deviations.

## Verify Steps

1. Compare final tab-sequence sink with pinned xmltabi.cxx SvxXMLTabStopImportContext::endFastElement: first Default entry terminates selection; later Default entries are omitted in original XML order before canonical sorting. 2. Focused mapped-property/core tab tests cover default first at a greater position than following signed stops, only/multiple defaults, non-first defaults interspersed with normal alignments, no defaults, empty sequence, alignment/decimal/leader retention, direct and inherited style import, package export/reimport stability, and corrected previous middle-Default assertion. 3. npm run verify passes all required gates with 100% required coverage; ap doctor and node .agentplane/policy/check-routing.mjs pass. 4. Metadata adds exact bounded source/test evidence without promoting wider module contracts; scoped diff review and clean tracked/untracked final state.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert task-related commit(s).
- Re-run required checks to confirm rollback safety.

## Findings
