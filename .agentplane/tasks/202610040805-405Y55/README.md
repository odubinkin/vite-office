---
id: "202610040805-405Y55"
title: "Preserve paragraph ruler item state through undo"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 16
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-04T08:07:27.100Z"
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
    body: "Start: replace numeric-only ruler undo with the approved typed paragraph-item application path and owned verification."
  -
    author: "CODER"
    body: "Start: execute amended typed-item/history correction including direct-only before-item capture under the standing goal authorization."
events:
  -
    type: "status"
    at: "2026-10-04T08:06:14.315Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: replace numeric-only ruler undo with the approved typed paragraph-item application path and owned verification."
  -
    type: "status"
    at: "2026-10-04T08:07:27.545Z"
    author: "CODER"
    from: "DOING"
    to: "DOING"
    note: "Start: execute amended typed-item/history correction including direct-only before-item capture under the standing goal authorization."
doc_version: 3
doc_updated_at: "2026-10-04T08:07:27.545Z"
doc_updated_by: "CODER"
description: "Iteration 98 of parent 202609240501-C9TN6M: replace numeric-only specialized ruler undo with existing paragraph item application/history, preserving the effective automatic first-line flag and direct/inherited state; retain source-shaped range routing. Owned tests and single upstream-absent verification only; no upstream code execution or copied sources."
sections:
  Summary: "Preserve the existing effective automatic first-line flag when ruler indents are applied and undone. Refactor the numeric-only ruler action into the existing paragraph-item history path so direct/inherited attributes and selected range ownership are preserved."
  Scope: |-
    apps/office/src/sw/source/uibase/wrtsh/wrtsh1.ts
    apps/office/src/sw/source/core/undo/SwUndoPageDesc.ts
    apps/office/src/sw/source/uibase/shells/textsh1.ts
    apps/office/src/sw/source/uibase/wrtsh/wrtsh1.test.ts
    apps/office/src/sw/browser/presentation/writer-view-ruler-indent-items.test.tsx
    apps/office/e2e/writer-ruler-indent-items.spec.ts
    docs/program/source-provenance.json
    docs/program/parity/runtime-inventory.json
    Task-local bounded hashes/results/conclusions and parent lifecycle docs only. Base b1c20432023d34f125befd1f50288f01bf7e80b1. Of 298 existing test/spec files, 297 remain byte-identical; the obsolete SwUndoRulerIndent import and direct-constructor payload assertion in wrtsh1.test.ts move to an equal payload assertion on the actual applied generic paragraph action. All other existing test bytes/assertions preserved. Both 220-row manifests retain order/status/default/owner/exception fields, updating three existing rows and removing only obsolete ruler symbols/claims from the page-undo row. No network/native execution/copied sources/helpers/history rewrite/outside-repo access.
  Plan: "Standing iterative-goal authorization covers this one correction. 1. Read pinned SvxRuler ApplyIndents, item setter, Writer ExecTabWin and native item/history path; store hashes/markers/conclusions only. 2. Make SetParagraphRulerIndents construct the three typed margin items with the active effective automatic flag and call the existing SetParagraphItems path; move its tuple interface beside the shell boundary and delete the numeric-only SwUndoRulerIndent/helper from page undo. Correct its before-item capture to read only the node's optional direct set, so a fully inherited paragraph restores inheritance instead of copying its style item. Reuse generic selected-range application, no-op filtering, notification grouping and direct/inherited history. 3. Preserve the old payload assertion through the real applied action; add owned actual-session direct/inherited/manual/automatic/three-edge, no-op/cancel, complete values/direct states/Undo/Redo/frozen projection/range cases and rebuilt Chromium 1280/390 automatic left/right moves and history/later editing. 4. Correct three existing mapping rows without promotion. 5. Run split static checks, one upstream-absent test pipeline, post-restoration source/scope/artifact audits, screenshot inspection, exact-SHA same-actor EVALUATOR and clean finish. Full goal remains active; stop only for material drift."
  Verify Steps: "Read ap task verify-show and bounded pinned source/hash references before edits. No native execution or stored source/helper files. No baseline/focused test runs. Run format:check, lint, typecheck, check:dependencies, test:static (build only), check:docs, check:file-size. Rename vendor/libreoffice-reference inside vendor, run npm run test once, npm exec -- vitest run scripts/check-source-provenance.test.ts scripts/writer-ui-resource-model.test.ts once, npm run test:e2e once, and restore in finally. Repeat only failed corrected gates/cases, always absent; never duplicate passing suites. Require 100% four app/inventory coverage metrics. After restoration run resource generator --check, source-tree/provenance/invariants and separate parity CLI with zero semantic violations. Owned tests inspect full item values and direct/inherited state across manual/automatic modes and left/first/right changes, accepted one history entry, no-op/cancel no history, Undo/Redo precise state and retained frozen projections; selection uses existing range application and excludes untouched nodes. Chromium 1280/390 uses product-authored automatic ODT, real left/right hit targets, accepted/cancel/no-motion, hidden first-line marker across Undo/Redo, independent paragraph/text and later editing, with two actual screenshots outside Agentplane. After restoration audit eight semantic paths, 298 prior tests/297 identical/exact one payload assertion migration, both 220-row manifests/three exact row changes/no promotion, pinned source hashes and ignored-inclusive Agentplane forbidden source/helper/Python/native/archive/rawframes/code-diff zero/five historical prose-only refs. Routing/doctor and exact-SHA same-actor evaluator pass; clean finish, parent DOING/full goal active."
  Verification: "Pending approved implementation and the declared upstream-absent pipeline."
  Rollback Plan: "Revert the task semantic commit in a new scoped commit if necessary; retain task traceability and never rewrite history."
  Findings: |-
    Previous goal turn was verified progress: iteration 97 DONE semantic 2504e29cfab04fba613bd44afefac7b6c9b4a1ce, clean base b1c20432023d34f125befd1f50288f01bf7e80b1. Current local numeric-only SwUndoRulerIndent uses setters that drop automatic first-line state. Read-only native evidence preserves the flag through LR-space item mutation and Writer typed-item transfer. The existing paragraph-item path already retains direct versus inherited state and groups selected changes into one undo action; reuse it instead of a new special case. Automatic layout, numbering/style-autoupdate/native range edge semantics and full parent/ruler parity remain unverified; save/open/recovery deviations stay preserved.
    Read-only inspection before implementation found that the reusable paragraph-item path reads GetSwAttrSet for its prior direct state; on a fully inherited node this returns the style set. Amend this one correction to use GetpSwAttrSet instead, and include fully inherited/no-own-set rollback evidence. One additional implementation path and a third existing mapping row are included; no tests have run.
id_source: "generated"
---
## Summary

Preserve the existing effective automatic first-line flag when ruler indents are applied and undone. Refactor the numeric-only ruler action into the existing paragraph-item history path so direct/inherited attributes and selected range ownership are preserved.

## Scope

apps/office/src/sw/source/uibase/wrtsh/wrtsh1.ts
apps/office/src/sw/source/core/undo/SwUndoPageDesc.ts
apps/office/src/sw/source/uibase/shells/textsh1.ts
apps/office/src/sw/source/uibase/wrtsh/wrtsh1.test.ts
apps/office/src/sw/browser/presentation/writer-view-ruler-indent-items.test.tsx
apps/office/e2e/writer-ruler-indent-items.spec.ts
docs/program/source-provenance.json
docs/program/parity/runtime-inventory.json
Task-local bounded hashes/results/conclusions and parent lifecycle docs only. Base b1c20432023d34f125befd1f50288f01bf7e80b1. Of 298 existing test/spec files, 297 remain byte-identical; the obsolete SwUndoRulerIndent import and direct-constructor payload assertion in wrtsh1.test.ts move to an equal payload assertion on the actual applied generic paragraph action. All other existing test bytes/assertions preserved. Both 220-row manifests retain order/status/default/owner/exception fields, updating three existing rows and removing only obsolete ruler symbols/claims from the page-undo row. No network/native execution/copied sources/helpers/history rewrite/outside-repo access.

## Plan

Standing iterative-goal authorization covers this one correction. 1. Read pinned SvxRuler ApplyIndents, item setter, Writer ExecTabWin and native item/history path; store hashes/markers/conclusions only. 2. Make SetParagraphRulerIndents construct the three typed margin items with the active effective automatic flag and call the existing SetParagraphItems path; move its tuple interface beside the shell boundary and delete the numeric-only SwUndoRulerIndent/helper from page undo. Correct its before-item capture to read only the node's optional direct set, so a fully inherited paragraph restores inheritance instead of copying its style item. Reuse generic selected-range application, no-op filtering, notification grouping and direct/inherited history. 3. Preserve the old payload assertion through the real applied action; add owned actual-session direct/inherited/manual/automatic/three-edge, no-op/cancel, complete values/direct states/Undo/Redo/frozen projection/range cases and rebuilt Chromium 1280/390 automatic left/right moves and history/later editing. 4. Correct three existing mapping rows without promotion. 5. Run split static checks, one upstream-absent test pipeline, post-restoration source/scope/artifact audits, screenshot inspection, exact-SHA same-actor EVALUATOR and clean finish. Full goal remains active; stop only for material drift.

## Verify Steps

Read ap task verify-show and bounded pinned source/hash references before edits. No native execution or stored source/helper files. No baseline/focused test runs. Run format:check, lint, typecheck, check:dependencies, test:static (build only), check:docs, check:file-size. Rename vendor/libreoffice-reference inside vendor, run npm run test once, npm exec -- vitest run scripts/check-source-provenance.test.ts scripts/writer-ui-resource-model.test.ts once, npm run test:e2e once, and restore in finally. Repeat only failed corrected gates/cases, always absent; never duplicate passing suites. Require 100% four app/inventory coverage metrics. After restoration run resource generator --check, source-tree/provenance/invariants and separate parity CLI with zero semantic violations. Owned tests inspect full item values and direct/inherited state across manual/automatic modes and left/first/right changes, accepted one history entry, no-op/cancel no history, Undo/Redo precise state and retained frozen projections; selection uses existing range application and excludes untouched nodes. Chromium 1280/390 uses product-authored automatic ODT, real left/right hit targets, accepted/cancel/no-motion, hidden first-line marker across Undo/Redo, independent paragraph/text and later editing, with two actual screenshots outside Agentplane. After restoration audit eight semantic paths, 298 prior tests/297 identical/exact one payload assertion migration, both 220-row manifests/three exact row changes/no promotion, pinned source hashes and ignored-inclusive Agentplane forbidden source/helper/Python/native/archive/rawframes/code-diff zero/five historical prose-only refs. Routing/doctor and exact-SHA same-actor evaluator pass; clean finish, parent DOING/full goal active.

## Verification

Pending approved implementation and the declared upstream-absent pipeline.

## Rollback Plan

Revert the task semantic commit in a new scoped commit if necessary; retain task traceability and never rewrite history.

## Findings

Previous goal turn was verified progress: iteration 97 DONE semantic 2504e29cfab04fba613bd44afefac7b6c9b4a1ce, clean base b1c20432023d34f125befd1f50288f01bf7e80b1. Current local numeric-only SwUndoRulerIndent uses setters that drop automatic first-line state. Read-only native evidence preserves the flag through LR-space item mutation and Writer typed-item transfer. The existing paragraph-item path already retains direct versus inherited state and groups selected changes into one undo action; reuse it instead of a new special case. Automatic layout, numbering/style-autoupdate/native range edge semantics and full parent/ruler parity remain unverified; save/open/recovery deviations stay preserved.
Read-only inspection before implementation found that the reusable paragraph-item path reads GetSwAttrSet for its prior direct state; on a fully inherited node this returns the style set. Amend this one correction to use GetpSwAttrSet instead, and include fully inherited/no-own-set rollback evidence. One additional implementation path and a third existing mapping row are included; no tests have run.
