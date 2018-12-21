/*
    Name: struct-tree.ts
    Date: 03 Oct 2018
    Author: raduw
    Description: struct tree related types
*/

export const enum TreeNodeType {Node = 1, Name = -1, Title = -2, Leaf = -3, Undefined=-4}

export enum LifeHistory {
  Original = 'ori',
  Deleted = 'del',
  NewContent = 'nwc'
}

export namespace LifeHistory {
  export const All: LifeHistory[] = [LifeHistory.Original, LifeHistory.Deleted, LifeHistory.NewContent]
}

export enum LegalDocNodeType {
  Undefined = '',
  Lege = 'doc',
  Titlu = 'tit',
  Nota = 'not',
  Subtitlu = 'sti',
  Capitol = 'cap',
  Subcapitol = 'sca',
  Sectiune = 'sec',
  Subsectiune = 'sse',
  Lista = 'lis',
  Carte = 'car',
  Anexa = 'ane',
  Parte = 'prt',
  Subparte = 'spr',
  Articol = 'art',
  Subarticol = 'sar',
  Alineat = 'ali',
  Litera = 'lit',
  Punct = 'pun',
  Subpunct = 'spu',
  Paragraf = 'par',
  Quote = 'qot',
}

export interface LegalDocNodeTypeProperites {
  readonly nodeLevel: number;
}

export namespace LegalDocNodeType {
  export const All: LegalDocNodeType[] = [
    LegalDocNodeType.Lege, LegalDocNodeType.Titlu, LegalDocNodeType.Nota, LegalDocNodeType.Subtitlu,
    LegalDocNodeType.Capitol, LegalDocNodeType.Subcapitol, LegalDocNodeType.Sectiune, LegalDocNodeType.Subsectiune,
    LegalDocNodeType.Lista, LegalDocNodeType.Carte, LegalDocNodeType.Anexa, LegalDocNodeType.Parte,
    LegalDocNodeType.Subparte, LegalDocNodeType.Articol, LegalDocNodeType.Subarticol, LegalDocNodeType.Alineat,
    LegalDocNodeType.Litera, LegalDocNodeType.Punct, LegalDocNodeType.Subpunct, LegalDocNodeType.Paragraf,
    LegalDocNodeType.Quote,
  ]
}

export interface StructTreeAttributes {
  lifeHistory?: LifeHistory
  nodeType?: LegalDocNodeType
  lejIds?: string[]
  legalId?: string
}

export interface StructTree {
  type: TreeNodeType
  id: string
  children?: StructTree[]
  attributes: StructTreeAttributes
}

export const enum AttributeType {
  LegalDocNodeType = '1',
  LifeHistory = '2',
  LegalJustification = '3',
  LegalId = '4'
}