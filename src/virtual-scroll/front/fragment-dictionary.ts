/*
    Name: fragment-dictionary.ts
    Date: 07 Aug 2018
    Author: raduw
    Description: loads a document consisting of fragments and creates a dictionary of fragemntId->HTMLElement
*/

export const MarkersClsName = 'mrks'

export interface FragmentDictionary {
  get(idx: string): HTMLElement | null
  getOrCreate(idx: string): HTMLElement
  addSimpleMarker(idx: string,mainClass:string, otherClasses?: string|null)
}


function dictToFragmentDictionary(dict): FragmentDictionary {
  return {
    get(idx: string): HTMLElement | null {
      const retVal = dict[idx]
      return retVal ? retVal : null
    },
    getOrCreate(idx: string): HTMLElement {
      const retVal = dict[idx]
      if (!retVal) {
        const newNode = document.createElement('div')
        newNode.id = idx
        dict[idx] = newNode
        return newNode
      }
      return retVal
    },
    addSimpleMarker(idx: string, mainClass: string, otherClasses?: string|null) {
      const elm = this.getOrCreate(idx)
      addSimpleMarkerToContentElement(elm, mainClass, otherClasses)
    }
  }
}

interface FragmentDictionaryInternal {
  [idx: string]: HTMLElement
}

export function toFragmentDictionary(doc: string): FragmentDictionary {
  const retVal: FragmentDictionaryInternal = Map ? <FragmentDictionaryInternal> <any>new Map<string, HTMLElement>() : {}

  const mountBase: HTMLElement = document.createElement('div')
  mountBase.innerHTML = doc

  const nodeContainer = mountBase.firstElementChild

  if (nodeContainer && nodeContainer.nodeType === Node.ELEMENT_NODE) {
    toFragmentDictionaryInternal(nodeContainer, retVal)
  }

  return dictToFragmentDictionary(retVal)
}

function toFragmentDictionaryInternal(nodeContainer, acc: FragmentDictionaryInternal): FragmentDictionaryInternal {
  for (const node of nodeContainer.childNodes) {
    if (node && node.nodeType === Node.ELEMENT_NODE) {
      const id = node.id
      acc[id] = node
    }
  }
  return acc
}

export function getTextContent(elements: FragmentDictionary, id: string | null | undefined, maxLength?: number): { val?: string, isNotFullContent?: boolean } {

  if (!id)
    return {}
  const element = elements.get(id)
  const wholeString = maxLength === null || maxLength === undefined
  if (element) {
    const content: string | null = element.textContent
    if (maxLength === null || maxLength === undefined) {
      return {val: content ? content : undefined, isNotFullContent: false}
    }
    else {
      if (maxLength < 0)
        return {isNotFullContent: true}
      if (maxLength < 4)
        maxLength = 4
      if (content) {
        if (content.length > maxLength) {
          return {val: content.substr(0, maxLength - 3) + '...', isNotFullContent: true}
        }
        else {
          return {val: content, isNotFullContent: false}
        }
      }
    }
  }
  return {}
}


function addSimpleMarkerToContentElement(elm: HTMLElement,mainClassName:string,  otherClasses?: string|null ) {
  const firstChild = elm.firstChild
  const classes = otherClasses ? `${mainClassName} ${otherClasses}`: mainClassName
  if (!firstChild || !isMarkersContainer(firstChild)) {
    const markersContainer = createMarkersContainer()
    if (!firstChild) {
      elm.appendChild(markersContainer)
    }
    else {
      elm.insertBefore(markersContainer, firstChild)
    }
    markersContainer.appendChild(createSimpleMarker(classes))
  }
  else{
    const markersContainer = <HTMLElement> firstChild
    const existingMarker = getMarker(markersContainer, mainClassName)
    if ( existingMarker){
      existingMarker.className = classes
    }
    else{
      const marker = createSimpleMarker(classes)
      markersContainer.appendChild(marker)
    }
  }
}



function isMarkersContainer(node: Node): boolean {
  if (node.nodeType !== Node.ELEMENT_NODE) {
    return false
  }
  const elm: HTMLElement = <HTMLElement> node
  return elm.classList.contains(MarkersClsName)
}

function createMarkersContainer(): HTMLElement {
  const retVal = document.createElement('span')
  retVal.className = MarkersClsName
  return retVal
}

function createSimpleMarker(classes: string): HTMLElement {
  const retVal = document.createElement('span')
  retVal.className = classes
  return retVal
}

function getMarker(markersContainer:Element, className: string): Element|null{
    const children = markersContainer.children
    for (var i = 0; i < children.length; i++) {
      const child = children[i]
      if ( child.nodeType === Node.ELEMENT_NODE){
        const elmChild = <Element>child
        if ( child.classList.contains(className)){
          return elmChild
        }
      }
    }
    return null
}
