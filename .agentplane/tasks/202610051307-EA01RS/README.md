---
id: "202610051307-EA01RS"
title: "Read single-paragraph clipboard fragments through native table cursor rings"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 8
origin:
  system: "manual"
depends_on: []
tags:
  - "clipboard"
  - "table"
  - "upstream"
  - "writer"
task_kind: "code"
mutation_scope: "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-05T13:07:52.332Z"
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
  updated_at: "2026-10-05T13:27:03.518Z"
  updated_by: "EVALUATOR"
  note: "Exact aa62e7c9 satisfies approved native single-paragraph selected-table read scope; one absent full profile all pass,100% coverage and source audits pass. Same-agent evaluation phase."
  evaluated_sha: "aa62e7c9617a96e46e955c7cf3108ba32fd4703b"
  blueprint_digest: "e9e516a49533de117cf6b86b6c586660f87b94f6610fea1cdc6d56ad50996817"
  evidence_refs:
    - ".agentplane/tasks/202610051307-EA01RS/README.md"
    - ".agentplane/tasks/202610051307-EA01RS/quality/20261005-132703518-recovery-context/quality-report.json"
    - ".agentplane/tasks/202610051307-EA01RS/quality/20261005-132703518-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202610051307-EA01RS/quality/20261005-132703518-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202610051307-EA01RS/blueprint/resolved-snapshot.json"
    - ".agentplane/tasks/202610051307-EA01RS/evidence/exact-sha-evaluation.json"
    - ".agentplane/tasks/202610051307-EA01RS/evidence/absent-profile.json"
    - ".agentplane/tasks/202610051307-EA01RS/evidence/restored-source-audits.json"
    - ".agentplane/tasks/202610051307-EA01RS/evidence/scope-audit.json"
  findings:
    - "Actual SwPaM cell end points supply all targets; existing content/earlier paragraphs/neighbor identities and native table selection survive grouped fragment insertion and repeated Undo/Redo. Direct shell-to-reader dispatch bypasses callback paste adapter for bounded route.9new app and1Chromium scenarios pass;398old test files and247prior semantic records/provenance preserved. No production changes after successful profile or passing replay."
commit: null
comments:
  -
    author: "CODER"
    body: "Start: Implement approved native single-paragraph table clipboard ring read and source-independent coverage."
events:
  -
    type: "status"
    at: "2026-10-05T13:07:54.095Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: Implement approved native single-paragraph table clipboard ring read and source-independent coverage."
doc_version: 3
doc_updated_at: "2026-10-05T13:25:41.566Z"
doc_updated_by: "CODER"
description: "Iteration150: route external single-paragraph table paste through native SwReader ring ownership, preserving existing cell content and one undo unit instead of deleting selected boxes and writing one cell. Parent 202609240501-C9TN6M; standing user UI/refactoring authorization. Leave multiline and structural clipboard behavior unverified."
sections:
  Summary: "Iteration150 atomic native single-paragraph table clipboard read. Add source-owned filter/basflt/shellio.ts creating one native Sfx list action from actual editing SwPaM ring point positions, independent SwUndoInsert fragment payloads, no selected-content deletion, no cell joins, no UI TextRuns editing or callback paste operations. SwWrtShell.PasteAtCursor dispatches only actual table mode plus one non-block paragraph with no list to this native read owner. Preserve native displayed table selection and adjust endpoint positions across inserted text; one Undo/Redo restores content and table selection. Keep the existing transfer parsing boundary and all other paste routes. Test noncontiguous selected columns, reverse endpoints, multiple paragraphs already in target cells, empty targets/empty transfer, formatted fragments, neighbor/table/box identities, repeated Undo/Redo, real DOM/Chromium paste and selection painting. Single-paragraph fragment transfer only: native ASCII default formatting/filter provenance, multiline/list/structural transfer and full reader import/SwUndoInsDoc lifetimes remain unverified. Scope seven paths: apps/office/src/sw/source/filter/basflt/shellio.ts, apps/office/src/sw/source/uibase/wrtsh/wrtsh1.ts, apps/office/src/sw/source/uibase/wrtsh/native-table-paste.test.ts, apps/office/src/sw/browser/editor/native-table-paste.test.tsx, apps/office/e2e/writer-native-table-paste.spec.ts, docs/program/source-provenance.json, docs/program/parity/runtime-inventory.json. Preserve all247 existing semantic statuses/contracts/defaults/classifications/exceptions, append new source-owned module as unverified; preserve existing tests byte-identical. Standing user authorization applies. No upstream copies/AP helpers/raw outputs/Python/probes/network/outside/subagents; one absent full profile only."
  Scope: |-
    apps/office/src/sw/source/filter/basflt/shellio.ts
    apps/office/src/sw/source/uibase/wrtsh/wrtsh1.ts
    apps/office/src/sw/source/uibase/wrtsh/native-table-paste.test.ts
    apps/office/src/sw/browser/editor/native-table-paste.test.tsx
    apps/office/e2e/writer-native-table-paste.spec.ts
    docs/program/source-provenance.json
    docs/program/parity/runtime-inventory.json
  Plan: "Iteration150 atomic native single-paragraph table clipboard read. Add source-owned filter/basflt/shellio.ts creating one native Sfx list action from actual editing SwPaM ring point positions, independent SwUndoInsert fragment payloads, no selected-content deletion, no cell joins, no UI TextRuns editing or callback paste operations. SwWrtShell.PasteAtCursor dispatches only actual table mode plus one non-block paragraph with no list to this native read owner. Preserve native displayed table selection and adjust endpoint positions across inserted text; one Undo/Redo restores content and table selection. Keep the existing transfer parsing boundary and all other paste routes. Test noncontiguous selected columns, reverse endpoints, multiple paragraphs already in target cells, empty targets/empty transfer, formatted fragments, neighbor/table/box identities, repeated Undo/Redo, real DOM/Chromium paste and selection painting. Single-paragraph fragment transfer only: native ASCII default formatting/filter provenance, multiline/list/structural transfer and full reader import/SwUndoInsDoc lifetimes remain unverified. Scope seven paths: apps/office/src/sw/source/filter/basflt/shellio.ts, apps/office/src/sw/source/uibase/wrtsh/wrtsh1.ts, apps/office/src/sw/source/uibase/wrtsh/native-table-paste.test.ts, apps/office/src/sw/browser/editor/native-table-paste.test.tsx, apps/office/e2e/writer-native-table-paste.spec.ts, docs/program/source-provenance.json, docs/program/parity/runtime-inventory.json. Preserve all247 existing semantic statuses/contracts/defaults/classifications/exceptions, append new source-owned module as unverified; preserve existing tests byte-identical. Standing user authorization applies. No upstream copies/AP helpers/raw outputs/Python/probes/network/outside/subagents; one absent full profile only."
  Verify Steps: |-
    1. Six statics first: npm run format:check; npm run lint; npm run typecheck; npm run check:dependencies; npm run check:docs; npm run check:file-size. Changed-file checks after fixes only.
    2. ONE sequential full upstream-absent profile: npm run test:static; npm run test:coverage --workspace @vite-office/office -- --coverage.reportOnFailure; npm run test:inventory:coverage -- --coverage.reportOnFailure; npm exec -- vitest run scripts/check-source-provenance.test.ts scripts/writer-ui-resource-model.test.ts; npm exec -- playwright test --config apps/office/playwright.config.ts. Rename vendor inside repo and restore in finally; no upstream access/execution by tests. Persist exact failed/error names before assertions. Only failed gates/cases and genuinely new unexecuted cases repeat; no passing full/static/build/suite/case replay; actual maps ignored appcache only.
    3. Source-independent tests prove native single-paragraph reader uses all actual table editing ring points without selected-content deletion or joining sections; single and noncontiguous/reverse selected cells, existing target paragraphs/empty cells, formatting, empty transfer, one grouped history with repeated Undo/Redo and preserved native table selection/DOM paint. Mounted and Chromium actual paste events exercise UI-to-native dispatch. All prior test files remain byte-identical.
    4. Restore vendor before five audits: writer resource generation --check, source-tree, source-provenance, inventory invariants and parity; repeat failed audits only. Preserve all247existing semantic states/defaults/classifications/exceptions and register new native single-paragraph reader module unverified with precise local/upstream/test references. Scope/old-test/changed-file/AP artifact checks, exact-SHA same-agent EVALUATOR phase before quality report, recorded verification and canonical finish, parent progress checkpoint; clean final tracked state. Broad goal remains active.
  Verification: "Command: Six declared statics; Result: pass after fixing one new-test unused parameter and using the existing HasBoxSelection native-mode API. Command: ONE upstream-absent full profile (test:static, app coverage with reportOnFailure, inventory coverage with reportOnFailure, two scripts suites, Chromium); Result: pass. Evidence:12113 app cases/305 files,109 inventory cases/36 files,5 script cases/2 files,118 Chromium cases with0 unexpected/0 flakes/0 skips. App and inventory lines/statements/functions/branches100%. Scope: all final production code,9new app cases and1new real Chromium paste scenario. No production changes after this profile, no successful test replays; vendor restored in finally. Command: Five restored-source resource/tree/provenance/invariants/parity audits; Result: pass, semanticViolationCount0. Evidence:398old test files and all247prior runtime records plus all prior provenance entries are value/byte-identical; new module remains unverified. Ignored-inclusive AP scan4138files/0forbidden. Exact-SHA evaluation and canonical finish pending."
  Rollback Plan: "Revert the scoped semantic commit without rewriting history; retain parent and task traceability."
  Findings: "Iteration150 verified native ring-based read for external single non-block non-list paragraph clipboard fragments into selected table cells. Pinned PasteData explicitly excludes table selection from pre-paste deletion; PasteFileContent passes actual GetCursor to SwReader, which loops each point. MakeBoxSels puts these points at each cell's last paragraph end. New shellio owner derives history targets from actual SwPaM ring points, clones explicit native fragment payloads via existing SwUndoInsert, preserves all existing content and native table selection, and groups one Paste undo unit. Shell dispatch bypasses old pasteWriterTransfer callback operations for this bounded path; browser/filter run parsing remains at the transfer boundary. No new UI TextRuns editing/context adapter. Tests prove selected middle-column cells/reverse endpoints, earlier paragraphs, empty target cells/empty fragment, cloned formatting, neighbor/structure identities, repeated Undo/Redo, mounted plain/inline HTML paste and real Chromium. The existing Sfx/native cursor restoration uses retained node identities; full native SwUndoInsDoc/history/reader/filter-default formatting and multiline/list/table/nested/merged/protected/redline behavior remain unverified. Conscious save/open/recovery deviations untouched. Initial static failures were an unused new-test parameter and a guessed IsTableMode method name; both corrected inside approved paths before the sole absent profile; passing static/test suites were not replayed. Broad goal remains active."
id_source: "generated"
---
## Summary

Iteration150 atomic native single-paragraph table clipboard read. Add source-owned filter/basflt/shellio.ts creating one native Sfx list action from actual editing SwPaM ring point positions, independent SwUndoInsert fragment payloads, no selected-content deletion, no cell joins, no UI TextRuns editing or callback paste operations. SwWrtShell.PasteAtCursor dispatches only actual table mode plus one non-block paragraph with no list to this native read owner. Preserve native displayed table selection and adjust endpoint positions across inserted text; one Undo/Redo restores content and table selection. Keep the existing transfer parsing boundary and all other paste routes. Test noncontiguous selected columns, reverse endpoints, multiple paragraphs already in target cells, empty targets/empty transfer, formatted fragments, neighbor/table/box identities, repeated Undo/Redo, real DOM/Chromium paste and selection painting. Single-paragraph fragment transfer only: native ASCII default formatting/filter provenance, multiline/list/structural transfer and full reader import/SwUndoInsDoc lifetimes remain unverified. Scope seven paths: apps/office/src/sw/source/filter/basflt/shellio.ts, apps/office/src/sw/source/uibase/wrtsh/wrtsh1.ts, apps/office/src/sw/source/uibase/wrtsh/native-table-paste.test.ts, apps/office/src/sw/browser/editor/native-table-paste.test.tsx, apps/office/e2e/writer-native-table-paste.spec.ts, docs/program/source-provenance.json, docs/program/parity/runtime-inventory.json. Preserve all247 existing semantic statuses/contracts/defaults/classifications/exceptions, append new source-owned module as unverified; preserve existing tests byte-identical. Standing user authorization applies. No upstream copies/AP helpers/raw outputs/Python/probes/network/outside/subagents; one absent full profile only.

## Scope

apps/office/src/sw/source/filter/basflt/shellio.ts
apps/office/src/sw/source/uibase/wrtsh/wrtsh1.ts
apps/office/src/sw/source/uibase/wrtsh/native-table-paste.test.ts
apps/office/src/sw/browser/editor/native-table-paste.test.tsx
apps/office/e2e/writer-native-table-paste.spec.ts
docs/program/source-provenance.json
docs/program/parity/runtime-inventory.json

## Plan

Iteration150 atomic native single-paragraph table clipboard read. Add source-owned filter/basflt/shellio.ts creating one native Sfx list action from actual editing SwPaM ring point positions, independent SwUndoInsert fragment payloads, no selected-content deletion, no cell joins, no UI TextRuns editing or callback paste operations. SwWrtShell.PasteAtCursor dispatches only actual table mode plus one non-block paragraph with no list to this native read owner. Preserve native displayed table selection and adjust endpoint positions across inserted text; one Undo/Redo restores content and table selection. Keep the existing transfer parsing boundary and all other paste routes. Test noncontiguous selected columns, reverse endpoints, multiple paragraphs already in target cells, empty targets/empty transfer, formatted fragments, neighbor/table/box identities, repeated Undo/Redo, real DOM/Chromium paste and selection painting. Single-paragraph fragment transfer only: native ASCII default formatting/filter provenance, multiline/list/structural transfer and full reader import/SwUndoInsDoc lifetimes remain unverified. Scope seven paths: apps/office/src/sw/source/filter/basflt/shellio.ts, apps/office/src/sw/source/uibase/wrtsh/wrtsh1.ts, apps/office/src/sw/source/uibase/wrtsh/native-table-paste.test.ts, apps/office/src/sw/browser/editor/native-table-paste.test.tsx, apps/office/e2e/writer-native-table-paste.spec.ts, docs/program/source-provenance.json, docs/program/parity/runtime-inventory.json. Preserve all247 existing semantic statuses/contracts/defaults/classifications/exceptions, append new source-owned module as unverified; preserve existing tests byte-identical. Standing user authorization applies. No upstream copies/AP helpers/raw outputs/Python/probes/network/outside/subagents; one absent full profile only.

## Verify Steps

1. Six statics first: npm run format:check; npm run lint; npm run typecheck; npm run check:dependencies; npm run check:docs; npm run check:file-size. Changed-file checks after fixes only.
2. ONE sequential full upstream-absent profile: npm run test:static; npm run test:coverage --workspace @vite-office/office -- --coverage.reportOnFailure; npm run test:inventory:coverage -- --coverage.reportOnFailure; npm exec -- vitest run scripts/check-source-provenance.test.ts scripts/writer-ui-resource-model.test.ts; npm exec -- playwright test --config apps/office/playwright.config.ts. Rename vendor inside repo and restore in finally; no upstream access/execution by tests. Persist exact failed/error names before assertions. Only failed gates/cases and genuinely new unexecuted cases repeat; no passing full/static/build/suite/case replay; actual maps ignored appcache only.
3. Source-independent tests prove native single-paragraph reader uses all actual table editing ring points without selected-content deletion or joining sections; single and noncontiguous/reverse selected cells, existing target paragraphs/empty cells, formatting, empty transfer, one grouped history with repeated Undo/Redo and preserved native table selection/DOM paint. Mounted and Chromium actual paste events exercise UI-to-native dispatch. All prior test files remain byte-identical.
4. Restore vendor before five audits: writer resource generation --check, source-tree, source-provenance, inventory invariants and parity; repeat failed audits only. Preserve all247existing semantic states/defaults/classifications/exceptions and register new native single-paragraph reader module unverified with precise local/upstream/test references. Scope/old-test/changed-file/AP artifact checks, exact-SHA same-agent EVALUATOR phase before quality report, recorded verification and canonical finish, parent progress checkpoint; clean final tracked state. Broad goal remains active.

## Verification

Command: Six declared statics; Result: pass after fixing one new-test unused parameter and using the existing HasBoxSelection native-mode API. Command: ONE upstream-absent full profile (test:static, app coverage with reportOnFailure, inventory coverage with reportOnFailure, two scripts suites, Chromium); Result: pass. Evidence:12113 app cases/305 files,109 inventory cases/36 files,5 script cases/2 files,118 Chromium cases with0 unexpected/0 flakes/0 skips. App and inventory lines/statements/functions/branches100%. Scope: all final production code,9new app cases and1new real Chromium paste scenario. No production changes after this profile, no successful test replays; vendor restored in finally. Command: Five restored-source resource/tree/provenance/invariants/parity audits; Result: pass, semanticViolationCount0. Evidence:398old test files and all247prior runtime records plus all prior provenance entries are value/byte-identical; new module remains unverified. Ignored-inclusive AP scan4138files/0forbidden. Exact-SHA evaluation and canonical finish pending.

## Rollback Plan

Revert the scoped semantic commit without rewriting history; retain parent and task traceability.

## Findings

Iteration150 verified native ring-based read for external single non-block non-list paragraph clipboard fragments into selected table cells. Pinned PasteData explicitly excludes table selection from pre-paste deletion; PasteFileContent passes actual GetCursor to SwReader, which loops each point. MakeBoxSels puts these points at each cell's last paragraph end. New shellio owner derives history targets from actual SwPaM ring points, clones explicit native fragment payloads via existing SwUndoInsert, preserves all existing content and native table selection, and groups one Paste undo unit. Shell dispatch bypasses old pasteWriterTransfer callback operations for this bounded path; browser/filter run parsing remains at the transfer boundary. No new UI TextRuns editing/context adapter. Tests prove selected middle-column cells/reverse endpoints, earlier paragraphs, empty target cells/empty fragment, cloned formatting, neighbor/structure identities, repeated Undo/Redo, mounted plain/inline HTML paste and real Chromium. The existing Sfx/native cursor restoration uses retained node identities; full native SwUndoInsDoc/history/reader/filter-default formatting and multiline/list/table/nested/merged/protected/redline behavior remain unverified. Conscious save/open/recovery deviations untouched. Initial static failures were an unused new-test parameter and a guessed IsTableMode method name; both corrected inside approved paths before the sole absent profile; passing static/test suites were not replayed. Broad goal remains active.
