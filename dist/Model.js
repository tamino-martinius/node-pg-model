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
const Connector_1 = require("./Connector");
const pg_1 = require("pg");
var Direction;
(function (Direction) {
    Direction["Asc"] = "ASC";
    Direction["Desc"] = "DESC";
})(Direction = exports.Direction || (exports.Direction = {}));
function column() {
    return function (target, propertyKey) {
        target.keys.push(propertyKey);
    };
}
exports.column = column;
class Model {
    constructor(attrs) {
        this.persistentAttributes = {};
        this.assign(attrs);
    }
    static limitBy(amount) {
        var _a;
        return _a = class extends this {
            },
            _a.limit = amount,
            _a;
    }
    static unlimited() {
        var _a;
        return _a = class extends this {
            },
            _a.limit = undefined,
            _a;
    }
    static skipBy(amount) {
        var _a;
        return _a = class extends this {
            },
            _a.skip = amount,
            _a;
    }
    static unskipped() {
        var _a;
        return _a = class extends this {
            },
            _a.skip = undefined,
            _a;
    }
    static orderBy(order) {
        var _a;
        const currentOrder = this.order;
        return _a = class extends this {
            },
            _a.order = [...currentOrder, order],
            _a;
    }
    static reorder(order) {
        var _a;
        return _a = class extends this {
            },
            _a.order = [order],
            _a;
    }
    static unordered() {
        var _a;
        return _a = class extends this {
            },
            _a.order = [],
            _a;
    }
    static filterBy(filter) {
        var _a;
        const currentFilter = this.filter;
        return _a = class extends this {
            },
            _a.filter = { $and: [currentFilter, filter] },
            _a;
    }
    static unfiltered() {
        var _a;
        return _a = class extends this {
            },
            _a.filter = {},
            _a;
    }
    static queryBy() {
        const queryBy = {};
        for (const key in this.keys) {
            queryBy[key] = value => this.filterBy(Array.isArray(value)
                ? { $in: { [key]: value } }
                : { [key]: value });
        }
        return queryBy;
    }
    static all() {
        return this.connector.query(this);
    }
    static updateAll(attrs) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.connector.updateAll(this, attrs);
            return this;
        });
    }
    static deleteAll() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.connector.deleteAll(this);
            return this;
        });
    }
    static inBatchesOf(amount) {
        return __awaiter(this, void 0, void 0, function* () {
            const count = yield this.count();
            const batchCount = Math.ceil(count / amount);
            if (batchCount > 0 && batchCount < Number.MAX_SAFE_INTEGER) {
                const subqueries = [];
                for (let batchIndex = 0; batchIndex < batchCount; batchIndex += 1) {
                    const skip = (this.skip || 0) + batchIndex * amount;
                    const limit = batchIndex !== batchCount - 1 ? amount : count - (batchCount - 1) * amount;
                    subqueries.push(this.skipBy(skip).limitBy(limit).all());
                }
                return subqueries;
            }
            return [];
        });
    }
    static first() {
        return this.limitBy(1).all().then(instances => instances[0]);
    }
    static find(filter) {
        return this.filterBy(filter).first();
    }
    static findBy() {
        const findBy = {};
        for (const key in this.keys) {
            findBy[key] = value => this.find(Array.isArray(value)
                ? { $in: { [key]: value } }
                : { [key]: value });
        }
        return findBy;
    }
    static count() {
        return this.connector.count(this);
    }
    static pluck(column) {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield this.select([column])).map(items => items[0]);
        });
    }
    static select(columns) {
        return this.connector.select(this, columns);
    }
    static execute(query, bindings) {
        return this.connector.execute(this, query, bindings);
    }
    static build(attrs) {
        return new this(attrs);
    }
    static create(attrs) {
        return this.build(attrs).save();
    }
    model() {
        var _a;
        const constructor = this.constructor;
        const identifier = constructor.identifier;
        const query = { [identifier]: this[identifier] };
        return _a = class extends constructor {
            },
            _a.filter = query,
            _a.limit = undefined,
            _a.skip = undefined,
            _a;
    }
    get attributes() {
        const attrs = {};
        for (const key in this.model().keys) {
            attrs[key] = this[key];
        }
        return attrs;
    }
    get isNew() {
        return !this[this.model().identifier];
    }
    get isPersistent() {
        return !this.isNew;
    }
    get isChanged() {
        return Object.keys(this.changes).length > 0;
    }
    get changes() {
        const attributes = this.attributes;
        const changes = {};
        for (const key in this.model().keys) {
            if (attributes[key] !== this.persistentAttributes[key]) {
                const before = this.persistentAttributes[key];
                const after = attributes[key];
                changes[key] = { before, after };
            }
        }
        return changes;
    }
    get changeSet() {
        const attributes = this.attributes;
        const changes = {};
        for (const key in this.model().keys) {
            if (attributes[key] !== this.persistentAttributes[key]) {
                changes[key] = attributes[key];
            }
        }
        return changes;
    }
    assign(attrs) {
        for (const key in attrs) {
            this[key] = attrs[key];
        }
        return this;
    }
    revertChange(key) {
        this[key] = this.persistentAttributes[key];
        return this;
    }
    revertChanges() {
        for (const key of this.model().keys) {
            this.revertChange(key);
        }
        return this;
    }
    save() {
        return this.isNew
            ? this.model().connector.create(this)
            : this.model().connector.update(this);
    }
    delete() {
        return this.model().connector.delete(this);
    }
    reload() {
        return this.model().first();
    }
}
Model.pool = new pg_1.Pool();
Model.tableName = '';
Model.keys = [];
Model.identifier = 'id';
Model.filter = {};
Model.limit = undefined;
Model.skip = undefined;
Model.order = [];
Model.connector = new Connector_1.Connector();
Model.columnNames = {};
exports.Model = Model;
exports.default = Model;
//# sourceMappingURL=Model.js.map