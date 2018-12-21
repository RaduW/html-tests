/*
    Name: struct-tree-util.ts
    Date: 31 Oct 2018
    Author: raduw
    Description: utilities for StructTree
*/


import {NodeIdPath} from './data-model'
import {LifeHistory, StructTree, TreeNodeType} from './struct-tree'
import * as R from 'ramda'
import {logError} from './logging'

/**
 * Converts a tree of legalIds to a tree of node ids
 * @param structTree the struct tree
 * @param legalIdTree the legalId tree ( for example modifPaths)
 *
 * It will translate something like:
 * {doc-: {cap-i: {art-1: true, art-2: true}, cap-ii: {art-3: true, art-4: true}}}
 * to something like
 * {1334: {11347: {41234: true, 42314: true}, 478934: {43882: true, 97332: true}}}
 *
 */
export function legalIdTreeToNodeIdTree(structTree?: StructTree | null, legalIdTree?: object | null): object | null {
  if (!structTree || !legalIdTree)
    return null

  const allKeys = R.keys(legalIdTree)

  if (allKeys.length !== 1) {
    logError('legalIdTreeToNodeIdTree(), invalid structure, doc root not unique')
    return null
  }

  const key: string = allKeys[0]

  if (nodeHasLegalId(key, structTree)) {
    const retVal: object = {}
    retVal[structTree.id] = legalIdTreeToNodeIdTreeInternal(structTree, legalIdTree[key])
    return retVal
  }

  return null
}

function legalIdTreeToNodeIdTreeInternal(structTree: StructTree, legalIdTree: object): object | true {
  if (!structTree.children || structTree.children.length < 1)
    return true

  const retVal = {}


  for (const legalId of R.keys(legalIdTree)) {
    const nodes = R.filter(st => nodeHasLegalId(legalId, st), structTree.children)
    for (const node of nodes) {
      const childLegalIdTree: object | true = legalIdTree[legalId]
      if (typeof(childLegalIdTree) === 'object')
        retVal[node.id] = legalIdTreeToNodeIdTreeInternal(node, childLegalIdTree)
      else
        retVal[node.id] = true
    }
  }

  if (R.isEmpty(retVal))
    return true
  return retVal
}

export function nodeIdPathToLegalIdPath(structTree?: StructTree | null, nodePath?: NodeIdPath | null): { legalIdPath: string | null, isComplete: boolean } {

  if (!structTree || !nodePath || nodePath.length < 1) {
    return {legalIdPath: null, isComplete: false}
  }

  const firstPath = nodePath[0]

  if ( firstPath !== structTree.id){
    // not matching starting at root
    return {legalIdPath: null, isComplete: false}
  }

  const internal = nodeIdPathToLegalIdPathInternal(structTree, R.drop(1,nodePath))
  return {legalIdPath: R.join('/', internal.legalIdPath), isComplete: internal.isComplete}
}

function nodeIdPathToLegalIdPathInternal(structTree: StructTree, nodePath: NodeIdPath): { legalIdPath: string[], isComplete: boolean } {
  const [first, rest] = R.splitAt(1, nodePath)

  const currentLegalId = getNodeLegalId(structTree)

  if (!currentLegalId) {
    //current node should have been a named Node but it isn't and we can't follow the path
    return {legalIdPath: [], isComplete: false}
  }

  if (first.length === 0) {
    //successfully found the end of path
    return {legalIdPath: [currentLegalId], isComplete: true}
  }

  if (!structTree.children) {
    //can't follow the nodePath, no more children
    return {legalIdPath: [currentLegalId], isComplete: false}
  }

  const theNextChild = R.find(elm => elm.id === first[0], structTree.children)

  if (!theNextChild) {
    //couldn't find the next child to match
    return {legalIdPath: [currentLegalId], isComplete: false}
  }

  const nextRetVal = nodeIdPathToLegalIdPathInternal(theNextChild, rest)

  return {legalIdPath: R.prepend(currentLegalId,nextRetVal.legalIdPath), isComplete:nextRetVal.isComplete}
}


export function legalIdPathToNodeIdPath(structTree?: StructTree | null, legalIdPath?: string | null): { nodePath: NodeIdPath, isComplete: boolean } {

  const nodePath: NodeIdPath = []

  if (!structTree || !legalIdPath || legalIdPath.length === 0) {
    return {nodePath: nodePath, isComplete: false}
  }

  const splitPath = R.split('/', legalIdPath)

  const topLegalId = splitPath[0]

  if (!nodeHasLegalId(topLegalId, structTree)) {
    return {nodePath: nodePath, isComplete: false}
  }

  const isComplete = legalIdPathToNodeIdPathInternal(structTree, splitPath, nodePath)

  return {
    nodePath: nodePath,
    isComplete
  }
}


function legalIdPathToNodeIdPathInternal(structTree: StructTree, legalIdPath: string[], retVal: string[]): boolean {
  legalIdPath.shift()
  retVal.push(structTree.id)

  if (legalIdPath.length === 0)
    return true

  const childLegalId = legalIdPath[0]

  if (structTree.children) {
    const child = R.findLast(c => nodeHasLegalId(childLegalId, c), structTree.children)

    if (child)
      return legalIdPathToNodeIdPathInternal(child, legalIdPath, retVal)
  }
  return false
}


export function nodeHasLegalId(legalId: string, structTree: StructTree): boolean {

  if (structTree.type != TreeNodeType.Node || !structTree.children) {
    return false
  }

  const nameNode = R.find(c => c.type == TreeNodeType.Name
    && c.attributes.lifeHistory != LifeHistory.Deleted
    && c.attributes.legalId == legalId
    , structTree.children)

  return nameNode ? true : false
}

function getNodeLegalId(structTree: StructTree): string | null {
  if (structTree.type != TreeNodeType.Node || !structTree.children)
    return null

  const nameNode = R.find(c => c.type == TreeNodeType.Name
    && c.attributes.lifeHistory != LifeHistory.Deleted, structTree.children)

  if (!nameNode)
    return null

  return nameNode.attributes.legalId ? nameNode.attributes.legalId : null
}