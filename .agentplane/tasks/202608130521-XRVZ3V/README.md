---
id: "202608130521-XRVZ3V"
title: "Add bounded Writer bullets and numbering"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 15
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-08-13T05:47:29.504Z"
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
    body: "Start: implement bounded Writer bullets and numbering with pinned upstream placement and parity evidence."
  -
    author: "CODER"
    body: "Blocked: The user reprioritized a LibreOffice-aligned project-structure migration before further Writer feature additions. No implementation code was started; this task remains the follow-up list capability after the structural prerequisite is complete."
  -
    author: "CODER"
    body: "Start: resume the first interoperable Writer list layer inside the LibreOffice-derived source tree."
events:
  -
    type: "status"
    at: "2026-08-13T05:21:50.811Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implement bounded Writer bullets and numbering with pinned upstream placement and parity evidence."
  -
    type: "status"
    at: "2026-08-13T05:25:56.820Z"
    author: "CODER"
    from: "DOING"
    to: "BLOCKED"
    note: "Blocked: The user reprioritized a LibreOffice-aligned project-structure migration before further Writer feature additions. No implementation code was started; this task remains the follow-up list capability after the structural prerequisite is complete."
  -
    type: "status"
    at: "2026-08-13T05:47:30.098Z"
    author: "CODER"
    from: "BLOCKED"
    to: "DOING"
    note: "Start: resume the first interoperable Writer list layer inside the LibreOffice-derived source tree."
doc_version: 3
doc_updated_at: "2026-08-13T05:47:30.098Z"
doc_updated_by: "CODER"
description: "Implement Default Bullet, Default Numbering, and Remove Bullets for the active Writer paragraph with pinned LibreOffice menu and formatting-toolbar placement, history, tests, documentation, and parity evidence."
sections:
  Summary: |-
    Implement the first interoperable Writer list layer on the path to LibreOffice list parity.

    This task maps pinned LibreOffice commands, source, tests, and Help evidence for ordinary bullets and numbering. Its output is intentionally a foundation for subsequent list-level, range-selection, style, restart/continue, import/export, and compatibility tasks; it does not declare those capabilities unnecessary or permanently unsupported.
  Scope: |-
    - In scope: a serializable Writer list model in `apps/office/src/sw/source/core/doc` that can evolve toward LibreOffice list semantics; current active-paragraph none/bullet/numbered operations; document rendering; undo/redo; menu and toolbar UI at pinned Writer locations; and upstream/local evidence mapping.
    - In scope: `.uno:DefaultBullet`, `.uno:DefaultNumbering`, and `.uno:RemoveBullets` from the pinned LibreOffice baseline, retaining source-level provenance for later command expansion. Browser placement declarations belong in `apps/office/src/sw/uiconfig/swriter`; rendering belongs below matching `sw/source/uibase` areas.
    - Deferred to separately mapped follow-up tasks, not exceptions: multi-paragraph/range list application, nesting/levels, custom list styles, restart/continue, outline numbering, automatic lists, ODT/DOCX list import/export, and complex numbering compatibility.
    - Out of scope only for this task: unrelated suites and changes not needed to establish the initial Writer list architecture.
  Plan: |-
    1. Map ordinary Writer bullets and numbering to the pinned `sw` command implementation, `sw/uiconfig/swriter` menu/toolbar placement, UI tests, and Help topics; record follow-up capability boundaries as deferred parity work rather than permanent gaps.
    2. Extend the serializable Writer paragraph model in `sw/source/core/doc` with a list abstraction designed for future levels/styles, and pure transitions for the first mapped list commands.
    3. Wire commands through Writer history/application orchestration, Format → Bullets and Numbering declarations in `sw/uiconfig/swriter`, and Writer-equivalent `sw/source/uibase/ribbar` formatting-toolbar placement.
    4. Render list presentation and accessible semantics through `sw/source/uibase/docvw` without contaminating editable paragraph text or browser clipboard representations.
    5. Add unit/component/production-browser tests and parity documentation; record exact remaining list capabilities as planned successors.
    6. Run targeted verification now and the full aggregate suite according to the approved ten-task cadence.
  Verify Steps: |-
    1. Run `npm run test:coverage`. Expected: all office tests pass at 100 percent coverage, including list state transitions, history, visible markers, and command placement.
    2. Run `npm run test:e2e -- --grep "Writer bullets and numbering"`. Expected: production Chromium applies bullet and numbering commands at their Writer locations, renders markers, and removes them without editing paragraph text.
    3. Run `npm run inventory:parity -- --baseline docs/program/libreoffice-baseline.json --mappings docs/program/parity/writer-command-slice.json --local-root . --upstream-root vendor/libreoffice-reference`. Expected: the new Writer list record resolves all source, test, and documentation markers at the pinned baseline.
    4. Run `npm run format:check && npm run lint && npm run typecheck && npm run check:docs && npm run check:file-size && git diff --check && ap doctor && node .agentplane/policy/check-routing.mjs`. Expected: all pass.
    5. Defer aggregate `npm run verify`, static smoke, inventory coverage, and full browser matrix under the user-approved ten-task cadence; record residual risk.
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: |-
    - Revert task-scoped implementation and task-artifact commits.
    - Re-run coverage and the focused Writer bullets and numbering E2E scenario to confirm existing paragraph editing and history behavior.
  Findings: ""
id_source: "generated"
---
## Summary

Implement the first interoperable Writer list layer on the path to LibreOffice list parity.

This task maps pinned LibreOffice commands, source, tests, and Help evidence for ordinary bullets and numbering. Its output is intentionally a foundation for subsequent list-level, range-selection, style, restart/continue, import/export, and compatibility tasks; it does not declare those capabilities unnecessary or permanently unsupported.

## Scope

- In scope: a serializable Writer list model in `apps/office/src/sw/source/core/doc` that can evolve toward LibreOffice list semantics; current active-paragraph none/bullet/numbered operations; document rendering; undo/redo; menu and toolbar UI at pinned Writer locations; and upstream/local evidence mapping.
- In scope: `.uno:DefaultBullet`, `.uno:DefaultNumbering`, and `.uno:RemoveBullets` from the pinned LibreOffice baseline, retaining source-level provenance for later command expansion. Browser placement declarations belong in `apps/office/src/sw/uiconfig/swriter`; rendering belongs below matching `sw/source/uibase` areas.
- Deferred to separately mapped follow-up tasks, not exceptions: multi-paragraph/range list application, nesting/levels, custom list styles, restart/continue, outline numbering, automatic lists, ODT/DOCX list import/export, and complex numbering compatibility.
- Out of scope only for this task: unrelated suites and changes not needed to establish the initial Writer list architecture.

## Plan

1. Map ordinary Writer bullets and numbering to the pinned `sw` command implementation, `sw/uiconfig/swriter` menu/toolbar placement, UI tests, and Help topics; record follow-up capability boundaries as deferred parity work rather than permanent gaps.
2. Extend the serializable Writer paragraph model in `sw/source/core/doc` with a list abstraction designed for future levels/styles, and pure transitions for the first mapped list commands.
3. Wire commands through Writer history/application orchestration, Format → Bullets and Numbering declarations in `sw/uiconfig/swriter`, and Writer-equivalent `sw/source/uibase/ribbar` formatting-toolbar placement.
4. Render list presentation and accessible semantics through `sw/source/uibase/docvw` without contaminating editable paragraph text or browser clipboard representations.
5. Add unit/component/production-browser tests and parity documentation; record exact remaining list capabilities as planned successors.
6. Run targeted verification now and the full aggregate suite according to the approved ten-task cadence.

## Verify Steps

1. Run `npm run test:coverage`. Expected: all office tests pass at 100 percent coverage, including list state transitions, history, visible markers, and command placement.
2. Run `npm run test:e2e -- --grep "Writer bullets and numbering"`. Expected: production Chromium applies bullet and numbering commands at their Writer locations, renders markers, and removes them without editing paragraph text.
3. Run `npm run inventory:parity -- --baseline docs/program/libreoffice-baseline.json --mappings docs/program/parity/writer-command-slice.json --local-root . --upstream-root vendor/libreoffice-reference`. Expected: the new Writer list record resolves all source, test, and documentation markers at the pinned baseline.
4. Run `npm run format:check && npm run lint && npm run typecheck && npm run check:docs && npm run check:file-size && git diff --check && ap doctor && node .agentplane/policy/check-routing.mjs`. Expected: all pass.
5. Defer aggregate `npm run verify`, static smoke, inventory coverage, and full browser matrix under the user-approved ten-task cadence; record residual risk.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert task-scoped implementation and task-artifact commits.
- Re-run coverage and the focused Writer bullets and numbering E2E scenario to confirm existing paragraph editing and history behavior.

## Findings
