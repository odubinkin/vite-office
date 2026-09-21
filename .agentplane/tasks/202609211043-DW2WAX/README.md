---
id: "202609211043-DW2WAX"
title: "Implement Writer P0 upstream parity"
status: "DOING"
priority: "high"
owner: "CODER"
revision: 10
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
  - "frontend"
task_kind: "code"
mutation_scope: "code"
blueprint_request: "code.direct"
verify:
  - "ap doctor"
  - "node .agentplane/policy/check-routing.mjs"
  - "npm run check:dependencies"
  - "npm run check:source-provenance"
  - "npm run check:source-tree"
  - "npm run inventory:parity"
  - "npm run lint"
  - "npm run test:coverage"
  - "npm run test:e2e"
  - "npm run test:inventory:coverage"
  - "npm run typecheck"
  - "npm run verify"
plan_approval:
  state: "approved"
  updated_at: "2026-09-21T10:43:50.058Z"
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
    body: "Start: implement approved Writer P0 parity scope from pinned LibreOffice, preserving the current inventory model and validating all architectural boundaries."
events:
  -
    type: "status"
    at: "2026-09-21T10:43:56.968Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implement approved Writer P0 parity scope from pinned LibreOffice, preserving the current inventory model and validating all architectural boundaries."
doc_version: 3
doc_updated_at: "2026-09-21T10:43:56.968Z"
doc_updated_by: "CODER"
description: "Implement P0-2 through P0-5 from docs/program/vite-office-upstream-parity-plan.md; retain the existing P0-1 inventory model while making records detailed and correct; preserve pinned LibreOffice ownership, contracts, defaults, and file structure; do not support legacy persisted document schemas."
sections:
  Summary: "Implement the supported Writer P0 parity slice against pinned LibreOffice 26.8.0.2: restore Sfx ownership, canonical Writer positions and text attributes, source-derived paragraph-style defaults, and truthful detailed inventory records without changing the inventory model."
  Scope: "In scope: P0-2 through P0-5 in docs/program/vite-office-upstream-parity-plan.md; existing P0-1 inventory schema and behavior remain fixed while records and evidence are corrected. Primary paths: apps/office/src/{sfx2,framework,sw,editeng,svl}, related scripts and docs/program/parity data, and focused tests. No compatibility layer for older stored document models. Out of scope: P1/P2, unimplemented office modules, broad inventory redesign, and unrelated UI features."
  Plan: "1. Move Sfx dispatcher, shell, slot and view-frame ownership into upstream-shaped sfx2 modules; retain a framework provider facade. 2. Replace shell-facing paragraph IDs and browser input strings with SwPosition/SwPaM and Writer operations; translate DOM concerns in sw/browser/editor. 3. Make text plus SwpHints/SwTextAttr/SfxItemSet canonical and keep runs as derived boundary projections. 4. Port source-derived defaults and inheritance for implemented paragraph styles and remove semantic style-by-slug CSS. 5. Correct inventory/provenance records within the existing schema. 6. Add focused contract, mutation, projection, style-default, architecture, and inventory tests. 7. Run the full declared verification suite, commit, record Agentplane verification, finish, and push origin/main."
  Verify Steps: |-
    1. Run `npm run typecheck`; all TypeScript projects must pass after the ownership and model changes.
    2. Run `npm run lint`; no lint or JSDoc violations may remain.
    3. Run focused Vitest suites for Sfx dispatch/bindings/view frame, Writer selection/input translation, hints/run projection, and style defaults; tests must cover shell priority, disabled slots, request arguments, SwPosition/SwPaM conversion, browser-boundary termination, derived runs, inheritance, Western/CJK/CTL defaults, and UI projection.
    4. Run `npm run test:coverage` and `npm run test:inventory:coverage`; both coverage gates must pass.
    5. Run `npm run check:dependencies`, `npm run check:source-tree`, and `npm run check:source-provenance`; framework/Sfx and browser/Writer ownership rules and pinned-source mappings must pass.
    6. Run `npm run inventory:parity`; existing inventory schema must validate and detailed records must not overclaim unsupported behavior.
    7. Run `npm run test:e2e`; supported Writer editing, selection, formatting, lists, hyperlinks, clipboard, and ODT behavior must remain intact.
    8. Run `npm run verify`; the complete repository verification pipeline must pass.
    9. Run `ap doctor` and `node .agentplane/policy/check-routing.mjs`; Agentplane health and routing policy must pass.
    10. Inspect `git diff`, the pinned upstream anchors, and final `git status --short --untracked-files=all`; only intentional task files may remain and no secret or generated junk may be committed.
  Verification: "Pending implementation. Record exact commands, pass/fail results, concise evidence, and covered scope before task closure."
  Rollback Plan: "Revert the task implementation and deterministic Agentplane close commits. The change deliberately provides no compatibility migration for prior stored document schema versions."
  Findings: "No implementation findings yet. Material expansion into P1/P2, more than the approved architectural surface, or a changed verification contract requires re-approval."
id_source: "generated"
---
## Summary

Implement the supported Writer P0 parity slice against pinned LibreOffice 26.8.0.2: restore Sfx ownership, canonical Writer positions and text attributes, source-derived paragraph-style defaults, and truthful detailed inventory records without changing the inventory model.

## Scope

In scope: P0-2 through P0-5 in docs/program/vite-office-upstream-parity-plan.md; existing P0-1 inventory schema and behavior remain fixed while records and evidence are corrected. Primary paths: apps/office/src/{sfx2,framework,sw,editeng,svl}, related scripts and docs/program/parity data, and focused tests. No compatibility layer for older stored document models. Out of scope: P1/P2, unimplemented office modules, broad inventory redesign, and unrelated UI features.

## Plan

1. Move Sfx dispatcher, shell, slot and view-frame ownership into upstream-shaped sfx2 modules; retain a framework provider facade. 2. Replace shell-facing paragraph IDs and browser input strings with SwPosition/SwPaM and Writer operations; translate DOM concerns in sw/browser/editor. 3. Make text plus SwpHints/SwTextAttr/SfxItemSet canonical and keep runs as derived boundary projections. 4. Port source-derived defaults and inheritance for implemented paragraph styles and remove semantic style-by-slug CSS. 5. Correct inventory/provenance records within the existing schema. 6. Add focused contract, mutation, projection, style-default, architecture, and inventory tests. 7. Run the full declared verification suite, commit, record Agentplane verification, finish, and push origin/main.

## Verify Steps

1. Run `npm run typecheck`; all TypeScript projects must pass after the ownership and model changes.
2. Run `npm run lint`; no lint or JSDoc violations may remain.
3. Run focused Vitest suites for Sfx dispatch/bindings/view frame, Writer selection/input translation, hints/run projection, and style defaults; tests must cover shell priority, disabled slots, request arguments, SwPosition/SwPaM conversion, browser-boundary termination, derived runs, inheritance, Western/CJK/CTL defaults, and UI projection.
4. Run `npm run test:coverage` and `npm run test:inventory:coverage`; both coverage gates must pass.
5. Run `npm run check:dependencies`, `npm run check:source-tree`, and `npm run check:source-provenance`; framework/Sfx and browser/Writer ownership rules and pinned-source mappings must pass.
6. Run `npm run inventory:parity`; existing inventory schema must validate and detailed records must not overclaim unsupported behavior.
7. Run `npm run test:e2e`; supported Writer editing, selection, formatting, lists, hyperlinks, clipboard, and ODT behavior must remain intact.
8. Run `npm run verify`; the complete repository verification pipeline must pass.
9. Run `ap doctor` and `node .agentplane/policy/check-routing.mjs`; Agentplane health and routing policy must pass.
10. Inspect `git diff`, the pinned upstream anchors, and final `git status --short --untracked-files=all`; only intentional task files may remain and no secret or generated junk may be committed.

## Verification

Pending implementation. Record exact commands, pass/fail results, concise evidence, and covered scope before task closure.

## Rollback Plan

Revert the task implementation and deterministic Agentplane close commits. The change deliberately provides no compatibility migration for prior stored document schema versions.

## Findings

No implementation findings yet. Material expansion into P1/P2, more than the approved architectural surface, or a changed verification contract requires re-approval.
