export class Thing {

    constructor(id?:number, xname?: string) {
        
        if(id){
            this.id = id;
        }
        
        if(xname){
            this.xname = xname;
        }
    }

    id: number = 0 ;
    xname:string = "";    
}