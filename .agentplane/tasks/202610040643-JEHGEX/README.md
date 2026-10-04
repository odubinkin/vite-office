---
id: "202610040643-JEHGEX"
title: "Compose noninteractive Writer default ruler tab markers"
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
  updated_at: "2026-10-04T06:44:39.436Z"
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
    body: "Start: implement approved Writer default-marker preparation/generation/rendering under the standing goal;one absent-upstream test pass and separate static source audits."
events:
  -
    type: "status"
    at: "2026-10-04T06:44:53.372Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implement approved Writer default-marker preparation/generation/rendering under the standing goal;one absent-upstream test pass and separate static source audits."
doc_version: 3
doc_updated_at: "2026-10-04T06:44:53.372Z"
doc_updated_by: "CODER"
description: "Iteration94: match Writer tab-state normalization and SvxRuler default-marker generation using effective tab distance, document-relative origin and paragraph right boundary. Render source-shaped Default glyphs without hit targets or model changes. Preserve general paragraph tab metadata,raw-index editing,undo and registered I/O deviations. One absent-upstream test pass;separate static source audits."
sections:
  Summary: "Iteration94 implements the missing noninteractive Writer Default tab markers through the complete inspected Writer-to-SvxRuler preparation: exclude stored Default/zero from ruler inputs without changing model/paragraph-format positions; resolve effective document/item spacing and relative-origin flag; generate the native grid/buffer/right-bound positions and draw Default rectangles at DPI1."
  Scope: |-
    apps/office/src/sw/browser/presentation/WriterRulers.tsx
    apps/office/src/sw/browser/presentation/writer-view-projection.ts
    apps/office/src/sw/browser/presentation/writer-view-ruler-default-tabs.test.tsx
    apps/office/e2e/writer-ruler-default-tabs.spec.ts
    docs/program/source-provenance.json
    docs/program/parity/runtime-inventory.json
    Exactly6semantic paths plus canonical leaf/parent records and bounded hashes/results/conclusions. All290prior tests byte-identical;220rows per manifest retain order/status/default/owner/exceptions with2append-only existing-row updates. No new runtime modules or core edits. New optional immutable ruler settings have canonical1134/relative=true defaults for detached projections; actual Writer projects live effective settings. Include existing TABS_RELATIVE_TO_INDENT in explicit marker/add origin so default/explicit composition share one source origin. Preserve all model metadata/history and general paragraph tab positions. No selector/RTL feature,I/O/recovery changes,network/global/outside access,source/native execution or Agentplane helpers/sources/raw diagnostics.
  Plan: "Under the standing goal implement one default-marker composition correction: project immutable effective spacing/origin settings,retain raw index mapping while excluding zero/Default ruler inputs,keep general paragraph positions unchanged;generate native rounded-pixel buffer/grid/default markers and source-shaped Default SVG with no hit target;share source origin with existing explicit display/add conversion. Add owned actual Writer/DOM/Undo and Chromium desktop/mobile regressions without modifying290prior tests;append2existing manifest rows without promotion;run single absent-upstream suites plus separate static audits and exact-SHA evaluator/finish."
  Verify Steps: "Read ap task verify-show. Read pinned SwView StateTabWin/lcl_EraseDefTabs,GetTabDist,SvxRuler UpdateTabs/SetDefTabDist,Ruler Default glyph/hit rules and VCL lcl_logicToPixel;store5hashes/paths/markers/conclusions only. No native execution or pre-fix/focused test baselines. Run format:check,lint,typecheck,check:dependencies,test:static(build/static only),check:docs,check:file-size. Rename vendor/libreoffice-reference inside vendor;run npm run test once(app/inventory coverage),npm exec -- vitest run scripts/check-source-provenance.test.ts scripts/writer-ui-resource-model.test.ts once,and npm run test:e2e once;restore finally. Rerun only failed corrected gates with upstream unavailable for tests;no passing suite/source-present duplicate. After restore run generator --check,source-tree,provenance,invariants,parity CLI separately. Require all pass,app/inventory4coverage metrics100%,semantic violations0. Owned evidence covers Default/zero normalization vs general paragraph/model preservation,default fallback/override/zero normalization,relative origin true/false,positive/negative/empty/overflow/subpixel inputs,grid phase,16-bit native buffer and strict right boundary,DPI1 signed rounding,noninteractive glyph geometry,no rendering-induced history,actual accepted insertion/cancel/undo/default reprojection and desktop/mobile Chromium snapshots/input. Integrity proves6paths/290oldtests identical/220rows2append-only/no promotion/5sourcehashes unchanged;ignored-inclusive Agentplane audit forbidden sources/helpers/Python/native/archive/raw frames0. Routing/doctor pass. Same-actor separate EVALUATOR on actual semantic SHA;finish cleancheckout,keep parent/fullgoal active."
  Verification: "Pending final single absent-upstream verification and separate static audits;no tests run in this iteration."
  Rollback Plan: "Revert isolated semantic commit if needed;restore temporarily renamed vendor in finally. Preserve bounded evidence;no history rewrite."
  Findings: "Previous goal turn is verified progress:iteration93DONE semantic9cb169bb,currentcleanmainae6f72df. Follow-up source clarification:generic SvxRuler can display supplied Default stops,but Writer SwView removes stored Default and allzero stops first;document GetTabDist(firststop or1134),SetDefTabDist(zero->1),item nonzero DefaultDistance override and TABS_RELATIVE_TO_INDENT govern generation. Supersede the prior parent inference that Writer directly displays stored defaults. Current browser shows no generated defaults and always uses text-left origin;implemented model supports the origin flag. Match inspected DPI1/CSS96dpi llround and buffer/grid/strictbound arithmetic,including negative source-domain values/16-bit count without arbitrary safety caps. Do not claim full native RTL/vertical/theme/platformDPI/snap/selector/capture/paragraph-page selection/hitpriority/complete Writer parity. Registered save/open/recovery exceptions unchanged."
id_source: "generated"
---
## Summary

Iteration94 implements the missing noninteractive Writer Default tab markers through the complete inspected Writer-to-SvxRuler preparation: exclude stored Default/zero from ruler inputs without changing model/paragraph-format positions; resolve effective document/item spacing and relative-origin flag; generate the native grid/buffer/right-bound positions and draw Default rectangles at DPI1.

## Scope

apps/office/src/sw/browser/presentation/WriterRulers.tsx
apps/office/src/sw/browser/presentation/writer-view-projection.ts
apps/office/src/sw/browser/presentation/writer-view-ruler-default-tabs.test.tsx
apps/office/e2e/writer-ruler-default-tabs.spec.ts
docs/program/source-provenance.json
docs/program/parity/runtime-inventory.json
Exactly6semantic paths plus canonical leaf/parent records and bounded hashes/results/conclusions. All290prior tests byte-identical;220rows per manifest retain order/status/default/owner/exceptions with2append-only existing-row updates. No new runtime modules or core edits. New optional immutable ruler settings have canonical1134/relative=true defaults for detached projections; actual Writer projects live effective settings. Include existing TABS_RELATIVE_TO_INDENT in explicit marker/add origin so default/explicit composition share one source origin. Preserve all model metadata/history and general paragraph tab positions. No selector/RTL feature,I/O/recovery changes,network/global/outside access,source/native execution or Agentplane helpers/sources/raw diagnostics.

## Plan

Under the standing goal implement one default-marker composition correction: project immutable effective spacing/origin settings,retain raw index mapping while excluding zero/Default ruler inputs,keep general paragraph positions unchanged;generate native rounded-pixel buffer/grid/default markers and source-shaped Default SVG with no hit target;share source origin with existing explicit display/add conversion. Add owned actual Writer/DOM/Undo and Chromium desktop/mobile regressions without modifying290prior tests;append2existing manifest rows without promotion;run single absent-upstream suites plus separate static audits and exact-SHA evaluator/finish.

## Verify Steps

Read ap task verify-show. Read pinned SwView StateTabWin/lcl_EraseDefTabs,GetTabDist,SvxRuler UpdateTabs/SetDefTabDist,Ruler Default glyph/hit rules and VCL lcl_logicToPixel;store5hashes/paths/markers/conclusions only. No native execution or pre-fix/focused test baselines. Run format:check,lint,typecheck,check:dependencies,test:static(build/static only),check:docs,check:file-size. Rename vendor/libreoffice-reference inside vendor;run npm run test once(app/inventory coverage),npm exec -- vitest run scripts/check-source-provenance.test.ts scripts/writer-ui-resource-model.test.ts once,and npm run test:e2e once;restore finally. Rerun only failed corrected gates with upstream unavailable for tests;no passing suite/source-present duplicate. After restore run generator --check,source-tree,provenance,invariants,parity CLI separately. Require all pass,app/inventory4coverage metrics100%,semantic violations0. Owned evidence covers Default/zero normalization vs general paragraph/model preservation,default fallback/override/zero normalization,relative origin true/false,positive/negative/empty/overflow/subpixel inputs,grid phase,16-bit native buffer and strict right boundary,DPI1 signed rounding,noninteractive glyph geometry,no rendering-induced history,actual accepted insertion/cancel/undo/default reprojection and desktop/mobile Chromium snapshots/input. Integrity proves6paths/290oldtests identical/220rows2append-only/no promotion/5sourcehashes unchanged;ignored-inclusive Agentplane audit forbidden sources/helpers/Python/native/archive/raw frames0. Routing/doctor pass. Same-actor separate EVALUATOR on actual semantic SHA;finish cleancheckout,keep parent/fullgoal active.

## Verification

Pending final single absent-upstream verification and separate static audits;no tests run in this iteration.

## Rollback Plan

Revert isolated semantic commit if needed;restore temporarily renamed vendor in finally. Preserve bounded evidence;no history rewrite.

## Findings

Previous goal turn is verified progress:iteration93DONE semantic9cb169bb,currentcleanmainae6f72df. Follow-up source clarification:generic SvxRuler can display supplied Default stops,but Writer SwView removes stored Default and allzero stops first;document GetTabDist(firststop or1134),SetDefTabDist(zero->1),item nonzero DefaultDistance override and TABS_RELATIVE_TO_INDENT govern generation. Supersede the prior parent inference that Writer directly displays stored defaults. Current browser shows no generated defaults and always uses text-left origin;implemented model supports the origin flag. Match inspected DPI1/CSS96dpi llround and buffer/grid/strictbound arithmetic,including negative source-domain values/16-bit count without arbitrary safety caps. Do not claim full native RTL/vertical/theme/platformDPI/snap/selector/capture/paragraph-page selection/hitpriority/complete Writer parity. Registered save/open/recovery exceptions unchanged.
