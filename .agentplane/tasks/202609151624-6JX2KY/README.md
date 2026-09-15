---
id: "202609151624-6JX2KY"
title: "Implement Writer upstream parity Phase 6"
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
  updated_at: "2026-09-15T16:24:52.229Z"
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
    body: "Start: continue direct-mode task in current checkout."
events:
  -
    type: "status"
    at: "2026-09-15T16:25:01.592Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: continue direct-mode task in current checkout."
doc_version: 3
doc_updated_at: "2026-09-15T16:25:01.592Z"
doc_updated_by: "CODER"
description: "Rebuild React presentation over pinned LibreOffice contracts: browser-only composition paths, generic Sfx resource-driven controls, typed dialog requests, honest shell/layout chrome, and centralized localization; no legacy persisted-model compatibility."
sections:
  Summary: |-
    Implement Writer upstream parity Phase 6

    Rebuild React presentation over pinned LibreOffice contracts: browser-only composition paths, generic Sfx resource-driven controls, typed dialog requests, honest shell/layout chrome, and centralized localization; no legacy persisted-model compatibility.
  Scope: |-
    - In scope: all P6.1-P6.4 work in docs/program/vite-office-upstream-parity-plan.md; React/browser composition moves; generic resource-driven menu, toolbar, shortcut, and command controls over Sfx bindings; active-context object bars; typed dialog request completion; honest chrome and centralized localization; tests and parity evidence.
    - Upstream authority: vendor/libreoffice-reference at pinned libreoffice-26.8.0.2 baseline.
    - Persistence rule: if stored document shape changes, reject obsolete schemas; do not add backward-compatibility loaders.
    - Out of scope: Phase 7 persistence/filter/recovery redesign except compile-safe adaptations required by Phase 6; unrelated suite implementation.
  Plan: |-
    1. Audit current React imports and presentation-owned semantics against pinned SwView, SfxBindings/SfxDispatcher, UI XML/XCU resources, and Writer dialog controller patterns.
    2. Move React components and browser composition out of upstream implementation paths; move generic launcher/presentation code under framework/browser and remove fabricated suite lifecycle/task previews.
    3. Implement reusable resource-driven command presenters and centralized menu interaction behavior over SfxBindings; select standard/text/numbering object bars by active context.
    4. Add a typed controller-owned dialog request/completion boundary and route hyperlink commands through normal dispatch without fabricated UI success.
    5. Project only real shell/view/layout state into properties, status, page/language/ruler chrome; hide unsupported controls and centralize locale/resource label resolution.
    6. Update focused, integration, inventory, and e2e coverage; run the full verification contract; record evidence, finish, commit, and push main.
  Verify Steps: |-
    1. `npx vitest run apps/office/src/framework/browser apps/office/src/sw/browser apps/office/src/sw/source/uibase/uiview apps/office/src/sw/source/uibase/app apps/office/src/sw/uiconfig/swriter` — focused presentation, dispatch/bindings, resource, dialog, localization, and boundary tests pass.
    2. `npm run typecheck` — TypeScript contracts and moved import boundaries compile.
    3. `npm run lint` — lint passes without warnings.
    4. `npm test` — complete unit and parity inventory suite passes at enforced thresholds.
    5. `npm run test:e2e` — Writer browser command, menu, toolbar, dialog, and editing flows pass in Chromium.
    6. `npm run build` — production build succeeds.
    7. `ap doctor` and `node .agentplane/policy/check-routing.mjs` — AgentPlane health and routing policy pass.
    8. Source inspection: no production React imports remain under `sw/source/**`; React command controls execute/query through Sfx dispatch/bindings; dialog UI cannot fabricate command completion; unsupported decorative chrome and stale task/lifecycle previews are absent; resource labels and style names use the centralized locale service.
    9. `git status --short --untracked-files=all` — only intentional Phase 6/task artifacts exist before finish and the tracked tree is clean afterward.
    10. `git push` — the completed Phase 6 commit and deterministic close commit are present on the configured upstream branch.
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: |-
    - Revert the Phase 6 implementation and AgentPlane close commits.
    - Restore the prior browser presentation imports without adding persisted-model compatibility.
    - Re-run focused tests, typecheck, lint, full tests, e2e, and build to confirm rollback safety.
  Findings: ""
id_source: "generated"
---
## Summary

Implement Writer upstream parity Phase 6

Rebuild React presentation over pinned LibreOffice contracts: browser-only composition paths, generic Sfx resource-driven controls, typed dialog requests, honest shell/layout chrome, and centralized localization; no legacy persisted-model compatibility.

## Scope

- In scope: all P6.1-P6.4 work in docs/program/vite-office-upstream-parity-plan.md; React/browser composition moves; generic resource-driven menu, toolbar, shortcut, and command controls over Sfx bindings; active-context object bars; typed dialog request completion; honest chrome and centralized localization; tests and parity evidence.
- Upstream authority: vendor/libreoffice-reference at pinned libreoffice-26.8.0.2 baseline.
- Persistence rule: if stored document shape changes, reject obsolete schemas; do not add backward-compatibility loaders.
- Out of scope: Phase 7 persistence/filter/recovery redesign except compile-safe adaptations required by Phase 6; unrelated suite implementation.

## Plan

1. Audit current React imports and presentation-owned semantics against pinned SwView, SfxBindings/SfxDispatcher, UI XML/XCU resources, and Writer dialog controller patterns.
2. Move React components and browser composition out of upstream implementation paths; move generic launcher/presentation code under framework/browser and remove fabricated suite lifecycle/task previews.
3. Implement reusable resource-driven command presenters and centralized menu interaction behavior over SfxBindings; select standard/text/numbering object bars by active context.
4. Add a typed controller-owned dialog request/completion boundary and route hyperlink commands through normal dispatch without fabricated UI success.
5. Project only real shell/view/layout state into properties, status, page/language/ruler chrome; hide unsupported controls and centralize locale/resource label resolution.
6. Update focused, integration, inventory, and e2e coverage; run the full verification contract; record evidence, finish, commit, and push main.

## Verify Steps

1. `npx vitest run apps/office/src/framework/browser apps/office/src/sw/browser apps/office/src/sw/source/uibase/uiview apps/office/src/sw/source/uibase/app apps/office/src/sw/uiconfig/swriter` — focused presentation, dispatch/bindings, resource, dialog, localization, and boundary tests pass.
2. `npm run typecheck` — TypeScript contracts and moved import boundaries compile.
3. `npm run lint` — lint passes without warnings.
4. `npm test` — complete unit and parity inventory suite passes at enforced thresholds.
5. `npm run test:e2e` — Writer browser command, menu, toolbar, dialog, and editing flows pass in Chromium.
6. `npm run build` — production build succeeds.
7. `ap doctor` and `node .agentplane/policy/check-routing.mjs` — AgentPlane health and routing policy pass.
8. Source inspection: no production React imports remain under `sw/source/**`; React command controls execute/query through Sfx dispatch/bindings; dialog UI cannot fabricate command completion; unsupported decorative chrome and stale task/lifecycle previews are absent; resource labels and style names use the centralized locale service.
9. `git status --short --untracked-files=all` — only intentional Phase 6/task artifacts exist before finish and the tracked tree is clean afterward.
10. `git push` — the completed Phase 6 commit and deterministic close commit are present on the configured upstream branch.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert the Phase 6 implementation and AgentPlane close commits.
- Restore the prior browser presentation imports without adding persisted-model compatibility.
- Re-run focused tests, typecheck, lint, full tests, e2e, and build to confirm rollback safety.

## Findings
