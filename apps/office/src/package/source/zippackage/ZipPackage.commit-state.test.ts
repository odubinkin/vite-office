/** @fileoverview Source initialization modes, readonly commit and failed-transfer detachment through real UNO streams/temp files/errors. Ordinary stream commits and typed failures use the original package owners. */
import { beforeAll, afterEach, expect, it } from "vitest";
import { initializeRuntime, getFileSystem } from "../../../external/emscripten/runtime";
import { getProcessComponentContext } from "../../../comphelper/inc/processfactory";
import { Reference, UNO_QUERY_THROW } from "../../../cppu/inc/com/sun/star/uno/Reference";
import { Any } from "../../../cppu/inc/com/sun/star/uno/Any";
import { Sequence, type SequenceElements } from "../../../cppu/inc/com/sun/star/uno/Sequence";
import { MemoryInputStream } from "../../../comphelper/source/streaming/seqstream";
import { UNOMemoryStream } from "../../../comphelper/source/streaming/memorystream";
import { WeakReferenceHelper } from "../../../cppuhelper/inc/weakref";
import { XInitialization } from "../../../udkapi/com/sun/star/lang/XInitialization";
import { XServiceInfo } from "../../../cppu/inc/com/sun/star/lang/XServiceInfo";
import { XInputStream } from "../../../udkapi/com/sun/star/io/XInputStream";
import { WrappedTargetException } from "../../../cppu/inc/com/sun/star/lang/WrappedTargetException";
import {
  IOException,
  cppu_detail_getUnoType as ioType,
} from "../../../cppu/inc/com/sun/star/io/IOException";
import {
  UseBackupException,
  cppu_detail_getUnoType as backupType,
  getCppuType,
} from "../../../offapi/com/sun/star/embed/UseBackupException";
import { OTempFileService } from "../../../unotools/source/ucbhelper/xtempfile";
import { FileBase } from "../../../sal/inc/osl/file.hxx";
import {
  NamedValue,
  cppu_detail_getUnoType_NamedValue as namedType,
} from "../../../udkapi/com/sun/star/beans/NamedValue";
import { own, u, read, releaseDomScope } from "../../../test/native-dom";
import { OUString } from "../../../sal/inc/rtl/ustring";
import { XStream } from "../../../udkapi/com/sun/star/io/XStream";
import { ZIP, OFOPXML, PACKAGE } from "../../../offapi/com/sun/star/embed/StorageFormats";
import { ZipPackageFolder } from "./ZipPackageFolder.native";
import { ZipPackageStream } from "./ZipPackageStream";
import { DocumentArchive } from "./document-archive";
import { ZipPackage } from "./ZipPackage";
const Args = Sequence.specialize<Any>("Any", 24),
  files: string[] = [];
beforeAll(
  /** Actual WASM/OSL runtime and production service context. @returns Completion. */ async () => {
    await initializeRuntime();
  },
);
afterEach(
  /** Release real temp owners before removing preserved backup fixtures. @returns Nothing. */ () => {
    releaseDomScope();
    for (const path of files.splice(0)) getFileSystem().unlink(path);
  },
);
/** Real source graph. @returns Actual owners. */ function graph() {
  const context = own(new Reference(getProcessComponentContext().get())),
    root = own(new Reference(new ZipPackage(context)));
  return { context, root };
}
/** Native initializer-list Any arguments. @param values - Actual source values. @returns Actual sequence. */ function args(
  ...values: Any[]
) {
  return own(
    new Args(
      {
        /** Native sequence element address. @param offset - Byte offset. @returns Existing Any. */ get(
          offset: number,
        ) {
          return values[offset / 24] as Any;
        },
      },
      values.length,
    ),
  );
}
/** Actual source error and package Context observation. @param call - Actual operation. @param root - Actual receiver. @param backup - Expected wrapped target. @returns Owned typed backup when applicable. */ function wrapped(
  call: () => unknown,
  root: Reference<ZipPackage>,
  backup: boolean,
): UseBackupException | undefined {
  let caught = false,
    result: UseBackupException | undefined;
  try {
    call();
  } catch (error) {
    if (!(error instanceof WrappedTargetException)) throw error;
    try {
      caught = true;
      expect(read(new OUString(error.Message))).toBe("This package is read only!");
      expect(error.Context.get()).toBe(root.get());
      if (backup) {
        result = own(new UseBackupException());
        expect(error.TargetException.extract(result, backupType)).toBe(true);
      } else {
        const io = own(new IOException());
        expect(error.TargetException.extract(io, ioType)).toBe(true);
        expect(error.TargetException.getValueType().equals(ioType())).toBe(true);
      }
    } finally {
      error.dispose();
    }
  }
  expect(caught).toBe(true);
  return result;
}
it("provides actual source initialization/service interfaces and original service spelling without full package registration", /** Genuine queried interfaces retain one actual owner. @returns Nothing. */ () => {
  const { root } = graph(),
    init = own(new Reference<XInitialization>(root, UNO_QUERY_THROW, XInitialization.static_type)),
    info = own(new Reference<XServiceInfo>(root, UNO_QUERY_THROW, XServiceInfo.static_type));
  expect(init.get()).toBe(root.get());
  expect(read(info.operatorStar().getImplementationName())).toBe(
    "com.sun.star.packages.comp.ZipPackage",
  );
  expect(info.operatorStar().supportsService(u("com.sun.star.packages.Package"))).toBe(true);
  expect(info.operatorStar().supportsService(u("com.sun.star.packages.comp.ZipPackage"))).toBe(
    false,
  );
  const names = own(info.operatorStar().getSupportedServiceNames());
  expect(names.getLength()).toBe(1);
  expect(
    read(
      new OUString(
        OUString.unacquired(
          (names.getConstArray() as SequenceElements).get(0) as Parameters<
            typeof OUString.unacquired
          >[0],
        ),
      ),
    ),
  ).toBe("com.sun.star.packages.Package");
});
it("rejects readonly input commits with the original typed IOException and actual receiver", /** A real input-only component cannot be extracted as XStream. @returns Nothing. */ () => {
  const { root } = graph(),
    input = own(new Reference<XInputStream>(new MemoryInputStream(new Uint8Array(), 0)));
  root
    .operatorStar()
    .initialize(args(own(new Any(input.getAddress(), ["Reference", XInputStream.static_type]))));
  wrapped(
    /** Actual original mode guard. @returns Nothing. */ () => root.operatorStar().commitChanges(),
    root,
    false,
  );
  expect(input.operatorStar().available()).toBe(0);
});
it.each([true, false, 7])(
  "retains original NoFileSync NamedValue admission and failed bool extraction:%s",
  /** Uses the original optional output sync property with an ordinary commit. @param flag - Actual property selection. @returns Nothing. */ (
    flag,
  ) => {
    const { root } = graph(),
      value = own(new Any([flag], typeof flag === "boolean" ? "bool" : "sal_Int32")),
      named = own(new NamedValue(u("NoFileSync"), value));
    root.operatorStar().initialize(args(own(new Any(named, namedType))));
    root.operatorStar().initialize(args(formatArgument(ZIP)));
    root.operatorStar().commitChanges();
  },
);
it("switches readonly after failure when the real temporary input has no XStream/property interface", /** The unavailable source property query is caught without a fake Uri/RemoveFile provider. @returns Nothing. */ () => {
  const { root } = graph(),
    input = own(new Reference<XInputStream>(new MemoryInputStream(new Uint8Array(), 0))),
    result = wrapped(
      /** Original failure detachment. @returns Never. */ () =>
        root.operatorStar().DisconnectFromTargetAndThrowException_Impl(input),
      root,
      true,
    );
  expect(result?.TemporaryFileURL.isEmpty()).toBe(true);
  wrapped(
    /** Actual resulting mode. @returns Nothing. */ () => root.operatorStar().commitChanges(),
    root,
    false,
  );
});
it("retains a genuine temporary backup and releases the original stream after source ConnectTo and failure detachment", /** Actual TempFileService properties and filesystem lifetime are used. @returns Nothing. */ () => {
  const { context, root } = graph(),
    original = own(new Reference(new UNOMemoryStream())),
    weak = own(new WeakReferenceHelper(original));
  const initialValue = own(new Any(original.getAddress(), ["Reference", XInputStream.static_type])),
    initialArgs = args(initialValue);
  root.operatorStar().initialize(initialArgs);
  initialValue.assign(own(new Any()));
  initialArgs.realloc(0);
  const temp = own(new Reference(new OTempFileService(context))),
    input = own(temp.operatorStar().getInputStream()),
    uri = own(temp.operatorStar().getUri()),
    path = own(new OUString());
  expect(FileBase.getSystemPathFromFileURL(uri, path)).toBe(FileBase.E_None);
  files.push(read(new OUString(path)));
  root.operatorStar().ConnectTo(input);
  const result = wrapped(
    /** Original final-copy failure path. @returns Never. */ () =>
      root.operatorStar().DisconnectFromTargetAndThrowException_Impl(input),
    root,
    true,
  );
  expect(result?.TemporaryFileURL.equals(uri)).toBe(true);
  expect(temp.operatorStar().getRemoveFile()).toBe(false);
  original.clear();
  const retained = own(weak.get());
  expect(retained.is()).toBe(false);
  root.operatorStar().initialize(args(formatArgument(ZIP)));
  root.operatorStar().commitChanges();
});
it("preserves UseBackupException generated type/base, copy/move/Any/member ownership", /** Actual generated binding, not a DTO exception. @returns Nothing. */ () => {
  const { root } = graph(),
    base = own(new Reference(root)),
    first = own(new UseBackupException(u("message"), base, u("file:///tmp/backup"))),
    copy = own(new UseBackupException(first)),
    assigned = own(new UseBackupException());
  assigned.assign(first);
  first.TemporaryFileURL = u("changed");
  expect(read(new OUString(copy.TemporaryFileURL))).toBe("file:///tmp/backup");
  const moved = own(UseBackupException.move(copy));
  expect(copy.TemporaryFileURL.isEmpty()).toBe(true);
  assigned.TemporaryFileURL = u("previous");
  assigned.moveAssign(moved);
  expect(read(new OUString(moved.TemporaryFileURL))).toBe("previous");
  const value = own(new Any(assigned, backupType)),
    decoded = own(new UseBackupException());
  expect(value.extract(decoded, backupType)).toBe(true);
  expect(decoded.Context.get()).toBe(root.get());
  expect(read(new OUString(decoded.TemporaryFileURL))).toBe("file:///tmp/backup");
  expect(decoded.get(16)).toBe(decoded.TemporaryFileURL.getDataAddress());
  expect(decoded.get(0)).toBe(decoded.Message.getDataAddress());
  expect(getCppuType()).toBe(backupType());
});

/** Original storage format argument. @param format - Source format. @returns Owned Any. */
function formatArgument(format: number): Any {
  return own(
    new Any(
      own(new NamedValue(u("StorageFormat"), own(new Any([format], "sal_Int32")))),
      namedType,
    ),
  );
}
const Bytes = Sequence.specialize<number>("sal_Int8", 1);
/** Reads the original destination stream as an archive. @param target - Actual destination. @returns Archive. */
async function reopen(target: UNOMemoryStream): Promise<DocumentArchive> {
  const bytes = own(new Bytes());
  target.seek(0n);
  const len = target.readBytes(bytes, Number(target.getLength()));
  const cells = bytes.getConstArray() as SequenceElements;
  const image = new Uint8Array(len);
  for (let i = 0; i < len; ++i) image[i] = (cells.get(i) as [number])[0];
  return DocumentArchive.open(image);
}
it.each([ZIP, OFOPXML, PACKAGE])(
  "writes and updates an actual XStream package in format %s",
  /** Exercises direct and temporary stream commits with real members. @param format - Source format. @returns Completion. */ async (
    format,
  ) => {
    const { root } = graph(),
      target = own(new Reference(new UNOMemoryStream())),
      owner = root.operatorStar();
    owner.initialize(
      args(
        own(new Any(target.getAddress(), ["Reference", XStream.static_type])),
        formatArgument(format),
      ),
    );
    const folderRef = own(new Reference()),
      folderValue = own(owner.getByHierarchicalName(u("/")));
    folderValue.extract(folderRef.getAddress(), "XInterface");
    const folder = folderRef.get();
    if (!(folder instanceof ZipPackageFolder)) throw new Error("Actual root folder required");
    if (format === PACKAGE) {
      folder.SetMediaType(u("application/vnd.oasis.opendocument.text"));
      folder.SetVersion(u("1.3"));
    }
    for (const body of ["first version of the payload", "second"]) {
      const name = u("payload.xml"),
        component = own(owner.createInstance()),
        member = component.get();
      if (!(member instanceof ZipPackageStream)) throw new Error("Actual package stream required");
      const source = own(
        new Reference(new MemoryInputStream(new TextEncoder().encode(body), body.length)),
      );
      member.setDataStream(source);
      member.setPropertyValue(u("Compressed"), own(new Any([false], "bool")));
      member.SetMediaType(u("application/test+xml"));
      const value = own(new Any(component.getAddress(), "XInterface"));
      if (folder.hasByName(name)) folder.replaceByName(name, value);
      else folder.insertByName(name, value);
      owner.commitChanges();
      const archive = await reopen(target.operatorStar());
      expect(await archive.readTextEntry("payload.xml")).toBe(body);
      if (format === OFOPXML) expect(archive.getEntryNames()).toContain("[Content_Types].xml");
      if (format === PACKAGE) {
        expect(archive.getEntryNames()).toContain("META-INF/manifest.xml");
        expect(await archive.readTextEntry("mimetype")).toBe(
          "application/vnd.oasis.opendocument.text",
        );
      }
    }
  },
);
