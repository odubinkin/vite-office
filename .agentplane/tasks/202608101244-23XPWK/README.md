---
id: "202608101244-23XPWK"
title: "Implement accessible Writer plain-text editor workbench"
status: "DOING"
priority: "high"
owner: "CODER"
revision: 4
origin:
  system: "manual"
depends_on: []
tags:
  - "writer-editor"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-08-10T12:45:48.303Z"
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
    body: "Start: implement the approved accessible Writer single-paragraph editor workbench."
events:
  -
    type: "status"
    at: "2026-08-10T12:45:56.832Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implement the approved accessible Writer single-paragraph editor workbench."
doc_version: 3
doc_updated_at: "2026-08-10T12:45:56.832Z"
doc_updated_by: "CODER"
description: "Replace the Writer-only static paragraph preview with a bounded accessible plain-text editing workbench backed by the immutable Writer paragraph model. Preserve the static frontend boundary and explicitly document the lack of layout, formatting, multi-paragraph, file-format, and parity-completeness claims."
sections:
  Summary: |-
    Implement accessible Writer plain-text editor workbench

    Replace the Writer-only static paragraph preview with a bounded accessible plain-text editing workbench backed by the immutable Writer paragraph model. Preserve the static frontend boundary and explicitly document the lack of layout, formatting, multi-paragraph, file-format, and parity-completeness claims.
  Scope: |-
    - In scope: Replace the Writer-only static paragraph preview with a bounded accessible plain-text editing workbench backed by the immutable Writer paragraph model. Preserve the static frontend boundary and explicitly document the lack of layout, formatting, multi-paragraph, file-format, and parity-completeness claims.
    - Out of scope: unrelated refactors not required for "Implement accessible Writer plain-text editor workbench".
  Plan: "Scope: replace the static Writer-only paragraph preview with one accessible plain-text editing workbench backed by the immutable Writer paragraph model. The user can edit a named initial paragraph, observe dirty lifecycle state and revision, and preserve the static frontend boundary. Upstream reference is the pinned LibreOffice source sw/qa/core/text/text.cxx and its SwCoreTextTest fixture; this task makes no mapping or parity claim for the fixture's unrelated layout, PDF, or list assertions. Architecture: add a small Writer editor component under apps/office/src/components, integrate it only while Writer is selected, and keep editing state local to React while domain mutations stay in apps/office/src/domain/writer.ts. Tests: component/App interaction tests for initial value, typing, lifecycle/revision feedback, Writer-only visibility, accessible label/status, and no regression to suite selection; preserve 100 percent coverage. Docs: add a browser Writer editor contract, link it from program docs, and state precise exclusions. Non-goals: rich text, multi-paragraph editing, selection model, undo/redo UI, persistence integration, keyboard shortcuts, layout, ODT import/export, locale UI, and all broad LibreOffice parity claims. Verification: run format, lint, typecheck, JSDoc, file-size, application/inventory coverage, browser/static checks via npm run verify, ap doctor, and routing validation."
  Verify Steps: |-
    PLANNER fallback scaffold for "Implement accessible Writer plain-text editor workbench". Replace with task-specific acceptance checks when PLANNER context is available.

    1. Review the requested outcome for "Implement accessible Writer plain-text editor workbench". Expected: the visible result matches ## Summary and stays inside approved scope.
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

Implement accessible Writer plain-text editor workbench

Replace the Writer-only static paragraph preview with a bounded accessible plain-text editing workbench backed by the immutable Writer paragraph model. Preserve the static frontend boundary and explicitly document the lack of layout, formatting, multi-paragraph, file-format, and parity-completeness claims.

## Scope

- In scope: Replace the Writer-only static paragraph preview with a bounded accessible plain-text editing workbench backed by the immutable Writer paragraph model. Preserve the static frontend boundary and explicitly document the lack of layout, formatting, multi-paragraph, file-format, and parity-completeness claims.
- Out of scope: unrelated refactors not required for "Implement accessible Writer plain-text editor workbench".

## Plan

Scope: replace the static Writer-only paragraph preview with one accessible plain-text editing workbench backed by the immutable Writer paragraph model. The user can edit a named initial paragraph, observe dirty lifecycle state and revision, and preserve the static frontend boundary. Upstream reference is the pinned LibreOffice source sw/qa/core/text/text.cxx and its SwCoreTextTest fixture; this task makes no mapping or parity claim for the fixture's unrelated layout, PDF, or list assertions. Architecture: add a small Writer editor component under apps/office/src/components, integrate it only while Writer is selected, and keep editing state local to React while domain mutations stay in apps/office/src/domain/writer.ts. Tests: component/App interaction tests for initial value, typing, lifecycle/revision feedback, Writer-only visibility, accessible label/status, and no regression to suite selection; preserve 100 percent coverage. Docs: add a browser Writer editor contract, link it from program docs, and state precise exclusions. Non-goals: rich text, multi-paragraph editing, selection model, undo/redo UI, persistence integration, keyboard shortcuts, layout, ODT import/export, locale UI, and all broad LibreOffice parity claims. Verification: run format, lint, typecheck, JSDoc, file-size, application/inventory coverage, browser/static checks via npm run verify, ap doctor, and routing validation.

## Verify Steps

PLANNER fallback scaffold for "Implement accessible Writer plain-text editor workbench". Replace with task-specific acceptance checks when PLANNER context is available.

1. Review the requested outcome for "Implement accessible Writer plain-text editor workbench". Expected: the visible result matches ## Summary and stays inside approved scope.
2. Run the most relevant validation step for this task. Expected: it succeeds without unexpected regressions in touched behavior.
3. Compare the final result against ## Scope and record any residual follow-up in ## Findings. Expected: open edges are explicit rather than implicit.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert task-related commit(s).
- Re-run required checks to confirm rollback safety.

## Findings
