/*
 Name: virtual-dom.ts
 Date: 23 Dec 2018
 Author: raduw
 Description: virtual DOM functionality for ShadowTree

 */

import { ShadowTree } from "./front/shadow-tree";

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
                scrollHandler(root, parent, parentClientRect)
                processing = false
    
            })
        }
    }
}

function scrollHandler( root: ShadowTree, parent:HTMLElement, parentClientRect: ClientRect ){
    console.log('onScroll...', parentClientRect)
}

