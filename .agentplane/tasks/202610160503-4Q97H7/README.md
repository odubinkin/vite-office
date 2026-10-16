---
id: "202610160503-4Q97H7"
title: "Implement general language-tag grammar and canonicalization"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 5
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-16T05:05:33.521Z"
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
    body: "Start: implement connected normal tag values,registered grammar,canonicalizer,extension container and t callbacks from pinned source;reuse actual completed scanner/IANA/CLDR/u owners."
events:
  -
    type: "status"
    at: "2026-10-16T05:05:39.272Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implement connected normal tag values,registered grammar,canonicalizer,extension container and t callbacks from pinned source;reuse actual completed scanner/IANA/CLDR/u owners."
doc_version: 3
doc_updated_at: "2026-10-16T05:05:39.272Z"
doc_updated_by: "CODER"
description: "Task196: connect actual pinned liblangtag normal tag value/state/parser/canonicalizer,extension container and t callback to the completed scanner/IANA/CLDR/u owners. Preserve observable native semantics and use JS GC;no partial successful parser or fake LanguageTag."
sections:
  Summary: "Task196 connects the actual normal liblangtag tag value/state/parser/canonicalizer,extension container and transform callback,using completed scanner/IANA/CLDR/Unicode callback owners. This closes the general parsing dependency rather than adding another disconnected successful facade."
  Scope: "Only vite-office-calc branch calc. Up to38 non-task files: actual lt-tag normal lifecycle/value/cache/filter/copy/truncate/comparison owner,parser and canonicalizer responsibility splits,extension container/default callbacks and t callback,source-derived/native QA tests,real browser/Worker evidence,truthful runtime/provenance/capability records and Calc readiness/suspected-issue documentation. Preserve real fields/state/defaults,cached-string side effects,registered/prefix/extension grammar,CLDR ordered alias/redundant/preferred/suppress behavior and source callback aliasing under JS GC. Native function recursion may use delayed ES-module references inside one external owner;no import-graph guard changes. No native compilation/generators/physical ownership engine,network,localized UI labels,fake public LanguageTag,whole-library wildcard matching/locale conversion/maximization API or full all-app run. Outer LibreOffice LanguageTag and Font/defaults/pools/model/UI/ODS remain later required work. Standing user approval covers this core/shared implementation."
  Plan: "Implement connected normal native tag values/lifecycle/grammar/canonicalization,extension/default and t callbacks using existing real scanner/IANA/CLDR/u owners. Verify original QA plus strict shared/Calc raw100,source pins,13gates and actual browser/Worker without5refs;record/review and finish only complete approved scope. Outer LanguageTag/UI/ODS remain pending."
  Verify Steps: |-
    - node output/playwright/task196-checks/native-audit.mjs: pinned source/data hashes,normal parser/canonical/t/default/container responsibilities and literal original QA vectors,unchanged existing scalar/data owners;no executed native oracle or generator.
    - node output/playwright/task196-checks/portable.mjs: related normal grammar/canonical/lifecycle/t/u/registry tests plus wholeCalc with all5reference links absent/restored;exact declared changed/new shared executable owners and36Calc owners strict raw S/B/F/L100 with every counter positive. Writer-only gaps exempt if present.
    - node output/playwright/task196-checks/browser-portable.mjs: production build and actual Chromium/DOM-free Worker complete normal parser/canonical/t values with5source refs absent/restored;selected Writer functional smoke.
    - node output/playwright/task196-checks/source-gates.mjs: all13existing gates including inventory/provenance/boundaries/routing/doctor;unchanged guard algorithms and no exemptions.
    - node output/playwright/task196-checks/final-audit.mjs: exact scope/owner/source/ref/QA evidence;truthful outer LanguageTag/Font/pool/document/UI/ODS gaps. Record verification,source commit,same-agent EVALUATOR review and descriptive finish;leave unfinished task active if approved connected scope is not verified.
  Verification: "Pending implementation and declared checks."
  Rollback Plan: "Revert only this task source/registry/test/doc commit. Preserve all earlier shared owners,data,upstream source links and unrelated user/task changes. No reset,merge or destructive cleanup."
  Findings: "Previous goal turn made authoritative progress:task195 completed Unicode callbacks and pinned CLDR source values with portable raw100 coverage. Current preflight confirms clean calc branch. Original _lt_tag_parse_state invokes canonicalization for variant prefixes;canonicalization and t callbacks recursively invoke the normal parser. Implement this actual responsibility group coherently;do not substitute a fake parser/canonical backend. Only normal language-tag parsing is in scope;wildcard matching and locale transformation APIs are not claimed."
id_source: "generated"
---
## Summary

Task196 connects the actual normal liblangtag tag value/state/parser/canonicalizer,extension container and transform callback,using completed scanner/IANA/CLDR/Unicode callback owners. This closes the general parsing dependency rather than adding another disconnected successful facade.

## Scope

Only vite-office-calc branch calc. Up to38 non-task files: actual lt-tag normal lifecycle/value/cache/filter/copy/truncate/comparison owner,parser and canonicalizer responsibility splits,extension container/default callbacks and t callback,source-derived/native QA tests,real browser/Worker evidence,truthful runtime/provenance/capability records and Calc readiness/suspected-issue documentation. Preserve real fields/state/defaults,cached-string side effects,registered/prefix/extension grammar,CLDR ordered alias/redundant/preferred/suppress behavior and source callback aliasing under JS GC. Native function recursion may use delayed ES-module references inside one external owner;no import-graph guard changes. No native compilation/generators/physical ownership engine,network,localized UI labels,fake public LanguageTag,whole-library wildcard matching/locale conversion/maximization API or full all-app run. Outer LibreOffice LanguageTag and Font/defaults/pools/model/UI/ODS remain later required work. Standing user approval covers this core/shared implementation.

## Plan

Implement connected normal native tag values/lifecycle/grammar/canonicalization,extension/default and t callbacks using existing real scanner/IANA/CLDR/u owners. Verify original QA plus strict shared/Calc raw100,source pins,13gates and actual browser/Worker without5refs;record/review and finish only complete approved scope. Outer LanguageTag/UI/ODS remain pending.

## Verify Steps

- node output/playwright/task196-checks/native-audit.mjs: pinned source/data hashes,normal parser/canonical/t/default/container responsibilities and literal original QA vectors,unchanged existing scalar/data owners;no executed native oracle or generator.
- node output/playwright/task196-checks/portable.mjs: related normal grammar/canonical/lifecycle/t/u/registry tests plus wholeCalc with all5reference links absent/restored;exact declared changed/new shared executable owners and36Calc owners strict raw S/B/F/L100 with every counter positive. Writer-only gaps exempt if present.
- node output/playwright/task196-checks/browser-portable.mjs: production build and actual Chromium/DOM-free Worker complete normal parser/canonical/t values with5source refs absent/restored;selected Writer functional smoke.
- node output/playwright/task196-checks/source-gates.mjs: all13existing gates including inventory/provenance/boundaries/routing/doctor;unchanged guard algorithms and no exemptions.
- node output/playwright/task196-checks/final-audit.mjs: exact scope/owner/source/ref/QA evidence;truthful outer LanguageTag/Font/pool/document/UI/ODS gaps. Record verification,source commit,same-agent EVALUATOR review and descriptive finish;leave unfinished task active if approved connected scope is not verified.

## Verification

Pending implementation and declared checks.

## Rollback Plan

Revert only this task source/registry/test/doc commit. Preserve all earlier shared owners,data,upstream source links and unrelated user/task changes. No reset,merge or destructive cleanup.

## Findings

Previous goal turn made authoritative progress:task195 completed Unicode callbacks and pinned CLDR source values with portable raw100 coverage. Current preflight confirms clean calc branch. Original _lt_tag_parse_state invokes canonicalization for variant prefixes;canonicalization and t callbacks recursively invoke the normal parser. Implement this actual responsibility group coherently;do not substitute a fake parser/canonical backend. Only normal language-tag parsing is in scope;wildcard matching and locale transformation APIs are not claimed.
