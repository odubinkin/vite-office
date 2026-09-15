---
id: "202609151533-247WK4"
title: "Implement Writer upstream parity Phase 5"
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
  updated_at: "2026-09-15T15:33:51.115Z"
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
    body: "Start: implement Phase 5 browser projection, canonical SwPaM selection, explicit input intents, and model-owned transfer against pinned LibreOffice."
events:
  -
    type: "status"
    at: "2026-09-15T15:33:58.670Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implement Phase 5 browser projection, canonical SwPaM selection, explicit input intents, and model-owned transfer against pinned LibreOffice."
doc_version: 3
doc_updated_at: "2026-09-15T15:33:58.670Z"
doc_updated_by: "CODER"
description: "Make the browser editor a projection: central DOM-to-SwPaM mapping, complete supported input-intent routing, single rendering owner, and model-based transfer, following pinned LibreOffice 26.8.0.2. No compatibility layer for prior stored model versions."
sections:
  Summary: |-
    Implement Writer upstream parity Phase 5

    Make the browser editor a projection: central DOM-to-SwPaM mapping, complete supported input-intent routing, single rendering owner, and model-based transfer, following pinned LibreOffice 26.8.0.2. No compatibility layer for prior stored model versions.
  Scope: |-
    - In scope: `apps/office/src/sw/browser/editor/**`, Writer editing-host projection code, `SwWrtShell` input/selection operations, `SwTransferable`, bounded HTML/plain-text transfer filters, and directly related unit/integration/E2E tests.
    - Required behavior: the DOM is a projection only; every supported mutation travels through the shell-owned `SwPaM`; copy/cut serialize model data; paste/drop import through Writer operations.
    - Authority: pinned LibreOffice tag `libreoffice-26.8.0.2`, especially `edtwin*.cxx`, `select.cxx`, `wrtsh*.cxx`, and `swdtflvr.cxx`.
    - Browser-only selection, Input Events, IME, pointer geometry, and DataTransfer mechanics remain narrow class-B adapters.
    - Out of scope: unrelated Phase 6 presentation relocation, unsupported desktop transfer formats, and backward compatibility for any superseded stored model schema.
  Plan: |-
    1. Audit the current browser editor, shell, transfer, and tests against Phase 5 and the pinned LibreOffice ownership/behavior boundaries.
    2. Consolidate native selection reads/restoration in one adapter and make shell-owned `SwPaM` authoritative for commands and transfer.
    3. Route supported beforeinput, keyboard, composition, pointer, paste, and drag/drop intents through shell operations; prevent unsupported DOM mutation and remove fallback reconciliation.
    4. Render model runs deterministically with stable projection keys and restore selection without innerHTML comparison or replaceChildren reconciliation.
    5. Make copy/cut/paste/drop model-based through `SwTransferable` and bounded filters, keeping DataTransfer translation at the browser boundary.
    6. Add focused regression/stress coverage, run the declared checks, record verification, commit, finish the task, and push `main`.
  Verify Steps: |-
    1. `npx vitest run apps/office/src/sw/browser/editor apps/office/src/sw/source/uibase/docvw/edtwin.test.tsx apps/office/src/sw/source/uibase/wrtsh/wrtsh.test.ts apps/office/src/sw/source/uibase/dochdl/swdtflvr.test.ts` — all selection, intent, IME, projection, clipboard, paste, drop, and undo-focused tests pass.
    2. `npm run typecheck` — application and tool TypeScript contracts pass.
    3. `npm run lint` — no lint warnings or errors.
    4. `npm test` — the complete unit and inventory coverage suites pass at enforced thresholds.
    5. `npm run test:e2e` — built Writer browser flows pass in Chromium.
    6. `npm run build` — production build succeeds.
    7. `ap doctor` and `node .agentplane/policy/check-routing.mjs` — AgentPlane health and policy routing pass.
    8. Source inspection: production Writer editor code has no full-text DOM reconciliation/fallback counters, no model-facing command or clipboard path independently calls `getSelection()`, unsupported `beforeinput` is prevented and canonical state is reprojected, and copy output is independent of rendered DOM shape.
    9. `git status --short --untracked-files=all` — only intentional task artifacts remain before commit and the tracked tree is clean after finish.
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: |-
    - Revert the Phase 5 implementation commit and the deterministic AgentPlane close commit.
    - Re-run the focused editor/transfer tests and typecheck to confirm the previous projection behavior is restored.
    - No persistence compatibility migration is retained or introduced.
  Findings: ""
id_source: "generated"
---
## Summary

Implement Writer upstream parity Phase 5

Make the browser editor a projection: central DOM-to-SwPaM mapping, complete supported input-intent routing, single rendering owner, and model-based transfer, following pinned LibreOffice 26.8.0.2. No compatibility layer for prior stored model versions.

## Scope

- In scope: `apps/office/src/sw/browser/editor/**`, Writer editing-host projection code, `SwWrtShell` input/selection operations, `SwTransferable`, bounded HTML/plain-text transfer filters, and directly related unit/integration/E2E tests.
- Required behavior: the DOM is a projection only; every supported mutation travels through the shell-owned `SwPaM`; copy/cut serialize model data; paste/drop import through Writer operations.
- Authority: pinned LibreOffice tag `libreoffice-26.8.0.2`, especially `edtwin*.cxx`, `select.cxx`, `wrtsh*.cxx`, and `swdtflvr.cxx`.
- Browser-only selection, Input Events, IME, pointer geometry, and DataTransfer mechanics remain narrow class-B adapters.
- Out of scope: unrelated Phase 6 presentation relocation, unsupported desktop transfer formats, and backward compatibility for any superseded stored model schema.

## Plan

1. Audit the current browser editor, shell, transfer, and tests against Phase 5 and the pinned LibreOffice ownership/behavior boundaries.
2. Consolidate native selection reads/restoration in one adapter and make shell-owned `SwPaM` authoritative for commands and transfer.
3. Route supported beforeinput, keyboard, composition, pointer, paste, and drag/drop intents through shell operations; prevent unsupported DOM mutation and remove fallback reconciliation.
4. Render model runs deterministically with stable projection keys and restore selection without innerHTML comparison or replaceChildren reconciliation.
5. Make copy/cut/paste/drop model-based through `SwTransferable` and bounded filters, keeping DataTransfer translation at the browser boundary.
6. Add focused regression/stress coverage, run the declared checks, record verification, commit, finish the task, and push `main`.

## Verify Steps

1. `npx vitest run apps/office/src/sw/browser/editor apps/office/src/sw/source/uibase/docvw/edtwin.test.tsx apps/office/src/sw/source/uibase/wrtsh/wrtsh.test.ts apps/office/src/sw/source/uibase/dochdl/swdtflvr.test.ts` — all selection, intent, IME, projection, clipboard, paste, drop, and undo-focused tests pass.
2. `npm run typecheck` — application and tool TypeScript contracts pass.
3. `npm run lint` — no lint warnings or errors.
4. `npm test` — the complete unit and inventory coverage suites pass at enforced thresholds.
5. `npm run test:e2e` — built Writer browser flows pass in Chromium.
6. `npm run build` — production build succeeds.
7. `ap doctor` and `node .agentplane/policy/check-routing.mjs` — AgentPlane health and policy routing pass.
8. Source inspection: production Writer editor code has no full-text DOM reconciliation/fallback counters, no model-facing command or clipboard path independently calls `getSelection()`, unsupported `beforeinput` is prevented and canonical state is reprojected, and copy output is independent of rendered DOM shape.
9. `git status --short --untracked-files=all` — only intentional task artifacts remain before commit and the tracked tree is clean after finish.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert the Phase 5 implementation commit and the deterministic AgentPlane close commit.
- Re-run the focused editor/transfer tests and typecheck to confirm the previous projection behavior is restored.
- No persistence compatibility migration is retained or introduced.

## Findings
