---
id: "202610160119-EC0NT5"
title: "Implement native Calc document calculation options"
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
  updated_at: "2026-10-16T01:20:33.551Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-10-16T01:32:23.390Z"
  updated_by: "CODER"
  note: "19related/192Calc pass;exact6related(4shared+2Calc)/35Calc owners raw S/B/F/L100,every counter positive.13gates,9native pins,285locale fields,1950schema,17comparison fields,unchanged prior locale/shared/Writer/guard;build and real Chromium/DOM-free Worker/Writer pass,4refs restored. CALC171/172 retained;full UI/ODS pending,no all-app run."
  attempts: 0
commit: null
comments:
  -
    author: "CODER"
    body: "Start: implement actual document calculation options and item using native defaults and reused shared SearchParam/locale/pool values;verify exact related and Calc raw100."
events:
  -
    type: "status"
    at: "2026-10-16T01:20:33.958Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implement actual document calculation options and item using native defaults and reused shared SearchParam/locale/pool values;verify exact related and Calc raw100."
  -
    type: "verify"
    at: "2026-10-16T01:32:23.390Z"
    author: "CODER"
    state: "ok"
    note: "19related/192Calc pass;exact6related(4shared+2Calc)/35Calc owners raw S/B/F/L100,every counter positive.13gates,9native pins,285locale fields,1950schema,17comparison fields,unchanged prior locale/shared/Writer/guard;build and real Chromium/DOM-free Worker/Writer pass,4refs restored. CALC171/172 retained;full UI/ODS pending,no all-app run."
doc_version: 3
doc_updated_at: "2026-10-16T01:32:23.442Z"
doc_updated_by: "CODER"
description: "Task185: implement actual ScDocOptions/ScTpCalcItem required by eager ScPoolHelper document construction,shared locale measurement binding and source schema date defaults;reuse SearchParam."
sections:
  Summary: "Implement actual Calc ScDocOptions value owner and ScTpCalcItem required by document pool helper construction,including native defaults,copy,search-mode state transitions and comparison."
  Scope: "Calc docoptio source/header/tests;shared source locale measurement field/resource and system-locale reuse,SVL formatter default-value responsibility/resource,necessary actual native dependency edge metadata,inventory/provenance/readiness/suspicion journal and actual browser/Worker test. Maximum50non-task paths. Reuse SearchParam,Locale,OUString,SfxPoolItem. No fake document/pool/formatter/service,physical memory engine,native compiler,network or full all-app run. Full configuration services and number formatting remain pending;bind only current shipped source configuration fields."
  Plan: "Implement documented Task185 document calculation options and required real shared default/locale bindings under standing user approval."
  Verify Steps: "Pin docoptio.hxx/cxx,optutil.cxx,textsearch.hxx,locale-data sources/wrapper/schema and formatter defaults. Verify all ScDocOptions defaults,US/metric tab distance,1950schema date threshold,all getters/setters/native integer widths,date output slots,copy/assignment/self-assignment,equality short-circuit at each represented field,ignored linebreak field,search cached-mode normalization and flag no-op transitions;reuse actual SearchParam. ScTpCalcItem real base Which/copy/Clone/borrowed const options/equality. Reconstruct all shipped LC_CTYPE measurement fields with recursive ref resolution and prove exact source table;keep existing decimal field results and canonical locale fallback order. Related shared and whole Calc raw S/B/F/L100,every raw counter positive,exact owner sets;Writer-only gaps exempt.13source gates,production build,actual Chromium/dedicated DOM-free Worker options values and Writer startup/load/edit,4reference links absent/restored. No native compiler/probe or all-app run."
  Verification: |-
    Command: node output/playwright/task185-checks/portable.mjs. Result:pass. Evidence:19related tests/6files and192Calc/77files;exact6related owners(4shared+2Calc) raw S174/B81/F56/L169100,and35Calc S4300/B2768/F862/L3847100,every raw counter positive;no coverage filtering or Writer-only repair. Command: node output/playwright/task185-checks/native-audit.mjs. Result:pass. Evidence:9native blobs pinned,285LC_CTYPE measurement fields/ref chains exact,normal Common schema year1950 exact,all17native comparison fields/order exact;existing locale lookup/fallback/system Locale/unicode algorithms preserved,shared SearchParam/decimal resources/Writer ODF/guard byte-identical. Closed-state flag invariant proves folded both-true conjunct unreachable. Command: node output/playwright/task185-checks/build-browser-portable.mjs. Result:pass. Evidence:production build,actual Chromium and dedicated DOM-free Worker defaults/copies/lazy-cache/item checks,Writer startup/load/edit;4refs absent/restored.13source gates pass;final audit requires exact executable owner sets and <=50non-task paths. Native comparison/cache and UK mapping documented as CALC171/172. New dedicated Calc capability describes this bounded value owner;full live configuration/ScDocCfg/formatter,pools and document/UI/same-model ODS remain pending. No native compiler/probe,memory engine or all-app run.

    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-10-16T01:32:23.390Z — VERIFY — ok

    By: CODER

    Note: 19related/192Calc pass;exact6related(4shared+2Calc)/35Calc owners raw S/B/F/L100,every counter positive.13gates,9native pins,285locale fields,1950schema,17comparison fields,unchanged prior locale/shared/Writer/guard;build and real Chromium/DOM-free Worker/Writer pass,4refs restored. CALC171/172 retained;full UI/ODS pending,no all-app run.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-16T01:31:45.632Z, excerpt_hash=sha256:e8f30f107a38eae9390508247402d526473bc7711bc0d0bcb0e63bc41f12243b

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202610160119-EC0NT5/blueprint/resolved-snapshot.json
    - old_digest: 078f68df31f6dc86df906075515763b4269f7f21411ebe14d7b48e8239610800
    - current_digest: 078f68df31f6dc86df906075515763b4269f7f21411ebe14d7b48e8239610800
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202610160119-EC0NT5

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202610160119-EC0NT5
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: false
    - repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert only Task185 source and task commits;preserve calc branch,other tasks and4reference symlinks. No merge/history rewrite,guard weakening or unrelated Writer-only coverage repairs."
  Findings: |-
    ScDocOptions is eagerly default-constructed inside ScPoolHelper and carries required document calculation/search/null-date settings. Source normal default reads Common/DateFormat/TwoDigitYear1950;1930 occurs only in fuzzing. Native comparison omits bIgnoreLineBreaks and compares cached eFormulaSearchType directly;preserve and document without declaring an upstream bug.

    - Observation: Lint rejects a utility class containing only the native static IsMetricSystem member.
      Impact: The represented operation is a static namespace responsibility with no instance state.
      Resolution: Use the existing TypeScript utility namespace object pattern retaining ScOptionsUtil.IsMetricSystem and native operation;no suppression or invented instances.

    - Observation: Typecheck caught test construction of protected SfxPoolItem;Vitest transpilation did not enforce the protected constructor.
      Impact: Cross-type rejection scenario needs a real publicly constructible native derived item.
      Resolution: Use actual shared SfxBoolItem for cross-type equality test;no fake item or base access relaxation.

    - Observation: Provenance rejects a redundant filename-divergence entry for localedatawrapper.ts whose source basename already matches.
      Impact: The bounded responsibility omission belongs in normal provenance,not filename divergence metadata.
      Resolution: Remove only that stale metadata entry;retain explicit missing service responsibilities and all source markers.

    - Observation: A new dedicated Calc capability was added instead of retaining unrelated Writer ODF capability references;inventory requires its complete parity-mapping scope fields.
      Impact: Runtime/source checks pass;the new inventory record needs aspect,atomic operation and explicit scope limitations.
      Resolution: Complete the canonical mapping schema and static native caller anchors;retain unverified broad parity flags and pending live configuration/model services.
id_source: "generated"
---
## Summary

Implement actual Calc ScDocOptions value owner and ScTpCalcItem required by document pool helper construction,including native defaults,copy,search-mode state transitions and comparison.

## Scope

Calc docoptio source/header/tests;shared source locale measurement field/resource and system-locale reuse,SVL formatter default-value responsibility/resource,necessary actual native dependency edge metadata,inventory/provenance/readiness/suspicion journal and actual browser/Worker test. Maximum50non-task paths. Reuse SearchParam,Locale,OUString,SfxPoolItem. No fake document/pool/formatter/service,physical memory engine,native compiler,network or full all-app run. Full configuration services and number formatting remain pending;bind only current shipped source configuration fields.

## Plan

Implement documented Task185 document calculation options and required real shared default/locale bindings under standing user approval.

## Verify Steps

Pin docoptio.hxx/cxx,optutil.cxx,textsearch.hxx,locale-data sources/wrapper/schema and formatter defaults. Verify all ScDocOptions defaults,US/metric tab distance,1950schema date threshold,all getters/setters/native integer widths,date output slots,copy/assignment/self-assignment,equality short-circuit at each represented field,ignored linebreak field,search cached-mode normalization and flag no-op transitions;reuse actual SearchParam. ScTpCalcItem real base Which/copy/Clone/borrowed const options/equality. Reconstruct all shipped LC_CTYPE measurement fields with recursive ref resolution and prove exact source table;keep existing decimal field results and canonical locale fallback order. Related shared and whole Calc raw S/B/F/L100,every raw counter positive,exact owner sets;Writer-only gaps exempt.13source gates,production build,actual Chromium/dedicated DOM-free Worker options values and Writer startup/load/edit,4reference links absent/restored. No native compiler/probe or all-app run.

## Verification

Command: node output/playwright/task185-checks/portable.mjs. Result:pass. Evidence:19related tests/6files and192Calc/77files;exact6related owners(4shared+2Calc) raw S174/B81/F56/L169100,and35Calc S4300/B2768/F862/L3847100,every raw counter positive;no coverage filtering or Writer-only repair. Command: node output/playwright/task185-checks/native-audit.mjs. Result:pass. Evidence:9native blobs pinned,285LC_CTYPE measurement fields/ref chains exact,normal Common schema year1950 exact,all17native comparison fields/order exact;existing locale lookup/fallback/system Locale/unicode algorithms preserved,shared SearchParam/decimal resources/Writer ODF/guard byte-identical. Closed-state flag invariant proves folded both-true conjunct unreachable. Command: node output/playwright/task185-checks/build-browser-portable.mjs. Result:pass. Evidence:production build,actual Chromium and dedicated DOM-free Worker defaults/copies/lazy-cache/item checks,Writer startup/load/edit;4refs absent/restored.13source gates pass;final audit requires exact executable owner sets and <=50non-task paths. Native comparison/cache and UK mapping documented as CALC171/172. New dedicated Calc capability describes this bounded value owner;full live configuration/ScDocCfg/formatter,pools and document/UI/same-model ODS remain pending. No native compiler/probe,memory engine or all-app run.

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-10-16T01:32:23.390Z — VERIFY — ok

By: CODER

Note: 19related/192Calc pass;exact6related(4shared+2Calc)/35Calc owners raw S/B/F/L100,every counter positive.13gates,9native pins,285locale fields,1950schema,17comparison fields,unchanged prior locale/shared/Writer/guard;build and real Chromium/DOM-free Worker/Writer pass,4refs restored. CALC171/172 retained;full UI/ODS pending,no all-app run.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-16T01:31:45.632Z, excerpt_hash=sha256:e8f30f107a38eae9390508247402d526473bc7711bc0d0bcb0e63bc41f12243b

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202610160119-EC0NT5/blueprint/resolved-snapshot.json
- old_digest: 078f68df31f6dc86df906075515763b4269f7f21411ebe14d7b48e8239610800
- current_digest: 078f68df31f6dc86df906075515763b4269f7f21411ebe14d7b48e8239610800
- route_changed: no
- safe_command: agentplane blueprint snapshot 202610160119-EC0NT5

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202610160119-EC0NT5
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: false
- repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert only Task185 source and task commits;preserve calc branch,other tasks and4reference symlinks. No merge/history rewrite,guard weakening or unrelated Writer-only coverage repairs.

## Findings

ScDocOptions is eagerly default-constructed inside ScPoolHelper and carries required document calculation/search/null-date settings. Source normal default reads Common/DateFormat/TwoDigitYear1950;1930 occurs only in fuzzing. Native comparison omits bIgnoreLineBreaks and compares cached eFormulaSearchType directly;preserve and document without declaring an upstream bug.

- Observation: Lint rejects a utility class containing only the native static IsMetricSystem member.
  Impact: The represented operation is a static namespace responsibility with no instance state.
  Resolution: Use the existing TypeScript utility namespace object pattern retaining ScOptionsUtil.IsMetricSystem and native operation;no suppression or invented instances.

- Observation: Typecheck caught test construction of protected SfxPoolItem;Vitest transpilation did not enforce the protected constructor.
  Impact: Cross-type rejection scenario needs a real publicly constructible native derived item.
  Resolution: Use actual shared SfxBoolItem for cross-type equality test;no fake item or base access relaxation.

- Observation: Provenance rejects a redundant filename-divergence entry for localedatawrapper.ts whose source basename already matches.
  Impact: The bounded responsibility omission belongs in normal provenance,not filename divergence metadata.
  Resolution: Remove only that stale metadata entry;retain explicit missing service responsibilities and all source markers.

- Observation: A new dedicated Calc capability was added instead of retaining unrelated Writer ODF capability references;inventory requires its complete parity-mapping scope fields.
  Impact: Runtime/source checks pass;the new inventory record needs aspect,atomic operation and explicit scope limitations.
  Resolution: Complete the canonical mapping schema and static native caller anchors;retain unverified broad parity flags and pending live configuration/model services.
