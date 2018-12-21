/*
    Name: html-util.ts
    Date: 08 Aug 2018
    Author: raduw
    Description: General html utility functions
*/


/**
 * Removes all children of a node
 * @param {Node | null | undefined} node the node to clear of all children
 */
export function removeNodeChildren(node: Node | null | undefined): void {
  if (!node)
    return

  while (node.firstChild) {
    node.removeChild(node.firstChild)
  }
}

/**
 * Removes all children of type Element of a node
 * @param {Node | null | undefined} node the node to clear of all Element children
 *
 * Note: As opposed to removeNodeChildren this function does not remove any Text (or any non Element) nodes.
 */
export function removeElementChildren(node: Node | null | undefined): void {
  if (!node)
    return

  //remove all elements up to the first non Element child
  while (node.firstChild && node.firstChild.nodeType === Node.ELEMENT_NODE) {
    node.removeChild(node.firstChild)
  }
  let cursor: Node | null  = node.firstChild

  while (cursor) {
    if (cursor.nextSibling && cursor.nextSibling.nodeType === Node.ELEMENT_NODE) {
      node.removeChild(cursor.nextSibling)
      continue
    }
    cursor = cursor.nextSibling
  }
}

/**
 * Sets the node content to a unique child ( if the child is already there it keeps it)
 * @param {Node | null | undefined} mountPoint the parent node
 * @param {Node | null | undefined} content the unique child node
 */
export function setUniqueNodeContent(mountPoint: Node | null | undefined, content: Node | null | undefined): void {
  if (!mountPoint) {
    return
  }

  if (!content) {
    removeNodeChildren(mountPoint)
    return
  }

  if (!mountPoint.contains(content)) {
    removeNodeChildren(mountPoint)
    mountPoint.appendChild(content)
    return
  }

  removeAllNodesBut(mountPoint, content)

}

function removeAllNodesBut(parent: Node | null | undefined, child: Node | null | undefined) {
  if (!parent)
    return

  if (!child) {
    removeNodeChildren(parent)
    return
  }

  //remove all elements before child
  while (parent.firstChild && parent.firstChild !== child) {
    parent.removeChild(parent.firstChild)
  }

  //remove elements after child
  while (child.nextSibling) {
    parent.removeChild(child.nextSibling)
  }
}