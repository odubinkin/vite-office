---
id: "202609241521-D5QMQG"
title: "Complete scalar paragraph character and page properties"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 6
origin:
  system: "manual"
depends_on:
  - "202609241521-NM0G73"
tags:
  - "code"
task_kind: "code"
mutation_scope: "code"
verify:
  - "Run source-backed scalar ODT fixture tests plus UI property edit/reopen tests and invalid-value tests."
  - "npm run verify"
plan_approval:
  state: "approved"
  updated_at: "2026-09-24T15:23:16.293Z"
  updated_by: "ORCHESTRATOR"
  note: "User requested implementation of the seven ordered phases in docs/program/certification-odt-import-plan.md; outside-repo sample access remains pending separate authorization."
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
    body: "Start: continue direct-mode task in current checkout."
events:
  -
    type: "status"
    at: "2026-09-24T16:23:56.980Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: continue direct-mode task in current checkout."
doc_version: 3
doc_updated_at: "2026-09-24T16:23:56.980Z"
doc_updated_by: "CODER"
description: "Phase 2: upstream-mapped scalar style items, inheritance, import/export, rendering and Writer controls/dialogs."
sections:
  Summary: |-
    Complete scalar paragraph character and page properties

    Phase 2: upstream-mapped scalar style items, inheritance, import/export, rendering and Writer controls/dialogs.
  Scope: "Scalar paragraph, character and page items, inherited/direct style routing, export/reimport, layout and editable Writer controls."
  Plan: |-
    1. Map each observed property to pinned style context and pooled item.
    2. Implement canonical import/export and inherited/default behavior.
    3. Extend Paragraph, Character and Page Style controls with upstream choices/defaults/validation.
    4. Verify layout and UI persistence with pinned ODTs and synthetic invalid cases.
  Verify Steps: |-
    1. `npm run verify` passes.
    2. Pinned `tdf114287.odt` and `styles.odt` feature tests pass, plus another upstream ODT where needed.
    3. Representative inherited, direct and invalid property tests pass through import/export/reimport.
    4. UI tests set and reopen every newly editable property; sample warning and semantic deltas are recorded.
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

Complete scalar paragraph character and page properties

Phase 2: upstream-mapped scalar style items, inheritance, import/export, rendering and Writer controls/dialogs.

## Scope

Scalar paragraph, character and page items, inherited/direct style routing, export/reimport, layout and editable Writer controls.

## Plan

1. Map each observed property to pinned style context and pooled item.
2. Implement canonical import/export and inherited/default behavior.
3. Extend Paragraph, Character and Page Style controls with upstream choices/defaults/validation.
4. Verify layout and UI persistence with pinned ODTs and synthetic invalid cases.

## Verify Steps

1. `npm run verify` passes.
2. Pinned `tdf114287.odt` and `styles.odt` feature tests pass, plus another upstream ODT where needed.
3. Representative inherited, direct and invalid property tests pass through import/export/reimport.
4. UI tests set and reopen every newly editable property; sample warning and semantic deltas are recorded.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert task-related commit(s).
- Re-run required checks to confirm rollback safety.

## Findings
