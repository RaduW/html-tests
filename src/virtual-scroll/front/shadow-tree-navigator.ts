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
export function toTree(ptr: ShadowTreePtr | null): ShadowTree | null {
  if (ptr && ptr.length > 0)
    return ptr[ptr.length - 1]
  return null
}

export function getRoot(ptr: ShadowTreePtr | null): ShadowTree | null {
  if (ptr && ptr.length > 0)
    return ptr[0]
  return null
}

export function getParent(ptr: ShadowTreePtr | null): ShadowTreePtr | null {
  if (!ptr || ptr.length < 2)
    return null

  return R.dropLast(1, ptr)
}

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

export function getFirst(tree: ShadowTree | null): ShadowTreePtr | null {
  if (!tree)
    return null
  return [tree]
}

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

export function getNextPred(current: ShadowTreePtr | null, pred: TreePredicate, childrenPred: TreePredicate = truePred): ShadowTreePtr | null {

  let nextPtr = getNext(current, childrenPred)
  while (nextPtr && !pred(toTree(nextPtr))) {
    nextPtr = getNext(nextPtr, childrenPred)
  }
  return nextPtr
}

export function getPreviousPred(current: ShadowTreePtr | null, pred: TreePredicate, childrenPred: TreePredicate = truePred): ShadowTreePtr | null {
  let perviousPtr = getPrevious(current, childrenPred)
  while (perviousPtr && !pred(toTree(perviousPtr))) {
    perviousPtr = getPrevious(perviousPtr, childrenPred)
  }
  return perviousPtr
}