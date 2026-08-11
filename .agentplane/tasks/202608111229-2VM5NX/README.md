---
id: "202608111229-2VM5NX"
title: "Render Writer paragraphs as an integrated document canvas"
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
  updated_at: "2026-08-11T12:30:03.568Z"
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
    body: "Start: render bounded Writer paragraphs as accessible editable content integrated into the existing document canvas."
events:
  -
    type: "status"
    at: "2026-08-11T12:30:04.228Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: render bounded Writer paragraphs as accessible editable content integrated into the existing document canvas."
doc_version: 3
doc_updated_at: "2026-08-11T12:30:04.228Z"
doc_updated_by: "CODER"
description: "Replace card-like paragraph textareas and persistent paragraph action buttons with document-integrated editable paragraph blocks placed inside the existing Writer page canvas. Preserve the bounded Writer model, formatting, undo/redo, save/load, accessibility, and tests; use LibreOffice Writer placement conventions without pixel-perfect visual copying."
sections:
  Summary: |-
    Render Writer paragraphs as an integrated document canvas

    Replace card-like paragraph textareas and persistent paragraph action buttons with document-integrated editable paragraph blocks placed inside the existing Writer page canvas. Preserve the bounded Writer model, formatting, undo/redo, save/load, accessibility, and tests; use LibreOffice Writer placement conventions without pixel-perfect visual copying.
  Scope: |-
    - In scope: Replace card-like paragraph textareas and persistent paragraph action buttons with document-integrated editable paragraph blocks placed inside the existing Writer page canvas. Preserve the bounded Writer model, formatting, undo/redo, save/load, accessibility, and tests; use LibreOffice Writer placement conventions without pixel-perfect visual copying.
    - Out of scope: unrelated refactors not required for "Render Writer paragraphs as an integrated document canvas".
  Plan: "1. Replace WriterPlainTextEditor card-like textarea presentation with document-integrated editable paragraph blocks: no per-paragraph label/card chrome and no persistent Move/Remove controls; retain a stable focus target and native editable-text semantics. 2. Keep existing immutable body transitions, formatting toolbar/sidebar placement, history, browser storage, and command toolbar unchanged; adapt callback boundaries only as needed for browser editable elements. 3. Update focused unit/component and production-browser tests to assert document-page integration, editable paragraphs, active formatting, history, and accessibility; keep paragraph reordering as a tested domain capability rather than a persistent canvas control. 4. Add a focused program document and revise Writer UI/reordering/editor docs and index to distinguish LibreOffice-inspired placement from pixel-perfect/native-editor parity. 5. Run format, lint, type, JSDoc, size, focused coverage, target Playwright, diff, doctor, and routing checks; defer static/inventory/full aggregation under the approved every-ten-task cadence."
  Verify Steps: |-
    1. Run npm run format:check, npm run lint, npm run typecheck, npm run check:docs, npm run check:file-size, and git diff --check. Expected: all pass and no authored file crosses the mandatory 1,000-line limit.
    2. Run npm run test:coverage --workspace @vite-office/office. Expected: integrated editable paragraph presentation, focus-driven formatting, immutable body/history behavior, and existing workbench behavior pass with 100% coverage.
    3. Run npm run test:e2e. Expected: the production Writer page contains integrated editable document paragraphs, exposes the existing Writer landmarks/formatting toolbar, and has no axe violations.
    4. Run ap doctor and node .agentplane/policy/check-routing.mjs. Expected: required policy gates pass.
    5. Do not run npm run test:static, inventory checks, or npm run verify. Reason: user-approved every-ten-closed-tasks cadence; targeted Playwright performs the production build. Record this residual risk in Verification.
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

Render Writer paragraphs as an integrated document canvas

Replace card-like paragraph textareas and persistent paragraph action buttons with document-integrated editable paragraph blocks placed inside the existing Writer page canvas. Preserve the bounded Writer model, formatting, undo/redo, save/load, accessibility, and tests; use LibreOffice Writer placement conventions without pixel-perfect visual copying.

## Scope

- In scope: Replace card-like paragraph textareas and persistent paragraph action buttons with document-integrated editable paragraph blocks placed inside the existing Writer page canvas. Preserve the bounded Writer model, formatting, undo/redo, save/load, accessibility, and tests; use LibreOffice Writer placement conventions without pixel-perfect visual copying.
- Out of scope: unrelated refactors not required for "Render Writer paragraphs as an integrated document canvas".

## Plan

1. Replace WriterPlainTextEditor card-like textarea presentation with document-integrated editable paragraph blocks: no per-paragraph label/card chrome and no persistent Move/Remove controls; retain a stable focus target and native editable-text semantics. 2. Keep existing immutable body transitions, formatting toolbar/sidebar placement, history, browser storage, and command toolbar unchanged; adapt callback boundaries only as needed for browser editable elements. 3. Update focused unit/component and production-browser tests to assert document-page integration, editable paragraphs, active formatting, history, and accessibility; keep paragraph reordering as a tested domain capability rather than a persistent canvas control. 4. Add a focused program document and revise Writer UI/reordering/editor docs and index to distinguish LibreOffice-inspired placement from pixel-perfect/native-editor parity. 5. Run format, lint, type, JSDoc, size, focused coverage, target Playwright, diff, doctor, and routing checks; defer static/inventory/full aggregation under the approved every-ten-task cadence.

## Verify Steps

1. Run npm run format:check, npm run lint, npm run typecheck, npm run check:docs, npm run check:file-size, and git diff --check. Expected: all pass and no authored file crosses the mandatory 1,000-line limit.
2. Run npm run test:coverage --workspace @vite-office/office. Expected: integrated editable paragraph presentation, focus-driven formatting, immutable body/history behavior, and existing workbench behavior pass with 100% coverage.
3. Run npm run test:e2e. Expected: the production Writer page contains integrated editable document paragraphs, exposes the existing Writer landmarks/formatting toolbar, and has no axe violations.
4. Run ap doctor and node .agentplane/policy/check-routing.mjs. Expected: required policy gates pass.
5. Do not run npm run test:static, inventory checks, or npm run verify. Reason: user-approved every-ten-closed-tasks cadence; targeted Playwright performs the production build. Record this residual risk in Verification.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert task-related commit(s).
- Re-run required checks to confirm rollback safety.

## Findings
