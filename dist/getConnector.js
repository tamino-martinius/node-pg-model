"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const util_1 = require("./util");
function pgToJs(model, column) {
    return model.columnNames[column] || util_1.snakeToCamelCase(column);
}
function rowToJs(model, row) {
    const jsObj = {};
    for (const column in row) {
        jsObj[pgToJs(model, column)] = row[column];
    }
    return jsObj;
}
function jsToPg(model, column) {
    return model.columnNames[column] || util_1.camelToSnakeCase(column);
}
function jsToColumn(model, column) {
    return `"${model.tableName}"."${jsToPg(model, column)}"`;
}
function propertyFilter(model, values, filters) {
    return __awaiter(this, void 0, void 0, function* () {
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
    });
}
function andFilter(model, values, filters) {
    return __awaiter(this, void 0, void 0, function* () {
        let query = '(1 = 1)';
        if (filters.length > 0) {
            const queryParts = yield Promise.all(filters.map(filterItem => filter(model, values, filterItem)));
            query = queryParts.join(' AND ');
        }
        return query;
    });
}
function orFilter(model, values, filters) {
    return __awaiter(this, void 0, void 0, function* () {
        let query = '(1 = 1)';
        if (filters.length > 0) {
            const queryParts = yield Promise.all(filters.map(filterItem => filter(model, values, filterItem)));
            query = queryParts.join(' OR ');
        }
        return query;
    });
}
function notFilter(model, values, filters) {
    return __awaiter(this, void 0, void 0, function* () {
        return `(NOT (${yield filter(model, values, filters)}))`;
    });
}
function inFilter(model, values, filters) {
    return __awaiter(this, void 0, void 0, function* () {
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
    });
}
function notInFilter(model, values, filters) {
    return __awaiter(this, void 0, void 0, function* () {
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
    });
}
function nullFilter(model, _, column) {
    return __awaiter(this, void 0, void 0, function* () {
        return `(${jsToColumn(model, column.toString())} IS NULL)`;
    });
}
function notNullFilter(model, _, column) {
    return __awaiter(this, void 0, void 0, function* () {
        return `(${jsToColumn(model, column.toString())} IS NOT NULL)`;
    });
}
function betweenFilter(model, values, filters) {
    return __awaiter(this, void 0, void 0, function* () {
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
    });
}
function notBetweenFilter(model, values, filters) {
    return __awaiter(this, void 0, void 0, function* () {
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
    });
}
function gtFilter(model, values, filters) {
    return __awaiter(this, void 0, void 0, function* () {
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
    });
}
function gteFilter(model, values, filters) {
    return __awaiter(this, void 0, void 0, function* () {
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
    });
}
function ltFilter(model, values, filters) {
    return __awaiter(this, void 0, void 0, function* () {
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
    });
}
function lteFilter(model, values, filters) {
    return __awaiter(this, void 0, void 0, function* () {
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
    });
}
function rawFilter(_, values, filters) {
    return __awaiter(this, void 0, void 0, function* () {
        let query = filters.$query;
        for (let index = filters.$bindings.length; index > 0; index -= 1) {
            values.push(filters.$bindings[index - 1]);
            query = query.replace(`$${index}`, `$${values.length}`);
        }
        return query;
    });
}
function asyncFilter(model, values, filters) {
    return __awaiter(this, void 0, void 0, function* () {
        return filter(model, values, yield filters);
    });
}
function specialFilter(model, values, filter) {
    return __awaiter(this, void 0, void 0, function* () {
        if (Object.keys(filter).length !== 1)
            throw '[TODO] Return proper error';
        if (filter.$and !== undefined) {
            return yield andFilter(model, values, filter.$and);
        }
        if (filter.$or !== undefined) {
            return yield orFilter(model, values, filter.$or);
        }
        if (filter.$not !== undefined) {
            return yield notFilter(model, values, filter.$not);
        }
        if (filter.$in !== undefined) {
            return yield inFilter(model, values, filter.$in);
        }
        if (filter.$notIn !== undefined) {
            return yield notInFilter(model, values, filter.$notIn);
        }
        if (filter.$null !== undefined) {
            return yield nullFilter(model, values, filter.$null);
        }
        if (filter.$notNull !== undefined) {
            return yield notNullFilter(model, values, filter.$notNull);
        }
        if (filter.$between !== undefined) {
            return yield betweenFilter(model, values, filter.$between);
        }
        if (filter.$notBetween !== undefined) {
            return yield notBetweenFilter(model, values, filter.$notBetween);
        }
        if (filter.$gt !== undefined) {
            return yield gtFilter(model, values, filter.$gt);
        }
        if (filter.$gte !== undefined) {
            return yield gteFilter(model, values, filter.$gte);
        }
        if (filter.$lt !== undefined) {
            return yield ltFilter(model, values, filter.$lt);
        }
        if (filter.$lte !== undefined) {
            return yield lteFilter(model, values, filter.$lte);
        }
        if (filter.$raw !== undefined) {
            return yield rawFilter(model, values, filter.$raw);
        }
        if (filter.$async !== undefined) {
            return yield asyncFilter(model, values, filter.$async);
        }
        throw '[TODO] Should not reach error';
    });
}
function filter(model, values, filters) {
    return __awaiter(this, void 0, void 0, function* () {
        if (Object.keys(filters).length > 0) {
            for (const key in filters) {
                if (key.startsWith('$')) {
                    return yield specialFilter(model, values, filters);
                }
            }
            return yield propertyFilter(model, values, filters);
        }
        return '';
    });
}
function getSet(model, values, attrs) {
    return __awaiter(this, void 0, void 0, function* () {
        const queryParts = [];
        for (const column in attrs) {
            values.push(attrs[column]);
            queryParts.push(`"${jsToPg(model, column)}" = $${values.length}`);
        }
        return `SET ${queryParts.join(', ')}`;
    });
}
function getInsert(model, values, attrs) {
    return __awaiter(this, void 0, void 0, function* () {
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
    });
}
function getSelect(model, columns = Object.keys(model.columns).map(column => `"${model.tableName}"."${column}"`)) {
    return __awaiter(this, void 0, void 0, function* () {
        return `SELECT ${columns.join(', ')}`;
    });
}
function getFrom(model) {
    return __awaiter(this, void 0, void 0, function* () {
        return `FROM "${model.tableName}"`;
    });
}
function getUpdate(model) {
    return __awaiter(this, void 0, void 0, function* () {
        return `UPDATE "${model.tableName}"`;
    });
}
function getWhere(model, values) {
    return __awaiter(this, void 0, void 0, function* () {
        const conditions = yield filter(model, values, model.filter);
        if (conditions.length > 0) {
            return `WHERE ${conditions}`;
        }
        return '';
    });
}
function getLimit(model) {
    return __awaiter(this, void 0, void 0, function* () {
        return model.limit ? `LIMIT ${model.limit}` : '';
    });
}
function getOffset(model) {
    return __awaiter(this, void 0, void 0, function* () {
        return model.skip ? `OFFSET ${model.skip}` : '';
    });
}
function getReturning(model) {
    return __awaiter(this, void 0, void 0, function* () {
        return `RETURNING "${model.tableName}"."${model.identifier}"`;
    });
}
function query(model, queryText, values) {
    console.log({ queryText, values });
    return model.pool.query(queryText, values);
}
function getConnector() {
    return {
        query(model) {
            return __awaiter(this, void 0, void 0, function* () {
                const values = [];
                const queryText = `
${yield getSelect(model)}
${yield getFrom(model)}
${yield getWhere(model, values)}
${yield getLimit(model)}
${yield getOffset(model)}
`;
                const { rows } = yield query(model, queryText, values);
                return rows.map((row) => {
                    const instance = new model(rowToJs(model, row));
                    instance.persistentAttributes = instance.attributes;
                    return instance;
                });
            });
        },
        count(model) {
            return __awaiter(this, void 0, void 0, function* () {
                const values = [];
                const queryText = `
${yield getSelect(model, [`COUNT("${model.tableName}"."${model.identifier}") AS count`])}
${yield getFrom(model)}
${yield getWhere(model, values)}
${yield getLimit(model)}
${yield getOffset(model)}
`;
                const { rows } = yield query(model, queryText, values);
                return rows[0].count;
            });
        },
        select(model, columns) {
            return __awaiter(this, void 0, void 0, function* () {
                const values = [];
                const queryText = `
${yield getSelect(model, columns)}
${yield getFrom(model)}
${yield getWhere(model, values)}
${yield getLimit(model)}
${yield getOffset(model)}
`;
                const { rows } = yield query(model, queryText, values);
                return rows.map(row => rowToJs(model, row));
            });
        },
        updateAll(model, attrs) {
            return __awaiter(this, void 0, void 0, function* () {
                const values = [];
                const queryText = `
${yield getUpdate(model)}
${yield getSet(model, values, attrs)}
${yield getWhere(model, values)}
${yield getLimit(model)}
${yield getOffset(model)}
`;
                const { rowCount } = yield query(model, queryText, values);
                return rowCount;
            });
        },
        deleteAll(model) {
            return __awaiter(this, void 0, void 0, function* () {
                const values = [];
                const queryText = `
DELETE ${yield getFrom(model)}
${yield getWhere(model, values)}
${yield getLimit(model)}
${yield getOffset(model)}
`;
                const { rowCount } = yield query(model, queryText, values);
                return rowCount;
            });
        },
        create(instance) {
            return __awaiter(this, void 0, void 0, function* () {
                const model = instance.model;
                const values = [];
                const queryText = `
${yield getInsert(model, values, instance.attributes)}
${yield getReturning(model)}
`;
                const { rows } = yield query(model, queryText, values);
                const attrs = rowToJs(model, rows[0]);
                instance[model.identifier] = attrs[model.identifier.toString()];
                instance.persistentAttributes = instance.attributes;
                return instance;
            });
        },
        update(instance) {
            return __awaiter(this, void 0, void 0, function* () {
                const model = instance.model;
                const values = [];
                const queryText = `
${yield getUpdate(model)}
${yield getSet(model, values, instance.changeSet)}
${yield getWhere(model, values)}
${yield getLimit(model)}
${yield getOffset(model)}
`;
                yield query(model, queryText, values);
                instance.persistentAttributes = instance.attributes;
                return instance;
            });
        },
        delete(instance) {
            return __awaiter(this, void 0, void 0, function* () {
                const model = instance.model;
                const values = [];
                const queryText = `
DELETE ${yield getFrom(model)}
${yield getWhere(model, values)}
${yield getLimit(model)}
${yield getOffset(model)}
`;
                yield query(model, queryText, values);
                instance[model.identifier] = undefined;
                return instance;
            });
        },
        execute(model, queryText, values) {
            return __awaiter(this, void 0, void 0, function* () {
                const { rows } = yield query(model, queryText, values);
                return rows.map(row => rowToJs(model, row));
            });
        },
    };
}
exports.getConnector = getConnector;
//# sourceMappingURL=getConnector.js.map