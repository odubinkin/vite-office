/** @fileoverview Actual native ZipStorage/StorageBase negative backend, original path/mode/ownership and genuine StorageFactory failure paths; no synthetic positive XStorage provider. */
import { afterEach, beforeAll, expect, it } from "vitest";
import { own, releaseDomScope } from "../../../test/native-dom";
import { Reference } from "../../../cppu/inc/com/sun/star/uno/Reference";
import type { XStorage } from "../../../offapi/com/sun/star/embed/XStorage";
import type { XComponentContext } from "../../../udkapi/com/sun/star/uno/XComponentContext";
import { Sequence } from "../../../cppu/inc/com/sun/star/uno/Sequence";
import { Exception } from "../../../cppu/inc/com/sun/star/uno/Exception";
import { DeploymentException } from "../../../cppu/inc/com/sun/star/uno/DeploymentException";
import { UNOMemoryStream } from "../../../comphelper/source/streaming/memorystream";
import { SequenceInputStream } from "../../../comphelper/source/streaming/seqstream";
import { defaultBootstrap_InitialComponentContext } from "../../../cppuhelper/source/defaultbootstrap";
import { OStorageHelper } from "../../../comphelper/inc/storagehelper";
import { getProcessComponentContext } from "../../../comphelper/inc/processfactory";
import { ZipStorage } from "./zipstorage.native";
import { FastParser } from "../core/fastparser";
import { unicode, text } from "../../../i18nlangtag/source/isolang/isolang.tables";
import { initializeLibXml2 } from "../../../external/libxml2/libxml2";
import { initializeExceptionAbi } from "../../../cppuhelper/browser/exception-abi";
import { DisposedException } from "../../../cppu/inc/com/sun/star/lang/DisposedException";
import { writeOutput } from "../../../test/oox-output";
beforeAll(
  /** Initializes actual C parser and native exception ABI. @returns Completion. */ async () => {
    await initializeLibXml2();
    initializeExceptionAbi();
  },
);
afterEach(releaseDomScope);
/** Actual native source streams and root constructor selection. @param output - Original output overload. @returns Native storage with no fabricated XStorage backend. */
function storage(output: boolean): ZipStorage {
  const context = own(new Reference<XComponentContext>());
  if (output)
    return own(new ZipStorage(context, own(new Reference(new UNOMemoryStream())), "output"));
  const bytes = own(new (Sequence.specialize<number>("sal_Int8", 1))());
  return own(new ZipStorage(context, own(new Reference(new SequenceInputStream(bytes))), false));
}
it.each([false, true])(
  "retains native mode/path/empty-backend contracts output=%s",
  /** Missing context leaves the original storage invalid while retaining base stream ownership. @param output - Original overload. @returns Nothing. */ (
    output,
  ) => {
    const root = storage(output);
    expect(root.isStorage()).toBe(false);
    expect(root.isRootStorage()).toBe(false);
    expect(root.isReadOnly()).toBe(!output);
    expect(root.getName().isEmpty()).toBe(true);
    expect(own(root.getPath()).isEmpty()).toBe(true);
    expect(own(root.getXStorage()).is()).toBe(false);
    const names = [unicode("stale")];
    root.getElementNames(names);
    expect(names).toEqual([]);
    const child = own(new ZipStorage(root, own(new Reference<XStorage>()), own(unicode("word")))),
      grandchild = own(new ZipStorage(child, own(new Reference<XStorage>()), own(unicode("字😀"))));
    expect(text(child.getName())).toBe("word");
    expect(text(own(child.getPath()))).toBe("word");
    expect(text(own(grandchild.getPath()))).toBe("word/字😀");
    expect(grandchild.isReadOnly()).toBe(!output);
    expect(
      /** Original invalid backend commit catches the native throwing query. @returns Nothing. */ () =>
        root.commit(),
    ).not.toThrow();
  },
);
it.each(["", "/", "///", "word/", "/word/document.xml", "a//b", "字😀/styles.xml"])(
  "retains exact source descent and empty misses for %s",
  /** Both real root overloads traverse the original core owner without asynchronous promises or a replacement provider. @param path - Native path literal. @returns Nothing. */ (
    path,
  ) => {
    const name = own(unicode(path));
    for (const output of [false, true]) {
      const root = storage(output);
      expect(own(root.openInputStream(name)).is()).toBe(false);
      expect(own(root.openOutputStream(name)).is()).toBe(false);
      expect(own(root.openSubStorage(name, false)).is()).toBe(false);
      expect(own(root.openSubStorage(name, true)).is()).toBe(false);
      // Original empty cache slots remain retryable rather than marking a missing storage final.
      expect(own(root.openSubStorage(name, false)).is()).toBe(false);
      root.copyToStorage(storage(!output), name);
      root.copyStorageToStorage(storage(!output));
    }
  },
);
it("retains original base input lifetime without closing it on native storage destruction", /** Actual input survives caller reference release and storage member release when separately retained. @returns Nothing. */ () => {
  const bytes = own(new (Sequence.specialize<number>("sal_Int8", 1))(3)),
    input = own(new Reference(new SequenceInputStream(bytes))),
    retained = own(new Reference(input)),
    root = new ZipStorage(own(new Reference<XComponentContext>()), input, false);
  input.clear();
  expect(retained.operatorStar().available()).toBe(3);
  root.dispose();
  expect(retained.operatorStar().available()).toBe(3);
});
it("reports a failed nested transaction from the browser export boundary before root persistence", /** Uses the genuine disposed child storage to exercise the two commit contracts. @returns Nothing. */ () => {
  const context = own(new Reference<XComponentContext>(getProcessComponentContext().get()));
  const bytes = own(new Reference(new UNOMemoryStream()));
  const root = own(new ZipStorage(context, bytes, "output"));
  const path = own(unicode("word/document.xml"));
  const output = own(root.openOutputStream(path));
  writeOutput(output.operatorStar(), new TextEncoder().encode("<document/>"));
  output.clear();
  const child = own(root.openSubStorage(own(unicode("word")), false));
  own(child.operatorStar().getXStorage()).operatorStar().dispose();
  try {
    root.commit(true);
    expect.unreachable("The nested transaction should report disposal");
  } catch (error) {
    if (!(error instanceof DisposedException)) throw error;
    error.dispose();
  }
  expect(bytes.operatorStar().getLength()).toBe(0n);
  root.commit();
});
it.each([false, true])(
  "performs original format-property and native factory route repair=%s",
  /** A genuinely unregistered factory yields its original DeploymentException; ZipStorage swallows UNO construction errors only. @param repair - Original flag. @returns Nothing. */ (
    repair,
  ) => {
    const context = own(defaultBootstrap_InitialComponentContext([])),
      bytes = own(new (Sequence.specialize<number>("sal_Int8", 1))()),
      input = own(new Reference(new SequenceInputStream(bytes))),
      stream = own(new Reference(new UNOMemoryStream())),
      format = own(unicode("ZipFormat")),
      url = own(unicode("file:///missing"));
    const calls = [
      /** Original URL source overload. @returns Actual storage or exception. */ () =>
        OStorageHelper.GetStorageOfFormatFromURL(format, url, 1, context),
      /** Original input source overload. @returns Actual storage or exception. */ () =>
        OStorageHelper.GetStorageOfFormatFromInputStream(format, input, context, repair),
      /** Original output source overload. @returns Actual storage or exception. */ () =>
        OStorageHelper.GetStorageOfFormatFromStream(format, stream, 11, context, repair),
    ];
    for (const call of calls) {
      let caught: unknown;
      try {
        own(call());
      } catch (error) {
        caught = error;
      }
      expect(caught).toBeInstanceOf(DeploymentException);
      (caught as Exception).dispose();
    }
    const read = own(new ZipStorage(context, input, repair)),
      write = own(new ZipStorage(context, stream, "output"));
    expect(read.isStorage()).toBe(false);
    expect(write.isStorage()).toBe(false);
  },
);
it("opens through the original FastParser StorageBase overload and preserves native missing-input failure", /** Real wrapper, real invalid native storage and real SAX exception; no custom observer/provider. @returns Nothing. */ () => {
  const parser = own(new FastParser()),
    root = storage(false);
  let caught: unknown;
  try {
    parser.parseStream(root, own(unicode("word/document.xml")));
  } catch (error) {
    caught = error;
  }
  expect(caught).toBeInstanceOf(Exception);
  (caught as Exception).dispose();
});
