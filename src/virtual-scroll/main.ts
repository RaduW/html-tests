import {HttpApi} from './front/http'
import { wireToStructTree } from './front/wire-to-struct-tree';

export function main(){
    console.log('this is main.ts')
    const api = new HttpApi('data')

    const structP = api.get<object>('virtual-scroll/000_010_505.structure.json')

    structP.then( getStruct)
}

function getStruct( wireObj: object){
    console.log( 'the wire tree', wireObj)
    const structTree = wireToStructTree(wireObj)
    console.log('the struct tree', structTree)
    
}

main()