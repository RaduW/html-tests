/*
    Name: shadow-tree-transforms.ts
    Date: 10 Sep 2018
    Author: raduw
    Description: Utilities to transform shadow trees

    OBSOLETE --- not used anymore
*/


import * as R from 'ramda'
import {getChildIdx} from './shadow-tree-navigator'
import {ShadowTree, ShadowTreeAttributes, ShadowTreePtr} from './shadow-tree'
import {logError} from './logging'

export function setAttributes(ptr: ShadowTreePtr, attributes: ShadowTreeAttributes): ShadowTreePtr {
  const originalElm = ptr[ptr.length - 1]
  const newElm: ShadowTree = {...originalElm, attributes}
  return changeChild(ptr, newElm)
}


/**
 * Changes the child in the tree (maintaining the rest of the structure
 * @param ptr  pointer to the child
 * @param newChild the new child
 * @returns the new path to the new child
 *    take the top (i.e. elm[0]) to get the newly created tree
 *    the last elm ( ie. elm[elm.length-1]) is the inserted child
 */
export function changeChild(ptr: ShadowTreePtr, newChild: ShadowTree): ShadowTreePtr {

  if (ptr.length === 0) {
    logError('shadow-tree-transforms/changeChild called with empty pointer')
    return ptr
  }

  if (ptr.length == 1) {
    return [newChild]
  }

  const root = ptr[0]
  const child = ptr[1]

  const position = getChildIdx([root, child])

  if (position === null) {
    logError('shadow-tree-transforms/changeChild called with invalid pointer')
    return ptr
  }
  const newChildPtr = changeChild(R.drop(1, ptr), newChild)
  const newChildren = R.update(position, newChildPtr[0], root.children!)
  const newElm: ShadowTree = {...root, children: newChildren}
  return R.prepend(newElm, newChildPtr)
}


