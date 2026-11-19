/** @fileoverview Pinned sal/qa/osl/file/osl_File.cxx position/read/write/EOF/resize assertions over actual libc descriptors, plus dirty-page, positional IO, source overflow and genuine readonly failures. URL-open wrapper is not substituted or claimed. */
import { beforeAll, expect, it } from "vitest";
import { initializeRuntime, getFileSystem } from "../../../external/emscripten/runtime";
import {
  oslFileError as E,
  osl_Pos_Absolut as ABS,
  osl_Pos_Current as CUR,
  osl_Pos_End as END,
} from "../../inc/osl/file";
import {
  createFileHandleFromFD,
  osl_closeFile,
  osl_syncFile,
  osl_readFile,
  osl_writeFile,
  osl_readFileAt,
  osl_writeFileAt,
  osl_getFilePos,
  osl_setFilePos,
  osl_getFileSize,
  osl_setFileSize,
  osl_isEndOfFile,
  type oslFileHandle,
} from "./file";
import { oslTranslateFileError, translateFileException } from "./file_error_transl";
beforeAll(
  /** Initializes actual libc before synchronous OSL calls. @returns Completion. */ async () => {
    await initializeRuntime();
  },
);
const fixture = new TextEncoder().encode("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ\0");
let serial = 0;
/** Real file constructor fixture; source OSL path/open and File wrapper remain unported. @param data - Initial contents. @param run - Assertions over genuine FD owner. @returns Nothing. */
function withFile(
  data: Uint8Array,
  run: (handle: oslFileHandle, fd: number, path: string) => void,
): void {
  const fs = getFileSystem(),
    path = `/tmp/osl-file-${++serial}`,
    stream = fs.open(path, "w+");
  fs.write(stream, data, 0, data.length);
  const fd = stream.fd,
    handle = createFileHandleFromFD(fd);
  expect(handle).not.toBeNull();
  try {
    run(handle, fd, path);
  } finally {
    expect(osl_closeFile(handle)).toBe(E.None);
    fs.unlink(path);
  }
}
it("ports setPos_001/002/003 and getPos_001 with original offsets and53byte fixture", /** Source errors/bytes are retained; actual logical position starts at zero independent of descriptor offset. @returns Nothing. */ () => {
  withFile(
    fixture,
    /** Exercises source assertions on the genuine file owner. @param handle - Actual OSL handle. @returns Nothing. */ (
      handle,
    ) => {
      const count: [bigint] = [0n],
        data = new Uint8Array(2);
      expect(osl_getFilePos(null, count)).toBe(E.INVAL);
      expect(osl_setFilePos(handle, ABS, 26n)).toBe(E.None);
      expect(osl_getFilePos(handle, count)).toBe(E.None);
      expect(count[0]).toBe(26n);
      expect(osl_readFile(handle, data, 1n, count)).toBe(E.None);
      expect(data[0]).toBe(fixture[26]);
      expect(osl_setFilePos(handle, ABS, 51n)).toBe(E.None);
      expect(osl_setFilePos(handle, CUR, 0n)).toBe(E.None);
      expect(osl_readFile(handle, data, 1n, count)).toBe(E.None);
      expect(data[0]).toBe(fixture[51]);
      expect(osl_setFilePos(handle, END, -100n)).toBe(E.INVAL);
      expect(osl_setFilePos(handle, END, -53n)).toBe(E.None);
      expect(osl_readFile(handle, data, 1n, count)).toBe(E.None);
      expect(data[0]).toBe(fixture[0]);
    },
  );
});
it("ports read_001/002 and write_001 original counts/cursor/content", /** Ten-byte write and26byte read at26 retain the source byte fixture and cursor52. @returns Nothing. */ () => {
  withFile(
    fixture,
    /** Exercises source assertions on the genuine file owner. @param handle - Actual OSL handle. @returns Nothing. */ (
      handle,
    ) => {
      const count: [bigint] = [0n],
        position: [bigint] = [0n],
        data = new Uint8Array(26);
      expect(osl_readFile(handle, data, 10n, count)).toBe(E.None);
      expect(count[0]).toBe(10n);
      expect(osl_getFilePos(handle, position)).toBe(E.None);
      expect(position[0]).toBe(10n);
      expect([...data.subarray(0, 10)]).toEqual([...fixture.subarray(0, 10)]);
      expect(osl_setFilePos(handle, ABS, 26n)).toBe(E.None);
      expect(osl_readFile(handle, data, 26n, count)).toBe(E.None);
      expect(count[0]).toBe(26n);
      expect(osl_getFilePos(handle, position)).toBe(E.None);
      expect(position[0]).toBe(52n);
      expect([...data]).toEqual([...fixture.subarray(26, 52)]);
      expect(osl_setFilePos(handle, ABS, 0n)).toBe(E.None);
      expect(osl_writeFile(handle, fixture, 10n, count)).toBe(E.None);
      expect(count[0]).toBe(10n);
      expect(osl_getFilePos(handle, position)).toBe(E.None);
      expect(position[0]).toBe(10n);
      expect(osl_setFilePos(handle, ABS, 0n)).toBe(E.None);
      expect(osl_readFile(handle, data, 10n, count)).toBe(E.None);
      expect([...data.subarray(0, 10)]).toEqual([...fixture.subarray(0, 10)]);
    },
  );
});
it.each([100n, 10n])(
  "ports setSize_001/002 size%s preserving end/cursor queries",
  /** Original expand and truncate values. @param size - Source target. @returns Nothing. */ (
    size,
  ) => {
    withFile(
      fixture,
      /** Verifies source resize/cursor against actual file status. @param handle - OSL owner. @param fd - Actual descriptor. @returns Nothing. */ (
        handle,
        fd,
      ) => {
        const output: [bigint] = [0n];
        expect(osl_setFileSize(handle, size)).toBe(E.None);
        expect(osl_setFilePos(handle, END, 0n)).toBe(E.None);
        expect(osl_getFilePos(handle, output)).toBe(E.None);
        expect(output[0]).toBe(size);
        expect(getFileSystem().fstat(fd).size).toBe(Number(size));
      },
    );
  },
);
it("ports isEndOfFile_001/002 including source one-step-past-end cursor", /** Equality rather than >= is intentional in the source, including its loop's extra increment. @returns Nothing. */ () => {
  withFile(
    fixture,
    /** Exercises source assertions on the genuine file owner. @param handle - Actual OSL handle. @returns Nothing. */ (
      handle,
    ) => {
      const eof: [boolean] = [false],
        position: [bigint] = [0n];
      expect(osl_setFilePos(handle, END, 0n)).toBe(E.None);
      expect(osl_isEndOfFile(handle, eof)).toBe(E.None);
      expect(eof[0]).toBe(true);
      expect(osl_setFilePos(handle, ABS, 0n)).toBe(E.None);
      eof[0] = false;
      while (!eof[0]) {
        expect(osl_isEndOfFile(handle, eof)).toBe(E.None);
        expect(osl_setFilePos(handle, CUR, 1n)).toBe(E.None);
      }
      expect(osl_getFilePos(handle, position)).toBe(E.None);
      expect(position[0]).toBe(54n);
      expect(osl_isEndOfFile(handle, eof)).toBe(E.None);
      expect(eof[0]).toBe(false);
    },
  );
});
it.each([0, 1, 65535, 65536, 65537, 131073])(
  "retains actual page caching/direct IO and source contents for%i bytes",
  /** Independent runtime descriptor observes actual flush; no backend injector or private state patch. @param size - Initialized length. @returns Nothing. */ (
    size,
  ) => {
    const data = Uint8Array.from(
      { length: size },
      /** Initializes deterministic fixture bytes. @param _ - Unused. @param i - Index. @returns Byte. */ (
        _,
        i,
      ) => (i * 13) & 255,
    );
    withFile(
      new Uint8Array(),
      /** Observes dirty/direct writes through an independent descriptor. @param handle - OSL owner. @param fd - Actual descriptor. @param path - Actual runtime path. @returns Nothing. */ (
        handle,
        fd,
        path,
      ) => {
        const count: [bigint] = [0n],
          logical: [bigint] = [0n],
          read = new Uint8Array(size + 1),
          fs = getFileSystem();
        expect(osl_writeFile(handle, data, BigInt(size), count)).toBe(E.None);
        expect(count[0]).toBe(BigInt(size));
        expect(osl_getFileSize(handle, logical)).toBe(E.None);
        expect(logical[0]).toBe(BigInt(size));
        expect(osl_syncFile(handle)).toBe(E.None);
        expect(fs.fstat(fd).size).toBe(size);
        const independent = fs.open(path, "r");
        try {
          expect(fs.read(independent, read, 0, size + 1)).toBe(size);
          expect([...read.subarray(0, size)]).toEqual([...data]);
        } finally {
          fs.close(independent);
        }
        expect(osl_setFilePos(handle, ABS, 0n)).toBe(E.None);
        expect(osl_readFile(handle, read, BigInt(size + 1), count)).toBe(E.None);
        expect(count[0]).toBe(BigInt(size));
        expect([...read.subarray(0, size)]).toEqual([...data]);
      },
    );
  },
);
it("flushes a dirty page before cross-page refill, retains positional IO and invalidates before truncate", /** Two actual initialized pages reveal read-before-write preservation and descriptor/logical position separation. @returns Nothing. */ () => {
  withFile(
    new Uint8Array(131072).fill(23),
    /** Exercises page transition and positional IO. @param handle - OSL owner. @param fd - Actual descriptor. @returns Nothing. */ (
      handle,
      fd,
    ) => {
      const count: [bigint] = [0n],
        position: [bigint] = [0n],
        data = new Uint8Array(4);
      expect(osl_setFilePos(handle, ABS, 65535n)).toBe(E.None);
      expect(osl_writeFile(handle, Uint8Array.of(1, 2, 3, 4), 4n, count)).toBe(E.None);
      expect(osl_readFileAt(handle, 65534n, data, 4n, count)).toBe(E.None);
      expect([...data]).toEqual([23, 1, 2, 3]);
      expect(osl_writeFileAt(handle, 5n, Uint8Array.of(99), 1n, count)).toBe(E.None);
      expect(osl_getFilePos(handle, position)).toBe(E.None);
      expect(position[0]).toBe(65539n);
      expect(osl_setFileSize(handle, 8n)).toBe(E.None);
      expect(getFileSystem().fstat(fd).size).toBe(8);
      expect(osl_getFilePos(handle, position)).toBe(E.None);
      expect(position[0]).toBe(65539n);
      expect(osl_readFileAt(handle, 4n, data, 4n, count)).toBe(E.None);
      expect([...data]).toEqual([23, 99, 23, 23]);
    },
  );
});
it("checks original pointer/ssize_t/off_t bounds and leaves outputs/cursor unchanged on rejection", /** Invalid API arguments use real source checks, no fabricated native error state. @returns Nothing. */ () => {
  withFile(
    fixture,
    /** Exercises source assertions on the genuine file owner. @param handle - Actual OSL handle. @returns Nothing. */ (
      handle,
    ) => {
      const count: [bigint] = [91n],
        byte = new Uint8Array(1),
        eof: [boolean] = [false];
      expect(osl_readFile(handle, null, 0n, count)).toBe(E.INVAL);
      expect(osl_writeFile(handle, byte, 1n, null)).toBe(E.INVAL);
      expect(osl_readFile(handle, byte, 0x80000000n, count)).toBe(E.OVERFLOW);
      expect(osl_writeFile(handle, byte, 0x80000000n, count)).toBe(E.OVERFLOW);
      expect(osl_readFileAt(handle, 0x8000000000000000n, byte, 1n, count)).toBe(E.OVERFLOW);
      expect(osl_writeFileAt(handle, 0n, byte, 0x80000000n, count)).toBe(E.OVERFLOW);
      expect(osl_setFileSize(handle, 0x8000000000000000n)).toBe(E.OVERFLOW);
      expect(osl_setFilePos(handle, ABS, -1n)).toBe(E.INVAL);
      expect(osl_setFilePos(handle, CUR, -1n)).toBe(E.INVAL);
      expect(osl_setFilePos(handle, 99, 0n)).toBe(E.INVAL);
      expect(osl_setFilePos(handle, ABS, 0x8000000000000000n)).toBe(E.OVERFLOW);
      expect(count[0]).toBe(91n);
      expect(osl_setFilePos(handle, ABS, 0x7fffffffffffffffn)).toBe(E.None);
      expect(osl_setFilePos(handle, CUR, 1n)).toBe(E.OVERFLOW);
      expect(osl_setFilePos(handle, ABS, 0x100000003n)).toBe(E.None);
      expect(osl_getFilePos(handle, count)).toBe(E.None);
      expect(count[0]).toBe(0x100000003n);
      expect(osl_isEndOfFile(handle, eof)).toBe(E.None);
      expect(eof[0]).toBe(false);
    },
  );
  expect(createFileHandleFromFD(-1)).toBeNull();
  expect(createFileHandleFromFD(123456)).toBeNull();
  expect(osl_closeFile(null)).toBe(E.INVAL);
  expect(osl_syncFile(null)).toBe(E.INVAL);
});
it("preserves createFileHandleFromFD writeable assumption and real readonly flush/close error", /** Actual readonly descriptor produces libc BADF; no fake failure provider. @returns Nothing. */ () => {
  const fs = getFileSystem(),
    path = `/tmp/osl-readonly-${++serial}`,
    initial = fs.open(path, "w+");
  fs.write(initial, fixture, 0, fixture.length);
  fs.close(initial);
  const readonly = fs.open(path, "r"),
    fd = readonly.fd,
    handle = createFileHandleFromFD(fd),
    count: [bigint] = [0n];
  try {
    expect(osl_writeFile(handle, Uint8Array.of(8), 1n, count)).toBe(E.None);
    expect(osl_syncFile(handle)).toBe(E.BADF);
    expect(osl_closeFile(handle)).toBe(E.BADF);
    expect(
      /** Observes actual descriptor closure. @returns File status if unexpectedly open. */ () =>
        fs.fstat(fd),
    ).toThrow();
  } finally {
    fs.unlink(path);
  }
});
it("retains native errno switch quirks and propagates non-syscall JS failures", /** Direct source enum conversion API, not a fault injector. @returns Nothing. */ () => {
  expect(oslTranslateFileError(60)).toBe(E.IO); // wasm ENXIO, source intentionally returns IO
  expect(oslTranslateFileError(44)).toBe(E.NOENT);
  expect(oslTranslateFileError(136)).toBe(E.USERS);
  expect(oslTranslateFileError(138)).toBe(E.NOSYS);
  expect(oslTranslateFileError(99999)).toBe(E.invalidError);
  expect(
    /** Exercises source assertion. @returns Source code if unexpectedly accepted. */ () =>
      oslTranslateFileError(0),
  ).toThrow("assert(Errno != 0)");
  const error = new Error("programming error");
  expect(
    /** Confirms programming errors are not translated into syscall results. @returns Source code if unexpectedly translated. */ () =>
      translateFileException(error),
  ).toThrow(error);
});
