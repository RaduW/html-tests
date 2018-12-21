/*
    Name: http.ts
    Date: 03 Feb 2018
    Author: raduw
    Description: a thin layer on top of the browser fetch api to simplify usage
*/

import * as R from 'ramda'
import * as queryString from 'query-string'

export interface Http {
  getText(url: string, parameters?: any): Promise<string>
  get<T>(url: string, paramters?: any): Promise<T>
  post<T>(url: string, value: T, parameters?: any)
  postWithResult<T,Res>(url: string, value: T, parameters?: any):Promise<Res>
  put<T>(url: string, value: T, paramters?: any)
  putWithResult<T, Res>(url: string, value: T, paramters?: any):Promise<Res>
}

export class HttpApi implements Http {
  apiUrl: string

  constructor(apiUrl: string | null) {
    this.apiUrl = apiUrl ? apiUrl : ''
  }

  async getText(url: string, parameters?: any): Promise<string> {
    const reqUrl = composeUrl(this.apiUrl, url, parameters)
    const response = await fetch(reqUrl, {
    //  credentials: 'include'
    })
    if (!response.ok){
      const errorVal = await response.text()
      throw Error(errorVal)
    }
    return response.text()
  }

  async get<T>(url: string, parameters?: any): Promise<T> {
    const reqUrl = composeUrl(this.apiUrl, url, parameters)
    const response = await fetch(reqUrl, {
      // credentials: 'include'
    } )
    if (!response.ok){
      const errorVal = await response.text()
      throw Error(errorVal)
    }
    return response.json()
  }

  post<T>(url: string, value: T, parameters?: any): Promise<Response> {
    const reqUrl = composeUrl(this.apiUrl, url, parameters)

    return fetch(reqUrl, {
      method: 'POST',
      body: JSON.stringify(value),
      //credentials: 'include',
      headers: new Headers({
        'Content-Type': 'application/json',
      })
    })
  }

  async postWithResult<T, Res>(url: string, value: T, parameters?: any): Promise<Res> {
    const reqUrl = composeUrl(this.apiUrl, url, parameters)

    const response = await fetch(reqUrl, {
      method: 'POST',
      //credentials: 'include',
      body: JSON.stringify(value),
      headers: new Headers({
        'Content-Type': 'application/json'
      })
    })
    if (!response.ok){
      const errorVal = await response.text()
      throw Error(errorVal)
    }

    return response.json()
  }

  put<T>(url: string, value: T, parameters?: any) {
    const reqUrl = composeUrl(this.apiUrl, url, parameters)
    return fetch(reqUrl, {
      method: 'PUT',
      //credentials: 'include',
      body: JSON.stringify(value),
      headers: new Headers({
        'Content-Type': 'application/json'
      })
    })
  }

  async putWithResult<T, Res>(url: string, value: T, parameters?: any): Promise<Res> {
    const reqUrl = composeUrl(this.apiUrl, url, parameters)

    const response = await fetch(reqUrl, {
      method: 'PUT',
      //credentials: 'include',
      body: JSON.stringify(value),
      headers: new Headers({
        'Content-Type': 'application/json'
      })
    })

    if (!response.ok){
      const errorVal = await response.text()
      throw Error(errorVal)
    }
    return response.json()
  }

}

export function composeUrl(base: string, url: string, parameters?: any): string {
  const baseN = base.endsWith('/') ? base.substr(0, base.length - 1) : base

  const start = url.startsWith('/') ? 1 : 0
  const end = url.endsWith('/') ? url.length - 1 : url.length
  const urlN = url.substring(start, end)

  let retVal = urlN.length > 0 ? `${baseN}/${urlN}` : baseN

  if (parameters && !R.isEmpty(parameters)) {
    if (retVal.indexOf('?') === -1) {
      retVal += '?'
    }
    else if (!retVal.endsWith('&')) {
      retVal += '&'
    }

    retVal += queryString.stringify(parameters)
  }

  return retVal
}