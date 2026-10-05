---
id: "202610050217-Y5P172"
title: "Restore shell insertion modes and stored undo flags"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 10
origin:
  system: "manual"
depends_on: []
tags:
  - "parity"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-05T02:18:51.401Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-10-05T02:34:03.441Z"
  updated_by: "CODER"
  note: "Verified bounded shell Insert2 policy and stored undo modes;one absent full profile,161failed-only cases recovered once,all source/scope gates pass;full parity remains unverified."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-10-05T02:33:17.094Z"
  updated_by: "EVALUATOR"
  note: "Same-actor read-only review of semantic SHA b1ae1b53f482f6f2495bbe0b2df258ad83e0b646: bounded shell and undo insertion modes satisfy approved scope."
  evaluated_sha: "b1ae1b53f482f6f2495bbe0b2df258ad83e0b646"
  blueprint_digest: "1036510f37145ba19243c7b2278c8a2cb84334bac8d533a7b32117e178712a94"
  evidence_refs:
    - ".agentplane/tasks/202610050217-Y5P172/README.md"
    - ".agentplane/tasks/202610050217-Y5P172/quality/20261005-023317094-recovery-context/quality-report.json"
    - ".agentplane/tasks/202610050217-Y5P172/quality/20261005-023317094-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202610050217-Y5P172/quality/20261005-023317094-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202610050217-Y5P172/blueprint/resolved-snapshot.json"
    - ".agentplane/tasks/202610050217-Y5P172/evidence/scope-and-native-hashes.json"
    - ".agentplane/tasks/202610050217-Y5P172/evidence/absent-profile.json"
    - ".agentplane/tasks/202610050217-Y5P172/evidence/failed-case-replay.json"
    - ".agentplane/tasks/202610050217-Y5P172/evidence/restored-source-audits.json"
  findings:
    - "Native Insert2 normal1/forced5,stored undo flags and current FORCE grouping barrier are covered;selection adapters remain unchanged pending native attribute history."
    - "One full absent profile;161 exact failed cases recovered once,1572 skipped,no passing case/suite/build replays;app and inventory first-profile coverage100%allfour."
    - "Nine semantic paths,356of359oldtestfiles byte-identical,two syntax-only files,five DEFAULT constructor migrations,and one observed old history case corrected;242runtime states/defaults/exceptions retained."
commit: null
comments:
  -
    author: "CODER"
    body: "Start: restore collapsed shell modes and stored undo flags under the standing parity goal."
events:
  -
    type: "status"
    at: "2026-10-05T02:18:37.730Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: restore collapsed shell modes and stored undo flags under the standing parity goal."
  -
    type: "verify"
    at: "2026-10-05T02:34:03.441Z"
    author: "CODER"
    state: "ok"
    note: "Verified bounded shell Insert2 policy and stored undo modes;one absent full profile,161failed-only cases recovered once,all source/scope gates pass;full parity remains unverified."
doc_version: 3
doc_updated_at: "2026-10-05T02:34:03.492Z"
doc_updated_by: "CODER"
description: "Continuation 133: restore collapsed SwEditShell Insert2 EMPTYEXPAND policy and required stored SwUndoInsert insertion flags, including the current FORCE grouping barrier; preserve selection adapters until native attribute history exists."
sections:
  Summary: "Restore shell insertion modes and stored undo flags."
  Scope: |-
    - apps/office/src/sw/source/core/edit/editsh.ts
    - apps/office/src/sw/source/core/undo/unins.ts
    - apps/office/src/sw/source/uibase/wrtsh/wrtsh-editing.ts
    - apps/office/src/sw/source/core/undo/undobj.test.ts
    - apps/office/src/sw/source/uibase/wrtsh/native-typing-internet-ownership.test.ts
    - apps/office/src/sw/source/core/txtnode/native-empty-hint-ownership.test.ts
    - apps/office/src/sw/source/uibase/wrtsh/native-shell-insert-modes.test.ts
    - docs/program/source-provenance.json
    - docs/program/parity/runtime-inventory.json
  Plan: "Restore source-owned SwEditShell Insert2 collapsed insertion policy: normal EMPTYEXPAND1 and forced EMPTYEXPAND|FORCEHINTEXPAND5 factory in existing editsh. Require SwUndoInsert stored native flags before optional pending items;typed redo forwards stored flags;new candidate FORCE cannot group,ordinary after forced remains eligible under existing bounded payload checks and retains original mode. Collapsed Insert,Replace and composition use factory;keep current same-node and cross-node selection adapters pending native SwHistory/SwHistorySetText rollback. Hyperlink fragment adapter and two prior constructor test files migrate with explicit DEFAULT only,unchanged expectations. New source-independent literal mode/mask/lock/oldIgnore/boundary/owned INET metadata/IDs/map/node/backlink/caret/undo/redo/pending clone/grouping tests cover actual paths. Only the prior empty-internet typing undo/redo case may change after concrete first-profile failure,from DEFAULT-shifted zero to EMPTY-expanded range;all other356of359prior tests byte-identical. Preserve242runtime rows/status/defaults/exceptions with three bounded responsibility appendices and mapped factory/symbol;no promotions/newmodule. Sixstatic gates first;one sequential absent full build/app/inventory/scripts/Chromium with finally restore and immediate exact failed full names;only failed gates/cases repeated,no passing suite/case/build replays. Restore before five source audits,scope/native hashes/AP forbidden scan/exact semantic SHA same-actor readonly EVALUATOR/doctor/routing/CODER verification/canonical finish. Bounded English prose/counts/hashes only in AP,no source/code/helper/Python/rawdiagnostics. Registered I/O deviations untouched;selection history/full native grouping/redline/multicursor/index overloads/GCAttr/COPY/BuildPortions/families/styleclients/UNO/refcounts/core/UI remain unverified."
  Verify Steps: |-
    - `npm run format:check`
    - `npm run lint`
    - `npm run typecheck`
    - `npm run check:dependencies`
    - `npm run check:docs`
    - `npm run check:file-size`
    - `npm run test:static`
    - `npm run test:coverage --workspace @vite-office/office -- --coverage.reportOnFailure`
    - `npm run test:inventory:coverage -- --coverage.reportOnFailure`
    - `npm exec -- vitest run scripts/check-source-provenance.test.ts scripts/writer-ui-resource-model.test.ts`
    - `npm exec -- playwright test --config apps/office/playwright.config.ts`
    - `npm exec -- tsx scripts/generate-writer-ui-resources.ts --check`
    - `npm run check:source-tree`
    - `npm run check:source-provenance`
    - `npm run inventory:invariants`
    - `npm run inventory:parity`
    - `ap doctor`
    - `node .agentplane/policy/check-routing.mjs`

    Static first;one full absent profile,exact failed names captured immediately;only failures replayed. Restore before source/scope/AP audits. Audit359prior test files,242runtime rows,native hashes and exact semantic SHA.
  Verification: |-
    Command: npm run format:check; npm run lint; npm run typecheck; npm run check:dependencies; npm run check:docs; npm run check:file-size.
    Result: pass;only failed lint/type gates recovered.
    Evidence: static-gates.json initial formatpass/lintfail,static-recovery.json lintpass/typefail,static-recovery-2.json type/dependency/docs/sizepass. Unused test import and literal enumcombination fixed before fullprofile;changed fixture Prettier/ESLint passed after expectation corrections.
    Scope: approved code/fixture contracts.

    Command: npm run test:static; npm run test:coverage --workspace @vite-office/office -- --coverage.reportOnFailure; npm run test:inventory:coverage -- --coverage.reportOnFailure; npm exec -- vitest run scripts/check-source-provenance.test.ts scripts/writer-ui-resource-model.test.ts; npm exec -- playwright test --config apps/office/playwright.config.ts.
    Result: one full upstream-absent sequential profile;first app failures recovered by one exact failed-case replay.
    Evidence: absent-profile.json:buildpass,app9073pass/161fail of9234(277files),inventory109/36files,scripts5,Chromium99 firstpass. App/inventory100%lines/statements/functions/branches. failed-case-replay.json:161pass/1572skip of1733 in two files;exact first-profile full names and selected-name hash preserved. Zero passing case/suite/build replays.
    Scope: one old EMPTYEXPAND expectation corrected to active2..4 and160new empty-erasure history expectations corrected to native interior-GC detachment;productionunchanged afterfullprofile. Reference renamed inside repo and restored in finally for both runs;no source/scope/APaudit concurrent with tests.

    Command: npm exec -- tsx scripts/generate-writer-ui-resources.ts --check; npm run check:source-tree; npm run check:source-provenance; npm run inventory:invariants; npm run inventory:parity.
    Result: pass5after vendor restoration.
    Evidence: restored-source-audits.json,0semanticviolations.
    Scope: pinned source audits only,never test dependencies.

    Command: ap doctor; node .agentplane/policy/check-routing.mjs; exact scope/native hash/AST/readonly SHA audit;ignored-inclusive AP forbidden scan.
    Result: pass;doctor0errors/two unchangedlegacywarnings,routingOK,3921APfiles0forbidden beforequality.
    Evidence: scope-and-native-hashes.json;.agentplane/tasks/202610050217-Y5P172/quality/20261005-023317094-recovery-context/quality-report.json;same-actor read-only evaluated semanticSHA b1ae1b53f482f6f2495bbe0b2df258ad83e0b646. Nine semantic paths,359prior tests(356byteidentical/twosyntax-only with5DEFAULT constructor migrations/one observed historycase changed);1547newcases;242runtime states/defaults/exceptions retained except3bounded appendices/onefactory mapping;9nativehashes;selectionbranch unchanged. Initial scope-audit header path corrected,commit-message scope corrected to parity after hook rejection;no test/codechanges or passing replays for those process corrections.
    Scope: bounded shell mode and undo storedflags review;fullnative selectionhistory/manager grouping/redline/multicursor/indexoverloads/GCAttr/COPY/BuildPortions/families/styleclients/UNO/refcounts/core/UI remain unverified. Registered I/O/recovery deviations preserved;no promotion;goalactive.

    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-10-05T02:34:03.441Z — VERIFY — ok

    By: CODER

    Note: Verified bounded shell Insert2 policy and stored undo modes;one absent full profile,161failed-only cases recovered once,all source/scope gates pass;full parity remains unverified.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-05T02:34:03.095Z, excerpt_hash=sha256:9f21968465b18414f1ec2c7ad93f7bf75bc183a0d9a526dd1dc67b6fa11e6cd3

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202610050217-Y5P172/blueprint/resolved-snapshot.json
    - old_digest: 1036510f37145ba19243c7b2278c8a2cb84334bac8d533a7b32117e178712a94
    - current_digest: 1036510f37145ba19243c7b2278c8a2cb84334bac8d533a7b32117e178712a94
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202610050217-Y5P172

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane commit 202610050217-Y5P172 -m 🧩 Y5P172 task: persist canonical task artifacts --allow-tasks
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: true
    - repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert the semantic leaf commit without rewriting history."
  Findings: |-
    Preflight133:cleanmain ce6c0d1c16fefe6a071a07a370580fd2053ae9a3,direct,onlyparentactive;132 verified progress,notblocked. Pin26.8.0.2/9bc445578031fecf56086729d8e4940c77e14d65. Native editsh.cxx98 normal1/forced5;unins.cxx102 stores flags and340 reuses them;DocumentContentOperationsManager.cxx2902 currentFORCE skips grouping while ordinary may group after forced. Native insert undo erases text without restoring consumed DontExpand;first and redo ranges may differ. Selection delete+force requires missing SwHistory/SwHistorySetText rollback;retained adapters explicitly unverified. Fourmatchedpolicies loaded,user-instructions absent,standing usergoal authorizes safe local scope,no network/outside/globalaccess.

    Implementation133:collapsed shell Insert/Replace/composition now use source-owned Insert2 policy EMPTY1;forcedfactory5 is tested but selection adapters intentionally retained pending native history. Required m_nInsertFlags is stored by SwUndoInsert and forwarded on redo;current candidate FORCE grouping rejected,ordinary after forced accepted under bounded existing payload checks and grouped redo retains firstmode. Hyperlink adapter and2priorfixtures received5syntax-only DEFAULT constructor migrations.1547newcases cover real owner/mode/flags/lock/oldIgnore/empty/boundary/history/grouping/pending paths. Staticfirstformatpass/lintfailunusedtestimport;failedlint recovered,typefailnumericliteral5;native bitwise enumcombination fixed and failedtype recovered;remainingdependency/docs/size passed. Changedfixture formatting/lint passed. One full absent profile:buildpass,app9073pass/161fail of9234,100%allfourcoverage,inventory109/100%allfour,scripts5,Chromium99 firstpass. Exactly161failed full names captured in firstprofile;one old EMPTY historycase corrected from zero4..4 to active2..4 while preserving actual item,other185cases unchanged.160newempty undo matrixcases wrongly assumed ownership survives interior GC;native ndtxt.cxx2860 erasure removes zero hints strictly inside deleted range;literal masks now assert detachment and no reconstructed link on redo. Only161failedcases replayed once absent:161pass/1572skip of1733,zero passing case/suite/build replays. Productionunchanged after fullprofile. Finally restored reference before5sourceaudits,allpass0semanticviolations. Scope359prior files:356byteidentical,2ASTsyntax-only with expectations unchanged,1singleobservedhistorycase changed;242runtime rows/states/defaults/exceptions retained except3bounded appendices/onefactory mapping. Nine native hashes recorded;selectionbranch byte-identical. Initial scope-audit header path corrected to actual core/inc/rolbck.hxx without source or test changes/replays. APignored-inclusive3921files0forbidden;doctor0errors/two unchangedlegacywarnings;routingOK. Fullcore/UI/selectionhistory/managergrouping/redline/multicursor/indexoverloads/GCAttr/COPY/BuildPortions/families/styleclients/UNO/refcounts remain unverified;goal active,verifiedprogress,noexternalblocker.
id_source: "generated"
---
## Summary

Restore shell insertion modes and stored undo flags.

## Scope

- apps/office/src/sw/source/core/edit/editsh.ts
- apps/office/src/sw/source/core/undo/unins.ts
- apps/office/src/sw/source/uibase/wrtsh/wrtsh-editing.ts
- apps/office/src/sw/source/core/undo/undobj.test.ts
- apps/office/src/sw/source/uibase/wrtsh/native-typing-internet-ownership.test.ts
- apps/office/src/sw/source/core/txtnode/native-empty-hint-ownership.test.ts
- apps/office/src/sw/source/uibase/wrtsh/native-shell-insert-modes.test.ts
- docs/program/source-provenance.json
- docs/program/parity/runtime-inventory.json

## Plan

Restore source-owned SwEditShell Insert2 collapsed insertion policy: normal EMPTYEXPAND1 and forced EMPTYEXPAND|FORCEHINTEXPAND5 factory in existing editsh. Require SwUndoInsert stored native flags before optional pending items;typed redo forwards stored flags;new candidate FORCE cannot group,ordinary after forced remains eligible under existing bounded payload checks and retains original mode. Collapsed Insert,Replace and composition use factory;keep current same-node and cross-node selection adapters pending native SwHistory/SwHistorySetText rollback. Hyperlink fragment adapter and two prior constructor test files migrate with explicit DEFAULT only,unchanged expectations. New source-independent literal mode/mask/lock/oldIgnore/boundary/owned INET metadata/IDs/map/node/backlink/caret/undo/redo/pending clone/grouping tests cover actual paths. Only the prior empty-internet typing undo/redo case may change after concrete first-profile failure,from DEFAULT-shifted zero to EMPTY-expanded range;all other356of359prior tests byte-identical. Preserve242runtime rows/status/defaults/exceptions with three bounded responsibility appendices and mapped factory/symbol;no promotions/newmodule. Sixstatic gates first;one sequential absent full build/app/inventory/scripts/Chromium with finally restore and immediate exact failed full names;only failed gates/cases repeated,no passing suite/case/build replays. Restore before five source audits,scope/native hashes/AP forbidden scan/exact semantic SHA same-actor readonly EVALUATOR/doctor/routing/CODER verification/canonical finish. Bounded English prose/counts/hashes only in AP,no source/code/helper/Python/rawdiagnostics. Registered I/O deviations untouched;selection history/full native grouping/redline/multicursor/index overloads/GCAttr/COPY/BuildPortions/families/styleclients/UNO/refcounts/core/UI remain unverified.

## Verify Steps

- `npm run format:check`
- `npm run lint`
- `npm run typecheck`
- `npm run check:dependencies`
- `npm run check:docs`
- `npm run check:file-size`
- `npm run test:static`
- `npm run test:coverage --workspace @vite-office/office -- --coverage.reportOnFailure`
- `npm run test:inventory:coverage -- --coverage.reportOnFailure`
- `npm exec -- vitest run scripts/check-source-provenance.test.ts scripts/writer-ui-resource-model.test.ts`
- `npm exec -- playwright test --config apps/office/playwright.config.ts`
- `npm exec -- tsx scripts/generate-writer-ui-resources.ts --check`
- `npm run check:source-tree`
- `npm run check:source-provenance`
- `npm run inventory:invariants`
- `npm run inventory:parity`
- `ap doctor`
- `node .agentplane/policy/check-routing.mjs`

Static first;one full absent profile,exact failed names captured immediately;only failures replayed. Restore before source/scope/AP audits. Audit359prior test files,242runtime rows,native hashes and exact semantic SHA.

## Verification

Command: npm run format:check; npm run lint; npm run typecheck; npm run check:dependencies; npm run check:docs; npm run check:file-size.
Result: pass;only failed lint/type gates recovered.
Evidence: static-gates.json initial formatpass/lintfail,static-recovery.json lintpass/typefail,static-recovery-2.json type/dependency/docs/sizepass. Unused test import and literal enumcombination fixed before fullprofile;changed fixture Prettier/ESLint passed after expectation corrections.
Scope: approved code/fixture contracts.

Command: npm run test:static; npm run test:coverage --workspace @vite-office/office -- --coverage.reportOnFailure; npm run test:inventory:coverage -- --coverage.reportOnFailure; npm exec -- vitest run scripts/check-source-provenance.test.ts scripts/writer-ui-resource-model.test.ts; npm exec -- playwright test --config apps/office/playwright.config.ts.
Result: one full upstream-absent sequential profile;first app failures recovered by one exact failed-case replay.
Evidence: absent-profile.json:buildpass,app9073pass/161fail of9234(277files),inventory109/36files,scripts5,Chromium99 firstpass. App/inventory100%lines/statements/functions/branches. failed-case-replay.json:161pass/1572skip of1733 in two files;exact first-profile full names and selected-name hash preserved. Zero passing case/suite/build replays.
Scope: one old EMPTYEXPAND expectation corrected to active2..4 and160new empty-erasure history expectations corrected to native interior-GC detachment;productionunchanged afterfullprofile. Reference renamed inside repo and restored in finally for both runs;no source/scope/APaudit concurrent with tests.

Command: npm exec -- tsx scripts/generate-writer-ui-resources.ts --check; npm run check:source-tree; npm run check:source-provenance; npm run inventory:invariants; npm run inventory:parity.
Result: pass5after vendor restoration.
Evidence: restored-source-audits.json,0semanticviolations.
Scope: pinned source audits only,never test dependencies.

Command: ap doctor; node .agentplane/policy/check-routing.mjs; exact scope/native hash/AST/readonly SHA audit;ignored-inclusive AP forbidden scan.
Result: pass;doctor0errors/two unchangedlegacywarnings,routingOK,3921APfiles0forbidden beforequality.
Evidence: scope-and-native-hashes.json;.agentplane/tasks/202610050217-Y5P172/quality/20261005-023317094-recovery-context/quality-report.json;same-actor read-only evaluated semanticSHA b1ae1b53f482f6f2495bbe0b2df258ad83e0b646. Nine semantic paths,359prior tests(356byteidentical/twosyntax-only with5DEFAULT constructor migrations/one observed historycase changed);1547newcases;242runtime states/defaults/exceptions retained except3bounded appendices/onefactory mapping;9nativehashes;selectionbranch unchanged. Initial scope-audit header path corrected,commit-message scope corrected to parity after hook rejection;no test/codechanges or passing replays for those process corrections.
Scope: bounded shell mode and undo storedflags review;fullnative selectionhistory/manager grouping/redline/multicursor/indexoverloads/GCAttr/COPY/BuildPortions/families/styleclients/UNO/refcounts/core/UI remain unverified. Registered I/O/recovery deviations preserved;no promotion;goalactive.

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-10-05T02:34:03.441Z — VERIFY — ok

By: CODER

Note: Verified bounded shell Insert2 policy and stored undo modes;one absent full profile,161failed-only cases recovered once,all source/scope gates pass;full parity remains unverified.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-05T02:34:03.095Z, excerpt_hash=sha256:9f21968465b18414f1ec2c7ad93f7bf75bc183a0d9a526dd1dc67b6fa11e6cd3

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202610050217-Y5P172/blueprint/resolved-snapshot.json
- old_digest: 1036510f37145ba19243c7b2278c8a2cb84334bac8d533a7b32117e178712a94
- current_digest: 1036510f37145ba19243c7b2278c8a2cb84334bac8d533a7b32117e178712a94
- route_changed: no
- safe_command: agentplane blueprint snapshot 202610050217-Y5P172

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane commit 202610050217-Y5P172 -m 🧩 Y5P172 task: persist canonical task artifacts --allow-tasks
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: true
- repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert the semantic leaf commit without rewriting history.

## Findings

Preflight133:cleanmain ce6c0d1c16fefe6a071a07a370580fd2053ae9a3,direct,onlyparentactive;132 verified progress,notblocked. Pin26.8.0.2/9bc445578031fecf56086729d8e4940c77e14d65. Native editsh.cxx98 normal1/forced5;unins.cxx102 stores flags and340 reuses them;DocumentContentOperationsManager.cxx2902 currentFORCE skips grouping while ordinary may group after forced. Native insert undo erases text without restoring consumed DontExpand;first and redo ranges may differ. Selection delete+force requires missing SwHistory/SwHistorySetText rollback;retained adapters explicitly unverified. Fourmatchedpolicies loaded,user-instructions absent,standing usergoal authorizes safe local scope,no network/outside/globalaccess.

Implementation133:collapsed shell Insert/Replace/composition now use source-owned Insert2 policy EMPTY1;forcedfactory5 is tested but selection adapters intentionally retained pending native history. Required m_nInsertFlags is stored by SwUndoInsert and forwarded on redo;current candidate FORCE grouping rejected,ordinary after forced accepted under bounded existing payload checks and grouped redo retains firstmode. Hyperlink adapter and2priorfixtures received5syntax-only DEFAULT constructor migrations.1547newcases cover real owner/mode/flags/lock/oldIgnore/empty/boundary/history/grouping/pending paths. Staticfirstformatpass/lintfailunusedtestimport;failedlint recovered,typefailnumericliteral5;native bitwise enumcombination fixed and failedtype recovered;remainingdependency/docs/size passed. Changedfixture formatting/lint passed. One full absent profile:buildpass,app9073pass/161fail of9234,100%allfourcoverage,inventory109/100%allfour,scripts5,Chromium99 firstpass. Exactly161failed full names captured in firstprofile;one old EMPTY historycase corrected from zero4..4 to active2..4 while preserving actual item,other185cases unchanged.160newempty undo matrixcases wrongly assumed ownership survives interior GC;native ndtxt.cxx2860 erasure removes zero hints strictly inside deleted range;literal masks now assert detachment and no reconstructed link on redo. Only161failedcases replayed once absent:161pass/1572skip of1733,zero passing case/suite/build replays. Productionunchanged after fullprofile. Finally restored reference before5sourceaudits,allpass0semanticviolations. Scope359prior files:356byteidentical,2ASTsyntax-only with expectations unchanged,1singleobservedhistorycase changed;242runtime rows/states/defaults/exceptions retained except3bounded appendices/onefactory mapping. Nine native hashes recorded;selectionbranch byte-identical. Initial scope-audit header path corrected to actual core/inc/rolbck.hxx without source or test changes/replays. APignored-inclusive3921files0forbidden;doctor0errors/two unchangedlegacywarnings;routingOK. Fullcore/UI/selectionhistory/managergrouping/redline/multicursor/indexoverloads/GCAttr/COPY/BuildPortions/families/styleclients/UNO/refcounts remain unverified;goal active,verifiedprogress,noexternalblocker.
