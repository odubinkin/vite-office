---
id: "202609240501-GVMCJY"
title: "Restore ODT XML and package contracts"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 7
origin:
  system: "manual"
depends_on:
  - "202609240501-81449V"
tags:
  - "code"
verify:
  - "npm run verify"
plan_approval:
  state: "approved"
  updated_at: "2026-09-24T08:08:03.271Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-09-24T08:27:36.433Z"
  updated_by: "CODER"
  note: "Pinned SvXMLImport processing instructions and browser Worker boundary checked; npm run verify passed with 470 office tests at 100% coverage, 96 inventory tests, 14 browser tests, source tree and provenance."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-09-24T08:27:41.704Z"
  updated_by: "EVALUATOR"
  note: "Stage 6 canonical ODT filter and Worker boundary verified."
  evaluated_sha: "47aa91e44d677c96423249c12273e447a5948910"
  blueprint_digest: "02877714d3114a5231e47c354ba21a71f0d657fbfd8205ffe738a9cc0d8d18f0"
  evidence_refs:
    - ".agentplane/tasks/202609240501-GVMCJY/README.md"
    - ".agentplane/tasks/202609240501-GVMCJY/quality/20260924-082741704-recovery-context/quality-report.json"
    - ".agentplane/tasks/202609240501-GVMCJY/quality/20260924-082741704-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202609240501-GVMCJY/quality/20260924-082741704-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202609240501-GVMCJY/blueprint/resolved-snapshot.json"
    - "apps/office/src/sw/source/filter/xml/odt-roundtrip.test.ts"
    - "apps/office/src/sw/browser/filter/xml/odt-transfer.ts"
    - "/tmp/vite-office-stage6-verify.log"
  findings:
    - "Pinned XML processing instructions and comments import; ODT service now uses SwDoc; Worker clone codecs live in browser; full verification passes."
commit: null
comments:
  -
    author: "CODER"
    body: "Start: compare pinned LibreOffice ODT contracts, repair demonstrated differences, isolate Worker transport, and verify."
events:
  -
    type: "status"
    at: "2026-09-24T08:08:13.488Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: compare pinned LibreOffice ODT contracts, repair demonstrated differences, isolate Worker transport, and verify."
  -
    type: "verify"
    at: "2026-09-24T08:27:36.433Z"
    author: "CODER"
    state: "ok"
    note: "Pinned SvXMLImport processing instructions and browser Worker boundary checked; npm run verify passed with 470 office tests at 100% coverage, 96 inventory tests, 14 browser tests, source tree and provenance."
doc_version: 3
doc_updated_at: "2026-09-24T08:27:36.517Z"
doc_updated_by: "CODER"
description: "Stage 6: audit supported ODT streams and properties, repair demonstrated differences including processing instructions, and isolate Worker transport"
sections:
  Summary: |-
    Restore ODT XML and package contracts

    Stage 6: audit supported ODT streams and properties, repair demonstrated differences including processing instructions, and isolate Worker transport
  Scope: |-
    - In scope: Stage 6: audit supported ODT streams and properties, repair demonstrated differences including processing instructions, and isolate Worker transport.
    - Out of scope: unrelated refactors not required for "Restore ODT XML and package contracts".
  Plan: |-
    1. Compare each supported ODT stream, style/property/list/hyperlink mapping, ZIP manifest default, malformed XML behavior, and emission order against pinned LibreOffice owners and existing fixtures; record precise matches and discrepancies.
    2. Repair demonstrated mismatches in corresponding sax/xmloff/package/sw filter modules, including legal XML processing instructions. Keep browser resource ceilings and supported format scope.
    3. Move Worker transport/envelope and clone codec behind sw/browser/filter/xml while retaining the single SwDoc and ODT filter contract; update imports and provenance.
    4. Add source-backed cases, update inventory data, run focused and full verification, review scope, commit and close.
  Verify Steps: |-
    1. Each changed XML, package, filter, or transport operation identifies a pinned upstream owner/symbol and a bounded assertion; unsupported formats remain explicit.
    2. Valid ODT XML with comments and processing instructions imports; hostile or over-budget input remains rejected. Supported stream/property/list/hyperlink and manifest round trips preserve canonical SwDoc values and stable output.
    3. Worker transport records and clone codec reside under sw/browser/filter/xml, with filter interfaces free of transport types; existing ODT workflow and browser save behavior pass.
    4. Existing inventory/provenance data accurately describe changes; npm run verify passes and final tracked state is clean.
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-09-24T08:27:36.433Z — VERIFY — ok

    By: CODER

    Note: Pinned SvXMLImport processing instructions and browser Worker boundary checked; npm run verify passed with 470 office tests at 100% coverage, 96 inventory tests, 14 browser tests, source tree and provenance.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-24T08:08:13.488Z, excerpt_hash=sha256:b50b22b37b37e7338e8f35f4fef6563cb45fd6512ca556ca6bd202f446710968

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609240501-GVMCJY/blueprint/resolved-snapshot.json
    - old_digest: 02877714d3114a5231e47c354ba21a71f0d657fbfd8205ffe738a9cc0d8d18f0
    - current_digest: 02877714d3114a5231e47c354ba21a71f0d657fbfd8205ffe738a9cc0d8d18f0
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202609240501-GVMCJY

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202609240501-GVMCJY
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
    - Observation: Legal ODT comments and processing instructions were rejected; source filter contracts exposed Worker graph records.
      Impact: Valid ODTs could fail import, and shell/filter ownership crossed into browser transport.
      Resolution: Accepted inert XML lexical events, moved clone codecs and envelope into sw/browser/filter/xml, and changed shell/filter contracts to canonical SwDoc.
id_source: "generated"
---
## Summary

Restore ODT XML and package contracts

Stage 6: audit supported ODT streams and properties, repair demonstrated differences including processing instructions, and isolate Worker transport

## Scope

- In scope: Stage 6: audit supported ODT streams and properties, repair demonstrated differences including processing instructions, and isolate Worker transport.
- Out of scope: unrelated refactors not required for "Restore ODT XML and package contracts".

## Plan

1. Compare each supported ODT stream, style/property/list/hyperlink mapping, ZIP manifest default, malformed XML behavior, and emission order against pinned LibreOffice owners and existing fixtures; record precise matches and discrepancies.
2. Repair demonstrated mismatches in corresponding sax/xmloff/package/sw filter modules, including legal XML processing instructions. Keep browser resource ceilings and supported format scope.
3. Move Worker transport/envelope and clone codec behind sw/browser/filter/xml while retaining the single SwDoc and ODT filter contract; update imports and provenance.
4. Add source-backed cases, update inventory data, run focused and full verification, review scope, commit and close.

## Verify Steps

1. Each changed XML, package, filter, or transport operation identifies a pinned upstream owner/symbol and a bounded assertion; unsupported formats remain explicit.
2. Valid ODT XML with comments and processing instructions imports; hostile or over-budget input remains rejected. Supported stream/property/list/hyperlink and manifest round trips preserve canonical SwDoc values and stable output.
3. Worker transport records and clone codec reside under sw/browser/filter/xml, with filter interfaces free of transport types; existing ODT workflow and browser save behavior pass.
4. Existing inventory/provenance data accurately describe changes; npm run verify passes and final tracked state is clean.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-09-24T08:27:36.433Z — VERIFY — ok

By: CODER

Note: Pinned SvXMLImport processing instructions and browser Worker boundary checked; npm run verify passed with 470 office tests at 100% coverage, 96 inventory tests, 14 browser tests, source tree and provenance.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-24T08:08:13.488Z, excerpt_hash=sha256:b50b22b37b37e7338e8f35f4fef6563cb45fd6512ca556ca6bd202f446710968

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609240501-GVMCJY/blueprint/resolved-snapshot.json
- old_digest: 02877714d3114a5231e47c354ba21a71f0d657fbfd8205ffe738a9cc0d8d18f0
- current_digest: 02877714d3114a5231e47c354ba21a71f0d657fbfd8205ffe738a9cc0d8d18f0
- route_changed: no
- safe_command: agentplane blueprint snapshot 202609240501-GVMCJY

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202609240501-GVMCJY
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

- Observation: Legal ODT comments and processing instructions were rejected; source filter contracts exposed Worker graph records.
  Impact: Valid ODTs could fail import, and shell/filter ownership crossed into browser transport.
  Resolution: Accepted inert XML lexical events, moved clone codecs and envelope into sw/browser/filter/xml, and changed shell/filter contracts to canonical SwDoc.
