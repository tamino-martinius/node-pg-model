import {
  ModelConstructor,
  ModelStatic,
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
  staticImplements,
} from './util';

import {
  Model,
} from './Model';

import {
  Instance,
} from './Instance';

import {
  Pool,
} from 'pg';

export function createBaseModel<S extends Schema>(): ModelStatic<S> {
  @staticImplements<ModelStatic<S>>()
  class Class {
    static pool = new Pool();
    static tableName = '';
    static identifier: keyof S = '';
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

    static getTyped<M extends ModelStatic<S>, I extends ModelConstructor<S>>(): Model<S, M, I> {
      return new Model<S, M, I>(<any>this);
    }

    static limitBy(amount: number): typeof Class {
      return class extends this {
        static limit: number | undefined = amount;
      };
    }

    static get unlimited(): typeof Class {
      return class extends this {
        static limit: number | undefined = undefined;
      };
    }

    static skipBy(amount: number): typeof Class {
      return class extends this {
        static skip: number | undefined = amount;
      };
    }

    static get unskipped(): typeof Class {
      return class extends this {
        static skip: number | undefined = undefined;
      };
    }

    static orderBy(order: Order<S>): typeof Class {
      const currentOrder = this.order;

      return class extends this {
        static order: Order<S>[] = [...currentOrder, order];
      };
    }

    static reorder(order: Order<S>): typeof Class {
      return class extends this {
        static order: Order<S>[] = [order];
      };
    }

    static get unordered(): typeof Class {
      return class extends this {
        static order: Order<S>[] = [];
      };
    }

    static filterBy(filter: Filter<S>): typeof Class {
      const currentFilter = this.filter;

      return class extends this {
        static filter: Filter<S> = { $and: [currentFilter, filter] };
      };
    }

    static get unfiltered(): typeof Class {
      return class extends this {
        static filter: Filter<S> = {};
      };
    }

    static get queryBy(): QueryBy<S> {
      const queryBy = <QueryBy<S>>{};
      for (const key in this.columns) {
        queryBy[key] = value => this.filterBy(
          Array.isArray(value)
            ? <Filter<any>>{ $in: { [key]: value } }
            : <Filter<any>>{ [key]: value },
        );
      }
      return queryBy;
    }

    static get all(): Promise<Class[]> {
      return <Promise<Class[]>>this.connector.query(this);
    }

    static async updateAll(attrs: Partial<S>): Promise<typeof Class> {
      await this.connector.updateAll(this, attrs);
      return this;
    }

    static async deleteAll(): Promise<typeof Class> {
      await this.connector.deleteAll(this);
      return this;
    }

    static async inBatchesOf(amount: number): Promise<Promise<Class[]>[]> {
      const count = await this.count;
      const batchCount = Math.ceil(count / amount);
      if (batchCount > 0 && batchCount < Number.MAX_SAFE_INTEGER) {
        const subqueries: Promise<Class[]>[] = [];
        for (let batchIndex = 0; batchIndex < batchCount; batchIndex += 1) {
          const skip = (this.skip || 0) + batchIndex * amount;
          const limit = batchIndex !== batchCount - 1 ? amount : count - (batchCount - 1) * amount;
          subqueries.push(this.skipBy(skip).limitBy(limit).all);
        }
        return subqueries;
      }
      return [];
    }

    static get first(): Promise<Class | undefined> {
      return this.limitBy(1).all.then(instances => instances[0]);
    }

    static find(filter: Filter<S>): Promise<Class | undefined> {
      return this.filterBy(filter).first;
    }

    static get findBy(): FindBy<S> {
      const findBy = <FindBy<S>>{};
      for (const key in this.columns) {
        findBy[key] = value => this.find(Array.isArray(value)
          ? <Filter<any>>{ $in: { [key]: value } }
          : <Filter<any>>{ [key]: value },
        );
      }
      return findBy;
    }

    static get count(): Promise<number> {
      return this.connector.count(this);
    }

    static async pluck(column: string): Promise<any[]> {
      return (await this.select([column])).map(items => items[0]);
    }

    static select(columns: string[]): Promise<Dict<any>[]> {
      return this.connector.select(this, columns);
    }

    static execute(query: string, bindings: BaseType[]): Promise<Dict<any>[]> {
      return this.connector.execute(this, query, bindings);
    }

    constructor(_?: Partial<S>) {
    }

    static build(attrs?: Partial<S>): Class {
      return new this(attrs);
    }

    static create(attrs?: Partial<S>): Promise<Class> {
      return new this(attrs).save();
    }

    get model(): typeof Class {
      const constructor: typeof Class = <any>this.constructor;
      const identifier = constructor.identifier;
      const query = { [identifier]: (<Partial<S>><any>this)[identifier] };
      return class extends constructor {
        static filter: Filter<S> = query;
        static limit: number | undefined = undefined;
        static skip: number | undefined = undefined;
      };
    }

    get attributes(): Partial<S> {
      const attrs: Partial<S> = {};
      for (const key in this.model.columns) {
        attrs[key] = (<Partial<S>><any>this)[key];
      }
      return attrs;
    }

    get isNew(): boolean {
      return !this.isPersistent;
    }

    get isPersistent(): boolean {
      return !(<Partial<S>><any>this)[this.model.identifier];
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

    getTyped<M extends ModelStatic<S>, I extends ModelConstructor<S>>(): Instance<S, M, I> {
      return new Instance<S, M, I>(<any>this);
    }

    assign(attrs: Partial<S>): Class {
      for (const key in attrs) {
        (<Partial<S>><any>this)[key] = attrs[key];
      }
      return this;
    }

    revertChange(key: keyof S): Class {
      (<Partial<S>><any>this)[key] = this.persistentAttributes[key];
      return this;
    }

    revertChanges(): Class {
      for (const key of this.model.keys) {
        this.revertChange(key);
      }
      return this;
    }

    save(): Promise<Class> {
      return this.isNew
        ? <Promise<Class>>this.model.connector.create(this)
        : <Promise<Class>>this.model.connector.update(this)
        ;
    }

    delete(): Promise<Class> {
      return <Promise<Class>>this.model.connector.delete(this);
    }

    reload(): Promise<Class | undefined> {
      return this.model.first;
    }
  }

  return Class;
}
