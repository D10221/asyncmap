Sqlite Persisted Asyncronous KeyValue store , ES6 Map<K,V> like where K is Key Type and V is Value type :

mimicking ES6 Map<K,V> interface but not implementing it fully:

AsyncMap<K, V> {
    
    /***
     * db: underlying db, _storeName is Table name in Sqlite
     */
    constructor(db: Database, _storeName: string);
    
    /***
     * provides postfixed table name
     */
    get storeName(): string;

    
    /***
     * flag: currently used to know underlying db is ready, on changed triggers event: Rx.Observable<EventArg>
     */
    isReady: boolean;
    
    /***
     * resoves when ready
     */
    ready(): Promise<this>;
    
    /***
     * Drop inner table
     */
    drop(): Promise<this>;
    
    
    /***
     * async: Remove all entries
     */
    clear(): Promise<this>;
    
    /***
     * Delete specified key
     */
    delete(key: K): Promise<boolean>;
    
    /***
     * return value where key = 'key'
     */
    get(key: K): Promise<V>;
    
    /**
     * set value for key
     */
    set(key: K, v?: V): Promise<this>;
        
    /***
     * Easy subscription
     */
    get errors(): Rx.Observable<Error>;
    
    /**
     * does Map/store/table has Key
     */
    has(key: K): Promise<boolean>;
    
    /***
     * get next key from provided number: Skip(numner) , Take(1);
     */
    nextKey(from: number): Promise<K>;
    
    /***
     * not sure is that obvious: but we need to await|yield|then... to access the Iterator, from there on it's sync
     */
    keys(): Promise<IterableIterator<K>>;
    
    /**
     * Number of records
     */
    size: Promise<number>;
    
    /***
     * select values from store/table
     */
    getValues(): Promise<string[]>;
    
    /***
     * for(let value of await/yield map.values()) ... from there syncs...
     */
    values(): Promise<IterableIterator<V>>;
    
    /***
     * promise of {key,value}[]'s ...
     */
    getKeyValues(): Promise<{
        key?: string;
        value?: string;
    }[]>;
    
    /***
     * Quite unsure about this , but it seems to work :), I really doubt  interoperability  ... , but its there...
     */
    [Symbol.iterator](): Promise<IterableIterator<Promise<[K, V]>>>;
    [Symbol.toStringTag]: "AsyncMap";
    
    /***
     * lot let us for..of ..entries , if that makes sense .... , again  obtaining the Iter is Async so: async/yield/then... with iter ...
     */
    entries(): Promise<IterableIterator<Promise<[K, V]>>>;
    
    /** foreach {key,value} an action ... */
    forEach(callBack: (value: V, key: K) => void): Promise<void>;
    
    /***
     * Fires once, uses when(). and Takes(1)
     */
    on(eventKey: string): Rx.Observable<KeyValue>;
    
    /***
     * Fires many times,dispose it when done, event keys currently in ['set', 'delete','ready'] args.value may vary    
     */
    when(eventKey: string): Rx.Observable<KeyValue>;
}






