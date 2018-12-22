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
    
    const modified: StructTree = <StructTree>{
        type : wireToNodeType(structTree['tag']),
        id: wireToId(structTree),
        attributes: wireToAttributes(structTree['attrs']),
        children: structTree['children']? R.map(st => wireToStructTree(st), structTree['children']):[]
    }

    return R.omit(['attrs','tag'],modified)
}
function bubuFunc(obj: any){
    return "the bubu"
}

function wireToAttributes(attrs: object|null|undefined): StructTreeAttributes {
    if ( ! attrs){
        return {}
    }
    
    const retVal :StructTreeAttributes= {
        lifeHistory: wireToLifeHistory(attrs['lifeHist']),
    }

    if ( attrs['type']){
        retVal.nodeType = wireToLegalDocNodeType(attrs['type'])
    }

    if ( attrs['legalId']){
        retVal.legalId = attrs['legalId']
    }

    if ( attrs['lejIds']){
        retVal.lejIds = attrs['lejIds']
    }

    return retVal
}

function wireToLifeHistory( lifeHistStr: string|null|undefined): LifeHistory | undefined{
    switch( lifeHistStr){
        case "NewContent":
            return LifeHistory.NewContent
        case "Deleted":
            return LifeHistory.Deleted
        default:
            return LifeHistory.Original
    }
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