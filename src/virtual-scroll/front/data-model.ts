/*
    Name: data-model.ts
    Date: 19 Jan 2018
    Author: raduw
    Description: data models
*/
export interface UiLabel {
  readonly name: string;
  readonly id: string;
  readonly description?: string;
  readonly data?: any;
}

export interface UiLabelTree extends UiLabel {
  readonly children?: UiLabelTree[];
}

export interface DocumentFilter {
  publicationDate?: DateFilter;
  documentYear?: number;
  documentSearchQuery?: string;
  documentTypeIds?: string[];
  emitentTypeIds?: string[];
  documentSerial?: string;
}

export interface DateFilter {
  readonly year?: number;
  readonly month?: number;
}

export type NodeIdPath = string[]
