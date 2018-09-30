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
  Dict,
} from './types';

import {
  camelToSnakeCase,
  snakeToCamelCase,
} from './util';

function pgToJs<S extends Schema>(model: ModelStatic<S>, column: string) {
  return model.columnNames[column] || snakeToCamelCase(column);
}

function rowToJs<S extends Schema>(model: ModelStatic<S>, row: Dict<any>) {
  const jsObj: Dict<any> = {};
  for (const column in row) {
    jsObj[pgToJs(model, column)] = row[column];
  }
  return jsObj;
}

function jsToPg<S extends Schema>(model: ModelStatic<S>, column: string) {
  return model.columnNames[column] || camelToSnakeCase(column);
}

function jsToColumn<S extends Schema>(model: ModelStatic<S>, column: string) {
  return `"${model.tableName}"."${jsToPg(model, column)}"`;
}

async function propertyFilter<S extends Schema>(
  model: ModelStatic<S>,
  values: any[],
  filters: Partial<S>,
) {
  const queryParts: string[] = [];
  let query = '(1 = 1)';
  if (Object.keys(filters).length > 0) {
    for (const column in filters) {
      values.push(filters[column]);
      queryParts.push(`(${jsToColumn(model, column)} = $${values.length})`);
    }
    query = queryParts.join(' AND ');
  }
  return query;
}

async function andFilter<S extends Schema>(
  model: ModelStatic<S>,
  values: any[],
  filters: Filter<S>[],
) {
  let query = '(1 = 1)';
  if (filters.length > 0) {
    const queryParts = await Promise.all(filters.map(
      filterItem => filter(model, values, filterItem)),
    );
    query = queryParts.join(' AND ');
  }
  return query;
}

async function orFilter<S extends Schema>(
  model: ModelStatic<S>,
  values: any[],
  filters: Filter<S>[],
) {
  let query = '(1 = 1)';
  if (filters.length > 0) {
    const queryParts = await Promise.all(filters.map(
      filterItem => filter(model, values, filterItem)),
    );
    query = queryParts.join(' OR ');
  }
  return query;
}

async function notFilter<S extends Schema>(
  model: ModelStatic<S>,
  values: any[],
  filters: Filter<S>,
) {
  return `(NOT (${await filter(model, values, filters)}))`;
}

async function inFilter<S extends Schema>(
  model: ModelStatic<S>,
  values: any[],
  filters: Partial<FilterIn<S>>,
) {
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
      queryParts.push(`(${jsToColumn(model, column)} IN (${placeholders.join(', ')}))`);
    }
  }
  if (queryParts.length > 0) {
    query = queryParts.join(' AND ');
  }
  return query;
}

async function notInFilter<S extends Schema>(
  model: ModelStatic<S>,
  values: any[],
  filters: Partial<FilterIn<S>>,
) {
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
      queryParts.push(`(${jsToColumn(model, column)} NOT IN (${placeholders.join(', ')}))`);
    }
  }
  if (queryParts.length > 0) {
    query = queryParts.join(' AND ');
  }
  return query;
}

async function nullFilter<S extends Schema>(
  model: ModelStatic<S>,
  _: any[],
  column: keyof S,
) {
  return `(${jsToColumn(model, column.toString())} IS NULL)`;
}

async function notNullFilter<S extends Schema>(
  model: ModelStatic<S>,
  _: any[],
  column: keyof S,
) {
  return `(${jsToColumn(model, column.toString())} IS NOT NULL)`;
}

async function betweenFilter<S extends Schema>(
  model: ModelStatic<S>,
  values: any[],
  filters: Partial<FilterBetween<S>>,
) {
  let query = '(1 = 1)';
  const queryParts: string[] = [];
  for (const column in filters) {
    const filterValues = filters[column];
    if (filterValues !== undefined) {
      values.push(filterValues.from, filterValues.to);
      const index = values.length;
      queryParts.push(`(${jsToColumn(model, column)} BETWEEN $${index - 1} AND $${index})`);
    }
  }
  if (queryParts.length > 0) {
    query = queryParts.join(' AND ');
  }
  return query;
}

async function notBetweenFilter<S extends Schema>(
  model: ModelStatic<S>,
  values: any[],
  filters: Partial<FilterBetween<S>>,
) {
  let query = '(1 = 1)';
  const queryParts: string[] = [];
  for (const column in filters) {
    const filterValues = filters[column];
    if (filterValues !== undefined) {
      values.push(filterValues.from, filterValues.to);
      const index = values.length;
      queryParts.push(`(${jsToColumn(model, column)} NOT BETWEEN $${index - 1} AND $${index})`);
    }
  }
  if (queryParts.length > 0) {
    query = queryParts.join(' AND ');
  }
  return query;
}

async function gtFilter<S extends Schema>(
  model: ModelStatic<S>,
  values: any[],
  filters: Partial<S>,
) {
  const queryParts: string[] = [];
  let query = '(1 = 1)';
  if (Object.keys(filters).length > 0) {
    for (const column in filters) {
      values.push(filters[column]);
      queryParts.push(`(${jsToColumn(model, column)} > $${values.length})`);
    }
    query = queryParts.join(' AND ');
  }
  return query;
}

async function gteFilter<S extends Schema>(
  model: ModelStatic<S>,
  values: any[],
  filters: Partial<S>,
) {
  const queryParts: string[] = [];
  let query = '(1 = 1)';
  if (Object.keys(filters).length > 0) {
    for (const column in filters) {
      values.push(filters[column]);
      queryParts.push(`(${jsToColumn(model, column)} >= $${values.length})`);
    }
    query = queryParts.join(' AND ');
  }
  return query;
}

async function ltFilter<S extends Schema>(
  model: ModelStatic<S>,
  values: any[],
  filters: Partial<S>,
) {
  const queryParts: string[] = [];
  let query = '(1 = 1)';
  if (Object.keys(filters).length > 0) {
    for (const column in filters) {
      values.push(filters[column]);
      queryParts.push(`(${jsToColumn(model, column)} < $${values.length})`);
    }
    query = queryParts.join(' AND ');
  }
  return query;
}

async function lteFilter<S extends Schema>(
  model: ModelStatic<S>,
  values: any[],
  filters: Partial<S>,
) {
  const queryParts: string[] = [];
  let query = '(1 = 1)';
  if (Object.keys(filters).length > 0) {
    for (const column in filters) {
      values.push(filters[column]);
      queryParts.push(`(${jsToColumn(model, column)} <= $${values.length})`);
    }
    query = queryParts.join(' AND ');
  }
  return query;
}

async function rawFilter<S extends Schema>(
  _: ModelStatic<S>,
  values: any[],
  filters: FilterRaw,
) {
  let query = filters.$query;
  for (let index = filters.$bindings.length; index > 0; index -= 1) {
    values.push(filters.$bindings[index - 1]);
    query = query.replace(`$${index}`, `$${values.length}`);
  }
  return query;
}

async function asyncFilter<S extends Schema>(
  model: ModelStatic<S>,
  values: any[],
  filters: Promise<Filter<S>>,
) {
  return filter(model, values, await filters);
}

async function specialFilter<S extends Schema>(
  model: ModelStatic<S>,
  values: any[],
  filter: FilterSpecial<S>,
) {
  if (Object.keys(filter).length !== 1) throw '[TODO] Return proper error';
  if (filter.$and !== undefined) {
    return await andFilter(model, values, filter.$and);
  }
  if (filter.$or !== undefined) {
    return await orFilter(model, values, filter.$or);
  }
  if (filter.$not !== undefined) {
    return await notFilter(model, values, filter.$not);
  }
  if (filter.$in !== undefined) {
    return await inFilter(model, values, filter.$in);
  }
  if (filter.$notIn !== undefined) {
    return await notInFilter(model, values, filter.$notIn);
  }
  if (filter.$null !== undefined) {
    return await nullFilter(model, values, filter.$null);
  }
  if (filter.$notNull !== undefined) {
    return await notNullFilter(model, values, filter.$notNull);
  }
  if (filter.$between !== undefined) {
    return await betweenFilter(model, values, filter.$between);
  }
  if (filter.$notBetween !== undefined) {
    return await notBetweenFilter(model, values, filter.$notBetween);
  }
  if (filter.$gt !== undefined) {
    return await gtFilter(model, values, filter.$gt);
  }
  if (filter.$gte !== undefined) {
    return await gteFilter(model, values, filter.$gte);
  }
  if (filter.$lt !== undefined) {
    return await ltFilter(model, values, filter.$lt);
  }
  if (filter.$lte !== undefined) {
    return await lteFilter(model, values, filter.$lte);
  }
  if (filter.$raw !== undefined) {
    return await rawFilter(model, values, filter.$raw);
  }
  if (filter.$async !== undefined) {
    return await asyncFilter(model, values, filter.$async);
  }
  throw '[TODO] Should not reach error';
}

async function filter<S extends Schema>(
  model: ModelStatic<S>,
  values: any[],
  filters: Filter<S>,
): Promise<string> {
  if (Object.keys(filters).length > 0) {
    for (const key in filters) {
      if (key.startsWith('$')) {
        return await specialFilter(model, values, <FilterSpecial<S>>filters);
      }
    }
    return await propertyFilter(model, values, <Partial<S>>filters);
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
    queryParts.push(`"${jsToPg(model, column)}" = $${values.length}`);
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
  console.log(attrs);
  for (const column in attrs) {
    if (column !== model.identifier) {
      values.push(attrs[column]);
      insertColumns.push(`"${jsToPg(model, column)}"`);
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
  const conditions = await filter(model, values, model.filter);
  if (conditions.length > 0) {
    return `WHERE ${conditions}`;
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

function query<S extends Schema>(
  model: ModelStatic<S>,
  queryText: string,
  values: BaseType[],
) {
  console.log({ queryText, values });
  return model.pool.query(queryText, values);
}

export function getConnector<S extends Schema>(): Connector<S> {
  return {
    async query(model: ModelStatic<S>): Promise<ModelConstructor<S>[]> {
      const values: any[] = [];
      const queryText = `
${await getSelect(model)}
${await getFrom(model)}
${await getWhere(model, values)}
${await getLimit(model)}
${await getOffset(model)}
`;
      const { rows } = await query(model, queryText, values);
      return rows.map((row) => {
        const instance = new model(<any>rowToJs(model, row));
        instance.persistentAttributes = instance.attributes;
        return instance;
      });
    },
    async count(model: ModelStatic<S>): Promise<number> {
      const values: any[] = [];
      const queryText = `
${await getSelect(model, [`COUNT("${model.tableName}"."${model.identifier}") AS count`])}
${await getFrom(model)}
${await getWhere(model, values)}
${await getLimit(model)}
${await getOffset(model)}
`;
      const { rows } = await query(model, queryText, values);
      return rows[0].count;
    },
    async select(model: ModelStatic<S>, columns: string[]): Promise<Dict<any>[]> {
      const values: any[] = [];
      const queryText = `
${await getSelect(model, columns)}
${await getFrom(model)}
${await getWhere(model, values)}
${await getLimit(model)}
${await getOffset(model)}
`;
      const { rows } = await query(model, queryText, values);
      return rows.map(row => rowToJs(model, row));
    },
    async updateAll(model: ModelStatic<S>, attrs: Partial<S>): Promise<number> {
      const values: any[] = [];
      const queryText = `
${await getUpdate(model)}
${await getSet(model, values, attrs)}
${await getWhere(model, values)}
${await getLimit(model)}
${await getOffset(model)}
`;
      const { rowCount } = await query(model, queryText, values);
      return rowCount;
    },
    async deleteAll(model: ModelStatic<S>): Promise<number> {
      const values: any[] = [];
      const queryText = `
DELETE ${await getFrom(model)}
${await getWhere(model, values)}
${await getLimit(model)}
${await getOffset(model)}
`;
      const { rowCount } = await query(model, queryText, values);
      return rowCount;
    },
    async create(instance: ModelConstructor<S>): Promise<ModelConstructor<S>> {
      const model = instance.model;
      const values: any[] = [];
      const queryText = `
${await getInsert(model, values, instance.attributes)}
${await getReturning(model)}
`;
      const { rows } = await query(model, queryText, values);
      const attrs = rowToJs(model, rows[0]);
      (<any>instance)[model.identifier] = attrs[model.identifier.toString()];
      instance.persistentAttributes = instance.attributes;
      return instance;
    },
    async update(instance: ModelConstructor<S>): Promise<ModelConstructor<S>> {
      const model = instance.model;
      const values: any[] = [];
      const queryText = `
${await getUpdate(model)}
${await getSet(model, values, instance.changeSet)}
${await getWhere(model, values)}
${await getLimit(model)}
${await getOffset(model)}
`;
      await query(model, queryText, values);
      instance.persistentAttributes = instance.attributes;
      return instance;
    },
    async delete(instance: ModelConstructor<S>): Promise<ModelConstructor<S>> {
      const model = instance.model;
      const values: any[] = [];
      const queryText = `
DELETE ${await getFrom(model)}
${await getWhere(model, values)}
${await getLimit(model)}
${await getOffset(model)}
`;
      await query(model, queryText, values);
      (<any>instance)[model.identifier] = undefined;
      return instance;
    },
    async execute(
      model: ModelStatic<S>,
      queryText: string,
      values: BaseType[],
    ): Promise<Dict<any>[]> {
      const { rows } = await query(model, queryText, values);
      return rows.map(row => rowToJs(model, row));
    },
  };
}
