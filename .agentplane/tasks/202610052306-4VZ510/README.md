---
id: "202610052306-4VZ510"
title: "Align native Writer list context dispatch and current-level command state"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 29
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
task_kind: "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-05T23:39:13.734Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "pending"
  updated_at: null
  updated_by: null
  note: null
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-10-05T23:42:36.150Z"
  updated_by: "EVALUATOR"
  note: "Same-agent exact semantic SHA review passed for native list context and inactive menu state"
  evaluated_sha: "ae17337742d3b1abd21d76b738a04b13f0bb4a88"
  blueprint_digest: "797510b56fa4fde5a72c8f8ecb5a852e019e87ec3a673c0fbdbd79f0005dd1ee"
  evidence_refs:
    - ".agentplane/tasks/202610052306-4VZ510/README.md"
    - ".agentplane/tasks/202610052306-4VZ510/quality/20261005-234236150-recovery-context/quality-report.json"
    - ".agentplane/tasks/202610052306-4VZ510/quality/20261005-234236150-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202610052306-4VZ510/quality/20261005-234236150-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202610052306-4VZ510/blueprint/resolved-snapshot.json"
    - ".agentplane/tasks/202610052306-4VZ510/evidence/exact-sha-review.json"
    - ".agentplane/tasks/202610052306-4VZ510/evidence/scope-audit.json"
    - ".agentplane/tasks/202610052306-4VZ510/evidence/final-coverage.json"
  findings:
    - "Current point state, actual conditional shell stack, text command ownership and bindings-driven disabled menu entries match represented pinned behavior; full core/UI/list/table and NONE codec remain unverified."
commit: null
comments:
  -
    author: "CODER"
    body: "Start: implement source-owned text/list command context and current-point native level state under standing approved iteration; preserve IO exceptions and one absent-profile verification."
events:
  -
    type: "status"
    at: "2026-10-05T23:07:33.055Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implement source-owned text/list command context and current-point native level state under standing approved iteration; preserve IO exceptions and one absent-profile verification."
doc_version: 3
doc_updated_at: "2026-10-05T23:40:57.131Z"
doc_updated_by: "CODER"
description: "Iteration168: move existing list creation/removal/continuation commands from permanent list shell into existing native text shell; select actual native numbered context using represented SwWrtShell GetSelectionType, activate SwListShell below SwTextShell through SwView SelectShell, and use native GetNumLevel current-point state for existing single-level commands. Source-shaped responsibility splits retain mandatory1000-line limits. No new list/subpoint feature or IO policy change; verify actual core/DOM/production behavior with one full upstream-absent profile and failed/new-only recovery."
sections:
  Summary: "Aligned existing Writer text/list command ownership, conditional list context and current-point command state; removed menu descriptor filtering so inactive supported commands remain visible and disabled through native bindings."
  Scope: |-
    apps/office/src/sw/source/core/edit/ednumber.ts
    apps/office/src/sw/source/uibase/shells/listsh.ts
    apps/office/src/sw/source/uibase/shells/textsh1.ts
    apps/office/src/sw/source/uibase/shells/textsh1-commands.ts
    apps/office/src/sw/source/uibase/wrtsh/wrtsh1.ts
    apps/office/src/sw/source/uibase/wrtsh/wrtsh-selection.ts
    apps/office/src/sw/source/uibase/inc/wrtsh.ts
    apps/office/src/sw/source/uibase/uiview/view.ts
    apps/office/src/sw/browser/composition/writer-module.tsx
    docs/program/source-provenance.json
    docs/program/parity/runtime-inventory.json
    apps/office/src/sw/source/uibase/shells/listsh-odt.test.ts
    apps/office/src/sw/source/uibase/shells/native-list-context.test.ts
    apps/office/src/sw/browser/editor/native-list-context.test.tsx
    apps/office/e2e/writer-native-list-context.spec.ts
    apps/office/src/sw/source/core/edit/native-list-ring.test.ts
    apps/office/src/sw/source/core/edit/native-list-continuation-ring.test.ts
    apps/office/src/sw/source/core/undo/native-list-continuation.test.ts
    apps/office/src/sw/source/core/undo/native-list-rule-range.test.ts
    scripts/libreoffice-inventory/odt-upstream-fixtures.test.ts
    apps/office/src/framework/browser/presentation/CommandMenuBar.tsx
    Task-local README and bounded evidence only; ignored app coverage cache contains local source variants/results/maps, never upstream sources.
  Plan: "Iteration168 under the standing approved iterative native core/UI convergence goal, one CODER leaf in direct main. Align represented list command ownership and context: existing list creation/removal/continuation operations and descriptors move intact from SwListShell to SwTextShell; single-level IncrementLevel/DecrementLevel retain native NumUpDown. SwEditShell GetNumLevel reads actual current point with MAXLEVEL10 sentinel. SwListShell state uses current level, independently of range execution rejection. Represented SwWrtShell GetSelectionType uses actual rule/tree membership/non-NONE format and Text/Table/TableCell flags. SwView SelectShell conditionally installs list shell below text shell, masks TableCell and caches flags; bootstrap and actual selection/model/history hints update context. Mandatory1000-line gate requires source-owned command registry and selection-query splits with one intentional createWriterTextCommandRegistry symbol relocation, no compatibility re-export. Existing GetTextShell returns the existing owner for source-confirmed caller migration. Remove generic menu descriptor-presence filtering: supported generated resource entries remain visible and disabled through actual bindings, matching pinned DontHideDisabledEntry=true. No new model/DTO/manager/fallback registry/command adapter.21 changed semantic paths:10 production owners including3 new partial native modules,2 metadata files,6 prior test owner migrations and3 new native/DOM/Chromium test files.432prior test files426byte-identical; migration assertions preserved except structural fixture now checks actual inherited number/bullet false directly. Optional old cell-state correction not needed; file unchanged.255prior runtime states/defaults/classifications/IO exceptions/evidence preserved,3newpartialunverified owners258modules. Six initial static gates then one full upstream-absent build/app/inventory/scripts/Chromium profile; only failed gates, changed-file checks and original failed cases afterward. Actual100%L/S/F/B from identity-checked counters, raw coverage/results/local initial source copies only ignored app cache. Five restored source audits, exact scope/prior-tests/metadata/source hashes/AP ignored-inclusive scan/doctor/routing/diffcheck; explicit same-agent EVALUATOR exact semantic SHA pass, canonical meaningful finish and whole parent Findings append, clean main. AP bounded English prose/counts/hashes/outcomes/exact failed names only, no sources/helpers/probes/raw diagnostics. No network/outside/global/subagents. Native other selection contexts, row/column subtypes, framework/layout/readonly/toolbar gates, full KeyInput/core/UI/list/table behavior remain unverified. Existing xmlnume NONE serialization limitation is a separate follow-up: NONE core/DOM context is verified; browser uses ordinary imported plain/list context. Conscious save/open/recovery deviations unchanged; parent DOING and goal ACTIVE."
  Verify Steps: |-
    1. Initial six static gates: npm run format:check; npm run lint; npm run typecheck; npm run check:dependencies; npm run check:docs; npm run check:file-size. Failed typecheck only rerun; subsequent changes use changed-file Prettier/ESLint/repository JSDoc/actual app and tools TypeScript diagnostics/unchanged1000-line checks.
    2. Exactly one full upstream-absent profile: npm run test:static; npm run test:coverage --workspace @vite-office/office -- --coverage.reportOnFailure; npm run test:inventory:coverage -- --coverage.reportOnFailure; npm exec -- vitest run scripts/check-source-provenance.test.ts scripts/writer-ui-resource-model.test.ts; npm exec -- playwright test --config apps/office/playwright.config.ts. In-repo vendor rename with finally restoration; tests never read/invoke/compile upstream. Initial app12581pass7fail,inventory108pass1fail,scripts5pass,Chromium143pass2fail. Recover only original failed cases; final distinct app12588/inventory109/scripts5/Chromium145,zero flaky. Rebuild after actual menu production change only. Persist exact failures/errors/counts/hashes before assertions; skipped is skipped. Actual100%L/S/F/B app/inventory via exact source/map identity or contiguous unchanged locations plus actual changed-location counters; no passing/full replay.
    3. Actual native point/sentinel/rule/list membership/NONE/complete enum identity/table/selected-row/ring/current-point forward-reverse rejected-range/menu context/undo-redo/document replacement checks; mounted DOM actual selectionchange, native bindings/state/history; real Chromium1280/390 ordinary ODT Open/plain/list boundary/context/menu changes/list exit-reentry/typing/Undo/neighbors.19 new app cases and2 new browser cases. Existing ODT NONE export remains unverified follow-up; no codec change.
    4.432prior tests426byte-identical;6 exact owner migrations only,all other behavior assertions preserved.255prior semantic states/defaults/classes/IO exceptions/evidence retained; one registry localSymbol relocation,3newpartialunverified owners258modules. No full-module parity promotion or conscious IO deviation change.
    5. Five restored source audits: npm exec -- tsx scripts/generate-writer-ui-resources.ts --check; npm run check:source-tree; npm run check:source-provenance; npm run inventory:invariants; npm run inventory:parity. Exact scope/prior-test/metadata/sourcehash/AP ignored-inclusive/doctor/routing/diffcheck evidence. Same-agent EVALUATOR exact semantic SHA pass; record verify and canonical meaningful finish; preserve whole parent Findings; clean tracked/untracked main. Full native/core/UI/list/table objective remains ACTIVE and unverified.
  Verification: "Pending six statics,one upstream-absent profile,source audits and exact-SHA same-agent review."
  Rollback Plan: "Revert only the intentional semantic commit through a new executable task if needed; DONE task artifacts remain immutable."
  Findings: "Implemented native current-point list state and conditional list-before-text context; moved list-kind/continuation operations intact to the existing text shell and removed old ownership. Supported inactive menu commands remain visible and disabled through bindings, matching upstream default.19 new app and2 browser cases;432 prior tests426 byte-identical and6 exact owner migrations.255 prior semantic states/defaults/classes/IO deviations/evidence preserved;3 new partial unverified modules=258. One full absent profile initially had7 new app failures,1 old inventory owner failure and2 new browser fixture failures; exact failed names/counts/errors/hashes retained in evidence. Failed-only recovery: first4/7app and1inventory passed, then3 remaining app passed after actual menu visibility correction and selectionchange fixture;2 original browser cases finally passed after native radio role correction. No passing/full replay; one rebuild followed actual production change. Final distinct12588app109inventory5scripts145Chromium,0flaky;actual app100%12879L14117S3424F10472B,inventory100%1464L1523S384F1080B. Source/map identity and contiguous unchanged locations only; changed menu locations actual failed-case counters. Six initial statics plus failed typecheck and changed-file checks passed;five restored audits passed,semanticViolations0. Scope/provenance/prior-state/sourcehash/APignoredscan4436files0forbidden/doctor0errors2knownwarnings/routing/diffcheck passed. Same-agent EVALUATOR exact SHA review required before finish. Other selection contexts/table row-column subtypes/framework/layout/readonly/toolbar gating/full KeyInput/core/UI/list/table and ODT NONE serialization remain unverified. Pinned SDI IncrementLevel/DecrementLevel are correctly NumUpDown; separate outline/sublevel commands are future scope. Conscious save/open/recovery deviations unchanged;parent DOING/goalACTIVE."
id_source: "generated"
---
## Summary

Aligned existing Writer text/list command ownership, conditional list context and current-point command state; removed menu descriptor filtering so inactive supported commands remain visible and disabled through native bindings.

## Scope

apps/office/src/sw/source/core/edit/ednumber.ts
apps/office/src/sw/source/uibase/shells/listsh.ts
apps/office/src/sw/source/uibase/shells/textsh1.ts
apps/office/src/sw/source/uibase/shells/textsh1-commands.ts
apps/office/src/sw/source/uibase/wrtsh/wrtsh1.ts
apps/office/src/sw/source/uibase/wrtsh/wrtsh-selection.ts
apps/office/src/sw/source/uibase/inc/wrtsh.ts
apps/office/src/sw/source/uibase/uiview/view.ts
apps/office/src/sw/browser/composition/writer-module.tsx
docs/program/source-provenance.json
docs/program/parity/runtime-inventory.json
apps/office/src/sw/source/uibase/shells/listsh-odt.test.ts
apps/office/src/sw/source/uibase/shells/native-list-context.test.ts
apps/office/src/sw/browser/editor/native-list-context.test.tsx
apps/office/e2e/writer-native-list-context.spec.ts
apps/office/src/sw/source/core/edit/native-list-ring.test.ts
apps/office/src/sw/source/core/edit/native-list-continuation-ring.test.ts
apps/office/src/sw/source/core/undo/native-list-continuation.test.ts
apps/office/src/sw/source/core/undo/native-list-rule-range.test.ts
scripts/libreoffice-inventory/odt-upstream-fixtures.test.ts
apps/office/src/framework/browser/presentation/CommandMenuBar.tsx
Task-local README and bounded evidence only; ignored app coverage cache contains local source variants/results/maps, never upstream sources.

## Plan

Iteration168 under the standing approved iterative native core/UI convergence goal, one CODER leaf in direct main. Align represented list command ownership and context: existing list creation/removal/continuation operations and descriptors move intact from SwListShell to SwTextShell; single-level IncrementLevel/DecrementLevel retain native NumUpDown. SwEditShell GetNumLevel reads actual current point with MAXLEVEL10 sentinel. SwListShell state uses current level, independently of range execution rejection. Represented SwWrtShell GetSelectionType uses actual rule/tree membership/non-NONE format and Text/Table/TableCell flags. SwView SelectShell conditionally installs list shell below text shell, masks TableCell and caches flags; bootstrap and actual selection/model/history hints update context. Mandatory1000-line gate requires source-owned command registry and selection-query splits with one intentional createWriterTextCommandRegistry symbol relocation, no compatibility re-export. Existing GetTextShell returns the existing owner for source-confirmed caller migration. Remove generic menu descriptor-presence filtering: supported generated resource entries remain visible and disabled through actual bindings, matching pinned DontHideDisabledEntry=true. No new model/DTO/manager/fallback registry/command adapter.21 changed semantic paths:10 production owners including3 new partial native modules,2 metadata files,6 prior test owner migrations and3 new native/DOM/Chromium test files.432prior test files426byte-identical; migration assertions preserved except structural fixture now checks actual inherited number/bullet false directly. Optional old cell-state correction not needed; file unchanged.255prior runtime states/defaults/classifications/IO exceptions/evidence preserved,3newpartialunverified owners258modules. Six initial static gates then one full upstream-absent build/app/inventory/scripts/Chromium profile; only failed gates, changed-file checks and original failed cases afterward. Actual100%L/S/F/B from identity-checked counters, raw coverage/results/local initial source copies only ignored app cache. Five restored source audits, exact scope/prior-tests/metadata/source hashes/AP ignored-inclusive scan/doctor/routing/diffcheck; explicit same-agent EVALUATOR exact semantic SHA pass, canonical meaningful finish and whole parent Findings append, clean main. AP bounded English prose/counts/hashes/outcomes/exact failed names only, no sources/helpers/probes/raw diagnostics. No network/outside/global/subagents. Native other selection contexts, row/column subtypes, framework/layout/readonly/toolbar gates, full KeyInput/core/UI/list/table behavior remain unverified. Existing xmlnume NONE serialization limitation is a separate follow-up: NONE core/DOM context is verified; browser uses ordinary imported plain/list context. Conscious save/open/recovery deviations unchanged; parent DOING and goal ACTIVE.

## Verify Steps

1. Initial six static gates: npm run format:check; npm run lint; npm run typecheck; npm run check:dependencies; npm run check:docs; npm run check:file-size. Failed typecheck only rerun; subsequent changes use changed-file Prettier/ESLint/repository JSDoc/actual app and tools TypeScript diagnostics/unchanged1000-line checks.
2. Exactly one full upstream-absent profile: npm run test:static; npm run test:coverage --workspace @vite-office/office -- --coverage.reportOnFailure; npm run test:inventory:coverage -- --coverage.reportOnFailure; npm exec -- vitest run scripts/check-source-provenance.test.ts scripts/writer-ui-resource-model.test.ts; npm exec -- playwright test --config apps/office/playwright.config.ts. In-repo vendor rename with finally restoration; tests never read/invoke/compile upstream. Initial app12581pass7fail,inventory108pass1fail,scripts5pass,Chromium143pass2fail. Recover only original failed cases; final distinct app12588/inventory109/scripts5/Chromium145,zero flaky. Rebuild after actual menu production change only. Persist exact failures/errors/counts/hashes before assertions; skipped is skipped. Actual100%L/S/F/B app/inventory via exact source/map identity or contiguous unchanged locations plus actual changed-location counters; no passing/full replay.
3. Actual native point/sentinel/rule/list membership/NONE/complete enum identity/table/selected-row/ring/current-point forward-reverse rejected-range/menu context/undo-redo/document replacement checks; mounted DOM actual selectionchange, native bindings/state/history; real Chromium1280/390 ordinary ODT Open/plain/list boundary/context/menu changes/list exit-reentry/typing/Undo/neighbors.19 new app cases and2 new browser cases. Existing ODT NONE export remains unverified follow-up; no codec change.
4.432prior tests426byte-identical;6 exact owner migrations only,all other behavior assertions preserved.255prior semantic states/defaults/classes/IO exceptions/evidence retained; one registry localSymbol relocation,3newpartialunverified owners258modules. No full-module parity promotion or conscious IO deviation change.
5. Five restored source audits: npm exec -- tsx scripts/generate-writer-ui-resources.ts --check; npm run check:source-tree; npm run check:source-provenance; npm run inventory:invariants; npm run inventory:parity. Exact scope/prior-test/metadata/sourcehash/AP ignored-inclusive/doctor/routing/diffcheck evidence. Same-agent EVALUATOR exact semantic SHA pass; record verify and canonical meaningful finish; preserve whole parent Findings; clean tracked/untracked main. Full native/core/UI/list/table objective remains ACTIVE and unverified.

## Verification

Pending six statics,one upstream-absent profile,source audits and exact-SHA same-agent review.

## Rollback Plan

Revert only the intentional semantic commit through a new executable task if needed; DONE task artifacts remain immutable.

## Findings

Implemented native current-point list state and conditional list-before-text context; moved list-kind/continuation operations intact to the existing text shell and removed old ownership. Supported inactive menu commands remain visible and disabled through bindings, matching upstream default.19 new app and2 browser cases;432 prior tests426 byte-identical and6 exact owner migrations.255 prior semantic states/defaults/classes/IO deviations/evidence preserved;3 new partial unverified modules=258. One full absent profile initially had7 new app failures,1 old inventory owner failure and2 new browser fixture failures; exact failed names/counts/errors/hashes retained in evidence. Failed-only recovery: first4/7app and1inventory passed, then3 remaining app passed after actual menu visibility correction and selectionchange fixture;2 original browser cases finally passed after native radio role correction. No passing/full replay; one rebuild followed actual production change. Final distinct12588app109inventory5scripts145Chromium,0flaky;actual app100%12879L14117S3424F10472B,inventory100%1464L1523S384F1080B. Source/map identity and contiguous unchanged locations only; changed menu locations actual failed-case counters. Six initial statics plus failed typecheck and changed-file checks passed;five restored audits passed,semanticViolations0. Scope/provenance/prior-state/sourcehash/APignoredscan4436files0forbidden/doctor0errors2knownwarnings/routing/diffcheck passed. Same-agent EVALUATOR exact SHA review required before finish. Other selection contexts/table row-column subtypes/framework/layout/readonly/toolbar gating/full KeyInput/core/UI/list/table and ODT NONE serialization remain unverified. Pinned SDI IncrementLevel/DecrementLevel are correctly NumUpDown; separate outline/sublevel commands are future scope. Conscious save/open/recovery deviations unchanged;parent DOING/goalACTIVE.
