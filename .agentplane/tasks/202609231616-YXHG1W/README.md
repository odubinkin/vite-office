---
id: "202609231616-YXHG1W"
title: "Unify Writer UI command presentation and responsive sidebar"
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
  updated_at: "2026-09-23T16:16:55.239Z"
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
    body: "Start: Implementing approved Writer UI presentation selector and responsive sidebar, preserving generated resource and Sfx binding ownership."
events:
  -
    type: "status"
    at: "2026-09-23T16:17:00.066Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: Implementing approved Writer UI presentation selector and responsive sidebar, preserving generated resource and Sfx binding ownership."
doc_version: 3
doc_updated_at: "2026-09-23T16:26:36.834Z"
doc_updated_by: "CODER"
description: "Implement confirmed section 5 of upstream parity plan using generated Writer resources and Sfx bindings; keep title shell-owned and sidebar reachable on narrow viewports."
sections:
  Summary: |-
    Unify Writer UI command presentation and responsive sidebar

    Implement confirmed section 5 of upstream parity plan using generated Writer resources and Sfx bindings; keep title shell-owned and sidebar reachable on narrow viewports.
  Scope: "Section 5 (U) only: Writer browser presentation selector; menu, toolbar, properties consumers; responsive sidebar; title projection; focused tests. No document model migration or inventory changes."
  Plan: "1. Keep SwDocShell as title owner and generated Writer UI resources as command metadata owner. 2. Add one Writer browser presentation selector backed by generated resources, localization, and Sfx bindings; share it across menu, standard toolbar, formatting toolbar, and properties controls. 3. Render visible sidebar on narrow viewports while preserving checked state. 4. Add focused responsive, accessibility, localization, and command parity tests; run relevant checks and record results."
  Verify Steps: "1. Run focused Writer presentation tests, including narrow viewport/sidebar, keyboard/focus, locale, and command parity. 2. Run npm run typecheck, npm run lint, and npm run format:check. 3. Run relevant integration/e2e UI checks and confirm generated resources remain unchanged. 4. Run ap doctor and node .agentplane/policy/check-routing.mjs; inspect final git status."
  Verification: |-
    Command: npx vitest run (five focused suites). Result: pass. Evidence: 27/27 tests; Writer menu, editor, resource selector, and generic controls. Scope: command parity, locale fallback, keyboard/focus.
    Command: npm run typecheck --workspace @vite-office/office && npm run lint && npm run format:check. Result: pass. Evidence: TypeScript, ESLint, and Prettier exit 0. Scope: changed implementation and tests.
    Command: npm run build --workspace @vite-office/office && npx playwright test --config apps/office/playwright.config.ts apps/office/e2e/foundation.spec.ts apps/office/e2e/writer-responsive-sidebar.spec.ts. Result: pass. Evidence: build and 2/2 Chromium tests, including a touch viewport and axe check. Scope: real browser UI, sidebar state/reachability, keyboard and accessibility.
    Command: npm run check:writer-resources && npm run check:dependencies && npm run check:source-tree && ap doctor && node .agentplane/policy/check-routing.mjs. Result: pass. Evidence: generated resources unchanged, boundaries/source tree valid, doctor OK with existing warnings, routing OK. Scope: resource ownership and repository policy.
  Rollback Plan: "Revert the task implementation and tests through the traceable commit; no persisted document schema changes are planned."
  Findings: "Optional full coverage run: all 398 tests in 94 files passed, but npm run test:coverage exited 1 because the repository-wide 100% threshold is unmet (99.68% lines, 99.4% branches). The report lists uncovered lines only in untouched model/layout/XML modules. This task did not change those modules; no coverage threshold or test policy was altered. ap doctor reported an older managed hook shim and an older DONE-task commit warning; doctor still exited 0."
id_source: "generated"
---
## Summary

Unify Writer UI command presentation and responsive sidebar

Implement confirmed section 5 of upstream parity plan using generated Writer resources and Sfx bindings; keep title shell-owned and sidebar reachable on narrow viewports.

## Scope

Section 5 (U) only: Writer browser presentation selector; menu, toolbar, properties consumers; responsive sidebar; title projection; focused tests. No document model migration or inventory changes.

## Plan

1. Keep SwDocShell as title owner and generated Writer UI resources as command metadata owner. 2. Add one Writer browser presentation selector backed by generated resources, localization, and Sfx bindings; share it across menu, standard toolbar, formatting toolbar, and properties controls. 3. Render visible sidebar on narrow viewports while preserving checked state. 4. Add focused responsive, accessibility, localization, and command parity tests; run relevant checks and record results.

## Verify Steps

1. Run focused Writer presentation tests, including narrow viewport/sidebar, keyboard/focus, locale, and command parity. 2. Run npm run typecheck, npm run lint, and npm run format:check. 3. Run relevant integration/e2e UI checks and confirm generated resources remain unchanged. 4. Run ap doctor and node .agentplane/policy/check-routing.mjs; inspect final git status.

## Verification

Command: npx vitest run (five focused suites). Result: pass. Evidence: 27/27 tests; Writer menu, editor, resource selector, and generic controls. Scope: command parity, locale fallback, keyboard/focus.
Command: npm run typecheck --workspace @vite-office/office && npm run lint && npm run format:check. Result: pass. Evidence: TypeScript, ESLint, and Prettier exit 0. Scope: changed implementation and tests.
Command: npm run build --workspace @vite-office/office && npx playwright test --config apps/office/playwright.config.ts apps/office/e2e/foundation.spec.ts apps/office/e2e/writer-responsive-sidebar.spec.ts. Result: pass. Evidence: build and 2/2 Chromium tests, including a touch viewport and axe check. Scope: real browser UI, sidebar state/reachability, keyboard and accessibility.
Command: npm run check:writer-resources && npm run check:dependencies && npm run check:source-tree && ap doctor && node .agentplane/policy/check-routing.mjs. Result: pass. Evidence: generated resources unchanged, boundaries/source tree valid, doctor OK with existing warnings, routing OK. Scope: resource ownership and repository policy.

## Rollback Plan

Revert the task implementation and tests through the traceable commit; no persisted document schema changes are planned.

## Findings

Optional full coverage run: all 398 tests in 94 files passed, but npm run test:coverage exited 1 because the repository-wide 100% threshold is unmet (99.68% lines, 99.4% branches). The report lists uncovered lines only in untouched model/layout/XML modules. This task did not change those modules; no coverage threshold or test policy was altered. ap doctor reported an older managed hook shim and an older DONE-task commit warning; doctor still exited 0.
