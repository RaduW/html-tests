/*
 Name: virtual-dom.ts
 Date: 23 Dec 2018
 Author: raduw
 Description: virtual DOM functionality for ShadowTree

 */

import { ShadowTree, ShadowTreePtr, isVirtualNodeType, showReal } from "./front/shadow-tree";
import { toTree, getChildren, toPointer } from "./front/shadow-tree-navigator";

export function createScrollHandler(parent: HTMLElement){
    let processing:boolean = false
    let parentClientRect = parent.getBoundingClientRect()

    
    return function ( root: ShadowTree) {
        if ( processing){
            return 
        }
        else {
            processing = true
            window.requestAnimationFrame( function(){
                showVirtualElements(root, parent, parentClientRect)
                processing = false
    
            })
        }
    }
}

function showVirtualElements( root: ShadowTree, parent:HTMLElement, parentClientRect: ClientRect ){
    console.log('onScroll...', parentClientRect)
    const rootPtr = toPointer(root)
    const firstVelmPtr = findFirstVisibleVirtualElm(rootPtr, parentClientRect)
    showReal(firstVelmPtr)
}


/**
 * Tests wheather a HTMLElment is visible in a (parent) client rect (that is if a part of the element
 * is in the client prect)
 * @param elm the element to test
 * @param rect the client rect (from a parent) that will be checked for the elm position
 * @return true if the elm intersects with the rect (at least part of the element is visible in the rect)
 */
function isVisible( elm: HTMLElement|null, rect: ClientRect):boolean{
    if ( ! elm){
        return false
    }

    const elmRect = elm.getBoundingClientRect()
        
    return (elmRect.top >= rect.top && elmRect.top <= rect.bottom) || //check if the top of the element is in the rect
           (elmRect.bottom >= rect.top && elmRect.bottom <= rect.bottom) || //check if the bottom of the elmeent is in the rect
           (elmRect.top <= rect.top && elmRect.bottom >= rect.bottom ) // check if the rect is fully contained in the element
}


function findFirstVisibleVirtualElm(root: ShadowTreePtr|null, pRect:ClientRect):ShadowTreePtr|null {

    const tree: ShadowTree|null = toTree(root)
    if ( ! tree){
        return null
    }
    
    const elm = tree.vElementActive ? (tree.vElement||null) : tree.element

    if ( !isVisible(elm, pRect ))
        return null

    const actualElm = elm! //if it is visible it must be real

    if (isVirtualNodeType(tree)){
        console.log(root)
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