---
id: "202608100659-GY449B"
title: "Implement TypeScript Vite Tailwind frontend foundation"
status: "DOING"
priority: "high"
owner: "CODER"
revision: 7
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
task_kind: "code"
mutation_scope: "code"
blueprint_request: "code.direct"
verify:
  - "npm run build"
  - "npm run check:docs"
  - "npm run check:file-size"
  - "npm run lint"
  - "npm run test:coverage"
  - "npm run test:e2e"
  - "npm run typecheck"
plan_approval:
  state: "approved"
  updated_at: "2026-08-10T07:17:11.742Z"
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
    body: "Start: continue direct-mode task in current checkout."
events:
  -
    type: "status"
    at: "2026-08-10T07:17:29.095Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: continue direct-mode task in current checkout."
doc_version: 3
doc_updated_at: "2026-08-10T07:17:29.095Z"
doc_updated_by: "CODER"
description: "Create the initial browser-only static frontend codebase with TypeScript, Vite, and Tailwind CSS. Add vendor/libreoffice-reference/ to .gitignore before any future clone. Establish modular source boundaries, strict type checking, linting and formatting, unit coverage, browser and accessibility smoke tests, static build checks, complete file/function JSDoc validation, authored-file review reporting above 500 lines and failure at 1000 lines, and initial parity traceability. Do not clone LibreOffice or implement an office-suite feature in this task."
sections:
  Summary: |-
    Implement TypeScript Vite Tailwind frontend foundation

    Create the initial browser-only static frontend codebase with TypeScript, Vite, and Tailwind CSS. Add vendor/libreoffice-reference/ to .gitignore before any future clone. Establish modular source boundaries, strict type checking, linting and formatting, unit coverage, browser and accessibility smoke tests, static build checks, complete file/function JSDoc validation, authored-file review reporting above 500 lines and failure at 1000 lines, and initial parity traceability. Do not clone LibreOffice or implement an office-suite feature in this task.
  Scope: |-
    - In scope: Create the initial browser-only static frontend codebase with TypeScript, Vite, and Tailwind CSS. Add vendor/libreoffice-reference/ to .gitignore before any future clone. Establish modular source boundaries, strict type checking, linting and formatting, unit coverage, browser and accessibility smoke tests, static build checks, complete file/function JSDoc validation, authored-file review reporting above 500 lines and failure at 1000 lines, and initial parity traceability. Do not clone LibreOffice or implement an office-suite feature in this task.
    - Out of scope: unrelated refactors not required for "Implement TypeScript Vite Tailwind frontend foundation".
  Plan: |-
    1. Add vendor/libreoffice-reference/ to .gitignore before any reference acquisition.
    2. Create an npm workspace with a static React + TypeScript Vite application under apps/office, relative production asset paths, and Tailwind CSS styling; add only maintained browser-compatible libraries with a committed lockfile.
    3. Implement an accessible, responsive office workbench placeholder that names the planned suites but makes no feature-parity claim; keep document/domain logic independent from view code and document every authored source file, function, type, component, hook, config helper, and script with detailed JSDoc.
    4. Configure strict TypeScript, ESLint, Prettier, Vitest/jsdom/testing-library coverage with 100% initial thresholds for authored application behavior, Playwright browser smoke tests with axe accessibility checks, and a built-static-assets smoke test.
    5. Add deterministic documentation/JSDoc validation and authored-file size validation: report files above 500 physical lines and fail at or above 1,000, with explicit generated/vendor exclusions.
    6. Add developer setup documentation and update program roadmap/parity evidence without marking any LibreOffice capability implemented.
    7. Run every declared verification command, policy routing, AgentPlane doctor, final diff/status checks, record evidence, obtain EVALUATOR quality review, and close with traceable commits.
    Out of scope: cloning LibreOffice, backend services, deployment, and implementation of Writer/Calc/Impress/Draw/Base/Math/Chart behavior. Network use is limited to approved npm dependency and Playwright browser acquisition.
  Verify Steps: |-
    1. Read this Verify Steps section with agentplane task verify-show 202608100659-GY449B. Expected: the commands and pass criteria below are authoritative.
    2. Run npm run format:check and npm run lint. Expected: formatting and lint/JSDoc rules pass with no warnings promoted outside the documented policy.
    3. Run npm run typecheck. Expected: all workspace TypeScript projects pass strict checking.
    4. Run npm run test:coverage. Expected: unit/component/accessibility tests pass and initial authored-code line, branch, function, and statement thresholds are 100%.
    5. Run npm run test:e2e. Expected: the production-like static app loads from built assets, primary landmarks and suite placeholders are keyboard-visible, and axe reports no configured violations.
    6. Run npm run build and npm run test:static. Expected: Vite emits static assets with relative paths and the dist smoke test proves no application backend is required.
    7. Run npm run check:docs and npm run check:file-size. Expected: every authored TS/TSX file/declaration satisfies the detailed JSDoc contract; files above 500 lines are reported and files at or above 1,000 fail.
    8. Run node .agentplane/policy/check-routing.mjs and agentplane doctor. Expected: routing, budgets, installation, and workflow checks pass.
    9. Run git diff --check and inspect git status --short --untracked-files=all. Expected: no whitespace errors, no LibreOffice checkout, no secret/env files, and changes stay within approved bootstrap, docs, .gitignore, and task-artifact paths.
    10. Inspect the built UI at desktop and narrow viewport sizes. Expected: no overflow, inaccessible controls, false parity claims, or backend dependency.
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: |-
    - Revert task-related commit(s).
    - Re-run required checks to confirm rollback safety.
  Findings: "Approval evidence: USER explicitly approved the task plan and network access to the npm registry and Playwright browser distribution endpoints on 2026-08-10. Network use remains limited to dependency and browser acquisition for this task. LibreOffice cloning remains a separate future task."
id_source: "generated"
---
## Summary

Implement TypeScript Vite Tailwind frontend foundation

Create the initial browser-only static frontend codebase with TypeScript, Vite, and Tailwind CSS. Add vendor/libreoffice-reference/ to .gitignore before any future clone. Establish modular source boundaries, strict type checking, linting and formatting, unit coverage, browser and accessibility smoke tests, static build checks, complete file/function JSDoc validation, authored-file review reporting above 500 lines and failure at 1000 lines, and initial parity traceability. Do not clone LibreOffice or implement an office-suite feature in this task.

## Scope

- In scope: Create the initial browser-only static frontend codebase with TypeScript, Vite, and Tailwind CSS. Add vendor/libreoffice-reference/ to .gitignore before any future clone. Establish modular source boundaries, strict type checking, linting and formatting, unit coverage, browser and accessibility smoke tests, static build checks, complete file/function JSDoc validation, authored-file review reporting above 500 lines and failure at 1000 lines, and initial parity traceability. Do not clone LibreOffice or implement an office-suite feature in this task.
- Out of scope: unrelated refactors not required for "Implement TypeScript Vite Tailwind frontend foundation".

## Plan

1. Add vendor/libreoffice-reference/ to .gitignore before any reference acquisition.
2. Create an npm workspace with a static React + TypeScript Vite application under apps/office, relative production asset paths, and Tailwind CSS styling; add only maintained browser-compatible libraries with a committed lockfile.
3. Implement an accessible, responsive office workbench placeholder that names the planned suites but makes no feature-parity claim; keep document/domain logic independent from view code and document every authored source file, function, type, component, hook, config helper, and script with detailed JSDoc.
4. Configure strict TypeScript, ESLint, Prettier, Vitest/jsdom/testing-library coverage with 100% initial thresholds for authored application behavior, Playwright browser smoke tests with axe accessibility checks, and a built-static-assets smoke test.
5. Add deterministic documentation/JSDoc validation and authored-file size validation: report files above 500 physical lines and fail at or above 1,000, with explicit generated/vendor exclusions.
6. Add developer setup documentation and update program roadmap/parity evidence without marking any LibreOffice capability implemented.
7. Run every declared verification command, policy routing, AgentPlane doctor, final diff/status checks, record evidence, obtain EVALUATOR quality review, and close with traceable commits.
Out of scope: cloning LibreOffice, backend services, deployment, and implementation of Writer/Calc/Impress/Draw/Base/Math/Chart behavior. Network use is limited to approved npm dependency and Playwright browser acquisition.

## Verify Steps

1. Read this Verify Steps section with agentplane task verify-show 202608100659-GY449B. Expected: the commands and pass criteria below are authoritative.
2. Run npm run format:check and npm run lint. Expected: formatting and lint/JSDoc rules pass with no warnings promoted outside the documented policy.
3. Run npm run typecheck. Expected: all workspace TypeScript projects pass strict checking.
4. Run npm run test:coverage. Expected: unit/component/accessibility tests pass and initial authored-code line, branch, function, and statement thresholds are 100%.
5. Run npm run test:e2e. Expected: the production-like static app loads from built assets, primary landmarks and suite placeholders are keyboard-visible, and axe reports no configured violations.
6. Run npm run build and npm run test:static. Expected: Vite emits static assets with relative paths and the dist smoke test proves no application backend is required.
7. Run npm run check:docs and npm run check:file-size. Expected: every authored TS/TSX file/declaration satisfies the detailed JSDoc contract; files above 500 lines are reported and files at or above 1,000 fail.
8. Run node .agentplane/policy/check-routing.mjs and agentplane doctor. Expected: routing, budgets, installation, and workflow checks pass.
9. Run git diff --check and inspect git status --short --untracked-files=all. Expected: no whitespace errors, no LibreOffice checkout, no secret/env files, and changes stay within approved bootstrap, docs, .gitignore, and task-artifact paths.
10. Inspect the built UI at desktop and narrow viewport sizes. Expected: no overflow, inaccessible controls, false parity claims, or backend dependency.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert task-related commit(s).
- Re-run required checks to confirm rollback safety.

## Findings

Approval evidence: USER explicitly approved the task plan and network access to the npm registry and Playwright browser distribution endpoints on 2026-08-10. Network use remains limited to dependency and browser acquisition for this task. LibreOffice cloning remains a separate future task.
