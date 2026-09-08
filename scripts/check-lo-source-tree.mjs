/**
 * @fileoverview Validates that the implemented browser source tree retains its documented LibreOffice-derived ownership boundaries.
 */

import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

/** Absolute repository root derived from this checked-in script location. */
const repositoryRoot = join(dirname(fileURLToPath(import.meta.url)), "..");

/** Files that prove every currently instantiated LibreOffice-derived source area remains present. */
const requiredFiles = [
  "apps/office/src/framework/source/services/desktop.tsx",
  "apps/office/src/framework/source/services/modulemanager.ts",
  "apps/office/src/framework/source/accelerators/keymapping.ts",
  "apps/office/src/framework/source/dispatch/dispatchprovider.ts",
  "apps/office/src/sfx2/source/doc/docfac.ts",
  "apps/office/src/sfx2/source/doc/docfile.ts",
  "apps/office/src/sfx2/source/doc/docundomanager.ts",
  "apps/office/src/svl/source/misc/recovery.ts",
  "apps/office/src/vcl/browser/browser-clipboard.ts",
  "apps/office/src/sw/source/core/doc/writer.ts",
  "apps/office/src/sw/source/core/doc/doc.ts",
  "apps/office/src/sw/source/core/docnode/node.ts",
  "apps/office/src/sw/source/core/docnode/nodes.ts",
  "apps/office/src/sw/source/core/crsr/pam.ts",
  "apps/office/src/sw/source/core/doc/list.ts",
  "apps/office/src/sw/source/core/doc/number.ts",
  "apps/office/src/sw/source/core/doc/DocumentContentOperationsManager.ts",
  "apps/office/src/sw/source/core/txtnode/ndtxt.ts",
  "apps/office/src/sw/source/core/txtnode/ndhints.ts",
  "apps/office/src/sw/source/core/txtnode/txatbase.ts",
  "apps/office/src/sw/source/uibase/docvw/edtwin.tsx",
  "apps/office/src/sw/source/uibase/wrtsh/select.ts",
  "apps/office/src/sw/source/uibase/dochdl/swdtflvr.ts",
  "apps/office/src/sw/source/filter/html/htmlnumwriter.ts",
  "apps/office/src/sw/source/filter/ascii/ascatr.ts",
  "apps/office/src/sw/source/uibase/shells/txtnum.ts",
  "apps/office/src/sw/source/uibase/shells/listsh.ts",
  "apps/office/src/sw/source/uibase/shells/textsh.ts",
  "apps/office/src/sw/source/uibase/shells/txtattr.ts",
  "apps/office/src/sw/source/uibase/ribbar/inputwin.tsx",
  "apps/office/src/sw/source/uibase/sidebar/WriterInspectorTextPanel.tsx",
  "apps/office/src/sw/source/uibase/uiview/view.tsx",
  "apps/office/src/sw/source/uibase/uiview/viewfunc.ts",
  "apps/office/src/sw/source/uibase/uiview/viewstat.ts",
  "apps/office/src/sw/source/uibase/app/mainwn.tsx",
  "apps/office/src/sw/uiconfig/swriter/menubar/menubar.tsx",
  "apps/office/src/sw/uiconfig/swriter/menubar/menubar-commands.ts",
  "apps/office/src/sw/uiconfig/swriter/toolbar/standardbar.tsx",
  "apps/office/src/sw/uiconfig/swriter/toolbar/textobjectbar.ts",
  "apps/office/src/sw/uiconfig/swriter/toolbar/numobjectbar.ts",
];

/** Former generic source roots that must not reappear after the LO-structure migration. */
const forbiddenPaths = [
  "apps/office/src/app",
  "apps/office/src/components",
  "apps/office/src/domain",
  "apps/office/src/features",
  "apps/office/src/platform",
  "apps/office/src/shared",
  "apps/office/src/sw/source/uibase/utlui/WriterMenuBar.tsx",
  "apps/office/src/sw/source/uibase/utlui/WriterCommandToolbar.tsx",
  "apps/office/src/sw/source/uibase/utlui/use-writer-browser-commands.ts",
  "apps/office/src/sw/uiconfig/swriter/menubar.ts",
];

/**
 * Resolves one repository-relative path and rejects absent required files or restored generic roots.
 *
 * @param relativePath - Repository-relative source path inspected by this gate.
 * @param expectation - Whether the path must exist or must remain absent.
 * @returns Nothing; the process exit code records any failed expectation.
 */
function assertSourcePath(relativePath, expectation) {
  const exists = existsSync(join(repositoryRoot, relativePath));
  if ((expectation === "present" && exists) || (expectation === "absent" && !exists)) return;
  const verb = expectation === "present" ? "Missing required" : "Unexpected restored";
  console.error(`${verb} source-tree path: ${relativePath}`);
  process.exitCode = 1;
}

/**
 * Runs the source-tree ownership gate and prints a concise success summary when every expectation holds.
 *
 * @returns Nothing; the Node process exits non-zero after any failed path assertion.
 */
function main() {
  requiredFiles.forEach(
    /** Checks one required LO-derived source file. @param relativePath - Required repository-relative path. @returns Nothing; the shared assertion records failure. */
    function checkRequiredFile(relativePath) {
      assertSourcePath(relativePath, "present");
    },
  );
  forbiddenPaths.forEach(
    /** Checks one retired generic source root. @param relativePath - Forbidden repository-relative path. @returns Nothing; the shared assertion records failure. */
    function checkForbiddenPath(relativePath) {
      assertSourcePath(relativePath, "absent");
    },
  );
  if (process.exitCode === undefined) {
    console.log(
      `LibreOffice source-tree check passed for ${requiredFiles.length} required paths and ${forbiddenPaths.length} retired roots.`,
    );
  }
}

main();
