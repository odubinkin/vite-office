---
id: "202610010536-95XQFH"
title: "Restore Writer numbering transitions on paragraph style changes"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 14
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-01T06:04:35.256Z"
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
    body: "Start: approved persistent parity goal;restore native numbering transitions on explicit paragraph style switches,pooled outline dependencies and exact affected undo state;preserve IO exceptions and all verification gates."
events:
  -
    type: "status"
    at: "2026-10-01T05:38:20.901Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: approved persistent parity goal;restore native numbering transitions on explicit paragraph style switches,pooled outline dependencies and exact affected undo state;preserve IO exceptions and all verification gates."
doc_version: 3
doc_updated_at: "2026-10-01T06:04:32.835Z"
doc_updated_by: "CODER"
description: "Iteration37 of approved persistent parity goal:implement native ChgFormatColl/HandleModifyAtTextNodeFormatChange/HandleApplyTextNodeFormatChange and existing assigned-heading level updates;restore owned rule/list state,outline suppression attributes and exact undo. Preserve registered document IO deviations and unchanged gates."
sections:
  Summary: "Iteration37 restores source-owned numbering transitions when changing the paragraph format collection,including initial attach,rule rebinding,removal/reset,outline empty-rule suppression and existing assigned-heading levels. Preserve existing IO exceptions and audit evidence."
  Scope: "Runtime:sw/source/core/txtnode/ndtxt.ts,doc/fmtcol.ts,doc/number.ts,attr/swatrset.ts,undo/unfmco.ts;sw/inc/hintids.ts;svl/source/items/intitem.ts,new cintitem.ts for native unsigned outline item ownership. Tests:new text-collection-numbering.test.ts,new cintitem tests,existing pool/style/attribute/undo tests and new genuine ODT/Worker style-change test;only source-stale expectations when native evidence proves them. Bounded runtime-inventory/source-provenance,new unsigned-item source mapping and task-local baseline/native/actual comparison artifacts. Full unmodified ChgFormatColl,format-change/apply/reset helpers,ChgTextCollUpdateNum and assigned/empty-outline helpers where implemented;explicit normal shown text/Arabic/bullet/ordinary and already assigned heading collections. Test direct rules,retained IDs,level/restart/count reset,same-style and bSetListLevel default/false,foreign arrays,owned records/membership/vectors/labels,undo/redo and actual ODT/Worker. Footnote indexes,conditional styles,inline heading frames,native fill/spell/history/all callback/redline/lifetime/default-factory machinery remain explicit separate obligations;do not fake their closure. No live-format mutation callback refactor in this explicit style-switch correction. Preserve registered save/open/recovery deviations,Worker16/ODF1.3 and all gates;no blanket parity/default/goal promotion."
  Plan: "1. Persist pre-edit actual baseline. 2. Compile complete pinned collection transition and bounded unsigned/outline contracts,retain explicit adapters and byte identity. 3. Restore native text-node collection/record transitions,pooled outline items,assigned heading levels and native anonymous-namespace helper split ndtxt-format-change.ts. 4. Preserve affected undo history;literal/native/ODT/Worker verification. Necessary compatibility extension from actual ODT failure: new xmloff/source/style/styleexp.ts emits the direct native style:list-style-name and style:default-outline-level attributes;existing xmloff/source/style/xmlstyle.ts and text/txtparai.ts preserve parsed outline state;sw/filter/xml/xmlimp.ts applies existing built-in named rule/outline attributes;xmlexp.ts admits only these now-supported named items and does not reject the assigned heading list level when no numbering rule exists. This is the same style-transition correction and prevents regressions from source-owned pooled heading attributes;do not silently discard items,change IO settings or broaden native layout/history/other styles. Add source-derived literal positive/zero/empty/Outline suppression tests and ODT assertions. 5. Focused checks then unchanged full verify,both100%,doctor/routing/diff,actual implementation commit,evaluator pass and child finish/active parent progress. All prior approved constraints and profile/verification obligations remain. Persistent goal authorizes safe local dependency integration;no network,outside access or subagents."
  Verify Steps: "Run actual baseline before edits showing effective Counters with no owned record after initial style change and effective Bullets with retained Counters record/decimal label after next style. Compile full unmodified pinned ChgFormatColl,HandleModifyAtTextNodeFormatChange,HandleApplyTextNodeFormatChange,lcl_ResetParAttrs,ChgTextCollUpdateNum,empty suppression and supported outline/assigned helpers with explicit no-footnote/no-conditional/no-inline-layout/platform/history dependencies and byte identity;do not rewrite native bodies or replace behavior expectations with local approximations. Compare actual style/node/rule/list/item state for sequences across inherited/direct rules,none/bullet/Arabic/Outline,same style,bSetListLevel default/false,assigned0..9 levels,foreign arrays,empty suppression return,IDs/restart/count/direct overrides and source reset behavior. Assert literal vectors/labels,record identity and rule clients,exact direct attribute/item clones and undo/redo;genuine ODT/Worker packages and reopen exercise the correction. Validate unsigned item defaults/type/ranges/owned cloning against pinned source. Focused tests,lints/types/docs/source-provenance/parity before unchanged npm run verify;all668+existing tests plus additions,both coverage gates100%,browser/static/resource/source/invariant gates unchanged. Doctor,routing,diff,actual code SHA,evaluator pass and clean final checkout. No waived/changed gates or blanket status/default promotion."
  Verification: "Pending actual owner execution and independent native source evidence;previous iteration36 proves owned records only,not paragraph collection transitions."
  Rollback Plan: "Revert only the actual iteration37 implementation commit if contracts fail;preserve task evidence and all prior DONE artifacts. No history rewriting or IO changes."
  Findings: "Preflight clean main/direct,parent C9TN6M only active,no user-instructions. Previous iteration36 verified code14f848e71c7bafc67bc82230343fa9e16b9969ce,full verify32678 exit0,child DONE and parent341367d099ea clean. Current SwContentNode ChgFormatColl only reparents attrs/publishes hint;SwTextNode lacks native override. Actual readonly session96491 confirms first inherited Counters style has no owned record;after manual source AddToList,next Bullets style retains Counters binding/label1. Existing heading assignment metadata lacks native pooled outline level;native ChgTextCollUpdateNum applies it even without a numbered list. Native style removal resets five list attrs;current style undo stores only two style IDs and must preserve affected item history. Persistent goal authorizes safe local correction and lifecycle;no network/outside access or delegation."
id_source: "generated"
---
## Summary

Iteration37 restores source-owned numbering transitions when changing the paragraph format collection,including initial attach,rule rebinding,removal/reset,outline empty-rule suppression and existing assigned-heading levels. Preserve existing IO exceptions and audit evidence.

## Scope

Runtime:sw/source/core/txtnode/ndtxt.ts,doc/fmtcol.ts,doc/number.ts,attr/swatrset.ts,undo/unfmco.ts;sw/inc/hintids.ts;svl/source/items/intitem.ts,new cintitem.ts for native unsigned outline item ownership. Tests:new text-collection-numbering.test.ts,new cintitem tests,existing pool/style/attribute/undo tests and new genuine ODT/Worker style-change test;only source-stale expectations when native evidence proves them. Bounded runtime-inventory/source-provenance,new unsigned-item source mapping and task-local baseline/native/actual comparison artifacts. Full unmodified ChgFormatColl,format-change/apply/reset helpers,ChgTextCollUpdateNum and assigned/empty-outline helpers where implemented;explicit normal shown text/Arabic/bullet/ordinary and already assigned heading collections. Test direct rules,retained IDs,level/restart/count reset,same-style and bSetListLevel default/false,foreign arrays,owned records/membership/vectors/labels,undo/redo and actual ODT/Worker. Footnote indexes,conditional styles,inline heading frames,native fill/spell/history/all callback/redline/lifetime/default-factory machinery remain explicit separate obligations;do not fake their closure. No live-format mutation callback refactor in this explicit style-switch correction. Preserve registered save/open/recovery deviations,Worker16/ODF1.3 and all gates;no blanket parity/default/goal promotion.

## Plan

1. Persist pre-edit actual baseline. 2. Compile complete pinned collection transition and bounded unsigned/outline contracts,retain explicit adapters and byte identity. 3. Restore native text-node collection/record transitions,pooled outline items,assigned heading levels and native anonymous-namespace helper split ndtxt-format-change.ts. 4. Preserve affected undo history;literal/native/ODT/Worker verification. Necessary compatibility extension from actual ODT failure: new xmloff/source/style/styleexp.ts emits the direct native style:list-style-name and style:default-outline-level attributes;existing xmloff/source/style/xmlstyle.ts and text/txtparai.ts preserve parsed outline state;sw/filter/xml/xmlimp.ts applies existing built-in named rule/outline attributes;xmlexp.ts admits only these now-supported named items and does not reject the assigned heading list level when no numbering rule exists. This is the same style-transition correction and prevents regressions from source-owned pooled heading attributes;do not silently discard items,change IO settings or broaden native layout/history/other styles. Add source-derived literal positive/zero/empty/Outline suppression tests and ODT assertions. 5. Focused checks then unchanged full verify,both100%,doctor/routing/diff,actual implementation commit,evaluator pass and child finish/active parent progress. All prior approved constraints and profile/verification obligations remain. Persistent goal authorizes safe local dependency integration;no network,outside access or subagents.

## Verify Steps

Run actual baseline before edits showing effective Counters with no owned record after initial style change and effective Bullets with retained Counters record/decimal label after next style. Compile full unmodified pinned ChgFormatColl,HandleModifyAtTextNodeFormatChange,HandleApplyTextNodeFormatChange,lcl_ResetParAttrs,ChgTextCollUpdateNum,empty suppression and supported outline/assigned helpers with explicit no-footnote/no-conditional/no-inline-layout/platform/history dependencies and byte identity;do not rewrite native bodies or replace behavior expectations with local approximations. Compare actual style/node/rule/list/item state for sequences across inherited/direct rules,none/bullet/Arabic/Outline,same style,bSetListLevel default/false,assigned0..9 levels,foreign arrays,empty suppression return,IDs/restart/count/direct overrides and source reset behavior. Assert literal vectors/labels,record identity and rule clients,exact direct attribute/item clones and undo/redo;genuine ODT/Worker packages and reopen exercise the correction. Validate unsigned item defaults/type/ranges/owned cloning against pinned source. Focused tests,lints/types/docs/source-provenance/parity before unchanged npm run verify;all668+existing tests plus additions,both coverage gates100%,browser/static/resource/source/invariant gates unchanged. Doctor,routing,diff,actual code SHA,evaluator pass and clean final checkout. No waived/changed gates or blanket status/default promotion.

## Verification

Pending actual owner execution and independent native source evidence;previous iteration36 proves owned records only,not paragraph collection transitions.

## Rollback Plan

Revert only the actual iteration37 implementation commit if contracts fail;preserve task evidence and all prior DONE artifacts. No history rewriting or IO changes.

## Findings

Preflight clean main/direct,parent C9TN6M only active,no user-instructions. Previous iteration36 verified code14f848e71c7bafc67bc82230343fa9e16b9969ce,full verify32678 exit0,child DONE and parent341367d099ea clean. Current SwContentNode ChgFormatColl only reparents attrs/publishes hint;SwTextNode lacks native override. Actual readonly session96491 confirms first inherited Counters style has no owned record;after manual source AddToList,next Bullets style retains Counters binding/label1. Existing heading assignment metadata lacks native pooled outline level;native ChgTextCollUpdateNum applies it even without a numbered list. Native style removal resets five list attrs;current style undo stores only two style IDs and must preserve affected item history. Persistent goal authorizes safe local correction and lifecycle;no network/outside access or delegation.
