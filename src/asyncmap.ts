import * as Rx from 'rx';
import * as sqliteAsync from './sqliteAsync';
import {Database} from "sqlite3";
import {eachAsync, execAsync, allAsync} from "./sqliteAsync";
import {ObservableBase, KeyValue } from './ObservableBase'
import {isEmpty} from './checks';

/***
 * Can't implement Map<K,Promise<V>> without breaking it's contract, but it's pretty close
 */
export class AsyncMap<K, V> extends ObservableBase /*implements Map<K,Promise<V>>*/ {
    /***
     * db: underkying db, _storeName is Table name in Sqlite
     */
    constructor(private db: Database, private _storeName: string) {
        //...        
        super();

        this._errors = new Rx.Subject<Error>();

        sqliteAsync.execAsync(db, `create table if not exists ${this.storeName} (key text unique, value blob)`)
            .then(() => {
                this.isReady = true;
            })
            .catch(this.onError)
    }

    /***
     * provides postfixed table name 
     */
    get storeName(): string {
        return `${this._storeName}_store`
    }

    _ready: boolean = false;

    /***
     * flag: currently used to know underlying db is ready, on changed triggers event: Rx.Observable<EventArg>  
     */
    get isReady(): boolean {
        return this._ready;
    }

    set isReady(value: boolean) {
        if (this._ready == value) return;
        this._ready = value;
        this.publish('ready', value);
    }

    /***
     * resoves when ready 
     */
    ready(): Promise<this> {
        if (this.isReady) {
            return Promise.resolve(this);
        }

        return Promise.resolve(this.on('ready').take(1).toPromise()).then(() => this);
    }

    /***
     * Drop inner table 
     */
    drop(): Promise<this> {
        return execAsync(this.db, `drop table ${this.storeName}`).then(x => this);
    }

    /***
     * Easy error redirection?
     */
    private onError = (e) => {
        if (e) {
            this._errors.onNext(e);
        }
    };

    /***
     * async: Remove all entries
     */
    clear(): Promise<this> {
        return sqliteAsync.execAsync(this.db, `delete from ${this.storeName}`).then(() => {
            this.publish('clear', true);
        })
            .then(x => this)
            .catch(this.onError);
    }

    /***
     * Delete specified key 
     */
    delete(key: K): Promise<boolean> {
        return sqliteAsync.execAsync(this.db,
            `delete ${this.storeName} where key = '${key}'`)
            .then(() => {
                this.publish('delete', { key: key, value: true });
                return true;
            })
            .catch(this.onError)
    }

    /***
     * return value where key = 'key'
     */
    get(key: K): Promise<V> {
        var query = `SELECT value from ${this.storeName} where key = '${key}'`;
        return sqliteAsync
            .allAsync<KeyValue>(this.db, query)
            .then(x =>
                x[0]
            )
            .then(x =>
                x && x.value ? JSON.parse(x.value) : null
            )
            .catch(this.onError);
    }

    /**
     * set value for key 
     */
    set(key: K, v?: V): Promise<this> {
        var insert = `INSERT OR REPLACE INTO ${this.storeName} (key,value) VALUES ('${key}', '${JSON.stringify(v)}')`;
        return sqliteAsync.execAsync(this.db, insert)
            .then((v) => {
                this.publish('set', { key: key, value: true });
                return this;
            })
            .catch(this.onError);
    };

    private _errors = new Rx.Subject<Error>();

    /***
     * Easy subscription
     */
    get errors(): Rx.Observable<Error> {
        return this._errors.asObservable();
    }

    /**
     * does Map/store/table has Key 
     */
    has(key: K): Promise<boolean> {
        return allAsync<{ key?: string }>(this.db, `select key from ${this.storeName} where key = '${key}'`).then(r => !isEmpty(r[0]));

    }

    /***
     * get next key from provided number: Skip(numner) , Take(1);
     */
    nextKey(from: number): Promise<K> {

        return allAsync<{ key: K }>(this.db,
            `select key from ${this.storeName} order by key limit ${from}, 1`)
            .then(x => {
                let f = x[0];
                return f ? f.key : null;
            });
    }

    /***
     * not sure is that obvious: but we need to await|yield|then... to access the Iterator, from there on it's sync
     */
    async keys(): Promise<IterableIterator<K>> {

        let results = await allAsync<{ key?: string }>(this.db, `select key from ${this.storeName}`);

        return function* () {
            for (let result of results) {
                yield JSON.parse(result.key);
            }
        } ();
    }

    /**
     * Number of records
     */
    get size(): Promise<number> {
        return allAsync<{ size?: number }>(this.db, `select count(*) size from ${this.storeName}`).then(result => result[0].size);
    }

    /***
     * select values from store/table
     */
    getValues(): Promise<string[]> {
        return allAsync<{ value?: string }>(this.db, `select value from ${this.storeName}`).then(x => x.map(y => y.value));
    }

    /***
     * for(let value of await/yield map.values()) ... from there syncs... 
     */
    async values(): Promise<IterableIterator<V>> {
        let values = await this.getValues();
        return function* () {
            for (let value of values) {
                yield JSON.parse(value);
            }
        } ();
    }

    /***
     * promise of {key,value}[]'s ... 
     */
    getKeyValues(): Promise<{ key?: string, value?: string }[]> {
        return allAsync<{ key?: string, value?: string }>(this.db, `select key,value from ${this.storeName}`);
        //.then(x=> x.map(y=> [y.key, y.value]));
    }


    /***
     * Quite unsure about this , but it seems to work :), I really doubt  interoperability  ... , but its there... 
     */
    [Symbol.iterator](): Promise<IterableIterator<Promise<[K, V]>>> {
        return this.entries()
    }

    [Symbol.toStringTag]: "AsyncMap";

    /***
     * lot let us for..of ..entries , if that makes sense .... , again  obtaining the Iter is Async so: async/yield/then... with iter ... 
     */
    async entries(): Promise<IterableIterator<Promise<[K, V]>>> {
        let me = this;
        let keys = await this.keys();
        return function* () {
            for (let key of keys) {
                yield me.get(key).then(value => [key, value])
            }
        } ()
    }

    /** foreach {key,value} an action ... */
    forEach(callBack: (value: V, key: K) => void): Promise<void> {
        return new Promise<void>(async (resolve, reject) => {
            let keys = await this.keys();
            try {
                for (let key of keys) {
                    let value = await this.get(key);
                    callBack(value, key);
                }
                resolve();
            } catch (e) {
                reject(e);
            }
        });
    }

    /***
     * Fires once, uses when(). and Takes(1)
     */
    on(eventKey: string): Rx.Observable<KeyValue> {
        return this.events.where(e => e.args.key == eventKey)
            .select(e => e.args)
            .take(1);
    }

    /***
     * Fires many times,dispose it when done 
     */
    when(eventKey: string): Rx.Observable<KeyValue> {
        return this.events.where(e => e.args.key == eventKey)
            .select(e => e.args);
    }
}