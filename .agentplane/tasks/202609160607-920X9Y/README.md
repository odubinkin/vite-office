---
id: "202609160607-920X9Y"
title: "Редактирование имени документа в хидере"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 4
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
  - "frontend"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-09-16T06:08:53.943Z"
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
    body: "Start: implement approved inline document-title editing in current checkout; verify Enter and blur persistence."
events:
  -
    type: "status"
    at: "2026-09-16T06:09:05.329Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implement approved inline document-title editing in current checkout; verify Enter and blur persistence."
doc_version: 3
doc_updated_at: "2026-09-16T06:09:05.329Z"
doc_updated_by: "CODER"
description: "Добавить inline-редактирование имени документа по клику в хидере; сохранять новое имя по Enter и при потере фокуса."
sections:
  Summary: |-
    Редактирование имени документа в хидере

    Добавить inline-редактирование имени документа по клику в хидере; сохранять новое имя по Enter и при потере фокуса.
  Scope: |-
    - In scope: Добавить inline-редактирование имени документа по клику в хидере; сохранять новое имя по Enter и при потере фокуса.
    - Out of scope: unrelated refactors not required for "Редактирование имени документа в хидере".
  Plan: |-
    1. Добавить shell-метод переименования с валидацией и уведомлением external store.
    2. Заменить статичный title в хидере на click-to-edit input.
    3. Сохранять значение по Enter и blur, игнорировать пустое имя.
    4. Добавить тесты на Enter, blur и обновление shell state.
  Verify Steps: |-
    PLANNER fallback scaffold. Replace with task-specific acceptance checks when PLANNER context is available.

    1. Review the changed artifact or behavior for the `code` task. Expected: the requested outcome is visible and matches the approved scope.
    2. Run the most relevant validation step for the `code` task. Expected: it succeeds without unexpected regressions in touched scope.
    3. Compare the final result against the task summary and scope. Expected: any remaining follow-up is explicit in ## Findings.
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

Редактирование имени документа в хидере

Добавить inline-редактирование имени документа по клику в хидере; сохранять новое имя по Enter и при потере фокуса.

## Scope

- In scope: Добавить inline-редактирование имени документа по клику в хидере; сохранять новое имя по Enter и при потере фокуса.
- Out of scope: unrelated refactors not required for "Редактирование имени документа в хидере".

## Plan

1. Добавить shell-метод переименования с валидацией и уведомлением external store.
2. Заменить статичный title в хидере на click-to-edit input.
3. Сохранять значение по Enter и blur, игнорировать пустое имя.
4. Добавить тесты на Enter, blur и обновление shell state.

## Verify Steps

PLANNER fallback scaffold. Replace with task-specific acceptance checks when PLANNER context is available.

1. Review the changed artifact or behavior for the `code` task. Expected: the requested outcome is visible and matches the approved scope.
2. Run the most relevant validation step for the `code` task. Expected: it succeeds without unexpected regressions in touched scope.
3. Compare the final result against the task summary and scope. Expected: any remaining follow-up is explicit in ## Findings.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert task-related commit(s).
- Re-run required checks to confirm rollback safety.

## Findings
