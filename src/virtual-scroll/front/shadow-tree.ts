/*
    Name: shadow-tree.ts
    Date: 09 Aug 2018
    Author: raduw
    Description: Shadow tree functionality
    Shadow trees are in memory representations of DOM tree .
    Shadow tree elements allways have a reference to a DOM element.
    The Shadow tree does not necessarily resemble the current DOM but typically a future desired DOM structure.

    Shadow trees are used to represent various forms of a document... modifying a document between different forms
    consists of bringing the DOM to the same shape as the Shadow Tree
*/

import * as R from 'ramda'
import {removeNodeChildren} from './html-util'
import {LegalDocNodeType, LifeHistory, StructTreeAttributes} from './struct-tree'
import {NodeIdPath} from './data-model'
import {MarkersClsName} from './fragment-dictionary'

//TODO move interfaces and other type defs to model

export enum ElementType { Undefined = '??-', Leaf = 'li-', Node = 'no-', Name = 'na-', Title = 'ti-', Lego='lg-'}



export interface ShadowTreeAttributes extends StructTreeAttributes {
  elmType?: ElementType
  isSelected?: boolean
}

export interface ShadowTree {
  readonly element: HTMLElement
  readonly id: string
  children?: ShadowTree[]
  readonly attributes: ShadowTreeAttributes
}

export type ShadowTreePtr = ShadowTree[]


export type ShadowTreePtrPredicate = (ptr: ShadowTreePtr | null) => boolean

/**
 * Updates the dom to match a shadow tree
 * @param {ShadowTree} root the shadowTree that should be reflected in the DOM
 *
 * A shadow tree specifies how existing elements should be positioned in the dom.
 * The function transforms the dom to match the shadow tree.
 */
export function toDom(root: ShadowTree | null | undefined) {

  if (!root)
    return

  const data = root.element['st']
  if (data === root) {
    return // the current shadow Tree already controls this element
  }

  root.element['st'] = root

  root.element.className = getClasses(root)

  if (!root.children)
    return

  if (root.children.length == 0) {
    removeNodeChildren(root.element)
    return
  }
  let domCursor: Node | null = root.element.firstChild
  let childCursor = 0
  const children = root.children

  while (domCursor || childCursor < children.length) {
    if (domCursor && domCursor.nodeType !== Node.ELEMENT_NODE) {
      //this should never happen on correctly formatted documents but just in case
      //remove any node that is not an Element
      const temp = domCursor
      domCursor = domCursor.nextSibling
      root.element.removeChild(temp)
      continue
    }
    const domElementCursor: HTMLElement | null = <HTMLElement | null> domCursor
    if ( domElementCursor && domElementCursor.classList.contains(MarkersClsName)){
      // leave node markers alone (they can be added / removed and will be ignored by the shadow tree)
      domCursor = domElementCursor.nextSibling
      continue
    }
    if (childCursor < children.length) {
      // we have a valid child cursor
      const currentChild = children[childCursor]
      if (!domElementCursor) {
        // we are at the end of the dom children append to root what is left from the shadow tree
        toDom(currentChild)
        root.element.appendChild(currentChild!.element)
        childCursor++
      }
      else {
        // we have both domCursor and childCursor pointing at valid elements
        if (domElementCursor === currentChild.element) {
          // we have a match advance both the dom cursor and the child cursor
          toDom(currentChild)
          domCursor = domElementCursor.nextSibling
          childCursor++
        }
        else if (elementInChildren(domElementCursor, children, childCursor)) {
          //our current element has a few other children that should come in front of it
          //place all the children up to and excluding itself in front
          while (childCursor < children.length && domElementCursor !== children[childCursor].element) {
            // append the children in front of the current element
            toDom(children[childCursor])
            root.element.insertBefore(children[childCursor].element, domElementCursor)
            childCursor++
          }
        }
        else {
          //the dom cursor is not in the children and should be removed from the dom
          domCursor = domElementCursor.nextSibling
          root.element.removeChild(domElementCursor)
        }
      }
    }
    else {
      //we are at the end of the shadow tree so anything left in the root children should be removed
      if (domCursor) {
        while (domCursor.nextSibling) {
          root.element.removeChild(domCursor.nextSibling)
        }
        root.element.removeChild(domCursor)
        domCursor = null
      }
    }
  }
}

/**
 * Gets the classes for a shadow tree
 * @param tree
 */
function getClasses(tree: ShadowTree | null): string {
  if (!tree)
    return ''

  const attrs = tree.attributes

  const nodeType = attrs.nodeType ? attrs.nodeType : ''
  const elmType = attrs.elmType ? attrs.elmType : ''
  const lifeHist: string = attrs.lifeHistory ? attrs.lifeHistory : LifeHistory.Original
  const isSelected: string = attrs.isSelected ? 'selected' : ''
  return `${nodeType} ${elmType} ${lifeHist} ${isSelected}`
}


/**
 * Check if elm is any of the children in the shadow tree starting at specified offset.
 *
 * Note: it will do a shallow search (no going inside the descendants of the children)
 * @param {HTMLElement} elm the element to be searched
 * @param {ShadowTree[]} children the children to be searched
 * @param {number} startOffset the first index in the children array to be searched
 */
function elementInChildren(elm: HTMLElement, children: ShadowTree[], startOffset: number) {
  const startIdx = Math.max(0, startOffset)
  for (let idx = 0; idx < children.length; ++idx) {
    if (elm === children[idx].element) {
      return true
    }
  }
  return false
}


/**
 * Tries to build a ShadowTree pointer for the expressed ShadowTree pointed by the current
 *
 * DOM element ( if the DOM element is not part of a ShadowTree it will return null
 * @param elm the element to check
 */
export function elementToShadowDomPtr(elm: Element | null): ShadowTreePtr | null {
  if (!elm)
    return null

  const retVal: ShadowTreePtr = []

  elementToShadowDomPtrInternal(elm, retVal)

  if (retVal.length < 1)
    return null

  return retVal

}


/**
 * Build a shadow tree pointer from an element by discovering the ShadowTree references from its html tree
 *
 * @param elm the element
 * @param acc internal accumulator where the shadowTree pointer is constructed
 */

function elementToShadowDomPtrInternal(elm: Element | null, acc: ShadowTreePtr): void {

  if (!elm || elm.classList.contains('shadow-tree-root'))
    return

  const shadowTree = elm['st']

  if (shadowTree) {
    acc.unshift(shadowTree)
  }

  elementToShadowDomPtrInternal(elm.parentElement, acc)

}

/**
 * Given a ShadowTree root and a path of node ids it builds the ShadowTreePtr to the specified path
 *
 * @param root the ShadowTree root
 * @param path the path of node ids in the ShadowTree
 * @return the ShadowTreePtr to the path, if found, or null
 */
export function nodeIdPathToPointer(root: ShadowTree | null, path: NodeIdPath | null): ShadowTreePtr | null {

  if (!root || !path || path.length < 1)
    return null

  if (root.id != path[0])
    return null


  let retVal = []
  const success = nodeIdPathToPointerInternal(root, path, retVal)
  return success ? retVal : null
}

function nodeIdPathToPointerInternal(root: ShadowTree, path: NodeIdPath, acc: ShadowTreePtr): boolean {
  acc.push(root)

  if (path.length === 1)
    return true // matched all path

  if (!root.children || root.children.length < 1)
    return false // path continues but we dont' have children

  const child = R.find((child) => child.id == path[1], root.children)

  if (! child)
    return false

  return nodeIdPathToPointerInternal( child, R.drop(1, path), acc)
}

export function pointerToNodeIdPath(ptr: ShadowTreePtr|null): NodeIdPath|null{
  if ( ! ptr)
    return null

  return R.map(elm=> elm.id, ptr)
}