---
id: "202610051457-4YCSJP"
title: "Move split paragraph full-span text attributes into native item sets"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 10
origin:
  system: "manual"
depends_on:
  - "202610051420-T1QNV8"
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-05T14:58:35.643Z"
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
    body: "Start: Implement approved native split full-span item ownership and source-independent tests using standing UI/refactoring authorization."
events:
  -
    type: "status"
    at: "2026-10-05T14:58:37.448Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: Implement approved native split full-span item ownership and source-independent tests using standing UI/refactoring authorization."
doc_version: 3
doc_updated_at: "2026-10-05T14:58:37.448Z"
doc_updated_by: "CODER"
description: "Iteration153 replaces the empty-end AUTO-only split workaround with native MoveTextAttr_To_AttrSet for both represented split paragraphs, retaining source traversal stop conditions, DontMove and changed-item deletion ownership. Preserve conscious IO deviations and all existing semantic states; full native CutText and list split remain separate."
sections:
  Summary: "Bring represented split paragraph attribute ownership closer to native ndtxt.cxx without an AUTO-only empty-tail workaround."
  Scope: "Iteration153 atomic native split full-span attribute-to-item-set lifecycle. Implement source SwTextNode.MoveTextAttr_To_AttrSet with start-sorted native traversal: break at nonzero start or partial/char-format range, retain DontMove, move AUTO style handle or other represented item only when SetAttr changes actual direct items, delete only successfully moved attributes and release empty hints. SplitContent invokes this responsibility for both resulting represented paragraphs after native text/hint assignment. Remove manual AUTO-specific direct mutation from empty-end split hint preparation; keep equal-end copying and closed-hint cleanup boundary. Native source defines preserving equal direct-value hints on failed/no-change SetAttr. Existing ndtxt-hints responsibility split holds algorithm and unchanged range validation body to retain strict1000-line node gate; node remains sole native owner, no new UI/context/TextRuns adapter. Scope5paths:ndtxt.ts,ndtxt-hints.ts,new native-split-attributes.test.ts,source-provenance.json,runtime-inventory.json. Source-independent tests cover start/partial/char-format stop, DontMove continuation, actual hint/item/map/backlink ownership and changed/unchanged SetAttr, positive/empty prefix/suffix core split, original direct/list items untouched, actual document SplitNode and selected-table plain reader/history. Native full CutImpl/move/index/style/list split defaults and zero-prefix CopyAttr remain explicitly unverified. Add evidence/local/upstream symbols only for existing two owners; preserve all250 semantic states/defaults/classifications and all prior tests byte-identical. Six statics first, ONE sequential full absent build/app/inventory/scripts/Chromium profile, coverage.reportOnFailure and exact failed names before assertions. Failed/new-only closure; no passing full/static/build/suite/case replay. Restore vendor in finally before five source audits and scope/AP checks. Actual maps ignored appcache only. No upstream sources/helpers/Python/probes/raw diagnostics in AP, no network/outside/global/subagents. User standing explicit UI/refactoring authorization covers safe local leaf."
  Plan: "Iteration153 atomic native split full-span attribute-to-item-set lifecycle. Implement source SwTextNode.MoveTextAttr_To_AttrSet with start-sorted native traversal: break at nonzero start or partial/char-format range, retain DontMove, move AUTO style handle or other represented item only when SetAttr changes actual direct items, delete only successfully moved attributes and release empty hints. SplitContent invokes this responsibility for both resulting represented paragraphs after native text/hint assignment. Remove manual AUTO-specific direct mutation from empty-end split hint preparation; keep equal-end copying and closed-hint cleanup boundary. Native source defines preserving equal direct-value hints on failed/no-change SetAttr. Existing ndtxt-hints responsibility split holds algorithm and unchanged range validation body to retain strict1000-line node gate; node remains sole native owner, no new UI/context/TextRuns adapter. Scope5paths:ndtxt.ts,ndtxt-hints.ts,new native-split-attributes.test.ts,source-provenance.json,runtime-inventory.json. Source-independent tests cover start/partial/char-format stop, DontMove continuation, actual hint/item/map/backlink ownership and changed/unchanged SetAttr, positive/empty prefix/suffix core split, original direct/list items untouched, actual document SplitNode and selected-table plain reader/history. Native full CutImpl/move/index/style/list split defaults and zero-prefix CopyAttr remain explicitly unverified. Add evidence/local/upstream symbols only for existing two owners; preserve all250 semantic states/defaults/classifications and all prior tests byte-identical. Six statics first, ONE sequential full absent build/app/inventory/scripts/Chromium profile, coverage.reportOnFailure and exact failed names before assertions. Failed/new-only closure; no passing full/static/build/suite/case replay. Restore vendor in finally before five source audits and scope/AP checks. Actual maps ignored appcache only. No upstream sources/helpers/Python/probes/raw diagnostics in AP, no network/outside/global/subagents. User standing explicit UI/refactoring authorization covers safe local leaf."
  Verify Steps: |-
    1. Six statics first: npm run format:check; npm run lint; npm run typecheck; npm run check:dependencies; npm run check:docs; npm run check:file-size. Changed-file checks only after remediation.
    2. ONE sequential upstream-absent profile: npm run test:static; npm run test:coverage --workspace @vite-office/office -- --coverage.reportOnFailure; npm run test:inventory:coverage -- --coverage.reportOnFailure; npm exec -- vitest run scripts/check-source-provenance.test.ts scripts/writer-ui-resource-model.test.ts; npm exec -- playwright test --config apps/office/playwright.config.ts. Rename vendor within repo with try/finally restore. Persist exact failure/error names before assertions and Vitest skipped status. Never access/invoke upstream from tests. Repeat only failed cases/gates and genuinely new unexecuted cases. Initial maps ignored appcache only; preserve100% app/inventory L/S/F/B.
    3. New source-independent native tests assert source traversal conditions/unchanged-item retention, both split paragraph item sets/hints, DontMove/hyperlink ownership, zero/positive boundaries and actual native document read/history without DTO adapters. All404 prior test files byte-identical. Preserve250 module states/defaults/exceptions and prior evidence, additive native responsibility evidence only for existing ndtxt/ndtxt-hints owners, no whole-module promotion. Full CutImpl/list split/defaults explicitly unverified.
    4. Vendor restored before five source audits: writer resources --check, source-tree, source-provenance, inventory invariants/parity. Scope/AP forbidden artifact scan, exact semantic SHA same-agent EVALUATOR review, recorded verification/canonical finish/parent checkpoint. Final tracked checkout clean; broad goal active.
  Verification: "Pending implementation and one upstream-absent verification profile."
  Rollback Plan: "Revert only this leaf semantic implementation commit if required; preserve parent history and immutable completed tasks."
  Findings: "Pinned source ndtxt.cxx MoveTextAttr_To_AttrSet lines833-870 and SplitContentNode invocation for both paragraphs establishes traversal and changed-item removal. Existing SplitTextNodeEndHints eagerly SetAttr only for empty trailing AUTO. Native MakeNewTextNode/list resets/full CutText and index/frame lifetimes remain distinct obligations. Standing user authorization applies; no external/network or unrelated policy changes."
id_source: "generated"
---
## Summary

Bring represented split paragraph attribute ownership closer to native ndtxt.cxx without an AUTO-only empty-tail workaround.

## Scope

Iteration153 atomic native split full-span attribute-to-item-set lifecycle. Implement source SwTextNode.MoveTextAttr_To_AttrSet with start-sorted native traversal: break at nonzero start or partial/char-format range, retain DontMove, move AUTO style handle or other represented item only when SetAttr changes actual direct items, delete only successfully moved attributes and release empty hints. SplitContent invokes this responsibility for both resulting represented paragraphs after native text/hint assignment. Remove manual AUTO-specific direct mutation from empty-end split hint preparation; keep equal-end copying and closed-hint cleanup boundary. Native source defines preserving equal direct-value hints on failed/no-change SetAttr. Existing ndtxt-hints responsibility split holds algorithm and unchanged range validation body to retain strict1000-line node gate; node remains sole native owner, no new UI/context/TextRuns adapter. Scope5paths:ndtxt.ts,ndtxt-hints.ts,new native-split-attributes.test.ts,source-provenance.json,runtime-inventory.json. Source-independent tests cover start/partial/char-format stop, DontMove continuation, actual hint/item/map/backlink ownership and changed/unchanged SetAttr, positive/empty prefix/suffix core split, original direct/list items untouched, actual document SplitNode and selected-table plain reader/history. Native full CutImpl/move/index/style/list split defaults and zero-prefix CopyAttr remain explicitly unverified. Add evidence/local/upstream symbols only for existing two owners; preserve all250 semantic states/defaults/classifications and all prior tests byte-identical. Six statics first, ONE sequential full absent build/app/inventory/scripts/Chromium profile, coverage.reportOnFailure and exact failed names before assertions. Failed/new-only closure; no passing full/static/build/suite/case replay. Restore vendor in finally before five source audits and scope/AP checks. Actual maps ignored appcache only. No upstream sources/helpers/Python/probes/raw diagnostics in AP, no network/outside/global/subagents. User standing explicit UI/refactoring authorization covers safe local leaf.

## Plan

Iteration153 atomic native split full-span attribute-to-item-set lifecycle. Implement source SwTextNode.MoveTextAttr_To_AttrSet with start-sorted native traversal: break at nonzero start or partial/char-format range, retain DontMove, move AUTO style handle or other represented item only when SetAttr changes actual direct items, delete only successfully moved attributes and release empty hints. SplitContent invokes this responsibility for both resulting represented paragraphs after native text/hint assignment. Remove manual AUTO-specific direct mutation from empty-end split hint preparation; keep equal-end copying and closed-hint cleanup boundary. Native source defines preserving equal direct-value hints on failed/no-change SetAttr. Existing ndtxt-hints responsibility split holds algorithm and unchanged range validation body to retain strict1000-line node gate; node remains sole native owner, no new UI/context/TextRuns adapter. Scope5paths:ndtxt.ts,ndtxt-hints.ts,new native-split-attributes.test.ts,source-provenance.json,runtime-inventory.json. Source-independent tests cover start/partial/char-format stop, DontMove continuation, actual hint/item/map/backlink ownership and changed/unchanged SetAttr, positive/empty prefix/suffix core split, original direct/list items untouched, actual document SplitNode and selected-table plain reader/history. Native full CutImpl/move/index/style/list split defaults and zero-prefix CopyAttr remain explicitly unverified. Add evidence/local/upstream symbols only for existing two owners; preserve all250 semantic states/defaults/classifications and all prior tests byte-identical. Six statics first, ONE sequential full absent build/app/inventory/scripts/Chromium profile, coverage.reportOnFailure and exact failed names before assertions. Failed/new-only closure; no passing full/static/build/suite/case replay. Restore vendor in finally before five source audits and scope/AP checks. Actual maps ignored appcache only. No upstream sources/helpers/Python/probes/raw diagnostics in AP, no network/outside/global/subagents. User standing explicit UI/refactoring authorization covers safe local leaf.

## Verify Steps

1. Six statics first: npm run format:check; npm run lint; npm run typecheck; npm run check:dependencies; npm run check:docs; npm run check:file-size. Changed-file checks only after remediation.
2. ONE sequential upstream-absent profile: npm run test:static; npm run test:coverage --workspace @vite-office/office -- --coverage.reportOnFailure; npm run test:inventory:coverage -- --coverage.reportOnFailure; npm exec -- vitest run scripts/check-source-provenance.test.ts scripts/writer-ui-resource-model.test.ts; npm exec -- playwright test --config apps/office/playwright.config.ts. Rename vendor within repo with try/finally restore. Persist exact failure/error names before assertions and Vitest skipped status. Never access/invoke upstream from tests. Repeat only failed cases/gates and genuinely new unexecuted cases. Initial maps ignored appcache only; preserve100% app/inventory L/S/F/B.
3. New source-independent native tests assert source traversal conditions/unchanged-item retention, both split paragraph item sets/hints, DontMove/hyperlink ownership, zero/positive boundaries and actual native document read/history without DTO adapters. All404 prior test files byte-identical. Preserve250 module states/defaults/exceptions and prior evidence, additive native responsibility evidence only for existing ndtxt/ndtxt-hints owners, no whole-module promotion. Full CutImpl/list split/defaults explicitly unverified.
4. Vendor restored before five source audits: writer resources --check, source-tree, source-provenance, inventory invariants/parity. Scope/AP forbidden artifact scan, exact semantic SHA same-agent EVALUATOR review, recorded verification/canonical finish/parent checkpoint. Final tracked checkout clean; broad goal active.

## Verification

Pending implementation and one upstream-absent verification profile.

## Rollback Plan

Revert only this leaf semantic implementation commit if required; preserve parent history and immutable completed tasks.

## Findings

Pinned source ndtxt.cxx MoveTextAttr_To_AttrSet lines833-870 and SplitContentNode invocation for both paragraphs establishes traversal and changed-item removal. Existing SplitTextNodeEndHints eagerly SetAttr only for empty trailing AUTO. Native MakeNewTextNode/list resets/full CutText and index/frame lifetimes remain distinct obligations. Standing user authorization applies; no external/network or unrelated policy changes.
