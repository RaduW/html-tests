/*
 Name: virtual-dom.ts
 Date: 23 Dec 2018
 Author: raduw
 Description: virtual DOM functionality for ShadowTree

 */

import { ShadowTree } from "./front/shadow-tree";

export function createScrollHandler(){
    var processing = false

    return function ( root: ShadowTree, parent: HTMLElement) {
        if ( processing){
            return 
        }
        else {
            processing = true
            window.requestAnimationFrame( function(){
                scrollHandler(root, parent)
                processing = false
    
            })
        }
    }
}

function scrollHandler( root: ShadowTree, parent:HTMLElement ){
    console.log('onScroll...')
}