import {
  ModelConstructor,
  ModelStatic,
  Schema,
  Connector,
  BaseType,
  Filter,
  FilterIn,
  FilterBetween,
  FilterSpecial,
  FilterRaw,
} from './types';

async function propertyFilter<S extends Schema>(values: any[], filters: Partial<S>) {
  const queryParts: string[] = [];
  let query = '(1 = 1)';
  if (Object.keys(filters).length > 0) {
    for (const column in filters) {
      values.push(filters[column]);
      queryParts.push(`("$TABLE"."${column}" = $${values.length})`);
    }
    query = queryParts.join(' AND ');
  }
  return query;
}

async function andFilter<S extends Schema>(values: any[], filters: Filter<S>[]) {
  let query = '(1 = 1)';
  if (filters.length > 0) {
    const queryParts = await Promise.all(filters.map(filterItem => filter(values, filterItem)));
    query = queryParts.join(' AND ');
  }
  return query;
}

async function orFilter<S extends Schema>(values: any[], filters: Filter<S>[]) {
  let query = '(1 = 1)';
  if (filters.length > 0) {
    const queryParts = await Promise.all(filters.map(filterItem => filter(values, filterItem)));
    query = queryParts.join(' OR ');
  }
  return query;
}

async function notFilter<S extends Schema>(values: any[], filters: Filter<S>) {
  return `(NOT (${await filter(values, filters)}))`;
}

async function inFilter<S extends Schema>(values: any[], filters: Partial<FilterIn<S>>) {
  let query = '(1 = 0)';
  const queryParts: string[] = [];
  for (const column in filters) {
    const filterValues = filters[column];
    if (Array.isArray(filterValues) && filterValues.length > 0) {
      const placeholders: string[] = [];
      for (const filterValue of filterValues) {
        values.push(filterValue);
        placeholders.push(`$${values.length}`);
      }
      queryParts.push(`("$TABLE"."${column}" IN (${placeholders.join(', ')}))`);
    }
  }
  if (queryParts.length > 0) {
    query = queryParts.join(' AND ');
  }
  return query;
}

async function notInFilter<S extends Schema>(values: any[], filters: Partial<FilterIn<S>>) {
  let query = '(1 = 1)';
  const queryParts: string[] = [];
  for (const column in filters) {
    const filterValues = filters[column];
    if (Array.isArray(filterValues) && filterValues.length > 0) {
      const placeholders: string[] = [];
      for (const filterValue of filterValues) {
        values.push(filterValue);
        placeholders.push(`$${values.length}`);
      }
      queryParts.push(`("$TABLE"."${column}" NOT IN (${placeholders.join(', ')}))`);
    }
  }
  if (queryParts.length > 0) {
    query = queryParts.join(' AND ');
  }
  return query;
}

async function nullFilter<S extends Schema>(_: any[], column: keyof S) {
  return `("$TABLE"."${column}" IS NULL)`;
}

async function notNullFilter<S extends Schema>(_: any[], column: keyof S) {
  return `("$TABLE"."${column}" IS NOT NULL)`;
}

async function betweenFilter<S extends Schema>(values: any[], filters: Partial<FilterBetween<S>>) {
  let query = '(1 = 1)';
  const queryParts: string[] = [];
  for (const column in filters) {
    const filterValues = filters[column];
    if (filterValues !== undefined) {
      values.push(filterValues.from, filterValues.to);
      queryParts.push(`("$TABLE"."${column}" BETWEEN $${values.length - 1} AND $${values.length})`);
    }
  }
  if (queryParts.length > 0) {
    query = queryParts.join(' AND ');
  }
  return query;
}

async function notBetweenFilter<S extends Schema>(
  values: any[], filters: Partial<FilterBetween<S>>
) {
  let query = '(1 = 1)';
  const queryParts: string[] = [];
  for (const column in filters) {
    const filterValues = filters[column];
    if (filterValues !== undefined) {
      values.push(filterValues.from, filterValues.to);
      const index = values.length;
      queryParts.push(`("$TABLE"."${column}" NOT BETWEEN $${index - 1} AND $${index})`);
    }
  }
  if (queryParts.length > 0) {
    query = queryParts.join(' AND ');
  }
  return query;
}

async function gtFilter<S extends Schema>(values: any[], filters: Partial<S>) {
  const queryParts: string[] = [];
  let query = '(1 = 1)';
  if (Object.keys(filters).length > 0) {
    for (const column in filters) {
      values.push(filters[column]);
      queryParts.push(`("$TABLE"."${column}" > $${values.length})`);
    }
    query = queryParts.join(' AND ');
  }
  return query;
}

async function gteFilter<S extends Schema>(values: any[], filters: Partial<S>) {
  const queryParts: string[] = [];
  let query = '(1 = 1)';
  if (Object.keys(filters).length > 0) {
    for (const column in filters) {
      values.push(filters[column]);
      queryParts.push(`("$TABLE"."${column}" >= $${values.length})`);
    }
    query = queryParts.join(' AND ');
  }
  return query;
}

async function ltFilter<S extends Schema>(values: any[], filters: Partial<S>) {
  const queryParts: string[] = [];
  let query = '(1 = 1)';
  if (Object.keys(filters).length > 0) {
    for (const column in filters) {
      values.push(filters[column]);
      queryParts.push(`("$TABLE"."${column}" < $${values.length})`);
    }
    query = queryParts.join(' AND ');
  }
  return query;
}

async function lteFilter<S extends Schema>(values: any[], filters: Partial<S>) {
  const queryParts: string[] = [];
  let query = '(1 = 1)';
  if (Object.keys(filters).length > 0) {
    for (const column in filters) {
      values.push(filters[column]);
      queryParts.push(`("$TABLE"."${column}" <= $${values.length})`);
    }
    query = queryParts.join(' AND ');
  }
  return query;
}

async function rawFilter(values: any[], filters: FilterRaw) {
  let query = filters.$query;
  for (let index = filters.$bindings.length; index > 0; index -= 1) {
    values.push(filters.$bindings[index - 1]);
    query = query.replace(`$${index}`, `$${values.length}`)
  }
  return query;
}

async function asyncFilter<S extends Schema>(values: any[], filters: Promise<Filter<S>>) {
  return filter(values, await filters);
}

async function specialFilter<S extends Schema>(values: any[], filter: FilterSpecial<S>) {
  if (Object.keys(filter).length !== 1) throw '[TODO] Return proper error';
  if (filter.$and !== undefined) {
    return await andFilter(values, filter.$and);
  }
  if (filter.$or !== undefined) {
    return await orFilter(values, filter.$or);
  }
  if (filter.$not !== undefined) {
    return await notFilter(values, filter.$not);
  }
  if (filter.$in !== undefined) {
    return await inFilter(values, filter.$in);
  }
  if (filter.$notIn !== undefined) {
    return await notInFilter(values, filter.$notIn);
  }
  if (filter.$null !== undefined) {
    return await nullFilter(values, filter.$null);
  }
  if (filter.$notNull !== undefined) {
    return await notNullFilter(values, filter.$notNull);
  }
  if (filter.$between !== undefined) {
    return await betweenFilter(values, filter.$between);
  }
  if (filter.$notBetween !== undefined) {
    return await notBetweenFilter(values, filter.$notBetween);
  }
  if (filter.$gt !== undefined) {
    return await gtFilter(values, filter.$gt);
  }
  if (filter.$gte !== undefined) {
    return await gteFilter(values, filter.$gte);
  }
  if (filter.$lt !== undefined) {
    return await ltFilter(values, filter.$lt);
  }
  if (filter.$lte !== undefined) {
    return await lteFilter(values, filter.$lte);
  }
  if (filter.$raw !== undefined) {
    return await rawFilter(values, filter.$raw);
  }
  if (filter.$async !== undefined) {
    return await asyncFilter(values, filter.$async);
  }
  throw '[TODO] Should not reach error';
}

async function filter<S extends Schema>(values: any[], filters: Filter<S>): Promise<string> {
  if (Object.keys(filters).length > 0) {
    for (const key in filters) {
      if (key.startsWith('$')) {
        return await specialFilter(values, <FilterSpecial<S>>filters);
      }
    }
    return await propertyFilter(values, <Partial<S>>filters);
  }
  return '';
}

async function getSet<S extends Schema>(
  model: ModelStatic<S>,
  values: any[],
  attrs: Partial<S>,
): Promise<string> {
  const queryParts: string[] = [];
  for (const column in attrs) {
    values.push(attrs[column]);
    queryParts.push(`"${model.tableName}"."${column}" = $${values.length}`);
  }
  return `SET ${queryParts.join(', ')}`;
}

async function getInsert<S extends Schema>(
  model: ModelStatic<S>,
  values: any[],
  attrs: Partial<S>,
): Promise<string> {
  const insertColumns: string[] = [];
  const insertValues: string[] = [];
  for (const column in attrs) {
    if (column !== model.identifier) {
      values.push(attrs[column]);
      insertColumns.push(`"${model.tableName}"."${column}"`);
      insertValues.push(`$${values.length}`);
    }
  }
  return `INSERT INTO "${model.tableName}" (${insertColumns.join(', ')})
VALUES (${insertValues.join(', ')})`;
}

async function getSelect<S extends Schema>(
  model: ModelStatic<S>,
  columns: string[] = Object.keys(model.columns).map(column => `"${model.tableName}"."${column}"`),
) {
  return `SELECT ${columns.join(', ')}`;
}

async function getFrom<S extends Schema>(model: ModelStatic<S>) {
  return `FROM "${model.tableName}"`;
}

async function getUpdate<S extends Schema>(model: ModelStatic<S>) {
  return `UPDATE "${model.tableName}"`;
}

async function getWhere<S extends Schema>(model: ModelStatic<S>, values: any[]) {
  const conditions = await filter(values, model.filter);
  if (conditions.length > 0) {
    return `WHERE ${conditions.replace(/\$TABLE/g, model.tableName)}`;
  }
  return '';
}

async function getLimit<S extends Schema>(model: ModelStatic<S>) {
  return model.limit ? `LIMIT ${model.limit}` : '';
}

async function getOffset<S extends Schema>(model: ModelStatic<S>) {
  return model.skip ? `OFFSET ${model.skip}` : '';
}

async function getReturning<S extends Schema>(model: ModelStatic<S>) {
  return `RETURNING "${model.tableName}"."${model.identifier}"`;
}

export function getConnector<S extends Schema>(): Connector<S> {
  return {
    async query(model: ModelStatic<S>): Promise<ModelConstructor<S>[]> {
      const values: any[] = [];
      const queryText = `
${getSelect(model)}
${getFrom(model)}
${getWhere(model, values)}
${getLimit(model)}
${getOffset(model)}
`;
      const { rows } = await model.pool.query(queryText, values);
      return rows.map((row) => {
        const instance = new model(row);
        instance.persistentAttributes = instance.attributes;
        return instance;
      });
    },
    async count(model: ModelStatic<S>): Promise<number> {
      const values: any[] = [];
      const queryText = `
${getSelect(model, [`COUNT("${model.tableName}"."${model.identifier}") AS count`])}
${getFrom(model)}
${getWhere(model, values)}
${getLimit(model)}
${getOffset(model)}
`;
      const { rows } = await model.pool.query(queryText, values);
      return rows[0].count;
    },
    async select(model: ModelStatic<S>, columns: string[]): Promise<any[]> {
      const values: any[] = [];
      const queryText = `
${getSelect(model, columns)}
${getFrom(model)}
${getWhere(model, values)}
${getLimit(model)}
${getOffset(model)}
`;
      const { rows } = await model.pool.query(queryText, values);
      return rows;
    },
    async updateAll(model: ModelStatic<S>, attrs: Partial<S>): Promise<number> {
      const values: any[] = [];
      const queryText = `
${getUpdate(model)}
${getSet(model, values, attrs)}
${getWhere(model, values)}
${getLimit(model)}
${getOffset(model)}
`;
      const { rowCount } = await model.pool.query(queryText, values);
      return rowCount;
    },
    async deleteAll(model: ModelStatic<S>): Promise<number> {
      const values: any[] = [];
      const queryText = `
DELETE ${getFrom(model)}
${getWhere(model, values)}
${getLimit(model)}
${getOffset(model)}
`;
      const { rowCount } = await model.pool.query(queryText, values);
      return rowCount;
    },
    create(instance: ModelConstructor<S>): Promise<ModelConstructor<S>> {
      throw 'not yet implemented';
    },
    async update(instance: ModelConstructor<S>): Promise<ModelConstructor<S>> {
      const model = instance.model;
      const values: any[] = [];
      const queryText = `
${getUpdate(model)}
${getSet(model, values, instance.changeSet)}
${getWhere(model, values)}
${getLimit(model)}
${getOffset(model)}
`;
      await model.pool.query(queryText, values);
      instance.persistentAttributes = instance.attributes;
      return instance;
    },
    async delete(instance: ModelConstructor<S>): Promise<ModelConstructor<S>> {
      const model = instance.model;
      const values: any[] = [];
      const queryText = `
DELETE ${getFrom(model)}
${getWhere(model, values)}
${getLimit(model)}
${getOffset(model)}
`;
      await model.pool.query(queryText, values);
      (<any>instance)[model.identifier] = undefined;
      return instance;
    },
    execute(query: string, bindings: (BaseType | BaseType[])[]): Promise<any[]> {
      return
    },
  };
}
