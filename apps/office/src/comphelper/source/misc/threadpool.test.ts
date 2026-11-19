/** @fileoverview Original ThreadPoolTest::testNoThreads call sequence and actual task/tag/queue behavior. Fixture task subclasses are the original abstract-task test pattern; native thread identifiers, shared optimal/dedicated workers and condition-variable waiting remain unqualified. */
import { afterEach, beforeAll, expect, it } from "vitest";
import { inflateRawSync } from "node:zlib";
import { initializeRuntime } from "../../../external/emscripten/runtime";
import { ThreadPool, ThreadTask, type ThreadTaskTag } from "./threadpool";
import { own, u, releaseDomScope } from "../../../test/native-dom";
import { RuntimeException } from "../../../cppu/inc/com/sun/star/uno/RuntimeException";
import type { XComponentContext } from "../../../udkapi/com/sun/star/uno/XComponentContext";
import { Reference } from "../../../cppu/inc/com/sun/star/uno/Reference";
import { MemoryInputStream } from "../streaming/seqstream";
import { UNOMemoryStream } from "../streaming/memorystream";
import { ZipEntry } from "../../../package/inc/ZipEntry";
import { ZipOutputEntry } from "../../../package/source/zipapi/ZipOutputEntry";
beforeAll(initializeRuntime);
afterEach(releaseDomScope);
/** Original test fixture's concrete task pattern, with observable ordinary work and virtual destruction. No package/context/provider is fabricated. */
class CheckTask extends ThreadTask {
  /** Actual callback and destructor observer. @param tag - Original shared tag. @param work - Actual task operation. @param destroyed - Actual destruction callback. @returns Source task. */
  constructor(
    tag: ThreadTaskTag,
    private readonly work: () => void,
    private readonly destroyed: () => void = /** Original empty virtual destruction observer. @returns Nothing. */ () => {},
  ) {
    super(tag);
  }
  /** Original concrete work override. @returns Nothing. */
  protected override doWork(): void {
    this.work();
  }
  /** Original virtual task-member destruction binding. @returns Nothing. */
  override dispose(): void {
    this.destroyed();
    super.dispose();
  }
}
it("ports the original testNoThreads eight-task queue and calling-stack execution", /** Original explicit ThreadPool(0), eight pushed tasks, waitUntilDone sequence; no replacement default pool or synthetic worker identifier. @returns Nothing. */ () => {
  const pool = own(new ThreadPool(0)),
    tag = own(ThreadPool.createThreadTaskTag()),
    trace: number[] = [],
    realms: boolean[] = [],
    destroyed: number[] = [];
  const realm = globalThis;
  for (let i = 0; i < 8; ++i)
    pool.pushTask(
      new CheckTask(
        tag,
        /** Actual original no-worker operation. @returns Nothing. */ () => {
          realms.push(globalThis === realm);
          trace.push(i);
        },
        /** Source virtual destruction. @returns Nothing. */ () => {
          destroyed.push(i);
        },
      ),
    );
  expect(pool.getWorkerCount()).toBe(0);
  expect(pool.isIdle()).toBe(false);
  expect(ThreadPool.isTaskTagDone(tag)).toBe(false);
  expect(trace).toEqual([]);
  pool.waitUntilDone(tag);
  expect(trace).toEqual([0, 1, 2, 3, 4, 5, 6, 7]);
  expect(destroyed).toEqual(trace);
  expect(realms).toEqual([true, true, true, true, true, true, true, true]);
  expect(ThreadPool.isTaskTagDone(tag)).toBe(true);
  expect(pool.isIdle()).toBe(true);
  expect(pool.joinThreadsIfIdle()).toBe(true);
});
it("waits for the selected tag while preserving FIFO work from other tags and queued tail", /** Original pop order is queue-wide; selected completion alone controls the loop. @returns Nothing. */ () => {
  const pool = own(new ThreadPool(0)),
    a = own(ThreadPool.createThreadTaskTag()),
    b = own(ThreadPool.createThreadTaskTag()),
    trace: string[] = [];
  pool.pushTask(
    new CheckTask(
      b,
      /** Earlier other-tag work. @returns Nothing. */ () => {
        trace.push("b1");
      },
    ),
  );
  pool.pushTask(
    new CheckTask(
      a,
      /** Selected tag. @returns Nothing. */ () => {
        trace.push("a");
      },
    ),
  );
  pool.pushTask(
    new CheckTask(
      b,
      /** Later unrelated work. @returns Nothing. */ () => {
        trace.push("b2");
      },
    ),
  );
  expect(pool.joinThreadsIfIdle()).toBe(false);
  pool.waitUntilDone(a, true);
  expect(trace).toEqual(["b1", "a"]);
  expect(pool.isIdle()).toBe(false);
  expect(b.isDone()).toBe(false);
  pool.waitUntilDone(b);
  expect(trace).toEqual(["b1", "a", "b2"]);
  pool.shutdown();
  expect(pool.isIdle()).toBe(true);
});
it("does not drain unrelated work when waiting on an already complete tag", /** Original zero-count early return. @returns Nothing. */ () => {
  const pool = own(new ThreadPool(0)),
    complete = own(ThreadPool.createThreadTaskTag()),
    pending = own(ThreadPool.createThreadTaskTag()),
    trace: number[] = [];
  pool.pushTask(
    new CheckTask(
      pending,
      /** Actual queued work. @returns Nothing. */ () => {
        trace.push(1);
      },
    ),
  );
  pool.waitUntilDone(complete);
  expect(trace).toEqual([]);
  pool.shutdown();
  expect(trace).toEqual([1]);
  expect(pending.isDone()).toBe(true);
  pool.shutdown();
});
it("exec catches actual UNO and ordinary work exceptions and continues completing tasks", /** Source ThreadTask::exec catches all exception classes; no exception is turned into a successful fake work result. @returns Nothing. */ () => {
  const pool = own(new ThreadPool(0)),
    tag = own(ThreadPool.createThreadTaskTag()),
    trace: number[] = [];
  pool.pushTask(
    new CheckTask(
      tag,
      /** Actual generated UNO exception. @returns Never. */ () => {
        throw new RuntimeException(u("task"), own(new Reference()));
      },
    ),
  );
  pool.pushTask(
    new CheckTask(
      tag,
      /** Actual host exception ABI. @returns Never. */ () => {
        throw new Error("task");
      },
    ),
  );
  pool.pushTask(
    new CheckTask(
      tag,
      /** Subsequent real work. @returns Nothing. */ () => {
        trace.push(3);
      },
    ),
  );
  pool.waitUntilDone(tag);
  expect(trace).toEqual([3]);
  expect(tag.isDone()).toBe(true);
});
it("runs actual original ZIP compression as queued task work without a substitute IO graph", /** Genuine package compression/stream owners execute through the native explicit no-worker queue. This is not the production background ZipOutputEntryInThread task. @returns Nothing. */ () => {
  const pool = own(new ThreadPool(0)),
    tag = own(ThreadPool.createThreadTaskTag()),
    data = new TextEncoder().encode("queued ZIP 字😀"),
    input = own(new Reference(new MemoryInputStream(data, data.length))),
    output = own(new Reference(new UNOMemoryStream())),
    entry = own(new ZipEntry());
  entry.nFlag = 8;
  entry.nMethod = 8;
  entry.nSize = entry.nCompressedSize = -1n;
  entry.nCrc = -1;
  const compressor = own(
    new ZipOutputEntry(output, own(new Reference<XComponentContext>()), entry, null, false),
  );
  pool.pushTask(
    new CheckTask(
      tag,
      /** Actual source compressor work. @returns Nothing. */ () => {
        compressor.writeStream(input);
      },
    ),
  );
  pool.waitUntilDone(tag);
  const compressed = new Uint8Array(Number(output.operatorStar().getLength()));
  output.operatorStar().seek(0n);
  output.operatorStar().readSomeBytes(compressed, compressed.length);
  expect([...inflateRawSync(compressed)]).toEqual([...data]);
  expect(entry.nSize).toBe(BigInt(data.length));
  expect(entry.nCompressedSize).toBe(BigInt(compressed.length));
});
it("drains all tags on explicit shutdown and invokes original virtual task destructors", /** Source shutdown executes queued no-worker work regardless of selected tag. @returns Nothing. */ () => {
  const pool = own(new ThreadPool(0)),
    a = own(ThreadPool.createThreadTaskTag()),
    b = own(ThreadPool.createThreadTaskTag()),
    trace: string[] = [];
  pool.pushTask(
    new CheckTask(
      a,
      /** First work. @returns Nothing. */ () => {
        trace.push("a");
      },
      /** First destruction. @returns Nothing. */ () => {
        trace.push("destroy-a");
      },
    ),
  );
  pool.pushTask(
    new CheckTask(
      b,
      /** Second work. @returns Nothing. */ () => {
        trace.push("b");
      },
      /** Second destruction. @returns Nothing. */ () => {
        trace.push("destroy-b");
      },
    ),
  );
  pool.shutdown();
  expect(trace).toEqual(["a", "destroy-a", "b", "destroy-b"]);
  expect(a.isDone()).toBe(true);
  expect(b.isDone()).toBe(true);
  expect(pool.isIdle()).toBe(true);
});
it("does not substitute inline execution for an unavailable positive worker launch", /** Construction retains original limit; successful push remains unavailable until actual ThreadWorker exists. @returns Nothing. */ () => {
  const pool = own(new ThreadPool(4)),
    tag = own(ThreadPool.createThreadTaskTag()),
    task = own(
      new CheckTask(
        tag,
        /** This work must not be silently executed. @returns Never. */ () => {
          throw new Error("unexpected work");
        },
      ),
    );
  expect(pool.getWorkerCount()).toBe(4);
  expect(/** Actual launch boundary. @returns Nothing. */ () => pool.pushTask(task)).toThrow(
    "ThreadWorker launch",
  );
  expect(tag.isDone()).toBe(true);
  expect(pool.isIdle()).toBe(true);
  pool.shutdown();
});
it("keeps waiting for work owned by another pool explicitly unqualified", /** Source condition-variable wait cannot be replaced by premature completion. @returns Nothing. */ () => {
  const producer = own(new ThreadPool(0)),
    waiter = own(new ThreadPool(0)),
    tag = own(ThreadPool.createThreadTaskTag());
  let pending: boolean | undefined;
  producer.pushTask(
    new CheckTask(
      tag,
      /** Actual other-pool work. @returns Nothing. */ () => {
        pending = !tag.isDone();
      },
    ),
  );
  expect(
    /** Actual pending native wait boundary. @returns Nothing. */ () => waiter.waitUntilDone(tag),
  ).toThrow("condition-variable waiting");
  expect(tag.isDone()).toBe(false);
  producer.waitUntilDone(tag);
  expect(pending).toBe(true);
  waiter.waitUntilDone(tag);
  expect(tag.isDone()).toBe(true);
});

it("narrows the native wasm32 size_t worker limit to the original signed32 return", /** Original declaration returns sal_Int32 rather than the stored unsigned size_t. No worker is launched by construction. @returns Nothing. */ () => {
  const pool = own(new ThreadPool(0xffffffff));
  expect(pool.getWorkerCount()).toBe(-1);
  pool.shutdown();
});
