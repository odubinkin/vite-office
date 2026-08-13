---
id: "202608130934-F1JT8K"
title: "Remove stale Writer foundation labels"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 10
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-08-13T09:36:59.779Z"
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
    body: "Start: Removing superseded Writer status labels and restoring pointer selection endpoint fidelity with focused coverage."
events:
  -
    type: "status"
    at: "2026-08-13T09:37:05.036Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: Removing superseded Writer status labels and restoring pointer selection endpoint fidelity with focused coverage."
doc_version: 3
doc_updated_at: "2026-08-13T09:37:05.036Z"
doc_updated_by: "CODER"
description: "Remove the obsolete Plain text badge from the Writer workbench and the Foundation only label from the Writer suite selector card, retaining current accessible product naming and UI coverage."
sections:
  Summary: "Remove obsolete Writer foundation-state labels now contradicted by implemented rich-text editing, and repair exact endpoint preservation for pointer selections spanning Writer paragraphs."
  Scope: "In scope: hide the Writer-only suite-card status and remove the Writer \"Plain text\" badge; retain non-Writer foundation labels. Replace whole-paragraph cross-host drag ranges with native selection endpoints derived from the actual pointer caret. Update unit and targeted Chromium coverage. Out of scope: changing Writer feature labels elsewhere, broad suite-status redesign, multi-paragraph editing commands, or selection-model redesign."
  Plan: |-
    1. Update Writer-only suite metadata and chrome so the left selector and workbench title no longer describe its implemented editor as Foundation only or Plain text.
    2. Restore pointer-selection endpoint fidelity by applying the recorded anchor/focus DOM positions instead of selecting full boundary paragraph elements.
    3. Extend focused unit/component and Chromium tests to prove the removed labels and partial forward/reverse cross-paragraph endpoints.
    4. Run the declared fast and targeted verification, record evidence, commit, and close the task.
  Verify Steps: |-
    1. cd apps/office && npm run typecheck && npm run test:coverage — expected: fast unit/component tests pass with strict coverage.
    2. npm run test:e2e -- --grep "document-wide selection" — expected: Chromium proves forward and reverse pointer drags retain partial endpoint offsets across paragraphs.
    3. npm run format:check && npm run lint && npm run check:docs && npm run check:file-size — expected: formatting, lint, JSDoc, and size gates pass.
    4. git diff --check && git status --short --untracked-files=all — expected: no whitespace errors and only intentional tracked task changes before closure.
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert the task implementation commit to restore the previous labels and pointer-selection implementation. No persisted document data, external systems, or schema are changed."
  Findings: "Root cause established before implementation: apps/office/src/sw/source/uibase/docvw/edtwin.tsx stored real pointer caret endpoints but rebuilt cross-paragraph ranges with Range.setStartBefore and Range.setEndAfter, expanding both boundary paragraphs. The fix must use the stored text-node endpoints."
id_source: "generated"
---
## Summary

Remove obsolete Writer foundation-state labels now contradicted by implemented rich-text editing, and repair exact endpoint preservation for pointer selections spanning Writer paragraphs.

## Scope

In scope: hide the Writer-only suite-card status and remove the Writer "Plain text" badge; retain non-Writer foundation labels. Replace whole-paragraph cross-host drag ranges with native selection endpoints derived from the actual pointer caret. Update unit and targeted Chromium coverage. Out of scope: changing Writer feature labels elsewhere, broad suite-status redesign, multi-paragraph editing commands, or selection-model redesign.

## Plan

1. Update Writer-only suite metadata and chrome so the left selector and workbench title no longer describe its implemented editor as Foundation only or Plain text.
2. Restore pointer-selection endpoint fidelity by applying the recorded anchor/focus DOM positions instead of selecting full boundary paragraph elements.
3. Extend focused unit/component and Chromium tests to prove the removed labels and partial forward/reverse cross-paragraph endpoints.
4. Run the declared fast and targeted verification, record evidence, commit, and close the task.

## Verify Steps

1. cd apps/office && npm run typecheck && npm run test:coverage — expected: fast unit/component tests pass with strict coverage.
2. npm run test:e2e -- --grep "document-wide selection" — expected: Chromium proves forward and reverse pointer drags retain partial endpoint offsets across paragraphs.
3. npm run format:check && npm run lint && npm run check:docs && npm run check:file-size — expected: formatting, lint, JSDoc, and size gates pass.
4. git diff --check && git status --short --untracked-files=all — expected: no whitespace errors and only intentional tracked task changes before closure.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert the task implementation commit to restore the previous labels and pointer-selection implementation. No persisted document data, external systems, or schema are changed.

## Findings

Root cause established before implementation: apps/office/src/sw/source/uibase/docvw/edtwin.tsx stored real pointer caret endpoints but rebuilt cross-paragraph ranges with Range.setStartBefore and Range.setEndAfter, expanding both boundary paragraphs. The fix must use the stored text-node endpoints.
