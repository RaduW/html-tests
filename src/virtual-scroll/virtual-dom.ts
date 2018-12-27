/*
 Name: virtual-dom.ts
 Date: 23 Dec 2018
 Author: raduw
 Description: virtual DOM functionality for ShadowTree

 */

import * as R from 'ramda'
import { ShadowTree, ShadowTreePtr, isVirtualNodeType, showReal, showVirtual } from "./front/shadow-tree";
import { toTree, getChildren, toPointer, getNextPred, getPreviousPred } from "./front/shadow-tree-navigator";

// interval of no scrolling after which a realized nodes cleanup is done
const CleanupRealizedNodesInactivityTimeoutMs = 1000 

interface VirtualDocContext {
    parentDom : HTMLElement
    parentClientRect: ClientRect // just caching
    realizedNodes: R.Dictionary<ShadowTreePtr>
    lastRealizedNodes: R.Dictionary<ShadowTreePtr>
    currentTree?: ShadowTree
    cleanupRealizedNodesHandler?: number 
}

export function createScrollHandler(parent: HTMLElement){
    let processing:boolean = false
    const parentClientRect = parent.getBoundingClientRect()
    const context : VirtualDocContext = {
        parentDom: parent,
        parentClientRect: parentClientRect,
        realizedNodes: {},
        lastRealizedNodes: {},
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

    if ( context.cleanupRealizedNodesHandler){
        //throtle the cleanup (only cleanup after )
        window.clearTimeout(context.cleanupRealizedNodesHandler)
    }
    context.lastRealizedNodes = {} // keep only what we realize now
    const rootPtr = toPointer(context.currentTree!)
    const firstVelmPtr = findFirstVisibleVirtualElm(rootPtr, context.parentClientRect)

    let current: ShadowTreePtr|null = getPreviousVirtualNode(firstVelmPtr)
    if ( ! current){
        current = firstVelmPtr // just in case we are at the start of the document
    }

    while ( current && !isTreeBelowClientRect(context, current)){
        realizeNode(context,current)
        if ( current){

        }
        current = getNextVirtualNode(current)
    }

    realizeNode(context, current) // realize one hidden node below (if possible)
    context.cleanupRealizedNodesHandler = window.setTimeout(()=>cleanupRealizedNodes(context), CleanupRealizedNodesInactivityTimeoutMs)
}

function cleanupRealizedNodes(context:VirtualDocContext){

    for( const id of R.keys(context.realizedNodes)){
        if ( !context.lastRealizedNodes[id]){
            console.log('unrealizing id:', id)
            unrealizeNode(context, id)
        }
    }
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

function unrealizeNode(context: VirtualDocContext, nodeId: string|number){
    const node = context.realizedNodes[nodeId]
    const tree = toTree(node)
    if ( tree ){
        showVirtual(node)
        delete context.realizedNodes[nodeId]
    }
}

function realizeNode(context: VirtualDocContext, node: ShadowTreePtr|null){
    if ( ! node){
        return 
    }
    const tree = toTree(node)
    if ( ! tree){
        return 
    }

    context.realizedNodes[tree.id] = node
    context.lastRealizedNodes[tree.id] = node
    if ( !tree.vElementActive){
        return
    }

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

