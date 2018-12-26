/*
    Name: shadow-tree-navigator.ts
    Date: 05 Sep 2018
    Author: raduw
    Description: implements navigation operations on ShadowTree
*/

import * as R from 'ramda'
import {ShadowTree, ShadowTreePtr} from './shadow-tree'

export type TreePredicate = (elm: ShadowTree | null | undefined) => boolean

const truePred = (_) => true

// Pointer functions
/**
 * Creates a pointer from the root tree 
 * NOTE: creating a pointer form a node that is not at the root will NOT enable
 * navigation above the node (it will be a pointer in the subtree with the root at
 * the passed node)
 * 
 * @param root the root of the tree
 */
export function toPointer(root:ShadowTree|null): ShadowTreePtr | null {
  if ( !root)
    return null
  return [root]
}

/**
 * Returns the tree a path points to (i.e. the last shadowTree in the path)
 * @param ptr the shadow tree pointer
 */
export function toTree(ptr: ShadowTreePtr | null): ShadowTree | null {
  if (ptr && ptr.length > 0)
    return ptr[ptr.length - 1]
  return null
}

/**
 * Returns the root tree of a path (i.e. the first shadowTre in the path)
 * @param ptr the shadow tree pointer
 */
export function getRoot(ptr: ShadowTreePtr | null): ShadowTree | null {
  if (ptr && ptr.length > 0)
    return ptr[0]
  return null
}

/**
 * Returns a path to the parent of a pointer (i.e. drops the last element of a path)
 * @param ptr the shadow tree pointer
 */
export function getParent(ptr: ShadowTreePtr | null): ShadowTreePtr | null {
  if (!ptr || ptr.length < 2)
    return null

  return R.dropLast(1, ptr)
}


/**
 * Returns a path to the n'th child of the element pointed to by the current path
 * @param ptr the shadow tree pointer
 * @param idx the index of the child
 */
export function getNthChild(ptr: ShadowTreePtr | null, idx: number): ShadowTreePtr | null {
  if (!ptr)
    return null

  const top = toTree(ptr)
  if (!top || !top.children || top.children.length <= idx) {
    return null
  }
  const parent = toTree(ptr)
  if (!parent)
    return null

  return R.append(top.children[idx], ptr)
}

/**
 * returns the index of a shadow tree element relative to its parent
 * @param ptr the shadow tree pointer
 */
export function getChildIdx(ptr: ShadowTreePtr | null): number | null {
  if (!ptr || ptr.length < 2) {
    return null
  }

  const top = toTree(ptr)
  const parent = toTree(getParent(ptr))

  if (parent && parent.children && top) {
    const idx = R.findIndex(x => x === top, parent.children)
    if (idx != -1)
      return idx
  }
  return null
}

/**
 * Returns a pointer the first element in document order (it is the tree itself)
 * @param tree the shadow tree pointer
 */
export function getFirst(tree: ShadowTree | null): ShadowTreePtr | null {
  if (!tree)
    return null
  return [tree]
}

/**
 * Returns a pointer to the last element in document order (the right most leaf)
 * @param tree the shadow tree pointer
 */
export function getLast(tree: ShadowTree | null): ShadowTreePtr | null {
  if (!tree)
    return null

  if (!tree.children || tree.children.length === 0)
    return [tree]

  const retVal = getLast(tree.children[tree.children.length - 1])
  if (retVal != null)
    return R.prepend(tree, retVal)
  return [tree]
}


// Navigation
/**
 * Returns a list of pointers to all children of a shadow tree
 * @param current the shadow tree
 */
export function getChildren(current: ShadowTreePtr | null): ShadowTreePtr[] {
  const retVal: ShadowTreePtr[] = []
  if (current) {
    const top = toTree(current)
    if (top && top.children) {
      for (const child of top.children) {
        retVal.push(R.append(child, current))
      }
    }
  }
  return retVal
}

/**
 * Returns the next element in document order (will only search children of a node if childrenPredicate returns true)
 * @param current the current element
 * @param childrenPred predicate that controls whether children are searched or not
 */
export function getNext(current: ShadowTreePtr | null, childrenPred: TreePredicate = truePred): ShadowTreePtr | null {

  if (childrenPred(toTree(current))) {
    //we are allowed to search the children of the current node
    const nextDownPtr = getNextDown(current)

    if (nextDownPtr)
      return nextDownPtr
  }

  return getNextUp(current)
}

function getNextDown(current: ShadowTreePtr | null): ShadowTreePtr | null {

  if (!current)
    return null

  const top = toTree(current)

  if (!top || !top.children || top.children.length < 1)
    return null

  return R.append(top.children[0], current)
}

function getNextUp(current: ShadowTreePtr | null): ShadowTreePtr | null {
  if (!current)
    return null

  const idx = getChildIdx(current)

  if (idx === null)
    return null

  const parentPtr = getParent(current)
  const parentTree = toTree(parentPtr)

  if (parentTree && parentTree.children && parentTree.children.length > idx + 1)
    return getNthChild(parentPtr, idx + 1)

  return getNextUp(parentPtr)
}

/**
 * Returns the previous element in document order (will only search children of a node if childrenPredicate returns true)
 * @param current the current element
 * @param childrenPred predicate that controls whether children are searched or not
 */
export function getPrevious(current: ShadowTreePtr | null, childrenPred: TreePredicate = truePred): ShadowTreePtr | null {
  if (!current)
    return null

  const idx = getChildIdx(current)

  if (idx !== null && idx > 0) {
    const parentPtr = getParent(current)
    return rightMostChild(getNthChild(parentPtr, idx - 1), childrenPred)

  }
  return getParent(current)
}

function rightMostChild(current: ShadowTreePtr | null, childrenPred: TreePredicate): ShadowTreePtr | null {

  const top = toTree(current)

  if (!top)
    return null // should never happen

  if (!top.children || top.children.length === 0 || ! childrenPred(top))
    return current // no children or we are not allowed to go into children ,we are the right most child

  return rightMostChild(getNthChild(current, top.children.length - 1), childrenPred)
}

/**
 * Returns the first element (in document order) after the current element that satisfies the predicate. It will only
 * search the children of a node if childrenPred returns true.
 * @param current the current element (search starts here)
 * @param pred the predicate an element needs to satisfy in order to be returned
 * @param childrenPred the predicate an element needs to satisfy in order to have its children searched
 */
export function getNextPred(current: ShadowTreePtr | null, pred: TreePredicate, childrenPred: TreePredicate = truePred): ShadowTreePtr | null {

  let nextPtr = getNext(current, childrenPred)
  while (nextPtr && !pred(toTree(nextPtr))) {
    nextPtr = getNext(nextPtr, childrenPred)
  }
  return nextPtr
}

/**
 * Returns the first element (in document order) before the current element that satisfies the predicate. It will only
 * search the children of a node if childrenPred returns true.
 * @param current the current element (search starts here)
 * @param pred the predicate an element needs to satisfy in order to be returned
 * @param childrenPred the predicate an element needs to satisfy in order to have its children searched
 */
export function getPreviousPred(current: ShadowTreePtr | null, pred: TreePredicate, childrenPred: TreePredicate = truePred): ShadowTreePtr | null {
  let perviousPtr = getPrevious(current, childrenPred)
  while (perviousPtr && !pred(toTree(perviousPtr))) {
    perviousPtr = getPrevious(perviousPtr, childrenPred)
  }
  return perviousPtr
}