---
id: "202610151810-GWCMX9"
title: "Map Calc document UI and ODS critical path"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 13
origin:
  system: "manual"
depends_on: []
tags:
  - "research"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-15T18:10:42.545Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-10-15T18:14:08.828Z"
  updated_by: "CODER"
  note: "Documentation-only audit passed: 29 valid local links,26 native anchors at pinned HEAD,11 absent real owner definitions and Writer spreadsheet-ignore confirmation; routing/diff checks pass, doctor OK with existing warning. No runtime mappings or coverage changed."
  attempts: 0
commit: null
comments:
  -
    author: "CODER"
    body: "Start: audit pinned document/cell/filter contracts and current shared implementations to establish the direct UI/ODS critical path under the standing approved Calc goal."
events:
  -
    type: "status"
    at: "2026-10-15T18:10:48.108Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: audit pinned document/cell/filter contracts and current shared implementations to establish the direct UI/ODS critical path under the standing approved Calc goal."
  -
    type: "verify"
    at: "2026-10-15T18:14:08.828Z"
    author: "CODER"
    state: "ok"
    note: "Documentation-only audit passed: 29 valid local links,26 native anchors at pinned HEAD,11 absent real owner definitions and Writer spreadsheet-ignore confirmation; routing/diff checks pass, doctor OK with existing warning. No runtime mappings or coverage changed."
doc_version: 3
doc_updated_at: "2026-10-15T18:14:16.445Z"
doc_updated_by: "CODER"
description: "Task161: replace speculative UI readiness estimates with a source-audited dependency and implementation order for the actual ScDocument cell-edit and ODS round-trip path, reusing shared Writer owners. No implementation stubs or full-suite milestone claim."
sections:
  Summary: "Establish a source-audited implementation order for the first real editable Calc document and same-model ODS round trip; supersede unsupported readiness estimates."
  Scope: "Documentation-only: docs/program/calc-ui-readiness.md and a current-status pointer in calc-core.md. Read pinned Calc constructors, cell setters, filter entry points, shared ZIP/XML owners and existing TypeScript implementations. No stubs, native probes, tests/builds or implementation changes."
  Plan: "Audit constructor and cell-edit dependencies from ScDocument through ScTable and ScColumn; inspect existing storage, string/text, shared ZIP/XML implementations and Calc ODS entry points. Record concrete missing contracts and ordered deliverables with readiness exit criteria, distinguish syntax adapters from actual shared providers, and identify the next justified implementation owner. Validate every path and source anchor, documentation diff and routing/doctor, then commit and finish without claiming UI readiness or triggering the conditional full run."
  Verify Steps: "Check every linked local source path and cited native signature against the pinned local checkout; verify absence/presence of named TypeScript owners via bounded source searches and inspect existing shared implementations, not only filenames. Run git diff --check, node .agentplane/policy/check-routing.mjs and ap doctor. Review documentation for no numeric readiness estimate, no invented provider, no premature full-run/pause claim, and an explicit implementable next owner with upstream dependencies."
  Verification: |-
    PASS: documentation audit resolves all local links, checks native constructor/cell/filter anchors at pinned reference HEAD, verifies absent implementations across all non-test TypeScript sources and confirms Writer explicitly ignores office:spreadsheet. git diff --check and policy routing pass; ap doctor OK with existing hook-shim warning (no hook changes). Source scope: only calc-ui-readiness.md and current-status pointer in calc-core.md. No implementation/fixture/registry changes; no code test or full-suite replay applies to this documentation-only task.

    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-10-15T18:14:08.828Z — VERIFY — ok

    By: CODER

    Note: Documentation-only audit passed: 29 valid local links,26 native anchors at pinned HEAD,11 absent real owner definitions and Writer spreadsheet-ignore confirmation; routing/diff checks pass, doctor OK with existing warning. No runtime mappings or coverage changed.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-15T18:13:59.449Z, excerpt_hash=sha256:0eca84f525d88bb059b096a5225292fa47d29d35606fe7501e866216538c3b5e

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202610151810-GWCMX9/blueprint/resolved-snapshot.json
    - old_digest: 4ea8095a155f2696907e1df6985dee4240dc0a4943755ce9bf704b80ef4c3b15
    - current_digest: 4ea8095a155f2696907e1df6985dee4240dc0a4943755ce9bf704b80ef4c3b15
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202610151810-GWCMX9

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202610151810-GWCMX9
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: false
    - repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert the task-specific documentation commit; no executable behavior, fixtures, inventory mappings or task records from other work are changed."
  Findings: |-
    Source-backed priority correction: ScPoolHelper creates the document/style pools eagerly but EditEngine pool and number formatter lazily. Empty ScAttrArray also has a real early return. Complete EditEngine is therefore not an unconditional constructor prerequisite. Actual blockers include missing SharedStringPool/CharClass, partial VCL Font/default-font provider and missing style/document owners. Shared package manifest is ODT-specific, not already ODS-ready. Existing scalar Unicode evidence explicitly excludes whole-string locale casing. Next implementation owner is VCL spreadsheet default-font pipeline required by ScDocumentPool. Failed discovery assumptions (src/mdds, attrarray spelling, absent xmlexp and unmatched glob) were corrected by authoritative file/signature searches; no checks relied on failed reads. No runtime or inventory status changes and no UI/ODS readiness claim.

    - Observation: Evaluator rejected recording while the audited documentation was still uncommitted; no quality_review was recorded by that attempt.
      Impact: Quality review requires a clean implementation tree tied to a commit.
      Resolution: Persist the two documentation files and task evidence first, then rerun the same evaluator review on the committed tree before closure.
id_source: "generated"
---
## Summary

Establish a source-audited implementation order for the first real editable Calc document and same-model ODS round trip; supersede unsupported readiness estimates.

## Scope

Documentation-only: docs/program/calc-ui-readiness.md and a current-status pointer in calc-core.md. Read pinned Calc constructors, cell setters, filter entry points, shared ZIP/XML owners and existing TypeScript implementations. No stubs, native probes, tests/builds or implementation changes.

## Plan

Audit constructor and cell-edit dependencies from ScDocument through ScTable and ScColumn; inspect existing storage, string/text, shared ZIP/XML implementations and Calc ODS entry points. Record concrete missing contracts and ordered deliverables with readiness exit criteria, distinguish syntax adapters from actual shared providers, and identify the next justified implementation owner. Validate every path and source anchor, documentation diff and routing/doctor, then commit and finish without claiming UI readiness or triggering the conditional full run.

## Verify Steps

Check every linked local source path and cited native signature against the pinned local checkout; verify absence/presence of named TypeScript owners via bounded source searches and inspect existing shared implementations, not only filenames. Run git diff --check, node .agentplane/policy/check-routing.mjs and ap doctor. Review documentation for no numeric readiness estimate, no invented provider, no premature full-run/pause claim, and an explicit implementable next owner with upstream dependencies.

## Verification

PASS: documentation audit resolves all local links, checks native constructor/cell/filter anchors at pinned reference HEAD, verifies absent implementations across all non-test TypeScript sources and confirms Writer explicitly ignores office:spreadsheet. git diff --check and policy routing pass; ap doctor OK with existing hook-shim warning (no hook changes). Source scope: only calc-ui-readiness.md and current-status pointer in calc-core.md. No implementation/fixture/registry changes; no code test or full-suite replay applies to this documentation-only task.

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-10-15T18:14:08.828Z — VERIFY — ok

By: CODER

Note: Documentation-only audit passed: 29 valid local links,26 native anchors at pinned HEAD,11 absent real owner definitions and Writer spreadsheet-ignore confirmation; routing/diff checks pass, doctor OK with existing warning. No runtime mappings or coverage changed.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-15T18:13:59.449Z, excerpt_hash=sha256:0eca84f525d88bb059b096a5225292fa47d29d35606fe7501e866216538c3b5e

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202610151810-GWCMX9/blueprint/resolved-snapshot.json
- old_digest: 4ea8095a155f2696907e1df6985dee4240dc0a4943755ce9bf704b80ef4c3b15
- current_digest: 4ea8095a155f2696907e1df6985dee4240dc0a4943755ce9bf704b80ef4c3b15
- route_changed: no
- safe_command: agentplane blueprint snapshot 202610151810-GWCMX9

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202610151810-GWCMX9
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: false
- repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert the task-specific documentation commit; no executable behavior, fixtures, inventory mappings or task records from other work are changed.

## Findings

Source-backed priority correction: ScPoolHelper creates the document/style pools eagerly but EditEngine pool and number formatter lazily. Empty ScAttrArray also has a real early return. Complete EditEngine is therefore not an unconditional constructor prerequisite. Actual blockers include missing SharedStringPool/CharClass, partial VCL Font/default-font provider and missing style/document owners. Shared package manifest is ODT-specific, not already ODS-ready. Existing scalar Unicode evidence explicitly excludes whole-string locale casing. Next implementation owner is VCL spreadsheet default-font pipeline required by ScDocumentPool. Failed discovery assumptions (src/mdds, attrarray spelling, absent xmlexp and unmatched glob) were corrected by authoritative file/signature searches; no checks relied on failed reads. No runtime or inventory status changes and no UI/ODS readiness claim.

- Observation: Evaluator rejected recording while the audited documentation was still uncommitted; no quality_review was recorded by that attempt.
  Impact: Quality review requires a clean implementation tree tied to a commit.
  Resolution: Persist the two documentation files and task evidence first, then rerun the same evaluator review on the committed tree before closure.
