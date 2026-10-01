---
id: "202610010247-DWV0NC"
title: "Restore native implicit list restart export ownership"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 12
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-01T02:49:10.789Z"
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
    body: "Start: restore source-owned implicit/direct restart metadata and native conditional list transitions under the persistent approved goal."
events:
  -
    type: "status"
    at: "2026-10-01T02:49:11.644Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: restore source-owned implicit/direct restart metadata and native conditional list transitions under the persistent approved goal."
doc_version: 3
doc_updated_at: "2026-10-01T03:09:46.542Z"
doc_updated_by: "CODER"
description: "Iteration33: preserve independent numbered,restart,direct-start and format-start metadata under XMLTextNumRuleInfo and export native implicit-restart list transitions. Preserve registered save/open/recovery differences."
sections:
  Summary: "Restore native implicit list restart export ownership as iteration33 under the persistent full upstream goal."
  Scope: "sw/source/filter/xml/xmlexp.ts;xmloff/source/text/txtparae.ts,new XMLTextNumRuleInfo.ts and focused metadata/export tests;genuine ODT implicit-restart tests and existing sublist-restart transport assertions;runtime inventory,source provenance,writer-command-slice evidence references if relocation is required,writer-odt-format.md;task-local native probes. Existing resolved numbered/bullet rules and unchanged list identity/style resolution. Preserve Worker16,ODF1.3,save/open/recovery divergences and all gates. Full processed-list identity,continue-numbering,style-override,missing-rule factories,numbered-paragraph,full UNO/helper/native architectures and mobile resize/menu stability remain separate."
  Plan: "Project Writer numbered/restart/direct-start independently: native NumberingStartValue is available only with rule,restart and direct item;do not replace absent direct start with GetActualListStartValue. Add source-named XMLTextNumRuleInfo owning native default/reset,numbered gate,independent restart/start and format start with native sentinel semantics and supported typed property adapter;no compatibility alias or callback imitation. Retain native format-start reset behavior. Integrate its metadata into paragraph list transitions. For counted implicit restart at same/decreasing nested level,close/reopen the text:list without start-value;for same/decreasing root emit format start;for newly opened nested levels and already processed root segments follow pinned conditional fallback;first unprocessed single-level root can omit implicit restart. Direct starts including0 override defaults. Uncounted metadata is suppressed by the native numbered gate. Keep unrelated style/identity behavior unchanged and avoid claiming full helper/UNO parity. Compile unmodified primary exportListChange plus metadata constructor/reset/getters/numbered and format-start snippets with explicit platform/OUString/UNO/property/export/identity/style adapters;compare actual local structural+item-start output across root,nested,gaps,decreasing/re-entry,counted/header,implicit/direct0/other starts. Genuine packages and manually set model states verify literal model state,XML,copies,Worker16 and native reopen projections. Run focused gates first then full unchanged verify,doctor/routing/diff;record actual implementation hash,quality and clean state;keep parent/goal active."
  Verify Steps: "Reproduce current counted implicit restart becoming explicit start at every exported position. Compile unmodified pinned exportListChange and native XMLTextNumRuleInfo constructor/reset/getter/numbered/format-start excerpts with explicit adapters;compare structural list/header/item events plus item start attributes for same/decreasing/root/newnested/skipped levels/processed-root re-entry,all participation states,implicit versus direct0/2/7,number and bullet rules,format-start defaults/signed16 projections and native reset retention. Assert metadata ownership and Writer direct-item getter conditions against primary IsNodeNumStart. Genuine common/automatic ODT and direct model fixtures must assert literal text,count,level,restart,direct/effective starts,counter vectors/labels,list identity,independent owned rule/item copies,Worker16,selected list structure and start attrs,manual native reopen omissions/gains. Update existing repeated-sublist expectations for implicit split retention and newly-opened fallback;no tautological roundtrip claim. Focused parity CLI/provenance validation precedes npm run verify unchanged;both100% coverage suites and all browser/resource/static/source/provenance/invariant gates are mandatory. Run ap doctor,node .agentplane/policy/check-routing.mjs,git diff --check,record real code hash/evaluator pass/final clean state. No gate/schema/threshold changes or whole-module/full-goal promotion."
  Verification: "Pending implementation and declared checks. No mandatory gate skipped."
  Rollback Plan: "If needed revert scoped implementation through a new executable task;keep immutable DONE artifacts and full parent goal active."
  Findings: |-
    Preflight clean main/direct,parent202609240501-C9TN6M only active. Previous goal turn is progress:childZDTVKE DONE,actual codec79a6ff3539469ea8eb8f3ddccdd437adb8eb847,quality78d4586acadc0f009749cebb7092f532b5df01c4,closea6a01d959a356d94cd8b4555a267bc11f24474ab,parentc062bb1a09023fffb306a7fa02733c629499e8ec. Persistent user goal authorizes safe local iterations;no network,outside access or delegation. Pinlibreoffice-26.8.0.2/9bc445578031fecf56086729d8e4940c77e14d65. Primary XMLTextNumRuleInfo::Set gates numbered restart/directstart and reads format StartWith independently;Reset does not reset the format-start field. unocrsrhelper IsNodeNumStart returns direct start only with rule,restart and direct item,else-1. Current xmlexp uses actual start for every counted restart and local XMLTextListSource lacks independent restart;thus no native implicit list split exists. Primary txtparae.cxx1262..1284 splits nested implicit restart and emits root defaults;opening/re-entry1164..1210 uses distinct conditional fallback. Root first unprocessed list can omit implicit restart. Broader style/identity/default/UI obligations remain unverified. Initial read searched nonexistent xmlexp.test.ts; bounded fallback uses actual filter tests and source paths,without fabricated evidence. Prior browser menu/resize failure is preserved in DONE child with3 isolated and final19-scenario pass;do not mutate or rerun its artifacts.

    - Observation: Actual preceding c79a6ff3 Writer/XML modules reproduced implicit starts as explicit5/7. Current actual XML matches2403 primary export sequences and288 metadata states;12 valid Writer projections match the compiled getter contract against48 normative IsNodeNumStart states. Native constructor/reset retains format start and HasStartValue uses only!=-1.
      Impact: The main transitions are source-backed. Raw Writer restart/start properties must reach XMLTextNumRuleInfo before its numbered gate;pre-export validation currently examines startValue before that gate and would reject ignored uncounted values or the native absent-1 sentinel.
      Resolution: Align the supported validation with the approved native numbered/absent-start contract:uncounted start payload is ignored;counted-1 is absence,other supported explicit starts remain0..32767. Add direct metadata/gate/default assertions and genuine XML cases;retain broader negative explicit starts,orphan restart items,UNO query/default factories and identity/style processing as unverified obligations rather than silently claiming parity.

    - Observation: Focused test session61437 terminal exit1:metadata2 tests pass;existing repeated-sublist transport test fails because it expects every counted implicit restart to gain an explicit5. Actual same-level reopened sublists now retain no direct start while restarttrue,matching compiled native split branches.
      Impact: This is the documented former export limitation assertion becoming stale after the approved correction;complete verification is still pending.
      Resolution: Persist active artifacts,replace only the former bounded projection assertion with source-derived explicit per-fixture reopen gains/retention and exact body item-start checks. Add independent genuine root/open/decreasing/re-entry/header/default/zero cases. Keep prior DONE task artifacts immutable and all mandatory gates unchanged.
id_source: "generated"
---
## Summary

Restore native implicit list restart export ownership as iteration33 under the persistent full upstream goal.

## Scope

sw/source/filter/xml/xmlexp.ts;xmloff/source/text/txtparae.ts,new XMLTextNumRuleInfo.ts and focused metadata/export tests;genuine ODT implicit-restart tests and existing sublist-restart transport assertions;runtime inventory,source provenance,writer-command-slice evidence references if relocation is required,writer-odt-format.md;task-local native probes. Existing resolved numbered/bullet rules and unchanged list identity/style resolution. Preserve Worker16,ODF1.3,save/open/recovery divergences and all gates. Full processed-list identity,continue-numbering,style-override,missing-rule factories,numbered-paragraph,full UNO/helper/native architectures and mobile resize/menu stability remain separate.

## Plan

Project Writer numbered/restart/direct-start independently: native NumberingStartValue is available only with rule,restart and direct item;do not replace absent direct start with GetActualListStartValue. Add source-named XMLTextNumRuleInfo owning native default/reset,numbered gate,independent restart/start and format start with native sentinel semantics and supported typed property adapter;no compatibility alias or callback imitation. Retain native format-start reset behavior. Integrate its metadata into paragraph list transitions. For counted implicit restart at same/decreasing nested level,close/reopen the text:list without start-value;for same/decreasing root emit format start;for newly opened nested levels and already processed root segments follow pinned conditional fallback;first unprocessed single-level root can omit implicit restart. Direct starts including0 override defaults. Uncounted metadata is suppressed by the native numbered gate. Keep unrelated style/identity behavior unchanged and avoid claiming full helper/UNO parity. Compile unmodified primary exportListChange plus metadata constructor/reset/getters/numbered and format-start snippets with explicit platform/OUString/UNO/property/export/identity/style adapters;compare actual local structural+item-start output across root,nested,gaps,decreasing/re-entry,counted/header,implicit/direct0/other starts. Genuine packages and manually set model states verify literal model state,XML,copies,Worker16 and native reopen projections. Run focused gates first then full unchanged verify,doctor/routing/diff;record actual implementation hash,quality and clean state;keep parent/goal active.

## Verify Steps

Reproduce current counted implicit restart becoming explicit start at every exported position. Compile unmodified pinned exportListChange and native XMLTextNumRuleInfo constructor/reset/getter/numbered/format-start excerpts with explicit adapters;compare structural list/header/item events plus item start attributes for same/decreasing/root/newnested/skipped levels/processed-root re-entry,all participation states,implicit versus direct0/2/7,number and bullet rules,format-start defaults/signed16 projections and native reset retention. Assert metadata ownership and Writer direct-item getter conditions against primary IsNodeNumStart. Genuine common/automatic ODT and direct model fixtures must assert literal text,count,level,restart,direct/effective starts,counter vectors/labels,list identity,independent owned rule/item copies,Worker16,selected list structure and start attrs,manual native reopen omissions/gains. Update existing repeated-sublist expectations for implicit split retention and newly-opened fallback;no tautological roundtrip claim. Focused parity CLI/provenance validation precedes npm run verify unchanged;both100% coverage suites and all browser/resource/static/source/provenance/invariant gates are mandatory. Run ap doctor,node .agentplane/policy/check-routing.mjs,git diff --check,record real code hash/evaluator pass/final clean state. No gate/schema/threshold changes or whole-module/full-goal promotion.

## Verification

Pending implementation and declared checks. No mandatory gate skipped.

## Rollback Plan

If needed revert scoped implementation through a new executable task;keep immutable DONE artifacts and full parent goal active.

## Findings

Preflight clean main/direct,parent202609240501-C9TN6M only active. Previous goal turn is progress:childZDTVKE DONE,actual codec79a6ff3539469ea8eb8f3ddccdd437adb8eb847,quality78d4586acadc0f009749cebb7092f532b5df01c4,closea6a01d959a356d94cd8b4555a267bc11f24474ab,parentc062bb1a09023fffb306a7fa02733c629499e8ec. Persistent user goal authorizes safe local iterations;no network,outside access or delegation. Pinlibreoffice-26.8.0.2/9bc445578031fecf56086729d8e4940c77e14d65. Primary XMLTextNumRuleInfo::Set gates numbered restart/directstart and reads format StartWith independently;Reset does not reset the format-start field. unocrsrhelper IsNodeNumStart returns direct start only with rule,restart and direct item,else-1. Current xmlexp uses actual start for every counted restart and local XMLTextListSource lacks independent restart;thus no native implicit list split exists. Primary txtparae.cxx1262..1284 splits nested implicit restart and emits root defaults;opening/re-entry1164..1210 uses distinct conditional fallback. Root first unprocessed list can omit implicit restart. Broader style/identity/default/UI obligations remain unverified. Initial read searched nonexistent xmlexp.test.ts; bounded fallback uses actual filter tests and source paths,without fabricated evidence. Prior browser menu/resize failure is preserved in DONE child with3 isolated and final19-scenario pass;do not mutate or rerun its artifacts.

- Observation: Actual preceding c79a6ff3 Writer/XML modules reproduced implicit starts as explicit5/7. Current actual XML matches2403 primary export sequences and288 metadata states;12 valid Writer projections match the compiled getter contract against48 normative IsNodeNumStart states. Native constructor/reset retains format start and HasStartValue uses only!=-1.
  Impact: The main transitions are source-backed. Raw Writer restart/start properties must reach XMLTextNumRuleInfo before its numbered gate;pre-export validation currently examines startValue before that gate and would reject ignored uncounted values or the native absent-1 sentinel.
  Resolution: Align the supported validation with the approved native numbered/absent-start contract:uncounted start payload is ignored;counted-1 is absence,other supported explicit starts remain0..32767. Add direct metadata/gate/default assertions and genuine XML cases;retain broader negative explicit starts,orphan restart items,UNO query/default factories and identity/style processing as unverified obligations rather than silently claiming parity.

- Observation: Focused test session61437 terminal exit1:metadata2 tests pass;existing repeated-sublist transport test fails because it expects every counted implicit restart to gain an explicit5. Actual same-level reopened sublists now retain no direct start while restarttrue,matching compiled native split branches.
  Impact: This is the documented former export limitation assertion becoming stale after the approved correction;complete verification is still pending.
  Resolution: Persist active artifacts,replace only the former bounded projection assertion with source-derived explicit per-fixture reopen gains/retention and exact body item-start checks. Add independent genuine root/open/decreasing/re-entry/header/default/zero cases. Keep prior DONE task artifacts immutable and all mandatory gates unchanged.
