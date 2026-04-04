import { Request } from "express"

export function formatRequest(request: Request | {[key : string] : any}) : any {
    let params : {[key:string] : any} = {}

    if('body' in request){
        params = {
            ...request.query,
            ...request.body,
            ...request.params
        }
    }else{
        params = {
            ...request.params
        }
    }

    return params;
}
