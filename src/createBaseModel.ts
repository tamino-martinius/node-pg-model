import {
  ModelInstance,
  ModelClass,
  Schema,
  QueryBy,
  FindBy,
  Filter,
  Changes,
  Order,
  Dict,
  Columns,
  BaseType,
} from './types';

import {
  getConnector,
} from './getConnector';

import {
  camelToSnakeCase,
  staticImplements,
} from './util';

import {
  Pool,
} from 'pg';

export function createBaseModel<S extends Schema>(): ModelClass<S> {
  @staticImplements<ModelClass<S>>()
  class Class {
    private static cachedColumnNames: Dict<string> | undefined;
    static pool = new Pool();
    static tableName = '';
    static identifier: keyof S = 'id';
    static columns: Columns<S> = {};
    static filter: Filter<S> = {};
    static limit: number | undefined = undefined;
    static skip: number | undefined = undefined;
    static order: Order<S>[] = [];
    static connector = getConnector<S>();
    persistentAttributes: Partial<S> = {};

    static get keys(): (keyof S)[] {
      const keys: (keyof S)[] = [];
      for (const key in this.columns) {
        keys.push(key);
      }
      return keys;
    }

    static get columnNames(): Dict<string> {
      if (this.cachedColumnNames) {
        return this.cachedColumnNames;
      }
      const columnNames: Dict<string> = {};
      for (const column in this.columns) {
        const pgColumnName = camelToSnakeCase(column);
        columnNames[column] = pgColumnName;
        columnNames[pgColumnName] = column;
      }
      return this.cachedColumnNames = columnNames;
    }

    static limitBy<T extends ModelClass<S>>(this: T, amount: number): T {
      /// @ts-ignore
      return class extends this {
        static limit: number | undefined = amount;
      };
    }

    static unlimited<T extends ModelClass<S>>(this: T): T {
      /// @ts-ignore
      return class extends this {
        static limit: number | undefined = undefined;
      };
    }

    static skipBy<T extends ModelClass<S>>(this: T, amount: number): T {
      /// @ts-ignore
      return class extends this {
        static skip: number | undefined = amount;
      };
    }

    static unskipped<T extends ModelClass<S>>(this: T): T {
      /// @ts-ignore
      return class extends this {
        static skip: number | undefined = undefined;
      };
    }

    static orderBy<T extends ModelClass<S>>(this: T, order: Order<S>): T {
      const currentOrder = this.order;

      /// @ts-ignore
      return class extends this {
        static order: Order<S>[] = [...currentOrder, order];
      };
    }

    static reorder<T extends ModelClass<S>>(this: T, order: Order<S>): T {
      /// @ts-ignore
      return class extends this {
        static order: Order<S>[] = [order];
      };
    }

    static unordered<T extends ModelClass<S>>(this: T): T {
      /// @ts-ignore
      return class extends this {
        static order: Order<S>[] = [];
      };
    }

    static filterBy<T extends ModelClass<S>>(this: T, filter: Filter<S>): T {
      const currentFilter = this.filter;

      /// @ts-ignore
      return class extends this {
        static filter: Filter<S> = { $and: [currentFilter, filter] };
      };
    }

    static unfiltered<T extends ModelClass<S>>(this: T): T {
      /// @ts-ignore
      return class extends this {
        static filter: Filter<S> = {};
      };
    }

    static queryBy<T extends ModelClass<S>>(this: T): QueryBy<T, S> {
      const queryBy = <QueryBy<T, S>>{};
      for (const key in this.columns) {
        queryBy[key] = value => this.filterBy(
          Array.isArray(value)
            ? <Filter<any>>{ $in: { [key]: value } }
            : <Filter<any>>{ [key]: value },
        );
      }
      return queryBy;
    }

    static all<T extends ModelInstance<S>>(this: { new(): T }): Promise<T[]> {
      /// @ts-ignore
      return this.connector.query(this);
    }

    static async updateAll<T extends ModelClass<S>>(this: T, attrs: Partial<S>): Promise<T> {
      await this.connector.updateAll(this, attrs);
      return this;
    }

    static async deleteAll<T extends ModelClass<S>>(this: T): Promise<T> {
      await this.connector.deleteAll(this);
      return this;
    }

    static async inBatchesOf<T extends ModelInstance<S>>(
      this: { new(): T },
      amount: number,
    ): Promise<Promise<T[]>[]> {
      const count = await (<ModelClass<S>><any>this).count();
      const batchCount = Math.ceil(count / amount);
      if (batchCount > 0 && batchCount < Number.MAX_SAFE_INTEGER) {
        const subqueries: Promise<Class[]>[] = [];
        for (let batchIndex = 0; batchIndex < batchCount; batchIndex += 1) {
          const skip = ((<ModelClass<S>><any>this).skip || 0) + batchIndex * amount;
          const limit = batchIndex !== batchCount - 1 ? amount : count - (batchCount - 1) * amount;
          /// @ts-ignore
          subqueries.push(this.skipBy(skip).limitBy(limit).all());
        }
        /// @ts-ignore
        return subqueries;
      }
      return [];
    }

    static first<T extends ModelInstance<S>>(this: { new(): T }): Promise<T | undefined> {
      /// @ts-ignore
      return this.limitBy(1).all().then(instances => instances[0]);
    }

    static find<T extends ModelInstance<S>>(
      this: { new(): T },
      filter: Filter<S>,
    ): Promise<T | undefined> {
      /// @ts-ignore
      return this.filterBy(filter).first;
    }

    static findBy<T extends ModelInstance<S>>(this: { new(): T }): FindBy<T, S> {
      const findBy = <FindBy<T, S>>{};
      /// @ts-ignore
      for (const key in this.columns) {
        /// @ts-ignore
        findBy[key] = value => this.find(Array.isArray(value)
          ? <Filter<any>>{ $in: { [key]: value } }
          : <Filter<any>>{ [key]: value },
        );
      }
      return findBy;
    }

    static count(): Promise<number> {
      /// @ts-ignore
      return this.connector.count(this);
    }

    static async pluck(column: string): Promise<any[]> {
      return (await this.select([column])).map(items => items[0]);
    }

    static select(columns: string[]): Promise<Dict<any>[]> {
      /// @ts-ignore
      return this.connector.select(this, columns);
    }

    static execute(query: string, bindings: BaseType[]): Promise<Dict<any>[]> {
      /// @ts-ignore
      return this.connector.execute(this, query, bindings);
    }

    constructor(attrs: S) {
      this.assign(attrs);
    }

    static build<T extends ModelInstance<S>>(this: { new(): T }, attrs: S): T {
      /// @ts-ignore
      return new this(attrs);
    }

    static create<T extends ModelInstance<S>>(this: { new(): T }, attrs: S): Promise<T> {
      /// @ts-ignore
      return new this(attrs).save();
    }

    model<T extends ModelClass<S>>(this: T): T {
      const constructor: typeof Class = <any>this.constructor;
      const identifier = constructor.identifier;
      const query = { [identifier]: (<Partial<S>><any>this)[identifier] };
      /// @ts-ignore
      return class extends constructor {
        static filter: Filter<S> = query;
        static limit: number | undefined = undefined;
        static skip: number | undefined = undefined;
      };
    }

    get attributes(): Partial<S> {
      const attrs: Partial<S> = {};
      for (const key in this.model().columns) {
        attrs[key] = (<Partial<S>><any>this)[key];
      }
      return attrs;
    }

    get isNew(): boolean {
      return !(<Partial<S>><any>this)[this.model.identifier];
    }

    get isPersistent(): boolean {
      return !this.isNew;
    }

    get isChanged(): boolean {
      return Object.keys(this.changes).length > 0;
    }

    get changes(): Partial<Changes<S>> {
      const attributes = this.attributes;
      const changes: Partial<Changes<S>> = {};
      for (const key in this.model.columns) {
        if (attributes[key] !== this.persistentAttributes[key]) {
          const before = this.persistentAttributes[key];
          const after = attributes[key];
          changes[key] = <any>{ before, after };
        }
      }
      return changes;
    }

    get changeSet(): Partial<S> {
      const attributes = this.attributes;
      const changes: Partial<S> = {};
      for (const key in this.model.columns) {
        if (attributes[key] !== this.persistentAttributes[key]) {
          changes[key] = attributes[key];
        }
      }
      return changes;
    }

    assign<T extends ModelInstance<S>>(this: { new(): T }, attrs: Partial<S>): T {
      for (const key in attrs) {
        (<any>this)[key] = attrs[key];
      }
      /// @ts-ignore
      return this;
    }

    revertChange<T extends ModelInstance<S>>(this: { new(): T }, key: keyof S): T {
      /// @ts-ignore
      (<any>this)[key] = this.persistentAttributes[key];
      /// @ts-ignore
      return this;
    }

    revertChanges<T extends ModelInstance<S>>(this: { new(): T }): T {
      /// @ts-ignore
      for (const key of this.model().keys) {
        /// @ts-ignore
        this.revertChange(key);
      }
      /// @ts-ignore
      return this;
    }

    save<T extends ModelInstance<S>>(this: { new(): T }): Promise<T> {
      /// @ts-ignore
      return this.isNew
        /// @ts-ignore
        ? <Promise<Class>>this.model().connector.create(this)
        /// @ts-ignore
        : <Promise<Class>>this.model().connector.update(this)
        ;
    }

    delete<T extends ModelInstance<S>>(this: { new(): T }): Promise<T> {
      /// @ts-ignore
      return <Promise<Class>>this.model.connector.delete(this);
    }

    reload<T extends ModelInstance<S>>(this: { new(): T }): Promise<T | undefined> {
      /// @ts-ignore
      return this.model().first;
    }
  }

  return Class;
}
