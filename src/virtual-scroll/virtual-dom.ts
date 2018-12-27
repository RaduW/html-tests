/*
 Name: virtual-dom.ts
 Date: 23 Dec 2018
 Author: raduw
 Description: virtual DOM functionality for ShadowTree

 */

import { ShadowTree, ShadowTreePtr, isVirtualNodeType, showReal } from "./front/shadow-tree";
import { toTree, getChildren, toPointer, getNextPred, getPreviousPred } from "./front/shadow-tree-navigator";

interface VirtualDocContext {
    parentDom : HTMLElement
    parentClientRect: ClientRect // just caching
    realizedNodes: R.Dictionary<ShadowTreePtr>
    currentTree?: ShadowTree
}

export function createScrollHandler(parent: HTMLElement){
    let processing:boolean = false
    const parentClientRect = parent.getBoundingClientRect()
    const context : VirtualDocContext = {
        parentDom: parent,
        parentClientRect: parentClientRect,
        realizedNodes: {}
    }
    
    return function ( root: ShadowTree) {
        if ( root !== context.currentTree){
            context.currentTree = root
            context.realizedNodes = {}
        }
        if ( processing){
            return 
        }
        else {
            processing = true
            window.requestAnimationFrame( function(){
                showVirtualElements(context)
                processing = false
    
            })
        }
    }
}

function showVirtualElements( context: VirtualDocContext ){
    //console.log('onScroll...', context.parentClientRect)
    const rootPtr = toPointer(context.currentTree!)
    const firstVelmPtr = findFirstVisibleVirtualElm(rootPtr, context.parentClientRect)

    let current: ShadowTreePtr|null = getPreviousVirtualNode(firstVelmPtr)
    if ( ! current){
        current = firstVelmPtr // just in case we are at the start of the document
    }

    while ( current && !isTreeBelowClientRect(context, current)){
        showReal(current)
        //debugTreePtr(current)
        if ( current){

        }
        current = getNextVirtualNode(current)
    }

    //debugTreePtr(current)
    showReal( current) // realize one hidden node below (if possible)

    //showReal(firstVelmPtr)
}




function debugTreePtr( treePtr: ShadowTreePtr | null ){
    const tree = toTree(treePtr)
    if ( tree){
        console.log( 'debug tree: ', tree.id, tree)
    }
    else{
        console.log('debug tree NULL')
    }
}

function isTreeBelowClientRect(context: VirtualDocContext, elmPtr: ShadowTreePtr|null):boolean{
    if ( ! elmPtr ){
        return false
    }
    const elm = toTree(elmPtr)
    if ( ! elm){
        return false
    }
    
    const htmlElm = elm.vElementActive ? elm.vElement : elm.element

    if ( htmlElm){
        const rect = context.parentClientRect
        return isBelowHtml(htmlElm, rect)
    }
    return false
}

function isTreeVisible(context: VirtualDocContext, elmPtr: ShadowTreePtr|null): boolean {
    if ( ! elmPtr ){
        return false
    }
    const elm = toTree(elmPtr)
    if ( ! elm){
        return false
    }
    const htmlElm = elm.vElementActive ? elm.vElement : elm.element

    if ( htmlElm){
        const rect = context.parentClientRect
        return isVisibleHtml(htmlElm, rect)
    }
    return false
}

function realizeNode(context: VirtualDocContext, node: ShadowTreePtr|null){
    if ( ! node){
        return 
    }
    const tree = toTree(node)
    if ( ! tree){
        return 
    }

    if ( !tree.vElementActive){
        return
    }

    //if we are here we need to switch the current node into the DOM
    
    //we need to adjust the scroll position of the parent if the end of the node is
    //above the beggining of the client rect (i.e. we do that for nodes that are
    //above the visible area)
    //adjustScrollPosition(context.parentDom, context.parentClientRect, tree.element, tree.vElement)
    showReal(node)
}

function adjustScrollPosition(scrollParent: HTMLElement, rect:ClientRect, newElement?:HTMLElement, oldElement?:HTMLElement){
    if ( !newElement || ! oldElement){
        return 
    }
   
    const parentTop = rect.top
    const oldRect = oldElement.getBoundingClientRect()

    if ( oldRect.top >= parentTop){
        return // we only need to adjust the scroll if the element starts above the parent rect
    }

    const newRect = newElement.getBoundingClientRect()
    const delta = newRect.bottom - oldRect.bottom
    scrollParent.scrollTop = scrollParent.scrollTop + delta
}

function shouldSearchChildrenForVirtualNodes(tree: ShadowTree | null){
    return !!tree && !isVirtualNodeType(tree)
}

function getNextVirtualNode(current: ShadowTreePtr | null ): ShadowTreePtr|null {
    return getNextPred(current, isVirtualNodeType, shouldSearchChildrenForVirtualNodes)
}

function getPreviousVirtualNode(current: ShadowTreePtr | null ): ShadowTreePtr|null {
    return getPreviousPred(current, isVirtualNodeType, shouldSearchChildrenForVirtualNodes)
}

/**
 * Tests wheather a HTMLElment is visible in a (parent) client rect (that is if a part of the element
 * is in the client prect)
 * @param elmPtr the element to test
 * @param rect the client rect (from a parent) that will be checked for the elm position
 * @return true if the elm intersects with the rect (at least part of the element is visible in the rect)
 */
function isVisibleHtml( elm: HTMLElement|null, rect: ClientRect):boolean{
    if ( ! elm){
        return false
    }

    const elmRect = elm.getBoundingClientRect()
        
    return (elmRect.top >= rect.top && elmRect.top <= rect.bottom) || //check if the top of the element is in the rect
           (elmRect.bottom >= rect.top && elmRect.bottom <= rect.bottom) || //check if the bottom of the elmeent is in the rect
           (elmRect.top <= rect.top && elmRect.bottom >= rect.bottom ) // check if the rect is fully contained in the element
}

/**
 * Tests wheather a HTMLElment is completly below a (parent) client rect (that is if a part of the element
 * is above the bottom of the rect)
 * @param elmPtr the element to test
 * @param rect the client rect (from a parent) that will be checked for the elm position
 * @return true if the elm top is above the rect bottom
 */
function isBelowHtml( elm: HTMLElement|null, rect: ClientRect):boolean{
    if ( ! elm){
        return false
    }

    const elmRect = elm.getBoundingClientRect()
        
    return elmRect.top >= rect.bottom
}



function findFirstVisibleVirtualElm(root: ShadowTreePtr|null, pRect:ClientRect):ShadowTreePtr|null {

    const tree: ShadowTree|null = toTree(root)
    if ( ! tree){
        return null
    }
    
    const elm = tree.vElementActive ? (tree.vElement||null) : tree.element

    if ( !isVisibleHtml(elm, pRect ))
        return null

    const actualElm = elm! //if it is visible it must be real



    if (isVirtualNodeType(tree)){
        return root
    }
    

    if ( tree.children){
        for (const childPtr of getChildren(root)){
            const retVal = findFirstVisibleVirtualElm( childPtr, pRect)
            if ( retVal)
                return retVal
        }
    }
    return null
}

