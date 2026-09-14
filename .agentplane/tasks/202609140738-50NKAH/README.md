---
id: "202609140738-50NKAH"
title: "Fix Writer spaces and structured list paste"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 8
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-09-14T07:42:26.574Z"
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
    body: "Start: reproduce and fix Stage 4 whitespace projection and structured list Paste regressions using canonical Writer actions."
events:
  -
    type: "status"
    at: "2026-09-14T07:42:38.986Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: reproduce and fix Stage 4 whitespace projection and structured list Paste regressions using canonical Writer actions."
doc_version: 3
doc_updated_at: "2026-09-14T07:42:38.986Z"
doc_updated_by: "CODER"
description: "Follow up Stage 4 by restoring immediate whitespace-preserving projection and multi-paragraph/list-aware native paste without changing canonical SwWrtShell ownership."
sections:
  Summary: |-
    Fix delayed and collapsed Writer spaces

    Follow up Stage 4 by restoring immediate and whitespace-preserving browser projection for canonical Writer input without changing upstream shell semantics.
  Scope: |-
    - In scope: preserve trailing and repeated spaces in the rendered contenteditable projection; parse safe clipboard block/list structure emitted by Writer; paste list items as separate canonical Writer paragraphs with list kind/level; keep paste undoable and retain existing direct-format behavior; add Chromium and unit regressions.
    - Out of scope: arbitrary HTML/CSS import, tables/images, clipboard formats not already accepted, Stage 5 storage/recovery, and unrelated editor refactors.
  Plan: "Fix the two reported Stage 4 regressions through the existing Writer boundaries: CSS/view projection for significant spaces, safe clipboard parsing for paragraph/list structure, and a single shell-owned undoable paste transaction built from existing Writer actions. Verify direct-format paste remains unchanged and cover the behavior in Chromium."
  Verify Steps: |-
    1. `npm exec vitest run --workspace @vite-office/office -- src/sw/source/uibase/dochdl/swdtflvr.test.ts src/sw/source/uibase/wrtsh/wrtsh.test.ts src/sw/source/uibase/docvw/edtwin.test.tsx src/sw/source/uibase/uiview/view-session.test.tsx` — expected: whitespace and structured list Paste regressions pass, including undo.
    2. `npm exec playwright test -- --config apps/office/playwright.config.ts apps/office/e2e/writer-cut-paste.spec.ts` — expected: trailing/repeated spaces render immediately and pasted list items remain separate list paragraphs in Chromium.
    3. `npm run verify` — expected: all formatting, lint, typecheck, dependency, coverage, inventory, E2E, static build, JSDoc, and file-size gates pass.
    4. `node .agentplane/policy/check-routing.mjs`, `ap doctor`, and `npm run check:source-provenance` — expected: repository policy and upstream provenance remain valid.
    5. `git status --short --untracked-files=all` — expected: only intentional follow-up artifacts/source changes and the pre-existing user plan file are present.
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: |-
    - Revert the follow-up implementation and deterministic close commits.
    - Re-run focused Writer input/clipboard tests and npm run verify to confirm Stage 4 baseline restoration.
    - Preserve the user-owned untracked parity plan file.
  Findings: ""
id_source: "generated"
---
## Summary

Fix delayed and collapsed Writer spaces

Follow up Stage 4 by restoring immediate and whitespace-preserving browser projection for canonical Writer input without changing upstream shell semantics.

## Scope

- In scope: preserve trailing and repeated spaces in the rendered contenteditable projection; parse safe clipboard block/list structure emitted by Writer; paste list items as separate canonical Writer paragraphs with list kind/level; keep paste undoable and retain existing direct-format behavior; add Chromium and unit regressions.
- Out of scope: arbitrary HTML/CSS import, tables/images, clipboard formats not already accepted, Stage 5 storage/recovery, and unrelated editor refactors.

## Plan

Fix the two reported Stage 4 regressions through the existing Writer boundaries: CSS/view projection for significant spaces, safe clipboard parsing for paragraph/list structure, and a single shell-owned undoable paste transaction built from existing Writer actions. Verify direct-format paste remains unchanged and cover the behavior in Chromium.

## Verify Steps

1. `npm exec vitest run --workspace @vite-office/office -- src/sw/source/uibase/dochdl/swdtflvr.test.ts src/sw/source/uibase/wrtsh/wrtsh.test.ts src/sw/source/uibase/docvw/edtwin.test.tsx src/sw/source/uibase/uiview/view-session.test.tsx` — expected: whitespace and structured list Paste regressions pass, including undo.
2. `npm exec playwright test -- --config apps/office/playwright.config.ts apps/office/e2e/writer-cut-paste.spec.ts` — expected: trailing/repeated spaces render immediately and pasted list items remain separate list paragraphs in Chromium.
3. `npm run verify` — expected: all formatting, lint, typecheck, dependency, coverage, inventory, E2E, static build, JSDoc, and file-size gates pass.
4. `node .agentplane/policy/check-routing.mjs`, `ap doctor`, and `npm run check:source-provenance` — expected: repository policy and upstream provenance remain valid.
5. `git status --short --untracked-files=all` — expected: only intentional follow-up artifacts/source changes and the pre-existing user plan file are present.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert the follow-up implementation and deterministic close commits.
- Re-run focused Writer input/clipboard tests and npm run verify to confirm Stage 4 baseline restoration.
- Preserve the user-owned untracked parity plan file.

## Findings
