---
id: "202610072051-4FRJFD"
title: "Verify reported bullet overlap against native occupied label width"
status: "DOING"
priority: "high"
owner: "CODER"
revision: 13
origin:
  system: "manual"
depends_on: []
tags:
  - "parity"
  - "research"
task_kind: "analysis"
mutation_scope: "docs"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-07T20:51:56.693Z"
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
    body: "Start: prioritize reported bullet overlap, verify existing correction against pinned source and current production geometry without upstream present; retain deferred ownership work."
events:
  -
    type: "status"
    at: "2026-10-07T20:51:57.158Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: prioritize reported bullet overlap, verify existing correction against pinned source and current production geometry without upstream present; retain deferred ownership work."
doc_version: 3
doc_updated_at: "2026-10-07T20:53:42.319Z"
doc_updated_by: "CODER"
description: "User-priority investigation of reported bullet/text overlap; inspect pinned formatting and production browser geometry, verify existing occupied-width correction without upstream present, distinguish reproduced issues from missing document-specific reproduction. Preserve deferred ownership task and intentional IO deviations."
sections:
  Summary: "Investigate the explicit priority report of bullet labels overlapping item text in the current checkout. Existing correction e625c6f3 reserves intrinsic occupied width; reproduce before modifying production code."
  Scope: "Task-local English findings and bounded verification metadata only, plus the deferred ownership task Findings already authorized. No production edits unless a concrete reproduction establishes a scoped defect and an amended implementation plan is approved. Keep upstream sources and raw reports exclusively outside AP in ignored local application cache."
  Plan: "Compare pinned SwNumberPortion::Format and NewNumberPortion with current occupied label width, inspect actual glyph/text rectangles in production Chromium, and run one focused upstream-absent profile for existing label-width core/browser regression scenarios. Preserve the separately deferred ownership patch and report whether current code reproduces the report. Do not fabricate a correction, declare exhaustive list parity, or rerun checks with upstream."
  Verify Steps: |-
    1. Verify current production occupied width against pinned porfld.cxx607..681 and txtfld.cxx535..538, and cite actual code locations and existing correction commit.
    2. Measure production toolbar-created bullets at desktop and narrow widths; record actual glyph/text gaps. Once only with vendor moved away: npm run build; targeted Vitest native-list-marker-width.test.tsx without coverage; Playwright writer-native-list-marker-width.spec.ts. Restore vendor finally. All tests must use local runtime only; no passing reruns.
    3. Record actual counts, failures, limitations, doc-specific reproduction question, deferred patch hash and source unchanged. Run doctor, routing, diff; bounded AP evidence with no upstream/script/raw artifacts. Commit only explicit task-state findings, keep parent goal active; do not mark unresolved user-specific reproduction fixed.
  Verification: |-
    Command: npm run build; npx vitest run src/sw/browser/editor/native-list-marker-width.test.tsx --reporter=json --outputFile=<ignored-cache>/app-results.json (cwd apps/office); npx playwright test --config apps/office/playwright.config.ts apps/office/e2e/writer-native-list-marker-width.spec.ts --reporter=json.
    Result: PASS: build,9/9app,4/4Chromium;0failed0skipped0flaky. Executed once only with vendor/libreoffice-reference absent, then restored. No production correction introduced because the current scenarios already pass the earlier occupied-width fix.
    Evidence: evidence/bullet-width-review.json; pinned source anchors, actual DOM glyph/text geometry and raw report SHA bindings. Raw browser snapshots/output retained only in ignored cache.
    Scope: current occupied label width in body/cell lists, collapsed/narrow widths, native minimum distance, large fonts/nested levels/wrapping/edit/history. No exhaustive list parity or unknown document-specific fix claimed. Governance doctor/routing/diff pass; two existing doctor warnings retained.
  Rollback Plan: "Revert only this task's documentation commit if needed. Deferred ownership source remains recoverable from the ignored local patch; no source file rollback is introduced by this investigation."
  Findings: "Pinned LibreOffice26.8.0.2 SHA9bc445578031fecf56086729d8e4940c77e14d65: sw/source/core/text/porfld.cxx607..681 lower-bounds occupied number width by measured glyph plus minimum distance; txtfld.cxx535..538 supplies zero minimum for label alignment and native character distance for legacy geometry. Current WriterEditableParagraph.tsx110..113 already enforces minWidth=max-content and separate native distance; writer-view-projection.ts326..330 provides the mode-specific distance. Correction e625c6f3b56279490cd3fc9292afa2a3ee2f4d92 is present in main. Current production toolbar-created bullets measured18.3046875CSSpx clear gap at both1280 and390 viewport widths. ONE focused upstream-absent profile: buildPASS; nine mounted ownership/label-distance casesPASS; four production Chromium1280/390 body/cell scenariosPASS, each exercises collapsed/narrow/normal/nested/legacy/numbered/wrapped profiles plus typing and repeated undo/redo. Zero failures/skips/flaky; vendor restored finally. No production source/metadata/test changes. This investigation verifies the existing bounded overlap correction; remaining native tab fallback, fonts/style/RTL/full layout parity and a document-specific reported reproduction are not established. Async clarification asked whether newly created/opened/table list; no answer at verification time. Do not claim every possible document/browser fixed. Deferred ownership patch remains SHA2565844aef23d272577d1331863eebc8601969237f317f7843fc1b61dab131400fc in ignored local application cache; its task stays DOING. Goal and parent remain ACTIVE. doctorPASS0errors2pre-existingwarnings, routingPASS, diffPASS."
id_source: "generated"
---
## Summary

Investigate the explicit priority report of bullet labels overlapping item text in the current checkout. Existing correction e625c6f3 reserves intrinsic occupied width; reproduce before modifying production code.

## Scope

Task-local English findings and bounded verification metadata only, plus the deferred ownership task Findings already authorized. No production edits unless a concrete reproduction establishes a scoped defect and an amended implementation plan is approved. Keep upstream sources and raw reports exclusively outside AP in ignored local application cache.

## Plan

Compare pinned SwNumberPortion::Format and NewNumberPortion with current occupied label width, inspect actual glyph/text rectangles in production Chromium, and run one focused upstream-absent profile for existing label-width core/browser regression scenarios. Preserve the separately deferred ownership patch and report whether current code reproduces the report. Do not fabricate a correction, declare exhaustive list parity, or rerun checks with upstream.

## Verify Steps

1. Verify current production occupied width against pinned porfld.cxx607..681 and txtfld.cxx535..538, and cite actual code locations and existing correction commit.
2. Measure production toolbar-created bullets at desktop and narrow widths; record actual glyph/text gaps. Once only with vendor moved away: npm run build; targeted Vitest native-list-marker-width.test.tsx without coverage; Playwright writer-native-list-marker-width.spec.ts. Restore vendor finally. All tests must use local runtime only; no passing reruns.
3. Record actual counts, failures, limitations, doc-specific reproduction question, deferred patch hash and source unchanged. Run doctor, routing, diff; bounded AP evidence with no upstream/script/raw artifacts. Commit only explicit task-state findings, keep parent goal active; do not mark unresolved user-specific reproduction fixed.

## Verification

Command: npm run build; npx vitest run src/sw/browser/editor/native-list-marker-width.test.tsx --reporter=json --outputFile=<ignored-cache>/app-results.json (cwd apps/office); npx playwright test --config apps/office/playwright.config.ts apps/office/e2e/writer-native-list-marker-width.spec.ts --reporter=json.
Result: PASS: build,9/9app,4/4Chromium;0failed0skipped0flaky. Executed once only with vendor/libreoffice-reference absent, then restored. No production correction introduced because the current scenarios already pass the earlier occupied-width fix.
Evidence: evidence/bullet-width-review.json; pinned source anchors, actual DOM glyph/text geometry and raw report SHA bindings. Raw browser snapshots/output retained only in ignored cache.
Scope: current occupied label width in body/cell lists, collapsed/narrow widths, native minimum distance, large fonts/nested levels/wrapping/edit/history. No exhaustive list parity or unknown document-specific fix claimed. Governance doctor/routing/diff pass; two existing doctor warnings retained.

## Rollback Plan

Revert only this task's documentation commit if needed. Deferred ownership source remains recoverable from the ignored local patch; no source file rollback is introduced by this investigation.

## Findings

Pinned LibreOffice26.8.0.2 SHA9bc445578031fecf56086729d8e4940c77e14d65: sw/source/core/text/porfld.cxx607..681 lower-bounds occupied number width by measured glyph plus minimum distance; txtfld.cxx535..538 supplies zero minimum for label alignment and native character distance for legacy geometry. Current WriterEditableParagraph.tsx110..113 already enforces minWidth=max-content and separate native distance; writer-view-projection.ts326..330 provides the mode-specific distance. Correction e625c6f3b56279490cd3fc9292afa2a3ee2f4d92 is present in main. Current production toolbar-created bullets measured18.3046875CSSpx clear gap at both1280 and390 viewport widths. ONE focused upstream-absent profile: buildPASS; nine mounted ownership/label-distance casesPASS; four production Chromium1280/390 body/cell scenariosPASS, each exercises collapsed/narrow/normal/nested/legacy/numbered/wrapped profiles plus typing and repeated undo/redo. Zero failures/skips/flaky; vendor restored finally. No production source/metadata/test changes. This investigation verifies the existing bounded overlap correction; remaining native tab fallback, fonts/style/RTL/full layout parity and a document-specific reported reproduction are not established. Async clarification asked whether newly created/opened/table list; no answer at verification time. Do not claim every possible document/browser fixed. Deferred ownership patch remains SHA2565844aef23d272577d1331863eebc8601969237f317f7843fc1b61dab131400fc in ignored local application cache; its task stays DOING. Goal and parent remain ACTIVE. doctorPASS0errors2pre-existingwarnings, routingPASS, diffPASS.
