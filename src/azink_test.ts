import {azink} from './azink';

describe('azink', () => {

    it('waits', (done) => {
        
        this.timeOut = 3000;

        let i = 0;

        const _from = Promise.resolve(i);

        const next = (value) => new Promise((rs,rj)=>{
            setTimeout(()=>{
                try{
                    rs(value > 3 ? null : value + 1)
                }catch (e){
                    rj(e)
                }
            }, 1)
        });;

        const completed = value => value == null || value == undefined;

        azink(this,function* () {

            let values = [];

            let value = yield _from;

            while (!completed(value)) {
                                
                value = yield next(value);                               

                values.push(value)
            }

            console.log(values);

            done();
        });

        console.log('after runGenerator');
    })
})
