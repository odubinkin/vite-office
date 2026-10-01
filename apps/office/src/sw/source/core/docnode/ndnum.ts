/** @fileoverview Owns the pinned ndnum.cxx sorted normal-document outline index without inline-heading adapters. */
import type { SwTextNode } from "../txtnode/ndtxt";

/** Maintains native document-index ordering and index-equivalent membership. */
export class SwOutlineNodes {
  private readonly nodes: SwTextNode[] = [];
  /** Finds the first index at least the candidate's index. @param node - Candidate paragraph. @returns Found state and insertion position. */
  public Seek_Entry(node: SwTextNode): Readonly<{ found: boolean; position: number }> {
    let first = 0;
    let last = this.nodes.length;
    while (first < last) {
      const middle = Math.floor((first + last) / 2);
      if ((this.nodes[middle] as SwTextNode).GetIndex() < node.GetIndex()) first = middle + 1;
      else last = middle;
    }
    return { found: this.nodes[first]?.GetIndex() === node.GetIndex(), position: first };
  }
  /** Tests native index-equivalent membership. @param node - Candidate. @returns Whether indexed. */
  public contains(node: SwTextNode): boolean {
    return this.Seek_Entry(node).found;
  }
  /** Inserts a paragraph once in document order. @param node - Connected paragraph. @returns Nothing. */
  public insert(node: SwTextNode): void {
    const entry = this.Seek_Entry(node);
    if (!entry.found) this.nodes.splice(entry.position, 0, node);
  }
  /** Erases a connected paragraph before index movement or removal. @param node - Removed paragraph. @returns Nothing. */
  public erase(node: SwTextNode): void {
    const entry = this.Seek_Entry(node);
    if (entry.found) this.nodes.splice(entry.position, 1);
  }
  /** Returns the source-owned ordered view. @returns Outline paragraphs. */
  public entries(): readonly SwTextNode[] {
    return this.nodes;
  }
}
