---
id: "202610040842-QK716P"
title: "Resolve automatic first-line layout separately from authored ruler values"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 13
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-04T08:44:43.191Z"
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
    body: "Start: implement the approved source-owned automatic first-line layout and distinct resolved browser primitive, preserving raw ruler/dialog/list ownership and registered exceptions. One upstream-absent pipeline; results/hashes only in Agentplane."
events:
  -
    type: "status"
    at: "2026-10-04T08:44:43.633Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implement the approved source-owned automatic first-line layout and distinct resolved browser primitive, preserving raw ruler/dialog/list ownership and registered exceptions. One upstream-absent pipeline; results/hashes only in Agentplane."
doc_version: 3
doc_updated_at: "2026-10-04T08:59:55.639Z"
doc_updated_by: "CODER"
description: "Iteration99 of the standing iterative upstream goal: source-owned automatic first-line layout calculation for existing Western/font/line-spacing/list paths, distinct immutable resolved layout projection and real body rendering, preserving raw ruler/dialog/Undo contracts and registered I/O/recovery deviations."
sections:
  Summary: "Resolve existing automatic first-line paragraph layout at the native core text-margin responsibility, separately from authored ruler/dialog item values. Apply existing supported Western font, four line-spacing modes, compatibility setting and numbered bypass without broad native layout promotion."
  Scope: |-
    apps/office/src/sw/source/core/text/itrcrsr.ts
    apps/office/src/sw/source/core/txtnode/ndtxt.ts
    apps/office/src/sw/browser/presentation/writer-view-projection.ts
    apps/office/src/sw/browser/editor/WriterEditableParagraph.tsx
    apps/office/src/sw/browser/presentation/writer-view-auto-first-layout.test.tsx
    apps/office/e2e/writer-auto-first-layout.spec.ts
    docs/program/source-provenance.json
    docs/program/parity/runtime-inventory.json
    Bounded result/hash/conclusion-only task artifacts and parent lifecycle docs. Base 9c47d3987eebd979125aac70904243303fa78153. All300 prior test/spec files remain byte-identical. Both220 existing manifest rows retain order/status/default/owner/exception fields; append bounded evidence to three touched existing rows and add one explicit unverified native-source mechanism row for itrcrsr.ts (221total). Registered save/open/recovery exceptions unchanged. No upstream sources/helpers/Python/native binaries/archives/raw source frames/code diffs in Agentplane; no native execution, network, outside-repo access or history rewrite.
  Plan: "Standing goal authorization covers this one coherent automatic-layout correction. 1. Read pinned SwTextMargin::CtorInitTextMargin, SwTextNode::GetFirstLineOfsWithNum and DocumentSettingManager default; inspect existing projection/CSS/measurement consumers. 2. Move the existing automatic calculation from text-node convenience getter into itrcrsr.ts source-owned layout resolver, preserve raw manual/numbered values, use existing document disregard-line-space true default and supported compatibility proportional/fixed/minimum/leading modes with native percent zero/minimum/integer rules. Keep unsupported active-script/language/font device policy explicitly unverified. 3. Add optional frozen resolvedFirstLineIndentPt primitive to computed style, populate it for actual projections from the canonical calculation, keep existing firstLineIndentPt raw for ruler/dialog/old DTO contracts. Use resolved value with raw detached fallback in unnumbered CSS, apply zero first-line indent on follow frames; shared visible/measurement paragraph component stays single owner. Existing list marker/raw precedence stays intact. 4. Add actual session/native-literal matrix, default/compatibility/inherited/Undo/Redo/font-size/retained DTO/ruler/raw/no-op/list/follow/legacy detached evidence; product ODT Chromium1280/390 checks actual Range first-glyph geometry, raw dialog/ruler, formatting Undo/Redo, untouched paragraph and later editing, plus screenshots outside Agentplane. 5. Update source mappings without promotion; split static gates, one tests-only-upstream-absent pipeline, restore finally; then source/scope/artifact audits, exact-SHA same-actor evaluator and clean finish. Keep full parent goal active."
  Verify Steps: "Read ap task verify-show and bounded pinned hashes/markers. No baseline/focused pre-fix test runs, native execution or source/helper artifacts. Static format:check/lint/typecheck/check:dependencies/test:static(build only)/check:docs/check:file-size. Rename vendor/libreoffice-reference inside vendor, run npm run test once, npm exec -- vitest run scripts/check-source-provenance.test.ts scripts/writer-ui-resource-model.test.ts once, and npm run test:e2e once; restore finally. Never run tests with upstream present or repeat passing suites; repeat only failed corrected gates/cases absent. Require100%four app/inventory coverage metrics. Owned evidence uses independent literal expected twips/font/spacing, complete raw-auto QueryValue and direct/inherited state, frozen retained DTO, actual visible/measurement CSS and follow frames, native numbered bypass, detached raw DTO fallback, default ignores spacing and compatibility applies it, actual font/dialog history. Chromium1280/390 product-authored automatic ODT checks glyph Range offset vs paragraph origin/first-line indent CSS, independent untouched paragraph, preserved authored raw dialog/ruler state, formatting/Undo/Redo and later text input; inspect actual screenshots outside Agentplane. After restoration run resource generator--check/source-tree/provenance/invariants/parity CLI with zero semantic violations; scope8paths/all300 prior tests identical/220existing rows preserved3append-only updates+1explicit new unverified row. Pinned source hashes stable; ignored-inclusive AP scan zero forbidden source/helper/Python/native executable/archive/source-frame/code-diff with only5historical prose refs. Routing/doctor required; exact-SHA same-actor EVALUATOR pass, clean finish, parent DOING/goal active."
  Verification: "Pending approved implementation and declared upstream-absent verification."
  Rollback Plan: "Revert the scoped semantic commit in a new task commit if needed; retain task traceability and never rewrite history."
  Findings: |-
    Previous goal turn was verified progress: iteration98 DONE semantic cb23954cd2c067b85f357381681fefaddf44dd93; clean base 9c47d3987eebd979125aac70904243303fa78153. Current browser CSS uses authored raw firstLineIndentPt despite effective auto flag. Existing core getter computes only twice Western font height and ignores the already-supported false compatibility setting; source-native SwTextMargin does not. Native GetFirstLineOfsWithNum suppresses auto calculation when a numbered record has a rule, while existing browser list geometry remains a separate path. Automatic default disregard-line-space true is preserved. Native script/language font selection, combined line-space rule combinations outside the four local modes, font-relative units/RTL/tables/redlines/full numbering/layout and parent parity remain individually unverified; do not silently certify them. Registered save/open/recovery deviations preserved.
    Initial static format/type/build gates failed on formatting and one unsupported Testing Library exact option in the new test. Remove that option and format only the two new tests; preserve bounded initial gate result hashes and repeat only the three failed gates. No tests have run yet.
    First absent pipeline passed all1241application cases with100%four coverage metrics, then inventory coverage failed one owned CLI case (108passed) because the new itrcrsr mapping row was appended instead of ordered. Insert only the new row at its lexicographic position in both manifests, preserving relative order and every existing row value. Repeat only failed inventory coverage gate; preserve the passed application gate and its original result hashes. Owned scripts and rebuilt browser were not reached and run once next, all absent; vendor restored in finally.
    Corrected inventory coverage109/100% and owned scripts5 passed absent. First rebuilt Chromium run:77prior cases passed, four new cases failed before browser interactions because the product-authored ODT fixture changed only Western font height and violated the existing script-specific export restriction. Set Western/CJK/CTL fixture heights equally using current items; product and I/O behavior stay unchanged. Repeat only the four failed new E2E cases using the already-built unchanged application, absent; preserve initial bounded output hash and vendor restoration. No passing app/inventory/script/old-browser suite repeats.
id_source: "generated"
---
## Summary

Resolve existing automatic first-line paragraph layout at the native core text-margin responsibility, separately from authored ruler/dialog item values. Apply existing supported Western font, four line-spacing modes, compatibility setting and numbered bypass without broad native layout promotion.

## Scope

apps/office/src/sw/source/core/text/itrcrsr.ts
apps/office/src/sw/source/core/txtnode/ndtxt.ts
apps/office/src/sw/browser/presentation/writer-view-projection.ts
apps/office/src/sw/browser/editor/WriterEditableParagraph.tsx
apps/office/src/sw/browser/presentation/writer-view-auto-first-layout.test.tsx
apps/office/e2e/writer-auto-first-layout.spec.ts
docs/program/source-provenance.json
docs/program/parity/runtime-inventory.json
Bounded result/hash/conclusion-only task artifacts and parent lifecycle docs. Base 9c47d3987eebd979125aac70904243303fa78153. All300 prior test/spec files remain byte-identical. Both220 existing manifest rows retain order/status/default/owner/exception fields; append bounded evidence to three touched existing rows and add one explicit unverified native-source mechanism row for itrcrsr.ts (221total). Registered save/open/recovery exceptions unchanged. No upstream sources/helpers/Python/native binaries/archives/raw source frames/code diffs in Agentplane; no native execution, network, outside-repo access or history rewrite.

## Plan

Standing goal authorization covers this one coherent automatic-layout correction. 1. Read pinned SwTextMargin::CtorInitTextMargin, SwTextNode::GetFirstLineOfsWithNum and DocumentSettingManager default; inspect existing projection/CSS/measurement consumers. 2. Move the existing automatic calculation from text-node convenience getter into itrcrsr.ts source-owned layout resolver, preserve raw manual/numbered values, use existing document disregard-line-space true default and supported compatibility proportional/fixed/minimum/leading modes with native percent zero/minimum/integer rules. Keep unsupported active-script/language/font device policy explicitly unverified. 3. Add optional frozen resolvedFirstLineIndentPt primitive to computed style, populate it for actual projections from the canonical calculation, keep existing firstLineIndentPt raw for ruler/dialog/old DTO contracts. Use resolved value with raw detached fallback in unnumbered CSS, apply zero first-line indent on follow frames; shared visible/measurement paragraph component stays single owner. Existing list marker/raw precedence stays intact. 4. Add actual session/native-literal matrix, default/compatibility/inherited/Undo/Redo/font-size/retained DTO/ruler/raw/no-op/list/follow/legacy detached evidence; product ODT Chromium1280/390 checks actual Range first-glyph geometry, raw dialog/ruler, formatting Undo/Redo, untouched paragraph and later editing, plus screenshots outside Agentplane. 5. Update source mappings without promotion; split static gates, one tests-only-upstream-absent pipeline, restore finally; then source/scope/artifact audits, exact-SHA same-actor evaluator and clean finish. Keep full parent goal active.

## Verify Steps

Read ap task verify-show and bounded pinned hashes/markers. No baseline/focused pre-fix test runs, native execution or source/helper artifacts. Static format:check/lint/typecheck/check:dependencies/test:static(build only)/check:docs/check:file-size. Rename vendor/libreoffice-reference inside vendor, run npm run test once, npm exec -- vitest run scripts/check-source-provenance.test.ts scripts/writer-ui-resource-model.test.ts once, and npm run test:e2e once; restore finally. Never run tests with upstream present or repeat passing suites; repeat only failed corrected gates/cases absent. Require100%four app/inventory coverage metrics. Owned evidence uses independent literal expected twips/font/spacing, complete raw-auto QueryValue and direct/inherited state, frozen retained DTO, actual visible/measurement CSS and follow frames, native numbered bypass, detached raw DTO fallback, default ignores spacing and compatibility applies it, actual font/dialog history. Chromium1280/390 product-authored automatic ODT checks glyph Range offset vs paragraph origin/first-line indent CSS, independent untouched paragraph, preserved authored raw dialog/ruler state, formatting/Undo/Redo and later text input; inspect actual screenshots outside Agentplane. After restoration run resource generator--check/source-tree/provenance/invariants/parity CLI with zero semantic violations; scope8paths/all300 prior tests identical/220existing rows preserved3append-only updates+1explicit new unverified row. Pinned source hashes stable; ignored-inclusive AP scan zero forbidden source/helper/Python/native executable/archive/source-frame/code-diff with only5historical prose refs. Routing/doctor required; exact-SHA same-actor EVALUATOR pass, clean finish, parent DOING/goal active.

## Verification

Pending approved implementation and declared upstream-absent verification.

## Rollback Plan

Revert the scoped semantic commit in a new task commit if needed; retain task traceability and never rewrite history.

## Findings

Previous goal turn was verified progress: iteration98 DONE semantic cb23954cd2c067b85f357381681fefaddf44dd93; clean base 9c47d3987eebd979125aac70904243303fa78153. Current browser CSS uses authored raw firstLineIndentPt despite effective auto flag. Existing core getter computes only twice Western font height and ignores the already-supported false compatibility setting; source-native SwTextMargin does not. Native GetFirstLineOfsWithNum suppresses auto calculation when a numbered record has a rule, while existing browser list geometry remains a separate path. Automatic default disregard-line-space true is preserved. Native script/language font selection, combined line-space rule combinations outside the four local modes, font-relative units/RTL/tables/redlines/full numbering/layout and parent parity remain individually unverified; do not silently certify them. Registered save/open/recovery deviations preserved.
Initial static format/type/build gates failed on formatting and one unsupported Testing Library exact option in the new test. Remove that option and format only the two new tests; preserve bounded initial gate result hashes and repeat only the three failed gates. No tests have run yet.
First absent pipeline passed all1241application cases with100%four coverage metrics, then inventory coverage failed one owned CLI case (108passed) because the new itrcrsr mapping row was appended instead of ordered. Insert only the new row at its lexicographic position in both manifests, preserving relative order and every existing row value. Repeat only failed inventory coverage gate; preserve the passed application gate and its original result hashes. Owned scripts and rebuilt browser were not reached and run once next, all absent; vendor restored in finally.
Corrected inventory coverage109/100% and owned scripts5 passed absent. First rebuilt Chromium run:77prior cases passed, four new cases failed before browser interactions because the product-authored ODT fixture changed only Western font height and violated the existing script-specific export restriction. Set Western/CJK/CTL fixture heights equally using current items; product and I/O behavior stay unchanged. Repeat only the four failed new E2E cases using the already-built unchanged application, absent; preserve initial bounded output hash and vendor restoration. No passing app/inventory/script/old-browser suite repeats.
