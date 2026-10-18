---
id: "202610160449-4VVT0H"
title: "Implement registered Unicode language-tag extension parsing"
result_summary: "Implement registered Unicode extension callbacks and pinned CLDR values"
status: "DONE"
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
  updated_at: "2026-10-16T04:50:28.295Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-10-16T05:01:09.119Z"
  updated_by: "CODER"
  note: "Actual Unicode-extension callback/data responsibility group and shared ASCII/error values implemented;allCLDR values/24source files/8native QA slices verified.52related/196Calc tests,exact6shared and36Calc raw100/every counter positive,13source gates,build/real Chromium/DOM-free Worker and selected Writer pass without5refs.28intentional paths,source/Calc invariants and final audit pass;CALC-177/178/179 preserved. General parser/t/canonicalizer/LanguageTag/UI/ODS remain pending,no all-app run."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-10-16T05:01:36.965Z"
  updated_by: "EVALUATOR"
  note: "Same-agent EVALUATOR phase: exact source commit92338808d712/28declared paths matches recorded evidence. Complete Unicode callback value/state group and pinned CLDR source data are implemented;shared ASCII/error ownership replaces duplication without physical engines.52related/196Calc tests,strict exact6shared/36Calc raw100,13gates,build/actual Chromium/Worker/Writer and5ref restoration pass."
  evaluated_sha: "92338808d712bcc89ffc3a372364e987b31d0a79"
  blueprint_digest: "96d60a8fefb9700dccc72ea768fe5f094c111e01a71ac0559ccb6418043561c8"
  evidence_refs:
    - ".agentplane/tasks/202610160449-4VVT0H/README.md"
    - ".agentplane/tasks/202610160449-4VVT0H/quality/20261016-050136965-recovery-context/quality-report.json"
    - ".agentplane/tasks/202610160449-4VVT0H/quality/20261016-050136965-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202610160449-4VVT0H/quality/20261016-050136965-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202610160449-4VVT0H/blueprint/resolved-snapshot.json"
    - "output/playwright/task195-checks/final-audit.json"
    - "output/playwright/task195-checks/native-audit.json"
    - "output/playwright/task195-checks/source-gates.json"
  findings:
    - "Full general grammar,t callback,alias application/canonicalization and enclosing LanguageTag remain explicit required next work;no whole-tag native QA or native execution/parity claim. Source-derived CALC-177/178/179 are preserved. Final HEX newline regression fixes a local native-JS mismatch;all affected checks rerun. Review is same-agent,not independent."
commit:
  hash: "44966bcd577f69d2aa19ca6be0c6bed4f944b350"
  message: "🔎 4VVT0H calc: record Unicode extension verification"
comments:
  -
    author: "CODER"
    body: "Start: implement actual Unicode extension callbacks and pinned functional CLDR data,sharing source ASCII and diagnostic values with the existing scanner and registered-key owners."
  -
    author: "CODER"
    body: "Verified: native Unicode extension callback state and complete pinned functional CLDR data implemented;shared source ASCII/error values reused.52related/196Calc tests,strict exact raw100 coverage,13source gates,build and real browser/Worker pass. General grammar and UI/ODS remain pending."
events:
  -
    type: "status"
    at: "2026-10-16T04:50:33.836Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implement actual Unicode extension callbacks and pinned functional CLDR data,sharing source ASCII and diagnostic values with the existing scanner and registered-key owners."
  -
    type: "verify"
    at: "2026-10-16T05:01:09.119Z"
    author: "CODER"
    state: "ok"
    note: "Actual Unicode-extension callback/data responsibility group and shared ASCII/error values implemented;allCLDR values/24source files/8native QA slices verified.52related/196Calc tests,exact6shared and36Calc raw100/every counter positive,13source gates,build/real Chromium/DOM-free Worker and selected Writer pass without5refs.28intentional paths,source/Calc invariants and final audit pass;CALC-177/178/179 preserved. General parser/t/canonicalizer/LanguageTag/UI/ODS remain pending,no all-app run."
  -
    type: "status"
    at: "2026-10-16T05:01:44.268Z"
    author: "CODER"
    from: "DOING"
    to: "DONE"
    note: "Verified: native Unicode extension callback state and complete pinned functional CLDR data implemented;shared source ASCII/error values reused.52related/196Calc tests,strict exact raw100 coverage,13source gates,build and real browser/Worker pass. General grammar and UI/ODS remain pending."
doc_version: 3
doc_updated_at: "2026-10-16T05:01:44.269Z"
doc_updated_by: "CODER"
description: "Task195: implement the actual liblangtag Unicode extension state machine and pinned ordered CLDR functional lookup needed by general LanguageTag grammar/canonicalization, reusing shared byte/error/ASCII values without physical library machinery."
sections:
  Summary: "Task195 implements liblangtag0.6.8 Unicode extension parsing and ordered functional CLDR values required by the actual general LanguageTag parser. Task194 scanner and IANA lookup are complete prerequisites;the t handler requires the pending actual general parser and is not replaced with a stub."
  Scope: "Only vite-office-calc branch calc. Up to30 non-task paths: actual Unicode extension state owner, native ASCII comparison/lower helpers, shared diagnostic declarations, ordered CLDR keyword/language-alias data provider and tests, reuse/refactor of task194 scanner/registry diagnostics/ASCII operations, Unicode notices, runtime/provenance/capability records, browser evidence, Calc readiness and suspected-issue documentation. All source comes from existing pinned local archives. Preserve actual source state transitions,raw spelling,case-sensitive XPath key selection,case-insensitive type matching,CODEPOINTS special case,sort/order/duplicates and validation behavior. No general parser,full LanguageTag,t handler stub,localized language labels,physical memory/XML/module-loader engine,guard changes,native compilation/generators,network or full all-app run. Standing user approval covers this required core/shared implementation."
  Plan: "Implement complete native Unicode extension state callbacks and pinned ordered CLDR functional provider,sharing actual ASCII/error declarations with existing scanner/IANA owners;verify strict raw coverage,source data and actual browser/Worker without5source refs,then review/finish. General grammar,t handler,canonicalization and LanguageTag remain pending."
  Verify Steps: |-
    - node output/playwright/task195-checks/native-audit.mjs: exact pinned archive/source/QA/data hashes,all ordered CLDR functional values versus original XML,shared refactor proof and documented suspicious native cases;no native execution/generator.
    - node output/playwright/task195-checks/portable.mjs: related scanner/IANA/ASCII/CLDR/Unicode-extension scenarios and wholeCalc with all5source refs absent/restored;exact changed shared executable owner set and36Calc owners every raw S/B/F counter positive and S/B/F/L100. Writer-only gaps exempt if encountered.
    - node output/playwright/task195-checks/browser-portable.mjs: production build and actual Chromium/DOM-free Worker new/shared parsing values with5source refs absent/restored;selected Writer functional smoke only.
    - node output/playwright/task195-checks/source-gates.mjs: all13existing gates including inventory/provenance/boundaries/routing/doctor;no guard algorithm modifications or exemptions.
    - node output/playwright/task195-checks/final-audit.mjs: exact changed paths,source/ref/coverage evidence,truthful remaining parser boundary;record verify,commit and same-agent EVALUATOR review then descriptive finish.
  Verification: |-
    Command:node output/playwright/task195-checks/native-audit.mjs. Result:pass. Evidence:both exact pinned archive SHA256 values,6LibreOffice file pins,24original library/source/QA/XML blobs,all7CLDR groups/1016types/484languageAliases and8native QA extension slices verified. Source scanner class unchanged apart from shared diagnostic names;IANA data unchanged;no native execution/generator. Command:node output/playwright/task195-checks/portable.mjs followed by shared-only rerun after final HEX review correction. Result:pass. Evidence:52related tests/5files;exact6changed/new shared executable owners raw S129/B75/F19/L120100,every counter positive.196Calc tests/78files;exact36Calc owners raw S4310/B2777/F864/L3857100,every counter positive. All36Calc owner files remain byte-identical to HEAD and passing run. All5source links absent/restored. Command:node output/playwright/task195-checks/browser-portable.mjs,rerun after HEX correction. Result:pass. Evidence:production build,actual Chromium and DOM-free Worker genuine Unicode callback/shared values;1Writer startup/load/edit;5source refs absent/restored. Command:node output/playwright/task195-checks/source-gates.mjs and final affected format/lint/typecheck/docs/diff rerun. Result:all13existing gates pass,including inventory/provenance/boundaries/routing/doctor;guard algorithms unchanged. Command:node output/playwright/task195-checks/final-audit.mjs and git diff --check. Result:pass. Evidence:28intentional non-task paths,exact raw owner sets,source/ref/path hashes and5refs restored. CALC-177/178/179 document source key-case,transform-key discovery and getter-sort state effects without fixing upstream behavior. Local newline-anchor HEX issue corrected and independently regressed before final acceptance. Native QA evidence is extension callback slices,not whole tag grammar or executed C. Error declarations/diagnostic projections introduce no error-stack/memory/module-loader engine. Complete general grammar,t handler,CLDR alias application/canonicalization,enclosing LanguageTag,font/defaults/pools/model/UI/ODS remain pending. No full all-app run or broad parity promotion;goal active.

    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-10-16T05:01:09.119Z — VERIFY — ok

    By: CODER

    Note: Actual Unicode-extension callback/data responsibility group and shared ASCII/error values implemented;allCLDR values/24source files/8native QA slices verified.52related/196Calc tests,exact6shared and36Calc raw100/every counter positive,13source gates,build/real Chromium/DOM-free Worker and selected Writer pass without5refs.28intentional paths,source/Calc invariants and final audit pass;CALC-177/178/179 preserved. General parser/t/canonicalizer/LanguageTag/UI/ODS remain pending,no all-app run.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-16T05:01:08.608Z, excerpt_hash=sha256:16362aa731b9382f59ca6a47736eeee3edb31589482cc70d2dfd5c4e98979e9f

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202610160449-4VVT0H/blueprint/resolved-snapshot.json
    - old_digest: 96d60a8fefb9700dccc72ea768fe5f094c111e01a71ac0559ccb6418043561c8
    - current_digest: 96d60a8fefb9700dccc72ea768fe5f094c111e01a71ac0559ccb6418043561c8
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202610160449-4VVT0H

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202610160449-4VVT0H
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: false
    - repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert only this task's implementation and registry records;retain pinned ignored source evidence and unrelated user/task changes. No destructive reset or merge."
  Findings: |-
    Source preflight confirms clean calc branch and no matching active task. The previous goal turn made authoritative progress:task194 DONE with scanner/IANA owners and verified portable strict coverage. New t handler cannot be honestly completed before actual general tag parser;this task implements complete independent Unicode handler and required functional CLDR responsibility boundary. Diagnostic values remain explicit projections of fresh native internal error slots,not a physical error stack/library.

    An early bounded CLI read used head and caused harmless stdout EPIPE after Verify Steps were printed. Subsequent CLI reads use non-closing output filtering. No semantic mutation or failed verification was inferred from that read.

    Final source review caught the JavaScript dollar-anchor exception before a trailing newline in the initial HEX regex. Native code checks every byte;production now uses explicit4..6length plus exclusion of any non-hex character. A direct callback regression for0061 followed by newline proves rejection;scanner-fed real inputs already reject newline earlier. This is a local implementation correction,not a new upstream suspicion. Rerun changed shared coverage,browser/build and affected static checks;Calc owners remain byte-identical to their passing portable run.
extensions:
  implementation_commit:
    hash: "92338808d712bcc89ffc3a372364e987b31d0a79"
    message: "🧩 4VVT0H calc: implement registered Unicode extension parsing"
id_source: "generated"
---
## Summary

Task195 implements liblangtag0.6.8 Unicode extension parsing and ordered functional CLDR values required by the actual general LanguageTag parser. Task194 scanner and IANA lookup are complete prerequisites;the t handler requires the pending actual general parser and is not replaced with a stub.

## Scope

Only vite-office-calc branch calc. Up to30 non-task paths: actual Unicode extension state owner, native ASCII comparison/lower helpers, shared diagnostic declarations, ordered CLDR keyword/language-alias data provider and tests, reuse/refactor of task194 scanner/registry diagnostics/ASCII operations, Unicode notices, runtime/provenance/capability records, browser evidence, Calc readiness and suspected-issue documentation. All source comes from existing pinned local archives. Preserve actual source state transitions,raw spelling,case-sensitive XPath key selection,case-insensitive type matching,CODEPOINTS special case,sort/order/duplicates and validation behavior. No general parser,full LanguageTag,t handler stub,localized language labels,physical memory/XML/module-loader engine,guard changes,native compilation/generators,network or full all-app run. Standing user approval covers this required core/shared implementation.

## Plan

Implement complete native Unicode extension state callbacks and pinned ordered CLDR functional provider,sharing actual ASCII/error declarations with existing scanner/IANA owners;verify strict raw coverage,source data and actual browser/Worker without5source refs,then review/finish. General grammar,t handler,canonicalization and LanguageTag remain pending.

## Verify Steps

- node output/playwright/task195-checks/native-audit.mjs: exact pinned archive/source/QA/data hashes,all ordered CLDR functional values versus original XML,shared refactor proof and documented suspicious native cases;no native execution/generator.
- node output/playwright/task195-checks/portable.mjs: related scanner/IANA/ASCII/CLDR/Unicode-extension scenarios and wholeCalc with all5source refs absent/restored;exact changed shared executable owner set and36Calc owners every raw S/B/F counter positive and S/B/F/L100. Writer-only gaps exempt if encountered.
- node output/playwright/task195-checks/browser-portable.mjs: production build and actual Chromium/DOM-free Worker new/shared parsing values with5source refs absent/restored;selected Writer functional smoke only.
- node output/playwright/task195-checks/source-gates.mjs: all13existing gates including inventory/provenance/boundaries/routing/doctor;no guard algorithm modifications or exemptions.
- node output/playwright/task195-checks/final-audit.mjs: exact changed paths,source/ref/coverage evidence,truthful remaining parser boundary;record verify,commit and same-agent EVALUATOR review then descriptive finish.

## Verification

Command:node output/playwright/task195-checks/native-audit.mjs. Result:pass. Evidence:both exact pinned archive SHA256 values,6LibreOffice file pins,24original library/source/QA/XML blobs,all7CLDR groups/1016types/484languageAliases and8native QA extension slices verified. Source scanner class unchanged apart from shared diagnostic names;IANA data unchanged;no native execution/generator. Command:node output/playwright/task195-checks/portable.mjs followed by shared-only rerun after final HEX review correction. Result:pass. Evidence:52related tests/5files;exact6changed/new shared executable owners raw S129/B75/F19/L120100,every counter positive.196Calc tests/78files;exact36Calc owners raw S4310/B2777/F864/L3857100,every counter positive. All36Calc owner files remain byte-identical to HEAD and passing run. All5source links absent/restored. Command:node output/playwright/task195-checks/browser-portable.mjs,rerun after HEX correction. Result:pass. Evidence:production build,actual Chromium and DOM-free Worker genuine Unicode callback/shared values;1Writer startup/load/edit;5source refs absent/restored. Command:node output/playwright/task195-checks/source-gates.mjs and final affected format/lint/typecheck/docs/diff rerun. Result:all13existing gates pass,including inventory/provenance/boundaries/routing/doctor;guard algorithms unchanged. Command:node output/playwright/task195-checks/final-audit.mjs and git diff --check. Result:pass. Evidence:28intentional non-task paths,exact raw owner sets,source/ref/path hashes and5refs restored. CALC-177/178/179 document source key-case,transform-key discovery and getter-sort state effects without fixing upstream behavior. Local newline-anchor HEX issue corrected and independently regressed before final acceptance. Native QA evidence is extension callback slices,not whole tag grammar or executed C. Error declarations/diagnostic projections introduce no error-stack/memory/module-loader engine. Complete general grammar,t handler,CLDR alias application/canonicalization,enclosing LanguageTag,font/defaults/pools/model/UI/ODS remain pending. No full all-app run or broad parity promotion;goal active.

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-10-16T05:01:09.119Z — VERIFY — ok

By: CODER

Note: Actual Unicode-extension callback/data responsibility group and shared ASCII/error values implemented;allCLDR values/24source files/8native QA slices verified.52related/196Calc tests,exact6shared and36Calc raw100/every counter positive,13source gates,build/real Chromium/DOM-free Worker and selected Writer pass without5refs.28intentional paths,source/Calc invariants and final audit pass;CALC-177/178/179 preserved. General parser/t/canonicalizer/LanguageTag/UI/ODS remain pending,no all-app run.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-16T05:01:08.608Z, excerpt_hash=sha256:16362aa731b9382f59ca6a47736eeee3edb31589482cc70d2dfd5c4e98979e9f

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202610160449-4VVT0H/blueprint/resolved-snapshot.json
- old_digest: 96d60a8fefb9700dccc72ea768fe5f094c111e01a71ac0559ccb6418043561c8
- current_digest: 96d60a8fefb9700dccc72ea768fe5f094c111e01a71ac0559ccb6418043561c8
- route_changed: no
- safe_command: agentplane blueprint snapshot 202610160449-4VVT0H

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202610160449-4VVT0H
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: false
- repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert only this task's implementation and registry records;retain pinned ignored source evidence and unrelated user/task changes. No destructive reset or merge.

## Findings

Source preflight confirms clean calc branch and no matching active task. The previous goal turn made authoritative progress:task194 DONE with scanner/IANA owners and verified portable strict coverage. New t handler cannot be honestly completed before actual general tag parser;this task implements complete independent Unicode handler and required functional CLDR responsibility boundary. Diagnostic values remain explicit projections of fresh native internal error slots,not a physical error stack/library.

An early bounded CLI read used head and caused harmless stdout EPIPE after Verify Steps were printed. Subsequent CLI reads use non-closing output filtering. No semantic mutation or failed verification was inferred from that read.

Final source review caught the JavaScript dollar-anchor exception before a trailing newline in the initial HEX regex. Native code checks every byte;production now uses explicit4..6length plus exclusion of any non-hex character. A direct callback regression for0061 followed by newline proves rejection;scanner-fed real inputs already reject newline earlier. This is a local implementation correction,not a new upstream suspicion. Rerun changed shared coverage,browser/build and affected static checks;Calc owners remain byte-identical to their passing portable run.
