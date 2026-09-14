---
id: "202609140558-BBEAFA"
title: "Implement stage 4 canonical cursor and input pipeline"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 9
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-09-14T06:00:08.159Z"
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
    body: "Start: implement approved Stage 4 canonical cursor, beforeinput, IME composition, DOM selection adapter, and parity verification scope."
events:
  -
    type: "status"
    at: "2026-09-14T06:00:16.426Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implement approved Stage 4 canonical cursor, beforeinput, IME composition, DOM selection adapter, and parity verification scope."
doc_version: 3
doc_updated_at: "2026-09-14T06:34:32.723Z"
doc_updated_by: "CODER"
description: "Implement section 8 (Stage 4) of docs/program/vite-office-upstream-parity-plan.md, preserving upstream LibreOffice semantics and avoiding invented domain behavior."
sections:
  Summary: |-
    Implement stage 4 canonical cursor and input pipeline

    Implement section 8 (Stage 4) of docs/program/vite-office-upstream-parity-plan.md, preserving upstream LibreOffice semantics and avoiding invented domain behavior.
  Scope: |-
    - In scope: persistent shell-owned SwPaM; DOM↔model selection mapping; beforeinput-first text, deletion, paragraph split/join pipeline; IME composition lifecycle and one committed undo unit; cursor attribute state; render-time selection restoration; focused parity tests and inventory references required by touched runtime files.
    - Out of scope: Stage 5 medium/recovery, new Writer features, unsupported cross-paragraph rich-text editing beyond Stage 4 requirements, and unrelated refactors.
  Plan: "Implement Stage 4 as a single CODER-owned leaf: preserve one persistent direction-aware SwPaM, route supported edits through beforeinput into shell operations before DOM reconciliation, model IME composition explicitly as one committed undo unit, isolate DOM selection mapping/restoration, retain shell cursor attributes, and verify the six Stage 4 assertions plus repository gates."
  Verify Steps: |-
    1. `npm exec vitest run --workspace @vite-office/office -- src/sw/source/uibase/wrtsh/select.test.ts src/sw/source/uibase/wrtsh/wrtsh.test.ts src/sw/source/uibase/docvw/edtwin.test.tsx src/sw/source/uibase/uiview/view-session.test.tsx src/sw/source/core/doc/writer-model.test.ts` — expected: Stage 4 cursor/input/IME regressions pass.
    2. `npm run typecheck` — expected: TypeScript contracts for shell, DOM adapter, and UI compile.
    3. `npm run verify` — expected: formatting, lint, typecheck, boundaries, unit/inventory coverage, E2E, static build, JSDoc, and file-size checks pass.
    4. `node .agentplane/policy/check-routing.mjs` and `ap doctor` — expected: repository workflow policy remains valid.
    5. `git status --short --untracked-files=all` — expected: only intentional task artifacts/source changes and the pre-existing user plan file are present.
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: |-
    - Revert the implementation commit and the deterministic task-close commit if created.
    - Re-run the targeted Writer tests and typecheck to confirm the previous behavior is restored.
    - Preserve the user-owned untracked parity plan file.
  Findings: ""
id_source: "generated"
---
## Summary

Implement stage 4 canonical cursor and input pipeline

Implement section 8 (Stage 4) of docs/program/vite-office-upstream-parity-plan.md, preserving upstream LibreOffice semantics and avoiding invented domain behavior.

## Scope

- In scope: persistent shell-owned SwPaM; DOM↔model selection mapping; beforeinput-first text, deletion, paragraph split/join pipeline; IME composition lifecycle and one committed undo unit; cursor attribute state; render-time selection restoration; focused parity tests and inventory references required by touched runtime files.
- Out of scope: Stage 5 medium/recovery, new Writer features, unsupported cross-paragraph rich-text editing beyond Stage 4 requirements, and unrelated refactors.

## Plan

Implement Stage 4 as a single CODER-owned leaf: preserve one persistent direction-aware SwPaM, route supported edits through beforeinput into shell operations before DOM reconciliation, model IME composition explicitly as one committed undo unit, isolate DOM selection mapping/restoration, retain shell cursor attributes, and verify the six Stage 4 assertions plus repository gates.

## Verify Steps

1. `npm exec vitest run --workspace @vite-office/office -- src/sw/source/uibase/wrtsh/select.test.ts src/sw/source/uibase/wrtsh/wrtsh.test.ts src/sw/source/uibase/docvw/edtwin.test.tsx src/sw/source/uibase/uiview/view-session.test.tsx src/sw/source/core/doc/writer-model.test.ts` — expected: Stage 4 cursor/input/IME regressions pass.
2. `npm run typecheck` — expected: TypeScript contracts for shell, DOM adapter, and UI compile.
3. `npm run verify` — expected: formatting, lint, typecheck, boundaries, unit/inventory coverage, E2E, static build, JSDoc, and file-size checks pass.
4. `node .agentplane/policy/check-routing.mjs` and `ap doctor` — expected: repository workflow policy remains valid.
5. `git status --short --untracked-files=all` — expected: only intentional task artifacts/source changes and the pre-existing user plan file are present.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert the implementation commit and the deterministic task-close commit if created.
- Re-run the targeted Writer tests and typecheck to confirm the previous behavior is restored.
- Preserve the user-owned untracked parity plan file.

## Findings
