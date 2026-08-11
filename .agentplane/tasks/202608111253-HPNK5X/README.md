---
id: "202608111253-HPNK5X"
title: "Create Writer paragraphs through Enter"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 7
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-08-11T12:54:38.452Z"
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
    body: "Start: implementing caret-based Writer paragraph breaks through native Enter with immutable document history and no new command surface."
events:
  -
    type: "status"
    at: "2026-08-11T12:54:44.978Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implementing caret-based Writer paragraph breaks through native Enter with immutable document history and no new command surface."
doc_version: 3
doc_updated_at: "2026-08-11T12:54:44.978Z"
doc_updated_by: "CODER"
description: "Implement browser-native Enter handling in the integrated Writer document canvas. Split the focused plain-text paragraph at its caret, preserve paragraph formatting on the new paragraph, maintain immutable history and storage behavior, and verify unit, component, and targeted browser coverage without adding an artificial toolbar or menu command."
sections:
  Summary: |-
    Create Writer paragraphs through Enter

    Implement browser-native Enter handling in the integrated Writer document canvas. Split the focused plain-text paragraph at its caret, preserve paragraph formatting on the new paragraph, maintain immutable history and storage behavior, and verify unit, component, and targeted browser coverage without adding an artificial toolbar or menu command.
  Scope: |-
    - In scope: Add the pure Writer-document split operation; intercept unmodified Enter in an integrated editable paragraph; calculate the collapsed caret offset; create and focus the following paragraph; inherit the source paragraph's alignment and paragraph style; retain immutable history, persistence, and download behavior.
    - In scope: Extend domain, component, and focused browser tests; document the browser behavior, upstream parity evidence, and explicit limitations.
    - Out of scope: Shift+Enter line breaks, selection-range replacement, lists, tables, rich text, keyboard menu navigation, or unrelated UI restructuring.
    - UI placement: normal Enter remains direct document-canvas interaction, not a File/Edit/View menu item or a toolbar control, matching Writer's editing model.
  Plan: |-
    1. Inspect the current Writer document model and editable paragraph surface, then add a small immutable split primitive with stable identity and paragraph-property inheritance.
    2. Wire unmodified Enter to the caret-based split, focus the new paragraph at offset zero, and preserve existing format, history, storage, and download flows without adding a non-Writer command surface.
    3. Add exhaustive unit/component/targeted Playwright coverage and Writer-parity documentation; run the fast validation suite plus the focused browser check, recording deferred aggregate checks as user-approved cadence.
  Verify Steps: |-
    1. npm run format:check, npm run lint, npm run typecheck, npm run check:docs, npm run check:file-size, and npm run test:coverage --workspace @vite-office/office. Expected: formatting, static analysis, JSDoc/file-size policy, and all fast tests including the new split branches pass.
    2. npm run test:e2e. Expected: production-browser coverage confirms Enter creates an adjacent editable Writer paragraph with inherited formatting and accessible page structure remains valid.
    3. git diff --check, ap doctor, and node .agentplane/policy/check-routing.mjs. Expected: no whitespace errors and repository/policy routing checks pass.
    4. Defer npm run test:static, inventory, and aggregate npm run verify to the established user-approved ten-task cadence. Expected: task findings state this residual aggregate-validation risk.
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: |-
    - Revert the task implementation commit to restore the current single-paragraph editing behavior.
    - Remove the Enter-specific tests and documentation together with the reverted behavior.
    - Re-run the task's fast suite and focused browser test to confirm the restored baseline.
  Findings: ""
id_source: "generated"
---
## Summary

Create Writer paragraphs through Enter

Implement browser-native Enter handling in the integrated Writer document canvas. Split the focused plain-text paragraph at its caret, preserve paragraph formatting on the new paragraph, maintain immutable history and storage behavior, and verify unit, component, and targeted browser coverage without adding an artificial toolbar or menu command.

## Scope

- In scope: Add the pure Writer-document split operation; intercept unmodified Enter in an integrated editable paragraph; calculate the collapsed caret offset; create and focus the following paragraph; inherit the source paragraph's alignment and paragraph style; retain immutable history, persistence, and download behavior.
- In scope: Extend domain, component, and focused browser tests; document the browser behavior, upstream parity evidence, and explicit limitations.
- Out of scope: Shift+Enter line breaks, selection-range replacement, lists, tables, rich text, keyboard menu navigation, or unrelated UI restructuring.
- UI placement: normal Enter remains direct document-canvas interaction, not a File/Edit/View menu item or a toolbar control, matching Writer's editing model.

## Plan

1. Inspect the current Writer document model and editable paragraph surface, then add a small immutable split primitive with stable identity and paragraph-property inheritance.
2. Wire unmodified Enter to the caret-based split, focus the new paragraph at offset zero, and preserve existing format, history, storage, and download flows without adding a non-Writer command surface.
3. Add exhaustive unit/component/targeted Playwright coverage and Writer-parity documentation; run the fast validation suite plus the focused browser check, recording deferred aggregate checks as user-approved cadence.

## Verify Steps

1. npm run format:check, npm run lint, npm run typecheck, npm run check:docs, npm run check:file-size, and npm run test:coverage --workspace @vite-office/office. Expected: formatting, static analysis, JSDoc/file-size policy, and all fast tests including the new split branches pass.
2. npm run test:e2e. Expected: production-browser coverage confirms Enter creates an adjacent editable Writer paragraph with inherited formatting and accessible page structure remains valid.
3. git diff --check, ap doctor, and node .agentplane/policy/check-routing.mjs. Expected: no whitespace errors and repository/policy routing checks pass.
4. Defer npm run test:static, inventory, and aggregate npm run verify to the established user-approved ten-task cadence. Expected: task findings state this residual aggregate-validation risk.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert the task implementation commit to restore the current single-paragraph editing behavior.
- Remove the Enter-specific tests and documentation together with the reverted behavior.
- Re-run the task's fast suite and focused browser test to confirm the restored baseline.

## Findings
