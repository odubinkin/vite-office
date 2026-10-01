---
id: "202610011207-TR9DSM"
title: "Restore native standalone numbering format inheritance and defaults"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 11
origin:
  system: "manual"
depends_on:
  - "202610011119-4H9E82"
tags:
  - "code"
task_kind: "code"
mutation_scope: "code"
verify:
  - "npm run verify"
plan_approval:
  state: "approved"
  updated_at: "2026-10-01T12:09:07.225Z"
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
    body: "Start: authorized iteration44 restores standalone native format inheritance/defaults and marker/font value ownership, with explicit existing assembly and Worker migrations and full verification."
events:
  -
    type: "status"
    at: "2026-10-01T12:09:07.642Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: authorized iteration44 restores standalone native format inheritance/defaults and marker/font value ownership, with explicit existing assembly and Worker migrations and full verification."
doc_version: 3
doc_updated_at: "2026-10-01T12:20:39.451Z"
doc_updated_by: "CODER"
description: "Iteration44: restore SwNumFormat/SvxNumberFormat/SvxNumberType constructor, marker type/glyph/font ownership and value copies; migrate existing command, UNO and Worker assembly and consumers while preserving existing browser and registered I/O behavior."
sections:
  Summary: "Iteration44 restores the existing standalone numbering format ownership and constructor boundary against pinned LibreOffice26.8.0.2 /9bc445578031fecf56086729d8e4940c77e14d65. Previous iteration43 is verified progress; the full existing-runtime/browser goal remains active. Persistent user goal authorizes safe local work."
  Scope: "Canonical editeng SvxNumberType/SvxNumberFormat state, constructors/copies, type/glyph/font/show-symbol/equality and currently supported Arabic/character-special/NONE formatting; native SwNumFormat default/copy constructor with explicit client composition for JS multiple-inheritance boundary. Add source-shaped bounded vcl Font family value ownership and native numeric SvxNumType definitions where needed. Migrate all existing SwNumFormat/SvxNumberFormat constructors, marker/type/font/glyph readers, command factory, UNO and Worker graph-v16 assembly and relevant tests. Source-derived raw-properties adapters retain independent inactive geometry and optional patterns. Update runtime/provenance/source-tree metadata, and add only the native editeng-to-vcl dependency supported by Library_editeng.mk to the dependency checker and relevant test. No general gate weakening, coverage exclusions, policy edits, network, outside-repository access, subagents or registered save/open/recovery changes."
  Plan: |-
    1. Record fresh actual baseline and complete pinned native constructor/property/copy/formatting evidence with exact numeric constants.
    2. Restore the three-level native format hierarchy and supported marker/font value ownership, removing browser kind/property inputs from source constructors; retain only explicit raw-state/command/import assembly adapters.
    3. Migrate existing callers and graph16 compatibility; add source-shaped bounded Font and the single native module dependency when required. Preserve all prior functional expectations unless disproven by actual source contracts. Add differential default/copy/type/font/formatting and boundary tests and precise metadata evidence.
    4. Run unchanged focused/full gates, retain failures and fix only in approved scope. Review actual CODE, finish this atomic owner boundary, and append parent progress. Stop for material scope/security/network drift. Do not close the overall goal.
  Verify Steps: |-
    1. Capture actual pre-edit standalone glyph/type/font state. Extract and execute complete unchanged pinned type/format/Writer constructor, copy, getter/setter, font-family and equality bodies under ASan/UBSan with exact pinned constants and named platform/Font/COW/UNO formatter/null-client adapters. Compare default U+F095, numeric type4/5/6, show-symbol=true, absent bullet font, copy independence, unsigned32 glyphs, font presence including present-empty versus absent and equality of every implemented field. Record unsupported font/graphics/char-style/formatter/static lifetimes without whole-module claims.
    2. Match native supported-number formatting traces including signed32 narrowing, zero, positive, negative, hidden symbols, Arabic/character-special/NONE and value copies; preserve native list-zero behavior and prior40 base/19 ownership/16 valid NONE literal assertions. Maintain the explicitly recorded malformed NONE guard from iteration43.
    3. Migrate all real readers and constructor callers to the native core API or explicit assembly adapter. Preserve existing browser command defaults, genuine ODT and restart expectations and Worker graph16 historical records; transfer numeric core type, raw glyph, optional Font and show-symbol state without conflating absent/present-empty fonts or absent/empty patterns. Test malformed records.
    4. Run focused and full npm run verify with original100% thresholds in both suites, browser/ODT/static/type/lint/docs/file-size/source/provenance/inventory gates. Keep all forbidden dependency/layer checks; the sole additional editeng->vcl edge must cite native Library_editeng.mk and be tested, with no general allowlist relaxation. Run ap doctor, node .agentplane/policy/check-routing.mjs and git diff --check.
    5. Record actual CODE SHA, canonical verification and separate EVALUATOR quality phase. Close only this leaf with clean final checkout, then append parent findings and keep goal active.
  Verification: "Pending implementation and checks. No module-level semantic status or goal promotion is authorized."
  Rollback Plan: "Revert only the eventual implementation commit through a new executable task; preserve immutable baseline, native source identities and failed evidence."
  Findings: |-
    Source SwNumFormat default ctor delegates to SvxNumberFormat(SVX_NUM_ARABIC) and null SwClient; source SvxNumberFormat owns cBullet=SVX_DEF_BULLET=(0xF000+149), optional pBulletFont absent, and inherits SvxNumberType(nType,show=true). Current child instead stores kind/string numberingType/glyph/font and injects browser bullet defaults. Source SetBulletFont copies Font or resets optional presence; native equality compares base fields plus registered client. Existing vcl Font family functionality has no core class yet. Source GetNumStr delegates to the numbering provider; the currently implemented Arabic provider branch uses positive signed32 OUString::number, zero special-cases in SvxNumberType, negative provider requests throw/catch. Full wider numbering families and native UNO/provider/font/client/graphics/static lifetime are not certified by this bounded existing marker family refactor.

    - Observation: Initial typecheck identified a wrong relative editeng->vcl Font import, an unannotated empty/raw property union in the native-shaped constructor, and an obsolete UNO class import after factory migration.
      Impact: No native evidence or verification criteria changed; fixes stay within the approved hierarchy/consumer migration.
      Resolution: Use repository-relative path calculation, annotate the explicit raw position/marker copy record and remove the unused import. Preserve type-initial.log and rerun.
id_source: "generated"
---
## Summary

Iteration44 restores the existing standalone numbering format ownership and constructor boundary against pinned LibreOffice26.8.0.2 /9bc445578031fecf56086729d8e4940c77e14d65. Previous iteration43 is verified progress; the full existing-runtime/browser goal remains active. Persistent user goal authorizes safe local work.

## Scope

Canonical editeng SvxNumberType/SvxNumberFormat state, constructors/copies, type/glyph/font/show-symbol/equality and currently supported Arabic/character-special/NONE formatting; native SwNumFormat default/copy constructor with explicit client composition for JS multiple-inheritance boundary. Add source-shaped bounded vcl Font family value ownership and native numeric SvxNumType definitions where needed. Migrate all existing SwNumFormat/SvxNumberFormat constructors, marker/type/font/glyph readers, command factory, UNO and Worker graph-v16 assembly and relevant tests. Source-derived raw-properties adapters retain independent inactive geometry and optional patterns. Update runtime/provenance/source-tree metadata, and add only the native editeng-to-vcl dependency supported by Library_editeng.mk to the dependency checker and relevant test. No general gate weakening, coverage exclusions, policy edits, network, outside-repository access, subagents or registered save/open/recovery changes.

## Plan

1. Record fresh actual baseline and complete pinned native constructor/property/copy/formatting evidence with exact numeric constants.
2. Restore the three-level native format hierarchy and supported marker/font value ownership, removing browser kind/property inputs from source constructors; retain only explicit raw-state/command/import assembly adapters.
3. Migrate existing callers and graph16 compatibility; add source-shaped bounded Font and the single native module dependency when required. Preserve all prior functional expectations unless disproven by actual source contracts. Add differential default/copy/type/font/formatting and boundary tests and precise metadata evidence.
4. Run unchanged focused/full gates, retain failures and fix only in approved scope. Review actual CODE, finish this atomic owner boundary, and append parent progress. Stop for material scope/security/network drift. Do not close the overall goal.

## Verify Steps

1. Capture actual pre-edit standalone glyph/type/font state. Extract and execute complete unchanged pinned type/format/Writer constructor, copy, getter/setter, font-family and equality bodies under ASan/UBSan with exact pinned constants and named platform/Font/COW/UNO formatter/null-client adapters. Compare default U+F095, numeric type4/5/6, show-symbol=true, absent bullet font, copy independence, unsigned32 glyphs, font presence including present-empty versus absent and equality of every implemented field. Record unsupported font/graphics/char-style/formatter/static lifetimes without whole-module claims.
2. Match native supported-number formatting traces including signed32 narrowing, zero, positive, negative, hidden symbols, Arabic/character-special/NONE and value copies; preserve native list-zero behavior and prior40 base/19 ownership/16 valid NONE literal assertions. Maintain the explicitly recorded malformed NONE guard from iteration43.
3. Migrate all real readers and constructor callers to the native core API or explicit assembly adapter. Preserve existing browser command defaults, genuine ODT and restart expectations and Worker graph16 historical records; transfer numeric core type, raw glyph, optional Font and show-symbol state without conflating absent/present-empty fonts or absent/empty patterns. Test malformed records.
4. Run focused and full npm run verify with original100% thresholds in both suites, browser/ODT/static/type/lint/docs/file-size/source/provenance/inventory gates. Keep all forbidden dependency/layer checks; the sole additional editeng->vcl edge must cite native Library_editeng.mk and be tested, with no general allowlist relaxation. Run ap doctor, node .agentplane/policy/check-routing.mjs and git diff --check.
5. Record actual CODE SHA, canonical verification and separate EVALUATOR quality phase. Close only this leaf with clean final checkout, then append parent findings and keep goal active.

## Verification

Pending implementation and checks. No module-level semantic status or goal promotion is authorized.

## Rollback Plan

Revert only the eventual implementation commit through a new executable task; preserve immutable baseline, native source identities and failed evidence.

## Findings

Source SwNumFormat default ctor delegates to SvxNumberFormat(SVX_NUM_ARABIC) and null SwClient; source SvxNumberFormat owns cBullet=SVX_DEF_BULLET=(0xF000+149), optional pBulletFont absent, and inherits SvxNumberType(nType,show=true). Current child instead stores kind/string numberingType/glyph/font and injects browser bullet defaults. Source SetBulletFont copies Font or resets optional presence; native equality compares base fields plus registered client. Existing vcl Font family functionality has no core class yet. Source GetNumStr delegates to the numbering provider; the currently implemented Arabic provider branch uses positive signed32 OUString::number, zero special-cases in SvxNumberType, negative provider requests throw/catch. Full wider numbering families and native UNO/provider/font/client/graphics/static lifetime are not certified by this bounded existing marker family refactor.

- Observation: Initial typecheck identified a wrong relative editeng->vcl Font import, an unannotated empty/raw property union in the native-shaped constructor, and an obsolete UNO class import after factory migration.
  Impact: No native evidence or verification criteria changed; fixes stay within the approved hierarchy/consumer migration.
  Resolution: Use repository-relative path calculation, annotate the explicit raw position/marker copy record and remove the unused import. Preserve type-initial.log and rerun.
