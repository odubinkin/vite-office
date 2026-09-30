---
id: "202609301651-QBNFD9"
title: "Match upstream default tab-stop import filtering"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 8
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
  state: "ok"
  updated_at: "2026-09-30T17:02:22.968Z"
  updated_by: "CODER"
  note: "Command: npm run verify. Result: pass (exit 0). Evidence: verify.log; 577 application, 109 inventory, 19 browser tests; required coverage 100%; all build/static/docs/source/invariant/parity gates, semanticViolationCount=0. Twelve focused tests cover six source-order sequence cases across direct/style import and export/reimport. Doctor and routing pass. Scope: Default tab sequence filtering; wider module parity remains unverified."
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
  -
    type: "verify"
    at: "2026-09-30T17:02:22.968Z"
    author: "CODER"
    state: "ok"
    note: "Command: npm run verify. Result: pass (exit 0). Evidence: verify.log; 577 application, 109 inventory, 19 browser tests; required coverage 100%; all build/static/docs/source/invariant/parity gates, semanticViolationCount=0. Twelve focused tests cover six source-order sequence cases across direct/style import and export/reimport. Doctor and routing pass. Scope: Default tab sequence filtering; wider module parity remains unverified."
doc_version: 3
doc_updated_at: "2026-09-30T17:02:23.044Z"
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
    ### 2026-09-30T17:02:22.968Z — VERIFY — ok

    By: CODER

    Note: Command: npm run verify. Result: pass (exit 0). Evidence: verify.log; 577 application, 109 inventory, 19 browser tests; required coverage 100%; all build/static/docs/source/invariant/parity gates, semanticViolationCount=0. Twelve focused tests cover six source-order sequence cases across direct/style import and export/reimport. Doctor and routing pass. Scope: Default tab sequence filtering; wider module parity remains unverified.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-30T17:02:22.448Z, excerpt_hash=sha256:30c374dcebfe07c9034d83bd7199860ff1637be44a107fc122bf913ad4aaf27b

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609301651-QBNFD9/blueprint/resolved-snapshot.json
    - old_digest: 8a1ffe2e2ec09c38ecf2a27189d7a1ff4a367fc094f8450348f44885342f5194
    - current_digest: 8a1ffe2e2ec09c38ecf2a27189d7a1ff4a367fc094f8450348f44885342f5194
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202609301651-QBNFD9

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202609301651-QBNFD9
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: false
    - repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: |-
    - Revert task-related commit(s).
    - Re-run required checks to confirm rollback safety.
  Findings: |-
    - Observation: Pinned SvxXMLTabStopImportContext.endFastElement selects by original XML order: a first Default stop is retained exclusively; otherwise only non-Default stops survive. Local XMLTabStopsContext passed all stops through and an existing ODT test incorrectly expected a middle Default stop to survive.
      Impact: Imported explicit tab lists could retain or combine entries that upstream intentionally omits; sorting before this decision would also lose first-Default exclusivity for unsorted or signed input.
      Resolution: Mirrored the pinned loop at the sequence sink before canonical sorting. Corrected the contradictory middle-Default expectation while retaining alignment, decimal and leader assertions. Six literal package cases cover first Default with following lower signed positions, interspersed later defaults, multiple and single defaults, normal unsorted stops, and an explicit empty sequence; each verifies direct and inherited-style import and export/reimport. Metadata records bounded source evidence without module promotion. Command: npm run verify. Result: pass (exit 0). Evidence: verify.log; 577 application, 109 inventory and 19 browser tests, all required coverage 100%, all build/static/docs/source/invariant/parity gates and semanticViolationCount=0. Twelve focused tests passed; doctor and routing passed with existing doctor warnings. Scope: default-tab sequence import selection; wider default/fallback and architectural ownership work remains open, and deliberate product deviations remain unchanged.
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
### 2026-09-30T17:02:22.968Z — VERIFY — ok

By: CODER

Note: Command: npm run verify. Result: pass (exit 0). Evidence: verify.log; 577 application, 109 inventory, 19 browser tests; required coverage 100%; all build/static/docs/source/invariant/parity gates, semanticViolationCount=0. Twelve focused tests cover six source-order sequence cases across direct/style import and export/reimport. Doctor and routing pass. Scope: Default tab sequence filtering; wider module parity remains unverified.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-30T17:02:22.448Z, excerpt_hash=sha256:30c374dcebfe07c9034d83bd7199860ff1637be44a107fc122bf913ad4aaf27b

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609301651-QBNFD9/blueprint/resolved-snapshot.json
- old_digest: 8a1ffe2e2ec09c38ecf2a27189d7a1ff4a367fc094f8450348f44885342f5194
- current_digest: 8a1ffe2e2ec09c38ecf2a27189d7a1ff4a367fc094f8450348f44885342f5194
- route_changed: no
- safe_command: agentplane blueprint snapshot 202609301651-QBNFD9

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202609301651-QBNFD9
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: false
- repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert task-related commit(s).
- Re-run required checks to confirm rollback safety.

## Findings

- Observation: Pinned SvxXMLTabStopImportContext.endFastElement selects by original XML order: a first Default stop is retained exclusively; otherwise only non-Default stops survive. Local XMLTabStopsContext passed all stops through and an existing ODT test incorrectly expected a middle Default stop to survive.
  Impact: Imported explicit tab lists could retain or combine entries that upstream intentionally omits; sorting before this decision would also lose first-Default exclusivity for unsorted or signed input.
  Resolution: Mirrored the pinned loop at the sequence sink before canonical sorting. Corrected the contradictory middle-Default expectation while retaining alignment, decimal and leader assertions. Six literal package cases cover first Default with following lower signed positions, interspersed later defaults, multiple and single defaults, normal unsorted stops, and an explicit empty sequence; each verifies direct and inherited-style import and export/reimport. Metadata records bounded source evidence without module promotion. Command: npm run verify. Result: pass (exit 0). Evidence: verify.log; 577 application, 109 inventory and 19 browser tests, all required coverage 100%, all build/static/docs/source/invariant/parity gates and semanticViolationCount=0. Twelve focused tests passed; doctor and routing passed with existing doctor warnings. Scope: default-tab sequence import selection; wider default/fallback and architectural ownership work remains open, and deliberate product deviations remain unchanged.
