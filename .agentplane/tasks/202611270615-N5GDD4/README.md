---
id: "202611270615-N5GDD4"
title: "Reconcile Writer and shared ODF provenance after branch integration"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 6
origin:
  system: "manual"
depends_on: []
tags:
  - "docs"
  - "odt"
  - "writer"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-11-27T06:15:53.930Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-11-27T06:24:07.298Z"
  updated_by: "CODER"
  note: "Global provenance and both scoped invariant gates pass, and 66 scoped Writer/shared tests pass."
  attempts: 0
commit: null
comments:
  -
    author: "CODER"
    body: "Start: continue direct-mode task in current checkout."
events:
  -
    type: "status"
    at: "2026-11-27T06:16:22.198Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: continue direct-mode task in current checkout."
  -
    type: "verify"
    at: "2026-11-27T06:24:07.298Z"
    author: "CODER"
    state: "ok"
    note: "Global provenance and both scoped invariant gates pass, and 66 scoped Writer/shared tests pass."
doc_version: 3
doc_updated_at: "2026-11-27T06:24:09.186Z"
doc_updated_by: "CODER"
description: "Restore traceable references to native ODT character effects, rotation, annotation and paragraph line numbering after the Writer and Calc integration. Re-run the affected existing tests and repository provenance and registry checks."
sections:
  Summary: "Reconcile the Writer and shared ODF registry evidence affected by the main-branch integration."
  Scope: "Canonical shared and Writer ODF runtime/provenance records for native paragraph line numbering, character line modes, rotation, overline, outline, shadow, relief and annotation rich text. Retain precise existing test and source markers."
  Plan: "Rebind stale Writer and shared ODF provenance to the moved owners and equivalent tests, and rerun their existing tests and registry gates."
  Verify Steps: |-
    - Run source provenance, Calc and Writer registry invariants, and canonical evidence discovery.
    - Run the affected existing Writer ODT, shared text-property, and default-property tests.
    - Check changed registry formatting, policy routing, AgentPlane doctor and git diff integrity.
  Verification: |-
    Pending verification.

    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-11-27T06:24:07.298Z — VERIFY — ok

    By: CODER

    Note: Global provenance and both scoped invariant gates pass, and 66 scoped Writer/shared tests pass.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-11-27T06:16:22.198Z, excerpt_hash=sha256:dc2fb8a87e4b85700d6b4954bd4b91333e4473de1f06bb08ee01a212364aa393

    Details:

    # Writer and shared ODF provenance reconciliation
    - Command: `npm run check:source-provenance`.
      - Result: pass.
      - Evidence: 3141 runtime modules, including 2780 mapped modules.
      - Scope: global canonical source provenance.
    - Commands: `npm run inventory:invariants -- --scope calc`; `npm run inventory:invariants -- --scope writer`.
      - Result: pass.
      - Evidence: zero semantic violations in both reports.
      - Scope: Writer, Calc and shared dependencies.
    - Command: `npx tsx output/playwright/8H0K5B/find-stale-provenance.mts`.
      - Result: pass.
      - Evidence: No absent local markers after fixing ten distinct stale references across eleven provenance records.
    - Commands: `npm run test:writer -- odt-property-roundtrip odt-layout-parity odt-native-character-values odt-annotation`; `npm run test:writer -- odt-line-numbering native-text-default-schema`; `npm run test:shared --workspace @vite-office/office -- txtprmap`.
      - Result: pass.
      - Evidence: 45 + 9 Writer cases and 12 shared cases.
      - Scope: linked existing tests for character effects, rotation, line numbering, paragraph defaults and formatted annotations.
    - Commands: `git ls-files --modified -- '*.json' | xargs npx prettier --check`; `node .agentplane/policy/check-routing.mjs`; `ap doctor`; `git diff --check`.
      - Result: pass.
      - Scope: canonical records and local workflow.

    Only local provenance evidence changed. No full suite was run.

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202611270615-N5GDD4/blueprint/resolved-snapshot.json
    - old_digest: 5fa81cef0110fc63674c0dbf5f9b87178fbb73f920a1f727b06f60108d8c510d
    - current_digest: 5fa81cef0110fc63674c0dbf5f9b87178fbb73f920a1f727b06f60108d8c510d
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202611270615-N5GDD4

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202611270615-N5GDD4
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: false
    - repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert the registry evidence commit."
  Findings: "The Calc annotation task exposed stale global and shared evidence in the merged baseline. Its native Calc provenance and focused 44-test run passed independently."
id_source: "generated"
---
## Summary

Reconcile the Writer and shared ODF registry evidence affected by the main-branch integration.

## Scope

Canonical shared and Writer ODF runtime/provenance records for native paragraph line numbering, character line modes, rotation, overline, outline, shadow, relief and annotation rich text. Retain precise existing test and source markers.

## Plan

Rebind stale Writer and shared ODF provenance to the moved owners and equivalent tests, and rerun their existing tests and registry gates.

## Verify Steps

- Run source provenance, Calc and Writer registry invariants, and canonical evidence discovery.
- Run the affected existing Writer ODT, shared text-property, and default-property tests.
- Check changed registry formatting, policy routing, AgentPlane doctor and git diff integrity.

## Verification

Pending verification.

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-11-27T06:24:07.298Z — VERIFY — ok

By: CODER

Note: Global provenance and both scoped invariant gates pass, and 66 scoped Writer/shared tests pass.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-11-27T06:16:22.198Z, excerpt_hash=sha256:dc2fb8a87e4b85700d6b4954bd4b91333e4473de1f06bb08ee01a212364aa393

Details:

# Writer and shared ODF provenance reconciliation
- Command: `npm run check:source-provenance`.
  - Result: pass.
  - Evidence: 3141 runtime modules, including 2780 mapped modules.
  - Scope: global canonical source provenance.
- Commands: `npm run inventory:invariants -- --scope calc`; `npm run inventory:invariants -- --scope writer`.
  - Result: pass.
  - Evidence: zero semantic violations in both reports.
  - Scope: Writer, Calc and shared dependencies.
- Command: `npx tsx output/playwright/8H0K5B/find-stale-provenance.mts`.
  - Result: pass.
  - Evidence: No absent local markers after fixing ten distinct stale references across eleven provenance records.
- Commands: `npm run test:writer -- odt-property-roundtrip odt-layout-parity odt-native-character-values odt-annotation`; `npm run test:writer -- odt-line-numbering native-text-default-schema`; `npm run test:shared --workspace @vite-office/office -- txtprmap`.
  - Result: pass.
  - Evidence: 45 + 9 Writer cases and 12 shared cases.
  - Scope: linked existing tests for character effects, rotation, line numbering, paragraph defaults and formatted annotations.
- Commands: `git ls-files --modified -- '*.json' | xargs npx prettier --check`; `node .agentplane/policy/check-routing.mjs`; `ap doctor`; `git diff --check`.
  - Result: pass.
  - Scope: canonical records and local workflow.

Only local provenance evidence changed. No full suite was run.

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202611270615-N5GDD4/blueprint/resolved-snapshot.json
- old_digest: 5fa81cef0110fc63674c0dbf5f9b87178fbb73f920a1f727b06f60108d8c510d
- current_digest: 5fa81cef0110fc63674c0dbf5f9b87178fbb73f920a1f727b06f60108d8c510d
- route_changed: no
- safe_command: agentplane blueprint snapshot 202611270615-N5GDD4

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202611270615-N5GDD4
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: false
- repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert the registry evidence commit.

## Findings

The Calc annotation task exposed stale global and shared evidence in the merged baseline. Its native Calc provenance and focused 44-test run passed independently.
