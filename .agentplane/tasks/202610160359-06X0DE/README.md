---
id: "202610160359-06X0DE"
title: "Resolve pinned language parser contract and native JS substitution limits"
status: "DOING"
priority: "high"
owner: "CODER"
revision: 8
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
  - "source-audit"
task_kind: "code"
mutation_scope: "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-16T04:00:33.995Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-10-16T04:27:51.688Z"
  updated_by: "CODER"
  note: "Pinned2archives/246entries/13source hashes/6LibreOffice pins/3patches verified;17source-derived parser cases distinguish registration/prefix/CLDR/private/u/C-string contracts from actual JS.34audit/196Calc exact36raw100,13gates,build and actual Chromium/DOM-free Worker pass,4refs restored.6intentional test/docs paths,no production or capability change. CALC-175/176 recorded;value parser/data route concrete,no native execution/framework port/all-app run;UI/ODS pending."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-10-16T04:27:52.298Z"
  updated_by: "EVALUATOR"
  note: "Same-agent source/evidence audit passes the pinned parser contract and native JS substitution decision;not an independent review."
  evaluated_sha: "601269a5168f0a392e3de063b579304aff9b85cf"
  blueprint_digest: "a91ffb6faf5249bea1d2a1ff7b89b668a3ef0921ec6122e4600070758e788a41"
  evidence_refs:
    - ".agentplane/tasks/202610160359-06X0DE/README.md"
    - ".agentplane/tasks/202610160359-06X0DE/quality/20261016-042752298-recovery-context/quality-report.json"
    - ".agentplane/tasks/202610160359-06X0DE/quality/20261016-042752298-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202610160359-06X0DE/quality/20261016-042752298-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202610160359-06X0DE/blueprint/resolved-snapshot.json"
    - "output/playwright/task193-checks/final-verification.json"
  findings:
    - "Exact source archives/hashes/safe entries and13source files/6LibreOffice pins/3patches verified;normal versus cross registry versions and static t/u registration are explicit.17library outcomes are source-derived and not claimed as executed native results;actual JS Node/Chromium/Worker evidence separately records registration/canonicalization differences and matching controls. CALC-175/176 preserve source C-string/byte-prefix behavior with reachability caveats.34audit/196Calc exact36raw100,13gates,production build/browser pass,4refs restored.6intentional test/docs paths,production/inventory capability unchanged. Concrete next source-value parser/data route avoids physical trie/XML/refcount/plugin framework and fake parser/class. Full LanguageTag/font/pools/model/UI/ODS pending,no all-app run."
commit: null
comments:
  -
    author: "CODER"
    body: "Start: inspect verified LibreOffice-pinned liblangtag and registry source to resolve remaining LanguageTag parser behavior/native JS limits;produce source-anchored report/tests without native execution or a fake parser."
events:
  -
    type: "status"
    at: "2026-10-16T04:00:39.041Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: inspect verified LibreOffice-pinned liblangtag and registry source to resolve remaining LanguageTag parser behavior/native JS limits;produce source-anchored report/tests without native execution or a fake parser."
  -
    type: "verify"
    at: "2026-10-16T04:27:51.688Z"
    author: "CODER"
    state: "ok"
    note: "Pinned2archives/246entries/13source hashes/6LibreOffice pins/3patches verified;17source-derived parser cases distinguish registration/prefix/CLDR/private/u/C-string contracts from actual JS.34audit/196Calc exact36raw100,13gates,build and actual Chromium/DOM-free Worker pass,4refs restored.6intentional test/docs paths,no production or capability change. CALC-175/176 recorded;value parser/data route concrete,no native execution/framework port/all-app run;UI/ODS pending."
doc_version: 3
doc_updated_at: "2026-10-16T04:27:51.744Z"
doc_updated_by: "CODER"
description: "Task193: inspect LibreOffice-pinned liblangtag0.6.8 and IANA2026-06-14 source contracts for remaining LanguageTag parser branch,using approved upstream source reading;produce exact algorithm/data boundary and measured native-JS comparisons without native compilation or a fake parser/class."
sections:
  Summary: "Resolve the remaining LanguageTag general parser contract using LibreOffice-pinned liblangtag0.6.8 and IANA2026-06-14 source/data before implementing the actual enclosing owner. Standing user approval grants upstream source reading;read only pinned archives referenced by local LibreOffice download.lst from its source mirror,inside this repository. Local search found build metadata/patches but no parser source or registry archive."
  Scope: "Only vite-office-calc branch calc. Read exact pinned upstream dependency archives into ignored output,verify SHA256 before safe extraction,inspect actual parser/canonicalization/data branch contracts and compare candidate native JS behavior. Deliver a Calc-specific source-anchored contract report and reproducible test fixtures/browser observations. No native compilation/execution,generator,package install,ICU/liblangtag runtime implementation,physical ownership engine,production fake parser/LanguageTag or policy/guard changes. Maximum10non-task files. Evidence distinguishes source-derived outcomes from executed JS;do not claim executed LibreOffice/library behavior or full parity."
  Plan: "Read only exact LibreOffice-pinned liblangtag/IANA archives with verified hashes;resolve remaining general parser/canonicalization/data contract and measured native JS limits. Produce source-anchored fixtures/report and real browser evidence,not a fake parser/class or unnecessary library port;verify Calc strict coverage and source gates."
  Verify Steps: |-
    - node output/playwright/task193-checks/native-audit.mjs:local LibreOffice pin/download hashes,actual archive SHA256/safe source inventory/exact contract and fixture anchors;no production/policy/guard changes.
    - node output/playwright/task193-checks/portable.mjs:related native-JS audit and wholeCalc with four source refs absent/restored;exact36Calc owners raw S/B/F/L100,every counter positive. No changed shared runtime owner so no new shared runtime coverage scope.
    - node output/playwright/task193-checks/browser-portable.mjs:production build and actual Chromium/DOM-free Worker native-JS audit,source refs absent/restored;no native binary or fake production parser.
    - node output/playwright/task193-checks/source-gates.mjs:13source gates including inventory/provenance/boundaries/doctor with no exemptions.
    - node output/playwright/task193-checks/final-audit.mjs:exact source/fixture/observations/path evidence,reference restoration and truthful implementation next boundary;source commit,recorded verify and same-agent EVALUATOR review then descriptive finish.
  Verification: |-
    Command:curl exact two LibreOffice source-mirror archive URLs into task output,then SHA256/safe regular-file extraction. Result:pass. Evidence:liblangtag0.6.8 a96975b79ddd8fef6d9295c083fe3f1afa1a8898a57235d4069255ade44e5cf2 and registry2026-06-14 e74af13fd11fbcb24a5910d0f50e45d8505d86267bde2bb2d1d45aed966bc3bb match pinned download.lst;246extracted entries,no archive scripts/native binaries run. Command:node output/playwright/task193-checks/native-audit.mjs. Result:pass. Evidence:13source hashes,6LibreOffice pins/3build patches,registry counts/selected functional records and version equivalence,alias/calendar/key data,static t/u and source scanner/prefix/C-string anchors.17expected outcomes are source-derived,not native execution. Command:node output/playwright/task193-checks/portable.mjs. Result:pass. Evidence:34audit/2files and196Calc/78files,exact36Calc raw S4310/B2777/F864/L3857100,every counter positive,4source refs absent/restored. No changed shared runtime owner or new shared coverage scope. Command:node output/playwright/task193-checks/browser-portable.mjs. Result:pass. Evidence:production build and actual Node24/Chromium151/DOM-free Worker observations agree on17selected cases;14differences from source-derived outcomes,3matching controls,not a compatibility rate. Command:node output/playwright/task193-checks/source-gates.mjs. Result:13gates pass including unchanged inventory/provenance/guards. Command:node output/playwright/task193-checks/final-audit.mjs. Result:pass. Evidence:6intentional test/doc paths,exact source/fixture/observations/owner/ref manifests. Report chooses source value parser/functional data over wholesale Intl replacement and unnecessary physical library framework;CALC-175/176 recorded without sourcefix. No production parser/class/library/memoryengine/capability promotion/all-app run. Full LanguageTag/font/defaults/pools/model/UI/ODS remain pending;goal active.

    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-10-16T04:27:51.688Z — VERIFY — ok

    By: CODER

    Note: Pinned2archives/246entries/13source hashes/6LibreOffice pins/3patches verified;17source-derived parser cases distinguish registration/prefix/CLDR/private/u/C-string contracts from actual JS.34audit/196Calc exact36raw100,13gates,build and actual Chromium/DOM-free Worker pass,4refs restored.6intentional test/docs paths,no production or capability change. CALC-175/176 recorded;value parser/data route concrete,no native execution/framework port/all-app run;UI/ODS pending.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-16T04:27:50.221Z, excerpt_hash=sha256:73f7ba18524cfaf1e3df3e3c7f14ea0ec892b771de6f75b5116bb38129e18e8a

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202610160359-06X0DE/blueprint/resolved-snapshot.json
    - old_digest: a91ffb6faf5249bea1d2a1ff7b89b668a3ef0921ec6122e4600070758e788a41
    - current_digest: a91ffb6faf5249bea1d2a1ff7b89b668a3ef0921ec6122e4600070758e788a41
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202610160359-06X0DE

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202610160359-06X0DE
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: false
    - repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert only this task's test/doc source commit;ignored source archives can be retained as pinned evidence. Do not reset user work or touch unrelated tasks. No destructive cleanup required."
  Findings: "None. Generic Intl substitution was already disproved on29source QA cases in task189;this task distinguishes native known-tag handling from the actual external-parser branch so that broad library/memory infrastructure is not ported without evidence."
id_source: "generated"
---
## Summary

Resolve the remaining LanguageTag general parser contract using LibreOffice-pinned liblangtag0.6.8 and IANA2026-06-14 source/data before implementing the actual enclosing owner. Standing user approval grants upstream source reading;read only pinned archives referenced by local LibreOffice download.lst from its source mirror,inside this repository. Local search found build metadata/patches but no parser source or registry archive.

## Scope

Only vite-office-calc branch calc. Read exact pinned upstream dependency archives into ignored output,verify SHA256 before safe extraction,inspect actual parser/canonicalization/data branch contracts and compare candidate native JS behavior. Deliver a Calc-specific source-anchored contract report and reproducible test fixtures/browser observations. No native compilation/execution,generator,package install,ICU/liblangtag runtime implementation,physical ownership engine,production fake parser/LanguageTag or policy/guard changes. Maximum10non-task files. Evidence distinguishes source-derived outcomes from executed JS;do not claim executed LibreOffice/library behavior or full parity.

## Plan

Read only exact LibreOffice-pinned liblangtag/IANA archives with verified hashes;resolve remaining general parser/canonicalization/data contract and measured native JS limits. Produce source-anchored fixtures/report and real browser evidence,not a fake parser/class or unnecessary library port;verify Calc strict coverage and source gates.

## Verify Steps

- node output/playwright/task193-checks/native-audit.mjs:local LibreOffice pin/download hashes,actual archive SHA256/safe source inventory/exact contract and fixture anchors;no production/policy/guard changes.
- node output/playwright/task193-checks/portable.mjs:related native-JS audit and wholeCalc with four source refs absent/restored;exact36Calc owners raw S/B/F/L100,every counter positive. No changed shared runtime owner so no new shared runtime coverage scope.
- node output/playwright/task193-checks/browser-portable.mjs:production build and actual Chromium/DOM-free Worker native-JS audit,source refs absent/restored;no native binary or fake production parser.
- node output/playwright/task193-checks/source-gates.mjs:13source gates including inventory/provenance/boundaries/doctor with no exemptions.
- node output/playwright/task193-checks/final-audit.mjs:exact source/fixture/observations/path evidence,reference restoration and truthful implementation next boundary;source commit,recorded verify and same-agent EVALUATOR review then descriptive finish.

## Verification

Command:curl exact two LibreOffice source-mirror archive URLs into task output,then SHA256/safe regular-file extraction. Result:pass. Evidence:liblangtag0.6.8 a96975b79ddd8fef6d9295c083fe3f1afa1a8898a57235d4069255ade44e5cf2 and registry2026-06-14 e74af13fd11fbcb24a5910d0f50e45d8505d86267bde2bb2d1d45aed966bc3bb match pinned download.lst;246extracted entries,no archive scripts/native binaries run. Command:node output/playwright/task193-checks/native-audit.mjs. Result:pass. Evidence:13source hashes,6LibreOffice pins/3build patches,registry counts/selected functional records and version equivalence,alias/calendar/key data,static t/u and source scanner/prefix/C-string anchors.17expected outcomes are source-derived,not native execution. Command:node output/playwright/task193-checks/portable.mjs. Result:pass. Evidence:34audit/2files and196Calc/78files,exact36Calc raw S4310/B2777/F864/L3857100,every counter positive,4source refs absent/restored. No changed shared runtime owner or new shared coverage scope. Command:node output/playwright/task193-checks/browser-portable.mjs. Result:pass. Evidence:production build and actual Node24/Chromium151/DOM-free Worker observations agree on17selected cases;14differences from source-derived outcomes,3matching controls,not a compatibility rate. Command:node output/playwright/task193-checks/source-gates.mjs. Result:13gates pass including unchanged inventory/provenance/guards. Command:node output/playwright/task193-checks/final-audit.mjs. Result:pass. Evidence:6intentional test/doc paths,exact source/fixture/observations/owner/ref manifests. Report chooses source value parser/functional data over wholesale Intl replacement and unnecessary physical library framework;CALC-175/176 recorded without sourcefix. No production parser/class/library/memoryengine/capability promotion/all-app run. Full LanguageTag/font/defaults/pools/model/UI/ODS remain pending;goal active.

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-10-16T04:27:51.688Z — VERIFY — ok

By: CODER

Note: Pinned2archives/246entries/13source hashes/6LibreOffice pins/3patches verified;17source-derived parser cases distinguish registration/prefix/CLDR/private/u/C-string contracts from actual JS.34audit/196Calc exact36raw100,13gates,build and actual Chromium/DOM-free Worker pass,4refs restored.6intentional test/docs paths,no production or capability change. CALC-175/176 recorded;value parser/data route concrete,no native execution/framework port/all-app run;UI/ODS pending.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-16T04:27:50.221Z, excerpt_hash=sha256:73f7ba18524cfaf1e3df3e3c7f14ea0ec892b771de6f75b5116bb38129e18e8a

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202610160359-06X0DE/blueprint/resolved-snapshot.json
- old_digest: a91ffb6faf5249bea1d2a1ff7b89b668a3ef0921ec6122e4600070758e788a41
- current_digest: a91ffb6faf5249bea1d2a1ff7b89b668a3ef0921ec6122e4600070758e788a41
- route_changed: no
- safe_command: agentplane blueprint snapshot 202610160359-06X0DE

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202610160359-06X0DE
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: false
- repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert only this task's test/doc source commit;ignored source archives can be retained as pinned evidence. Do not reset user work or touch unrelated tasks. No destructive cleanup required.

## Findings

None. Generic Intl substitution was already disproved on29source QA cases in task189;this task distinguishes native known-tag handling from the actual external-parser branch so that broad library/memory infrastructure is not ported without evidence.
