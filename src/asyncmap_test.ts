import * as path from 'path';
import {Database} from 'sqlite3';
import {AsyncMap} from'./asyncmap';
import {assert} from 'chai';

describe('AsyncMap', () => {

    let map: AsyncMap<number, string>;;

    const db = new Database(path.join(process.cwd(), 'test.db'))

    beforeEach(async () => {
        map = await new AsyncMap<number, string>(db, 'test').ready().then(db => db.clear())
    })

    it('insert, size, get', async () => {

        for (let i = 0; i < 3; i++) {
            console.time('insert');
            await map.set(i, i.toString());
            console.timeEnd('insert');
        }

        console.time('getSize');
        let size = await map.size;
        console.timeEnd('getSize');

        assert.equal(size, 3);

        console.time('get');
        let value = await map.get(1);
        console.timeEnd('get');

        assert.equal(value, '1');

    })

    it('keys', async () => {

        for (let i = 0; i < 3; i++) {
            console.time('insert');
            await map.set(i, i.toString());
            console.timeEnd('insert');
        }

        console.time('get Keys Iter');
        let keyIter = await map.keys();
        console.timeEnd('get Keys Iter');
        let count = 0;
        for (let key of keyIter) {
            console.time('yields parsed key')
            // console.log(key);
            console.timeEnd('yields parsed key')
            count++
        }
        assert.equal(count, 3);

    })

    it('values', async () => {

        for (let i = 0; i < 3; i++) {
            await map.set(i, i.toString());
        }

        console.time('get Values Iter');
        let valuesIter = await map.values();
        console.timeEnd('get Values Iter');
        let count = 0;
        for (let value of valuesIter) {
            console.time('yields parsed value')
            console.log(value);
            console.timeEnd('yields parsed value')
            count++
        }
        assert.equal(count, 3);
    })


    it('Symbol.iterator', async () => {

        for (let i = 0; i < 3; i++) {
            await map.set(i, i.toString());
        }

        let kvs = [];

        for (var p of await map.entries()) {
            let [k, v] = await p;
            kvs.push([k, v]);
        }

        assert.deepEqual(kvs, [[0, '0'], [1, '1'], [2, '2']]);

        kvs = [];

        console.time('await iterator and iterate over ...[k,v]');
        for (var p of await map[Symbol.iterator]()) {
            console.time('await [k,v]');
            let [k, v] = await p;
            console.timeEnd('await [k,v]');
            kvs.push([k, v]);
        }
        console.timeEnd('await iterator and iterate over ...[k,v]');

        assert.deepEqual(kvs, [[0, '0'], [1, '1'], [2, '2']]);
    })

    it('forEach', async () => {
        
        for (let i = 0; i < 3; i++) {
            await map.set(i, i.toString());
        }

        let entries = [];

        console.time('Await Foreach Key/Value');
        
        await map.forEach((v,k) => {
            console.time('each: Key/Value')            
            entries.push( {key: k, value: v});
            console.timeEnd('each: Key/Value')
        });

        console.timeEnd('Await Foreach Key/Value')
        
        assert.deepEqual([{key: 0, value: '0'},{key: 1, value: '1'},{key: 2, value: '2'} ], entries);
    })

    it('has',async  ()=>{
        
         for (let i = 0; i < 3; i++) {
            await map.set(i, i.toString());
        }        
        
        assert.isTrue(await map.has(1));
        
        assert.isFalse(await map.has(3));
    })
    

});



