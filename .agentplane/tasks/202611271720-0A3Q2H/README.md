---
id: "202611271720-0A3Q2H"
title: "Implement native Calc embedded fonts in ODS packages"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 4
origin:
  system: "manual"
depends_on: []
tags:
  - "calc"
  - "odf"
task_kind: "code"
mutation_scope: "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-11-27T17:20:48.281Z"
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
    body: "Start: attach native Calc ODS font embedding and package resources."
events:
  -
    type: "status"
    at: "2026-11-27T17:20:48.713Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: attach native Calc ODS font embedding and package resources."
doc_version: 3
doc_updated_at: "2026-11-27T17:20:48.713Z"
doc_updated_by: "CODER"
description: "Connect Calc's native font embedding flags and original XMLFontAutoStylePool to the shared ODF font declaration and package resource path. Retain admitted font bytes and rights metadata through ODS imports and exports and the Worker, and share the existing Writer resource checks while preserving their behavior. Port the native Calc defaults and verify pinned embedded font bytes in ODS."
sections:
  Summary: |-
    Implement native Calc embedded fonts in ODS packages

    Connect Calc's native font embedding flags and original XMLFontAutoStylePool to the shared ODF font declaration and package resource path. Retain admitted font bytes and rights metadata through ODS imports and exports and the Worker, and share the existing Writer resource checks while preserving their behavior. Port the native Calc defaults and verify pinned embedded font bytes in ODS.
  Scope: |-
    - In scope: Connect Calc's native font embedding flags and original XMLFontAutoStylePool to the shared ODF font declaration and package resource path. Retain admitted font bytes and rights metadata through ODS imports and exports and the Worker, and share the existing Writer resource checks while preserving their behavior. Port the native Calc defaults and verify pinned embedded font bytes in ODS.
    - Out of scope: unrelated refactors not required for "Implement native Calc embedded fonts in ODS packages".
  Plan: "Follow Calc document embedding defaults, ScXMLImport::NotifyContainsEmbeddedFont, ScXMLExport's font pool, and native configuration properties. Share the existing OpenType package validation with Writer, retain approved payload bytes and metadata across the Calc Worker, and write native font declarations, package parts and manifest entries. Verify native flags and ODS round trips using original pinned LibreOffice font data and run related Calc and Writer font tests. Keep the established browser font rights and package limits."
  Verify Steps: |-
    PLANNER fallback scaffold for "Implement native Calc embedded fonts in ODS packages". Replace with task-specific acceptance checks when PLANNER context is available.

    1. Review the requested outcome for "Implement native Calc embedded fonts in ODS packages". Expected: the visible result matches ## Summary and stays inside approved scope.
    2. Run the most relevant validation step for this task. Expected: it succeeds without unexpected regressions in touched behavior.
    3. Compare the final result against ## Scope and record any residual follow-up in ## Findings. Expected: open edges are explicit rather than implicit.
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

Implement native Calc embedded fonts in ODS packages

Connect Calc's native font embedding flags and original XMLFontAutoStylePool to the shared ODF font declaration and package resource path. Retain admitted font bytes and rights metadata through ODS imports and exports and the Worker, and share the existing Writer resource checks while preserving their behavior. Port the native Calc defaults and verify pinned embedded font bytes in ODS.

## Scope

- In scope: Connect Calc's native font embedding flags and original XMLFontAutoStylePool to the shared ODF font declaration and package resource path. Retain admitted font bytes and rights metadata through ODS imports and exports and the Worker, and share the existing Writer resource checks while preserving their behavior. Port the native Calc defaults and verify pinned embedded font bytes in ODS.
- Out of scope: unrelated refactors not required for "Implement native Calc embedded fonts in ODS packages".

## Plan

Follow Calc document embedding defaults, ScXMLImport::NotifyContainsEmbeddedFont, ScXMLExport's font pool, and native configuration properties. Share the existing OpenType package validation with Writer, retain approved payload bytes and metadata across the Calc Worker, and write native font declarations, package parts and manifest entries. Verify native flags and ODS round trips using original pinned LibreOffice font data and run related Calc and Writer font tests. Keep the established browser font rights and package limits.

## Verify Steps

PLANNER fallback scaffold for "Implement native Calc embedded fonts in ODS packages". Replace with task-specific acceptance checks when PLANNER context is available.

1. Review the requested outcome for "Implement native Calc embedded fonts in ODS packages". Expected: the visible result matches ## Summary and stays inside approved scope.
2. Run the most relevant validation step for this task. Expected: it succeeds without unexpected regressions in touched behavior.
3. Compare the final result against ## Scope and record any residual follow-up in ## Findings. Expected: open edges are explicit rather than implicit.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert task-related commit(s).
- Re-run required checks to confirm rollback safety.

## Findings
