---
id: "202610010112-M2EDTZ"
title: "Restore native unnumbered list paragraph ODT transport"
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
  updated_at: "2026-10-01T01:13:16.298Z"
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
    body: "Start: restore source-owned ODT unnumbered paragraph/header/item consumption under the persistent approved goal."
events:
  -
    type: "status"
    at: "2026-10-01T01:13:16.801Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: restore source-owned ODT unnumbered paragraph/header/item consumption under the persistent approved goal."
doc_version: 3
doc_updated_at: "2026-10-01T01:13:16.801Z"
doc_updated_by: "CODER"
description: "Iteration30: carry existing SwTextNode counted state through ODT using native list-header versus list-item continuation and list-item consumption ownership. Preserve intentional save/open/recovery policies."
sections:
  Summary: "Restore ODT transport for existing counted/uncounted Writer list paragraphs with native header versus continuation structure and item-context consumption. Iteration30 under the persistent approved upstream goal."
  Scope: "xmloff text txtparai.ts/txtparae.ts and a source-owned txtlists.ts helper; Writer xmlimp.ts/xmlexp.ts bridges; focused helper/context tests and genuine ODT header/counter roundtrips; writer-odt-format.md and source provenance/runtime inventory; task-local native probes. Existing hierarchical Arabic/bullet lists only. Preserve registered save/open/recovery, ODF1.3, Worker v16 and unchanged mandatory gates. Broader list-style overrides, numbered-paragraph, whole UNO/import ownership, continuous/redline and other model/UI obligations remain separately unverified."
  Plan: "Pass IsCountedInList through the Writer-to-xmloff projection, allow the existing counted WhichId on export, and gate restart/start projection on numbered paragraphs as XMLTextNumRuleInfo does. Track actual open list item/header tags. Native opening uses list-item for skipped ancestors and list-header only at the final unnumbered level; same/decreasing-level unnumbered paragraphs append inside the existing item after closing deeper levels. Add native XMLTextListsHelper ownership for block/item context stack, clear the item signal after its first paragraph and after returning from nested lists, accept header contexts with ignored start values, and remove the current multi-paragraph rejection so subsequent paragraphs become uncounted as upstream. Confirm coupled selection/consumption using compiled unmodified pinned export/helper excerpts with explicit string/UNO/export shims; assert genuine common/automatic ODT states, literal structure, copies, Worker16 and reopen. Run unchanged full gates, record actual code hash, quality review and local task commits."
  Verify Steps: "Reproduce current WhichId87 export failure and prove Worker16/CaptureListItems retain false. Compare list/item/header open-close events and paragraph placement to compiled unmodified pinned exportListChange with explicit bounded export/string/metadata shims; verify native item-stack push/pop/set/top and source-derived first-paragraph consumption/outer clearing. Assert initial and nested headers, skipped ancestors, ordinary counted siblings, uncounted same/shallow continuations, ordinary multi-paragraph items, paragraphs before/after nested lists, ignored malformed/header start, counted restart0 and uncounted restart omission. Genuine common/automatic ODT fixtures must assert literal text/count/level/restart/number/vector/label state, independent owned rule/item copies, Worker16, selected XML structure and reopen for numbered and bullet lists. Run npm run verify unchanged with both100% coverage suites and all browser/source/provenance/ODT gates, ap doctor, routing validator and git diff --check. Record implementation commit and clean final tracked state; no whole-module/full-goal completion claim."
  Verification: "Pending implementation and declared checks. No mandatory gate is skipped."
  Rollback Plan: "Revert only the scoped implementation through a new executable task if needed; keep DONE artifacts immutable and the parent goal active."
  Findings: "Preflight is clean main/direct; only parent202609240501-C9TN6M DOING. Previous turn is progress: iteration29 PHRS94 DONE, implementation dd328458813306a78d7a9c6551ff7d3ec56dadee; quality b8c3529654d82592728796904e0c4625b05d426a; close430b8348921802071a91c4cdb2bc9cd45361b929; parent fb06d9eb1144. Native pin libreoffice-26.8.0.2/9bc445578031fecf56086729d8e4940c77e14d65. Read-only reproduction: false counted flag survives Worker16 and has no marker, but ODT exporter rejects WhichId87. txtparai explicitly rejects header and second paragraph. Native XMLTextNumRuleInfo reads NumberingIsNumber and only reads restart/start when numbered; exportListChange opens header only for final newly opened unnumbered level and appends unnumbered same/decreasing-level paragraphs inside the current item. XMLTextListItemContext accepts header, ignores its start and sets list-item marker only for ordinary items; txtimp consumes this marker after a paragraph, XMLTextListBlockContext clears restored outer marker on nested return. One transport/ownership task covers this coupled contract. No network/outside access or delegation."
id_source: "generated"
---
## Summary

Restore ODT transport for existing counted/uncounted Writer list paragraphs with native header versus continuation structure and item-context consumption. Iteration30 under the persistent approved upstream goal.

## Scope

xmloff text txtparai.ts/txtparae.ts and a source-owned txtlists.ts helper; Writer xmlimp.ts/xmlexp.ts bridges; focused helper/context tests and genuine ODT header/counter roundtrips; writer-odt-format.md and source provenance/runtime inventory; task-local native probes. Existing hierarchical Arabic/bullet lists only. Preserve registered save/open/recovery, ODF1.3, Worker v16 and unchanged mandatory gates. Broader list-style overrides, numbered-paragraph, whole UNO/import ownership, continuous/redline and other model/UI obligations remain separately unverified.

## Plan

Pass IsCountedInList through the Writer-to-xmloff projection, allow the existing counted WhichId on export, and gate restart/start projection on numbered paragraphs as XMLTextNumRuleInfo does. Track actual open list item/header tags. Native opening uses list-item for skipped ancestors and list-header only at the final unnumbered level; same/decreasing-level unnumbered paragraphs append inside the existing item after closing deeper levels. Add native XMLTextListsHelper ownership for block/item context stack, clear the item signal after its first paragraph and after returning from nested lists, accept header contexts with ignored start values, and remove the current multi-paragraph rejection so subsequent paragraphs become uncounted as upstream. Confirm coupled selection/consumption using compiled unmodified pinned export/helper excerpts with explicit string/UNO/export shims; assert genuine common/automatic ODT states, literal structure, copies, Worker16 and reopen. Run unchanged full gates, record actual code hash, quality review and local task commits.

## Verify Steps

Reproduce current WhichId87 export failure and prove Worker16/CaptureListItems retain false. Compare list/item/header open-close events and paragraph placement to compiled unmodified pinned exportListChange with explicit bounded export/string/metadata shims; verify native item-stack push/pop/set/top and source-derived first-paragraph consumption/outer clearing. Assert initial and nested headers, skipped ancestors, ordinary counted siblings, uncounted same/shallow continuations, ordinary multi-paragraph items, paragraphs before/after nested lists, ignored malformed/header start, counted restart0 and uncounted restart omission. Genuine common/automatic ODT fixtures must assert literal text/count/level/restart/number/vector/label state, independent owned rule/item copies, Worker16, selected XML structure and reopen for numbered and bullet lists. Run npm run verify unchanged with both100% coverage suites and all browser/source/provenance/ODT gates, ap doctor, routing validator and git diff --check. Record implementation commit and clean final tracked state; no whole-module/full-goal completion claim.

## Verification

Pending implementation and declared checks. No mandatory gate is skipped.

## Rollback Plan

Revert only the scoped implementation through a new executable task if needed; keep DONE artifacts immutable and the parent goal active.

## Findings

Preflight is clean main/direct; only parent202609240501-C9TN6M DOING. Previous turn is progress: iteration29 PHRS94 DONE, implementation dd328458813306a78d7a9c6551ff7d3ec56dadee; quality b8c3529654d82592728796904e0c4625b05d426a; close430b8348921802071a91c4cdb2bc9cd45361b929; parent fb06d9eb1144. Native pin libreoffice-26.8.0.2/9bc445578031fecf56086729d8e4940c77e14d65. Read-only reproduction: false counted flag survives Worker16 and has no marker, but ODT exporter rejects WhichId87. txtparai explicitly rejects header and second paragraph. Native XMLTextNumRuleInfo reads NumberingIsNumber and only reads restart/start when numbered; exportListChange opens header only for final newly opened unnumbered level and appends unnumbered same/decreasing-level paragraphs inside the current item. XMLTextListItemContext accepts header, ignores its start and sets list-item marker only for ordinary items; txtimp consumes this marker after a paragraph, XMLTextListBlockContext clears restored outer marker on nested return. One transport/ownership task covers this coupled contract. No network/outside access or delegation.
