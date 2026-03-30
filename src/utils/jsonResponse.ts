interface Meta{
    status : number,
    message: string
}

class JsonResponse {

    public data : any ;
    public meta : Meta ;
    public hasError : boolean;

    constructor(data: any, status: number, message: string, hasError : boolean){
        this.data = data;
        this.meta = {
            status : status,
            message : message
        }
        this.hasError = hasError;
    }

    getStatus() : number{
        return this.meta.status;
    }

    static success(data : any, message : string){
        return new JsonResponse(data, 200,message, false);
    }

    static error(status : number, message : string){
        return new JsonResponse(null, status, message, true);
    }

}

export default JsonResponse;