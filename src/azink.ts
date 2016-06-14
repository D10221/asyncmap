/***
 * async :yield as await from: Typescript generated code  from await, co-processor
 */
export function azink(ctx, g, ...args: any[]) {
    
    return new Promise(function (resolve, reject) {
        
        function fulfilled(value) { try { step(g.next(value)); } catch (e) { reject(e); } }

        function rejected(value) { try { step(g.throw(value)); } catch (e) { reject(e); } }
        
        function step(result) {
            result.done ? resolve(result.value) : new Promise((resolve) => {
                resolve(result.value);
            }).then(fulfilled, rejected);
        }
        step((g = g.apply(ctx, args|| void 0 )).next());
    });
};