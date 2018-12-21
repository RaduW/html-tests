/*
    Name: shadow-tree-size.ts
    Date: 07 Sep 2018
    Author: raduw
    Description: a library that obtains the sizes of elements in a shadow tree

    OBSOLETE !!!
*/

/*
import {getChildren, toTree} from './shadow-tree-navigator'
import {ShadowTreePtr} from './shadow-tree'

export function getVisibleElements(root: ShadowTreePtr | null, parent: HTMLElement): ShadowTreePtr[] | null {
  if (!root || !parent)
    return null

  const retVal: ShadowTreePtr[] = []

  const parentRect = parent.getBoundingClientRect()
  const pTop = parentRect.top
  const pBot = parentRect.bottom
  getVisibleElementsInternal(root, pTop, pBot, retVal)
  return retVal
}


function getVisibleElementsInternal(root: ShadowTreePtr, parentTop: number,
                                    parentBottom: number, acc: ShadowTreePtr[]): void {

  const top = toTree(root)
  if (!top)
    return

  const boundingRect = top.element.getBoundingClientRect()

  if ((boundingRect.top > parentTop && boundingRect.top < parentBottom) ||  // top inside view
    (boundingRect.bottom > parentTop && boundingRect.bottom < parentBottom) || //bottom inside view
    (boundingRect.top < parentTop && boundingRect.bottom > parentBottom)) {  // view filled by elm
    acc.push(root)
    for( const child of getChildren(root)){
      getVisibleElementsInternal(child, parentTop, parentBottom, acc)
    }
  }
}
*/