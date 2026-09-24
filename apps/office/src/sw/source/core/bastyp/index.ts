/**
 * @fileoverview Implements registered Writer content indices from pinned LibreOffice
 * `sw/inc/contentindex.hxx` and `sw/source/core/bastyp/index.cxx`.
 */

import type { SwContentNode } from "../docnode/node";

/** Identifies the bounded model object that owns one live content position. */
export type SwContentIndexOwnerKind = "anchor" | "cursor" | "mark" | "redline";

/** Controls whether a position exactly at an inserted/split boundary stays before or follows it. */
export type SwContentIndexAffinity = "after" | "before";

/** Flags matching the update modes used by LibreOffice's SwContentIndexReg. */
export const enum SwContentIndexUpdateMode {
  Default = 0,
  Negative = 1,
  Delete = 2,
  Replace = 4,
}

/** One node-owned registry of weakly retained live content indices. */
export abstract class SwContentIndexRegistry {
  private readonly indexReferences = new Set<WeakRef<SwContentIndex>>();
  private readonly referencesByIndex = new WeakMap<SwContentIndex, WeakRef<SwContentIndex>>();

  /** Registers one content index without making the registry its lifetime owner. @param index - Attached index. @returns Nothing. */
  public RegisterContentIndex(index: SwContentIndex): void {
    if (this.referencesByIndex.has(index)) return;
    const reference = new WeakRef(index);
    this.referencesByIndex.set(index, reference);
    this.indexReferences.add(reference);
  }

  /** Detaches one content index from this registry. @param index - Detached index. @returns Nothing. */
  public UnregisterContentIndex(index: SwContentIndex): void {
    const reference = this.referencesByIndex.get(index);
    if (reference === undefined) return;
    this.referencesByIndex.delete(index);
    this.indexReferences.delete(reference);
  }

  /** Reports whether at least one live content index remains registered. @returns True for a non-empty live registry. */
  public HasAnyContentIndex(): boolean {
    return this.GetContentIndices().length > 0;
  }

  /**
   * Applies the bounded upstream insertion/deletion update algorithm.
   * @param position - Edit boundary in the pre-edit coordinate space.
   * @param changeLength - Positive inserted or removed UTF-16 length.
   * @param mode - Upstream-compatible update flags.
   * @returns Nothing.
   */
  public UpdateContentIndices(
    position: number,
    changeLength: number,
    mode: SwContentIndexUpdateMode = SwContentIndexUpdateMode.Default,
  ): void {
    if (!Number.isInteger(position) || position < 0)
      throw new Error("SwContentIndex update position must be a non-negative integer.");
    if (!Number.isInteger(changeLength) || changeLength < 0)
      throw new Error("SwContentIndex update length must be a non-negative integer.");
    if (changeLength === 0) return;
    const indices = this.GetContentIndices();
    if ((mode & SwContentIndexUpdateMode.Negative) !== 0) {
      const end = position + changeLength;
      for (const index of indices) {
        const current = index.GetIndex();
        if (current > position && current <= end) index.SetIndexFromRegistry(position);
        else if (current > end) index.SetIndexFromRegistry(current - changeLength);
      }
      return;
    }
    for (const index of indices) {
      const current = index.GetIndex();
      if (current > position || (current === position && index.GetAffinity() === "after"))
        index.SetIndexFromRegistry(current + changeLength);
    }
  }

  /** Moves every registered index to another content node with an added offset. @param target - Destination registry/node. @param offset - Destination prefix length. @returns Nothing. */
  public MoveAllContentIndicesTo(target: SwContentNode, offset = 0): void {
    if (Object.is(target, this)) return;
    for (const index of this.GetContentIndices())
      index.AssignFromRegistry(target, offset + index.GetIndex());
  }

  /** Collapses every registered index to one deterministic replacement boundary. @param target - Surviving node. @param offset - Surviving boundary. @returns Nothing. */
  public CollapseContentIndicesTo(target: SwContentNode, offset: number): void {
    for (const index of this.GetContentIndices()) index.AssignFromRegistry(target, offset);
  }

  /** Moves the suffix at and after a split boundary to another node. @param target - Trailing node. @param start - Split position. @param targetOffset - Destination start offset. @returns Nothing. */
  public MoveContentIndicesFrom(target: SwContentNode, start: number, targetOffset = 0): void {
    for (const index of this.GetContentIndices()) {
      const current = index.GetIndex();
      if (current > start || (current === start && index.GetAffinity() === "after"))
        index.AssignFromRegistry(target, targetOffset + current - start);
    }
  }

  /** Returns a stable list of live indices and removes dead weak references. @returns Live indices. */
  private GetContentIndices(): readonly SwContentIndex[] {
    const indices: SwContentIndex[] = [];
    for (const reference of this.indexReferences) {
      const index = reference.deref();
      /* v8 ignore next -- WeakRef collection timing cannot be made deterministic in unit tests. */
      if (index === undefined) this.indexReferences.delete(reference);
      else indices.push(index);
    }
    return indices;
  }
}

/** One registered UTF-16 position inside an SwContentNode. */
export class SwContentIndex {
  private contentNode: SwContentNode | undefined;
  private index = 0;

  /** Creates and registers a bounded Writer content index. @param node - Content node. @param index - Initial offset. @param ownerKind - Owner category. @param affinity - Boundary affinity. @param onNodeChanged - Optional transfer callback. @returns Nothing. */
  public constructor(
    node: SwContentNode,
    index = 0,
    private ownerKind: SwContentIndexOwnerKind = "cursor",
    private affinity: SwContentIndexAffinity = "after",
    private readonly onNodeChanged?: (node: SwContentNode) => void,
  ) {
    this.Assign(node, index);
  }

  /** Returns the owning content node. @returns Registered content node. */
  public GetContentNode(): SwContentNode {
    if (this.contentNode === undefined) throw new Error("SwContentIndex is disposed.");
    return this.contentNode;
  }

  /** Returns the UTF-16 content offset. @returns Current offset. */
  public GetIndex(): number {
    return this.index;
  }

  /** Returns the model owner category used by correction policy. @returns Owner kind. */
  public GetOwnerKind(): SwContentIndexOwnerKind {
    return this.ownerKind;
  }

  /** Changes the model owner category. @param kind - New bounded owner kind. @returns Nothing. */
  public SetOwnerKind(kind: SwContentIndexOwnerKind): void {
    this.ownerKind = kind;
  }

  /** Returns the boundary affinity. @returns Before/after affinity. */
  public GetAffinity(): SwContentIndexAffinity {
    return this.affinity;
  }

  /** Changes boundary affinity for future edits. @param affinity - New affinity. @returns Nothing. */
  public SetAffinity(affinity: SwContentIndexAffinity): void {
    this.affinity = affinity;
  }

  /** Reassigns this index to a validated node/offset pair. @param node - Destination node. @param index - Destination offset. @returns This index. */
  public Assign(node: SwContentNode, index: number): this {
    if (!Number.isInteger(index) || index < 0 || index > node.Len())
      throw new Error("SwContentIndex offset is outside its node.");
    this.AssignFromRegistry(node, index);
    return this;
  }

  /** Explicitly unregisters an index whose owner is being disposed. @returns Nothing. */
  public Dispose(): void {
    this.contentNode?.UnregisterContentIndex(this);
    this.contentNode = undefined;
    this.index = 0;
  }

  /** Registry-only offset update after the owning text has already changed. @param index - Corrected offset. @returns Nothing. */
  public SetIndexFromRegistry(index: number): void {
    this.index = index;
  }

  /** Registry-only node transfer used by split/merge/removal. @param node - Destination node. @param index - Corrected destination offset. @returns Nothing. */
  public AssignFromRegistry(node: SwContentNode, index: number): void {
    if (this.contentNode !== node) {
      this.contentNode?.UnregisterContentIndex(this);
      this.contentNode = node;
      node.RegisterContentIndex(this);
      this.onNodeChanged?.(node);
    }
    this.index = index;
  }
}
