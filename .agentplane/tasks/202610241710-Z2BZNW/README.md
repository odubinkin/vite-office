---
id: "202610241710-Z2BZNW"
title: "Canonize Writer paragraph split widow and orphan controls"
status: "DOING"
priority: "high"
owner: "CODER"
revision: 12
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-24T17:11:10.347Z"
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
    body: "Start: connect source paragraph split/widow/orphan controls to actual existing attributes;verify and close first of two tasks."
events:
  -
    type: "status"
    at: "2026-10-24T17:11:14.781Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: connect source paragraph split/widow/orphan controls to actual existing attributes;verify and close first of two tasks."
doc_version: 3
doc_updated_at: "2026-10-24T17:16:05.719Z"
doc_updated_by: "CODER"
description: "First of exactly two tasks after J1K3KF. Connect existing keepTogether/widow/orphan core attributes through consumed native SvxExtParagraphTabPage control rules,source numeric bounds,checkboxes,handler-order sensitivity and changed-output semantics. Only writer checkout/branch,up to24primary implementation/test/doc paths plus paired records. No mixed/HTML/full textflow service port,network,other task or full suite. Task6after checkpoint. Close first task then execute one keyboard/dialog-focus task and pause goal."
sections:
  Summary: "Connect native represented paragraph split/widow/orphan control contracts to existing Writer core attributes."
  Scope: "Only writer checkout/branch;up to24primary paths plus paired canonical/task/generated records. Consumed definite-state paragraph options only;no mixed/HTML/hyphenation/break-controller expansion,network or full suite. First of two tasks;one keyboard/focus task follows then pause goal."
  Plan: "Extract consumed SvxExtParagraphTabPage reset/AllowSplit/Widow/Orphan and changed-output decisions at native source owner. Keep source handler-order asymmetry and widget1..9bounds;checkboxes encode zero disabled values without destroying inactive numeric drafts. Introduce a bounded presentation component and wire into actual paragraph dialog request without mirrored document state. Preserve unchanged output and existing core/undo/ODT owners. Test direct decisions,UI,actual command/history/ODT and Chromium1280/390;document source suspicion,update provenance,verify,evaluate,commit and close."
  Verify Steps: "Focused Vitest for new source/control owners with strict100coverage,no ignores or threshold reductions;existing Paragraph dialog,advanced controls,toolbar/core/filter consumers. Cover initial0/nonzero,reset order,AllowSplit checkbox sensitivity versus row sensitivity,asymmetric off-handlers,1..9bounds,unchanged output,inactive numeric retention,zero checkbox encoding,real undo/redo/ODT. Production build and Chromium1280/390 actual UI/model/filter flow,screenshot inspection and no page errors. Run typecheck,scoped lint/format,docs,deps,size,tree,provenance,resources,registry build/invariants/parity,static,doctor,routing,diff and clean state. Task6after checkpoint;no full suite due. Evaluator pass,close first task then execute exactly one keyboard/focus task and pause goal."
  Verification: "Command: focused Vitest source paragrph,split-controls,Paragraph dialog,advanced controls and actual toolbar with coverage (Z2BZNW-coverage.log). Result:14cases/5files pass;strict2owner100coverage S53/B48/F14/L46,zero skips/no ignores or thresholds changed. Scope: source Reset/handler order,sensitivity asymmetry,1..9numeric bounds,zero checkbox encoding,retained inactive numbers,unchanged output and actual controller integration. Command:npm run test:writer -- src/sw/source/core/doc/writer-attributes.test.ts src/sw/source/core/undo/undobj.test.ts src/sw/source/filter/xml/odt-filter-service.test.ts src/sw/browser/presentation/WriterPageLayout.test.tsx. Result:52cases/4files pass,Z2BZNW-consumers.log. Scope: core/history/layout/filter. Command:npm run build;playwright test --config apps/office/playwright.config.ts --project=writer apps/office/e2e/writer-paragraph-split-controls.spec.ts. Result:2production Chromium cases1280/390 pass,Z2BZNW-build.log/Z2BZNW-e2e.log;no page errors,inspected both screenshots. Scope: actual Format command,cancel,undo/redo,ODT export/reopen. Command:15static/source gate argv in Z2BZNW-gates.json. Result:14initial passes;format second pass corrected in Z2BZNW-format-fixed.log. Registry build,scope lint/type/docs/deps/size/tree/provenance/resources/invariants/parity/static/doctor/routing/diff pass. Task6after checkpoint,no full suite due. Close first task then exactly one keyboard/focus task remains before pause."
  Rollback Plan: "Revert only task commits;retain earlier work and other tasks."
  Findings: "Source definite-state handler order and changed-output behavior preserved without a second document model;old inverse checkbox labels were migrated to native Allow to split paragraph while core expectations remain unchanged. WRITER090 documents source asymmetric off-handler sensitivity and numeric rows remaining sensitive when split checkboxes disable. Strict100new-owner coverage,actual kernel/history/ODT and production browser evidence pass. Initial new browser test formatting needed a second formatting pass;final scoped check passed. Full mixed/HTML and other textflow services remain outside this leaf;no broad parity promotion,network or full suite. First of two requested tasks;one formatting keyboard/focus task follows."
id_source: "generated"
---
## Summary

Connect native represented paragraph split/widow/orphan control contracts to existing Writer core attributes.

## Scope

Only writer checkout/branch;up to24primary paths plus paired canonical/task/generated records. Consumed definite-state paragraph options only;no mixed/HTML/hyphenation/break-controller expansion,network or full suite. First of two tasks;one keyboard/focus task follows then pause goal.

## Plan

Extract consumed SvxExtParagraphTabPage reset/AllowSplit/Widow/Orphan and changed-output decisions at native source owner. Keep source handler-order asymmetry and widget1..9bounds;checkboxes encode zero disabled values without destroying inactive numeric drafts. Introduce a bounded presentation component and wire into actual paragraph dialog request without mirrored document state. Preserve unchanged output and existing core/undo/ODT owners. Test direct decisions,UI,actual command/history/ODT and Chromium1280/390;document source suspicion,update provenance,verify,evaluate,commit and close.

## Verify Steps

Focused Vitest for new source/control owners with strict100coverage,no ignores or threshold reductions;existing Paragraph dialog,advanced controls,toolbar/core/filter consumers. Cover initial0/nonzero,reset order,AllowSplit checkbox sensitivity versus row sensitivity,asymmetric off-handlers,1..9bounds,unchanged output,inactive numeric retention,zero checkbox encoding,real undo/redo/ODT. Production build and Chromium1280/390 actual UI/model/filter flow,screenshot inspection and no page errors. Run typecheck,scoped lint/format,docs,deps,size,tree,provenance,resources,registry build/invariants/parity,static,doctor,routing,diff and clean state. Task6after checkpoint;no full suite due. Evaluator pass,close first task then execute exactly one keyboard/focus task and pause goal.

## Verification

Command: focused Vitest source paragrph,split-controls,Paragraph dialog,advanced controls and actual toolbar with coverage (Z2BZNW-coverage.log). Result:14cases/5files pass;strict2owner100coverage S53/B48/F14/L46,zero skips/no ignores or thresholds changed. Scope: source Reset/handler order,sensitivity asymmetry,1..9numeric bounds,zero checkbox encoding,retained inactive numbers,unchanged output and actual controller integration. Command:npm run test:writer -- src/sw/source/core/doc/writer-attributes.test.ts src/sw/source/core/undo/undobj.test.ts src/sw/source/filter/xml/odt-filter-service.test.ts src/sw/browser/presentation/WriterPageLayout.test.tsx. Result:52cases/4files pass,Z2BZNW-consumers.log. Scope: core/history/layout/filter. Command:npm run build;playwright test --config apps/office/playwright.config.ts --project=writer apps/office/e2e/writer-paragraph-split-controls.spec.ts. Result:2production Chromium cases1280/390 pass,Z2BZNW-build.log/Z2BZNW-e2e.log;no page errors,inspected both screenshots. Scope: actual Format command,cancel,undo/redo,ODT export/reopen. Command:15static/source gate argv in Z2BZNW-gates.json. Result:14initial passes;format second pass corrected in Z2BZNW-format-fixed.log. Registry build,scope lint/type/docs/deps/size/tree/provenance/resources/invariants/parity/static/doctor/routing/diff pass. Task6after checkpoint,no full suite due. Close first task then exactly one keyboard/focus task remains before pause.

## Rollback Plan

Revert only task commits;retain earlier work and other tasks.

## Findings

Source definite-state handler order and changed-output behavior preserved without a second document model;old inverse checkbox labels were migrated to native Allow to split paragraph while core expectations remain unchanged. WRITER090 documents source asymmetric off-handler sensitivity and numeric rows remaining sensitive when split checkboxes disable. Strict100new-owner coverage,actual kernel/history/ODT and production browser evidence pass. Initial new browser test formatting needed a second formatting pass;final scoped check passed. Full mixed/HTML and other textflow services remain outside this leaf;no broad parity promotion,network or full suite. First of two requested tasks;one formatting keyboard/focus task follows.
