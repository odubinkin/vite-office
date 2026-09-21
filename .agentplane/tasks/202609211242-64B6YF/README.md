---
id: "202609211242-64B6YF"
title: "Fix remaining Writer P0 parity gaps"
status: "DOING"
priority: "high"
owner: "CODER"
revision: 11
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
  - "frontend"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-09-21T12:42:38.502Z"
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
    at: "2026-09-21T12:42:59.205Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: continue direct-mode task in current checkout."
doc_version: 3
doc_updated_at: "2026-09-21T13:08:48.486Z"
doc_updated_by: "CODER"
description: "Complete P0-3 through P0-5 remediation found by audit: keep browser projection identities outside sw/source, remove WriterTextRun from canonical mutation paths, and make every exposed paragraph style match supported pinned defaults or remain unavailable. P0-1 stays unchanged."
sections:
  Summary: "Complete the audited Writer P0-3 through P0-5 gaps while preserving the intentionally unchanged P0-1 inventory model."
  Scope: "In scope: move browser selection/projection DTO ownership and paragraph-id resolution out of sw/source; make SwTextNode formatting, hyperlink, and insertion paths operate directly on SwpHints/SwTextAttr/SfxItemSet; retain WriterTextRun only at browser/filter/transfer boundaries; correct or unexpose every currently available built-in paragraph style against the pinned LibreOffice defaults; add focused architectural and exhaustive style tests. Out of scope: P0-1 inventory mechanics, P1/P2 restructuring beyond the minimum dependency-boundary move, persisted schema changes, networking, publication, and unrelated cleanup."
  Plan: "Implement the approved five-step P0-3 through P0-5 remediation and verification plan recorded in the task README, with P0-1 explicitly unchanged."
  Verify Steps: |-
    1. Run focused Sfx/Writer tests proving sw/source has no imports from sw/browser and browser paragraph IDs are converted to SwPosition/SwPaM before SwView/SwWrtShell calls.
    2. Run focused text/hint/undo tests proving insert, direct formatting, font changes, and hyperlinks mutate text plus SwpHints/SfxItemSet without WriterTextRun in core mutation implementations or undo construction.
    3. Run exhaustive style tests over WRITER_AVAILABLE_PARAGRAPH_STYLE_POOL proving each available style has its source-derived supported defaults and that unsupported styles are absent from commands/toolbars.
    4. Run npm run format:check, npm run lint, npm run typecheck, npm run check:dependencies, npm run check:source-tree, and npm run check:source-provenance.
    5. Run npm run test:coverage, npm run test:inventory:coverage, npm run test:e2e, and npm run verify.
    6. Run ap doctor and node .agentplane/policy/check-routing.mjs.
    7. Inspect git diff and git status --short --untracked-files=all; only intentional P0-3 through P0-5 files and task artifacts may change, with P0-1 mechanics untouched.
  Verification: "PASS: npm run verify (349 application tests with 100% coverage; 95 inventory tests with 100% coverage; 11 Playwright e2e tests; build/static/JSDoc/file-size/source-tree/source-provenance/invariants/parity all passed). PASS: focused Writer suite (53 tests before final additions), check:dependencies (140 runtime sources, 476 imports, 12 allowed cross-module edges), ap doctor, policy routing, git diff --check, and architecture rg checks."
  Rollback Plan: "Revert the implementation commit and deterministic AgentPlane close commit; no storage migration or external state is involved."
  Findings: "P0-3: browser paragraph-id resolution now lives in the browser projection adapter and sw/source is protected from sw/browser imports. P0-4: insertion, formatting, font, hyperlink, and undo paths now use native SwpHints/SwTextAttr/SfxItemSet fragments; obsolete run-based mutation helpers were removed while boundary projections remain. P0-5: HTML list-heading is unavailable until defaults exist, comment defaults match the pinned source-derived values, and the complete exposed style set is tested. P0-1 inventory mechanics remain unchanged; only stale runtime-inventory entries for removed exports were deleted."
id_source: "generated"
---
## Summary

Complete the audited Writer P0-3 through P0-5 gaps while preserving the intentionally unchanged P0-1 inventory model.

## Scope

In scope: move browser selection/projection DTO ownership and paragraph-id resolution out of sw/source; make SwTextNode formatting, hyperlink, and insertion paths operate directly on SwpHints/SwTextAttr/SfxItemSet; retain WriterTextRun only at browser/filter/transfer boundaries; correct or unexpose every currently available built-in paragraph style against the pinned LibreOffice defaults; add focused architectural and exhaustive style tests. Out of scope: P0-1 inventory mechanics, P1/P2 restructuring beyond the minimum dependency-boundary move, persisted schema changes, networking, publication, and unrelated cleanup.

## Plan

Implement the approved five-step P0-3 through P0-5 remediation and verification plan recorded in the task README, with P0-1 explicitly unchanged.

## Verify Steps

1. Run focused Sfx/Writer tests proving sw/source has no imports from sw/browser and browser paragraph IDs are converted to SwPosition/SwPaM before SwView/SwWrtShell calls.
2. Run focused text/hint/undo tests proving insert, direct formatting, font changes, and hyperlinks mutate text plus SwpHints/SfxItemSet without WriterTextRun in core mutation implementations or undo construction.
3. Run exhaustive style tests over WRITER_AVAILABLE_PARAGRAPH_STYLE_POOL proving each available style has its source-derived supported defaults and that unsupported styles are absent from commands/toolbars.
4. Run npm run format:check, npm run lint, npm run typecheck, npm run check:dependencies, npm run check:source-tree, and npm run check:source-provenance.
5. Run npm run test:coverage, npm run test:inventory:coverage, npm run test:e2e, and npm run verify.
6. Run ap doctor and node .agentplane/policy/check-routing.mjs.
7. Inspect git diff and git status --short --untracked-files=all; only intentional P0-3 through P0-5 files and task artifacts may change, with P0-1 mechanics untouched.

## Verification

PASS: npm run verify (349 application tests with 100% coverage; 95 inventory tests with 100% coverage; 11 Playwright e2e tests; build/static/JSDoc/file-size/source-tree/source-provenance/invariants/parity all passed). PASS: focused Writer suite (53 tests before final additions), check:dependencies (140 runtime sources, 476 imports, 12 allowed cross-module edges), ap doctor, policy routing, git diff --check, and architecture rg checks.

## Rollback Plan

Revert the implementation commit and deterministic AgentPlane close commit; no storage migration or external state is involved.

## Findings

P0-3: browser paragraph-id resolution now lives in the browser projection adapter and sw/source is protected from sw/browser imports. P0-4: insertion, formatting, font, hyperlink, and undo paths now use native SwpHints/SwTextAttr/SfxItemSet fragments; obsolete run-based mutation helpers were removed while boundary projections remain. P0-5: HTML list-heading is unavailable until defaults exist, comment defaults match the pinned source-derived values, and the complete exposed style set is tested. P0-1 inventory mechanics remain unchanged; only stale runtime-inventory entries for removed exports were deleted.
