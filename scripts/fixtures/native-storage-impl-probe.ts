/** @fileoverview Original internal storage constructor and package-folder catalog over actual source owners in main and DOM-free Worker. Full StorageFactory/OStorage service is not substituted. */
import { OStorage_Impl } from "../../apps/office/src/package/source/xstor/xstorage.impl";
import { ZipPackage } from "../../apps/office/src/package/source/zippackage/ZipPackage";
import { ZipPackageFolder } from "../../apps/office/src/package/source/zippackage/ZipPackageFolder.native";
import { getProcessComponentContext } from "../../apps/office/src/comphelper/inc/processfactory";
import { Reference } from "../../apps/office/src/cppu/inc/com/sun/star/uno/Reference";
import { Any } from "../../apps/office/src/cppu/inc/com/sun/star/uno/Any";
import { OUString } from "../../apps/office/src/sal/inc/rtl/ustring";
import { READ } from "../../apps/office/src/offapi/com/sun/star/embed/ElementModes";
import { ZIP } from "../../apps/office/src/offapi/com/sun/star/embed/StorageFormats";
/** Exercises the actual folder enumeration and internal catalog without a replacement factory. @returns Native observations match. */
export function probeNativeStorageImpl(): boolean {
  const context = new Reference(getProcessComponentContext().get()),
    pack = new Reference(new ZipPackage(context)),
    folder = new Reference(new ZipPackageFolder(context, ZIP, false)),
    stream = pack.operatorStar().createInstance(),
    name = OUString.fromUtf8(new TextEncoder().encode("document.xml")),
    value = new Any(stream.getAddress(), "XInterface");
  let state: OStorage_Impl | undefined;
  try {
    folder.operatorStar().insertByName(name, value);
    state = new OStorage_Impl(null, READ, folder, pack, context, ZIP, "substorage");
    if (!state.HasChildren()) return false;
    const element = state.FindElement(name);
    return (
      element !== null &&
      !element.m_bIsStorage &&
      !element.m_bIsInserted &&
      !element.m_bIsRemoved &&
      state.m_bListCreated &&
      state.FindElement(name) === element
    );
  } finally {
    state?.dispose();
    value.dispose();
    name.dispose();
    stream.dispose();
    folder.dispose();
    pack.dispose();
    context.dispose();
  }
}
