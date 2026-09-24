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
  "apps/office/src/framework/browser/app/SuiteCard.tsx",
  "apps/office/src/framework/browser/app/bootstrap.tsx",
  "apps/office/src/framework/browser/app/desktop.tsx",
  "apps/office/src/framework/browser/app/modulemanager.ts",
  "apps/office/src/framework/browser/localization/browser-localization.ts",
  "apps/office/src/framework/browser/presentation/CommandMenuBar.tsx",
  "apps/office/src/framework/browser/presentation/CommandToolbar.tsx",
  "apps/office/src/framework/browser/presentation/command-surface.ts",
  "apps/office/src/framework/browser/presentation/use-command-shortcuts.ts",
  "apps/office/src/framework/browser/accelerators/keymapping.ts",
  "apps/office/src/sax/source/fastparser/fastparser.ts",
  "apps/office/src/xmloff/source/core/xml-parser.ts",
  "apps/office/src/framework/source/dispatch/dispatchprovider.ts",
  "apps/office/src/sfx2/source/control/dispatch.ts",
  "apps/office/src/sfx2/source/doc/objsh.ts",
  "apps/office/src/sfx2/source/doc/docfile.ts",
  "apps/office/src/sfx2/source/dialog/dialogcontroller.ts",
  "apps/office/src/sfx2/source/view/viewfrm.ts",
  "apps/office/src/svl/source/notify/broadcast.ts",
  "apps/office/src/svl/source/notify/listener.ts",
  "apps/office/src/svl/source/undo/undo.ts",
  "apps/office/src/editeng/source/items/paraitem.ts",
  "apps/office/src/editeng/source/items/textitem.ts",
  "apps/office/src/svl/source/items/poolitem.ts",
  "apps/office/src/svl/source/items/stritem.ts",
  "apps/office/src/svl/source/items/intitem.ts",
  "apps/office/src/svl/source/items/cenumitm.ts",
  "apps/office/src/sfx2/source/view/frame.ts",
  "apps/office/src/svl/source/items/itempool.ts",
  "apps/office/src/svl/source/items/itemset.ts",
  "apps/office/src/package/source/manifest/ManifestExport.ts",
  "apps/office/src/package/source/zipapi/CRC32.ts",
  "apps/office/src/package/source/zipapi/ZipFile.ts",
  "apps/office/src/package/source/zipapi/ZipOutputStream.ts",
  "apps/office/src/vcl/browser/browser-clipboard.ts",
  "apps/office/src/vcl/browser/browser-file.ts",
  "apps/office/src/xmloff/source/text/txtparae.ts",
  "apps/office/src/xmloff/source/text/txtparai.ts",
  "apps/office/src/sw/inc/calbck.ts",
  "apps/office/src/sw/inc/hintids.ts",
  "apps/office/src/sw/inc/hints.ts",
  "apps/office/src/sw/source/core/doc/doc.ts",
  "apps/office/src/sw/source/core/doc/DocumentListsManager.ts",
  "apps/office/src/sw/source/core/doc/DocumentSettingManager.ts",
  "apps/office/src/sw/source/core/doc/DocumentStateManager.ts",
  "apps/office/src/sw/source/core/doc/DocumentStylePoolManager.ts",
  "apps/office/src/sw/source/core/doc/poolfmt-defaults.ts",
  "apps/office/src/sw/source/core/doc/fmtcol.ts",
  "apps/office/src/sw/source/core/attr/format.ts",
  "apps/office/src/sw/source/core/attr/swatrset.ts",
  "apps/office/src/sw/source/core/bastyp/contentindex.ts",
  "apps/office/src/sw/source/core/docnode/node.ts",
  "apps/office/src/sw/source/core/docnode/nodes.ts",
  "apps/office/src/sw/source/core/para/paratr.ts",
  "apps/office/src/sw/source/core/crsr/pam.ts",
  "apps/office/src/sw/source/core/doc/list.ts",
  "apps/office/src/sw/source/core/doc/number.ts",
  "apps/office/src/sw/source/core/doc/DocumentContentOperationsManager.ts",
  "apps/office/src/sw/source/core/txtnode/ndtxt.ts",
  "apps/office/src/sw/source/core/txtnode/ndhints.ts",
  "apps/office/src/sw/source/core/txtnode/fmtinfmt.ts",
  "apps/office/src/sw/source/core/txtnode/txatbase.ts",
  "apps/office/src/sw/browser/editor/WriterPlainTextEditor.tsx",
  "apps/office/src/sw/browser/editor/WriterEditableParagraph.tsx",
  "apps/office/src/sw/browser/editor/writer-selection.ts",
  "apps/office/src/sw/browser/editor/writer-selection-types.ts",
  "apps/office/src/sw/source/uibase/wrtsh/wrtsh.ts",
  "apps/office/src/sw/source/core/edit/editsh.ts",
  "apps/office/src/sw/source/uibase/dochdl/swdtflvr.ts",
  "apps/office/src/sw/source/filter/html/htmlnumwriter.ts",
  "apps/office/src/sw/source/filter/ascii/ascatr.ts",
  "apps/office/src/sw/source/filter/xml/swxml.ts",
  "apps/office/src/sw/source/filter/xml/wrtxml.ts",
  "apps/office/src/sw/source/filter/xml/xmlexp.ts",
  "apps/office/src/sw/source/filter/xml/xmlimp.ts",
  "apps/office/src/sw/source/uibase/shells/listsh.ts",
  "apps/office/src/sw/browser/presentation/WriterFormattingToolbar.tsx",
  "apps/office/src/sw/browser/presentation/WriterPropertiesPanel.tsx",
  "apps/office/src/sw/source/uibase/uiview/view.ts",
  "apps/office/src/sw/source/uibase/dialog/writer-dialog-controller.ts",
  "apps/office/src/sw/browser/presentation/writer-view.tsx",
  "apps/office/src/sw/source/uibase/uiview/viewfunc.ts",
  "apps/office/src/sw/source/uibase/app/docsh.ts",
  "apps/office/src/sw/browser/presentation/WriterWorkspaceChrome.tsx",
  "apps/office/src/sw/browser/presentation/WriterCommandToolbar.tsx",
  "apps/office/src/sfx2/source/control/bindings.ts",
  "apps/office/src/sfx2/source/control/ctrlitem.ts",
  "apps/office/src/sfx2/source/control/request.ts",
  "apps/office/src/sw/source/filter/basflt/writer-transfer.ts",
  "apps/office/src/sw/browser/filter/xml/item-codec.ts",
  "apps/office/src/sw/browser/filter/xml/writer-document-codec.ts",
  "apps/office/src/sw/browser/storage/writer-odt-store.ts",
  "apps/office/src/sw/browser/filter/xml/odt-transfer.ts",
  "apps/office/src/sw/browser/workflows/writer-document-io.ts",
  "apps/office/src/sw/source/uibase/shells/textsh.ts",
  "apps/office/src/sw/source/uibase/shells/viewsh.ts",
  "apps/office/src/sw/browser/filter/html/swhtml.ts",
  "apps/office/src/sw/browser/filter/xml/odt-worker-client.ts",
  "apps/office/src/sw/browser/filter/xml/odt-worker-runtime.ts",
  "apps/office/src/sw/browser/filter/xml/odt-worker.ts",
  "apps/office/src/sw/browser/presentation/writer-view-projection.ts",
  "apps/office/src/sw/browser/editor/browser-writer-edit-window.ts",
  "apps/office/src/sw/source/uibase/docvw/edtwin.ts",
  "apps/office/src/sw/browser/composition/writer-module.tsx",
  "apps/office/src/sw/sdi/swriter.ts",
  "apps/office/src/sw/uiconfig/swriter/writer-command-resources.ts",
  "apps/office/src/sw/uiconfig/swriter/menubar/menubar-commands.ts",
  "apps/office/src/sw/uiconfig/swriter/ui-resource.ts",
  "apps/office/src/sw/uiconfig/swriter/toolbar/standardbar.ts",
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
  "apps/office/src/framework/source/services/desktop.tsx",
  "apps/office/src/framework/source/services/modulemanager.ts",
  "apps/office/src/framework/source/services/SuiteCard.tsx",
  "apps/office/src/framework/source/services/bootstrap.tsx",
  "apps/office/src/sw/browser/accelerators/writer-shortcuts.ts",
  "apps/office/src/sw/browser/presentation/WriterMenuBar.tsx",
  "apps/office/src/sw/browser/presentation/command-surface.ts",
  "apps/office/src/sw/source/uibase/app/swmodule.tsx",
  "apps/office/src/sw/source/uibase/docvw/edtwin-paragraph.tsx",
  "apps/office/src/sw/source/uibase/docvw/edtwin.tsx",
  "apps/office/src/sw/source/uibase/utlui/WriterMenuBar.tsx",
  "apps/office/src/sw/source/uibase/utlui/WriterCommandToolbar.tsx",
  "apps/office/src/sw/source/uibase/utlui/use-writer-browser-commands.ts",
  "apps/office/src/sw/source/uibase/shells/txtattr.ts",
  "apps/office/src/sw/source/uibase/shells/txtnum.ts",
  "apps/office/src/sw/uiconfig/swriter/menubar.ts",
  "apps/office/src/sw/source/uibase/app/mainwn.tsx",
  "apps/office/src/sw/source/uibase/ribbar/inputwin.tsx",
  "apps/office/src/sw/source/uibase/sidebar/WriterInspectorTextPanel.tsx",
  "apps/office/src/sw/source/filter/basflt/item-codec.ts",
  "apps/office/src/sw/source/filter/basflt/writer-document-codec.ts",
  "apps/office/src/sw/source/filter/basflt/writer-storage-codec.ts",
  "apps/office/src/sw/source/filter/basflt/writer-storage.ts",
  "apps/office/src/sw/source/uibase/wrtsh/select.ts",
  "apps/office/src/sw/uiconfig/swriter/menubar/format-menu.tsx",
  "apps/office/src/sw/uiconfig/swriter/menubar/menubar.tsx",
  "apps/office/src/sw/uiconfig/swriter/toolbar/standardbar.tsx",
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
