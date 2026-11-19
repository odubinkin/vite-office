/** @fileoverview Actual original readonly commit and typed failure detachment through native input/UNO error owners in main and DOM-free Worker. Positive root commit/transfer is still unavailable. */
import { ZipPackage } from "../../apps/office/src/package/source/zippackage/ZipPackage";
import { getProcessComponentContext } from "../../apps/office/src/comphelper/inc/processfactory";
import { Reference } from "../../apps/office/src/cppu/inc/com/sun/star/uno/Reference";
import { Any } from "../../apps/office/src/cppu/inc/com/sun/star/uno/Any";
import { Sequence } from "../../apps/office/src/cppu/inc/com/sun/star/uno/Sequence";
import { XInputStream } from "../../apps/office/src/udkapi/com/sun/star/io/XInputStream";
import { MemoryInputStream } from "../../apps/office/src/comphelper/source/streaming/seqstream";
import { WrappedTargetException } from "../../apps/office/src/cppu/inc/com/sun/star/lang/WrappedTargetException";
import {
  IOException,
  cppu_detail_getUnoType as ioType,
} from "../../apps/office/src/cppu/inc/com/sun/star/io/IOException";
import {
  UseBackupException,
  cppu_detail_getUnoType as backupType,
} from "../../apps/office/src/offapi/com/sun/star/embed/UseBackupException";
/** Uses actual mode selection, guarded readonly error and original backup notification. @returns Source observations match. */
export function probeNativePackageCommitState(): boolean {
  const context = new Reference(getProcessComponentContext().get()),
    root = new Reference(new ZipPackage(context)),
    input = new Reference<XInputStream>(new MemoryInputStream(new Uint8Array(), 0)),
    value = new Any(input.getAddress(), ["Reference", XInputStream.static_type]),
    args = new (Sequence.specialize<Any>("Any", 24))(
      {
        /** Original initializer-list source. @returns Actual Any. */ get() {
          return value;
        },
      },
      1,
    );
  try {
    root.operatorStar().initialize(args);
    let readonly = false,
      backup = false;
    try {
      root.operatorStar().commitChanges();
    } catch (error) {
      if (!(error instanceof WrappedTargetException)) throw error;
      const target = new IOException();
      try {
        readonly =
          error.Context.get() === root.get() && error.TargetException.extract(target, ioType);
      } finally {
        target.dispose();
        error.dispose();
      }
    }
    try {
      root.operatorStar().DisconnectFromTargetAndThrowException_Impl(input);
    } catch (error) {
      if (!(error instanceof WrappedTargetException)) throw error;
      const target = new UseBackupException();
      try {
        backup =
          error.Context.get() === root.get() &&
          error.TargetException.extract(target, backupType) &&
          target.TemporaryFileURL.isEmpty();
      } finally {
        target.dispose();
        error.dispose();
      }
    }
    return readonly && backup;
  } finally {
    args.dispose();
    value.dispose();
    input.dispose();
    root.dispose();
    context.dispose();
  }
}
