/** @fileoverview Replays the complete whole native managed owner stream, including distinct pointer and pointee equality, actual lifetime ordering and unsupported copy/clone errors. */
import { expect, it } from "vitest";
import fixture from "./native-managed-block-cases.json";
import { get_block_type, type element_block } from "./types.ts";
import { managed_element_block, noncopyable_managed_element_block } from "./types.ts";
import { delayed_delete_vector } from "./delayed_delete_vector.ts";
/** Replays every native initialized ownership operation. @returns Complete native stream. */
function replay(): string {
  const output: string[] = [];
  let seq = 0;
  const live = new Map<number, V>();
  /** Native caller ValueT, with observable copy constructor and delete/equality operators. */
  class V {
    public readonly id = ++seq;
    /** Original caller allocation. @param value - Value. @param source - Native copy source. @returns Pointee. */
    public constructor(
      public value: number,
      source?: V,
    ) {
      live.set(this.id, this);
      output.push(source ? `copy ${source.id} ${this.id} ${value}` : `new ${this.id} ${value}`);
    }
    /** Original caller delete; valid inputs never double-delete. @returns Nothing. */
    public dispose(): void {
      output.push(`delete ${this.id} ${this.value}`);
      expect(live.delete(this.id)).toBe(true);
    }
  }
  const ops = {
    /** Original pointee delete. @param value - Pointer. @returns Nothing. */
    delete(value: V): void {
      value.dispose();
    },
    /** Original pointee equality. @param left - Left. @param right - Right. @returns Equality. */
    equal(left: V, right: V): boolean {
      return left.value === right.value;
    },
    /** Original copy construction. @param value - Source. @returns New pointee. */
    copy_construct(value: V): V {
      return new V(value.value, value);
    },
  };
  const M = managed_element_block(55, { delete: ops.delete, copy_construct: ops.copy_construct });
  const N = noncopyable_managed_element_block(56, ops);
  const C = noncopyable_managed_element_block(
    57,
    ops,
    /** Original native clone_value specialization. @param value - Defined nonnull source. @returns Clone. */
    (value: V | null): V => {
      const source = value as V;
      output.push(`clone ${source.id}`);
      return new V(source.value);
    },
  );
  /** Complete native observation of the public owner. @param label - Observer. @param Block - Static specialization. @param block - Owner. @returns Nothing. */
  function snap(
    label: string,
    Block: typeof M | typeof N | typeof C,
    block: element_block<V | null>,
  ): void {
    let text = `${label} ${get_block_type(block)} ${Block.size(block)} ${Block.capacity(block)}`;
    for (const i = block.store().begin(), end = block.store().end(); !i.equals(end); i.advance(1)) {
      const value = i.get();
      text += ` ${value?.id ?? 0}:${value?.value ?? 0}`;
    }
    output.push(text);
  }
  for (let n = 0; n <= 6; ++n)
    for (const Block of [M, N, C]) {
      seq = 0;
      output.push(`case ${Block.block_type} ${n}`);
      const empty = new Block();
      snap("default", Block, empty);
      Block.delete_block(null);
      for (let size = 0; size <= 3; ++size) {
        const value = new V(size + 10);
        try {
          const block = Block.create_block_with_value(size, value);
          snap("fill", Block, block);
          Block.delete_block(block);
        } catch (error) {
          output.push("error " + (error as Error).message);
        }
      }
      const nullblock = Block.create_block_with_value(1, null);
      Block.delete_block(nullblock);
      const operations: {
        copy_block(source: element_block<V | null>): element_block<V | null>;
        clone_block(source: element_block<V | null>): element_block<V | null>;
      } = Block;
      const b = Block.create_block(n);
      for (let i = 0; i < n; ++i) Block.set_value(b, i, new V(i % 3));
      Block.reserve(b, n + 9);
      snap("count", Block, b);
      Block.erase_values(b, 0, Math.min(n, 2));
      snap("front", Block, b);
      try {
        const c = operations.copy_block(b);
        snap("copy", Block, c);
        output.push("eq " + Number(Block.equal_block(b, c)));
        Block.delete_block(c);
      } catch (error) {
        output.push("error " + (error as Error).message);
      }
      try {
        const c = operations.clone_block(b);
        snap("cloned", Block, c);
        output.push("eq " + Number(Block.equal_block(b, c)));
        Block.delete_block(c);
      } catch (error) {
        output.push("error " + (error as Error).message);
      }
      if (Block === M) {
        const c = M.create_block_with_value(1, new V(90));
        c.copy_assign(b as InstanceType<typeof M>);
        snap("assigned", Block, c);
        output.push("eq " + Number(Block.equal_block(b, c)));
        Block.resize_block(b, 0);
        Block.delete_block(c);
      } else {
        const c = Block.create_block(Block.size(b));
        for (let i = 0; i < Block.size(b); ++i)
          Block.set_value(c, i, new V((Block.get_value(b, i) as V).value));
        output.push("eq " + Number(Block.equal_block(b, c)));
        if (Block.size(c)) {
          (Block.get_value(c, 0) as V).value = 100;
          output.push("eq " + Number(Block.equal_block(b, c)));
        }
        Block.resize_block(c, Block.size(c) + 1);
        output.push("eq " + Number(Block.equal_block(b, c)));
        Block.delete_block(c);
      }
      if (Block.size(b)) {
        Block.overwrite_values(b, 0, 1);
        Block.set_value(b, 0, null);
        Block.overwrite_values(b, 0, 1);
        snap("overwrite", Block, b);
      }
      Block.overwrite_values(b, 0, 0);
      Block.delete_block(b);
      const input = new delayed_delete_vector<V | null>(null);
      for (let i = 0; i < n; ++i) input.push_back(new V(20 + i));
      const r = Block.create_block_with_values(input.begin(), input.end());
      snap("range", Block, r);
      Block.delete_block(r);
      while (live.size) (live.values().next().value as V).dispose();
      output.push("end " + live.size);
    }
  return output.join("\n") + "\n";
}
it("matches every complete original managed pointer ownership stream" /** Retains whole initialized normal/ASan native outputs. @returns Nothing. */, () => {
  expect(replay()).toBe(fixture.output);
});
