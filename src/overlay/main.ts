/*
 Name: main.ts
 Date: 26 Nov 2018
 Author: raduw
 Description: main file for overlay testing
 */

import './main.css'

export function setVisible(element:HTMLElement|null|undefined,  visible:boolean){
  if ( !element){
    return
  }

  if ( visible){
    element.classList.add('visible')
    element.classList.remove('hidden')
  }
  else{
    element.classList.add('hidden')
    element.classList.remove('visible')
  }
}
