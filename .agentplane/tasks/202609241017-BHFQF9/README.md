---
id: "202609241017-BHFQF9"
title: "Port tdf114287 ODT print bounds regression"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 6
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-09-24T10:17:55.792Z"
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
    body: "Start: implement exact ODT list and paragraph print-bound precedence with export/reopen regression."
events:
  -
    type: "status"
    at: "2026-09-24T10:18:01.171Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implement exact ODT list and paragraph print-bound precedence with export/reopen regression."
doc_version: 3
doc_updated_at: "2026-09-24T10:18:01.171Z"
doc_updated_by: "CODER"
description: "Implement exact Writer list-versus-paragraph print bounds for the repository-owned tdf114287.odt fixture, including ODT export/reopen parity."
sections:
  Summary: |-
    Port tdf114287 ODT print bounds regression

    Implement exact Writer list-versus-paragraph print bounds for the repository-owned tdf114287.odt fixture, including ODT export/reopen parity.
  Scope: "Port all behavioral assertions from pinned LibreOffice testTdf114287 using the copied local tdf114287.odt: numbering-rule geometry, effective paragraph margins, list-rule identity, exact print bounds for paragraphs 2/9/16, and export/reopen parity. Implementation may touch ODF style import/export, Writer model/layout, browser projection, and focused tests needed for exact behavior."
  Plan: "1. Inspect the local tdf114287.odt style chain and current list geometry projection. 2. Preserve the precedence of paragraph margin and list geometry through import/export/reopen. 3. Add Writer print-bound projection that yields exact upstream twip coordinates for paragraphs 2, 9, and 16; integrate with browser rendering as needed. 4. Add a real local-ODT regression for rule and paragraph properties and print bounds before and after ODT export. 5. Run focused tests and full repository verification, record evidence, and close the task."
  Verify Steps: "1. Load repository-owned apps/office/src/sw/qa/extras/odfexport/data/tdf114287.odt; assert list level 1 FirstLineIndent=-700 and IndentAt=1330 mm100 equivalent, paragraphs 2/9/16 first-line=-1000, left=5001, right=0 mm100 equivalent, and all three use the same numbering rule. 2. Assert exact Writer print bounds in twips: paragraphs 2 and 9 left=2268/right=11339; paragraph 16 left=357/right=11339. Reopen an exported ODT and repeat all assertions. 3. Run focused ODT import/export/layout tests and browser projection tests if touched. 4. Run npm run verify, ap doctor, and git diff --check; record results and any residual limitations. 5. Confirm a clean final tracked state."
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: |-
    - Revert task-related commit(s).
    - Re-run required checks to confirm rollback safety.
  Findings: ""
id_source: "generated"
---
## Summary

Port tdf114287 ODT print bounds regression

Implement exact Writer list-versus-paragraph print bounds for the repository-owned tdf114287.odt fixture, including ODT export/reopen parity.

## Scope

Port all behavioral assertions from pinned LibreOffice testTdf114287 using the copied local tdf114287.odt: numbering-rule geometry, effective paragraph margins, list-rule identity, exact print bounds for paragraphs 2/9/16, and export/reopen parity. Implementation may touch ODF style import/export, Writer model/layout, browser projection, and focused tests needed for exact behavior.

## Plan

1. Inspect the local tdf114287.odt style chain and current list geometry projection. 2. Preserve the precedence of paragraph margin and list geometry through import/export/reopen. 3. Add Writer print-bound projection that yields exact upstream twip coordinates for paragraphs 2, 9, and 16; integrate with browser rendering as needed. 4. Add a real local-ODT regression for rule and paragraph properties and print bounds before and after ODT export. 5. Run focused tests and full repository verification, record evidence, and close the task.

## Verify Steps

1. Load repository-owned apps/office/src/sw/qa/extras/odfexport/data/tdf114287.odt; assert list level 1 FirstLineIndent=-700 and IndentAt=1330 mm100 equivalent, paragraphs 2/9/16 first-line=-1000, left=5001, right=0 mm100 equivalent, and all three use the same numbering rule. 2. Assert exact Writer print bounds in twips: paragraphs 2 and 9 left=2268/right=11339; paragraph 16 left=357/right=11339. Reopen an exported ODT and repeat all assertions. 3. Run focused ODT import/export/layout tests and browser projection tests if touched. 4. Run npm run verify, ap doctor, and git diff --check; record results and any residual limitations. 5. Confirm a clean final tracked state.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert task-related commit(s).
- Re-run required checks to confirm rollback safety.

## Findings
