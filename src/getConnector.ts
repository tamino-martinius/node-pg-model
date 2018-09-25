import {
  ModelConstructor,
  ModelStatic,
  Schema,
  Connector,
  BaseType,
  Filter,
  FilterSpecial,
} from './types';

async function propertyFilter<S extends Schema>(values: any[], filters: Partial<S>): Promise<string> {
  let queryParts: string[] = [];
  let query = '(1 = 1)';
  if (Object.keys(filters).length > 0) {
    for (const column in filters) {
      values.push(filters[column]);
      queryParts.push(`("${column}" = $${values.length})`);
    }
    query = queryParts.join(' AND ');
  }
  return query;
};

async function andFilter<S extends Schema>(values: any[], filters: Filter<S>[]): Promise<string> {
  let query = '(1 = 1)';
  if (filters.length > 0) {
    const queryParts = await Promise.all(filters.map(filterItem => filter(values, filterItem)));
    query = queryParts.join(' AND ');
  }
  return query;
};

async function orFilter<S extends Schema>(values: any[], filters: Filter<S>[]): Promise<string> {
  let query = '(1 = 1)';
  if (filters.length > 0) {
    const queryParts = await Promise.all(filters.map(filterItem => filter(values, filterItem)));
    query = queryParts.join(' OR ');
  }
  return query;
};

async function notFilter<S extends Schema>(values: any[], filters: Filter<S>): Promise<string> {
  return `(NOT (${await filter(values, filters)}))`;
};

async function specialFilter<S extends Schema>(values: any[], filter: FilterSpecial<S>): Promise<string> {
  if (Object.keys(filter).length !== 1) throw '[TODO] Return proper error';
  if (filter.$and !== undefined)
    return await andFilter(values, filter.$and);
  if (filter.$or !== undefined)
    return await orFilter(values, filter.$or);
  if (filter.$not !== undefined)
    return await notFilter(values, filter.$not);
  // if (filter.$in !== undefined)
  //   return await  inFilter(values, filter.$in);
  // if (filter.$notIn !== undefined)
  //   return await  notInFilter(values, filter.$notIn);
  // if (filter.$null !== undefined)
  //   return await  nullFilter(values, filter.$null);
  // if (filter.$notNull !== undefined)
  //   return await  notNullFilter(values, filter.$notNull);
  // if (filter.$between !== undefined)
  //   return await  betweenFilter(values, filter.$between);
  // if (filter.$notBetween !== undefined)
  //   return await  notBetweenFilter(values, filter.$notBetween);
  // if (filter.$gt !== undefined)
  //   return await  gtFilter(values, filter.$gt);
  // if (filter.$gte !== undefined)
  //   return await  gteFilter(values, filter.$gte);
  // if (filter.$lt !== undefined)
  //   return await  ltFilter(values, filter.$lt);
  // if (filter.$lte !== undefined)
  //   return await  lteFilter(values, filter.$lte);
  // if (filter.$raw !== undefined)
  //   return await  rawFilter(values, filter.$raw);
  // if (filter.$async !== undefined)
  //   return await  asyncFilter(values, filter.$async);
  throw '[TODO] Should not reach error';
};

async function filter<S extends Schema>(values: any[], filters: Filter<S>): Promise<string> {
  for (const key in filters) {
    if (key.startsWith('$')) {
      return await specialFilter(values, <FilterSpecial<S>>filters);
    }
  }
  return await propertyFilter(values, <Partial<S>>filters);
}


export function getConnector<S extends Schema>(): Connector<S> {
  return {
    query(model: ModelStatic<S>): Promise<ModelConstructor<S>[]> {
      throw 'not yet implemented';
    },
    count(model: ModelStatic<S>): Promise<number> {
      throw 'not yet implemented';
    },
    select(model: ModelStatic<S>, keys: (keyof S)[]): Promise<S[keyof S][][]> {
      throw 'not yet implemented';
    },
    updateAll(model: ModelStatic<S>, attrs: Partial<S>): Promise<number> {
      throw 'not yet implemented';
    },
    deleteAll(model: ModelStatic<S>): Promise<number> {
      throw 'not yet implemented';
    },
    create(instance: ModelConstructor<S>): Promise<ModelConstructor<S>> {
      throw 'not yet implemented';
    },
    update(instance: ModelConstructor<S>): Promise<ModelConstructor<S>> {
      throw 'not yet implemented';
    },
    delete(instance: ModelConstructor<S>): Promise<ModelConstructor<S>> {
      throw 'not yet implemented';
    },
    execute(query: string, bindings: (BaseType | BaseType[])[]): Promise<any[]> {
      throw 'not yet implemented';
    },
  };
};

private collection(model: ModelStatic<S>): S[] {
  return this.storage[model.modelName] = this.storage[model.modelName] || [];
}
}
