---
id: "202610011207-TR9DSM"
title: "Restore native standalone numbering format inheritance and defaults"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 22
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
doc_updated_at: "2026-10-01T12:55:48.976Z"
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

    - Observation: type-second.log records one unused migrated SwNumFormat import in unosett.ts.
      Impact: The migrated contract does not yet pass typecheck.
      Resolution: Remove the obsolete value import and rerun typecheck; preserve the failed log. The findings command itself needed its documented structured arguments and was retried without state corruption.

    - Observation: The third typecheck reached the application compilation and reports obsolete value imports plus a missing SvxNumType test import.
      Impact: The tools compile now passes, but migrated application/test imports remain incomplete.
      Resolution: Repair the imports only and rerun typecheck; retain type-third.log as evidence.

    - Observation: The first native format-value harness build fails because this C++20 library removes shared_ptr::unique(). type-fourth.log passes both tool and application compilation.
      Impact: Native Font COW platform adapter must use the supported reference-count query; source bodies are unchanged.
      Resolution: Use use_count() != 1 in the named COW adapter, preserve native-format-build.log, and rebuild with ASan/UBSan.

    - Observation: Both native harnesses execute 21 format-value states and 144 NumberType traces without ASan/UBSan diagnostics. Import migration pushes ndtxt.ts to 1005 lines.
      Impact: The unchanged file-size gate requires a small source-owned caller cleanup; broader native services, Font attributes and registered-client branches remain unverified.
      Resolution: Preserve the literal oracle fixture and failed size log. Keep Font-family assembly inside the editeng transfer adapter so Writer core adds no vcl dependency and existing adapter gates remain strict. Consolidate repeated text-node rule reads to stay within the size limit without exclusions.

    - Observation: Focused36 application tests and6 native-edge boundary tests pass; source provenance passes213 modules and dependency gating passes13 explicit cross-module edges. The second size check reports exactly1000 lines in ndtxt.ts.
      Impact: The preserved strict size gate still rejects the migrated text-node file.
      Resolution: Simplify the bound-rule kind reader through the same native helper using optional lookup. Retain both failed size logs. Generated native debug bundles were inadvertently included in an artifact checkpoint; move them to ignored in-repo tmp and remove their tracked copies, keeping all sources/build/run logs and literal results.

    - Observation: The strict size gate now passes with999 lines; text-node kind projection still uses its actual paragraph level. Native identity enrichment initially used the wrong SwNumFormat copy-parameter name.
      Impact: No caller behavior may be changed merely to reduce source size; source identity matching is exact.
      Resolution: Keep actual-level semantics, consolidate the contiguous imports, correct the source signature to rNumFormat and retain the initial identity failure log before rerunning.

    - Observation: Full verify-initial stops at lint: the decimal-only formatter accepts but does not use its locale parameter. native-identities-second fails because the exact copy signature includes a space after the opening parenthesis and uses rFormat.
      Impact: Both checks must pass before native/state equivalence or task completion can be recorded.
      Resolution: Explicitly consume the bounded adapter locale without changing its decimal behavior, use the exact inspected native signature, preserve both failure logs and rerun the full pipeline.

    - Observation: verify-second passes712 app tests with100% coverage but the inventory CLI rejects a stale SwNumFormat marker in the UNO adapter after constructor assembly migration. Final unchanged native bodies/header methods match21 states and144 strings; doctor reports0 errors and2 pre-existing warnings; routing passes.
      Impact: The full canonical verification is incomplete until evidence references identify the actual migrated implementation.
      Resolution: Update only the UNO local implementation reference to createWriterNumFormat; retain verify-second.log and rerun the unchanged full verify chain. Do not restore unused imports or weaken evidence validation.

    - Observation: verify-third passes712 app,109 inventory and19 browser tests, both100% suites, build and static smoke, then JSDoc rejects one migrated codec opening header and three new test callbacks.
      Impact: The full verification still cannot be recorded as passing.
      Resolution: Move the codec fileoverview before its imports, document the three callbacks, undo unrelated JSON Unicode escaping, preserve verify-third.log and rerun the exact full verify pipeline. Next separate task is supported NONE/bitmap classification: unchanged native IsItemize/IsEnumeration/HasNumber/HasBullet output [[4,true,false],[5,true,false],[6,false,true],[8,false,true]], while real attached local nodes give [[4,true,false],[5,false,false],[6,false,true],[8,false,false]]. The bitmap rendering family remains unimplemented; this is classification evidence only.

    - Observation: verify-fourth exits0 across the full original chain:712 app,109 inventory,19 browser, both100% suites and all gates. Final consumer review finds UNO property assembly drops newly source-owned visibility and present-empty Font state, while native SetNumberingRuleByIndex starts from a full copied format and changes fonts only when a font property is supplied.
      Impact: The approved ownership migration must preserve these fields through real property updates; closing on generic green tests would miss the loss.
      Resolution: Add a regression using actual SwXNumberingRules replacement of an existing hidden format with absent/present-empty/named font values, retain those copied native fields when applying supported properties, then rerun the full unchanged verify chain. This is within the approved actual-caller/ownership scope. Preserve the successful fourth log separately.

    - Observation: The actual UNO regression fails before the fix: a stored hidden native format becomes visible during a suffix/indent-only replacement, while the native method begins with SwNumFormat aFormat(rNumRule.Get(...)).
      Impact: This demonstrates a concrete consumer ownership loss despite the prior full green run.
      Resolution: Copy the previous optional Font and show-symbol flag into the assembled applied format before property setters, preserving other supported property behavior. Keep uno-regression-before.log, rerun that regression and the full required chain.
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

- Observation: type-second.log records one unused migrated SwNumFormat import in unosett.ts.
  Impact: The migrated contract does not yet pass typecheck.
  Resolution: Remove the obsolete value import and rerun typecheck; preserve the failed log. The findings command itself needed its documented structured arguments and was retried without state corruption.

- Observation: The third typecheck reached the application compilation and reports obsolete value imports plus a missing SvxNumType test import.
  Impact: The tools compile now passes, but migrated application/test imports remain incomplete.
  Resolution: Repair the imports only and rerun typecheck; retain type-third.log as evidence.

- Observation: The first native format-value harness build fails because this C++20 library removes shared_ptr::unique(). type-fourth.log passes both tool and application compilation.
  Impact: Native Font COW platform adapter must use the supported reference-count query; source bodies are unchanged.
  Resolution: Use use_count() != 1 in the named COW adapter, preserve native-format-build.log, and rebuild with ASan/UBSan.

- Observation: Both native harnesses execute 21 format-value states and 144 NumberType traces without ASan/UBSan diagnostics. Import migration pushes ndtxt.ts to 1005 lines.
  Impact: The unchanged file-size gate requires a small source-owned caller cleanup; broader native services, Font attributes and registered-client branches remain unverified.
  Resolution: Preserve the literal oracle fixture and failed size log. Keep Font-family assembly inside the editeng transfer adapter so Writer core adds no vcl dependency and existing adapter gates remain strict. Consolidate repeated text-node rule reads to stay within the size limit without exclusions.

- Observation: Focused36 application tests and6 native-edge boundary tests pass; source provenance passes213 modules and dependency gating passes13 explicit cross-module edges. The second size check reports exactly1000 lines in ndtxt.ts.
  Impact: The preserved strict size gate still rejects the migrated text-node file.
  Resolution: Simplify the bound-rule kind reader through the same native helper using optional lookup. Retain both failed size logs. Generated native debug bundles were inadvertently included in an artifact checkpoint; move them to ignored in-repo tmp and remove their tracked copies, keeping all sources/build/run logs and literal results.

- Observation: The strict size gate now passes with999 lines; text-node kind projection still uses its actual paragraph level. Native identity enrichment initially used the wrong SwNumFormat copy-parameter name.
  Impact: No caller behavior may be changed merely to reduce source size; source identity matching is exact.
  Resolution: Keep actual-level semantics, consolidate the contiguous imports, correct the source signature to rNumFormat and retain the initial identity failure log before rerunning.

- Observation: Full verify-initial stops at lint: the decimal-only formatter accepts but does not use its locale parameter. native-identities-second fails because the exact copy signature includes a space after the opening parenthesis and uses rFormat.
  Impact: Both checks must pass before native/state equivalence or task completion can be recorded.
  Resolution: Explicitly consume the bounded adapter locale without changing its decimal behavior, use the exact inspected native signature, preserve both failure logs and rerun the full pipeline.

- Observation: verify-second passes712 app tests with100% coverage but the inventory CLI rejects a stale SwNumFormat marker in the UNO adapter after constructor assembly migration. Final unchanged native bodies/header methods match21 states and144 strings; doctor reports0 errors and2 pre-existing warnings; routing passes.
  Impact: The full canonical verification is incomplete until evidence references identify the actual migrated implementation.
  Resolution: Update only the UNO local implementation reference to createWriterNumFormat; retain verify-second.log and rerun the unchanged full verify chain. Do not restore unused imports or weaken evidence validation.

- Observation: verify-third passes712 app,109 inventory and19 browser tests, both100% suites, build and static smoke, then JSDoc rejects one migrated codec opening header and three new test callbacks.
  Impact: The full verification still cannot be recorded as passing.
  Resolution: Move the codec fileoverview before its imports, document the three callbacks, undo unrelated JSON Unicode escaping, preserve verify-third.log and rerun the exact full verify pipeline. Next separate task is supported NONE/bitmap classification: unchanged native IsItemize/IsEnumeration/HasNumber/HasBullet output [[4,true,false],[5,true,false],[6,false,true],[8,false,true]], while real attached local nodes give [[4,true,false],[5,false,false],[6,false,true],[8,false,false]]. The bitmap rendering family remains unimplemented; this is classification evidence only.

- Observation: verify-fourth exits0 across the full original chain:712 app,109 inventory,19 browser, both100% suites and all gates. Final consumer review finds UNO property assembly drops newly source-owned visibility and present-empty Font state, while native SetNumberingRuleByIndex starts from a full copied format and changes fonts only when a font property is supplied.
  Impact: The approved ownership migration must preserve these fields through real property updates; closing on generic green tests would miss the loss.
  Resolution: Add a regression using actual SwXNumberingRules replacement of an existing hidden format with absent/present-empty/named font values, retain those copied native fields when applying supported properties, then rerun the full unchanged verify chain. This is within the approved actual-caller/ownership scope. Preserve the successful fourth log separately.

- Observation: The actual UNO regression fails before the fix: a stored hidden native format becomes visible during a suffix/indent-only replacement, while the native method begins with SwNumFormat aFormat(rNumRule.Get(...)).
  Impact: This demonstrates a concrete consumer ownership loss despite the prior full green run.
  Resolution: Copy the previous optional Font and show-symbol flag into the assembled applied format before property setters, preserving other supported property behavior. Keep uno-regression-before.log, rerun that regression and the full required chain.
