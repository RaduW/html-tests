/*
    Name: legal-id-util.ts
    Date: 02 Nov 2018
    Author: raduw
    Description: utilities for dealing with legalIds
*/


import * as R from 'ramda'

export function legalIdPathToName(legalIdPath?: string | null): string {
  if (!legalIdPath) {
    return ''
  }

  const pathSegements = R.split('/', legalIdPath)
  if (pathSegements.length == 1) {
    return 'documentul'
  }

  //if there is an article in the path return just the article name
  const artId = R.find( id=> id.startsWith('art-'),pathSegements)

  if ( artId){
    return idToNodeName(artId)
  }

  return R.reduce((acc, id) => `${acc}${idToNodeName(id)}`, '', pathSegements)

}


const NodeTypeNames = {
  'doc': '',
  'tit': 'Titlul',
  'not': 'Nota',
  'sti': 'Subtitlul',
  'cap': 'Capitolul',
  'sca': 'Subcapitolul',
  'sec': 'Sectiunea',
  'sse': 'Subsectiunea',
  'lis': 'Lista',
  'car': 'Cartea',
  'ane': 'Anexa',
  'prt': 'Partea',
  'spr': 'Subpartea',
  'art': 'Articolul',
  'sar': 'Subarticolul',
  'ali': 'Alineatul',
  'lit': 'Litera',
  'pun': 'Punctul'
}

function idToNodeName(id: string): string {

  const [nodeType, nodeId] = R.split('-', id)

  const nodeTypeName = NodeTypeNames[nodeType] ? ` ${NodeTypeNames[nodeType]}` : ''
  const nodeIdName = nodeId ? ` ${nodeId}` : ''
  return nodeTypeName + nodeIdName

}
