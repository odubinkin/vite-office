---
id: "202610241717-VBNV75"
title: "Canonize Writer formatting dialog keyboard and focus lifetime"
status: "DOING"
priority: "high"
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
  updated_at: "2026-10-24T17:18:35.977Z"
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
    body: "Start: canonize native formatting dialog keyboard/tab/focus lifetime through actual requests;close second task then pause goal."
events:
  -
    type: "status"
    at: "2026-10-24T17:18:41.985Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: canonize native formatting dialog keyboard/tab/focus lifetime through actual requests;close second task then pause goal."
doc_version: 3
doc_updated_at: "2026-10-24T17:18:41.985Z"
doc_updated_by: "CODER"
description: "Second and last of exactly two tasks after J1K3KF. Connect consumed native tab navigation and formatting dialog keyboard/focus behavior for Paragraph,Page Style and Insert Break. Preserve tab deactivation/drafts and real request identity;remove Paragraph backdrop cancellation,add Escape/Enter where missing,return focus to actual frame. Only writer checkout/branch,up to24primary paths plus paired records. No new formatting/core features,network or full suite. Task7after checkpoint. Close this task then pause goal."
sections:
  Summary: "Canonize represented formatting dialog keyboard,tab and focus lifetime through actual Writer requests."
  Scope: "Only writer checkout/branch;up to24primary paths plus paired records. Paragraph,Page Style,Insert Break keyboard/focus and consumed tab navigation only;no new formatting/kernel features or full native widget system,network or full suite. Second and last task;pause goal after closure."
  Plan: "Extract native TabControl key-direction decisions from tabctrl.cxx with wraparound using actual tabs. Wire Paragraph tab roving focus/ARIA identity,Left/Right and primary-modifier Tab/PageUp/PageDown navigation before metric spin keys,retaining original tab deactivation and drafts. Use a real Paragraph form for default Enter acceptance;Escape cancels and backdrop clicks retain request. Focus mounted controls on opening Page Style/Insert Break and add missing Escape. Complete/cancel original keyed requests then return focus through actual frame port. Verify source decisions,dialog/view tests and production Chromium1280/390 with history/ODT/draft retention;update records,verify,evaluate,close and pause goal."
  Verify Steps: "Focused Vitest source tab navigation strict100coverage plus Paragraph,Page Style,Insert Break,actual view/entrypoints/tab-session tests;exercise new owner paths without ignores/threshold reduction. Cover native shortcut directions/wrap,unhandled keys,Shift+PageDown asymmetry,roving tab focus/ARIA,mounted instance focus,CtrlPageDown from metric without metric mutation,retained native tab changes,Enter accept,Escape cancel,backdrop persistence and actual document focus after each request. Build and production Chromium1280/390 keyboard/model/history/ODT flows,screenshot inspection,no page errors. Typecheck,scoped lint/format,docs,deps,size,tree,provenance,resources,registry build/invariants/parity,static,doctor,routing,diff,clean state. Task7after checkpoint;no full suite due. Evaluator pass,finish second task,pause goal."
  Verification: "Pending implementation and focused proof."
  Rollback Plan: "Revert only this task commits;preserve first task and prior work."
  Findings: "Pinned TabControl uses Left/Right plus Mod1 Tab/PageUp/PageDown and wraps actual pages. Mod1+Shift+PageDown is unhandled. Existing Paragraph does not use native form/default acceptance or roving tab focus and cancels on backdrop mouse-down;Page Style lacks Escape/initial focus;Break lacks initial focus. Full modal/widget services remain unrepresented."
id_source: "generated"
---
## Summary

Canonize represented formatting dialog keyboard,tab and focus lifetime through actual Writer requests.

## Scope

Only writer checkout/branch;up to24primary paths plus paired records. Paragraph,Page Style,Insert Break keyboard/focus and consumed tab navigation only;no new formatting/kernel features or full native widget system,network or full suite. Second and last task;pause goal after closure.

## Plan

Extract native TabControl key-direction decisions from tabctrl.cxx with wraparound using actual tabs. Wire Paragraph tab roving focus/ARIA identity,Left/Right and primary-modifier Tab/PageUp/PageDown navigation before metric spin keys,retaining original tab deactivation and drafts. Use a real Paragraph form for default Enter acceptance;Escape cancels and backdrop clicks retain request. Focus mounted controls on opening Page Style/Insert Break and add missing Escape. Complete/cancel original keyed requests then return focus through actual frame port. Verify source decisions,dialog/view tests and production Chromium1280/390 with history/ODT/draft retention;update records,verify,evaluate,close and pause goal.

## Verify Steps

Focused Vitest source tab navigation strict100coverage plus Paragraph,Page Style,Insert Break,actual view/entrypoints/tab-session tests;exercise new owner paths without ignores/threshold reduction. Cover native shortcut directions/wrap,unhandled keys,Shift+PageDown asymmetry,roving tab focus/ARIA,mounted instance focus,CtrlPageDown from metric without metric mutation,retained native tab changes,Enter accept,Escape cancel,backdrop persistence and actual document focus after each request. Build and production Chromium1280/390 keyboard/model/history/ODT flows,screenshot inspection,no page errors. Typecheck,scoped lint/format,docs,deps,size,tree,provenance,resources,registry build/invariants/parity,static,doctor,routing,diff,clean state. Task7after checkpoint;no full suite due. Evaluator pass,finish second task,pause goal.

## Verification

Pending implementation and focused proof.

## Rollback Plan

Revert only this task commits;preserve first task and prior work.

## Findings

Pinned TabControl uses Left/Right plus Mod1 Tab/PageUp/PageDown and wraps actual pages. Mod1+Shift+PageDown is unhandled. Existing Paragraph does not use native form/default acceptance or roving tab focus and cancels on backdrop mouse-down;Page Style lacks Escape/initial focus;Break lacks initial focus. Full modal/widget services remain unrepresented.
