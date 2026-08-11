---
id: "202608111244-CYTQEK"
title: "Place implemented Writer commands in native-style menus"
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
  updated_at: "2026-08-11T12:44:38.008Z"
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
    body: "Start: map existing browser Writer commands to pinned menu locations and remove non-native toolbar placement."
events:
  -
    type: "status"
    at: "2026-08-11T12:44:39.179Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: map existing browser Writer commands to pinned menu locations and remove non-native toolbar placement."
doc_version: 3
doc_updated_at: "2026-08-11T12:45:07.846Z"
doc_updated_by: "CODER"
description: "Make the Writer menu bar expose every currently implemented command in its matching LibreOffice Writer menu location: browser-local open/save/plain-text export in File, undo/redo in Edit, alignment and bounded paragraph movement in Format, and bounded paragraph styles in Styles. Remove the non-Writer Add paragraph toolbar button while retaining only toolbar placement that has upstream precedent. Preserve browser-only behavior, accessibility, history, and existing visual language."
sections:
  Summary: |-
    Place implemented Writer commands in native-style menus

    Make the Writer menu bar expose every currently implemented command in its matching LibreOffice Writer menu location: browser-local open/save/plain-text export in File, undo/redo in Edit, alignment and bounded paragraph movement in Format, and bounded paragraph styles in Styles. Remove the non-Writer Add paragraph toolbar button while retaining only toolbar placement that has upstream precedent. Preserve browser-only behavior, accessibility, history, and existing visual language.
  Scope: |-
    - In scope: Add functional accessible File, Edit, Format, and Styles menu entries only for implemented browser Writer commands, located according to pinned LibreOffice Writer menu configuration; keep matching toolbar controls where Writer has toolbar precedent.
    - In scope: Remove the non-Writer Add paragraph toolbar control; retain the immutable append domain transition without a replacement UI.
    - In scope: Update focused unit/component and targeted production-browser coverage plus Writer UI and command-placement documentation.
    - Out of scope: Unimplemented menu commands; custom menus for File/View/Insert/Table/Tools/Window/Help; native menu pixel copying; keyboard menus; paragraph break/caret behavior; lists; and any new Writer capability.
    - Design constraint: Each implemented future command must be placed in its relevant Writer menu and applicable upstream Writer toolbar, or a task must document why one surface has no upstream precedent.
  Plan: "1. Add a small accessible Writer menu-bar component rather than growing workspace chrome: menus open and close predictably, expose only implemented entries, respect disabled history/boundary state, and retain the current visual language. 2. Map browser-local load/save/download to File (Open, Save, Save As text), undo/redo to Edit, style selection to Styles, and alignment plus bounded movement to Format using the pinned Writer menubar locations; wire each menu entry to the existing immutable workbench transitions. 3. Remove the Add paragraph toolbar control because Writer does not expose a standalone equivalent there; retain the pure append capability for a later native-style Enter/paragraph-break task rather than inventing a replacement UI. 4. Update component/unit and production-browser accessibility tests plus Writer UI documentation with exact pinned menu provenance and the ongoing placement rule. 5. Run format, lint, type, JSDoc, size, strict coverage, targeted Playwright, diff, doctor, and routing checks; defer static/inventory/full aggregation under the approved every-ten-task cadence."
  Verify Steps: |-
    1. Run npm run format:check, npm run lint, npm run typecheck, npm run check:docs, npm run check:file-size, and git diff --check. Expected: all pass and no authored file reaches the mandatory 1,000-line limit.
    2. Run npm run test:coverage --workspace @vite-office/office. Expected: menu opening, command dispatch, disabled states, existing history, paragraph formatting, and browser-local behaviors pass at 100% coverage.
    3. Run npm run test:e2e. Expected: production Writer exposes accessible functional File/Edit/Format/Styles menus; menu commands update the document without axe violations.
    4. Run ap doctor and node .agentplane/policy/check-routing.mjs. Expected: required policy gates pass.
    5. Do not run npm run test:static, inventory checks, or npm run verify. Reason: user-approved every-ten-closed-tasks cadence; targeted Playwright performs the production build. Record residual risk in Verification.
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: |-
    - Revert only the implementation and task-evidence commits for 202608111244-CYTQEK.
    - Restore the previous static menu bar and Add paragraph toolbar button only if accessible menu dispatch regresses existing Writer command behavior.
    - Re-run the declared task checks after the revert.
  Findings: ""
id_source: "generated"
---
## Summary

Place implemented Writer commands in native-style menus

Make the Writer menu bar expose every currently implemented command in its matching LibreOffice Writer menu location: browser-local open/save/plain-text export in File, undo/redo in Edit, alignment and bounded paragraph movement in Format, and bounded paragraph styles in Styles. Remove the non-Writer Add paragraph toolbar button while retaining only toolbar placement that has upstream precedent. Preserve browser-only behavior, accessibility, history, and existing visual language.

## Scope

- In scope: Add functional accessible File, Edit, Format, and Styles menu entries only for implemented browser Writer commands, located according to pinned LibreOffice Writer menu configuration; keep matching toolbar controls where Writer has toolbar precedent.
- In scope: Remove the non-Writer Add paragraph toolbar control; retain the immutable append domain transition without a replacement UI.
- In scope: Update focused unit/component and targeted production-browser coverage plus Writer UI and command-placement documentation.
- Out of scope: Unimplemented menu commands; custom menus for File/View/Insert/Table/Tools/Window/Help; native menu pixel copying; keyboard menus; paragraph break/caret behavior; lists; and any new Writer capability.
- Design constraint: Each implemented future command must be placed in its relevant Writer menu and applicable upstream Writer toolbar, or a task must document why one surface has no upstream precedent.

## Plan

1. Add a small accessible Writer menu-bar component rather than growing workspace chrome: menus open and close predictably, expose only implemented entries, respect disabled history/boundary state, and retain the current visual language. 2. Map browser-local load/save/download to File (Open, Save, Save As text), undo/redo to Edit, style selection to Styles, and alignment plus bounded movement to Format using the pinned Writer menubar locations; wire each menu entry to the existing immutable workbench transitions. 3. Remove the Add paragraph toolbar control because Writer does not expose a standalone equivalent there; retain the pure append capability for a later native-style Enter/paragraph-break task rather than inventing a replacement UI. 4. Update component/unit and production-browser accessibility tests plus Writer UI documentation with exact pinned menu provenance and the ongoing placement rule. 5. Run format, lint, type, JSDoc, size, strict coverage, targeted Playwright, diff, doctor, and routing checks; defer static/inventory/full aggregation under the approved every-ten-task cadence.

## Verify Steps

1. Run npm run format:check, npm run lint, npm run typecheck, npm run check:docs, npm run check:file-size, and git diff --check. Expected: all pass and no authored file reaches the mandatory 1,000-line limit.
2. Run npm run test:coverage --workspace @vite-office/office. Expected: menu opening, command dispatch, disabled states, existing history, paragraph formatting, and browser-local behaviors pass at 100% coverage.
3. Run npm run test:e2e. Expected: production Writer exposes accessible functional File/Edit/Format/Styles menus; menu commands update the document without axe violations.
4. Run ap doctor and node .agentplane/policy/check-routing.mjs. Expected: required policy gates pass.
5. Do not run npm run test:static, inventory checks, or npm run verify. Reason: user-approved every-ten-closed-tasks cadence; targeted Playwright performs the production build. Record residual risk in Verification.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert only the implementation and task-evidence commits for 202608111244-CYTQEK.
- Restore the previous static menu bar and Add paragraph toolbar button only if accessible menu dispatch regresses existing Writer command behavior.
- Re-run the declared task checks after the revert.

## Findings
