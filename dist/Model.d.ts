import { ModelConstructor, ModelStatic, ModelStaticClass, Schema, Filter, Order, QueryByModel, FindByModel, Dict } from './types';
export declare class Model<S extends Schema, M extends ModelStatic<S>, I extends ModelConstructor<S>> extends ModelStaticClass<S, M, I> {
    model: M;
    constructor(model: M);
    limitBy(amount: number): M;
    readonly unlimited: M;
    skipBy(amount: number): M;
    readonly unskipped: M;
    orderBy(order: Partial<Order<S>>): M;
    reorder(order: Partial<Order<S>>): M;
    readonly unordered: M;
    filterBy(filter: Filter<S>): M;
    readonly queryBy: QueryByModel<S, M>;
    readonly unfiltered: M;
    readonly all: Promise<I[]>;
    pluck(column: string): Promise<any[]>;
    select(columns: string[]): Promise<Dict<any>[]>;
    updateAll(attrs: Partial<S>): Promise<M>;
    deleteAll(): Promise<I>;
    inBatchesOf(amount: number): Promise<Promise<I[]>[]>;
    readonly first: Promise<I | undefined>;
    find(query: Filter<S>): Promise<I | undefined>;
    readonly findBy: FindByModel<S, I>;
    readonly count: Promise<number>;
    build(attrs: S): I;
    create(attrs: S): Promise<I>;
}
