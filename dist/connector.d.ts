import { ModelStatic, ModelConstructor, Identifiable, Bindings, Storage, ConnectorConstructor } from './types';
export declare class Connector<S extends Identifiable> implements ConnectorConstructor<S> {
    private storage;
    constructor(storage?: Storage);
    private collection(model);
    private items(model);
    private propertyFilter(items, filter);
    private andFilter(items, filters);
    private notFilter(items, filter);
    private orFilter(items, filters);
    private inFilter(items, filter);
    private notInFilter(items, filter);
    private nullFilter(items, key);
    private notNullFilter(items, key);
    private betweenFilter(items, filter);
    private notBetweenFilter(items, filter);
    private gtFilter(items, filter);
    private gteFilter(items, filter);
    private ltFilter(items, filter);
    private lteFilter(items, filter);
    private rawFilter(items, filter);
    private asyncFilter(items, asyncFilter);
    private specialFilter(items, filter);
    private filter(items, filter);
    query(model: ModelStatic<S>): Promise<ModelConstructor<S>[]>;
    count(model: ModelStatic<S>): Promise<number>;
    select(model: ModelStatic<S>, ...keys: (keyof S)[]): Promise<S[keyof S][][]>;
    updateAll(model: ModelStatic<S>, attrs: Partial<S>): Promise<number>;
    deleteAll(model: ModelStatic<S>): Promise<number>;
    create(instance: ModelConstructor<S>): Promise<ModelConstructor<S>>;
    update(instance: ModelConstructor<S>): Promise<ModelConstructor<S>>;
    delete(instance: ModelConstructor<S>): Promise<ModelConstructor<S>>;
    execute(query: string, bindings: Bindings): Promise<any[]>;
}
export default Connector;
