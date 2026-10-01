---
id: "202610010333-G6MKMP"
title: "Restore native processed list continuation import"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 17
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-01T03:34:09.847Z"
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
    body: "Start: restore source-owned processed continuation and DefaultListId projection under the persistent approved upstream goal;safe local scope and unchanged gates."
events:
  -
    type: "status"
    at: "2026-10-01T03:34:10.554Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: restore source-owned processed continuation and DefaultListId projection under the persistent approved upstream goal;safe local scope and unchanged gates."
doc_version: 3
doc_updated_at: "2026-10-01T03:49:59.639Z"
doc_updated_by: "CODER"
description: "Iteration34: replace list alias map with source-owned processed list records,parse native continue-numbering/root-only identity attributes,resolve chains and DefaultListId projection;preserve registered save/open/recovery differences."
sections:
  Summary: "Restore native processed list continuation import as iteration34 under the persistent full upstream goal;one owner/verification boundary."
  Scope: "Runtime txtlists.ts,XMLTextListBlockContext.ts,XMLTextListItemContext.ts,txtparai.ts,xmltoken.ts and sw/source/filter/xml/xmlimp.ts. Focused helper/context/token/import tests,new genuine ODT continuation test and existing XML/ODT fixtures whose literal identities change under native DefaultListId or timestamp generation. Runtime inventory,source provenance,writer-odt-format.md and task-local native/baseline probes. Preserve Worker16,ODF1.3,save/open/recovery divergences and all gates. Existing resolved Arabic/bullet rules;factory/style-override,OOo build-id/MSO metadata APIs,stable-export environment switch,numbered-paragraph and full UNO/native architecture remain separately unverified."
  Plan: "Replace stream alias/generator bookkeeping with source-owned XMLTextListsHelper processed records:style/continue pair,first-list-to-style-default map,last processed/style and per-style last ID;native query/getter and GetListIdForListBlock projection. Generate list-prefixed timestamp IDs using native DateTime time/date arithmetic via a JS Date clock adapter and native processed collision suffix;do not retain rule-counter IDs or accidentally coalesce explicit/generated IDs. XMLTextListBlockContext keeps own raw ID and separate continuation ID,inherits both at nested levels and ignores nested xml:id/continue-list. Parse exact true continue-numbering at every level;other values request restart and override inherited pending flag. At modern root,generate absent/empty own ID,implicit true continuation connects only the last processed list with matching raw style and different ID;validate known targets and resolve to master;unknown targets clear. Register only new root IDs;duplicates retain prior processed metadata and last-list state. Expose imported SwNumRule.GetDefaultListId through typed XML rule metadata and apply GetListIdForListBlock at paragraph projection,includingfirst-style default remap. Keep existing rule resolution and unsupported factories unchanged. Reproduce actual old failures. Compile unmodified primary block constructor and helper/projection/generator bodies with explicit platform/OUString/token/reference/UNO-property/resolved-rule/modern-no-build-id/noMSO adapters;compare actual SAX trees,raw/effectiveIDs/restarts/helper snapshots and collision/default states. Real common/automatic numbered/bullet ODT fixtures assert literal text,count/level/restart/direct starts,counters/vectors/labels,identity,ownedcopy/Worker16,XML/reopen projections. Update only source-stale literal identity expectations;no roundtrip shortcuts. Focused lint/types/provenance/parity precede full unchanged verify;doctor/routing/diff,actualcodehash/quality/clean closure."
  Verify Steps: "Reproduce old continue-numbering rejection,unknown continuation adoption,nested identity replacement and default-ID omission. Compiled unmodified pinned XMLTextListBlockContext constructor,processed/helper/default projection and GenerateNewListId bodies must match actual local SAX/context behavior for absent/empty/true/false/1/TRUE/whitespace continue values,bothlevels,known/unknown/emptychains,same/differentstyle,duplicate/currentselfIDs,emptylists/pendingheaders,explicitstart0,first/default remap and timestamp collision suffixes;document exact adapters and unsupported legacy/MSO/build-id/factory behavior. Genuine common/automatic numbered/bullet ODT packages verify literal state/counters/vectors/labels,independent rule/items,copies,Worker16,selected export and independent native reopen projection,includingdefaultidentity and siblingchain. Focused tests/lint/typecheck/provenance/parity first. npm run verify unchanged must passboth100%coverage suites and allbrowser/resource/static/docs/source/provenance/invariant gates. ap doctor,node .agentplane/policy/check-routing.mjs,git diff --check;record actual implementation hash,evaluator pass and clean final state. No schema/config/gate weakening,blanket parity/default/whole-goal promotion."
  Verification: "Pending implementation and required native,package and full verification."
  Rollback Plan: "Revert only this task implementation commit if the approved correction regresses supported behavior;retain task evidence and record a new follow-up task. Do not alter prior DONE artifacts."
  Findings: |-
    Previous goal turn is progress:DWV0NC DONE,implementation9ac1779d7b3845eb320d93995d2d2e65dda59809,quality663a7cebe9c10b97f5bcab02198794ba88b7e96a,close4a8aaefeb5e039b8c25633f9095fb36eb6c86179,parentprogressaef4fd95285e. Fresh main/direct clean;parentC9TN6M onlyactive. No gateway.user.instructions. Persistent user goal authorizes safe local iterations without additional pauses;no outside/network/delegation. Pinlibreoffice-26.8.0.2/9bc445578031fecf56086729d8e4940c77e14d65. Current alias map invents unknown continuation IDs and accepts nested identity attrs. TEXT_CONTINUE_NUMBERING token absent. Primary block constructor root-only attrs,exacttrue flag,processedchain validation and default mapping require independentraw/effective identities;SwNumRule alreadyexposesGetDefaultListId butXML typedbridge omitsit. Native GenerateNewListId usesDateTime encodedtime+date andsuffixcollision. Native Time::assemble andDate constructor support JSDate clock projection at millisecondprecision;environment stableexport/legacy/MSO branches have no current APIs and remain separate,notclaimed. Two read-only searches guessed nonexistent txtimp.ts/xmlimp-paragraphs.ts and xmltoken.test.ts;route recomputed and actual files/symbols inspected via rg --files. No mutation or check success was inferred from those failures.

    - Observation: Initial baseline harness exited1 because writeOdtDocument was called without its required metadata.title argument;no runtime source had been edited.
      Impact: No baseline output or implementation conclusion exists yet.
      Resolution: Use the documented writer call with title and reader title,rerun the same bounded package cases;persist harness evidence before runtime edits.

    - Observation: Actual genuine baseline exited0: continue-numbering is ignored as an unknown SAX attribute,not rejected as inferred from assertOnly;unknown target becomes unknown,nested xml:id replaces A with nested,and DefaultListId mapping is absent. Initial text snapshot used nonexistent p.text and is omitted in JSON.
      Impact: The native correction is unchanged;baseline wording and snapshot must report observed behavior,not source-only inference.
      Resolution: Use GetText snapshot and retain actual baseline;compile native token/context behavior before implementation. The planned acceptance covers ignored/rejected attribute failure equally and no gate or scope changes are needed.

    - Observation: Native probe compile session50518 exited1:ASCII OUString adapter lacked constexpr literal support,and full extracted GenerateNewListId also calls comphelper RNG after time/date. Earlier short source read ended before this RNG line.
      Impact: No native result exists yet. Generated IDs must include uniform0..INT_MAX random addition plus collision suffix;timestamp-only implementation would be wrong.
      Resolution: Fix only platform adapters with literal-capable ASCII storage and fixed RNG input;retain the native body unchanged. Runtime generator will use browser uniform31bit random and native time/date arithmetic;tests inject fixed clock/RNG and exercise collisions. This refines the approved native generator within existing scope,without altering pass criteria or legacy/stable-export exclusions.

    - Observation: Compiled native constructor/helper comparison passes3080 sequences/15388 states. Typecheck session34662 exited2 because one constructor statement still uses removed wrapper name state after direct helper refactoring.
      Impact: Native context behavior is supported,but the paragraph item module does not yet typecheck.
      Resolution: Replace the remaining state reference with textLists,rerun focused types/tests;no scope or gate changes. Keep real native output and adapter limitations explicit.

    - Observation: Focused session66042 terminal1:11 tests pass,3 fail only at old literal identities. Generated rule-counter IDs now use native list timestamp/random IDs,and genuine firstroot L now maps to imported rule DefaultListId Restart.
      Impact: The source-derived identity correction intentionally invalidates those expectations;unknown-reference adoption assertion is also stale after root validation. Native3080/15388 context comparison remains passing.
      Resolution: Update only literal identity expectations under native DefaultListId,assert generated IDs as native list-prefixed decimal while exact clock/RNG/collision cases remain in native probe and focused helper tests;make unknown-reference fixture assert its independent own ID. Add independent genuine continuation/default fixtures rather than projecting expected state from actual output.

    - Observation: Broader XML test session13232 terminal1:153 tests pass/37files;one existing real ODT test expects list1 while native first-style default now maps to Numbering 1. Earlier read-only search guessed nonexistent odt-list-start-value.test.ts;rg actual subtree remains authoritative.
      Impact: No additional runtime failure is observed;the remaining old literal identity is stale,while other list counter/style/restart suites pass.
      Resolution: Persist focused failure log;change only this fixture expected paragraph ListId to its existing native rule DefaultListId Numbering 1,retain all counter/rule/text/reopen checks. Run new literal continuation package scenarios and full unchanged gates.
id_source: "generated"
---
## Summary

Restore native processed list continuation import as iteration34 under the persistent full upstream goal;one owner/verification boundary.

## Scope

Runtime txtlists.ts,XMLTextListBlockContext.ts,XMLTextListItemContext.ts,txtparai.ts,xmltoken.ts and sw/source/filter/xml/xmlimp.ts. Focused helper/context/token/import tests,new genuine ODT continuation test and existing XML/ODT fixtures whose literal identities change under native DefaultListId or timestamp generation. Runtime inventory,source provenance,writer-odt-format.md and task-local native/baseline probes. Preserve Worker16,ODF1.3,save/open/recovery divergences and all gates. Existing resolved Arabic/bullet rules;factory/style-override,OOo build-id/MSO metadata APIs,stable-export environment switch,numbered-paragraph and full UNO/native architecture remain separately unverified.

## Plan

Replace stream alias/generator bookkeeping with source-owned XMLTextListsHelper processed records:style/continue pair,first-list-to-style-default map,last processed/style and per-style last ID;native query/getter and GetListIdForListBlock projection. Generate list-prefixed timestamp IDs using native DateTime time/date arithmetic via a JS Date clock adapter and native processed collision suffix;do not retain rule-counter IDs or accidentally coalesce explicit/generated IDs. XMLTextListBlockContext keeps own raw ID and separate continuation ID,inherits both at nested levels and ignores nested xml:id/continue-list. Parse exact true continue-numbering at every level;other values request restart and override inherited pending flag. At modern root,generate absent/empty own ID,implicit true continuation connects only the last processed list with matching raw style and different ID;validate known targets and resolve to master;unknown targets clear. Register only new root IDs;duplicates retain prior processed metadata and last-list state. Expose imported SwNumRule.GetDefaultListId through typed XML rule metadata and apply GetListIdForListBlock at paragraph projection,includingfirst-style default remap. Keep existing rule resolution and unsupported factories unchanged. Reproduce actual old failures. Compile unmodified primary block constructor and helper/projection/generator bodies with explicit platform/OUString/token/reference/UNO-property/resolved-rule/modern-no-build-id/noMSO adapters;compare actual SAX trees,raw/effectiveIDs/restarts/helper snapshots and collision/default states. Real common/automatic numbered/bullet ODT fixtures assert literal text,count/level/restart/direct starts,counters/vectors/labels,identity,ownedcopy/Worker16,XML/reopen projections. Update only source-stale literal identity expectations;no roundtrip shortcuts. Focused lint/types/provenance/parity precede full unchanged verify;doctor/routing/diff,actualcodehash/quality/clean closure.

## Verify Steps

Reproduce old continue-numbering rejection,unknown continuation adoption,nested identity replacement and default-ID omission. Compiled unmodified pinned XMLTextListBlockContext constructor,processed/helper/default projection and GenerateNewListId bodies must match actual local SAX/context behavior for absent/empty/true/false/1/TRUE/whitespace continue values,bothlevels,known/unknown/emptychains,same/differentstyle,duplicate/currentselfIDs,emptylists/pendingheaders,explicitstart0,first/default remap and timestamp collision suffixes;document exact adapters and unsupported legacy/MSO/build-id/factory behavior. Genuine common/automatic numbered/bullet ODT packages verify literal state/counters/vectors/labels,independent rule/items,copies,Worker16,selected export and independent native reopen projection,includingdefaultidentity and siblingchain. Focused tests/lint/typecheck/provenance/parity first. npm run verify unchanged must passboth100%coverage suites and allbrowser/resource/static/docs/source/provenance/invariant gates. ap doctor,node .agentplane/policy/check-routing.mjs,git diff --check;record actual implementation hash,evaluator pass and clean final state. No schema/config/gate weakening,blanket parity/default/whole-goal promotion.

## Verification

Pending implementation and required native,package and full verification.

## Rollback Plan

Revert only this task implementation commit if the approved correction regresses supported behavior;retain task evidence and record a new follow-up task. Do not alter prior DONE artifacts.

## Findings

Previous goal turn is progress:DWV0NC DONE,implementation9ac1779d7b3845eb320d93995d2d2e65dda59809,quality663a7cebe9c10b97f5bcab02198794ba88b7e96a,close4a8aaefeb5e039b8c25633f9095fb36eb6c86179,parentprogressaef4fd95285e. Fresh main/direct clean;parentC9TN6M onlyactive. No gateway.user.instructions. Persistent user goal authorizes safe local iterations without additional pauses;no outside/network/delegation. Pinlibreoffice-26.8.0.2/9bc445578031fecf56086729d8e4940c77e14d65. Current alias map invents unknown continuation IDs and accepts nested identity attrs. TEXT_CONTINUE_NUMBERING token absent. Primary block constructor root-only attrs,exacttrue flag,processedchain validation and default mapping require independentraw/effective identities;SwNumRule alreadyexposesGetDefaultListId butXML typedbridge omitsit. Native GenerateNewListId usesDateTime encodedtime+date andsuffixcollision. Native Time::assemble andDate constructor support JSDate clock projection at millisecondprecision;environment stableexport/legacy/MSO branches have no current APIs and remain separate,notclaimed. Two read-only searches guessed nonexistent txtimp.ts/xmlimp-paragraphs.ts and xmltoken.test.ts;route recomputed and actual files/symbols inspected via rg --files. No mutation or check success was inferred from those failures.

- Observation: Initial baseline harness exited1 because writeOdtDocument was called without its required metadata.title argument;no runtime source had been edited.
  Impact: No baseline output or implementation conclusion exists yet.
  Resolution: Use the documented writer call with title and reader title,rerun the same bounded package cases;persist harness evidence before runtime edits.

- Observation: Actual genuine baseline exited0: continue-numbering is ignored as an unknown SAX attribute,not rejected as inferred from assertOnly;unknown target becomes unknown,nested xml:id replaces A with nested,and DefaultListId mapping is absent. Initial text snapshot used nonexistent p.text and is omitted in JSON.
  Impact: The native correction is unchanged;baseline wording and snapshot must report observed behavior,not source-only inference.
  Resolution: Use GetText snapshot and retain actual baseline;compile native token/context behavior before implementation. The planned acceptance covers ignored/rejected attribute failure equally and no gate or scope changes are needed.

- Observation: Native probe compile session50518 exited1:ASCII OUString adapter lacked constexpr literal support,and full extracted GenerateNewListId also calls comphelper RNG after time/date. Earlier short source read ended before this RNG line.
  Impact: No native result exists yet. Generated IDs must include uniform0..INT_MAX random addition plus collision suffix;timestamp-only implementation would be wrong.
  Resolution: Fix only platform adapters with literal-capable ASCII storage and fixed RNG input;retain the native body unchanged. Runtime generator will use browser uniform31bit random and native time/date arithmetic;tests inject fixed clock/RNG and exercise collisions. This refines the approved native generator within existing scope,without altering pass criteria or legacy/stable-export exclusions.

- Observation: Compiled native constructor/helper comparison passes3080 sequences/15388 states. Typecheck session34662 exited2 because one constructor statement still uses removed wrapper name state after direct helper refactoring.
  Impact: Native context behavior is supported,but the paragraph item module does not yet typecheck.
  Resolution: Replace the remaining state reference with textLists,rerun focused types/tests;no scope or gate changes. Keep real native output and adapter limitations explicit.

- Observation: Focused session66042 terminal1:11 tests pass,3 fail only at old literal identities. Generated rule-counter IDs now use native list timestamp/random IDs,and genuine firstroot L now maps to imported rule DefaultListId Restart.
  Impact: The source-derived identity correction intentionally invalidates those expectations;unknown-reference adoption assertion is also stale after root validation. Native3080/15388 context comparison remains passing.
  Resolution: Update only literal identity expectations under native DefaultListId,assert generated IDs as native list-prefixed decimal while exact clock/RNG/collision cases remain in native probe and focused helper tests;make unknown-reference fixture assert its independent own ID. Add independent genuine continuation/default fixtures rather than projecting expected state from actual output.

- Observation: Broader XML test session13232 terminal1:153 tests pass/37files;one existing real ODT test expects list1 while native first-style default now maps to Numbering 1. Earlier read-only search guessed nonexistent odt-list-start-value.test.ts;rg actual subtree remains authoritative.
  Impact: No additional runtime failure is observed;the remaining old literal identity is stale,while other list counter/style/restart suites pass.
  Resolution: Persist focused failure log;change only this fixture expected paragraph ListId to its existing native rule DefaultListId Numbering 1,retain all counter/rule/text/reopen checks. Run new literal continuation package scenarios and full unchanged gates.
