import { Column } from './column';
import { Pool } from 'pg';

export interface Dict<T> {
  [key: string]: T;
}
export type Tuple<T, U = T> = [T, U];

export interface Range<T> {
  from: T;
  to: T;
}

export type Schema = Dict<any>;

export type BaseType = number | string | boolean | null | undefined;

export type FilterIn<S extends Schema> = {
  [K in keyof S]: S[K][];
};

export type FilterBetween<S extends Schema> = {
  [K in keyof S]: Range<S[K]>;
};

export interface FilterRaw {
  $bindings: BaseType[];
  $query: string;
}

export type Filter<S extends Schema> =
  Partial<S> |
  Partial<FilterSpecial<S>>;

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

export enum Direction {
  Asc = 'ASC',
  Desc = 'DESC',
}

// "{ new(): T }"
// is from https://www.typescriptlang.org/docs/handbook/generics.html#using-class-types-in-generics
export interface Constructor<M> {
  new(...args: any[]): M;
}

export type SchemaMapping<S extends Schema, T> = {
  [K in keyof S]: T;
};

export type Columns<S extends Schema> = Partial<SchemaMapping<S, Column>>;
export type Order<S extends Schema> = Partial<SchemaMapping<S, Direction>>;
export type ColumnMapping = Dict<string>;

export type QueryBy<T extends ModelClass<S>, S extends Schema> = {
  [P in keyof S]: (value: S[P] | S[P][]) => T;
};

export type FindBy<T extends ModelInstance<S>, S extends Schema> = {
  [P in keyof S]: (value: S[P] | S[P][]) => Promise<T | undefined>;
};

export type Changes<S extends Schema> = {
  [P in keyof S]: {
    before: S[P] | undefined,
    after: S[P] | undefined,
  };
};

export interface Connector<S extends Schema> {
  query(model: ModelClass<S>): Promise<ModelInstance<S>[]>;
  count(model: ModelClass<S>): Promise<number>;
  select(model: ModelClass<S>, columns: string[]): Promise<Dict<any>[]>;
  updateAll(model: ModelClass<S>, attrs: Partial<S>): Promise<number>;
  deleteAll(model: ModelClass<S>): Promise<number>;
  create(instance: ModelInstance<S>): Promise<ModelInstance<S>>;
  update(instance: ModelInstance<S>): Promise<ModelInstance<S>>;
  delete(instance: ModelInstance<S>): Promise<ModelInstance<S>>;
  execute(model: ModelClass<S>, query: string, bindings: BaseType[]): Promise<Dict<any>[]>;
}

export interface ModelClass<S extends Schema> extends Function {
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

  limitBy<T extends ModelClass<S>>(this: T, amount: number): T;
  unlimited<T extends ModelClass<S>>(this: T): T;
  skipBy<T extends ModelClass<S>>(this: T, amount: number): T;
  unskipped<T extends ModelClass<S>>(this: T): T;
  orderBy<T extends ModelClass<S>>(this: T, order: Partial<Order<S>>): T;
  reorder<T extends ModelClass<S>>(this: T, order: Partial<Order<S>>): T;
  unordered<T extends ModelClass<S>>(this: T): T;
  filterBy<T extends ModelClass<S>>(this: T, filter: Filter<S>): T;
  unfiltered<T extends ModelClass<S>>(this: T): T;
  queryBy<T extends ModelClass<S>>(this: T): QueryBy<T, S>;
  all<T extends ModelInstance<S>>(this: { new(): T }): Promise<T[]>;
  pluck(column: string): Promise<any[]>;
  select(columns: string[]): Promise<Dict<any>[]>;
  updateAll<T extends ModelClass<S>>(this: T, attrs: Partial<S>): Promise<T>;
  deleteAll<T extends ModelClass<S>>(this: T): Promise<T>;
  inBatchesOf<T extends ModelInstance<S>>(this: { new(): T }, n: number): Promise<Promise<T[]>[]>;
  first<T extends ModelInstance<S>>(this: { new(): T }): Promise<T | undefined>;
  find<T extends ModelInstance<S>>(this: { new(): T }, query: Filter<S>): Promise<T | undefined>;
  findBy<T extends ModelInstance<S>>(this: { new(): T }): FindBy<T, S>;
  count(): Promise<number>;
  execute(query: string, bindings: BaseType[]): Promise<Dict<any>[]>;
  new(attrs: S): ModelInstance<S>;
  build<T extends ModelInstance<S>>(this: { new(): T }, attrs: S): T;
  create<T extends ModelInstance<S>>(this: { new(): T }, attrs: S): Promise<T>;
  // prototype: S;
}

export interface ModelInstance<S extends Schema> {
  readonly attributes: Partial<S>;
  persistentAttributes: Partial<S>;
  readonly isNew: boolean;
  readonly isPersistent: boolean;
  readonly isChanged: boolean;
  readonly changes: Partial<Changes<S>>;
  readonly changeSet: Partial<S>;

  assign(attrs: Partial<S>): this;
  revertChange(key: keyof S): this;
  revertChanges(): this;

  save(): Promise<this>;
  delete(): Promise<this>;
  reload(): Promise<this | undefined>;
}
