/*
    Name: wire-to-struct-tree.ts
    Date: 05 Sep 2018
    Author: raduw
    Description: implements navigation operations on ShadowTree
*/

import * as R from "ramda"
import { TreeNodeType, LegalDocNodeType, StructTree, StructTreeAttributes, LifeHistory } from "./struct-tree";

export function wireToStructTree( structTree:object|null|undefined) : StructTree|null|undefined{
    
    if (! structTree)
        return undefined
    
    const modified: StructTree = <StructTree> R.evolve({
        type : wireToNodeType,
        id: wireToId,
        attributes: wireToAttributes,
        children: R.map(st => st['children']? wireToStructTree(st['children']) : [])
    }, structTree)

    return R.omit(['attrs','tag'],modified)
}

function wireToAttributes(structTree: object|null|undefined): StructTreeAttributes {
    if ( ! structTree){
        return {}
    }
    const attrs = R.evolve({
        lifeHistory: wireAttributesToLifeHistory,
        nodeType: wireAttributesToLegaDocNodeType,
        
    }, structTree['attrs'])

    return R.omit(['id', 'lifeHist'], attrs)
}

function wireAttributesToLifeHistory( attrs: object|null|undefined): LifeHistory | undefined{
    if ( ! attrs || ! attrs['lifeHist']) {
        return undefined
    }
    
    switch( attrs['lifeHist']){
        case "NewContent":
            return LifeHistory.NewContent
        case "Deleted":
            return LifeHistory.Deleted
    }
    return undefined
}

function wireAttributesToLegaDocNodeType( attrs: object|null|undefined): LegalDocNodeType | undefined{
    if ( ! attrs || ! attrs['type']) {
        return undefined
    }

    return wireToLegalDocNodeType(attrs['type'])
}

function wireToId( structTree: object): string{
    return R.pathOr('',['attrs', 'id'], structTree)
}

function wireToNodeType( nodeType:string): TreeNodeType {
    switch ( nodeType ){
        case "Node":
            return TreeNodeType.Node
        case "Name":
            return TreeNodeType.Name
        case "Title":
            return TreeNodeType.Title
        case "Leaf":
            return TreeNodeType.Leaf
        default:
            return TreeNodeType.Undefined
    }
}

function wireToLegalDocNodeType( legalNodeType: string): LegalDocNodeType {
    switch(legalNodeType){
        case "lege": 
            return LegalDocNodeType.Lege
        case "titlu": 
            return LegalDocNodeType.Titlu
        case "nota": 
            return LegalDocNodeType.Nota
        case "subtitlu": 
            return LegalDocNodeType.Subtitlu
        case "capitol": 
            return LegalDocNodeType.Capitol
        case "subcapitol": 
            return LegalDocNodeType.Subcapitol
        case "sectiune": 
            return LegalDocNodeType.Sectiune
        case "subsectiune": 
            return LegalDocNodeType.Subsectiune
        case "lista": 
            return LegalDocNodeType.Lista
        case "carte": 
            return LegalDocNodeType.Carte
        case "anexa": 
            return LegalDocNodeType.Anexa
        case "parte": 
            return LegalDocNodeType.Parte
        case "subparte": 
            return LegalDocNodeType.Subparte
        case "articol": 
            return LegalDocNodeType.Articol
        case "subarticol": 
            return LegalDocNodeType.Subarticol
        case "alineat": 
            return LegalDocNodeType.Alineat
        case "litera": 
            return LegalDocNodeType.Litera
        case "punct": 
            return LegalDocNodeType.Punct
        case "subpunct": 
            return LegalDocNodeType.Subpunct
        case "paragraf": 
            return LegalDocNodeType.Paragraf
        case "quote": 
            return LegalDocNodeType.Quote
        default: 
            return LegalDocNodeType.Undefined
    }
}