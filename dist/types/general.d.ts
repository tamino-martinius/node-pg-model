import { Column } from './column';
import { Pool } from 'pg';
export interface Dict<T> {
    [key: string]: T;
}
export declare type Tuple<T, U = T> = [T, U];
export interface Range<T> {
    from: T;
    to: T;
}
export declare type Schema = Dict<any>;
export declare type BaseType = number | string | boolean | null | undefined;
export declare type FilterIn<S extends Schema> = {
    [K in keyof S]: S[K][];
};
export declare type FilterBetween<S extends Schema> = {
    [K in keyof S]: Range<S[K]>;
};
export interface FilterRaw {
    $bindings: BaseType[];
    $query: string;
}
export declare type Filter<S extends Schema> = Partial<S> | Partial<FilterSpecial<S>>;
export interface FilterSpecial<S extends Schema> {
    $and: Filter<S>[];
    $not: Filter<S>;
    $or: Filter<S>[];
    $in: Partial<FilterIn<S>>;
    $notIn: Partial<FilterIn<S>>;
    $null: keyof S;
    $notNull: keyof S;
    $between: Partial<FilterBetween<S>>;
    $notBetween: Partial<FilterBetween<S>>;
    $gt: Partial<S>;
    $gte: Partial<S>;
    $lt: Partial<S>;
    $lte: Partial<S>;
    $raw: FilterRaw;
    $async: Promise<Filter<S>>;
}
export declare enum Direction {
    Asc = "ASC",
    Desc = "DESC"
}
export interface Constructor<M> {
    new (...args: any[]): M;
}
export declare type SchemaMapping<S extends Schema, T> = {
    [K in keyof S]: T;
};
export declare type Columns<S extends Schema> = Partial<SchemaMapping<S, Column>>;
export declare type Order<S extends Schema> = Partial<SchemaMapping<S, Direction>>;
export declare type ColumnMapping = Dict<string>;
export declare type QueryBy<S extends Schema> = {
    [P in keyof S]: (value: S[P] | S[P][]) => ModelStatic<S>;
};
export declare type QueryByModel<S extends Schema, M extends ModelStatic<S>> = {
    [P in keyof S]: (value: S[P] | S[P][]) => M;
};
export declare type FindBy<S extends Schema> = {
    [P in keyof S]: (value: S[P] | S[P][]) => Promise<undefined | ModelConstructor<S>>;
};
export declare type FindByModel<S extends Schema, I extends ModelConstructor<S>> = {
    [P in keyof S]: (value: S[P] | S[P][]) => Promise<I | undefined>;
};
export declare type Find<S extends Schema> = (query: Filter<S>) => Promise<undefined | ModelConstructor<S>>;
export declare type Changes<S extends Schema> = {
    [P in keyof S]: {
        before: S[P] | undefined;
        after: S[P] | undefined;
    };
};
export interface Connector<S extends Schema> {
    query(model: ModelStatic<S>): Promise<ModelConstructor<S>[]>;
    count(model: ModelStatic<S>): Promise<number>;
    select(model: ModelStatic<S>, columns: string[]): Promise<Dict<any>[]>;
    updateAll(model: ModelStatic<S>, attrs: Partial<S>): Promise<number>;
    deleteAll(model: ModelStatic<S>): Promise<number>;
    create(instance: ModelConstructor<S>): Promise<ModelConstructor<S>>;
    update(instance: ModelConstructor<S>): Promise<ModelConstructor<S>>;
    delete(instance: ModelConstructor<S>): Promise<ModelConstructor<S>>;
    execute(model: ModelStatic<S>, query: string, bindings: BaseType[]): Promise<Dict<any>[]>;
}
export interface ModelStatic<S extends Schema> extends Function {
    readonly pool: Pool;
    readonly tableName: string;
    readonly identifier: keyof S;
    readonly columns: Columns<S>;
    readonly columnNames: Dict<string>;
    readonly filter: Filter<S>;
    readonly limit: number | undefined;
    readonly skip: number | undefined;
    readonly order: Order<S>[];
    readonly keys: (keyof S)[];
    readonly connector: Connector<S>;
    getTyped<M extends ModelStatic<S>, I extends ModelConstructor<S>>(): ModelStaticClass<S, M, I>;
    limitBy(amount: number): ModelStatic<S>;
    readonly unlimited: ModelStatic<S>;
    skipBy(amount: number): ModelStatic<S>;
    readonly unskipped: ModelStatic<S>;
    orderBy(order: Partial<Order<S>>): ModelStatic<S>;
    reorder(order: Partial<Order<S>>): ModelStatic<S>;
    readonly unordered: ModelStatic<S>;
    filterBy(filter: Filter<S>): ModelStatic<S>;
    readonly unfiltered: ModelStatic<S>;
    readonly queryBy: QueryBy<S>;
    readonly all: Promise<ModelConstructor<S>[]>;
    pluck(column: string): Promise<any[]>;
    select(columns: string[]): Promise<Dict<any>[]>;
    updateAll(attrs: Partial<S>): Promise<ModelStatic<S>>;
    deleteAll(): Promise<ModelStatic<S>>;
    inBatchesOf(amount: number): Promise<Promise<ModelConstructor<S>[]>[]>;
    readonly first: Promise<ModelConstructor<S> | undefined>;
    find(query: Filter<S>): Promise<undefined | ModelConstructor<S>>;
    readonly findBy: FindBy<S>;
    readonly count: Promise<number>;
    execute(query: string, bindings: BaseType[]): Promise<Dict<any>[]>;
    new (attrs: S): ModelConstructor<S>;
    build(attrs: S): ModelConstructor<S>;
    create(attrs: S): Promise<ModelConstructor<S>>;
}
export declare abstract class ModelStaticClass<S extends Schema, M extends ModelStatic<S>, I extends ModelConstructor<S>> {
    abstract limitBy(amount: number): M;
    abstract readonly unlimited: M;
    abstract skipBy(amount: number): M;
    abstract readonly unskipped: M;
    abstract orderBy(order: Partial<Order<S>>): M;
    abstract reorder(order: Partial<Order<S>>): M;
    abstract readonly unordered: M;
    abstract filterBy(query: Filter<S>): M;
    abstract readonly queryBy: QueryByModel<S, M>;
    abstract readonly unfiltered: M;
    abstract readonly all: Promise<I[]>;
    abstract pluck(column: string): Promise<any[]>;
    abstract select(columns: string[]): Promise<Dict<any>[]>;
    abstract updateAll(attrs: Partial<S>): Promise<M>;
    abstract deleteAll(): Promise<I>;
    abstract inBatchesOf(amount: number): Promise<Promise<I[]>[]>;
    abstract readonly first: Promise<I | undefined>;
    abstract find(query: Filter<S>): Promise<I | undefined>;
    abstract readonly findBy: FindByModel<S, I>;
    abstract readonly count: Promise<number>;
    abstract build(attrs: S | undefined): I;
    abstract create(attrs: S | undefined): Promise<I>;
}
export interface ModelConstructor<S extends Schema> {
    readonly attributes: Partial<S>;
    persistentAttributes: Partial<S>;
    readonly isNew: boolean;
    readonly isPersistent: boolean;
    readonly isChanged: boolean;
    readonly changes: Partial<Changes<S>>;
    readonly changeSet: Partial<S>;
    getTyped<M extends ModelStatic<S>, I extends ModelConstructor<S>>(): ModelConstructorClass<S, M, I>;
    readonly model: ModelStatic<S>;
    assign(attrs: Partial<S>): ModelConstructor<S>;
    revertChange(key: keyof S): ModelConstructor<S>;
    revertChanges(): ModelConstructor<S>;
    save(): Promise<ModelConstructor<S>>;
    delete(): Promise<ModelConstructor<S>>;
    reload(): Promise<ModelConstructor<S> | undefined>;
}
export declare abstract class ModelConstructorClass<S extends Schema, M extends ModelStatic<S>, I extends ModelConstructor<S>> {
    readonly model: M;
    abstract assign(attrs: Partial<S>): I;
    abstract revertChange(key: keyof S): I;
    abstract revertChanges(): I;
    abstract save(): Promise<I>;
    abstract delete(): Promise<I>;
    abstract reload(): Promise<I | undefined>;
}