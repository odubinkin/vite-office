/** @fileoverview Consumed libc++ __tree/std::set insertion, balancing, iteration and value lifetime. Nodes are JS VM objects; actual value specializations retain RTL copy/destruction. Remaining STL APIs, native layout and debug assertions remain unbound. */
/** Compile-time value operations supplied by the actual element specialization. */
export interface SetValue<T> {
  compare(left: T, right: T): number;
  copy(value: T): T;
  destroy(value: T): void;
}
/** Original end node stores the root in its left link. */
class EndNode<T> {
  __left_: TreeNode<T> | null = null;
}
/** Original tree node links/color and contained value; the VM owns node storage. */
class TreeNode<T> extends EndNode<T> {
  __right_: TreeNode<T> | null = null;
  __is_black_ = false;
  /** Original leaf construction and element value initialization. @param __parent_ - Parent or end node. @param value - Copied contained value. @returns Tree node. */
  constructor(
    public __parent_: EndNode<T>,
    readonly value: T,
  ) {
    super();
  }
}
/** Original __tree_is_left_child. @param node - Non-end node. @returns Whether its parent links it on the left. */
function isLeftChild<T>(node: TreeNode<T>): boolean {
  return node.__parent_.__left_ === node;
}
/** Original __tree_left_rotate with the end node participating in root replacement. @param node - Subtree root with a right child. @returns Nothing. */
function leftRotate<T>(node: TreeNode<T>): void {
  const right = node.__right_ as TreeNode<T>;
  node.__right_ = right.__left_;
  if (node.__right_ !== null) node.__right_.__parent_ = node;
  right.__parent_ = node.__parent_;
  if (isLeftChild(node)) node.__parent_.__left_ = right;
  else (node.__parent_ as TreeNode<T>).__right_ = right;
  right.__left_ = node;
  node.__parent_ = right;
}
/** Original __tree_right_rotate with the end-node root link. @param node - Subtree root with a left child. @returns Nothing. */
function rightRotate<T>(node: TreeNode<T>): void {
  const left = node.__left_ as TreeNode<T>;
  node.__left_ = left.__right_;
  if (node.__left_ !== null) node.__left_.__parent_ = node;
  left.__parent_ = node.__parent_;
  if (isLeftChild(node)) node.__parent_.__left_ = left;
  else (node.__parent_ as TreeNode<T>).__right_ = left;
  left.__right_ = node;
  node.__parent_ = left;
}
/** Original __tree_balance_after_insert; rotations and recoloring follow the pinned SDK libc++ source. @param root - Original root after linking the leaf. @param node - Newly linked leaf. @returns Nothing. */
function balanceAfterInsert<T>(root: TreeNode<T>, node: TreeNode<T>): void {
  node.__is_black_ = node === root;
  while (node !== root && !(node.__parent_ as TreeNode<T>).__is_black_) {
    if (isLeftChild(node.__parent_ as TreeNode<T>)) {
      const uncle = ((node.__parent_ as TreeNode<T>).__parent_ as TreeNode<T>).__right_;
      if (uncle !== null && !uncle.__is_black_) {
        node = node.__parent_ as TreeNode<T>;
        node.__is_black_ = true;
        node = node.__parent_ as TreeNode<T>;
        node.__is_black_ = node === root;
        uncle.__is_black_ = true;
      } else {
        if (!isLeftChild(node)) {
          node = node.__parent_ as TreeNode<T>;
          leftRotate(node);
        }
        node = node.__parent_ as TreeNode<T>;
        node.__is_black_ = true;
        node = node.__parent_ as TreeNode<T>;
        node.__is_black_ = false;
        rightRotate(node);
        break;
      }
    } else {
      const uncle = (node.__parent_ as TreeNode<T>).__parent_.__left_;
      if (uncle !== null && !uncle.__is_black_) {
        node = node.__parent_ as TreeNode<T>;
        node.__is_black_ = true;
        node = node.__parent_ as TreeNode<T>;
        node.__is_black_ = node === root;
        uncle.__is_black_ = true;
      } else {
        if (isLeftChild(node)) {
          node = node.__parent_ as TreeNode<T>;
          rightRotate(node);
        }
        node = node.__parent_ as TreeNode<T>;
        node.__is_black_ = true;
        node = node.__parent_ as TreeNode<T>;
        node.__is_black_ = false;
        leftRotate(node);
        break;
      }
    }
  }
}
/** Consumed original ordered unique tree contract, with end/begin pointers and source balancing. */
export class Set<T> implements Iterable<T> {
  private readonly __end_node_ = new EndNode<T>();
  private __begin_node_: EndNode<T> = this.__end_node_;
  private __size_ = 0;
  /** Binds the actual comparator and value specialization. @param valueType - Original element operations. @returns Empty set. */
  constructor(private readonly valueType: SetValue<T>) {}
  /** Original unique search, copied leaf construction, begin update and balance; returns the consumed insertion-success part of the source pair. @param value - Borrowed source value. @returns Whether insertion occurred. */
  insert(value: T): boolean {
    let parent: EndNode<T> = this.__end_node_,
      current = this.__end_node_.__left_,
      left = true;
    while (current !== null) {
      const comparison = this.valueType.compare(value, current.value);
      if (comparison === 0) return false;
      parent = current;
      left = comparison < 0;
      current = left ? current.__left_ : current.__right_;
    }
    const node = new TreeNode(parent, this.valueType.copy(value));
    if (left) parent.__left_ = node;
    else (parent as TreeNode<T>).__right_ = node;
    if (this.__begin_node_.__left_ !== null) this.__begin_node_ = this.__begin_node_.__left_;
    balanceAfterInsert(this.__end_node_.__left_ as TreeNode<T>, node);
    ++this.__size_;
    return true;
  }
  /** Original element count. @returns Number of contained values. */
  size(): number {
    return this.__size_;
  }
  /** Captures the original begin node when iteration is requested. @returns Borrowed ordered iterator. */
  [Symbol.iterator](): Iterator<T> {
    return this.iterate(this.__begin_node_);
  }
  /** Original tree iterator increment through right-subtree minimum or parent links. @param cursor - Captured node or end. @returns Borrowed ordered values. */
  private *iterate(cursor: EndNode<T>): IterableIterator<T> {
    while (cursor !== this.__end_node_) {
      let node = cursor as TreeNode<T>;
      yield node.value;
      if (node.__right_ !== null) {
        node = node.__right_;
        while (node.__left_ !== null) node = node.__left_;
        cursor = node;
      } else {
        while (!isLeftChild(node)) node = node.__parent_ as TreeNode<T>;
        cursor = node.__parent_;
      }
    }
  }
  /** Original left/right/element destruction order. @param node - Subtree root or null. @returns Nothing. */
  private destroy(node: TreeNode<T> | null): void {
    if (node !== null) {
      this.destroy(node.__left_);
      this.destroy(node.__right_);
      this.valueType.destroy(node.value);
    }
  }
  /** Original clear destroys the tree and resets begin/root/size. @returns Nothing. */
  clear(): void {
    this.destroy(this.__end_node_.__left_);
    this.__begin_node_ = this.__end_node_;
    this.__end_node_.__left_ = null;
    this.__size_ = 0;
  }
  /** Original container destructor releases logical RTL values; VM reclaims nodes. @returns Nothing. */
  dispose(): void {
    this.clear();
  }
}

/*! Tree algorithms derived from libc++ __tree, part of the LLVM Project.
 * Apache License v2.0 with LLVM Exceptions; see https://llvm.org/LICENSE.txt.
 * SPDX-License-Identifier: Apache-2.0 WITH LLVM-exception
 */
