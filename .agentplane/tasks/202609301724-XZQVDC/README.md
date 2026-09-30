---
id: "202609301724-XZQVDC"
title: "Restore native tab import position and alignment defaults"
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
  updated_at: "2026-09-30T17:24:39.835Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-09-30T17:30:03.370Z"
  updated_by: "CODER"
  note: "Native zero-position and recognized-only alignment defaults verified with 12 literal direct/inherited ODT cases, focused 9 tests and full verify 578/109/19 at 100% coverage; routing and scoped diff clean."
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
  -
    type: "verify"
    at: "2026-09-30T17:30:03.370Z"
    author: "CODER"
    state: "ok"
    note: "Native zero-position and recognized-only alignment defaults verified with 12 literal direct/inherited ODT cases, focused 9 tests and full verify 578/109/19 at 100% coverage; routing and scoped diff clean."
doc_version: 3
doc_updated_at: "2026-09-30T17:30:03.424Z"
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
    ### 2026-09-30T17:30:03.370Z — VERIFY — ok

    By: CODER

    Note: Native zero-position and recognized-only alignment defaults verified with 12 literal direct/inherited ODT cases, focused 9 tests and full verify 578/109/19 at 100% coverage; routing and scoped diff clean.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-30T17:30:03.057Z, excerpt_hash=sha256:f931df2a9fdea9985ede5ab12ca4bda0c66c5f782d0494c5389932f9a7b98934

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609301724-XZQVDC/blueprint/resolved-snapshot.json
    - old_digest: 555a7787d0eb4ad6d9868acf5de4046f4d8f621f5c7d7e237d0e70d5c82f1b69
    - current_digest: 555a7787d0eb4ad6d9868acf5de4046f4d8f621f5c7d7e237d0e70d5c82f1b69
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202609301724-XZQVDC

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202609301724-XZQVDC
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: false
    - repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert the task implementation commit and its bounded metadata evidence if a regression is demonstrated; preserve unrelated completed tasks."
  Findings: "Command: focused Vitest ODT property test. Result: pass (9 tests). Evidence: focused.log; 12 literal XML default/override cases assert direct and inherited properties on import and reimport, including retained Default source ordering and unchanged leader fields. Source: pinned xmltabi.cxx initializes Position=0 and LEFT then overwrites only recognized types. Command: npm run verify. Result: pass, exit 0; 578 app, 109 inventory, 19 browser tests, 100% coverage, semanticViolationCount=0. Evidence: verify.log. Scope: four implementation/test/evidence metadata files, no broader parity promotion. Command: ap doctor, routing check, git diff --check. Result: pass; doctor has two pre-existing tooling/history warnings. Residual: native convertMeasure failure keeps Position=0 whereas importOdfLength still throws; converter grammar, MM100 intermediate units and rounding need separate source-backed correction. Unknown attributes and leaf context ownership remain unverified."
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
### 2026-09-30T17:30:03.370Z — VERIFY — ok

By: CODER

Note: Native zero-position and recognized-only alignment defaults verified with 12 literal direct/inherited ODT cases, focused 9 tests and full verify 578/109/19 at 100% coverage; routing and scoped diff clean.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-30T17:30:03.057Z, excerpt_hash=sha256:f931df2a9fdea9985ede5ab12ca4bda0c66c5f782d0494c5389932f9a7b98934

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609301724-XZQVDC/blueprint/resolved-snapshot.json
- old_digest: 555a7787d0eb4ad6d9868acf5de4046f4d8f621f5c7d7e237d0e70d5c82f1b69
- current_digest: 555a7787d0eb4ad6d9868acf5de4046f4d8f621f5c7d7e237d0e70d5c82f1b69
- route_changed: no
- safe_command: agentplane blueprint snapshot 202609301724-XZQVDC

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202609301724-XZQVDC
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: false
- repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert the task implementation commit and its bounded metadata evidence if a regression is demonstrated; preserve unrelated completed tasks.

## Findings

Command: focused Vitest ODT property test. Result: pass (9 tests). Evidence: focused.log; 12 literal XML default/override cases assert direct and inherited properties on import and reimport, including retained Default source ordering and unchanged leader fields. Source: pinned xmltabi.cxx initializes Position=0 and LEFT then overwrites only recognized types. Command: npm run verify. Result: pass, exit 0; 578 app, 109 inventory, 19 browser tests, 100% coverage, semanticViolationCount=0. Evidence: verify.log. Scope: four implementation/test/evidence metadata files, no broader parity promotion. Command: ap doctor, routing check, git diff --check. Result: pass; doctor has two pre-existing tooling/history warnings. Residual: native convertMeasure failure keeps Position=0 whereas importOdfLength still throws; converter grammar, MM100 intermediate units and rounding need separate source-backed correction. Unknown attributes and leaf context ownership remain unverified.
