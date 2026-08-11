---
id: "202608111244-CYTQEK"
title: "Place implemented Writer commands in native-style menus"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 5
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
doc_updated_at: "2026-08-11T12:44:39.179Z"
doc_updated_by: "CODER"
description: "Make the Writer menu bar expose every currently implemented command in its matching LibreOffice Writer menu location: browser-local open/save/plain-text export in File, undo/redo in Edit, alignment and bounded paragraph movement in Format, and bounded paragraph styles in Styles. Remove the non-Writer Add paragraph toolbar button while retaining only toolbar placement that has upstream precedent. Preserve browser-only behavior, accessibility, history, and existing visual language."
sections:
  Summary: |-
    Place implemented Writer commands in native-style menus

    Make the Writer menu bar expose every currently implemented command in its matching LibreOffice Writer menu location: browser-local open/save/plain-text export in File, undo/redo in Edit, alignment and bounded paragraph movement in Format, and bounded paragraph styles in Styles. Remove the non-Writer Add paragraph toolbar button while retaining only toolbar placement that has upstream precedent. Preserve browser-only behavior, accessibility, history, and existing visual language.
  Scope: |-
    - In scope: Make the Writer menu bar expose every currently implemented command in its matching LibreOffice Writer menu location: browser-local open/save/plain-text export in File, undo/redo in Edit, alignment and bounded paragraph movement in Format, and bounded paragraph styles in Styles. Remove the non-Writer Add paragraph toolbar button while retaining only toolbar placement that has upstream precedent. Preserve browser-only behavior, accessibility, history, and existing visual language.
    - Out of scope: unrelated refactors not required for "Place implemented Writer commands in native-style menus".
  Plan: "1. Add a small accessible Writer menu-bar component rather than growing workspace chrome: menus open and close predictably, expose only implemented entries, respect disabled history/boundary state, and retain the current visual language. 2. Map browser-local load/save/download to File (Open, Save, Save As text), undo/redo to Edit, style selection to Styles, and alignment plus bounded movement to Format using the pinned Writer menubar locations; wire each menu entry to the existing immutable workbench transitions. 3. Remove the Add paragraph toolbar control because Writer does not expose a standalone equivalent there; retain the pure append capability for a later native-style Enter/paragraph-break task rather than inventing a replacement UI. 4. Update component/unit and production-browser accessibility tests plus Writer UI documentation with exact pinned menu provenance and the ongoing placement rule. 5. Run format, lint, type, JSDoc, size, strict coverage, targeted Playwright, diff, doctor, and routing checks; defer static/inventory/full aggregation under the approved every-ten-task cadence."
  Verify Steps: |-
    PLANNER fallback scaffold. Replace with task-specific acceptance checks when PLANNER context is available.

    1. Review the changed artifact or behavior for the `code` task. Expected: the requested outcome is visible and matches the approved scope.
    2. Run the most relevant validation step for the `code` task. Expected: it succeeds without unexpected regressions in touched scope.
    3. Compare the final result against the task summary and scope. Expected: any remaining follow-up is explicit in ## Findings.
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

- In scope: Make the Writer menu bar expose every currently implemented command in its matching LibreOffice Writer menu location: browser-local open/save/plain-text export in File, undo/redo in Edit, alignment and bounded paragraph movement in Format, and bounded paragraph styles in Styles. Remove the non-Writer Add paragraph toolbar button while retaining only toolbar placement that has upstream precedent. Preserve browser-only behavior, accessibility, history, and existing visual language.
- Out of scope: unrelated refactors not required for "Place implemented Writer commands in native-style menus".

## Plan

1. Add a small accessible Writer menu-bar component rather than growing workspace chrome: menus open and close predictably, expose only implemented entries, respect disabled history/boundary state, and retain the current visual language. 2. Map browser-local load/save/download to File (Open, Save, Save As text), undo/redo to Edit, style selection to Styles, and alignment plus bounded movement to Format using the pinned Writer menubar locations; wire each menu entry to the existing immutable workbench transitions. 3. Remove the Add paragraph toolbar control because Writer does not expose a standalone equivalent there; retain the pure append capability for a later native-style Enter/paragraph-break task rather than inventing a replacement UI. 4. Update component/unit and production-browser accessibility tests plus Writer UI documentation with exact pinned menu provenance and the ongoing placement rule. 5. Run format, lint, type, JSDoc, size, strict coverage, targeted Playwright, diff, doctor, and routing checks; defer static/inventory/full aggregation under the approved every-ten-task cadence.

## Verify Steps

PLANNER fallback scaffold. Replace with task-specific acceptance checks when PLANNER context is available.

1. Review the changed artifact or behavior for the `code` task. Expected: the requested outcome is visible and matches the approved scope.
2. Run the most relevant validation step for the `code` task. Expected: it succeeds without unexpected regressions in touched scope.
3. Compare the final result against the task summary and scope. Expected: any remaining follow-up is explicit in ## Findings.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert only the implementation and task-evidence commits for 202608111244-CYTQEK.
- Restore the previous static menu bar and Add paragraph toolbar button only if accessible menu dispatch regresses existing Writer command behavior.
- Re-run the declared task checks after the revert.

## Findings
