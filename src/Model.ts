import {
  ModelConstructor,
  ModelStatic,
  ModelStaticClass,
  Schema,
  Filter,
  Order,
  QueryByModel,
  FindByModel,
} from './types';

export class Model<
  S extends Schema,
  M extends ModelStatic<S>,
  I extends ModelConstructor<S>,
  > extends ModelStaticClass<S, M, I> {
  constructor(public model: M) {
    super();
  }

  limitBy(amount: number): M {
    return <any>this.model.limitBy(amount);
  }

  get unlimited(): M {
    return <any>this.model.unlimited;
  }

  skipBy(amount: number): M {
    return <any>this.model.skipBy(amount);
  }

  get unskipped(): M {
    return <any>this.model.unskipped;
  }

  orderBy(order: Partial<Order<S>>): M {
    return <any>this.model.orderBy(order);
  }

  reorder(order: Partial<Order<S>>): M {
    return <any>this.model.reorder(order);
  }

  get unordered(): M {
    return <any>this.model.unordered;
  }

  filterBy(filter: Filter<S>): M {
    return <any>this.model.filterBy(filter);
  }

  get queryBy(): QueryByModel<S, M> {
    return <any>this.model.queryBy;
  }

  get unfiltered(): M {
    return <any>this.model.unfiltered;
  }

  get all(): Promise<I[]> {
    return <any>this.model.all;
  }

  pluck(key: keyof S): Promise<S[keyof S][]> {
    return this.model.pluck(key);
  }

  select(keys: (keyof S)[]): Promise<S[keyof S][][]> {
    return this.model.select(keys);
  }

  updateAll(attrs: Partial<S>): Promise<M> {
    return <any>this.model.updateAll(attrs);
  }

  deleteAll(): Promise<I> {
    return <any>this.model.deleteAll();
  }

  inBatchesOf(amount: number): Promise<Promise<I[]>[]> {
    return <any>this.model.inBatchesOf(amount);
  }

  get first(): Promise<I | undefined> {
    return <any>this.model.first;
  }

  find(query: Filter<S>): Promise<I | undefined> {
    return <any>this.model.find(query);
  }

  get findBy(): FindByModel<S, I> {
    return <any>this.model.findBy;
  }

  get count(): Promise<number> {
    return this.model.count;
  }

  build(attrs: Partial<S> | undefined): I {
    return <any>this.model.build(attrs);
  }

  create(attrs: Partial<S> | undefined): Promise<I> {
    return <any>this.model.create(attrs);
  }
}
