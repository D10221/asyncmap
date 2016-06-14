import {assert} from 'chai';
import {Chain} from './chain';
import {isEmpty, notEmpty } from './checks';
describe('Chain', () => {

    it('sequence', () => {

        let from = 0;

        let next = x => x < 3 ? x + 1 : null;

        for (var x of Chain.sequence(from, next, /*completed*/isEmpty).where(notEmpty).select(x => x + 1).values) {

            console.log(x);
        }
    })

    it('from Array', ()=>{
        for(var x of Chain.from(["x"]).values ){
            assert.equal(x,'x');
        }
    })

    it('first',()=>{                
        let x =  Chain.from(["x", "y"]).select(x=> x.toUpperCase()).first();        
        assert.equal(x, 'X');                    
    })

    it('first:conditional',()=>{                
        let x =  Chain.from(["x", "y"]).select(x=> x.toUpperCase()).first(x=>x == 'Y');        
        assert.equal(x, 'Y');                    
    })

     it('take',()=>{                
        let x =  Chain.from(["x", "y"]).take(1).first();        
        assert.equal(x, 'x', 'take?');                    
     })

      it('skip',()=>{                                
        assert.equal(Chain.from(["x", "y"]).skip(1).first(), 'y');
        assert.equal(Chain.from(["x", "y","z"]).skip(2).first(), 'z');                    
     })
    
    
});



