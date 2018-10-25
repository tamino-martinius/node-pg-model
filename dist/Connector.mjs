import { camelToSnakeCase, snakeToCamelCase, } from './util';
function pgToJs(model, column) {
    return model.columnNames[column] || snakeToCamelCase(column);
}
function rowToJs(model, row) {
    const jsObj = {};
    for (const column in row) {
        jsObj[pgToJs(model, column)] = row[column];
    }
    return jsObj;
}
function jsToPg(model, column) {
    return model.columnNames[column] || camelToSnakeCase(column);
}
function jsToColumn(model, column) {
    return `"${model.tableName}"."${jsToPg(model, column)}"`;
}
async function propertyFilter(model, values, filters) {
    const queryParts = [];
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
async function andFilter(model, values, filters) {
    let query = '(1 = 1)';
    if (filters.length > 0) {
        const queryParts = await Promise.all(filters.map(filterItem => filter(model, values, filterItem)));
        query = queryParts.join(' AND ');
    }
    return query;
}
async function orFilter(model, values, filters) {
    let query = '(1 = 1)';
    if (filters.length > 0) {
        const queryParts = await Promise.all(filters.map(filterItem => filter(model, values, filterItem)));
        query = queryParts.join(' OR ');
    }
    return query;
}
async function notFilter(model, values, filters) {
    return `(NOT (${await filter(model, values, filters)}))`;
}
async function inFilter(model, values, filters) {
    let query = '(1 = 0)';
    const queryParts = [];
    for (const column in filters) {
        const filterValues = filters[column];
        if (Array.isArray(filterValues) && filterValues.length > 0) {
            const placeholders = [];
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
async function notInFilter(model, values, filters) {
    let query = '(1 = 1)';
    const queryParts = [];
    for (const column in filters) {
        const filterValues = filters[column];
        if (Array.isArray(filterValues) && filterValues.length > 0) {
            const placeholders = [];
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
async function nullFilter(model, _, column) {
    return `(${jsToColumn(model, column.toString())} IS NULL)`;
}
async function notNullFilter(model, _, column) {
    return `(${jsToColumn(model, column.toString())} IS NOT NULL)`;
}
async function betweenFilter(model, values, filters) {
    let query = '(1 = 1)';
    const queryParts = [];
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
async function notBetweenFilter(model, values, filters) {
    let query = '(1 = 1)';
    const queryParts = [];
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
async function gtFilter(model, values, filters) {
    const queryParts = [];
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
async function gteFilter(model, values, filters) {
    const queryParts = [];
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
async function ltFilter(model, values, filters) {
    const queryParts = [];
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
async function lteFilter(model, values, filters) {
    const queryParts = [];
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
async function rawFilter(_, values, filters) {
    let query = filters.$query;
    for (let index = filters.$bindings.length; index > 0; index -= 1) {
        values.push(filters.$bindings[index - 1]);
        query = query.replace(`$${index}`, `$${values.length}`);
    }
    return query;
}
async function asyncFilter(model, values, filters) {
    return filter(model, values, await filters);
}
async function specialFilter(model, values, filter) {
    if (Object.keys(filter).length !== 1)
        throw '[TODO] Return proper error';
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
async function filter(model, values, filters) {
    if (Object.keys(filters).length > 0) {
        for (const key in filters) {
            if (key.startsWith('$')) {
                return await specialFilter(model, values, filters);
            }
        }
        return await propertyFilter(model, values, filters);
    }
    return '';
}
async function getSet(model, values, attrs) {
    const queryParts = [];
    for (const column in attrs) {
        values.push(attrs[column]);
        queryParts.push(`"${jsToPg(model, column)}" = $${values.length}`);
    }
    return `SET ${queryParts.join(', ')}`;
}
async function getInsert(model, values, attrs) {
    const insertColumns = [];
    const insertValues = [];
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
async function getSelect(model, columns = model.keys.map(column => `"${model.tableName}"."${column}"`)) {
    return `SELECT ${columns.join(', ')}`;
}
async function getFrom(model) {
    return `FROM "${model.tableName}"`;
}
async function getUpdate(model) {
    return `UPDATE "${model.tableName}"`;
}
async function getWhere(model, values) {
    const conditions = await filter(model, values, model.filter);
    if (conditions.length > 0) {
        return `WHERE ${conditions}`;
    }
    return '';
}
async function getLimit(model) {
    return model.limit ? `LIMIT ${model.limit}` : '';
}
async function getOffset(model) {
    return model.skip ? `OFFSET ${model.skip}` : '';
}
async function getReturning(model) {
    return `RETURNING "${model.tableName}"."${model.identifier}"`;
}
function query(model, queryText, values) {
    console.log({ queryText, values });
    return model.pool.query(queryText, values);
}
export class Connector {
    async query(model) {
        const values = [];
        const queryText = `
${await getSelect(model)}
${await getFrom(model)}
${await getWhere(model, values)}
${await getLimit(model)}
${await getOffset(model)}
`;
        const { rows } = await query(model, queryText, values);
        return rows.map((row) => {
            const instance = new model(rowToJs(model, row));
            instance.persistentAttributes = instance.attributes;
            return instance;
        });
    }
    async count(model) {
        const values = [];
        const queryText = `
${await getSelect(model, [`COUNT("${model.tableName}"."${model.identifier}") AS count`])}
${await getFrom(model)}
${await getWhere(model, values)}
${await getLimit(model)}
${await getOffset(model)}
`;
        const { rows } = await query(model, queryText, values);
        return rows[0].count;
    }
    async select(model, columns) {
        const values = [];
        const queryText = `
${await getSelect(model, columns)}
${await getFrom(model)}
${await getWhere(model, values)}
${await getLimit(model)}
${await getOffset(model)}
`;
        const { rows } = await query(model, queryText, values);
        return rows.map(row => rowToJs(model, row));
    }
    async updateAll(model, attrs) {
        const values = [];
        const queryText = `
${await getUpdate(model)}
${await getSet(model, values, attrs)}
${await getWhere(model, values)}
${await getLimit(model)}
${await getOffset(model)}
`;
        const { rowCount } = await query(model, queryText, values);
        return rowCount;
    }
    async deleteAll(model) {
        const values = [];
        const queryText = `
DELETE ${await getFrom(model)}
${await getWhere(model, values)}
${await getLimit(model)}
${await getOffset(model)}
`;
        const { rowCount } = await query(model, queryText, values);
        return rowCount;
    }
    async create(instance) {
        const model = instance.model();
        const values = [];
        const queryText = `
${await getInsert(model, values, instance.attributes)}
${await getReturning(model)}
`;
        const { rows } = await query(model, queryText, values);
        const attrs = rowToJs(model, rows[0]);
        instance[model.identifier] = attrs[model.identifier.toString()];
        instance.persistentAttributes = instance.attributes;
        return instance;
    }
    async update(instance) {
        const model = instance.model();
        const values = [];
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
    }
    async delete(instance) {
        const model = instance.model();
        const values = [];
        const queryText = `
DELETE ${await getFrom(model)}
${await getWhere(model, values)}
${await getLimit(model)}
${await getOffset(model)}
`;
        await query(model, queryText, values);
        instance[model.identifier] = undefined;
        return instance;
    }
    async execute(model, queryText, values) {
        const { rows } = await query(model, queryText, values);
        return rows.map(row => rowToJs(model, row));
    }
}
export default Connector;
//# sourceMappingURL=Connector.mjs.map