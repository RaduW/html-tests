import {HttpApi} from './front/http'
import { wireToStructTree } from './front/wire-to-struct-tree';
import { StructTree } from './front/struct-tree';
import { FragmentDictionary, toFragmentDictionary } from './front/fragment-dictionary';
import { toHierarchicalDocument } from './front/shadow-tree-builder';
import { ShadowTree, toDom, addVirtualElements } from './front/shadow-tree';
import { createScrollHandler } from './virtual-dom';

export function main(){
    //const shadowTreeP = getShadowTree('')
    const shadowTreeP = getShadowTree('2015-11-04')
    shadowTreeP.then( mountDoc)
}

/*
function getStruct( wireObj: object){
    console.log( 'the wire tree', wireObj)
    const structTree = wireToStructTree(wireObj)
    console.log('the struct tree', structTree)
    
}
*/

function mountDoc( docTree: ShadowTree | null){
    if ( ! docTree){
        return 
    }

    const rootElms = document.getElementsByClassName('doc-viewer')

    if ( rootElms && rootElms.length > 0){
        const root = rootElms[0]
        toDom(docTree, true)
        root.appendChild(docTree.element)
    }

    const scrollParent = document.getElementsByClassName('scroll-container')
    if ( scrollParent && scrollParent.length > 0 ){
        const scrollHandler = createScrollHandler(<HTMLElement>scrollParent[0])
        scrollParent[0].addEventListener('scroll', function(e) {
            scrollHandler(docTree)
          });
    }
}

function getShadowTree( dateStr: string):Promise<ShadowTree|null>{
    const api = new HttpApi('data')
    if ( !dateStr){
        dateStr = ''
    }else{
        dateStr = '-' + dateStr
    }
    const structFileName = `virtual-scroll/000_010_505${dateStr}.structure.json`
    const structP: Promise<StructTree|null|undefined> = api.get<object>(structFileName).then( wireToStructTree)

    const contentFileName = 'virtual-scroll/000_010_505.consolidated.flat.html'
    const fragmentDictP: Promise<FragmentDictionary|null|undefined> = api.getText(contentFileName).then(toFragmentDictionary)

    return Promise.all([structP, fragmentDictP]).then(([structTree, fragmentDict]) => {
        if ( !structTree || !fragmentDict){
            return null
        }
        const retVal = toHierarchicalDocument(fragmentDict, structTree)
        addVirtualElements(retVal)
        return retVal
    })
}
main()