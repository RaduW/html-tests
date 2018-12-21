/*
    Name: logging.ts
    Date: 10 Sep 2018
    Author: raduw
    Description: Generic logging function ( can be enabled/disabled in the whole app)
*/



import {Log} from './util'


let LOG_LEVEL: Log | 0 = Log.Debug

export function setLogLevel(logLevel: Log | null) {
  LOG_LEVEL = logLevel ? logLevel : 0
}

function nop(...params) {
}

const Debug = [nop,
  console.log, nop, nop, nop, nop]


const Info = [nop,
  console.info, console.info, nop, nop, nop]

const Warn = [nop,
  console.warn, console.warn, console.warn, nop, nop]

const Error = [nop,
  console.error, console.error, console.error, console.error, nop]

const Critical = [nop,
  console.error, console.error, console.error, console.error, console.error]


export function log(logLevel: Log, ...params) {
  switch (logLevel) {
    case Log.Debug:
      logDebug(...params)
      break
    case Log.Info:
      logInfo(...params)
      break
    case Log.Warn:
      logWarn(...params)
      break
    case Log.Error:
      logError(...params)
      break
    case Log.Critical:
      logCritical(...params)
      break
  }
}

export function logDebug(...params) {
  Debug[LOG_LEVEL](...params)
}

export function logInfo(...params) {
  Info[LOG_LEVEL](...params)
}

export function logWarn(...params) {
  Warn[LOG_LEVEL](...params)
}

export function logError(...params) {
  Error[LOG_LEVEL](...params)
}

export function logCritical(...params) {
  Critical[LOG_LEVEL](...params)
}
