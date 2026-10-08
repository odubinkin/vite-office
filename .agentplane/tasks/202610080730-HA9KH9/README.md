---
id: "202610080730-HA9KH9"
title: "Keep Writer dialog chrome fixed with independent content scrolling"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 10
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-08T07:31:10.582Z"
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
    body: "Start: implement approved stationary modal chrome and independent visible body and navigation scrolling."
events:
  -
    type: "status"
    at: "2026-10-08T07:31:15.587Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implement approved stationary modal chrome and independent visible body and navigation scrolling."
doc_version: 3
doc_updated_at: "2026-10-08T07:31:15.587Z"
doc_updated_by: "CODER"
description: "Follow-up to shared Writer modal styling: keep title/close and action bars visible, independently scroll content and tab navigation, expose visible scrollbars, and verify actual responsive geometry without changing dialog behavior."
sections:
  Summary: "Keep Writer dialog headings, close controls and action bars stationary while only the body scrolls. Keep tab navigation independent from tab-page scrolling with visible scroll affordances."
  Scope: "Shared Writer modal CSS and header; WriterFileDialog, WriterNameCollisionPanel and rename collision integration where nested forms require explicit layout; Paragraph and Table Properties navigation/page containers; existing dialog geometry tests and focused scroll regression coverage. Preserve command, validation, persistence and responsive behavior. No network, outside-repository access, dependencies or unrelated task changes."
  Plan: "1. Constrain modal to a non-scrolling flex column with fixed header/footer and visible body scrollbars. 2. Isolate tab navigation and tab pages, retaining independent responsive scrolling. 3. Adapt nested file/collision surfaces without behavior changes. 4. Add browser scroll regressions, execute declared checks, record evidence and close with intentional commits."
  Verify Steps: "Run npm run typecheck, npm run build, npm run check:docs, npm run check:dependencies, npm run check:file-size, npm run check:source-tree and npm run check:source-provenance. Run changed-file ESLint and Prettier checks, git diff --check, focused component tests and writer-dialog-layout.spec.ts plus row-height, hyperlinks and responsive-sidebar e2e regressions. Extend browser geometry coverage at 1280x800, 390x600 and 640x360 to verify unchanged header/footer/tablist bounds while content scrollTop changes; independently overflow a tablist in a controlled test fixture and verify its own scrolling; assert visible scrollbar track/thumb styling and keyboard reachability. Inspect representative tall-dialog screenshots. Run ap doctor and node .agentplane/policy/check-routing.mjs; record results and final clean git status."
  Verification: "Pending implementation and verification."
  Rollback Plan: "Revert only this task implementation commit using a separately approved rollback if necessary; leave prior dialog styling and unrelated task artifacts unchanged."
  Findings: "Initial inspection: overflow:auto on the entire modal panel causes heading/footer movement. Paragraph and Table Properties navigation lives inside that scrolling body. Nested File/Name Collision forms need constrained flex wrappers; native dialog callbacks remain unchanged."
id_source: "generated"
---
## Summary

Keep Writer dialog headings, close controls and action bars stationary while only the body scrolls. Keep tab navigation independent from tab-page scrolling with visible scroll affordances.

## Scope

Shared Writer modal CSS and header; WriterFileDialog, WriterNameCollisionPanel and rename collision integration where nested forms require explicit layout; Paragraph and Table Properties navigation/page containers; existing dialog geometry tests and focused scroll regression coverage. Preserve command, validation, persistence and responsive behavior. No network, outside-repository access, dependencies or unrelated task changes.

## Plan

1. Constrain modal to a non-scrolling flex column with fixed header/footer and visible body scrollbars. 2. Isolate tab navigation and tab pages, retaining independent responsive scrolling. 3. Adapt nested file/collision surfaces without behavior changes. 4. Add browser scroll regressions, execute declared checks, record evidence and close with intentional commits.

## Verify Steps

Run npm run typecheck, npm run build, npm run check:docs, npm run check:dependencies, npm run check:file-size, npm run check:source-tree and npm run check:source-provenance. Run changed-file ESLint and Prettier checks, git diff --check, focused component tests and writer-dialog-layout.spec.ts plus row-height, hyperlinks and responsive-sidebar e2e regressions. Extend browser geometry coverage at 1280x800, 390x600 and 640x360 to verify unchanged header/footer/tablist bounds while content scrollTop changes; independently overflow a tablist in a controlled test fixture and verify its own scrolling; assert visible scrollbar track/thumb styling and keyboard reachability. Inspect representative tall-dialog screenshots. Run ap doctor and node .agentplane/policy/check-routing.mjs; record results and final clean git status.

## Verification

Pending implementation and verification.

## Rollback Plan

Revert only this task implementation commit using a separately approved rollback if necessary; leave prior dialog styling and unrelated task artifacts unchanged.

## Findings

Initial inspection: overflow:auto on the entire modal panel causes heading/footer movement. Paragraph and Table Properties navigation lives inside that scrolling body. Nested File/Name Collision forms need constrained flex wrappers; native dialog callbacks remain unchanged.
