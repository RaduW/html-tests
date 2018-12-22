/*
    Name: document-builder.ts
    Date: 07 Aug 2018
    Author: raduw
    Description: algorithms to build various document formats
*/


import {FragmentDictionary} from './fragment-dictionary'
import {StructTree, TreeNodeType} from './struct-tree'
import {ElementType, ShadowTree} from './shadow-tree'


/**
 * Builds a ShadowTree for a flat document.
 * A flat document has all nodes as siblings.
 * A node will have only Name,Title and Leaf elements as children
 *
 * @param {FragmentDictionary} elements | all the content elements possibly missing inner nodes (which will be constructed)
 * @param {StructTree} structure | the tree structure
 * @returns {ShadowTree|null} the constructed shadowTree or null if some error occurred
 *
 * In order to commit the shadowTree to DOM call {@link toDom}(tree)
 */
export function toFlatDocument(elements: FragmentDictionary, structure: StructTree): ShadowTree | null {
  if (!structure || structure.type !== TreeNodeType.Node)
    return null

  const node = elements.getOrCreate( structure.id)
  if (!node)
    return null

  return toFlatDocumentInternal(elements, structure, null)
}

function toFlatDocumentInternal(elements: FragmentDictionary, structure: StructTree, acc: ShadowTree | null): ShadowTree | null {
  if (!structure || structure.type !== TreeNodeType.Node)
    return acc

  const node = elements.getOrCreate(structure.id)
  if (!node)
    return acc

  const theNode: ShadowTree = {
    element: node,
    id: structure.id,
    attributes: structure.attributes,
    children: []
  }
  theNode.attributes.elmType = structTreeToElementType(structure)

  const retVal = acc ? acc : theNode

  if (acc) {
    if (!acc.children) {
      acc.children = []
    }
    acc.children.push(theNode)
  }

  if (node && structure.children) {
    for (const child of structure.children) {
      if (child.type == TreeNodeType.Name || child.type == TreeNodeType.Title
        || child.type == TreeNodeType.Leaf) {

        const domChild = elements.getOrCreate(child.id)
        if (domChild) {
          const shadowTreeChild: ShadowTree = {
            element: domChild,
            id: child.id,
            attributes: child.attributes
          }
          shadowTreeChild.attributes.elmType = structTreeToElementType(child)
          theNode.children!.push(shadowTreeChild)
        }
      }
      else {
        toFlatDocumentInternal(elements, child, retVal)
      }
    }
  }
  return retVal
}

/**
 * Creates a ShadowTree for a hierarchical document
 * @param {FragmentDictionary} elements | all the content elements possibly missing inner nodes (which will be constructed)
 * @param {StructTree} structure | the tree structure
 * @returns {ShadowTree|null} the constructed shadowTree or null if some error occurred
 *
 * In order to commit the shadowTree to DOM call {@link toDom}(tree)
 */
export function toHierarchicalDocument(elements: FragmentDictionary, structure: StructTree): ShadowTree | null {

  if (!structure)
    return null

  const node = elements.getOrCreate(structure.id)
  console.log('toHierarchicalDocument', node)
  if (!node)
    return null


  const theNode: ShadowTree = {
    element: node,
    id: structure.id,
    attributes: structure.attributes,
    children: structure.children ? [] : undefined
  }
  theNode.attributes.elmType = structTreeToElementType(structure)


  if (node && structure.children) {
    for (const child of structure.children) {
      const shadowTree = toHierarchicalDocument(elements, child)
      if (shadowTree) {
        theNode.children!.push(shadowTree)
      }
    }
  }

  if (structure.attributes.lejIds) {
    for (const lejId of structure.attributes.lejIds) {
      const legoDom = elements.get(lejId)
      if (legoDom) {
        const lego: ShadowTree = {
          element: legoDom,
          id: lejId,
          attributes: {
            elmType: ElementType.Lego
          }
        }
        if (!theNode.children) {
          theNode.children = []
        }
        theNode.children.push(lego)
      }
    }
  }

  return theNode
}


function structTreeToElementType(tree: StructTree): ElementType {
  switch (tree.type) {
    case TreeNodeType.Leaf:
      return ElementType.Leaf
    case TreeNodeType.Name:
      return ElementType.Name
    case TreeNodeType.Node:
      return ElementType.Node
    case TreeNodeType.Title:
      return ElementType.Title
    default:
      return ElementType.Undefined
  }
}