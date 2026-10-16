---
id: "202610160149-P52EJ4"
title: "Implement shared native language ID and locale conversion"
result_summary: "Implemented actual MsLangId private Conversion tables and algorithms,replaced duplicate fallback projection,corrected four shared locale results and verified actual text/Calc consumers. CALC173 documented;full system/LanguageTag/font/pool/document/UI/ODS and next full all-app run remain pending."
status: "DONE"
priority: "med"
owner: "CODER"
revision: 25
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-16T01:59:58.425Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-10-16T02:19:19.299Z"
  updated_by: "CODER"
  note: "24related/196Calc,exact6shared/36Calc raw S/B/F/L100,every counter positive.13gates,8native pins,643+6rows/11special IDs exact,allUInt16 modes,302prior values+4canonical corrections,actual text/Calc consumer regressions. Build,real Chromium/controlled-host DOM-free Worker/Writer pass,4refs restored. Guard logic unchanged,native edges only. CALC173 preserved;public system/full LanguageTag/UI/ODS pending,no all-app run."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-10-16T02:19:59.255Z"
  updated_by: "EVALUATOR"
  note: "Same-agent source/evidence audit passes real private MsLangId conversion and canonical shared fallback corrections;not an independent review."
  evaluated_sha: "bffbc66d73125c01726deb6c1d42b34c331b53c4"
  blueprint_digest: "dd33589ee6a88027d40980ce65e9930b1932960eb8dfa1cb873f4a256806ad72"
  evidence_refs:
    - ".agentplane/tasks/202610160149-P52EJ4/README.md"
    - ".agentplane/tasks/202610160149-P52EJ4/quality/20261016-021959255-recovery-context/quality-report.json"
    - ".agentplane/tasks/202610160149-P52EJ4/quality/20261016-021959255-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202610160149-P52EJ4/quality/20261016-021959255-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202610160149-P52EJ4/blueprint/resolved-snapshot.json"
    - "output/playwright/task187-checks/final-verification.json"
  findings:
    - "24related/196Calc,exact6shared/36Calc raw100,every counter positive,13gates.8native pins,643ordered+6private rows/11special IDs and aliases exact;allUInt16 forward modes,stable Locale outputs,302prior values+4source-corrected projections and actual text/Calc consumers. Guard algorithms unchanged,only native SAL/UDKAPI edges/one expected-data group updated,43boundary tests pass. Build and actual Chromium/controlled-host DOM-free Worker/Writer pass,4refs restored. CALC173 retained;public system/full LanguageTag/LocaleData/font/pool/document/UI/ODS pending,no compiler/ICU/memory engine/all-app run."
commit:
  hash: "8026d28c1ee1ce7d2a43b48a8963749bf9d508a9"
  message: "✅ P52EJ4 quality: record native language conversion evidence"
comments:
  -
    author: "CODER"
    body: "Start: port actual ordered MsLangId Conversion tables/algorithms and reuse them for existing locale fallback,using actual Locale/OUString/SAL ASCII values without ICU or fake services."
  -
    author: "CODER"
    body: "Verified: native shared locale/ID/fallback conversion implemented;302prior results retained and4wrong projections corrected.24related/196Calc exact raw100,13gates,source audits,build and actual Chromium/controlled-host DOM-free Worker/Writer pass;4refs restored. Full system/LanguageTag/document/UI/ODS pending."
events:
  -
    type: "status"
    at: "2026-10-16T01:51:05.271Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: port actual ordered MsLangId Conversion tables/algorithms and reuse them for existing locale fallback,using actual Locale/OUString/SAL ASCII values without ICU or fake services."
  -
    type: "verify"
    at: "2026-10-16T02:19:19.299Z"
    author: "CODER"
    state: "ok"
    note: "24related/196Calc,exact6shared/36Calc raw S/B/F/L100,every counter positive.13gates,8native pins,643+6rows/11special IDs exact,allUInt16 modes,302prior values+4canonical corrections,actual text/Calc consumer regressions. Build,real Chromium/controlled-host DOM-free Worker/Writer pass,4refs restored. Guard logic unchanged,native edges only. CALC173 preserved;public system/full LanguageTag/UI/ODS pending,no all-app run."
  -
    type: "status"
    at: "2026-10-16T02:21:24.238Z"
    author: "CODER"
    from: "DOING"
    to: "DONE"
    note: "Verified: native shared locale/ID/fallback conversion implemented;302prior results retained and4wrong projections corrected.24related/196Calc exact raw100,13gates,source audits,build and actual Chromium/controlled-host DOM-free Worker/Writer pass;4refs restored. Full system/LanguageTag/document/UI/ODS pending."
doc_version: 3
doc_updated_at: "2026-10-16T02:21:24.239Z"
doc_updated_by: "CODER"
description: "Task187: port MsLangId Conversion table algorithms required by LanguageTag/default-font and ODS language attributes,using actual upstream ordered ID/ISO/script/BCP47/private-use mappings and existing Locale/OUString/SAL ASCII helpers."
sections:
  Summary: "Implement actual shared MsLangId Conversion table-based locale/ID/fallback responsibilities required by LanguageTag,standard font defaults and ODS language attributes."
  Scope: "Shared i18nlangtag ordered ISO/script/BCP47/private tables,entry operations and native forward/reverse/private/override/fallback conversions;canonical mslangid header and required lang constant;reuse actual Locale/OUString/SAL character operations. Replace existing i18npool language-only fallback projection with the actual shared conversion owner and retain prior source-projected values as a test fixture. Tests,inventory/provenance/capability/readiness/suspected cases and real Chromium/Worker. At most60non-task paths. No fake LanguageTag/configuration/font/document service,ICU/liblangtag import,native compiler/generator/probe,memory engine,network or all-app run."
  Plan: "Approved Task187 scope with source-evidenced verification correction:302prior fallback results unchanged and4incorrect prior projections corrected canonically,as explicitly authorized for shared/Writer modules;other constraints and checks unchanged."
  Verify Steps: "Execute original Task187 source/table/forward/reverse/private/override/fallback and full UInt16-domain contract. Prove all643ordered ISO/script/BCP47 rows,6private rows including sentinel,11countryless IDs and aliases match native source. Compare all306prior language-only values:302unchanged plus exactly4source-audited corrections ber kab-DZ,cmn zh-CN,fuv ff-NG,ji yi-IL;explicitly test corrected locale decimal/measurement consumers and retain prior fixture as historical projection,not native truth. Existing prepared-locale/native QA-derived literal examples and pointer-repeat/restart rules,ASCII matching,prefix/country-length boundaries,private/unknown retention and stable actual Locale fields. Exact changed shared raw S/B/F/L100,every counter positive;whole Calc raw100,related Writer functional checks,13source gates,production build and actual Chromium/dedicated DOM-free Worker/Writer;4refs absent/restored. No C++ compiler/generator/probe,new ICU/memory/service implementation or full all-app run;full LanguageTag/font/document/UI/ODS remain pending."
  Verification: |-
    Command: node output/playwright/task187-checks/portable.mjs. Result:pass. Evidence:24related tests/7files and196Calc/78files;exact6changed shared owners raw S177/B126/F26/L154100 and36Calc S4310/B2777/F864/L3857100,every raw counter positive,no coverage filtering or Writer-only repair. Full UInt16 forward domain covers both override modes and unknown field retention;source-derived aliases/private/script/prefix/country boundaries,all declared spellings and stable real Locale members pass. All306prior projection results checked:302unchanged,exact4source-corrected ber/kab-DZ,cmn/zh-CN,fuv/ff-NG,ji/yi-IL. Real existing SvxTabStop and ScDocOptions reflect corrected decimal/measurement defaults. Command: node output/playwright/task187-checks/native-audit.mjs. Result:pass. Evidence:8native blobs pinned;643ordered ISO/script/BCP47+6private rows,11countryless IDs/all aliases/last-resort exact;4corrections traced through source repeated-script-pointer continuation. Prior fixture byte-identical to previous production projection. Guard algorithms and other assertions unchanged except native SAL/UDKAPI edge metadata/one expected-data test group;43boundary scenarios pass. Existing language primitives except new US constant,actual Locale/OUString/SAL case operations,tab/document options/font configuration and Writer ODF owners unchanged. Command: node output/playwright/task187-checks/build-browser-portable.mjs. Result:pass. Evidence:production build,actual Chromium and dedicated DOM-free Worker conversion/corrected-consumer checks and Writer startup/load/edit;4refs absent/restored. Worker host locale explicitly controlled from main-context input because Playwright main locale override is not inherited by Worker;all kernel owners/operations remain actual.13source gates and exact owner/path audit pass29non-task paths within60. CALC173 preserved. Public empty-language/system wrapper,full LanguageTag/LocaleData/font/pool/document/UI/ODS remain pending. No native compiler/generator/probe,ICU/physical ownership/cache engine or full all-app run.

    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-10-16T02:19:19.299Z — VERIFY — ok

    By: CODER

    Note: 24related/196Calc,exact6shared/36Calc raw S/B/F/L100,every counter positive.13gates,8native pins,643+6rows/11special IDs exact,allUInt16 modes,302prior values+4canonical corrections,actual text/Calc consumer regressions. Build,real Chromium/controlled-host DOM-free Worker/Writer pass,4refs restored. Guard logic unchanged,native edges only. CALC173 preserved;public system/full LanguageTag/UI/ODS pending,no all-app run.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-16T02:19:10.877Z, excerpt_hash=sha256:6ff69bd3a2165174b3a97d63e0821ff595478146303e16006dd417b3fb4c37ff

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202610160149-P52EJ4/blueprint/resolved-snapshot.json
    - old_digest: dd33589ee6a88027d40980ce65e9930b1932960eb8dfa1cb873f4a256806ad72
    - current_digest: dd33589ee6a88027d40980ce65e9930b1932960eb8dfa1cb873f4a256806ad72
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202610160149-P52EJ4

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202610160149-P52EJ4
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: false
    - repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert only Task187 source/task commits,preserving calc branch,other tasks and4reference links. No merge/history rewrite,guard weakening,external writes or unrelated Writer-only coverage repair."
  Findings: |-
    LanguageTag numeric-ID and font language fields require actual native locale/ID tables. This responsibility performs table conversion and ASCII matching,not ICU Unicode casing,BCP47 canonicalization or localized interface labels. Existing language-only fallback projection can become a regression fixture once actual shared fallback owns the behavior.

    - Observation: First related run proves prior ber projection wrong: actual native override path yields kab-DZ,not tzm-Latn-DZ. A subsequent diagnostic aggregation omitted its final assertion;raw coverage still rejected an uncovered generic zero-override helper branch.
      Impact: No result is accepted;need aggregate all prior projection deltas and preserve source behavior,not old incorrect values.
      Resolution: Add the diagnostic assertion,inspect every delta against native tables/restart ordering,then update the approved verification to explicit canonical corrections under standing user authorization. Native source data remain unchanged.

    - Observation: All306 prior projection values compared: exactly4canonical corrections confirmed by original family-specific pointer-restart algorithm:ber tzm-Latn-DZ to kab-DZ,cmn zh-Hans-CN to zh-CN,fuv ff-Latn-NG to ff-NG,ji yi-Hebr-IL to yi-IL. The former projection stopped on a repeated script override instead of continuing to canonical ISO entries.
      Impact: Preserving all prior projection outputs would preserve incorrect shared behavior;user explicitly authorized canonical shared corrections including Writer callers.
      Resolution: Replace the planned identical306assumption with302unchanged+4source-audited corrections,retain old data as clearly named prior-projection fixture,and approve this evidence-based verification correction under standing user authorization. No scope/service/guard expansion or new permission gate.

    - Observation: Source inspection distinguishes private Conversion.lookupFallbackLocale from public MsLangId.getFallbackLocale:the public wrapper resolves an empty language through system settings first. Only the private table responsibility is implemented here.
      Impact: Normal nonempty service-name fallback now uses the real shared algorithm;full empty-language/system-source behavior of LanguageTag/LocaleData services remains unimplemented and must not be claimed.
      Resolution: Record this precise remaining source responsibility in inventory/readiness. No fake public wrapper,system registry,guard or en-US compatibility branch is introduced;continue actual system-language owner separately before claiming full locale/service parity.

    - Observation: Boundary tests still encode the former primitive-only i18nlangtag metadata and forbid SAL;actual isolang.cxx uses RTL strings and generated Locale values.
      Impact: The new native conversion owner correctly requires SAL and UDKAPI,so the old expected-edge data is stale.
      Resolution: Update only the source-backed allowedEdges metadata and its single test assertion group;keep all guard algorithms,other assertions and browser/app prohibitions unchanged. Audit emitted guard/test scope and rerun43boundary scenarios.

    - Observation: Production build passed;real Chromium/Worker test failed only for host-default tab decimal/distance. Playwright locale=ber affects main Navigator but Worker retains its host locale;explicit Locale conversions match in both realms.
      Impact: The test assumed equal host inputs across emulated realms. This is not evidence of different table/Locale conversion behavior.
      Resolution: Control the Worker Navigator.language test input explicitly from the main context language,keeping the actual Worker and all source-owned values/operations. Repeat browser/Writer checks and test-source gates;production source and previously passing raw coverage remain unchanged.

    - Observation: Worker host input is now controlled;an intermediate E2E edit added expected hostLanguage without returning that diagnostic field. The test failed on missing diagnostic fields and was corrected before acceptance.
      Impact: Browser test result remains unaccepted;production conversion/default behavior is unchanged.
      Resolution: Return observed Navigator.language from actual realm reads,rerun the browser test and source-test checks,and retain strict expected host/default values.
extensions:
  implementation_commit:
    hash: "bffbc66d73125c01726deb6c1d42b34c331b53c4"
    message: "🔧 P52EJ4 core: implement native shared language conversions"
id_source: "generated"
---
## Summary

Implement actual shared MsLangId Conversion table-based locale/ID/fallback responsibilities required by LanguageTag,standard font defaults and ODS language attributes.

## Scope

Shared i18nlangtag ordered ISO/script/BCP47/private tables,entry operations and native forward/reverse/private/override/fallback conversions;canonical mslangid header and required lang constant;reuse actual Locale/OUString/SAL character operations. Replace existing i18npool language-only fallback projection with the actual shared conversion owner and retain prior source-projected values as a test fixture. Tests,inventory/provenance/capability/readiness/suspected cases and real Chromium/Worker. At most60non-task paths. No fake LanguageTag/configuration/font/document service,ICU/liblangtag import,native compiler/generator/probe,memory engine,network or all-app run.

## Plan

Approved Task187 scope with source-evidenced verification correction:302prior fallback results unchanged and4incorrect prior projections corrected canonically,as explicitly authorized for shared/Writer modules;other constraints and checks unchanged.

## Verify Steps

Execute original Task187 source/table/forward/reverse/private/override/fallback and full UInt16-domain contract. Prove all643ordered ISO/script/BCP47 rows,6private rows including sentinel,11countryless IDs and aliases match native source. Compare all306prior language-only values:302unchanged plus exactly4source-audited corrections ber kab-DZ,cmn zh-CN,fuv ff-NG,ji yi-IL;explicitly test corrected locale decimal/measurement consumers and retain prior fixture as historical projection,not native truth. Existing prepared-locale/native QA-derived literal examples and pointer-repeat/restart rules,ASCII matching,prefix/country-length boundaries,private/unknown retention and stable actual Locale fields. Exact changed shared raw S/B/F/L100,every counter positive;whole Calc raw100,related Writer functional checks,13source gates,production build and actual Chromium/dedicated DOM-free Worker/Writer;4refs absent/restored. No C++ compiler/generator/probe,new ICU/memory/service implementation or full all-app run;full LanguageTag/font/document/UI/ODS remain pending.

## Verification

Command: node output/playwright/task187-checks/portable.mjs. Result:pass. Evidence:24related tests/7files and196Calc/78files;exact6changed shared owners raw S177/B126/F26/L154100 and36Calc S4310/B2777/F864/L3857100,every raw counter positive,no coverage filtering or Writer-only repair. Full UInt16 forward domain covers both override modes and unknown field retention;source-derived aliases/private/script/prefix/country boundaries,all declared spellings and stable real Locale members pass. All306prior projection results checked:302unchanged,exact4source-corrected ber/kab-DZ,cmn/zh-CN,fuv/ff-NG,ji/yi-IL. Real existing SvxTabStop and ScDocOptions reflect corrected decimal/measurement defaults. Command: node output/playwright/task187-checks/native-audit.mjs. Result:pass. Evidence:8native blobs pinned;643ordered ISO/script/BCP47+6private rows,11countryless IDs/all aliases/last-resort exact;4corrections traced through source repeated-script-pointer continuation. Prior fixture byte-identical to previous production projection. Guard algorithms and other assertions unchanged except native SAL/UDKAPI edge metadata/one expected-data test group;43boundary scenarios pass. Existing language primitives except new US constant,actual Locale/OUString/SAL case operations,tab/document options/font configuration and Writer ODF owners unchanged. Command: node output/playwright/task187-checks/build-browser-portable.mjs. Result:pass. Evidence:production build,actual Chromium and dedicated DOM-free Worker conversion/corrected-consumer checks and Writer startup/load/edit;4refs absent/restored. Worker host locale explicitly controlled from main-context input because Playwright main locale override is not inherited by Worker;all kernel owners/operations remain actual.13source gates and exact owner/path audit pass29non-task paths within60. CALC173 preserved. Public empty-language/system wrapper,full LanguageTag/LocaleData/font/pool/document/UI/ODS remain pending. No native compiler/generator/probe,ICU/physical ownership/cache engine or full all-app run.

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-10-16T02:19:19.299Z — VERIFY — ok

By: CODER

Note: 24related/196Calc,exact6shared/36Calc raw S/B/F/L100,every counter positive.13gates,8native pins,643+6rows/11special IDs exact,allUInt16 modes,302prior values+4canonical corrections,actual text/Calc consumer regressions. Build,real Chromium/controlled-host DOM-free Worker/Writer pass,4refs restored. Guard logic unchanged,native edges only. CALC173 preserved;public system/full LanguageTag/UI/ODS pending,no all-app run.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-16T02:19:10.877Z, excerpt_hash=sha256:6ff69bd3a2165174b3a97d63e0821ff595478146303e16006dd417b3fb4c37ff

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202610160149-P52EJ4/blueprint/resolved-snapshot.json
- old_digest: dd33589ee6a88027d40980ce65e9930b1932960eb8dfa1cb873f4a256806ad72
- current_digest: dd33589ee6a88027d40980ce65e9930b1932960eb8dfa1cb873f4a256806ad72
- route_changed: no
- safe_command: agentplane blueprint snapshot 202610160149-P52EJ4

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202610160149-P52EJ4
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: false
- repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert only Task187 source/task commits,preserving calc branch,other tasks and4reference links. No merge/history rewrite,guard weakening,external writes or unrelated Writer-only coverage repair.

## Findings

LanguageTag numeric-ID and font language fields require actual native locale/ID tables. This responsibility performs table conversion and ASCII matching,not ICU Unicode casing,BCP47 canonicalization or localized interface labels. Existing language-only fallback projection can become a regression fixture once actual shared fallback owns the behavior.

- Observation: First related run proves prior ber projection wrong: actual native override path yields kab-DZ,not tzm-Latn-DZ. A subsequent diagnostic aggregation omitted its final assertion;raw coverage still rejected an uncovered generic zero-override helper branch.
  Impact: No result is accepted;need aggregate all prior projection deltas and preserve source behavior,not old incorrect values.
  Resolution: Add the diagnostic assertion,inspect every delta against native tables/restart ordering,then update the approved verification to explicit canonical corrections under standing user authorization. Native source data remain unchanged.

- Observation: All306 prior projection values compared: exactly4canonical corrections confirmed by original family-specific pointer-restart algorithm:ber tzm-Latn-DZ to kab-DZ,cmn zh-Hans-CN to zh-CN,fuv ff-Latn-NG to ff-NG,ji yi-Hebr-IL to yi-IL. The former projection stopped on a repeated script override instead of continuing to canonical ISO entries.
  Impact: Preserving all prior projection outputs would preserve incorrect shared behavior;user explicitly authorized canonical shared corrections including Writer callers.
  Resolution: Replace the planned identical306assumption with302unchanged+4source-audited corrections,retain old data as clearly named prior-projection fixture,and approve this evidence-based verification correction under standing user authorization. No scope/service/guard expansion or new permission gate.

- Observation: Source inspection distinguishes private Conversion.lookupFallbackLocale from public MsLangId.getFallbackLocale:the public wrapper resolves an empty language through system settings first. Only the private table responsibility is implemented here.
  Impact: Normal nonempty service-name fallback now uses the real shared algorithm;full empty-language/system-source behavior of LanguageTag/LocaleData services remains unimplemented and must not be claimed.
  Resolution: Record this precise remaining source responsibility in inventory/readiness. No fake public wrapper,system registry,guard or en-US compatibility branch is introduced;continue actual system-language owner separately before claiming full locale/service parity.

- Observation: Boundary tests still encode the former primitive-only i18nlangtag metadata and forbid SAL;actual isolang.cxx uses RTL strings and generated Locale values.
  Impact: The new native conversion owner correctly requires SAL and UDKAPI,so the old expected-edge data is stale.
  Resolution: Update only the source-backed allowedEdges metadata and its single test assertion group;keep all guard algorithms,other assertions and browser/app prohibitions unchanged. Audit emitted guard/test scope and rerun43boundary scenarios.

- Observation: Production build passed;real Chromium/Worker test failed only for host-default tab decimal/distance. Playwright locale=ber affects main Navigator but Worker retains its host locale;explicit Locale conversions match in both realms.
  Impact: The test assumed equal host inputs across emulated realms. This is not evidence of different table/Locale conversion behavior.
  Resolution: Control the Worker Navigator.language test input explicitly from the main context language,keeping the actual Worker and all source-owned values/operations. Repeat browser/Writer checks and test-source gates;production source and previously passing raw coverage remain unchanged.

- Observation: Worker host input is now controlled;an intermediate E2E edit added expected hostLanguage without returning that diagnostic field. The test failed on missing diagnostic fields and was corrected before acceptance.
  Impact: Browser test result remains unaccepted;production conversion/default behavior is unchanged.
  Resolution: Return observed Navigator.language from actual realm reads,rerun the browser test and source-test checks,and retain strict expected host/default values.
