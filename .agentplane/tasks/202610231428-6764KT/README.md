---
id: "202610231428-6764KT"
title: "Implement upstream font and style dropdown previews for Writer and Calc"
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
  updated_at: "2026-10-23T14:28:58.532Z"
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
    body: "Start: implement user-prioritized source-backed shared Writer/Calc font and style previews using actual browser font capabilities and native style owners; preserve upstream acceptance/visibility and verify focused current-source coverage and browser behavior."
events:
  -
    type: "status"
    at: "2026-10-23T14:29:08.710Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implement user-prioritized source-backed shared Writer/Calc font and style previews using actual browser font capabilities and native style owners; preserve upstream acceptance/visibility and verify focused current-source coverage and browser behavior."
doc_version: 3
doc_updated_at: "2026-10-23T14:29:08.710Z"
doc_updated_by: "CODER"
description: "Nearest user priority after DVQ9ES: implement shared native font dropdown preview behavior in Writer and Calc and real style item-set previews in existing style selectors. Match pinned svtools ctrlbox/sampletext and svx tbcontrl naming, symbol/script samples, glyph availability, fitting, highlight/color and inherited style contracts through real VCL/SVX/native style owners. Changes only in vite-office-writer branch writer. Browser font capability acquisition must use actual browser-exposed data; no fake font support or style registries and no native memory/lifecycle emulation. Include relevant tests and browser acceptance, canonical provenance and generated records. Bound scope up to100 implementation/test/tooling paths plus paired canonical records. Second leaf since full checkpoint; focused verification only. Next priority after this leaf is audit/connect already implemented core commands to toolbar/sidebar/File in upstream positions."
sections:
  Summary: "Implement the user-prioritized native font/style dropdown previews for Writer and Calc using shared browser SVX controls and actual model font/style metadata."
  Scope: "Only /Users/odubinkin/Projects/vite-office-writer on writer, after source74bedef47d19 and close04888fde24fa. Up to100 implementation/test/tooling paths plus paired canonical records and generated views. Pinned svtools/source/control/ctrlbox.cxx,svtools/source/misc/sampletext.cxx and svx/source/tbxctrls/tbcontrl.cxx define preview decisions; actual browser font data and native style item-set inheritance supply state. Preserve browser I/O/autosave deviations, JS object lifetime, upstream visibility/command ownership and source defaults. No network, outside-repo font-file access, merges, new branches, fake glyph-availability tests or independent style stores. Existing Calc hidden StyleApply and missing style execution must be documented and addressed through real owners where required by this UI request, without manufacturing a working command."
  Plan: "Inspect native DrawPreview/sampletext/SvxStyleBox preview and actual current font/style ownership. Implement real browser font capability acquisition and source preview decisions under corresponding VCL/svtools/SVX owners, then shared accessible popup rendering in Writer and Calc. Project style preview attributes from actual native item sets without materializing a parallel style store. Preserve original dropdown acceptance/focus,highlight/disabled state,resource visibility and symbol/script fallback rules. Add source-derived model/parser/control tests and real-browser preview/focus/screenshots at desktop/narrow widths; document source quirks and exact limitations. Update canonical provenance,run focused strict100 coverage and declared gates,commit and close with evaluator evidence. Second leaf after full checkpoint; afterward prioritize already implemented core/UI toolbar/sidebar/File wiring."
  Verify Steps: "Run focused Vitest for font-list/font capability/value/parser/sample-text and SVX controls plus actual Writer/Calc style projections and affected native owners. Cover glyph-missing/symbol/script/name rendering, source sample-selection order, fitting and selection colors, inherited style attributes and disabled/pointer/keyboard/focus/acceptance. Collect source-bound focused strict100 coverage for touched runtime owners without reducing thresholds or adding coverage ignores. Run production build and relevant Chromium dropdown scenarios in both Writer and Calc at desktop/narrow widths, inspect screenshots and browser errors. Run typecheck,scoped format/lint,check:docs,check:dependencies,check:file-size,check:source-tree,check:source-provenance,inventory:registry:build,inventory:invariants,inventory:parity,check:writer-resources,check:calc-resources,static build smoke,ap doctor,routing and diff checks. No full suite on second leaf since prior full checkpoint. Record real source parity limits,source commit,EVALUATOR and clean closure."
  Verification: "Pending implementation; nearest priority explicitly assigned by user. Prior leaf DVQ9ES is closed, worktree clean before this task setup."
  Rollback Plan: "Revert only this task implementation commit; preserve user integration commits,prior leaf and unrelated active tasks. No reset,branch or merge operations."
  Findings: "Existing FontNameSelect uses native HTML select options with fontFamily CSS; platform popup rendering does not provide upstream DrawPreview behavior. Both applications consume this shared widget. Source draws names in own font only when non-symbol and glyph-complete,otherwise uses UI font plus representative native script/symbol sample, shrinking to available height and trimming samples to width. SvxStyleBox preview consumes actual family pool item sets and script-sensitive font attributes. Calc StyleApply is hidden by default in native formatobjectbar resource and its current execute path is not fully implemented; do not infer an available command from metadata. Latest user second priority after this leaf is expose already implemented core commands through toolbar/sidebar/File before deep locale expansion."
id_source: "generated"
---
## Summary

Implement the user-prioritized native font/style dropdown previews for Writer and Calc using shared browser SVX controls and actual model font/style metadata.

## Scope

Only /Users/odubinkin/Projects/vite-office-writer on writer, after source74bedef47d19 and close04888fde24fa. Up to100 implementation/test/tooling paths plus paired canonical records and generated views. Pinned svtools/source/control/ctrlbox.cxx,svtools/source/misc/sampletext.cxx and svx/source/tbxctrls/tbcontrl.cxx define preview decisions; actual browser font data and native style item-set inheritance supply state. Preserve browser I/O/autosave deviations, JS object lifetime, upstream visibility/command ownership and source defaults. No network, outside-repo font-file access, merges, new branches, fake glyph-availability tests or independent style stores. Existing Calc hidden StyleApply and missing style execution must be documented and addressed through real owners where required by this UI request, without manufacturing a working command.

## Plan

Inspect native DrawPreview/sampletext/SvxStyleBox preview and actual current font/style ownership. Implement real browser font capability acquisition and source preview decisions under corresponding VCL/svtools/SVX owners, then shared accessible popup rendering in Writer and Calc. Project style preview attributes from actual native item sets without materializing a parallel style store. Preserve original dropdown acceptance/focus,highlight/disabled state,resource visibility and symbol/script fallback rules. Add source-derived model/parser/control tests and real-browser preview/focus/screenshots at desktop/narrow widths; document source quirks and exact limitations. Update canonical provenance,run focused strict100 coverage and declared gates,commit and close with evaluator evidence. Second leaf after full checkpoint; afterward prioritize already implemented core/UI toolbar/sidebar/File wiring.

## Verify Steps

Run focused Vitest for font-list/font capability/value/parser/sample-text and SVX controls plus actual Writer/Calc style projections and affected native owners. Cover glyph-missing/symbol/script/name rendering, source sample-selection order, fitting and selection colors, inherited style attributes and disabled/pointer/keyboard/focus/acceptance. Collect source-bound focused strict100 coverage for touched runtime owners without reducing thresholds or adding coverage ignores. Run production build and relevant Chromium dropdown scenarios in both Writer and Calc at desktop/narrow widths, inspect screenshots and browser errors. Run typecheck,scoped format/lint,check:docs,check:dependencies,check:file-size,check:source-tree,check:source-provenance,inventory:registry:build,inventory:invariants,inventory:parity,check:writer-resources,check:calc-resources,static build smoke,ap doctor,routing and diff checks. No full suite on second leaf since prior full checkpoint. Record real source parity limits,source commit,EVALUATOR and clean closure.

## Verification

Pending implementation; nearest priority explicitly assigned by user. Prior leaf DVQ9ES is closed, worktree clean before this task setup.

## Rollback Plan

Revert only this task implementation commit; preserve user integration commits,prior leaf and unrelated active tasks. No reset,branch or merge operations.

## Findings

Existing FontNameSelect uses native HTML select options with fontFamily CSS; platform popup rendering does not provide upstream DrawPreview behavior. Both applications consume this shared widget. Source draws names in own font only when non-symbol and glyph-complete,otherwise uses UI font plus representative native script/symbol sample, shrinking to available height and trimming samples to width. SvxStyleBox preview consumes actual family pool item sets and script-sensitive font attributes. Calc StyleApply is hidden by default in native formatobjectbar resource and its current execute path is not fully implemented; do not infer an available command from metadata. Latest user second priority after this leaf is expose already implemented core commands through toolbar/sidebar/File before deep locale expansion.
