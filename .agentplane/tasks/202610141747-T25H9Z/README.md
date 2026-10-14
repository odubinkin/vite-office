---
id: "202610141747-T25H9Z"
title: "Implement canonical shared page attribute and native numbering declarations"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 11
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-14T17:48:28.531Z"
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
    body: "Start: port actual shared page value/Any and native numbering declarations for Calc158; retain source name-copy behavior and reuse Any2Bool, no formatting-service or lifetime stubs."
events:
  -
    type: "status"
    at: "2026-10-14T17:49:02.360Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: port actual shared page value/Any and native numbering declarations for Calc158; retain source name-copy behavior and reuse Any2Bool, no formatting-service or lifetime stubs."
doc_version: 3
doc_updated_at: "2026-10-14T17:49:02.360Z"
doc_updated_by: "CODER"
description: "Task138: missing ScDocPool SvxPageItem default dependency. Native page value/default/copy/clone/setters/equality and full typed Any query/put through actual PageStyleLayout enum, existing Any2Bool and real NumberingType declarations/SvxNumType aliases. Original descriptor-name copy omission retained, source quirks recorded. Calc158 real item-set defaults. Existing browser noarg value projection, no new Getter/provider or localization/numbering service fake; no memory machinery."
sections:
  Summary: "Task138 ports missing ScDocPool SvxPageItem values/defaults/copy/equality and complete typed Any behavior, using the actual published PageStyleLayout enum, existing Any2Bool and native NumberingType/SvxNumType declarations. No fake numbering/localization service or extra memory layer. Active UI/ODS critical path, calc checkout only."
  Scope: "At most35source/doc/inventory paths, expected25-30: svx/source/items/pageitem.ts and canonical svx/inc/pageitem.ts exports of actual PageItem/PageUsage only; original PageStyleLayout enum/normal CPPU getter; all76original NumberingType short constants and73original SvxNumType aliases, preserving prior4values; actual svx page member IDs and Calc ATTR_PAGE158. New source-grounded tests and materially related old Writer numbering/shared tests. Complete existing browser noarg pooled-item state projection exposes all4actual fields without inventing a native name getter, allowing original descriptor-name copy omission to be observed. Exact runtime/provenance/capability/calc-core/suspected issues. Localized presentation and default numbering-provider services remain unported, with no stub. SvxSetItem/SfxSetItem and fullDocPool/document/UI/ODS remain pending; no C++generator/build/probe, ABI or allocator/lifetime engine."
  Plan: "Implement native page default Which0/Arabic/portrait/All/emptyname, setters/implicitcopy/Clone/equality, original Any query/put memberbyte+ignoredconvert, layout enum/long fallback, signed16number type and Any2Bool behavior. Preserve descriptor-name omission in copy/equality and unknown-member success/untouched output. Add actual IDL enum/static getter and exact source constants/aliases, real Calc158owned-item test. Complete browser noarg state projection remains distinct from actual Any contract. Related tests and strict raw100whole changedshared/wholeCalc, source gates/boundaries/build/nativepins/hashes/exact35paths/cleancalc. Full run only actual minimumUI+ODS readiness then repairs/pause; Writer-only coverage gaps not repaired."
  Verify Steps: "Source-faithful page defaults, allowed empty/Unicode descriptor names, setters, signed16native numbering enum assignment, PageUsage, copy/Clone and payload equality ignoring Which/descriptor. Browser noarg record contains all4actual fields and exposes original copy-name omission; no invented native getter. Actual PageStyleLayout values/sentinel/coldwarm CPPU type and all76NumberingType declarations/73SvxNumType aliases match pinned source; existing4values unchanged, no formatter/service claim. Real Any query all3members, unknown success/untouched, convertbit/byte truncation, invalid usagefalse/untouched. Put number short/longadmission and narrowing, invalid inputs, bool/long/unsupported Any2Bool paths, layout enum/long fallback/unknown retained/invalidtypefalse, unknown-membertrue/unchanged. Actual Calc158native defaults/owned clones. Strict raw S/B/F/L100 every counterpositive for entire changed shared executable owners; wholeCalc npm run test:coverage:calc100 and related shared/Writer tests, fourreference links absent/restoredfinally. Writer-only changed-owner gaps measured/exempt, no coverage repair.12format/lint/typecheck/docs/size/dependencies/tree/provenance/inventory/routing/doctor/diff gates, boundaries, production build, exact35paths/nativepins/sourcehashes/clean calc. No browser UI change, full localized presentation/numbering-provider services/SetItem/DocPool/document/UI/ODS claim, nativebinaryprobe or full-suite checkpoint."
  Verification: "Pending."
  Rollback Plan: "Revert only intentional task changes through a later authorized task; never reset unrelated work, merge or publish."
  Findings: "Task137 closed clean17ead6d2. Source docpool uses missing SvxPageItem158; pageitem.cxx uses Arabic4/portraitfalse/All3 and copies three scalar fields while descriptor string default-constructs empty. Equality also ignores descriptor, possibly intentional auxiliary presentation state; preserve and document without upstream-bug claim. Native presentation needs real resource and default numbering services, still absent; do not fake them. Existing native SvxNumType aliases reference76actual NumberingType short constants, with73aliasesdeclared. Existing4names retain numeric meanings, no reflected enum consumer found in repository inspection. Shared Any2Bool already exists and must be reused. SetItem move/copy semantics require a separate actual SfxItemSet dependency change; no shallow adoption workaround. Same-agent EVALUATOR not independent; no subagents authorized."
id_source: "generated"
---
## Summary

Task138 ports missing ScDocPool SvxPageItem values/defaults/copy/equality and complete typed Any behavior, using the actual published PageStyleLayout enum, existing Any2Bool and native NumberingType/SvxNumType declarations. No fake numbering/localization service or extra memory layer. Active UI/ODS critical path, calc checkout only.

## Scope

At most35source/doc/inventory paths, expected25-30: svx/source/items/pageitem.ts and canonical svx/inc/pageitem.ts exports of actual PageItem/PageUsage only; original PageStyleLayout enum/normal CPPU getter; all76original NumberingType short constants and73original SvxNumType aliases, preserving prior4values; actual svx page member IDs and Calc ATTR_PAGE158. New source-grounded tests and materially related old Writer numbering/shared tests. Complete existing browser noarg pooled-item state projection exposes all4actual fields without inventing a native name getter, allowing original descriptor-name copy omission to be observed. Exact runtime/provenance/capability/calc-core/suspected issues. Localized presentation and default numbering-provider services remain unported, with no stub. SvxSetItem/SfxSetItem and fullDocPool/document/UI/ODS remain pending; no C++generator/build/probe, ABI or allocator/lifetime engine.

## Plan

Implement native page default Which0/Arabic/portrait/All/emptyname, setters/implicitcopy/Clone/equality, original Any query/put memberbyte+ignoredconvert, layout enum/long fallback, signed16number type and Any2Bool behavior. Preserve descriptor-name omission in copy/equality and unknown-member success/untouched output. Add actual IDL enum/static getter and exact source constants/aliases, real Calc158owned-item test. Complete browser noarg state projection remains distinct from actual Any contract. Related tests and strict raw100whole changedshared/wholeCalc, source gates/boundaries/build/nativepins/hashes/exact35paths/cleancalc. Full run only actual minimumUI+ODS readiness then repairs/pause; Writer-only coverage gaps not repaired.

## Verify Steps

Source-faithful page defaults, allowed empty/Unicode descriptor names, setters, signed16native numbering enum assignment, PageUsage, copy/Clone and payload equality ignoring Which/descriptor. Browser noarg record contains all4actual fields and exposes original copy-name omission; no invented native getter. Actual PageStyleLayout values/sentinel/coldwarm CPPU type and all76NumberingType declarations/73SvxNumType aliases match pinned source; existing4values unchanged, no formatter/service claim. Real Any query all3members, unknown success/untouched, convertbit/byte truncation, invalid usagefalse/untouched. Put number short/longadmission and narrowing, invalid inputs, bool/long/unsupported Any2Bool paths, layout enum/long fallback/unknown retained/invalidtypefalse, unknown-membertrue/unchanged. Actual Calc158native defaults/owned clones. Strict raw S/B/F/L100 every counterpositive for entire changed shared executable owners; wholeCalc npm run test:coverage:calc100 and related shared/Writer tests, fourreference links absent/restoredfinally. Writer-only changed-owner gaps measured/exempt, no coverage repair.12format/lint/typecheck/docs/size/dependencies/tree/provenance/inventory/routing/doctor/diff gates, boundaries, production build, exact35paths/nativepins/sourcehashes/clean calc. No browser UI change, full localized presentation/numbering-provider services/SetItem/DocPool/document/UI/ODS claim, nativebinaryprobe or full-suite checkpoint.

## Verification

Pending.

## Rollback Plan

Revert only intentional task changes through a later authorized task; never reset unrelated work, merge or publish.

## Findings

Task137 closed clean17ead6d2. Source docpool uses missing SvxPageItem158; pageitem.cxx uses Arabic4/portraitfalse/All3 and copies three scalar fields while descriptor string default-constructs empty. Equality also ignores descriptor, possibly intentional auxiliary presentation state; preserve and document without upstream-bug claim. Native presentation needs real resource and default numbering services, still absent; do not fake them. Existing native SvxNumType aliases reference76actual NumberingType short constants, with73aliasesdeclared. Existing4names retain numeric meanings, no reflected enum consumer found in repository inspection. Shared Any2Bool already exists and must be reused. SetItem move/copy semantics require a separate actual SfxItemSet dependency change; no shallow adoption workaround. Same-agent EVALUATOR not independent; no subagents authorized.
