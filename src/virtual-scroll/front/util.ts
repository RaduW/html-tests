/*
    Name: util.ts
    Date: 21 Jan 2018
    Author: raduw
    Description: various utilities
*/


import * as R from "ramda"

export const enum Log {
  Debug = 1, Info = 2, Warn = 3, Error = 4, Critical = 5
}


export function pretty(obj: any, message: string | null = null): void {
  if (!message)
    message = ''
  console.debug(`${message}: ${JSON.stringify(obj, null, '\t')}`)
}

export function isNullOrUndefined(elm: any) {
  return elm === null || elm === undefined
}


export function pad(repeat: number, paddingText: string = ' ') {
  return `${Array(repeat + 1).join(paddingText)}`
}

export function getIn(obj:any,defVal:any, ...path: any[]){
  const retVal = R.path( path, obj)
  if ( retVal === undefined)
    return defVal
  return retVal
}

export function getInStr(obj, defVal, path: string){
  if ( ! path)
    return defVal
  path = path.replace(/,/g, ' ')
  path = path.trim()

  return getIn(obj,defVal, ...R.split(/\s+/, path))
}
