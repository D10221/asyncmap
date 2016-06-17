import * as path from 'path';
import {Database} from 'sqlite3';
import {AsyncMap} from'./asyncmap';
import {assert} from 'chai';
import {Thing} from './thing';

describe('AsymncMap<Thing>',()=>{
    
    const db = new Database(":memory:");

    let things : AsyncMap<number,Thing>; 

    beforeEach(async ()=>{
        things = await new AsyncMap<number, Thing>(db, 'things').ready().then(map=> map.clear());
    })

    it('set/get', async () => {
        console.time('set thing');
        await things.set(0, new Thing(0, '0'));
        console.timeEnd('set thing');

        console.time('get thing');
        let thing = await things.get(0);
        console.timeEnd('get thing');
        assert.deepEqual(thing, new Thing(0, '0'));
    });

    
})