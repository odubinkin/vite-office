---
id: "202610010138-ZRYS74"
title: "Restore native list-item start-value normalization"
result_summary: "Ordinary item starts follow native conversion and0..SHRTMAX acceptance; declaration consumers share conversion with unchanged defaults. Intentional document lifecycle differences preserved."
status: "DONE"
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
  updated_at: "2026-10-01T01:39:43.221Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-10-01T01:52:01.197Z"
  updated_by: "CODER"
  note: "Native115 conversions/170 real contexts and21 focused tests including88 genuine ODT cases pass. Final unchanged npm run verify exit0 session48616:648/109/19,both100% coverage,all other gates. Doctor0errors/two prior warnings,routing/diff pass. No whole-module/full-goal promotion; intentional save/open/recovery preserved."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-10-01T01:52:31.897Z"
  updated_by: "EVALUATOR"
  note: "Native ordinary start normalization and shared attribute integer access are source-backed and verified; actual implementation218b25bd8e27e82ac85819a8436a6bbaae6b58ff."
  evaluated_sha: "218b25bd8e27e82ac85819a8436a6bbaae6b58ff"
  blueprint_digest: "557b7218eec88179c26216fba06b692f854ca63daee68e1dac7217f8bfa3caee"
  evidence_refs:
    - ".agentplane/tasks/202610010138-ZRYS74/README.md"
    - ".agentplane/tasks/202610010138-ZRYS74/quality/20261001-015231897-recovery-context/quality-report.json"
    - ".agentplane/tasks/202610010138-ZRYS74/quality/20261001-015231897-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202610010138-ZRYS74/quality/20261001-015231897-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202610010138-ZRYS74/blueprint/resolved-snapshot.json"
    - ".agentplane/tasks/202610010138-ZRYS74/verify.log"
    - ".agentplane/tasks/202610010138-ZRYS74/native-results.json"
    - ".agentplane/tasks/202610010138-ZRYS74/compare-native.ts"
    - "apps/office/src/sw/source/filter/xml/odt-list-start-normalization.test.ts"
  findings:
    - "Strict syntax/range throws were removed in favor of shared byte-int conversion followed by the exact native0..SHRTMAX item guard. List declarations retain absent defaults,index/start/display policy; signed zero is canonical integer0. Headers bypass conversion and subsequent paragraphs consume no marker/start.115 compiled-source conversion results and170 real SAX contexts match;88 genuine common/automatic numbered/bullet ODT cases verify literal state,owned copies,Worker16,XML and reopen. Final full unchanged648/109/19 and100% coverage pass; code checkout clean."
commit:
  hash: "218b25bd8e27e82ac85819a8436a6bbaae6b58ff"
  message: "🧩 ZRYS74 code: normalize native list-item start values"
comments:
  -
    author: "CODER"
    body: "Start: restore native ordinary list-item start-value normalization and shared fast-attribute ownership under the persistent approved goal."
  -
    author: "CODER"
    body: "Verified: native ordinary list-start normalization,shared byte-int access,115 compiled-source values,170 real contexts and88 genuine ODT cases. Full unchanged648/109/19,both100% coverage; quality pass and actual code hash. Wider parent and goal remain active."
events:
  -
    type: "status"
    at: "2026-10-01T01:39:43.697Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: restore native ordinary list-item start-value normalization and shared fast-attribute ownership under the persistent approved goal."
  -
    type: "verify"
    at: "2026-10-01T01:52:01.197Z"
    author: "CODER"
    state: "ok"
    note: "Native115 conversions/170 real contexts and21 focused tests including88 genuine ODT cases pass. Final unchanged npm run verify exit0 session48616:648/109/19,both100% coverage,all other gates. Doctor0errors/two prior warnings,routing/diff pass. No whole-module/full-goal promotion; intentional save/open/recovery preserved."
  -
    type: "status"
    at: "2026-10-01T01:52:35.055Z"
    author: "CODER"
    from: "DOING"
    to: "DONE"
    note: "Verified: native ordinary list-start normalization,shared byte-int access,115 compiled-source values,170 real contexts and88 genuine ODT cases. Full unchanged648/109/19,both100% coverage; quality pass and actual code hash. Wider parent and goal remain active."
doc_version: 3
doc_updated_at: "2026-10-01T01:52:35.057Z"
doc_updated_by: "CODER"
description: "Iteration31: use shared fast-attribute byte-int conversion and native list-item range acceptance instead of strict rejection. Preserve intentional save/open/recovery behavior."
sections:
  Summary: "Restore ordinary list-item restart normalization through the native fast-attribute byte-int path. Iteration31 under the persistent approved full upstream goal."
  Scope: "xmloff/source/core/xmlimp.ts FastAttributeList and focused tests; style/xmlnumi.ts removes its private decimal bridge and uses the shared API; text/txtparai.ts and its context tests; genuine ODT list-start normalization tests; runtime inventory/source provenance/writer-odt-format.md; active task-local native probes. No new module root or validator/config/schema change. Existing hierarchical Arabic/bullet ODF1.3, Worker16, intentional save/open/recovery preserved. Repeated-sublist restart and whole fast attribute/UNO ownership remain separate."
  Plan: "Move the existing bounded decimal byte-int implementation from listDeclarationInt32 into FastAttributeList.getAsInteger, using nullable absence as the native bool/out-value adapter. Both declaration and ordinary item consumers delegate; preserve declaration defaults and branch normalization. Ordinary item constructor ignores converted negative/out-of-range values, accepts0..32767 including zero, and does not throw for conversion grammar. Headers continue to ignore start entirely. Confirm signed/whitespace/partial/no-digit/overflow/UTF8/NUL behavior against compiled unmodified pinned rtl/o3tl bodies plus exact native item range branch before making assertions. Verify helper extraction preserves previous declaration contracts and genuine ordinary/header/multi-paragraph/nested ODT state, literal counters/labels, owned copies,Worker16,export/reopen. Run unchanged full verify, source/doctor/routing/diff checks; record actual code hash and quality."
  Verify Steps: "Reproduce strict rejection of -1,32768,+1,garbage. Compile unmodified pinned rtl::str::toInt<sal_Int64>, HandleSignChar,DivMod,implGetDigit,implIsWhitespace and byte-view o3tl::toInt32 with explicit platform/view aliases; compare shared attribute conversion and exact native item0..SHRTMAX acceptance for empty,sign-only,signed zero/endpoints,ASCII control/space,Unicode UTF8,partial digits,decimal tail,hex-looking,embedded NUL,int32/int64 overflows and long digits. Assert nullable absent attributes and unchanged list declaration start/index/display defaults through existing focused tests. Genuine common/automatic numbered and bullet ODT fixtures must assert literal text,counted,level,restart,start,number,vector,label state,header ignored start,item first-para consumption,nested use,independent item/rule copies,Worker16,selected XML and reopen. Run npm run verify unchanged with both100% coverage suites and all browser/resource/static/source/metadata gates, ap doctor,routing validator,git diff --check. Record actual implementation hash, quality review and clean final tracked state. No mandatory skips or whole-module/full-goal promotion."
  Verification: |-
    Command: python3 .agentplane/tasks/202610010138-ZRYS74/native-oracle.py; npx tsx .agentplane/tasks/202610010138-ZRYS74/compare-native.ts.
    Result: pass.
    Evidence: 115 conversions and170 actual ordinary/header SAX contexts match unmodified pinned rtl/o3tl integer bodies and exact native item range branch. Includes signed/zero/endpoints, ASCII control whitespace, Unicode byte-view failures, partial/decimal/hex-looking input,NUL,int32/int64 overflow and long digits. Platform integer aliases,unsigned char,UTF8/view and iterator adapters are explicit; no full native/UNO/radix/UTF16 claim.
    Scope: native fast-attribute decimal conversion, nullable absence, ordinary0..SHRTMAX acceptance, header ignore and first-paragraph marker consumption.

    Command: npx vitest run src/xmloff/source/core/xmlimp.test.ts src/xmloff/source/text/txtparai.test.ts src/xmloff/source/style/xmlnumi.test.ts src/sw/source/filter/xml/odt-list-start-normalization.test.ts src/sw/source/filter/xml/odt-list-declaration-defaults.test.ts (apps/office).
    Result: pass, terminal session49342 exit0.
    Evidence:21 tests/5files.22 literal spellings ×common/automatic ×numbered/bullet =88 genuine package cases assert text,count,level,restart,effective/explicit start,number,vector,label,independent item/rule copies,Worker16,conditional restart XML and exact reopen. Existing declaration index/start/display defaults retain source behavior.
    Scope: ordinary and header list normalization through real Writer/ODT/copy/Worker boundaries including nested numbered items and continuations.

    Command: npm run verify.
    Result: pass, terminal session48616 exit0.
    Evidence:648 app/141files,109 inventory/36files,19 browser. App100% statements9937/branches7494/functions2741/lines9138; inventory100%1523/1080/384/1464. All unchanged formatting,lint,type,dependency,resource,static,docs,size,source-tree,provenance,invariant,parity gates pass. Provenance201modules(125mapped/60browser/16infrastructure),445JSDocfiles,34validinvariants,semanticViolationCount0. Compact terminal log retains actual summaries and scalar report; consistency is not whole upstream proof.
    Scope: full current repository verification; no mandatory skip/gate/schema change.

    Command: ap doctor; node .agentplane/policy/check-routing.mjs; git diff --check.
    Result: pass.
    Evidence: doctor0errors/same2prior warnings;policy routing OK;completed-log whitespace clean. All changes remain approved local scope; final scoped code hash and clean checkout are recorded before closure.
    Scope: lifecycle/policy/intentional changes. Harness semicolon and reader metadata omissions were test-only failures corrected under unchanged criteria; initial typecheck also identified the same missing reader metadata.

    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-10-01T01:52:01.197Z — VERIFY — ok

    By: CODER

    Note: Native115 conversions/170 real contexts and21 focused tests including88 genuine ODT cases pass. Final unchanged npm run verify exit0 session48616:648/109/19,both100% coverage,all other gates. Doctor0errors/two prior warnings,routing/diff pass. No whole-module/full-goal promotion; intentional save/open/recovery preserved.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-01T01:51:58.368Z, excerpt_hash=sha256:2c81a4a7501237cfac31041db250606a2e128a1cad9e6a4fb32ff09178e83b19

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202610010138-ZRYS74/blueprint/resolved-snapshot.json
    - old_digest: 557b7218eec88179c26216fba06b692f854ca63daee68e1dac7217f8bfa3caee
    - current_digest: 557b7218eec88179c26216fba06b692f854ca63daee68e1dac7217f8bfa3caee
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202610010138-ZRYS74

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202610010138-ZRYS74
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: false
    - repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "If needed revert only the scoped implementation through a new executable task. Preserve immutable DONE evidence and keep the full parent goal active."
  Findings: |-
    Preflight clean main/direct; parent202609240501-C9TN6M only active. User goal authorizes safe local iterations; no network/outside access or delegation. Previous turn is progress: iteration30 M2EDTZ DONE, real code fd0ede9f505568377bbcd15595938cb72dbfcf8c, quality417e99b6bd2e93918aa6a1cf96c0a9f6f2095c96, close8d2c70c5710de1a05fce8bfc40aeb44d01711192,parent8469c1ab21d8045c0efd66ec88a84c9f45294763. Pin libreoffice-26.8.0.2/9bc445578031fecf56086729d8e4940c77e14d65. Native ordinary XMLTextListItemContext calls toInt32 then accepts0..SHRT_MAX and retains-1 otherwise; local parser throws. Existing listDeclarationInt32 already models bounded decimal fast-attribute grammar but lives under one consuming list-style context. Shared FastAttributeList API is an adapter over native sax fast-attribute bool/out-int access, not a claim of full native ownership. Invalid guessed optional source paths in read-only discovery were resolved to include/sax/fastattribs.hxx,sax/source/tools/fastattribs.cxx and include/o3tl/string_view.hxx; no mutation resulted. Native repeated-sublist restart,full attribute token/container/scalar/UNO architecture and all broader model/UI obligations remain open.

    - Observation: Native harness compilation exits1: extracted with_length struct lacks its declaration semicolon because the balanced-body extractor stops at the closing brace.
      Impact: Adapter declaration assembly fails; no native/local conversion result has been compared yet.
      Resolution: Append the struct semicolon outside the unmodified body, persist the active harness artifacts and rerun; runtime scope and verification thresholds remain unchanged.

    - Observation: Focused suite exits1: new genuine ODT fixture omitted the required readOdtDocument metadata argument;20 other tests pass.
      Impact: Failure occurs at metadata.locale before list import; fixture needs canonical reader API, not runtime normalization changes.
      Resolution: Supply title metadata on input/reopen and rerun focused/full checks without changing gates.
id_source: "generated"
---
## Summary

Restore ordinary list-item restart normalization through the native fast-attribute byte-int path. Iteration31 under the persistent approved full upstream goal.

## Scope

xmloff/source/core/xmlimp.ts FastAttributeList and focused tests; style/xmlnumi.ts removes its private decimal bridge and uses the shared API; text/txtparai.ts and its context tests; genuine ODT list-start normalization tests; runtime inventory/source provenance/writer-odt-format.md; active task-local native probes. No new module root or validator/config/schema change. Existing hierarchical Arabic/bullet ODF1.3, Worker16, intentional save/open/recovery preserved. Repeated-sublist restart and whole fast attribute/UNO ownership remain separate.

## Plan

Move the existing bounded decimal byte-int implementation from listDeclarationInt32 into FastAttributeList.getAsInteger, using nullable absence as the native bool/out-value adapter. Both declaration and ordinary item consumers delegate; preserve declaration defaults and branch normalization. Ordinary item constructor ignores converted negative/out-of-range values, accepts0..32767 including zero, and does not throw for conversion grammar. Headers continue to ignore start entirely. Confirm signed/whitespace/partial/no-digit/overflow/UTF8/NUL behavior against compiled unmodified pinned rtl/o3tl bodies plus exact native item range branch before making assertions. Verify helper extraction preserves previous declaration contracts and genuine ordinary/header/multi-paragraph/nested ODT state, literal counters/labels, owned copies,Worker16,export/reopen. Run unchanged full verify, source/doctor/routing/diff checks; record actual code hash and quality.

## Verify Steps

Reproduce strict rejection of -1,32768,+1,garbage. Compile unmodified pinned rtl::str::toInt<sal_Int64>, HandleSignChar,DivMod,implGetDigit,implIsWhitespace and byte-view o3tl::toInt32 with explicit platform/view aliases; compare shared attribute conversion and exact native item0..SHRTMAX acceptance for empty,sign-only,signed zero/endpoints,ASCII control/space,Unicode UTF8,partial digits,decimal tail,hex-looking,embedded NUL,int32/int64 overflows and long digits. Assert nullable absent attributes and unchanged list declaration start/index/display defaults through existing focused tests. Genuine common/automatic numbered and bullet ODT fixtures must assert literal text,counted,level,restart,start,number,vector,label state,header ignored start,item first-para consumption,nested use,independent item/rule copies,Worker16,selected XML and reopen. Run npm run verify unchanged with both100% coverage suites and all browser/resource/static/source/metadata gates, ap doctor,routing validator,git diff --check. Record actual implementation hash, quality review and clean final tracked state. No mandatory skips or whole-module/full-goal promotion.

## Verification

Command: python3 .agentplane/tasks/202610010138-ZRYS74/native-oracle.py; npx tsx .agentplane/tasks/202610010138-ZRYS74/compare-native.ts.
Result: pass.
Evidence: 115 conversions and170 actual ordinary/header SAX contexts match unmodified pinned rtl/o3tl integer bodies and exact native item range branch. Includes signed/zero/endpoints, ASCII control whitespace, Unicode byte-view failures, partial/decimal/hex-looking input,NUL,int32/int64 overflow and long digits. Platform integer aliases,unsigned char,UTF8/view and iterator adapters are explicit; no full native/UNO/radix/UTF16 claim.
Scope: native fast-attribute decimal conversion, nullable absence, ordinary0..SHRTMAX acceptance, header ignore and first-paragraph marker consumption.

Command: npx vitest run src/xmloff/source/core/xmlimp.test.ts src/xmloff/source/text/txtparai.test.ts src/xmloff/source/style/xmlnumi.test.ts src/sw/source/filter/xml/odt-list-start-normalization.test.ts src/sw/source/filter/xml/odt-list-declaration-defaults.test.ts (apps/office).
Result: pass, terminal session49342 exit0.
Evidence:21 tests/5files.22 literal spellings ×common/automatic ×numbered/bullet =88 genuine package cases assert text,count,level,restart,effective/explicit start,number,vector,label,independent item/rule copies,Worker16,conditional restart XML and exact reopen. Existing declaration index/start/display defaults retain source behavior.
Scope: ordinary and header list normalization through real Writer/ODT/copy/Worker boundaries including nested numbered items and continuations.

Command: npm run verify.
Result: pass, terminal session48616 exit0.
Evidence:648 app/141files,109 inventory/36files,19 browser. App100% statements9937/branches7494/functions2741/lines9138; inventory100%1523/1080/384/1464. All unchanged formatting,lint,type,dependency,resource,static,docs,size,source-tree,provenance,invariant,parity gates pass. Provenance201modules(125mapped/60browser/16infrastructure),445JSDocfiles,34validinvariants,semanticViolationCount0. Compact terminal log retains actual summaries and scalar report; consistency is not whole upstream proof.
Scope: full current repository verification; no mandatory skip/gate/schema change.

Command: ap doctor; node .agentplane/policy/check-routing.mjs; git diff --check.
Result: pass.
Evidence: doctor0errors/same2prior warnings;policy routing OK;completed-log whitespace clean. All changes remain approved local scope; final scoped code hash and clean checkout are recorded before closure.
Scope: lifecycle/policy/intentional changes. Harness semicolon and reader metadata omissions were test-only failures corrected under unchanged criteria; initial typecheck also identified the same missing reader metadata.

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-10-01T01:52:01.197Z — VERIFY — ok

By: CODER

Note: Native115 conversions/170 real contexts and21 focused tests including88 genuine ODT cases pass. Final unchanged npm run verify exit0 session48616:648/109/19,both100% coverage,all other gates. Doctor0errors/two prior warnings,routing/diff pass. No whole-module/full-goal promotion; intentional save/open/recovery preserved.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-01T01:51:58.368Z, excerpt_hash=sha256:2c81a4a7501237cfac31041db250606a2e128a1cad9e6a4fb32ff09178e83b19

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202610010138-ZRYS74/blueprint/resolved-snapshot.json
- old_digest: 557b7218eec88179c26216fba06b692f854ca63daee68e1dac7217f8bfa3caee
- current_digest: 557b7218eec88179c26216fba06b692f854ca63daee68e1dac7217f8bfa3caee
- route_changed: no
- safe_command: agentplane blueprint snapshot 202610010138-ZRYS74

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202610010138-ZRYS74
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: false
- repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

If needed revert only the scoped implementation through a new executable task. Preserve immutable DONE evidence and keep the full parent goal active.

## Findings

Preflight clean main/direct; parent202609240501-C9TN6M only active. User goal authorizes safe local iterations; no network/outside access or delegation. Previous turn is progress: iteration30 M2EDTZ DONE, real code fd0ede9f505568377bbcd15595938cb72dbfcf8c, quality417e99b6bd2e93918aa6a1cf96c0a9f6f2095c96, close8d2c70c5710de1a05fce8bfc40aeb44d01711192,parent8469c1ab21d8045c0efd66ec88a84c9f45294763. Pin libreoffice-26.8.0.2/9bc445578031fecf56086729d8e4940c77e14d65. Native ordinary XMLTextListItemContext calls toInt32 then accepts0..SHRT_MAX and retains-1 otherwise; local parser throws. Existing listDeclarationInt32 already models bounded decimal fast-attribute grammar but lives under one consuming list-style context. Shared FastAttributeList API is an adapter over native sax fast-attribute bool/out-int access, not a claim of full native ownership. Invalid guessed optional source paths in read-only discovery were resolved to include/sax/fastattribs.hxx,sax/source/tools/fastattribs.cxx and include/o3tl/string_view.hxx; no mutation resulted. Native repeated-sublist restart,full attribute token/container/scalar/UNO architecture and all broader model/UI obligations remain open.

- Observation: Native harness compilation exits1: extracted with_length struct lacks its declaration semicolon because the balanced-body extractor stops at the closing brace.
  Impact: Adapter declaration assembly fails; no native/local conversion result has been compared yet.
  Resolution: Append the struct semicolon outside the unmodified body, persist the active harness artifacts and rerun; runtime scope and verification thresholds remain unchanged.

- Observation: Focused suite exits1: new genuine ODT fixture omitted the required readOdtDocument metadata argument;20 other tests pass.
  Impact: Failure occurs at metadata.locale before list import; fixture needs canonical reader API, not runtime normalization changes.
  Resolution: Supply title metadata on input/reopen and rerun focused/full checks without changing gates.
