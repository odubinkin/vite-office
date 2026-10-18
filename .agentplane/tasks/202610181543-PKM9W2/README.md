---
id: "202610181543-PKM9W2"
title: "Integrate writer and calc and synchronize all branches"
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
  updated_at: "2026-10-18T15:43:32.003Z"
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
    body: "Start: execute user-approved writer/calc integration, complete full checks and synchronize the three clean project clones."
events:
  -
    type: "status"
    at: "2026-10-18T15:43:32.547Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: execute user-approved writer/calc integration, complete full checks and synchronize the three clean project clones."
doc_version: 3
doc_updated_at: "2026-10-18T15:48:18.778Z"
doc_updated_by: "CODER"
description: "User-approved integration across vite-office, vite-office-writer and vite-office-calc: push source branches, merge into main, run full verification and fix discovered failures, publish main, back-merge and publish writer/calc, leave all checkouts clean on their requested branches."
sections:
  Summary: |-
    Integrate writer and calc and synchronize all branches

    User-approved integration across vite-office, vite-office-writer and vite-office-calc: push source branches, merge into main, run full verification and fix discovered failures, publish main, back-merge and publish writer/calc, leave all checkouts clean on their requested branches.
  Scope: "Three explicitly authorized project clones and their main/writer/calc branches, integration fixes/tests, task evidence and remote synchronization. No force pushes or destructive history edits."
  Plan: "Push writer/calc source branches; fetch and merge both into main without rewriting history; resolve conflicts and verification failures with regression tests where needed; run npm run verify, ap doctor and routing validation; record and close task; push main; fetch/back-merge main into writer and calc, push both and verify clean matching remote heads."
  Verify Steps: "Run npm run verify (all formatting, lint, types, boundaries, resources, tooling/unit/coverage/inventory, browser, static, documentation, provenance and parity checks); ap doctor; node .agentplane/policy/check-routing.mjs. Verify main contains original writer/calc tips. Verify each final branch equals its origin ref and contains final main; git status --short --untracked-files=all must be empty in all three clones."
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Preserve original tips main/writer eb7c59194 and calc 991d954b3 in task evidence. If needed, revert integration/fix commits through a separately approved task; never force push or reset user work."
  Findings: "Initial tips: main/writer eb7c59194; calc 991d954b3 (391 unpublished commits). Writer push was already up to date; calc pushed successfully over explicit HTTPS because the two development clones use SSH origin URLs without an accepted SSH key. No credential or remote configuration changes were made. Content merge had no conflicts; merge commit 084b91ec5 retains both parents. Initial npm run verify stopped on six Prettier formatting failures; all six files received formatting-only corrections, with parsed JSON equality checked. Remaining verify stages are executed individually with complete logs under ignored output/playwright/PKM9W2 so one failure cannot hide subsequent checks. Targeted incident advice was reviewed; the earlier format-parent fixture incidents do not apply to this integration."
id_source: "generated"
---
## Summary

Integrate writer and calc and synchronize all branches

User-approved integration across vite-office, vite-office-writer and vite-office-calc: push source branches, merge into main, run full verification and fix discovered failures, publish main, back-merge and publish writer/calc, leave all checkouts clean on their requested branches.

## Scope

Three explicitly authorized project clones and their main/writer/calc branches, integration fixes/tests, task evidence and remote synchronization. No force pushes or destructive history edits.

## Plan

Push writer/calc source branches; fetch and merge both into main without rewriting history; resolve conflicts and verification failures with regression tests where needed; run npm run verify, ap doctor and routing validation; record and close task; push main; fetch/back-merge main into writer and calc, push both and verify clean matching remote heads.

## Verify Steps

Run npm run verify (all formatting, lint, types, boundaries, resources, tooling/unit/coverage/inventory, browser, static, documentation, provenance and parity checks); ap doctor; node .agentplane/policy/check-routing.mjs. Verify main contains original writer/calc tips. Verify each final branch equals its origin ref and contains final main; git status --short --untracked-files=all must be empty in all three clones.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Preserve original tips main/writer eb7c59194 and calc 991d954b3 in task evidence. If needed, revert integration/fix commits through a separately approved task; never force push or reset user work.

## Findings

Initial tips: main/writer eb7c59194; calc 991d954b3 (391 unpublished commits). Writer push was already up to date; calc pushed successfully over explicit HTTPS because the two development clones use SSH origin URLs without an accepted SSH key. No credential or remote configuration changes were made. Content merge had no conflicts; merge commit 084b91ec5 retains both parents. Initial npm run verify stopped on six Prettier formatting failures; all six files received formatting-only corrections, with parsed JSON equality checked. Remaining verify stages are executed individually with complete logs under ignored output/playwright/PKM9W2 so one failure cannot hide subsequent checks. Targeted incident advice was reviewed; the earlier format-parent fixture incidents do not apply to this integration.
