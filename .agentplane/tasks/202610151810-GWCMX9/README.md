---
id: "202610151810-GWCMX9"
title: "Map Calc document UI and ODS critical path"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 8
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
  state: "pending"
  updated_at: null
  updated_by: null
  note: null
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
doc_version: 3
doc_updated_at: "2026-10-15T18:10:48.108Z"
doc_updated_by: "CODER"
description: "Task161: replace speculative UI readiness estimates with a source-audited dependency and implementation order for the actual ScDocument cell-edit and ODS round-trip path, reusing shared Writer owners. No implementation stubs or full-suite milestone claim."
sections:
  Summary: "Establish a source-audited implementation order for the first real editable Calc document and same-model ODS round trip; supersede unsupported readiness estimates."
  Scope: "Documentation-only: docs/program/calc-ui-readiness.md and a current-status pointer in calc-core.md. Read pinned Calc constructors, cell setters, filter entry points, shared ZIP/XML owners and existing TypeScript implementations. No stubs, native probes, tests/builds or implementation changes."
  Plan: "Audit constructor and cell-edit dependencies from ScDocument through ScTable and ScColumn; inspect existing storage, string/text, shared ZIP/XML implementations and Calc ODS entry points. Record concrete missing contracts and ordered deliverables with readiness exit criteria, distinguish syntax adapters from actual shared providers, and identify the next justified implementation owner. Validate every path and source anchor, documentation diff and routing/doctor, then commit and finish without claiming UI readiness or triggering the conditional full run."
  Verify Steps: "Check every linked local source path and cited native signature against the pinned local checkout; verify absence/presence of named TypeScript owners via bounded source searches and inspect existing shared implementations, not only filenames. Run git diff --check, node .agentplane/policy/check-routing.mjs and ap doctor. Review documentation for no numeric readiness estimate, no invented provider, no premature full-run/pause claim, and an explicit implementable next owner with upstream dependencies."
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert the task-specific documentation commit; no executable behavior, fixtures, inventory mappings or task records from other work are changed."
  Findings: ""
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

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert the task-specific documentation commit; no executable behavior, fixtures, inventory mappings or task records from other work are changed.

## Findings
