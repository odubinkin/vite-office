---
id: "202609141518-C5V3TD"
title: "Implement Workstream 5 browser editing isolation"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 10
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
  - "frontend"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-09-14T15:19:03.616Z"
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
    body: "Start: Implement Workstream 5 browser editing isolation, single logical editing host, explicit Writer edit intents, and acceptance coverage against the pinned upstream baseline."
events:
  -
    type: "status"
    at: "2026-09-14T15:19:09.021Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: Implement Workstream 5 browser editing isolation, single logical editing host, explicit Writer edit intents, and acceptance coverage against the pinned upstream baseline."
doc_version: 3
doc_updated_at: "2026-09-14T15:19:09.021Z"
doc_updated_by: "CODER"
description: "Implement P5.1-P5.3 from docs/program/vite-office-upstream-parity-plan.md using the pinned LibreOffice baseline: isolate browser editing adapters from React, establish one logical document editing host with canonical Writer selection, and make explicit Writer operations the normal input path with an observable guarded reconciliation fallback."
sections:
  Summary: "Implement Workstream 5 (P5.1-P5.3) from the upstream parity plan: isolate browser editing behavior from React, replace paragraph editing islands with one logical document host, and route normal browser input through explicit Writer operations."
  Scope: "In scope: apps/office/src/sw/browser/editor/**; Writer document-view projection under apps/office/src/sw/source/uibase/docvw/**; narrowly required Writer shell/command changes; focused unit, integration, and Playwright tests; provenance/runtime inventory updates required by created or moved modules. Preserve current formatting, list, clipboard, undo, and ODT behavior. Use vendor/libreoffice-reference at the pinned baseline for applicable edit-window, selection, extended-text-input, and Writer shell semantics. No backward compatibility layer is required if persisted document state changes. Out of scope: new Writer features, XML architecture, session lifecycle, and unrelated UI refactors."
  Plan: "1. Inspect pinned LibreOffice edit-window, shell, selection, and extended-text-input code and record the bounded browser-applicable invariants. 2. Extract model-neutral browser selection, edit-intent, composition, clipboard-event, and geometry adapters from React rendering. 3. Convert the document projection to one root editing host while retaining paragraph projection nodes and canonical SwPaM authority. 4. Normalize typing, deletion, paragraph breaks, paste, and composition into explicit Writer operations; retain a diagnostic guarded fallback for unknown browser mutations. 5. Add or update unit/integration/E2E tests for cross-paragraph selection/editing, IME boundaries, formatting preservation, fallback observability, and safe rejection. 6. Update provenance/inventory records where module ownership changes, then run the declared verification suite."
  Verify Steps: "1. Run targeted Vitest suites for apps/office/src/sw/browser/editor and apps/office/src/sw/source/uibase/docvw. 2. Run targeted Playwright Writer selection, clipboard, cut/paste, character-formatting, and paragraph-editing coverage. 3. Run npm run verify. 4. Run ap doctor. 5. Run node .agentplane/policy/check-routing.mjs. 6. Confirm git status --short --untracked-files=all contains only intentional task artifacts before completion. Acceptance: React projection contains no document mutation algorithms; browser globals are isolated or injected; normalized intents reach Writer operations; IME commits once; one logical host supports cross-paragraph selection, Select All, copy, deletion, split/merge; ordinary edits and paste do not replace whole paragraphs; direct hints survive; fallback is observable; unknown input fails safely."
  Verification: "Pending implementation and execution of Verify Steps."
  Rollback Plan: "Revert the task implementation commit and deterministic task-close commit. No storage compatibility migration will be added; if persisted schema changes, rollback restores the prior schema and behavior as a unit."
  Findings: "No findings yet."
id_source: "generated"
---
## Summary

Implement Workstream 5 (P5.1-P5.3) from the upstream parity plan: isolate browser editing behavior from React, replace paragraph editing islands with one logical document host, and route normal browser input through explicit Writer operations.

## Scope

In scope: apps/office/src/sw/browser/editor/**; Writer document-view projection under apps/office/src/sw/source/uibase/docvw/**; narrowly required Writer shell/command changes; focused unit, integration, and Playwright tests; provenance/runtime inventory updates required by created or moved modules. Preserve current formatting, list, clipboard, undo, and ODT behavior. Use vendor/libreoffice-reference at the pinned baseline for applicable edit-window, selection, extended-text-input, and Writer shell semantics. No backward compatibility layer is required if persisted document state changes. Out of scope: new Writer features, XML architecture, session lifecycle, and unrelated UI refactors.

## Plan

1. Inspect pinned LibreOffice edit-window, shell, selection, and extended-text-input code and record the bounded browser-applicable invariants. 2. Extract model-neutral browser selection, edit-intent, composition, clipboard-event, and geometry adapters from React rendering. 3. Convert the document projection to one root editing host while retaining paragraph projection nodes and canonical SwPaM authority. 4. Normalize typing, deletion, paragraph breaks, paste, and composition into explicit Writer operations; retain a diagnostic guarded fallback for unknown browser mutations. 5. Add or update unit/integration/E2E tests for cross-paragraph selection/editing, IME boundaries, formatting preservation, fallback observability, and safe rejection. 6. Update provenance/inventory records where module ownership changes, then run the declared verification suite.

## Verify Steps

1. Run targeted Vitest suites for apps/office/src/sw/browser/editor and apps/office/src/sw/source/uibase/docvw. 2. Run targeted Playwright Writer selection, clipboard, cut/paste, character-formatting, and paragraph-editing coverage. 3. Run npm run verify. 4. Run ap doctor. 5. Run node .agentplane/policy/check-routing.mjs. 6. Confirm git status --short --untracked-files=all contains only intentional task artifacts before completion. Acceptance: React projection contains no document mutation algorithms; browser globals are isolated or injected; normalized intents reach Writer operations; IME commits once; one logical host supports cross-paragraph selection, Select All, copy, deletion, split/merge; ordinary edits and paste do not replace whole paragraphs; direct hints survive; fallback is observable; unknown input fails safely.

## Verification

Pending implementation and execution of Verify Steps.

## Rollback Plan

Revert the task implementation commit and deterministic task-close commit. No storage compatibility migration will be added; if persisted schema changes, rollback restores the prior schema and behavior as a unit.

## Findings

No findings yet.
