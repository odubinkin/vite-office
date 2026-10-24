---
id: "202610241752-FSR9QK"
title: "Writer page descriptor native value and XML offset contracts"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 14
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-24T17:53:57.169Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-10-24T18:02:59.929Z"
  updated_by: "CODER"
  note: "56focused cases/13files;native descriptor,XML handler and snapshot owners strict100 S145/B109/F28/L128.52consumer and48tooling cases pass.4production Chromium1280/390 ordinary/zero offset UI/history/ODT cycles pass. Build,15source gates,registry and final hashes pass. Task9,next full checkpoint then pause."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-10-24T18:03:00.514Z"
  updated_by: "EVALUATOR"
  note: "Native page descriptor Any and XML offset contracts are connected to lossless browser transfer."
  evaluated_sha: "661c4c068aedc1512c0f16659615582c932496c0"
  blueprint_digest: "3095ae6599471a0794715ef4bc088bb00ce4b0e1b165ddce551e4dba3ad7cb79"
  evidence_refs:
    - ".agentplane/tasks/202610241752-FSR9QK/README.md"
    - ".agentplane/tasks/202610241752-FSR9QK/quality/20261024-180300514-recovery-context/quality-report.json"
    - ".agentplane/tasks/202610241752-FSR9QK/quality/20261024-180300514-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202610241752-FSR9QK/quality/20261024-180300514-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202610241752-FSR9QK/blueprint/resolved-snapshot.json"
    - "output/playwright/writer-full-checkpoint/FSR9QK-hashes.json"
    - "output/playwright/writer-full-checkpoint/FSR9QK-coverage-last.log"
    - "output/playwright/writer-full-checkpoint/FSR9QK-consumers.log"
    - "output/playwright/writer-full-checkpoint/FSR9QK-boundaries-final.log"
    - "output/playwright/writer-full-checkpoint/FSR9QK-e2e.log"
    - "output/playwright/writer-full-checkpoint/FSR9QK-gates.json"
  findings:
    - "Source review verifies signed16 QueryValue/PutValue,void,conversion-bit mask and read-only name. Core no longer serializes JSON;browser records preserve0/absent and historical input semantics. Shared XML handler retains original SAX saturation and signed export,including source suspected discontinuityWRITER092."
    - "Exact-final source hashes,56focused cases and strict100coverage,52consumer cases,48tooling cases,4production Chromium1280/390 UI/history/ODT cycles and15source gates pass. Two concrete Any import edges are source-backed with neighboring permissions still forbidden;no thresholds/limits reduced."
commit: null
comments:
  -
    author: "CODER"
    body: "Start: replace page descriptor transport shortcuts with native Any/XML contracts and lossless browser records."
events:
  -
    type: "status"
    at: "2026-10-24T17:54:02.403Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: replace page descriptor transport shortcuts with native Any/XML contracts and lossless browser records."
  -
    type: "verify"
    at: "2026-10-24T18:02:59.929Z"
    author: "CODER"
    state: "ok"
    note: "56focused cases/13files;native descriptor,XML handler and snapshot owners strict100 S145/B109/F28/L128.52consumer and48tooling cases pass.4production Chromium1280/390 ordinary/zero offset UI/history/ODT cycles pass. Build,15source gates,registry and final hashes pass. Task9,next full checkpoint then pause."
doc_version: 3
doc_updated_at: "2026-10-24T18:02:59.983Z"
doc_updated_by: "CODER"
description: "Complete the current pagination slice by replacing page-offset JSON/lexical shortcuts with native Any member and XML conversion contracts and lossless browser snapshots."
sections:
  Summary: "Complete native page descriptor Any member contracts and connected XML/browser pagination boundaries."
  Scope: "Writer checkout/branch only;up to28 primary source/test/docs paths plus paired registry/task artifacts. Existing page descriptor name/offset,Any/SAX XML handlers,browser snapshot/worker and related tests. No new typography/locale/library/network,columns or mixed controls. Second of3tasks,task9after checkpoint;third task runs full suite and pauses goal."
  Plan: "Use pinned SwFormatPageDesc QueryValue/PutValue offset and name semantics,original member IDs and existing Any;remove JSON pair from core and place lossless named optional-offset snapshot at browser boundary. Reuse XMLNumberWithAutoForVoidPropHdl source numeric conversion,signed16 saturation,void auto and signed export;connect existing style import/export through it,retaining invalid fallback and documenting suspected source scalar discontinuities. Cover native scalar contracts,snapshot0/absent/high offsets,actual worker/ODT/UI reopen,source bounds and malformed input. Record focused100coverage for new decisions,related tests,build,browser and source gates;verify,evaluate,finish."
  Verify Steps: "Focused source/Any/property tests and strict100coverage of new helpers/native descriptor,without ignores or lower thresholds. Test offset0 versus absent,all unsigned16 boundary/signed projection,unknown members,CONVERT_TWIPS masking,wrong Any,void,read-only name member;browser record clone/validation and actual worker transfer;native XML signs,whitespace,invalid/auto,saturation and ODT exported lexical values/reopen. Run related Writer/filter/history/projection tests;build and production Chromium1280/390 replay plus real zero-offset worker export/reopen. Scoped lint/format,typecheck,docs,deps,size,tree,provenance,resources,registry/invariants/parity,static,doctor,routing,diff. Evidence manifests and evaluator pass;no full suite until next task."
  Verification: |-
    Command (apps/office): npx vitest run src/sw/source/core/attr/fmtpdsc.test.ts src/sw/browser/filter/xml/page-desc-codec.test.ts src/xmloff/source/style/native-page-offset-handler.test.ts src/xmloff/source/style/xmlbahdl.test.ts src/xmloff/source/style/native-color-handlers.test.ts src/xmloff/source/style/native-auto-color.test.ts src/xmloff/source/style/native-boolean-handler.test.ts src/sw/source/filter/xml/odt-property-roundtrip.test.ts src/sw/source/filter/xml/odt-page-offset-contract.test.ts src/sw/source/filter/xml/odt-worker-runtime.test.ts src/sw/source/filter/xml/odt-filter-service.test.ts src/sw/source/core/undo/undobj.test.ts src/sw/browser/presentation/writer-paragraph-toolbar.test.tsx --coverage --coverage.include=src/sw/source/core/attr/fmtpdsc.ts --coverage.include=src/sw/browser/filter/xml/page-desc-codec.ts --coverage.include=src/xmloff/source/style/xmlbahdl.ts --coverage.reportsDirectory=coverage/FSR9QK-final. Result:56cases/13files pass;strict100 S145/B109/F28/L128,FSR9QK-coverage-last.log. Scope:native Any/offset/void/name,XML conversion/saturation,worker synchronous/asynchronous graph and ODT source-boundary cycles. Command:npm run test:writer -- src/sw/source/core/doc/item-codec.test.ts src/sw/source/filter/xml/hyperlink-item-codec.test.ts src/sw/source/uibase/wrtsh/wrtsh-transfer.test.ts src/sw/browser/workflows/writer-odt-io.test.ts src/sw/browser/presentation/WriterParagraphDialog.test.tsx src/sw/browser/presentation/WriterAdvancedFormattingControls.test.tsx. Result:52cases/6files pass,FSR9QK-consumers.log. Command:npx vitest run scripts/check-module-boundaries.test.ts scripts/native-page-offset-imports.test.ts. Result:48cases/2files pass,FSR9QK-boundaries-final.log;only exact Any imports admitted,general cppu/browser edges remain forbidden. Command:npm run build; npx playwright test --config apps/office/playwright.config.ts --project=writer apps/office/e2e/writer-paragraph-break-controls.spec.ts apps/office/e2e/writer-page-offset-transport.spec.ts. Result:4production Chromium1280/390 pass,FSR9QK-build-final.log/FSR9QK-e2e.log;zero offset and ordinary7 survive actual UI,history,export/reopen;both screenshot widths inspected. Command:15exact source/static argv inFSR9QK-gates.json plus registry build. Result:all pass,hashes bind final paths. No full suite due task9;next task10runs full checkpoint and pauses goal.

    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-10-24T18:02:59.929Z — VERIFY — ok

    By: CODER

    Note: 56focused cases/13files;native descriptor,XML handler and snapshot owners strict100 S145/B109/F28/L128.52consumer and48tooling cases pass.4production Chromium1280/390 ordinary/zero offset UI/history/ODT cycles pass. Build,15source gates,registry and final hashes pass. Task9,next full checkpoint then pause.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-24T18:02:45.225Z, excerpt_hash=sha256:4284bdbb6fac6a3a20e8793caa7d0d04b336c38918837147f079fbe5577e2782

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office-writer/.agentplane/tasks/202610241752-FSR9QK/blueprint/resolved-snapshot.json
    - old_digest: 3095ae6599471a0794715ef4bc088bb00ce4b0e1b165ddce551e4dba3ad7cb79
    - current_digest: 3095ae6599471a0794715ef4bc088bb00ce4b0e1b165ddce551e4dba3ad7cb79
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202610241752-FSR9QK

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202610241752-FSR9QK
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: false
    - repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert only task implementation commits;preserve prior closed tasks and unrelated active work."
  Findings: "Removed core JSON pair and snapshot factory;browser named records retain explicit0 versus absence and decode historical pairs with their previous0-is-absent semantics. Existing Any member contract uses original ID/mask,signed16 optional projection,read-only name and failed extraction preservation. Shared SAX/XML handler saturates signed16 and retains invalid fallback/void auto/signed export;WRITER092documents source discontinuities. Exact source-backed Any edges for xmlstyle/txtparae were required;48tooling cases prove neighboring imports remain forbidden. New boundary test lives in its own focused file because the existing boundary suite is near1000lines;no limit relaxed. Early test caller/typed-string/converter fixtures and JSDoc corrected before final checks. Whole descriptor client/pointer/style mapper/native toolkit behavior remains unported;no blanket parity promotion. User authorized three tasks;second completes this pagination chain,next runs full checkpoint."
id_source: "generated"
---
## Summary

Complete native page descriptor Any member contracts and connected XML/browser pagination boundaries.

## Scope

Writer checkout/branch only;up to28 primary source/test/docs paths plus paired registry/task artifacts. Existing page descriptor name/offset,Any/SAX XML handlers,browser snapshot/worker and related tests. No new typography/locale/library/network,columns or mixed controls. Second of3tasks,task9after checkpoint;third task runs full suite and pauses goal.

## Plan

Use pinned SwFormatPageDesc QueryValue/PutValue offset and name semantics,original member IDs and existing Any;remove JSON pair from core and place lossless named optional-offset snapshot at browser boundary. Reuse XMLNumberWithAutoForVoidPropHdl source numeric conversion,signed16 saturation,void auto and signed export;connect existing style import/export through it,retaining invalid fallback and documenting suspected source scalar discontinuities. Cover native scalar contracts,snapshot0/absent/high offsets,actual worker/ODT/UI reopen,source bounds and malformed input. Record focused100coverage for new decisions,related tests,build,browser and source gates;verify,evaluate,finish.

## Verify Steps

Focused source/Any/property tests and strict100coverage of new helpers/native descriptor,without ignores or lower thresholds. Test offset0 versus absent,all unsigned16 boundary/signed projection,unknown members,CONVERT_TWIPS masking,wrong Any,void,read-only name member;browser record clone/validation and actual worker transfer;native XML signs,whitespace,invalid/auto,saturation and ODT exported lexical values/reopen. Run related Writer/filter/history/projection tests;build and production Chromium1280/390 replay plus real zero-offset worker export/reopen. Scoped lint/format,typecheck,docs,deps,size,tree,provenance,resources,registry/invariants/parity,static,doctor,routing,diff. Evidence manifests and evaluator pass;no full suite until next task.

## Verification

Command (apps/office): npx vitest run src/sw/source/core/attr/fmtpdsc.test.ts src/sw/browser/filter/xml/page-desc-codec.test.ts src/xmloff/source/style/native-page-offset-handler.test.ts src/xmloff/source/style/xmlbahdl.test.ts src/xmloff/source/style/native-color-handlers.test.ts src/xmloff/source/style/native-auto-color.test.ts src/xmloff/source/style/native-boolean-handler.test.ts src/sw/source/filter/xml/odt-property-roundtrip.test.ts src/sw/source/filter/xml/odt-page-offset-contract.test.ts src/sw/source/filter/xml/odt-worker-runtime.test.ts src/sw/source/filter/xml/odt-filter-service.test.ts src/sw/source/core/undo/undobj.test.ts src/sw/browser/presentation/writer-paragraph-toolbar.test.tsx --coverage --coverage.include=src/sw/source/core/attr/fmtpdsc.ts --coverage.include=src/sw/browser/filter/xml/page-desc-codec.ts --coverage.include=src/xmloff/source/style/xmlbahdl.ts --coverage.reportsDirectory=coverage/FSR9QK-final. Result:56cases/13files pass;strict100 S145/B109/F28/L128,FSR9QK-coverage-last.log. Scope:native Any/offset/void/name,XML conversion/saturation,worker synchronous/asynchronous graph and ODT source-boundary cycles. Command:npm run test:writer -- src/sw/source/core/doc/item-codec.test.ts src/sw/source/filter/xml/hyperlink-item-codec.test.ts src/sw/source/uibase/wrtsh/wrtsh-transfer.test.ts src/sw/browser/workflows/writer-odt-io.test.ts src/sw/browser/presentation/WriterParagraphDialog.test.tsx src/sw/browser/presentation/WriterAdvancedFormattingControls.test.tsx. Result:52cases/6files pass,FSR9QK-consumers.log. Command:npx vitest run scripts/check-module-boundaries.test.ts scripts/native-page-offset-imports.test.ts. Result:48cases/2files pass,FSR9QK-boundaries-final.log;only exact Any imports admitted,general cppu/browser edges remain forbidden. Command:npm run build; npx playwright test --config apps/office/playwright.config.ts --project=writer apps/office/e2e/writer-paragraph-break-controls.spec.ts apps/office/e2e/writer-page-offset-transport.spec.ts. Result:4production Chromium1280/390 pass,FSR9QK-build-final.log/FSR9QK-e2e.log;zero offset and ordinary7 survive actual UI,history,export/reopen;both screenshot widths inspected. Command:15exact source/static argv inFSR9QK-gates.json plus registry build. Result:all pass,hashes bind final paths. No full suite due task9;next task10runs full checkpoint and pauses goal.

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-10-24T18:02:59.929Z — VERIFY — ok

By: CODER

Note: 56focused cases/13files;native descriptor,XML handler and snapshot owners strict100 S145/B109/F28/L128.52consumer and48tooling cases pass.4production Chromium1280/390 ordinary/zero offset UI/history/ODT cycles pass. Build,15source gates,registry and final hashes pass. Task9,next full checkpoint then pause.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-24T18:02:45.225Z, excerpt_hash=sha256:4284bdbb6fac6a3a20e8793caa7d0d04b336c38918837147f079fbe5577e2782

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office-writer/.agentplane/tasks/202610241752-FSR9QK/blueprint/resolved-snapshot.json
- old_digest: 3095ae6599471a0794715ef4bc088bb00ce4b0e1b165ddce551e4dba3ad7cb79
- current_digest: 3095ae6599471a0794715ef4bc088bb00ce4b0e1b165ddce551e4dba3ad7cb79
- route_changed: no
- safe_command: agentplane blueprint snapshot 202610241752-FSR9QK

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202610241752-FSR9QK
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: false
- repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert only task implementation commits;preserve prior closed tasks and unrelated active work.

## Findings

Removed core JSON pair and snapshot factory;browser named records retain explicit0 versus absence and decode historical pairs with their previous0-is-absent semantics. Existing Any member contract uses original ID/mask,signed16 optional projection,read-only name and failed extraction preservation. Shared SAX/XML handler saturates signed16 and retains invalid fallback/void auto/signed export;WRITER092documents source discontinuities. Exact source-backed Any edges for xmlstyle/txtparae were required;48tooling cases prove neighboring imports remain forbidden. New boundary test lives in its own focused file because the existing boundary suite is near1000lines;no limit relaxed. Early test caller/typed-string/converter fixtures and JSDoc corrected before final checks. Whole descriptor client/pointer/style mapper/native toolkit behavior remains unported;no blanket parity promotion. User authorized three tasks;second completes this pagination chain,next runs full checkpoint.
