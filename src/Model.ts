import {
  Dict,
} from './types';

import {
  Connector,
} from './Connector';

import {
  Pool,
} from 'pg';

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

export type Filter<S extends Schema = Dict<any>> =
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

export type SchemaMapping<S extends Dict<any>, T> = {
  [K in keyof S]: T;
};
export type Order<S extends Schema = Dict<any>> = Partial<SchemaMapping<S, Direction>>;
export type ColumnMapping = Dict<string>;

export type QueryBy<T extends typeof Model, S extends Schema = Dict<any>> = {
  [P in keyof S]: (value: S[P] | S[P][]) => T;
};

export type FindBy<T extends Model, S extends Schema = Dict<any>> = {
  [P in keyof S]: (value: S[P] | S[P][]) => Promise<T | undefined>;
};

export type Changes<S extends Schema> = {
  [P in keyof S]: {
    before: S[P] | undefined,
    after: S[P] | undefined,
  };
};

export function column() {
  return function (target: any, propertyKey: string) {
    target.keys.push(propertyKey);
  };
}

export class Model {
  static pool = new Pool();
  static tableName = '';
  static keys: string[] = [];
  static identifier: string = 'id';
  static filter: Filter = {};
  static limit: number | undefined = undefined;
  static skip: number | undefined = undefined;
  static order: Order[] = [];
  static connector = new Connector();
  static columnNames: Dict<string> = {};
  persistentAttributes: Dict<any> = {};

  static limitBy<S, I extends Model, M extends typeof Model & { new(attrs: S): I }>(
    this: M & { new(attrs: S): I },
    amount: number,
  ): M {
    /// @ts-ignore
    return class extends this {
      static limit: number | undefined = amount;
    };
  }

  static unlimited<S, I extends Model, M extends typeof Model & { new(attrs: S): I }>(
    this: M & { new(attrs: S): I },
  ): M {
    /// @ts-ignore
    return class extends this {
      static limit: number | undefined = undefined;
    };
  }

  static skipBy<S, I extends Model, M extends typeof Model & { new(attrs: S): I }>(
    this: M & { new(attrs: S): I },
    amount: number,
  ): M {
    /// @ts-ignore
    return class extends this {
      static skip: number | undefined = amount;
    };
  }

  static unskipped<S, I extends Model, M extends typeof Model & { new(attrs: S): I }>(
    this: M & { new(attrs: S): I },
  ): M {
    /// @ts-ignore
    return class extends this {
      static skip: number | undefined = undefined;
    };
  }

  static orderBy<S, I extends Model, M extends typeof Model & { new(attrs: S): I }>(
    this: M & { new(attrs: S): I },
    order: Order<S>,
  ): M {
    const currentOrder = this.order;

    /// @ts-ignore
    return class extends this {
      /// @ts-ignore
      static order: Order<S>[] = [...currentOrder, order];
    };
  }

  static reorder<S, I extends Model, M extends typeof Model & { new(attrs: S): I }>(
    this: M & { new(attrs: S): I },
    order: Order<S>,
  ): M {
    /// @ts-ignore
    return class extends this {
      static order: Order<S>[] = [order];
    };
  }

  static unordered<S, I extends Model, M extends typeof Model & { new(attrs: S): I }>(
    this: M & { new(attrs: S): I },
  ): M {
    /// @ts-ignore
    return class extends this {
      static order: Order<S>[] = [];
    };
  }

  static filterBy<S, I extends Model, M extends typeof Model & { new(attrs: S): I }>(
    this: M & { new(attrs: S): I },
    filter: Filter<S>,
  ): M {
    const currentFilter = this.filter;

    /// @ts-ignore
    return class extends this {
      static filter: Filter<S> = { $and: [currentFilter, filter] };
    };
  }

  static unfiltered<S, I extends Model, M extends typeof Model & { new(attrs: S): I }>(
    this: M & { new(attrs: S): I },
  ): M {
    /// @ts-ignore
    return class extends this {
      static filter: Filter<S> = {};
    };
  }

  static queryBy<S, I extends Model, M extends typeof Model & { new(attrs: S): I }>(
    this: M & { new(attrs: S): I },
  ): QueryBy<M, S> {
    const queryBy = <QueryBy<M, S>>{};
    for (const key in this.keys) {
      queryBy[<keyof S>key] = value => this.filterBy(
        Array.isArray(value)
          ? <Filter<any>>{ $in: { [key]: value } }
          : <Filter<any>>{ [key]: value },
      );
    }
    return queryBy;
  }

  static all<S, I extends Model, M extends typeof Model & { new(attrs: S): I }>(
    this: M & { new(attrs: S): I },
  ): Promise<I[]> {
    return <Promise<I[]>>this.connector.query(this);
  }

  static async updateAll<S, I extends Model, M extends typeof Model & { new(attrs: S): I }>(
    this: M & { new(attrs: S): I },
    attrs: Partial<S>,
  ): Promise<M> {
    await this.connector.updateAll(this, attrs);
    return this;
  }

  static async deleteAll<S, I extends Model, M extends typeof Model & { new(attrs: S): I }>(
    this: M & { new(attrs: S): I },
  ): Promise<M> {
    await this.connector.deleteAll(this);
    return this;
  }

  static async inBatchesOf<S, I extends Model, M extends typeof Model & { new(attrs: S): I }>(
    this: M & { new(attrs: S): I },
    amount: number,
  ): Promise<Promise<I[]>[]> {
    const count = await (<typeof Model><any>this).count();
    const batchCount = Math.ceil(count / amount);
    if (batchCount > 0 && batchCount < Number.MAX_SAFE_INTEGER) {
      const subqueries: Promise<I[]>[] = [];
      for (let batchIndex = 0; batchIndex < batchCount; batchIndex += 1) {
        const skip = ((<typeof Model><any>this).skip || 0) + batchIndex * amount;
        const limit = batchIndex !== batchCount - 1 ? amount : count - (batchCount - 1) * amount;
        subqueries.push(this.skipBy(skip).limitBy(limit).all());
      }
      return subqueries;
    }
    return [];
  }

  static first<S, I extends Model, M extends typeof Model & { new(attrs: S): I }>(
    this: M & { new(attrs: S): I },
  ): Promise<I | undefined> {
    return this.limitBy(1).all().then(instances => instances[0]);
  }

  static find<S, I extends Model, M extends typeof Model & { new(attrs: S): I }>(
    this: M & { new(attrs: S): I },
    filter: Filter<S>,
  ): Promise<I | undefined> {
    return this.filterBy(filter).first();
  }

  static findBy<S, I extends Model, M extends typeof Model & { new(attrs: S): I }>(
    this: M & { new(attrs: S): I },
  ): FindBy<I, S> {
    const findBy = <FindBy<I, S>>{};
    for (const key in this.keys) {
      findBy[<keyof S>key] = value => this.find(Array.isArray(value)
        ? <Filter<any>>{ $in: { [key]: value } }
        : <Filter<any>>{ [key]: value },
      );
    }
    return findBy;
  }

  static count<S, I extends Model, M extends typeof Model & { new(attrs: S): I }>(
    this: M & { new(attrs: S): I },
  ): Promise<number> {
    return this.connector.count(this);
  }

  static async pluck<S, I extends Model, M extends typeof Model & { new(attrs: S): I }>(
    this: M & { new(attrs: S): I },
    column: string,
  ): Promise<any[]> {
    return (await this.select([column])).map(items => items[0]);
  }

  static select<S, I extends Model, M extends typeof Model & { new(attrs: S): I }>(
    this: M & { new(attrs: S): I },
    columns: string[],
  ): Promise<Dict<any>[]> {
    return this.connector.select(this, columns);
  }

  static execute<S, I extends Model, M extends typeof Model & { new(attrs: S): I }>(
    this: M & { new(attrs: S): I },
    query: string,
    bindings: BaseType[],
  ): Promise<Dict<any>[]> {
    return this.connector.execute(this, query, bindings);
  }

  constructor(attrs: Dict<any>) {
    /// @ts-ignore
    this.assign(<Partial<S>>attrs);
  }

  static build<S, I extends Model, M extends typeof Model & { new(attrs: S): I }>(
    this: M & { new(attrs: S): I },
    attrs: S,
  ): I {
    /// @ts-ignore
    return new this(attrs);
  }

  static create<S, I extends Model, M extends typeof Model & { new(attrs: S): I }>(
    this: M & { new(attrs: S): I },
    attrs: S,
  ): Promise<I> {
    /// @ts-ignore
    return this.build(attrs).save();
  }

  model<S, I extends Model, M extends typeof Model & { new(attrs: S): I }>(this: I): M {
    const constructor: typeof Model = <any>this.constructor;
    const identifier = constructor.identifier;
    /// @ts-ignore
    const query = { [identifier]: this[identifier] };
    /// @ts-ignore
    return class extends constructor {
      static filter: Filter<S> = query;
      static limit: number | undefined = undefined;
      static skip: number | undefined = undefined;
    };
  }

  get attributes(): Dict<any> {
    const attrs: Dict<any> = {};
    for (const key in this.model().keys) {
      attrs[key] = (<any>this)[key];
    }
    return attrs;
  }

  get isNew(): boolean {
    return !(<any>this)[this.model().identifier];
  }

  get isPersistent(): boolean {
    return !this.isNew;
  }

  get isChanged(): boolean {
    return Object.keys(this.changes).length > 0;
  }

  get changes(): Dict<any> {
    const attributes = this.attributes;
    const changes: Dict<any> = {};
    for (const key in this.model().keys) {
      if (attributes[key] !== this.persistentAttributes[key]) {
        const before = this.persistentAttributes[key];
        const after = attributes[key];
        changes[key] = <any>{ before, after };
      }
    }
    return changes;
  }

  get changeSet(): Dict<any> {
    const attributes = this.attributes;
    const changes: Dict<any> = {};
    for (const key in this.model().keys) {
      if (attributes[key] !== this.persistentAttributes[key]) {
        changes[key] = attributes[key];
      }
    }
    return changes;
  }

  assign<S, I extends Model, _ extends typeof Model & { new(attrs: S): I }>(
    this: I,
    attrs: Dict<any>,
  ): I {
    for (const key in attrs) {
      (<any>this)[key] = attrs[key];
    }
    return this;
  }

  revertChange<S, I extends Model, _ extends typeof Model & { new(attrs: S): I }>(
    this: I,
    key: string,
  ): I {
    (<any>this)[key] = this.persistentAttributes[key];
    return this;
  }

  revertChanges<S, I extends Model, _ extends typeof Model & { new(attrs: S): I }>(
    this: I,
  ): I {
    for (const key of this.model().keys) {
      this.revertChange(key);
    }
    return this;
  }

  save<S, I extends Model, _ extends typeof Model & { new(attrs: S): I }>(
    this: I,
  ): Promise<I> {
    return this.isNew
      ? <Promise<I>>this.model().connector.create(this)
      : <Promise<I>>this.model().connector.update(this)
      ;
  }

  delete<S, I extends Model, _ extends typeof Model & { new(attrs: S): I }>(
    this: I,
  ): Promise<I> {
    return <Promise<I>>this.model().connector.delete(this);
  }

  reload<S, I extends Model, _ extends typeof Model & { new(attrs: S): I }>(
    this: I,
  ): Promise<I | undefined> {
    return this.model().first();
  }
}

export default Model;
